import { initI18n, onLanguageChange } from './modules/i18n.js';
import { initUI } from './modules/ui.js';
import { initTheme } from './modules/theme.js';
import { initSound } from './modules/sound.js';
import { initNotifications } from './modules/notifications.js';
import { initPomodoro, updatePomodoroUI } from './modules/pomodoro.js';
import { initTimer, updateStartStopLabel, onTimerUpdate } from './modules/timer.js';
import { initTodos, renderTodos, setOnTodosChanged } from './modules/todos.js';
import { initCalendar, renderCalendar, renderDayDetail } from './modules/calendar.js';
import { initStats, renderStats, renderGoal } from './modules/stats.js';
import { initBackup } from './modules/backup.js';
import { initHeaderSpotlight } from './modules/spotlight.js';
import { initTooltips } from './modules/tooltips.js';
import { initTimerSubjectBadge, renderTimerSubjectBadge } from './modules/timer-subject-badge.js';

function refreshAllViews() {
  updateStartStopLabel();
  updatePomodoroUI();
  renderTodos();
  renderCalendar();
  renderDayDetail();
  renderStats();
  renderGoal();
  renderTimerSubjectBadge();
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Инициализация независимых систем
  initI18n();
  initUI();
  initTheme();
  initSound();
  initNotifications();
  initPomodoro();
  initHeaderSpotlight();
  initTooltips();
  initTimerSubjectBadge();

  // 2. Инициализация хранилищ и данных
  initTimer();
  initTodos();
  initCalendar();
  initStats();
  initBackup();

  // 3. Подписка на межмодульные события
  onLanguageChange(refreshAllViews);

  onTimerUpdate(() => {
    renderCalendar();
    renderDayDetail();
    renderStats();
    renderGoal();
  });

  setOnTodosChanged((dateKeyStr) => {
    renderDayDetail(dateKeyStr);
  });
});
