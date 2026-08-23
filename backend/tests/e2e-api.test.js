const assert = require('assert');
const fs = require('fs');
const path = require('path');
const app = require('../app');
const { connectDB } = require('../db');

async function runEndToEndTests() {
  console.log('--- STARTING SERVER E2E INTEGRATION TESTS (WITH MONGODB & STRUCTURED EXTRACTION) ---');

  await connectDB();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Health Endpoint
    {
      const res = await fetch(`${baseUrl}/api/health`);
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.status, 'ok');
      console.log('✔ GET /api/health passed');
    }

    // 2. Missing Resume validation
    {
      const formData = new FormData();
      formData.append('jobDescriptionText', 'Looking for React developer');

      const res = await fetch(`${baseUrl}/api/analyze`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      assert.strictEqual(res.status, 400);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error, 'Please upload a resume before analyzing.');
      console.log('✔ POST /api/analyze without resume returns 400 with friendly message');
    }

    // 3. Mode 1: Resume PDF + Job Description Text (Creates and saves Candidate)
    let savedCandidateId = null;
    {
      const pdfBuffer = fs.readFileSync(path.join(__dirname, 'fixtures', 'sample_john_doe_resume.pdf'));
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('resume', blob, 'john_doe_resume.pdf');
      formData.append('jobDescriptionText', 'Looking for React, JavaScript, Node.js, Express, and MongoDB developer.');

      const res = await fetch(`${baseUrl}/api/analyze`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.candidateName, 'John Doe');
      assert.ok(data.atsScore >= 70);
      assert.ok(data.overallMatchScore >= 70);
      assert.ok(data.shortlistJustification);
      assert.ok(Array.isArray(data.structuredExperience));
      assert.ok(Array.isArray(data.structuredEducation));

      savedCandidateId = data.candidateId;
      console.log(`✔ POST /api/analyze (JD Text): Candidate '${data.candidateName}' analyzed (ATS: ${data.atsScore}/100, Match: ${data.overallMatchScore}%, CandidateId: ${savedCandidateId})`);
    }

    // 4. Mode 2: Resume PDF + Job Description PDF
    {
      const resumeBuf = fs.readFileSync(path.join(__dirname, 'fixtures', 'sample_sarah_smith_resume.pdf'));
      const jdBuf = fs.readFileSync(path.join(__dirname, 'fixtures', 'sample_job_description.pdf'));

      const resumeBlob = new Blob([resumeBuf], { type: 'application/pdf' });
      const jdBlob = new Blob([jdBuf], { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('resume', resumeBlob, 'sarah_smith_resume.pdf');
      formData.append('jobDescriptionFile', jdBlob, 'sample_job_description.pdf');

      const res = await fetch(`${baseUrl}/api/analyze`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.candidateName, 'Sarah Smith');
      assert.strictEqual(data.jobDescriptionSource, 'pdf');
      console.log(`✔ POST /api/analyze (JD PDF): Candidate '${data.candidateName}' analyzed (ATS: ${data.atsScore}/100, Source: ${data.jobDescriptionSourceName})`);
    }

    // 5. GET /api/candidates
    {
      const res = await fetch(`${baseUrl}/api/candidates`);
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.ok(data.count >= 2);
      console.log(`✔ GET /api/candidates returns ${data.count} candidates from MongoDB`);
    }

    // 6. PATCH /api/candidates/:id/shortlist
    if (savedCandidateId) {
      const res = await fetch(`${baseUrl}/api/candidates/${savedCandidateId}/shortlist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortlisted: true })
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.shortlisted, true);
      console.log(`✔ PATCH /api/candidates/:id/shortlist successfully shortlisted candidate`);

      // Verify GET /api/candidates?shortlisted=true
      const filterRes = await fetch(`${baseUrl}/api/candidates?shortlisted=true`);
      const filterData = await filterRes.json();
      assert.strictEqual(filterRes.status, 200);
      assert.ok(filterData.data.some(c => c._id === savedCandidateId));
      console.log(`✔ GET /api/candidates?shortlisted=true includes shortlisted candidate`);

      // 7. GET /api/candidates/:id (Detail view)
      const detailRes = await fetch(`${baseUrl}/api/candidates/${savedCandidateId}`);
      const detailData = await detailRes.json();
      assert.strictEqual(detailRes.status, 200);
      assert.strictEqual(detailData.success, true);
      assert.strictEqual(detailData.data.candidateName, 'John Doe');
      assert.ok(detailData.data.shortlistJustification);
      console.log(`✔ GET /api/candidates/:id returns detailed candidate profile`);

      // 8. DELETE /api/candidates/:id
      const delRes = await fetch(`${baseUrl}/api/candidates/${savedCandidateId}`, {
        method: 'DELETE'
      });
      const delData = await delRes.json();
      assert.strictEqual(delRes.status, 200);
      assert.strictEqual(delData.success, true);
      console.log(`✔ DELETE /api/candidates/:id deleted candidate successfully`);
    }

    console.log('--- ALL FULL-STACK E2E TESTS PASSED WITH 100% SUCCESS! ---');
  } finally {
    server.close();
  }
}

runEndToEndTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
