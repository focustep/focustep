export const RING_R = 96;
export const RING_C = 2 * Math.PI * RING_R;
export const ICON_PLAY = '<path d="M8 5v14l11-7z"/>';
export const ICON_PAUSE = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';

export let dailyGoalHours = 3;
try {
  const g = localStorage.getItem('daily_goal_hours');
  if (g) dailyGoalHours = parseFloat(g) || 3;
} catch(e){}

export function setDailyGoalHours(val) {
  dailyGoalHours = val;
}

export function getBase() {
  return Math.round(dailyGoalHours * 3600);
}

export const timerState = {
  total: getBase(),
  remaining: getBase(),
  running: false,
  timerId: null,
  extraAdded: 0,
  glowTimeout: null,
  currentFocusMode: 'timer',
  activePomoSubPhase: 'work',
  stopwatchElapsed: 0,
  clockIntervalId: null,
  clockShowSeconds: true,
  clock12Hour: false,
  focusIdleTimeoutId: null,
  wheelHoursInstance: null,
  wheelMinutesInstance: null,
  wheelSecondsInstance: null,
  wheelHoursFocusInstance: null,
  wheelMinutesFocusInstance: null,
  wheelSecondsFocusInstance: null,
  onTimerStateChangeCallbacks: []
};

try {
  const savedShowSec = localStorage.getItem('study_clock_show_seconds');
  if (savedShowSec !== null) timerState.clockShowSeconds = (savedShowSec === 'true');
  const saved12h = localStorage.getItem('study_clock_12h');
  if (saved12h !== null) timerState.clock12Hour = (saved12h === 'true');
} catch (e) {}

export function getCurrentFocusMode() {
  return timerState.currentFocusMode;
}

export function setCurrentFocusMode(mode) {
  timerState.currentFocusMode = mode;
}

export function onTimerUpdate(cb) {
  timerState.onTimerStateChangeCallbacks.push(cb);
}

export function notifyStateChange() {
  timerState.onTimerStateChangeCallbacks.forEach(cb => cb());
}
