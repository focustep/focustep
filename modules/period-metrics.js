/**
 * Period Switcher & 4 Metric Cards Component for Stats & Goals (Focustep)
 * Matches Mockups 1 & 2:
 * - Period Switcher Capsule: Week | Month | All time
 *   Active: off-white pill #f4f2ea, bold dark text, smooth transitions
 * - Metric Cards:
 *   1) Study time: total focus time + small teal delta chip (+X% vs last period)
 *   2) Sessions: count of completed sessions
 *   3) Streak: streak count + inline SVG flame icon (no emoji)
 *   4) Best day: short weekday in Week, localized date in Month/All time, "–" if no data
 */

import { statsStore } from './stats/store.js';
import { getPeriodStats } from './stats/selectors.js';
import { renderThisWeekCard } from './stats/this-week.js';
import { renderBySubjectCard } from './stats/by-subject.js';
import { tr, getLang } from './i18n.js';

export function setPeriod(period) {
  statsStore.setActivePeriod(period);
  renderOverviewMetrics();
  renderBySubjectCard();
}

export function getPeriod() {
  return statsStore.getActivePeriod();
}

export function renderOverviewMetrics() {
  const period = statsStore.getActivePeriod();
  const sessions = statsStore.getSessions();
  const subjects = statsStore.getSubjects();
  const locale = (tr() && tr().localeCode) || 'en-US';

  const stats = getPeriodStats(period, sessions, subjects, new Date(), locale);

  const studyTimeEl = document.getElementById('metric-study-time');
  const studyDeltaEl = document.getElementById('metric-study-delta');
  const sessionsEl = document.getElementById('metric-sessions');
  const streakEl = document.getElementById('metric-streak');
  const bestDayEl = document.getElementById('metric-best-day');

  if (studyTimeEl) studyTimeEl.textContent = stats.studyTimeStr;

  if (studyDeltaEl) {
    if (stats.deltaPct !== null) {
      studyDeltaEl.style.display = 'inline-flex';
      studyDeltaEl.textContent = `${stats.deltaPct >= 0 ? '+' : ''}${stats.deltaPct}%`;
      studyDeltaEl.className = `stats-metric-delta-chip ${stats.deltaPct >= 0 ? 'positive' : 'negative'}`;
    } else {
      studyDeltaEl.style.display = 'none';
    }
  }

  if (sessionsEl) sessionsEl.textContent = String(stats.sessionsCount);
  if (streakEl) streakEl.textContent = stats.streakStr;
  if (bestDayEl) bestDayEl.textContent = stats.bestDay;

  // Update active pill button
  document.querySelectorAll('.stats-period-pill-btn').forEach(btn => {
    const p = btn.dataset.period;
    if (p === period) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });
}

export function initPeriodMetrics() {
  const pillContainer = document.getElementById('stats-period-switcher');
  if (pillContainer && !pillContainer._initialized) {
    pillContainer._initialized = true;
    pillContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.stats-period-pill-btn');
      if (!btn) return;
      const period = btn.dataset.period;
      if (period) {
        setPeriod(period);
      }
    });
  }

  // Subscribe to central store
  statsStore.subscribe(() => {
    renderOverviewMetrics();
    renderThisWeekCard();
    renderBySubjectCard();
  });

  renderOverviewMetrics();
}
