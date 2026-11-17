from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import (
    User,
    Pet,
    Vaccine,
    Medication,
    Consultation,
    Prescription,
    VeterinaryClinic,
    ClinicalCatalogOption,
)
from ..schemas import UserOut, PetOut, VaccineCreate, VaccineOut, MedicationCreate, MedicationOut, ConsultationCreate, ConsultationOut
from ..security import hash_password
from ..medication_schedule_service import normalize_reminder_times


router = APIRouter(prefix="/api/admin", tags=["admin"])


class AdminUserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str | None = None
    role: str = "owner"
    rut: str | None = None
    country: str | None = None
    region: str | None = None
    city: str | None = None
    birth_year: int | None = None
    birth_date: date | None = None
    veterinary_id: int | None = None
    store_id: int | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    confirm_password: str | None = None
    role: str | None = None
    rut: str | None = None
    country: str | None = None
    region: str | None = None
    city: str | None = None
    birth_year: int | None = None
    birth_date: date | None = None
    veterinary_id: int | None = None
    store_id: int | None = None


class PetUpdate(BaseModel):
    name: str | None = None
    species: str | None = None
    breed: str | None = None
    age: int | None = None
    age_months: int | None = None
    weight: float | None = None


class VaccineUpdate(BaseModel):
    name: str | None = None
    application_date: date | None = None
    next_dose_date: date | None = None
    observation: str | None = None


class MedicationUpdate(BaseModel):
    name: str | None = None
    dose: str | None = None
    frequency: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    reminder_times: str | None = None
    observation: str | None = None


class ConsultationUpdate(BaseModel):
    consultation_date: date | None = None
    reason: str | None = None
    diagnosis: str | None = None
    treatment: str | None = None
    veterinarian: str | None = None
    observation: str | None = None


class AdminPrescriptionCreate(BaseModel):
    veterinary_id: int
    issue_date: date | None = None
    medication: str
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    instructions: str | None = None


class AdminPrescriptionUpdate(BaseModel):
    veterinary_id: int | None = None
    issue_date: date | None = None
    medication: str | None = None
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    instructions: str | None = None


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )

    return current_user


ADMIN_CLINICAL_CATALOG_CATEGORIES = {
    "consultation_reason",
    "vaccine",
    "medication",
    "dose",
    "frequency",
    "duration",
}


ADMIN_CLINICAL_DEFAULTS = {
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
}


ADMIN_CLINICAL_DEFAULT_VACCINES = {
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


def normalize_admin_catalog_category(category: str):
    value = (category or "").strip().lower()

    if value not in ADMIN_CLINICAL_CATALOG_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail="Tipo de catálogo clínico no válido",
        )

    return value


def admin_catalog_defaults(
    category: str,
    species: str,
):
    if category == "vaccine":
        return ADMIN_CLINICAL_DEFAULT_VACCINES.get(
            (species or "").strip().lower(),
            [],
        )

    return ADMIN_CLINICAL_DEFAULTS.get(
        category,
        [],
    )


def register_admin_catalog_option(
    db: Session,
    category: str,
    species: str | None,
    name: str | None,
):
    category = normalize_admin_catalog_category(
        category
    )
    species = (species or "").strip()
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


@router.get("/clinical-catalog/{category}")
def admin_clinical_catalog(
    category: str,
    species: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    category = normalize_admin_catalog_category(
        category
    )
    species = (species or "").strip()

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
        admin_catalog_defaults(
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


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    users = db.query(User).order_by(User.id.asc()).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "rut": user.rut,
            "country": user.country,
            "region": user.region,
            "city": user.city,
            "birth_year": user.birth_year,
            "birth_date": user.birth_date,
            "veterinary_id": user.veterinary_id,
            "store_id": user.store_id,
            "created_at": user.created_at,
            "last_login_at": user.last_login_at,
            "last_seen_at": user.last_seen_at,
        }
        for user in users
    ]


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user_by_admin(
    data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if data.confirm_password is not None and data.password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Las contraseñas no coinciden"
        )

    existing = db.query(User).filter(User.email == data.email).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="El correo ya está registrado"
        )

    allowed_roles = ["admin", "owner", "vet", "store"]

    if data.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Rol no válido. Usa admin, owner, vet o store"
        )

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        rut=data.rut,
        country=data.country,
        region=data.region,
        city=data.city,
        birth_year=data.birth_date.year if data.birth_date else data.birth_year,
        birth_date=data.birth_date,
        veterinary_id=data.veterinary_id if data.role == "vet" else None,
        store_id=data.store_id if data.role == "store" else None,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.put("/users/{user_id}", response_model=UserOut)
def update_user_by_admin(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    if data.email:
        existing = db.query(User).filter(
            User.email == data.email,
            User.id != user_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Ese correo ya está siendo usado por otro usuario"
            )

        user.email = data.email

    if data.name:
        user.name = data.name

    if data.password or data.confirm_password:
        if not data.password or not data.confirm_password:
            raise HTTPException(
                status_code=400,
                detail="Debes ingresar y confirmar la nueva contraseña"
            )

        if data.password != data.confirm_password:
            raise HTTPException(
                status_code=400,
                detail="Las contraseñas no coinciden"
            )

        user.password_hash = hash_password(data.password)

    if data.role:
        allowed_roles = ["admin", "owner", "vet", "store"]

        if data.role not in allowed_roles:
            raise HTTPException(
                status_code=400,
                detail="Rol no válido. Usa admin, owner, vet o store"
            )

        user.role = data.role

        if data.role != "vet":
            user.veterinary_id = None
        if data.role != "store":
            user.store_id = None

    if data.rut is not None:
        user.rut = data.rut

    if data.country is not None:
        user.country = data.country

    if data.region is not None:
        user.region = data.region

    if data.city is not None:
        user.city = data.city

    if data.birth_date is not None:
        user.birth_date = data.birth_date
        user.birth_year = data.birth_date.year
    elif data.birth_year is not None:
        # Compatibilidad con registros antiguos.
        user.birth_year = data.birth_year

    if data.veterinary_id is not None:
        user.veterinary_id = data.veterinary_id

    if user.role != "vet":
        user.veterinary_id = None
    if data.store_id is not None:
        user.store_id = data.store_id
    if user.role != "store":
        user.store_id = None

    db.commit()
    db.refresh(user)

    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="No puedes eliminar tu propio usuario admin"
        )

    db.delete(user)
    db.commit()


@router.get("/pets", response_model=list[PetOut])
def list_all_pets(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return db.query(Pet).order_by(Pet.id.asc()).all()


@router.put("/pets/{pet_id}", response_model=PetOut)
def update_pet_by_admin(
    pet_id: int,
    data: PetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    if data.name is not None:
        pet.name = data.name

    if data.species is not None:
        pet.species = data.species

    if data.breed is not None:
        pet.breed = data.breed

    if data.age is not None:
        pet.age = data.age

    if data.age_months is not None:
        pet.age_months = data.age_months

    if data.weight is not None:
        pet.weight = data.weight

    db.commit()
    db.refresh(pet)

    return pet


@router.delete("/pets/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pet_by_admin(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    db.delete(pet)
    db.commit()


@router.get("/pets/{pet_id}/vaccines", response_model=list[VaccineOut])
def admin_list_vaccines(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    return db.query(Vaccine).filter(Vaccine.pet_id == pet.id).all()


@router.post(
    "/pets/{pet_id}/vaccines",
    response_model=VaccineOut,
    status_code=status.HTTP_201_CREATED
)
def admin_create_vaccine(
    pet_id: int,
    data: VaccineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    vaccine = Vaccine(
        pet_id=pet.id,
        **data.model_dump()
    )

    db.add(vaccine)

    register_admin_catalog_option(
        db,
        "vaccine",
        pet.species,
        data.name,
    )

    db.commit()
    db.refresh(vaccine)

    return vaccine


@router.put("/vaccines/{vaccine_id}", response_model=VaccineOut)
def admin_update_vaccine(
    vaccine_id: int,
    data: VaccineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    vaccine = db.query(Vaccine).filter(Vaccine.id == vaccine_id).first()

    if not vaccine:
        raise HTTPException(
            status_code=404,
            detail="Vacuna no encontrada"
        )

    if data.name is not None:
        vaccine.name = data.name

    if data.application_date is not None:
        vaccine.application_date = data.application_date

    if data.next_dose_date is not None:
        vaccine.next_dose_date = data.next_dose_date

    if data.observation is not None:
        vaccine.observation = data.observation

    pet = (
        db.query(Pet)
        .filter(Pet.id == vaccine.pet_id)
        .first()
    )

    if pet:
        register_admin_catalog_option(
            db,
            "vaccine",
            pet.species,
            vaccine.name,
        )

    db.commit()
    db.refresh(vaccine)

    return vaccine


@router.delete("/vaccines/{vaccine_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_vaccine(
    vaccine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    vaccine = db.query(Vaccine).filter(Vaccine.id == vaccine_id).first()

    if not vaccine:
        raise HTTPException(
            status_code=404,
            detail="Vacuna no encontrada"
        )

    db.delete(vaccine)
    db.commit()


@router.get("/pets/{pet_id}/medications", response_model=list[MedicationOut])
def admin_list_medications(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    return db.query(Medication).filter(Medication.pet_id == pet.id).all()


@router.post(
    "/pets/{pet_id}/medications",
    response_model=MedicationOut,
    status_code=status.HTTP_201_CREATED
)
def admin_create_medication(
    pet_id: int,
    data: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
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

    medication_data = data.model_dump()
    medication_data["reminder_times"] = reminder_times

    medication = Medication(
        pet_id=pet.id,
        **medication_data
    )

    db.add(medication)

    register_admin_catalog_option(
        db,
        "medication",
        pet.species,
        data.name,
    )
    register_admin_catalog_option(
        db,
        "dose",
        pet.species,
        data.dose,
    )
    register_admin_catalog_option(
        db,
        "frequency",
        pet.species,
        data.frequency,
    )

    db.commit()
    db.refresh(medication)

    return medication


@router.put("/medications/{medication_id}", response_model=MedicationOut)
def admin_update_medication(
    medication_id: int,
    data: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    medication = db.query(Medication).filter(Medication.id == medication_id).first()

    if not medication:
        raise HTTPException(
            status_code=404,
            detail="Medicamento no encontrado"
        )

    if data.name is not None:
        medication.name = data.name

    if data.dose is not None:
        medication.dose = data.dose

    if data.frequency is not None:
        medication.frequency = data.frequency

    if data.start_date is not None:
        medication.start_date = data.start_date

    if data.end_date is not None:
        medication.end_date = data.end_date

    if data.reminder_times is not None:
        try:
            medication.reminder_times = normalize_reminder_times(
                data.reminder_times
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

    if data.observation is not None:
        medication.observation = data.observation

    pet = (
        db.query(Pet)
        .filter(Pet.id == medication.pet_id)
        .first()
    )

    if pet:
        register_admin_catalog_option(
            db,
            "medication",
            pet.species,
            medication.name,
        )
        register_admin_catalog_option(
            db,
            "dose",
            pet.species,
            medication.dose,
        )
        register_admin_catalog_option(
            db,
            "frequency",
            pet.species,
            medication.frequency,
        )

    db.commit()
    db.refresh(medication)

    return medication


@router.delete("/medications/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_medication(
    medication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    medication = db.query(Medication).filter(Medication.id == medication_id).first()

    if not medication:
        raise HTTPException(
            status_code=404,
            detail="Medicamento no encontrado"
        )

    db.delete(medication)
    db.commit()

# ADMIN: listar consultas de una mascota
@router.get("/pets/{pet_id}/consultations", response_model=list[ConsultationOut])
def admin_list_consultations(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    return db.query(Consultation).filter(
        Consultation.pet_id == pet.id
    ).order_by(Consultation.id.desc()).all()


# ADMIN: crear consulta para una mascota
@router.post(
    "/pets/{pet_id}/consultations",
    response_model=ConsultationOut,
    status_code=status.HTTP_201_CREATED
)
def admin_create_consultation(
    pet_id: int,
    data: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    pet = db.query(Pet).filter(Pet.id == pet_id).first()

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada"
        )

    consultation = Consultation(
        pet_id=pet.id,
        **data.model_dump()
    )

    db.add(consultation)

    register_admin_catalog_option(
        db,
        "consultation_reason",
        pet.species,
        data.reason,
    )

    db.commit()
    db.refresh(consultation)

    return consultation


# ADMIN: editar consulta
@router.put("/consultations/{consultation_id}", response_model=ConsultationOut)
def admin_update_consultation(
    consultation_id: int,
    data: ConsultationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id
    ).first()

    if not consultation:
        raise HTTPException(
            status_code=404,
            detail="Consulta no encontrada"
        )

    if data.consultation_date is not None:
        consultation.consultation_date = data.consultation_date

    if data.reason is not None:
        consultation.reason = data.reason

    if data.diagnosis is not None:
        consultation.diagnosis = data.diagnosis

    if data.treatment is not None:
        consultation.treatment = data.treatment

    if data.veterinarian is not None:
        consultation.veterinarian = data.veterinarian

    if data.observation is not None:
        consultation.observation = data.observation

    pet = (
        db.query(Pet)
        .filter(Pet.id == consultation.pet_id)
        .first()
    )

    if pet:
        register_admin_catalog_option(
            db,
            "consultation_reason",
            pet.species,
            consultation.reason,
        )

    db.commit()
    db.refresh(consultation)

    return consultation


# ADMIN: eliminar consulta
@router.delete("/consultations/{consultation_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    consultation = db.query(Consultation).filter(
        Consultation.id == consultation_id
    ).first()

    if not consultation:
        raise HTTPException(
            status_code=404,
            detail="Consulta no encontrada"
        )

    db.delete(consultation)
    db.commit()


# ============================================================
# ADMIN: RECETAS VETERINARIAS
# ============================================================

def serialize_admin_prescription(
    db: Session,
    item: Prescription,
):
    clinic = (
        db.query(VeterinaryClinic)
        .filter(
            VeterinaryClinic.id
            == item.veterinary_id
        )
        .first()
    )

    return {
        "id": item.id,
        "pet_id": item.pet_id,
        "veterinary_id": item.veterinary_id,
        "clinic_name": (
            clinic.name
            if clinic
            else "Clínica no disponible"
        ),
        "veterinarian_user_id": (
            item.veterinarian_user_id
        ),
        "issue_date": item.issue_date,
        "medication": item.medication,
        "dosage": item.dosage,
        "frequency": item.frequency,
        "duration": item.duration,
        "instructions": item.instructions,
        "created_at": item.created_at,
    }


@router.get("/pets/{pet_id}/prescriptions")
def admin_list_prescriptions(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    pet = (
        db.query(Pet)
        .filter(Pet.id == pet_id)
        .first()
    )

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada",
        )

    items = (
        db.query(Prescription)
        .filter(
            Prescription.pet_id == pet.id
        )
        .order_by(
            Prescription.issue_date.desc(),
            Prescription.id.desc(),
        )
        .all()
    )

    return [
        serialize_admin_prescription(
            db,
            item,
        )
        for item in items
    ]


@router.post(
    "/pets/{pet_id}/prescriptions",
    status_code=status.HTTP_201_CREATED,
)
def admin_create_prescription(
    pet_id: int,
    data: AdminPrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    pet = (
        db.query(Pet)
        .filter(Pet.id == pet_id)
        .first()
    )

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada",
        )

    clinic = (
        db.query(VeterinaryClinic)
        .filter(
            VeterinaryClinic.id
            == data.veterinary_id
        )
        .first()
    )

    if not clinic:
        raise HTTPException(
            status_code=404,
            detail="Clínica veterinaria no encontrada",
        )

    medication = (
        data.medication or ""
    ).strip()

    if len(medication) < 2:
        raise HTTPException(
            status_code=400,
            detail="Debes indicar un medicamento válido",
        )

    item = Prescription(
        pet_id=pet.id,
        veterinary_id=clinic.id,
        veterinarian_user_id=None,
        issue_date=(
            data.issue_date
            or date.today()
        ),
        medication=medication,
        dosage=data.dosage,
        frequency=data.frequency,
        duration=data.duration,
        instructions=data.instructions,
    )

    db.add(item)

    register_admin_catalog_option(
        db,
        "medication",
        pet.species,
        item.medication,
    )
    register_admin_catalog_option(
        db,
        "dose",
        pet.species,
        item.dosage,
    )
    register_admin_catalog_option(
        db,
        "frequency",
        pet.species,
        item.frequency,
    )
    register_admin_catalog_option(
        db,
        "duration",
        pet.species,
        item.duration,
    )

    db.commit()
    db.refresh(item)

    return serialize_admin_prescription(
        db,
        item,
    )


@router.put("/prescriptions/{prescription_id}")
def admin_update_prescription(
    prescription_id: int,
    data: AdminPrescriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    item = (
        db.query(Prescription)
        .filter(
            Prescription.id
            == prescription_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Receta no encontrada",
        )

    if data.veterinary_id is not None:
        clinic = (
            db.query(VeterinaryClinic)
            .filter(
                VeterinaryClinic.id
                == data.veterinary_id
            )
            .first()
        )

        if not clinic:
            raise HTTPException(
                status_code=404,
                detail="Clínica veterinaria no encontrada",
            )

        item.veterinary_id = clinic.id

    if data.issue_date is not None:
        item.issue_date = data.issue_date

    if data.medication is not None:
        medication = data.medication.strip()

        if len(medication) < 2:
            raise HTTPException(
                status_code=400,
                detail="Medicamento no válido",
            )

        item.medication = medication

    if data.dosage is not None:
        item.dosage = data.dosage

    if data.frequency is not None:
        item.frequency = data.frequency

    if data.duration is not None:
        item.duration = data.duration

    if data.instructions is not None:
        item.instructions = data.instructions

    pet = (
        db.query(Pet)
        .filter(Pet.id == item.pet_id)
        .first()
    )

    if pet:
        register_admin_catalog_option(
            db,
            "medication",
            pet.species,
            item.medication,
        )
        register_admin_catalog_option(
            db,
            "dose",
            pet.species,
            item.dosage,
        )
        register_admin_catalog_option(
            db,
            "frequency",
            pet.species,
            item.frequency,
        )
        register_admin_catalog_option(
            db,
            "duration",
            pet.species,
            item.duration,
        )

    db.commit()
    db.refresh(item)

    return serialize_admin_prescription(
        db,
        item,
    )


@router.delete(
    "/prescriptions/{prescription_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def admin_delete_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    item = (
        db.query(Prescription)
        .filter(
            Prescription.id
            == prescription_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Receta no encontrada",
        )

    db.delete(item)
    db.commit()

