from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserLogin, UserOut, TokenOut, PasswordReset, UserProfileUpdate, UserProfileUpdateOut
from ..security import hash_password, verify_password, create_access_token
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if data.confirm_password is not None and data.password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Las contraseñas no coinciden"
        )

    existing = db.query(User).filter(User.email == data.email).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="El correo ya está registrado"
        )

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        rut=data.rut,
        country=data.country,
        region=data.region,
        city=data.city,
        birth_year=data.birth_date.year if data.birth_date else data.birth_year,
        birth_date=data.birth_date,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=TokenOut)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas"
        )

    now = datetime.utcnow()
    user.last_login_at = now
    user.last_seen_at = now
    db.commit()

    return TokenOut(access_token=create_access_token(user.email))


@router.post("/reset-password")
def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Las contraseñas no coinciden"
        )

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No existe un usuario con ese correo"
        )

    user.password_hash = hash_password(data.new_password)

    db.commit()

    return {"message": "Contraseña restablecida correctamente"}


@router.get("/me", response_model=UserOut)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user



@router.put("/me", response_model=UserProfileUpdateOut)
def update_my_profile(
    data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    El usuario puede modificar sus propios datos personales.
    El rol NO forma parte del esquema de actualización, por lo tanto
    nunca puede cambiarlo desde su perfil.
    """

    existing = (
        db.query(User)
        .filter(
            User.email == data.email,
            User.id != current_user.id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Ese correo ya está siendo utilizado por otro usuario"
        )

    if data.password or data.confirm_password:
        if not data.password or not data.confirm_password:
            raise HTTPException(
                status_code=400,
                detail="Debes ingresar y confirmar la nueva contraseña"
            )

        if data.password != data.confirm_password:
            raise HTTPException(
                status_code=400,
                detail="Las contraseñas no coinciden"
            )

        current_user.password_hash = hash_password(data.password)

    current_user.name = data.name
    current_user.email = data.email
    current_user.rut = data.rut
    current_user.country = data.country
    current_user.region = data.region
    current_user.city = data.city

    if data.birth_date is not None:
        current_user.birth_date = data.birth_date

        # Se mantiene birth_year por compatibilidad con registros antiguos.
        current_user.birth_year = data.birth_date.year

    db.commit()
    db.refresh(current_user)

    # El JWT utiliza el correo como subject.
    # Si el usuario cambió su email, entregamos un token nuevo.
    new_token = create_access_token(current_user.email)

    return UserProfileUpdateOut(
        access_token=new_token,
        user=current_user,
    )
