const assert = require('assert');
const { extractSkills, ALL_SKILLS } = require('../utils/skills');
const { matchSkills, extractCandidateName } = require('../services/matchingService');

console.log('--- RUNNING SKILL MATCHING & PARSING UNIT TESTS ---');

// Test 1: Java vs JavaScript isolation
{
  const resumeWithOnlyJS = 'I have 4 years of experience in JavaScript and TypeScript.';
  const extracted = extractSkills(resumeWithOnlyJS);
  assert.strictEqual(extracted.includes('JavaScript'), true, 'Should detect JavaScript');
  assert.strictEqual(extracted.includes('Java'), false, 'Should NOT detect Java when only JavaScript is present');
  console.log('✔ Test 1 Passed: Java does NOT match JavaScript');
}

// Test 2: C isolation (does not match CSS or C++)
{
  const textWithCSS = 'Experienced in HTML, CSS and C++ programming.';
  const extracted = extractSkills(textWithCSS);
  assert.strictEqual(extracted.includes('CSS'), true, 'Should detect CSS');
  assert.strictEqual(extracted.includes('C++'), true, 'Should detect C++');
  assert.strictEqual(extracted.includes('C'), false, 'Should NOT detect standalone C in CSS/C++');
  console.log('✔ Test 2 Passed: C does NOT match CSS or C++');
}

// Test 3: Multi-word skill matching
{
  const multiText = 'Strong background in Machine Learning, Deep Learning, Data Structures, Algorithms, Operating Systems, Spring Boot, and REST API.';
  const extracted = extractSkills(multiText);
  assert.strictEqual(extracted.includes('Machine Learning'), true, 'Should detect Machine Learning');
  assert.strictEqual(extracted.includes('Deep Learning'), true, 'Should detect Deep Learning');
  assert.strictEqual(extracted.includes('Data Structures'), true, 'Should detect Data Structures');
  assert.strictEqual(extracted.includes('Algorithms'), true, 'Should detect Algorithms');
  assert.strictEqual(extracted.includes('Operating Systems'), true, 'Should detect Operating Systems');
  assert.strictEqual(extracted.includes('Spring Boot'), true, 'Should detect Spring Boot');
  assert.strictEqual(extracted.includes('REST API'), true, 'Should detect REST API');
  console.log('✔ Test 3 Passed: Multi-word technical skills correctly identified');
}

// Test 4: Strong Match scenario
{
  const jd = 'Looking for a developer with Java, Python, SQL, and Git.';
  const resume = 'Experienced software engineer skilled in Python, Java, Git, and SQL databases.';
  const result = matchSkills(resume, jd);
  assert.strictEqual(result.basicScore, 100, 'Score should be 100%');
  assert.strictEqual(result.matchedSkills.length, 4, 'Should have 4 matched skills');
  assert.strictEqual(result.missingSkills.length, 0, 'Should have 0 missing skills');
  console.log('✔ Test 4 Passed: 100% Strong Match calculated correctly');
}

// Test 5: Partial Match scenario (4 of 5 skills = 80%)
{
  const jd = 'Requires Java, Python, SQL, Git, and Spring Boot.';
  const resume = 'Skilled in Java, Python, SQL, Git, and Docker.';
  const result = matchSkills(resume, jd);
  assert.strictEqual(result.basicScore, 80, 'Score should be 80%');
  assert.strictEqual(result.matchedSkills.length, 4, 'Should match 4 skills');
  assert.deepStrictEqual(result.missingSkills, ['Spring Boot'], 'Missing skill should be Spring Boot');
  console.log('✔ Test 5 Passed: 80% Partial Match calculated correctly');
}

// Test 6: Low Match scenario
{
  const jd = 'Looking for React, Node.js, Docker, Kubernetes specialist.';
  const resume = 'Proficient in Java, Python, MySQL.';
  const result = matchSkills(resume, jd);
  assert.strictEqual(result.basicScore, 0, 'Score should be 0%');
  assert.strictEqual(result.missingSkills.length, 4, 'All 4 skills should be missing');
  console.log('✔ Test 6 Passed: Low Match calculated correctly');
}

// Test 7: Candidate Name Extraction Heuristic
{
  const resumeText = `
John Doe
Software Engineer | john.doe@example.com | (555) 123-4567
Summary: Passionate developer with 5+ years of experience.
Skills: Java, React, Node.js
  `;
  const name = extractCandidateName(resumeText);
  assert.strictEqual(name, 'John Doe', 'Candidate name should be extracted as John Doe');
  console.log('✔ Test 7 Passed: Candidate name detected accurately');
}

console.log('--- ALL UNIT TESTS PASSED SUCCESSFULLY! ---');
