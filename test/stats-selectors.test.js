import {
  splitSessionByDays,
  getWeekMonday,
  getWeekDays,
  getPeakWindow,
  getWeekComparison,
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

// 6. Test Week Comparison & Delta
{
  const weekMonday = new Date(2026, 9, 5, 0, 0, 0, 0);
  const now = new Date(2026, 9, 10, 12, 0, 0, 0);

  const sessions = [
    // This week: 10 hours
    { id: '1', timestamp: new Date(2026, 9, 6, 10, 0).getTime(), durationSec: 36000, subjectId: 'math' },
    // Last week (Sep 29): 5 hours
    { id: '2', timestamp: new Date(2026, 8, 29, 10, 0).getTime(), durationSec: 18000, subjectId: 'math' }
  ];

  const comp = getWeekComparison(weekMonday, sessions, now);
  assert(comp.thisWeekTotalSec === 36000, 'This week total is 36000s');
  assert(comp.lastWeekTotalSec === 18000, 'Last week total is 18000s');
  assert(comp.deltaPct === 100, 'Delta percentage is +100% vs last week');
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
