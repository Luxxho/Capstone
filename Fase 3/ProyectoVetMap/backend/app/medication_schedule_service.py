import re
from datetime import date, datetime

from sqlalchemy.orm import Session

from .models import Medication, MedicationAdministration


_TIME_RE = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")


def parse_reminder_times(value: str | None) -> list[str]:
    """Convierte '08:00, 20:00' en una lista HH:MM ordenada y sin duplicados."""
    if not value:
        return []

    raw_items = re.split(r"[,;\n]+", str(value))
    result: list[str] = []

    for raw in raw_items:
        item = raw.strip()
        if not item:
            continue
        if not _TIME_RE.match(item):
            raise ValueError(
                f'Horario no válido: "{item}". Usa formato HH:MM, por ejemplo 08:00.'
            )
        if item not in result:
            result.append(item)

    return sorted(result)


def normalize_reminder_times(value: str | None) -> str | None:
    times = parse_reminder_times(value)
    return ",".join(times) if times else None


def medication_active_on(medication: Medication, target_date: date) -> bool:
    if medication.start_date and target_date < medication.start_date:
        return False
    if medication.end_date and target_date > medication.end_date:
        return False
    return True


def get_administration(
    db: Session,
    medication_id: int,
    scheduled_date: date,
    scheduled_time: str,
):
    return (
        db.query(MedicationAdministration)
        .filter(
            MedicationAdministration.medication_id == medication_id,
            MedicationAdministration.scheduled_date == scheduled_date,
            MedicationAdministration.scheduled_time == scheduled_time,
        )
        .first()
    )


def schedule_status(
    scheduled_date: date,
    scheduled_time: str,
    administration: MedicationAdministration | None,
) -> tuple[str, bool]:
    if administration:
        return "administered", False

    now = datetime.now()
    today = now.date()

    if scheduled_date < today:
        return "overdue", True

    if scheduled_date > today:
        return "scheduled", False

    current_hhmm = now.strftime("%H:%M")
    if scheduled_time <= current_hhmm:
        return "due", True

    return "scheduled", False
