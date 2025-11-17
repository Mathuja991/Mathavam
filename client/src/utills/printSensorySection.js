const formatDateForPrint = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const buildResponsesTable = (responses = []) => {
  if (!responses || responses.length === 0) {
    return `<p>No responses available.</p>`;
  }

  const rows = responses
    .map(
      (response) => `
        <tr>
          <td>${response.qid ?? ""}</td>
          <td>${response.quadrant ?? ""}</td>
          <td>${response.score ?? ""}</td>
        </tr>`
    )
    .join("");

  return `
    <table class="responses">
      <thead>
        <tr>
          <th>QID</th>
          <th>Quadrant</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
};

export const printSensorySection = ({ baseInfo = {}, sectionData = {} }) => {
  if (typeof window === "undefined") return;

  const {
    patientId = "",
    examinerId = "",
    testDate = "",
    ageGroup = "",
  } = baseInfo;
  const {
    category = "",
    responses = [],
    rawScore = "",
    comments = "",
  } = sectionData;

  const formattedDate = formatDateForPrint(testDate);
  const responsesTable = buildResponsesTable(responses);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title> ${patientId} - ${category} </title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            padding: 24px;
            color: #111827;
          }
          h1, h2 {
            margin-bottom: 8px;
          }
          .section {
            margin-bottom: 24px;
          }
          .details {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          .details th,
          .details td {
            text-align: left;
            padding: 8px;
            border: 1px solid #d1d5db;
          }
          .responses {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }
          .responses th,
          .responses td {
            border: 1px solid #d1d5db;
            padding: 6px;
            text-align: left;
          }
          .comments {
            margin-top: 12px;
            padding: 12px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="section">
          <h1>Sensory Profile Section</h1>
          <table class="details">
            <tbody>
              <tr>
                <th>Patient ID</th>
                <td>${patientId}</td>
                <th>Therapist ID</th>
                <td>${examinerId}</td>
              </tr>
              <tr>
                <th>Assessment Date</th>
                <td>${formattedDate}</td>
                <th>Age Group</th>
                <td>${ageGroup}</td>
              </tr>
              <tr>
                <th>Section</th>
                <td colspan="3">${category}</td>
              </tr>
              <tr>
                <th>Raw Score</th>
                <td>${rawScore}</td>
                <th colspan="2"></th>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="section">
          <h2>Responses</h2>
          ${responsesTable}
        </div>
        <div class="section">
          <h2>Comments</h2>
          <div class="comments">${comments || "No comments provided."}</div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

