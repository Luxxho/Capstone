from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..appointment_service import auto_complete_past_appointments
from ..database import get_db
from ..dependencies import get_current_user
from ..models import (
    Appointment,
    AppointmentArchive,
    AppointmentAdminArchive,
    Pet,
    User,
    VeterinaryClinic,
)
from ..notification_service import (
    create_notification,
    notify_veterinary_users,
)
from ..schemas import (
    AppointmentCreate,
    AppointmentOut,
    AppointmentStatusUpdate,
    VeterinaryClinicOut,
)

router = APIRouter(prefix="/api/reservations", tags=["reservations"])


DEFAULT_CLINICS = [
    {
        "name": "Clínica Huellitas",
        "commune": "Santiago",
        "address": "Av. VetMap 101 (dirección ficticia)",
        "latitude": -33.4489,
        "longitude": -70.6693,
        "hours": "09:00 - 19:00",
        "services": "Consulta general, Vacunación, Control médico",
        "is_24h": False,
    },
    {
        "name": "VetMap Urgencias",
        "commune": "Providencia",
        "address": "Av. Huellitas 240 (dirección ficticia)",
        "latitude": -33.4315,
        "longitude": -70.6095,
        "hours": "24 horas",
        "services": "Urgencia, Hospitalización, Consulta general",
        "is_24h": True,
    },
    {
        "name": "Centro Animal Norte",
        "commune": "Quilicura",
        "address": "Paseo Mascotas 315 (dirección ficticia)",
        "latitude": -33.3668,
        "longitude": -70.7293,
        "hours": "10:00 - 18:00",
        "services": "Consulta general, Exámenes, Control médico",
        "is_24h": False,
    },
]


def ensure_default_clinics(db: Session):
    """
    Crea o actualiza las veterinarias demostrativas.

    Todos los establecimientos y direcciones son ficticios.
    Las coordenadas son aproximadas a la comuna indicada y se usan
    únicamente para demostrar el mapa del proyecto académico VetMap.
    """
    changed = False

    for clinic_data in DEFAULT_CLINICS:
        clinic = (
            db.query(VeterinaryClinic)
            .filter(VeterinaryClinic.name == clinic_data["name"])
            .first()
        )

        if not clinic:
            db.add(VeterinaryClinic(**clinic_data))
            changed = True
            continue

        for field, value in clinic_data.items():
            if getattr(clinic, field, None) != value:
                setattr(clinic, field, value)
                changed = True

    if changed:
        db.commit()


def clinic_services(clinic: VeterinaryClinic):
    return [
        item.strip()
        for item in (clinic.services or "").split(",")
        if item.strip()
    ]


def parse_hour(value: str):
    return datetime.strptime(
        value.strip(),
        "%H:%M",
    ).time()


def clinic_booking_slots(clinic: VeterinaryClinic):
    """
    Genera horarios de agenda de 60 minutos.

    Para una clínica 24h mostramos una ventana amplia de agenda
    (08:00 a 22:00). Las urgencias siguen siendo 24h, pero la
    reserva programada se mantiene en un rango amigable para la demo.
    """
    if clinic.is_24h:
        start = time(8, 0)
        end = time(22, 0)
    else:
        try:
            start_text, end_text = clinic.hours.split("-", 1)
            start = parse_hour(start_text)
            end = parse_hour(end_text)
        except Exception:
            start = time(9, 0)
            end = time(18, 0)

    cursor = datetime.combine(
        date.today(),
        start,
    )
    finish = datetime.combine(
        date.today(),
        end,
    )

    slots = []

    while cursor < finish:
        slots.append(cursor.time())
        cursor += timedelta(hours=1)

    return slots


def available_slots_for(
    db: Session,
    clinic: VeterinaryClinic,
    appointment_date: date,
):
    occupied_rows = (
        db.query(Appointment)
        .filter(
            Appointment.veterinary_id == clinic.id,
            Appointment.appointment_date == appointment_date,
            Appointment.status != "cancelled",
        )
        .all()
    )

    occupied = {
        item.appointment_time.strftime("%H:%M")
        for item in occupied_rows
    }

    now = datetime.now()

    result = []

    for slot in clinic_booking_slots(clinic):
        slot_text = slot.strftime("%H:%M")

        is_past = (
            appointment_date == date.today()
            and datetime.combine(
                appointment_date,
                slot,
            ) <= now
        )

        result.append(
            {
                "time": slot_text,
                "available": (
                    slot_text not in occupied
                    and not is_past
                ),
            }
        )

    return result


def get_or_create_appointment_archive(
    db: Session,
    appointment_id: int,
):
    archive = (
        db.query(AppointmentArchive)
        .filter(
            AppointmentArchive.appointment_id
            == appointment_id
        )
        .first()
    )

    if archive is None:
        archive = AppointmentArchive(
            appointment_id=appointment_id,
            owner_archived=False,
            clinic_archived=False,
        )
        db.add(archive)
        db.flush()

    return archive


def archive_admin_appointment(
    db: Session,
    appointment_id: int,
):
    archive = (
        db.query(AppointmentAdminArchive)
        .filter(
            AppointmentAdminArchive.appointment_id
            == appointment_id
        )
        .first()
    )

    if archive is None:
        archive = AppointmentAdminArchive(
            appointment_id=appointment_id,
        )
        db.add(archive)
        db.flush()

    return archive


def serialize_appointment(item: Appointment):
    return {
        "id": item.id,
        "user_id": item.user_id,
        "pet_id": item.pet_id,
        "veterinary_id": item.veterinary_id,
        "service": item.service,
        "appointment_date": item.appointment_date,
        "appointment_time": item.appointment_time,
        "status": item.status,
        "notes": item.notes,
        "created_at": item.created_at,
        "user_name": item.user.name,
        "user_email": item.user.email,
        "pet_name": item.pet.name,
        "pet_species": item.pet.species,
        "veterinary_name": item.veterinary.name,
        "veterinary_commune": item.veterinary.commune,
    }


@router.get("/clinics", response_model=list[VeterinaryClinicOut])
def list_clinics(db: Session = Depends(get_db)):
    ensure_default_clinics(db)

    return (
        db.query(VeterinaryClinic)
        .order_by(VeterinaryClinic.name.asc())
        .all()
    )


@router.get("/availability")
def reservation_availability(
    veterinary_id: int = Query(..., gt=0),
    appointment_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_default_clinics(db)

    clinic = (
        db.query(VeterinaryClinic)
        .filter(VeterinaryClinic.id == veterinary_id)
        .first()
    )

    if not clinic:
        raise HTTPException(
            status_code=404,
            detail="La veterinaria seleccionada no existe.",
        )

    if appointment_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="No puedes consultar una fecha anterior a hoy.",
        )

    slots = available_slots_for(
        db,
        clinic,
        appointment_date,
    )

    return {
        "veterinary_id": clinic.id,
        "veterinary_name": clinic.name,
        "date": appointment_date,
        "services": clinic_services(clinic),
        "slots": slots,
        "available_count": sum(
            1
            for slot in slots
            if slot["available"]
        ),
    }


@router.get("", response_model=list[AppointmentOut])
def list_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_default_clinics(db)

    if current_user.role == "admin":
        auto_complete_past_appointments(db)
    else:
        auto_complete_past_appointments(
            db,
            user_id=current_user.id,
        )

    query = db.query(Appointment)

    if current_user.role == "admin":
        admin_archived_ids = (
            db.query(
                AppointmentAdminArchive.appointment_id
            )
        )

        query = query.filter(
            ~Appointment.id.in_(
                admin_archived_ids
            )
        )
    else:
        archived_ids = (
            db.query(AppointmentArchive.appointment_id)
            .filter(
                AppointmentArchive.owner_archived.is_(True)
            )
        )

        query = query.filter(
            Appointment.user_id == current_user.id,
            ~Appointment.id.in_(archived_ids),
        )

    items = (
        query
        .order_by(
            Appointment.appointment_date.desc(),
            Appointment.appointment_time.desc(),
        )
        .all()
    )

    return [serialize_appointment(item) for item in items]


def create_reservation_for_owner(
    data: AppointmentCreate,
    owner: User,
    db: Session,
    created_by_admin: bool = False,
):
    pet = (
        db.query(Pet)
        .filter(
            Pet.id == data.pet_id,
            Pet.owner_id == owner.id,
        )
        .first()
    )

    if not pet:
        raise HTTPException(
            status_code=404,
            detail=(
                "La mascota no existe o no pertenece al dueño seleccionado."
                if created_by_admin
                else "La mascota no existe o no pertenece a tu cuenta."
            ),
        )

    clinic = (
        db.query(VeterinaryClinic)
        .filter(VeterinaryClinic.id == data.veterinary_id)
        .first()
    )

    if not clinic:
        raise HTTPException(
            status_code=404,
            detail="La veterinaria seleccionada no existe.",
        )

    if data.appointment_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="No puedes reservar una fecha anterior a hoy.",
        )

    service = data.service.strip()

    if not service:
        raise HTTPException(
            status_code=400,
            detail="Debes seleccionar un servicio.",
        )

    supported_services = clinic_services(clinic)

    if supported_services and service not in supported_services:
        raise HTTPException(
            status_code=400,
            detail=(
                "El servicio seleccionado no está disponible "
                "en esta veterinaria."
            ),
        )

    allowed_slots = {
        slot.strftime("%H:%M")
        for slot in clinic_booking_slots(clinic)
    }

    selected_time = data.appointment_time.strftime("%H:%M")

    if selected_time not in allowed_slots:
        raise HTTPException(
            status_code=400,
            detail=(
                "La hora seleccionada no corresponde a un horario "
                "disponible de la veterinaria."
            ),
        )

    if (
        data.appointment_date == date.today()
        and datetime.combine(
            data.appointment_date,
            data.appointment_time,
        ) <= datetime.now()
    ):
        raise HTTPException(
            status_code=400,
            detail="No puedes reservar una hora que ya pasó.",
        )

    occupied = (
        db.query(Appointment)
        .filter(
            Appointment.veterinary_id == data.veterinary_id,
            Appointment.appointment_date == data.appointment_date,
            Appointment.appointment_time == data.appointment_time,
            Appointment.status != "cancelled",
        )
        .first()
    )

    if occupied:
        raise HTTPException(
            status_code=409,
            detail=(
                "Ese horario ya está reservado en la "
                "veterinaria seleccionada."
            ),
        )

    appointment = Appointment(
        user_id=owner.id,
        pet_id=data.pet_id,
        veterinary_id=data.veterinary_id,
        service=service,
        appointment_date=data.appointment_date,
        appointment_time=data.appointment_time,
        status="pending",
        notes=data.notes.strip() if data.notes else None,
    )

    db.add(appointment)
    db.flush()

    owner_message = (
        f"VetMap registró {service} para {pet.name} en {clinic.name} "
        if created_by_admin
        else f"Reservaste {service} para {pet.name} en {clinic.name} "
    )

    create_notification(
        db=db,
        user_id=owner.id,
        title=(
            "Reserva agendada por administración"
            if created_by_admin
            else "Reserva registrada"
        ),
        message=(
            f"{owner_message}el {data.appointment_date} "
            f"a las {data.appointment_time.strftime('%H:%M')}."
        ),
        category="reservation",
        entity_type="reservation",
        entity_id=appointment.id,
    )

    notify_veterinary_users(
        db=db,
        veterinary_id=clinic.id,
        title="Nueva reserva",
        message=(
            f"{pet.name} tiene una nueva reserva de {service} "
            f"el {data.appointment_date} "
            f"a las {data.appointment_time.strftime('%H:%M')}."
        ),
        category="reservation",
        entity_type="reservation",
        entity_id=appointment.id,
    )

    db.commit()
    db.refresh(appointment)

    return serialize_appointment(appointment)


@router.post(
    "",
    response_model=AppointmentOut,
    status_code=status.HTTP_201_CREATED,
)
def create_reservation(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        raise HTTPException(
            status_code=403,
            detail=(
                "El administrador debe usar la reserva administrativa "
                "para seleccionar al dueño real."
            ),
        )

    return create_reservation_for_owner(
        data=data,
        owner=current_user,
        db=db,
    )


@router.post(
    "/admin",
    response_model=AppointmentOut,
    status_code=status.HTTP_201_CREATED,
)
def create_admin_reservation(
    data: AppointmentCreate,
    owner_id: int = Query(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo el administrador puede usar esta función.",
        )

    owner = (
        db.query(User)
        .filter(
            User.id == owner_id,
            User.role == "owner",
        )
        .first()
    )

    if not owner:
        raise HTTPException(
            status_code=404,
            detail="El dueño seleccionado no existe o no tiene rol de dueño.",
        )

    return create_reservation_for_owner(
        data=data,
        owner=owner,
        db=db,
        created_by_admin=True,
    )


@router.patch("/{appointment_id}/cancel", response_model=AppointmentOut)
def cancel_reservation(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id == appointment_id,
            Appointment.user_id == current_user.id,
        )
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Reserva no encontrada.",
        )

    if appointment.status in {"completed", "cancelled"}:
        raise HTTPException(
            status_code=400,
            detail="Esta reserva ya no puede cancelarse.",
        )

    appointment.status = "cancelled"

    notify_veterinary_users(
        db=db,
        veterinary_id=appointment.veterinary_id,
        title="Reserva cancelada",
        message=(
            f"La reserva #{appointment.id} de {appointment.pet.name} "
            "fue cancelada por el usuario."
        ),
        category="reservation",
        entity_type="reservation",
        entity_id=appointment.id,
    )

    db.commit()
    db.refresh(appointment)

    return serialize_appointment(appointment)


@router.patch("/{appointment_id}/archive")
def archive_owner_reservation(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        raise HTTPException(
            status_code=403,
            detail="El administrador no utiliza el historial personal de reservas.",
        )

    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id == appointment_id,
            Appointment.user_id == current_user.id,
        )
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Reserva no encontrada.",
        )

    if appointment.status not in {"completed", "cancelled"}:
        raise HTTPException(
            status_code=400,
            detail=(
                "Solo puedes limpiar reservas completadas o canceladas."
            ),
        )

    archive = get_or_create_appointment_archive(
        db,
        appointment.id,
    )

    archive.owner_archived = True

    db.commit()

    return {
        "ok": True,
        "appointment_id": appointment.id,
        "message": "Reserva quitada de tu historial visible.",
    }


@router.patch("/archive-finalized/all")
def archive_all_owner_finalized_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        raise HTTPException(
            status_code=403,
            detail="El administrador no utiliza el historial personal de reservas.",
        )

    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.user_id == current_user.id,
            Appointment.status.in_(
                {"completed", "cancelled"}
            ),
        )
        .all()
    )

    archived_count = 0

    for appointment in appointments:
        archive = get_or_create_appointment_archive(
            db,
            appointment.id,
        )

        if not archive.owner_archived:
            archive.owner_archived = True
            archived_count += 1

    db.commit()

    return {
        "ok": True,
        "archived": archived_count,
        "message": (
            f"{archived_count} reserva(s) finalizada(s) "
            "quitada(s) de tu historial visible."
        ),
    }


@router.patch("/admin/{appointment_id}/archive")
def archive_admin_finalized_reservation(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail=(
                "Solo el administrador puede limpiar "
                "su historial de reservas."
            ),
        )

    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id == appointment_id
        )
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Reserva no encontrada.",
        )

    if appointment.status not in {
        "completed",
        "cancelled",
    }:
        raise HTTPException(
            status_code=400,
            detail=(
                "Solo puedes quitar reservas "
                "completadas o canceladas."
            ),
        )

    archive_admin_appointment(
        db,
        appointment.id,
    )

    db.commit()

    return {
        "ok": True,
        "appointment_id": appointment.id,
        "message": (
            "Reserva quitada del historial "
            "administrativo."
        ),
    }


@router.patch("/admin/archive-finalized/all")
def archive_all_admin_finalized_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail=(
                "Solo el administrador puede limpiar "
                "su historial de reservas."
            ),
        )

    already_archived = {
        row[0]
        for row in (
            db.query(
                AppointmentAdminArchive.appointment_id
            )
            .all()
        )
    }

    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.status.in_(
                {"completed", "cancelled"}
            )
        )
        .all()
    )

    archived_count = 0

    for appointment in appointments:
        if appointment.id in already_archived:
            continue

        archive_admin_appointment(
            db,
            appointment.id,
        )
        archived_count += 1

    db.commit()

    return {
        "ok": True,
        "archived": archived_count,
        "message": (
            f"{archived_count} reserva(s) finalizada(s) "
            "quitada(s) del historial administrativo."
        ),
    }


@router.patch("/{appointment_id}/status", response_model=AppointmentOut)
def update_reservation_status(
    appointment_id: int,
    data: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo el administrador puede cambiar el estado de una reserva.",
        )

    auto_complete_past_appointments(db)

    allowed_statuses = {
        "pending",
        "confirmed",
        "completed",
        "cancelled",
    }

    if data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Estado de reserva no válido.",
        )

    appointment = (
        db.query(Appointment)
        .filter(Appointment.id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Reserva no encontrada.",
        )

    if appointment.status in {
        "completed",
        "cancelled",
    }:
        final_label = (
            "completada"
            if appointment.status == "completed"
            else "cancelada"
        )

        raise HTTPException(
            status_code=400,
            detail=(
                f"La reserva ya está {final_label}. "
                "Este estado es definitivo y no puede modificarse."
            ),
        )

    if appointment.status != data.status:
        appointment.status = data.status

        labels = {
            "pending": "pendiente",
            "confirmed": "confirmada",
            "completed": "completada",
            "cancelled": "cancelada",
        }

        create_notification(
            db=db,
            user_id=appointment.user_id,
            title=f"Reserva {labels.get(data.status, data.status)}",
            message=(
                f"Tu reserva #{appointment.id} en "
                f"{appointment.veterinary.name} fue "
                f"{labels.get(data.status, data.status)}."
            ),
            category="reservation",
            entity_type="reservation",
            entity_id=appointment.id,
        )

    db.commit()
    db.refresh(appointment)

    return serialize_appointment(appointment)
