from pydantic import BaseModel, Field
from typing import Any

class CreditRiskInput(BaseModel):

    # -------------------------
    # Loan Information
    # -------------------------

    loan_amount: float = Field(
        ...,
        gt=0,
        description="Total loan amount requested by the applicant."
    )

    loan_term: int = Field(
        ...,
        description="Loan repayment term in months. Allowed values: 36 or 60."
    )

    interest_rate: float = Field(
        ...,
        gt=0,
        le=50,
        description="Annual interest rate offered on the loan, expressed as a percentage. Example: 12.5."
    )

    application_year: int = Field(
        ...,
        ge=2007,
        description="Year in which the loan application or loan was issued. Example: 2018."
    )
    
    funded_amnt_inv: float | None = Field(
        default=None,
        gt=0,
        description="Amount funded by investors. Optional; if not provided, the funded/approved loan amount will be used."
    )


    # -------------------------
    # Applicant Information
    # -------------------------

    annual_income: float = Field(
        ...,
        gt=0,
        description="Applicant's total annual income before taxes."
    )

    employment_length: int = Field(
        ...,
        ge=0,
        le=60,
        description="Applicant's employment length in years. Enter 0 for less than one year."
    )

    home_ownership: str = Field(
        ...,
        description="Applicant's current housing status. Examples: RENT, OWN, MORTGAGE, OTHER."
    )


    # -------------------------
    # Credit Information
    # -------------------------

    fico_score: float = Field(
        ...,
        ge=300,
        le=850,
        description="Applicant's FICO credit score obtained from the credit report."
    )

    mortgage_accounts: int = Field(
        ...,
        ge=0,
        description="Number of mortgage accounts reported on the applicant's credit report."
    )

    accounts_opened_last_24_months: int = Field(
        ...,
        ge=0,
        description="Number of credit accounts opened during the last 24 months."
    )

    active_revolving_accounts: int = Field(
        ...,
        ge=0,
        description="Number of currently active revolving credit accounts, such as credit cards."
    )

    accounts_120_days_past_due: int = Field(
        ...,
        ge=0,
        description="Number of accounts reported as 120 or more days past due during the recent period."
    )

    average_account_balance: float = Field(
        ...,
        ge=0,
        description="Average current balance across the applicant's credit accounts."
    )

    total_credit_limit: float = Field(
        ...,
        ge=0,
        description="Total credit limit or high credit amount across the applicant's credit accounts."
    )


    # -------------------------
    # Debt Information
    # -------------------------

    monthly_debt_payment: float = Field(
        ...,
        ge=0,
        description="Total required monthly payments on the applicant's existing debts."
    )

class ShapExplanationInput(BaseModel):
    explanation: dict[str, Any]