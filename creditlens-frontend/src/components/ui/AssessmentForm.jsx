import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, HelpCircle, ChevronDown } from "lucide-react";
import { assessLoan } from "../../lib/api";

/* All 16 fields expected by POST /api/assess. Defaults are your sample request. */
const CURRENT_YEAR = new Date().getFullYear();

const DEFAULTS = {
  loan_amount: "6000",
  loan_term: "36",
  interest_rate: "7.5",
  application_year: "2015",
  funded_amnt_inv: "6000",
  annual_income: "120000",
  employment_length: "10",
  home_ownership: "MORTGAGE",
  fico_score: "790",
  mortgage_accounts: "3",
  accounts_opened_last_24_months: "1",
  active_revolving_accounts: "3",
  accounts_120_days_past_due: "0",
  average_account_balance: "3000",
  total_credit_limit: "100000",
  monthly_debt_payment: "500",
};

const HOME_OPTIONS = ["RENT", "MORTGAGE", "OWN", "OTHER"];
const TERM_OPTIONS = [36, 60];

const SECTIONS = [
  {
    title: "Loan",
    fields: [
      { name: "loan_amount", label: "Loan amount", hint: "Requested principal", prefix: "$", min: 1, step: 1 },
      { name: "loan_term", label: "Term", hint: "Repayment duration", type: "select", options: TERM_OPTIONS.map((t) => ({ value: String(t), label: `${t} months` })) },
      { name: "interest_rate", label: "Interest rate", hint: "Annual rate", suffix: "%", min: 0.1, max: 50, step: 0.1 },
      { name: "funded_amnt_inv", label: "Funded by investors", hint: "Amount funded by investors", prefix: "$", min: 1, step: 1 },
      { name: "application_year", label: "Application year", hint: `2007 to ${CURRENT_YEAR}`, min: 2007, max: CURRENT_YEAR, step: 1, integer: true },
    ],
  },
  {
    title: "Borrower",
    fields: [
      { name: "annual_income", label: "Annual income", hint: "Gross yearly income", prefix: "$", min: 1, step: 1 },
      { name: "employment_length", label: "Employment length", hint: "Years in current job", suffix: "yrs", min: 0, step: 1, integer: true },
      { name: "home_ownership", label: "Home ownership", hint: "Current housing status", type: "select", options: HOME_OPTIONS.map((h) => ({ value: h, label: h[0] + h.slice(1).toLowerCase() })) },
      { name: "fico_score", label: "FICO score", hint: "A score between 300 and 850", min: 300, max: 850, step: 1, integer: true },
    ],
  },
  {
    title: "Credit profile",
    fields: [
      { name: "mortgage_accounts", label: "Mortgage accounts", hint: "Number of mortgage accounts", min: 0, step: 1, integer: true },
      { name: "accounts_opened_last_24_months", label: "Accounts opened (24 mo)", hint: "New accounts in the last 2 years", min: 0, step: 1, integer: true },
      { name: "active_revolving_accounts", label: "Active revolving accounts", hint: "Open credit cards and lines", min: 0, step: 1, integer: true },
      { name: "accounts_120_days_past_due", label: "Accounts 120+ days past due", hint: "Seriously delinquent accounts", min: 0, step: 1, integer: true },
      { name: "average_account_balance", label: "Average account balance", hint: "Mean balance across accounts", prefix: "$", min: 0, step: 100 },
      { name: "total_credit_limit", label: "Total credit limit", hint: "Combined limit on all accounts", prefix: "$", min: 0, step: 1000 },
      { name: "monthly_debt_payment", label: "Monthly debt payment", hint: "All monthly debt obligations", prefix: "$", min: 0, step: 50 },
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);

const LEVEL_STYLES = {
  LOW: { chip: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" },
  MEDIUM: { chip: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-500" },
  HIGH: { chip: "bg-rose-50 text-rose-700 border-rose-200", bar: "bg-rose-500" },
};

function formatError(e) {
  const detail = e?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => `${(d.loc || []).slice(1).join(".") || "input"}: ${d.msg}`).join("; ");
  }
  if (typeof detail === "string") return detail;
  return e?.message || "Assessment failed. Please try again.";
}

export default function AssessmentForm({ onResult }) {
  const [values, setValues] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const [fundedTouched, setFundedTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState(null);
  const [creditOpen, setCreditOpen] = useState(true);
  const submitting = useRef(false);

  const dti = useMemo(() => {
    const income = Number(values.annual_income);
    const debt = Number(values.monthly_debt_payment);
    return income > 0 && Number.isFinite(debt) ? ((debt * 12) / income) * 100 : null;
  }, [values.annual_income, values.monthly_debt_payment]);

  const utilization = useMemo(() => {
    const limit = Number(values.total_credit_limit);
    const accounts = Number(values.active_revolving_accounts);
    const avg = Number(values.average_account_balance);
    return limit > 0 && accounts >= 0 ? ((avg * accounts) / limit) * 100 : null;
  }, [values.total_credit_limit, values.active_revolving_accounts, values.average_account_balance]);

  const setValue = (name, value) => {
    setValues((v) => {
      const next = { ...v, [name]: value };
      // keep investor-funded amount in step with the loan amount until the user edits it
      if (name === "loan_amount" && !fundedTouched) next.funded_amnt_inv = value;
      return next;
    });
    if (name === "funded_amnt_inv") setFundedTouched(true);
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  const validate = () => {
    const found = {};
    ALL_FIELDS.forEach((f) => {
      const raw = values[f.name];
      if (f.type === "select") {
        if (!raw) found[f.name] = "Required";
        return;
      }
      if (raw === "" || raw == null) return void (found[f.name] = "Required");
      const n = Number(raw);
      if (!Number.isFinite(n)) return void (found[f.name] = "Enter a number");
      if (f.integer && !Number.isInteger(n)) return void (found[f.name] = "Whole number only");
      if (f.min != null && n < f.min) return void (found[f.name] = `Min ${f.min}`);
      if (f.max != null && n > f.max) return void (found[f.name] = `Max ${f.max}`);
    });
    return found;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    setApiError("");
    const found = validate();
    setErrors(found);
    if (Object.keys(found).some((k) => found[k])) return;

    const payload = {};
    ALL_FIELDS.forEach((f) => {
      payload[f.name] = f.type === "select" && f.name === "home_ownership" ? values[f.name] : Number(values[f.name]);
    });

    setLoading(true);
    submitting.current = true;
    try {
      const data = await assessLoan(payload);
      setResult(data);
      onResult?.(data, payload);
    } catch (err) {
      setApiError(formatError(err));
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  const reset = () => {
    setValues(DEFAULTS);
    setFundedTouched(false);
    setErrors({});
    setApiError("");
    setResult(null);
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mx-auto max-w-[1060px] rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-8"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl font-bold text-slate-900 sm:text-[26px]">Loan application details</h3>
          <p className="text-[14px] text-slate-500 mt-1">Your information is used to generate this assessment.</p>
        </div>
        <HelpCircle className="w-5 h-5 text-slate-400" aria-hidden="true" />
      </div>

      <div className="border-t border-slate-200 my-6" />

      <div className="space-y-8">
        {SECTIONS.map((section) => {
          const collapsible = section.title === "Credit profile";
          const hidden = collapsible && !creditOpen;
          return (
            <fieldset key={section.title}>
              <legend className="w-full">
                {collapsible ? (
                  <button
                    type="button"
                    onClick={() => setCreditOpen((o) => !o)}
                    aria-expanded={creditOpen}
                    className="flex w-full items-center justify-between text-[12px] font-semibold uppercase tracking-[0.08em] text-sky-700 font-mono mb-4"
                  >
                    <span>{section.title}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${creditOpen ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-sky-700 font-mono mb-4">
                    {section.title}
                  </span>
                )}
              </legend>

              {!hidden && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                  {section.fields.map((f) => (
                    <Field
                      key={f.name}
                      field={f}
                      value={values[f.name]}
                      error={errors[f.name]}
                      onChange={(v) => setValue(f.name, v)}
                    />
                  ))}

                  {section.title === "Credit profile" && (
                    <div className="flex flex-col justify-end">
                      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Calculated</p>
                        <p className="font-mono text-[13px] text-slate-800 mt-1">
                          DTI {dti == null ? "-" : `${dti.toFixed(1)}%`}
                        </p>
                        <p className="font-mono text-[13px] text-slate-800">
                          Utilization {utilization == null ? "-" : `${utilization.toFixed(1)}%`}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">Shown for reference, not sent</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </fieldset>
          );
        })}
      </div>

      {apiError && (
        <p role="alert" className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          {apiError}
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={reset}
          className="w-full rounded-lg px-4 py-3 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-100 sm:w-auto"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6 sm:text-[16px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              Generate assessment <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {result && <ResultCard result={result} />}
    </form>
  );
}

function Field({ field, value, error, onChange }) {
  const id = `f-${field.name}`;
  const base =
    "w-full h-[50px] rounded-lg border bg-white text-[14px] text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-colors";
  const border = error ? "border-rose-400" : "border-slate-200";

  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-slate-800 mb-2">
        {field.label}
      </label>

      <div className="relative">
        {field.type === "select" ? (
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            className={`${base} ${border} px-4`}
          >
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <>
            {field.prefix && (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[13px]">
                {field.prefix}
              </span>
            )}
            <input
              id={id}
              type="number"
              inputMode="decimal"
              value={value}
              min={field.min}
              max={field.max}
              step={field.step}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={`${id}-hint`}
              className={`${base} ${border} ${field.prefix ? "pl-8" : "pl-4"} ${field.suffix ? "pr-12" : "pr-4"}`}
            />
            {field.suffix && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[12px]">
                {field.suffix}
              </span>
            )}
          </>
        )}
      </div>

      <p id={`${id}-hint`} className={`mt-1.5 text-[12px] ${error ? "text-rose-600" : "text-slate-500"}`}>
        {error || field.hint}
      </p>
    </div>
  );
}

function ResultCard({ result }) {
  const pct = result.default_probability * 100;
  const style = LEVEL_STYLES[result.risk_level] || LEVEL_STYLES.LOW;
  const low = (result.thresholds?.low_risk_below ?? 0.3) * 100;
  const high = (result.thresholds?.high_risk_at_or_above ?? 0.6) * 100;

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6" role="status">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] uppercase tracking-wider text-slate-500 font-semibold">Default probability</p>
          <p className="font-mono text-[40px] leading-none font-semibold text-slate-900 mt-1">{pct.toFixed(1)}%</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded border text-[13px] font-semibold ${style.chip}`}>
          {result.risk_level?.[0] + result.risk_level?.slice(1).toLowerCase()} risk
        </span>
      </div>

      <div className="relative mt-5 h-2.5 rounded-full overflow-hidden bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400">
        <span
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-800 shadow"
          style={{ left: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <div className="relative mt-1 h-4 font-mono text-[10px] text-slate-400">
        <span className="absolute left-0">0%</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${low}%` }}>{low}%</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${high}%` }}>{high}%</span>
        <span className="absolute right-0">100%</span>
      </div>

      <p className="mt-4 text-[14px] text-slate-700">{result.recommendation}</p>
      {result.application_id != null && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[12px] text-slate-400">
            Saved as APP-{result.application_id}
          </p>
          <Link
            to={`/model-analytics?application_id=${encodeURIComponent(result.application_id)}`}
            className="inline-flex items-center gap-1.5 rounded bg-sky-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-800"
          >
            View Model Analytics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
