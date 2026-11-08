from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from database_models import Application, Assessment
from schemas.credit_risk import CreditRiskInput, ShapExplanationInput
from services.preprocessing import preprocess_input
from services.prediction import predict, explain_prediction
from services.risk_engine import assess_risk
from utils.database import get_db
from utils.auth import get_current_user

router = APIRouter(
    prefix="/api",
    tags=["Credit Risk"]
)


@router.post("/assess")
def assess_credit_risk(
    data: CreditRiskInput,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    # 1. Preprocess and predict
    X = preprocess_input(data)
    probability = predict(X)
    risk_assessment = assess_risk(probability)

    # 2. Create application ORM object
    application = Application(
        user_id=user_id,
        loan_amount=data.loan_amount,
        loan_term=data.loan_term,
        interest_rate=data.interest_rate,
        application_year=data.application_year,
        funded_amnt_inv=(
            data.funded_amnt_inv
            if data.funded_amnt_inv is not None
            else data.loan_amount
        ),
        annual_income=data.annual_income,
        employment_length=data.employment_length,
        home_ownership=data.home_ownership,
        fico_score=data.fico_score,
        mortgage_accounts=data.mortgage_accounts,
        accounts_opened_last_24_months=(
            data.accounts_opened_last_24_months
        ),
        active_revolving_accounts=data.active_revolving_accounts,
        accounts_120_days_past_due=data.accounts_120_days_past_due,
        average_account_balance=data.average_account_balance,
        total_credit_limit=data.total_credit_limit,
        monthly_debt_payment=data.monthly_debt_payment,
    )

    # 3. Save application and assessment in one transaction
    assessment = Assessment(
        default_probability=risk_assessment["default_probability"],
        risk_level=risk_assessment["risk_level"],
        recommendation=risk_assessment["recommendation"],
    )

    application.assessment = assessment

    try:
        db.add(application)
        db.commit()
        db.refresh(application)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save credit risk assessment.",
        )

    return {
        "application_id": application.id,
        **risk_assessment,
    }


@router.post("/preprocess")
def preprocess_credit_risk(data: CreditRiskInput):
    X = preprocess_input(data)

    return {
        "message": "Preprocessing successful",
        "features": X.to_dict(orient="records")[0],
    }


@router.get("/applications/{application_id}/shap")
def shap_analysis(
    application_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    # Fetch only an application owned by this user
    application = db.scalar(
        select(Application).where(
            Application.id == application_id,
            Application.user_id == user_id,
        )
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found.",
        )

    data = CreditRiskInput(
        loan_amount=application.loan_amount,
        loan_term=application.loan_term,
        interest_rate=application.interest_rate,
        application_year=application.application_year,
        funded_amnt_inv=application.funded_amnt_inv,
        annual_income=application.annual_income,
        employment_length=application.employment_length,
        home_ownership=application.home_ownership,
        fico_score=application.fico_score,
        mortgage_accounts=application.mortgage_accounts,
        accounts_opened_last_24_months=(
            application.accounts_opened_last_24_months
        ),
        active_revolving_accounts=application.active_revolving_accounts,
        accounts_120_days_past_due=(
            application.accounts_120_days_past_due
        ),
        average_account_balance=application.average_account_balance,
        total_credit_limit=application.total_credit_limit,
        monthly_debt_payment=application.monthly_debt_payment,
    )

    try:
        X = preprocess_input(data)
        explanation = explain_prediction(X)

        return {
            "application_id": application_id,
            "explanation": explanation,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate SHAP explanation.",
        ) from e


@router.put("/assessments/{assessment_id}/shap")
def save_shap_result(
    assessment_id: int,
    data: ShapExplanationInput,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):
    # Find the assessment only if its application belongs to this user
    assessment = db.scalar(
        select(Assessment)
        .join(
            Application,
            Assessment.application_id == Application.id,
        )
        .where(
            Assessment.id == assessment_id,
            Application.user_id == user_id,
        )
    )

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found.",
        )

    try:
        assessment.shap_explanation = data.explanation
        db.commit()
        db.refresh(assessment)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save SHAP explanation.",
        ) from e

    return {
        "message": "SHAP explanation saved successfully",
        "assessment_id": assessment.id,
        "application_id": assessment.application_id,
    }
