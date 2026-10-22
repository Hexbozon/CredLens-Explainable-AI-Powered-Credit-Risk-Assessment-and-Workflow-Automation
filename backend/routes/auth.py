from fastapi import APIRouter, HTTPException
import psycopg

from schemas.auth import (
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse,
)
from utils.database import get_connection
from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=UserResponse)
def register_user(data: UserRegister):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO users (email, password_hash)
                    VALUES (%s, %s)
                    RETURNING id, email
                    """,
                    (
                        str(data.email).lower(),
                        hash_password(data.password)
                    )
                )

                user = cur.fetchone()

        if user is None:
            raise HTTPException(
                status_code=500,
                detail="User registration failed."
            )

        return UserResponse(
            id=user[0],
            email=user[1]
        )

    except psycopg.errors.UniqueViolation:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists."
        )


@router.post("/login", response_model=TokenResponse)
def login_user(data: UserLogin):

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, email, password_hash
                FROM users
                WHERE email = %s
                """,
                (str(data.email).lower(),)
            )

            user = cur.fetchone()

    if user is None or not verify_password(
        data.password,
        user[2]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    access_token = create_access_token(user[0])

    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )
