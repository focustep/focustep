import { tr } from '../i18n.js';
import { todayKey } from '../helpers.js';
import { playChime } from '../sound.js';
import { ensureNotifyPermission, notify } from '../notifications.js';
import {
  WORK_LEN,
  getPomodoroState,
  setPomodoroPhase,
  updatePomodoroUI,
  getPhaseDuration,
  incrementCompletedSessions,
  getNextBreakType
} from '../pomodoro.js';
import { getActiveSubjectId, logSession } from '../subjects.js';
import { timerState, getBase, notifyStateChange, ICON_PLAY, ICON_PAUSE } from './state.js';
import {
  renderTimer,
  updateStartStopLabel,
  syncDurationInputsFromSeconds,
  setActiveDurationChip,
  triggerGlowAfterInactivity
} from './render.js';
import { resetFocusIdleTimer } from './idle.js';

let activeSessionAccumulatedSec = 0;

function checkAndLogActiveSession() {
  if (activeSessionAccumulatedSec >= 1) {
    const activeSubjId = getActiveSubjectId();
    logSession(activeSubjId, activeSessionAccumulatedSec);
    activeSessionAccumulatedSec = 0;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    checkAndLogActiveSession();
  });
}

export function saveTimerState() {
  try {
    localStorage.setItem(todayKey('timer'), JSON.stringify({
      remaining: timerState.remaining,
      total: timerState.total,
      extraAdded: timerState.extraAdded
    }));
  } catch(e){}
  notifyStateChange();
}

export function loadTimerState() {
  try {
    const raw = localStorage.getItem(todayKey('timer'));
    if (raw) {
      const st = JSON.parse(raw);
      const base = getBase();
      const r = parseInt(st.remaining, 10);
      const t = parseInt(st.total, 10);
      const ext = parseInt(st.extraAdded, 10);
      timerState.remaining = (!isNaN(r) && r >= 0) ? r : base;
      timerState.total = (!isNaN(t) && t >= 0) ? t : base;
      timerState.extraAdded = (!isNaN(ext) && ext >= 0) ? ext : 0;
    }
  } catch(e){}
  if (isNaN(timerState.remaining) || timerState.remaining < 0) timerState.remaining = getBase();
  if (isNaN(timerState.total) || timerState.total < 0) timerState.total = timerState.remaining;
  renderTimer();
  syncDurationInputsFromSeconds(timerState.total);
  setActiveDurationChip(timerState.total);
}

export function applyDurationSeconds(sec, enableGlowTimer = true) {
  if (sec < 0) return;
  if (timerState.running) stopTimer();
  timerState.total = sec;
  timerState.remaining = sec;
  timerState.extraAdded = 0;
  const pomState = getPomodoroState();
  if (timerState.currentFocusMode === 'ultradian') {
    const curPhase = pomState.phase || 'work';
    setPomodoroPhase(curPhase, sec);
  } else if (pomState.enabled) {
    setPomodoroPhase(pomState.phase, sec);
  } else {
    setPomodoroPhase('work', WORK_LEN);
  }
  updatePomodoroUI(timerState.running);
  renderTimer();
  saveTimerState();
  setActiveDurationChip(sec);

  if (enableGlowTimer) {
    triggerGlowAfterInactivity(sec);
  }
}

export function tick() {
  if (timerState.currentFocusMode === 'clock') {
    renderTimer();
    return;
  }

  if (timerState.currentFocusMode === 'stopwatch') {
    timerState.stopwatchElapsed += 1;
    activeSessionAccumulatedSec += 1;
    renderTimer();
    return;
  }

  if (timerState.remaining <= 0) return;
  const pomState = getPomodoroState();

  if (pomState.enabled || timerState.currentFocusMode === 'ultradian') {
    let phaseRemaining = (timerState.currentFocusMode === 'ultradian') ? (timerState.remaining - 1) : (pomState.phaseRemaining - 1);
    let phase = pomState.phase;

    if (phase === 'work') {
      activeSessionAccumulatedSec += 1;
    }

    timerState.remaining -= 1;

    if (phaseRemaining <= 0 || timerState.remaining <= 0) {
      playChime('phase');
      if (timerState.currentFocusMode === 'ultradian') {
        if (phase === 'work') {
          checkAndLogActiveSession();
          incrementCompletedSessions();
          phase = 'long_break'; // 20m Break
          const breakDur = 20 * 60;
          timerState.total = breakDur;
          timerState.remaining = breakDur;
          setPomodoroPhase(phase, breakDur);
          syncDurationInputsFromSeconds(timerState.total);
          notify(tr().notifyBreakTitle, tr().notifyBreakBody);

          if (!pomState.autoStartBlocks) {
            stopTimer();
            updatePomodoroUI(false);
            renderTimer();
            saveTimerState();
            return;
          }
        } else {
          phase = 'work'; // 90m Focus
          const workDur = 90 * 60;
          timerState.total = workDur;
          timerState.remaining = workDur;
          setPomodoroPhase(phase, workDur);
          syncDurationInputsFromSeconds(timerState.total);
          notify(tr().notifyWorkTitle, tr().notifyWorkBody);

          if (!pomState.autoStartBlocks) {
            stopTimer();
            updatePomodoroUI(false);
            renderTimer();
            saveTimerState();
            return;
          }
        }
      } else {
        if (phase === 'work') {
          checkAndLogActiveSession();
          incrementCompletedSessions();
          const nextBreak = getNextBreakType(); // 'short_break' | 'long_break'
          phase = nextBreak;
          phaseRemaining = getPhaseDuration(nextBreak);
          timerState.total = phaseRemaining;
          timerState.remaining = phaseRemaining;
          setPomodoroPhase(phase, phaseRemaining);
          syncDurationInputsFromSeconds(timerState.total);
          notify(tr().notifyBreakTitle, tr().notifyBreakBody);

          if (!pomState.autoStartBlocks) {
            stopTimer();
            updatePomodoroUI(false);
            renderTimer();
            saveTimerState();
            return;
          }
        } else {
          phase = 'work';
          phaseRemaining = getPhaseDuration('work');
          timerState.total = phaseRemaining;
          timerState.remaining = phaseRemaining;
          setPomodoroPhase(phase, phaseRemaining);
          syncDurationInputsFromSeconds(timerState.total);
          notify(tr().notifyWorkTitle, tr().notifyWorkBody);

          if (!pomState.autoStartBlocks) {
            stopTimer();
            updatePomodoroUI(false);
            renderTimer();
            saveTimerState();
            return;
          }
        }
      }
      updatePomodoroUI(true);
      renderTimer();
      saveTimerState();
      return;
    }
    setPomodoroPhase(phase, phaseRemaining);
    updatePomodoroUI(timerState.running);
  } else {
    activeSessionAccumulatedSec += 1;
    timerState.remaining -= 1;
    if (timerState.remaining <= 0) {
      checkAndLogActiveSession();
      stopTimer();
      playChime('complete');
      notify(tr().notifyDoneTitle, tr().notifyDoneBody);
      saveTimerState();
    }
  }

  renderTimer();
}

export function startTimer() {
  if (timerState.running) return;
  ensureNotifyPermission();

  if (timerState.currentFocusMode === 'clock' || timerState.currentFocusMode === 'stopwatch') {
    timerState.running = true;
    updatePomodoroUI(true);
    const startIcon = document.getElementById('start-icon');
    if (startIcon) startIcon.innerHTML = ICON_PAUSE;
    updateStartStopLabel();
    if (timerState.timerId) clearInterval(timerState.timerId);
    timerState.timerId = setInterval(tick, 1000);
    renderTimer();
    resetFocusIdleTimer();
    return;
  }

  const pomState = getPomodoroState();

  if (timerState.remaining <= 0) {
    if (timerState.currentFocusMode === 'ultradian') {
      const curPhase = pomState.phase || 'work';
      const dur = (curPhase === 'work' ? 90 : 20) * 60;
      setPomodoroPhase(curPhase, dur);
      timerState.total = dur;
      timerState.remaining = dur;
    } else if (pomState.enabled) {
      const curPhase = pomState.phase || 'work';
      const dur = getPhaseDuration(curPhase);
      setPomodoroPhase(curPhase, dur);
      timerState.total = dur;
      timerState.remaining = dur;
    } else {
      timerState.total = timerState.total > 0 ? timerState.total : getBase();
      timerState.remaining = timerState.total;
    }
    timerState.extraAdded = 0;
  }
  timerState.running = true;
  updatePomodoroUI(true);
  const startIcon = document.getElementById('start-icon');
  if (startIcon) startIcon.innerHTML = ICON_PAUSE;
  updateStartStopLabel();
  if (timerState.timerId) clearInterval(timerState.timerId);
  timerState.timerId = setInterval(tick, 1000);
  renderTimer();
  resetFocusIdleTimer();
}

export function stopTimer() {
  checkAndLogActiveSession();
  timerState.running = false;
  const startIcon = document.getElementById('start-icon');
  if (startIcon) startIcon.innerHTML = ICON_PAUSE ? ICON_PLAY : ICON_PLAY;
  updateStartStopLabel();
  if (timerState.timerId) clearInterval(timerState.timerId);
  timerState.timerId = null;
  updatePomodoroUI(false);
  renderTimer();
  resetFocusIdleTimer();
}
