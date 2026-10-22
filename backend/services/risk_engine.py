LOW_RISK_THRESHOLD = 0.30
HIGH_RISK_THRESHOLD = 0.60


def assess_risk(probability: float):

    if probability < LOW_RISK_THRESHOLD:
        risk_level = "LOW"
        recommendation = "Standard processing recommended."

    elif probability < HIGH_RISK_THRESHOLD:
        risk_level = "MEDIUM"
        recommendation = "Manual review recommended."

    else:
        risk_level = "HIGH"
        recommendation = "Detailed underwriting review recommended."

    return {
        "default_probability": probability,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "thresholds": {
            "low_risk_below": LOW_RISK_THRESHOLD,
            "high_risk_at_or_above": HIGH_RISK_THRESHOLD
        }
    }

