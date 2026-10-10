import { getSubjects, getSessions, getSubjectName } from './subjects.js';
import { getPeriod } from './period-metrics.js';
import { getSubjectSvg } from './subjects-db.js';
import { showTooltip, hideTooltip } from './tooltips.js';

function formatSubjectDuration(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0 && m > 0) {
    return `${h}h ${m}m`;
  } else if (h > 0) {
    return `${h}h 00m`;
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

// Cleanup tracker to eliminate memory leaks and dangling listeners across re-renders
let activeCleanup = null;

export function renderBySubjectCard() {
  const containerEl = document.getElementById('by-subject-list');
  if (!containerEl) return;

  // Execute and clear previous render cleanup if exists
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  const subjects = getSubjects();
  const sessions = getSessions();
  const period = getPeriod();
  const startTs = getStartOfPeriodTimestamp(period);

  // Fast single-pass calculation for session durations
  const subjectTimeMap = new Map();
  let totalPeriodSec = 0;

  for (let i = 0, len = sessions.length; i < len; i++) {
    const s = sessions[i];
    if (s.timestamp >= startTs) {
      const dur = s.durationSec || 0;
      totalPeriodSec += dur;
      subjectTimeMap.set(s.subjectId, (subjectTimeMap.get(s.subjectId) || 0) + dur);
    }
  }

  containerEl.innerHTML = '';

  if (subjects.length === 0) {
    containerEl.innerHTML = '<div class="by-subject-empty">No subjects available</div>';
    return;
  }

  // Precompute subject stats with localized names
  const subjectStats = new Array(subjects.length);
  for (let i = 0, len = subjects.length; i < len; i++) {
    const subj = subjects[i];
    const timeSec = subjectTimeMap.get(subj.id) || 0;
    subjectStats[i] = {
      ...subj,
      timeSec,
      displayName: getSubjectName(subj),
      formattedTime: formatSubjectDuration(timeSec)
    };
  }

  // Automatically sort subjects with the highest study time at the very top
  subjectStats.sort((a, b) => {
    if (b.timeSec !== a.timeSec) {
      return b.timeSec - a.timeSec;
    }
    return a.displayName.localeCompare(b.displayName);
  });

  const count = subjectStats.length;
  const isSingleColumn = count <= 3;
  const isScrollable = count >= 7;
  const gridClass = isSingleColumn ? 'single-column' : 'two-column';
  const scrollClass = isScrollable ? 'is-scrollable' : '';
  const totalFormatted = formatSubjectDuration(totalPeriodSec);

  // Generate lightweight neon outline ring SVG geometry (no expensive SVG filter tags)
  const rNeon = 71;
  const cNeon = 2 * Math.PI * rNeon;
  const nNeon = subjects.length;

  let neonArcsSvg = '';
  if (nNeon === 1) {
    const color = subjects[0].color || '#4ec9b0';
    neonArcsSvg = `
      <circle
        cx="74" cy="74" r="${rNeon}"
        fill="none"
        stroke="${color}"
        class="by-subject-neon-arc"
        data-subject-id="${subjects[0].id}"
      />
    `;
  } else if (nNeon > 1) {
    const segLength = cNeon / nNeon;
    const gap = Math.min(6, Math.max(3, segLength * 0.08));
    const dashLength = segLength - gap;

    neonArcsSvg = subjects.map((subj, i) => {
      const color = subj.color || '#4ec9b0';
      const offset = -i * segLength;
      return `
        <circle
          cx="74" cy="74" r="${rNeon}"
          fill="none"
          stroke="${color}"
          stroke-linecap="round"
          stroke-dasharray="${dashLength.toFixed(1)} ${(cNeon - dashLength).toFixed(1)}"
          stroke-dashoffset="${offset.toFixed(1)}"
          class="by-subject-neon-arc"
          data-subject-id="${subj.id}"
        />
      `;
    }).join('');
  }

  // Construct Layout HTML
  const cardHtml = `
    <div class="by-subject-layout" id="by-subject-layout">
      <!-- Left: Minimalist Flat Circle with Thin Neon Outline -->
      <div class="by-subject-circle-card" id="by-subject-circle-card">
        <svg class="by-subject-neon-ring-svg" viewBox="0 0 148 148" aria-hidden="true">
          ${neonArcsSvg}
        </svg>
        <div class="by-subject-circle-content">
          <span class="by-subject-circle-sub" id="by-subject-circle-sub">TOTAL</span>
          <span class="by-subject-circle-val" id="by-subject-circle-val">${totalFormatted}</span>
        </div>
      </div>

      <!-- Right: Subject Items Grid / List -->
      <div class="by-subject-items-wrapper ${scrollClass}" id="by-subject-items-wrapper">
        <div class="by-subject-grid ${gridClass}" id="by-subject-grid">
          ${subjectStats.map(item => {
            const color = item.color || '#4ec9b0';
            const svg = item.icon ? getSubjectSvg(item.icon) : (item.id === 'other' || item.id === 'math' || item.id === 'english' || item.id === 'physics' ? getSubjectSvg(item.id) : null);
            const iconHtml = svg ? svg : `<span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color}; box-shadow: 0 0 6px ${color}88;"></span>`;

            return `
              <div class="by-subject-chip" 
                   role="button"
                   tabindex="0"
                   aria-label="${item.displayName}: ${item.formattedTime}"
                   data-subject-id="${item.id}"
                   data-subject-color="${color}"
                   data-subject-name="${encodeURIComponent(item.displayName)}"
                   data-subject-time="${item.formattedTime}"
                   data-tooltip="${item.displayName}"
                   data-tooltip-pos="top">
                <div class="by-subject-chip-icon" style="background-color: ${color}20; color: ${color}; border-color: ${color}40;">
                  ${iconHtml}
                </div>
                <div class="by-subject-chip-info">
                  <span class="by-subject-chip-name">${item.displayName}</span>
                  <span class="by-subject-chip-time">${item.formattedTime}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  containerEl.innerHTML = cardHtml;

  // Cached DOM Node Lookups
  const layoutEl = containerEl.querySelector('#by-subject-layout');
  const gridEl = containerEl.querySelector('#by-subject-grid');
  const scrollWrapper = containerEl.querySelector('#by-subject-items-wrapper');
  const centerSub = containerEl.querySelector('#by-subject-circle-sub');
  const centerVal = containerEl.querySelector('#by-subject-circle-val');
  const cardEl = containerEl.closest('.stats-by-subject-card') || containerEl;

  // Fast O(1) Arc & Chip Map
  const arcMap = new Map();
  const chipMap = new Map();

  const neonArcs = containerEl.querySelectorAll('.by-subject-neon-arc');
  neonArcs.forEach(arc => {
    const id = arc.getAttribute('data-subject-id');
    if (id) arcMap.set(id, arc);
  });

  const chipElements = containerEl.querySelectorAll('.by-subject-chip');
  chipElements.forEach(ch => {
    const id = ch.getAttribute('data-subject-id');
    if (id) chipMap.set(id, ch);
  });

  // State tracking
  let currentHoveredId = null;
  let activeChip = null;
  let activeArc = null;

  function setHoveredSubject(subjId, name, color, time) {
    if (cardEl.classList.contains('is-scrolling')) return;
    if (currentHoveredId === subjId) return; // Prevent redundant DOM operations

    currentHoveredId = subjId;

    // Reset previous active chip & arc in O(1) without touching style attributes
    if (activeChip) {
      activeChip.classList.remove('active-hover');
      activeChip = null;
    }
    if (activeArc) {
      activeArc.classList.remove('active-hover');
      activeArc = null;
    }

    if (!subjId) {
      resetHoveredSubject();
      return;
    }

    // Update Circle center display
    if (centerSub && centerVal) {
      centerSub.textContent = decodeURIComponent(name);
      centerSub.style.color = color;
      centerSub.classList.add('is-hovered');
      centerVal.textContent = time;
    }

    // Pure CSS handles dimming and glow via classes (zero style reflows)
    layoutEl?.classList.add('has-hover');

    const targetChip = chipMap.get(subjId);
    if (targetChip) {
      targetChip.classList.add('active-hover');
      activeChip = targetChip;
    }

    const targetArc = arcMap.get(subjId);
    if (targetArc) {
      targetArc.classList.add('active-hover');
      activeArc = targetArc;
    }
  }

  function resetHoveredSubject() {
    if (currentHoveredId === null) return;
    currentHoveredId = null;

    if (centerSub && centerVal) {
      centerSub.textContent = 'TOTAL';
      centerSub.style.color = '';
      centerSub.classList.remove('is-hovered');
      centerVal.textContent = totalFormatted;
    }

    layoutEl?.classList.remove('has-hover');

    if (activeChip) {
      activeChip.classList.remove('active-hover');
      activeChip = null;
    }

    if (activeArc) {
      activeArc.classList.remove('active-hover');
      activeArc = null;
    }

    hideTooltip();
  }

  // --- Optimized Event Delegation on Grid Container ---
  const handleDelegatedOver = (e) => {
    const chip = e.target.closest('.by-subject-chip');
    if (!chip) return;

    const id = chip.getAttribute('data-subject-id');
    const name = chip.getAttribute('data-subject-name');
    const color = chip.getAttribute('data-subject-color');
    const time = chip.getAttribute('data-subject-time');

    setHoveredSubject(id, name, color, time);
  };

  const handleDelegatedOut = (e) => {
    const chip = e.target.closest('.by-subject-chip');
    if (!chip) return;

    const related = e.relatedTarget;
    if (chip.contains(related)) return;

    resetHoveredSubject();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const chip = e.target.closest('.by-subject-chip');
      if (chip) {
        e.preventDefault();
        const id = chip.getAttribute('data-subject-id');
        const name = chip.getAttribute('data-subject-name');
        const color = chip.getAttribute('data-subject-color');
        const time = chip.getAttribute('data-subject-time');
        setHoveredSubject(id, name, color, time);
      }
    }
  };

  if (gridEl) {
    gridEl.addEventListener('mouseover', handleDelegatedOver);
    gridEl.addEventListener('mouseout', handleDelegatedOut);
    gridEl.addEventListener('focusin', handleDelegatedOver);
    gridEl.addEventListener('focusout', handleDelegatedOut);
    gridEl.addEventListener('keydown', handleKeyDown);
  }

  // --- Optimized Cursor Tracking & RAF Stationary Detection ---
  let lastMouseX = -1;
  let lastMouseY = -1;

  const onMouseMove = (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  };
  cardEl.addEventListener('mousemove', onMouseMove, { passive: true });

  function checkAndRestoreHoverUnderCursor() {
    if (lastMouseX < 0 || lastMouseY < 0) return;

    requestAnimationFrame(() => {
      const el = document.elementFromPoint(lastMouseX, lastMouseY);
      const chip = el?.closest('.by-subject-chip');
      if (chip && containerEl.contains(chip)) {
        const id = chip.getAttribute('data-subject-id');
        const name = chip.getAttribute('data-subject-name');
        const color = chip.getAttribute('data-subject-color');
        const time = chip.getAttribute('data-subject-time');
        setHoveredSubject(id, name, color, time);

        const tipText = chip.getAttribute('data-tooltip');
        if (tipText) {
          showTooltip(chip, tipText, 'top');
        }
      } else {
        resetHoveredSubject();
      }
    });
  }

  // --- 120 FPS High-Performance Wheel Scrolling & Boundary Lock ---
  let onWheel = null;
  let onScroll = null;
  let scrollPauseTimer = null;

  if (isScrollable && scrollWrapper) {
    onWheel = (e) => {
      // Prevents outer page from jumping during scroll
      e.preventDefault();

      const maxScroll = scrollWrapper.scrollHeight - scrollWrapper.clientHeight;
      const isAtTop = scrollWrapper.scrollTop <= 1;
      const isAtBottom = scrollWrapper.scrollTop >= maxScroll - 1.5;

      const isScrollingUp = e.deltaY < 0;
      const isScrollingDown = e.deltaY > 0;

      // If already at top or bottom boundary, do not interrupt hover
      if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
        return;
      }

      // Direct zero-latency hardware scroll
      scrollWrapper.scrollTop += e.deltaY;

      if (!cardEl.classList.contains('is-scrolling')) {
        cardEl.classList.add('is-scrolling');
      }

      if (currentHoveredId !== null) {
        resetHoveredSubject();
      }
      hideTooltip();

      if (scrollPauseTimer) clearTimeout(scrollPauseTimer);
      scrollPauseTimer = setTimeout(() => {
        cardEl.classList.remove('is-scrolling');
        checkAndRestoreHoverUnderCursor();
      }, 130);
    };

    onScroll = () => {
      if (!cardEl.classList.contains('is-scrolling')) {
        cardEl.classList.add('is-scrolling');
      }

      if (currentHoveredId !== null) {
        resetHoveredSubject();
      }
      hideTooltip();

      if (scrollPauseTimer) clearTimeout(scrollPauseTimer);
      scrollPauseTimer = setTimeout(() => {
        cardEl.classList.remove('is-scrolling');
        checkAndRestoreHoverUnderCursor();
      }, 130);
    };

    cardEl.addEventListener('wheel', onWheel, { passive: false });
    scrollWrapper.addEventListener('scroll', onScroll, { passive: true });
  }

  // Clean-up registry for module memory isolation
  activeCleanup = () => {
    if (gridEl) {
      gridEl.removeEventListener('mouseover', handleDelegatedOver);
      gridEl.removeEventListener('mouseout', handleDelegatedOut);
      gridEl.removeEventListener('focusin', handleDelegatedOver);
      gridEl.removeEventListener('focusout', handleDelegatedOut);
      gridEl.removeEventListener('keydown', handleKeyDown);
    }
    cardEl.removeEventListener('mousemove', onMouseMove);
    if (onWheel) cardEl.removeEventListener('wheel', onWheel);
    if (onScroll && scrollWrapper) scrollWrapper.removeEventListener('scroll', onScroll);
    if (scrollPauseTimer) clearTimeout(scrollPauseTimer);
  };
}

export function initBySubjectCard() {
  renderBySubjectCard();
}
