
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from utils.database import get_db
from database_models import Application, Assessment
from utils.auth import get_current_user

router = APIRouter(
    prefix="/api",
    tags=["Applications"]
)


@router.get("/applications")
def get_applications(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    stmt = (
        select(Application, Assessment)
        .outerjoin(
            Assessment,
            Application.id == Assessment.application_id
        )
        .where(Application.user_id == user_id)
        .order_by(Application.created_at.desc())
    )

    rows = db.execute(stmt).all()

    applications = []

    for application, assessment in rows:
        applications.append({
            "application_id": application.id,
            "loan_amount": application.loan_amount,
            "loan_term": application.loan_term,
            "interest_rate": application.interest_rate,
            "application_year": application.application_year,
            "annual_income": application.annual_income,
            "employment_length": application.employment_length,
            "home_ownership": application.home_ownership,
            "fico_score": application.fico_score,
            "created_at": application.created_at,
            "default_probability": (
                assessment.default_probability
                if assessment else None
            ),
            "risk_level": (
                assessment.risk_level
                if assessment else None
            ),
            "recommendation": (
                assessment.recommendation
                if assessment else None
            ),
        })

    return {"applications": applications}
