
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database_models import User
from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)


class AuthError(Exception):
    """Base exception for authentication service errors."""


class EmailAlreadyRegistered(AuthError):
    """Raised when a registration email already exists."""


class InvalidCredentials(AuthError):
    """Raised when login credentials are invalid."""


def register_user(
    email: str,
    password: str,
    db: Session,
) -> dict:
    """
    Register a user using SQLAlchemy.

    Stores a password hash, never the plaintext password.
    Returns public user details and an access token.
    """
    normalized_email = email.strip().lower()
    password_hash = hash_password(password)

    existing_user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    if existing_user:
        raise EmailAlreadyRegistered(
            "An account with this email already exists."
        )

    user = User(
        email=normalized_email,
        password_hash=password_hash,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

    except IntegrityError as exc:
        db.rollback()
        raise EmailAlreadyRegistered(
            "An account with this email already exists."
        ) from exc

    token = create_access_token(user.id)

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at,
        },
        "access_token": token,
        "token_type": "bearer",
    }


def authenticate_user(
    email: str,
    password: str,
    db: Session,
) -> dict:
    """Verify login credentials and issue a JWT."""

    normalized_email = email.strip().lower()

    user = db.scalar(
        select(User).where(User.email == normalized_email)
    )

    # Use the same error for unknown email and incorrect password.
    if user is None or not verify_password(
        password,
        user.password_hash,
    ):
        raise InvalidCredentials("Invalid email or password.")

    token = create_access_token(user.id)

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at,
        },
        "access_token": token,
        "token_type": "bearer",
    }
