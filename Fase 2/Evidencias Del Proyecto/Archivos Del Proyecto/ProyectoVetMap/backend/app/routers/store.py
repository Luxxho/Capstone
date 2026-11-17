from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db, SessionLocal
from ..dependencies import get_current_user
from ..models import (
    User,
    PetStore,
    StoreProduct,
    ProductPriceHistory,
    StoreOrder,
    StoreOrderArchive,
    StoreOrderItem,
    StoreOrderStatusHistory,
    DeliveryAssignment,  # VETMAP V26
)
from ..schemas import StoreProductCreate, StoreProductUpdate, StoreOrderCreate, StoreOrderStatusUpdate
from ..notification_service import (
    create_notification,
    notify_store_users,
)

public_router = APIRouter(prefix="/api/storefront", tags=["storefront"])
manager_router = APIRouter(prefix="/api/store", tags=["store"])
admin_product_router = APIRouter(
    prefix="/api/admin/store-products",
    tags=["admin"],
)


PRODUCT_PRICE_MIN = 1000
PRODUCT_PRICE_MAX = 1_000_000


def validate_product_values(price=None, stock=None):
    if price is not None and (price < PRODUCT_PRICE_MIN or price > PRODUCT_PRICE_MAX):
        raise HTTPException(status_code=400, detail="El precio debe estar entre $1.000 y $1.000.000 CLP")
    if stock is not None and stock < 0:
        raise HTTPException(status_code=400, detail="El stock no puede ser negativo")


class AdminStoreProductCreate(StoreProductCreate):
    store_id: int


class AdminStoreProductUpdate(StoreProductUpdate):
    store_id: int | None = None

def serialize_store(store):
    return {
        "id": store.id,
        "name": store.name,
        "commune": store.commune,
        "address": store.address,
        "latitude": store.latitude,
        "longitude": store.longitude,
        "delivery_conditions": store.delivery_conditions,
    }

def serialize_product(db, product):
    store=db.query(PetStore).filter(PetStore.id==product.store_id).first()
    key="|".join([(product.name or "").strip().lower(),(product.brand or "").strip().lower(),(product.format or "").strip().lower()])
    return {"id":product.id,"store_id":product.store_id,"store_name":store.name if store else "Tienda","store_commune":store.commune if store else None,"delivery_conditions":store.delivery_conditions if store else None,"name":product.name,"brand":product.brand,"category":product.category,"animal_type":product.animal_type,"format":product.format,"description":product.description,"price":product.price,"stock":product.stock,"active":product.active,"comparison_key":key}

STORE_FINAL_ORDER_STATUSES = {
    "delivered",
    "cancelled",
}


# =========================================================
# SEGUIMIENTO AUTOMÁTICO DE PEDIDOS
# =========================================================
#
# Demo académica VetMap:
#   0 h -> pending
#   1 h -> preparing
#   2 h -> ready
#   3 h -> dispatched
#   4 h -> delivered
#
# La regla nunca hace retroceder un pedido. Si la tienda lo avanzó
# manualmente, el sistema respeta ese avance. Cancelled y delivered
# siguen siendo estados finales.
# =========================================================

ORDER_AUTO_FLOW = (
    "pending",
    "preparing",
    "ready",
    "dispatched",
    "delivered",
)

ORDER_AUTO_INDEX = {
    value: index
    for index, value in enumerate(ORDER_AUTO_FLOW)
}

ORDER_AUTO_LABELS = {
    "pending": "Pendiente",
    "preparing": "En preparación",
    "ready": "Listo",
    "dispatched": "Despachado",
    "delivered": "Entregado",
}


def auto_advance_order_status(
    db: Session,
    order: StoreOrder,
):
    if (
        order.status in STORE_FINAL_ORDER_STATUSES
        or not order.created_at
    ):
        return False

    # VETMAP V26: los pedidos asignados requieren confirmación real del reparto.
    if db.query(DeliveryAssignment.id).filter(DeliveryAssignment.order_id == order.id).first():
        return False

    current_index = ORDER_AUTO_INDEX.get(
        order.status
    )

    # Estados ajenos al flujo automático no se fuerzan.
    if current_index is None:
        return False

    elapsed_seconds = max(
        0,
        (
            datetime.utcnow()
            - order.created_at
        ).total_seconds(),
    )

    target_index = min(
        int(elapsed_seconds // 3600),
        len(ORDER_AUTO_FLOW) - 1,
    )

    # Nunca retrocedemos un pedido.
    if target_index <= current_index:
        return False

    # Si el usuario vuelve a abrir VetMap después de varias horas,
    # reconstruimos todos los pasos que debieron ocurrir cada hora.
    for index in range(
        current_index + 1,
        target_index + 1,
    ):
        next_status = ORDER_AUTO_FLOW[index]

        already_exists = (
            db.query(StoreOrderStatusHistory)
            .filter(
                StoreOrderStatusHistory.order_id
                == order.id,
                StoreOrderStatusHistory.status
                == next_status,
            )
            .first()
        )

        if not already_exists:
            db.add(
                StoreOrderStatusHistory(
                    order_id=order.id,
                    status=next_status,
                    changed_at=(
                        order.created_at
                        + timedelta(hours=index)
                    ),
                )
            )

    target_status = ORDER_AUTO_FLOW[
        target_index
    ]

    order.status = target_status

    store = (
        db.query(PetStore)
        .filter(PetStore.id == order.store_id)
        .first()
    )

    create_notification(
        db=db,
        user_id=order.user_id,
        title=(
            f"Pedido "
            f"{ORDER_AUTO_LABELS.get(target_status, target_status)}"
        ),
        message=(
            f"Tu pedido #{order.id}"
            + (
                f" en {store.name}"
                if store
                else ""
            )
            + " actualizó automáticamente su seguimiento."
        ),
        category="order",
        entity_type="order",
        entity_id=order.id,
    )

    return True


def auto_advance_store_orders(
    db: Session,
    orders,
):
    changed = False

    for order in orders:
        if auto_advance_order_status(
            db,
            order,
        ):
            changed = True

    if changed:
        db.commit()

    return changed


def get_store_order_archive(
    db: Session,
    order_id: int,
):
    archive = (
        db.query(StoreOrderArchive)
        .filter(
            StoreOrderArchive.order_id
            == order_id
        )
        .first()
    )

    if archive is None:
        archive = StoreOrderArchive(
            order_id=order_id,
        )
        db.add(archive)
        db.flush()

    return archive


def serialize_order(db, order):
    store = db.query(PetStore).filter(PetStore.id == order.store_id).first()
    user = db.query(User).filter(User.id == order.user_id).first()

    rows = (
        db.query(StoreOrderItem)
        .filter(StoreOrderItem.order_id == order.id)
        .order_by(StoreOrderItem.id.asc())
        .all()
    )

    items = []

    for row in rows:
        product = (
            db.query(StoreProduct)
            .filter(StoreProduct.id == row.product_id)
            .first()
        )

        items.append(
            {
                "id": row.id,
                "product_id": row.product_id,
                "product_name": product.name if product else "Producto",
                "brand": product.brand if product else None,
                "format": product.format if product else None,
                "quantity": row.quantity,
                "unit_price": row.unit_price,
                "subtotal": row.quantity * row.unit_price,
            }
        )

    history_rows = (
        db.query(StoreOrderStatusHistory)
        .filter(StoreOrderStatusHistory.order_id == order.id)
        .order_by(
            StoreOrderStatusHistory.changed_at.asc(),
            StoreOrderStatusHistory.id.asc(),
        )
        .all()
    )

    tracking = [
        {
            "id": row.id,
            "status": row.status,
            "changed_at": row.changed_at,
        }
        for row in history_rows
    ]

    # Compatibilidad con pedidos creados antes de esta mejora.
    # Así ningún pedido antiguo queda sin seguimiento visible.
    if not tracking:
        tracking = [
            {
                "id": None,
                "status": "pending",
                "changed_at": order.created_at,
            }
        ]

        if order.status != "pending":
            tracking.append(
                {
                    "id": None,
                    "status": order.status,
                    "changed_at": order.created_at,
                }
            )

    return {
        "id": order.id,
        "user_id": order.user_id,
        "user_name": user.name if user else "Usuario",
        "user_email": user.email if user else None,
        "store_id": order.store_id,
        "store_name": store.name if store else "Tienda",
        "store_commune": store.commune if store else None,
        "total": order.total,
        "status": order.status,
        "created_at": order.created_at,
        "items": items,
        "tracking": tracking,
    }

def require_store_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "store": raise HTTPException(status_code=403, detail="Sección exclusiva para cuentas de tienda")
    if current_user.store_id is None: raise HTTPException(status_code=403, detail="Tu cuenta aún no está asociada a una tienda")
    return current_user


def require_admin(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador",
        )

    return current_user

def current_store(db, user):
    store=db.query(PetStore).filter(PetStore.id==user.store_id).first()
    if not store: raise HTTPException(status_code=404, detail="Tienda no encontrada")
    return store

def seed_store_data():
    """
    Tiendas demostrativas de VetMap.

    Todos los nombres y direcciones son ficticios.
    Las coordenadas son aproximadas a la comuna indicada.
    """
    db = SessionLocal()

    try:
        data = [
            {
                "name": "Mundo Mascota",
                "commune": "Santiago",
                "address": "Av. VetMap 520 (dirección ficticia)",
                "latitude": -33.4550,
                "longitude": -70.6500,
                "delivery_conditions": "Despacho 24 a 48 horas",
            },
            {
                "name": "PetMarket Norte",
                "commune": "Quilicura",
                "address": "Paseo Peluditos 820 (dirección ficticia)",
                "latitude": -33.3615,
                "longitude": -70.7288,
                "delivery_conditions": "Retiro o despacho coordinado",
            },
            {
                "name": "Animal Shop",
                "commune": "Providencia",
                "address": "Calle Huellitas 214 (dirección ficticia)",
                "latitude": -33.4370,
                "longitude": -70.6105,
                "delivery_conditions": "Despacho sujeto a cobertura",
            },
        ]

        stores = {}

        for store_data in data:
            current = (
                db.query(PetStore)
                .filter(PetStore.name == store_data["name"])
                .first()
            )

            if not current:
                current = PetStore(**store_data)
                db.add(current)
                db.flush()
            else:
                for field, value in store_data.items():
                    if getattr(current, field, None) != value:
                        setattr(current, field, value)

            stores[store_data["name"]] = current

        if db.query(StoreProduct).count() == 0:
            products = [
                ("Mundo Mascota", "Alimento Premium Adulto", "NutriPet", "Alimentos", "Perros", "15 kg", 39990, 12),
                ("PetMarket Norte", "Alimento Premium Adulto", "NutriPet", "Alimentos", "Perros", "15 kg", 37990, 8),
                ("Animal Shop", "Alimento Premium Adulto", "NutriPet", "Alimentos", "Perros", "15 kg", 42990, 16),
                ("Mundo Mascota", "Arena Sanitaria", "MichiClean", "Higiene", "Gatos", "10 kg", 12990, 18),
                ("PetMarket Norte", "Arena Sanitaria", "MichiClean", "Higiene", "Gatos", "10 kg", 11990, 6),
                ("Animal Shop", "Snack Dental", "PetSmile", "Snacks", "Perros", "Pack 7", 6990, 22),
                ("Mundo Mascota", "Shampoo Piel Sensible", "SoftPaw", "Higiene", "Perros y gatos", "500 ml", 8490, 9),
                ("PetMarket Norte", "Arnés Ajustable", "WalkPet", "Accesorios", "Perros", "Talla M", 14990, 4),
            ]

            for (
                store_name,
                name,
                brand,
                category,
                animal,
                fmt,
                price,
                stock,
            ) in products:
                product = StoreProduct(
                    store_id=stores[store_name].id,
                    name=name,
                    brand=brand,
                    category=category,
                    animal_type=animal,
                    format=fmt,
                    description="Producto de demostración VetMap",
                    price=price,
                    stock=stock,
                    active=True,
                )

                db.add(product)
                db.flush()

                db.add(
                    ProductPriceHistory(
                        product_id=product.id,
                        price=price,
                    )
                )

        db.commit()

    finally:
        db.close()


@public_router.get("/stores")
def stores(db: Session=Depends(get_db)):
    return [serialize_store(x) for x in db.query(PetStore).filter(PetStore.active.is_(True)).order_by(PetStore.name).all()]

@public_router.get("/products")
def products(db: Session=Depends(get_db)):
    rows=db.query(StoreProduct).filter(StoreProduct.active.is_(True)).order_by(StoreProduct.name,StoreProduct.price).all()
    return [serialize_product(db,x) for x in rows]

@public_router.get("/orders")
def my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    archived_ids = (
        db.query(StoreOrderArchive.order_id)
        .filter(
            StoreOrderArchive.owner_archived.is_(
                True
            )
        )
    )

    rows = (
        db.query(StoreOrder)
        .filter(
            StoreOrder.user_id == current_user.id,
            ~StoreOrder.id.in_(archived_ids),
        )
        .order_by(
            StoreOrder.created_at.desc()
        )
        .all()
    )

    auto_advance_store_orders(
        db,
        rows,
    )

    return [
        serialize_order(db, item)
        for item in rows
    ]

@public_router.patch(
    "/orders/{order_id}/archive"
)
def owner_archive_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = (
        db.query(StoreOrder)
        .filter(
            StoreOrder.id == order_id,
            StoreOrder.user_id
            == current_user.id,
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado",
        )

    if order.status not in STORE_FINAL_ORDER_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Solo puedes quitar pedidos "
                "entregados o cancelados."
            ),
        )

    archive = get_store_order_archive(
        db,
        order.id,
    )

    archive.owner_archived = True
    db.commit()

    return {
        "ok": True,
        "order_id": order.id,
        "message": (
            "Pedido quitado de tu historial."
        ),
    }


@public_router.patch(
    "/orders/archive-delivered/all"
)
def owner_archive_all_delivered_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delivered_orders = (
        db.query(StoreOrder)
        .filter(
            StoreOrder.user_id
            == current_user.id,
            StoreOrder.status == "delivered",
        )
        .all()
    )

    archived = 0

    for order in delivered_orders:
        archive = get_store_order_archive(
            db,
            order.id,
        )

        if not archive.owner_archived:
            archive.owner_archived = True
            archived += 1

    db.commit()

    return {
        "ok": True,
        "archived": archived,
        "message": (
            f"{archived} pedido(s) entregado(s) "
            "quitado(s) del historial."
        ),
    }


@public_router.post("/orders", status_code=201)
def create_order(data: StoreOrderCreate, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    if current_user.role not in {"owner","admin"}: raise HTTPException(status_code=403, detail="Solo usuarios pueden comprar")
    if not data.items: raise HTTPException(status_code=400, detail="Carrito vacío")
    store=db.query(PetStore).filter(PetStore.id==data.store_id,PetStore.active.is_(True)).first()
    if not store: raise HTTPException(status_code=404, detail="Tienda no encontrada")
    total=0; validated=[]
    for item in data.items:
        p=db.query(StoreProduct).filter(StoreProduct.id==item.product_id,StoreProduct.store_id==store.id,StoreProduct.active.is_(True)).first()
        if not p: raise HTTPException(status_code=400, detail="Producto no pertenece a la tienda")
        if item.quantity<=0 or p.stock<item.quantity: raise HTTPException(status_code=400, detail=f"Stock insuficiente para {p.name}")
        total += p.price*item.quantity; validated.append((p,item.quantity))
    order=StoreOrder(
        user_id=current_user.id,
        store_id=store.id,
        total=total,
        status="pending"
    )
    db.add(order)
    db.flush()

    db.add(
        StoreOrderStatusHistory(
            order_id=order.id,
            status="pending"
        )
    )

    for p,q in validated:
        db.add(StoreOrderItem(order_id=order.id,product_id=p.id,quantity=q,unit_price=p.price)); p.stock-=q

    create_notification(
        db=db,
        user_id=current_user.id,
        title="Pedido registrado",
        message=f"Tu pedido #{order.id} en {store.name} fue registrado.",
        category="order",
        entity_type="order",
        entity_id=order.id,
    )

    notify_store_users(
        db=db,
        store_id=store.id,
        title="Nuevo pedido recibido",
        message=(
            f"Recibiste el pedido #{order.id} por "
            f"${total:,}.".replace(",", ".")
        ),
        category="order",
        entity_type="order",
        entity_id=order.id,
    )

    db.commit()
    db.refresh(order)

    return serialize_order(db,order)


@public_router.post("/orders/batch", status_code=201)
def create_orders_batch(
    data: list[StoreOrderCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Confirma un carrito que puede contener productos de varias tiendas.
    VetMap crea un pedido independiente por tienda, para que cada
    establecimiento siga viendo solamente sus propios pedidos.
    """
    if current_user.role not in {"owner", "admin"}:
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios pueden comprar",
        )

    if not data:
        raise HTTPException(
            status_code=400,
            detail="Carrito vacío",
        )

    prepared_groups = []

    # Primero validamos TODO el carrito.
    # Recién después se descuenta stock, así evitamos confirmar
    # parcialmente un carrito multi-tienda por una validación normal.
    for group in data:
        if not group.items:
            raise HTTPException(
                status_code=400,
                detail="Uno de los pedidos no contiene productos",
            )

        store = (
            db.query(PetStore)
            .filter(
                PetStore.id == group.store_id,
                PetStore.active.is_(True),
            )
            .first()
        )

        if not store:
            raise HTTPException(
                status_code=404,
                detail="Una de las tiendas no fue encontrada",
            )

        total = 0
        validated_items = []

        for item in group.items:
            product = (
                db.query(StoreProduct)
                .filter(
                    StoreProduct.id == item.product_id,
                    StoreProduct.store_id == store.id,
                    StoreProduct.active.is_(True),
                )
                .first()
            )

            if not product:
                raise HTTPException(
                    status_code=400,
                    detail="Uno de los productos no pertenece a la tienda indicada",
                )

            if item.quantity <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Cantidad de producto no válida",
                )

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para {product.name}",
                )

            total += product.price * item.quantity
            validated_items.append(
                (product, item.quantity)
            )

        prepared_groups.append(
            (store, total, validated_items)
        )

    created_orders = []

    for store, total, validated_items in prepared_groups:
        order = StoreOrder(
            user_id=current_user.id,
            store_id=store.id,
            total=total,
            status="pending",
        )

        db.add(order)
        db.flush()

        db.add(
            StoreOrderStatusHistory(
                order_id=order.id,
                status="pending",
            )
        )

        for product, quantity in validated_items:
            db.add(
                StoreOrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=product.price,
                )
            )

            product.stock -= quantity

        created_orders.append(order)

        create_notification(
            db=db,
            user_id=current_user.id,
            title="Pedido registrado",
            message=(
                f"Tu pedido #{order.id} en {store.name} "
                "fue registrado."
            ),
            category="order",
            entity_type="order",
            entity_id=order.id,
        )

        notify_store_users(
            db=db,
            store_id=store.id,
            title="Nuevo pedido recibido",
            message=(
                f"Recibiste el pedido #{order.id} por "
                f"${total:,}.".replace(",", ".")
            ),
            category="order",
            entity_type="order",
            entity_id=order.id,
        )

    db.commit()

    for order in created_orders:
        db.refresh(order)

    return [
        serialize_order(db, order)
        for order in created_orders
    ]


@manager_router.get("/dashboard")
def dashboard(db: Session=Depends(get_db), current_user: User=Depends(require_store_user)):
    store=current_store(db,current_user)
    products=db.query(StoreProduct).filter(StoreProduct.store_id==store.id).all()
    archived_ids = (
        db.query(StoreOrderArchive.order_id)
        .filter(
            StoreOrderArchive.store_archived.is_(
                True
            )
        )
    )

    orders = (
        db.query(StoreOrder)
        .filter(
            StoreOrder.store_id == store.id,
            ~StoreOrder.id.in_(archived_ids),
        )
        .all()
    )
    auto_advance_store_orders(
        db,
        orders,
    )

    return {"store":serialize_store(store),"stats":{"products":len([x for x in products if x.active]),"low_stock":len([x for x in products if x.active and x.stock<=5]),"pending_orders":len([x for x in orders if x.status in {"pending","preparing"}]),"orders":len(orders)},"recent_orders":[serialize_order(db,x) for x in sorted(orders,key=lambda o:o.created_at,reverse=True)[:5]]}

@manager_router.get("/products")
def manager_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_store_user),
):
    store = current_store(db, current_user)

    rows = (
        db.query(StoreProduct)
        .filter(
            StoreProduct.store_id == store.id,
            StoreProduct.active.is_(True),
        )
        .order_by(StoreProduct.name.asc())
        .all()
    )

    return [
        serialize_product(db, product)
        for product in rows
    ]

@manager_router.post("/products", status_code=201)
def create_product(data: StoreProductCreate, db: Session=Depends(get_db), current_user: User=Depends(require_store_user)):
    store=current_store(db,current_user)
    validate_product_values(price=data.price, stock=data.stock)
    p=StoreProduct(store_id=store.id,**data.model_dump()); db.add(p); db.flush(); db.add(ProductPriceHistory(product_id=p.id,price=p.price)); db.commit(); db.refresh(p); return serialize_product(db,p)

@manager_router.put("/products/{product_id}")
def update_product(product_id:int,data:StoreProductUpdate,db:Session=Depends(get_db),current_user:User=Depends(require_store_user)):
    store=current_store(db,current_user); p=db.query(StoreProduct).filter(StoreProduct.id==product_id,StoreProduct.store_id==store.id).first()
    if not p: raise HTTPException(status_code=404,detail="Producto no encontrado")
    payload=data.model_dump(exclude_unset=True)
    validate_product_values(price=payload.get("price"), stock=payload.get("stock"))
    old=p.price
    for k,v in payload.items(): setattr(p,k,v)
    if p.price!=old: db.add(ProductPriceHistory(product_id=p.id,price=p.price))
    db.commit(); db.refresh(p); return serialize_product(db,p)

@manager_router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_store_user),
):
    store = current_store(db, current_user)

    product = (
        db.query(StoreProduct)
        .filter(
            StoreProduct.id == product_id,
            StoreProduct.store_id == store.id,
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado",
        )

    # Se elimina del catálogo sin borrar registros de pedidos anteriores.
    product.active = False

    db.commit()

    return {
        "message": "Producto eliminado del catálogo"
    }



# =========================================================
# ADMINISTRADOR - PRODUCTOS DE TODAS LAS TIENDAS
# =========================================================

@admin_product_router.get("")
def admin_list_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    rows = (
        db.query(StoreProduct)
        .filter(StoreProduct.active.is_(True))
        .order_by(
            StoreProduct.store_id.asc(),
            StoreProduct.name.asc(),
        )
        .all()
    )

    return [
        serialize_product(db, product)
        for product in rows
    ]


@admin_product_router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
def admin_create_product(
    data: AdminStoreProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    store = (
        db.query(PetStore)
        .filter(
            PetStore.id == data.store_id,
            PetStore.active.is_(True),
        )
        .first()
    )

    if not store:
        raise HTTPException(
            status_code=404,
            detail="Tienda no encontrada",
        )

    validate_product_values(price=data.price, stock=data.stock)

    payload = data.model_dump(
        exclude={"store_id"}
    )

    product = StoreProduct(
        store_id=store.id,
        **payload,
    )

    db.add(product)
    db.flush()

    db.add(
        ProductPriceHistory(
            product_id=product.id,
            price=product.price,
        )
    )

    db.commit()
    db.refresh(product)

    return serialize_product(db, product)


@admin_product_router.put("/{product_id}")
def admin_update_product(
    product_id: int,
    data: AdminStoreProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    product = (
        db.query(StoreProduct)
        .filter(StoreProduct.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado",
        )

    payload = data.model_dump(
        exclude_unset=True
    )

    if "store_id" in payload:
        new_store_id = payload.pop("store_id")

        if new_store_id is not None:
            store = (
                db.query(PetStore)
                .filter(
                    PetStore.id == new_store_id,
                    PetStore.active.is_(True),
                )
                .first()
            )

            if not store:
                raise HTTPException(
                    status_code=404,
                    detail="Tienda no encontrada",
                )

            product.store_id = store.id

    validate_product_values(price=payload.get("price"), stock=payload.get("stock"))

    old_price = product.price

    for field, value in payload.items():
        setattr(product, field, value)

    if product.price != old_price:
        db.add(
            ProductPriceHistory(
                product_id=product.id,
                price=product.price,
            )
        )

    db.commit()
    db.refresh(product)

    return serialize_product(db, product)


@admin_product_router.delete("/{product_id}")
def admin_delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    product = (
        db.query(StoreProduct)
        .filter(StoreProduct.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado",
        )

    # Soft delete: desaparece del catálogo y panel,
    # pero mantiene la integridad de pedidos antiguos.
    product.active = False

    db.commit()

    return {
        "message": "Producto eliminado del catálogo"
    }


@manager_router.get("/orders")
def manager_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_store_user),
):
    store = current_store(
        db,
        current_user,
    )

    archived_ids = (
        db.query(StoreOrderArchive.order_id)
        .filter(
            StoreOrderArchive.store_archived.is_(
                True
            )
        )
    )

    rows = (
        db.query(StoreOrder)
        .filter(
            StoreOrder.store_id == store.id,
            ~StoreOrder.id.in_(archived_ids),
        )
        .order_by(
            StoreOrder.created_at.desc()
        )
        .all()
    )

    auto_advance_store_orders(
        db,
        rows,
    )

    return [
        serialize_order(db, item)
        for item in rows
    ]

@manager_router.patch(
    "/orders/{order_id}/archive"
)
def manager_archive_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_store_user),
):
    current = current_store(
        db,
        current_user,
    )

    order = (
        db.query(StoreOrder)
        .filter(
            StoreOrder.id == order_id,
            StoreOrder.store_id
            == current.id,
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado",
        )

    if order.status not in STORE_FINAL_ORDER_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Solo puedes quitar pedidos "
                "entregados o cancelados."
            ),
        )

    archive = get_store_order_archive(
        db,
        order.id,
    )

    archive.store_archived = True
    db.commit()

    return {
        "ok": True,
        "order_id": order.id,
        "message": (
            "Pedido quitado del historial "
            "de la tienda."
        ),
    }


@manager_router.patch(
    "/orders/archive-finalized/all"
)
def manager_archive_final_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_store_user),
):
    current = current_store(
        db,
        current_user,
    )

    orders = (
        db.query(StoreOrder)
        .filter(
            StoreOrder.store_id == current.id,
            StoreOrder.status.in_(
                STORE_FINAL_ORDER_STATUSES
            ),
        )
        .all()
    )

    archived = 0

    for order in orders:
        archive = get_store_order_archive(
            db,
            order.id,
        )

        if not archive.store_archived:
            archive.store_archived = True
            archived += 1

    db.commit()

    return {
        "ok": True,
        "archived": archived,
        "message": (
            f"{archived} pedido(s) finalizado(s) "
            "quitado(s) del historial."
        ),
    }


@manager_router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    data: StoreOrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_store_user),
):
    store = current_store(db, current_user)

    allowed = {
        "pending",
        "preparing",
        "ready",
        "dispatched",
        "delivered",
        "cancelled",
    }

    if data.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Estado no válido"
        )

    order = (
        db.query(StoreOrder)
        .filter(
            StoreOrder.id == order_id,
            StoreOrder.store_id == store.id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )

    # VETMAP V26: entregas asignadas se finalizan desde Repartidores.
    if db.query(DeliveryAssignment.id).filter(DeliveryAssignment.order_id == order.id).first():
        raise HTTPException(400, 'Gestiona este pedido desde Repartidores; ya tiene un despacho asignado.')

    if order.status in STORE_FINAL_ORDER_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Este pedido tiene un estado final "
                "y ya no puede modificarse."
            ),
        )

    if order.status != data.status:
        order.status = data.status

        db.add(
            StoreOrderStatusHistory(
                order_id=order.id,
                status=data.status
            )
        )

        labels = {
            "pending": "Pendiente",
            "preparing": "En preparación",
            "ready": "Listo",
            "dispatched": "Despachado",
            "delivered": "Entregado",
            "cancelled": "Cancelado",
        }

        create_notification(
            db=db,
            user_id=order.user_id,
            title=f"Pedido {labels.get(data.status, data.status)}",
            message=(
                f"Tu pedido #{order.id} en {store.name} "
                f"cambió a {labels.get(data.status, data.status)}."
            ),
            category="order",
            entity_type="order",
            entity_id=order.id,
        )

    db.commit()
    db.refresh(order)

    return serialize_order(db, order)

