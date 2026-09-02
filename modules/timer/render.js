import { tr } from '../i18n.js';
import { fmt, fmtShort, pad2 } from '../helpers.js';
import { timerState, RING_C, ICON_PLAY, ICON_PAUSE } from './state.js';

export function getClockTimeString() {
  const now = new Date();
  let hours = now.getHours();
  let ampm = '';
  if (timerState.clock12Hour) {
    ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
  }
  const h = String(hours).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  
  if (timerState.clockShowSeconds) {
    return `${h}:${m}:${s}${ampm}`;
  } else {
    return `${h}:${m}${ampm}`;
  }
}

export function updateRing() {
  const ringProgress = document.getElementById('ring-progress');
  const ringWrap = document.getElementById('ring-wrap');
  const frac = timerState.total > 0 ? Math.min(1, Math.max(0, timerState.remaining / timerState.total)) : 0;
  const isAvailable = timerState.remaining > 0 && timerState.total > 0;

  if (ringProgress && ringWrap) {
    ringProgress.style.strokeDasharray = String(RING_C);
    ringProgress.style.strokeDashoffset = String(RING_C * (1 - frac));
    
    ringProgress.classList.toggle('is-visible', isAvailable);
    ringWrap.classList.toggle('running', timerState.running);
    ringWrap.classList.toggle('paused', !timerState.running && isAvailable);
    ringWrap.classList.toggle('done', timerState.remaining <= 0);
    
    if (timerState.remaining <= 0) {
      ringWrap.classList.remove('glow-ready');
    }
  }

  // Update Focus Mode Stadium Progress & Glow State
  const focusProgress = document.getElementById('focus-stadium-progress');
  const focusCapsule = document.getElementById('focus-stadium-capsule');
  if (focusProgress && focusCapsule) {
    try {
      const pathLen = focusProgress.getTotalLength ? focusProgress.getTotalLength() : 1792;
      if (pathLen > 0) {
        focusProgress.style.strokeDasharray = String(pathLen);
        focusProgress.style.strokeDashoffset = String(pathLen * (1 - frac));
      }
    } catch(e){}

    focusProgress.classList.toggle('is-visible', isAvailable);
    focusCapsule.classList.toggle('is-running', timerState.running);
    focusCapsule.classList.toggle('paused', !timerState.running && isAvailable);
    focusCapsule.classList.toggle('done', timerState.remaining <= 0);
  }
}

export function updateStartStopLabel() {
  const startLabel = document.getElementById('start-label');
  if (startLabel) startLabel.textContent = timerState.running ? tr().stop : tr().start;

  // Sync Focus Mode Start/Stop button & icon
  const focusStartBtn = document.getElementById('focus-start-btn');
  const focusStartLabel = document.getElementById('focus-start-label');
  const focusStartIcon = document.getElementById('focus-start-icon');
  const focusStadiumCapsule = document.querySelector('.focus-skeleton-capsule-main');

  if (focusStartLabel) {
    focusStartLabel.textContent = timerState.running ? tr().stop : tr().start;
  }
  if (focusStartIcon) {
    focusStartIcon.innerHTML = timerState.running ? ICON_PAUSE : ICON_PLAY;
  }
  if (focusStartBtn) {
    focusStartBtn.classList.toggle('is-running', timerState.running);
  }
  if (focusStadiumCapsule) {
    focusStadiumCapsule.classList.toggle('is-running', timerState.running);
  }
}

export function renderTimer() {
  const disp = document.getElementById('time-display');
  const extraInfo = document.getElementById('extra-info-inline');
  const focusDisp = document.getElementById('focus-time-display');
  const focusExtraInfo = document.getElementById('focus-extra-info');

  if (timerState.currentFocusMode === 'clock') {
    const timeStr = getClockTimeString();
    if (disp) disp.textContent = timeStr;
    if (focusDisp) focusDisp.textContent = timeStr;
    if (extraInfo) extraInfo.textContent = '';
    if (focusExtraInfo) focusExtraInfo.textContent = '';
    updateRing();
    document.title = timeStr + ' · Clock';
    return;
  }

  if (timerState.currentFocusMode === 'stopwatch') {
    const swStr = fmt(timerState.stopwatchElapsed);
    if (disp) disp.textContent = swStr;
    if (focusDisp) focusDisp.textContent = swStr;
    if (extraInfo) extraInfo.textContent = '';
    if (focusExtraInfo) focusExtraInfo.textContent = '';
    updateRing();
    document.title = (timerState.running ? swStr : '00:00:00') + ' · Stopwatch';
    return;
  }

  if (disp) {
    disp.textContent = fmt(timerState.remaining);
    disp.classList.toggle('done', timerState.remaining <= 0);
  }
  if (focusDisp) {
    focusDisp.textContent = fmt(timerState.remaining);
    focusDisp.classList.toggle('done', timerState.remaining <= 0);
  }
  if (extraInfo) {
    extraInfo.textContent = timerState.extraAdded > 0 ? ("+" + timerState.extraAdded + " min qo'shildi") : '';
  }
  if (focusExtraInfo) {
    focusExtraInfo.textContent = timerState.extraAdded > 0 ? ("+" + timerState.extraAdded + " min qo'shildi") : '';
  }
  updateRing();
  document.title = timerState.running ? (fmtShort(timerState.remaining) + ' · Study Timer') : 'Study Timer';
}

export function syncDurationInputsFromSeconds(sec) {
  const durHours = document.getElementById('dur-hours');
  const durMinutes = document.getElementById('dur-minutes');
  const durSeconds = document.getElementById('dur-seconds');

  const durHoursFocus = document.getElementById('dur-hours-focus');
  const durMinutesFocus = document.getElementById('dur-minutes-focus');
  const durSecondsFocus = document.getElementById('dur-seconds-focus');

  sec = Math.max(0, parseInt(sec, 10) || 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  
  if (durHours) durHours.value = pad2(h);
  if (durMinutes) durMinutes.value = pad2(m);
  if (durSeconds) durSeconds.value = pad2(s);

  if (durHoursFocus) durHoursFocus.value = pad2(h);
  if (durMinutesFocus) durMinutesFocus.value = pad2(m);
  if (durSecondsFocus) durSecondsFocus.value = pad2(s);

  if (timerState.wheelHoursInstance) timerState.wheelHoursInstance.setValue(h, false);
  if (timerState.wheelMinutesInstance) timerState.wheelMinutesInstance.setValue(m, false);
  if (timerState.wheelSecondsInstance) timerState.wheelSecondsInstance.setValue(s, false);

  if (timerState.wheelHoursFocusInstance) timerState.wheelHoursFocusInstance.setValue(h, false);
  if (timerState.wheelMinutesFocusInstance) timerState.wheelMinutesFocusInstance.setValue(m, false);
  if (timerState.wheelSecondsFocusInstance) timerState.wheelSecondsFocusInstance.setValue(s, false);
}

export function setActiveDurationChip(sec) {
  const durationChips = document.querySelectorAll('.duration-chip');
  durationChips.forEach(function(b) {
    b.classList.toggle('active', parseInt(b.dataset.presetMin, 10) * 60 === sec);
  });
}

export function triggerGlowAfterInactivity(sec) {
  const ringWrap = document.getElementById('ring-wrap');
  if (!ringWrap) return;
  if (timerState.glowTimeout) clearTimeout(timerState.glowTimeout);
  if (sec > 0) {
    ringWrap.classList.add('glow-ready');
  } else {
    ringWrap.classList.remove('glow-ready');
  }
}
