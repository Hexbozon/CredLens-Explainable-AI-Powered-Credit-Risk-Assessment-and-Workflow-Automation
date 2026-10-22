import pandas as pd

from schemas.credit_risk import CreditRiskInput


HOME_OWNERSHIP_MAP = {
    "MORTGAGE": 1,
    "RENT": 5,
    "OWN": 4,
    "ANY": 0,
    "OTHER": 3,
    "NONE": 2
}


TOP_15_FEATURES = [
    "int_rate",
    "term",
    "issue_year",
    "home_ownership",
    "fico_avg",
    "num_tl_120dpd_2m",
    "mort_acc",
    "acc_open_past_24mths",
    "num_actv_rev_tl",
    "dti",
    "funded_amnt_inv",
    "avg_cur_bal",
    "tot_hi_cred_lim",
    "funded_amnt",
    "annual_inc"
]


def preprocess_input(data: CreditRiskInput) -> pd.DataFrame:

    # Convert Pydantic object to dictionary
    input_data = data.model_dump()

    # --------------------------------
    # Create dataframe
    # --------------------------------

    df = pd.DataFrame([input_data])

    # --------------------------------
    # Map user-friendly fields
    # to model feature names
    # --------------------------------

    df["funded_amnt"] = df["loan_amount"]

    # Optional investor-funded amount.
    # If not supplied, use funded amount.
    df["funded_amnt_inv"] = (
        df["funded_amnt_inv"]
        .fillna(df["funded_amnt"])
    )

    df["int_rate"] = df["interest_rate"]

    df["term"] = df["loan_term"].map({
    36: 0,
    60: 1
    })

    df["issue_year"] = df["application_year"]

    df["fico_avg"] = df["fico_score"]

    df["num_tl_120dpd_2m"] = df["accounts_120_days_past_due"]

    df["mort_acc"] = df["mortgage_accounts"]

    df["acc_open_past_24mths"] = (
        df["accounts_opened_last_24_months"]
    )

    df["num_actv_rev_tl"] = (
        df["active_revolving_accounts"]
    )

    df["avg_cur_bal"] = (
        df["average_account_balance"]
    )

    df["tot_hi_cred_lim"] = (
        df["total_credit_limit"]
    )

    df["annual_inc"] = df["annual_income"]

    # --------------------------------
    # Calculate DTI
    # --------------------------------

    monthly_income = df["annual_income"] / 12

    df["dti"] = (
        df["monthly_debt_payment"] /
        monthly_income
    ) * 100

    # --------------------------------
    # Encode home ownership
    # --------------------------------

    df["home_ownership"] = (
        df["home_ownership"]
        .map(HOME_OWNERSHIP_MAP)
    )

    # --------------------------------
    # Select EXACT model features
    # --------------------------------

    X = df[TOP_15_FEATURES].copy()

    return X