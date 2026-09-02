import { tr } from './i18n.js';
import { fmt, dateKey, getDayData, getDayStatus } from './helpers.js';
import { getBase } from './timer.js';

let calMonth = new Date();
calMonth.setDate(1);
let selectedDate = dateKey(new Date());

export function computeStreak() {
  let streak = 0;
  let d = new Date();
  if (getDayStatus(dateKey(d), getBase()) !== 'done') d.setDate(d.getDate() - 1);
  while (getDayStatus(dateKey(d), getBase()) === 'done') {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function renderStreak() {
  const streakBadge = document.getElementById('streak-badge');
  if (!streakBadge) return;
  const s = computeStreak();
  streakBadge.innerHTML = s > 0 ? tr().streakActive(s) : tr().streakNone;
}

export function renderCalendar() {
  const calMonthLabel = document.getElementById('cal-month-label');
  const calGrid = document.getElementById('cal-grid');
  if (!calMonthLabel || !calGrid) return;

  calMonthLabel.textContent = calMonth.toLocaleDateString(tr().localeCode, { month: 'long', year: 'numeric' });
  calGrid.innerHTML = '';
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = dateKey(new Date());

  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-cell empty';
    calGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const ds = dateKey(d);
    const status = getDayStatus(ds, getBase());
    const { timer } = getDayData(ds);
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cal-cell status-' + status
      + (ds === todayStr ? ' today' : '')
      + (ds === selectedDate ? ' selected' : '');
    cell.textContent = String(day);
    if (timer && timer.extraAdded > 0) {
      const dot = document.createElement('span');
      dot.className = 'extra-dot';
      cell.appendChild(dot);
    }
    cell.addEventListener('click', function() {
      selectedDate = ds;
      renderCalendar();
      renderDayDetail(ds);
    });
    calGrid.appendChild(cell);
  }

  renderStreak();
}

export function renderDayDetail(ds = selectedDate) {
  const dayDetail = document.getElementById('day-detail');
  if (!dayDetail) return;

  const { timer, todos: dayTodos } = getDayData(ds);
  const d = new Date(ds + 'T00:00:00');
  const dateLabel = d.toLocaleDateString(tr().localeCode, { weekday: 'long', day: 'numeric', month: 'long' });

  let statusText;
  if (!timer) {
    statusText = tr().noActivity;
  } else {
    const t = timer.total ?? getBase();
    const r = timer.remaining ?? t;
    const studied = Math.max(0, t - r);
    const status = getDayStatus(ds, getBase());
    let line = tr().studied + fmt(studied);
    if (status === 'done') line += tr().limitDone;
    else if (status === 'partial') line += tr().limitPartial;
    if (timer.extraAdded > 0) line += tr().extraAddedLine(timer.extraAdded);
    statusText = line;
  }

  let todosHtml = '';
  if (dayTodos.length === 0) {
    todosHtml = '<p class="day-detail-empty">' + tr().noPlan + '</p>';
  } else {
    todosHtml = '<div class="day-detail-todos">' + dayTodos.map(function(item){
      const safeText = String(item.text || '').replace(/</g, '&lt;');
      return '<div class="day-detail-todo' + (item.done ? ' checked' : '') + '">'
        + (item.done ? '✓' : '○') + ' ' + safeText + '</div>';
    }).join('') + '</div>';
  }

  dayDetail.innerHTML = '<p class="day-detail-date">' + dateLabel + '</p>'
    + '<p class="day-detail-status">' + statusText + '</p>' + todosHtml;
}

export function initCalendar() {
  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');

  if (calPrev) {
    calPrev.addEventListener('click', function() {
      calMonth.setMonth(calMonth.getMonth() - 1);
      renderCalendar();
    });
  }

  if (calNext) {
    calNext.addEventListener('click', function() {
      calMonth.setMonth(calMonth.getMonth() + 1);
      renderCalendar();
    });
  }

  renderCalendar();
  renderDayDetail(selectedDate);
}
