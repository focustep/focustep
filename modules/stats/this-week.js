/**
 * "This week" Chart Component for Stats & Goals (Focustep)
 * Matches Mockups 1 & 2:
 * - Stacked pill bars (Mon..Sun) by subject colors with 2px gap, clipped by pill shape
 * - Last week dashed ghost pill behind each bar
 * - Horizontal dashed average line with "avg Xh Ym"
 * - Past 0-time days: small dot. Future days: empty dashed ghost.
 * - Today: full color bar + soft glow, weekday label in #f4f2ea off-white pill
 * - Glass tooltip on hover/focus/tap (Tue · 2h 20m, rows of subjects)
 * - Click bar -> Calendar view
 * - 7-circle streak chain connected by 2px teal lines
 * - Insights panel (Peak time, Daily average, Longest session)
 * - Empty state with ghost bars, pulsing today ghost, centered "Your week starts here" + CTA
 */

import { statsStore } from './store.js';
import {
  getWeekMonday,
  getWeekDays,
  getWeekComparison,
  getPeakWindow,
  formatDurationHM,
  formatDurationShort
} from './selectors.js';
import { tr, getLang } from '../i18n.js';

function getWeekDateRangeStr(weekMonday, locale = 'en-US') {
  const sunday = new Date(weekMonday.getFullYear(), weekMonday.getMonth(), weekMonday.getDate() + 6);
  const startMonth = weekMonday.toLocaleDateString(locale, { month: 'short' });
  const startDay = weekMonday.getDate();
  const endMonth = sunday.toLocaleDateString(locale, { month: 'short' });
  const endDay = sunday.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} – ${endDay}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
}

export function renderThisWeekCard() {
  const container = document.getElementById('stats-this-week-card');
  if (!container) return;

  const now = new Date();
  const weekMonday = getWeekMonday(now);
  const sessions = statsStore.getSessions();
  const subjects = statsStore.getSubjects();

  const weekDays = getWeekDays(weekMonday, sessions, subjects, now);
  const weekComp = getWeekComparison(weekMonday, sessions, now);
  const peakWindow = getPeakWindow(weekMonday, sessions);

  const locale = (tr() && tr().localeCode) || 'en-US';
  const dateRangeStr = getWeekDateRangeStr(weekMonday, locale);

  const hasDataThisWeek = weekComp.thisWeekTotalSec > 0;

  // Max day total for Y-axis scale (minimum 60 minutes = 3600s so tiny weeks don't look huge)
  let maxDaySec = 3600;
  weekDays.forEach(d => {
    if (d.totalSec > maxDaySec) maxDaySec = d.totalSec;
    if (d.lastWeekTotalSec > maxDaySec) maxDaySec = d.lastWeekTotalSec;
  });

  const chartHeightPx = 150; // Max bar container height

  // Header markup
  const deltaBadgeHtml = (!hasDataThisWeek || weekComp.deltaPct === null)
    ? ''
    : `
      <div class="week-delta-chip ${weekComp.deltaPct >= 0 ? 'positive' : 'negative'}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          ${weekComp.deltaPct >= 0
            ? '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>'
            : '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>'}
        </svg>
        <span>${weekComp.deltaPct >= 0 ? '+' : ''}${weekComp.deltaPct}% ${tr().vsLastWeek || 'vs last week'}</span>
      </div>
    `;

  const headerHtml = `
    <div class="week-card-header">
      <div class="week-card-title-group">
        <h3 class="week-card-title">${tr().thisWeek || 'This week'}</h3>
        <span class="week-card-range">${dateRangeStr}</span>
      </div>
      <div class="week-card-header-right">
        ${hasDataThisWeek ? `
          <div class="week-legend-item">
            <span class="week-legend-ghost-pill" aria-hidden="true"></span>
            <span class="week-legend-label">${tr().lastWeek || 'last week'}</span>
          </div>
        ` : ''}
        ${deltaBadgeHtml}
      </div>
    </div>
  `;

  // Average line height calculation
  const avgHeightPx = Math.min(chartHeightPx - 6, Math.max(6, Math.round((weekComp.dailyAverageSec / maxDaySec) * chartHeightPx)));
  const avgStr = formatDurationHM(weekComp.dailyAverageSec);

  // Ghost bar template heights for Empty state
  const ghostHeightsEmpty = [42, 75, 30, 60, 85, 52, 38];

  // Render Body: Empty vs Populated
  let bodyHtml = '';

  if (!hasDataThisWeek) {
    // EMPTY STATE MOCKUP
    bodyHtml = `
      <div class="week-card-body is-empty">
        <div class="week-chart-area empty-full-width">
          <!-- 7 Ghost Bars -->
          <div class="week-bars-container" style="height: ${chartHeightPx}px;">
            ${weekDays.map((day, idx) => {
              const ghostH = ghostHeightsEmpty[idx];
              const isToday = day.isToday;
              return `
                <div class="week-bar-col ${isToday ? 'is-today' : ''}">
                  <div class="week-bar-track" style="height: ${chartHeightPx}px;">
                    <div class="week-bar-ghost-pill empty-ghost ${isToday ? 'today-pulse' : ''}" style="height: ${ghostH}%;"></div>
                  </div>
                </div>
              `;
            }).join('')}

            <!-- Centered Empty State Overlay -->
            <div class="week-empty-overlay">
              <h4 class="week-empty-title">${tr().weekEmptyTitle || 'Your week starts here'}</h4>
              <p class="week-empty-sub">${tr().weekEmptySub || "Log your first session and today's bar will grow."}</p>
              <button type="button" class="week-empty-start-btn" id="week-empty-start-btn">
                <span>${tr().startSession || 'Start a session'}</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <!-- Weekday Labels -->
          <div class="week-labels-row">
            ${weekDays.map((day) => {
              const dayShort = day.date.toLocaleDateString(locale, { weekday: 'short' });
              return `
                <div class="week-label-col">
                  <span class="week-day-label ${day.isToday ? 'today-pill' : ''}">${dayShort}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Streak Chain Row (7 Circles) -->
          <div class="week-streak-chain-row">
            ${renderStreakChain(weekDays)}
          </div>
        </div>
      </div>
    `;
  } else {
    // POPULATED STATE MOCKUP
    bodyHtml = `
      <div class="week-card-body">
        <!-- Left: Chart Area -->
        <div class="week-chart-area">
          <div class="week-bars-wrapper" style="height: ${chartHeightPx}px;">
            <!-- Horizontal Average Line -->
            ${weekComp.dailyAverageSec > 0 ? `
              <div class="week-avg-line" style="bottom: ${avgHeightPx}px;">
                <span class="week-avg-badge">${tr().avgLabel || 'avg'} ${avgStr}</span>
              </div>
            ` : ''}

            <!-- 7 Columns -->
            <div class="week-bars-container">
              ${weekDays.map((day) => {
                const totalSec = day.totalSec;
                const isToday = day.isToday;
                const isFuture = day.isFuture;
                const isPast = day.isPast;
                const hasTime = totalSec > 0;

                // Height percentage
                const barHeightPct = hasTime ? Math.min(100, Math.max(5, (totalSec / maxDaySec) * 100)) : 0;
                const ghostHeightPct = day.lastWeekTotalSec > 0 ? Math.min(100, Math.max(5, (day.lastWeekTotalSec / maxDaySec) * 100)) : 0;

                // Segments calculation
                let segmentsHtml = '';
                if (hasTime && day.bySubject.length > 0) {
                  segmentsHtml = day.bySubject.map((subj) => {
                    const segPct = Math.max(2, (subj.timeSec / totalSec) * 100);
                    return `
                      <div class="week-bar-segment" 
                           style="height: ${segPct}%; background-color: ${subj.color || '#3ddbb6'};"
                           data-subject-id="${subj.subjectId}"
                           title="${subj.subjectName}: ${formatDurationHM(subj.timeSec)}">
                      </div>
                    `;
                  }).join('');
                }

                // Tooltip rows
                const tooltipRows = day.bySubject.map(s => `
                  <div class="week-glass-tooltip-row">
                    <span class="week-tooltip-dot" style="background-color: ${s.color};"></span>
                    <span class="week-tooltip-subname">${s.subjectName}</span>
                    <span class="week-tooltip-subtime">${formatDurationHM(s.timeSec)}</span>
                  </div>
                `).join('');

                const dayShort = day.date.toLocaleDateString(locale, { weekday: 'short' });
                const dayFull = day.date.toLocaleDateString(locale, { weekday: 'long' });

                return `
                  <div class="week-bar-col ${isToday ? 'is-today' : ''} ${hasTime ? 'has-data' : ''}" 
                       data-date-key="${day.dateKey}"
                       tabindex="0"
                       role="button"
                       aria-label="${dayFull}: ${formatDurationHM(totalSec)}">
                    
                    <div class="week-bar-track">
                      <!-- Last week ghost outline pill -->
                      ${ghostHeightPct > 0 ? `
                        <div class="week-bar-ghost-pill" style="height: ${ghostHeightPct}%;"></div>
                      ` : (isFuture ? `
                        <div class="week-bar-ghost-pill future-ghost"></div>
                      ` : '')}

                      <!-- Main Day Bar Pill -->
                      ${hasTime ? `
                        <div class="week-bar-pill ${isToday ? 'today-glow' : ''}" style="height: ${barHeightPct}%;">
                          ${segmentsHtml}
                        </div>
                      ` : (isPast ? `
                        <div class="week-bar-zero-dot"></div>
                      ` : '')}
                    </div>

                    <!-- Glass Tooltip (On Hover / Focus) -->
                    ${hasTime ? `
                      <div class="week-glass-tooltip">
                        <div class="week-glass-tooltip-header">
                          <span class="week-tooltip-title">${dayShort} · ${formatDurationHM(totalSec)}</span>
                        </div>
                        <div class="week-glass-tooltip-body">
                          ${tooltipRows}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Weekday Labels -->
          <div class="week-labels-row">
            ${weekDays.map((day) => {
              const dayShort = day.date.toLocaleDateString(locale, { weekday: 'short' });
              return `
                <div class="week-label-col">
                  <span class="week-day-label ${day.isToday ? 'today-pill' : ''}">${dayShort}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Streak Chain Row (7 Circles) -->
          <div class="week-streak-chain-row">
            ${renderStreakChain(weekDays)}
          </div>
        </div>

        <!-- Right: Insights Panel (270px) -->
        <div class="week-insights-panel">
          <!-- 1. Peak time -->
          <div class="week-insight-card">
            <div class="week-insight-icon-box peak-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            </div>
            <div class="week-insight-info">
              <span class="week-insight-label">${tr().peakTime || 'Peak time'}</span>
              <span class="week-insight-value">${peakWindow}</span>
            </div>
          </div>

          <!-- 2. Daily average -->
          <div class="week-insight-card">
            <div class="week-insight-icon-box avg-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
            </div>
            <div class="week-insight-info">
              <span class="week-insight-label">${tr().dailyAverage || 'Daily average'}</span>
              <span class="week-insight-value">${formatDurationHM(weekComp.dailyAverageSec)}</span>
            </div>
          </div>

          <!-- 3. Longest session -->
          <div class="week-insight-card">
            <div class="week-insight-icon-box longest-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="week-insight-info">
              <span class="week-insight-label">${tr().longestSession || 'Longest session'}</span>
              <span class="week-insight-value">${formatDurationHM(weekComp.longestSessionSec)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = headerHtml + bodyHtml;

  // Click on Empty State CTA -> Switch to Timer View
  const emptyStartBtn = container.querySelector('#week-empty-start-btn');
  if (emptyStartBtn) {
    emptyStartBtn.addEventListener('click', () => {
      const logoBtn = document.getElementById('header-logo-btn') || document.getElementById('header-brand-text-btn');
      if (logoBtn) {
        logoBtn.click();
      } else {
        const statsSub = document.getElementById('stats-subview');
        const mainFrame = document.getElementById('focus-main-frame');
        if (statsSub) statsSub.style.display = 'none';
        if (mainFrame) mainFrame.style.display = '';
      }
    });
  }

  // Click on Day Bar -> Switch to Calendar & History view at that date
  const barCols = container.querySelectorAll('.week-bar-col[data-date-key]');
  barCols.forEach(col => {
    col.addEventListener('click', () => {
      const dateKey = col.getAttribute('data-date-key');
      openCalendarAtDate(dateKey);
    });
    col.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const dateKey = col.getAttribute('data-date-key');
        openCalendarAtDate(dateKey);
      }
    });
  });
}

/**
 * Renders the 7-circle streak chain connected by 2px teal lines
 */
function renderStreakChain(weekDays) {
  let html = '';

  for (let i = 0; i < 7; i++) {
    const day = weekDays[i];
    const isStudied = day.totalSec >= 60;
    const isToday = day.isToday;
    const isPast = day.isPast;
    const isFuture = day.isFuture;

    let circleClass = 'streak-chain-circle';
    let iconHtml = '';

    if (isStudied) {
      circleClass += ' is-studied';
      iconHtml = `
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="#0b0f12" stroke="#0b0f12"/>
        </svg>
      `;
    } else if (isFuture) {
      circleClass += ' is-future';
    } else {
      circleClass += ' is-unstudied';
    }

    if (isToday) {
      circleClass += ' is-today-ring';
    }

    // Connecting line to next day if both are studied
    let lineHtml = '';
    if (i < 6) {
      const nextDay = weekDays[i + 1];
      const isNextStudied = nextDay.totalSec >= 60;
      const isConnected = isStudied && isNextStudied;
      lineHtml = `<div class="streak-chain-line ${isConnected ? 'is-connected' : ''}"></div>`;
    }

    html += `
      <div class="streak-chain-node">
        <div class="${circleClass}">
          ${iconHtml}
        </div>
        ${lineHtml}
      </div>
    `;
  }

  return html;
}

function openCalendarAtDate(dateKey) {
  if (!dateKey) return;
  const navCalBtn = document.getElementById('nav-calendar-btn');
  if (navCalBtn) {
    navCalBtn.click();
    // Dispatch custom event to select date in calendar
    window.dispatchEvent(new CustomEvent('focustep:selectCalendarDate', { detail: { dateKey } }));
  }
}
