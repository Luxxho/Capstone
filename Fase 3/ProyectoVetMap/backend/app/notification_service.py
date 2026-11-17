from sqlalchemy.orm import Session

from .models import Notification, User


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    category: str = "info",
    entity_type: str | None = None,
    entity_id: str | int | None = None,
):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        category=category,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        is_read=False,
    )

    db.add(notification)

    return notification


def notify_store_users(
    db: Session,
    store_id: int,
    title: str,
    message: str,
    category: str = "order",
    entity_type: str | None = "order",
    entity_id: str | int | None = None,
):
    users = (
        db.query(User)
        .filter(
            User.role == "store",
            User.store_id == store_id,
        )
        .all()
    )

    for user in users:
        create_notification(
            db=db,
            user_id=user.id,
            title=title,
            message=message,
            category=category,
            entity_type=entity_type,
            entity_id=entity_id,
        )

    return users


def notify_veterinary_users(
    db: Session,
    veterinary_id: int,
    title: str,
    message: str,
    category: str = "reservation",
    entity_type: str | None = "reservation",
    entity_id: str | int | None = None,
):
    users = (
        db.query(User)
        .filter(
            User.role == "vet",
            User.veterinary_id == veterinary_id,
        )
        .all()
    )

    for user in users:
        create_notification(
            db=db,
            user_id=user.id,
            title=title,
            message=message,
            category=category,
            entity_type=entity_type,
            entity_id=entity_id,
        )

    return users
