import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CircleHelp } from "lucide-react";
import { assessLoan } from "../../lib/api.js";
import { landingCopy } from "../../data/landing.js";
import Button from "../ui/Button.jsx";
import RiskChip from "../ui/RiskChip.jsx";
import Reveal from "./Reveal.jsx";

function normalizeAssessment(response) {
  const result = response?.assessment ?? response?.result ?? response ?? {};
  const rawProbability = result.default_probability ?? result.defaultProbability ?? result.probability ?? result.prediction;
  const probabilityNumber = Number(rawProbability);
  const probability = rawProbability !== null && rawProbability !== undefined && rawProbability !== "" && Number.isFinite(probabilityNumber)
    ? `${(probabilityNumber <= 1 ? probabilityNumber * 100 : probabilityNumber).toFixed(1)}%`
    : String(rawProbability ?? "—");
  const risk = result.risk_level ?? result.riskLevel ?? result.risk ?? landingCopy.unclassifiedRiskLabel;
  const rawFactors = result.top_risk_factors ?? result.top_factors ?? result.risk_factors ?? result.factors ?? [];
  const factors = (Array.isArray(rawFactors) ? rawFactors : [])
    .slice(0, 3)
    .map((factor) => {
      if (typeof factor === "string") return { label: factor, direction: "neutral" };
      const impact = Number(factor.impact ?? factor.shap_value ?? factor.value);
      return {
        label: factor.factor ?? factor.feature ?? factor.feature_name ?? factor.name ?? factor.label ?? landingCopy.demo.unknownFactor,
        direction: impact > 0 ? "risk" : impact < 0 ? "protective" : "neutral",
      };
    });

  return {
    probability,
    risk,
    factors,
    applicationId: result.application_id,
    recommendation: result.recommendation,
  };
}

function LoadingResult({ label }) {
  return (
    <div className="loading-result" role="status" aria-label={label}>
      <div className="skeleton" />
      <div className="loading-lines" aria-hidden="true">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    </div>
  );
}

export default function LiveDemo() {
  const { demo } = landingCopy;
  const [values, setValues] = useState(demo.defaults);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setError("");
    setResult(null);


    const payload = {
      loan_amount: Number(values.loan_amount),
      loan_term: Number.parseInt(values.loan_term, 10),
      interest_rate: Number(values.interest_rate),
      application_year: Number.parseInt(values.application_year, 10),
      funded_amnt_inv: Number(values.funded_amnt_inv),
      annual_income: Number(values.annual_income),
      employment_length: Number(values.employment_length),
      home_ownership: values.home_ownership,
      fico_score: Number.parseInt(values.fico_score, 10),
      mortgage_accounts: Number.parseInt(values.mortgage_accounts, 10),
      accounts_opened_last_24_months: Number.parseInt(
        values.accounts_opened_last_24_months, 10
      ),
      active_revolving_accounts: Number.parseInt(
        values.active_revolving_accounts, 10
      ),
      accounts_120_days_past_due: Number.parseInt(
        values.accounts_120_days_past_due, 10
      ),
      average_account_balance: Number(values.average_account_balance),
      total_credit_limit: Number(values.total_credit_limit),
      monthly_debt_payment: Number(values.monthly_debt_payment),
    };


    try {
      const assessment = await assessLoan(payload);
      setResult(normalizeAssessment(assessment));
    } catch (requestError) {
      const message = typeof requestError.message === "string" ? requestError.message : "";
      setError(message || demo.errorFallback);
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <section className="demo-section" id="demo" aria-labelledby="demo-title">
      <div className="site-container">
        <Reveal className="section-heading">
          <p className="section-kicker">{demo.kicker}</p>
          <h2 className="section-title" id="demo-title">{demo.title}</h2>
          <p className="section-description">{demo.description}</p>
        </Reveal>

        <Reveal>
          <div className="demo-card">
            <div className="demo-card-head">
              <div>
                <h3 className="demo-card-title">{demo.cardTitle}</h3>
                <p className="demo-card-note">{demo.cardNote}</p>
              </div>
              <CircleHelp size={17} color="#8c98b8" aria-hidden="true" />
            </div>

            <form className="demo-form" onSubmit={handleSubmit}>
              {demo.fields.map((field) => (
                <label className="field" key={field.name}>
                  <span className="field-label">{field.label}</span>
                  {field.type === "select" ? (
                    <select
                      className="field-control"
                      name={field.name}
                      value={values[field.name]}
                      onChange={handleChange}
                      required
                      aria-describedby={`${field.name}-hint`}
                    >
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : (
                    <span className="field-input-wrap">
                      {field.prefix && <span className="field-affix">{field.prefix}</span>}
                      <input
                        className="field-control"
                        type="number"
                        name={field.name}
                        value={values[field.name]}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        required
                        onChange={handleChange}
                        aria-describedby={`${field.name}-hint`}
                      />
                      {field.suffix && <span className="field-affix">{field.suffix}</span>}
                    </span>
                  )}
                  <span className="field-hint" id={`${field.name}-hint`}>{field.hint}</span>
                </label>
              ))}
              <div className="demo-submit" style={{ gridColumn: "1 / -1" }}>
                <Button type="submit" disabled={loading}>
                  {loading ? demo.loadingLabel : demo.submit}
                  {!loading && <ArrowRight size={15} aria-hidden="true" />}
                </Button>
              </div>
            </form>

            {error && <p className="demo-error" role="alert">{error}</p>}
            {loading && <LoadingResult label={demo.loadingLabel} />}
            {result && !loading && (
              <div className="demo-results" aria-live="polite">
                <div className="result-probability">
                  <span className="result-label">{demo.resultLabel}</span>
                  <span className="result-number gradient-text">{result.probability}</span>
                  <RiskChip level={result.risk} />
                </div>
                <div>
                  <h4 className="result-factors-title">{demo.resultFactors}</h4>
                  {result.factors.length > 0 ? (
                    <ul className="result-factor-list">
                      {result.factors.map((factor, index) => (
                        <li
                          className="result-factor"
                          key={`${factor.label}-${index}`}
                          style={{ "--factor-color": factor.direction === "risk" ? "var(--color-risk-high)" : factor.direction === "protective" ? "var(--color-risk-low)" : "var(--color-accent-2)" }}
                        >
                          {factor.label}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="demo-card-note">{demo.emptyFactors}</p>
                  )}
                </div>
                {result.recommendation && (
                  <p className="demo-card-note">{result.recommendation}</p>
                )}
                {result.applicationId != null && (
                  <Link
                    to={`/model-analytics?application_id=${encodeURIComponent(result.applicationId)}`}
                    className="button button-secondary"
                  >
                    View Model Analytics
                  </Link>
                )}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
