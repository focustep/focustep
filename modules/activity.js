import { getRecentActivitySessions, clearAllSessions, deleteSession, undoLastSessionDelete } from './subjects.js';

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
  const now = new Date();
  
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
    return `Today, ${timeStr}`;
  } else if (sessionDay.getTime() === yesterday.getTime()) {
    return `Yesterday, ${timeStr}`;
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${timeStr}`;
  }
}

function showToast(msg) {
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
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
  }, 2200);
}

export function renderActivityFeed() {
  const container = document.getElementById('stats-activity-list');
  const clearBtn = document.getElementById('stats-activity-clear-btn');
  if (!container) return;

  const sessions = getRecentActivitySessions();
  container.innerHTML = '';

  if (clearBtn) {
    clearBtn.style.display = sessions.length > 0 ? 'flex' : 'none';
  }

  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="stats-activity-empty">
        <span class="stats-activity-empty-text">No activities yet, let's start!</span>
        <button type="button" class="stats-activity-start-btn" id="stats-activity-start-btn" title="Go to Timer" aria-label="Go to Timer" data-tooltip="Go to Timer">
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
    return;
  }

  sessions.forEach(session => {
    const item = document.createElement('div');
    item.className = 'stats-activity-item';
    const durStr = formatSessionDuration(session.durationSec || 0);
    item.setAttribute('data-tooltip', `${session.subjectName || 'Study'} session: ${durStr}`);
    item.innerHTML = `
      <div class="stats-activity-main">
        <div class="stats-activity-subject">${session.subjectName || 'Study'}</div>
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
        deleteSession(session.id);
        renderActivityFeed();
        showToast('Activity deleted (Ctrl+Z to undo)');
      });
    }

    container.appendChild(item);
  });
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
      const restored = undoLastSessionDelete();
      if (restored) {
        e.preventDefault();
        e.stopPropagation();
        renderActivityFeed();
        showToast(restored === 'all' ? 'All activities restored' : 'Activity restored');
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('keydown', handleKeyDown, true);
}

// Attach listener immediately
attachUndoListener();

export function initActivityFeed() {
  renderActivityFeed();
  attachUndoListener();

  if (typeof window !== 'undefined') {
    window.addEventListener('focustep:sessionLogged', () => {
      renderActivityFeed();
    });
  }

  const clearBtn = document.getElementById('stats-activity-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearAllSessions();
      renderActivityFeed();
      showToast('All activities cleared (Ctrl+Z to undo)');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('focustep:statsUpdated'));
      }
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
