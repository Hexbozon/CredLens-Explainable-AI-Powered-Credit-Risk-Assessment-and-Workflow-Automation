import ShapFactors from "../components/analytics/ShapFactors";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Bell,
  CircleHelp,
  Clock3,
  Download,
  FileText,
  Gavel,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Search,
  Shield,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Assess Loan", icon: Search, to: "/assess" },
  { label: "Applications", icon: FileText, to: "/applications" },
  { label: "Model Analytics", icon: BarChart3, to: "/model-analytics" },
  { label: "Explain", icon: CircleHelp, to: "/model-analytics#explanation" },
  { label: "Settings", icon: SlidersHorizontal, to: "/dashboard#settings" },
];



function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function ModelAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const handleApplicationChange = useCallback((application) => {
    setSelectedApplication(application);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", sidebarOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [sidebarOpen]);

  const probability =
    selectedApplication?.default_probability == null
      ? Number.NaN
      : Number(selectedApplication.default_probability);
  const probabilityPercent = Number.isFinite(probability)
    ? probability * 100
    : null;
  const gaugeProgress =
    probabilityPercent == null
      ? 0
      : Math.min(100, Math.max(0, probabilityPercent));
  const riskLevel = selectedApplication?.risk_level?.toUpperCase();
  const riskStyles = {
    LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
    MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
    HIGH: "border-rose-200 bg-rose-50 text-rose-700",
  };
  const createdAt = selectedApplication?.created_at
    ? new Date(selectedApplication.created_at)
    : null;
  const createdAtLabel =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleString()
      : "Date unavailable";
  const recommendation =
    selectedApplication?.recommendation ??
    "Select a saved application to view its backend recommendation.";

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 antialiased">
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/35 transition-opacity lg:hidden ${
          sidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white py-4 shadow-sm transition-transform lg:w-16 lg:items-center lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex w-full flex-col gap-6">
          <Link
            to="/dashboard"
            aria-label="CreditLens dashboard"
            className="mx-4 flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 shadow-sm lg:mx-auto"
          >
            <Shield className="h-5 w-5" />
          </Link>
          <nav aria-label="Main navigation" className="flex w-full flex-col gap-1.5">
            {navigation.map(({ label, icon: Icon, to }) => {
              const active = label === "Model Analytics";
              return (
                <Link
                  key={label}
                  to={to}
                  title={label}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex h-11 w-full items-center justify-start gap-3 px-5 transition-colors lg:justify-center lg:px-0 ${
                    active
                      ? "bg-sky-50/70 text-sky-700 before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:bg-sky-700"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 2} />
                  <span className="text-sm font-medium lg:hidden">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex w-full justify-start px-4 lg:justify-center lg:px-0">
          <button
            type="button"
            title="Account"
            aria-label="Account"
            className="flex h-9 items-center justify-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-2 text-slate-600 lg:w-9 lg:px-0"
          >
            <UserRound className="h-5 w-5" />
            <span className="pr-2 text-sm font-medium lg:hidden">Account</span>
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col bg-[#f8f9ff] lg:ml-16">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="rounded p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden w-full max-w-md sm:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                className="h-9 w-full rounded border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Search applications..."
                type="search"
                aria-label="Search applications"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 rounded border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="hidden font-mono text-[11px] font-medium sm:inline">
                TreeSHAP v2.4
              </span>
            </div>
            <span className="hidden font-mono text-[11px] text-slate-500 md:inline">
              Production v2.4
            </span>
            <button
              type="button"
              aria-label="Notifications"
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-700">
              <Shield className="h-4 w-4" />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
          <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">
                  Assessment Result
                </h1>
                <span className="rounded border border-sky-200 bg-sky-50 px-2 py-0.5 font-mono text-[11px] font-medium text-sky-700">
                  {selectedApplication
                    ? `APP-${selectedApplication.application_id}`
                    : "No application selected"}
                </span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700">
                  {selectedApplication
                    ? `Application ${selectedApplication.application_id}`
                    : "Saved application"}
                </span>
                <span aria-hidden="true">·</span>
                <span>{createdAtLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">
                  {selectedApplication
                    ? `${selectedApplication.risk_level ?? "Unclassified"} risk`
                    : "Select an application below"}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex h-9 items-center gap-1.5 rounded border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4 text-slate-500" />
                Dashboard
              </Link>
              <Link
                to="/assess"
                className="inline-flex h-9 items-center gap-1.5 rounded bg-sky-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-800"
              >
                <Search className="h-4 w-4" />
                New Assessment
              </Link>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-50/70 blur-3xl" />
            <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="flex flex-col items-center gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start lg:col-span-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
                <div
                  className="relative h-36 w-36 shrink-0"
                  role="img"
                  aria-label={
                    probabilityPercent == null
                      ? "No saved probability available"
                      : `Default probability ${probabilityPercent.toFixed(1)} percent`
                  }
                >
                  <svg
                    className="h-full w-full -rotate-90"
                    viewBox="0 0 120 120"
                    aria-hidden="true"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="9"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke={
                        riskLevel === "HIGH"
                          ? "#ef4444"
                          : riskLevel === "LOW"
                            ? "#10b981"
                            : "#f59e0b"
                      }
                      strokeDasharray="301.59"
                      strokeDashoffset={
                        probabilityPercent == null
                          ? "301.59"
                          : String(301.59 * (1 - gaugeProgress / 100))
                      }
                      strokeLinecap="round"
                      strokeWidth="9"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-[27px] font-semibold tracking-tight text-slate-900">
                      {probabilityPercent == null
                        ? "—"
                        : `${probabilityPercent.toFixed(1)}%`}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Default probability
                    </span>
                  </div>
                </div>
                <div className="flex w-full flex-col justify-center gap-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Metric classification
                    </span>
                    <h2 className="text-base font-semibold text-slate-900">
                      Default Probability
                    </h2>
                    <p className="text-xs text-slate-500">
                      {selectedApplication
                        ? `Saved result for APP-${selectedApplication.application_id}`
                        : "Probability is shown for the selected saved application."}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-slate-600">Model confidence</span>
                      <span className="font-semibold text-slate-500">
                        Not provided
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full border border-slate-100 bg-slate-100"
                      aria-hidden="true"
                    />
                    <p className="text-[11px] text-slate-400">
                      The assessment response does not include a confidence interval.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-5 lg:col-span-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono text-xs font-semibold tracking-wide ${
                      riskStyles[riskLevel] ??
                      "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        riskLevel === "HIGH"
                          ? "bg-rose-500"
                          : riskLevel === "LOW"
                            ? "bg-emerald-500"
                            : riskLevel === "MEDIUM"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                      }`}
                    />
                    {riskLevel ? `${riskLevel} RISK` : "NO RISK RESULT"}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed text-slate-600">
                    <span className="font-semibold text-slate-900">
                      Backend recommendation:{" "}
                    </span>
                    {recommendation}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
                  <Metric
                    label="REQUESTED LOAN"
                    value={
                      selectedApplication?.loan_amount == null
                        ? "—"
                        : `$${Number(selectedApplication.loan_amount).toLocaleString()}`
                    }
                  />
                  <Metric
                    label="LOAN TERM"
                    value={
                      selectedApplication?.loan_term == null
                        ? "—"
                        : `${selectedApplication.loan_term} months`
                    }
                  />
                  <Metric
                    label="FICO SCORE"
                    value={selectedApplication?.fico_score ?? "—"}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <ShapFactors onApplicationChange={handleApplicationChange} />
            </div>

                        <div className="flex flex-col gap-6 xl:col-span-4">
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-base font-semibold text-slate-900">
                    Saved Application Profile
                  </h2>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                    DATABASE
                  </span>
                </div>
                <div className="space-y-2.5 font-mono text-xs">
                  {[
                    ["Annual income", selectedApplication?.annual_income, "text-slate-900"],
                    ["Employment length", selectedApplication?.employment_length == null ? null : `${selectedApplication.employment_length} years`, "text-slate-900"],
                    ["Home ownership", selectedApplication?.home_ownership, "text-slate-900"],
                    ["Interest rate", selectedApplication?.interest_rate == null ? null : `${selectedApplication.interest_rate}%`, "text-slate-900"],
                  ].map(([label, value, valueClass]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3 rounded border border-slate-100 bg-slate-50 p-2.5"
                    >
                      <span className="text-slate-500">{label}</span>
                      <span className={`text-right font-semibold ${valueClass}`}>
                        {value ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="flex flex-1 flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 pb-2">
                    <SlidersHorizontal className="h-4 w-4 text-sky-700" />
                    <h2 className="text-base font-semibold text-slate-900">
                      What-If Sensitivity
                    </h2>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">
                    The current backend does not provide counterfactual or
                    what-if prediction estimates.
                  </p>
                </div>
                <div className="space-y-2.5 border-t border-slate-100 pt-3 font-mono text-xs">
                  <p className="rounded bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
                    Assessment probability and SHAP explanation are available
                    for saved applications. Scenario results are not available.
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  title="Interactive stress testing is not connected yet"
                  className="w-full rounded border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  Open Interactive Stress Tester
                </button>
              </article>
            </div>
          </section>

          <section
            id="explanation"
            className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start gap-3.5 rounded-lg border border-sky-100 bg-sky-50/60 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-sky-100 bg-white text-sky-700 shadow-sm">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900">
                    Executive Underwriting Summary
                  </h2>
                  <span className="rounded bg-sky-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-800">
                    SAVED API RESULT
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-800">
                  {selectedApplication
                    ? `Application APP-${selectedApplication.application_id} ${
                        probabilityPercent == null
                          ? "has no saved default probability"
                          : `has a ${probabilityPercent.toFixed(1)}% default probability`
                      } and is classified as ${riskLevel ?? "unclassified"}.`
                    : "Select a saved application to view its assessment result."}
                </p>
                <p className="text-xs leading-relaxed text-slate-600">
                  Backend recommendation: {recommendation}
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-4 border-t border-slate-200 pt-4 lg:flex-row lg:items-center">
              <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  Created: {createdAtLabel}
                </span>
                {selectedApplication && (
                  <span>Application ID: APP-{selectedApplication.application_id}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled
                  title="Adverse action notice generation is not connected yet"
                  className="inline-flex h-10 items-center gap-2 rounded border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
                >
                  <Gavel className="h-4 w-4 text-slate-500" />
                  Generate Adverse Action Notice
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-10 items-center gap-2 rounded border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Download className="h-4 w-4 text-slate-500" />
                  Export SHAP Audit PDF
                </button>
                <button
                  type="button"
                  disabled
                  title="Assessment approval is not connected yet"
                  className="inline-flex h-10 items-center gap-2 rounded bg-sky-700 px-5 text-sm font-medium text-white"
                >
                  <BadgeCheck className="h-4 w-4" />
                  Approve with Terms
                </button>
              </div>
            </div>
          </section>
          <p className="flex items-center gap-2 text-xs text-slate-400">
            Analytics reflect saved backend assessment and SHAP responses.
            Unsupported actions and scenario estimates are not presented as live
            results.
          </p>
        </main>
      </div>
    </div>
  );
}
