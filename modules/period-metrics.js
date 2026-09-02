import { getSessions, getGoalForSubject } from './subjects.js';
import { renderBySubjectCard } from './by-subject.js';

let currentPeriod = 'week'; // 'week' | 'month' | 'all'

const dayNamesWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNamesEnglish = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function setPeriod(period) {
  currentPeriod = period;
  renderOverviewMetrics();
  renderBySubjectCard();
}

export function getPeriod() {
  return currentPeriod;
}

function formatDurationMetrics(totalSec) {
  totalSec = Math.max(0, Math.round(totalSec));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
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

function getFormattedDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function checkGoalMetOnDate(dateObj, allSessions) {
  const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0, 0).getTime();
  const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59, 999).getTime();

  const daySessions = allSessions.filter(s => s.timestamp >= startOfDay && s.timestamp <= endOfDay);
  if (daySessions.length === 0) return false;

  const subjectTotalsSec = {};
  daySessions.forEach(s => {
    if (s.subjectId) {
      subjectTotalsSec[s.subjectId] = (subjectTotalsSec[s.subjectId] || 0) + (s.durationSec || 0);
    }
  });

  const subjectIds = Object.keys(subjectTotalsSec);
  for (const sid of subjectIds) {
    const targetMin = getGoalForSubject(sid);
    if (targetMin > 0 && subjectTotalsSec[sid] >= targetMin * 60) {
      return true; // Goal met for at least 1 subject
    }
  }
  return false;
}

function computeStreakForPeriod(period, allSessions) {
  if (period === 'week') {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0, 0);

    let metDaysCount = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      if (checkGoalMetOnDate(d, allSessions)) {
        metDaysCount++;
      }
    }
    return `${metDaysCount} ${metDaysCount === 1 ? 'day' : 'days'}`;
  } else if (period === 'month') {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let metDaysCount = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      if (checkGoalMetOnDate(d, allSessions)) {
        metDaysCount++;
      }
    }
    return `${metDaysCount} ${metDaysCount === 1 ? 'day' : 'days'}`;
  } else {
    // All time max consecutive streak
    if (allSessions.length === 0) {
      return '0 days';
    }

    const dateMetMap = {};
    allSessions.forEach(s => {
      const d = new Date(s.timestamp);
      const key = getFormattedDateKey(d);
      if (!(key in dateMetMap)) {
        dateMetMap[key] = checkGoalMetOnDate(d, allSessions);
      }
    });

    const metDateKeys = Object.keys(dateMetMap)
      .filter(k => dateMetMap[k])
      .sort();

    let maxStreak = 0;
    let currentStreak = 0;
    let prevTs = null;

    metDateKeys.forEach(key => {
      const [y, m, day] = key.split('-').map(Number);
      const ts = new Date(y, m - 1, day).getTime();

      if (prevTs === null) {
        currentStreak = 1;
      } else {
        const diffDays = Math.round((ts - prevTs) / (24 * 3600 * 1000));
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
      prevTs = ts;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    });

    return `${maxStreak} ${maxStreak === 1 ? 'day' : 'days'}`;
  }
}

function computeBestDayForPeriod(period, filteredSessions) {
  if (filteredSessions.length === 0) return '-';

  const daySecMap = {};

  filteredSessions.forEach(s => {
    if (!s.timestamp || !s.durationSec) return;
    const d = new Date(s.timestamp);
    const key = getFormattedDateKey(d);
    if (!daySecMap[key]) {
      daySecMap[key] = {
        totalSec: 0,
        dateObj: new Date(d.getFullYear(), d.getMonth(), d.getDate())
      };
    }
    daySecMap[key].totalSec += s.durationSec;
  });

  let maxSec = 0;
  let bestDateObj = null;

  Object.values(daySecMap).forEach(item => {
    if (item.totalSec > maxSec) {
      maxSec = item.totalSec;
      bestDateObj = item.dateObj;
    }
  });

  if (!bestDateObj || maxSec <= 0) return '-';

  if (period === 'week') {
    return dayNamesWeek[bestDateObj.getDay()];
  } else if (period === 'month') {
    const dayNum = bestDateObj.getDate();
    const monthName = monthNamesEnglish[bestDateObj.getMonth()];
    return `${dayNum} ${monthName}`;
  } else {
    // All time
    const currentYear = new Date().getFullYear();
    const dayNum = bestDateObj.getDate();
    const monthName = monthNamesEnglish[bestDateObj.getMonth()];
    const year = bestDateObj.getFullYear();

    if (year === currentYear) {
      return `${dayNum} ${monthName}`;
    } else {
      return `${dayNum} ${monthName} ${year}`;
    }
  }
}

export function computePeriodStats(period = currentPeriod) {
  const sessions = getSessions();
  const startTs = getStartOfPeriodTimestamp(period);

  const filteredSessions = sessions.filter(s => s.timestamp >= startTs);

  let totalStudySec = 0;
  filteredSessions.forEach(s => {
    totalStudySec += (s.durationSec || 0);
  });

  const streakStr = computeStreakForPeriod(period, sessions);
  const bestDayStr = computeBestDayForPeriod(period, filteredSessions);

  return {
    studyTimeStr: formatDurationMetrics(totalStudySec),
    sessionsCount: filteredSessions.length,
    streakStr: streakStr,
    bestDay: bestDayStr
  };
}

export function renderOverviewMetrics() {
  const stats = computePeriodStats(currentPeriod);

  const studyTimeEl = document.getElementById('metric-study-time');
  const sessionsEl = document.getElementById('metric-sessions');
  const streakEl = document.getElementById('metric-streak');
  const bestDayEl = document.getElementById('metric-best-day');

  if (studyTimeEl) studyTimeEl.textContent = stats.studyTimeStr;
  if (sessionsEl) sessionsEl.textContent = String(stats.sessionsCount);
  if (streakEl) streakEl.textContent = stats.streakStr;
  if (bestDayEl) bestDayEl.textContent = stats.bestDay;

  // Update active pill button
  document.querySelectorAll('.stats-period-pill-btn').forEach(btn => {
    const p = btn.dataset.period;
    if (p === currentPeriod) {
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
  if (pillContainer) {
    pillContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.stats-period-pill-btn');
      if (!btn) return;
      const period = btn.dataset.period;
      if (period && period !== currentPeriod) {
        setPeriod(period);
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('focustep:sessionLogged', () => {
      renderOverviewMetrics();
    });
    window.addEventListener('focustep:statsUpdated', () => {
      renderOverviewMetrics();
    });
  }

  renderOverviewMetrics();
}

