
from psycopg.errors import UniqueViolation

from utils.database import get_connection
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


def register_user(email: str, password: str) -> dict:
    """
    Register a new user.

    Stores a password hash, never the plaintext password.
    Returns the public user details and an access token.
    """
    normalized_email = email.strip().lower()
    password_hash = hash_password(password)

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO users (email, password_hash)
                    VALUES (%s, %s)
                    RETURNING id, email, created_at
                    """,
                    (normalized_email, password_hash),
                )

                user = cur.fetchone()

                if not user:
                    raise AuthError("Could not create user.")

                user_id, user_email, created_at = user

    except UniqueViolation as exc:
        raise EmailAlreadyRegistered(
            "An account with this email already exists."
        ) from exc

    token = create_access_token(user_id)

    return {
        "user": {
            "id": user_id,
            "email": user_email,
            "created_at": created_at,
        },
        "access_token": token,
        "token_type": "bearer",
    }


def authenticate_user(email: str, password: str) -> dict:
    """
    Verify login credentials and issue a JWT.
    """
    normalized_email = email.strip().lower()

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, email, password_hash, created_at
                FROM users
                WHERE email = %s
                """,
                (normalized_email,),
            )

            user = cur.fetchone()

    # Use the same error for unknown email and incorrect password.
    if not user:
        raise InvalidCredentials("Invalid email or password.")

    user_id, user_email, stored_hash, created_at = user

    if not verify_password(password, stored_hash):
        raise InvalidCredentials("Invalid email or password.")

    token = create_access_token(user_id)

    return {
        "user": {
            "id": user_id,
            "email": user_email,
            "created_at": created_at,
        },
        "access_token": token,
        "token_type": "bearer",
    }
