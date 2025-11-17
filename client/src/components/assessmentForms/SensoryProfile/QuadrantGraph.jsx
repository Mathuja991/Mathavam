import React from "react";

export const QUADRANT_CLASSIFICATIONS = {
  SK: {
    ranges: [
      { label: "Much Less Than Others", min: 0, max: 6 },
      { label: "Less Than Others", min: 7, max: 19 },
      { label: "Just Like the Majority of Others", min: 20, max: 47 },
      { label: "More Than Others", min: 48, max: 60 },
      { label: "Much More Than Others", min: 61, max: 95 },
    ],
    definition:
      "The degree to which a child obtains sensory input. A child with a Much More Than Others score in this pattern seeks sensory input at a higher rate than others.",
  },
  AV: {
    ranges: [
      { label: "Much Less Than Others", min: 0, max: 7 },
      { label: "Less Than Others", min: 8, max: 20 },
      { label: "Just Like the Majority of Others", min: 21, max: 47 },
      { label: "More Than Others", min: 48, max: 59 },
      { label: "Much More Than Others", min: 60, max: 100 },
    ],
    definition:
      "The degree to which a child is bothered by sensory input. A child with a Much More Than Others score in this pattern moves away from sensory input at a higher rate than others.",
  },
  SN: {
    ranges: [
      { label: "Much Less Than Others", min: 0, max: 6 },
      { label: "Less Than Others", min: 7, max: 17 },
      { label: "Just Like the Majority of Others", min: 18, max: 42 },
      { label: "More Than Others", min: 43, max: 53 },
      { label: "Much More Than Others", min: 54, max: 95 },
    ],
    definition:
      "The degree to which a child detects sensory input. A child with a Much More Than Others score in this pattern notices sensory input at a higher rate than others.",
  },
  RG: {
    ranges: [
      { label: "Much Less Than Others", min: 0, max: 6 },
      { label: "Less Than Others", min: 7, max: 18 },
      { label: "Just Like the Majority of Others", min: 19, max: 43 },
      { label: "More Than Others", min: 44, max: 55 },
      { label: "Much More Than Others", min: 56, max: 110 },
    ],
    definition:
      "The degree to which a child misses sensory input. A child with a Much More Than Others score in this pattern misses sensory input at a higher rate than others.",
  },
};

export const CLASS_COLUMNS = [
  "Much Less Than Others",
  "Less Than Others",
  "Just Like the Majority of Others",
  "More Than Others",
  "Much More Than Others",
];

const SD_MARKERS = [
  { label: "-2 SD", position: "0%" },
  { label: "-1 SD", position: "25%" },
  { label: "X", position: "50%" },
  { label: "+1 SD", position: "75%" },
  { label: "+2 SD", position: "100%" },
];

export const classifyQuadrantScore = (quadrantKey, score) => {
  const config = QUADRANT_CLASSIFICATIONS[quadrantKey];
  if (!config || Number.isNaN(Number(score))) {
    return {
      label: "No Data",
      definition: "Score unavailable for this quadrant.",
    };
  }
  const range =
    config.ranges.find(
      (range) => Number(score) >= range.min && Number(score) <= range.max
    ) || null;
  return {
    label: range?.label || "No Data",
    definition: config.definition,
  };
};

const QuadrantGraph = ({
  tables,
  quadrantSections,
  formatDate,
  formatDateTime,
  onPrint,
}) => {
  if (!Array.isArray(tables) || tables.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-lg border border-green-200 p-8 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-green-700">
              Quadrant Classification Graph
            </h2>
            <p className="text-gray-600">
              Compare quadrant raw scores to the Sensory Profile-2 norm curve.
              Scores one standard deviation or more from the mean are
              &ldquo;More Than&rdquo; or &ldquo;Less Than&rdquo; others.
            </p>
          </div>
          {typeof onPrint === "function" && (
            <button
              onClick={onPrint}
              className="self-start px-5 py-2 rounded-full bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
            >
              Print Graph
            </button>
          )}
        </div>

        {tables.map((table) => {
          const quadrantDetails = quadrantSections.map((quadrant) => {
            const total = quadrant.qids.reduce(
              (sum, qid) =>
                sum + (Number(table.responseMap[qid]?.score ?? 0) || 0),
              0
            );
            const classification = classifyQuadrantScore(quadrant.key, total);
            return { quadrant, total, classification };
          });

          return (
            <div
              key={`graph-${table.patientId}-${table.recordedAt || table.testDate}`}
              className="mb-10 last:mb-0"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <p className="text-sm uppercase tracking-wide text-green-600 font-semibold">
                    Child No: {table.patientId}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    Assessment Date: {formatDate(table.testDate)}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Recorded: {formatDateTime(table.recordedAt || table.testDate)}
                </p>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 rounded-3xl border border-emerald-200 px-6 py-6 mb-8 relative">
                <svg viewBox="0 0 600 180" className="w-full h-32">
                  <defs>
                    <linearGradient id="bellGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M20 150 C 150 20, 450 20, 580 150"
                    stroke="#059669"
                    strokeWidth="3"
                    fill="url(#bellGradient)"
                  />
                  <line x1="20" y1="150" x2="580" y2="150" stroke="#a7f3d0" strokeWidth="2" />
                  {SD_MARKERS.map((marker, index) => {
                    const positions = [20, 160, 300, 440, 580];
                    const x = positions[index];
                    return (
                      <g key={marker.label}>
                        <line
                          x1={x}
                          y1={30}
                          x2={x}
                          y2={150}
                          stroke="#6ee7b7"
                          strokeDasharray="6 4"
                        />
                        <text
                          x={x}
                          y={20}
                          textAnchor="middle"
                          className="text-[10px] font-semibold fill-emerald-900"
                        >
                          {marker.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <p className="text-center text-xs font-semibold text-emerald-900">
                  Less Than Others &larr; Normal Curve &rarr; More Than Others
                </p>
              </div>

              <div className="space-y-6">
                {quadrantDetails.map(({ quadrant, total, classification }) => (
                  <div
                    key={`row-${table.patientId}-${quadrant.key}`}
                    className="bg-gray-50 rounded-2xl border border-gray-200 p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`${quadrant.headerClass} px-3 py-1 rounded-full text-xs font-bold`}
                        >
                          {quadrant.key}
                        </span>
                        <p className="font-semibold text-gray-900">
                          {quadrant.label}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Raw Score Total:{" "}
                        <span className="font-bold text-gray-900">{total}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-xs font-semibold">
                      {CLASS_COLUMNS.map((column) => (
                        <div
                          key={column}
                          className={`px-3 py-4 text-center rounded-xl border ${
                            classification.label === column
                              ? "bg-green-600 text-white border-green-600 shadow-lg"
                              : "bg-white text-gray-600 border-gray-200"
                          }`}
                        >
                          <span className="block leading-tight">{column}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-gray-600 mt-2">
                      {classification.definition}
                    </p>
                  </div>
                ))}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuadrantGraph;
