import { tr } from './i18n.js';
import { fmtHM, dateKey, getDayData, getDayStatus } from './helpers.js';
import { getBase } from './timer.js';
import { initActivityFeed, renderActivityFeed } from './activity.js';
import { initPeriodMetrics, renderOverviewMetrics } from './period-metrics.js';
import { initSubjectModal } from './subject-modal.js';
import { renderThisWeekCard } from './stats/this-week.js';
import { initBySubjectCard, renderBySubjectCard } from './stats/by-subject.js';

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
  renderThisWeekCard();
  renderBySubjectCard();
  renderActivityFeed();
}

export function renderGoal() {
  // Legacy no-op: Daily Goal was removed from Stats & Goals
}

export function initStats() {
  renderStats();
  initActivityFeed();
  initPeriodMetrics();
  initSubjectModal();
  initBySubjectCard();
}
