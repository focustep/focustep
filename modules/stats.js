import { tr } from './i18n.js';
import { fmtHM, dateKey, getDayData, getDayStatus } from './helpers.js';
import { getBase } from './timer.js';
import { initActivityFeed, renderActivityFeed } from './activity.js';
import { initPeriodMetrics, renderOverviewMetrics } from './period-metrics.js';
import { initDailyGoalCard, renderDailyGoalCard } from './daily-goal.js';
import { initSubjectModal } from './subject-modal.js';
import { initBySubjectCard, renderBySubjectCard } from './by-subject.js';

let goalDays = 20;
try {
  const g = localStorage.getItem('goal_days');
  if (g) goalDays = parseInt(g, 10) || 20;
} catch(e){}

export function computeWeekTotal() {
  const now = new Date();
  const offset = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - offset);
  let sec = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const { timer } = getDayData(dateKey(d));
    if (timer) {
      const t = timer.total ?? getBase();
      const r = timer.remaining ?? t;
      sec += Math.max(0, t - r);
    }
  }
  return sec;
}

export function computeMonthTotal() {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let sec = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const { timer } = getDayData(dateKey(new Date(year, month, day)));
    if (timer) {
      const t = timer.total ?? getBase();
      const r = timer.remaining ?? t;
      sec += Math.max(0, t - r);
    }
  }
  return sec;
}

export function renderStats() {
  renderOverviewMetrics();
  renderDailyGoalCard();
  renderBySubjectCard();
  renderActivityFeed();
}

export function computeMonthDoneDays() {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    if (getDayStatus(dateKey(new Date(year, month, day)), getBase()) === 'done') count++;
  }
  return count;
}

export function renderGoal() {
  const goalProgressFill = document.getElementById('goal-progress-fill');
  const goalStatus = document.getElementById('goal-status');
  const done = computeMonthDoneDays();
  const pct = Math.min(100, Math.round((done / goalDays) * 100));
  if (goalProgressFill) goalProgressFill.style.width = pct + '%';
  if (goalStatus) goalStatus.textContent = tr().goalStatus(done, goalDays);
}

export function initStats() {
  const goalInput = document.getElementById('goal-input');
  if (goalInput) {
    goalInput.value = goalDays;
    goalInput.addEventListener('change', function() {
      let v = parseInt(goalInput.value, 10);
      if (!v || v < 1) v = 1;
      if (v > 31) v = 31;
      goalDays = v;
      goalInput.value = v;
      try { localStorage.setItem('goal_days', String(v)); } catch(e){}
      renderGoal();
    });
  }

  renderStats();
  renderGoal();
  initActivityFeed();
  initPeriodMetrics();
  initDailyGoalCard();
  initSubjectModal();
  initBySubjectCard();
}
