export function pad2(n) {
  return String(n).padStart(2, '0');
}

export function dateKey(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

export function todayKey(prefix) {
  return prefix + '_' + dateKey(new Date());
}

export function fmt(s) {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':');
}

export function fmtShort(s) {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

export function fmtMS(s) {
  s = Math.max(0, Math.round(s));
  return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60);
}

export function fmtHM(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return pad2(h) + ':' + pad2(m);
}

export function clampInt(v, min, max) {
  v = parseInt(v, 10);
  if (isNaN(v)) v = 0;
  return Math.max(min, Math.min(max, v));
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getDayData(ds) {
  let timer = null, dayTodos = [];
  try {
    const tRaw = localStorage.getItem('timer_' + ds);
    if (tRaw) timer = JSON.parse(tRaw);
  } catch(e){}
  try {
    const nRaw = localStorage.getItem('notes_' + ds);
    if (nRaw) {
      const p = JSON.parse(nRaw);
      if (Array.isArray(p)) dayTodos = p;
    }
  } catch(e){}
  return { timer, todos: dayTodos };
}

export function getDayStatus(ds, defaultBaseSec = 10800) {
  const { timer } = getDayData(ds);
  if (!timer) return 'none';
  const t = timer.total ?? defaultBaseSec;
  const r = timer.remaining ?? t;
  if (r <= 0) return 'done';
  if (r < t) return 'partial';
  return 'none';
}
