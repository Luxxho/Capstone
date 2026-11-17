from datetime import date

from sqlalchemy.orm import Session

from .models import Appointment
from .notification_service import create_notification


AUTO_COMPLETABLE_APPOINTMENT_STATUSES = {
    "pending",
    "confirmed",
}


def auto_complete_past_appointments(
    db: Session,
    *,
    user_id: int | None = None,
    veterinary_id: int | None = None,
):
    """
    Cierra automáticamente reservas de días anteriores.

    Regla:
    - appointment_date < hoy
    - estado pendiente o confirmado
    - se cambia a completed

    No cierra automáticamente reservas del día actual, aunque la hora
    ya haya pasado. Esto permite que el veterinario gestione las
    atenciones de hoy normalmente.
    """
    query = (
        db.query(Appointment)
        .filter(
            Appointment.appointment_date < date.today(),
            Appointment.status.in_(
                AUTO_COMPLETABLE_APPOINTMENT_STATUSES
            ),
        )
    )

    if user_id is not None:
        query = query.filter(
            Appointment.user_id == user_id
        )

    if veterinary_id is not None:
        query = query.filter(
            Appointment.veterinary_id == veterinary_id
        )

    appointments = query.all()

    if not appointments:
        return 0

    for appointment in appointments:
        appointment.status = "completed"

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

        create_notification(
            db=db,
            user_id=appointment.user_id,
            title=f"✅ Consulta de {pet_name} completada",
            message=(
                f"La reserva del {date_text} a las {time_text} "
                f"en {clinic_name} fue cerrada automáticamente "
                "porque su fecha ya pasó."
            ),
            category="reservation",
            entity_type="reservation",
            entity_id=appointment.id,
        )

    db.commit()

    return len(appointments)
