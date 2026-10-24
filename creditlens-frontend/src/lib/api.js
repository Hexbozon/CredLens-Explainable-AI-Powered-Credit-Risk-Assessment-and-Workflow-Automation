import { landingCopy } from "../data/landing.js";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

async function request(path, options, fallbackMessage) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    if (error instanceof TypeError) throw new Error(fallbackMessage, { cause: error });
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  let body;
  try {
    body = contentType.includes("application/json") ? await response.json() : await response.text();
  } catch (error) {
    throw new Error(fallbackMessage, { cause: error });
  }

  if (!response.ok) {
    const detail = body && typeof body === "object" ? body.detail || body.message : body;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg || JSON.stringify(item)).join("; ")
      : detail;
    throw new Error(message || `Request failed with status ${response.status}.`);
  }

  return body;
}

export function assessLoan(application) {
  return request("/api/assess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(application),
  }, landingCopy.demo.errorFallback);
}

export function loginUser(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  }, landingCopy.auth.authenticationError);
}

export const getApplications = (params) => {
  const query = params ? `?${new URLSearchParams(params)}` : "";

  return request(
    `/api/applications${query}`,
    undefined,
    "Could not load applications.",
  ).then((body) => {
    if (!Array.isArray(body?.applications)) {
      throw new Error("The applications response did not include an applications list.");
    }

    return body.applications;
  });
};

export function getShapExplanation(applicationId) {
  if (applicationId == null || applicationId === "") {
    throw new Error("Please select an application.");
  }

  return request(
    `/api/applications/${encodeURIComponent(applicationId)}/shap`,
    { method: "GET" },
    "Unable to load SHAP explanation."
  );
}