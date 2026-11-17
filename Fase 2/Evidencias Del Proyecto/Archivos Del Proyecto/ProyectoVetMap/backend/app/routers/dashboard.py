"""Métricas reales de VetMap para el dashboard Admin (solo administrador)."""
from collections import Counter
from datetime import datetime, timedelta, time

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import (
    Appointment, PetStore, StoreOrder, User, VeterinaryClinic,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Solo administrador")
    return user


def _date(value):
    return value.isoformat() if value else None


@router.get("/dashboard-overview")
def dashboard_overview(
    days: int = Query(30, ge=7, le=30),
    db: Session = Depends(get_db),
    _user: User = Depends(_admin),
):
    """Totales, serie diaria y últimas altas/pedidos usando registros persistidos."""
    now = datetime.utcnow()
    first_day = now.date() - timedelta(days=days - 1)
    start = datetime.combine(first_day, time.min)

    totals = {
        "users": db.query(func.count(User.id)).scalar() or 0,
        "clinics": db.query(func.count(VeterinaryClinic.id)).scalar() or 0,
        "stores": db.query(func.count(PetStore.id)).scalar() or 0,
        "orders": db.query(func.count(StoreOrder.id)).scalar() or 0,
    }

    users = (
        db.query(User.created_at)
        .filter(User.created_at >= start)
        .all()
    )
    reservations = (
        db.query(Appointment.created_at)
        .filter(Appointment.created_at >= start)
        .all()
    )
    orders = (
        db.query(StoreOrder.created_at)
        .filter(StoreOrder.created_at >= start)
        .all()
    )

    def distribution(rows):
        return Counter(
            row[0].date().isoformat()
            for row in rows
            if row[0] is not None
        )

    ucounts = distribution(users)
    rcounts = distribution(reservations)
    ocounts = distribution(orders)

    series = []
    for i in range(days):
        day = first_day + timedelta(days=i)
        key = day.isoformat()
        series.append({
            "date": key,
            "usuarios": ucounts[key],
            "reservas": rcounts[key],
            "pedidos": ocounts[key],
        })

    events = []
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(5).all()
    recent_stores = db.query(PetStore).order_by(PetStore.created_at.desc()).limit(5).all()
    recent_clinics = db.query(VeterinaryClinic).order_by(VeterinaryClinic.created_at.desc()).limit(5).all()
    recent_orders = db.query(StoreOrder).order_by(StoreOrder.created_at.desc()).limit(5).all()

    for item in recent_users:
        events.append({
            "id": f"user-{item.id}",
            "kind": "user",
            "title": "Nuevo usuario registrado",
            "detail": item.name,
            "when": _date(item.created_at),
        })
    for item in recent_stores:
        events.append({
            "id": f"store-{item.id}",
            "kind": "store",
            "title": "Nueva tienda registrada",
            "detail": item.name,
            "when": _date(item.created_at),
        })
    for item in recent_clinics:
        events.append({
            "id": f"clinic-{item.id}",
            "kind": "clinic",
            "title": "Nueva veterinaria registrada",
            "detail": item.name,
            "when": _date(item.created_at),
        })
    store_names = dict(db.query(PetStore.id, PetStore.name).all())
    for item in recent_orders:
        events.append({
            "id": f"order-{item.id}",
            "kind": "order",
            "title": f"Nuevo pedido #{item.id}",
            "detail": store_names.get(item.store_id, f"Tienda #{item.store_id}"),
            "when": _date(item.created_at),
        })
    events.sort(key=lambda e: e["when"] or "", reverse=True)

    return {
        "totals": totals,
        "period_days": days,
        "series": series,
        "activity": events[:15],
        "updated_at": now.isoformat() + "Z",
        "timezone": "UTC",
    }
