from xgboost import XGBClassifier
import os
import shap

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models",
    "model_15.json"
)

model = XGBClassifier()
model.load_model(MODEL_PATH)


def predict(X):
    probability = model.predict_proba(X)[:, 1]
    return float(probability[0])

explainer = shap.TreeExplainer(model)


FEATURE_INFO = {
    "int_rate": {
        "name": "Interest Rate",
        "description": "Annual interest rate charged on the loan."
    },

    "term": {
        "name": "Loan Term",
        "description": "Length of the loan repayment period."
    },

    "issue_year": {
        "name": "Application Year",
        "description": "Year in which the loan was issued."
    },

    "home_ownership": {
        "name": "Home Ownership",
        "description": "Applicant's reported housing status."
    },

    "fico_avg": {
        "name": "FICO Credit Score",
        "description": "Average FICO credit score reported for the applicant."
    },

    "num_tl_120dpd_2m": {
        "name": "Accounts 120+ Days Past Due",
        "description": "Number of accounts reported as 120 or more days past due."
    },

    "mort_acc": {
        "name": "Mortgage Accounts",
        "description": "Number of mortgage accounts reported on the applicant's credit profile."
    },

    "acc_open_past_24mths": {
        "name": "Accounts Opened Recently",
        "description": "Number of credit accounts opened during the last 24 months."
    },

    "num_actv_rev_tl": {
        "name": "Active Revolving Accounts",
        "description": "Number of currently active revolving credit accounts."
    },

    "dti": {
        "name": "Debt-to-Income Ratio",
        "description": "Applicant's monthly debt obligations relative to monthly income."
    },

    "funded_amnt_inv": {
        "name": "Investor-Funded Amount",
        "description": "Amount of the loan funded by investors."
    },

    "avg_cur_bal": {
        "name": "Average Account Balance",
        "description": "Average current balance across the applicant's credit accounts."
    },

    "tot_hi_cred_lim": {
        "name": "Total Credit Limit",
        "description": "Total high-credit or credit-limit amount across the applicant's accounts."
    },

    "funded_amnt": {
        "name": "Funded Loan Amount",
        "description": "Total amount funded for the loan."
    },

    "annual_inc": {
        "name": "Annual Income",
        "description": "Applicant's reported annual income before taxes."
    }
}

def explain_prediction(X):
    shap_values = explainer.shap_values(X)
    values = shap_values[0]

    risk_factors = []
    positive_factors = []

    for feature, value, shap_value in zip(
        X.columns,
        X.iloc[0],
        values
    ):
        info = FEATURE_INFO[feature]

        if shap_value > 0:
            impact = "increases_risk"
            explanation = (
                "This factor contributed toward a higher "
                "predicted default risk."
            )
        else:
            impact = "reduces_risk"
            explanation = (
                "This factor contributed toward a lower "
                "predicted default risk."
            )

        result = {
            "feature": feature,
            "name": info["name"],
            "value": float(value),
            "description": info["description"],
            "shap_value": float(shap_value),
            "impact": impact,
            "explanation": explanation
        }

        if shap_value > 0:
            risk_factors.append(result)
        else:
            positive_factors.append(result)

    # Show strongest factors first
    risk_factors.sort(
        key=lambda x: abs(x["shap_value"]),
        reverse=True
    )

    positive_factors.sort(
        key=lambda x: abs(x["shap_value"]),
        reverse=True
    )

    return {
        "risk_factors": risk_factors,
        "positive_factors": positive_factors
    }