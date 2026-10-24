import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const roadmapData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/roadmaps.json'), 'utf8'));

const ROLE_POOLS = {
  'frontend-developer': [
    ['Web platform and browser foundations', 'Understand how browsers load pages, request files and render interfaces.', ['HTTP basics', 'Browser rendering', 'Developer tools']],
    ['Semantic HTML and accessible structure', 'Build meaningful page structures with well-labelled controls and accessible semantics.', ['Semantic HTML', 'Forms', 'Accessibility']],
    ['Responsive layout and visual hierarchy', 'Create interfaces that adapt across phone, tablet and desktop sizes.', ['CSS layout', 'Responsive design', 'Visual hierarchy']],
    ['JavaScript problem-solving for interfaces', 'Use variables, functions, arrays, objects and events to add useful behaviour.', ['JavaScript', 'DOM events', 'Problem solving']],
    ['Git workflow and debugging', 'Track changes, inspect errors and develop a repeatable debugging habit.', ['Git', 'Debugging', 'Browser DevTools']],
    ['Reusable components and UI state', 'Break a screen into components and manage state without losing clarity.', ['React', 'Components', 'State management']],
    ['APIs, loading states and error handling', 'Connect an interface to data and handle loading, empty and failure states.', ['Fetch API', 'Async JavaScript', 'Error handling']],
    ['Testing, accessibility and performance', 'Check keyboard use, responsive behaviour, rendering performance and common defects.', ['Testing', 'Accessibility', 'Performance']],
    ['Deploy a user-focused product', 'Publish a working application and document the trade-offs and next improvements.', ['Deployment', 'Documentation', 'Portfolio']],
    ['Frontend interview and code-review practice', 'Explain implementation choices and improve code based on feedback.', ['Code review', 'Technical communication', 'Interview practice']],
  ],
  'full-stack-developer': [
    ['How the web and HTTP requests work', 'Map a browser request through a server, API and response.', ['HTTP', 'Browser-server flow', 'JSON']],
    ['Programming fundamentals for application logic', 'Practise control flow, data structures, functions and error handling in the chosen stack.', ['Programming', 'Functions', 'Data structures']],
    ['Build accessible responsive interfaces', 'Create the client-side screens, forms and states your product needs.', ['HTML/CSS', 'Responsive design', 'Accessibility']],
    ['Create APIs and server-side logic', 'Design endpoints, validate inputs and return useful errors.', ['REST APIs', 'Validation', 'Express or equivalent']],
    ['Data modelling and database queries', 'Represent domain data, write queries and protect data consistency.', ['SQL', 'Data modelling', 'CRUD']],
    ['Authentication, permissions and security basics', 'Separate identity from permissions and protect private endpoints.', ['Authentication', 'Authorization', 'Security']],
    ['Integrate frontend, API and database', 'Connect the layers and implement reliable loading, empty and error states.', ['Integration', 'Async handling', 'Debugging']],
    ['Automated testing and deployment', 'Test important paths and publish the app with environment-based configuration.', ['Testing', 'CI/CD', 'Deployment']],
    ['Build a complete product around your interests', 'Deliver an end-to-end product for a realistic user and write a concise case study.', ['Architecture', 'Product delivery', 'Portfolio']],
    ['Production readiness and technical interviews', 'Review observability, performance, security and explain your system design.', ['Observability', 'Performance', 'Interview practice']],
  ],
  'data-analyst': [
    ['Questions, metrics and data quality', 'Translate a real decision into measurable questions and define what reliable data looks like.', ['Business questions', 'Metrics', 'Data quality']],
    ['Spreadsheet analysis and data cleanup', 'Clean missing, duplicate and inconsistent values and document your assumptions.', ['Spreadsheets', 'Cleaning', 'Validation']],
    ['SQL querying and relational thinking', 'Filter, join, aggregate and validate data from related tables.', ['SQL', 'Joins', 'Aggregation']],
    ['Statistics for practical decisions', 'Use distributions, sampling and uncertainty to interpret results carefully.', ['Descriptive statistics', 'Sampling', 'Uncertainty']],
    ['Python for repeatable analysis', 'Use notebooks and data-frame operations to make analysis reproducible.', ['Python', 'Pandas', 'Notebooks']],
    ['Visualisation and dashboard design', 'Choose appropriate charts and create a dashboard that answers a clear question.', ['Data visualisation', 'Dashboard design', 'Storytelling']],
    ['Explain insights to a non-technical audience', 'Write a concise narrative connecting evidence, limitations and recommended actions.', ['Communication', 'Evidence', 'Recommendations']],
    ['Automate and validate an analysis workflow', 'Build repeatable checks that reduce manual errors and surface anomalies.', ['Automation', 'Data validation', 'Reproducibility']],
    ['Portfolio analysis using an interest-led dataset', 'Investigate a dataset connected to your interests and present an evidence-based conclusion.', ['Exploratory analysis', 'Case study', 'Portfolio']],
    ['Analyst interviews and stakeholder scenarios', 'Practise reasoning through metric definitions, SQL tasks and ambiguous requests.', ['SQL practice', 'Metric design', 'Communication']],
  ],
  'ai-ml-engineer': [
    ['Python and computational foundations', 'Build fluency with Python, functions, collections, files and environments.', ['Python', 'Functions', 'Environments']],
    ['Data preparation and exploratory analysis', 'Inspect distributions, clean data and build a reproducible preparation workflow.', ['Pandas', 'Data quality', 'EDA']],
    ['Math and statistics for model reasoning', 'Apply the linear algebra, probability and statistics relevant to your starting level.', ['Statistics', 'Probability', 'Linear algebra']],
    ['Machine learning problem framing', 'Choose a target, establish a baseline and select metrics that fit the real task.', ['Problem framing', 'Metrics', 'Baselines']],
    ['Train, validate and improve models', 'Use held-out validation, avoid leakage and compare candidate models responsibly.', ['Model training', 'Validation', 'Leakage prevention']],
    ['Feature engineering and experiment tracking', 'Build features, record experiments and reason from errors rather than guessing.', ['Feature engineering', 'Experiments', 'Error analysis']],
    ['Deep learning or language-model foundations', 'Choose a path matching your goal and understand its core architecture and limits.', ['Neural networks', 'Transformers', 'Model limitations']],
    ['Serve a model through an API', 'Package inference behind a reliable endpoint with input validation and clear errors.', ['Inference', 'APIs', 'Deployment']],
    ['Build an interest-led AI application', 'Create an end-to-end application and evaluate it against a clear user need.', ['Evaluation', 'Integration', 'Portfolio']],
    ['Responsible AI and production monitoring', 'Review privacy, bias, security, drift and the operational cost of deployed systems.', ['Responsible AI', 'Monitoring', 'Privacy']],
  ],
  'cybersecurity-analyst': [
    ['Networking and operating-system fundamentals', 'Understand packets, ports, processes, permissions and system logs.', ['Networking', 'Operating systems', 'Permissions']],
    ['Security concepts and threat modelling', 'Identify assets, trust boundaries, likely threats and sensible controls.', ['CIA triad', 'Threat modelling', 'Risk']],
    ['Linux, command line and log analysis', 'Navigate a shell and extract useful signals from system and application logs.', ['Linux', 'CLI', 'Logs']],
    ['Identity, access and endpoint security', 'Apply least privilege, multi-factor authentication and basic endpoint safeguards.', ['IAM', 'MFA', 'Endpoint security']],
    ['Web application security fundamentals', 'Recognise common web risks and practise safe testing in authorised environments.', ['OWASP', 'Input validation', 'Secure coding']],
    ['Detection and incident triage', 'Use a scenario to prioritise alerts, gather evidence and document a response.', ['Detection', 'Triage', 'Evidence handling']],
    ['Vulnerability management and remediation', 'Evaluate severity, prioritise realistic fixes and verify the result.', ['Vulnerability scanning', 'Prioritisation', 'Remediation']],
    ['Security automation and reporting', 'Automate a small repetitive analysis and communicate findings clearly.', ['Scripting', 'Reporting', 'Repeatability']],
    ['Build a safe security portfolio lab', 'Document an authorised defensive lab with findings, mitigations and reflection.', ['Lab safety', 'Documentation', 'Portfolio']],
    ['Incident-response scenarios and interview practice', 'Work through a tabletop incident and explain decisions using evidence.', ['Incident response', 'Communication', 'Decision making']],
  ],
  'ui-ux-designer': [
    ['Observe users and frame a clear problem', 'Turn a real user need into a focused problem statement and research questions.', ['User research', 'Problem framing', 'Empathy']],
    ['Information architecture and user flows', 'Organise content and map the shortest useful journeys through a product.', ['Information architecture', 'Flows', 'Navigation']],
    ['Visual hierarchy and design foundations', 'Use typography, spacing, colour and contrast to clarify what matters.', ['Typography', 'Spacing', 'Contrast']],
    ['Wireframes and rapid prototyping', 'Turn a flow into low-fidelity screens that are easy to test and change.', ['Wireframing', 'Prototyping', 'Iteration']],
    ['Interaction patterns and accessibility', 'Design clear states, feedback and accessible controls for diverse users.', ['Interaction design', 'Accessibility', 'Design systems']],
    ['Usability testing and iteration', 'Plan small tests, synthesise findings and make evidence-led improvements.', ['Usability testing', 'Synthesis', 'Iteration']],
    ['Responsive interface systems', 'Create consistent components and layouts across key screen sizes.', ['Components', 'Responsive design', 'Consistency']],
    ['Developer handoff and product constraints', 'Specify states, spacing and behaviour in a practical handoff.', ['Handoff', 'Specifications', 'Collaboration']],
    ['Portfolio case study from an interest area', 'Show the problem, research, iterations and final decisions in a concise case study.', ['Storytelling', 'Case study', 'Portfolio']],
    ['Design critique and interview practice', 'Explain design trade-offs and respond constructively to critique.', ['Critique', 'Trade-offs', 'Communication']],
  ],
  'product-manager': [
    ['Understand users and problem spaces', 'Separate symptoms from underlying user needs using practical research.', ['User discovery', 'Interviews', 'Problem framing']],
    ['Product strategy and outcomes', 'Connect a product goal to a measurable user and business outcome.', ['Strategy', 'Outcomes', 'Positioning']],
    ['Metrics, funnels and product analytics', 'Choose meaningful measures and avoid vanity metrics.', ['North-star metrics', 'Funnels', 'Analytics']],
    ['Prioritisation and roadmap trade-offs', 'Compare ideas using impact, confidence, effort and strategic fit.', ['Prioritisation', 'Trade-offs', 'Roadmaps']],
    ['Requirements and clear acceptance criteria', 'Write concise user stories and testable acceptance criteria.', ['Requirements', 'User stories', 'Acceptance criteria']],
    ['Experiment design and validation', 'Plan low-cost experiments and interpret evidence without overclaiming.', ['Experiments', 'Hypotheses', 'Validation']],
    ['Work with design and engineering', 'Clarify constraints, manage dependencies and support delivery decisions.', ['Collaboration', 'Dependencies', 'Delivery']],
    ['Launch planning and communication', 'Coordinate a release plan with success measures, risks and follow-up actions.', ['Launch', 'Risk management', 'Communication']],
    ['Build a product case study in your interest area', 'Propose and validate a product direction for a real problem you care about.', ['Discovery', 'Strategy', 'Portfolio']],
    ['Product sense and prioritisation interview practice', 'Work through ambiguous prompts and explain reasoning in a structured way.', ['Product sense', 'Metrics', 'Interview practice']],
  ],
  'digital-marketer': [
    ['Audience research and customer intent', 'Describe a specific audience, its needs and the action you want to support.', ['Audience research', 'Intent', 'Positioning']],
    ['Content strategy and messaging', 'Develop content pillars and messages that match audience needs.', ['Content strategy', 'Copywriting', 'Brand voice']],
    ['SEO and search intent', 'Map topics to intent and improve the discoverability of useful content.', ['SEO', 'Keywords', 'Search intent']],
    ['Social media formats and distribution', 'Choose suitable formats and build a repeatable publishing workflow.', ['Social platforms', 'Distribution', 'Calendar']],
    ['Landing pages and conversion basics', 'Align message, page structure and calls to action with the user journey.', ['Landing pages', 'Conversion', 'UX writing']],
    ['Analytics and campaign measurement', 'Define event tracking and interpret performance metrics in context.', ['Analytics', 'Attribution', 'Metrics']],
    ['Email journeys and audience retention', 'Create a helpful sequence that supports the customer lifecycle.', ['Email marketing', 'Segmentation', 'Retention']],
    ['Run a small campaign experiment', 'Compare message or format variations using a measurable hypothesis.', ['Experimentation', 'A/B testing', 'Learning loops']],
    ['Create a campaign around your interests', 'Build a small campaign brief, examples, target audience and measurement plan.', ['Campaign planning', 'Portfolio', 'Reporting']],
    ['Present campaign results and next steps', 'Summarise evidence, limits and the next decision for a stakeholder.', ['Reporting', 'Storytelling', 'Stakeholder communication']],
  ],
  'cloud-engineer': [
    ['Compute, networking and cloud service models', 'Map core infrastructure concepts to practical deployment decisions.', ['Cloud concepts', 'Networking', 'Compute']],
    ['Linux and scripting foundations', 'Use command-line tools and small scripts to automate repeatable work.', ['Linux', 'Shell scripting', 'Automation']],
    ['Identity, permissions and cloud security', 'Apply least privilege and separate environment permissions safely.', ['IAM', 'Security', 'Secret handling']],
    ['Deploy and configure cloud resources', 'Create a minimal environment and document its configuration and cost.', ['Compute resources', 'Configuration', 'Cost awareness']],
    ['Containers and reproducible environments', 'Package an application and understand images, containers and configuration.', ['Containers', 'Docker', 'Environment variables']],
    ['CI/CD and deployment automation', 'Automate basic checks and repeatable releases.', ['CI/CD', 'Build pipelines', 'Release management']],
    ['Observability and incident diagnosis', 'Use logs, metrics and traces to locate failure points.', ['Logging', 'Metrics', 'Troubleshooting']],
    ['Reliability, scaling and cost trade-offs', 'Make practical choices around reliability, capacity and cost.', ['Reliability', 'Scaling', 'Cost management']],
    ['Deploy an interest-led application', 'Publish and secure a small real application with documented architecture.', ['Deployment', 'Security', 'Portfolio']],
    ['Cloud scenario and interview practice', 'Explain trade-offs and diagnose a scenario using evidence.', ['Troubleshooting', 'Architecture', 'Communication']],
  ],
};

const LANGUAGES = {
  English: { code: 'en', locale: 'English', script: null },
  Hindi: { code: 'hi', locale: 'Hindi', script: /[\u0900-\u097F]/ },
  Telugu: { code: 'te', locale: 'Telugu', script: /[\u0C00-\u0C7F]/ },
  Tamil: { code: 'ta', locale: 'Tamil', script: /[\u0B80-\u0BFF]/ },
  Kannada: { code: 'kn', locale: 'Kannada', script: /[\u0C80-\u0CFF]/ },
  Malayalam: { code: 'ml', locale: 'Malayalam', script: /[\u0D00-\u0D7F]/ },
  Bengali: { code: 'bn', locale: 'Bengali', script: /[\u0980-\u09FF]/ },
  Marathi: { code: 'mr', locale: 'Marathi', script: /[\u0900-\u097F]/ },
  Urdu: { code: 'ur', locale: 'Urdu', script: /[\u0600-\u06FF]/ },
  Punjabi: { code: 'pa', locale: 'Punjabi', script: /[\u0A00-\u0A7F]/ },
  Gujarati: { code: 'gu', locale: 'Gujarati', script: /[\u0A80-\u0AFF]/ },
  Spanish: { code: 'es', locale: 'Spanish', script: null },
  French: { code: 'fr', locale: 'French', script: null },
  German: { code: 'de', locale: 'German', script: null },
  Portuguese: { code: 'pt', locale: 'Portuguese', script: null },
  Japanese: { code: 'ja', locale: 'Japanese', script: /[\u3040-\u30FF\u4E00-\u9FFF]/ },
  Korean: { code: 'ko', locale: 'Korean', script: /[\uAC00-\uD7AF]/ },
  Chinese: { code: 'zh-Hans', locale: 'Chinese', script: /[\u4E00-\u9FFF]/ },
  Arabic: { code: 'ar', locale: 'Arabic', script: /[\u0600-\u06FF]/ },
  Russian: { code: 'ru', locale: 'Russian', script: /[\u0400-\u04FF]/ },
};
const ICONS = ['Code2', 'Layers3', 'BarChart3', 'BrainCircuit', 'ShieldCheck', 'PanelsTopLeft', 'Target', 'Megaphone', 'Cloud', 'Compass'];
const COLORS = ['violet', 'blue', 'mint', 'peach', 'pink'];
const slug = (value = '') => String(value).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'topic';
const terms = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
const clean = (value, max = 500) => String(value ?? '').trim().slice(0, max);

function selectedLanguage(profile = {}) {
  const label = clean(profile.language || 'English', 50);
  if (label === 'Other') return clean(profile.customLanguage || 'English', 50) || 'English';
  return label;
}
function languageInfo(label) {
  return LANGUAGES[label] || { code: 'en', locale: label, script: null, fallbackOnly: true };
}
function youtubeSearchUrl(topic, goal, language = 'English') {
  const lang = selectedLanguage({ language });
  const info = languageInfo(lang);
  const phrase = encodeURIComponent(`${topic} ${goal} tutorial explained in ${lang}`);
  return `https://www.youtube.com/results?search_query=${phrase}&hl=${encodeURIComponent(info.code)}&gl=IN`;
}
function onlineSearchUrl(topic, goal, language = 'English') {
  const query = encodeURIComponent(`${topic} ${goal} learning resource official documentation ${language}`);
  if (/html|css|javascript|react|web|frontend|front-end|accessibility/i.test(`${topic} ${goal}`)) return `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(topic)}`;
  if (/python|pandas|sql|data analyst|statistics/i.test(`${topic} ${goal}`)) return `https://www.google.com/search?q=${query}`;
  return `https://www.google.com/search?q=${query}`;
}
function safeResourceUrl(value, topic, goal, language) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) return parsed.href;
  } catch {}
  return onlineSearchUrl(topic, goal, language);
}
function inferBase(profile = {}) {
  const roleId = clean(profile.goalId, 60);
  const selected = roadmapData.find((item) => item.id === roleId && item.id !== 'career-explorer');
  if (selected) return selected;
  const goal = terms(profile.customGoal || profile.careerGoal || profile.goal || '');
  const matches = [
    [['frontend', 'front end', 'website', 'web developer', 'react', 'html', 'css'], 'frontend-developer'],
    [['full stack', 'fullstack', 'backend', 'back end', 'software engineer', 'software developer', 'web app'], 'full-stack-developer'],
    [['data analyst', 'data analysis', 'business analyst', 'excel', 'sql', 'business intelligence'], 'data-analyst'],
    [['ai', 'machine learning', 'ml engineer', 'data science', 'artificial intelligence', 'llm', 'rag'], 'ai-ml-engineer'],
    [['cyber', 'security analyst', 'ethical hacking', 'soc analyst', 'infosec'], 'cybersecurity-analyst'],
    [['ux', 'ui', 'designer', 'figma', 'product design'], 'ui-ux-designer'],
    [['product manager', 'product management', 'product owner'], 'product-manager'],
    [['digital marketing', 'seo', 'social media', 'marketing', 'content creator'], 'digital-marketer'],
    [['cloud', 'devops', 'aws engineer', 'infrastructure'], 'cloud-engineer'],
  ];
  for (const [words, id] of matches) if (words.some((word) => goal.includes(word))) return roadmapData.find((item) => item.id === id) || roadmapData[0];
  return roadmapData.find((item) => item.id === 'career-explorer') || roadmapData[0];
}
function choosePool(profile, base) {
  if (ROLE_POOLS[base.id]) return ROLE_POOLS[base.id];
  const goal = clean(profile.customGoal || profile.careerGoal || base.title, 120);
  const lower = goal.toLowerCase();
  if (/game|unity|unreal/.test(lower)) return [
    ['Game loop and programming foundations', 'Understand update loops, input, variables and functions through a tiny interactive scene.', ['Programming', 'Game loops', 'Input']],
    ['2D/3D scenes and asset workflows', 'Organise scenes, objects and assets for a small playable experience.', ['Scene graph', 'Assets', 'Transforms']],
    ['Physics, collisions and player feedback', 'Implement movement and collision rules that make behaviour feel predictable.', ['Physics', 'Collision', 'Feedback']],
    ['Gameplay systems and state', 'Create a small mechanic with clear states, rules and reusable scripts.', ['Gameplay logic', 'State', 'Scripting']],
    ['Interface, sound and accessibility', 'Add readable UI, useful audio feedback and accessible controls.', ['UI', 'Audio', 'Accessibility']],
    ['Level design and playtesting', 'Build one level and improve it using playtest observations.', ['Level design', 'Testing', 'Iteration']],
    ['Optimisation and bug diagnosis', 'Profile a small scene and prioritise meaningful fixes.', ['Profiling', 'Debugging', 'Performance']],
    ['Publish a polished playable project', 'Package a short game and present its goals, controls and design decisions.', ['Build', 'Release', 'Portfolio']],
    ['Expand a mechanic into a vertical slice', 'Develop one complete gameplay loop with a clear start and finish.', ['Vertical slice', 'Architecture', 'Portfolio']],
    ['Game development interview practice', 'Explain architecture, trade-offs and lessons from a playable build.', ['Code review', 'Communication', 'Portfolio']],
  ];
  if (/finance|cfa|investment|account|bank/.test(lower)) return [
    ['Financial statements and terminology', 'Read core financial statements and connect the numbers to business activity.', ['Income statement', 'Balance sheet', 'Cash flow']],
    ['Time value of money and rates', 'Use discounting, compounding and rate comparisons in practical examples.', ['Compounding', 'Discounting', 'Rates']],
    ['Excel modelling and data checks', 'Create a transparent model with assumptions, formulas and checks.', ['Spreadsheets', 'Modelling', 'Validation']],
    ['Economics and market context', 'Connect economic indicators to the decision you want to analyse.', ['Economics', 'Indicators', 'Market context']],
    ['Risk, return and diversification', 'Compare alternatives using risk, return and uncertainty rather than headlines.', ['Risk', 'Return', 'Diversification']],
    ['Valuation and scenario analysis', 'Build simple scenarios and challenge assumptions with sensitivity checks.', ['Valuation', 'Scenarios', 'Sensitivity']],
    ['Ethics, compliance and client outcomes', 'Identify conflicts, disclosure needs and responsible decision boundaries.', ['Ethics', 'Compliance', 'Client outcomes']],
    ['Analyse a real company or sector', 'Prepare an evidence-led analysis from public information and disclose limitations.', ['Research', 'Analysis', 'Reporting']],
    ['Investment or finance case study', 'Present a recommendation, risk factors, valuation assumptions and uncertainty.', ['Case study', 'Communication', 'Portfolio']],
    ['Role-specific assessment practice', 'Practise the problem types most relevant to your target position or credential.', ['Practice questions', 'Accuracy', 'Exam strategy']],
  ];
  return [
    ['Understand the role and success criteria', `Map the key responsibilities and outcomes expected in ${goal}.`, ['Role research', 'Success criteria', 'Planning']],
    ['Build the essential foundations', `Learn the core concepts and tools most often used in ${goal}.`, ['Core concepts', 'Tools', 'Vocabulary']],
    ['Practise the most common workflows', `Complete small exercises based on realistic tasks in ${goal}.`, ['Workflow', 'Practice', 'Quality checks']],
    ['Learn how to evaluate your work', 'Create criteria to check accuracy, quality, usability or business value.', ['Evaluation', 'Feedback', 'Quality']],
    ['Use relevant digital tools and automation', 'Choose tools that reduce routine work and document where they help.', ['Digital tools', 'Automation', 'Documentation']],
    ['Solve a real problem in your interest area', 'Apply the new skills to a small problem connected to your interests.', ['Problem solving', 'Iteration', 'Communication']],
    ['Collaborate and present your decisions', 'Practise explaining constraints, options and recommendations to another person.', ['Collaboration', 'Presentation', 'Reasoning']],
    ['Create a proof-of-skill project', 'Deliver one useful outcome that demonstrates the target role’s core responsibilities.', ['Project planning', 'Delivery', 'Portfolio']],
    ['Improve the project through feedback', 'Use feedback and evaluation criteria to improve the first version.', ['Iteration', 'Testing', 'Reflection']],
    ['Prepare for a real opportunity', 'Translate project evidence into a role-relevant portfolio, CV or interview story.', ['Portfolio', 'Communication', 'Career readiness']],
  ];
}
function targetLessonCount(profile = {}) {
  const hours = Math.max(1, Math.min(40, Number(profile.hoursPerWeek) || 5));
  const months = Math.max(1, Math.min(24, Number(profile.timelineMonths) || 4));
  return Math.max(6, Math.min(10, Math.round(6 + Math.sqrt(hours * months) / 3)));
}
function makeFallbackRoadmap(profile = {}) {
  const base = inferBase(profile);
  const goal = clean(profile.goalId === 'custom' ? profile.customGoal : (profile.customGoal || base.title), 120) || base.title;
  const language = selectedLanguage(profile);
  const interests = clean(profile.interests, 240);
  const motivation = clean(profile.motivation, 240);
  const project = clean(profile.dreamProject, 240);
  const skillsText = clean(profile.currentSkills, 240);
  const level = clean(profile.experience || 'Beginner', 60);
  const weeklyHours = Math.max(1, Number(profile.hoursPerWeek) || 5);
  const monthCount = Math.max(1, Number(profile.timelineMonths) || 4);
  const pool = choosePool(profile, base).map((row) => [...row]);
  const levelLower = level.toLowerCase();
  if (levelLower.includes('intermediate') || levelLower.includes('experience')) {
    const index = pool.findIndex((row) => /foundations|programming foundations|essential foundations|understand the role/i.test(row[0]));
    if (index >= 0) pool.splice(index, 1);
  }
  // Use explicitly shared prior knowledge to remove overlapping foundation topics, while retaining a viable progression.
  if (skillsText && !/starting from zero|beginner|none yet/i.test(skillsText)) {
    const tokens = skillsText.toLowerCase().split(/[^a-z0-9+#.]+/).filter((token) => token.length >= 3);
    for (let i = pool.length - 1; i >= 0 && pool.length > 6; i -= 1) {
      const searchable = `${pool[i][0]} ${pool[i][1]} ${(pool[i][2] || []).join(' ')}`.toLowerCase();
      const isEarlyFoundation = i <= 3 && tokens.some((token) => searchable.includes(token));
      if (isEarlyFoundation) pool.splice(i, 1);
    }
  }
  const desiredCount = targetLessonCount(profile);
  // Keep the final outcome topic even when a profile-specific filter shortened the pool.
  while (pool.length < desiredCount) {
    const slot = pool.length + 1;
    pool.push([`Targeted practice ${slot}: ${goal}`, `Apply your current ${goal} skills to a new scenario${interests ? ` connected to ${interests}` : ' based on a realistic user problem'}. Evaluate the result using clear criteria and note what needs improvement.`, ['Applied practice', 'Evaluation', 'Reflection']]);
  }
  // Reserve the final position for the domain pool's capstone/career outcome rather than truncating it away.
  const selectedPool = pool.length > desiredCount ? [...pool.slice(0, desiredCount - 1), pool[pool.length - 1]] : pool.slice(0, desiredCount);
  // Replace one middle topic with an applied, interest-specific topic so even fallback plans respond to the profile.
  if (interests && selectedPool.length >= 7) {
    const interestTopic = [
      `Apply ${base.title} to ${interests}`,
      `Use the core skills of ${base.title} to solve a realistic problem connected to ${interests}. Compare at least two possible approaches and explain the trade-offs.`,
      ['Applied problem solving', 'Domain context', 'Trade-off analysis'],
    ];
    selectedPool.splice(Math.min(4, selectedPool.length - 2), 1, interestTopic);
  }
  // The learner's own project or motivation becomes the actual final milestone, not only an example sentence.
  if (project && selectedPool.length) {
    const finalIndex = selectedPool.length - 1;
    selectedPool[finalIndex] = [`Capstone: ${project}`, `Plan and deliver a portfolio-ready outcome for ${project}, with a clear scope, evaluation criteria and documented decisions.`, ['Project planning', 'Delivery', 'Reflection']];
  } else if (motivation && selectedPool.length) {
    const finalIndex = selectedPool.length - 1;
    selectedPool[finalIndex] = [`Career outcome: ${motivation}`, `Build a proof-of-skill outcome for ${goal} that supports your target: ${motivation}. Explain the result, the evidence behind it and the next improvement.`, ['Portfolio', 'Communication', 'Career readiness']];
  } else if (selectedPool.length) {
    const finalIndex = selectedPool.length - 1;
    selectedPool[finalIndex] = [`Portfolio outcome: demonstrate ${goal}`, `Build and present a role-relevant outcome for ${goal}. Include the problem, the skills applied, evidence of quality and the next improvement you would make.`, ['Portfolio', 'Delivery', 'Reflection']];
  }
  const phaseNames = ['Foundations', 'Core skills', 'Applied practice', 'Portfolio and next steps'];
  const lessons = selectedPool.map((topic, index) => {
    const [title, description, skills] = topic;
    const relevantContext = interests ? ` Use examples connected to your interest in ${interests}.` : '';
    const startingContext = skillsText ? ` Build on what you already know (${skillsText}) and fill any gaps before moving ahead.` : levelLower.includes('beginner') ? ' Start with a small example, then add complexity only when the basics are clear.' : ' Spend more time applying the idea and verifying the result than repeating basics.';
    const projectContext = project ? ` Connect the exercise to your goal of ${project}.` : '';
    const practice = index === desiredCount - 1
      ? `Create a portfolio-ready ${goal} outcome${project ? ` inspired by ${project}` : interests ? ` connected to ${interests}` : ''}. Explain the choices, show the result and note what you would improve next.`
      : `Complete a focused exercise: ${title.toLowerCase()}. ${interests ? `Use an example from ${interests}.` : `Use a realistic scenario from ${goal}.`}${projectContext}`;
    const phase = phaseNames[Math.min(3, Math.floor(index * 4 / desiredCount))];
    return {
      id: `${slug(title)}-${index + 1}`,
      title: clean(title, 110),
      duration: `${Math.max(1, Math.ceil((monthCount * 4.35) / desiredCount))} week${Math.ceil((monthCount * 4.35) / desiredCount) === 1 ? '' : 's'}`,
      description: `${description}${startingContext}${relevantContext}${motivation ? ` The outcome supports your motivation: ${motivation}.` : ''}`.slice(0, 800),
      videoTitle: `${title} — ${language} learning resource`,
      youtubeUrl: youtubeSearchUrl(title, goal, language),
      skills: skills.slice(0, 5),
      practice,
      resourceLabel: 'Online reading & reference',
      resourceUrl: onlineSearchUrl(title, goal, language),
      phase,
      difficulty: index < 2 && levelLower.includes('beginner') ? 'beginner' : index > desiredCount - 3 ? 'advanced' : 'intermediate',
      quizContext: `${title}: ${description} Skills: ${skills.join(', ')}. Practice: ${practice}`,
    };
  });
  const durationWeeks = Math.max(4, Math.min(104, Math.round(monthCount * 4.35)));
  return {
    id: `path-${slug(goal)}-${Date.now().toString(36)}`,
    title: goal,
    shortTitle: goal.length > 25 ? `${goal.slice(0, 22)}…` : goal,
    category: base.category || 'Personalised learning',
    icon: ICONS.includes(base.icon) ? base.icon : 'Compass',
    tagline: interests ? `A learning path shaped around ${interests}.` : `A step-by-step plan towards ${goal}.`,
    duration: `${durationWeeks} weeks · ${weeklyHours} hrs/week`,
    description: `A ${level.toLowerCase()}-aware learning journey built around your career goal${interests ? ` and interests in ${interests}` : ''}. This starter version was composed by the backend using the available learner details; add a Groq API key for generative AI sequencing.`,
    color: COLORS.includes(base.color) ? base.color : 'violet',
    generatedBy: 'personalized-fallback',
    lessons,
  };
}

function parseJson(text) {
  const cleaned = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
  throw new Error('The AI response was not valid JSON.');
}

// Groq API key pool supports GROQ_API_KEY plus numbered keys and a
// comma/newline-separated GROQ_API_KEYS value. Keys remain server-side.
let groqKeyCursor = 0;
function getGroqApiKeys() {
  const values = [];
  if (process.env.GROQ_API_KEY) values.push(process.env.GROQ_API_KEY);

  const numberedNames = Object.keys(process.env)
    .filter((name) => /^GROQ_API_KEY_\d+$/i.test(name))
    .sort((a, b) => Number(a.match(/\d+$/)?.[0] || 0) - Number(b.match(/\d+$/)?.[0] || 0));
  for (const name of numberedNames) values.push(process.env[name]);

  // Useful for deployment platforms that allow one secret variable only.
  values.push(...String(process.env.GROQ_API_KEYS || '').split(/[\s,;]+/));
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

export function getGroqConfigStatus() {
  const keyCount = getGroqApiKeys().length;
  return { configured: keyCount > 0, keyCount };
}

export async function generateWithGroq(prompt, config = {}) {
  const apiKeys = getGroqApiKeys();
  if (!apiKeys.length) return null;
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const timeoutMs = Math.max(1000, Number(process.env.GROQ_TIMEOUT_MS || 60000));

  // Round-robin selects the first key for each request. If that key fails,
  // try the remaining configured keys without changing the endpoint contract.
  const startIndex = groqKeyCursor % apiKeys.length;
  groqKeyCursor = (groqKeyCursor + 1) % apiKeys.length;
  const failures = [];

  for (let attempt = 0; attempt < apiKeys.length; attempt += 1) {
    const keyIndex = (startIndex + attempt) % apiKeys.length;
    const apiKey = apiKeys[keyIndex];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You generate structured learning data for a software application. Follow the user instructions carefully and return exactly one valid JSON object, without markdown fences or extra commentary.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: config.temperature ?? 0.7,
          reasoning_effort: config.reasoningEffort ?? 'low',
          max_completion_tokens: config.maxOutputTokens ?? 7000,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data?.error?.message || `Groq API returned HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      const responseText = data?.choices?.[0]?.message?.content;
      if (typeof responseText !== 'string' || !responseText.trim()) throw new Error('Groq returned an empty response.');
      return parseJson(responseText);
    } catch (error) {
      failures.push(`configured key slot ${keyIndex + 1}: ${error.message || error.name || 'request failed'}`);
      if (attempt < apiKeys.length - 1) {
        // Never print or return a secret. Logs contain only a slot number/status.
        console.warn(`Groq request failed with configured key slot ${keyIndex + 1}/${apiKeys.length}; trying the next configured key (${error.status ? `HTTP ${error.status}` : error.name || 'request error'}).`);
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error(`Groq request failed with all ${apiKeys.length} configured API key(s): ${failures.join(' | ')}`);
}

async function findYoutubeVideo(topic, goal, language) {
  const info = languageInfo(language);
  const fallbackUrl = youtubeSearchUrl(topic, goal, language);
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return { url: fallbackUrl, title: `${topic} — ${language} YouTube search` };
  try {
    const params = new URLSearchParams({
      part: 'snippet', q: `${topic} ${goal} tutorial explained in ${language}`, type: 'video', maxResults: '10',
      relevanceLanguage: info.code, regionCode: 'IN', safeSearch: 'strict', key: apiKey,
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let data;
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, { signal: controller.signal });
      data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error?.message || `YouTube API returned ${response.status}`);
    } finally { clearTimeout(timeout); }
    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) return { url: fallbackUrl, title: `${topic} — ${language} YouTube search` };
    const scriptMatch = info.script ? items.find((item) => info.script.test(`${item.snippet?.title || ''} ${item.snippet?.description || ''}`)) : null;
    const languageTextMatch = items.find((item) => new RegExp(`\\b${language.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(`${item.snippet?.title || ''} ${item.snippet?.description || ''}`));
    const chosen = scriptMatch || languageTextMatch || (info.code === 'en' && !info.fallbackOnly ? items[0] : null);
    const videoId = chosen.id?.videoId;
    if (!videoId) return { url: fallbackUrl, title: `${topic} — ${language} YouTube search` };
    return { url: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`, title: clean(chosen.snippet?.title || topic, 160) };
  } catch (error) {
    console.warn('YouTube lookup failed; using language-targeted search:', error.message);
    return { url: fallbackUrl, title: `${topic} — ${language} YouTube search` };
  }
}
async function addLanguageMatchedVideos(lessons, goal, language) {
  return Promise.all(lessons.map(async (lesson) => {
    const video = await findYoutubeVideo(lesson.title, goal, language);
    return { ...lesson, youtubeUrl: video.url, videoTitle: video.title };
  }));
}

export async function createPersonalizedRoadmap(profile = {}) {
  const fallback = makeFallbackRoadmap(profile);
  const language = selectedLanguage(profile);
  const goal = clean(profile.goalId === 'custom' ? profile.customGoal : (profile.customGoal || fallback.title), 120) || fallback.title;
  if (!getGroqApiKeys().length) {
    fallback.lessons = await addLanguageMatchedVideos(fallback.lessons, goal, language);
    return { roadmap: fallback, mode: 'personalized-fallback', notice: 'The backend generated a personalised starter path. Add GROQ_API_KEY or GROQ_API_KEYS to enable generative AI roadmap creation; YOUTUBE_API_KEY improves video selection for the chosen language.' };
  }

  const desiredCount = fallback.lessons.length;
  const learner = {
    name: clean(profile.name, 60), education: clean(profile.education, 80), preferredLearningLanguage: language,
    careerGoal: goal, experience: clean(profile.experience || 'Beginner', 60), currentSkills: clean(profile.currentSkills, 240),
    interests: clean(profile.interests, 240), motivation: clean(profile.motivation, 240), dreamProject: clean(profile.dreamProject, 240),
    learningStyle: clean(profile.learningStyle, 80), hoursPerWeek: Math.max(1, Number(profile.hoursPerWeek) || 5),
    targetTimelineMonths: Math.max(1, Number(profile.timelineMonths) || 4),
  };
  const prompt = `You are a career-learning architect. Generate a genuinely new roadmap for this individual; do not copy any seed curriculum or standard role template. Use the learner's goal, starting skill, interests, motivation, project idea, language, weekly time and timeline to choose and order the topics. Omit or compress topics they already know, introduce missing prerequisites, connect examples to interests, and end with a role-relevant practical outcome. The list must not be the same for all people choosing the same role. Keep the question-asking burden low: work only from the profile supplied.
LEARNER PROFILE JSON: ${JSON.stringify(learner)}
Create exactly ${desiredCount} topics (between 6 and 10), ordered as a learning progression. Assign each to one of four phases: Foundations, Core skills, Applied practice, Portfolio and next steps. Fit the scope to the timeline and weekly hours. Write roadmap and topic descriptions in clear English, but all YouTube links/titles must target videos taught in ${language}; include that language in the video search query when uncertain. Prefer trustworthy, relevant online reading resources. Return only JSON: {"title":string,"shortTitle":string,"category":string,"icon":string,"color":string,"tagline":string,"description":string,"lessons":[{"title":string,"duration":string,"description":string,"videoTitle":string,"youtubeUrl":string,"skills":[string,string,string],"practice":string,"resourceLabel":string,"resourceUrl":string,"phase":string,"difficulty":"beginner|intermediate|advanced","quizContext":string}]}. Exactly ${desiredCount} lessons. Use safe HTTPS URLs only. Do not invent video IDs; a YouTube search results URL is acceptable. Icons must be from [${ICONS.join(', ')}] and color from [${COLORS.join(', ')}].`;

  try {
    const generated = await generateWithGroq(prompt, { temperature: 0.7, maxOutputTokens: 8500 });
    if (!generated || !Array.isArray(generated.lessons) || generated.lessons.length < desiredCount) throw new Error(`AI roadmap response must contain ${desiredCount} complete topics.`);
    const lessons = generated.lessons.slice(0, desiredCount);
    while (lessons.length < desiredCount) lessons.push(fallback.lessons[lessons.length]);
    const normalizedLessons = lessons.map((lesson, index) => {
      const title = clean(lesson.title || fallback.lessons[index].title, 110);
      return {
        ...fallback.lessons[index],
        ...lesson,
        id: `${slug(title)}-${index + 1}`,
        title,
        duration: clean(lesson.duration || fallback.lessons[index].duration, 40),
        description: clean(lesson.description || fallback.lessons[index].description, 800),
        skills: Array.isArray(lesson.skills) ? lesson.skills.slice(0, 5).map((item) => clean(item, 80)).filter(Boolean) : fallback.lessons[index].skills,
        practice: clean(lesson.practice || fallback.lessons[index].practice, 800),
        resourceLabel: clean(lesson.resourceLabel || 'Online reading & reference', 100),
        resourceUrl: safeResourceUrl(lesson.resourceUrl, title, generated.title || goal, language),
        phase: ['Foundations', 'Core skills', 'Applied practice', 'Portfolio and next steps'][Math.min(3, Math.floor(index * 4 / desiredCount))],
        difficulty: ['beginner', 'intermediate', 'advanced'].includes(String(lesson.difficulty).toLowerCase()) ? String(lesson.difficulty).toLowerCase() : fallback.lessons[index].difficulty,
        quizContext: clean(lesson.quizContext || `${title}: ${lesson.description || ''} ${(lesson.skills || []).join(', ')}`, 2000),
      };
    });
    const title = clean(generated.title || goal, 120);
    const matchedLessons = await addLanguageMatchedVideos(normalizedLessons, title, language);
    return {
      mode: 'ai',
      roadmap: {
        ...fallback, ...generated,
        id: `path-${slug(title)}-${Date.now().toString(36)}`,
        title,
        shortTitle: clean(generated.shortTitle || title, 40),
        tagline: clean(generated.tagline || fallback.tagline, 220),
        description: clean(generated.description || fallback.description, 1200),
        duration: fallback.duration,
        icon: ICONS.includes(generated.icon) ? generated.icon : fallback.icon,
        color: COLORS.includes(generated.color) ? generated.color : fallback.color,
        generatedBy: 'groq',
        lessons: matchedLessons,
      },
    };
  } catch (error) {
    console.error('AI roadmap generation failed; using personalised backend path:', error.message);
    fallback.lessons = await addLanguageMatchedVideos(fallback.lessons, goal, language);
    return { roadmap: fallback, mode: 'personalized-fallback', notice: 'The AI provider was unavailable for this request, so the backend created an adaptive starter path. Check your GROQ_API_KEY/GROQ_API_KEYS pool and GROQ_MODEL to enable AI sequencing.' };
  }
}

function rotate(values, offset) {
  if (!values.length) return values;
  const n = ((offset % values.length) + values.length) % values.length;
  return [...values.slice(n), ...values.slice(0, n)];
}
function normalizeDifficulty(value, fallback = 'intermediate') {
  const text = String(value || '').toLowerCase();
  if (/hard|advanced|challenging/.test(text)) return 'advanced';
  if (/easy|beginner|basic/.test(text)) return 'beginner';
  if (/medium|intermediate|moderate/.test(text)) return 'intermediate';
  return fallback;
}
function questionSeconds(difficulty, topicDifficulty) {
  const base = difficulty === 'advanced' ? 80 : difficulty === 'beginner' ? 40 : 60;
  const multiplier = topicDifficulty === 'advanced' ? 1.12 : topicDifficulty === 'beginner' ? 0.9 : 1;
  return Math.round(base * multiplier);
}
function finaliseQuiz(quiz, lesson) {
  const topicDifficulty = normalizeDifficulty(quiz.difficulty || lesson.difficulty, 'intermediate');
  const questions = quiz.questions.map((question, index) => ({
    ...question,
    id: clean(question.id || `question-${index + 1}`, 90),
    difficulty: normalizeDifficulty(question.difficulty, topicDifficulty),
  }));
  const questionSecondsTotal = questions.reduce((total, question) => total + questionSeconds(question.difficulty, topicDifficulty), 0);
  const timeLimitSeconds = Math.max(180, Math.min(600, questionSecondsTotal));
  return { ...quiz, difficulty: topicDifficulty, questions, timeLimitSeconds };
}
function createFallbackQuiz({ lesson = {}, pathTitle = 'this course', attempt = 1, nonce = '', avoidQuestions = [], language = 'English' } = {}) {
  const title = clean(lesson.title || 'this topic', 110);
  const description = clean(lesson.description || `Learn the main ideas in ${title}.`, 600);
  const skills = Array.isArray(lesson.skills) && lesson.skills.length ? lesson.skills.slice(0, 5) : ['Core concepts', 'Applying the method', 'Reviewing results'];
  const practice = clean(lesson.practice || `Complete a small exercise using ${title}.`, 500);
  const mainSkill = skills[0];
  const nextSkill = skills[1] || 'Applying the concept';
  const stems = ['in a practical learning scenario', 'when you apply this at work', 'while building a small project', 'as you review your understanding', 'when debugging an early attempt', 'for a portfolio-quality result', 'when explaining the idea to a teammate', 'in a new situation related to your interests'];
  const seed = [...String(nonce)].reduce((sum, char) => sum + char.charCodeAt(0), Math.max(1, Number(attempt) || 1));
  const context = stems[seed % stems.length];
  const alternatives = rotate([`A tool unrelated to ${title}`, 'Guess without checking the outcome', 'Memorise terms without applying them', 'Skip validation and assume the result is correct'], seed);
  const baseQuestions = [
    {
      variants: [
        `In ${context}, what main outcome would show that you understand “${title}”?`,
        `Which statement best describes why “${title}” matters for ${pathTitle}?`,
        `How would you accurately explain “${title}” to a teammate?`,
        `When applying “${title}”, which objective should guide your work?`,
      ],
      options: [description.replace(/[.!?]+$/, ''), `To replace every other skill in ${pathTitle}`, 'To avoid checking whether the result works', 'To memorise terminology without practising'],
      correctText: description.replace(/[.!?]+$/, ''),
      explanation: `${description} Connect the concept to the learning goal and validate it through practice.`,
      difficulty: 'beginner',
    },
    {
      variants: [
        `Which activity is strongest evidence that you can apply “${title}”?`,
        `You need to demonstrate progress in “${title}”. Which result is the most useful evidence?`,
        `Which practical outcome best demonstrates your progress on this topic?`,
        `A mentor wants proof that you can use “${title}”. What should you show?`,
      ],
      options: [practice.replace(/[.!?]+$/, ''), ...alternatives.slice(0, 3)],
      correctText: practice.replace(/[.!?]+$/, ''),
      explanation: 'The practice task demonstrates application, rather than recognition of the topic name alone.',
      difficulty: 'intermediate',
    },
    {
      variants: [
        `Which skill is the most direct focus when starting work on “${title}”?`,
        `Which skill should you use first to make progress on this topic?`,
        `What should you check to validate your understanding of “${title}”?`,
        `Which concept related to “${title}” should you be able to identify and explain?`,
      ],
      options: [mainSkill, alternatives[0], alternatives[1], alternatives[2]],
      correctText: mainSkill,
      explanation: `${mainSkill} is a key skill for this topic. Use it to check the result before adding complexity.`,
      difficulty: 'beginner',
    },
    {
      variants: [
        `After a first attempt at “${title}”, what is the strongest next step?`,
        `How should you review your initial work on “${title}”?`,
        `A teammate asks how you know your solution works. What should you do next?`,
        `Your draft appears to work, but you are unsure about quality. What action is most useful?`,
      ],
      options: [`Compare the result against the task requirements and review ${nextSkill}`, 'Move ahead without inspecting the result', 'Replace the task with an unrelated tool', 'Focus only on making it look finished'],
      correctText: `Compare the result against the task requirements and review ${nextSkill}`,
      explanation: 'A reliable workflow compares output against clear requirements and checks the underlying skill.',
      difficulty: 'intermediate',
    },
    {
      variants: [
        `A first solution involving “${title}” fails with new input. What should you do first?`,
        `Your result does not meet the requirements. Which response is best?`,
        `Your approach to “${title}” breaks in an edge case. How should you respond?`,
        `You see unexpected output while applying the topic. Which action should you take?`,
      ],
      options: ['Inspect the assumptions, isolate the issue and test a small change', 'Assume the topic cannot be used in real work', 'Copy a solution without checking its context', 'Ignore the failed result and claim completion'],
      correctText: 'Inspect the assumptions, isolate the issue and test a small change',
      explanation: 'Systematic debugging and a small test help identify whether the problem is an assumption, implementation or missing prerequisite.',
      difficulty: normalizeDifficulty(lesson.difficulty, 'intermediate') === 'advanced' ? 'advanced' : 'intermediate',
    },
  ];
  const seen = new Set(avoidQuestions.map((item) => String(typeof item === 'string' ? item : item?.question || '').toLowerCase().replace(/\s+/g, ' ').trim()));
  const questions = rotate(baseQuestions, seed % baseQuestions.length).map((item, index) => {
    const variants = rotate(item.variants, (seed + index) % item.variants.length);
    let question = variants.find((candidate) => !seen.has(candidate.toLowerCase().replace(/\s+/g, ' ').trim())) || variants[0];
    if (seen.has(question.toLowerCase().replace(/\s+/g, ' ').trim())) question = `${question} (alternate scenario ${attempt}-${String(nonce).slice(-6)}-${index + 1})`;
    const options = [item.correctText, ...item.options.filter((option) => option !== item.correctText).slice(0, 3)];
    while (options.length < 4) options.push(`Review another aspect of ${title}`);
    const shuffled = rotate(options, seed + index * 3);
    return { id: `q-${attempt}-${index + 1}-${slug(title)}-${Math.abs(seed).toString(36)}`, question, options: shuffled, correctIndex: shuffled.indexOf(item.correctText), explanation: item.explanation, difficulty: item.difficulty };
  });
  const topicDifficulty = normalizeDifficulty(lesson.difficulty, 'intermediate');
  return finaliseQuiz({ title: `${title}: knowledge check`, instructions: `Choose one best answer for each question. The timer is based on topic and question difficulty. Language preference: ${language}.`, passMark: 4, difficulty: topicDifficulty, questions }, lesson);
}

export async function createTopicQuiz(payload = {}) {
  const lesson = payload.lesson || {};
  const pathTitle = clean(payload.pathTitle || 'Personalised learning path', 120);
  const attempt = Math.max(1, Number(payload.attempt) || 1);
  const language = clean(payload.profile?.language || 'English', 50);
  const avoidQuestions = Array.isArray(payload.avoidQuestions) ? payload.avoidQuestions.slice(-40).map((item) => clean(typeof item === 'string' ? item : item?.question || '', 250)).filter(Boolean) : [];
  const fallback = createFallbackQuiz({ lesson, pathTitle, attempt, nonce: payload.nonce || `${Date.now()}-${Math.random()}`, avoidQuestions, language });
  if (!getGroqApiKeys().length) return { mode: 'personalized-fallback', quiz: fallback };
  const prompt = `Create a fresh assessment for this single topic. Each call must create meaningfully different questions, scenarios, options and answer patterns. This is attempt ${attempt}; nonce ${String(payload.nonce || Date.now())}. Avoid both repeating and lightly paraphrasing every prior question supplied. The questions, options and explanations must be written in ${language}. Learner profile: ${JSON.stringify({ education: payload.profile?.education, experience: payload.profile?.experience, interests: payload.profile?.interests, currentSkills: payload.profile?.currentSkills, language })}. Course: ${pathTitle}. Topic: ${JSON.stringify({ title: lesson.title, description: lesson.description, skills: lesson.skills, practice: lesson.practice, quizContext: lesson.quizContext, difficulty: lesson.difficulty })}. Prior questions: ${JSON.stringify(avoidQuestions)}. Return only JSON schema: {"title":string,"instructions":string,"passMark":integer,"difficulty":"beginner|intermediate|advanced","questions":[{"question":string,"options":[string,string,string,string],"correctIndex":integer,"explanation":string,"difficulty":"beginner|intermediate|advanced"}]}. Exactly 5 questions. Each must have one defensible correct answer, plausible distractors, clear language and no trick questions. Mix conceptual, application and scenario tasks; topic and question difficulty should reflect the learner's level. Use no markdown.`;
  try {
    const generated = await generateWithGroq(prompt, { temperature: 0.9, maxOutputTokens: 5200 });
    if (!generated || !Array.isArray(generated.questions) || generated.questions.length < 5) throw new Error('AI quiz was incomplete.');
    const previousLower = new Set(avoidQuestions.map((question) => question.toLowerCase().replace(/\s+/g, ' ').trim()));
    const normalizedQuestions = generated.questions.slice(0, 5).map((question, index) => {
      const text = clean(question.question || fallback.questions[index].question, 400);
      const options = Array.isArray(question.options) ? question.options.slice(0, 4).map((option) => clean(option, 500)) : fallback.questions[index].options;
      while (options.length < 4) options.push(fallback.questions[index].options[options.length]);
      let correctIndex = Number(question.correctIndex);
      if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) correctIndex = fallback.questions[index].correctIndex;
      return { id: `ai-${attempt}-${index + 1}-${slug(lesson.title)}`, question: previousLower.has(text.toLowerCase().replace(/\s+/g, ' ').trim()) ? `${text} — new scenario ${String(payload.nonce || '').slice(-6)}` : text, options, correctIndex, explanation: clean(question.explanation || 'Review the topic and compare each option with the stated learning objective.', 700), difficulty: normalizeDifficulty(question.difficulty, normalizeDifficulty(generated.difficulty, 'intermediate')) };
    });
    const uniqueCount = new Set(normalizedQuestions.map((question) => question.question.toLowerCase().trim())).size;
    if (uniqueCount < 5) throw new Error('AI returned duplicate questions.');
    return { mode: 'ai', quiz: finaliseQuiz({ title: clean(generated.title || `${lesson.title}: knowledge check`, 140), instructions: clean(generated.instructions || 'Choose one best answer for each question.', 350), passMark: Math.min(5, Math.max(3, Number(generated.passMark) || 4)), difficulty: normalizeDifficulty(generated.difficulty, normalizeDifficulty(lesson.difficulty, 'intermediate')), questions: normalizedQuestions }, lesson) };
  } catch (error) {
    console.error('AI quiz generation failed; using varied backend quiz:', error.message);
    return { mode: 'personalized-fallback', quiz: fallback };
  }
}
