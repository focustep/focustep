import { getRecentActivitySessions, undoLastSubjectDelete, getSubjectName } from './subjects.js';
import { renderTimerSubjectBadge, renderTimerSubjectDropdown, updateDropdownPosition } from './timer-subject-badge.js';
import { renderStats } from './stats.js';
import { statsStore } from './stats/store.js';
import { getEffectiveNow } from './stats/time.js';
import { tr, onLanguageChange } from './i18n.js';

const ACTIVITY_CLEARED_AT_KEY = 'focustep_activity_cleared_at';
const ACTIVITY_HIDDEN_IDS_KEY = 'focustep_activity_hidden_ids';
const ACTIVITY_UNDO_STACK_KEY = 'focustep_activity_undo_stack';

function getActivityClearedAt() {
  try {
    const raw = localStorage.getItem(ACTIVITY_CLEARED_AT_KEY);
    if (raw) {
      const val = parseInt(raw, 10);
      if (!isNaN(val)) return val;
    }
  } catch (e) {}
  return 0;
}

function setActivityClearedAt(ts) {
  try {
    if (ts && ts > 0) {
      localStorage.setItem(ACTIVITY_CLEARED_AT_KEY, String(ts));
    } else {
      localStorage.removeItem(ACTIVITY_CLEARED_AT_KEY);
    }
  } catch (e) {}
}

function getActivityHiddenIds() {
  try {
    const raw = localStorage.getItem(ACTIVITY_HIDDEN_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set();
}

function saveActivityHiddenIds(idsSet) {
  try {
    localStorage.setItem(ACTIVITY_HIDDEN_IDS_KEY, JSON.stringify([...idsSet]));
  } catch (e) {}
}

function getActivityUndoStack() {
  try {
    const raw = localStorage.getItem(ACTIVITY_UNDO_STACK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function saveActivityUndoStack(stack) {
  try {
    localStorage.setItem(ACTIVITY_UNDO_STACK_KEY, JSON.stringify(stack));
  } catch (e) {}
}

export function getVisibleActivitySessions() {
  const allRecent = getRecentActivitySessions();
  const clearedAt = getActivityClearedAt();
  const hiddenIds = getActivityHiddenIds();

  return allRecent.filter(s => {
    if (!s || !s.id) return false;
    if (hiddenIds.has(s.id)) return false;
    if (clearedAt && s.timestamp <= clearedAt) return false;
    return true;
  });
}

function formatSessionDuration(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0 && m > 0) {
    return `${h}h ${m}m`;
  } else if (h > 0) {
    return `${h}h`;
  } else if (m > 0) {
    return `${m}m`;
  } else {
    return `${s}s`;
  }
}

function formatSessionTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = getEffectiveNow();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const sessionDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Format time (e.g. 2:10 PM)
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const timeStr = `${hours}:${minutes} ${ampm}`;

  if (sessionDay.getTime() === today.getTime()) {
    const todayLabel = tr().todayWord || 'Today';
    return `${todayLabel}, ${timeStr}`;
  } else if (sessionDay.getTime() === yesterday.getTime()) {
    const yesterdayLabel = tr().yesterdayWord || 'Yesterday';
    return `${yesterdayLabel}, ${timeStr}`;
  } else {
    const locale = tr().localeCode || 'en-US';
    const dayMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    return `${dayMonth}, ${timeStr}`;
  }
}

export function showToast(msg, canUndo = false) {
  if (typeof document === 'undefined') return;
  let toast = document.getElementById('activity-toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'activity-toast-notification';
    toast.style.cssText = `
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: #1e293b;
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 10px 18px;
      border-radius: 20px;
      font-size: 13.5px;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      z-index: 999999;
      opacity: 0;
      pointer-events: auto;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  if (canUndo) {
    toast.style.cursor = 'pointer';
    toast.onclick = (e) => {
      e.stopPropagation();
      undoLastActivityAction();
    };
  } else {
    toast.style.cursor = 'default';
    toast.onclick = null;
  }

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
  }, 2400);
}

export function undoLastActivityAction() {
  const stack = getActivityUndoStack();
  if (stack.length === 0) return false;

  const lastAction = stack.pop();
  saveActivityUndoStack(stack);

  if (lastAction) {
    setActivityClearedAt(lastAction.clearedAt || 0);
    saveActivityHiddenIds(new Set(lastAction.hiddenIds || []));
    renderActivityFeed();
    const msg = lastAction.type === 'all'
      ? (tr().allActivitiesRestored || 'All activities restored')
      : (tr().activityRestored || 'Activity restored');
    showToast(msg, false);
    return true;
  }
  return false;
}

export function updateActivityCardHeight() {
  if (typeof document === 'undefined') return;
  const activityCard = document.querySelector('.stats-activity-card');
  const thisWeekCard = document.getElementById('stats-this-week-card');
  if (!activityCard || !thisWeekCard) return;

  // Mobile stacked layout: reset inline height
  if (window.innerWidth <= 960) {
    activityCard.style.height = '';
    return;
  }

  const statsSubview = document.getElementById('stats-subview');
  if (statsSubview && statsSubview.style.display === 'none') {
    return;
  }

  const activityRect = activityCard.getBoundingClientRect();
  const weekRect = thisWeekCard.getBoundingClientRect();

  if (activityRect.top > 0 && weekRect.bottom > activityRect.top) {
    const targetHeight = weekRect.bottom - activityRect.top;
    activityCard.style.height = `${Math.round(targetHeight)}px`;
  }
}

let heightObserver = null;

function setupHeightObserver() {
  if (typeof window === 'undefined') return;
  if (heightObserver) {
    heightObserver.disconnect();
    heightObserver = null;
  }

  const thisWeekCard = document.getElementById('stats-this-week-card');
  const mainCard = document.querySelector('.stats-main-card');
  const statsSubview = document.getElementById('stats-subview');

  if (window.ResizeObserver) {
    heightObserver = new ResizeObserver(() => {
      updateActivityCardHeight();
    });

    if (thisWeekCard) heightObserver.observe(thisWeekCard);
    if (mainCard) heightObserver.observe(mainCard);
    if (statsSubview) heightObserver.observe(statsSubview);
  }

  window.addEventListener('resize', updateActivityCardHeight, { passive: true });
}

export function renderActivityFeed() {
  const container = document.getElementById('stats-activity-list');
  const clearBtn = document.getElementById('stats-activity-clear-btn');
  const fullHistoryBtn = document.getElementById('stats-activity-full-history-btn');
  if (!container) return;

  let sessions = getVisibleActivitySessions();
  const filterId = statsStore.getSubjectFilter();
  if (filterId) {
    sessions = sessions.filter(s => s.subjectId === filterId);
  }
  container.innerHTML = '';

  if (clearBtn) {
    clearBtn.style.display = sessions.length > 0 ? 'flex' : 'none';
  }
  if (fullHistoryBtn) {
    fullHistoryBtn.style.display = 'flex';
  }

  if (sessions.length === 0) {
    const emptyTitle = tr().activityEmptyTitle || "No activities yet, let's start!";
    const goToTimerText = tr().activityGoToTimer || "Go to Timer";

    container.innerHTML = `
      <div class="stats-activity-empty">
        <span class="stats-activity-empty-text">${emptyTitle}</span>
        <button type="button" class="stats-activity-start-btn" id="stats-activity-start-btn" aria-label="${goToTimerText}" data-tooltip="${goToTimerText}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    `;

    const startBtn = container.querySelector('#stats-activity-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const logoBtn = document.getElementById('header-logo-btn');
        if (logoBtn) {
          logoBtn.click();
        } else {
          const statsClose = document.getElementById('stats-subview-close');
          if (statsClose) statsClose.click();
        }
      });
    }

    updateActivityCardHeight();
    return;
  }

  sessions.forEach(session => {
    const item = document.createElement('div');
    item.className = 'stats-activity-item';
    const durStr = formatSessionDuration(session.durationSec || 0);
    const subjectName = session.subjectName || tr().studyFallback || 'Study';
    const sessionW = tr().sessionWord || 'session';
    const tooltipText = `${subjectName} ${sessionW}: ${durStr}`;
    item.setAttribute('data-tooltip', tooltipText);
    item.innerHTML = `
      <div class="stats-activity-main">
        <div class="stats-activity-subject">${subjectName}</div>
        <div class="stats-activity-time">${formatSessionTimestamp(session.timestamp)}</div>
      </div>
      <div class="stats-activity-right">
        <div class="stats-activity-dur">${durStr}</div>
        <button type="button" class="stats-activity-delete-btn" data-id="${session.id}" aria-label="Delete session" data-tooltip="Delete item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;

    const delBtn = item.querySelector('.stats-activity-delete-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // View-level delete: hide this item from Activity feed only
        const stack = getActivityUndoStack();
        stack.push({
          type: 'single',
          sessionId: session.id,
          clearedAt: getActivityClearedAt(),
          hiddenIds: [...getActivityHiddenIds()]
        });
        saveActivityUndoStack(stack);

        const hiddenIds = getActivityHiddenIds();
        hiddenIds.add(session.id);
        saveActivityHiddenIds(hiddenIds);

        renderActivityFeed();
        showToast(tr().activityDeleted || 'Activity deleted (Ctrl+Z)', true);
      });
    }

    container.appendChild(item);
  });

  updateActivityCardHeight();
}

let undoListenerAttached = false;

function attachUndoListener() {
  if (undoListenerAttached || typeof window === 'undefined') return;
  undoListenerAttached = true;

  const handleKeyDown = (e) => {
    const isCmdOrCtrl = e.ctrlKey || e.metaKey;
    const isZKey = e.code === 'KeyZ' || e.keyCode === 90 || e.key === 'z' || e.key === 'Z' || e.key === 'я' || e.key === 'Я';

    if (isCmdOrCtrl && isZKey && !e.shiftKey) {
      const active = document.activeElement;
      if (active) {
        const tag = active.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || active.isContentEditable) {
          return; // Allow standard input undo
        }
      }
      // Check for subject restoration first
      const restoredSubj = undoLastSubjectDelete();
      if (restoredSubj) {
        e.preventDefault();
        e.stopPropagation();
        renderTimerSubjectBadge();
        renderStats();
        renderTimerSubjectDropdown();
        updateDropdownPosition();
        const subjName = getSubjectName(restoredSubj);
        const msg = typeof tr().subjectRestored === 'function' ? tr().subjectRestored(subjName) : `${subjName} restored`;
        showToast(msg, false);
        return;
      }

      // Check for Activity view undo
      const restoredActivity = undoLastActivityAction();
      if (restoredActivity) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('keydown', handleKeyDown, true);
}

// Attach listener immediately
attachUndoListener();

let activitySubscribed = false;

export function initActivityFeed() {
  renderActivityFeed();
  attachUndoListener();
  setupHeightObserver();

  if (!activitySubscribed) {
    activitySubscribed = true;
    onLanguageChange(() => {
      renderActivityFeed();
    });
  }

  statsStore.subscribe(() => {
    renderActivityFeed();
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('focustep:sessionLogged', () => {
      renderActivityFeed();
    });
  }

  const clearBtn = document.getElementById('stats-activity-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const visible = getVisibleActivitySessions();
      if (visible.length === 0) return;

      const stack = getActivityUndoStack();
      stack.push({
        type: 'all',
        clearedAt: getActivityClearedAt(),
        hiddenIds: [...getActivityHiddenIds()]
      });
      saveActivityUndoStack(stack);

      // View-level clear: set marker to timestamp of current latest visible session
      const now = Date.now();
      const latestTs = visible.reduce((max, s) => Math.max(max, s.timestamp || 0), now);
      setActivityClearedAt(Math.max(now, latestTs));

      renderActivityFeed();
      showToast(tr().allActivitiesCleared || 'All activities cleared (Ctrl+Z)', true);
    });
  }

  const fullHistoryBtn = document.getElementById('stats-activity-full-history-btn');
  if (fullHistoryBtn) {
    fullHistoryBtn.addEventListener('click', () => {
      const calNavBtn = document.getElementById('nav-calendar-btn');
      if (calNavBtn) {
        calNavBtn.click();
      }
    });
  }
}
