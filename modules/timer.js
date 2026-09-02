/**
 * Timer Module Entry Point
 * Re-exports core timer functions from dedicated submodules
 */

export {
  RING_R,
  RING_C,
  ICON_PLAY,
  ICON_PAUSE,
  getBase,
  getCurrentFocusMode,
  setCurrentFocusMode,
  onTimerUpdate
} from './timer/state.js';

export { IOSWheelPicker } from './timer/wheel-picker.js';
export { updateStadiumDimensions } from './timer/stadium.js';
export { resetFocusIdleTimer } from './timer/idle.js';

export {
  getClockTimeString,
  updateRing,
  updateStartStopLabel,
  renderTimer,
  syncDurationInputsFromSeconds,
  setActiveDurationChip,
  triggerGlowAfterInactivity
} from './timer/render.js';

export {
  saveTimerState,
  loadTimerState,
  applyDurationSeconds,
  tick,
  startTimer,
  stopTimer
} from './timer/engine.js';

export { initTimer } from './timer/init.js';
