import { getSubjects, getSessions } from './subjects.js';
import { getPeriod } from './period-metrics.js';

function formatSubjectDuration(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) {
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }
  return `${m}m`;
}

function getStartOfPeriodTimestamp(period) {
  const now = new Date();
  if (period === 'week') {
    const day = (now.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0, 0);
    return monday.getTime();
  } else if (period === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    return firstDay.getTime();
  }
  return 0; // All time
}

export function renderBySubjectCard() {
  const listEl = document.getElementById('by-subject-list');
  if (!listEl) return;

  const subjects = getSubjects();
  const sessions = getSessions();
  const period = getPeriod();
  const startTs = getStartOfPeriodTimestamp(period);

  // Filter sessions in current period
  const filteredSessions = sessions.filter(s => s.timestamp >= startTs);

  // Calculate total seconds per subject
  const subjectTimeMap = new Map();
  let totalPeriodSec = 0;

  filteredSessions.forEach(s => {
    const dur = s.durationSec || 0;
    totalPeriodSec += dur;
    const current = subjectTimeMap.get(s.subjectId) || 0;
    subjectTimeMap.set(s.subjectId, current + dur);
  });

  listEl.innerHTML = '';

  if (subjects.length === 0) {
    listEl.innerHTML = '<div class="by-subject-empty">No subjects available</div>';
    return;
  }

  // Calculate percentage and sort descending by time studied
  const subjectStats = subjects.map(subj => {
    const timeSec = subjectTimeMap.get(subj.id) || 0;
    const pct = totalPeriodSec > 0 ? Math.round((timeSec / totalPeriodSec) * 100) : 0;
    return {
      ...subj,
      timeSec,
      pct
    };
  });

  subjectStats.forEach(item => {
    const row = document.createElement('div');
    row.className = 'by-subject-row';
    row.setAttribute('data-tooltip', `${item.name}: ${formatSubjectDuration(item.timeSec)} (${item.pct}% of total focus)`);

    const color = item.color || '#4ec9b0';
    const barWidth = Math.max(item.pct > 0 ? 3 : 0, item.pct);

    row.innerHTML = `
      <div class="by-subject-row-header">
        <div class="by-subject-name-group">
          <span class="by-subject-dot" style="background-color: ${color};"></span>
          <span class="by-subject-name">${item.name}</span>
        </div>
        <div class="by-subject-time-group">
          <span class="by-subject-time">${formatSubjectDuration(item.timeSec)}</span>
          <span class="by-subject-pct">${item.pct}%</span>
        </div>
      </div>
      <div class="by-subject-bar-track">
        <div class="by-subject-bar-fill" style="width: ${barWidth}%; background-color: ${color};"></div>
      </div>
    `;

    listEl.appendChild(row);
  });
}

export function initBySubjectCard() {
  renderBySubjectCard();
}
