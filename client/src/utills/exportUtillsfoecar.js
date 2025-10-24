import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// 🧭 Helper: Adds header with title, company name, and divider line
const addHeader = (doc) => {
  // --- Main Report Title ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CARS Assessment Report", 105, 15, { align: "center" });

  // --- Company Name ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Mathavam Centre for Neuro Developmental Disorders", 105, 22, {
    align: "center",
  });

  // --- Divider Line ---
  doc.setLineWidth(0.5);
  doc.line(20, 26, 190, 26);
};

// 🧾 Export a single entry
export const exportSingleEntryToPDF = (entry) => {
  const doc = new jsPDF();
  addHeader(doc);

  // --- Basic Information ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  let y = 40;
  doc.text(`Child Number: ${entry.childNo || "N/A"}`, 20, y);
  y += 8;
  doc.text(`Name: ${entry.name || "N/A"}`, 20, y);
  y += 8;
  doc.text(`Age: ${entry.age || "N/A"}`, 20, y);
  y += 8;
  doc.text(`Gender: ${entry.gender || "N/A"}`, 20, y);
  y += 8;
  doc.text(`Date: ${entry.date || "N/A"}`, 20, y);
  y += 10;

  // --- Scores Table ---
  const scoresData = [];
  if (entry.scores) {
    Object.entries(entry.scores).forEach(([key, value]) => {
      const formattedKey =
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
      scoresData.push([formattedKey.trim(), value]);
    });
  }

  // --- Total Score ---
  const totalScore = Object.values(entry.scores || {}).reduce(
    (acc, val) => acc + val,
    0
  );
  scoresData.push(["TOTAL SCORE", totalScore.toFixed(1)]);

  autoTable(doc, {
    startY: y,
    head: [["Assessment Area", "Score"]],
    body: scoresData,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text(`Severity: ${entry.severity?.label || "N/A"}`, 20, finalY);

  // --- Footer ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text("Confidential - For internal use only", 105, 285, {
    align: "center",
  });

  const fileName = `CARS_${entry.childNo || "unknown"}_${
    entry.date || "unknown"
  }.pdf`;
  doc.save(fileName);
};

// 🧾 Export all entries
export const exportEntriesToPDF = (entries) => {
  const doc = new jsPDF();
  addHeader(doc);

  const tableData = entries.map((entry) => [
    entry.childNo || "N/A",
    entry.name || "N/A",
    entry.age || "N/A",
    entry.gender || "N/A",
    entry.date || "N/A",
    entry.severity?.label || "N/A",
    Object.values(entry.scores || {})
      .reduce((acc, val) => acc + val, 0)
      .toFixed(1),
  ]);

  autoTable(doc, {
    startY: 35,
    head: [
      ["Child No", "Name", "Age", "Gender", "Date", "Severity", "Total Score"],
    ],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  // --- Footer ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text("Confidential - For internal use only", 105, 285, {
    align: "center",
  });

  doc.save("CARS_All_Entries.pdf");
};
