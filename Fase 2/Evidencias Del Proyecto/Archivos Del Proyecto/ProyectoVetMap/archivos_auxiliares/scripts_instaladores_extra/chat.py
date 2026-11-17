"""VetMap V27: chat persistente con autorización por rol.

Conversaciones owner/store, owner/vet y owner/driver (por pedido asignado).
Mensajería con refresco periódico; ETA manual, no GPS en vivo.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import User, PetStore, VeterinaryClinic, StoreOrder, DeliveryDriver, DeliveryAssignment, ChatConversation, ChatMessage
from ..security import hash_password
from ..notification_service import create_notification

router = APIRouter(prefix='/api/chat', tags=['chat'])

class NewChat(BaseModel):
    kind: str
    target_id: int | None = None
    order_id: int | None = None

class NewMessage(BaseModel):
    body: str = Field(min_length=1, max_length=1000)
    eta_minutes: int | None = Field(default=None, ge=1, le=1440)

class DriverAccount(BaseModel):
    email: str = Field(min_length=5, max_length=180)
    password: str = Field(min_length=8, max_length=128)


def related_user_ids(db: Session, conversation: ChatConversation):
    """Deriva receptores del registro real, nunca de IDs enviados por cliente."""
    ids = {conversation.owner_id}
    if conversation.kind == 'store':
        people = db.query(User.id).filter(User.role=='store', User.store_id==conversation.target_id).all()
    elif conversation.kind == 'vet':
        people = db.query(User.id).filter(User.role=='vet', User.veterinary_id==conversation.target_id).all()
    elif conversation.kind == 'delivery':
        a = db.query(DeliveryAssignment).filter(DeliveryAssignment.order_id==conversation.order_id).first()
        if not a:
            return ids
        people = db.query(User.id).filter(User.role=='driver', User.delivery_driver_id==a.driver_id).all()
    else:
        people = []
    ids.update(p[0] for p in people)
    return ids


def authorize(db: Session, c: ChatConversation, user: User):
    if user.id not in related_user_ids(db, c):
        raise HTTPException(403, 'No tienes acceso a esta conversación')


def label(db: Session, c: ChatConversation, user: User):
    owner = db.get(User, c.owner_id)
    if user.id != c.owner_id:
        return owner.name if owner else 'Cliente'
    if c.kind == 'store':
        entity=db.get(PetStore, c.target_id)
        return entity.name if entity else 'Tienda'
    if c.kind == 'vet':
        entity=db.get(VeterinaryClinic, c.target_id)
        return entity.name if entity else 'Veterinaria'
    a=db.query(DeliveryAssignment).filter(DeliveryAssignment.order_id==c.order_id).first()
    d=db.get(DeliveryDriver, a.driver_id) if a else None
    return (d.name if d else 'Repartidor') + f' · Pedido #{c.order_id}'


def info(db: Session, c: ChatConversation, user: User):
    last = db.query(ChatMessage).filter(ChatMessage.conversation_id==c.id).order_by(ChatMessage.id.desc()).first()
    return {'id':c.id,'kind':c.kind,'owner_id':c.owner_id,'order_id':c.order_id,'target_id':c.target_id,
            'title':label(db,c,user),'updated_at':c.updated_at,
            'last_message':last.body if last else None,'last_eta_minutes':last.eta_minutes if last else None}

@router.get('/conversations')
def list_chats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role not in {'owner','vet','store','driver'}:
        return []
    conditions = [ChatConversation.owner_id == user.id]
    if user.role == 'store' and user.store_id:
        conditions.append(and_(ChatConversation.kind=='store',ChatConversation.target_id==user.store_id))
    if user.role == 'vet' and user.veterinary_id:
        conditions.append(and_(ChatConversation.kind=='vet',ChatConversation.target_id==user.veterinary_id))
    if user.role == 'driver' and user.delivery_driver_id:
        order_ids = db.query(DeliveryAssignment.order_id).filter(DeliveryAssignment.driver_id==user.delivery_driver_id)
        conditions.append(and_(ChatConversation.kind=='delivery',ChatConversation.order_id.in_(order_ids)))
    chats=db.query(ChatConversation).filter(or_(*conditions)).order_by(ChatConversation.updated_at.desc(),ChatConversation.id.desc()).limit(200).all()
    return [info(db,c,user) for c in chats]

@router.post('/conversations')
def start_chat(data:NewChat,db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    if user.role!='owner':
        raise HTTPException(403,'Solo el cliente puede iniciar una conversación')
    if data.kind not in {'store','vet','delivery'}:
        raise HTTPException(400,'Tipo de chat no válido')
    if data.kind == 'store':
        if not data.target_id or not db.get(PetStore,data.target_id):
            raise HTTPException(404,'Tienda no encontrada')
        key={'kind':'store','owner_id':user.id,'target_id':data.target_id,'order_id':None}
    elif data.kind == 'vet':
        if not data.target_id or not db.get(VeterinaryClinic,data.target_id):
            raise HTTPException(404,'Veterinaria no encontrada')
        key={'kind':'vet','owner_id':user.id,'target_id':data.target_id,'order_id':None}
    else:
        order=db.get(StoreOrder,data.order_id) if data.order_id else None
        if not order or order.user_id != user.id:
            raise HTTPException(404,'Pedido no encontrado')
        a=db.query(DeliveryAssignment).filter(DeliveryAssignment.order_id==order.id).first()
        if not a:
            raise HTTPException(400,'Tu pedido todavía no tiene repartidor asignado')
        key={'kind':'delivery','owner_id':user.id,'target_id':None,'order_id':order.id}
    c=db.query(ChatConversation).filter_by(**key).first()
    if c is None:
        c=ChatConversation(**key)
        db.add(c)
        db.commit()
        db.refresh(c)
    return info(db,c,user)

@router.get('/conversations/{chat_id}/messages')
def get_messages(chat_id:int,db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    c=db.get(ChatConversation,chat_id)
    if not c:raise HTTPException(404,'Conversación no encontrada')
    authorize(db,c,user)
    messages=db.query(ChatMessage).filter(ChatMessage.conversation_id==c.id).order_by(ChatMessage.id.desc()).limit(200).all()
    messages.reverse()
    return [{'id':m.id,'sender_id':m.sender_id,'body':m.body,'eta_minutes':m.eta_minutes,'created_at':m.created_at} for m in messages]

@router.post('/conversations/{chat_id}/messages')
def send_message(chat_id:int,data:NewMessage,db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    c=db.get(ChatConversation,chat_id)
    if not c:raise HTTPException(404,'Conversación no encontrada')
    authorize(db,c,user)
    body=data.body.strip()
    if not body:raise HTTPException(400,'El mensaje está vacío')
    if data.eta_minutes is not None and not (c.kind=='delivery' and user.role=='driver'):
        raise HTTPException(403,'Solo el repartidor asignado puede informar una ETA')
    m=ChatMessage(conversation_id=c.id,sender_id=user.id,body=body,eta_minutes=data.eta_minutes)
    db.add(m)
    c.updated_at=datetime.utcnow()
    others=related_user_ids(db,c)-{user.id}
    for uid in others:
        create_notification(db,uid,'Nuevo mensaje de VetMap',body[:130],category='info',entity_type='chat',entity_id=c.id)
    db.commit()
    db.refresh(m)
    return {'id':m.id,'sender_id':m.sender_id,'body':m.body,'eta_minutes':m.eta_minutes,'created_at':m.created_at}

@router.get('/drivers/unlinked')
def available_drivers(db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    if user.role!='store' or not user.store_id:
        raise HTTPException(403,'Solo tiendas')
    drivers=db.query(DeliveryDriver).filter(DeliveryDriver.store_id==user.store_id).all()
    linked={x[0] for x in db.query(User.delivery_driver_id).filter(User.delivery_driver_id.isnot(None)).all()}
    return [{'id':d.id,'name':d.name} for d in drivers if d.id not in linked]

@router.post('/drivers/{driver_id}/account')
def create_driver_account(driver_id:int,data:DriverAccount,db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    if user.role!='store' or not user.store_id:
        raise HTTPException(403,'Solo tiendas')
    d=db.query(DeliveryDriver).filter(DeliveryDriver.id==driver_id,DeliveryDriver.store_id==user.store_id).first()
    if not d:raise HTTPException(404,'Repartidor no encontrado en tu tienda')
    if db.query(User.id).filter(User.delivery_driver_id==d.id).first():
        raise HTTPException(409,'Repartidor ya tiene cuenta')
    email=data.email.strip().lower()
    if '@' not in email or db.query(User.id).filter(User.email==email).first():
        raise HTTPException(409,'Correo no válido o ya registrado')
    acc=User(name=d.name,email=email,password_hash=hash_password(data.password),role='driver',delivery_driver_id=d.id)
    db.add(acc)
    db.commit()
    return {'id':acc.id,'email':acc.email,'name':acc.name,'role':acc.role}
