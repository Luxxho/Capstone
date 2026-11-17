from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..appointment_service import auto_complete_past_appointments
from ..database import get_db
from ..dependencies import get_current_user
from ..models import (
    Appointment,
    Medication,
    MedicationAdministration,
    Notification,
    Pet,
    User,
)
from ..notification_service import create_notification
from ..medication_schedule_service import (
    medication_active_on,
    parse_reminder_times,
)


router = APIRouter(
    prefix="/api/notifications",
    tags=["notifications"],
)


def serialize_notification(item: Notification):
    return {
        "id": item.id,
        "user_id": item.user_id,
        "title": item.title,
        "message": item.message,
        "category": item.category,
        "entity_type": item.entity_type,
        "entity_id": item.entity_id,
        "is_read": item.is_read,
        "created_at": item.created_at,
    }


def _reminder_exists(
    db: Session,
    user_id: int,
    category: str,
    entity_type: str,
    entity_id: str,
):
    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.category == category,
            Notification.entity_type == entity_type,
            Notification.entity_id == entity_id,
        )
        .first()
        is not None
    )


def _create_reminder_once(
    db: Session,
    *,
    user_id: int,
    title: str,
    message: str,
    category: str,
    entity_type: str,
    entity_id: str,
):
    if _reminder_exists(
        db,
        user_id,
        category,
        entity_type,
        entity_id,
    ):
        return False

    create_notification(
        db=db,
        user_id=user_id,
        title=title,
        message=message,
        category=category,
        entity_type=entity_type,
        entity_id=entity_id,
    )

    return True


def ensure_past_appointments_closed(
    db: Session,
    current_user: User,
):
    """
    Ejecuta el cierre automático desde el polling de notificaciones.

    De esta forma, si VetMap queda abierto, las reservas de días
    anteriores se actualizan sin que el usuario tenga que entrar
    manualmente a la sección de reservas.
    """
    if current_user.role == "admin":
        return auto_complete_past_appointments(db)

    if current_user.role == "vet":
        if current_user.veterinary_id is None:
            return 0

        return auto_complete_past_appointments(
            db,
            veterinary_id=current_user.veterinary_id,
        )

    if current_user.role == "owner":
        return auto_complete_past_appointments(
            db,
            user_id=current_user.id,
        )

    return 0


def ensure_owner_reminders(
    db: Session,
    current_user: User,
):
    """
    Genera recordatorios persistentes para el dueño de mascota.

    Se ejecuta cuando el frontend consulta las notificaciones.
    Cada aviso usa una clave única, por lo que el polling no crea
    duplicados.
    """
    if current_user.role != "owner":
        return 0

    now = datetime.now()
    today = now.date()
    created = 0

    # -----------------------------------------------------
    # MEDICAMENTOS
    # - Si hay horarios definidos: aviso por cada hora exacta.
    # - Si es un medicamento antiguo sin horarios: conserva el
    #   recordatorio diario desde las 08:00.
    # -----------------------------------------------------
    medication_rows = (
        db.query(Medication, Pet)
        .join(Pet, Pet.id == Medication.pet_id)
        .filter(Pet.owner_id == current_user.id)
        .all()
    )

    for medication, pet in medication_rows:
        if not medication_active_on(medication, today):
            continue

        try:
            reminder_times = parse_reminder_times(
                medication.reminder_times
            )
        except ValueError:
            reminder_times = []

        if reminder_times:
            for scheduled_time in reminder_times:
                hour, minute = map(
                    int,
                    scheduled_time.split(":"),
                )
                scheduled_dt = datetime.combine(
                    today,
                    time(hour=hour, minute=minute),
                )

                # El polling creará el aviso en cuanto llegue o
                # haya pasado la hora programada.
                if now < scheduled_dt:
                    continue

                administered = (
                    db.query(MedicationAdministration)
                    .filter(
                        MedicationAdministration.medication_id
                        == medication.id,
                        MedicationAdministration.scheduled_date
                        == today,
                        MedicationAdministration.scheduled_time
                        == scheduled_time,
                    )
                    .first()
                )

                if administered:
                    continue

                details = []
                if medication.dose:
                    details.append(
                        f"Dosis: {medication.dose}"
                    )
                if medication.frequency:
                    details.append(
                        f"Frecuencia: {medication.frequency}"
                    )

                detail_text = (
                    " · ".join(details)
                    if details
                    else "Revisa las indicaciones registradas."
                )

                reminder_key = (
                    f"medication:{medication.id}:"
                    f"{today.isoformat()}:"
                    f"{scheduled_time}"
                )

                if _create_reminder_once(
                    db,
                    user_id=current_user.id,
                    title=f"💊 Es hora del medicamento de {pet.name}",
                    message=(
                        f"Corresponde darle {medication.name} a "
                        f"{pet.name} a las {scheduled_time}. "
                        f"{detail_text}"
                    ),
                    category="medication_reminder",
                    entity_type="medication",
                    entity_id=reminder_key,
                ):
                    created += 1

        elif now.hour >= 8 and medication.start_date is not None:
            # Compatibilidad con medicamentos creados antes de
            # agregar horarios de recordatorio.
            details = []
            if medication.dose:
                details.append(f"Dosis: {medication.dose}")
            if medication.frequency:
                details.append(
                    f"Frecuencia: {medication.frequency}"
                )

            detail_text = (
                " · ".join(details)
                if details
                else "Revisa las indicaciones registradas."
            )

            reminder_key = (
                f"medication:{medication.id}:"
                f"{today.isoformat()}:daily"
            )

            if _create_reminder_once(
                db,
                user_id=current_user.id,
                title=f"💊 Medicamento de {pet.name}",
                message=(
                    f"Hoy corresponde darle {medication.name} "
                    f"a {pet.name}. {detail_text}"
                ),
                category="medication_reminder",
                entity_type="medication",
                entity_id=reminder_key,
            ):
                created += 1

    # -----------------------------------------------------
    # RESERVAS
    # - aviso dentro de las próximas 24 h
    # - segundo aviso dentro de la próxima hora
    # -----------------------------------------------------
    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.user_id == current_user.id,
            Appointment.status.in_(["pending", "confirmed"]),
            Appointment.appointment_date >= today,
            Appointment.appointment_date <= today + timedelta(days=1),
        )
        .all()
    )

    for appointment in appointments:
        appointment_dt = datetime.combine(
            appointment.appointment_date,
            appointment.appointment_time,
        )

        seconds_left = (appointment_dt - now).total_seconds()

        if seconds_left < 0:
            continue

        pet_name = (
            appointment.pet.name
            if appointment.pet
            else "tu mascota"
        )

        clinic_name = (
            appointment.veterinary.name
            if appointment.veterinary
            else "la veterinaria"
        )

        date_text = appointment.appointment_date.strftime(
            "%d/%m/%Y"
        )
        time_text = appointment.appointment_time.strftime(
            "%H:%M"
        )

        # Aviso de las próximas 24 horas.
        if seconds_left <= 24 * 60 * 60:
            reminder_key = f"appointment:{appointment.id}:upcoming"

            if _create_reminder_once(
                db,
                user_id=current_user.id,
                title=f"📅 Consulta próxima de {pet_name}",
                message=(
                    f"Recuerda: {pet_name} tiene {appointment.service} "
                    f"el {date_text} a las {time_text} en {clinic_name}."
                ),
                category="appointment_reminder",
                entity_type="reservation",
                entity_id=reminder_key,
            ):
                created += 1

        # Segundo aviso cuando queda 1 hora o menos.
        if seconds_left <= 60 * 60:
            reminder_key = f"appointment:{appointment.id}:one_hour"

            if _create_reminder_once(
                db,
                user_id=current_user.id,
                title=f"⏰ Consulta de {pet_name} en breve",
                message=(
                    f"La hora de {pet_name} es hoy a las {time_text} "
                    f"en {clinic_name}. Servicio: {appointment.service}."
                ),
                category="appointment_reminder_soon",
                entity_type="reservation",
                entity_id=reminder_key,
            ):
                created += 1

    if created:
        db.commit()

    return created


@router.get("")
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_past_appointments_closed(
        db,
        current_user,
    )
    ensure_owner_reminders(db, current_user)

    rows = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(
            Notification.created_at.desc(),
            Notification.id.desc(),
        )
        .limit(100)
        .all()
    )

    return [serialize_notification(row) for row in rows]


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_past_appointments_closed(
        db,
        current_user,
    )
    ensure_owner_reminders(db, current_user)

    count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
        .count()
    )

    return {"count": count}


@router.patch("/read-all")
def read_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read.is_(False),
        )
        .all()
    )

    for row in rows:
        row.is_read = True

    db.commit()

    return {
        "updated": len(rows),
        "message": "Notificaciones marcadas como leídas.",
    }


@router.patch("/{notification_id}/read")
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Notificación no encontrada.",
        )

    item.is_read = True

    db.commit()
    db.refresh(item)

    return serialize_notification(item)
