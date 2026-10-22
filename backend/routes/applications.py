from fastapi import APIRouter
from utils.database import get_connection

router = APIRouter(
    prefix="/api",
    tags=["Applications"]
)


@router.get("/applications")
def get_applications():

    conn = get_connection()

    try:
        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT
                    a.id,
                    a.loan_amount,
                    a.loan_term,
                    a.interest_rate,
                    a.application_year,
                    a.annual_income,
                    a.employment_length,
                    a.home_ownership,
                    a.fico_score,
                    a.created_at,

                    ass.default_probability,
                    ass.risk_level,
                    ass.recommendation

                FROM applications a

                LEFT JOIN assessments ass
                    ON a.id = ass.application_id

                ORDER BY a.created_at DESC
                """
            )

            rows = cur.fetchall()

            applications = []

            for row in rows:

                applications.append({
                    "application_id": row[0],
                    "loan_amount": row[1],
                    "loan_term": row[2],
                    "interest_rate": row[3],
                    "application_year": row[4],
                    "annual_income": row[5],
                    "employment_length": row[6],
                    "home_ownership": row[7],
                    "fico_score": row[8],
                    "created_at": row[9],
                    "default_probability": row[10],
                    "risk_level": row[11],
                    "recommendation": row[12]
                })

            return {
                "applications": applications
            }

    finally:
        conn.close()