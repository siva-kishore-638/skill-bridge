const KEYS = {
  profile: 'pathpilot_profile_v1',
  progress: 'pathpilot_progress_v1',
  plan: 'pathpilot_plan_v1',
  savedPaths: 'pathpilot_saved_paths_v1',
};

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function readProfile() {
  return safeParse(localStorage.getItem(KEYS.profile), null);
}

export function writeProfile(profile) {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export function readProgress() {
  return safeParse(localStorage.getItem(KEYS.progress), { completed: [], activeDates: [], weeklyMinutes: 0 });
}

export function writeProgress(progress) {
  localStorage.setItem(KEYS.progress, JSON.stringify(progress));
}

export function readPlan() {
  return safeParse(localStorage.getItem(KEYS.plan), { tier: 'free', source: 'default', expiresAt: null });
}

export function writePlan(plan) {
  localStorage.setItem(KEYS.plan, JSON.stringify(plan));
}

export function clearPathPilotData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

export function readSavedPaths() {
  return safeParse(localStorage.getItem('pathpilot_saved_paths_v1'), []);
}

export function writeSavedPaths(paths) {
  localStorage.setItem('pathpilot_saved_paths_v1', JSON.stringify(paths));
}
