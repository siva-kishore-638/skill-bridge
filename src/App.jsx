import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BarChart3, BadgeCheck, BookOpen, BrainCircuit, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, Cloud, Code2, Compass, CreditCard, Download, ExternalLink, FileText, Flame, GraduationCap, Layers3, LayoutDashboard, LibraryBig, LockKeyhole, Menu, Megaphone, Moon, PanelsTopLeft, Play, Rocket, Search, ShieldAlert, ShieldCheck, Sparkles, Sun, Target, UserRound, Video, X, Zap, ClipboardList, RefreshCw, Trophy } from 'lucide-react';
import roadmaps from './data/roadmaps.json';
import { readProfile, writeProfile, readProgress, writeProgress, readPlan, writePlan, clearPathPilotData, readSavedPaths, writeSavedPaths } from './utils/storage.js';

const ICONS = { Code2, Layers3, BarChart3, BrainCircuit, ShieldCheck, PanelsTopLeft, Target, Megaphone, Cloud, Compass };
const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'roadmap', label: 'My roadmap', icon: Compass },
  { id: 'resources', label: 'Resources', icon: LibraryBig },
  { id: 'pricing', label: 'Plans & pricing', icon: CreditCard },
  { id: 'profile', label: 'My profile', icon: UserRound },
];
const PHASES = [
  { title: 'Build your foundations', subtitle: 'Understand the essentials', number: '01' },
  { title: 'Develop core skills', subtitle: 'Learn the tools you will use', number: '02' },
  { title: 'Build and apply', subtitle: 'Practise through real tasks', number: '03' },
  { title: 'Show what you can do', subtitle: 'Turn skills into proof', number: '04' },
];
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const RESOURCE_LANGUAGES = ['Telugu', 'Hindi', 'English'];
const INITIAL_PROFILE = { name: '', email: '', education: 'Learner', language: 'English', customLanguage: '', goalId: 'frontend-developer', customGoal: '', experience: 'Beginner', hoursPerWeek: '5', timelineMonths: '4', interests: '', motivation: '', dreamProject: '', currentSkills: '', learningStyle: 'A balanced mix', preferredIndustry: '' };
const freeFeatures = ['One AI-personalised career roadmap', 'Full access to every course topic', 'YouTube video and online reading for each topic', 'Dynamic MCQ assignments for every topic', 'Unlimited fresh assignment retries', 'Lesson completion and weekly progress tracking'];
const proFeatures = ['Everything in Free, with course access kept open', 'Regenerate and refine your AI roadmap', 'Save multiple career pathways', 'Downloadable learning plan export', 'Advanced quiz history and skill-gap insights', 'Portfolio planning and focused career insights'];

function dayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function lessonKey(pathId, lessonId) { return `${pathId}:${lessonId}`; }
function durationHours(value) { const n = Number.parseFloat(String(value).replace(/[^0-9.]/g, '')); return Number.isFinite(n) ? n : 1; }
function wordSlug(value = '') { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function resolveRoadmap(profile) {
  if (profile?.generatedRoadmap?.lessons?.length) return profile.generatedRoadmap;
  if (!profile) return roadmaps[0];
  if (profile.goalId && profile.goalId !== 'custom') return roadmaps.find(p => p.id === profile.goalId && p.id !== 'career-explorer') || roadmaps[0];
  const goal = wordSlug(profile.customGoal || '');
  const map = [
    [['frontend','front end','website','web developer','react','html','css'],'frontend-developer'],
    [['full stack','fullstack','backend','back end','software engineer','software developer','web app'],'full-stack-developer'],
    [['data analyst','data analysis','business analyst','excel','sql','business intelligence'],'data-analyst'],
    [['ai','machine learning','ml engineer','data science','artificial intelligence','llm','rag'],'ai-ml-engineer'],
    [['cyber','security analyst','ethical hacking','soc analyst','infosec'],'cybersecurity-analyst'],
    [['ux','ui','designer','figma','product design'],'ui-ux-designer'],
    [['product manager','product management','product owner'],'product-manager'],
    [['digital marketing','seo','social media','marketing','content creator'],'digital-marketer'],
    [['cloud','devops','aws engineer','infrastructure'],'cloud-engineer'],
  ];
  for (const [words, id] of map) if (words.some(word => word.length <= 2 ? goal.split(' ').includes(word) : goal.includes(word))) return roadmaps.find(p => p.id === id) || roadmaps[0];
  return roadmaps.find(p => p.id === 'career-explorer') || roadmaps[0];
}
function goalLabel(profile, path) { return profile?.goalId === 'custom' && profile.customGoal?.trim() ? profile.customGoal.trim() : path.title; }
function completedCount(path, progress) { return path.lessons.filter(lesson => (progress.completed || []).includes(lessonKey(path.id, lesson.id))).length; }
function streakCount(activeDates = []) {
  const days = new Set(activeDates); const cursor = new Date(); let count = 0;
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); }
  return count;
}
function weeklyMinutes(progress) {
  if (!Array.isArray(progress.sessions)) return progress.weeklyMinutes || 0;
  const now = new Date(); const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 6); cutoff.setHours(0,0,0,0);
  return progress.sessions.filter(s => new Date(`${s.date}T00:00:00`) >= cutoff).reduce((total, s) => total + (s.minutes || 0), 0);
}
function groupRoadmapLessons(lessons = []) {
  const groups = PHASES.map((phase, index) => ({ ...phase, key: `phase-${index + 1}`, items: [] }));
  (lessons || []).forEach((lesson, index) => {
    const phase = String(lesson.phase || '').toLowerCase();
    let groupIndex = -1;
    if (/foundation|prerequisite|baseline/.test(phase)) groupIndex = 0;
    else if (/core|skill|concept/.test(phase)) groupIndex = 1;
    else if (/applied|practice|build|project/.test(phase)) groupIndex = 2;
    else if (/portfolio|next step|career outcome|capstone/.test(phase)) groupIndex = 3;
    if (groupIndex < 0) groupIndex = Math.min(groups.length - 1, Math.floor(index * groups.length / Math.max(1, lessons.length)));
    groups[groupIndex].items.push({ lesson, index });
  });
  return groups.filter(group => group.items.length > 0);
}

function IconBadge({ icon: Icon = Sparkles, tone = 'violet', size = 42 }) { return <span className={`icon-badge ${tone}`} style={{ width: size, height: size }}><Icon size={Math.round(size * .47)} strokeWidth={1.8}/></span>; }
function Logo() { return <div className="brand"><span className="brand-mark"><Sparkles size={20} strokeWidth={2.3}/></span><span>Skill <span className="brand-accent">Bridge</span><small>LEARN WITH DIRECTION</small></span></div>; }
function Ring({ value = 0, size = 62 }) { return <div className="progress-ring" style={{ '--progress': `${Math.max(0, Math.min(100, value))}%`, width: size, height: size }}><div className="progress-ring-inner"><strong>{value}%</strong></div></div>; }
function Pill({ children, kind = 'neutral' }) { return <span className={`pill ${kind}`}>{children}</span>; }
function Toast({ message, onClose }) {
  useEffect(() => { if (!message) return; const timer = setTimeout(onClose, 3200); return () => clearTimeout(timer); }, [message, onClose]);
  if (!message) return null;
  return <div className="toast" role="status"><CheckCircle2 size={18}/>{message}<button aria-label="Dismiss notification" onClick={onClose}><X size={15}/></button></div>;
}
function Onboarding({ onFinish, theme, onToggleTheme }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_PROFILE);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const update = (field, value) => setForm(old => ({ ...old, [field]: value }));
  const paths = roadmaps.filter(p => p.id !== 'career-explorer');
  const chosen = paths.find(p => p.id === form.goalId);
  const next = e => {
    e.preventDefault();
    setError('');
    setStep(2);
  };
  const submit = async e => {
    e.preventDefault();
    if (form.goalId === 'custom' && !form.customGoal.trim()) return setError('Enter the role or outcome you want to work towards.');
    setError('');
    setGenerating(true);
    const readyProfile = {
      ...form,
      name: form.name.trim() || 'Learner',
      email: form.email.trim(),
      education: form.education || 'Learner',
      language: form.language,
      customLanguage: '',
      interests: form.interests.trim(),
      currentSkills: form.currentSkills.trim(),
      motivation: form.motivation.trim(),
      dreamProject: form.dreamProject.trim(),
      learningStyle: form.learningStyle || 'A balanced mix',
    };
    try { await onFinish(readyProfile); }
    catch (err) { setError(err?.message || 'We could not create the roadmap. Check the backend and try again.'); }
    finally { setGenerating(false); }
  };
  return <main className="onboarding-shell">
    <div className="onboarding-top"><Logo/><div className="onboarding-top-actions"><span className="secure-note"><CheckCircle2 size={15}/> Your learning plan, made personal</span><button className="theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}<span>{theme === 'dark' ? 'Light' : 'Dark'} mode</span></button></div></div>
    <div className="onboarding-layout"><section className="onboarding-main"><div className="eyebrow"><Sparkles size={15}/> YOUR NEXT CHAPTER STARTS HERE</div>
      {step === 1 ? <><h1>Learn with a plan.<br/><span>Grow with purpose.</span></h1><p className="onboarding-lede">Share the essentials. We’ll use your goal, starting level, interests and available time to build a path that fits you.</p><Wizard step={1}/><form className="onboarding-form" onSubmit={next}>
        <label>Your name <span className="optional-label">Optional</span><input autoFocus value={form.name} onChange={e => update('name', e.target.value)} placeholder="What should we call you?" autoComplete="name" maxLength={60}/></label>
        <label>Learning resource language<select value={form.language} onChange={e => update('language', e.target.value)}><option>Telugu</option><option>Hindi</option><option>English</option></select></label>
        {error && <p className="form-error">{error}</p>}<button className="button primary full" type="submit">Choose my career goal <ArrowRight size={18}/></button><p className="privacy-note"><ShieldCheck size={14}/> You can change your preferences later.</p>
      </form></> : <><h1>What do you want<br/><span>to become?</span></h1><p className="onboarding-lede">Just a few practical details. Optional interests help the AI choose better projects and examples; you don’t need to answer a long questionnaire.</p><Wizard step={2}/><form className="onboarding-form step-two" onSubmit={submit}>
        <label>Career goal<select value={form.goalId} onChange={e => { update('goalId', e.target.value); setError(''); }}>{paths.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}<option value="custom">Something else — I'll type it</option></select></label>
        {form.goalId === 'custom' && <label>Role or outcome<input required value={form.customGoal} onChange={e => update('customGoal', e.target.value)} placeholder="e.g. Game developer, robotics engineer" maxLength={120}/></label>}
        <div className="form-row"><label>Starting level<select value={form.experience} onChange={e => update('experience', e.target.value)}><option>Beginner</option><option>Some experience</option><option>Intermediate</option></select></label><label>Time available each week<select value={form.hoursPerWeek} onChange={e => update('hoursPerWeek', e.target.value)}><option value="3">3 hours</option><option value="5">5 hours</option><option value="7">7 hours</option><option value="10">10 hours</option><option value="14">14+ hours</option></select></label></div>
        <details className="onboarding-optional-details"><summary>Personalise your roadmap (optional)</summary><div className="optional-details-grid">
          <label>Interests<input value={form.interests} onChange={e => update('interests', e.target.value)} placeholder="e.g. sports analytics, healthcare, design" maxLength={240}/></label>
          <label>Skills you already know<input value={form.currentSkills} onChange={e => update('currentSkills', e.target.value)} placeholder="e.g. Python basics, SQL, or starting from zero" maxLength={240}/></label>
          <label>Target timeline<select value={form.timelineMonths} onChange={e => update('timelineMonths', e.target.value)}><option value="3">3 months</option><option value="4">4 months</option><option value="6">6 months</option><option value="9">9 months</option><option value="12">12 months</option></select></label>
          <label>Learning style<select value={form.learningStyle} onChange={e => update('learningStyle', e.target.value)}><option>A balanced mix</option><option>Hands-on projects</option><option>Videos first</option><option>Reading and notes</option><option>Practice questions</option></select></label>
        </div></details>
        {chosen && <div className="selected-path-preview"><IconBadge icon={ICONS[chosen.icon] || Compass} tone={chosen.color} size={44}/><div><strong>{chosen.title}</strong><span>The AI will create the topic sequence from your level, language, interests and time—not simply unlock a preset course.</span></div><CheckCircle2 size={19} className="preview-check"/></div>}
        {error && <p className="form-error">{error}</p>}
        <div className="wizard-actions"><button className="button secondary" type="button" disabled={generating} onClick={() => { setStep(1); setError(''); }}><ArrowRight className="back-arrow" size={17}/> Back</button><button className="button primary" type="submit" disabled={generating}>{generating ? <><RefreshCw className="spin" size={17}/> Creating your path…</> : <>Build my learning roadmap <Sparkles size={17}/></>}</button></div>
        {generating && <div className="generating-note"><span className="loading-dot"/> Asking the backend to sequence topics around your answers and match YouTube resources to {form.language}.</div>}
      </form></>}
      <div className="onboarding-footer">Fewer questions. A more relevant path. A clear next step.</div>
    </section><OnboardingPreview selected={chosen}/></div>
  </main>;
}
function Wizard({ step }) { return <div className="wizard-progress"><span className={`wizard-step ${step === 1 ? 'active' : 'done'}`}>{step === 1 ? '01' : <Check size={13}/>} <small>Your profile</small></span><span className={`wizard-track ${step === 2 ? 'complete' : ''}`}><i/></span><span className={`wizard-step ${step === 2 ? 'active' : ''}`}>02 <small>Your direction</small></span></div>; }
function OnboardingPreview({ selected }) { return <aside className="onboarding-visual"><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-caption"><span className="visual-caption-dot"/> YOUR PATH, AT A GLANCE</div><div className="roadmap-preview-card"><div className="preview-card-top"><div><span className="mini-label">PERSONALISED ROADMAP</span><h3>{selected?.shortTitle || 'Your next goal'}</h3></div><Ring value={0} size={58}/></div><p>{selected?.tagline || 'A structured plan for the career you want.'}</p>{['Foundations|Learn the essentials','Core skills|Get hands-on practice','Build a project|Put learning to work','Launch your portfolio|Show your progress'].map((item,i) => {const [a,b]=item.split('|');return <div className={`preview-roadmap-line ${i===3?'last':''}`} key={a}><span className={`line-dot ${i===0?'complete-dot':''}`}>{i===0&&<Check size={13}/>}</span><div><strong>{a}</strong><small>{b}</small></div>{i===0?<Pill kind="success">Start here</Pill>:<span className="preview-mini-lock"><ChevronRight size={14}/></span>}</div>;})}<div className="preview-card-bottom"><span><Video size={15}/> YouTube video</span><span><ExternalLink size={15}/> Online reading</span></div></div><div className="floating-note note-top"><span className="float-icon mint"><Check size={15}/></span><div><strong>Clear next steps</strong><small>Know what to learn next</small></div></div><div className="floating-note note-bottom"><span className="float-icon violet"><Target size={16}/></span><div><strong>Built around your goal</strong><small>Not a one-size-fits-all course</small></div></div><div className="visual-bottom-note"><span>✳</span> Small steps. Real momentum.</div></aside>; }
function Sidebar({ active, setActive, profile, plan, mobileOpen, setMobileOpen }) { return <>{mobileOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)}/>}<aside className={`sidebar ${mobileOpen?'mobile-open':''}`}><div className="sidebar-brand"><Logo/><button className="mobile-close" aria-label="Close menu" onClick={() => setMobileOpen(false)}><X size={19}/></button></div><div className="sidebar-section-label">WORKSPACE</div><nav className="side-nav" aria-label="Main navigation">{NAV.map(({id,label,icon:Icon})=><button key={id} className={`side-nav-item ${active===id?'active':''}`} onClick={()=>{setActive(id);setMobileOpen(false);}}><Icon size={18} strokeWidth={1.8}/><span>{label}</span>{id==='pricing'&&plan.tier==='free'&&<span className="nav-dot"/>}</button>)}</nav><div className="sidebar-grow"/><div className={`sidebar-plan ${plan.tier==='pro'?'pro':''}`}><div className="plan-spark"><Sparkles size={17}/></div><strong>{plan.tier==='pro'?'You’re on Pro':'Make room to grow'}</strong><p>{plan.tier==='pro'?'Your course and Pro insights are ready.':'All course topics are open. Pro adds planning and insights.'}</p><button onClick={()=>{setActive('pricing');setMobileOpen(false);}}>{plan.tier==='pro'?'View plan':'Explore Pro'} <ArrowUpRight size={14}/></button></div><div className="sidebar-user"><span className="avatar">{(profile.name||'L').slice(0,1).toUpperCase()}</span><div className="user-copy"><strong>{profile.name||'Learner'}</strong><span>{profile.education||'Learning profile'}</span></div><button title="Open profile" aria-label="Open profile" onClick={()=>{setActive('profile');setMobileOpen(false);}}><ChevronDown size={16}/></button></div></aside></>; }
function HeaderBar({ active, profile, onMenu, plan, theme, onToggleTheme }) {
  const title = { overview: 'Overview', roadmap: 'Your learning roadmap', resources: 'Resource library', pricing: 'Plans & pricing', profile: 'Your profile' };
  const subtitle = { overview: 'A little progress today goes a long way.', roadmap: 'Your next step is always clear.', resources: 'Good resources, organised around your goal.', pricing: 'Choose the pace and support that fits you.', profile: 'Keep your learning plan aligned with you.' };
  return <header className="topbar"><button className="mobile-menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={21}/></button><div className="topbar-title"><div className="crumb">YOUR WORKSPACE <ChevronRight size={12}/> <span>{title[active]}</span></div><p>{subtitle[active]}</p></div><div className="topbar-actions"><span className="topbar-date"><CalendarDays size={15}/>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span><button className="theme-toggle topbar-theme" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}<span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button><button className={`plan-chip ${plan.tier === 'pro' ? 'pro' : ''}`} onClick={() => window.dispatchEvent(new CustomEvent('pathpilot:open-pricing'))}>{plan.tier === 'pro' ? <><BadgeCheck size={15}/> PRO</> : <><Sparkles size={15}/> FREE PLAN</>}</button><button className="top-avatar" title={`${profile.name}'s profile`} onClick={() => window.dispatchEvent(new CustomEvent('pathpilot:open-profile'))}>{(profile.name || 'L').slice(0, 1).toUpperCase()}</button></div></header>;
}
function Overview({ profile, path, progress, plan, openLesson, setTab, onUpgrade }) {
  const count = completedCount(path, progress);
  const pct = Math.round(count / Math.max(1, path.lessons.length) * 100);
  const nextIndex = path.lessons.findIndex(l => !(progress.completed || []).includes(lessonKey(path.id, l.id)));
  const next = path.lessons[nextIndex];
  const hours = Math.max(1, Number(profile.hoursPerWeek) || 5);
  const mins = weeklyMinutes(progress);
  const weekPct = Math.min(100, Math.round(mins / (hours * 60) * 100));
  const streak = streakCount(progress.activeDates || []);
  const quizResults = Object.values(progress.assessmentResults || {}).flat();
  const average = quizResults.length ? Math.round(quizResults.reduce((sum, item) => sum + (item.score || 0) / Math.max(1, item.total || 5) * 100, 0) / quizResults.length) : 0;
  const passRate = quizResults.length ? Math.round(quizResults.filter(item => item.passed).length / quizResults.length * 100) : 0;
  return <div className="page-content overview-page">
    <section className="welcome-row"><div><span className="eyebrow subtle"><Sparkles size={14}/> YOUR PERSONAL LEARNING SPACE</span><h1>Hey {profile.name.split(' ')[0] || 'there'}, <span>let’s make progress.</span></h1><p>Your path to <strong>{goalLabel(profile, path)}</strong> is tailored to your interests and pace.</p></div><div className="welcome-date"><span>YOUR COMMITMENT</span><strong>{profile.hoursPerWeek} <small>hrs / week</small></strong><div><span className="commitment-dot"/>{profile.timelineMonths}-month target</div></div></section>
    <section className="hero-roadmap-card"><div className="hero-roadmap-art"><div className="art-circle circle-a"/><div className="art-circle circle-b"/><div className="art-path path-1"/><div className="art-path path-2"/><span className="art-star star-1">✳</span><span className="art-star star-2">✦</span><div className="art-course-bubble bubble-a"><Code2 size={17}/></div><div className="art-course-bubble bubble-b"><BookOpen size={18}/></div><div className="art-course-bubble bubble-c"><Rocket size={18}/></div><div className="art-tiny-label">SKILL<br/>BY SKILL</div></div><div className="hero-roadmap-content"><div className="hero-tags"><Pill kind="lavender">PERSONALISED ROADMAP</Pill><Pill>{path.duration}</Pill>{profile.roadmapMode === 'ai' && <Pill kind="success">AI generated</Pill>}</div><h2>{path.title}<br/><span>starts with one step.</span></h2><p>{path.description}</p><div className="hero-progress-row"><Ring value={pct} size={64}/><div><strong>{count} of {path.lessons.length} topics completed</strong><span>{pct === 100 ? 'Amazing work — you completed this path!' : `Keep going. ${path.lessons.length - count} topic${path.lessons.length - count === 1 ? '' : 's'} to explore.`}</span><div className="mini-progress"><span style={{ width: `${pct}%` }}/></div></div></div><button className="button primary" onClick={() => next ? openLesson(next) : setTab('roadmap')}>{count === path.lessons.length ? 'Review your roadmap' : count ? 'Continue learning' : 'Start my roadmap'} <ArrowRight size={17}/></button>{profile.goalId === 'custom' && <div className="hero-footnote"><CircleHelp size={14}/> Your custom goal shapes the examples and project tasks in this path.</div>}</div></section>
    <div className="stats-grid"><div className="stat-card"><div className="stat-top"><span>Learning streak</span><IconBadge icon={Flame} tone="peach" size={36}/></div><div className="stat-number">{streak}<small> day{streak === 1 ? '' : 's'}</small></div><p>{streak ? 'You showed up for your goal.' : 'Complete a lesson to start your streak.'}</p></div><div className="stat-card"><div className="stat-top"><span>Focus this week</span><IconBadge icon={Clock3} tone="blue" size={36}/></div><div className="stat-number">{Math.floor(mins / 60)}<small>h {mins % 60}m</small></div><div className="stat-progress"><span style={{ width: `${weekPct}%` }}/></div><p>{Math.max(0, hours * 60 - mins) > 0 ? `${Math.ceil(Math.max(0, hours * 60 - mins) / 60)} more hour(s) to your weekly goal.` : 'Weekly goal achieved — excellent!'}</p></div><div className="stat-card"><div className="stat-top"><span>Topics completed</span><IconBadge icon={CheckCircle2} tone="mint" size={36}/></div><div className="stat-number">{count}<small> / {path.lessons.length}</small></div><p>Every course topic is available on Free.</p><div className="stat-progress mint-bar"><span style={{ width: `${pct}%` }}/></div></div></div>
    <div className="content-grid"><section className="section-card roadmap-snippet"><div className="section-heading"><div><span className="section-kicker">YOUR NEXT MILESTONES</span><h3>Roadmap at a glance</h3></div><button className="text-button" onClick={() => setTab('roadmap')}>View full path <ArrowRight size={15}/></button></div><div className="milestone-list">{PHASES.map((phase, i) => { const lessons = path.lessons.slice(i * 2, i * 2 + 2); const done = lessons.filter(l => (progress.completed || []).includes(lessonKey(path.id, l.id))).length; return <div className={`milestone-row ${done === lessons.length ? 'complete' : ''}`} key={phase.number}><div className="milestone-num">{done === lessons.length ? <Check size={15}/> : phase.number}</div><div className="milestone-copy"><strong>{phase.title}</strong><span>{phase.subtitle}</span></div><div className="milestone-meta"><span>{done}/{lessons.length}</span><ChevronRight size={16}/></div></div>; })}</div></section><section className="section-card next-session-card"><div className="section-heading"><div><span className="section-kicker">PICK UP WHERE YOU LEFT OFF</span><h3>Next up for you</h3></div><span className="next-session-icon"><Play size={16} fill="currentColor"/></span></div>{next ? <><div className="next-topic-tag"><span className="topic-dot"/> {next.duration} · Topic {path.lessons.indexOf(next) + 1}</div><h4>{next.title}</h4><p>{next.description}</p><div className="resource-mini-row"><span><Video size={14}/> Video lesson</span><span><ExternalLink size={14}/> Online reading</span><span><ClipboardList size={14}/> MCQ assignment</span></div><button className="button dark full" onClick={() => openLesson(next)}>Open lesson <ArrowRight size={17}/></button><p className="tiny-muted">Every lesson includes a fresh MCQ assignment and unlimited retries.</p></> : <div className="empty-state"><CheckCircle2 size={30}/><strong>All caught up!</strong><p>You’ve completed every lesson.</p><button className="text-button" onClick={() => setTab('roadmap')}>Review your path <ArrowRight size={15}/></button></div>}</section></div>
    <section className={`insights-panel ${plan.tier !== 'pro' ? 'insights-locked' : ''}`}><div className="insights-icon">{plan.tier === 'pro' ? <Trophy size={20}/> : <LockKeyhole size={20}/>}</div><div className="insights-copy"><span className="section-kicker">LEARNING INTELLIGENCE · PRO</span><h3>{plan.tier === 'pro' ? 'Your assignment insights' : 'Turn practice results into a smarter study plan'}</h3><p>{plan.tier === 'pro' ? `Across ${quizResults.length} assignment attempt(s), your average score is ${average}% and pass rate is ${passRate}%. Keep revisiting lower-scoring topics to strengthen retention.` : 'Free includes all MCQ assignments and unlimited fresh retries. Pro adds assignment history, score trends and focused skill-gap insights.'}</p></div>{plan.tier === 'pro' ? <div className="insight-metrics"><div><strong>{average}%</strong><span>Average</span></div><div><strong>{passRate}%</strong><span>Pass rate</span></div></div> : <button className="button primary" onClick={onUpgrade}>Explore Pro <ArrowRight size={16}/></button>}</section>
    <section className="bottom-banner"><div className="banner-icon"><Zap size={21}/></div><div><strong>{plan.tier === 'pro' ? 'You’re set up for deeper learning.' : 'Learn the whole course for free.'}</strong><p>{plan.tier === 'pro' ? 'Your full course, multiple paths and learning insights are available.' : 'Every topic, video, online resource and assignment is open. Pro is for extra planning and analytics features.'}</p></div><button className="button outline-light" onClick={() => plan.tier === 'pro' ? setTab('roadmap') : onUpgrade()}>{plan.tier === 'pro' ? 'Explore roadmap' : 'Explore Pro features'} <ArrowUpRight size={16}/></button><div className="banner-decoration">✳</div></section>
  </div>;
}
function SavedPathsPanel({ paths, onOpen }) {
  if (!paths.length) return null;
  return <section className="saved-paths-panel"><div className="saved-paths-heading"><div><span className="section-kicker">YOUR COLLECTION</span><h3>Saved learning paths</h3></div><span className="saved-path-count">{paths.length} saved</span></div><div className="saved-paths-grid">{paths.map(item=><article className="saved-path-card" key={item.key}><IconBadge icon={ICONS[item.icon]||Compass} tone={item.color||'violet'} size={36}/><div className="saved-path-copy"><strong>{item.label}</strong><span>{item.title}</span></div><button className="button small secondary" onClick={()=>onOpen(item)}>Open <ArrowRight size={13}/></button></article>)}</div></section>;
}
function RoadmapView({ profile, path, progress, plan, openLesson, onUpgrade, savedPaths, onSavePath, onOpenSavedPath, onDownloadRoadmap, onRegenerate, generatingRoadmap }) {
  const count = completedCount(path, progress);
  const currentKey = profile.goalId === 'custom' ? `custom:${wordSlug(profile.customGoal)}` : profile.goalId;
  return <div className="page-content"><section className="page-intro-row"><div><span className="eyebrow subtle"><Compass size={14}/> YOUR LEARNING JOURNEY</span><h1>Your roadmap, <span>step by step.</span></h1><p>This pathway was shaped by your goals, interests, current skills, preferred learning style and available time. Every topic includes a video, online reading, practice and fresh MCQs.</p></div><div className="roadmap-summary-card"><Ring value={Math.round(count / Math.max(1, path.lessons.length) * 100)} size={62}/><div><strong>{count}/{path.lessons.length} completed</strong><span>All topics included on Free</span></div></div></section>
    <div className="roadmap-filter-bar"><div className="roadmap-filter-title"><IconBadge icon={ICONS[path.icon] || Compass} tone={path.color}/><div><strong>{goalLabel(profile, path)}</strong><span>{path.duration} · {profile.experience} level · {profile.learningStyle || 'Balanced learning'}</span></div></div><div className="roadmap-filter-actions"><div className="roadmap-filter-pills"><Pill kind="lavender">{path.lessons.length} topics</Pill><Pill kind="success">Full course access</Pill>{profile.roadmapMode === 'ai' && <Pill kind="success">AI generated</Pill>}</div><button className="button small secondary" onClick={onSavePath}><CheckCircle2 size={14}/>{savedPaths.some(item => item.key === currentKey) ? 'Saved' : 'Save path'}</button><button className="button small secondary" onClick={() => plan.tier === 'pro' ? onRegenerate() : onUpgrade()} disabled={generatingRoadmap}>{generatingRoadmap ? <RefreshCw className="spin" size={14}/> : plan.tier === 'pro' ? <Sparkles size={14}/> : <LockKeyhole size={14}/>} {generatingRoadmap ? 'Rebuilding…' : 'Refine with AI'}</button><button className="button small primary" onClick={onDownloadRoadmap}>{plan.tier === 'pro' ? <><Download size={14}/> Export plan</> : <><LockKeyhole size={14}/> Export · Pro</>}</button></div></div>
    {profile.interests && <section className="personalisation-strip"><div><span className="section-kicker">PERSONALISATION SIGNALS</span><strong>Interests: {profile.interests}</strong><p>{profile.motivation ? `Motivation: ${profile.motivation}. ` : ''}{profile.dreamProject ? `Capstone direction: ${profile.dreamProject}.` : 'Practice examples adapt to your goal and current skills.'}</p></div><Pill kind="lavender">{profile.roadmapMode === 'ai' ? 'Groq AI plan' : 'Personalised starter plan'}</Pill></section>}
    <SavedPathsPanel paths={savedPaths} onOpen={onOpenSavedPath}/>
    <div className="roadmap-phases">{groupRoadmapLessons(path.lessons).map(group => { const done = group.items.filter(({ lesson }) => (progress.completed || []).includes(lessonKey(path.id, lesson.id))).length; return <section className="roadmap-phase" key={group.key}><div className="phase-heading"><span className={`phase-number ${done === group.items.length ? 'done' : ''}`}>{done === group.items.length ? <Check size={16}/> : group.number}</span><div><h3>{group.title}</h3><p>{group.subtitle}</p></div><span className="phase-progress">{done} of {group.items.length}</span></div><div className="phase-lessons">{group.items.map(({ lesson, index }) => { const completed = (progress.completed || []).includes(lessonKey(path.id, lesson.id)); return <article className={`lesson-card ${completed ? 'is-complete' : ''}`} key={lesson.id}><div className={`lesson-number ${completed ? 'completed' : ''}`}>{completed ? <Check size={16}/> : String(index + 1).padStart(2, '0')}</div><div className="lesson-main"><div className="lesson-meta"><span>{lesson.duration}</span><span className="meta-dot">·</span><span>Topic {index + 1}</span>{completed && <Pill kind="success">Completed</Pill>}</div><h4>{lesson.title}</h4><p>{lesson.description}</p><div className="lesson-resources"><span><Video size={14}/> Video</span><span><ExternalLink size={14}/> Online reading</span><span><ClipboardList size={14}/> MCQ assignment</span></div></div><div className="lesson-actions"><button className={`button small ${completed ? 'secondary' : 'primary'}`} onClick={() => openLesson(lesson)}>{completed ? 'Review topic' : 'Open topic'} <ChevronRight size={15}/></button><span className="lesson-action-note">{completed ? 'Nice work' : 'Free · full access'}</span></div></article>; })}</div></section>; })}</div>
    {plan.tier === 'free' && <section className="unlock-callout"><div className="unlock-art"><LockKeyhole size={22}/></div><div><span className="section-kicker">OPTIONAL PRO FEATURES</span><h3>Your whole course is already open.</h3><p>Upgrade only for AI roadmap refinement, multiple saved paths, downloadable plan exports and detailed quiz insights.</p></div><button className="button primary" onClick={onUpgrade}>View Pro features <ArrowRight size={17}/></button></section>}
  </div>;
}
function ResourcesView({ path, progress, plan, openLesson }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const lessons = path.lessons.filter((lesson) => {
    const matches = `${lesson.title} ${lesson.description} ${(lesson.skills || []).join(' ')}`.toLowerCase().includes(query.toLowerCase());
    const done = (progress.completed || []).includes(lessonKey(path.id, lesson.id));
    return matches && (filter === 'all' || (filter === 'completed' && done) || (filter === 'not-completed' && !done));
  });
  return <div className="page-content"><section className="page-intro-row"><div><span className="eyebrow subtle"><LibraryBig size={14}/> THE RESOURCE LIBRARY</span><h1>Learn it. <span>Keep it.</span></h1><p>Every topic includes a YouTube learning link, an online reading or reference resource, a practice task and a dynamic MCQ assignment. The full library is open on Free.</p></div><div className="resource-hero-stat"><BookOpen size={23}/><div><strong>{path.lessons.length * 2} learning resources</strong><span>Plus practice and assignments</span></div></div></section>
    <div className="resource-tools"><label className="resource-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search topics, skills, or resources..."/><kbd>⌘ K</kbd></label><div className="filter-tabs" role="group" aria-label="Filter resources">{[['all','All'],['completed','Completed'],['not-completed','To learn']].map(([id,label]) => <button key={id} className={filter === id ? 'selected' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div></div>
    {lessons.length ? <div className="resource-list">{lessons.map(lesson => { const index = path.lessons.indexOf(lesson), done = (progress.completed || []).includes(lessonKey(path.id, lesson.id)); const resourceUrl = lesson.resourceUrl || `https://www.google.com/search?q=${encodeURIComponent(`${lesson.title} ${path.title} official learning resource`)}`; return <article className="resource-card" key={lesson.id}><IconBadge icon={Video} tone="blue"/><div className="resource-card-main"><div className="resource-card-top"><span>TOPIC {index + 1} · {lesson.duration}</span>{done && <Pill kind="success">Completed</Pill>}</div><h3>{lesson.title}</h3><p>{lesson.description}</p><div className="resource-card-links"><a href={lesson.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${lesson.title} beginner tutorial`)}`} target="_blank" rel="noreferrer"><Play size={14} fill="currentColor"/> YouTube video <ExternalLink size={13}/></a><a href={resourceUrl} target="_blank" rel="noreferrer"><BookOpen size={14}/> {lesson.resourceLabel || 'Online reading'} <ExternalLink size={13}/></a></div><div className="resource-assignment-note"><ClipboardList size={14}/> Dynamic MCQ assignment · unlimited retries</div></div><div className="resource-card-end"><button className="button small secondary" onClick={() => openLesson(lesson)}>Open lesson <ArrowRight size={14}/></button></div></article>; })}</div> : <div className="empty-search"><Search size={28}/><h3>No resources found</h3><p>Try another search term or switch the filter.</p><button className="button secondary" onClick={() => { setQuery(''); setFilter('all'); }}>Clear filters</button></div>}
    <div className="resources-note"><ShieldCheck size={17}/><p>Online resources open on their original websites. MCQ assignments are generated for the selected topic, and a failed attempt can be followed by a different set of questions.</p></div></div>;
}
function PricingView({ plan, onUpgrade, onFree }) {
  return <div className="page-content pricing-page"><section className="pricing-intro"><span className="eyebrow subtle"><Sparkles size={14}/> SIMPLE, FAIR PRICING</span><h1>Invest in your <span>next chapter.</span></h1><p>Learn the full course for free. Pay only if you want additional planning tools and deeper progress insights.</p><div className="pricing-assurance"><span><CheckCircle2 size={16}/> No card needed for Free</span><span><CheckCircle2 size={16}/> Every course topic open</span><span><CheckCircle2 size={16}/> Unlimited MCQ retries</span></div></section>
    <div className="pricing-grid"><article className={`pricing-card ${plan.tier === 'free' ? 'current-plan' : ''}`}><div className="pricing-card-top"><div><span className="plan-label">THE OPEN LEARNING PLAN</span><h2>Free</h2><p>Learn the skills and complete the course.</p></div>{plan.tier === 'free' && <Pill kind="lavender">Current plan</Pill>}</div><div className="price-line"><strong>₹0</strong><span>forever</span></div><button className="button secondary full" onClick={onFree} disabled={plan.tier === 'free'}>{plan.tier === 'free' ? 'Your current plan' : 'Switch to Free'}</button><div className="pricing-divider"/><div className="features-label">ALL CORE LEARNING INCLUDED</div><ul className="feature-list">{freeFeatures.map(f => <li key={f}><Check size={16}/><span>{f}</span></li>)}</ul><p className="pricing-plan-note">No course-topic lockouts. You can watch, read, practise and complete every lesson without upgrading.</p></article>
      <article className={`pricing-card pro-card ${plan.tier === 'pro' ? 'current-plan' : ''}`}><div className="pro-ribbon"><Sparkles size={13}/> EXTRA PLANNING TOOLS</div><div className="pricing-card-top"><div><span className="plan-label">THE DEEPER EXPERIENCE</span><h2>Pro <span className="pro-spark-inline"><Sparkles size={18}/></span></h2><p>For learners who want deeper planning and insight.</p></div>{plan.tier === 'pro' && <Pill kind="success">Current plan</Pill>}</div><div className="price-line"><strong>₹199</strong><span>/ month</span></div><p className="price-sub">Illustrative price for the prototype; confirm pricing before launch.</p><button className="button primary full" onClick={onUpgrade}>{plan.tier === 'pro' ? 'Manage Pro preview' : 'Unlock Pro features'} <ArrowRight size={17}/></button><div className="pricing-divider"/><div className="features-label">EVERYTHING IN FREE, PLUS</div><ul className="feature-list pro-features">{proFeatures.map(f => <li key={f}><span className="feature-check"><Check size={13}/></span><span>{f}</span></li>)}</ul><div className="pro-footnote"><ShieldCheck size={14}/> Live recurring payments require Razorpay configuration. Preview mode does not charge money.</div></article></div>
    <p className="pricing-disclaimer">The Free plan intentionally keeps the course curriculum, videos, online resources and assignments available. Pro gates optional convenience and insight features only. Pro preview is local to this browser until verified billing and account-based access are configured.</p><section className="faq-box"><div><span className="section-kicker">GOOD TO KNOW</span><h3>Questions, answered.</h3></div><div className="faq-items"><details><summary>Can I complete the entire course for free?</summary><p>Yes. Every topic, video, online reading resource, practice task and MCQ assignment is available on Free. There are no topic paywalls.</p></details><details><summary>What happens if I fail an assignment?</summary><p>You will see your score and explanations, then you can generate a fresh assignment. The next set is designed to differ from the questions you just saw.</p></details><details><summary>Does Pro guarantee a job?</summary><p>No learning platform can promise that. Pro provides optional planning and progress tools; outcomes depend on effort, portfolio, experience, and market conditions.</p></details><details><summary>Are payments live in this demo?</summary><p>Not until the site owner configures Razorpay credentials and a subscription plan on the backend. Preview mode only changes local demo access.</p></details></div></section></div>;
}
function editableProfile(profile) {
  const supported = RESOURCE_LANGUAGES.includes(profile?.language);
  return { ...profile, language: supported ? profile.language : 'English', customLanguage: '' };
}
function ProfileView({ profile, setProfile, currentPath, onToast, onReset, onSaveProfile }) {
  const [form, setForm] = useState(() => editableProfile(profile));
  useEffect(() => setForm(editableProfile(profile)), [profile]);
  const update = (field, value) => setForm(old => ({ ...old, [field]: value }));
  const choices = roadmaps.filter(p => p.id !== 'career-explorer');
  const save = e => {
    e.preventDefault();
    if (!form.name.trim()) return onToast('Please add your name before saving.');
    if (form.goalId === 'custom' && !form.customGoal.trim()) return onToast('Please enter your custom goal.');
    const cleaned = { ...form, name: form.name.trim(), email: form.email.trim(), language: form.language, customLanguage: '' };
    onSaveProfile(cleaned);
  };
  return <div className="page-content profile-page"><section className="page-intro-row"><div><span className="eyebrow subtle"><UserRound size={14}/> YOUR DETAILS</span><h1>Your plan should <span>fit your life.</span></h1><p>These answers help Skill Bridge adapt examples, practice projects and future roadmap refinements to you.</p></div><div className="profile-avatar-large">{(profile.name || 'L').slice(0, 1).toUpperCase()}</div></section><div className="profile-layout"><form className="profile-form-card" onSubmit={save}><div className="section-heading"><div><span className="section-kicker">PERSONAL INFORMATION</span><h3>Your learning profile</h3></div><span className="profile-tag"><ShieldCheck size={14}/> Saved in this browser</span></div>
    <div className="profile-form-grid"><label>Full name<input value={form.name} onChange={e => update('name', e.target.value)} maxLength={60}/></label><label>Email address <span className="optional-label">Optional</span><input type="email" value={form.email} onChange={e => update('email', e.target.value)}/></label><label>Current stage<select value={form.education} onChange={e => update('education', e.target.value)}><option>High school student</option><option>Undergraduate student</option><option>Recent graduate</option><option>Working professional</option><option>Career switcher</option><option>Exploring options</option></select></label><label>Preferred language<select value={form.language} onChange={e => update('language', e.target.value)}><option>Telugu</option><option>Hindi</option><option>English</option></select></label>
    <label className="wide-field">Career goal<select value={form.goalId} onChange={e => update('goalId', e.target.value)}>{choices.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}<option value="custom">Something else — custom goal</option></select></label>{form.goalId === 'custom' && <label className="wide-field">Describe your goal<input value={form.customGoal} onChange={e => update('customGoal', e.target.value)} placeholder="What would you like to become?" maxLength={100}/></label>}
<details className="profile-optional-details"><summary>More personalisation settings (optional)</summary><div className="profile-form-grid nested-profile-grid">    <label className="wide-field">Interests<input value={form.interests || ''} onChange={e => update('interests', e.target.value)} placeholder="Topics, industries, activities, problems you care about" maxLength={240}/></label><label className="wide-field">Motivation<input value={form.motivation || ''} onChange={e => update('motivation', e.target.value)} placeholder="What do you want this career to help you achieve?" maxLength={240}/></label><label className="wide-field">Current skills<input value={form.currentSkills || ''} onChange={e => update('currentSkills', e.target.value)} placeholder="Tools, topics or experience you already have" maxLength={240}/></label><label className="wide-field">Dream project or target outcome<input value={form.dreamProject || ''} onChange={e => update('dreamProject', e.target.value)} placeholder="What would you love to build or achieve?" maxLength={240}/></label>
    <label>Current skill level<select value={form.experience} onChange={e => update('experience', e.target.value)}><option>Beginner</option><option>Some experience</option><option>Intermediate</option></select></label><label>Learning style<select value={form.learningStyle || 'Hands-on projects'} onChange={e => update('learningStyle', e.target.value)}><option>Hands-on projects</option><option>Videos first</option><option>Reading and notes</option><option>Practice questions</option><option>A balanced mix</option></select></label><label>Hours available per week<select value={form.hoursPerWeek || '5'} onChange={e => update('hoursPerWeek', e.target.value)}><option value="3">3 hours</option><option value="5">5 hours</option><option value="7">7 hours</option><option value="10">10 hours</option><option value="14">14+ hours</option></select></label><label>Target timeline<select value={form.timelineMonths || '4'} onChange={e => update('timelineMonths', e.target.value)}><option value="3">3 months</option><option value="4">4 months</option><option value="6">6 months</option><option value="9">9 months</option><option value="12">12 months</option></select></label></div></details></div>
    <div className="profile-form-bottom"><p>Profile edits are saved locally. Regenerating the AI roadmap is an optional Pro feature; your current topics remain accessible.</p><button className="button primary" type="submit">Save profile <Check size={17}/></button></div></form>
    <aside className="profile-side-card"><div className="profile-side-icon"><GraduationCap size={24}/></div><span className="section-kicker">YOUR CURRENT PATH</span><h3>{goalLabel(form, currentPath)}</h3><p>{currentPath.tagline}</p><div className="profile-fact"><span>Expected pace</span><strong>{form.hoursPerWeek || 5} hours / week</strong></div><div className="profile-fact"><span>Target timeline</span><strong>{form.timelineMonths || 4} months</strong></div><div className="profile-fact"><span>Experience</span><strong>{form.experience}</strong></div><button className="button secondary full" type="button" onClick={onReset}><ArrowRight className="reset-arrow" size={16}/> Start onboarding again</button><p className="profile-reset-note">This clears your local profile, plan preview, and progress for a fresh demo.</p></aside></div></div>;
}
function AssignmentQuestions({ quiz, answers, onSelect, feedback, submitted = false }) {
  const resultById = new Map((feedback?.results || []).map(item => [item.id, item]));
  return <div className="quiz-question-list">{quiz.questions.map((q, qi) => {
    const result = resultById.get(q.id);
    return <fieldset className="quiz-question" key={q.id}><legend><span>{String(qi + 1).padStart(2, '0')}</span>{q.question}<small className={`question-difficulty ${q.difficulty || 'intermediate'}`}>{q.difficulty || 'intermediate'}</small></legend><div className="quiz-options">{q.options.map((option, oi) => {
      const selected = Number(answers[q.id]) === oi;
      const correct = submitted && result && Number(result.correctIndex) === oi;
      const wrong = submitted && selected && result && Number(result.correctIndex) !== oi;
      return <button type="button" key={`${q.id}-${oi}`} className={`quiz-option ${selected ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`} disabled={submitted} onClick={() => onSelect(q.id, oi)}><span className="option-letter">{String.fromCharCode(65 + oi)}</span><span>{option}</span>{correct && <CheckCircle2 size={15}/>}</button>;
    })}</div>{submitted && result && <div className="quiz-explanation"><strong>{result.correct ? 'Correct.' : `Correct answer: ${String.fromCharCode(65 + Number(result.correctIndex))}.`}</strong> {result.explanation}</div>}</fieldset>;
  })}</div>;
}

function LessonModal({ path, lesson, progress, plan, profile, onClose, onComplete, onQuizResult, onQuizAbandon }) {
  const index = path.lessons.indexOf(lesson);
  const key = lessonKey(path.id, lesson.id);
  const done = (progress.completed || []).includes(key);
  const previousQuestions = progress.quizHistory?.[key] || [];
  const previousAttempts = progress.quizAttempts?.[key] || 0;
  const [attempt, setAttempt] = useState(previousAttempts + 1);
  const [quiz, setQuiz] = useState(null);
  const [quizId, setQuizId] = useState('');
  const [quizMode, setQuizMode] = useState('loading');
  const [quizLoading, setQuizLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [quizError, setQuizError] = useState('');
  const [history, setHistory] = useState(previousQuestions);
  const [notice, setNotice] = useState('');
  const [assessmentActive, setAssessmentActive] = useState(false);
  const [assessmentStarting, setAssessmentStarting] = useState(false);
  const [assessmentStopped, setAssessmentStopped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const assessmentRootRef = useRef(null);
  const activeRef = useRef(false);
  const quizRef = useRef(null);
  const quizIdRef = useRef('');
  const answersRef = useRef({});
  const submittingRef = useRef(false);
  const timerExpiredRef = useRef(false);

  useEffect(() => { quizRef.current = quiz; }, [quiz]);
  useEffect(() => { quizIdRef.current = quizId; }, [quizId]);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  async function abandonOnServer(id = quizIdRef.current) {
    if (!id) return;
    try { await fetch(`${API_BASE_URL}/api/abandon-quiz`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId: id }) }); }
    catch (error) { console.warn('Could not notify the assessment server about an abandoned attempt.', error); }
  }
  function stopAssessment(reason = 'fullscreen') {
    if (!activeRef.current) return;
    activeRef.current = false;
    setAssessmentActive(false);
    setAssessmentStarting(false);
    setAssessmentStopped(true);
    setSubmitted(false);
    setFeedback(null);
    setAnswers({});
    setQuizError('');
    const currentQuiz = quizRef.current;
    const seen = [...history, ...(currentQuiz?.questions || []).map(q => q.question)].filter(Boolean).slice(-50);
    setHistory([...new Set(seen)]);
    if (currentQuiz?.questions?.length) onQuizAbandon({ key, attempt, questions: currentQuiz.questions.map(q => ({ question: q.question, options: q.options })) });
    setQuiz(null);
    setQuizId('');
    setNotice(reason === 'hidden'
      ? 'The assessment was stopped because the page lost focus. No score was recorded. Generate a fresh set to try again.'
      : 'The assessment was stopped because fullscreen was exited. No score was recorded. Generate a fresh set to try again.');
    void abandonOnServer();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }
  useEffect(() => {
    const onFullscreenChange = () => {
      if (activeRef.current && !document.fullscreenElement) stopAssessment('fullscreen');
    };
    const onVisibilityChange = () => {
      if (activeRef.current && document.visibilityState === 'hidden') stopAssessment('hidden');
    };
    const onWindowBlur = () => { if (activeRef.current) stopAssessment('hidden'); };
    const onKeyDown = e => {
      if (e.key === 'Escape' && !activeRef.current) onClose();
      if (activeRef.current && (e.ctrlKey || e.metaKey) && ['c', 'x', 'p', 's', 'u'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    const blockCopy = e => { if (activeRef.current) e.preventDefault(); };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('copy', blockCopy);
    document.addEventListener('cut', blockCopy);
    document.addEventListener('contextmenu', blockCopy);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('copy', blockCopy);
      document.removeEventListener('cut', blockCopy);
      document.removeEventListener('contextmenu', blockCopy);
      window.removeEventListener('keydown', onKeyDown);
      if (document.fullscreenElement && document.fullscreenElement === assessmentRootRef.current) document.exitFullscreen().catch(() => {});
      if (activeRef.current) { activeRef.current = false; void abandonOnServer(); }
    };
  }, [onClose, history]);

  async function loadQuiz(nextAttempt = attempt, avoid = history) {
    setQuizLoading(true); setQuizError(''); setSubmitted(false); setAnswers({}); setFeedback(null); setNotice('');
    setAssessmentStopped(false); setAssessmentActive(false); activeRef.current = false; setQuiz(null); setQuizId('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-quiz`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathTitle: path.title,
          lesson,
          profile: { education: profile?.education, experience: profile?.experience, learningStyle: profile?.learningStyle, interests: profile?.interests, currentSkills: profile?.currentSkills, language: profile?.language },
          attempt: nextAttempt,
          avoidQuestions: avoid,
          nonce: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(data.quiz?.questions) || data.quiz.questions.length < 5 || !data.quizId) throw new Error(data.error || 'The backend did not return a complete assignment.');
      setQuiz(data.quiz); setQuizId(data.quizId); setQuizMode(data.mode || 'ai'); setAttempt(nextAttempt);
      setNotice(data.mode === 'ai' ? 'Questions generated by the AI service. Correct answers stay on the backend until you submit.' : 'Fresh topic-based questions are ready. Add GROQ_API_KEY to enable AI-generated wording.');
    } catch (error) {
      setQuizError(error?.message || 'Could not reach the assignment backend. Start the backend and retry.');
      setQuiz(null); setQuizId('');
    } finally { setQuizLoading(false); }
  }
  useEffect(() => { loadQuiz((progress.quizAttempts?.[key] || 0) + 1, progress.quizHistory?.[key] || []); }, [path.id, lesson.id]);

  async function startAssessment() {
    if (!quiz || !quizId || assessmentStarting || assessmentActive) return;
    setQuizError(''); setAssessmentStarting(true);
    try {
      const root = assessmentRootRef.current;
      if (!root || !root.requestFullscreen || !document.fullscreenEnabled) throw new Error('Fullscreen assessment is not supported by this browser. Please use an up-to-date desktop or mobile browser.');
      // This call is deliberately inside the click handler so the browser recognises the user gesture.
      await root.requestFullscreen();
      const response = await fetch(`${API_BASE_URL}/api/start-quiz`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not start the timed assignment.');
      if (document.fullscreenElement !== root) { await abandonOnServer(quizId); throw new Error('Fullscreen was exited before the assessment started. Please start again.'); }
      timerExpiredRef.current = false;
      activeRef.current = true;
      setSecondsLeft(Number(data.timeLimitSeconds || quiz.timeLimitSeconds || 300));
      setAssessmentStopped(false);
      setAssessmentActive(true);
      setAssessmentStarting(false);
    } catch (error) {
      activeRef.current = false;
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setAssessmentStarting(false);
      setQuizError(error?.message || 'Could not start the assessment.');
    }
  }

  async function submitAssignment(timedOut = false) {
    if (!quiz || !quizId || submittingRef.current || submitted) return;
    const missing = quiz.questions.some(q => answersRef.current[q.id] === undefined);
    if (missing && !timedOut) { setQuizError('Answer every question before submitting. The timer keeps running.'); return; }
    submittingRef.current = true; setSubmitting(true); setQuizError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/submit-quiz`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, answers: answersRef.current, timedOut }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The assignment could not be graded.');
      activeRef.current = false;
      setAssessmentActive(false);
      setFeedback(data); setSubmitted(true); setAssessmentStopped(false);
      setHistory(old => [...new Set([...old, ...quiz.questions.map(q => q.question)])].slice(-50));
      const result = { key, questions: quiz.questions.map(q => ({ question: q.question, options: q.options })), score: data.score, total: data.total, passed: data.passed, attempt, date: data.submittedAt || new Date().toISOString() };
      onQuizResult(result);
      if (data.passed) onComplete(lesson);
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    } catch (error) {
      setQuizError(`${error?.message || 'Could not submit the assignment.'} Check the backend connection and submit again before the timer expires.`);
    } finally { submittingRef.current = false; setSubmitting(false); }
  }
  useEffect(() => {
    if (!assessmentActive || submitted || submitting) return;
    if (secondsLeft <= 0) { if (!timerExpiredRef.current) { timerExpiredRef.current = true; void submitAssignment(true); } return; }
    const timer = setTimeout(() => setSecondsLeft(value => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [assessmentActive, submitted, submitting, secondsLeft]);

  function selectAnswer(questionId, optionIndex) {
    if (!activeRef.current || submitted) return;
    setAnswers(old => {
      const next = { ...old, [questionId]: optionIndex };
      answersRef.current = next;
      return next;
    });
  }
  function nextAssignment() {
    const seen = [...history, ...(quiz?.questions || []).map(q => q.question)];
    void loadQuiz(attempt + 1, [...new Set(seen)].slice(-50));
  }
  function handleClose() {
    if (activeRef.current) stopAssessment('fullscreen');
    if (document.fullscreenElement && document.fullscreenElement === assessmentRootRef.current) document.exitFullscreen().catch(() => {});
    onClose();
  }
  const resourceUrl = lesson.resourceUrl || `https://www.google.com/search?q=${encodeURIComponent(`${lesson.title} ${path.title} official learning resource`)}`;
  const language = profile?.language || 'English';
  const videoUrl = lesson.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${lesson.title} ${path.title} tutorial in ${language}`)}&hl=${encodeURIComponent(({Telugu:'te',Hindi:'hi',English:'en'})[language] || 'en')}&gl=IN`;
  const mmss = value => `${Math.floor(Math.max(0, value) / 60).toString().padStart(2, '0')}:${(Math.max(0, value) % 60).toString().padStart(2, '0')}`;
  const assessmentQuestions = quiz && <AssignmentQuestions quiz={quiz} answers={answers} onSelect={selectAnswer} />;
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget && !activeRef.current) handleClose(); }}>
    <section className="lesson-dialog" role="dialog" aria-modal="true" aria-labelledby="lesson-title">
      <div className="dialog-top"><div className="dialog-label"><span className="dialog-topic-count">TOPIC {String(index + 1).padStart(2, '0')}</span><span className="dialog-duration"><Clock3 size={14}/> {lesson.duration}</span>{done && <Pill kind="success">Completed</Pill>}</div><button className="icon-button" onClick={handleClose} aria-label="Close lesson" disabled={assessmentActive}><X size={19}/></button></div>
      <div className="dialog-heading-icon"><div className="lesson-dialog-art"><BookOpen size={25}/><span/></div><div><span className="section-kicker">{path.title.toUpperCase()}</span><h2 id="lesson-title">{lesson.title}</h2></div></div><p className="dialog-description">{lesson.description}</p>
      <div className="dialog-section"><h3><Target size={16}/> What you’ll practise</h3><div className="skill-chips">{(lesson.skills || []).map(skill => <span key={skill}>{skill}</span>)}</div></div>
      <div className="practice-box"><div className="practice-icon"><Rocket size={18}/></div><div><span className="section-kicker">YOUR PRACTICE TASK</span><p>{lesson.practice}</p></div></div>
      <div className="dialog-resources"><h3>Your learning resources · {language}</h3><a className="dialog-resource" href={videoUrl} target="_blank" rel="noreferrer"><span className="resource-leading youtube"><Play size={16} fill="currentColor"/></span><span><strong>Watch the {language} YouTube lesson</strong><small>{lesson.videoTitle || `${lesson.title} — ${language}`}</small></span><ExternalLink size={16}/></a><a className="dialog-resource" href={resourceUrl} target="_blank" rel="noreferrer"><span className="resource-leading pdf"><BookOpen size={17}/></span><span><strong>{lesson.resourceLabel || 'Read an online reference'}</strong><small>Open a topic-specific article, documentation page or learning resource</small></span><ExternalLink size={16}/></a></div>
      <section className="assignment-card"><div className="assignment-heading"><div><span className="section-kicker">TIMED TOPIC ASSIGNMENT</span><h3><ClipboardList size={18}/> Check your understanding</h3></div><Pill kind={submitted && feedback?.passed ? 'success' : 'lavender'}>{submitted ? `${feedback.score}/${feedback.total}` : `Attempt ${attempt}`}</Pill></div>
        <p className="assignment-intro">The backend creates a fresh five-question assessment for this topic. Answers are graded on the server, and the timer adapts to topic and question difficulty.</p>
        {notice && <p className="assignment-notice"><Sparkles size={13}/>{notice}</p>}
        {quizLoading ? <div className="quiz-loading"><RefreshCw className="spin" size={18}/> Preparing a fresh assignment…</div> : assessmentStopped ? <div className="assessment-stopped"><ShieldAlert size={21}/><div><strong>Assessment stopped</strong><p>{notice || 'Fullscreen was exited. Your answers were discarded and no score was recorded.'}</p><button className="button primary" onClick={nextAssignment}>Generate a fresh set <RefreshCw size={15}/></button></div></div> : !quiz ? <div className="quiz-loading"><CircleHelp size={18}/><span>{quizError || 'The backend could not prepare this assignment.'}</span><button className="button secondary small" onClick={() => loadQuiz(attempt, history)}>Try again</button></div> : !submitted ? <><div className="assessment-ready"><div className="assessment-ready-icon"><ShieldCheck size={23}/></div><div><strong>Ready when you are</strong><p>{quiz.questions.length} questions · {quiz.difficulty || 'adaptive'} difficulty · about {Math.ceil(quiz.timeLimitSeconds / 60)} min. Once started, leave fullscreen or switch away and the assessment will stop without a score.</p></div></div>{quizError && <p className="form-error">{quizError}</p>}<div className="assignment-actions"><button className="button primary full" disabled={assessmentStarting} onClick={startAssessment}>{assessmentStarting ? <><RefreshCw size={15} className="spin"/> Starting secure assessment…</> : <>Start timed fullscreen assessment <ArrowRight size={16}/></>}</button></div></> : <>
          <div className={`quiz-result ${feedback?.passed ? 'passed' : 'retry'}`}><div className="quiz-result-icon">{feedback?.passed ? <Trophy size={20}/> : <RefreshCw size={20}/>}</div><div><strong>{feedback?.expired ? 'Time is up.' : feedback?.passed ? 'Assignment passed!' : 'Not passed yet — keep practising.'}</strong><p>You scored {feedback?.score ?? 0} out of {feedback?.total ?? quiz.questions.length}. {feedback?.passed ? 'This lesson has been marked complete. Review the explanations below or practise with a new set.' : 'Review the explanations and generate a different assignment. Every retry creates a new set.'}</p></div></div>
          <AssignmentQuestions quiz={quiz} answers={answers} onSelect={selectAnswer} feedback={feedback} submitted/>
          <div className="assignment-actions"><button className="button primary full" onClick={nextAssignment}><RefreshCw size={15}/> {feedback?.passed ? 'Practise with a new question set' : 'Generate a different assignment'} <ArrowRight size={16}/></button></div>
        </>}
        {quizError && quiz && !assessmentStopped && <p className="form-error">{quizError}</p>}
      </section>
      <div className="dialog-footer"><span className="dialog-lock-note"><CheckCircle2 size={15}/> {done ? 'Topic completed. Retake assignments anytime.' : 'Pass the assessment to mark this topic complete.'}</span><button className="button secondary" onClick={handleClose}>Close topic</button></div>
    </section>
    {quiz && !quizLoading && <section ref={assessmentRootRef} className={`assessment-fullscreen-shell ${assessmentActive ? 'active' : 'prestart'}`} aria-label="Timed assessment fullscreen">
      <header className="assessment-screen-header"><div><Logo/><p><span className="assessment-live-dot"/> TIMED ASSESSMENT · {path.title}</p></div><div className={`assessment-timer ${secondsLeft <= 60 ? 'urgent' : ''}`}><Clock3 size={20}/><span><small>TIME REMAINING</small><strong>{mmss(assessmentActive ? secondsLeft : quiz.timeLimitSeconds)}</strong></span></div></header>
      <div className="assessment-screen-content"><div className="assessment-screen-intro"><div><span className="section-kicker">TOPIC {String(index + 1).padStart(2, '0')} OF {path.lessons.length}</span><h2>{lesson.title}</h2><p>{quiz.instructions}</p></div><Pill kind="lavender">{quiz.difficulty || 'Adaptive'} difficulty</Pill></div>
        <div className="assessment-rules"><ShieldCheck size={17}/><span>Stay in fullscreen and keep this page active. Exiting fullscreen or switching away ends this attempt. Correct answers remain hidden until submission.</span><span className="assessment-count">{Object.keys(answers).length}/{quiz.questions.length} answered</span></div>
        {assessmentQuestions}
        {quizError && <p className="form-error">{quizError}</p>}
        <div className="assessment-screen-footer"><span>{quiz.questions.length} questions · pass mark {quiz.passMark}/{quiz.questions.length}</span><button className="button primary" onClick={() => submitAssignment(secondsLeft <= 0)} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit assignment'} <Check size={16}/></button></div>
      </div>
    </section>}
  </div>;
}
function loadRazorpay() { if(window.Razorpay)return Promise.resolve(true);return new Promise(resolve=>{const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=()=>resolve(true);s.onerror=()=>resolve(false);document.body.appendChild(s)}); }
function UpgradeModal({ onClose, activate, plan, notify }) {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');useEffect(()=>{const listener=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener)},[onClose]);
  async function checkout(){setBusy(true);setError('');try{const r=await fetch(`${API_BASE_URL}/api/create-subscription`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Skill Bridge learner'})});const data=await r.json().catch(()=>({}));if(data.configured&&data.subscriptionId&&data.keyId){const loaded=await loadRazorpay();if(!loaded)throw new Error('Could not load Razorpay Checkout. Check your internet connection.');const rz=new window.Razorpay({key:data.keyId,subscription_id:data.subscriptionId,name:'Skill Bridge',description:'Skill Bridge Pro monthly plan',image:'/favicon.svg',theme:{color:'#6657e8'},handler:async payment=>{const vr=await fetch(`${API_BASE_URL}/api/verify-subscription`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payment)});const verified=await vr.json().catch(()=>({}));if(vr.ok&&verified.verified){activate('live');onClose();notify('Payment verified. Pro access is enabled in this browser.')}else setError(verified.error||'Payment could not be verified. Please contact support before retrying.')},modal:{ondismiss:()=>setBusy(false)}});rz.on('payment.failed',event=>setError(event?.error?.description||'Payment failed. Please try again.'));rz.open();setBusy(false)}else{setBusy(false);setError(data.message||'Live payments are not configured yet. The local preview does not charge money.')}}catch(e){setBusy(false);setError(e?.message||'The payment service could not be reached.')}}
  return <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="upgrade-dialog" role="dialog" aria-modal="true" aria-labelledby="upgrade-title"><button className="icon-button upgrade-close" onClick={onClose} aria-label="Close upgrade modal"><X size={19}/></button><div className="upgrade-dialog-art"><div className="upgrade-glow glow-one"/><div className="upgrade-glow glow-two"/><div className="upgrade-star"><Sparkles size={30}/></div><span className="upgrade-float float-left"><BookOpen size={16}/></span><span className="upgrade-float float-right"><Rocket size={17}/></span></div><span className="eyebrow centered"><Sparkles size={14}/> YOUR NEXT LEVEL</span><h2 id="upgrade-title">Make your next step <span>count.</span></h2><p className="upgrade-lede">Keep learning everything for free. Pro adds AI roadmap refinement, multiple saved paths, downloadable learning-plan exports and detailed quiz insights.</p><div className="upgrade-price"><strong>₹199</strong><span>/ month</span><Pill kind="lavender">Pro</Pill></div><div className="upgrade-benefits"><span><CheckCircle2 size={16}/> All core course content stays free</span><span><CheckCircle2 size={16}/> AI roadmap refinement and multiple paths</span><span><CheckCircle2 size={16}/> Learning-plan exports and quiz insights</span></div><button className="button primary full checkout-button" onClick={checkout} disabled={busy}>{busy?'Connecting to checkout…':<>Continue to checkout <ArrowRight size={17}/></>}</button>{error&&<div className="checkout-warning"><CircleHelp size={16}/><span>{error}</span></div>}<button className="demo-access-button" onClick={()=>{activate('preview');onClose();notify('Pro preview enabled. No payment was taken.')}}>Enable Pro preview mode <ArrowUpRight size={14}/></button><p className="checkout-legal">Preview mode is local to this browser and is not a payment. Live checkout requires Razorpay configuration by the site owner.</p>{plan.tier==='pro'&&<Pill kind="success">Pro access is already enabled</Pill>}</section></div>;
}
export default function App() {
  const [profile, setProfile] = useState(() => readProfile());
  const [progress, setProgress] = useState(() => readProgress());
  const [plan, setPlan] = useState(() => readPlan());
  const [savedPaths, setSavedPaths] = useState(() => readSavedPaths());
  const [active, setActive] = useState('overview');
  const [lesson, setLesson] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('pathpilot_theme_v1') || 'light'; } catch { return 'light'; } });
  const bootstrappedRef = useRef(false);
  const path = useMemo(() => resolveRoadmap(profile), [profile]);
  const currentPlan = plan?.tier === 'pro' && plan.expiresAt && Date.parse(plan.expiresAt) < Date.now() ? { tier: 'free', source: 'expired', expiresAt: null } : (plan || { tier: 'free', source: 'default', expiresAt: null });
  const notify = message => setToast(message);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('pathpilot_theme_v1', theme); } catch {}
  }, [theme]);
  function toggleTheme() { setTheme(old => old === 'dark' ? 'light' : 'dark'); }

  async function buildRoadmap(nextProfile) {
    const normalizedProfile = {
      ...nextProfile,
      language: RESOURCE_LANGUAGES.includes(nextProfile.language) ? nextProfile.language : 'English',
      customLanguage: '',
    };
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/generate-roadmap`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: normalizedProfile }),
      });
    } catch {
      throw new Error('Could not reach the Skill Bridge backend. Start both servers with npm.cmd run dev:all, then try again.');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.roadmap?.lessons?.length) throw new Error(data.error || 'The backend could not create your roadmap. Check server configuration and try again.');
    return { profile: { ...normalizedProfile, generatedRoadmap: data.roadmap, roadmapMode: data.mode || data.roadmap.generatedBy || 'personalized-fallback', roadmapVersion: 4 }, notice: data.notice || '' };
  }

  useEffect(() => {
    if (!profile || bootstrappedRef.current) return;
    let alive = true;
    const generate = async sourceProfile => {
      bootstrappedRef.current = true;
      setGeneratingRoadmap(true);
      try {
        const result = await buildRoadmap(sourceProfile);
        if (!alive) return;
        writeProfile(result.profile); setProfile(result.profile);
        if (result.notice) notify(result.notice);
      } catch (error) {
        if (alive) notify(error?.message || 'Could not refresh the roadmap. Check that the backend is running.');
      } finally { if (alive) setGeneratingRoadmap(false); }
    };
    const hasCurrentRoadmap = Number(profile.roadmapVersion || 0) >= 4 && profile.generatedRoadmap?.lessons?.length;
    if (!hasCurrentRoadmap) {
      void generate(profile);
    } else if (profile.roadmapMode === 'personalized-fallback') {
      // If the learner added their Groq key after first launch, automatically upgrade
      // their stored fallback path to a genuine AI-generated personalised roadmap.
      fetch(`${API_BASE_URL}/api/health`).then(response => response.ok ? response.json() : null).then(health => {
        if (!alive) return;
        if (health?.aiConfigured) void generate(profile);
        else bootstrappedRef.current = true;
      }).catch(() => { bootstrappedRef.current = true; });
    } else {
      bootstrappedRef.current = true;
    }
    return () => { alive = false; };
  }, [profile]);

  useEffect(() => { if (currentPlan !== plan) { setPlan(currentPlan); writePlan(currentPlan); } }, [currentPlan, plan]);
  useEffect(() => {
    const pricing = () => { setActive('pricing'); setUpgradeOpen(true); };
    const profileView = () => setActive('profile');
    window.addEventListener('pathpilot:open-pricing', pricing); window.addEventListener('pathpilot:open-profile', profileView);
    return () => { window.removeEventListener('pathpilot:open-pricing', pricing); window.removeEventListener('pathpilot:open-profile', profileView); };
  }, []);

  async function finishOnboarding(next) {
    setGeneratingRoadmap(true);
    try {
      const result = await buildRoadmap(next);
      bootstrappedRef.current = true;
      writeProfile(result.profile); setProfile(result.profile); setActive('overview');
      notify(result.notice || `Welcome to Skill Bridge, ${next.name.split(' ')[0]}! Your personalised roadmap is ready.`);
    } finally { setGeneratingRoadmap(false); }
  }
  function completeLesson(lessonItem) {
    const key = lessonKey(path.id, lessonItem.id);
    const wasDone = (progress.completed || []).includes(key);
    setProgress(previous => {
      const alreadyDone = (previous.completed || []).includes(key);
      const mins = Math.round(durationHours(lessonItem.duration) * 30);
      const sessions = [...(previous.sessions || [])];
      if (!alreadyDone) sessions.push({ date: dayKey(), minutes: mins });
      const next = {
        ...previous,
        completed: alreadyDone ? (previous.completed || []) : [...(previous.completed || []), key],
        sessions,
        weeklyMinutes: weeklyMinutes({ sessions }),
        activeDates: alreadyDone ? (previous.activeDates || []) : [...new Set([...(previous.activeDates || []), dayKey()])],
      };
      writeProgress(next);
      return next;
    });
    if (!wasDone) notify(`Nice work — “${lessonItem.title}” marked complete.`);
  }
  function recordQuizResult(result) {
    setProgress(previous => {
      const oldHistory = previous.quizHistory || {};
      const existing = oldHistory[result.key] || [];
      const newQuestions = (result.questions || []).map(q => q.question).filter(Boolean);
      const history = [...existing, ...newQuestions].slice(-50);
      const oldResults = previous.assessmentResults || {};
      const attempts = previous.quizAttempts || {};
      const currentResults = oldResults[result.key] || [];
      const summary = { score: result.score, total: result.total, passed: result.passed, attempt: result.attempt, date: result.date || new Date().toISOString() };
      const next = {
        ...previous,
        quizHistory: { ...oldHistory, [result.key]: history },
        quizAttempts: { ...attempts, [result.key]: Math.max(attempts[result.key] || 0, result.attempt || 1) },
        assessmentResults: { ...oldResults, [result.key]: [...currentResults, summary].slice(-30) },
      };
      writeProgress(next);
      return next;
    });
  }
  function recordQuizAbandon(result) {
    setProgress(previous => {
      const oldHistory = previous.quizHistory || {};
      const existing = oldHistory[result.key] || [];
      const newQuestions = (result.questions || []).map(q => q.question).filter(Boolean);
      const history = [...new Set([...existing, ...newQuestions])].slice(-50);
      const attempts = previous.quizAttempts || {};
      const next = {
        ...previous,
        quizHistory: { ...oldHistory, [result.key]: history },
        quizAttempts: { ...attempts, [result.key]: Math.max(attempts[result.key] || 0, result.attempt || 1) },
      };
      writeProgress(next);
      return next;
    });
  }
  function activatePro(source = 'preview') { const next = { tier: 'pro', source, expiresAt: null }; setPlan(next); writePlan(next); }
  function switchFree() { const next = { tier: 'free', source: 'manual', expiresAt: null }; setPlan(next); writePlan(next); notify('You’re now on the Free plan. Every topic and assignment remains available.'); }
  function reset() {
    if (!window.confirm('Start fresh? Your local profile, plan preview, saved paths and completed lesson progress will be cleared.')) return;
    clearPathPilotData(); setProfile(null); setSavedPaths([]); setProgress({ completed: [], activeDates: [], weeklyMinutes: 0, sessions: [], quizHistory: {}, quizAttempts: {}, assessmentResults: {} }); setPlan({ tier: 'free', source: 'default', expiresAt: null }); setActive('overview'); setLesson(null); setUpgradeOpen(false); bootstrappedRef.current = false; notify('Your demo has been reset. Create a fresh learning profile.');
  }
  function saveCurrentPath() {
    const key = profile.goalId === 'custom' ? `custom:${wordSlug(profile.customGoal)}` : profile.goalId;
    if (savedPaths.some(item => item.key === key)) { notify('This learning path is already saved.'); return; }
    if (currentPlan.tier !== 'pro' && savedPaths.length >= 1) { setUpgradeOpen(true); notify('Free includes one saved path. Pro unlocks multiple saved paths.'); return; }
    const item = { key, goalId: profile.goalId, customGoal: profile.customGoal || '', label: goalLabel(profile, path), title: path.title, icon: path.icon, color: path.color, generatedRoadmap: path, roadmapVersion: profile.roadmapVersion || 4, savedAt: new Date().toISOString() };
    const next = [...savedPaths, item]; setSavedPaths(next); writeSavedPaths(next); notify('Learning path saved to your collection.');
  }
  async function openSavedPath(item) {
    const base = { ...profile, goalId: item.goalId, customGoal: item.customGoal || '' };
    if (Number(item.roadmapVersion || 0) >= 4 && item.generatedRoadmap?.lessons?.length) {
      const next = { ...base, generatedRoadmap: item.generatedRoadmap, roadmapMode: item.generatedRoadmap.generatedBy || 'ai', roadmapVersion: 4 };
      writeProfile(next); setProfile(next); setActive('roadmap'); notify(`Opened ${item.label}.`);
      return;
    }
    setGeneratingRoadmap(true);
    try {
      const result = await buildRoadmap({ ...base, generatedRoadmap: undefined, roadmapMode: undefined });
      writeProfile(result.profile); setProfile(result.profile); setActive('roadmap');
      const refreshed = savedPaths.map(saved => saved.key === item.key ? { ...saved, generatedRoadmap: result.profile.generatedRoadmap, roadmapVersion: 4 } : saved);
      setSavedPaths(refreshed); writeSavedPaths(refreshed);
      notify(result.notice || `Rebuilt ${item.label} using your current learning profile.`);
    } catch (error) {
      notify(error?.message || 'Could not rebuild that saved roadmap. Check the backend and retry.');
    } finally { setGeneratingRoadmap(false); }
  }
  async function regenerateRoadmap() {
    if (currentPlan.tier !== 'pro') { setUpgradeOpen(true); return; }
    setGeneratingRoadmap(true);
    try {
      const { generatedRoadmap, roadmapMode, ...cleanProfile } = profile;
      const result = await buildRoadmap(cleanProfile);
      writeProfile(result.profile); setProfile(result.profile);
      notify(result.notice || 'Your learning roadmap has been regenerated from your profile and interests.');
    } catch (error) {
      notify(error?.message || 'Roadmap generation failed. Check your API configuration and retry.');
    } finally { setGeneratingRoadmap(false); }
  }
  async function saveProfile(nextProfile) {
    const roadmapFields = ['goalId', 'customGoal', 'experience', 'hoursPerWeek', 'timelineMonths', 'interests', 'currentSkills', 'language', 'customLanguage', 'learningStyle', 'motivation', 'dreamProject'];
    const needsRebuild = roadmapFields.some(field => String(nextProfile[field] ?? '') !== String(profile[field] ?? ''));
    if (needsRebuild) {
      setGeneratingRoadmap(true);
      try {
        const { generatedRoadmap, roadmapMode, ...cleanProfile } = nextProfile;
        const result = await buildRoadmap(cleanProfile);
        writeProfile(result.profile); setProfile(result.profile);
        notify(result.notice || 'Profile saved and the backend rebuilt your roadmap around the updated preferences.');
      } catch (error) {
        notify(error?.message || 'Your roadmap could not be rebuilt. Your previous version is still saved.');
      } finally { setGeneratingRoadmap(false); }
    } else {
      const cleaned = { ...nextProfile, generatedRoadmap: profile.generatedRoadmap, roadmapMode: profile.roadmapMode };
      writeProfile(cleaned); setProfile(cleaned); notify('Your profile is saved. Your current roadmap remains available.');
    }
  }
  function downloadRoadmap() {
    if (currentPlan.tier !== 'pro') { setUpgradeOpen(true); return; }
    const lines = [`# ${path.title} — Skill Bridge learning plan`, '', path.description, '', `Duration: ${path.duration}`, `Learner: ${profile.name}`, `Interests: ${profile.interests || 'Not specified'}`, '', ...path.lessons.map((item, index) => [`## ${index + 1}. ${item.title}`, '', item.description, '', `Practice: ${item.practice}`, `YouTube: ${item.youtubeUrl || ''}`, `Online resource: ${item.resourceUrl || ''}`, ''].join('\n'))];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${wordSlug(path.title).replace(/\s+/g, '-') || 'pathpilot'}-learning-plan.md`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url); notify('Your learning plan export is downloading.');
  }

  if (!profile) return <><Onboarding onFinish={finishOnboarding} theme={theme} onToggleTheme={toggleTheme}/><Toast message={toast} onClose={() => setToast('')}/></>;
  return <div className="app-shell"><Sidebar active={active} setActive={setActive} profile={profile} plan={currentPlan} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/><main className="main-shell"><HeaderBar active={active} profile={profile} onMenu={() => setMobileOpen(true)} plan={currentPlan} theme={theme} onToggleTheme={toggleTheme}/>
    {active === 'overview' && <Overview profile={profile} path={path} progress={progress} plan={currentPlan} openLesson={setLesson} setTab={setActive} onUpgrade={() => setUpgradeOpen(true)}/>}
    {active === 'roadmap' && <RoadmapView profile={profile} path={path} progress={progress} plan={currentPlan} openLesson={setLesson} onUpgrade={() => setUpgradeOpen(true)} savedPaths={savedPaths} onSavePath={saveCurrentPath} onOpenSavedPath={openSavedPath} onDownloadRoadmap={downloadRoadmap} onRegenerate={regenerateRoadmap} generatingRoadmap={generatingRoadmap}/>}
    {active === 'resources' && <ResourcesView path={path} progress={progress} plan={currentPlan} openLesson={setLesson}/>}
    {active === 'pricing' && <PricingView plan={currentPlan} onUpgrade={() => setUpgradeOpen(true)} onFree={switchFree}/>}
    {active === 'profile' && <ProfileView profile={profile} setProfile={setProfile} currentPath={path} onToast={notify} onReset={reset} onSaveProfile={saveProfile}/>}
    <footer className="app-footer"><span>© {new Date().getFullYear()} Skill Bridge</span><span>Made for progress, not perfection.</span><button onClick={() => notify('This prototype stores your profile and progress in this browser. Configure account authentication and a database before a public launch.')}>Privacy & demo info</button></footer></main>
    {lesson && <LessonModal path={path} lesson={lesson} progress={progress} plan={currentPlan} profile={profile} onClose={() => setLesson(null)} onComplete={completeLesson} onQuizResult={recordQuizResult} onQuizAbandon={recordQuizAbandon}/>}
    {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} activate={activatePro} plan={currentPlan} notify={notify}/>}
    <Toast message={toast} onClose={() => setToast('')}/></div>;
}
