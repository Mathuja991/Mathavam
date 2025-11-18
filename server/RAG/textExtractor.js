const fs = require('fs');
const path = require('path');
const pdfParseModule = require('pdf-parse');
const { PDFParse } = pdfParseModule;
const mammoth = require('mammoth');

async function extractText(filePath, filename) {
  const ext = path.extname(filename || '').toLowerCase();
  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    try {
      const parser = new PDFParse(new Uint8Array(buffer), {});
      const data = await parser.getText();
      if (typeof data === 'string') return data;
      if (data && typeof data.text === 'string') return data.text;
    } catch (err) {
      // fallback to default export if available
      if (typeof pdfParseModule === 'function') {
        try {
          const data = await pdfParseModule(buffer);
          if (data && typeof data.text === 'string') return data.text;
        } catch (e2) {
          console.error('pdf default parse failed', e2.message || e2);
        }
      }
      console.error('pdf parse failed', err.message || err);
    }
    return '';
  }
  if (ext === '.docx') {
    const { value } = await mammoth.extractRawText({ path: filePath });
    return value || '';
  }
  // fallback for txt/unknown types
  return fs.readFileSync(filePath, 'utf8');
}

module.exports = { extractText };
