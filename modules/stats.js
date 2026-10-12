import { tr } from './i18n.js';
import { fmtHM, dateKey, getDayData, getDayStatus } from './helpers.js';
import { getBase } from './timer.js';
import { initActivityFeed, renderActivityFeed, updateActivityCardHeight } from './activity.js';
import { initPeriodMetrics, renderOverviewMetrics } from './period-metrics.js';
import { initSubjectModal } from './subject-modal.js';
import { initThisWeekCard, renderThisWeekCard } from './stats/this-week.js';
import { initBySubjectCard, renderBySubjectCard } from './stats/by-subject.js';
import { statsStore } from './stats/store.js';
import { getEffectiveNow } from './stats/time.js';

export function computeWeekTotal() {
  const now = getEffectiveNow();
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
  const now = getEffectiveNow();
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
  statsStore.loadState();
  renderOverviewMetrics();
  renderThisWeekCard();
  renderBySubjectCard();
  renderActivityFeed();
  updateActivityCardHeight();
}

export function renderGoal() {
  // Legacy no-op: Daily Goal was removed from Stats & Goals
}

let statsSubscribed = false;

export function initStats() {
  renderStats();
  initActivityFeed();
  initPeriodMetrics();
  initSubjectModal();
  initThisWeekCard();
  initBySubjectCard();

  if (!statsSubscribed) {
    statsSubscribed = true;
    statsStore.subscribe(() => {
      renderOverviewMetrics();
      renderThisWeekCard();
      renderBySubjectCard();
      renderActivityFeed();
    });
  }
}
