# PathPilot — Adaptive Learning Platform

PathPilot is a mobile-first learning platform that asks only for the essentials and requests a career roadmap from an Express backend. The AI pathway is generated using the current learner profile rather than showing a fixed course for everyone with the same role.

## Latest changes

- **Short onboarding:** asks for a preferred learning-resource language (Telugu, Hindi or English), career goal, starting level and available time. Name, interests and existing skills are optional personalisation details.
- **Backend-generated adaptive roadmap:** `/api/generate-roadmap` uses Groq on the backend when `GROQ_API_KEY` is configured. Topic selection, sequence, examples, duration and a final practical outcome are generated for the learner. If the AI provider is not configured or temporarily fails, an adaptive backend-built starter path keeps the app usable and clearly labels the fallback; it does not silently use a fixed client-side path.
- **Role- and language-aware YouTube resources:** each lesson search uses the lesson title, skills and selected career role. With `YOUTUBE_API_KEY`, candidate videos are ranked against the lesson and role, checked against YouTube video-language metadata or the selected writing system, and retried in English when no relevant match is available. Without the key, PathPilot opens a role- and topic-specific YouTube search page; YouTube may still show other languages or unrelated results.
- **Dynamic MCQ assessment:** every topic requests a fresh five-question assessment from the backend. Groq generates new wording/scenarios for each attempt when configured; fallback quizzes vary scenarios and answer ordering. Previously seen questions are sent to the generator to reduce repeats.
- **Fullscreen timed assessments:** the learner must explicitly start an assessment in browser fullscreen. The backend holds correct answers and grades submissions, so answers/explanations are not sent to the client until submit. Topic difficulty and the individual questions determine the timer. Leaving fullscreen, switching away from the page, or losing page visibility stops the assessment; that attempt is abandoned without a score, and the learner must request a fresh set. Copy/context-menu keyboard shortcuts are restricted during the active attempt. This discourages casual copying but is not a substitute for a fully proctored exam system.
- **Server-side quiz lifecycle:** `/api/start-quiz`, `/api/submit-quiz` and `/api/abandon-quiz` record assessment lifecycle on the Express process and enforce the timer at submission.
- **Dark/light toggle**, saved in browser storage.
- **Full Free course access:** every topic, resource, MCQ and retry remains available in Free. Pro is for optional add-ons such as roadmap refinement, multiple saved paths, export and advanced insights.

## Required software

- Node.js 20 or newer
- npm (included with Node.js)
- Internet access for dependency installation, AI generation and online learning resources

## Run on Windows

1. Extract the project ZIP.
2. Open the extracted `pathpilot-platform` folder in VS Code.
3. Copy `.env.example` to a new file named `.env` in the project root.
4. Add your API keys as described below. Save `.env`. Keep the real file private; it is ignored by Git.
5. In the VS Code terminal, run:

```powershell
npm.cmd install
npm.cmd run dev:all
```

Or double-click `start-windows.bat` in File Explorer. It installs npm dependencies if needed and starts the Vite frontend and Express API.

Open <http://localhost:5173>. Keep the terminal open during use. The frontend uses port `5173`; the backend API uses port `8787`.

Check API status at <http://localhost:8787/api/health>. It reports whether AI, YouTube lookup and payments are configured without exposing keys, plus the number of Groq keys loaded. `youtubeApiStatus` starts as `not-checked` and changes after a roadmap video lookup; `youtubeApiErrorCode` helps identify invalid restrictions or quota issues.

### Fixing a CORS error (“Origin is not allowed by PathPilot API CORS settings”)

The API now accepts normal local development origins automatically, including `localhost`, `127.0.0.1`, and private LAN addresses while not running in production. If you changed the API configuration, stop and restart `npm.cmd run dev:all` after saving `.env`.

If the frontend is deployed separately (for example, on Vercel) from the backend API, open the backend service's environment settings and set `FRONTEND_URL` to the exact frontend origin, with no path. For example:

```dotenv
FRONTEND_URL=https://your-pathpilot-project.vercel.app
```

For more than one origin (such as a custom domain and a preview domain), use a comma-separated list:

```dotenv
FRONTEND_URL=https://your-pathpilot-project.vercel.app,https://learn.example.com
```

Save the environment setting and redeploy/restart the backend. Do not set `FRONTEND_URL` to the backend URL; it must be the URL shown in the browser's address bar for the frontend. The deployed frontend's `VITE_API_BASE_URL` should separately point to the backend API base origin, such as `https://your-pathpilot-api.example.com` (do not add `/api`).

## API keys

### Groq — roadmap and assignment generation

1. Open the [Groq Console API keys page](https://console.groq.com/keys).
2. Create an API key and keep it private.
3. In the backend `.env`, configure one or more keys:

```dotenv
GROQ_API_KEY=your_first_groq_key
GROQ_API_KEY_2=your_second_groq_key
GROQ_API_KEY_3=your_third_groq_key
GROQ_API_KEY_4=your_fourth_groq_key
GROQ_API_KEY_5=your_fifth_groq_key
GROQ_API_KEY_6=your_sixth_groq_key
GROQ_MODEL=openai/gpt-oss-120b
GROQ_TIMEOUT_MS=60000
```

Leave unused numbered variables blank. Alternatively, put keys in `GROQ_API_KEYS` separated by commas or newlines. You may use the numbered format or the list format; duplicates are removed. The backend round-robins requests and tries remaining configured keys when a request fails, while preserving the existing `/api/generate-roadmap` and `/api/generate-quiz` request/response contracts. Keys never reach the React frontend. Restart `npm.cmd run dev:all` after changing `.env`.

The default model is `openai/gpt-oss-120b`, which Groq currently documents as supporting JSON output. You can change `GROQ_MODEL` to another model ID listed in your Groq console if needed. See the [Groq Chat Completions API](https://console.groq.com/docs/api-reference) and [Structured Outputs guide](https://console.groq.com/docs/structured-outputs).

**Speed and quota note:** Groq can offer fast inference, but real latency depends on model, output size, workload and limits. Multiple API keys do not inherently make a single request faster and may not provide more quota, especially when associated with the same organization/project. Use key fallback for availability and key-management needs, not to evade provider limits.

If no Groq key is configured or Groq temporarily fails, PathPilot keeps working using its labelled adaptive fallback roadmap and varied fallback quiz logic.

### YouTube Data API — recommended for individual language-biased videos

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create/select a project and enable **YouTube Data API v3**.
3. Create an API key and restrict it to YouTube Data API v3 and any server restrictions supported by your deployment.
4. Add it to `.env`:

```dotenv
YOUTUBE_API_KEY=your_youtube_api_key_here
```

The API search combines each lesson topic, skills and selected role with `relevanceLanguage` and `regionCode=IN`. PathPilot checks candidate relevance and available language metadata; if no relevant video in the requested language is found, it searches English. YouTube does not guarantee language metadata for every upload, so some videos may still need review. Without the key, PathPilot opens a role- and topic-specific search page rather than selecting a specific video. Official reference: <https://developers.google.com/youtube/v3/docs/search/list>.

### Razorpay (optional)

Live payment settings are not required to use courses or assessments. Before using paid subscriptions, configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_PLAN_ID`, then complete webhook and account configuration. Pro preview mode is local demo state, not a payment.

## Assessment design and timing

- The backend calculates the assessment timer from topic difficulty and each question's difficulty (easier questions receive less time; advanced questions receive more time).
- The browser starts the server timer only after fullscreen entry succeeds.
- Correct indices and explanations remain in server memory until the learner submits.
- Exiting fullscreen or hiding the page during an active attempt abandons the quiz. No result is recorded and a new question set is required.
- The current quiz store is in-memory for this demo. For a multi-instance/public deployment, replace it with Redis or a persistent database so assessment state survives restarts and is shared across instances. Add authentication, quotas/rate limits and abuse monitoring before a public launch.

## Helpful commands

```powershell
npm.cmd run dev       # frontend only
npm.cmd run server    # backend only
npm.cmd run dev:all   # frontend + backend
npm.cmd run build     # production frontend build
npm.cmd run validate  # seed curriculum and endpoint scaffolding checks
```

## Main project structure

```text
pathpilot-platform/
├── src/
│   ├── App.jsx
│   ├── styles.css
│   ├── data/roadmaps.json       # goal choices and non-AI fallback metadata
│   └── utils/storage.js         # local learner profile and progress
├── server/
│   ├── index.js                 # API, quiz session, server-side grading, payment scaffold
│   └── ai.js                    # Groq roadmap/quiz generation and language-aware video lookup
├── scripts/validate_project.py
├── .env.example
├── package.json
└── start-windows.bat
```

## Production notes

This is a working MVP foundation, not a full production exam/proctoring or subscription backend. Browser fullscreen checks and client-side copy restrictions can be bypassed by a determined user. Real deployment should include login, persistent shared storage, server-side course entitlements, rate limiting, privacy notices, secure payment webhooks and monitoring. Never add secret keys to a `VITE_*` variable or commit `.env`.
