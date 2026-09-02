import { timerState } from './state.js';
import { updateStadiumDimensions } from './stadium.js';

export function resetFocusIdleTimer() {
  const focusView = document.getElementById('focus-mode-view');
  if (!focusView || !focusView.classList.contains('is-active')) {
    if (timerState.focusIdleTimeoutId) {
      clearTimeout(timerState.focusIdleTimeoutId);
      timerState.focusIdleTimeoutId = null;
    }
    if (focusView) focusView.classList.remove('is-idle');
    return;
  }

  // 1-savol: faqat start bosilganda, clock da ha, doim ishlaydi bu
  const canGoIdle = timerState.running || timerState.currentFocusMode === 'clock';

  if (focusView.classList.contains('is-idle')) {
    focusView.classList.remove('is-idle');
    requestAnimationFrame(() => {
      updateStadiumDimensions();
      setTimeout(updateStadiumDimensions, 100);
      setTimeout(updateStadiumDimensions, 300);
      setTimeout(updateStadiumDimensions, 700);
    });
  }

  if (timerState.focusIdleTimeoutId) {
    clearTimeout(timerState.focusIdleTimeoutId);
    timerState.focusIdleTimeoutId = null;
  }

  if (canGoIdle) {
    timerState.focusIdleTimeoutId = setTimeout(() => {
      const isStillActive = focusView && focusView.classList.contains('is-active');
      const stillCanGoIdle = timerState.running || timerState.currentFocusMode === 'clock';
      if (isStillActive && stillCanGoIdle) {
        focusView.classList.add('is-idle');
        requestAnimationFrame(() => {
          updateStadiumDimensions();
          setTimeout(updateStadiumDimensions, 100);
          setTimeout(updateStadiumDimensions, 300);
          setTimeout(updateStadiumDimensions, 700);
        });
      }
    }, 2000);
  }
}
