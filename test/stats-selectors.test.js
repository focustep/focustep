import {
  splitSessionByDays,
  getWeekMonday,
  getWeekDays,
  getPeakWindow,
  getWeekComparison,
  getDayDelta,
  getStreak,
  getBestDay,
  getPeriodStats,
  getBySubject,
  toLocalDateKey,
  formatDurationHM
} from '../modules/stats/selectors.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    failed++;
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    passed++;
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- RUNNING STATS SELECTOR TESTS ---\n');

// 1. Test Midnight Split
{
  // Session starts at 2026-10-10 23:45:00 and lasts 30 minutes (1800s)
  // Local time split: 15 mins (900s) on 2026-10-10, 15 mins (900s) on 2026-10-11
  const start = new Date(2026, 9, 10, 23, 45, 0, 0).getTime();
  const session = {
    id: 's_midnight',
    timestamp: start,
    durationSec: 1800,
    subjectId: 'math'
  };

  const segments = splitSessionByDays(session);
  assert(segments.length === 2, 'Session crossing midnight splits into 2 segments');
  assert(segments[0].dateKey === '2026-10-10', 'First segment dateKey matches start date');
  assert(segments[0].durationSec === 900, 'First segment duration is exactly 15 minutes (900s)');
  assert(segments[1].dateKey === '2026-10-11', 'Second segment dateKey matches next day');
  assert(segments[1].durationSec === 900, 'Second segment duration is exactly 15 minutes (900s)');
}

// 2. Test Week Monday Calculation
{
  // 2026-10-10 is Saturday (day 6 of week starting Mon Oct 5)
  const sat = new Date(2026, 9, 10, 14, 0, 0, 0);
  const mon = getWeekMonday(sat);
  assert(mon.getFullYear() === 2026 && mon.getMonth() === 9 && mon.getDate() === 5, 'Week monday for Oct 10 2026 is Oct 5 2026');
  assert(mon.getHours() === 0 && mon.getMinutes() === 0, 'Week monday starts at 00:00:00');
}

// 3. Test Week Days Attribution
{
  const subjects = [
    { id: 'math', name: 'Math', color: '#8b5cf6' },
    { id: 'english', name: 'English', color: '#f97316' }
  ];

  const weekMonday = new Date(2026, 9, 5, 0, 0, 0, 0); // Oct 5, 2026 (Mon)
  const now = new Date(2026, 9, 10, 12, 0, 0, 0); // Oct 10, 2026 (Sat)

  const sessions = [
    // Tuesday: 2 hours math
    { id: 's1', timestamp: new Date(2026, 9, 6, 10, 0).getTime(), durationSec: 7200, subjectId: 'math' },
    // Friday: 1 hour english
    { id: 's2', timestamp: new Date(2026, 9, 9, 14, 0).getTime(), durationSec: 3600, subjectId: 'english' }
  ];

  const weekDays = getWeekDays(weekMonday, sessions, subjects, now);
  assert(weekDays.length === 7, 'getWeekDays returns 7 days');
  assert(weekDays[1].totalSec === 7200, 'Tuesday has 7200s total');
  assert(weekDays[1].bySubject[0].subjectId === 'math', 'Tuesday has math');
  assert(weekDays[4].totalSec === 3600, 'Friday has 3600s total');
  assert(weekDays[5].isToday === true, 'Saturday is marked as isToday');
  assert(weekDays[6].isFuture === true, 'Sunday is marked as isFuture');
  assert(weekDays[0].isPast === true, 'Monday is marked as isPast');
}

// 4. Test Streak
{
  const now = new Date(2026, 9, 10, 12, 0, 0, 0);
  const sessions = [
    // Oct 8 (Thu), Oct 9 (Fri), Oct 10 (Sat)
    { id: '1', timestamp: new Date(2026, 9, 8, 10, 0).getTime(), durationSec: 3600, subjectId: 'math' },
    { id: '2', timestamp: new Date(2026, 9, 9, 10, 0).getTime(), durationSec: 3600, subjectId: 'math' },
    { id: '3', timestamp: new Date(2026, 9, 10, 10, 0).getTime(), durationSec: 3600, subjectId: 'math' }
  ];

  const weekStreak = getStreak('week', sessions, now);
  assert(weekStreak.daysCount === 3, 'Week streak counts 3 studied days');
  assert(weekStreak.text === '3 days', 'Streak formatted text is 3 days');

  const allStreak = getStreak('all', sessions, now);
  assert(allStreak.daysCount === 3, 'All-time streak consecutive count is 3 days');
}

// 5. Test Peak Window
{
  const weekMonday = new Date(2026, 9, 5, 0, 0, 0, 0);
  const sessions = [
    // 2 sessions at 21:15 and 22:00
    { id: '1', timestamp: new Date(2026, 9, 6, 21, 15).getTime(), durationSec: 3600, subjectId: 'math' },
    { id: '2', timestamp: new Date(2026, 9, 7, 22, 0).getTime(), durationSec: 3600, subjectId: 'math' }
  ];

  const peak = getPeakWindow(weekMonday, sessions);
  assert(peak.includes('21:00') || peak.includes('22:00'), `Peak 2-hour window correctly detected: ${peak}`);
}

// 6. Test Per-Day Comparison with Same Weekday Last Week
{
  const weekMonday = new Date(2026, 9, 5, 0, 0, 0, 0); // Oct 5, 2026 (Mon)
  const now = new Date(2026, 9, 7, 16, 0, 0, 0); // Wednesday Oct 7

  // 6.1: Today with sessions vs last same weekday (+100%)
  {
    const sessions = [
      // This Wednesday (2026-10-07): 2 hours (7200s)
      { id: '1', timestamp: new Date(2026, 9, 7, 10, 0).getTime(), durationSec: 7200, subjectId: 'math' },
      // Last Wednesday (2026-09-30): 1 hour (3600s)
      { id: '2', timestamp: new Date(2026, 8, 30, 10, 0).getTime(), durationSec: 3600, subjectId: 'math' }
    ];
    const delta = getDayDelta('2026-10-07', sessions, now);
    assert(delta === 100, 'Today with sessions vs last same weekday (+100%)');
    const days = getWeekDays(weekMonday, sessions, [], now);
    assert(days[2].deltaPct === 100, 'Wednesday deltaPct in getWeekDays is 100%');
  }

  // 6.2: A negative case (-50%)
  {
    const sessions = [
      // This Wednesday: 1 hour (3600s)
      { id: '1', timestamp: new Date(2026, 9, 7, 10, 0).getTime(), durationSec: 3600, subjectId: 'math' },
      // Last Wednesday: 2 hours (7200s)
      { id: '2', timestamp: new Date(2026, 8, 30, 10, 0).getTime(), durationSec: 7200, subjectId: 'math' }
    ];
    const delta = getDayDelta('2026-10-07', sessions, now);
    assert(delta === -50, 'A negative case (-50%)');
    const days = getWeekDays(weekMonday, sessions, [], now);
    assert(days[2].deltaPct === -50, 'Wednesday deltaPct in getWeekDays is -50%');
  }

  // 6.3: 0% case
  {
    const sessions = [
      // This Wednesday: 2 hours (7200s)
      { id: '1', timestamp: new Date(2026, 9, 7, 10, 0).getTime(), durationSec: 7200, subjectId: 'math' },
      // Last Wednesday: 2 hours (7200s)
      { id: '2', timestamp: new Date(2026, 8, 30, 10, 0).getTime(), durationSec: 7200, subjectId: 'math' }
    ];
    const delta = getDayDelta('2026-10-07', sessions, now);
    assert(delta === 0, '0% case');
    const days = getWeekDays(weekMonday, sessions, [], now);
    assert(days[2].deltaPct === 0, 'Wednesday deltaPct in getWeekDays is 0%');
  }

  // 6.4: Last week's same day is 0 (null)
  {
    const sessions = [
      // This Wednesday: 2 hours (7200s)
      { id: '1', timestamp: new Date(2026, 9, 7, 10, 0).getTime(), durationSec: 7200, subjectId: 'math' }
      // Last Wednesday: 0s
    ];
    const delta = getDayDelta('2026-10-07', sessions, now);
    assert(delta === null, "Last week's same day is 0 (null)");
    const days = getWeekDays(weekMonday, sessions, [], now);
    assert(days[2].deltaPct === null, 'Wednesday deltaPct in getWeekDays is null when last week is 0');
  }

  // 6.5: This day has no sessions (null)
  {
    const sessions = [
      // This Wednesday: 0s
      // Last Wednesday: 2 hours (7200s)
      { id: '1', timestamp: new Date(2026, 8, 30, 10, 0).getTime(), durationSec: 7200, subjectId: 'math' }
    ];
    const delta = getDayDelta('2026-10-07', sessions, now);
    assert(delta === null, 'This day has no sessions (null)');
    const days = getWeekDays(weekMonday, sessions, [], now);
    assert(days[2].deltaPct === null, 'Wednesday deltaPct in getWeekDays is null when this day has no sessions');
  }

  // 6.6: A future day (null)
  {
    const sessions = [
      // Last Thursday (2026-10-01): 2 hours (7200s)
      { id: '1', timestamp: new Date(2026, 9, 1, 10, 0).getTime(), durationSec: 7200, subjectId: 'math' }
    ];
    // This Thursday (2026-10-08) is a future day relative to now (Wednesday Oct 7)
    const delta = getDayDelta('2026-10-08', sessions, now);
    assert(delta === null, 'A future day (null)');
    const days = getWeekDays(weekMonday, sessions, [], now);
    assert(days[3].deltaPct === null, 'Future day deltaPct in getWeekDays is null');
  }

  // 6.7: A case where logging one more session changes the value
  {
    const initialSessions = [
      // This Wednesday: 1 hour (3600s)
      { id: 'w1', timestamp: new Date(2026, 9, 7, 10, 0).getTime(), durationSec: 3600, subjectId: 'math' },
      // Last Wednesday: 1 hour (3600s)
      { id: 'lw1', timestamp: new Date(2026, 8, 30, 10, 0).getTime(), durationSec: 3600, subjectId: 'math' }
    ];
    const initialDelta = getDayDelta('2026-10-07', initialSessions, now);
    assert(initialDelta === 0, 'Initial delta is 0% (3600 vs 3600)');

    // Log one more session today (Wednesday): +3600s -> total 7200s
    const updatedSessions = [
      ...initialSessions,
      { id: 'w2_new', timestamp: new Date(2026, 9, 7, 11, 0).getTime(), durationSec: 3600, subjectId: 'math' }
    ];
    const updatedDelta = getDayDelta('2026-10-07', updatedSessions, now);
    assert(updatedDelta === 100, 'A case where logging one more session changes the value (0% -> +100%)');
  }
}

// 7. Test Empty State
{
  const now = new Date(2026, 9, 10, 12, 0, 0, 0);
  const stats = getPeriodStats('week', [], [], now);
  assert(stats.studyTimeStr === '0m', 'Empty state study time is 0m');
  assert(stats.sessionsCount === 0, 'Empty state sessions is 0');
  assert(stats.streakStr === '0 days', 'Empty state streak is 0 days');
  assert(stats.bestDay === '–', 'Empty state best day is –');
  assert(stats.deltaPct === null, 'Empty state deltaPct is null (hidden)');
}

// 8. Test getBySubject exact parity with getWeekDays
{
  const weekMonday = new Date(2026, 9, 5, 0, 0, 0, 0);
  const now = new Date(2026, 9, 10, 12, 0, 0, 0); // Saturday
  const subjects = [
    { id: 'math', name: 'Math', color: '#8b5cf6' },
    { id: 'english', name: 'English', color: '#f97316' },
    { id: 'other', name: 'Other', color: '#4ec9b0' }
  ];

  const sessions = [
    // This week Tuesday: 2 hours math
    { id: '1', timestamp: new Date(2026, 9, 6, 14, 0).getTime(), durationSec: 7200, subjectId: 'math' },
    // This week Friday: 1 hour english
    { id: '2', timestamp: new Date(2026, 9, 9, 10, 0).getTime(), durationSec: 3600, subjectId: 'english' },
    // Last week: 3 hours math (must be ignored in this week's getBySubject)
    { id: '3', timestamp: new Date(2026, 8, 30, 10, 0).getTime(), durationSec: 10800, subjectId: 'math' },
    // Next week: 4 hours english (must be ignored in this week's getBySubject)
    { id: '4', timestamp: new Date(2026, 9, 13, 10, 0).getTime(), durationSec: 14400, subjectId: 'english' }
  ];

  const days = getWeekDays(weekMonday, sessions, subjects, now);
  const weekSum = days.reduce((acc, d) => acc + d.totalSec, 0);
  const bySubj = getBySubject('week', sessions, subjects, now);

  assert(weekSum === 10800, 'Sum of weekDays totalSec is exactly 3 hours (10800s)');
  assert(bySubj.totalPeriodSec === weekSum, 'getBySubject totalPeriodSec matches getWeekDays exactly (10800s)');
  assert(bySubj.subjects[0].id === 'math' && bySubj.subjects[0].timeSec === 7200, 'Math has 7200s in this week');
  assert(bySubj.subjects[1].id === 'english' && bySubj.subjects[1].timeSec === 3600, 'English has 3600s in this week');
  assert(bySubj.subjects[2].id === 'other' && bySubj.subjects[2].timeSec === 0, 'Other has 0s');

  const comp = getWeekComparison(weekMonday, sessions, now);
  assert(comp.fullWeekTotalSec === 10800, 'fullWeekTotalSec is 10800s');
  assert(comp.dailyAverageSec > 0, 'dailyAverageSec is computed accurately');
}

console.log(`\n🎉 ALL ${passed} TESTS PASSED SUCCESSFULLY!`);
