from datetime import datetime
from decimal import Decimal, InvalidOperation
from uuid import uuid4
import json

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..dependencies import get_current_user
from ..models import (
    PaymentCheckout,
    PetStore,
    StoreOrder,
    StoreOrderItem,
    StoreOrderStatusHistory,
    StoreProduct,
    User,
)
from ..schemas import StoreOrderCreate
from ..notification_service import (
    create_notification,
    notify_store_users,
)


router = APIRouter(
    prefix="/api/payments",
    tags=["payments"],
)

MERCADOPAGO_ORDERS_URL = "https://api.mercadopago.com/v1/orders"
MERCADOPAGO_PREFERENCES_URL = "https://api.mercadopago.com/checkout/preferences"
MERCADOPAGO_PAYMENTS_SEARCH_URL = "https://api.mercadopago.com/v1/payments/search"
PREFERENCE_PREFIX = "PREF:"


def mp_headers(idempotency_key: str | None = None):
    if not settings.mercadopago_access_token:
        raise HTTPException(
            status_code=500,
            detail="Falta MERCADOPAGO_ACCESS_TOKEN en backend/.env",
        )

    headers = {
        "Authorization": f"Bearer {settings.mercadopago_access_token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    if idempotency_key:
        headers["X-Idempotency-Key"] = idempotency_key

    return headers


def full_mp_error(response: httpx.Response) -> str:
    request_id = (
        response.headers.get("x-request-id")
        or response.headers.get("x-correlation-id")
        or ""
    )

    try:
        body = response.json()
        body_text = json.dumps(
            body,
            ensure_ascii=False,
            indent=2,
        )
    except Exception:
        body_text = response.text or "(respuesta vacía)"

    result = (
        f"Mercado Pago HTTP {response.status_code}\n"
        f"Respuesta completa:\n{body_text}"
    )

    if request_id:
        result += f"\nRequest ID: {request_id}"

    return result


def amount_to_int(value) -> int | None:
    if value is None:
        return None

    try:
        return int(Decimal(str(value)))
    except (InvalidOperation, ValueError, TypeError):
        return None


def get_mp_order(order_id: str):
    try:
        response = httpx.get(
            f"{MERCADOPAGO_ORDERS_URL}/{order_id}",
            headers=mp_headers(),
            timeout=30.0,
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"No fue posible consultar Mercado Pago: {exc}",
        ) from exc

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=full_mp_error(response),
        )

    return response.json()



def create_mp_preference(
    items_mp: list[dict],
    external_reference: str,
    payer_email: str | None = None,
):
    """
    Fallback compatible con Checkout Pro clásico.

    Se usa únicamente si Orders API no puede crear el checkout.
    Mercado Pago devuelve init_point, que se abre igual desde la app.
    """
    preference_items = []

    for item in items_mp:
        preference_items.append(
            {
                "title": item["title"],
                "quantity": int(item["quantity"]),
                "unit_price": int(
                    Decimal(str(item["unit_price"]))
                ),
                "currency_id": "CLP",
            }
        )

    payload = {
        "items": preference_items,
        "external_reference": external_reference,
    }

    if payer_email:
        payload["payer"] = {
            "email": payer_email,
        }

    try:
        response = httpx.post(
            MERCADOPAGO_PREFERENCES_URL,
            json=payload,
            headers=mp_headers(),
            timeout=30.0,
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "No fue posible conectar con Mercado Pago "
                f"para crear la preferencia: {exc}"
            ),
        ) from exc

    if response.status_code not in {200, 201}:
        raise HTTPException(
            status_code=502,
            detail=full_mp_error(response),
        )

    result = response.json()

    preference_id = result.get("id")
    checkout_url = (
        result.get("init_point")
        or result.get("sandbox_init_point")
    )

    if not preference_id or not checkout_url:
        raise HTTPException(
            status_code=502,
            detail=(
                "Mercado Pago creó la preferencia, pero no "
                "devolvió ID o URL de checkout."
            ),
        )

    return {
        "id": f"{PREFERENCE_PREFIX}{preference_id}",
        "checkout_url": checkout_url,
        "status": "created",
        "status_detail": "preference_checkout",
        "provider": "preferences",
    }


def get_mp_payment_by_reference(
    external_reference: str,
    expected_total: int | None = None,
):
    """
    Para checkouts creados por Preferences API, consulta el pago real
    usando external_reference y lo normaliza al formato que ya utiliza
    finalize_checkout().
    """
    try:
        response = httpx.get(
            MERCADOPAGO_PAYMENTS_SEARCH_URL,
            headers=mp_headers(),
            params={
                "external_reference": external_reference,
                "limit": 20,
            },
            timeout=30.0,
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "No fue posible consultar el pago de Mercado Pago: "
                f"{exc}"
            ),
        ) from exc

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=full_mp_error(response),
        )

    results = response.json().get("results") or []

    if not results:
        return {
            "id": None,
            "status": "pending",
            "status_detail": "waiting_payment",
            "external_reference": external_reference,
            "total_amount": expected_total,
            "total_paid_amount": None,
        }

    # Priorizamos un pago aprobado. Si todavía no existe, usamos
    # el resultado más reciente para informar pending/rejected/etc.
    payment = next(
        (
            item
            for item in results
            if item.get("status") == "approved"
        ),
        results[0],
    )

    payment_status = payment.get("status")
    payment_detail = payment.get("status_detail")

    if payment_status == "approved":
        normalized_status = "processed"
        normalized_detail = "accredited"
    elif payment_status in {
        "rejected",
        "cancelled",
        "canceled",
        "refunded",
        "charged_back",
    }:
        normalized_status = payment_status
        normalized_detail = payment_detail
    else:
        normalized_status = payment_status or "pending"
        normalized_detail = payment_detail or "waiting_payment"

    amount = (
        payment.get("transaction_amount")
        or payment.get("transaction_details", {}).get(
            "total_paid_amount"
        )
    )

    return {
        "id": payment.get("id"),
        "status": normalized_status,
        "status_detail": normalized_detail,
        "external_reference": (
            payment.get("external_reference")
            or external_reference
        ),
        "total_amount": amount,
        "total_paid_amount": amount,
    }


def get_mp_checkout_result(
    checkout: PaymentCheckout,
):
    if checkout.mp_order_id.startswith(
        PREFERENCE_PREFIX
    ):
        return get_mp_payment_by_reference(
            checkout.external_reference,
            checkout.total,
        )

    return get_mp_order(
        checkout.mp_order_id
    )


def prepare_cart(
    data: list[StoreOrderCreate],
    db: Session,
):
    """
    Valida el carrito y devuelve dos representaciones:

    - items_mp: productos que se enviarán a Mercado Pago.
    - cart_snapshot: copia del carrito con precios congelados para crear
      los pedidos internos una vez que el pago sea acreditado.
    """
    if not data:
        raise HTTPException(
            status_code=400,
            detail="El carrito está vacío.",
        )

    items_mp = []
    cart_snapshot = []
    total = 0

    for group in data:
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
                detail="Una de las tiendas no existe o está inactiva.",
            )

        snapshot_group = {
            "store_id": store.id,
            "items": [],
        }

        for item in group.items:
            if item.quantity <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Cantidad inválida.",
                )

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
                    status_code=404,
                    detail="Uno de los productos no está disponible.",
                )

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para {product.name}.",
                )

            quantity = int(item.quantity)
            unit_price = int(product.price)
            subtotal = unit_price * quantity

            total += subtotal

            # Orders API de Checkout Pro:
            # no incluir unit_measure ni total_amount por item.
            items_mp.append(
                {
                    "title": product.name,
                    "unit_price": str(unit_price),
                    "quantity": quantity,
                }
            )

            snapshot_group["items"].append(
                {
                    "product_id": product.id,
                    "quantity": quantity,
                    "unit_price": unit_price,
                }
            )

        cart_snapshot.append(snapshot_group)

    if total <= 0:
        raise HTTPException(
            status_code=400,
            detail="El total de la compra no es válido.",
        )

    return items_mp, cart_snapshot, total


def finalize_checkout(
    checkout: PaymentCheckout,
    mp_order: dict,
    db: Session,
):
    """
    Si Mercado Pago confirma processed + accredited, crea los pedidos
    definitivos de VetMap. Es idempotente: un mismo checkout no puede
    crear los pedidos dos veces.
    """

    mp_status = mp_order.get("status")
    mp_status_detail = mp_order.get("status_detail")

    checkout.status = mp_status or checkout.status
    checkout.status_detail = mp_status_detail

    approved = (
        mp_status == "processed"
        and mp_status_detail == "accredited"
    )

    if not approved:
        db.commit()

        return {
            "finalized": False,
            "status": mp_status,
            "status_detail": mp_status_detail,
            "order_ids": [],
        }

    if checkout.finalized:
        try:
            order_ids = json.loads(
                checkout.internal_order_ids_json or "[]"
            )
        except Exception:
            order_ids = []

        db.commit()

        return {
            "finalized": True,
            "status": mp_status,
            "status_detail": mp_status_detail,
            "order_ids": order_ids,
        }

    mp_external_reference = mp_order.get("external_reference")

    if (
        mp_external_reference
        and mp_external_reference != checkout.external_reference
    ):
        raise HTTPException(
            status_code=409,
            detail="La referencia del pago no coincide con la compra de VetMap.",
        )

    paid_amount = amount_to_int(
        mp_order.get("total_paid_amount")
        or mp_order.get("total_amount")
    )

    if paid_amount is None or paid_amount != checkout.total:
        raise HTTPException(
            status_code=409,
            detail=(
                "El monto acreditado por Mercado Pago no coincide "
                "con el total de VetMap."
            ),
        )

    try:
        cart_snapshot = json.loads(checkout.cart_json)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="No se pudo recuperar el carrito asociado al pago.",
        ) from exc

    prepared_groups = []

    # Validamos todo antes de crear pedidos y descontar stock.
    for group in cart_snapshot:
        store_id = int(group["store_id"])

        store = (
            db.query(PetStore)
            .filter(
                PetStore.id == store_id,
                PetStore.active.is_(True),
            )
            .first()
        )

        if not store:
            raise HTTPException(
                status_code=409,
                detail=(
                    "El pago fue acreditado, pero una tienda "
                    "ya no está disponible."
                ),
            )

        group_total = 0
        validated_items = []

        for item in group.get("items", []):
            product_id = int(item["product_id"])
            quantity = int(item["quantity"])
            unit_price = int(item["unit_price"])

            product = (
                db.query(StoreProduct)
                .filter(
                    StoreProduct.id == product_id,
                    StoreProduct.store_id == store.id,
                    StoreProduct.active.is_(True),
                )
                .first()
            )

            if not product:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "El pago fue acreditado, pero uno de los "
                        "productos ya no está disponible."
                    ),
                )

            if product.stock < quantity:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "El pago fue acreditado, pero el stock cambió "
                        f"para {product.name}."
                    ),
                )

            group_total += unit_price * quantity

            validated_items.append(
                {
                    "product": product,
                    "quantity": quantity,
                    "unit_price": unit_price,
                }
            )

        prepared_groups.append(
            {
                "store": store,
                "total": group_total,
                "items": validated_items,
            }
        )

    calculated_total = sum(
        group["total"]
        for group in prepared_groups
    )

    if calculated_total != checkout.total:
        raise HTTPException(
            status_code=409,
            detail=(
                "El carrito guardado no coincide con el monto "
                "acreditado por Mercado Pago."
            ),
        )

    created_orders = []

    for group in prepared_groups:
        order = StoreOrder(
            user_id=checkout.user_id,
            store_id=group["store"].id,
            total=group["total"],
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

        for item in group["items"]:
            db.add(
                StoreOrderItem(
                    order_id=order.id,
                    product_id=item["product"].id,
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                )
            )

            item["product"].stock -= item["quantity"]

        created_orders.append(order)

        create_notification(
            db=db,
            user_id=checkout.user_id,
            title="Pago aprobado",
            message=(
                f"Tu pedido #{order.id} en {group['store'].name} "
                "fue registrado correctamente."
            ),
            category="payment",
            entity_type="order",
            entity_id=order.id,
        )

        notify_store_users(
            db=db,
            store_id=group["store"].id,
            title="Nuevo pedido recibido",
            message=(
                f"Recibiste el pedido #{order.id} por "
                f"${group['total']:,}.".replace(",", ".")
            ),
            category="order",
            entity_type="order",
            entity_id=order.id,
        )

    order_ids = [order.id for order in created_orders]

    checkout.finalized = True
    checkout.finalized_at = datetime.utcnow()
    checkout.internal_order_ids_json = json.dumps(order_ids)

    db.commit()

    return {
        "finalized": True,
        "status": mp_status,
        "status_detail": mp_status_detail,
        "order_ids": order_ids,
    }


@router.post(
    "/mercadopago/order",
    status_code=status.HTTP_201_CREATED,
)
def create_mercadopago_order(
    data: list[StoreOrderCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in {"owner", "admin"}:
        raise HTTPException(
            status_code=403,
            detail="Esta cuenta no puede realizar compras.",
        )

    items_mp, cart_snapshot, total = prepare_cart(
        data,
        db,
    )

    external_reference = (
        f"vetmap-{current_user.id}-{uuid4().hex[:16]}"
    )

    payer_email = getattr(
        settings,
        "mercadopago_test_payer_email",
        None,
    )

    orders_payload = {
        "type": "online",
        "processing_mode": "manual",
        "total_amount": str(total),
        "external_reference": external_reference,
        "items": items_mp,
    }

    if payer_email:
        orders_payload["payer"] = {
            "email": payer_email,
        }

    idempotency_key = str(uuid4())

    orders_error = None
    result = None
    checkout_provider = "orders"

    try:
        response = httpx.post(
            MERCADOPAGO_ORDERS_URL,
            json=orders_payload,
            headers=mp_headers(idempotency_key),
            timeout=30.0,
        )

        if response.status_code == 201:
            raw_result = response.json()

            if (
                raw_result.get("id")
                and raw_result.get("checkout_url")
            ):
                result = {
                    **raw_result,
                    "provider": "orders",
                }
            else:
                orders_error = (
                    "Orders API respondió 201, pero no "
                    "devolvió id/checkout_url."
                )
        else:
            orders_error = full_mp_error(response)

    except httpx.RequestError as exc:
        orders_error = (
            "No fue posible conectar con Orders API: "
            f"{exc}"
        )

    # Fallback automático:
    # algunas cuentas/integraciones pueden no tener habilitado
    # todavía el flujo nuevo de Orders API. Checkout Pro vía
    # Preferences sigue siendo compatible y devuelve init_point.
    if result is None:
        try:
            result = create_mp_preference(
                items_mp,
                external_reference,
                payer_email,
            )
            checkout_provider = "preferences"
        except HTTPException as preference_exc:
            preference_error = preference_exc.detail

            raise HTTPException(
                status_code=502,
                detail=(
                    "No se pudo iniciar Mercado Pago.\n\n"
                    "Orders API:\n"
                    f"{orders_error or 'sin detalle'}\n\n"
                    "Preferences API:\n"
                    f"{preference_error}"
                ),
            ) from preference_exc

    mp_checkout_id = result.get("id")
    checkout_url = (
        result.get("checkout_url")
        or result.get("init_point")
    )

    if not mp_checkout_id or not checkout_url:
        raise HTTPException(
            status_code=502,
            detail=(
                "Mercado Pago no devolvió los datos "
                "necesarios para abrir Checkout Pro."
            ),
        )

    checkout = PaymentCheckout(
        user_id=current_user.id,
        mp_order_id=str(mp_checkout_id),
        external_reference=external_reference,
        total=total,
        status=result.get("status") or "created",
        status_detail=(
            result.get("status_detail")
            or checkout_provider
        ),
        cart_json=json.dumps(
            cart_snapshot,
            ensure_ascii=False,
        ),
        finalized=False,
    )

    db.add(checkout)
    db.commit()

    return {
        "order_id": str(mp_checkout_id),
        "checkout_url": checkout_url,
        "status": result.get("status") or "created",
        "status_detail": result.get("status_detail"),
        "external_reference": external_reference,
        "total": total,
        "provider": checkout_provider,
    }


@router.get("/mercadopago/order/{order_id}")
def get_mercadopago_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    checkout = (
        db.query(PaymentCheckout)
        .filter(
            PaymentCheckout.mp_order_id == order_id,
            PaymentCheckout.user_id == current_user.id,
        )
        .first()
    )

    if not checkout:
        raise HTTPException(
            status_code=404,
            detail="No se encontró este pago en VetMap.",
        )

    result = get_mp_checkout_result(
        checkout
    )

    checkout.status = (
        result.get("status")
        or checkout.status
    )
    checkout.status_detail = (
        result.get("status_detail")
        or checkout.status_detail
    )
    db.commit()

    return {
        "order_id": order_id,
        "status": result.get("status"),
        "status_detail": result.get("status_detail"),
        "external_reference": (
            result.get("external_reference")
            or checkout.external_reference
        ),
        "total_amount": result.get("total_amount"),
        "total_paid_amount": result.get("total_paid_amount"),
        "finalized": checkout.finalized,
        "provider": (
            "preferences"
            if order_id.startswith(PREFERENCE_PREFIX)
            else "orders"
        ),
    }


@router.post("/mercadopago/order/{order_id}/sync")
def sync_mercadopago_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Consulta Mercado Pago y, si el pago está acreditado,
    crea los pedidos internos de VetMap.

    Compatible con:
    - Checkout Pro vía Orders API.
    - Checkout Pro vía Preferences API (fallback).

    Puede llamarse varias veces sin duplicar pedidos.
    """

    checkout = (
        db.query(PaymentCheckout)
        .filter(
            PaymentCheckout.mp_order_id == order_id,
            PaymentCheckout.user_id == current_user.id,
        )
        .with_for_update()
        .first()
    )

    if not checkout:
        raise HTTPException(
            status_code=404,
            detail=(
                "No se encontró este checkout en VetMap. "
                "Los pagos anteriores a esta integración "
                "pueden requerir una compra nueva."
            ),
        )

    result = get_mp_checkout_result(
        checkout
    )

    sync_result = finalize_checkout(
        checkout,
        result,
        db,
    )

    return {
        "order_id": order_id,
        **sync_result,
        "provider": (
            "preferences"
            if order_id.startswith(PREFERENCE_PREFIX)
            else "orders"
        ),
        "message": (
            "Pago acreditado y pedido registrado en VetMap."
            if sync_result["finalized"]
            else "El pago todavía no está acreditado."
        ),
    }

