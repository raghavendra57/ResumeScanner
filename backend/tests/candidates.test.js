const assert = require('assert');
const app = require('../app');

async function runCandidateTests() {
  console.log('--- RUNNING CANDIDATE CRUD & ENDPOINT TESTS ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. GET /api/candidates
    {
      const res = await fetch(`${baseUrl}/api/candidates`);
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
      console.log(`✔ GET /api/candidates passed (count: ${data.count})`);
    }

    // 2. GET /api/candidates with ?shortlisted=true
    {
      const res = await fetch(`${baseUrl}/api/candidates?shortlisted=true`);
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data));
      console.log(`✔ GET /api/candidates?shortlisted=true passed`);
    }

    // 3. GET /api/candidates/:id with invalid ID
    {
      const res = await fetch(`${baseUrl}/api/candidates/invalid-id-format`);
      const data = await res.json();
      // If DB offline: 503; if DB online: 400
      assert.ok(res.status === 400 || res.status === 503);
      assert.strictEqual(data.success, false);
      console.log(`✔ GET /api/candidates/:id handles invalid ID safely (${res.status})`);
    }

    // 4. PATCH /api/candidates/:id/shortlist with invalid ID
    {
      const res = await fetch(`${baseUrl}/api/candidates/invalid-id-format/shortlist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortlisted: true })
      });
      const data = await res.json();
      assert.ok(res.status === 400 || res.status === 503);
      assert.strictEqual(data.success, false);
      console.log(`✔ PATCH /api/candidates/:id/shortlist handles invalid ID safely (${res.status})`);
    }

    // 5. DELETE /api/candidates/:id with invalid ID
    {
      const res = await fetch(`${baseUrl}/api/candidates/invalid-id-format`, {
        method: 'DELETE'
      });
      const data = await res.json();
      assert.ok(res.status === 400 || res.status === 503);
      assert.strictEqual(data.success, false);
      console.log(`✔ DELETE /api/candidates/:id handles invalid ID safely (${res.status})`);
    }

    console.log('--- ALL CANDIDATE CRUD ENDPOINT TESTS PASSED! ---');
  } finally {
    server.close();
  }
}

runCandidateTests().catch(err => {
  console.error('Candidate tests failed:', err);
  process.exit(1);
});
