import { tr } from '../i18n.js';
import { playWheelTick } from '../sound.js';
import {
  setPomodoroEnabled,
  setPomodoroPhase,
  updatePomodoroUI,
  getPhaseDuration,
  getPomodoroState
} from '../pomodoro.js';
import {
  timerState,
  dailyGoalHours,
  setDailyGoalHours,
  getBase,
  setCurrentFocusMode
} from './state.js';
import { IOSWheelPicker } from './wheel-picker.js';
import {
  renderTimer,
  syncDurationInputsFromSeconds,
  setActiveDurationChip
} from './render.js';
import {
  applyDurationSeconds,
  startTimer,
  stopTimer,
  saveTimerState,
  loadTimerState
} from './engine.js';
import { resetFocusIdleTimer } from './idle.js';
import { updateStadiumDimensions } from './stadium.js';

export function initTimer() {
  const startBtn = document.getElementById('start-btn');
  const resetBtn = document.getElementById('reset-btn');
  const dailyGoalInput = document.getElementById('daily-goal-input');

  if (dailyGoalInput) {
    dailyGoalInput.value = dailyGoalHours;
    dailyGoalInput.addEventListener('change', function() {
      let v = parseFloat(dailyGoalInput.value);
      if (!v || v < 0.5) v = 0.5;
      if (v > 12) v = 12;
      setDailyGoalHours(v);
      dailyGoalInput.value = v;
      try { localStorage.setItem('daily_goal_hours', String(v)); } catch(e){}
      const studied = Math.max(0, timerState.total - timerState.remaining);
      timerState.total = getBase() + timerState.extraAdded * 60;
      timerState.remaining = Math.max(0, timerState.total - studied);
      renderTimer();
      saveTimerState();
      syncDurationInputsFromSeconds(timerState.total);
      setActiveDurationChip(timerState.total);
    });
  }

  const durHours = document.getElementById('dur-hours');
  const durMinutes = document.getElementById('dur-minutes');
  const durSeconds = document.getElementById('dur-seconds');

  const colHoursEl = document.getElementById('col-hours-wheel');
  const ribbonHours = document.getElementById('ribbon-hours');
  const colMinutesEl = document.getElementById('col-minutes-wheel');
  const ribbonMinutes = document.getElementById('ribbon-minutes');
  const colSecondsEl = document.getElementById('col-seconds-wheel');
  const ribbonSeconds = document.getElementById('ribbon-seconds');

  function onWheelChange() {
    const h = timerState.wheelHoursInstance ? timerState.wheelHoursInstance.value : 0;
    const m = timerState.wheelMinutesInstance ? timerState.wheelMinutesInstance.value : 0;
    const s = timerState.wheelSecondsInstance ? timerState.wheelSecondsInstance.value : 0;
    const totalSec = (h * 3600) + (m * 60) + s;
    applyDurationSeconds(totalSec, true);
  }

  if (colHoursEl && ribbonHours && durHours) {
    timerState.wheelHoursInstance = new IOSWheelPicker({
      container: colHoursEl,
      ribbon: ribbonHours,
      inputEl: durHours,
      max: 23,
      fastReroll: false,
      onChange: onWheelChange
    });
  }

  if (colMinutesEl && ribbonMinutes && durMinutes) {
    timerState.wheelMinutesInstance = new IOSWheelPicker({
      container: colMinutesEl,
      ribbon: ribbonMinutes,
      inputEl: durMinutes,
      max: 59,
      fastReroll: true,
      onChange: onWheelChange
    });
  }

  if (colSecondsEl && ribbonSeconds && durSeconds) {
    timerState.wheelSecondsInstance = new IOSWheelPicker({
      container: colSecondsEl,
      ribbon: ribbonSeconds,
      inputEl: durSeconds,
      max: 59,
      fastReroll: true,
      onChange: onWheelChange
    });
  }

  // Focus Mode Wheel Pickers
  const colHoursFocusEl = document.getElementById('col-hours-wheel-focus');
  const ribbonHoursFocus = document.getElementById('ribbon-hours-focus');
  const durHoursFocus = document.getElementById('dur-hours-focus');

  const colMinutesFocusEl = document.getElementById('col-minutes-wheel-focus');
  const ribbonMinutesFocus = document.getElementById('ribbon-minutes-focus');
  const durMinutesFocus = document.getElementById('dur-minutes-focus');

  const colSecondsFocusEl = document.getElementById('col-seconds-wheel-focus');
  const ribbonSecondsFocus = document.getElementById('ribbon-seconds-focus');
  const durSecondsFocus = document.getElementById('dur-seconds-focus');

  const setTimeTitleEl = document.getElementById('focus-set-time-title');
  const pomoPhaseRowEl = document.getElementById('focus-pomo-phase-row');
  const pomoPhaseBtns = document.querySelectorAll('.focus-pomo-phase-btn');

  function onFocusWheelChange() {
    const h = timerState.wheelHoursFocusInstance ? timerState.wheelHoursFocusInstance.value : 0;
    const m = timerState.wheelMinutesFocusInstance ? timerState.wheelMinutesFocusInstance.value : 0;
    const s = timerState.wheelSecondsFocusInstance ? timerState.wheelSecondsFocusInstance.value : 0;
    const totalSec = (h * 3600) + (m * 60) + s;

    if (timerState.currentFocusMode === 'pomodoro') {
      const clampedSec = Math.max(60, totalSec);
      setPhaseDuration(timerState.activePomoSubPhase, clampedSec);
      const pomState = getPomodoroState();
      if (pomState.phase === timerState.activePomoSubPhase) {
        applyDurationSeconds(clampedSec, true);
      }
    } else {
      applyDurationSeconds(totalSec, true);
    }
  }

  if (colHoursFocusEl && ribbonHoursFocus && durHoursFocus) {
    timerState.wheelHoursFocusInstance = new IOSWheelPicker({
      container: colHoursFocusEl,
      ribbon: ribbonHoursFocus,
      inputEl: durHoursFocus,
      max: 23,
      fastReroll: false,
      onChange: onFocusWheelChange
    });
  }

  if (colMinutesFocusEl && ribbonMinutesFocus && durMinutesFocus) {
    timerState.wheelMinutesFocusInstance = new IOSWheelPicker({
      container: colMinutesFocusEl,
      ribbon: ribbonMinutesFocus,
      inputEl: durMinutesFocus,
      max: 59,
      fastReroll: true,
      onChange: onFocusWheelChange
    });
  }

  if (colSecondsFocusEl && ribbonSecondsFocus && durSecondsFocus) {
    timerState.wheelSecondsFocusInstance = new IOSWheelPicker({
      container: colSecondsFocusEl,
      ribbon: ribbonSecondsFocus,
      inputEl: durSecondsFocus,
      max: 59,
      fastReroll: true,
      onChange: onFocusWheelChange
    });
  }

  // Pomodoro Subcard Phase Buttons (Focus time / Short break / Long break)
  pomoPhaseBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      pomoPhaseBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      timerState.activePomoSubPhase = btn.dataset.phase || 'work';
      const dur = getPhaseDuration(timerState.activePomoSubPhase);

      if (timerState.running) {
        stopTimer();
      }

      setPomodoroPhase(timerState.activePomoSubPhase, dur);
      timerState.total = dur;
      timerState.remaining = dur;
      timerState.extraAdded = 0;
      syncDurationInputsFromSeconds(dur);
      updatePomodoroUI(false);
      renderTimer();
      saveTimerState();
    });
  });

  document.querySelectorAll('.duration-chip').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const min = parseInt(btn.dataset.presetMin, 10);
      syncDurationInputsFromSeconds(min * 60);
      applyDurationSeconds(min * 60);
    });
  });

  if (startBtn) {
    startBtn.addEventListener('click', function() {
      if (timerState.running) { stopTimer(); saveTimerState(); } else { startTimer(); }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      resetBtn.classList.remove('anim-spin');
      void resetBtn.offsetWidth;
      resetBtn.classList.add('anim-spin');
      setTimeout(() => resetBtn.classList.remove('anim-spin'), 650);

      stopTimer();
      timerState.remaining = getBase();
      timerState.total = getBase();
      timerState.extraAdded = 0;
      setPomodoroPhase('work', getPhaseDuration('work'));
      updatePomodoroUI(false);
      renderTimer();
      saveTimerState();
      syncDurationInputsFromSeconds(timerState.total);
      setActiveDurationChip(timerState.total);
    });
  }

  document.querySelectorAll('.extra-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      btn.classList.remove('pop-added');
      void btn.offsetWidth;
      btn.classList.add('pop-added');
      setTimeout(() => btn.classList.remove('pop-added'), 450);

      const min = parseInt(btn.dataset.min, 10);
      timerState.remaining += min * 60;
      timerState.total += min * 60;
      timerState.extraAdded += min;
      renderTimer();
      saveTimerState();
      syncDurationInputsFromSeconds(timerState.total);
      setActiveDurationChip(timerState.total);
    });
  });

  // Focus Mode Start/Stop Toggle Button
  const focusStartBtn = document.getElementById('focus-start-btn');
  if (focusStartBtn) {
    focusStartBtn.addEventListener('click', function() {
      if (timerState.running) {
        stopTimer();
        saveTimerState();
      } else {
        startTimer();
      }
    });
  }

  // Focus Mode Preset Extra Buttons (+5 min, +15 min, +30 min)
  document.querySelectorAll('.focus-extra-time-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      btn.classList.remove('pop-added');
      void btn.offsetWidth;
      btn.classList.add('pop-added');
      setTimeout(() => btn.classList.remove('pop-added'), 450);

      const min = parseInt(btn.dataset.min, 10);
      if (!isNaN(min) && min > 0) {
        timerState.remaining += min * 60;
        timerState.total += min * 60;
        timerState.extraAdded += min;
        renderTimer();
        saveTimerState();
        syncDurationInputsFromSeconds(timerState.total);
        setActiveDurationChip(timerState.total);
      }
    });
  });

  // Focus Mode Custom Extra Time Button (Wheel Reroll with Scroll Lock)
  const focusCustomExtraBtn = document.getElementById('focus-custom-extra-btn');
  const focusCustomExtraVal = document.getElementById('focus-custom-extra-val');
  let customExtraMinutes = 5;

  if (focusCustomExtraBtn && focusCustomExtraVal) {
    focusCustomExtraBtn.addEventListener('wheel', function(e) {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      if (delta < 0) {
        if (customExtraMinutes < 60) {
          customExtraMinutes += 1;
          playWheelTick();
        }
      } else if (delta > 0) {
        if (customExtraMinutes > 1) {
          customExtraMinutes -= 1;
          playWheelTick();
        }
      }

      focusCustomExtraVal.textContent = String(customExtraMinutes);
    }, { passive: false });

    focusCustomExtraBtn.addEventListener('click', function() {
      focusCustomExtraBtn.classList.remove('pop-added');
      void focusCustomExtraBtn.offsetWidth;
      focusCustomExtraBtn.classList.add('pop-added');
      setTimeout(() => focusCustomExtraBtn.classList.remove('pop-added'), 450);

      const min = customExtraMinutes;
      if (min > 0) {
        timerState.remaining += min * 60;
        timerState.total += min * 60;
        timerState.extraAdded += min;
        renderTimer();
        saveTimerState();
        syncDurationInputsFromSeconds(timerState.total);
        setActiveDurationChip(timerState.total);
      }
    });
  }

  // Focus Mode Reset / Restart Button (Multifunctional across all 5 modes)
  const focusBtnReset = document.getElementById('focus-btn-reset');
  if (focusBtnReset) {
    focusBtnReset.addEventListener('click', function() {
      focusBtnReset.classList.remove('anim-spin');
      void focusBtnReset.offsetWidth;
      focusBtnReset.classList.add('anim-spin');
      setTimeout(() => focusBtnReset.classList.remove('anim-spin'), 650);

      stopTimer();
      if (timerState.currentFocusMode === 'pomodoro') {
        const curPhase = timerState.activePomoSubPhase || 'work';
        const dur = getPhaseDuration(curPhase);
        setPomodoroPhase(curPhase, dur);
        timerState.total = dur;
        timerState.remaining = dur;
        timerState.extraAdded = 0;
        syncDurationInputsFromSeconds(dur);
        updatePomodoroUI(false);
        renderTimer();
        saveTimerState();
      } else if (timerState.currentFocusMode === 'ultradian') {
        const pomState = getPomodoroState();
        const curPhase = pomState.phase === 'long_break' ? 'long_break' : 'work';
        const dur = (curPhase === 'long_break' ? 20 : 90) * 60;
        setPomodoroPhase(curPhase, dur);
        timerState.total = dur;
        timerState.remaining = dur;
        timerState.extraAdded = 0;
        syncDurationInputsFromSeconds(dur);
        updatePomodoroUI(false);
        renderTimer();
        saveTimerState();
      } else if (timerState.currentFocusMode === 'clock') {
        updatePomodoroUI(false);
        renderTimer();
      } else if (timerState.currentFocusMode === 'stopwatch') {
        timerState.stopwatchElapsed = 0;
        updatePomodoroUI(false);
        renderTimer();
      } else {
        // Standard Timer
        timerState.remaining = getBase();
        timerState.total = getBase();
        timerState.extraAdded = 0;
        setPomodoroPhase('work', getPhaseDuration('work'));
        updatePomodoroUI(false);
        renderTimer();
        saveTimerState();
        syncDurationInputsFromSeconds(timerState.total);
        setActiveDurationChip(timerState.total);
      }
    });
  }

  // Focus Mode Selector Tabs
  const focusModeTabs = document.querySelectorAll('.focus-mode-tab');
  focusModeTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      focusModeTabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const mode = tab.dataset.mode;
      setCurrentFocusMode(mode);

      if (mode === 'timer') {
        // Standard Timer Mode
        setPomodoroEnabled(false);
        const focusView = document.getElementById('focus-mode-view');
        if (focusView) {
          focusView.classList.remove('is-pomodoro-mode');
          focusView.classList.remove('is-ultradian-mode');
          focusView.classList.remove('is-clock-mode');
          focusView.classList.remove('is-stopwatch-mode');
          focusView.classList.add('is-timer-mode');
        }
        document.body.classList.remove('is-pomodoro-mode');
        document.body.classList.remove('is-ultradian-mode');
        document.body.classList.remove('is-clock-mode');
        document.body.classList.remove('is-stopwatch-mode');
        document.body.classList.add('is-timer-mode');

        const autoContainer = document.getElementById('focus-autostart-container');
        if (autoContainer) autoContainer.style.display = 'none';
        const ultraCard = document.getElementById('focus-ultradian-card');
        if (ultraCard) ultraCard.style.display = 'none';
        const clockCard = document.getElementById('focus-clock-card');
        if (clockCard) clockCard.style.display = 'none';
        const stopwatchCard = document.getElementById('focus-stopwatch-card');
        if (stopwatchCard) stopwatchCard.style.display = 'none';

        if (pomoPhaseRowEl) pomoPhaseRowEl.style.display = 'none';
        if (setTimeTitleEl) setTimeTitleEl.textContent = tr().setTimeLabel || 'SET TIME';

        updatePomodoroUI(timerState.running);
        applyDurationSeconds(timerState.total > 0 ? timerState.total : getBase(), true);
        renderTimer();
      } else if (mode === 'pomodoro') {
        // Pomodoro Mode with Set Duration
        setPomodoroEnabled(true);
        const focusView = document.getElementById('focus-mode-view');
        if (focusView) {
          focusView.classList.add('is-pomodoro-mode');
          focusView.classList.remove('is-timer-mode');
          focusView.classList.remove('is-ultradian-mode');
          focusView.classList.remove('is-clock-mode');
          focusView.classList.remove('is-stopwatch-mode');
        }
        document.body.classList.add('is-pomodoro-mode');
        document.body.classList.remove('is-timer-mode');
        document.body.classList.remove('is-ultradian-mode');
        document.body.classList.remove('is-clock-mode');
        document.body.classList.remove('is-stopwatch-mode');

        const autoContainer = document.getElementById('focus-autostart-container');
        if (autoContainer) autoContainer.style.display = 'block';
        const ultraCard = document.getElementById('focus-ultradian-card');
        if (ultraCard) ultraCard.style.display = 'none';
        const clockCard = document.getElementById('focus-clock-card');
        if (clockCard) clockCard.style.display = 'none';
        const stopwatchCard = document.getElementById('focus-stopwatch-card');
        if (stopwatchCard) stopwatchCard.style.display = 'none';

        if (pomoPhaseRowEl) pomoPhaseRowEl.style.display = 'flex';
        if (setTimeTitleEl) setTimeTitleEl.textContent = tr().setDurationLabel || 'SET DURATION';

        timerState.activePomoSubPhase = 'work';
        pomoPhaseBtns.forEach(b => {
          b.classList.toggle('is-active', (b.dataset.phase || 'work') === 'work');
        });

        const workDur = getPhaseDuration('work');
        setPomodoroPhase('work', workDur);
        applyDurationSeconds(workDur, true);
        syncDurationInputsFromSeconds(workDur);
        updatePomodoroUI(timerState.running);
        renderTimer();
      } else if (mode === 'ultradian') {
        // Ultradian Rhythm (90m Work / 20m Rest)
        setPomodoroEnabled(false);
        const focusView = document.getElementById('focus-mode-view');
        if (focusView) {
          focusView.classList.remove('is-pomodoro-mode');
          focusView.classList.remove('is-timer-mode');
          focusView.classList.remove('is-clock-mode');
          focusView.classList.remove('is-stopwatch-mode');
          focusView.classList.add('is-ultradian-mode');
        }
        document.body.classList.remove('is-pomodoro-mode');
        document.body.classList.remove('is-timer-mode');
        document.body.classList.remove('is-clock-mode');
        document.body.classList.remove('is-stopwatch-mode');
        document.body.classList.add('is-ultradian-mode');

        const autoContainer = document.getElementById('focus-autostart-container');
        if (autoContainer) autoContainer.style.display = 'none';

        const ultraCard = document.getElementById('focus-ultradian-card');
        if (ultraCard) ultraCard.style.display = 'flex';
        const clockCard = document.getElementById('focus-clock-card');
        if (clockCard) clockCard.style.display = 'none';
        const stopwatchCard = document.getElementById('focus-stopwatch-card');
        if (stopwatchCard) stopwatchCard.style.display = 'none';

        if (pomoPhaseRowEl) pomoPhaseRowEl.style.display = 'none';
        if (setTimeTitleEl) setTimeTitleEl.textContent = tr().setTimeLabel || 'SET TIME';

        const pomState = getPomodoroState();
        const curPhase = pomState.phase === 'long_break' ? 'long_break' : 'work';
        const dur = (curPhase === 'long_break' ? 20 : 90) * 60;
        setPomodoroPhase(curPhase, dur);
        timerState.total = dur;
        timerState.remaining = dur;
        timerState.extraAdded = 0;
        syncDurationInputsFromSeconds(dur);
        updatePomodoroUI(timerState.running);
        renderTimer();
        saveTimerState();
      } else if (mode === 'clock') {
        // Clock mode
        setPomodoroEnabled(false);
        const focusView = document.getElementById('focus-mode-view');
        if (focusView) {
          focusView.classList.remove('is-pomodoro-mode');
          focusView.classList.remove('is-timer-mode');
          focusView.classList.remove('is-ultradian-mode');
          focusView.classList.remove('is-stopwatch-mode');
          focusView.classList.add('is-clock-mode');
        }
        document.body.classList.remove('is-pomodoro-mode');
        document.body.classList.remove('is-timer-mode');
        document.body.classList.remove('is-ultradian-mode');
        document.body.classList.remove('is-stopwatch-mode');
        document.body.classList.add('is-clock-mode');

        const autoContainer = document.getElementById('focus-autostart-container');
        if (autoContainer) autoContainer.style.display = 'none';
        const ultraCard = document.getElementById('focus-ultradian-card');
        if (ultraCard) ultraCard.style.display = 'none';
        const clockCard = document.getElementById('focus-clock-card');
        if (clockCard) clockCard.style.display = 'flex';
        const stopwatchCard = document.getElementById('focus-stopwatch-card');
        if (stopwatchCard) stopwatchCard.style.display = 'none';

        if (pomoPhaseRowEl) pomoPhaseRowEl.style.display = 'none';
        if (setTimeTitleEl) setTimeTitleEl.textContent = tr().modeClock || 'CLOCK';

        updatePomodoroUI(false);
        renderTimer();
      } else if (mode === 'stopwatch') {
        // Stopwatch mode
        setPomodoroEnabled(false);
        const focusView = document.getElementById('focus-mode-view');
        if (focusView) {
          focusView.classList.remove('is-pomodoro-mode');
          focusView.classList.remove('is-timer-mode');
          focusView.classList.remove('is-ultradian-mode');
          focusView.classList.remove('is-clock-mode');
          focusView.classList.add('is-stopwatch-mode');
        }
        document.body.classList.remove('is-pomodoro-mode');
        document.body.classList.remove('is-timer-mode');
        document.body.classList.remove('is-ultradian-mode');
        document.body.classList.remove('is-clock-mode');
        document.body.classList.add('is-stopwatch-mode');

        const autoContainer = document.getElementById('focus-autostart-container');
        if (autoContainer) autoContainer.style.display = 'none';
        const ultraCard = document.getElementById('focus-ultradian-card');
        if (ultraCard) ultraCard.style.display = 'none';
        const clockCard = document.getElementById('focus-clock-card');
        if (clockCard) clockCard.style.display = 'none';
        const stopwatchCard = document.getElementById('focus-stopwatch-card');
        if (stopwatchCard) stopwatchCard.style.display = 'flex';

        if (pomoPhaseRowEl) pomoPhaseRowEl.style.display = 'none';
        if (setTimeTitleEl) setTimeTitleEl.textContent = tr().modeStopwatch || 'STOPWATCH';

        updatePomodoroUI(timerState.running);
        renderTimer();
      }

      resetFocusIdleTimer();
    });
  });

  // Global activity listener for Focus Mode idle auto-hide
  ['mousemove', 'mousedown', 'pointermove', 'touchstart', 'touchmove', 'keydown', 'wheel'].forEach(function(evtName) {
    window.addEventListener(evtName, function() {
      const focusView = document.getElementById('focus-mode-view');
      if (focusView && focusView.classList.contains('is-active')) {
        resetFocusIdleTimer();
      }
    }, { passive: true });
  });

  // Clock mode toggle switches
  const clockSecCb = document.getElementById('focus-clock-seconds-checkbox');
  const clock12hCb = document.getElementById('focus-clock-12h-checkbox');
  if (clockSecCb) {
    clockSecCb.checked = timerState.clockShowSeconds;
    clockSecCb.addEventListener('change', function() {
      timerState.clockShowSeconds = clockSecCb.checked;
      try {
        localStorage.setItem('study_clock_show_seconds', String(timerState.clockShowSeconds));
      } catch (e) {}
      if (timerState.currentFocusMode === 'clock') renderTimer();
    });
  }
  if (clock12hCb) {
    clock12hCb.checked = timerState.clock12Hour;
    clock12hCb.addEventListener('change', function() {
      timerState.clock12Hour = clock12hCb.checked;
      try {
        localStorage.setItem('study_clock_12h', String(timerState.clock12Hour));
      } catch (e) {}
      if (timerState.currentFocusMode === 'clock') renderTimer();
    });
  }

  // Continuous background clock tick every second
  if (!timerState.clockIntervalId) {
    timerState.clockIntervalId = setInterval(function() {
      if (timerState.currentFocusMode === 'clock') {
        renderTimer();
      }
    }, 1000);
  }

  document.addEventListener('keydown', function(e) {
    if (e.code !== 'Space') return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    if (startBtn) startBtn.click();
  });

  setInterval(function(){ if (timerState.running) saveTimerState(); }, 5000);
  window.addEventListener('beforeunload', function(){ if (timerState.running) saveTimerState(); });

  loadTimerState();

  if (typeof ResizeObserver !== 'undefined') {
    const capsule = document.getElementById('focus-stadium-capsule');
    if (capsule) {
      const ro = new ResizeObserver(() => {
        updateStadiumDimensions();
      });
      ro.observe(capsule);
    }
  }
  window.addEventListener('resize', updateStadiumDimensions);
  document.addEventListener('fullscreenchange', () => {
    updateStadiumDimensions();
    setTimeout(updateStadiumDimensions, 100);
    setTimeout(updateStadiumDimensions, 300);
  });
  document.addEventListener('webkitfullscreenchange', () => {
    updateStadiumDimensions();
    setTimeout(updateStadiumDimensions, 100);
    setTimeout(updateStadiumDimensions, 300);
  });
  setTimeout(updateStadiumDimensions, 100);
}
