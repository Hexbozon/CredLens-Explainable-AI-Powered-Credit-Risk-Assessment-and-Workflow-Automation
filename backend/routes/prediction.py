from fastapi import APIRouter
from services.prediction import explain_prediction
from schemas.credit_risk import CreditRiskInput
from services.preprocessing import preprocess_input
from services.prediction import predict
from services.risk_engine import assess_risk
from utils.database import get_connection
import json
from fastapi import HTTPException

from schemas.credit_risk import ShapExplanationInput

router = APIRouter(
    prefix="/api",
    tags=["Credit Risk"]
)


@router.post("/assess")
def assess_credit_risk(data: CreditRiskInput):

    X = preprocess_input(data)

    probability = predict(X)

    risk_assessment = assess_risk(probability)

    # 4. Save application + assessment
    conn = get_connection()

    try:
        with conn.cursor() as cur:

            # Save application
            cur.execute(
                """
                INSERT INTO applications (
                    loan_amount,
                    loan_term,
                    interest_rate,
                    application_year,
                    funded_amnt_inv,
                    annual_income,
                    employment_length,
                    home_ownership,
                    fico_score,
                    mortgage_accounts,
                    accounts_opened_last_24_months,
                    active_revolving_accounts,
                    accounts_120_days_past_due,
                    average_account_balance,
                    total_credit_limit,
                    monthly_debt_payment
                )
                VALUES (
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s
                )
                RETURNING id
                """,
                (
                    data.loan_amount,
                    data.loan_term,
                    data.interest_rate,
                    data.application_year,
                    data.funded_amnt_inv or data.loan_amount,
                    data.annual_income,
                    data.employment_length,
                    data.home_ownership,
                    data.fico_score,
                    data.mortgage_accounts,
                    data.accounts_opened_last_24_months,
                    data.active_revolving_accounts,
                    data.accounts_120_days_past_due,
                    data.average_account_balance,
                    data.total_credit_limit,
                    data.monthly_debt_payment
                )
            )

            result = cur.fetchone()

            if result is None:
                    raise Exception("Application was not inserted")

            application_id = result[0]

            # Save assessment
            cur.execute(
                """
                INSERT INTO assessments (
                    application_id,
                    default_probability,
                    risk_level,
                    recommendation
                )
                VALUES (%s, %s, %s, %s)
                """,
                (
                    application_id,
                    risk_assessment["default_probability"],
                    risk_assessment["risk_level"],
                    risk_assessment["recommendation"]
                )
            )

        conn.commit()

    finally:
        conn.close()

    return {
        "application_id": application_id,
        **risk_assessment
    }

@router.post("/preprocess")
def preprocess_credit_risk(data: CreditRiskInput):

    X = preprocess_input(data)

    return {
        "message": "Preprocessing successful",
        "features": X.to_dict(orient="records")[0]
    }

@router.get("/applications/{application_id}/shap")
def shap_analysis(application_id: int):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        loan_amount,
                        loan_term,
                        interest_rate,
                        application_year,
                        funded_amnt_inv,
                        annual_income,
                        employment_length,
                        home_ownership,
                        fico_score,
                        mortgage_accounts,
                        accounts_opened_last_24_months,
                        active_revolving_accounts,
                        accounts_120_days_past_due,
                        average_account_balance,
                        total_credit_limit,
                        monthly_debt_payment
                    FROM applications
                    WHERE id = %s
                    """,
                    (application_id,)
                )

                row = cur.fetchone()

                if row is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Application not found."
                    )

                columns = [desc[0] for desc in cur.description]
                features = dict(zip(columns, row))

        # Rebuild the original input schema from saved values
        data = CreditRiskInput(**features)

        # Use the same preprocessing and model explanation pipeline
        X = preprocess_input(data)
        explanation = explain_prediction(X)

        return {
            "application_id": application_id,
            "explanation": explanation
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate SHAP explanation."
        ) from e





@router.put("/assessments/{assessment_id}/shap")
def save_shap_result(
    assessment_id: int,
    data: ShapExplanationInput
):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE assessments
                    SET shap_explanation = %s::jsonb
                    WHERE id = %s
                    RETURNING id, application_id
                    """,
                    (
                        json.dumps(data.explanation),
                        assessment_id
                    )
                )

                saved_record = cur.fetchone()

                if saved_record is None:
                    raise HTTPException(
                        status_code=404,
                        detail="Assessment not found."
                    )

        return {
            "message": "SHAP explanation saved successfully",
            "assessment_id": saved_record[0],
            "application_id": saved_record[1]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to save SHAP explanation."
        ) from e
