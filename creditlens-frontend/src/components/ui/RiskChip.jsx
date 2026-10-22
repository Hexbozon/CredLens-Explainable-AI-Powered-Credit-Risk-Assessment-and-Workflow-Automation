const STYLES = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
  unknown: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function RiskChip({ level, className = "" }) {
  const normalizedLevel = String(level ?? "")
    .toLowerCase()
    .replace(/\s*risk\s*$/, "")
    .trim();

  const riskClass = ["low", "medium", "high"].includes(normalizedLevel)
    ? normalizedLevel
    : "unknown";

  const label =
    riskClass === "unknown"
      ? level || "Unknown"
      : `${riskClass.charAt(0).toUpperCase()}${riskClass.slice(1)}`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium ${STYLES[riskClass]} ${className}`.trim()}
    >
      {riskClass !== "unknown" && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}