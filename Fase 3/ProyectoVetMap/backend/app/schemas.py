from datetime import date, time, datetime
from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str | None = None
    rut: str | None = None
    country: str | None = None
    region: str | None = None
    city: str | None = None
    birth_year: int | None = None
    birth_date: date | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordReset(BaseModel):
    email: EmailStr
    new_password: str
    confirm_password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    rut: str | None = None
    country: str | None = None
    region: str | None = None
    city: str | None = None
    birth_year: int | None = None
    birth_date: date | None = None
    veterinary_id: int | None = None
    store_id: int | None = None

    model_config = ConfigDict(from_attributes=True)


class UserProfileUpdate(BaseModel):
    name: str
    email: EmailStr
    rut: str | None = None
    country: str | None = None
    region: str | None = None
    city: str | None = None
    birth_date: date | None = None
    password: str | None = None
    confirm_password: str | None = None


class UserProfileUpdateOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PetCreate(BaseModel):
    name: str
    species: str
    breed: str | None = None
    age: int | None = None
    age_months: int | None = None
    weight: float | None = None

    # Perfil ampliado de mascota
    photo_data: str | None = None
    birth_date: date | None = None
    additional_info: str | None = None
    medical_background: str | None = None
    feeding_info: str | None = None


class PetOut(PetCreate):
    id: int
    owner_id: int

    model_config = ConfigDict(from_attributes=True)


class PetWeightCreate(BaseModel):
    weight: float
    record_date: date
    note: str | None = None


class PetWeightOut(PetWeightCreate):
    id: int
    pet_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VaccineCreate(BaseModel):
    appointment_id: int | None = None
    name: str
    application_date: date | None = None
    next_dose_date: date | None = None
    observation: str | None = None


class VaccineOut(VaccineCreate):
    id: int
    pet_id: int

    model_config = ConfigDict(from_attributes=True)


class MedicationCreate(BaseModel):
    appointment_id: int | None = None
    name: str
    dose: str | None = None
    frequency: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    reminder_times: str | None = None
    observation: str | None = None


class MedicationOut(MedicationCreate):
    id: int
    pet_id: int

    model_config = ConfigDict(from_attributes=True)


class ConsultationCreate(BaseModel):
    appointment_id: int | None = None
    consultation_date: date | None = None
    reason: str
    diagnosis: str | None = None
    treatment: str | None = None
    veterinarian: str | None = None
    observation: str | None = None


class ConsultationOut(ConsultationCreate):
    id: int
    pet_id: int

    model_config = ConfigDict(from_attributes=True)



class VeterinaryClinicOut(BaseModel):
    id: int
    name: str
    commune: str
    address: str | None = None
    hours: str
    services: str | None = None
    is_24h: bool = False

    model_config = ConfigDict(from_attributes=True)


class AppointmentCreate(BaseModel):
    pet_id: int
    veterinary_id: int
    service: str
    appointment_date: date
    appointment_time: time
    notes: str | None = None


class AppointmentStatusUpdate(BaseModel):
    status: str


class AppointmentOut(BaseModel):
    id: int
    user_id: int
    pet_id: int
    veterinary_id: int
    service: str
    appointment_date: date
    appointment_time: time
    status: str
    notes: str | None = None
    created_at: datetime

    user_name: str
    user_email: str
    pet_name: str
    pet_species: str
    veterinary_name: str
    veterinary_commune: str



class PrescriptionCreate(BaseModel):
    appointment_id: int | None = None
    pet_id: int
    issue_date: date
    medication: str
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    instructions: str | None = None


class PrescriptionOut(BaseModel):
    id: int
    pet_id: int
    veterinary_id: int
    veterinarian_user_id: int | None = None
    issue_date: date
    medication: str
    dosage: str | None = None
    frequency: str | None = None
    duration: str | None = None
    instructions: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StoreProductCreate(BaseModel):
    name: str
    brand: str | None = None
    category: str
    animal_type: str | None = None
    format: str | None = None
    description: str | None = None
    price: int
    stock: int = 0
    active: bool = True


class StoreProductUpdate(BaseModel):
    name: str | None = None
    brand: str | None = None
    category: str | None = None
    animal_type: str | None = None
    format: str | None = None
    description: str | None = None
    price: int | None = None
    stock: int | None = None
    active: bool | None = None


class StoreOrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class StoreOrderCreate(BaseModel):
    store_id: int
    items: list[StoreOrderItemCreate]


class StoreOrderStatusUpdate(BaseModel):
    status: str
