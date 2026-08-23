/**
 * Centralized Skill Dictionary & Safe Matching Logic
 * Ensures case-insensitivity, duplicate-free extraction, and safe word-boundary matching.
 * Specifically prevents false matches like "Java" inside "JavaScript" or "C" inside "CSS".
 */

// Canonical skill definitions with regex patterns and optional aliases
const SKILL_DEFINITIONS = [
  // Programming Languages
  { name: 'JavaScript', pattern: /(?<![\.\w])(?:javascript|js)(?![\w.])/i },
  { name: 'TypeScript', pattern: /(?<![\.\w])(?:typescript|ts)(?![\w.])/i },
  { name: 'Python', pattern: /\bpython\b/i },
  // Java must NOT match JavaScript (using negative lookahead for script)
  { name: 'Java', pattern: /(?<!\w)java(?!\w)(?!script)/i },
  { name: 'C++', pattern: /(?<!\w)(?:c\+\+|cpp)(?!\w)/i },
  { name: 'C#', pattern: /(?<!\w)(?:c#|csharp)(?!\w)/i },
  // C standalone: must not match C++, C#, CSS, or word characters
  { name: 'C', pattern: /(?<![\w+#])C(?![a-zA-Z0-9_+#])/ },
  { name: 'PHP', pattern: /\bphp\b/i },
  { name: 'Ruby', pattern: /\bruby\b/i },
  { name: 'Go', pattern: /\bgolang\b|(?<![\w])\bGo\b(?![\w])/ },
  { name: 'Rust', pattern: /\brust\b/i },
  { name: 'Kotlin', pattern: /\bkotlin\b/i },
  { name: 'Swift', pattern: /\bswift\b/i },
  { name: 'Dart', pattern: /\bdart\b/i },
  { name: 'R', pattern: /(?<![\w])\bR\b(?![\w])/ },

  // Web & Frontend
  { name: 'HTML', pattern: /\bhtml5?\b/i },
  { name: 'CSS', pattern: /\bcss3?\b/i },
  { name: 'React', pattern: /\breact(?:\.js|js)?\b(?!ive)/i },
  { name: 'Angular', pattern: /\bangular(?:\.js|js)?\b/i },
  { name: 'Vue', pattern: /\bvue(?:\.js|js)?\b/i },
  { name: 'Next.js', pattern: /\bnext(?:\.js|js)\b/i },
  { name: 'Redux', pattern: /\bredux\b/i },
  { name: 'Tailwind CSS', pattern: /\btailwind(?:\s*css)?\b/i },
  { name: 'Bootstrap', pattern: /\bbootstrap\b/i },

  // Backend & Frameworks
  { name: 'Node.js', pattern: /\bnode(?:\.js|js)?\b/i },
  { name: 'Express.js', pattern: /\bexpress(?:\.js|js)?\b/i },
  { name: 'Spring Boot', pattern: /\bspring\s*boot\b|\bspring\s*framework\b/i },
  { name: 'Django', pattern: /\bdjango\b/i },
  { name: 'Flask', pattern: /\bflask\b/i },
  { name: 'FastAPI', pattern: /\bfastapi\b/i },
  { name: 'REST API', pattern: /\brest\s*apis?\b|\brestful(?:\s*apis?)?\b|\brest\b(?!\s*in\s*peace)/i },
  { name: 'GraphQL', pattern: /\bgraphql\b/i },
  { name: 'Microservices', pattern: /\bmicroservices?\b|\bmicroservice\s*architecture\b/i },

  // Databases & Storage
  { name: 'SQL', pattern: /\bsql\b/i },
  { name: 'MySQL', pattern: /\bmysql\b/i },
  { name: 'PostgreSQL', pattern: /\bpostgre(?:sql)?\b|\bpostgres\b/i },
  { name: 'MongoDB', pattern: /\bmongo(?:db)?\b/i },
  { name: 'Redis', pattern: /\bredis\b/i },
  { name: 'DBMS', pattern: /\bdbms\b|\bdatabase\s*management\b/i },

  // Cloud, DevOps & Tools
  { name: 'AWS', pattern: /\baws\b|\bamazon\s*web\s*services\b/i },
  { name: 'Azure', pattern: /\bazure\b|\bmicrosoft\s*azure\b/i },
  { name: 'GCP', pattern: /\bgcp\b|\bgoogle\s*cloud(?:\s*platform)?\b/i },
  { name: 'Docker', pattern: /\bdocker\b/i },
  { name: 'Kubernetes', pattern: /\bkubernetes\b|\bk8s\b/i },
  { name: 'Git', pattern: /\bgit\b(?!hub|lab)/i },
  { name: 'GitHub', pattern: /\bgithub\b/i },
  { name: 'GitLab', pattern: /\bgitlab\b/i },
  { name: 'CI/CD', pattern: /\bci[\s/-]?cd\b|\bcontinuous\s*integration\b/i },
  { name: 'Linux', pattern: /\blinux\b/i },

  // Data Science, AI & CS Fundamentals
  { name: 'Machine Learning', pattern: /\bmachine\s*learning\b|\bml\b/i },
  { name: 'Artificial Intelligence', pattern: /\bartificial\s*intelligence\b|(?<![\w])\bAI\b(?![\w])/i },
  { name: 'Deep Learning', pattern: /\bdeep\s*learning\b/i },
  { name: 'Data Structures', pattern: /\bdata\s*structures?\b|\bdsa\b/i },
  { name: 'Algorithms', pattern: /\balgorithms?\b/i },
  { name: 'Operating Systems', pattern: /\boperating\s*systems?\b|(?<![\w])\bOS\b(?![\w])/i },
  { name: 'Power BI', pattern: /\bpower\s*bi\b/i },
  { name: 'Tableau', pattern: /\btableau\b/i },
  { name: 'Excel', pattern: /\b(?:microsoft\s*)?excel\b/i }
];

/**
 * Standard list of all supported skill names
 */
const ALL_SKILLS = SKILL_DEFINITIONS.map(s => s.name);

/**
 * Extract matched skills from text safely using predefined patterns
 * @param {string} text - Text to extract skills from
 * @returns {string[]} Array of matched canonical skill names
 */
function extractSkills(text) {
  if (!text || typeof text !== 'string') return [];

  const matched = new Set();

  for (const skill of SKILL_DEFINITIONS) {
    if (skill.pattern.test(text)) {
      matched.add(skill.name);
    }
  }

  return Array.from(matched);
}

module.exports = {
  SKILL_DEFINITIONS,
  ALL_SKILLS,
  extractSkills
};
