import { jsPDF } from "jspdf";

export const exportSingleMFEntryToPDF = (entry) => {
  const doc = new jsPDF();

  // === PAGE HEADER ===
  const rightX = 200; // right margin reference (A4 ≈ 210mm)
  doc.setFontSize(8);

  // Right-aligned metadata
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, rightX, 10, { align: "right" });
  doc.text(`Child No: ${entry.childNo || "N/A"}`, rightX, 15, { align: "right" });
  doc.text(`Combined from ${entry.entryCount || 1} entries`, rightX, 20, { align: "right" });

  // Main title (centered)
  doc.setFontSize(16);
  doc.text("Mathavam Flowchart - Complete Assessment History", 105, 35, { align: "center" });

  // Organization name (under title, italic, smaller font)
  doc.setFontSize(11);
  doc.setFont(undefined);
  doc.text("Mathavam Centre for Neuro Developmental Desorders", 105, 42, { align: "center" });

  // Horizontal separator line
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(20, 47, 190, 47); // from x=20 to x=190, at y=47

  let currentY = 55; // main content starts below the line

  // === PATIENT INFORMATION ===
  doc.setFont(undefined, "normal");
  doc.setFontSize(12);
  currentY = addText(doc, "Patient Information:", 20, currentY, 12);

  doc.setFontSize(10);
  currentY = addText(doc, `Child Number: ${entry.childNo || "N/A"}`, 20, currentY + 5);
  currentY = addText(doc, `Name: ${entry.name || "N/A"}`, 20, currentY);
  currentY = addText(doc, `Age: ${entry.age || "N/A"}`, 20, currentY);
  currentY = addText(doc, `Gender: ${entry.gender || "N/A"}`, 20, currentY);
  currentY = addText(doc, `Last Updated: ${formatDate(entry.date)}`, 20, currentY);
  currentY = addText(doc, `Total Entries Combined: ${entry.entryCount || 1}`, 20, currentY);

  // Entry Dates (multi-line support)
  const entryDatesText = `Entry Dates: ${
    entry.entryDates ? entry.entryDates.map(formatDate).join(", ") : "N/A"
  }`;
  const datesLines = doc.splitTextToSize(entryDatesText, 170);
  currentY += 3;
  datesLines.forEach((line) => (currentY = addText(doc, line, 20, currentY)));

  currentY += 10;

  // === COMPLETE ASSESSMENT HISTORY ===
  const sectionsData = entry.allSections || entry.sections || [];
  if (sectionsData.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 128);
    currentY = addText(
      doc,
      "Complete Assessment History (All Entries Combined):",
      20,
      currentY,
      12
    );
    currentY += 8;

    const sortedSections = [...sectionsData].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );

    sortedSections.forEach((section, sectionIndex) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 128);
        doc.text("Complete Assessment History (continued):", 20, currentY);
        currentY += 10;
      }

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const sectionName = section.name || `Section ${sectionIndex + 1}`;
      const datesArray = section.dates || [];

      const validDates = datesArray
        .filter((d) => d && d.toString().trim() !== "")
        .map((d) => new Date(d))
        .filter((d) => !isNaN(d.getTime()))
        .sort((a, b) => a - b)
        .map((d) => d.toISOString().split("T")[0]);

      doc.setFont(undefined, "bold");
      const sectionTitle = `${sectionIndex + 1}. ${sectionName} (${validDates.length} total sessions)`;
      currentY = addText(doc, sectionTitle, 20, currentY);

      doc.setFont(undefined, "normal");
      if (validDates.length > 0) {
        validDates.forEach((date, dateIndex) => {
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
          }
          currentY = addText(
            doc,
            `   Session ${dateIndex + 1}: ${formatDate(date)}`,
            25,
            currentY
          );
        });
      } else {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        currentY = addText(doc, `   No sessions scheduled`, 25, currentY);
      }

      currentY += 8;
    });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    currentY = addText(doc, "No assessment sections found for this child.", 20, currentY);
  }

  // === FOOTER ===
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(
    "Comprehensive Assessment Report - Combined from All Entries - Mathavam Flowchart",
    105,
    pageHeight - 10,
    { align: "center" }
  );

  const fileName = `MF_Complete_${entry.childNo || "unknown"}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  doc.save(fileName);
};

// === HELPERS ===
function addText(doc, text, x, y, fontSize = 10) {
  if (fontSize) doc.setFontSize(fontSize);
  doc.text(text, x, y);
  return y + 6;
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("en-GB");
  } catch {
    return String(dateString);
  }
}
