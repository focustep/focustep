/**
 * Subjects & Activity Data Store
 */

const DEFAULT_SUBJECTS = [
  { id: 'math', name: 'Math', color: '#7c3aed', icon: 'calculator' },
  { id: 'english', name: 'English', color: '#f97316', icon: 'languages' },
  { id: 'physics', name: 'Physics', color: '#10b981', icon: 'flask-conical' }
];

const SUBJECTS_KEY = 'focustep_subjects';
const SESSIONS_KEY = 'focustep_sessions';
const ACTIVE_SUBJECT_KEY = 'focustep_active_subject_id';
const GOALS_KEY = 'focustep_subject_goals';

export function getSubjectGoals() {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch (e) {}
  // Default goals (in minutes)
  const defaultGoals = {
    math: 120, // 2 hours
    english: 60, // 1 hour
    physics: 90 // 1.5 hours
  };
  saveSubjectGoals(defaultGoals);
  return defaultGoals;
}

export function saveSubjectGoals(goals) {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (e) {}
}

export function getGoalForSubject(subjectId) {
  const goals = getSubjectGoals();
  return typeof goals[subjectId] === 'number' ? goals[subjectId] : 120;
}

export function setGoalForSubject(subjectId, minutes) {
  const goals = getSubjectGoals();
  goals[subjectId] = Math.max(0, Math.round(minutes));
  saveSubjectGoals(goals);
}

export function getSubjects() {
  try {
    const raw = localStorage.getItem(SUBJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  saveSubjects(DEFAULT_SUBJECTS);
  return DEFAULT_SUBJECTS;
}

export function saveSubjects(subjects) {
  try {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  } catch (e) {}
}

export function getActiveSubjectId() {
  try {
    const id = localStorage.getItem(ACTIVE_SUBJECT_KEY);
    const subjects = getSubjects();
    if (id && subjects.some(s => s.id === id)) return id;
    if (subjects.length > 0) return subjects[0].id;
  } catch (e) {}
  return 'math';
}

export function setActiveSubjectId(id) {
  try {
    localStorage.setItem(ACTIVE_SUBJECT_KEY, id);
  } catch (e) {}
}

export function addSubject(newSubject) {
  const subjects = getSubjects();
  // Ensure unique ID
  const id = newSubject.id || `subj_${Date.now()}`;
  const subjectToAdd = {
    id,
    name: newSubject.name.trim() || 'New Subject',
    color: newSubject.color || '#4ec9b0',
    icon: newSubject.icon || 'book'
  };
  subjects.push(subjectToAdd);
  saveSubjects(subjects);
  
  // Set default goal for new subject (e.g. 60m)
  const defaultGoal = newSubject.defaultGoal || 60;
  setGoalForSubject(id, defaultGoal);
  
  return subjectToAdd;
}

export function deleteSubject(subjectId) {
  let subjects = getSubjects();
  if (subjects.length <= 1) return false; // Keep at least one
  subjects = subjects.filter(s => s.id !== subjectId);
  saveSubjects(subjects);
  if (getActiveSubjectId() === subjectId) {
    setActiveSubjectId(subjects[0].id);
  }
  return true;
}

export function cleanOldSessions(sessions) {
  if (!Array.isArray(sessions)) return [];
  const now = Date.now();
  // 3 days retention (72 hours)
  const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
  return sessions.filter(s => s && typeof s.timestamp === 'number' && s.timestamp >= threeDaysAgo);
}

export function getSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out template demo sessions ('1', '2', '3') if present
        const nonDemo = parsed.filter(s => s && s.id !== '1' && s.id !== '2' && s.id !== '3');
        const cleaned = cleanOldSessions(nonDemo);
        if (cleaned.length !== parsed.length) {
          saveSessions(cleaned);
        }
        return cleaned;
      }
    }
  } catch (e) {}
  saveSessions([]);
  return [];
}

const UNDO_STACK_KEY = 'focustep_session_undo_stack';

function getUndoStack() {
  try {
    const raw = localStorage.getItem(UNDO_STACK_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return [];
}

function saveUndoStack(stack) {
  try {
    localStorage.setItem(UNDO_STACK_KEY, JSON.stringify(stack));
  } catch(e) {}
}

export function clearAllSessions() {
  const currentSessions = getSessions();
  if (currentSessions.length > 0) {
    const stack = getUndoStack();
    stack.push({ type: 'all', sessions: [...currentSessions] });
    saveUndoStack(stack);
  }
  saveSessions([]);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('focustep:sessionLogged', { detail: null }));
  }
}

export function saveSessions(sessions) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {}
}

export function deleteSession(sessionId) {
  let sessions = getSessions();
  const sessionToDelete = sessions.find(s => s.id === sessionId);
  if (sessionToDelete) {
    const stack = getUndoStack();
    stack.push({ type: 'single', session: sessionToDelete });
    saveUndoStack(stack);
  }
  sessions = sessions.filter(s => s.id !== sessionId);
  saveSessions(sessions);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('focustep:sessionLogged', { detail: null }));
    window.dispatchEvent(new CustomEvent('focustep:statsUpdated'));
  }
}

export function undoLastSessionDelete() {
  const stack = getUndoStack();
  if (stack.length === 0) return null;
  const lastAction = stack.pop();
  saveUndoStack(stack);

  let sessions = getSessions();

  if (lastAction.type === 'single' && lastAction.session) {
    if (!sessions.some(s => s.id === lastAction.session.id)) {
      sessions.push(lastAction.session);
    }
  } else if (lastAction.type === 'all' && Array.isArray(lastAction.sessions)) {
    lastAction.sessions.forEach(restoredSession => {
      if (!sessions.some(s => s.id === restoredSession.id)) {
        sessions.push(restoredSession);
      }
    });
  }

  sessions = cleanOldSessions(sessions).sort((a, b) => b.timestamp - a.timestamp);
  saveSessions(sessions);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('focustep:sessionLogged', { detail: null }));
    window.dispatchEvent(new CustomEvent('focustep:statsUpdated'));
  }
  return lastAction.type;
}

export function logSession(subjectId, durationSec) {
  if (durationSec < 1) return null; // Log sessions from 1 second
  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === subjectId) || subjects[0] || { id: 'math', name: 'Math' };
  let sessions = getSessions();
  const newSession = {
    id: String(Date.now() + '_' + Math.floor(Math.random() * 1000)),
    subjectId: subject.id,
    subjectName: subject.name,
    durationSec: Math.round(durationSec),
    timestamp: Date.now()
  };
  sessions.unshift(newSession);
  sessions = cleanOldSessions(sessions);
  saveSessions(sessions);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('focustep:sessionLogged', { detail: newSession }));
  }
  return newSession;
}

/**
 * Returns sessions from the last 3 days sorted by timestamp descending
 */
export function getRecentActivitySessions() {
  const sessions = getSessions();
  return cleanOldSessions(sessions).sort((a, b) => b.timestamp - a.timestamp);
}
