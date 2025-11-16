// src/services/adminQrService.js
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:5000";

const SESSIONS_PATH = "/api/sessions";
const SUMMARY_PATH = "/api/sessions/summary"; // backend: add this route
const EXPORT_PATH = "/api/sessions/export.csv"; // backend: add this route

function clean(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

function toQuery(params) {
  const q = new URLSearchParams(clean(params));
  return q.toString();
}

/**
 * GET /api/sessions
 * Supports: from,to,service,staffId,q,status,page,pageSize,sort
 * Normalizes the response to { data: { items: [], total: number } }
 */
export async function listSessions(params = {}) {
  const query = toQuery(params);
  const url = `${API_BASE}${SESSIONS_PATH}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sessions fetch failed: ${res.status} ${text}`);
  }

  const json = await res.json();

  // Accept a few common shapes from backends:
  // 1) { items, total }
  // 2) { data: { items, total } }
  // 3) plain array with optional X-Total-Count header
  if (Array.isArray(json)) {
    const totalHeader = res.headers.get("X-Total-Count");
    return {
      data: {
        items: json,
        total: totalHeader ? Number(totalHeader) : json.length,
      },
    };
  }

  if (json?.data?.items && typeof json?.data?.total === "number") {
    return { data: json.data };
  }

  if (json?.items && typeof json?.total === "number") {
    return { data: { items: json.items, total: json.total } };
  }

  // Last resort: assume the whole object is one item list
  return {
    data: {
      items: Array.isArray(json?.items) ? json.items : [],
      total: json?.total ?? 0,
    },
  };
}

/**
 * GET /api/sessions/summary?from=...&to=...&...
 * Expected server response shape:
 * { total, avgDurationSeconds, uniqueChildrenCount }
 */
export async function summaryStats(filters = {}) {
  const query = toQuery(filters);
  const url = `${API_BASE}${SUMMARY_PATH}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Summary fetch failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return { data };
}

/**
 * Builds a CSV download URL.
 * You can implement GET /api/sessions/export.csv on the server to stream CSV.
 * If your server uses ?format=csv on /api/sessions instead, switch EXPORT_PATH to SESSIONS_PATH and append &format=csv.
 */
export function exportCsvUrl(filters = {}) {
  const query = toQuery(filters);
  return `${API_BASE}${EXPORT_PATH}${query ? `?${query}` : ""}`;
}
