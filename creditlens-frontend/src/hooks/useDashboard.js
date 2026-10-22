import { useCallback, useEffect, useMemo, useState } from "react";
import { getApplications } from "../lib/api";

export default function useDashboard() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getApplications()
      .then(setApps)
      .catch((e) => setError(e.response?.data?.detail || e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const stats = useMemo(() => {
    const total = apps.length;
    const count = (lvl) => apps.filter((a) => a.risk_level === lvl).length;
    const low = count("LOW");
    const medium = count("MEDIUM");
    const high = count("HIGH");

    const avgDefault = total
      ? (apps.reduce((s, a) => s + a.default_probability, 0) / total) * 100
      : 0;
    const totalLoanAmount = apps.reduce((s, a) => s + a.loan_amount, 0);

    const distribution = [
      { name: "Low", value: low, color: "#34D399" },
      { name: "Medium", value: medium, color: "#FBBF24" },
      { name: "High", value: high, color: "#FB7185" },
    ];

    // applications per day (oldest -> newest)
    const byDay = {};
    apps.forEach((a) => {
      const day = a.created_at.slice(0, 10); // "2026-10-14"
      byDay[day] = (byDay[day] || 0) + 1;
    });
    const trend = Object.keys(byDay)
      .sort()
      .map((day) => ({
        day: new Date(day).toLocaleDateString("en", { day: "numeric", month: "short" }),
        count: byDay[day],
      }));

    const recent = [...apps]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return {
      total, high, avgDefault, totalLoanAmount,
      highRiskShare: total ? (high / total) * 100 : 0,
      distribution, trend, recent,
    };
  }, [apps]);

  return { stats, loading, error, reload: load };
}