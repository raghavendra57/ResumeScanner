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

// Sample 1: John Doe (Senior Full Stack Engineer)
const johnDoe = [
  'John Doe',
  'Senior Full Stack Software Engineer',
  'Email: john.doe@example.com | Phone: (555) 234-5678 | GitHub: github.com/johndoe',
  'Summary: Experienced Full Stack Engineer with 5+ years of software development experience building scalable web apps.',
  'Skills: JavaScript, TypeScript, Python, HTML, CSS, SQL, React, Node.js, Express.js, Tailwind CSS, PostgreSQL, MongoDB, Redis, AWS, Docker, Git, GitHub, REST API, Data Structures, Algorithms, CI/CD'
];
fs.writeFileSync(path.join(fixturesDir, 'sample_john_doe_resume.pdf'), createPdfBase64(johnDoe));

// Sample 2: Sarah Smith (Java Backend Engineer)
const sarahSmith = [
  'Sarah Smith',
  'Backend Java Engineer',
  'Email: sarah.smith@example.com | Phone: (555) 987-6543',
  'Summary: Dedicated Backend Developer with 4 years building high-performance microservices and database systems.',
  'Skills: Java, SQL, Python, Spring Boot, REST API, Microservices, MySQL, PostgreSQL, DBMS, Operating Systems, Git, GitHub, Docker, Kubernetes, AWS'
];
fs.writeFileSync(path.join(fixturesDir, 'sample_sarah_smith_resume.pdf'), createPdfBase64(sarahSmith));

console.log('Sample PDFs created successfully.');
