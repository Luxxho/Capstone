from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..appointment_service import auto_complete_past_appointments
from ..database import get_db
from ..dependencies import get_current_user
from ..models import (
    Appointment,
    AppointmentArchive,
    ClinicalCatalogOption,
    Consultation,
    Medication,
    Pet,
    Prescription,
    PrescriptionTemplate,
    User,
    Vaccine,
    VeterinaryClinic,
)
from ..notification_service import create_notification
from ..medication_schedule_service import normalize_reminder_times
from ..schemas import (
    ConsultationCreate,
    MedicationCreate,
    PrescriptionCreate,
    VaccineCreate,
)

router = APIRouter(prefix="/api/clinic", tags=["clinic"])


CLINIC_CATALOG_CATEGORIES = {
    "consultation_reason",
    "vaccine",
    "medication",
    "dose",
    "frequency",
    "duration",
    "instructions",
}


CLINIC_DEFAULT_CATALOG = {
    "consultation_reason": [
        "Control general",
        "Vacunación",
        "Desparasitación",
        "Control postoperatorio",
        "Seguimiento de tratamiento",
        "Problema digestivo",
        "Problema dermatológico",
        "Dolor o cojera",
        "Control de peso",
        "Urgencia",
    ],
    "medication": [
        "Amoxicilina + ácido clavulánico",
        "Meloxicam",
        "Metronidazol",
        "Omeprazol",
        "Prednisolona",
        "Fenbendazol",
        "Gabapentina",
    ],
    "dose": [
        "1/4 comprimido",
        "1/2 comprimido",
        "1 comprimido",
        "2 comprimidos",
        "0,5 mL",
        "1 mL",
        "2 mL",
        "5 mL",
    ],
    "frequency": [
        "Cada 8 horas",
        "Cada 12 horas",
        "Cada 24 horas",
        "1 vez al día",
        "2 veces al día",
        "Día por medio",
        "Semanal",
    ],
    "duration": [
        "3 días",
        "5 días",
        "7 días",
        "10 días",
        "14 días",
        "21 días",
        "30 días",
    ],
    "instructions": [
        "Administrar con alimento.",
        "Administrar después de comer.",
        "Mantener agua disponible.",
        "No suspender sin indicación veterinaria.",
        "Control veterinario al finalizar el tratamiento.",
        "Volver antes si presenta molestias o una reacción inesperada.",
    ],
}


CLINIC_DEFAULT_PRESCRIPTION_TEMPLATES = [
    {
        "id": "default-antibiotico",
        "name": "Antibiótico oral",
        "medication": "Amoxicilina + ácido clavulánico",
        "dosage": "",
        "frequency": "",
        "duration": "",
        "instructions": (
            "Completar dosis, frecuencia y duración según evaluación "
            "clínica, peso y antecedentes del paciente."
        ),
    },
    {
        "id": "default-antiinflamatorio",
        "name": "Antiinflamatorio",
        "medication": "Meloxicam",
        "dosage": "",
        "frequency": "",
        "duration": "",
        "instructions": (
            "Completar pauta según evaluación clínica del paciente."
        ),
    },
    {
        "id": "default-protector-gastrico",
        "name": "Protector gástrico",
        "medication": "Omeprazol",
        "dosage": "",
        "frequency": "",
        "duration": "",
        "instructions": (
            "Completar pauta e indicaciones según evaluación veterinaria."
        ),
    },
    {
        "id": "default-corticoide",
        "name": "Corticoide",
        "medication": "Prednisolona",
        "dosage": "",
        "frequency": "",
        "duration": "",
        "instructions": (
            "Completar pauta según diagnóstico y evaluación clínica."
        ),
    },
    {
        "id": "default-antiparasitario",
        "name": "Antiparasitario",
        "medication": "Fenbendazol",
        "dosage": "",
        "frequency": "",
        "duration": "",
        "instructions": (
            "Completar pauta según especie, peso y evaluación veterinaria."
        ),
    },
    {
        "id": "default-dolor-neuropatico",
        "name": "Manejo de dolor neuropático",
        "medication": "Gabapentina",
        "dosage": "",
        "frequency": "",
        "duration": "",
        "instructions": (
            "Completar pauta según evaluación clínica del paciente."
        ),
    },
]


class PrescriptionTemplateCreate(BaseModel):
    name: str | None = None
    medication: str
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    instructions: str | None = None


CLINIC_DEFAULT_VACCINES = {
    "perro": [
        "Antirrábica",
        "Séxtuple canina",
        "Óctuple canina",
        "Polivalente canina",
        "Bordetella",
        "Leptospirosis",
    ],
    "gato": [
        "Antirrábica",
        "Triple felina",
        "Leucemia felina",
    ],
    "conejo": [
        "Mixomatosis",
        "Enfermedad hemorrágica viral",
    ],
}


class ClinicCatalogOptionCreate(BaseModel):
    species: str | None = None
    name: str


def normalize_clinic_catalog_category(category: str):
    value = (category or "").strip().lower()

    if value not in CLINIC_CATALOG_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail="Tipo de catálogo clínico no válido.",
        )

    return value


def normalize_clinic_catalog_species(species: str | None):
    return (species or "").strip()


def clinic_catalog_defaults(
    category: str,
    species: str,
):
    if category == "vaccine":
        return CLINIC_DEFAULT_VACCINES.get(
            species.strip().lower(),
            [],
        )

    return CLINIC_DEFAULT_CATALOG.get(
        category,
        [],
    )


def register_clinic_catalog_option(
    db: Session,
    category: str,
    species: str | None,
    name: str | None,
):
    category = normalize_clinic_catalog_category(
        category
    )
    species = normalize_clinic_catalog_species(
        species
    )
    name = (name or "").strip()

    if len(name) < 2:
        return None

    if len(name) > 160:
        name = name[:160].strip()

    existing = (
        db.query(ClinicalCatalogOption)
        .filter(
            func.lower(
                ClinicalCatalogOption.category
            ) == category.lower(),
            func.lower(
                ClinicalCatalogOption.species
            ) == species.lower(),
            func.lower(
                ClinicalCatalogOption.name
            ) == name.lower(),
        )
        .first()
    )

    if existing:
        return existing

    option = ClinicalCatalogOption(
        category=category,
        species=species,
        name=name,
    )

    db.add(option)
    return option


def require_clinic_user(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "vet":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta sección es exclusiva para cuentas de clínica veterinaria.",
        )

    if current_user.veterinary_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta veterinaria todavía no está asociada a una clínica.",
        )

    return current_user


def get_current_clinic(
    db: Session,
    current_user: User,
):
    clinic = (
        db.query(VeterinaryClinic)
        .filter(VeterinaryClinic.id == current_user.veterinary_id)
        .first()
    )

    if not clinic:
        raise HTTPException(
            status_code=404,
            detail="La clínica asociada a tu cuenta no existe.",
        )

    return clinic


@router.get("/catalog/{category}")
def clinic_catalog_options(
    category: str,
    species: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    get_current_clinic(
        db,
        current_user,
    )

    category = normalize_clinic_catalog_category(
        category
    )
    species = normalize_clinic_catalog_species(
        species
    )

    custom = (
        db.query(ClinicalCatalogOption)
        .filter(
            func.lower(
                ClinicalCatalogOption.category
            ) == category.lower(),
            func.lower(
                ClinicalCatalogOption.species
            ) == species.lower(),
        )
        .order_by(
            ClinicalCatalogOption.name.asc()
        )
        .all()
    )

    values = []
    seen = set()

    for value in (
        clinic_catalog_defaults(
            category,
            species,
        )
        + [item.name for item in custom]
    ):
        key = value.strip().lower()

        if key and key not in seen:
            seen.add(key)
            values.append(value.strip())

    return {
        "category": category,
        "species": species,
        "options": values,
    }


@router.post(
    "/catalog/{category}",
    status_code=status.HTTP_201_CREATED,
)
def clinic_add_catalog_option(
    category: str,
    data: ClinicCatalogOptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    get_current_clinic(
        db,
        current_user,
    )

    option = register_clinic_catalog_option(
        db,
        category,
        data.species,
        data.name,
    )

    if option is None:
        raise HTTPException(
            status_code=400,
            detail="La opción debe tener al menos 2 caracteres.",
        )

    db.commit()
    db.refresh(option)

    return {
        "id": option.id,
        "category": option.category,
        "species": option.species,
        "name": option.name,
    }


def ensure_clinic_patient(
    db: Session,
    clinic_id: int,
    pet_id: int,
):
    has_history = (
        db.query(Appointment)
        .filter(
            Appointment.veterinary_id == clinic_id,
            Appointment.pet_id == pet_id,
        )
        .first()
    )

    if not has_history:
        raise HTTPException(
            status_code=404,
            detail="La mascota no pertenece al historial de pacientes de esta clínica.",
        )

    pet = db.query(Pet).filter(Pet.id == pet_id).first()

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada.",
        )

    return pet


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


def ensure_clinic_appointment_for_record(
    db: Session,
    clinic_id: int,
    pet_id: int,
    appointment_id: int | None,
):
    if appointment_id is None:
        return None

    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id == appointment_id,
            Appointment.veterinary_id == clinic_id,
            Appointment.pet_id == pet_id,
        )
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=400,
            detail=(
                "La reserva seleccionada no corresponde a este "
                "paciente o a esta veterinaria."
            ),
        )

    return appointment


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


@router.get("/dashboard")
def clinic_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)

    auto_complete_past_appointments(
        db,
        veterinary_id=clinic.id,
    )

    today = date.today()

    appointments = (
        db.query(Appointment)
        .filter(Appointment.veterinary_id == clinic.id)
        .all()
    )

    # El panel principal solo representa trabajo vigente.
    # Las reservas completadas/canceladas permanecen disponibles
    # en Agenda/Pacientes como historial, pero no inflan los KPIs.
    active_appointments = [
        item
        for item in appointments
        if (
            item.status in {"pending", "confirmed"}
            and item.appointment_date >= today
        )
    ]

    patient_ids = {
        item.pet_id
        for item in active_appointments
    }

    today_appointments = [
        item
        for item in active_appointments
        if item.appointment_date == today
    ]

    pending = [
        item
        for item in active_appointments
        if item.status == "pending"
    ]

    prescriptions_count = (
        db.query(Prescription)
        .filter(Prescription.veterinary_id == clinic.id)
        .count()
    )

    upcoming = (
        db.query(Appointment)
        .filter(
            Appointment.veterinary_id == clinic.id,
            Appointment.appointment_date >= today,
            Appointment.status.in_(
                {"pending", "confirmed"}
            ),
        )
        .order_by(
            Appointment.appointment_date.asc(),
            Appointment.appointment_time.asc(),
        )
        .limit(6)
        .all()
    )

    return {
        "clinic": {
            "id": clinic.id,
            "name": clinic.name,
            "commune": clinic.commune,
            "address": clinic.address,
            "hours": clinic.hours,
            "services": clinic.services,
            "is_24h": clinic.is_24h,
        },
        "veterinarian": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
        },
        "stats": {
            "today_appointments": len(today_appointments),
            "pending_appointments": len(pending),
            "patients": len(patient_ids),
            "prescriptions": prescriptions_count,
        },
        "upcoming": [serialize_appointment(item) for item in upcoming],
    }


@router.get("/appointments")
def clinic_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)

    auto_complete_past_appointments(
        db,
        veterinary_id=clinic.id,
    )

    archived_ids = (
        db.query(AppointmentArchive.appointment_id)
        .filter(
            AppointmentArchive.clinic_archived.is_(True)
        )
    )

    items = (
        db.query(Appointment)
        .filter(
            Appointment.veterinary_id == clinic.id,
            ~Appointment.id.in_(archived_ids),
        )
        .order_by(
            Appointment.appointment_date.desc(),
            Appointment.appointment_time.desc(),
        )
        .all()
    )

    return [serialize_appointment(item) for item in items]


@router.patch("/appointments/{appointment_id}/archive")
def clinic_archive_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(
        db,
        current_user,
    )

    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id == appointment_id,
            Appointment.veterinary_id == clinic.id,
        )
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Reserva no encontrada en esta clínica.",
        )

    if appointment.status not in {"completed", "cancelled"}:
        raise HTTPException(
            status_code=400,
            detail=(
                "Solo se pueden limpiar reservas "
                "completadas o canceladas."
            ),
        )

    archive = get_or_create_appointment_archive(
        db,
        appointment.id,
    )

    archive.clinic_archived = True

    db.commit()

    return {
        "ok": True,
        "appointment_id": appointment.id,
        "message": "Reserva quitada de la agenda visible de la clínica.",
    }


@router.patch("/appointments/archive-finalized/all")
def clinic_archive_all_finalized_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(
        db,
        current_user,
    )

    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.veterinary_id == clinic.id,
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

        if not archive.clinic_archived:
            archive.clinic_archived = True
            archived_count += 1

    db.commit()

    return {
        "ok": True,
        "archived": archived_count,
        "message": (
            f"{archived_count} reserva(s) finalizada(s) "
            "quitada(s) de la agenda visible."
        ),
    }


@router.patch("/appointments/{appointment_id}/status")
def clinic_update_appointment_status(
    appointment_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)

    auto_complete_past_appointments(
        db,
        veterinary_id=clinic.id,
    )

    allowed = {
        "pending",
        "confirmed",
        "completed",
        "cancelled",
    }

    new_status = payload.get("status")

    if new_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Estado de reserva no válido.",
        )

    appointment = (
        db.query(Appointment)
        .filter(
            Appointment.id == appointment_id,
            Appointment.veterinary_id == clinic.id,
        )
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Reserva no encontrada en esta clínica.",
        )

    if appointment.status in {"completed", "cancelled"}:
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

    if appointment.status != new_status:
        appointment.status = new_status

        labels = {
            "pending": "pendiente",
            "confirmed": "confirmada",
            "completed": "completada",
            "cancelled": "cancelada",
        }

        create_notification(
            db=db,
            user_id=appointment.user_id,
            title=f"Reserva {labels.get(new_status, new_status)}",
            message=(
                f"Tu reserva #{appointment.id} en {clinic.name} "
                f"fue {labels.get(new_status, new_status)}."
            ),
            category="reservation",
            entity_type="reservation",
            entity_id=appointment.id,
        )

    db.commit()
    db.refresh(appointment)

    return serialize_appointment(appointment)


@router.get("/patients")
def clinic_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)

    auto_complete_past_appointments(
        db,
        veterinary_id=clinic.id,
    )

    appointments = (
        db.query(Appointment)
        .filter(Appointment.veterinary_id == clinic.id)
        .order_by(
            Appointment.appointment_date.desc(),
            Appointment.appointment_time.desc(),
        )
        .all()
    )

    by_pet = {}

    for appointment in appointments:
        pet = appointment.pet

        if pet.id not in by_pet:
            by_pet[pet.id] = {
                "id": pet.id,
                "name": pet.name,
                "species": pet.species,
                "breed": pet.breed,
                "age": pet.age,
                "age_months": pet.age_months,
                "weight": pet.weight,
                "photo_data": pet.photo_data,
                "owner_id": pet.owner_id,
                "owner_name": pet.owner.name,
                "owner_email": pet.owner.email,
                "appointments_count": 0,
                "last_appointment": None,
                "next_appointment": None,
            }

        row = by_pet[pet.id]
        row["appointments_count"] += 1

        if (
            row["last_appointment"] is None
            or appointment.appointment_date > row["last_appointment"]
        ):
            row["last_appointment"] = appointment.appointment_date

        if (
            appointment.appointment_date >= date.today()
            and appointment.status not in {"cancelled", "completed"}
        ):
            if (
                row["next_appointment"] is None
                or appointment.appointment_date < row["next_appointment"]
            ):
                row["next_appointment"] = appointment.appointment_date

    return list(by_pet.values())


@router.get("/patients/{pet_id}/history")
def clinic_patient_history(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)
    pet = ensure_clinic_patient(db, clinic.id, pet_id)

    vaccines = (
        db.query(Vaccine)
        .filter(Vaccine.pet_id == pet.id)
        .order_by(Vaccine.id.desc())
        .all()
    )

    medications = (
        db.query(Medication)
        .filter(Medication.pet_id == pet.id)
        .order_by(Medication.id.desc())
        .all()
    )

    consultations = (
        db.query(Consultation)
        .filter(Consultation.pet_id == pet.id)
        .order_by(
            Consultation.consultation_date.desc(),
            Consultation.id.desc(),
        )
        .all()
    )

    prescriptions = (
        db.query(Prescription)
        .filter(
            Prescription.pet_id == pet.id,
            Prescription.veterinary_id == clinic.id,
        )
        .order_by(
            Prescription.issue_date.desc(),
            Prescription.id.desc(),
        )
        .all()
    )

    return {
        "pet": {
            "id": pet.id,
            "name": pet.name,
            "species": pet.species,
            "breed": pet.breed,
            "age": pet.age,
            "age_months": pet.age_months,
            "weight": pet.weight,
            "photo_data": pet.photo_data,
            "birth_date": pet.birth_date,
            "feeding_info": pet.feeding_info,
            "medical_background": pet.medical_background,
            "additional_info": pet.additional_info,
            "owner_name": pet.owner.name,
            "owner_email": pet.owner.email,
        },
        "vaccines": [
            {
                "id": item.id,
                "pet_id": item.pet_id,
                "appointment_id": item.appointment_id,
                "name": item.name,
                "application_date": item.application_date,
                "next_dose_date": item.next_dose_date,
                "observation": item.observation,
            }
            for item in vaccines
        ],
        "medications": [
            {
                "id": item.id,
                "pet_id": item.pet_id,
                "appointment_id": item.appointment_id,
                "name": item.name,
                "dose": item.dose,
                "frequency": item.frequency,
                "start_date": item.start_date,
                "end_date": item.end_date,
                "reminder_times": item.reminder_times,
                "observation": item.observation,
            }
            for item in medications
        ],
        "consultations": [
            {
                "id": item.id,
                "pet_id": item.pet_id,
                "appointment_id": item.appointment_id,
                "consultation_date": item.consultation_date,
                "reason": item.reason,
                "diagnosis": item.diagnosis,
                "treatment": item.treatment,
                "veterinarian": item.veterinarian,
                "observation": item.observation,
            }
            for item in consultations
        ],
        "prescriptions": [
            {
                "id": item.id,
                "pet_id": item.pet_id,
                "appointment_id": item.appointment_id,
                "veterinary_id": item.veterinary_id,
                "veterinarian_user_id": item.veterinarian_user_id,
                "issue_date": item.issue_date,
                "medication": item.medication,
                "dosage": item.dosage,
                "frequency": item.frequency,
                "duration": item.duration,
                "instructions": item.instructions,
                "created_at": item.created_at,
            }
            for item in prescriptions
        ],
    }


@router.post(
    "/patients/{pet_id}/consultations",
    status_code=status.HTTP_201_CREATED,
)
def clinic_create_consultation(
    pet_id: int,
    data: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)
    pet = ensure_clinic_patient(db, clinic.id, pet_id)
    ensure_clinic_appointment_for_record(
        db,
        clinic.id,
        pet.id,
        data.appointment_id,
    )

    consultation = Consultation(
        pet_id=pet.id,
        appointment_id=data.appointment_id,
        consultation_date=data.consultation_date or date.today(),
        reason=data.reason,
        diagnosis=data.diagnosis,
        treatment=data.treatment,
        veterinarian=current_user.name,
        observation=data.observation,
    )

    db.add(consultation)

    register_clinic_catalog_option(
        db,
        "consultation_reason",
        pet.species,
        data.reason,
    )

    db.commit()
    db.refresh(consultation)

    return {
        "id": consultation.id,
        "message": "Consulta registrada correctamente.",
    }


@router.post(
    "/patients/{pet_id}/vaccines",
    status_code=status.HTTP_201_CREATED,
)
def clinic_create_vaccine(
    pet_id: int,
    data: VaccineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)
    pet = ensure_clinic_patient(db, clinic.id, pet_id)
    ensure_clinic_appointment_for_record(
        db,
        clinic.id,
        pet.id,
        data.appointment_id,
    )

    vaccine = Vaccine(
        pet_id=pet.id,
        appointment_id=data.appointment_id,
        name=data.name,
        application_date=data.application_date,
        next_dose_date=data.next_dose_date,
        observation=data.observation,
    )

    db.add(vaccine)

    register_clinic_catalog_option(
        db,
        "vaccine",
        pet.species,
        data.name,
    )

    db.commit()
    db.refresh(vaccine)

    return {
        "id": vaccine.id,
        "message": "Vacuna registrada correctamente.",
    }


@router.post(
    "/patients/{pet_id}/medications",
    status_code=status.HTTP_201_CREATED,
)
def clinic_create_medication(
    pet_id: int,
    data: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)
    pet = ensure_clinic_patient(db, clinic.id, pet_id)

    appointment = ensure_clinic_appointment_for_record(
        db,
        clinic.id,
        pet.id,
        data.appointment_id,
    )

    medication_name = (data.name or "").strip()

    if not medication_name:
        raise HTTPException(
            status_code=400,
            detail="Debes indicar el nombre del medicamento.",
        )

    try:
        reminder_times = normalize_reminder_times(
            data.reminder_times
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    medication = Medication(
        pet_id=pet.id,
        appointment_id=(
            appointment.id
            if appointment is not None
            else None
        ),
        name=medication_name,
        dose=(data.dose or "").strip() or None,
        frequency=(data.frequency or "").strip() or None,
        start_date=data.start_date,
        end_date=data.end_date,
        reminder_times=reminder_times,
        observation=(
            (data.observation or "").strip() or None
        ),
    )

    try:
        db.add(medication)
        db.flush()

        register_clinic_catalog_option(
            db,
            "medication",
            pet.species,
            medication.name,
        )

        register_clinic_catalog_option(
            db,
            "dose",
            pet.species,
            medication.dose,
        )

        register_clinic_catalog_option(
            db,
            "frequency",
            pet.species,
            medication.frequency,
        )

        db.commit()
        db.refresh(medication)

    except SQLAlchemyError as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "La base de datos no pudo guardar el medicamento. "
                "Reinicia el backend para aplicar las columnas nuevas "
                "y vuelve a intentarlo."
            ),
        ) from exc

    return {
        "id": medication.id,
        "pet_id": medication.pet_id,
        "appointment_id": medication.appointment_id,
        "name": medication.name,
        "dose": medication.dose,
        "frequency": medication.frequency,
        "start_date": medication.start_date,
        "end_date": medication.end_date,
        "reminder_times": medication.reminder_times,
        "observation": medication.observation,
        "message": "Medicamento registrado correctamente.",
    }


@router.delete(
    "/consultations/{consultation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def clinic_delete_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(
        db,
        current_user,
    )

    consultation = (
        db.query(Consultation)
        .filter(
            Consultation.id == consultation_id
        )
        .first()
    )

    if not consultation:
        raise HTTPException(
            status_code=404,
            detail="Consulta no encontrada.",
        )

    ensure_clinic_patient(
        db,
        clinic.id,
        consultation.pet_id,
    )

    db.delete(consultation)
    db.commit()


@router.delete(
    "/vaccines/{vaccine_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def clinic_delete_vaccine(
    vaccine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(
        db,
        current_user,
    )

    vaccine = (
        db.query(Vaccine)
        .filter(
            Vaccine.id == vaccine_id
        )
        .first()
    )

    if not vaccine:
        raise HTTPException(
            status_code=404,
            detail="Vacuna no encontrada.",
        )

    ensure_clinic_patient(
        db,
        clinic.id,
        vaccine.pet_id,
    )

    db.delete(vaccine)
    db.commit()


@router.delete(
    "/medications/{medication_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def clinic_delete_medication(
    medication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(
        db,
        current_user,
    )

    medication = (
        db.query(Medication)
        .filter(
            Medication.id == medication_id
        )
        .first()
    )

    if not medication:
        raise HTTPException(
            status_code=404,
            detail="Medicamento no encontrado.",
        )

    ensure_clinic_patient(
        db,
        clinic.id,
        medication.pet_id,
    )

    db.delete(medication)
    db.commit()


@router.get("/prescription-templates")
def clinic_prescription_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)

    defaults = [
        {
            **item,
            "is_default": True,
            "can_delete": False,
        }
        for item in CLINIC_DEFAULT_PRESCRIPTION_TEMPLATES
    ]

    custom_items = (
        db.query(PrescriptionTemplate)
        .filter(
            PrescriptionTemplate.veterinary_id == clinic.id
        )
        .order_by(
            PrescriptionTemplate.created_at.desc(),
            PrescriptionTemplate.id.desc(),
        )
        .all()
    )

    custom = [
        {
            "id": f"custom-{item.id}",
            "db_id": item.id,
            "name": item.name,
            "medication": item.medication,
            "dosage": item.dosage or "",
            "frequency": item.frequency or "",
            "duration": item.duration or "",
            "instructions": item.instructions or "",
            "is_default": False,
            "can_delete": True,
            "created_at": item.created_at,
        }
        for item in custom_items
    ]

    return defaults + custom


@router.post(
    "/prescription-templates",
    status_code=status.HTTP_201_CREATED,
)
def clinic_create_prescription_template(
    data: PrescriptionTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)

    medication = (data.medication or "").strip()

    if len(medication) < 2:
        raise HTTPException(
            status_code=400,
            detail="Ingresa un medicamento para guardar la plantilla.",
        )

    dosage = (data.dosage or "").strip() or None
    frequency = (data.frequency or "").strip() or None
    duration = (data.duration or "").strip() or None
    instructions = (data.instructions or "").strip() or None
    name = (data.name or medication).strip()[:160]

    existing = (
        db.query(PrescriptionTemplate)
        .filter(
            PrescriptionTemplate.veterinary_id == clinic.id,
            func.lower(PrescriptionTemplate.medication) == medication.lower(),
            func.coalesce(PrescriptionTemplate.dosage, "") == (dosage or ""),
            func.coalesce(PrescriptionTemplate.frequency, "") == (frequency or ""),
            func.coalesce(PrescriptionTemplate.duration, "") == (duration or ""),
            func.coalesce(PrescriptionTemplate.instructions, "") == (instructions or ""),
        )
        .first()
    )

    if existing:
        return {
            "id": f"custom-{existing.id}",
            "db_id": existing.id,
            "name": existing.name,
            "medication": existing.medication,
            "dosage": existing.dosage or "",
            "frequency": existing.frequency or "",
            "duration": existing.duration or "",
            "instructions": existing.instructions or "",
            "is_default": False,
            "can_delete": True,
            "created_at": existing.created_at,
            "message": "La plantilla ya estaba guardada.",
        }

    template = PrescriptionTemplate(
        veterinary_id=clinic.id,
        veterinarian_user_id=current_user.id,
        name=name,
        medication=medication,
        dosage=dosage,
        frequency=frequency,
        duration=duration,
        instructions=instructions,
    )

    db.add(template)
    db.commit()
    db.refresh(template)

    return {
        "id": f"custom-{template.id}",
        "db_id": template.id,
        "name": template.name,
        "medication": template.medication,
        "dosage": template.dosage or "",
        "frequency": template.frequency or "",
        "duration": template.duration or "",
        "instructions": template.instructions or "",
        "is_default": False,
        "can_delete": True,
        "created_at": template.created_at,
        "message": "Plantilla guardada correctamente.",
    }


@router.delete(
    "/prescription-templates/{template_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def clinic_delete_prescription_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)

    template = (
        db.query(PrescriptionTemplate)
        .filter(
            PrescriptionTemplate.id == template_id,
            PrescriptionTemplate.veterinary_id == clinic.id,
        )
        .first()
    )

    if not template:
        raise HTTPException(
            status_code=404,
            detail="Plantilla no encontrada.",
        )

    db.delete(template)
    db.commit()


@router.get("/prescriptions")
def clinic_prescriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)

    items = (
        db.query(Prescription)
        .filter(Prescription.veterinary_id == clinic.id)
        .order_by(
            Prescription.issue_date.desc(),
            Prescription.id.desc(),
        )
        .all()
    )

    result = []

    for item in items:
        pet = db.query(Pet).filter(Pet.id == item.pet_id).first()

        result.append(
            {
                "id": item.id,
                "pet_id": item.pet_id,
                "pet_name": pet.name if pet else "Mascota",
                "issue_date": item.issue_date,
                "medication": item.medication,
                "dosage": item.dosage,
                "frequency": item.frequency,
                "duration": item.duration,
                "instructions": item.instructions,
                "veterinarian_user_id": item.veterinarian_user_id,
            }
        )

    return result


@router.post(
    "/prescriptions",
    status_code=status.HTTP_201_CREATED,
)
def clinic_create_prescription(
    data: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)
    pet = ensure_clinic_patient(db, clinic.id, data.pet_id)
    ensure_clinic_appointment_for_record(
        db,
        clinic.id,
        pet.id,
        data.appointment_id,
    )

    prescription = Prescription(
        pet_id=pet.id,
        appointment_id=data.appointment_id,
        veterinary_id=clinic.id,
        veterinarian_user_id=current_user.id,
        issue_date=data.issue_date,
        medication=data.medication,
        dosage=data.dosage,
        frequency=data.frequency,
        duration=data.duration,
        instructions=data.instructions,
    )

    db.add(prescription)

    register_clinic_catalog_option(
        db,
        "medication",
        pet.species,
        data.medication,
    )

    register_clinic_catalog_option(
        db,
        "dose",
        pet.species,
        data.dosage,
    )

    register_clinic_catalog_option(
        db,
        "frequency",
        pet.species,
        data.frequency,
    )

    register_clinic_catalog_option(
        db,
        "duration",
        pet.species,
        data.duration,
    )

    register_clinic_catalog_option(
        db,
        "instructions",
        pet.species,
        data.instructions,
    )

    db.commit()
    db.refresh(prescription)

    return {
        "id": prescription.id,
        "message": "Receta emitida correctamente.",
    }


@router.delete(
    "/prescriptions/{prescription_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def clinic_delete_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_clinic_user),
):
    clinic = get_current_clinic(db, current_user)

    prescription = (
        db.query(Prescription)
        .filter(
            Prescription.id == prescription_id,
            Prescription.veterinary_id == clinic.id,
        )
        .first()
    )

    if not prescription:
        raise HTTPException(
            status_code=404,
            detail="Receta no encontrada.",
        )

    db.delete(prescription)
    db.commit()
