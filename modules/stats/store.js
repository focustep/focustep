/**
 * Central State Store for Stats & Goals (Focustep)
 * Single source of truth for sessions, subjects, active period, and filters.
 * Features:
 * - Versioned localStorage persistence & migration (removes legacy subject goals)
 * - Pub/Sub subscription pattern (no polling)
 * - Command stack for Undo/Redo (Ctrl+Z / Cmd+Z)
 * - Emits backward-compatible window events: focustep:sessionLogged, focustep:statsUpdated
 */

const STORAGE_VERSION_KEY = 'focustep_storage_version';
const CURRENT_STORAGE_VERSION = 2;

const SESSIONS_KEY = 'focustep_sessions';
const SUBJECTS_KEY = 'focustep_subjects';
const ACTIVE_PERIOD_KEY = 'focustep_active_period';
const ACTIVE_SUBJECT_FILTER_KEY = 'focustep_stats_subject_filter';

// Legacy keys to remove in migration
const LEGACY_SUBJECT_GOALS_KEY = 'focustep_subject_goals';
const LEGACY_GOAL_DAYS_KEY = 'goal_days';

export const DEFAULT_SUBJECTS = [
  {
    id: 'math',
    name: 'Matematika',
    names: { uz: 'Matematika', ru: 'Математика', en: 'Math' },
    color: '#8b5cf6',
    icon: 'calculator'
  },
  {
    id: 'english',
    name: 'Ingliz tili',
    names: { uz: 'Ingliz tili', ru: 'Английский язык', en: 'English' },
    color: '#f97316',
    icon: 'languages'
  },
  {
    id: 'physics',
    name: 'Fizika',
    names: { uz: 'Fizika', ru: 'Физика', en: 'Physics' },
    color: '#10b981',
    icon: 'flask-conical'
  },
  {
    id: 'other',
    name: 'Boshqa',
    names: { uz: 'Boshqa', ru: 'Другое', en: 'Other' },
    color: '#4ec9b0',
    icon: 'more-horizontal'
  }
];

class StatsStore {
  constructor() {
    this.subscribers = new Set();
    this.undoStack = [];
    this.redoStack = [];

    this.sessions = [];
    this.subjects = [];
    this.activePeriod = 'week'; // 'week' | 'month' | 'all'
    this.subjectFilter = null; // null | subjectId

    this.init();
  }

  init() {
    this.runMigrations();
    this.loadState();
  }

  runMigrations() {
    try {
      if (typeof localStorage === 'undefined') return;
      const rawVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      const version = rawVersion ? parseInt(rawVersion, 10) : 1;

      if (version < CURRENT_STORAGE_VERSION) {
        // Migration to v2: remove legacy daily goal storage
        localStorage.removeItem(LEGACY_SUBJECT_GOALS_KEY);
        localStorage.removeItem(LEGACY_GOAL_DAYS_KEY);

        // Sanitize sessions format if needed
        const rawSessions = localStorage.getItem(SESSIONS_KEY);
        if (rawSessions) {
          try {
            const parsed = JSON.parse(rawSessions);
            if (Array.isArray(parsed)) {
              const cleaned = parsed.map(s => ({
                id: String(s.id || 's_' + Math.random().toString(36).substr(2, 9)),
                timestamp: Number(s.timestamp) || Date.now(),
                durationSec: Math.max(0, Math.round(Number(s.durationSec) || 0)),
                subjectId: s.subjectId || 'other',
                subjectName: s.subjectName || ''
              }));
              localStorage.setItem(SESSIONS_KEY, JSON.stringify(cleaned));
            }
          } catch (e) {}
        }

        localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_STORAGE_VERSION));
      }
    } catch (e) {
      console.warn('Storage migration error:', e);
    }
  }

  loadState() {
    try {
      if (typeof localStorage === 'undefined') {
        this.sessions = [];
        this.subjects = [...DEFAULT_SUBJECTS];
        return;
      }

      // Load sessions
      const rawSessions = localStorage.getItem(SESSIONS_KEY);
      if (rawSessions) {
        this.sessions = JSON.parse(rawSessions) || [];
      } else {
        this.sessions = [];
      }

      // Load subjects
      const rawSubjects = localStorage.getItem(SUBJECTS_KEY);
      if (rawSubjects) {
        this.subjects = JSON.parse(rawSubjects) || [...DEFAULT_SUBJECTS];
      } else {
        this.subjects = [...DEFAULT_SUBJECTS];
        localStorage.setItem(SUBJECTS_KEY, JSON.stringify(this.subjects));
      }

      // Load active period
      const savedPeriod = localStorage.getItem(ACTIVE_PERIOD_KEY);
      if (savedPeriod && ['week', 'month', 'all'].includes(savedPeriod)) {
        this.activePeriod = savedPeriod;
      }

      // Load subject filter
      const savedFilter = localStorage.getItem(ACTIVE_SUBJECT_FILTER_KEY);
      this.subjectFilter = savedFilter || null;
    } catch (e) {
      this.sessions = [];
      this.subjects = [...DEFAULT_SUBJECTS];
    }
  }

  saveSessions() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(this.sessions));
      }
    } catch (e) {}
  }

  saveSubjects() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SUBJECTS_KEY, JSON.stringify(this.subjects));
      }
    } catch (e) {}
  }

  subscribe(listener) {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  notify() {
    for (const listener of this.subscribers) {
      try {
        listener(this);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    }
    // Backward compatibility events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('focustep:statsUpdated'));
    }
  }

  // --- Getters ---
  getSessions() {
    return this.sessions;
  }

  getSubjects() {
    return this.subjects;
  }

  getActivePeriod() {
    return this.activePeriod;
  }

  getSubjectFilter() {
    return this.subjectFilter;
  }

  // --- Actions ---
  setActivePeriod(period) {
    if (!['week', 'month', 'all'].includes(period)) return;
    this.activePeriod = period;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ACTIVE_PERIOD_KEY, period);
      }
    } catch (e) {}
    this.notify();
  }

  setSubjectFilter(subjectId) {
    // Toggle if clicking same subject
    this.subjectFilter = this.subjectFilter === subjectId ? null : subjectId;
    try {
      if (typeof localStorage !== 'undefined') {
        if (this.subjectFilter) {
          localStorage.setItem(ACTIVE_SUBJECT_FILTER_KEY, this.subjectFilter);
        } else {
          localStorage.removeItem(ACTIVE_SUBJECT_FILTER_KEY);
        }
      }
    } catch (e) {}
    this.notify();
  }

  clearSubjectFilter() {
    this.subjectFilter = null;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(ACTIVE_SUBJECT_FILTER_KEY);
      }
    } catch (e) {}
    this.notify();
  }

  addSession(session) {
    const newSession = {
      id: session.id || 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      timestamp: Number(session.timestamp) || Date.now(),
      durationSec: Math.max(0, Math.round(Number(session.durationSec) || 0)),
      subjectId: session.subjectId || 'other',
      subjectName: session.subjectName || ''
    };

    this.sessions.unshift(newSession);
    this.saveSessions();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('focustep:sessionLogged', { detail: newSession }));
    }
    this.notify();
    return newSession;
  }

  deleteSession(sessionId) {
    const idx = this.sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return null;

    const removed = this.sessions[idx];
    this.sessions.splice(idx, 1);
    this.saveSessions();

    // Push command onto undo stack
    this.undoStack.push({
      type: 'DELETE_SESSION',
      session: removed,
      index: idx,
      executeUndo: () => {
        this.sessions.splice(idx, 0, removed);
        this.saveSessions();
        this.notify();
      }
    });

    this.notify();
    return removed;
  }

  clearAllSessions() {
    if (this.sessions.length === 0) return false;
    const backup = [...this.sessions];
    this.sessions = [];
    this.saveSessions();

    this.undoStack.push({
      type: 'CLEAR_ALL',
      sessions: backup,
      executeUndo: () => {
        this.sessions = [...backup];
        this.saveSessions();
        this.notify();
      }
    });

    this.notify();
    return true;
  }

  undo() {
    if (this.undoStack.length === 0) return null;
    const command = this.undoStack.pop();
    if (command && typeof command.executeUndo === 'function') {
      command.executeUndo();
      return command;
    }
    return null;
  }
}

export const statsStore = new StatsStore();
