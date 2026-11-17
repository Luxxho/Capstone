import re
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import (
    Appointment,
    Consultation,
    Medication,
    Prescription,
    User,
    Vaccine,
)
from ..report_service import build_appointment_report_pdf


router = APIRouter(prefix="/api/reports", tags=["reports"])


def _appointment_access_allowed(current_user: User, appointment: Appointment):
    if current_user.role == "admin":
        return True

    if current_user.role == "owner":
        return appointment.user_id == current_user.id

    if current_user.role == "vet":
        return (
            current_user.veterinary_id is not None
            and appointment.veterinary_id == current_user.veterinary_id
        )

    return False


def _safe_filename_part(value: str | None):
    value = (value or "VetMap").strip()
    value = re.sub(r"[^A-Za-z0-9_-]+", "_", value)
    return value.strip("_") or "VetMap"


def _same_attention_condition(model, date_field, appointment: Appointment):
    """
    Registros nuevos: appointment_id exacto.
    Registros antiguos: si appointment_id es NULL, se acepta coincidencia
    por mascota y fecha para no perder el historial ya existente.
    """
    return or_(
        model.appointment_id == appointment.id,
        and_(
            model.appointment_id.is_(None),
            date_field == appointment.appointment_date,
        ),
    )


@router.get("/appointments/{appointment_id}/pdf")
def appointment_clinical_report_pdf(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    if not _appointment_access_allowed(current_user, appointment):
        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para descargar este informe.",
        )

    pet = appointment.pet
    owner = appointment.user
    clinic = appointment.veterinary

    consultations = (
        db.query(Consultation)
        .filter(
            Consultation.pet_id == appointment.pet_id,
            _same_attention_condition(
                Consultation,
                Consultation.consultation_date,
                appointment,
            ),
        )
        .order_by(
            Consultation.consultation_date.asc(),
            Consultation.id.asc(),
        )
        .all()
    )

    vaccines = (
        db.query(Vaccine)
        .filter(
            Vaccine.pet_id == appointment.pet_id,
            _same_attention_condition(
                Vaccine,
                Vaccine.application_date,
                appointment,
            ),
        )
        .order_by(Vaccine.id.asc())
        .all()
    )

    medications = (
        db.query(Medication)
        .filter(
            Medication.pet_id == appointment.pet_id,
            _same_attention_condition(
                Medication,
                Medication.start_date,
                appointment,
            ),
        )
        .order_by(Medication.id.asc())
        .all()
    )

    prescriptions = (
        db.query(Prescription)
        .filter(
            Prescription.pet_id == appointment.pet_id,
            Prescription.veterinary_id == appointment.veterinary_id,
            _same_attention_condition(
                Prescription,
                Prescription.issue_date,
                appointment,
            ),
        )
        .order_by(
            Prescription.issue_date.asc(),
            Prescription.id.asc(),
        )
        .all()
    )

    report = {
        "generated_at": datetime.now(),
        "appointment": {
            "id": appointment.id,
            "service": appointment.service,
            "appointment_date": appointment.appointment_date,
            "appointment_time": appointment.appointment_time,
            "status": appointment.status,
            "notes": appointment.notes,
        },
        "pet": {
            "id": pet.id,
            "name": pet.name,
            "species": pet.species,
            "breed": pet.breed,
            "age": pet.age,
            "age_months": pet.age_months,
            "weight": pet.weight,
            "birth_date": pet.birth_date,
            "medical_background": pet.medical_background,
            "feeding_info": pet.feeding_info,
            "additional_info": pet.additional_info,
        },
        "owner": {
            "name": owner.name,
            "email": owner.email,
            "rut": owner.rut,
        },
        "clinic": {
            "name": clinic.name,
            "commune": clinic.commune,
            "address": clinic.address,
            "hours": clinic.hours,
        },
        "consultations": [
            {
                "consultation_date": item.consultation_date,
                "reason": item.reason,
                "diagnosis": item.diagnosis,
                "treatment": item.treatment,
                "veterinarian": item.veterinarian,
                "observation": item.observation,
            }
            for item in consultations
        ],
        "vaccines": [
            {
                "name": item.name,
                "application_date": item.application_date,
                "next_dose_date": item.next_dose_date,
                "observation": item.observation,
            }
            for item in vaccines
        ],
        "medications": [
            {
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
        "prescriptions": [
            {
                "issue_date": item.issue_date,
                "medication": item.medication,
                "dosage": item.dosage,
                "frequency": item.frequency,
                "duration": item.duration,
                "instructions": item.instructions,
            }
            for item in prescriptions
        ],
    }

    try:
        content = build_appointment_report_pdf(report)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "No se pudo generar el informe PDF. "
                f"Detalle: {exc}"
            ),
        ) from exc

    if not content:
        raise HTTPException(
            status_code=500,
            detail="El informe PDF se generó vacío.",
        )

    filename = (
        "VetMap_Atencion_"
        f"{_safe_filename_part(pet.name)}_"
        f"{appointment.appointment_date.strftime('%Y-%m-%d')}_"
        f"R{appointment.id}.pdf"
    )

    return Response(
        content=content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )
