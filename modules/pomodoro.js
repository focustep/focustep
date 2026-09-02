import { tr } from './i18n.js';
import { fmtMS } from './helpers.js';
import { getCurrentFocusMode } from './timer.js';

export const DEFAULT_WORK_LEN = 25 * 60;
export const DEFAULT_SHORT_BREAK_LEN = 5 * 60;
export const DEFAULT_LONG_BREAK_LEN = 15 * 60;

export const WORK_LEN = DEFAULT_WORK_LEN;
export const BREAK_LEN = DEFAULT_SHORT_BREAK_LEN;

let pomodoroEnabled = false;
try { pomodoroEnabled = localStorage.getItem('pomodoro_enabled') === '1'; } catch(e){}

let autoStartBlocks = true;
try { autoStartBlocks = localStorage.getItem('pomo_autostart') !== '0'; } catch(e){}

let customWorkLen = DEFAULT_WORK_LEN;
let customShortBreakLen = DEFAULT_SHORT_BREAK_LEN;
let customLongBreakLen = DEFAULT_LONG_BREAK_LEN;

try {
  const w = localStorage.getItem('pomo_len_work');
  if (w) customWorkLen = Math.max(60, parseInt(w, 10) || DEFAULT_WORK_LEN);
  const sb = localStorage.getItem('pomo_len_short_break');
  if (sb) customShortBreakLen = Math.max(60, parseInt(sb, 10) || DEFAULT_SHORT_BREAK_LEN);
  const lb = localStorage.getItem('pomo_len_long_break');
  if (lb) customLongBreakLen = Math.max(60, parseInt(lb, 10) || DEFAULT_LONG_BREAK_LEN);
} catch(e){}

let phase = 'work'; // 'work' | 'short_break' | 'long_break' (or 'break')
let phaseRemaining = customWorkLen;
let completedWorkSessions = 0;

export function getPomodoroState() {
  return {
    enabled: pomodoroEnabled,
    phase,
    phaseRemaining,
    autoStartBlocks,
    completedWorkSessions
  };
}

export function setAutoStartBlocks(val) {
  autoStartBlocks = !!val;
  try { localStorage.setItem('pomo_autostart', autoStartBlocks ? '1' : '0'); } catch(e){}
}

export function setPomodoroEnabled(val) {
  pomodoroEnabled = !!val;
  try { localStorage.setItem('pomodoro_enabled', pomodoroEnabled ? '1' : '0'); } catch(e){}
}

export function getPhaseDuration(p) {
  const isUltra = (getCurrentFocusMode() === 'ultradian');
  if (p === 'short_break' || p === 'break') return isUltra ? (20 * 60) : customShortBreakLen;
  if (p === 'long_break') return isUltra ? (20 * 60) : customLongBreakLen;
  return isUltra ? (90 * 60) : customWorkLen;
}

export function setPhaseDuration(p, sec) {
  sec = Math.max(60, parseInt(sec, 10) || 60);
  if (p === 'short_break' || p === 'break') {
    customShortBreakLen = sec;
    try { localStorage.setItem('pomo_len_short_break', String(sec)); } catch(e){}
  } else if (p === 'long_break') {
    customLongBreakLen = sec;
    try { localStorage.setItem('pomo_len_long_break', String(sec)); } catch(e){}
  } else {
    customWorkLen = sec;
    try { localStorage.setItem('pomo_len_work', String(sec)); } catch(e){}
  }
}

export function resetPhaseDuration(p) {
  if (p === 'short_break' || p === 'break') {
    customShortBreakLen = DEFAULT_SHORT_BREAK_LEN;
    try { localStorage.removeItem('pomo_len_short_break'); } catch(e){}
    return DEFAULT_SHORT_BREAK_LEN;
  } else if (p === 'long_break') {
    customLongBreakLen = DEFAULT_LONG_BREAK_LEN;
    try { localStorage.removeItem('pomo_len_long_break'); } catch(e){}
    return DEFAULT_LONG_BREAK_LEN;
  } else {
    customWorkLen = DEFAULT_WORK_LEN;
    try { localStorage.removeItem('pomo_len_work'); } catch(e){}
    return DEFAULT_WORK_LEN;
  }
}

export function setPomodoroPhase(newPhase, newRemaining) {
  phase = newPhase;
  phaseRemaining = newRemaining !== undefined ? newRemaining : getPhaseDuration(newPhase);
}

export function incrementCompletedSessions() {
  completedWorkSessions += 1;
}

export function getNextBreakType() {
  // Every 4th work session gives a long break
  if (completedWorkSessions > 0 && completedWorkSessions % 4 === 0) {
    return 'long_break';
  }
  return 'short_break';
}

export function updatePomodoroUI(isRunning = false) {
  const pomodoroToggle = document.getElementById('pomodoro-toggle');
  const phaseBadge = document.getElementById('phase-badge');
  const pomodoroDetail = document.getElementById('pomodoro-detail');
  const pomodoroPhaseN = document.getElementById('pomodoro-phase-n');
  const pomodoroTimeN = document.getElementById('pomodoro-time-n');
  const ringWrap = document.getElementById('ring-wrap');
  const focusView = document.getElementById('focus-mode-view');

  const isShortBreak = (phase === 'short_break' || phase === 'break');
  const isLongBreak = (phase === 'long_break');

  // Auto start checkbox UI in Focus mode
  const autoCheckbox = document.getElementById('focus-autostart-checkbox');
  if (autoCheckbox) {
    autoCheckbox.checked = autoStartBlocks;
  }

  const autoUltraCheckbox = document.getElementById('focus-ultradian-autostart-checkbox');
  if (autoUltraCheckbox) {
    autoUltraCheckbox.checked = autoStartBlocks;
  }

  // Auto start legacy toggle button if present
  const autoToggle = document.getElementById('focus-autostart-toggle');
  if (autoToggle) {
    autoToggle.classList.toggle('on', autoStartBlocks);
    autoToggle.setAttribute('aria-checked', String(autoStartBlocks));
  }

  if (pomodoroToggle) {
    pomodoroToggle.classList.toggle('on', pomodoroEnabled);
    pomodoroToggle.setAttribute('aria-checked', String(pomodoroEnabled));
  }
  if (pomodoroDetail) pomodoroDetail.classList.toggle('open', pomodoroEnabled);
  if (ringWrap) {
    ringWrap.classList.toggle('phase-break', pomodoroEnabled && (isShortBreak || isLongBreak));
  }

  // Update theme colors on body and focus view:
  // Short Break -> Green (#118F3B)
  // Long Break  -> Blue  (#2B45C7)
  // Focus Time  -> Standard
  const curFocusMode = (getCurrentFocusMode() || (pomodoroEnabled ? 'pomodoro' : 'timer'));
  const isPomoOrUltra = (pomodoroEnabled || curFocusMode === 'ultradian');

  if (isPomoOrUltra && isShortBreak) {
    document.body.classList.add('phase-break');
    document.body.classList.remove('phase-long-break');
    if (focusView) {
      focusView.classList.add('phase-break');
      focusView.classList.remove('phase-long-break');
    }
  } else if (isPomoOrUltra && isLongBreak) {
    document.body.classList.remove('phase-break');
    document.body.classList.add('phase-long-break');
    if (focusView) {
      focusView.classList.remove('phase-break');
      focusView.classList.add('phase-long-break');
    }
  } else {
    document.body.classList.remove('phase-break');
    document.body.classList.remove('phase-long-break');
    if (focusView) {
      focusView.classList.remove('phase-break');
      focusView.classList.remove('phase-long-break');
    }
  }

  // Update Top Session Status Indicator & Session Badge in Focus Mode
  const sessionHeaderRow = document.getElementById('focus-session-header-row');
  const sessionInfoBadge = document.getElementById('focus-session-info-badge');
  const sessionNum = document.getElementById('focus-session-num');
  const sessionText = document.getElementById('focus-session-status-text');
  const sessionDot = document.getElementById('focus-session-status-dot');

  if (sessionHeaderRow) {
    sessionHeaderRow.classList.toggle('is-visible', !!isRunning);
  }

  // Session badge is ONLY shown in pomodoro and ultradian modes
  const curMode = curFocusMode;
  if (sessionInfoBadge) {
    if (curMode === 'pomodoro' || curMode === 'ultradian') {
      sessionInfoBadge.style.display = 'inline-flex';
      if (sessionNum) {
        sessionNum.textContent = String(completedWorkSessions + 1);
      }
    } else {
      sessionInfoBadge.style.display = 'none';
    }
  }

  let currentPhaseLabel = tr().focusTime || 'Focus time';
  if (curMode === 'stopwatch') {
    currentPhaseLabel = tr().modeStopwatch || 'Stopwatch';
  } else if (curMode === 'clock') {
    currentPhaseLabel = tr().modeClock || 'Clock';
  } else if (curMode === 'ultradian') {
    if (isLongBreak || isShortBreak) currentPhaseLabel = tr().breakTime || 'Break time';
    else currentPhaseLabel = tr().focusTime || 'Focus time';
  } else if (pomodoroEnabled) {
    if (isShortBreak) currentPhaseLabel = tr().breakTime || 'Break time';
    else if (isLongBreak) currentPhaseLabel = tr().longBreak || 'Long break';
    else currentPhaseLabel = tr().focusTime || 'Focus time';
  } else {
    currentPhaseLabel = tr().focusTime || 'Focus time';
  }

  if (sessionText) {
    sessionText.textContent = currentPhaseLabel;
  }

  if (sessionDot) {
    sessionDot.classList.toggle('is-running', !!isRunning);
  }

  // Sync Subcard tab buttons (Focus time / Short break / Long break)
  const pomoPhaseBtns = document.querySelectorAll('.focus-pomo-phase-btn');
  pomoPhaseBtns.forEach(btn => {
    const p = btn.dataset.phase;
    if (phase === 'work') {
      btn.classList.toggle('is-active', p === 'work');
    } else if (isShortBreak) {
      btn.classList.toggle('is-active', p === 'short_break');
    } else if (isLongBreak) {
      btn.classList.toggle('is-active', p === 'long_break');
    }
  });

  if (pomodoroEnabled) {
    if (phaseBadge) {
      phaseBadge.style.display = 'inline-block';
      phaseBadge.className = 'phase-badge ' + (phase === 'work' ? 'work' : 'break');
      phaseBadge.textContent = (phase === 'work' ? tr().workTime : (isLongBreak ? (tr().longBreak || 'Long break') : tr().restTime));
    }
    if (pomodoroPhaseN) {
      pomodoroPhaseN.textContent = phase === 'work' ? tr().work : (isLongBreak ? (tr().longBreak || 'Long break') : tr().breakWord);
    }
    if (pomodoroTimeN) pomodoroTimeN.textContent = fmtMS(phaseRemaining);
  } else {
    if (phaseBadge) phaseBadge.style.display = 'none';
  }
}

export function initPomodoro() {
  const pomodoroToggle = document.getElementById('pomodoro-toggle');
  if (pomodoroToggle) {
    pomodoroToggle.addEventListener('click', function() {
      setPomodoroEnabled(!pomodoroEnabled);
      phase = 'work';
      phaseRemaining = customWorkLen;
      updatePomodoroUI();
    });
  }

  const autoCheckbox = document.getElementById('focus-autostart-checkbox');
  if (autoCheckbox) {
    autoCheckbox.checked = autoStartBlocks;
    autoCheckbox.addEventListener('change', function() {
      setAutoStartBlocks(autoCheckbox.checked);
      updatePomodoroUI();
    });
  }

  const autoUltraCheckbox = document.getElementById('focus-ultradian-autostart-checkbox');
  if (autoUltraCheckbox) {
    autoUltraCheckbox.checked = autoStartBlocks;
    autoUltraCheckbox.addEventListener('change', function() {
      setAutoStartBlocks(autoUltraCheckbox.checked);
      updatePomodoroUI();
    });
  }

  const autoToggle = document.getElementById('focus-autostart-toggle');
  if (autoToggle) {
    autoToggle.addEventListener('click', function() {
      setAutoStartBlocks(!autoStartBlocks);
      updatePomodoroUI();
    });
  }

  updatePomodoroUI();
}
