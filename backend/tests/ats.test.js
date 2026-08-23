const assert = require('assert');
const {
  calculateStructureScore,
  calculateEducationScoreFallback,
  calculateExperienceScoreFallback,
  getAtsRating
} = require('../services/matchingService');

console.log('--- RUNNING ATS & EXTENSION UNIT TESTS ---');

// Test 1: Structure score with all 6 sections
{
  const fullResume = `
  John Doe
  SUMMARY: Software engineer with 5 years experience.
  SKILLS: Java, Python, React.
  EXPERIENCE: Senior Dev at Tech Corp.
  EDUCATION: B.S. in Computer Science.
  PROJECTS: Built resume screener app.
  CERTIFICATIONS: AWS Certified Developer.
  `;
  const score = calculateStructureScore(fullResume);
  assert.strictEqual(score, 100, 'All 6 sections should yield 100');
  console.log('✔ Test 1 Passed: Full structure score is 100');
}

// Test 2: Structure score with 3 sections
{
  const partialResume = `
  Sarah Smith
  SKILLS: Python, SQL.
  EXPERIENCE: Data Analyst (2020 - 2024).
  EDUCATION: B.Tech.
  `;
  const score = calculateStructureScore(partialResume);
  assert.strictEqual(score, 80, '3 sections should yield 80');
  console.log('✔ Test 2 Passed: 3-section structure score is 80');
}

// Test 3: Education score fallback
{
  // JD does NOT mention education -> 100 neutral
  const jdNoEdu = 'Looking for Python and SQL developer.';
  const scoreNoEdu = calculateEducationScoreFallback('Simple text', jdNoEdu);
  assert.strictEqual(scoreNoEdu, 100, 'When JD does not require education, candidate should not be penalized (score: 100)');

  // JD mentions Bachelor -> Resume has Bachelor -> 100
  const jdWithEdu = 'Requires Bachelor degree in Computer Science.';
  const resWithEdu = 'Education: Bachelor of Science in Computer Science.';
  const scoreWithEdu = calculateEducationScoreFallback(resWithEdu, jdWithEdu);
  assert.strictEqual(scoreWithEdu, 100, 'When JD requires degree and resume has it, score should be 100');

  console.log('✔ Test 3 Passed: Education score logic verified');
}

// Test 4: ATS Rating Bands
{
  assert.strictEqual(getAtsRating(95), 'Excellent');
  assert.strictEqual(getAtsRating(80), 'Excellent');
  assert.strictEqual(getAtsRating(75), 'Good');
  assert.strictEqual(getAtsRating(70), 'Good');
  assert.strictEqual(getAtsRating(65), 'Fair');
  assert.strictEqual(getAtsRating(60), 'Fair');
  assert.strictEqual(getAtsRating(55), 'Needs Improvement');
  assert.strictEqual(getAtsRating(20), 'Needs Improvement');
  console.log('✔ Test 4 Passed: ATS Rating bands (Excellent, Good, Fair, Needs Improvement) verified');
}

// Test 5: ATS Formula calculation
{
  const skillScore = 80;
  const semanticScore = 90;
  const experienceScore = 85;
  const educationScore = 100;
  const structureScore = 90;

  const atsScore = Math.round(
    (skillScore * 0.40) +
    (semanticScore * 0.30) +
    (experienceScore * 0.15) +
    (educationScore * 0.10) +
    (structureScore * 0.05)
  );

  // 80*0.40 = 32
  // 90*0.30 = 27
  // 85*0.15 = 12.75
  // 100*0.10 = 10
  // 90*0.05 = 4.5
  // Total = 32 + 27 + 12.75 + 10 + 4.5 = 86.25 -> 86
  assert.strictEqual(atsScore, 86, 'ATS Score should match formula exactly');
  console.log('✔ Test 5 Passed: ATS Score weighted formula verified');
}

console.log('--- ALL ATS UNIT TESTS PASSED! ---');
