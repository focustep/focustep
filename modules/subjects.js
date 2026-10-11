import { getLang } from './i18n.js';
import { getSubjectLocalizedName } from './subjects-db.js';
import { getEffectiveNow } from './stats/time.js';

/**
 * Subjects & Activity Data Store
 */

const DEFAULT_SUBJECTS = [
  { 
    id: 'math', 
    name: 'Matematika', 
    names: {
      uz: "Matematika",
      ru: "Математика",
      en: "Math"
    },
    color: '#8b5cf6', 
    icon: 'calculator' 
  },
  { 
    id: 'english', 
    name: 'Ingliz tili', 
    names: {
      uz: "Ingliz tili",
      ru: "Английский язык",
      en: "English"
    },
    color: '#f97316', 
    icon: 'languages' 
  },
  { 
    id: 'physics', 
    name: 'Fizika', 
    names: {
      uz: "Fizika",
      ru: "Физика",
      en: "Physics"
    },
    color: '#10b981', 
    icon: 'flask-conical' 
  },
  { 
    id: 'other', 
    name: 'Boshqa', 
    names: {
      uz: "Boshqa",
      ru: "Другое",
      en: "Other"
    },
    color: '#4ec9b0', 
    icon: 'more-horizontal' 
  }
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
    physics: 90, // 1.5 hours
    other: 60 // 1 hour
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
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(s => {
          if (s && s.color && s.color.toLowerCase() === '#f5c4c4') {
            return { ...s, color: '#ffffff' };
          }
          return s;
        });
      }
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
    if (id === 'none' || id === '') return null;
    const subjects = getSubjects();
    if (id && subjects.some(s => s.id === id)) return id;
    if (id === null && subjects.length > 0) return subjects[0].id;
  } catch (e) {}
  return null;
}

export function setActiveSubjectId(id) {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_SUBJECT_KEY, id);
    } else {
      localStorage.setItem(ACTIVE_SUBJECT_KEY, 'none');
    }
  } catch (e) {}
}

export function getSubjectName(subject, lang = getLang()) {
  return getSubjectLocalizedName(subject, lang);
}

export function isDuplicateSubjectName(name, excludeSubjectId = null) {
  if (!name || typeof name !== 'string') return false;
  const normalized = name.trim().toLowerCase();
  if (!normalized) return false;

  const subjects = getSubjects();
  return subjects.some(s => {
    if (excludeSubjectId && s.id === excludeSubjectId) {
      return false;
    }
    // 1. Direct name match
    if (s.name && s.name.trim().toLowerCase() === normalized) {
      return true;
    }
    // 2. Localized name match in current UI language
    const locName = getSubjectName(s);
    if (locName && locName.trim().toLowerCase() === normalized) {
      return true;
    }
    // 3. Multilingual dictionary match across languages
    if (s.names && typeof s.names === 'object') {
      const vals = Object.values(s.names);
      if (vals.some(v => typeof v === 'string' && v.trim().toLowerCase() === normalized)) {
        return true;
      }
    }
    return false;
  });
}

export function addSubject(newSubject) {
  const subjects = getSubjects();
  // Ensure unique ID
  const id = newSubject.id || `subj_${Date.now()}`;
  const subjectToAdd = {
    id,
    name: newSubject.name.trim() || 'New Subject',
    names: newSubject.names || undefined,
    color: newSubject.color || '#4ec9b0',
    icon: (newSubject.icon && typeof newSubject.icon === 'string') ? newSubject.icon : ''
  };
  // Yangi qo'shilgan fan har doim 1-o'rinda tursin
  subjects.unshift(subjectToAdd);
  saveSubjects(subjects);
  setActiveSubjectId(id);
  
  // Set default goal for new subject (e.g. 60m)
  const defaultGoal = newSubject.defaultGoal || 60;
  setGoalForSubject(id, defaultGoal);
  
  return subjectToAdd;
}

export function updateSubject(subjectId, updates) {
  const subjects = getSubjects();
  const index = subjects.findIndex(s => s.id === subjectId);
  if (index === -1) return null;

  const existing = subjects[index];
  const newName = updates.name ? updates.name.trim() : existing.name;

  let names = existing.names;
  if (updates.names !== undefined) {
    names = updates.names;
  } else if (updates.name) {
    const curLoc = getSubjectName(existing);
    if (newName !== curLoc && newName !== existing.name) {
      names = undefined;
    }
  }

  const updatedSubject = {
    ...existing,
    id: existing.id,
    name: newName,
    names,
    color: updates.color || existing.color,
    icon: updates.icon !== undefined ? updates.icon : existing.icon
  };

  subjects[index] = updatedSubject;
  saveSubjects(subjects);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('focustep:subjectsUpdated', { detail: { updated: updatedSubject } }));
  }
  return updatedSubject;
}

const SUBJECT_UNDO_STACK_KEY = 'focustep_subject_undo_stack';

export function getSubjectUndoStack() {
  try {
    const raw = localStorage.getItem(SUBJECT_UNDO_STACK_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return [];
}

export function saveSubjectUndoStack(stack) {
  try {
    localStorage.setItem(SUBJECT_UNDO_STACK_KEY, JSON.stringify(stack));
  } catch(e) {}
}

export function deleteSubject(subjectId) {
  let subjects = getSubjects();
  if (subjects.length === 0) return null;
  const subjectToDelete = subjects.find(s => s.id === subjectId);
  const index = subjects.findIndex(s => s.id === subjectId);
  if (subjectToDelete) {
    const stack = getSubjectUndoStack();
    const prevActiveId = getActiveSubjectId();
    stack.push({
      subject: subjectToDelete,
      index: index >= 0 ? index : subjects.length - 1,
      previousActiveId: prevActiveId,
      wasActive: prevActiveId === subjectId
    });
    saveSubjectUndoStack(stack);
  }
  subjects = subjects.filter(s => s.id !== subjectId);
  saveSubjects(subjects);

  if (getActiveSubjectId() === subjectId) {
    if (subjects.length > 0) {
      // Tanlangan predmet o'chirilsa, undan keyingi predmet avtomatik tanlanadi
      // Agar o'chirilgani eng oxirgisi bo'lsa, ro'yxatning yangi oxirgi predmeti tanlanadi
      const nextIndex = (index >= 0 && index < subjects.length) ? index : subjects.length - 1;
      setActiveSubjectId(subjects[nextIndex].id);
    } else {
      setActiveSubjectId(null);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('focustep:subjectsUpdated', { detail: { deletedId: subjectId } }));
  }
  return subjectToDelete || null;
}

export function undoLastSubjectDelete() {
  const stack = getSubjectUndoStack();
  if (stack.length === 0) return null;
  const lastAction = stack.pop();
  saveSubjectUndoStack(stack);

  if (lastAction && lastAction.subject) {
    let subjects = getSubjects();
    if (!subjects.some(s => s.id === lastAction.subject.id)) {
      if (typeof lastAction.index === 'number' && lastAction.index >= 0 && lastAction.index <= subjects.length) {
        subjects.splice(lastAction.index, 0, lastAction.subject);
      } else {
        subjects.push(lastAction.subject);
      }
      saveSubjects(subjects);
      if (lastAction.wasActive) {
        setActiveSubjectId(lastAction.subject.id);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('focustep:subjectsUpdated', { detail: { restored: lastAction.subject } }));
      }
      return lastAction.subject;
    }
  }
  return null;
}

export function cleanOldSessions(sessions) {
  if (!Array.isArray(sessions)) return [];
  const now = getEffectiveNow().getTime();
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
        // Filter out template demo sessions ('1', '2', '3') and keep all valid focus sessions
        return parsed.filter(s => s && s.id !== '1' && s.id !== '2' && s.id !== '3' && ((s.durationSec && s.durationSec > 0) || (s.duration && s.duration > 0)));
      }
    }
  } catch (e) {}
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
    window.dispatchEvent(new CustomEvent('focustep:statsUpdated'));
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

  sessions = sessions.sort((a, b) => b.timestamp - a.timestamp);
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
  if (!subjectId || subjectId === 'none' || !subjects.some(s => s.id === subjectId)) {
    subjectId = subjects.find(s => s.id === 'other')?.id || (subjects.length > 0 ? subjects[0].id : 'other');
  }
  let subject = subjects.find(s => s.id === subjectId);
  if (!subject) {
    subject = { id: 'other', name: 'Other', color: '#4ec9b0', icon: 'more-horizontal' };
  }

  let sessions = getSessions();
  const nowTs = getEffectiveNow().getTime();
  const durationRounded = Math.max(1, Math.round(durationSec));
  const startTs = nowTs - (durationRounded * 1000);

  const newSession = {
    id: 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    subjectId: subject.id,
    subjectName: getSubjectName(subject),
    durationSec: durationRounded,
    timestamp: startTs
  };
  sessions.unshift(newSession);
  saveSessions(sessions);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('focustep:sessionLogged', { detail: newSession }));
    window.dispatchEvent(new CustomEvent('focustep:statsUpdated', { detail: { session: newSession } }));
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
