from datetime import datetime, date, time
from sqlalchemy import String, Integer, DateTime, Float, ForeignKey, Date, Time, Boolean, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(40), default="owner")

    rut: Mapped[str | None] = mapped_column(String(20), nullable=True)
    country: Mapped[str | None] = mapped_column(String(80), nullable=True)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    birth_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Solo se utiliza cuando role == "vet".
    # Permite asociar la cuenta del profesional a una clínica de VetMap.
    veterinary_id: Mapped[int | None] = mapped_column(
        ForeignKey("veterinary_clinics.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Solo se utiliza cuando role == "store".
    store_id: Mapped[int | None] = mapped_column(
        ForeignKey("pet_stores.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    delivery_driver_id: Mapped[int | None] = mapped_column(ForeignKey("delivery_drivers.id", ondelete="SET NULL"), nullable=True, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
    last_seen_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
        index=True,
    )

    pets: Mapped[list["Pet"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan"
    )

    appointments: Mapped[list["Appointment"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Pet(Base):
    __tablename__ = "pets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )

    name: Mapped[str] = mapped_column(String(100))
    species: Mapped[str] = mapped_column(String(80))
    breed: Mapped[str | None] = mapped_column(String(100), nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    age_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)

    owner: Mapped[User] = relationship(back_populates="pets")

    vaccines: Mapped[list["Vaccine"]] = relationship(
        back_populates="pet",
        cascade="all, delete-orphan"
    )

    medications: Mapped[list["Medication"]] = relationship(
        back_populates="pet",
        cascade="all, delete-orphan"
    )

    consultations: Mapped[list["Consultation"]] = relationship(
        back_populates="pet",
        cascade="all, delete-orphan"
    )

    appointments: Mapped[list["Appointment"]] = relationship(
        back_populates="pet",
        cascade="all, delete-orphan"
    )

    detail: Mapped["PetDetail | None"] = relationship(
        back_populates="pet",
        uselist=False,
        cascade="all, delete-orphan"
    )

    weight_records: Mapped[list["PetWeight"]] = relationship(
        back_populates="pet",
        cascade="all, delete-orphan",
        order_by="PetWeight.record_date.desc()"
    )

    @property
    def photo_data(self):
        return self.detail.photo_data if self.detail else None

    @property
    def birth_date(self):
        return self.detail.birth_date if self.detail else None

    @property
    def additional_info(self):
        return self.detail.additional_info if self.detail else None

    @property
    def medical_background(self):
        return self.detail.medical_background if self.detail else None

    @property
    def feeding_info(self):
        return self.detail.feeding_info if self.detail else None


class PetBreed(Base):
    """
    Catálogo dinámico de razas / variedades por especie.

    Incluye opciones prefijadas y también las nuevas opciones
    agregadas por los usuarios de VetMap.
    """

    __tablename__ = "pet_breeds"
    __table_args__ = (
        UniqueConstraint(
            "species",
            "name",
            name="uq_pet_breeds_species_name",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    species: Mapped[str] = mapped_column(
        String(80),
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        index=True,
    )

    is_default: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


class ClinicalCatalogOption(Base):
    """
    Opciones clínicas dinámicas aprendidas por VetMap.

    Cuando la veterinaria escribe una opción nueva al registrar una
    consulta, vacuna, medicamento o receta, se guarda aquí para que
    vuelva a aparecer como sugerencia en registros futuros.
    """

    __tablename__ = "clinical_catalog_options"
    __table_args__ = (
        UniqueConstraint(
            "category",
            "species",
            "name",
            name="uq_clinical_catalog_category_species_name",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    category: Mapped[str] = mapped_column(
        String(60),
        index=True,
    )

    species: Mapped[str] = mapped_column(
        String(80),
        default="",
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(160),
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


class Vaccine(Base):
    __tablename__ = "vaccines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    appointment_id: Mapped[int | None] = mapped_column(
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    pet_id: Mapped[int] = mapped_column(
        ForeignKey("pets.id", ondelete="CASCADE"),
        index=True
    )

    name: Mapped[str] = mapped_column(String(120))
    application_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    next_dose_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    observation: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    pet: Mapped[Pet] = relationship(back_populates="vaccines")


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    appointment_id: Mapped[int | None] = mapped_column(
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    pet_id: Mapped[int] = mapped_column(
        ForeignKey("pets.id", ondelete="CASCADE"),
        index=True
    )

    name: Mapped[str] = mapped_column(String(120))
    dose: Mapped[str | None] = mapped_column(String(120), nullable=True)
    frequency: Mapped[str | None] = mapped_column(String(120), nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    reminder_times: Mapped[str | None] = mapped_column(Text, nullable=True)
    observation: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    pet: Mapped[Pet] = relationship(back_populates="medications")


class MedicationAdministration(Base):
    """Registro de una dosis que el dueño marcó como administrada."""

    __tablename__ = "medication_administrations"
    __table_args__ = (
        UniqueConstraint(
            "medication_id",
            "scheduled_date",
            "scheduled_time",
            name="uq_medication_administration_dose",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    medication_id: Mapped[int] = mapped_column(
        ForeignKey("medications.id", ondelete="CASCADE"),
        index=True,
    )
    scheduled_date: Mapped[date] = mapped_column(Date, index=True)
    scheduled_time: Mapped[str] = mapped_column(String(5), index=True)
    administered_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        index=True,
    )
    administered_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )


class Consultation(Base):
    __tablename__ = "consultations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    appointment_id: Mapped[int | None] = mapped_column(
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    pet_id: Mapped[int] = mapped_column(
        ForeignKey("pets.id", ondelete="CASCADE"),
        index=True
    )

    consultation_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    reason: Mapped[str] = mapped_column(String(150))
    diagnosis: Mapped[str | None] = mapped_column(String(255), nullable=True)
    treatment: Mapped[str | None] = mapped_column(String(255), nullable=True)
    veterinarian: Mapped[str | None] = mapped_column(String(120), nullable=True)
    observation: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    pet: Mapped[Pet] = relationship(back_populates="consultations")



class PetDetail(Base):
    __tablename__ = "pet_details"

    pet_id: Mapped[int] = mapped_column(
        ForeignKey("pets.id", ondelete="CASCADE"),
        primary_key=True
    )

    photo_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    additional_info: Mapped[str | None] = mapped_column(Text, nullable=True)
    medical_background: Mapped[str | None] = mapped_column(Text, nullable=True)
    feeding_info: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    pet: Mapped[Pet] = relationship(back_populates="detail")


class PetWeight(Base):
    __tablename__ = "pet_weights"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    pet_id: Mapped[int] = mapped_column(
        ForeignKey("pets.id", ondelete="CASCADE"),
        index=True
    )

    weight: Mapped[float] = mapped_column(Float)
    record_date: Mapped[date] = mapped_column(Date, index=True)
    note: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    pet: Mapped[Pet] = relationship(back_populates="weight_records")


class PetStore(Base):
    __tablename__ = "pet_stores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    commune: Mapped[str] = mapped_column(String(100))
    address: Mapped[str | None] = mapped_column(String(220), nullable=True)

    # Coordenadas aproximadas para el mapa demostrativo de VetMap.
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    delivery_conditions: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_channel: Mapped[str | None] = mapped_column(String(255), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class StoreProduct(Base):
    __tablename__ = "store_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("pet_stores.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(180), index=True)
    brand: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    category: Mapped[str] = mapped_column(String(100), index=True)
    animal_type: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    format: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[int] = mapped_column(Integer)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ProductPriceHistory(Base):
    __tablename__ = "product_price_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("store_products.id", ondelete="CASCADE"), index=True)
    price: Mapped[int] = mapped_column(Integer)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class StoreOrder(Base):
    __tablename__ = "store_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("pet_stores.id", ondelete="CASCADE"), index=True)
    total: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(40), default="pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class StoreOrderArchive(Base):
    """
    Permite limpiar el historial visible sin borrar el pedido real.

    owner_archived:
        oculto para el comprador.

    store_archived:
        oculto para la tienda.
    """

    __tablename__ = "store_order_archives"

    order_id: Mapped[int] = mapped_column(
        ForeignKey("store_orders.id", ondelete="CASCADE"),
        primary_key=True,
    )

    owner_archived: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        index=True,
    )

    store_archived: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        index=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class StoreOrderStatusHistory(Base):
    __tablename__ = "store_order_status_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    order_id: Mapped[int] = mapped_column(
        ForeignKey("store_orders.id", ondelete="CASCADE"),
        index=True
    )

    status: Mapped[str] = mapped_column(String(40), index=True)

    changed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        index=True
    )


class StoreOrderItem(Base):
    __tablename__ = "store_order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("store_orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("store_products.id", ondelete="RESTRICT"), index=True)
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[int] = mapped_column(Integer)


class PaymentCheckout(Base):
    """
    Guarda el vínculo entre una compra iniciada en VetMap y la order
    creada en Mercado Pago.

    El carrito se conserva en cart_json hasta que Mercado Pago confirme
    que el pago fue procesado y acreditado. Recién en ese momento se
    crean los StoreOrder definitivos.
    """
    __tablename__ = "payment_checkouts"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    mp_order_id: Mapped[str] = mapped_column(
        String(120),
        unique=True,
        index=True,
    )

    external_reference: Mapped[str] = mapped_column(
        String(120),
        unique=True,
        index=True,
    )

    total: Mapped[int] = mapped_column(Integer)

    status: Mapped[str] = mapped_column(
        String(40),
        default="created",
        index=True,
    )

    status_detail: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True,
    )

    cart_json: Mapped[str] = mapped_column(Text)

    finalized: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        index=True,
    )

    internal_order_ids_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        index=True,
    )

    finalized_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    title: Mapped[str] = mapped_column(String(160))
    message: Mapped[str] = mapped_column(String(500))

    category: Mapped[str] = mapped_column(
        String(50),
        default="info",
        index=True,
    )

    entity_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True,
    )

    entity_id: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True,
        index=True,
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        index=True,
    )


class Prescription(Base):
    __tablename__ = "prescriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    appointment_id: Mapped[int | None] = mapped_column(
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    pet_id: Mapped[int] = mapped_column(
        ForeignKey("pets.id", ondelete="CASCADE"),
        index=True
    )

    veterinary_id: Mapped[int] = mapped_column(
        ForeignKey("veterinary_clinics.id", ondelete="CASCADE"),
        index=True
    )

    veterinarian_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    issue_date: Mapped[date] = mapped_column(Date, default=date.today)
    medication: Mapped[str] = mapped_column(String(160))
    dosage: Mapped[str | None] = mapped_column(String(160), nullable=True)
    frequency: Mapped[str | None] = mapped_column(String(160), nullable=True)
    duration: Mapped[str | None] = mapped_column(String(160), nullable=True)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PrescriptionTemplate(Base):
    __tablename__ = "prescription_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    veterinary_id: Mapped[int] = mapped_column(
        ForeignKey("veterinary_clinics.id", ondelete="CASCADE"),
        index=True,
    )

    veterinarian_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(String(160))
    medication: Mapped[str] = mapped_column(String(160))
    dosage: Mapped[str | None] = mapped_column(String(160), nullable=True)
    frequency: Mapped[str | None] = mapped_column(String(160), nullable=True)
    duration: Mapped[str | None] = mapped_column(String(160), nullable=True)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        index=True,
    )


class VeterinaryClinic(Base):
    __tablename__ = "veterinary_clinics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    commune: Mapped[str] = mapped_column(String(100))
    address: Mapped[str | None] = mapped_column(String(220), nullable=True)

    # Coordenadas aproximadas para el mapa demostrativo de VetMap.
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    hours: Mapped[str] = mapped_column(String(120))
    services: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_24h: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    appointments: Mapped[list["Appointment"]] = relationship(
        back_populates="veterinary",
        cascade="all, delete-orphan"
    )


class AppointmentArchive(Base):
    """
    Controla si una reserva finalizada fue ocultada del historial visible.

    No elimina la reserva original. Cada lado puede limpiar su historial
    de manera independiente:
    - owner_archived: oculta para el dueño de la mascota.
    - clinic_archived: oculta para la clínica veterinaria.
    """

    __tablename__ = "appointment_archives"

    appointment_id: Mapped[int] = mapped_column(
        ForeignKey("appointments.id", ondelete="CASCADE"),
        primary_key=True,
    )

    owner_archived: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    clinic_archived: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class AppointmentAdminArchive(Base):
    """
    Historial visible del administrador.

    Una fila indica que la reserva finalizada fue quitada de la vista
    administrativa. No elimina la reserva real ni modifica la vista
    del dueño o de la clínica veterinaria.
    """

    __tablename__ = "appointment_admin_archives"

    appointment_id: Mapped[int] = mapped_column(
        ForeignKey("appointments.id", ondelete="CASCADE"),
        primary_key=True,
    )

    archived_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )

    pet_id: Mapped[int] = mapped_column(
        ForeignKey("pets.id", ondelete="CASCADE"),
        index=True
    )

    veterinary_id: Mapped[int] = mapped_column(
        ForeignKey("veterinary_clinics.id", ondelete="CASCADE"),
        index=True
    )

    service: Mapped[str] = mapped_column(String(120))
    appointment_date: Mapped[date] = mapped_column(Date, index=True)
    appointment_time: Mapped[time] = mapped_column(Time, index=True)
    status: Mapped[str] = mapped_column(String(40), default="pending", index=True)
    notes: Mapped[str | None] = mapped_column(String(400), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="appointments")
    pet: Mapped[Pet] = relationship(back_populates="appointments")
    veterinary: Mapped[VeterinaryClinic] = relationship(back_populates="appointments")

# VETMAP V26 - Repartidores asociados a cada tienda (nuevas tablas).
class DeliveryDriver(Base):
    __tablename__ = "delivery_drivers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("pet_stores.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class DeliveryAssignment(Base):
    __tablename__ = "delivery_assignments"
    __table_args__ = (UniqueConstraint("order_id", name="uq_delivery_assignment_order"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("store_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("pet_stores.id", ondelete="CASCADE"), nullable=False, index=True)
    driver_id: Mapped[int] = mapped_column(ForeignKey("delivery_drivers.id", ondelete="RESTRICT"), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(30), default="assigned", nullable=False)
    notes: Mapped[str | None] = mapped_column(String(600), nullable=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    dispatched_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
# FIN VETMAP V26


# VetMap V27 - conversaciones y mensajes
class ChatConversation(Base):
    __tablename__ = "chat_conversations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    kind: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    order_id: Mapped[int | None] = mapped_column(ForeignKey("store_orders.id", ondelete="CASCADE"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    body: Mapped[str] = mapped_column(String(1000), nullable=False)
    eta_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
