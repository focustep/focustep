/**
 * Pure, memoized selectors for Stats & Goals
 *
 * Rules:
 * - Session attribution: Sessions crossing local midnight are split by day.
 * - Week starts on Monday 00:00:00 local time.
 * - Pure functions with explicit inputs (easy to test).
 */

export function formatDurationHM(totalSec) {
  totalSec = Math.max(0, Math.round(totalSec));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (h > 0) return `${h}h 00m`;
  return `${m}m`;
}

export function formatDurationShort(totalSec) {
  totalSec = Math.max(0, Math.round(totalSec));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function toLocalDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Splits a session that crosses local midnight into individual day segments
 * Returns array of: { dateKey, durationSec, subjectId, originalSessionId }
 */
export function splitSessionByDays(session) {
  const startTs = Number(session.timestamp) || 0;
  const durSec = Math.max(0, Math.round(Number(session.durationSec) || 0));
  if (durSec === 0) return [];

  const endTs = startTs + durSec * 1000;
  const segments = [];

  let currentStart = startTs;

  while (currentStart < endTs) {
    const curDate = new Date(currentStart);
    // Next midnight in local time
    const nextMidnight = new Date(
      curDate.getFullYear(),
      curDate.getMonth(),
      curDate.getDate() + 1,
      0, 0, 0, 0
    ).getTime();

    const segEnd = Math.min(endTs, nextMidnight);
    const segDurSec = Math.round((segEnd - currentStart) / 1000);

    if (segDurSec > 0) {
      segments.push({
        dateKey: toLocalDateKey(curDate),
        durationSec: segDurSec,
        subjectId: session.subjectId || 'other',
        originalSessionId: session.id
      });
    }

    currentStart = segEnd;
  }

  return segments;
}

/**
 * Returns the Monday 00:00:00.000 local time of the week containing the given date
 */
export function getWeekMonday(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day, 0, 0, 0, 0);
}

/**
 * Returns start of current period timestamp in local time
 */
export function getStartOfPeriodTimestamp(period, now = new Date()) {
  if (period === 'week') {
    return getWeekMonday(now).getTime();
  } else if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
  }
  return 0; // All time
}

/**
 * Selector: getWeekDays(weekMonday, sessions, subjects, now)
 * Returns 7 days (Mon..Sun) with stacked subject totals, last week's ghost totals, and states.
 */
export function getWeekDays(weekMonday = getWeekMonday(), sessions = [], subjects = [], now = new Date()) {
  const todayKey = toLocalDateKey(now);
  const days = [];

  // Index subjects for fast lookup
  const subjectMap = new Map();
  subjects.forEach(s => subjectMap.set(s.id, s));

  // Compute last week Monday
  const lastWeekMonday = new Date(weekMonday.getFullYear(), weekMonday.getMonth(), weekMonday.getDate() - 7, 0, 0, 0, 0);

  // Split all sessions into day segments
  const dayMapThisWeek = new Map();
  const dayMapLastWeek = new Map();

  sessions.forEach(sess => {
    const segs = splitSessionByDays(sess);
    segs.forEach(seg => {
      // Bucket into this week
      if (!dayMapThisWeek.has(seg.dateKey)) dayMapThisWeek.set(seg.dateKey, []);
      dayMapThisWeek.get(seg.dateKey).push(seg);
    });
  });

  for (let i = 0; i < 7; i++) {
    const dateObj = new Date(weekMonday.getFullYear(), weekMonday.getMonth(), weekMonday.getDate() + i, 0, 0, 0, 0);
    const dateKey = toLocalDateKey(dateObj);

    // Corresponding day last week
    const lastWeekDateObj = new Date(lastWeekMonday.getFullYear(), lastWeekMonday.getMonth(), lastWeekMonday.getDate() + i, 0, 0, 0, 0);
    const lastWeekKey = toLocalDateKey(lastWeekDateObj);

    // Check relationship with today
    const isToday = dateKey === todayKey;
    const isPast = dateObj.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const isFuture = dateObj.getTime() > new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // Sum this day
    const segments = dayMapThisWeek.get(dateKey) || [];
    let totalSec = 0;
    const bySubjectMap = new Map();

    segments.forEach(seg => {
      totalSec += seg.durationSec;
      bySubjectMap.set(seg.subjectId, (bySubjectMap.get(seg.subjectId) || 0) + seg.durationSec);
    });

    // Subject breakdown sorted by duration
    const bySubject = [];
    bySubjectMap.forEach((timeSec, sid) => {
      const subj = subjectMap.get(sid) || { name: 'Other', color: '#4ec9b0' };
      bySubject.push({
        subjectId: sid,
        subjectName: subj.name,
        color: subj.color,
        timeSec
      });
    });
    bySubject.sort((a, b) => b.timeSec - a.timeSec);

    // Last week ghost total
    const lastWeekSegments = dayMapThisWeek.get(lastWeekKey) || [];
    let lastWeekTotalSec = 0;
    lastWeekSegments.forEach(seg => {
      lastWeekTotalSec += seg.durationSec;
    });

    days.push({
      date: dateObj,
      dateKey,
      dayIndex: i, // 0 = Mon, 6 = Sun
      isToday,
      isPast,
      isFuture,
      totalSec,
      bySubject,
      lastWeekTotalSec
    });
  }

  return days;
}

/**
 * Selector: getPeakWindow(weekMonday, sessions)
 * Calculates the 2-hour window of the day with the most focus time this week
 */
export function getPeakWindow(weekMonday = getWeekMonday(), sessions = []) {
  const weekStartTs = weekMonday.getTime();
  const weekEndTs = weekStartTs + 7 * 86400000;

  // Filter sessions in this week
  const weekSessions = sessions.filter(s => s.timestamp >= weekStartTs && s.timestamp < weekEndTs);
  if (weekSessions.length === 0) return '–';

  // 24 one-hour buckets
  const hourlyBuckets = new Array(24).fill(0);

  weekSessions.forEach(s => {
    const d = new Date(s.timestamp);
    const hour = d.getHours();
    hourlyBuckets[hour] += (s.durationSec || 0);
  });

  // Find max 2-hour sliding window
  let maxSec = -1;
  let bestStartHour = 0;

  for (let h = 0; h < 24; h++) {
    const nextH = (h + 1) % 24;
    const windowSec = hourlyBuckets[h] + hourlyBuckets[nextH];
    if (windowSec > maxSec) {
      maxSec = windowSec;
      bestStartHour = h;
    }
  }

  if (maxSec <= 0) return '–';

  const endH = (bestStartHour + 2) % 24;
  const startStr = String(bestStartHour).padStart(2, '0') + ':00';
  const endStr = String(endH).padStart(2, '0') + ':00';
  return `${startStr} – ${endStr}`;
}

/**
 * Selector: getWeekComparison(weekMonday, sessions, now)
 * Compares this week's total up to now with last week's total for the same elapsed days
 */
export function getWeekComparison(weekMonday = getWeekMonday(), sessions = [], now = new Date()) {
  const daysThisWeek = getWeekDays(weekMonday, sessions, [], now);
  
  // Elapsed days including today (1..7)
  const elapsedDayCount = Math.min(7, Math.max(1, ((now.getDay() + 6) % 7) + 1));

  let thisWeekTotalSec = 0;
  let lastWeekTotalSec = 0;

  for (let i = 0; i < elapsedDayCount; i++) {
    thisWeekTotalSec += daysThisWeek[i].totalSec;
    lastWeekTotalSec += daysThisWeek[i].lastWeekTotalSec;
  }

  let deltaPct = null;
  if (lastWeekTotalSec > 0) {
    deltaPct = Math.round(((thisWeekTotalSec - lastWeekTotalSec) / lastWeekTotalSec) * 100);
  }

  // Daily average for this week
  const dailyAverageSec = Math.round(thisWeekTotalSec / elapsedDayCount);

  // Longest session this week
  const weekStartTs = weekMonday.getTime();
  const weekEndTs = weekStartTs + 7 * 86400000;
  let longestSessionSec = 0;
  sessions.forEach(s => {
    if (s.timestamp >= weekStartTs && s.timestamp < weekEndTs) {
      if ((s.durationSec || 0) > longestSessionSec) {
        longestSessionSec = s.durationSec;
      }
    }
  });

  return {
    thisWeekTotalSec,
    lastWeekTotalSec,
    deltaPct,
    dailyAverageSec,
    longestSessionSec
  };
}

/**
 * Selector: getStreak(period, sessions, now)
 */
export function getStreak(period = 'week', sessions = [], now = new Date()) {
  if (sessions.length === 0) return { daysCount: 0, text: '0 days' };

  // Collect days with active study (>= 60s)
  const dayTotals = new Map();
  sessions.forEach(sess => {
    const segs = splitSessionByDays(sess);
    segs.forEach(seg => {
      dayTotals.set(seg.dateKey, (dayTotals.get(seg.dateKey) || 0) + seg.durationSec);
    });
  });

  if (period === 'week') {
    const monday = getWeekMonday(now);
    let met = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const key = toLocalDateKey(d);
      if ((dayTotals.get(key) || 0) >= 60) met++;
    }
    return { daysCount: met, text: `${met} ${met === 1 ? 'day' : 'days'}` };
  } else if (period === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let met = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const key = toLocalDateKey(new Date(year, month, day));
      if ((dayTotals.get(key) || 0) >= 60) met++;
    }
    return { daysCount: met, text: `${met} ${met === 1 ? 'day' : 'days'}` };
  } else {
    // All time longest consecutive streak
    const metKeys = Array.from(dayTotals.entries())
      .filter(([_, sec]) => sec >= 60)
      .map(([k]) => k)
      .sort();

    let maxStreak = 0;
    let currentStreak = 0;
    let prevTs = null;

    metKeys.forEach(key => {
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
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    });

    return { daysCount: maxStreak, text: `${maxStreak} ${maxStreak === 1 ? 'day' : 'days'}` };
  }
}

/**
 * Selector: getBestDay(period, sessions, now, locale)
 */
export function getBestDay(period = 'week', sessions = [], now = new Date(), locale = 'en-US') {
  const startTs = getStartOfPeriodTimestamp(period, now);
  const relevantSessions = sessions.filter(s => s.timestamp >= startTs);

  if (relevantSessions.length === 0) return '–';

  const dayTotals = new Map();
  relevantSessions.forEach(sess => {
    const segs = splitSessionByDays(sess);
    segs.forEach(seg => {
      dayTotals.set(seg.dateKey, (dayTotals.get(seg.dateKey) || 0) + seg.durationSec);
    });
  });

  let maxSec = 0;
  let bestDateKey = null;

  dayTotals.forEach((sec, key) => {
    if (sec > maxSec) {
      maxSec = sec;
      bestDateKey = key;
    }
  });

  if (!bestDateKey || maxSec <= 0) return '–';

  const [y, m, day] = bestDateKey.split('-').map(Number);
  const dateObj = new Date(y, m - 1, day);

  if (period === 'week') {
    return dateObj.toLocaleDateString(locale, { weekday: 'short' });
  } else if (period === 'month') {
    return dateObj.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  } else {
    const currentYear = now.getFullYear();
    if (dateObj.getFullYear() === currentYear) {
      return dateObj.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    }
    return dateObj.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

/**
 * Selector: getPeriodStats(period, sessions, subjects, now, locale)
 */
export function getPeriodStats(period = 'week', sessions = [], subjects = [], now = new Date(), locale = 'en-US') {
  const startTs = getStartOfPeriodTimestamp(period, now);
  const relevantSessions = sessions.filter(s => s.timestamp >= startTs);

  let studyTimeSec = 0;
  relevantSessions.forEach(s => {
    studyTimeSec += (s.durationSec || 0);
  });

  // Calculate delta percentage vs previous period
  let deltaPct = null;
  if (period === 'week') {
    const comp = getWeekComparison(getWeekMonday(now), sessions, now);
    deltaPct = comp.deltaPct;
  } else if (period === 'month') {
    // Compare this month up to now vs last month up to same day
    const year = now.getFullYear();
    const month = now.getMonth();
    const curDay = now.getDate();

    const lastMonthYear = month === 0 ? year - 1 : year;
    const lastMonth = month === 0 ? 11 : month - 1;
    const lastMonthDays = new Date(lastMonthYear, lastMonth + 1, 0).getDate();
    const targetDay = Math.min(curDay, lastMonthDays);

    const lastMonthStartTs = new Date(lastMonthYear, lastMonth, 1, 0, 0, 0, 0).getTime();
    const lastMonthEndTs = new Date(lastMonthYear, lastMonth, targetDay, now.getHours(), now.getMinutes(), now.getSeconds()).getTime();

    let lastMonthSec = 0;
    sessions.forEach(s => {
      if (s.timestamp >= lastMonthStartTs && s.timestamp <= lastMonthEndTs) {
        lastMonthSec += (s.durationSec || 0);
      }
    });

    if (lastMonthSec > 0) {
      deltaPct = Math.round(((studyTimeSec - lastMonthSec) / lastMonthSec) * 100);
    }
  }

  const streak = getStreak(period, sessions, now);
  const bestDay = getBestDay(period, sessions, now, locale);

  return {
    studyTimeSec,
    studyTimeStr: formatDurationHM(studyTimeSec),
    deltaPct, // null for All time or when prev period was 0
    sessionsCount: relevantSessions.length,
    streakCount: streak.daysCount,
    streakStr: streak.text,
    bestDay
  };
}

/**
 * Selector: getBySubject(period, sessions, subjects, now)
 */
export function getBySubject(period = 'week', sessions = [], subjects = [], now = new Date()) {
  const startTs = getStartOfPeriodTimestamp(period, now);
  const relevantSessions = sessions.filter(s => s.timestamp >= startTs);

  let totalPeriodSec = 0;
  const timeMap = new Map();

  relevantSessions.forEach(s => {
    const dur = s.durationSec || 0;
    totalPeriodSec += dur;
    timeMap.set(s.subjectId, (timeMap.get(s.subjectId) || 0) + dur);
  });

  const subjectList = subjects.map(s => {
    const timeSec = timeMap.get(s.id) || 0;
    const sharePct = totalPeriodSec > 0 ? (timeSec / totalPeriodSec) * 100 : 0;
    return {
      id: s.id,
      name: s.name,
      names: s.names,
      color: s.color || '#4ec9b0',
      icon: s.icon || 'more-horizontal',
      timeSec,
      formattedTime: formatDurationHM(timeSec),
      sharePct
    };
  });

  // Sort by time descending; 0m subjects last
  subjectList.sort((a, b) => {
    if (b.timeSec !== a.timeSec) {
      return b.timeSec - a.timeSec;
    }
    return a.name.localeCompare(b.name);
  });

  return {
    totalPeriodSec,
    formattedTotal: formatDurationHM(totalPeriodSec),
    subjects: subjectList
  };
}
