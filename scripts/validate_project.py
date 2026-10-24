"""Integrity checks for PathPilot's seed curriculum and AI-generation scaffold."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
roadmaps = json.loads((ROOT / 'src/data/roadmaps.json').read_text(encoding='utf-8'))
errors = []
lesson_count = 0
for path in roadmaps:
    if not path.get('id') or not path.get('title'):
        errors.append('Roadmap missing an id or title')
    lessons = path.get('lessons', [])
    if len(lessons) != 8:
        errors.append(f"{path.get('id')}: expected 8 seed lessons, found {len(lessons)}")
    for lesson in lessons:
        lesson_count += 1
        for field in ['id', 'title', 'description', 'duration', 'youtubeUrl', 'videoTitle', 'skills', 'practice']:
            if not lesson.get(field):
                errors.append(f"{path.get('id')}/{lesson.get('id')}: missing {field}")
        if not lesson.get('youtubeUrl', '').startswith('https://www.youtube.com/'):
            errors.append(f"{path['id']}/{lesson['id']}: unexpected video URL")

server = (ROOT / 'server/ai.js').read_text(encoding='utf-8')
app = (ROOT / 'src/App.jsx').read_text(encoding='utf-8')
if "createPersonalizedRoadmap" not in server or "generate-roadmap" not in (ROOT / 'server/index.js').read_text(encoding='utf-8'):
    errors.append('AI roadmap-generation endpoint is missing')
if "createTopicQuiz" not in server or "generate-quiz" not in (ROOT / 'server/index.js').read_text(encoding='utf-8'):
    errors.append('Dynamic quiz-generation endpoint is missing')
if 'quizHistory' not in app or 'Generate a different assignment' not in app:
    errors.append('Quiz retry history and fresh-assignment flow are missing')
api = (ROOT / 'server/index.js').read_text(encoding='utf-8')
styles = (ROOT / 'src/styles.css').read_text(encoding='utf-8')
for route in ['/api/start-quiz', '/api/submit-quiz', '/api/abandon-quiz']:
    if route not in api:
        errors.append(f'Missing assessment lifecycle endpoint: {route}')
if 'requestFullscreen' not in app or 'fullscreenchange' not in app or 'visibilitychange' not in app:
    errors.append('Fullscreen exit/focus-loss handling is missing')
if 'onQuizAbandon' not in app or 'timedOut' not in api:
    errors.append('Abandoned/timed-out assessment handling is missing')
if 'correctIndex: question.correctIndex' in api.split('function publicQuiz', 1)[1].split('function quizFeedback', 1)[0]:
    errors.append('Correct answers appear in the public quiz-generation response')
if 'relevanceLanguage' not in server or 'YouTube API returned' not in server:
    errors.append('Language-aware YouTube lookup is missing')
if 'onboarding-optional-details' not in app:
    errors.append('The short onboarding flow and optional personalisation section are missing')
if 'groupRoadmapLessons(path.lessons)' not in app or 'path.lessons.slice(pi * 2, pi * 2 + 2)' in app:
    errors.append('Roadmap rendering must include every generated topic, not only the first eight')
if "'openai/gpt-oss-120b'" not in server or 'openai/gpt-oss-120b' not in (ROOT / '.env.example').read_text(encoding='utf-8'):
    errors.append('The current Groq default model is not configured consistently')
if 'data-theme="dark"' not in styles:
    errors.append('Dark theme stylesheet is missing')
if any((ROOT / 'public/resources').glob('*.pdf')):
    errors.append('Legacy bundled PDFs remain; topic resources should link to online resources instead')

if errors:
    print('PathPilot validation failed:')
    for error in errors:
        print(f' - {error}')
    sys.exit(1)
print(f'PathPilot validation passed: {len(roadmaps)} seed templates, {lesson_count} seed lessons, AI roadmap generation, dynamic MCQ assignments, retry-history scaffold, online resource links and theme controls.')
