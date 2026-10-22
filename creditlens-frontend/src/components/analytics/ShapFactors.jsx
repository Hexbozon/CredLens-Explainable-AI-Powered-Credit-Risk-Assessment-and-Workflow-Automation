import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Activity, ArrowDown, ArrowUp, RefreshCw } from "lucide-react";
import { getApplications, getShapExplanation } from "../../lib/api";

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

function orderNewestFirst(applications) {
  return applications
    .map((application, index) => ({ application, index }))
    .filter(({ application }) => application.application_id != null)
    .sort((a, b) => {
      const aTime = Date.parse(a.application.created_at);
      const bTime = Date.parse(b.application.created_at);
      if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
        return bTime - aTime;
      }
      return a.index - b.index;
    })
    .map(({ application }) => application);
}

function getFactors(explanation) {
  if (
    !explanation ||
    !Array.isArray(explanation.risk_factors) ||
    !Array.isArray(explanation.positive_factors)
  ) {
    throw new Error("The SHAP response did not contain the expected feature groups.");
  }

  return [
    ...explanation.risk_factors.map((factor) => ({
      ...factor,
      direction: "increases_risk",
    })),
    ...explanation.positive_factors.map((factor) => ({
      ...factor,
      direction: "reduces_risk",
    })),
  ];
}

export default function ShapFactors({ onApplicationChange }) {
  const reduceMotion = useReducedMotion();
  const [searchParams] = useSearchParams();
  const requestedApplicationId = searchParams.get("application_id");
  const [applications, setApplications] = useState([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [explanation, setExplanation] = useState(null);
  const [explanationApplicationId, setExplanationApplicationId] = useState(null);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");
  const [explanationError, setExplanationError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const requestSequence = useRef(0);
  const requestPending = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadApplications() {
      setLoadingApplications(true);
      setApplicationsError("");
      setApplications([]);
      setSelectedApplicationId("");
      setExplanation(null);
      setExplanationApplicationId(null);
      setExplanationError("");

      try {
        const rows = orderNewestFirst(await getApplications());
        if (!active) return;

        setApplications(rows);
        const selected =
          rows.find(
            (application) =>
              String(application.application_id) === requestedApplicationId,
          ) ?? rows[0] ?? null;
        if (selected) {
          setSelectedApplicationId(String(selected.application_id));
          onApplicationChange?.(selected);
        } else {
          onApplicationChange?.(null);
        }
      } catch (error) {
        if (active) {
          setApplicationsError(error.message || "Could not load saved applications.");
          onApplicationChange?.(null);
        }
      } finally {
        if (active) setLoadingApplications(false);
      }
    }

    loadApplications();
    return () => {
      active = false;
    };
  }, [onApplicationChange, reloadKey, requestedApplicationId]);

  const selectedApplication =
    applications.find(
      (application) =>
        String(application.application_id) === selectedApplicationId,
    ) ?? null;

  const handleSelectionChange = (event) => {
    const applicationId = event.target.value;
    requestSequence.current += 1;
    requestPending.current = false;
    setLoadingExplanation(false);
    setSelectedApplicationId(applicationId);
    setExplanation(null);
    setExplanationApplicationId(null);
    setExplanationError("");
    onApplicationChange?.(
      applications.find(
        (application) => String(application.application_id) === applicationId,
      ) ?? null,
    );
  };

  const handleViewAnalysis = async () => {
    if (requestPending.current || loadingApplications || applicationsError) return;

    const application =
      selectedApplication ??
      applications[0] ??
      null;
    if (!application) return;

    const applicationId = String(application.application_id);
    if (applicationId !== selectedApplicationId) {
      setSelectedApplicationId(applicationId);
      onApplicationChange?.(application);
    }

    const sequence = requestSequence.current + 1;
    requestSequence.current = sequence;
    requestPending.current = true;
    setLoadingExplanation(true);
    setExplanationError("");
    setExplanation(null);
    setExplanationApplicationId(null);

    try {
      const response = await getShapExplanation(application.application_id);
      if (sequence !== requestSequence.current) return;
      if (String(response?.application_id) !== applicationId) {
        throw new Error("The SHAP response belongs to a different application.");
      }

      const factors = getFactors(response.explanation);
      setExplanation(factors);
      setExplanationApplicationId(applicationId);
    } catch (error) {
      if (sequence === requestSequence.current) {
        setExplanationError(error.message || "Could not load SHAP analysis.");
      }
    } finally {
      if (sequence === requestSequence.current) {
        requestPending.current = false;
        setLoadingExplanation(false);
      }
    }
  };

  const hasCurrentExplanation =
    explanationApplicationId === selectedApplicationId && explanation !== null;
  const factors = hasCurrentExplanation ? explanation : [];
  const maxImpact = Math.max(
    0,
    ...factors.map((factor) => Math.abs(Number(factor.shap_value))),
  );

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
      className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-sky-700" />
              <h2 className="text-base font-semibold text-slate-900">
                Key Risk Factors (TreeSHAP)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              SHAP contributions to the model&apos;s raw output (log-odds)
            </p>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 md:min-w-64">
            Application
            <select
              aria-label="Select application for SHAP analysis"
              value={selectedApplicationId}
              onChange={handleSelectionChange}
              disabled={loadingApplications || applications.length === 0}
              className="max-w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none disabled:bg-slate-100"
            >
              {applications.length === 0 && (
                <option value="">No saved applications</option>
              )}
              {applications.map((application) => (
                <option
                  key={application.application_id}
                  value={String(application.application_id)}
                >
                  APP-{application.application_id} ·{" "}
                  {formatDate(application.created_at)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {selectedApplication
              ? `Selected APP-${selectedApplication.application_id} · ${formatDate(selectedApplication.created_at)}`
              : "Choose a saved application to view its explanation."}
          </p>
          <div className="flex items-center gap-2">
            {applicationsError && (
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                disabled={loadingApplications}
                className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry applications
              </button>
            )}
            <button
              type="button"
              onClick={handleViewAnalysis}
              disabled={
                loadingApplications ||
                loadingExplanation ||
                applications.length === 0 ||
                Boolean(applicationsError)
              }
              className="rounded bg-sky-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingExplanation ? "Loading SHAP..." : "View SHAP Analysis"}
            </button>
          </div>
        </div>
      </div>

      {loadingApplications && (
        <p className="p-6 text-sm text-slate-500" role="status">
          Loading saved applications...
        </p>
      )}

      {!loadingApplications && applicationsError && (
        <p className="m-5 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          {applicationsError}
        </p>
      )}

      {!loadingApplications &&
        !applicationsError &&
        applications.length === 0 && (
          <p className="p-6 text-sm text-slate-500">
            No saved applications are available yet. Submit an assessment first
            to generate a SHAP analysis.
          </p>
        )}

      {loadingExplanation && (
        <p className="p-6 text-sm text-slate-500" role="status">
          Loading SHAP explanation for APP-{selectedApplicationId}...
        </p>
      )}

      {!loadingExplanation && explanationError && (
        <p className="m-5 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          {explanationError}
        </p>
      )}

      {!loadingApplications &&
        !applicationsError &&
        applications.length > 0 &&
        !hasCurrentExplanation &&
        !loadingExplanation &&
        !explanationError && (
          <p className="p-6 text-sm text-slate-500">
            Select an application and choose <strong>View SHAP Analysis</strong>{" "}
            to fetch its explanation.
          </p>
        )}

      {hasCurrentExplanation && factors.length === 0 && (
        <p className="p-6 text-sm text-slate-500">
          The backend returned no feature contributions for this application.
        </p>
      )}

      {hasCurrentExplanation && factors.length > 0 && (
        <motion.div
          key={explanationApplicationId}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: reduceMotion ? 0 : 0.07,
              },
            },
          }}
          className="divide-y divide-slate-100 px-4 py-2 sm:px-6"
        >
          {factors.map((factor, index) => {
            const contribution = Number(factor.shap_value);
            const increasesRisk = factor.impact === "increases_risk";
            const DirectionIcon = increasesRisk ? ArrowUp : ArrowDown;
            const width =
              maxImpact > 0
                ? (Math.abs(contribution) / maxImpact) * 100
                : 0;

            return (
              <motion.div
                key={`${factor.feature}-${index}`}
                variants={{
                  hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: reduceMotion ? 0 : 0.25 },
                  },
                }}
                className="grid grid-cols-1 items-center gap-2 rounded px-2 py-3.5 hover:bg-slate-50 md:grid-cols-12 md:gap-4"
              >
                <div className="md:col-span-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {factor.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {factor.description}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-slate-500">
                    Processed model value: {String(factor.value)}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-1 font-mono text-xs font-medium md:col-span-3 ${
                    increasesRisk ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  <DirectionIcon className="h-4 w-4" />
                  {increasesRisk ? "Increases risk" : "Reduces risk"}
                </div>

                <div className="flex items-center md:col-span-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className={`h-full rounded-full ${
                        increasesRisk ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                      initial={{ width: "0%" }}
                      animate={{ width: `${width}%` }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.65,
                        delay: reduceMotion ? 0 : index * 0.07,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>

                <div
                  className={`text-right font-mono text-sm font-semibold md:col-span-2 ${
                    increasesRisk ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {contribution > 0 ? "+" : ""}
                  {contribution.toFixed(4)}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {hasCurrentExplanation && factors.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
          Positive SHAP values increase the model&apos;s raw log-odds output for
          default; negative values reduce it. Feature values shown are the
          preprocessed values sent to the model, not original form inputs.
        </div>
      )}
    </motion.article>
  );
}
