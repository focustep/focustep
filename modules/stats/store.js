/**
 * Central State Store for Stats & Goals (Focustep)
 * Single source of truth for sessions, subjects, active period, and filters.
 * Features:
 * - Versioned localStorage persistence & migration (removes legacy subject goals)
 * - Pub/Sub subscription pattern (no polling)
 * - Command stack for Undo/Redo (Ctrl+Z / Cmd+Z)
 * - Emits backward-compatible window events: focustep:sessionLogged, focustep:statsUpdated
 */

import { getEffectiveNow } from './time.js';
import { getWeekMonday } from './selectors.js';

const STORAGE_VERSION_KEY = 'focustep_storage_version';
const CURRENT_STORAGE_VERSION = 2;

const SESSIONS_KEY = 'focustep_sessions';
const SUBJECTS_KEY = 'focustep_subjects';
const ACTIVE_PERIOD_KEY = 'focustep_active_period';
const ACTIVE_SUBJECT_FILTER_KEY = 'focustep_stats_subject_filter';
const FIRST_VISIT_KEY = 'focustep_first_visit_time';

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
    this.weekOffset = 0; // 0 = current week, -1 = last week, etc.
    this._isNotifying = false;

    this.init();

    if (typeof window !== 'undefined') {
      window.addEventListener('focustep:sessionLogged', (e) => {
        if (e?.detail?.source === 'statsStore') return;
        this.loadSessions();
        this.notify({ emitEvent: false });
      });
      window.addEventListener('focustep:statsUpdated', (e) => {
        if (e?.detail?.source === 'statsStore') return;
        this.loadState();
        this.notify({ emitEvent: false });
      });
      window.addEventListener('focustep:subjectsUpdated', () => {
        this.loadSubjects();
        this.notify({ emitEvent: false });
      });
      window.addEventListener('storage', (e) => {
        if (e.key === SESSIONS_KEY) {
          this.loadSessions();
          this.notify({ emitEvent: false });
        } else if (e.key === SUBJECTS_KEY) {
          this.loadSubjects();
          this.notify({ emitEvent: false });
        }
      });
    }
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
    this.loadSessions();
    this.loadSubjects();
    this.loadActivePeriod();
    this.loadSubjectFilter();
    this.initFirstVisit();
  }

  initFirstVisit() {
    try {
      if (typeof localStorage === 'undefined') return;
      let raw = localStorage.getItem(FIRST_VISIT_KEY);
      if (!raw) {
        let earliest = Date.now();
        if (this.sessions && this.sessions.length > 0) {
          const minTs = Math.min(...this.sessions.map(s => Number(s.timestamp) || Date.now()));
          if (minTs && !isNaN(minTs)) {
            earliest = Math.min(earliest, minTs);
          }
        }
        localStorage.setItem(FIRST_VISIT_KEY, String(earliest));
      }
    } catch (e) {}
  }

  getFirstVisitTime() {
    let visitTs = null;
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(FIRST_VISIT_KEY);
        if (raw) {
          const parsed = parseInt(raw, 10);
          if (!isNaN(parsed) && parsed > 0) {
            visitTs = parsed;
          }
        }
      }
    } catch (e) {}

    if (this.sessions && this.sessions.length > 0) {
      const minSession = Math.min(...this.sessions.map(s => Number(s.timestamp) || Date.now()));
      if (minSession && !isNaN(minSession)) {
        if (!visitTs || minSession < visitTs) {
          visitTs = minSession;
        }
      }
    }

    if (!visitTs) {
      visitTs = Date.now();
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(FIRST_VISIT_KEY, String(visitTs));
        }
      } catch (e) {}
    }

    return visitTs;
  }

  getMinWeekOffset(now = getEffectiveNow()) {
    const currentMonday = getWeekMonday(now);
    const firstVisitTs = this.getFirstVisitTime();
    const firstVisitMonday = getWeekMonday(new Date(firstVisitTs));

    const diffMs = currentMonday.getTime() - firstVisitMonday.getTime();
    if (diffMs <= 0) {
      return 0;
    }
    const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
    return -Math.max(0, diffWeeks);
  }

  loadSessions() {
    try {
      if (typeof localStorage === 'undefined') {
        this.sessions = [];
        return;
      }
      const rawSessions = localStorage.getItem(SESSIONS_KEY);
      if (rawSessions) {
        this.sessions = JSON.parse(rawSessions) || [];
      } else {
        this.sessions = [];
      }
    } catch (e) {
      this.sessions = [];
    }
  }

  loadSubjects() {
    try {
      if (typeof localStorage === 'undefined') {
        this.subjects = [...DEFAULT_SUBJECTS];
        return;
      }
      const rawSubjects = localStorage.getItem(SUBJECTS_KEY);
      if (rawSubjects) {
        this.subjects = JSON.parse(rawSubjects) || [...DEFAULT_SUBJECTS];
      } else {
        this.subjects = [...DEFAULT_SUBJECTS];
        localStorage.setItem(SUBJECTS_KEY, JSON.stringify(this.subjects));
      }
    } catch (e) {
      this.subjects = [...DEFAULT_SUBJECTS];
    }
  }

  loadActivePeriod() {
    try {
      if (typeof localStorage === 'undefined') return;
      const savedPeriod = localStorage.getItem(ACTIVE_PERIOD_KEY);
      if (savedPeriod && ['week', 'month', 'all'].includes(savedPeriod)) {
        this.activePeriod = savedPeriod;
      }
    } catch (e) {}
  }

  loadSubjectFilter() {
    try {
      if (typeof localStorage === 'undefined') return;
      const savedFilter = localStorage.getItem(ACTIVE_SUBJECT_FILTER_KEY);
      this.subjectFilter = savedFilter || null;
    } catch (e) {}
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

  notify(options = {}) {
    if (this._isNotifying) return;
    this._isNotifying = true;
    try {
      for (const listener of this.subscribers) {
        try {
          listener(this);
        } catch (err) {
          console.error('Subscriber error:', err);
        }
      }
      // Backward compatibility events
      if (typeof window !== 'undefined' && options.emitEvent !== false) {
        window.dispatchEvent(new CustomEvent('focustep:statsUpdated', { detail: { source: 'statsStore' } }));
      }
    } finally {
      this._isNotifying = false;
    }
  }

  // --- Getters ---
  getSessions() {
    if (!this.sessions || this.sessions.length === 0) {
      this.loadSessions();
    }
    return this.sessions;
  }

  getSubjects() {
    if (!this.subjects || this.subjects.length === 0) {
      this.loadSubjects();
    }
    return this.subjects;
  }

  getActivePeriod() {
    return this.activePeriod;
  }

  getSubjectFilter() {
    return this.subjectFilter;
  }

  getWeekOffset() {
    return this.weekOffset || 0;
  }

  // --- Actions ---
  setActivePeriod(period) {
    if (!['week', 'month', 'all'].includes(period)) return;
    this.activePeriod = period;
    if (period === 'week') {
      this.weekOffset = 0;
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ACTIVE_PERIOD_KEY, period);
      }
    } catch (e) {}
    this.notify();
  }

  setWeekOffset(offset) {
    const minOffset = this.getMinWeekOffset();
    const numOffset = Math.max(minOffset, Math.min(0, parseInt(offset, 10) || 0));
    if (this.weekOffset === numOffset && this.activePeriod === 'week') return;
    this.weekOffset = numOffset;
    if (this.activePeriod !== 'week') {
      this.activePeriod = 'week';
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(ACTIVE_PERIOD_KEY, 'week');
        }
      } catch (e) {}
    }
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
