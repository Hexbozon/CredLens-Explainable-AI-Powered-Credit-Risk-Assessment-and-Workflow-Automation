import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Search,
  FileText,
  BarChart3,
  CircleHelp,
  Settings,
  Bell,
  AlertTriangle,
  TrendingUp,
  Shield,
  ChevronDown,
  Menu,
  BadgeCheck,
  ChartColumn,
  RefreshCw,
  Download,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import useDashboard from "../hooks/useDashboard";
import RiskChip from "../components/ui/RiskChip";

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const compactMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

const fmtDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const number = (value) => Number(value) || 0;

export default function Dashboard() {
  const { stats, loading, error, reload } = useDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", sidebarOpen);

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [sidebarOpen]);

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      to: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Assess Loan",
      icon: Search,
      to: "/assess",
      active: pathname === "/assess",
    },
    { label: "Applications", icon: FileText, to: "/applications" },
    {
      label: "Model Analytics",
      icon: BarChart3,
      to: "/model-analytics",
      active: pathname === "/model-analytics",
    },
    { label: "Explain", icon: CircleHelp, to: "/#model" },
    { label: "Settings", icon: Settings, to: "#settings" },
  ];

  const applications = stats?.recent ?? [];
  const distribution = stats?.distribution ?? [];
  const trend = stats?.trend ?? [];

  const total = number(stats?.total);
  const high = number(stats?.high);
  const avgDefault = number(stats?.avgDefault);
  const totalLoanAmount = number(stats?.totalLoanAmount);
  const highRiskShare = number(stats?.highRiskShare);

  const exportApplications = () => {
    if (!applications.length) return;

    const columns = [
      "Application ID",
      "Date",
      "Loan Amount (USD)",
      "Default Probability",
      "Risk Level",
    ];

    const rows = applications.map((application) => [
      `APP-${application.application_id}`,
      fmtDate(application.created_at),
      number(application.loan_amount),
      `${(number(application.default_probability) * 100).toFixed(2)}%`,
      application.risk_level,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [columns, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "credit-risk-applications.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="min-h-screen bg-[#f8f9ff] text-slate-900 antialiased selection:bg-sky-200/80 selection:text-sky-900"
      style={{ fontFamily: 'Inter, "Segoe UI", sans-serif' }}
    >
      {/* Mobile sidebar overlay */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/35 transition-opacity duration-300 lg:hidden ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white py-4 shadow-sm transition-transform duration-300 lg:w-16 lg:items-center lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex w-full flex-col gap-6">
          <Link
            to="/dashboard"
            aria-label="Credit Risk Dashboard"
            className="mx-4 flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700 shadow-sm transition-colors hover:bg-sky-100 lg:mx-auto"
          >
            <Shield className="w-5 h-5" />
          </Link>

          <nav className="flex w-full flex-col gap-1.5">
            {navItems.map(({ label, icon: Icon, to, active }) => (
              <Link
                key={label}
                to={to}
                title={label}
                aria-label={label}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex h-11 w-full items-center justify-start gap-3 px-5 transition-all duration-150 lg:justify-center lg:px-0 ${
                  active
                    ? "text-sky-700 bg-sky-50/70 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-sky-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={active ? 2.3 : 2}
                />
                <span className="text-sm font-medium lg:hidden">{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex w-full justify-start px-4 lg:justify-center lg:px-0">
          <button
            type="button"
            title="Account"
            aria-label="Account"
            className="flex h-9 items-center justify-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-2 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 lg:w-9 lg:px-0"
          >
            <BadgeCheck className="w-5 h-5" />
            <span className="pr-2 text-sm font-medium lg:hidden">Account</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-16 flex flex-col min-h-screen bg-[#f8f9ff]">
        {/* Header */}
        <header className="w-full h-14 bg-white border-b border-slate-200 flex justify-between items-center px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="lg:hidden p-2 rounded text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />

              <input
                className="w-full h-9 pl-9 pr-4 rounded bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-colors"
                placeholder="Search applications..."
                type="search"
                aria-label="Search applications"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-sky-50 border border-sky-200 text-sky-700">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span className="font-mono text-[11px] font-medium">
                Model v1
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <button
              type="button"
              aria-label="Notifications"
              className="relative p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-sky-700" />
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="text-[13px] font-semibold text-slate-800 leading-none">
                  Credit Analyst
                </span>
                <span className="text-[11px] text-slate-500 leading-tight mt-1">
                  Lending Risk
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Page title */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-[28px] sm:text-[32px] leading-tight tracking-[-0.02em] font-semibold text-slate-900">
                Credit Risk Dashboard
              </h1>

              <p className="text-[14px] leading-5 text-slate-500 mt-1">
                A data-driven platform for smarter lending decisions
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Historical US lending data · Amounts in USD
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 shadow-sm">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-[12px] font-medium">
                  Portfolio Overview
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              <Link
                to="/assess"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-sky-700 text-white text-[13px] font-semibold hover:bg-sky-800 transition-colors shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Assess Loan</span>
              </Link>

              <button
                type="button"
                onClick={exportApplications}
                disabled={!applications.length}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-white border border-sky-200 text-sky-700 text-[13px] font-semibold hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </section>

          {/* Loading */}
          {loading && <DashboardSkeleton />}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-xl bg-white border border-rose-200 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Could not load dashboard
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {String(error)}
                  </p>
                  <button
                    type="button"
                    onClick={reload}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-900"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && total === 0 && (
            <div className="rounded-xl bg-white border border-slate-200 p-10 text-center shadow-sm">
              <div className="mx-auto w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-sky-700" />
              </div>

              <h2 className="text-lg font-semibold text-slate-900 mt-4">
                No applications yet
              </h2>

              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Complete your first credit risk assessment to start building
                your portfolio dashboard.
              </p>

              <Link
                to="/assess"
                className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg bg-sky-700 text-white text-sm font-semibold hover:bg-sky-800"
              >
                <Search className="w-4 h-4" />
                Assess your first loan
              </Link>
            </div>
          )}

          {/* Dashboard data */}
          {!loading && !error && total > 0 && (
            <>
              {/* KPI cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <KpiCard
                  title="Total Applications"
                  value={total.toLocaleString("en-US")}
                  icon={<FileText className="w-4 h-4" />}
                  tone="blue"
                  description="Recorded assessments"
                />

                <KpiCard
                  title="High Risk Applications"
                  value={high.toLocaleString("en-US")}
                  icon={<AlertTriangle className="w-4 h-4" />}
                  tone="rose"
                  description="Applications classified as high risk"
                />

                <KpiCard
                  title="Average Default Risk"
                  value={`${avgDefault.toFixed(1)}%`}
                  icon={<ChartColumn className="w-4 h-4" />}
                  tone="amber"
                  description="Mean predicted default probability"
                />
              </section>

              {/* Charts */}
              <section
                id="analytics"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                <Panel
                  title="Risk Distribution"
                  subtitle="Applications grouped by risk classification"
                  className="lg:col-span-5"
                  action={<Menu className="w-4 h-4 text-slate-400" />}
                >
                  {distribution.length > 0 ? (
                    <>
                      <div className="relative h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={distribution}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={65}
                              outerRadius={92}
                              paddingAngle={3}
                              stroke="none"
                            >
                              {distribution.map((item, index) => (
                                <Cell
                                  key={item.name}
                                  fill={
                                    item.color ||
                                    ["#10b981", "#f59e0b", "#ef4444"][index % 3]
                                  }
                                />
                              ))}
                            </Pie>

                            <Tooltip
                              formatter={(value, name) => [
                                `${value} applications`,
                                name,
                              ]}
                              contentStyle={{
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                                fontSize: 12,
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                          <span className="text-[28px] leading-9 font-semibold text-slate-900">
                            {total.toLocaleString("en-US")}
                          </span>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Applications
                          </span>
                        </div>
                      </div>

                      <Legend items={distribution} total={total} />
                    </>
                  ) : (
                    <ChartEmptyState message="No risk distribution data available." />
                  )}
                </Panel>

                <Panel
                  title="Applications Trend"
                  subtitle="Application submission volume over time"
                  className="lg:col-span-7"
                  action={
                    <span className="text-[11px] font-medium text-slate-500">
                      All risk classes
                    </span>
                  }
                >
                  {trend.length > 0 ? (
                    <div className="h-72 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={trend}
                          margin={{
                            top: 8,
                            right: 8,
                            left: -18,
                            bottom: 0,
                          }}
                        >
                          <defs>
                            <linearGradient
                              id="trendFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#0284c7"
                                stopOpacity={0.25}
                              />
                              <stop
                                offset="100%"
                                stopColor="#0284c7"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            stroke="#e2e8f0"
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="day"
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />

                          <YAxis
                            allowDecimals={false}
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />

                          <Tooltip
                            contentStyle={{
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              fontSize: 12,
                            }}
                          />

                          <Area
                            type="monotone"
                            dataKey="count"
                            name="Applications"
                            stroke="#0284c7"
                            strokeWidth={2.5}
                            fill="url(#trendFill)"
                            activeDot={{ r: 5 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <ChartEmptyState message="No trend data available yet." />
                  )}
                </Panel>
              </section>

              {/* Applications and insights */}
              <section
                id="applications"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                <Panel
                  title="Recent Applications"
                  subtitle="Latest recorded credit risk assessments"
                  className="lg:col-span-8 !p-0 overflow-hidden"
                  action={
                    <button
                      type="button"
                      onClick={exportApplications}
                      className="px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </button>
                  }
                  headerClassName="p-4"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/70 border-y border-slate-200">
                          <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Application ID
                          </th>
                          <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Date
                          </th>
                          <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-right text-slate-500">
                            Loan Amount
                          </th>
                          <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-right text-slate-500">
                            Default Risk
                          </th>
                          <th className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-center text-slate-500">
                            Risk Level
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {applications.map((application) => (
                          <tr
                            key={application.application_id}
                            className="hover:bg-sky-50/40 transition-colors"
                          >
                            <td className="py-3 px-4 text-[12px] font-medium text-sky-700 whitespace-nowrap">
                              APP-{application.application_id}
                            </td>

                            <td className="py-3 px-4 text-[12px] text-slate-500 whitespace-nowrap">
                              {fmtDate(application.created_at)}
                            </td>

                            <td className="py-3 px-4 text-[12px] font-medium text-slate-800 text-right whitespace-nowrap">
                              {money(application.loan_amount)}
                            </td>

                            <td className="py-3 px-4 text-[12px] text-slate-800 text-right whitespace-nowrap">
                              {(
                                number(application.default_probability) * 100
                              ).toFixed(1)}
                              %
                            </td>

                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <RiskChip level={application.risk_level} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {applications.length === 0 && (
                    <p className="p-6 text-center text-sm text-slate-500">
                      No recent applications found.
                    </p>
                  )}

                  <div className="px-4 py-3 bg-white border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                    Showing {applications.length} recent{" "}
                    {applications.length === 1 ? "application" : "applications"}
                  </div>
                </Panel>

                <Panel
                  title="Portfolio Insights"
                  subtitle="Summary of recorded assessments"
                  className="lg:col-span-4"
                  action={
                    <BarChart3 className="w-5 h-5 text-sky-700" />
                  }
                >
                  <div className="space-y-3.5">
                    <InsightBlock
                      title="Total Loan Amount"
                      value={compactMoney(totalLoanAmount)}
                      meta="Portfolio"
                      subtext="Sum of recorded loan amounts"
                      tone="sky"
                    />

                    <InsightBlock
                      title="Average Default Risk"
                      value={`${avgDefault.toFixed(1)}%`}
                      meta="Model output"
                      subtext="Average predicted probability"
                      tone="amber"
                    />

                    <InsightBlock
                      title="High Risk Applications"
                      value={`${highRiskShare.toFixed(1)}%`}
                      meta="Portfolio share"
                      subtext="Share classified as high risk"
                      tone="rose"
                    />
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-start gap-2 text-slate-500">
                    <Shield className="w-4 h-4 text-sky-700 mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-5">
                      Risk classifications are based on model predictions and
                      configured thresholds, not guaranteed lending outcomes.
                    </p>
                  </div>
                </Panel>
              </section>
            </>
          )}

          <footer className="text-[11px] text-slate-400 pb-2">
            Credit Risk Assessment &amp; Portfolio Analytics Platform ·
            Historical US lending data · For analytical use
          </footer>
        </main>
      </div>
    </div>
  );
}

/* Reusable components */

function Panel({
  title,
  subtitle,
  children,
  className = "",
  action,
  headerClassName = "px-5 pt-5 pb-3",
}) {
  return (
    <section
      className={`rounded-xl bg-white border border-slate-200 shadow-sm ${className}`}
    >
      <div
        className={`flex justify-between items-center gap-3 border-b border-slate-100 ${headerClassName}`}
      >
        <div>
          <h2 className="text-[16px] leading-6 font-semibold text-slate-900">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function KpiCard({ title, value, icon, tone, description }) {
  const themes = {
    blue: {
      bg: "bg-sky-50",
      border: "border-sky-100",
      text: "text-sky-700",
    },
    rose: {
      bg: "bg-rose-50",
      border: "border-rose-100",
      text: "text-rose-600",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-600",
    },
  };

  const theme = themes[tone] || themes.blue;

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start gap-3">
        <span className="text-[13px] font-medium text-slate-500">
          {title}
        </span>

        <div
          className={`w-9 h-9 rounded-lg ${theme.bg} border ${theme.border} ${theme.text} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <span className="text-[28px] leading-9 font-semibold text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">{description}</p>
    </div>
  );
}

function Legend({ items, total }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100">
      {items.map((item, index) => {
        const colors = ["#10b981", "#f59e0b", "#ef4444"];
        const color = item.color || colors[index % colors.length];
        const percentage = total
          ? Math.round((number(item.value) / total) * 100)
          : 0;

        return (
          <div
            key={item.name}
            className="flex flex-col items-center p-2 rounded bg-slate-50 border border-slate-200"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[11px] font-medium text-slate-600">
                {item.name}
              </span>
            </div>

            <span className="text-[12px] font-semibold text-slate-900">
              {percentage}%
            </span>

            <span className="text-[10px] text-slate-400">
              {number(item.value).toLocaleString("en-US")} applications
            </span>
          </div>
        );
      })}
    </div>
  );
}

function InsightBlock({ title, value, meta, subtext, tone }) {
  const themes = {
    sky: { label: "text-sky-700", icon: "text-sky-600" },
    amber: { label: "text-amber-600", icon: "text-amber-500" },
    rose: { label: "text-rose-600", icon: "text-rose-500" },
  };

  const theme = themes[tone] || themes.sky;

  return (
    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <span className="text-[11px] font-medium text-slate-500 block">
          {title}
        </span>
        <span className="text-[18px] leading-6 font-bold text-slate-900 mt-0.5 block">
          {value}
        </span>
      </div>

      <div className="text-right shrink-0">
        <span
          className={`text-[11px] font-semibold flex items-center justify-end ${theme.label}`}
        >
          <TrendingUp className={`w-3.5 h-3.5 mr-1 ${theme.icon}`} />
          {meta}
        </span>
        <span className="text-[10px] text-slate-400">{subtext}</span>
      </div>
    </div>
  );
}

function ChartEmptyState({ message }) {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-center">
      <BarChart3 className="w-8 h-8 text-slate-300" />
      <p className="text-sm text-slate-500 mt-3">{message}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-32 rounded-xl bg-white border border-slate-200"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-xl bg-white border border-slate-200" />
        <div className="h-80 rounded-xl bg-white border border-slate-200" />
      </div>

      <div className="h-80 rounded-xl bg-white border border-slate-200" />
    </div>
  );
}