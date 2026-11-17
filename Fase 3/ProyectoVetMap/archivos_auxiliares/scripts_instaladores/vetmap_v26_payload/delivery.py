"""VetMap V26 - Gestion de repartidores por tienda.

Este modulo NO crea cuentas de repartidor ni expone rutas sin autenticacion.
Las operaciones estan restringidas a la tienda del usuario conectado.
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import (
    User, DeliveryDriver, DeliveryAssignment, StoreOrder, StoreOrderStatusHistory,
)
from ..notification_service import create_notification
from .store import require_store_user, current_store, serialize_order, STORE_FINAL_ORDER_STATUSES

router = APIRouter(prefix="/api/store/delivery", tags=["store"])


class DriverCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=40)


class DriverActiveUpdate(BaseModel):
    active: bool


class AssignmentCreate(BaseModel):
    order_id: int = Field(gt=0)
    driver_id: int = Field(gt=0)


class AssignmentStatusUpdate(BaseModel):
    state: str
    notes: str | None = Field(default=None, max_length=600)


def _driver_json(driver):
    return {"id": driver.id, "store_id": driver.store_id, "name": driver.name,
            "phone": driver.phone, "active": driver.active, "created_at": driver.created_at}


def _assignment_json(db, assignment):
    driver = db.query(DeliveryDriver).filter(DeliveryDriver.id == assignment.driver_id).first()
    order = db.query(StoreOrder).filter(StoreOrder.id == assignment.order_id).first()
    return {
        "id": assignment.id, "order_id": assignment.order_id,
        "store_id": assignment.store_id, "driver_id": assignment.driver_id,
        "driver": _driver_json(driver) if driver else None,
        "state": assignment.state, "notes": assignment.notes,
        "assigned_at": assignment.assigned_at, "dispatched_at": assignment.dispatched_at,
        "delivered_at": assignment.delivered_at,
        "order": serialize_order(db, order) if order else None,
    }


@router.get("/drivers")
def list_drivers(db: Session = Depends(get_db), user: User = Depends(require_store_user)):
    store = current_store(db, user)
    drivers = db.query(DeliveryDriver).filter(DeliveryDriver.store_id == store.id).order_by(DeliveryDriver.id.desc()).all()
    return [_driver_json(d) for d in drivers]


@router.post("/drivers", status_code=201)
def create_driver(data: DriverCreate, db: Session = Depends(get_db), user: User = Depends(require_store_user)):
    store = current_store(db, user)
    name = data.name.strip()
    if len(name) < 2:
        raise HTTPException(400, "El nombre debe tener al menos dos caracteres")
    phone = (data.phone or "").strip() or None
    driver = DeliveryDriver(store_id=store.id, name=name, phone=phone, active=True)
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return _driver_json(driver)


@router.patch("/drivers/{driver_id}/active")
def change_driver_active(driver_id: int, data: DriverActiveUpdate, db: Session = Depends(get_db), user: User = Depends(require_store_user)):
    store = current_store(db, user)
    driver = db.query(DeliveryDriver).filter(DeliveryDriver.id == driver_id, DeliveryDriver.store_id == store.id).first()
    if not driver:
        raise HTTPException(404, "Repartidor no encontrado en esta tienda")
    driver.active = data.active
    db.commit()
    db.refresh(driver)
    return _driver_json(driver)


@router.get("/assignments")
def list_assignments(db: Session = Depends(get_db), user: User = Depends(require_store_user)):
    store = current_store(db, user)
    assignments = db.query(DeliveryAssignment).filter(DeliveryAssignment.store_id == store.id).order_by(DeliveryAssignment.assigned_at.desc(), DeliveryAssignment.id.desc()).all()
    return [_assignment_json(db, a) for a in assignments]


@router.post("/assignments", status_code=201)
def assign_order(data: AssignmentCreate, db: Session = Depends(get_db), user: User = Depends(require_store_user)):
    store = current_store(db, user)
    driver = db.query(DeliveryDriver).filter(DeliveryDriver.id == data.driver_id, DeliveryDriver.store_id == store.id, DeliveryDriver.active.is_(True)).first()
    if not driver:
        raise HTTPException(400, "Selecciona un repartidor activo de tu tienda")
    order = db.query(StoreOrder).filter(StoreOrder.id == data.order_id, StoreOrder.store_id == store.id).with_for_update().first()
    if not order:
        raise HTTPException(404, "Pedido no encontrado en esta tienda")
    if order.status not in {"ready", "dispatched"}:
        raise HTTPException(400, "Solo se asignan pedidos listos o despachados. Prepáralo primero en Pedidos.")
    if db.query(DeliveryAssignment).filter(DeliveryAssignment.order_id == order.id).first():
        raise HTTPException(409, "El pedido ya tiene un repartidor asignado")
    assignment = DeliveryAssignment(order_id=order.id, store_id=store.id, driver_id=driver.id, state="assigned")
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return _assignment_json(db, assignment)


@router.patch("/assignments/{order_id}/state")
def change_delivery_state(order_id: int, data: AssignmentStatusUpdate, db: Session = Depends(get_db), user: User = Depends(require_store_user)):
    store = current_store(db, user)
    assignment = db.query(DeliveryAssignment).filter(DeliveryAssignment.order_id == order_id, DeliveryAssignment.store_id == store.id).with_for_update().first()
    if not assignment:
        raise HTTPException(404, "Entrega no asignada en esta tienda")
    order = db.query(StoreOrder).filter(StoreOrder.id == order_id, StoreOrder.store_id == store.id).with_for_update().first()
    if not order:
        raise HTTPException(404, "Pedido no encontrado")
    if order.status in STORE_FINAL_ORDER_STATUSES or assignment.state == "delivered":
        raise HTTPException(400, "La entrega ya está finalizada y no admite cambios")
    allowed = {
        "assigned": {"dispatched", "incident"},
        "dispatched": {"incident", "delivered"},
        "incident": {"dispatched"},
    }
    if data.state not in allowed.get(assignment.state, set()):
        raise HTTPException(400, "Transición de entrega no permitida")
    notes = (data.notes or "").strip()
    if data.state == "incident" and not notes:
        raise HTTPException(400, "Debes describir la incidencia")
    assignment.state = data.state
    if notes:
        assignment.notes = notes
    now = datetime.utcnow()
    if data.state == "dispatched":
        assignment.dispatched_at = assignment.dispatched_at or now
        if order.status != "dispatched":
            order.status = "dispatched"
            db.add(StoreOrderStatusHistory(order_id=order.id, status="dispatched"))
            create_notification(db=db, user_id=order.user_id, title="Pedido en reparto", message=f"Tu pedido #{order.id} salió a reparto.", category="order", entity_type="order", entity_id=order.id)
    elif data.state == "delivered":
        assignment.delivered_at = now
        order.status = "delivered"
        db.add(StoreOrderStatusHistory(order_id=order.id, status="delivered"))
        create_notification(db=db, user_id=order.user_id, title="Pedido entregado", message=f"El pedido #{order.id} fue marcado como entregado.", category="order", entity_type="order", entity_id=order.id)
    db.commit()
    db.refresh(assignment)
    return _assignment_json(db, assignment)
