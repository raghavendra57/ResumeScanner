const fs = require('fs');
const path = require('path');
const { extractTextFromPDF } = require('../services/pdfService');
const { matchSkills, extractCandidateName } = require('../services/matchingService');

async function verifyPdf() {
  const filePath = path.join(__dirname, 'fixtures', 'sample_john_doe_resume.pdf');
  const buffer = fs.readFileSync(filePath);

  console.log('Testing PDF extraction...');
  const result = await extractTextFromPDF(buffer);
  console.log('Extraction success! Pages:', result.numPages);
  console.log('Extracted text preview:\n', result.text);

  const name = extractCandidateName(result.text);
  console.log('Detected candidate name:', name);

  const jd = 'Looking for a Senior Full Stack Developer with React, Node.js, TypeScript, PostgreSQL, and Docker.';
  const match = matchSkills(result.text, jd);
  console.log('Skill matching result:', match);
}

verifyPdf().catch(console.error);
