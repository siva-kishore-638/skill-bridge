import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { createPersonalizedRoadmap, createTopicQuiz, getGroqConfigStatus } from './ai.js';

const app = express();
const port = Number(process.env.PORT || 8787);
const isProduction = process.env.NODE_ENV === 'production';

// Normalise configured values to a true origin. This avoids accidental CORS
// mismatches when .env contains a trailing slash or a full URL with a path.
function normalizeOrigin(value) {
  if (!value || typeof value !== 'string') return null;
  try { return new URL(value.trim()).origin; } catch { return null; }
}
function splitOriginList(value) {
  return String(value || '').split(/[\s,;]+/).map(normalizeOrigin).filter(Boolean);
}
const defaultOrigins = [
  'http://localhost:5173', 'http://localhost:4173',
  'http://127.0.0.1:5173', 'http://127.0.0.1:4173',
].map(normalizeOrigin);
const configuredOrigins = [
  ...splitOriginList(process.env.FRONTEND_URL),
  ...splitOriginList(process.env.FRONTEND_URLS),
  ...splitOriginList(process.env.CORS_ALLOWED_ORIGINS),
  ...(process.env.VERCEL_URL ? splitOriginList(`https://${process.env.VERCEL_URL}`) : []),
];
const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);
const quizzes = new Map();
const QUIZ_TTL_MS = 30 * 60 * 1000;

function isLocalDevelopmentOrigin(origin) {
  if (isProduction) return false;
  let parsed;
  try { parsed = new URL(origin); } catch { return false; }
  if (parsed.protocol !== 'http:') return false;
  const host = parsed.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '0.0.0.0' || host.endsWith('.localhost') || host.endsWith('.local')) return true;
  // Vite is sometimes opened through a laptop's private LAN IP for mobile testing.
  const octets = host.split('.').map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  return octets[0] === 10
    || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    || (octets[0] === 192 && octets[1] === 168)
    || (octets[0] === 169 && octets[1] === 254);
}

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header are server-to-server/CLI requests.
    if (!origin) return callback(null, true);
    const normalized = normalizeOrigin(origin);
    if (normalized && (allowedOrigins.has(normalized) || isLocalDevelopmentOrigin(normalized))) {
      return callback(null, true);
    }
    return callback(new Error(
      `Origin ${origin} is not allowed by PathPilot API CORS settings. ` +
      'Add your frontend origin to FRONTEND_URL in the backend environment (comma-separated origins; no path), then restart/redeploy the API.'
    ));
  },
}));
app.use(express.json({ limit: '100kb' }));

function paymentsConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_PLAN_ID);
}
function secureEqualHex(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const a = Buffer.from(left, 'hex'); const b = Buffer.from(right, 'hex');
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
}
function cleanOldQuizzes() {
  const cutoff = Date.now() - QUIZ_TTL_MS;
  for (const [id, quiz] of quizzes) if (quiz.createdAt < cutoff || quiz.abandoned || quiz.submitted) quizzes.delete(id);
}
function publicQuiz(quiz) {
  return {
    title: quiz.title,
    instructions: quiz.instructions,
    passMark: quiz.passMark,
    difficulty: quiz.difficulty,
    timeLimitSeconds: quiz.timeLimitSeconds,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      question: question.question,
      options: question.options,
      difficulty: question.difficulty,
    })),
  };
}
function quizFeedback(storedQuiz, answers, expired) {
  const results = storedQuiz.quiz.questions.map((question) => {
    const raw = answers?.[question.id];
    const numeric = Number(raw);
    const selectedIndex = raw !== undefined && raw !== null && Number.isInteger(numeric) && numeric >= 0 && numeric < question.options.length ? numeric : null;
    const correct = selectedIndex !== null && selectedIndex === Number(question.correctIndex);
    return {
      id: question.id,
      question: question.question,
      options: question.options,
      selectedIndex,
      correctIndex: Number(question.correctIndex),
      correct,
      explanation: question.explanation,
    };
  });
  const score = results.filter((item) => item.correct).length;
  return {
    score,
    total: results.length,
    passed: !expired && score >= storedQuiz.quiz.passMark,
    expired,
    passMark: storedQuiz.quiz.passMark,
    results,
    submittedAt: new Date().toISOString(),
  };
}

app.get('/api/health', (_req, res) => {
  const groqStatus = getGroqConfigStatus();
  res.json({
    ok: true,
    service: 'PathPilot API',
    aiProvider: 'groq',
    aiConfigured: groqStatus.configured,
    aiKeyCount: groqStatus.keyCount,
    youtubeApiConfigured: Boolean(process.env.YOUTUBE_API_KEY),
    paymentsConfigured: paymentsConfigured(),
  });
});

app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const raw = req.body?.profile;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return res.status(400).json({ error: 'A learner profile is required.' });
    const profile = {
      name: String(raw.name || 'Learner').slice(0, 60),
      email: String(raw.email || '').slice(0, 160),
      education: String(raw.education || '').slice(0, 80),
      language: String(raw.language || 'English').slice(0, 50),
      customLanguage: String(raw.customLanguage || '').slice(0, 50),
      goalId: String(raw.goalId || 'custom').slice(0, 80),
      customGoal: String(raw.customGoal || '').slice(0, 120),
      experience: String(raw.experience || 'Beginner').slice(0, 60),
      hoursPerWeek: Math.max(1, Math.min(40, Number(raw.hoursPerWeek) || 5)),
      timelineMonths: Math.max(1, Math.min(24, Number(raw.timelineMonths) || 4)),
      interests: String(raw.interests || '').slice(0, 240),
      motivation: String(raw.motivation || '').slice(0, 240),
      dreamProject: String(raw.dreamProject || '').slice(0, 240),
      currentSkills: String(raw.currentSkills || '').slice(0, 240),
      learningStyle: String(raw.learningStyle || 'A balanced mix').slice(0, 80),
      preferredIndustry: String(raw.preferredIndustry || '').slice(0, 120),
    };
    if (!profile.customGoal.trim() && profile.goalId === 'custom') return res.status(400).json({ error: 'Choose a career role or describe the role you want.' });
    const result = await createPersonalizedRoadmap(profile);
    if (!result?.roadmap?.lessons?.length) throw new Error('Roadmap generator returned no topics.');
    return res.json(result);
  } catch (error) {
    console.error('Roadmap generation error:', error.message);
    return res.status(500).json({ error: 'Could not generate a learning roadmap. Check the AI provider settings or try again.' });
  }
});

app.post('/api/generate-quiz', async (req, res) => {
  cleanOldQuizzes();
  try {
    const lesson = req.body?.lesson;
    if (!lesson || !String(lesson.title || '').trim()) return res.status(400).json({ error: 'A topic is required to generate an assignment.' });
    if (quizzes.size >= 500) return res.status(503).json({ error: 'The assessment service is busy. Try again shortly.' });
    const result = await createTopicQuiz(req.body);
    if (!result?.quiz?.questions?.length) throw new Error('Assignment generator returned no questions.');
    const quizId = crypto.randomUUID();
    quizzes.set(quizId, {
      id: quizId,
      quiz: result.quiz,
      createdAt: Date.now(),
      startedAt: null,
      abandoned: false,
      submitted: false,
    });
    return res.json({ quizId, mode: result.mode, quiz: publicQuiz(result.quiz) });
  } catch (error) {
    console.error('Assignment generation error:', error.message);
    return res.status(500).json({ error: 'Could not prepare this assignment. Please try again.' });
  }
});

app.post('/api/start-quiz', (req, res) => {
  cleanOldQuizzes();
  const quizId = String(req.body?.quizId || '');
  const item = quizzes.get(quizId);
  if (!item || item.abandoned || item.submitted) return res.status(404).json({ error: 'This assessment has expired. Generate a new question set.' });
  if (item.startedAt) return res.status(409).json({ error: 'This assessment has already started. Generate a new question set to begin again.' });
  item.startedAt = Date.now();
  return res.json({ startedAt: new Date(item.startedAt).toISOString(), timeLimitSeconds: item.quiz.timeLimitSeconds });
});

app.post('/api/submit-quiz', (req, res) => {
  cleanOldQuizzes();
  const quizId = String(req.body?.quizId || '');
  const item = quizzes.get(quizId);
  if (!item || item.abandoned || item.submitted) return res.status(404).json({ error: 'This assessment is no longer active. Generate a fresh question set.' });
  if (!item.startedAt) return res.status(409).json({ error: 'Start the assessment in fullscreen before submitting.' });
  const elapsedSeconds = (Date.now() - item.startedAt) / 1000;
  // A small network grace window prevents a valid final submission being rejected by request latency.
  const expired = req.body?.timedOut === true || elapsedSeconds > item.quiz.timeLimitSeconds + 5;
  const rawAnswers = req.body?.answers && typeof req.body.answers === 'object' ? req.body.answers : {};
  const answers = Object.fromEntries(Object.entries(rawAnswers).slice(0, 20).map(([key, value]) => [String(key), Number(value)]));
  const result = quizFeedback(item, answers, expired);
  item.submitted = true;
  return res.json(result);
});

app.post('/api/abandon-quiz', (req, res) => {
  cleanOldQuizzes();
  const quizId = String(req.body?.quizId || '');
  const item = quizzes.get(quizId);
  if (!item) return res.json({ ok: true });
  item.abandoned = true;
  quizzes.delete(quizId);
  return res.json({ ok: true });
});

app.post('/api/create-subscription', async (_req, res) => {
  if (!paymentsConfigured()) {
    return res.json({
      configured: false,
      message: 'Live payments are not configured. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_PLAN_ID to the backend environment. You can use preview mode while developing.',
    });
  }
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  try {
    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        total_count: 12,
        quantity: 1,
        customer_notify: 1,
        notes: { product: 'PathPilot Pro', source: 'PathPilot web app' },
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.id) {
      console.error('Razorpay subscription creation failed:', result?.error?.description || response.status);
      return res.status(502).json({ configured: true, error: result?.error?.description || 'Razorpay could not create a subscription. Check the Plan ID and account settings.' });
    }
    return res.json({ configured: true, keyId: process.env.RAZORPAY_KEY_ID, subscriptionId: result.id });
  } catch (error) {
    console.error('Razorpay create-subscription error:', error.message);
    return res.status(502).json({ configured: true, error: 'Could not reach Razorpay. Try again later.' });
  }
});

app.post('/api/verify-subscription', (req, res) => {
  if (!paymentsConfigured()) return res.status(503).json({ verified: false, error: 'Payments are not configured on this server.' });
  const paymentId = req.body?.razorpay_payment_id;
  const subscriptionId = req.body?.razorpay_subscription_id;
  const signature = req.body?.razorpay_signature;
  if (!paymentId || !subscriptionId || !signature) return res.status(400).json({ verified: false, error: 'Payment verification fields are missing.' });
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${paymentId}|${subscriptionId}`).digest('hex');
  if (!secureEqualHex(expected, signature)) return res.status(400).json({ verified: false, error: 'Payment signature validation failed.' });
  return res.json({ verified: true, subscriptionId, paymentId });
});

app.use((error, _req, res, _next) => {
  if (error?.message?.includes('CORS')) return res.status(403).json({ error: error.message });
  console.error('PathPilot API error:', error?.message || error);
  return res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(port, () => console.log(`PathPilot API running on http://localhost:${port}`));
