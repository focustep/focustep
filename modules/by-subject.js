import { getSubjects, getSessions, getSubjectName } from './subjects.js';
import { getPeriod } from './period-metrics.js';
import { getSubjectSvg } from './subjects-db.js';
import { standardIcons } from './subjects-db/standard-icons.js';

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

function polarPoint(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

/**
 * Generates an SVG path for a rounded radial petal segment
 */
function createPetalPath(cx, cy, rIn, rOut, startAngleDeg, endAngleDeg, cornerRadius = 8) {
  const spanDeg = endAngleDeg - startAngleDeg;
  if (spanDeg <= 0) return '';

  const cr = Math.min(cornerRadius, (rOut - rIn) / 2.5);
  const degIn = Math.min(spanDeg * 0.35, (cr / rIn) * (180 / Math.PI));
  const degOut = Math.min(spanDeg * 0.35, (cr / rOut) * (180 / Math.PI));

  const p1 = polarPoint(cx, cy, rIn + cr, startAngleDeg);
  const p1Corner = polarPoint(cx, cy, rIn, startAngleDeg);
  const p2 = polarPoint(cx, cy, rIn, startAngleDeg + degIn);

  const p3 = polarPoint(cx, cy, rIn, endAngleDeg - degIn);
  const p3Corner = polarPoint(cx, cy, rIn, endAngleDeg);
  const p4 = polarPoint(cx, cy, rIn + cr, endAngleDeg);

  const p5 = polarPoint(cx, cy, rOut - cr, endAngleDeg);
  const p5Corner = polarPoint(cx, cy, rOut, endAngleDeg);
  const p6 = polarPoint(cx, cy, rOut, endAngleDeg - degOut);

  const p7 = polarPoint(cx, cy, rOut, startAngleDeg + degOut);
  const p7Corner = polarPoint(cx, cy, rOut, startAngleDeg);
  const p8 = polarPoint(cx, cy, rOut - cr, startAngleDeg);

  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `Q ${p1Corner.x.toFixed(2)} ${p1Corner.y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `A ${rIn} ${rIn} 0 0 1 ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `Q ${p3Corner.x.toFixed(2)} ${p3Corner.y.toFixed(2)} ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    `L ${p5.x.toFixed(2)} ${p5.y.toFixed(2)}`,
    `Q ${p5Corner.x.toFixed(2)} ${p5Corner.y.toFixed(2)} ${p6.x.toFixed(2)} ${p6.y.toFixed(2)}`,
    `A ${rOut} ${rOut} 0 0 0 ${p7.x.toFixed(2)} ${p7.y.toFixed(2)}`,
    `Q ${p7Corner.x.toFixed(2)} ${p7Corner.y.toFixed(2)} ${p8.x.toFixed(2)} ${p8.y.toFixed(2)}`,
    'Z'
  ].join(' ');
}

export function renderBySubjectCard() {
  const containerEl = document.getElementById('by-subject-list');
  if (!containerEl) return;

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

  containerEl.innerHTML = '';

  if (subjects.length === 0) {
    containerEl.innerHTML = '<div class="by-subject-empty">No subjects available</div>';
    return;
  }

  // Calculate stats per subject
  let maxSubjectSec = 0;
  const subjectStats = subjects.map(subj => {
    const timeSec = subjectTimeMap.get(subj.id) || 0;
    if (timeSec > maxSubjectSec) maxSubjectSec = timeSec;
    const pct = totalPeriodSec > 0 ? Math.round((timeSec / totalPeriodSec) * 100) : 0;
    return {
      ...subj,
      timeSec,
      pct
    };
  });

  const count = subjectStats.length;
  const cx = 160;
  const cy = 160;
  const rIn = 48;
  const rOutMax = 146;
  const cornerRadius = 9;

  // Angular sizing
  const deltaAngle = 360 / count;
  const gapAngle = count >= 8 ? 3.5 : count >= 5 ? 5 : count >= 3 ? 7 : 10;

  let petalsSvgMarkup = '';

  subjectStats.forEach((item, index) => {
    const startAngle = index * deltaAngle + gapAngle / 2;
    const endAngle = (index + 1) * deltaAngle - gapAngle / 2;
    const midAngle = (startAngle + endAngle) / 2;
    const color = item.color || '#4ec9b0';

    // Track Petal (faint background)
    const trackPath = createPetalPath(cx, cy, rIn, rOutMax, startAngle, endAngle, cornerRadius);

    // Active Filled Progress Petal
    // Calculate progress fill radius
    let rFill = rIn;
    if (item.timeSec > 0) {
      // Relative fill proportion
      const ratio = totalPeriodSec > 0 ? (item.timeSec / totalPeriodSec) : 0;
      // Scale smoothly: minimum visible fill is 25%, maximum 100%
      const fillRatio = Math.min(1, Math.max(0.25, ratio * 1.5));
      rFill = rIn + (rOutMax - rIn) * fillRatio;
    }
    const fillPath = item.timeSec > 0 ? createPetalPath(cx, cy, rIn, rFill, startAngle, endAngle, cornerRadius) : '';

    // Icon Position inside the petal
    const iconR = rIn + 25;
    const iconPos = polarPoint(cx, cy, iconR, midAngle);
    const rawSvg = getSubjectSvg(item.icon) || getSubjectSvg(item.id) || standardIcons['book'] || '';

    // Extract SVG inner paths or wrap nicely
    const subjDisplayName = getSubjectName(item);
    petalsSvgMarkup += `
      <g class="by-subject-petal-group" 
         data-subject-id="${item.id}"
         data-subject-name="${encodeURIComponent(subjDisplayName)}"
         data-subject-color="${color}"
         data-subject-time="${formatSubjectDuration(item.timeSec)}"
         data-subject-pct="${item.pct}%"
         tabindex="0"
         role="button"
         aria-label="${subjDisplayName}: ${formatSubjectDuration(item.timeSec)} (${item.pct}%)">
        <!-- Track Petal -->
        <path class="by-subject-petal-track" d="${trackPath}" fill="${color}" />
        <!-- Progress Fill Petal -->
        ${fillPath ? `<path class="by-subject-petal-fill" d="${fillPath}" fill="${color}" />` : ''}
        <!-- Icon Overlay -->
        <g class="by-subject-petal-icon" transform="translate(${iconPos.x.toFixed(2)}, ${iconPos.y.toFixed(2)})">
          <g transform="translate(-10, -10)">
            ${rawSvg}
          </g>
        </g>
      </g>
    `;
  });

  const totalFormatted = formatSubjectDuration(totalPeriodSec);

  // Build the complete Apple Watch style Wheel and Grid
  const cardHtml = `
    <div class="by-subject-radial-wrapper">
      <!-- Radial Wheel Flower Chart -->
      <div class="by-subject-wheel-box">
        <svg class="by-subject-wheel-svg" viewBox="0 0 320 320" aria-hidden="true">
          <defs>
            <filter id="petalGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.35" />
            </filter>
          </defs>

          <!-- Petals Layer -->
          <g class="by-subject-petals-layer">
            ${petalsSvgMarkup}
          </g>

          <!-- Center Summary Hub -->
          <g class="by-subject-center-hub" id="by-subject-center-hub">
            <circle class="by-subject-center-bg" cx="${cx}" cy="${cy}" r="${rIn - 6}" />
            <text class="by-subject-center-sub" id="by-subject-center-sub" x="${cx}" y="${cy - 8}">Total</text>
            <text class="by-subject-center-val" id="by-subject-center-val" x="${cx}" y="${cy + 12}">${totalFormatted}</text>
          </g>
        </svg>
      </div>

      <!-- Subject Chips Legend Grid -->
      <div class="by-subject-chips-grid">
        ${subjectStats.map(item => {
          const color = item.color || '#4ec9b0';
          const svg = item.icon ? getSubjectSvg(item.icon) : (item.id === 'other' || item.id === 'math' || item.id === 'english' || item.id === 'physics' ? getSubjectSvg(item.id) : null);
          const iconHtml = svg ? svg : `<span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color}; box-shadow: 0 0 6px ${color}88;"></span>`;
          const subjDisplayName = getSubjectName(item);
          return `
            <div class="by-subject-chip" 
                 data-subject-id="${item.id}"
                 data-subject-color="${color}"
                 data-subject-name="${encodeURIComponent(subjDisplayName)}"
                 data-subject-time="${formatSubjectDuration(item.timeSec)}"
                 data-subject-pct="${item.pct}%"
                 data-tooltip="${subjDisplayName}: ${formatSubjectDuration(item.timeSec)} (${item.pct}%)">
              <div class="by-subject-chip-icon" style="background-color: ${color}20; color: ${color}; border-color: ${color}40;">
                ${iconHtml}
              </div>
              <div class="by-subject-chip-info">
                <span class="by-subject-chip-name">${subjDisplayName}</span>
                <span class="by-subject-chip-time">${formatSubjectDuration(item.timeSec)}</span>
              </div>
              <span class="by-subject-chip-pct" style="color: ${color};">${item.pct}%</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  containerEl.innerHTML = cardHtml;

  // Add Interactive Hover & Focus Handlers
  const petalGroups = containerEl.querySelectorAll('.by-subject-petal-group');
  const chipItems = containerEl.querySelectorAll('.by-subject-chip');
  const centerSub = containerEl.querySelector('#by-subject-center-sub');
  const centerVal = containerEl.querySelector('#by-subject-center-val');

  function setHoveredSubject(subjId, name, color, time, pct) {
    if (centerSub && centerVal) {
      centerSub.textContent = decodeURIComponent(name);
      centerSub.style.fill = color;
      centerVal.textContent = time;
    }

    petalGroups.forEach(pg => {
      const isMatch = pg.getAttribute('data-subject-id') === subjId;
      pg.classList.toggle('active-hover', isMatch);
      pg.classList.toggle('dimmed', !isMatch && Boolean(subjId));
    });

    chipItems.forEach(ch => {
      const isMatch = ch.getAttribute('data-subject-id') === subjId;
      ch.classList.toggle('active-hover', isMatch);
      ch.classList.toggle('dimmed', !isMatch && Boolean(subjId));
    });
  }

  function resetHoveredSubject() {
    if (centerSub && centerVal) {
      centerSub.textContent = 'Total';
      centerSub.style.fill = '';
      centerVal.textContent = totalFormatted;
    }

    petalGroups.forEach(pg => {
      pg.classList.remove('active-hover', 'dimmed');
    });

    chipItems.forEach(ch => {
      ch.classList.remove('active-hover', 'dimmed');
    });
  }

  petalGroups.forEach(pg => {
    const id = pg.getAttribute('data-subject-id');
    const name = pg.getAttribute('data-subject-name');
    const color = pg.getAttribute('data-subject-color');
    const time = pg.getAttribute('data-subject-time');
    const pct = pg.getAttribute('data-subject-pct');

    pg.addEventListener('mouseenter', () => setHoveredSubject(id, name, color, time, pct));
    pg.addEventListener('mouseleave', resetHoveredSubject);
    pg.addEventListener('focus', () => setHoveredSubject(id, name, color, time, pct));
    pg.addEventListener('blur', resetHoveredSubject);
    pg.addEventListener('click', () => setHoveredSubject(id, name, color, time, pct));
  });

  chipItems.forEach(ch => {
    const id = ch.getAttribute('data-subject-id');
    const name = ch.getAttribute('data-subject-name');
    const color = ch.getAttribute('data-subject-color');
    const time = ch.getAttribute('data-subject-time');
    const pct = ch.getAttribute('data-subject-pct');

    ch.addEventListener('mouseenter', () => setHoveredSubject(id, name, color, time, pct));
    ch.addEventListener('mouseleave', resetHoveredSubject);
    ch.addEventListener('click', () => setHoveredSubject(id, name, color, time, pct));
  });
}

export function initBySubjectCard() {
  renderBySubjectCard();
}
