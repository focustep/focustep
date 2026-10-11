/**
 * Developer Console API for Focustep (window.focustepDev)
 * Real schema, store synchronization, and non-destructive seeded tagging.
 */

import { statsStore, DEFAULT_SUBJECTS } from '../stats/store.js';
import { getEffectiveNow, setEffectiveNow, isTimeOverridden } from '../stats/time.js';
import { getWeekMonday, toLocalDateKey } from '../stats/selectors.js';
import { getSubjects, saveSubjects, getSessions, saveSessions } from '../subjects.js';

const BACKUP_STORAGE_KEY = 'focustep_dev_backup';
const AUTO_SESSION_BACKUP_KEY = 'focustep_dev_auto_backup';

const TEST_SUBJECT_PRESETS = [
  { name: 'Computer Science', color: '#38bdf8', icon: 'laptop' },
  { name: 'Philosophy', color: '#a855f7', icon: 'book-open' },
  { name: 'Organic Chemistry', color: '#10b981', icon: 'flask-conical' },
  { name: 'World History', color: '#f59e0b', icon: 'landmark' },
  { name: 'Architecture', color: '#ec4899', icon: 'compass' },
  { name: 'Economics', color: '#06b6d4', icon: 'trending-up' },
  { name: 'Literature', color: '#84cc16', icon: 'feather' },
  { name: 'Neurobiology', color: '#e11d48', icon: 'activity' },
  { name: 'Linear Algebra', color: '#6366f1', icon: 'divide' },
  { name: 'Design Systems', color: '#f97316', icon: 'layout' },
  { name: 'Cognitive Science', color: '#14b8a6', icon: 'cpu' },
  { name: 'Astronomy', color: '#8b5cf6', icon: 'sparkles' },
];

function fireSyncEvents(detail = null) {
  statsStore.loadSessions();
  statsStore.loadSubjects();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('focustep:sessionLogged', { detail }));
    window.dispatchEvent(new CustomEvent('focustep:statsUpdated'));
    window.dispatchEvent(new CustomEvent('focustep:subjectsUpdated'));
  }
  statsStore.notify();
}

function resolveDate(dateOrOffset) {
  const baseNow = getEffectiveNow();
  if (typeof dateOrOffset === 'number') {
    const d = new Date(baseNow.getFullYear(), baseNow.getMonth(), baseNow.getDate() + dateOrOffset, 12, 0, 0);
    return d;
  }
  if (typeof dateOrOffset === 'string') {
    if (dateOrOffset.includes('-') && dateOrOffset.length === 10) {
      const [y, m, d] = dateOrOffset.split('-').map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }
    const parsed = new Date(dateOrOffset);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (dateOrOffset instanceof Date) return dateOrOffset;
  return baseNow;
}

export const focustepDev = {
  /**
   * Set total focus time for a single day.
   * dateOrOffset: "2026-10-06" or number (0 = today, -1 = yesterday)
   * minutesOrMap: 140 or { web: 60, trade: 45, accounting: 35 }
   * opts: { startHour?: number }
   */
  setDay(dateOrOffset, minutesOrMap, opts = {}) {
    const targetDate = resolveDate(dateOrOffset);
    const dateKey = toLocalDateKey(targetDate);
    const existingSessions = getSessions();

    // 1. Remove previous seeded sessions of that day (keep real user sessions)
    const filteredSessions = existingSessions.filter(s => {
      if (!s.seeded) return true;
      const sDateKey = toLocalDateKey(new Date(s.timestamp));
      return sDateKey !== dateKey;
    });
    const removedCount = existingSessions.length - filteredSessions.length;

    // 2. Resolve subjects and minutes map
    const subjects = statsStore.getSubjects();
    const subjectMap = new Map();
    subjects.forEach(s => subjectMap.set(s.id, s));

    let subjectMinutesMap = {};
    if (typeof minutesOrMap === 'number') {
      const totalMin = Math.max(0, Math.round(minutesOrMap));
      if (totalMin > 0) {
        const validSubjects = subjects.filter(s => s.id !== 'none');
        const count = Math.min(validSubjects.length, Math.max(1, totalMin > 90 ? 3 : 2));
        const chosen = validSubjects.slice(0, count);
        
        let remaining = totalMin;
        chosen.forEach((subj, idx) => {
          if (idx === chosen.length - 1) {
            subjectMinutesMap[subj.id] = remaining;
          } else {
            // Allocate realistic proportional slice
            const share = Math.round(totalMin / chosen.length);
            subjectMinutesMap[subj.id] = share;
            remaining -= share;
          }
        });
      }
    } else if (minutesOrMap && typeof minutesOrMap === 'object') {
      subjectMinutesMap = { ...minutesOrMap };
    }

    // 3. Generate 1-3 realistic sessions per subject
    const newSessions = [];
    let currentStartHour = typeof opts.startHour === 'number' ? opts.startHour : 9;
    let currentMinuteOffset = 15;

    for (const [subjId, mins] of Object.entries(subjectMinutesMap)) {
      const totalMinutes = Math.max(0, Math.round(Number(mins) || 0));
      if (totalMinutes <= 0) continue;

      let subj = subjectMap.get(subjId);
      if (!subj) {
        // If subject doesn't exist, use or create fallback
        subj = { id: subjId, name: subjId.charAt(0).toUpperCase() + subjId.slice(1), color: '#4ec9b0' };
      }

      // Split into 1 to 3 session chunks that sum EXACTLY to totalMinutes
      const chunks = [];
      if (totalMinutes <= 35) {
        chunks.push(totalMinutes);
      } else if (totalMinutes <= 80) {
        const c1 = Math.round(totalMinutes * 0.55);
        chunks.push(c1, totalMinutes - c1);
      } else {
        const c1 = Math.round(totalMinutes * 0.45);
        const c2 = Math.round(totalMinutes * 0.35);
        chunks.push(c1, c2, totalMinutes - c1 - c2);
      }

      chunks.forEach((chunkMinutes) => {
        if (chunkMinutes <= 0) return;
        const sessionDate = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate(),
          currentStartHour,
          currentMinuteOffset,
          0
        );

        const durationSec = chunkMinutes * 60;
        newSessions.push({
          id: `s_dev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: sessionDate.getTime(),
          durationSec,
          subjectId: subj.id,
          subjectName: subj.name,
          seeded: true
        });

        // Advance start time realistically for next session (+ duration + 15 min break)
        const totalMinutesAdvance = chunkMinutes + 15;
        currentMinuteOffset += totalMinutesAdvance;
        while (currentMinuteOffset >= 60) {
          currentStartHour += 1;
          currentMinuteOffset -= 60;
        }
      });
    }

    const merged = [...newSessions, ...filteredSessions].sort((a, b) => b.timestamp - a.timestamp);
    saveSessions(merged);
    fireSyncEvents();

    const totalMinutesAdded = newSessions.reduce((acc, s) => acc + s.durationSec / 60, 0);
    console.log(
      `[focustepDev] setDay(${dateKey}): Added ${newSessions.length} seeded sessions (${totalMinutesAdded}m) across ${Object.keys(subjectMinutesMap).length} subjects. Removed ${removedCount} previous seeded sessions.`
    );

    return { dateKey, added: newSessions, removedCount };
  },

  /**
   * Seed a full week (Mon..Sun).
   * presetOrArray: 7 numbers in minutes or "empty" | "normal" | "heavy" | "midnight" | "peak2123"
   * weekOffset: 0 = current week, -1 = last week
   */
  seedWeek(presetOrArray, weekOffset = 0) {
    const baseNow = getEffectiveNow();
    const thisWeekMonday = getWeekMonday(baseNow);
    const targetMonday = new Date(
      thisWeekMonday.getFullYear(),
      thisWeekMonday.getMonth(),
      thisWeekMonday.getDate() + (weekOffset * 7),
      0, 0, 0, 0
    );

    let dayMinutes = [0, 0, 0, 0, 0, 0, 0];
    let isMidnightPreset = false;
    let isPeakPreset = false;

    if (Array.isArray(presetOrArray) && presetOrArray.length === 7) {
      dayMinutes = presetOrArray.map(n => Math.max(0, Math.round(Number(n) || 0)));
    } else if (typeof presetOrArray === 'string') {
      switch (presetOrArray) {
        case 'empty':
          dayMinutes = [0, 0, 0, 0, 0, 0, 0];
          break;
        case 'normal':
          dayMinutes = [90, 120, 60, 105, 80, 45, 0];
          break;
        case 'heavy':
          dayMinutes = [180, 320, 240, 310, 200, 150, 60]; // 5+ hours on Tue (320m) and Thu (310m)
          break;
        case 'midnight':
          dayMinutes = [60, 90, 60, 90, 60, 30, 45];
          isMidnightPreset = true;
          break;
        case 'peak2123':
          dayMinutes = [80, 110, 90, 120, 90, 60, 0];
          isPeakPreset = true;
          break;
        default:
          dayMinutes = [90, 120, 60, 105, 80, 45, 0];
      }
    }

    // Process each day of target week
    let totalAdded = 0;
    const subjects = statsStore.getSubjects();

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(targetMonday.getFullYear(), targetMonday.getMonth(), targetMonday.getDate() + i, 12, 0, 0);
      const mins = dayMinutes[i];

      const opts = {};
      if (isPeakPreset) {
        opts.startHour = 21; // 21:00 to 23:00 peak
      }

      this.setDay(dayDate, mins, opts);
      totalAdded += mins;
    }

    // Special case for midnight preset: add a session 23:50 -> 00:20 (crossing Sat into Sun)
    if (isMidnightPreset) {
      const satDate = new Date(targetMonday.getFullYear(), targetMonday.getMonth(), targetMonday.getDate() + 5, 23, 50, 0);
      const sub = subjects[0] || { id: 'math', name: 'Math' };
      const midnightSession = {
        id: `s_dev_midnight_${Date.now()}`,
        timestamp: satDate.getTime(),
        durationSec: 30 * 60, // 30 minutes (10m on Sat, 20m on Sun)
        subjectId: sub.id,
        subjectName: sub.name,
        seeded: true
      };
      const curSessions = getSessions();
      curSessions.unshift(midnightSession);
      saveSessions(curSessions);
      fireSyncEvents();
      console.log('[focustepDev] Added crossing-midnight session on Saturday: 23:50 -> 00:20');
    }

    console.log(
      `[focustepDev] seedWeek(preset="${typeof presetOrArray === 'string' ? presetOrArray : 'custom'}", offset=${weekOffset}): Populated week of ${toLocalDateKey(targetMonday)} with total ${totalAdded}m.`
    );
  },

  /**
   * Temporarily generate n test subjects with colors and icons.
   * Removable via removeSeededSubjects() or clear().
   */
  seedSubjects(n) {
    const targetCount = Math.max(1, Math.min(20, Math.round(Number(n) || 3)));
    const curSubjects = getSubjects();
    
    // Keep existing non-seeded subjects
    const baseSubjects = curSubjects.filter(s => !s.seeded);

    const generated = [];
    for (let i = 0; i < targetCount; i++) {
      const preset = TEST_SUBJECT_PRESETS[i % TEST_SUBJECT_PRESETS.length];
      const id = `test_subj_${i + 1}_${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      generated.push({
        id,
        name: `${preset.name} ${i >= TEST_SUBJECT_PRESETS.length ? i + 1 : ''}`.trim(),
        color: preset.color,
        icon: preset.icon,
        seeded: true
      });
    }

    const merged = [...baseSubjects, ...generated];
    saveSubjects(merged);
    fireSyncEvents();

    console.log(
      `[focustepDev] seedSubjects(${targetCount}): Added ${generated.length} test subjects. Total subjects now: ${merged.length}.`
    );
    return merged;
  },

  /**
   * Remove test seeded subjects only, restoring real subjects.
   */
  removeSeededSubjects() {
    const curSubjects = getSubjects();
    const kept = curSubjects.filter(s => !s.seeded);
    const removedCount = curSubjects.length - kept.length;
    
    // Ensure at least default subjects remain
    const finalSubjects = kept.length > 0 ? kept : [...DEFAULT_SUBJECTS];
    saveSubjects(finalSubjects);
    fireSyncEvents();

    console.log(`[focustepDev] removeSeededSubjects(): Removed ${removedCount} test subjects. Kept ${finalSubjects.length} subjects.`);
    return finalSubjects;
  },

  /**
   * Add a single session with schema validation.
   */
  addSession({ subjectId, start, minutes }) {
    const subjects = statsStore.getSubjects();
    let subj = subjects.find(s => s.id === subjectId) || subjects[0] || { id: 'other', name: 'Other' };
    
    let ts = Date.now();
    if (start instanceof Date) ts = start.getTime();
    else if (typeof start === 'number') ts = start;
    else if (typeof start === 'string') {
      const p = new Date(start);
      if (!isNaN(p.getTime())) ts = p.getTime();
    }

    const durationSec = Math.max(1, Math.round((Number(minutes) || 25) * 60));

    const newSession = {
      id: `s_dev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: ts,
      durationSec,
      subjectId: subj.id,
      subjectName: subj.name,
      seeded: true
    };

    const sessions = getSessions();
    sessions.unshift(newSession);
    saveSessions(sessions);
    fireSyncEvents(newSession);

    console.log(
      `[focustepDev] addSession: Added session for "${subj.name}" (${Math.round(durationSec / 60)}m) at ${new Date(ts).toLocaleString()}`
    );
    return newSession;
  },

  /**
   * Clear seeded or all data.
   */
  clear({ seededOnly = true } = {}) {
    if (seededOnly) {
      const sessions = getSessions();
      const realSessions = sessions.filter(s => !s.seeded);
      const removedSessions = sessions.length - realSessions.length;
      saveSessions(realSessions);

      const subjects = getSubjects();
      const realSubjects = subjects.filter(s => !s.seeded);
      const finalSubjects = realSubjects.length > 0 ? realSubjects : [...DEFAULT_SUBJECTS];
      saveSubjects(finalSubjects);

      fireSyncEvents();
      console.log(`[focustepDev] clear({ seededOnly: true }): Removed ${removedSessions} seeded sessions and cleaned test subjects. Real data untouched.`);
      return { removedSessions };
    } else {
      if (typeof window !== 'undefined') {
        const confirmed = window.confirm('⚠️ Reset all Focustep data? This will clear ALL sessions and reset subjects.');
        if (!confirmed) {
          console.log('[focustepDev] clear({ seededOnly: false }): Cancelled by user.');
          return false;
        }
      }

      saveSessions([]);
      saveSubjects([...DEFAULT_SUBJECTS]);
      try { localStorage.removeItem('focustep_first_visit_time'); } catch(e){}
      fireSyncEvents();
      console.log('[focustepDev] clear({ seededOnly: false }): Wiped all sessions and reset subjects.');
      return true;
    }
  },

  /**
   * Snapshot current localStorage state to backup slot.
   */
  backup(label = 'manual') {
    try {
      const snapshot = {
        sessions: getSessions(),
        subjects: getSubjects(),
        timestamp: Date.now(),
        dateStr: new Date().toLocaleString(),
        label
      };
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(snapshot));
      console.log(`[focustepDev] backup(): Saved backup "${label}" with ${snapshot.sessions.length} sessions and ${snapshot.subjects.length} subjects.`);
      return snapshot;
    } catch (e) {
      console.error('[focustepDev] backup() failed:', e);
      return null;
    }
  },

  /**
   * Restore localStorage state from backup slot.
   */
  restore() {
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (!raw) {
        console.warn('[focustepDev] restore(): No backup found in storage.');
        return false;
      }
      const snapshot = JSON.parse(raw);
      if (snapshot.sessions) saveSessions(snapshot.sessions);
      if (snapshot.subjects) saveSubjects(snapshot.subjects);
      fireSyncEvents();
      console.log(`[focustepDev] restore(): Restored backup from ${snapshot.dateStr || new Date(snapshot.timestamp).toLocaleString()} (${snapshot.sessions?.length || 0} sessions).`);
      return true;
    } catch (e) {
      console.error('[focustepDev] restore() failed:', e);
      return false;
    }
  },

  /**
   * Get backup metadata without restoring.
   */
  getBackupInfo() {
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Auto backup on first session launch.
   */
  ensureSessionBackup() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const alreadyBackedUp = sessionStorage.getItem(AUTO_SESSION_BACKUP_KEY);
        if (!alreadyBackedUp) {
          this.backup('auto-session-start');
          sessionStorage.setItem(AUTO_SESSION_BACKUP_KEY, 'true');
        }
      }
    } catch (e) {}
  },

  /**
   * Override "now" date used by selectors and date logic.
   * Pass null to reset to system live time.
   */
  setNow(dateStringOrNull) {
    setEffectiveNow(dateStringOrNull);
    const effective = getEffectiveNow();
    fireSyncEvents();
    if (dateStringOrNull) {
      console.log(`[focustepDev] setNow("${dateStringOrNull}"): Effective "now" is overridden to: ${effective.toLocaleString()} (Day: ${effective.toLocaleDateString('en-US', { weekday: 'long' })})`);
    } else {
      console.log(`[focustepDev] setNow(null): Reset to live system clock: ${effective.toLocaleString()}`);
    }
    return effective;
  },

  getEffectiveNow() {
    return getEffectiveNow();
  },

  isTimeOverridden() {
    return isTimeOverridden();
  }
};
