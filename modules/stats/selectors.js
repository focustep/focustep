import { getEffectiveNow } from './time.js';
import { getLang } from '../i18n.js';

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

export function formatTimeHM(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatIntervalsText(intervals = []) {
  if (!intervals || intervals.length === 0) return '';
  return intervals.map(inv => {
    const s = formatTimeHM(inv.start);
    const e = formatTimeHM(inv.end);
    if (!s && !e) return '';
    if (s && e) return `${s} – ${e}`;
    return s || e;
  }).filter(Boolean).join(', ');
}

/**
 * Splits a session that crosses local midnight into individual day segments
 * Returns array of: { dateKey, durationSec, subjectId, originalSessionId, startTimestamp, endTimestamp }
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
        originalSessionId: session.id,
        startTimestamp: currentStart,
        endTimestamp: segEnd
      });
    }

    currentStart = segEnd;
  }

  return segments;
}

/**
 * Returns the Monday 00:00:00.000 local time of the week containing the given date
 */
export function getWeekMonday(date = getEffectiveNow()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day, 0, 0, 0, 0);
}

/**
 * Returns start of current period timestamp in local time
 */
export function getStartOfPeriodTimestamp(period, now = getEffectiveNow()) {
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
export function getWeekDays(weekMonday = getWeekMonday(), sessions = [], subjects = [], now = getEffectiveNow()) {
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
      if (!bySubjectMap.has(seg.subjectId)) {
        bySubjectMap.set(seg.subjectId, {
          durationSec: 0,
          intervals: []
        });
      }
      const entry = bySubjectMap.get(seg.subjectId);
      entry.durationSec += seg.durationSec;
      if (seg.startTimestamp && seg.endTimestamp) {
        entry.intervals.push({
          start: seg.startTimestamp,
          end: seg.endTimestamp
        });
      }
    });

    // Subject breakdown sorted by duration
    const bySubject = [];
    bySubjectMap.forEach((entry, sid) => {
      const subj = subjectMap.get(sid) || { name: 'Other', color: '#4ec9b0' };
      
      // Sort intervals chronologically
      entry.intervals.sort((a, b) => a.start - b.start);

      // Merge overlapping/contiguous intervals (e.g. paused/resumed within 60s)
      const merged = [];
      for (const inv of entry.intervals) {
        if (merged.length === 0) {
          merged.push({ start: inv.start, end: inv.end });
        } else {
          const prev = merged[merged.length - 1];
          if (inv.start <= prev.end + 60000) {
            prev.end = Math.max(prev.end, inv.end);
          } else {
            merged.push({ start: inv.start, end: inv.end });
          }
        }
      }

      const timeRangeText = formatIntervalsText(merged);

      bySubject.push({
        subjectId: sid,
        subjectName: subj.name,
        color: subj.color,
        timeSec: entry.durationSec,
        intervals: merged,
        timeRangeText
      });
    });
    bySubject.sort((a, b) => b.timeSec - a.timeSec);

    // Last week ghost total
    const lastWeekSegments = dayMapThisWeek.get(lastWeekKey) || [];
    let lastWeekTotalSec = 0;
    lastWeekSegments.forEach(seg => {
      lastWeekTotalSec += seg.durationSec;
    });

    let deltaPct = null;
    if (totalSec > 0 && lastWeekTotalSec > 0 && !isFuture) {
      deltaPct = Math.round(((totalSec - lastWeekTotalSec) / lastWeekTotalSec) * 100);
    }

    days.push({
      date: dateObj,
      dateKey,
      dayIndex: i, // 0 = Mon, 6 = Sun
      isToday,
      isPast,
      isFuture,
      totalSec,
      bySubject,
      lastWeekTotalSec,
      deltaPct
    });
  }

  return days;
}

/**
 * Selector: getDayDelta(dateKey, sessions, now)
 * Compares dateKey's total study seconds against the same weekday last week
 * dayDeltaPct = Math.round((thisDaySec - lastWeekSameDaySec) / lastWeekSameDaySec * 100)
 * Returns number when BOTH thisDaySec > 0 AND lastWeekSameDaySec > 0, otherwise null
 */
export function getDayDelta(dateKey, sessions = [], now = getEffectiveNow()) {
  if (!dateKey) return null;
  const parts = typeof dateKey === 'string' ? dateKey.split('-').map(Number) : [dateKey.getFullYear(), dateKey.getMonth() + 1, dateKey.getDate()];
  const thisDate = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  if (thisDate > nowDate) return null; // future day is null

  const lastWeekDate = new Date(parts[0], parts[1] - 1, parts[2] - 7, 0, 0, 0, 0);
  const thisKey = toLocalDateKey(thisDate);
  const lastKey = toLocalDateKey(lastWeekDate);

  let thisDaySec = 0;
  let lastWeekSameDaySec = 0;

  for (const s of sessions) {
    const segs = splitSessionByDays(s);
    for (const seg of segs) {
      if (seg.dateKey === thisKey) {
        thisDaySec += seg.durationSec;
      } else if (seg.dateKey === lastKey) {
        lastWeekSameDaySec += seg.durationSec;
      }
    }
  }

  if (thisDaySec > 0 && lastWeekSameDaySec > 0) {
    return Math.round(((thisDaySec - lastWeekSameDaySec) / lastWeekSameDaySec) * 100);
  }
  return null;
}

/**
 * Selector: getPeakWindow(weekMonday, sessions)
 * Calculates the 2-hour window of the day with the most focus time this week
 */
export function getPeakWindow(weekMonday = getWeekMonday(), sessions = []) {
  const weekStartTs = weekMonday.getTime();
  const weekEndTs = weekStartTs + 7 * 86400000;

  // Filter sessions touching this week
  const weekSessions = sessions.filter(s => {
    const end = (Number(s.timestamp) || 0) + (Number(s.durationSec) || 0) * 1000;
    return end > weekStartTs && (Number(s.timestamp) || 0) < weekEndTs;
  });
  if (weekSessions.length === 0) return '–';

  // 24 one-hour buckets
  const hourlyBuckets = new Array(24).fill(0);

  weekSessions.forEach(s => {
    const start = Math.max(Number(s.timestamp) || 0, weekStartTs);
    const end = Math.min((Number(s.timestamp) || 0) + (Number(s.durationSec) || 0) * 1000, weekEndTs);
    if (end <= start) return;

    let cur = start;
    while (cur < end) {
      const curDate = new Date(cur);
      const curHour = curDate.getHours();
      const nextHour = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), curHour + 1, 0, 0, 0).getTime();
      const sliceEnd = Math.min(end, nextHour);
      const sliceSec = Math.round((sliceEnd - cur) / 1000);
      hourlyBuckets[curHour] += sliceSec;
      cur = sliceEnd;
    }
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
export function getWeekComparison(weekMonday = getWeekMonday(), sessions = [], now = getEffectiveNow()) {
  const daysThisWeek = getWeekDays(weekMonday, sessions, [], now);
  
  // Let N = today's weekday index in the week (Monday = 1 ... Sunday = 7), local time
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const N = ((dayOfWeek + 6) % 7) + 1; // 1 = Mon ... 7 = Sun

  // Elapsed days: for current week, day-aligned span Monday up to and including today (N); for past weeks, all 7 days
  const isCurrentWeek = toLocalDateKey(weekMonday) === toLocalDateKey(getWeekMonday(now));
  const elapsedDayCount = isCurrentWeek ? N : 7;

  let thisPeriodSec = 0;
  let lastPeriodSec = 0;
  let fullWeekTotalSec = 0;
  let fullLastWeekTotalSec = 0;

  for (let i = 0; i < 7; i++) {
    fullWeekTotalSec += daysThisWeek[i].totalSec;
    fullLastWeekTotalSec += daysThisWeek[i].lastWeekTotalSec;
    if (i < elapsedDayCount) {
      thisPeriodSec += daysThisWeek[i].totalSec;
      lastPeriodSec += daysThisWeek[i].lastWeekTotalSec;
    }
  }

  // Visibility rules: render the delta text ONLY when BOTH are true:
  // a) the user has completed at least 1 session this week (today or earlier days of this week: thisPeriodSec > 0)
  // b) lastPeriodSec > 0 (there is something to compare against)
  // Otherwise deltaPct = null
  let deltaPct = null;
  if (thisPeriodSec > 0 && lastPeriodSec > 0) {
    deltaPct = Math.round(((thisPeriodSec - lastPeriodSec) / lastPeriodSec) * 100);
  }

  // Daily average for this week
  const daysForAvg = Math.max(1, elapsedDayCount);
  const totalForAvg = Math.max(thisPeriodSec, fullWeekTotalSec);
  const dailyAverageSec = Math.round(totalForAvg / daysForAvg);

  // Longest session touching this week
  const weekStartTs = weekMonday.getTime();
  const weekEndTs = weekStartTs + 7 * 86400000;
  let longestSessionSec = 0;
  sessions.forEach(s => {
    const end = (Number(s.timestamp) || 0) + (Number(s.durationSec) || 0) * 1000;
    if (end > weekStartTs && (Number(s.timestamp) || 0) < weekEndTs) {
      const dur = Number(s.durationSec) || 0;
      if (dur > longestSessionSec) {
        longestSessionSec = dur;
      }
    }
  });

  return {
    thisWeekTotalSec: thisPeriodSec,
    thisPeriodSec,
    fullWeekTotalSec,
    lastWeekTotalSec: lastPeriodSec,
    lastPeriodSec,
    fullLastWeekTotalSec,
    deltaPct,
    dailyAverageSec,
    longestSessionSec
  };
}

/**
 * Selector: getStreak(period, sessions, now)
 */
export function getStreak(period = 'week', sessions = [], now = getEffectiveNow()) {
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
 * Selector: getBestDay(period, sessions, now, locale, weekOffset)
 */
export function getBestDay(period = 'week', sessions = [], now = getEffectiveNow(), locale = 'en-US', weekOffset = 0) {
  let filterFn;
  if (period === 'week') {
    const baseMonday = getWeekMonday(now);
    const monday = new Date(baseMonday.getFullYear(), baseMonday.getMonth(), baseMonday.getDate() + weekOffset * 7, 0, 0, 0, 0);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    const startKey = toLocalDateKey(monday);
    const endKey = toLocalDateKey(sunday);
    filterFn = (dateKey) => dateKey >= startKey && dateKey <= endKey;
  } else if (period === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const startKey = toLocalDateKey(new Date(year, month, 1));
    const endKey = toLocalDateKey(new Date(year, month + 1, 0));
    filterFn = (dateKey) => dateKey >= startKey && dateKey <= endKey;
  } else {
    filterFn = () => true;
  }

  const dayTotals = new Map();
  sessions.forEach(sess => {
    const segs = splitSessionByDays(sess);
    segs.forEach(seg => {
      if (filterFn(seg.dateKey)) {
        dayTotals.set(seg.dateKey, (dayTotals.get(seg.dateKey) || 0) + seg.durationSec);
      }
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
 * Selector: getPeriodStats(period, sessions, subjects, now, locale, weekOffset)
 */
export function getPeriodStats(period = 'week', sessions = [], subjects = [], now = getEffectiveNow(), locale = 'en-US', weekOffset = 0) {
  const bySubjectData = getBySubject(period, sessions, subjects, now, weekOffset);
  const studyTimeSec = bySubjectData.totalPeriodSec;

  // Calculate delta percentage vs previous period
  let deltaPct = null;
  if (period === 'week') {
    const baseMonday = getWeekMonday(now);
    const targetMonday = new Date(baseMonday.getFullYear(), baseMonday.getMonth(), baseMonday.getDate() + weekOffset * 7, 0, 0, 0, 0);
    const comp = getWeekComparison(targetMonday, sessions, now);
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

    const startKey = toLocalDateKey(new Date(lastMonthYear, lastMonth, 1));
    const endKey = toLocalDateKey(new Date(lastMonthYear, lastMonth, targetDay));

    let lastMonthSec = 0;
    sessions.forEach(sess => {
      const segs = splitSessionByDays(sess);
      segs.forEach(seg => {
        if (seg.dateKey >= startKey && seg.dateKey <= endKey) {
          lastMonthSec += seg.durationSec;
        }
      });
    });

    if (lastMonthSec > 0) {
      deltaPct = Math.round(((studyTimeSec - lastMonthSec) / lastMonthSec) * 100);
    }
  }

  // Count unique sessions that contributed to this period
  const uniqueSessionIds = new Set();
  if (period === 'week') {
    const baseMonday = getWeekMonday(now);
    const monday = new Date(baseMonday.getFullYear(), baseMonday.getMonth(), baseMonday.getDate() + weekOffset * 7, 0, 0, 0, 0);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    const startKey = toLocalDateKey(monday);
    const endKey = toLocalDateKey(sunday);
    sessions.forEach(sess => {
      splitSessionByDays(sess).forEach(seg => {
        if (seg.dateKey >= startKey && seg.dateKey <= endKey) {
          uniqueSessionIds.add(seg.originalSessionId);
        }
      });
    });
  } else if (period === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const startKey = toLocalDateKey(new Date(year, month, 1));
    const endKey = toLocalDateKey(new Date(year, month + 1, 0));
    sessions.forEach(sess => {
      splitSessionByDays(sess).forEach(seg => {
        if (seg.dateKey >= startKey && seg.dateKey <= endKey) {
          uniqueSessionIds.add(seg.originalSessionId);
        }
      });
    });
  } else {
    sessions.forEach(sess => {
      if ((sess.durationSec || 0) > 0) uniqueSessionIds.add(sess.id);
    });
  }

  const streak = getStreak(period, sessions, now);
  const bestDay = getBestDay(period, sessions, now, locale, weekOffset);

  return {
    studyTimeSec,
    studyTimeStr: formatDurationHM(studyTimeSec),
    deltaPct, // null for All time or when prev period was 0
    sessionsCount: uniqueSessionIds.size,
    streakCount: streak.daysCount,
    streakStr: streak.text,
    bestDay
  };
}

/**
 * Selector: getBySubject(period, sessions, subjects, now, weekOffset)
 */
export function getBySubject(period = 'week', sessions = [], subjects = [], now = getEffectiveNow(), weekOffset = 0) {
  const lang = getLang();
  let filterFn;

  if (period === 'week') {
    const baseMonday = getWeekMonday(now);
    const monday = new Date(baseMonday.getFullYear(), baseMonday.getMonth(), baseMonday.getDate() + weekOffset * 7, 0, 0, 0, 0);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    const startKey = toLocalDateKey(monday);
    const endKey = toLocalDateKey(sunday);
    filterFn = (dateKey) => dateKey >= startKey && dateKey <= endKey;
  } else if (period === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const startKey = toLocalDateKey(new Date(year, month, 1));
    const endKey = toLocalDateKey(new Date(year, month + 1, 0));
    filterFn = (dateKey) => dateKey >= startKey && dateKey <= endKey;
  } else {
    filterFn = () => true;
  }

  let totalPeriodSec = 0;
  const timeMap = new Map();

  sessions.forEach(sess => {
    const segs = splitSessionByDays(sess);
    segs.forEach(seg => {
      if (filterFn(seg.dateKey)) {
        totalPeriodSec += seg.durationSec;
        timeMap.set(seg.subjectId, (timeMap.get(seg.subjectId) || 0) + seg.durationSec);
      }
    });
  });

  const subjectList = subjects.map(s => {
    const timeSec = timeMap.get(s.id) || 0;
    const sharePct = totalPeriodSec > 0 ? (timeSec / totalPeriodSec) * 100 : 0;
    const localizedName = (s.names && s.names[lang]) || s.name;
    return {
      id: s.id,
      name: localizedName,
      rawName: s.name,
      names: s.names,
      color: s.color || '#4ec9b0',
      icon: s.icon || 'more-horizontal',
      timeSec,
      formattedTime: formatDurationHM(timeSec),
      sharePct
    };
  });

  // Sort by time descending; 0m subjects last, then alphabetical
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
