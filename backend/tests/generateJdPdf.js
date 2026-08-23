const fs = require('fs');
const path = require('path');

function createPdfBase64(lines) {
  const header = '%PDF-1.4\n';
  const obj1 = '1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj\n';
  const obj2 = '2 0 obj <</Type/Pages/Kids[3 0 R]/Count 1>> endobj\n';
  const obj3 = '3 0 obj <</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>> endobj\n';

  let textStream = 'BT\n/F1 12 Tf\n50 750 Td\n16 TL\n';
  for (const line of lines) {
    const sanitized = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    textStream += `(${sanitized}) Tj\nT*\n`;
  }
  textStream += 'ET\n';
  const streamBuf = Buffer.from(textStream, 'utf8');

  const obj4 = `4 0 obj <</Length ${streamBuf.length}>> stream\n${textStream}endstream\nendobj\n`;
  const obj5 = '5 0 obj <</Type/Font/Subtype/Type1/BaseFont/Helvetica>> endobj\n';

  const parts = [header, obj1, obj2, obj3, obj4, obj5];
  const offsets = [];
  let cur = 0;
  for (const p of parts) {
    offsets.push(cur);
    cur += Buffer.byteLength(p, 'utf8');
  }

  const startxref = cur;
  const pad = (n) => n.toString().padStart(10, '0');
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    xref += `${pad(offsets[i])} 00000 n \n`;
  }
  const trailer = `trailer <</Size 6/Root 1 0 R>>\nstartxref\n${startxref}\n%%EOF\n`;

  const full = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;
  return Buffer.from(full, 'utf8');
}

const fixturesDir = path.join(__dirname, 'fixtures');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

// Sample Job Description PDF
const jdLines = [
  'Job Title: Senior Full Stack Software Engineer',
  'Company: CloudTech Innovations',
  'Location: Remote',
  '',
  'Requirements & Qualifications:',
  '- Proven experience in JavaScript, TypeScript, React, HTML, CSS.',
  '- Deep expertise with Node.js, Express.js, and REST API design.',
  '- Strong knowledge of databases such as PostgreSQL, MongoDB, and Redis.',
  '- Hands-on experience with Docker, CI/CD, and AWS cloud services.',
  '- Solid understanding of Data Structures, Algorithms, and clean architecture.',
  '- Bachelor degree in Computer Science or related field.'
];

fs.writeFileSync(path.join(fixturesDir, 'sample_job_description.pdf'), createPdfBase64(jdLines));
console.log('Sample JD PDF fixture created successfully!');
