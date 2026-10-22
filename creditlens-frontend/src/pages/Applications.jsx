import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Search,
  Shield,
  SlidersHorizontal,
} from "lucide-react";
import { getApplications } from "../lib/api";
import RiskChip from "../components/ui/RiskChip";

const PAGE_SIZES = [10, 25, 50];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Assess Loan", icon: Search, to: "/assess" },
  { label: "Applications", icon: FileText, to: "/applications" },
  { label: "Model Analytics", icon: BarChart3, to: "/model-analytics" },
  { label: "Explain", icon: Activity, to: "/model-analytics#explanation" },
  { label: "Settings", icon: SlidersHorizontal, to: "/dashboard#settings" },
];

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

function downloadCsv(applications) {
  const columns = [
    "Application ID",
    "Submission Date",
    "Loan Amount (USD)",
    "Loan Term (Months)",
    "Interest Rate",
    "Annual Income (USD)",
    "FICO Score",
    "Default Probability",
    "Risk Level",
  ];
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = applications.map((application) => [
    `APP-${application.application_id}`,
    formatDate(application.created_at),
    application.loan_amount,
    application.loan_term,
    application.interest_rate,
    application.annual_income,
    application.fico_score,
    application.default_probability == null
      ? ""
      : `${(Number(application.default_probability) * 100).toFixed(2)}%`,
    application.risk_level,
  ]);
  const csv = [columns, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "credit-risk-applications.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getApplications()
      .then((rows) => {
        if (active) setApplications(rows);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Could not load applications.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

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

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...applications]
      .filter((application) => {
        const matchesQuery =
          !normalizedQuery ||
          [
            application.application_id,
            application.loan_amount,
            application.loan_term,
            application.interest_rate,
            application.annual_income,
            application.fico_score,
          ].some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery));
        const matchesRisk =
          riskFilter === "all" ||
          String(application.risk_level ?? "").toLowerCase() === riskFilter;
        return matchesQuery && matchesRisk;
      })
      .sort((a, b) => {
        const aDate = Date.parse(a.created_at);
        const bDate = Date.parse(b.created_at);
        if (Number.isFinite(aDate) && Number.isFinite(bDate)) return bDate - aDate;
        return Number(b.application_id) - Number(a.application_id);
      });
  }, [applications, query, riskFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const pageApplications = filteredApplications.slice(
    startIndex,
    startIndex + pageSize,
  );

  const reload = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  const updateQuery = (value) => {
    setQuery(value);
    setPage(1);
  };

  const updateRiskFilter = (value) => {
    setRiskFilter(value);
    setPage(1);
  };

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
              const active = label === "Applications";
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
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium lg:hidden">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex w-full justify-start px-4 lg:justify-center lg:px-0">
          <div
            title="Account"
            aria-label="Account"
            className="flex h-9 items-center justify-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-2 text-slate-600 lg:w-9 lg:px-0"
          >
            <Shield className="h-4 w-4" />
            <span className="pr-2 text-sm font-medium lg:hidden">Account</span>
          </div>
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
            <Link to="/dashboard" className="hidden font-semibold tracking-tight text-slate-900 sm:block">
              CreditLens
            </Link>
            <div className="relative hidden w-full max-w-md sm:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                className="h-9 w-full rounded border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Search applications..."
                type="search"
                aria-label="Search applications"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-2 rounded border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-700 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-[11px] font-medium">Production v2.4</span>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-700">
              <Shield className="h-4 w-4" />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-5 p-4 sm:p-6">
          <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">
                Loan Applications
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Review submitted credit assessments and open their model explanations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => downloadCsv(filteredApplications)}
                disabled={filteredApplications.length === 0}
                className="inline-flex h-9 items-center gap-2 rounded border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <Link
                to="/assess"
                className="inline-flex h-9 items-center gap-2 rounded border border-sky-700 bg-sky-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-800"
              >
                <ArrowLeft className="h-4 w-4 rotate-180" />
                New assessment
              </Link>
            </div>
          </section>

          <section className="flex flex-col gap-3.5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-12">
              <div className="relative md:col-span-8 xl:col-span-9">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => updateQuery(event.target.value)}
                  className="h-9 w-full rounded border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="Search by application ID, amount, income, or FICO score..."
                  type="search"
                  aria-label="Filter applications"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 md:col-span-4 md:justify-end xl:col-span-3">
                <span className="shrink-0">Risk tier</span>
                <select
                  value={riskFilter}
                  onChange={(event) => updateRiskFilter(event.target.value)}
                  className="h-9 min-w-0 flex-1 rounded border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:border-sky-500 focus:outline-none md:flex-none"
                >
                  <option value="all">All risk levels</option>
                  <option value="low">Low risk</option>
                  <option value="medium">Medium risk</option>
                  <option value="high">High risk</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
              <p className="font-mono text-xs text-slate-500" aria-live="polite">
                {loading
                  ? "Loading applications..."
                  : `${filteredApplications.length.toLocaleString()} ${
                      filteredApplications.length === 1 ? "application" : "applications"
                    }`}
              </p>
              <button
                type="button"
                onClick={reload}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-sky-700 disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          </section>

          <section className="flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <p className="p-8 text-center text-sm text-slate-500" role="status">
                Loading applications...
              </p>
            ) : error ? (
              <div className="m-5 flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={reload}
                    className="mt-2 font-semibold underline underline-offset-2"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <FileText className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-900">
                  {applications.length === 0 ? "No applications yet" : "No matching applications"}
                </h2>
                <p className="mt-1 max-w-md text-sm text-slate-500">
                  {applications.length === 0
                    ? "Submit a credit assessment to add the first application to this queue."
                    : "Try changing your search or risk filter."}
                </p>
                {applications.length === 0 && (
                  <Link
                    to="/assess"
                    className="mt-4 inline-flex items-center gap-2 rounded bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
                  >
                    Assess a loan <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[940px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                        {[
                          ["Application ID", "text-left"],
                          ["Submission Date", "text-left"],
                          ["Loan Amount", "text-right"],
                          ["Term / Rate", "text-left"],
                          ["Annual Income", "text-right"],
                          ["FICO", "text-right"],
                          ["Default Risk", "text-right"],
                          ["Risk Tier", "text-center"],
                          ["Actions", "text-right"],
                        ].map(([heading, alignment]) => (
                          <th
                            key={heading}
                            scope="col"
                            className={`whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-wider ${alignment}`}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pageApplications.map((application) => (
                        <tr
                          key={application.application_id}
                          className="transition-colors hover:bg-sky-50/40"
                        >
                          <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-medium text-sky-700">
                            APP-{application.application_id}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-500">
                            {formatDate(application.created_at)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-xs font-semibold text-slate-900">
                            {money(application.loan_amount)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                            {application.loan_term ?? "—"} mo
                            <span className="mx-1.5 text-slate-300">/</span>
                            {application.interest_rate ?? "—"}%
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-xs text-slate-700">
                            {money(application.annual_income)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-xs text-slate-700">
                            {application.fico_score ?? "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-xs font-semibold text-slate-800">
                            {application.default_probability == null
                              ? "—"
                              : `${(Number(application.default_probability) * 100).toFixed(1)}%`}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-center">
                            <RiskChip level={application.risk_level} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right">
                            <Link
                              to={`/model-analytics?application_id=${encodeURIComponent(application.application_id)}`}
                              className="inline-flex items-center gap-1 font-medium text-sky-700 transition-colors hover:text-sky-900"
                            >
                              View SHAP <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-auto flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row">
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 sm:justify-start">
                    <span>
                      Showing{" "}
                      <strong className="text-slate-800">
                        {startIndex + 1}–{Math.min(startIndex + pageSize, filteredApplications.length)}
                      </strong>{" "}
                      of <strong className="text-slate-800">{filteredApplications.length}</strong>
                    </span>
                    <label className="flex items-center gap-2">
                      Rows
                      <select
                        value={pageSize}
                        onChange={(event) => {
                          setPageSize(Number(event.target.value));
                          setPage(1);
                        }}
                        className="h-8 rounded border border-slate-200 bg-white px-2 text-xs text-slate-700"
                      >
                        {PAGE_SIZES.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous page"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-2 font-mono text-xs text-slate-600">
                      {currentPage} / {pageCount}
                    </span>
                    <button
                      type="button"
                      aria-label="Next page"
                      disabled={currentPage >= pageCount}
                      onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          <footer className="flex items-center gap-2 pb-1 text-[11px] text-slate-400">
            <ArrowDown className="h-3.5 w-3.5" />
            Applications are ordered newest first. Select “View SHAP” to inspect model contributions.
          </footer>
        </main>
      </div>
    </div>
  );
}