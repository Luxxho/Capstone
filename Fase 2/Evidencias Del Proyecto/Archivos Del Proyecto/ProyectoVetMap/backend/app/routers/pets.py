from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import (
    Pet,
    PetBreed,
    PetDetail,
    PetWeight,
    User,
    Vaccine,
    Medication,
    MedicationAdministration,
    Notification,
    Consultation,
)
from ..medication_schedule_service import (
    get_administration,
    medication_active_on,
    parse_reminder_times,
    schedule_status,
)
from ..schemas import (
    PetCreate,
    PetOut,
    PetWeightCreate,
    PetWeightOut,
    VaccineCreate,
    VaccineOut,
    MedicationCreate,
    MedicationOut,
    ConsultationCreate,
    ConsultationOut,
)

router = APIRouter(prefix="/api/pets", tags=["pets"])


DEFAULT_PET_BREEDS = {
    "Perro": [
        "Labrador Retriever",
        "Golden Retriever",
        "Poodle",
        "Pastor Alemán",
        "Bulldog Francés",
        "Chihuahua",
        "Beagle",
        "Yorkshire Terrier",
        "Dachshund / Salchicha",
        "Border Collie",
        "Husky Siberiano",
        "Rottweiler",
        "Shih Tzu",
        "Pug",
        "Mestizo",
    ],
    "Gato": [
        "Doméstico de pelo corto",
        "Doméstico de pelo largo",
        "Siamés",
        "Persa",
        "Maine Coon",
        "Bengalí",
        "Ragdoll",
        "British Shorthair",
        "Sphynx",
        "Mestizo",
    ],
    "Conejo": [
        "Mini Lop",
        "Holland Lop",
        "Rex",
        "Mini Rex",
        "Cabeza de León",
        "Angora",
        "Neozelandés",
        "Mestizo",
    ],
    "Hámster": [
        "Sirio",
        "Ruso",
        "Roborovski",
        "Chino",
    ],
    "Cobayo": [
        "Americano",
        "Abisinio",
        "Peruano",
        "Sheltie",
        "Teddy",
    ],
    "Hurón": [
        "Sable",
        "Albino",
        "Canela",
        "Chocolate",
        "Champagne",
    ],
    "Tortuga": [
        "Orejas rojas",
        "Mediterránea",
        "Rusa",
        "Sulcata",
        "Tortuga caja",
    ],
    "Pez": [
        "Betta",
        "Guppy",
        "Goldfish",
        "Molly",
        "Platy",
        "Tetra neón",
        "Escalar",
        "Disco",
        "Corydora",
    ],
    "Ave": [
        "Diamante mandarín",
        "Cacatúa ninfa",
        "Canario",
        "Periquito australiano",
        "Agapornis",
    ],
    "Loro": [
        "Amazona",
        "Yaco / Gris africano",
        "Guacamayo",
        "Eclectus",
        "Cotorra argentina",
    ],
    "Canario": [
        "Timbrado español",
        "Roller",
        "Gloster",
        "Malinois",
    ],
    "Periquito": [
        "Australiano",
        "Inglés",
    ],
    "Agapornis": [
        "Roseicollis",
        "Personata",
        "Fischeri",
    ],
    "Gallina": [
        "Sedosa",
        "Brahma",
        "Leghorn",
        "Araucana",
    ],
    "Pato": [
        "Pekín",
        "Khaki Campbell",
        "Corredor indio",
    ],
    "Erizo": [
        "Africano pigmeo",
        "Algeriano",
    ],
    "Chinchilla": [
        "Estándar",
        "Beige",
        "Ebony",
        "Mosaic",
    ],
    "Ratón": [
        "Fancy",
        "Rex",
        "Albino",
        "Siamés",
    ],
    "Rata doméstica": [
        "Dumbo",
        "Standard",
        "Rex",
        "Hairless",
    ],
    "Iguana": [
        "Iguana verde",
        "Iguana rinoceronte",
        "Iguana azul",
    ],
    "Gecko": [
        "Gecko leopardo",
        "Gecko crestado",
        "Gecko tokay",
    ],
    "Serpiente": [
        "Pitón bola",
        "Serpiente del maíz",
        "Boa constrictora",
        "Kingsnake",
    ],
    "Rana": [
        "Rana Pacman",
        "Rana arborícola",
        "Rana dardo",
    ],
    "Ajolote": [
        "Leucístico",
        "Silvestre",
        "Albino dorado",
        "Melanoide",
    ],
    "Araña": [
        "Tarántula chilena",
        "Tarántula de rodillas rojas",
    ],
    "Insecto": [
        "Mantis religiosa",
        "Insecto palo",
        "Escarabajo",
    ],
    "Cerdo miniatura": [
        "Vietnamita",
        "Juliana",
        "KuneKune",
    ],
}


class PetBreedCreate(BaseModel):
    species: str
    name: str


def normalize_catalog_text(value: str):
    return " ".join((value or "").strip().split())


def find_breed(
    db: Session,
    species: str,
    name: str,
):
    return (
        db.query(PetBreed)
        .filter(
            func.lower(PetBreed.species)
            == species.lower(),
            func.lower(PetBreed.name)
            == name.lower(),
        )
        .first()
    )


def validate_breed_name(name: str):
    clean = normalize_catalog_text(name)

    if len(clean) < 2:
        raise HTTPException(
            status_code=400,
            detail="La raza o variedad debe tener al menos 2 caracteres.",
        )

    if len(clean) > 100:
        raise HTTPException(
            status_code=400,
            detail="La raza o variedad no puede superar 100 caracteres.",
        )

    if clean.lower() in {
        "otra",
        "otro",
        "selecciona",
        "seleccionar",
    }:
        raise HTTPException(
            status_code=400,
            detail="Escribe una raza o variedad válida.",
        )

    return clean


def ensure_default_breeds(
    db: Session,
    species: str | None = None,
):
    requested = (
        normalize_catalog_text(species)
        if species
        else None
    )

    changed = False

    for catalog_species, names in DEFAULT_PET_BREEDS.items():
        if (
            requested
            and catalog_species.lower()
            != requested.lower()
        ):
            continue

        for name in names:
            if not find_breed(
                db,
                catalog_species,
                name,
            ):
                db.add(
                    PetBreed(
                        species=catalog_species,
                        name=name,
                        is_default=True,
                    )
                )
                changed = True

    if changed:
        db.commit()


def register_breed(
    db: Session,
    species: str,
    name: str | None,
    is_default: bool = False,
):
    species_clean = normalize_catalog_text(species)

    if not species_clean or not name:
        return None

    breed_clean = validate_breed_name(name)

    existing = find_breed(
        db,
        species_clean,
        breed_clean,
    )

    if existing:
        return existing

    breed = PetBreed(
        species=species_clean,
        name=breed_clean,
        is_default=is_default,
    )

    db.add(breed)
    db.flush()

    return breed


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


class MedicationAdministrationCreate(BaseModel):
    scheduled_date: date
    scheduled_time: str


class ConsultationUpdate(BaseModel):
    consultation_date: date | None = None
    reason: str | None = None
    diagnosis: str | None = None
    treatment: str | None = None
    veterinarian: str | None = None
    observation: str | None = None


def get_owned_pet(pet_id: int, db: Session, current_user: User):
    pet = (
        db.query(Pet)
        .filter(
            Pet.id == pet_id,
            Pet.owner_id == current_user.id,
        )
        .first()
    )

    if not pet:
        raise HTTPException(
            status_code=404,
            detail="Mascota no encontrada",
        )

    return pet


def only_admin_can_manage_clinical_history():
    raise HTTPException(
        status_code=403,
        detail="El historial clínico solo puede ser modificado por el administrador.",
    )


def save_pet_detail(db: Session, pet: Pet, data: PetCreate):
    detail_values = {
        "photo_data": data.photo_data,
        "birth_date": data.birth_date,
        "additional_info": data.additional_info,
        "medical_background": data.medical_background,
        "feeding_info": data.feeding_info,
    }

    has_any_detail = any(value not in (None, "") for value in detail_values.values())

    detail = (
        db.query(PetDetail)
        .filter(PetDetail.pet_id == pet.id)
        .first()
    )

    if detail is None and has_any_detail:
        detail = PetDetail(
            pet_id=pet.id,
            **detail_values,
        )
        db.add(detail)
    elif detail is not None:
        detail.photo_data = data.photo_data
        detail.birth_date = data.birth_date
        detail.additional_info = data.additional_info
        detail.medical_background = data.medical_background
        detail.feeding_info = data.feeding_info


@router.get("", response_model=list[PetOut])
def list_pets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Pet)
        .filter(Pet.owner_id == current_user.id)
        .order_by(Pet.id.asc())
        .all()
    )


@router.get("/breeds/catalog")
def list_pet_breeds(
    species: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    species_clean = normalize_catalog_text(species)

    if not species_clean:
        return []

    ensure_default_breeds(
        db,
        species_clean,
    )

    # También incorpora razas que ya existían en mascotas antiguas
    # antes de instalar el catálogo dinámico.
    existing_pet_breeds = (
        db.query(Pet.breed)
        .filter(
            func.lower(Pet.species)
            == species_clean.lower(),
            Pet.breed.isnot(None),
        )
        .distinct()
        .all()
    )

    for row in existing_pet_breeds:
        old_breed = row[0]

        if old_breed:
            register_breed(
                db,
                species_clean,
                old_breed,
            )

    db.commit()

    rows = (
        db.query(PetBreed)
        .filter(
            func.lower(PetBreed.species)
            == species_clean.lower()
        )
        .order_by(
            PetBreed.is_default.desc(),
            PetBreed.name.asc(),
        )
        .all()
    )

    return [
        {
            "id": item.id,
            "species": item.species,
            "name": item.name,
            "is_default": item.is_default,
        }
        for item in rows
    ]


@router.post("/breeds/catalog")
def create_pet_breed(
    data: PetBreedCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    species = normalize_catalog_text(
        data.species
    )

    if not species:
        raise HTTPException(
            status_code=400,
            detail="Debes indicar una especie.",
        )

    clean_name = validate_breed_name(
        data.name
    )

    existing = find_breed(
        db,
        species,
        clean_name,
    )

    if existing:
        return {
            "id": existing.id,
            "species": existing.species,
            "name": existing.name,
            "is_default": existing.is_default,
            "created": False,
        }

    breed = register_breed(
        db,
        species,
        clean_name,
        is_default=False,
    )

    db.commit()
    db.refresh(breed)

    return {
        "id": breed.id,
        "species": breed.species,
        "name": breed.name,
        "is_default": breed.is_default,
        "created": True,
    }


@router.post("", response_model=PetOut, status_code=status.HTTP_201_CREATED)
def create_pet(
    data: PetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = Pet(
        owner_id=current_user.id,
        name=data.name,
        species=data.species,
        breed=data.breed,
        age=data.age,
        age_months=data.age_months,
        weight=data.weight,
    )

    db.add(pet)
    db.flush()

    if data.breed:
        register_breed(
            db,
            data.species,
            data.breed,
        )

    save_pet_detail(db, pet, data)

    # Si el usuario registra un peso al crear la mascota,
    # se agrega también como primer registro del historial.
    if data.weight is not None:
        db.add(
            PetWeight(
                pet_id=pet.id,
                weight=data.weight,
                record_date=date.today(),
                note="Peso inicial de la mascota",
            )
        )

    db.commit()
    db.refresh(pet)

    return pet


@router.put("/{pet_id}", response_model=PetOut)
def update_pet(
    pet_id: int,
    data: PetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_owned_pet(pet_id, db, current_user)

    previous_weight = pet.weight

    pet.name = data.name
    pet.species = data.species
    pet.breed = data.breed
    pet.age = data.age
    pet.age_months = data.age_months
    pet.weight = data.weight

    if data.breed:
        register_breed(
            db,
            data.species,
            data.breed,
        )

    save_pet_detail(db, pet, data)

    # Si cambia el peso general desde editar mascota,
    # registra ese cambio en el historial.
    if data.weight is not None and data.weight != previous_weight:
        db.add(
            PetWeight(
                pet_id=pet.id,
                weight=data.weight,
                record_date=date.today(),
                note="Peso actualizado desde el perfil",
            )
        )

    db.commit()
    db.refresh(pet)

    return pet


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pet(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    El dueño puede eliminar únicamente una mascota que le pertenezca.

    Las relaciones principales de Pet usan cascade/delete-orphan y
    las claves foráneas asociadas usan ON DELETE CASCADE, por lo que
    al eliminar la mascota también se limpian sus registros asociados.
    """
    pet = get_owned_pet(
        pet_id,
        db,
        current_user,
    )

    db.delete(pet)
    db.commit()

    return None


# =========================================================
# HISTORIAL DE PESO
# =========================================================

@router.get("/{pet_id}/weights", response_model=list[PetWeightOut])
def list_pet_weights(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_owned_pet(pet_id, db, current_user)

    return (
        db.query(PetWeight)
        .filter(PetWeight.pet_id == pet.id)
        .order_by(
            PetWeight.record_date.desc(),
            PetWeight.id.desc(),
        )
        .all()
    )


@router.post(
    "/{pet_id}/weights",
    response_model=PetWeightOut,
    status_code=status.HTTP_201_CREATED,
)
def create_pet_weight(
    pet_id: int,
    data: PetWeightCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_owned_pet(pet_id, db, current_user)

    if data.weight <= 0:
        raise HTTPException(
            status_code=400,
            detail="El peso debe ser mayor a 0 kg.",
        )

    weight_record = PetWeight(
        pet_id=pet.id,
        weight=data.weight,
        record_date=data.record_date,
        note=data.note.strip() if data.note else None,
    )

    db.add(weight_record)

    # Mantiene el peso actual de la mascota actualizado.
    pet.weight = data.weight

    db.commit()
    db.refresh(weight_record)

    return weight_record


@router.delete("/weights/{weight_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pet_weight(
    weight_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    weight_record = (
        db.query(PetWeight)
        .join(Pet, Pet.id == PetWeight.pet_id)
        .filter(
            PetWeight.id == weight_id,
            Pet.owner_id == current_user.id,
        )
        .first()
    )

    if not weight_record:
        raise HTTPException(
            status_code=404,
            detail="Registro de peso no encontrado.",
        )

    pet_id = weight_record.pet_id

    db.delete(weight_record)
    db.flush()

    latest = (
        db.query(PetWeight)
        .filter(PetWeight.pet_id == pet_id)
        .order_by(
            PetWeight.record_date.desc(),
            PetWeight.id.desc(),
        )
        .first()
    )

    pet = db.query(Pet).filter(Pet.id == pet_id).first()

    if pet:
        pet.weight = latest.weight if latest else None

    db.commit()


# =========================================================
# VACUNAS
# =========================================================

@router.get("/{pet_id}/vaccines", response_model=list[VaccineOut])
def list_vaccines(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_owned_pet(pet_id, db, current_user)

    return db.query(Vaccine).filter(Vaccine.pet_id == pet.id).all()


@router.post(
    "/{pet_id}/vaccines",
    response_model=VaccineOut,
    status_code=status.HTTP_403_FORBIDDEN,
)
def create_vaccine(
    pet_id: int,
    data: VaccineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    only_admin_can_manage_clinical_history()


@router.put("/vaccines/{vaccine_id}", response_model=VaccineOut)
def update_vaccine(
    vaccine_id: int,
    data: VaccineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    only_admin_can_manage_clinical_history()


@router.delete("/vaccines/{vaccine_id}", status_code=status.HTTP_403_FORBIDDEN)
def delete_vaccine(
    vaccine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    only_admin_can_manage_clinical_history()


# =========================================================
# MEDICAMENTOS
# =========================================================

@router.get("/{pet_id}/medications", response_model=list[MedicationOut])
def list_medications(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_owned_pet(pet_id, db, current_user)

    return db.query(Medication).filter(Medication.pet_id == pet.id).all()


@router.post(
    "/{pet_id}/medications",
    response_model=MedicationOut,
    status_code=status.HTTP_403_FORBIDDEN,
)
def create_medication(
    pet_id: int,
    data: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    only_admin_can_manage_clinical_history()


@router.put("/medications/{medication_id}", response_model=MedicationOut)
def update_medication(
    medication_id: int,
    data: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    only_admin_can_manage_clinical_history()


@router.delete("/medications/{medication_id}", status_code=status.HTTP_403_FORBIDDEN)
def delete_medication(
    medication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    only_admin_can_manage_clinical_history()



@router.get("/{pet_id}/medication-schedule")
def get_medication_schedule(
    pet_id: int,
    schedule_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_owned_pet(pet_id, db, current_user)
    target_date = schedule_date or date.today()

    medications = (
        db.query(Medication)
        .filter(Medication.pet_id == pet.id)
        .order_by(Medication.id.asc())
        .all()
    )

    result = []

    for medication in medications:
        if not medication_active_on(medication, target_date):
            continue

        try:
            times = parse_reminder_times(
                medication.reminder_times
            )
        except ValueError:
            times = []

        for scheduled_time in times:
            administration = get_administration(
                db,
                medication.id,
                target_date,
                scheduled_time,
            )

            status_value, can_mark = schedule_status(
                target_date,
                scheduled_time,
                administration,
            )

            result.append(
                {
                    "medication_id": medication.id,
                    "medication_name": medication.name,
                    "dose": medication.dose,
                    "frequency": medication.frequency,
                    "scheduled_date": target_date,
                    "scheduled_time": scheduled_time,
                    "status": status_value,
                    "can_mark": can_mark,
                    "administered_at": (
                        administration.administered_at
                        if administration
                        else None
                    ),
                }
            )

    return result


@router.post("/medications/{medication_id}/administrations")
def mark_medication_administered(
    medication_id: int,
    data: MedicationAdministrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    medication = (
        db.query(Medication)
        .join(Pet, Pet.id == Medication.pet_id)
        .filter(
            Medication.id == medication_id,
            Pet.owner_id == current_user.id,
        )
        .first()
    )

    if not medication:
        raise HTTPException(
            status_code=404,
            detail="Medicamento no encontrado para una de tus mascotas.",
        )

    if data.scheduled_date > date.today():
        raise HTTPException(
            status_code=400,
            detail="No puedes marcar una dosis de un día futuro.",
        )

    if not medication_active_on(
        medication,
        data.scheduled_date,
    ):
        raise HTTPException(
            status_code=400,
            detail="La fecha no pertenece al período de este tratamiento.",
        )

    try:
        valid_times = parse_reminder_times(
            medication.reminder_times
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    if data.scheduled_time not in valid_times:
        raise HTTPException(
            status_code=400,
            detail="Ese horario no pertenece al tratamiento registrado.",
        )

    _, can_mark = schedule_status(
        data.scheduled_date,
        data.scheduled_time,
        None,
    )

    if not can_mark:
        raise HTTPException(
            status_code=400,
            detail="Esa dosis todavía no corresponde administrarla.",
        )

    existing = get_administration(
        db,
        medication.id,
        data.scheduled_date,
        data.scheduled_time,
    )

    if existing:
        return {
            "ok": True,
            "already_administered": True,
            "administered_at": existing.administered_at,
        }

    administration = MedicationAdministration(
        medication_id=medication.id,
        scheduled_date=data.scheduled_date,
        scheduled_time=data.scheduled_time,
        administered_by_user_id=current_user.id,
    )
    db.add(administration)

    reminder_key = (
        f"medication:{medication.id}:"
        f"{data.scheduled_date.isoformat()}:"
        f"{data.scheduled_time}"
    )

    reminder = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.category == "medication_reminder",
            Notification.entity_type == "medication",
            Notification.entity_id == reminder_key,
        )
        .first()
    )

    if reminder:
        reminder.is_read = True

    db.commit()
    db.refresh(administration)

    return {
        "ok": True,
        "already_administered": False,
        "administered_at": administration.administered_at,
    }


# =========================================================
# CONSULTAS
# =========================================================

@router.get("/{pet_id}/consultations", response_model=list[ConsultationOut])
def list_consultations(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = get_owned_pet(pet_id, db, current_user)

    return (
        db.query(Consultation)
        .filter(Consultation.pet_id == pet.id)
        .order_by(Consultation.id.desc())
        .all()
    )


@router.post(
    "/{pet_id}/consultations",
    response_model=ConsultationOut,
    status_code=status.HTTP_403_FORBIDDEN,
)
def create_consultation(
    pet_id: int,
    data: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    only_admin_can_manage_clinical_history()


@router.put("/consultations/{consultation_id}", response_model=ConsultationOut)
def update_consultation(
    consultation_id: int,
    data: ConsultationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    only_admin_can_manage_clinical_history()


@router.delete("/consultations/{consultation_id}", status_code=status.HTTP_403_FORBIDDEN)
def delete_consultation(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    only_admin_can_manage_clinical_history()
