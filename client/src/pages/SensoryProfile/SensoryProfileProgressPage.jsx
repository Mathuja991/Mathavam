import { useCallback, useState } from "react";
import axios from "axios";
import QuadrantGraph, {
  CLASS_COLUMNS,
  classifyQuadrantScore,
} from "../../components/assessmentForms/SensoryProfile/QuadrantGraph";
import { API_BASE_URL } from "../../utills/apiUtils";

const QUADRANT_SECTIONS = [
  {
    key: "SK",
    label: "Seeking / Seeker",
    description: "Seeking",
    headerClass: "bg-amber-100 text-amber-800",
    borderClass: "border-amber-200",
    qids: [14, 21, 22, 25, 27, 28, 30, 31, 32, 41, 48, 49, 50, 51, 55, 56, 60, 82, 83],
  },
  {
    key: "AV",
    label: "Avoiding / Avoider",
    description: "Avoiding",
    headerClass: "bg-indigo-100 text-indigo-800",
    borderClass: "border-indigo-200",
    qids: [1, 2, 5, 15, 18, 58, 59, 61, 63, 64, 65, 66, 67, 68, 70, 71, 72, 74, 75, 81],
  },
  {
    key: "SN",
    label: "Sensitivity / Sensor",
    description: "Sensitivity",
    headerClass: "bg-lime-100 text-lime-800",
    borderClass: "border-lime-200",
    qids: [3, 4, 6, 7, 9, 13, 16, 19, 20, 44, 45, 46, 47, 52, 69, 73, 77, 78, 84],
  },
  {
    key: "RG",
    label: "Registration / Bystander",
    description: "Registration",
    headerClass: "bg-rose-100 text-rose-800",
    borderClass: "border-rose-200",
    qids: [8, 12, 23, 24, 26, 33, 34, 35, 36, 37, 38, 39, 40, 53, 54, 57, 62, 76, 79, 80, 85, 86],
  },
];

const SCORE_KEY = [
  { value: 5, text: "Almost Always = 90% or more" },
  { value: 4, text: "Frequently = 75%" },
  { value: 3, text: "Half the Time = 50%" },
  { value: 2, text: "Occasionally = 25%" },
  { value: 1, text: "Almost Never = 10% or less" },
];

const normalizeDateOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().split("T")[0];
};

const buildAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    "x-auth-token": token,
    Authorization: `Bearer ${token}`,
  };
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const base = formatDate(date);
  const time = date.toLocaleTimeString();
  return `${base} ${time}`;
};

const buildResponseMap = (sections = []) => {
  const map = {};
  sections.forEach((section) => {
    (section.responses || []).forEach((response) => {
      if (!map[response.qid]) {
        map[response.qid] = {
          score: response.score,
          quadrant: response.quadrant,
        };
      }
    });
  });
  return map;
};

function SensoryProfileProgressPage() {
  const [tables, setTables] = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [childNo, setChildNo] = useState("");
  const [showGraph, setShowGraph] = useState(false);
  const [showTrend, setShowTrend] = useState(false);

  const renderSparkline = (points) => {
    if (!points.length) return null;
    const width = 220;
    const height = 70;
    const padding = 8;
    const maxY = Math.max(...points.map((p) => p.total), 1);
    const minY = Math.min(...points.map((p) => p.total), 0);
    const yRange = Math.max(maxY - minY, 1);
    const step = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
    const path = points
      .map((p, idx) => {
        const x = padding + idx * step;
        const y = height - padding - ((p.total - minY) / yRange) * (height - padding * 2);
        return `${idx === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16">
        <path d={path} fill="none" stroke="#6366f1" strokeWidth="2.5" />
        {points.map((p, idx) => {
          const x = padding + idx * step;
          const y = height - padding - ((p.total - minY) / yRange) * (height - padding * 2);
          return (
            <circle
              key={`${p.date}-${idx}`}
              cx={x}
              cy={y}
              r="4"
              fill="#a855f7"
              stroke="#fff"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    );
  };

  const openPrintWindow = (title, bodyContent) => {
    if (typeof window === "undefined") return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #111827; }
            h1, h2, h3 { margin-bottom: 8px; }
            .section { margin-bottom: 24px; }
            table { border-collapse: collapse; width: 100%; margin-top: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
            th { background: #f3f4f6; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; border: 1px solid #94a3b8; font-size: 12px; }
            ul { margin-top: 8px; }
          </style>
        </head>
        <body>${bodyContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

const buildQuadrantDetails = (table) =>
  QUADRANT_SECTIONS.map((quadrant) => {
    const total = quadrant.qids.reduce(
      (sum, qid) => sum + (Number(table.responseMap[qid]?.score ?? 0) || 0),
      0
    );
    const classification = classifyQuadrantScore(quadrant.key, total);
    return { quadrant, total, classification };
  });

  const generateTables = useCallback(async () => {
    const trimmedChild = childNo.trim();
    if (!trimmedChild) {
      setError("Please enter a Child No before generating.");
      setTables([]);
      return;
    }
    setIsGenerating(true);
    setError("");
    try {
      const headers = buildAuthHeaders();
      if (!headers["x-auth-token"]) {
        throw new Error("Missing auth token. Please log in again.");
      }
      const response = await axios.get(`${API_BASE_URL}/assessments/sensory-profile`, {
        params: { patientId: trimmedChild },
        headers,
      });
      const allSections = Array.isArray(response.data) ? response.data : [];

      if (allSections.length === 0) {
        setTables([]);
        setError(`No records found for Child No ${trimmedChild}.`);
        return;
      }

      const grouped = {};

      allSections.forEach((doc) => {
        if (!doc.patientId || !doc.testDate) return;
        const dateKey = normalizeDateOnly(doc.testDate);
        const groupKey = `${doc.patientId}__${dateKey}`;
        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            patientId: doc.patientId,
            examinerId: doc.examinerId,
            testDate: doc.testDate,
            recordedAt: doc.submittedAt || doc.updatedAt || doc.createdAt || null,
            sections: [],
          };
        }
        grouped[groupKey].sections.push(doc);
        const docTimestamp = doc.submittedAt || doc.updatedAt || doc.createdAt;
        if (
          docTimestamp &&
          (!grouped[groupKey].recordedAt ||
            new Date(docTimestamp) > new Date(grouped[groupKey].recordedAt))
        ) {
          grouped[groupKey].recordedAt = docTimestamp;
        }
      });

      const formattedTables = Object.values(grouped).map((group) => ({
        ...group,
        responseMap: buildResponseMap(group.sections),
      }));

      formattedTables.sort(
        (a, b) =>
          new Date(b.recordedAt || b.testDate || 0) -
          new Date(a.recordedAt || a.testDate || 0)
      );

      setAllAssessments(formattedTables);
      // Only keep the most recent assessment for this child number
      setTables(formattedTables.length ? [formattedTables[0]] : []);
      setShowGraph(false);
      setShowTrend(false);
    } catch (err) {
      console.error("Failed to load sensory profile tables:", err);
      setError("Unable to load sensory profile records.");
      setTables([]);
      setAllAssessments([]);
      setShowGraph(false);
      setShowTrend(false);
    } finally {
      setIsGenerating(false);
    }
  }, [childNo]);

  const handleGenerateGraph = () => {
    if (!tables.length) {
      setError("Generate table first, then create the graph.");
      return;
    }
    setShowGraph(true);
  };

  const handleShowTrend = () => {
    if (!allAssessments.length) {
      setError("Generate data first, then view trend over time.");
      return;
    }
    setShowTrend(true);
    setShowGraph(false);
  };

  const handlePrintTables = () => {
    if (!tables.length) {
      setError("Generate table before printing.");
      return;
    }
    const content = tables
      .map((table) => {
        const quadrantsHtml = QUADRANT_SECTIONS.map((quadrant) => {
          const rows = quadrant.qids
            .map((qid) => {
              const score = table.responseMap[qid]?.score ?? "";
              return `<tr><td>${qid}</td><td>${score}</td></tr>`;
            })
            .join("");
          const total = quadrant.qids.reduce(
            (sum, qid) => sum + (Number(table.responseMap[qid]?.score ?? 0) || 0),
            0
          );
          return `
            <div class="section">
              <h3>${quadrant.label}</h3>
              <table>
                <thead><tr><th>Item</th><th>Raw Score</th></tr></thead>
                <tbody>${rows}</tbody>
              </table>
              <p><strong>Total:</strong> ${total}</p>
            </div>`;
        }).join("");

        return `
          <section class="section">
            <h2>Child ${table.patientId} &mdash; ${formatDate(table.testDate)}</h2>
            <p><strong>Therapist ID:</strong> ${table.examinerId || "N/A"} |
            <strong>Recorded:</strong> ${formatDateTime(table.recordedAt || table.testDate)}</p>
            ${quadrantsHtml}
          </section>`;
      })
      .join("");

    openPrintWindow("Sensory Profile Table", content);
  };

  const handlePrintGraph = () => {
    if (!tables.length) {
      setError("Generate table before printing the graph.");
      return;
    }

    const graphBox = `
      <div style="background:linear-gradient(90deg,#ecfdf5,#ffffff,#ecfdf5);border:1px solid #a7f3d0;border-radius:24px;padding:24px;">
        <svg viewBox="0 0 600 180" style="width:100%;height:130px;">
          <defs>
            <linearGradient id="printBellGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#34d399" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#34d399" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path d="M20 150 C 150 20, 450 20, 580 150" stroke="#059669" stroke-width="3" fill="url(#printBellGradient)" />
          <line x1="20" y1="150" x2="580" y2="150" stroke="#a7f3d0" stroke-width="2" />
          <g stroke="#6ee7b7" stroke-dasharray="6 4">
            <line x1="20" y1="30" x2="20" y2="150" />
            <line x1="160" y1="30" x2="160" y2="150" />
            <line x1="300" y1="30" x2="300" y2="150" />
            <line x1="440" y1="30" x2="440" y2="150" />
            <line x1="580" y1="30" x2="580" y2="150" />
          </g>
          <g fill="#065f46" font-size="10" font-family="Arial" font-weight="600">
            <text x="20" y="20" text-anchor="middle">-2 SD</text>
            <text x="160" y="20" text-anchor="middle">-1 SD</text>
            <text x="300" y="20" text-anchor="middle">X</text>
            <text x="440" y="20" text-anchor="middle">+1 SD</text>
            <text x="580" y="20" text-anchor="middle">+2 SD</text>
          </g>
        </svg>
        <p style="text-align:center;font-size:12px;font-weight:600;color:#065f46;margin-top:8px;">
          Less Than Others &larr; Normal Curve &rarr; More Than Others
        </p>
      </div>`;

    const content = tables
      .map((table) => {
        const details = buildQuadrantDetails(table);
        const bullets = details
          .map(({ quadrant, total, classification }) =>
            classification.label === "No Data"
              ? `<li>${quadrant.label}: score unavailable.</li>`
              : `<li>${quadrant.label} (${total}) classified as "${classification.label}". ${classification.definition}</li>`
          )
          .join("");

        return `
          <section class="section">
            <h2>Child ${table.patientId} &mdash; ${formatDate(table.testDate)}</h2>
            <p><strong>Therapist ID:</strong> ${table.examinerId || "N/A"} |
            <strong>Recorded:</strong> ${formatDateTime(table.recordedAt || table.testDate)}</p>
            ${graphBox}
            <p><strong>Quadrant Notes:</strong></p>
            <ul>${bullets}</ul>
          </section>`;
      })
      .join("");

    openPrintWindow("Sensory Profile Graph", content);
  };

  const renderQuadrant = (table, quadrant) => {
    const rows = quadrant.qids.map((qid) => {
      const response = table.responseMap[qid];
      return {
        qid,
        score: response?.score ?? "",
      };
    });
    const total = rows.reduce((sum, row) => sum + (Number(row.score) || 0), 0);

    return (
      <div
        key={`${table.patientId}-${quadrant.key}`}
        className={`rounded-2xl border-2 ${quadrant.borderClass} bg-white overflow-hidden shadow`}
      >
        <div className={`px-4 py-3 flex items-center justify-between font-semibold ${quadrant.headerClass}`}>
          <span>{quadrant.label}</span>
          <span className="text-sm font-bold">{quadrant.key}</span>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 px-4 py-2">
            <span>Item</span>
            <span className="text-right">Raw Score</span>
          </div>
          {rows.map((row) => (
            <div
              key={`${quadrant.key}-${row.qid}`}
              className="grid grid-cols-2 px-4 py-2 text-sm"
            >
              <span>{row.qid}</span>
              <span className="text-right font-semibold text-gray-800">
                {row.score}
              </span>
            </div>
          ))}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-3 text-sm font-bold bg-gray-50">
            <span>{quadrant.description} Quadrant Raw Score Total</span>
            <span className="border-t border-dashed border-gray-300"></span>
            <span>{total}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-8">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">
                Sensory Profile
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                Progress Tables
              </h1>
              <p className="text-gray-600 mt-2">
                Generate quadrant-wise tables for the most recent assessment dates per child.
                Each entry combines the base form details and the final recorded scores.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                value={childNo}
                onChange={(e) => setChildNo(e.target.value)}
                placeholder="Enter Child No"
                className="px-4 py-3 rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none min-w-[220px]"
              />
            <button
              onClick={generateTables}
              disabled={isGenerating}
              className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
            >
              {isGenerating ? "Generating..." : "Generate Table"}
            </button>
            <button
              onClick={handleGenerateGraph}
              className="px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition"
              disabled={!tables.length}
            >
              Generate Graph
            </button>
            <button
              onClick={handleShowTrend}
              className="px-6 py-3 rounded-full bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition"
              disabled={!allAssessments.length}
            >
              Overall Over Time
            </button>
          </div>
          {error && (
            <div className="px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-green-100 shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-green-700">Icon Key</h2>
            <div className="space-y-3">
              {QUADRANT_SECTIONS.map((quadrant) => (
                <div
                  key={quadrant.key}
                  className="flex items-center justify-between px-4 py-2 rounded-xl border border-gray-100 bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`${quadrant.headerClass} px-3 py-1 rounded-full text-xs font-bold`}
                    >
                      {quadrant.key}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {quadrant.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-green-100 shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-green-700">Score Key</h2>
            <div className="space-y-2">
              {SCORE_KEY.map((item) => (
                <div
                  key={item.value}
                  className="flex items-center justify-between px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 text-sm font-semibold text-gray-700"
                >
                  <span className="text-lg font-bold text-green-700">
                    {item.value}
                  </span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {tables.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500 font-medium">
            {error
              ? "No table to display."
              : "Enter a Child No and click \"Generate Table\" to see results."}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={handlePrintTables}
                className="px-5 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
              >
                Print Table
              </button>
            </div>
            {tables.map((table) => (
              <div
                key={`${table.patientId}-${table.recordedAt || table.testDate}`}
                className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden"
              >
                <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-blue-800 font-semibold uppercase tracking-wide">
                      Child No: {table.patientId}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      Assessment Date: {formatDate(table.testDate)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Therapist ID: {table.examinerId || "N/A"}</div>
                    <div>
                      Recorded At:{" "}
                      {formatDateTime(table.recordedAt || table.testDate)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 p-6">
                  {QUADRANT_SECTIONS.map((quadrant) =>
                    renderQuadrant(table, quadrant)
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {showGraph && (
          <QuadrantGraph
            tables={tables}
            quadrantSections={QUADRANT_SECTIONS}
            formatDate={formatDate}
            formatDateTime={formatDateTime}
            onPrint={handlePrintGraph}
          />
        )}

        {showTrend && allAssessments.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-6 space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                  Sensory Profile
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  Quadrant Progress Over Time
                </h2>
                <p className="text-gray-600">
                  Trend of quadrant totals across all recorded assessment dates for this child.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUADRANT_SECTIONS.map((quadrant) => {
                const points = allAssessments.map((assessment) => {
                  const total = quadrant.qids.reduce(
                    (sum, qid) =>
                      sum + (Number(assessment.responseMap[qid]?.score ?? 0) || 0),
                    0
                  );
                  return {
                    date: formatDate(assessment.testDate),
                    total,
                    recordedAt: assessment.recordedAt,
                  };
                });

                return (
                  <div
                    key={`trend-${quadrant.key}`}
                    className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`${quadrant.headerClass} px-3 py-1 rounded-full text-xs font-bold`}
                        >
                          {quadrant.key}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {quadrant.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            Raw score trend across assessments
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {points.length} assessment(s)
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-white border border-purple-100 rounded-xl px-3 py-2">
                        {renderSparkline(points)}
                      </div>
                      {points.map((pt, idx) => (
                        <div
                          key={`${quadrant.key}-${pt.date}-${idx}`}
                          className="flex items-center justify-between text-sm bg-white border border-purple-50 rounded-xl px-3 py-2"
                        >
                          <div className="text-gray-700 font-semibold">
                            {pt.total}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {pt.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SensoryProfileProgressPage;
