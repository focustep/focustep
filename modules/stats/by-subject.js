/**
 * "By subject" Card Component for Stats & Goals (Focustep)
 * Matches Mockups 1 & 2:
 * - Left: Segmented ring (SVG circle pathLength="100", stroke ~9, 1.6 gap, started at 12 o'clock)
 *   Center shows "TOTAL" + period's total time
 *   If total == 0: neutral gray track
 * - Right: Chips grid with container queries:
 *   - up to 3 subjects: 1 column, wide chips
 *   - 4 to 6 subjects: 2 columns, compact chips
 *   - > 6 subjects: 2 columns, max-height 3 rows, vertical scroll, thin scrollbar, bottom fade gradient
 *   - < ~520px container: 1 column
 *   - single chip in last row spans full width (grid-column: 1 / -1)
 *   - sorted by time descending, 0m subjects last and dimmed
 * - Hover/focus on chip or ring segment: highlights segment, dims others, center shows subject name & time
 * - Click chip: toggles filtering Activity list by that subject!
 */

import { statsStore } from './store.js';
import { getEffectiveNow } from './time.js';
import { getBySubject, formatDurationHM } from './selectors.js';
import { getSubjectSvg } from '../subjects-db.js';
import { tr, getLang } from '../i18n.js';

let activeCleanup = null;

export function renderBySubjectCard() {
  const container = document.getElementById('by-subject-list');
  if (!container) return;

  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  const period = statsStore.getActivePeriod();
  const sessions = statsStore.getSessions();
  const subjects = statsStore.getSubjects();
  const activeFilterId = statsStore.getSubjectFilter();
  const weekOffset = statsStore.getWeekOffset();

  const data = getBySubject(period, sessions, subjects, getEffectiveNow(), weekOffset);
  const totalSec = data.totalPeriodSec;
  const formattedTotal = data.formattedTotal;
  const subjectList = data.subjects;

  const count = subjectList.length;
  const isScrollable = count > 6;

  // Build Segmented SVG Ring (pathLength="100")
  const rRing = 54;
  const strokeWidth = 9;
  const gap = 1.6;

  let ringSvgMarkup = '';

  const activeSubjects = subjectList.filter(s => s.timeSec > 0);

  if (totalSec <= 0 || activeSubjects.length === 0) {
    // Neutral gray track
    ringSvgMarkup = `
      <circle
        cx="75" cy="75" r="${rRing}"
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        stroke-width="${strokeWidth}"
        class="by-subject-empty-ring"
      />
    `;
  } else if (activeSubjects.length === 1) {
    // Single subject: full solid ring without gap
    const s = activeSubjects[0];
    ringSvgMarkup = `
      <circle
        cx="75" cy="75" r="${rRing}"
        pathLength="100"
        fill="none"
        stroke="${s.color || '#4ec9b0'}"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
        stroke-dasharray="100 0"
        stroke-dashoffset="0"
        class="by-subject-segment"
        data-subject-id="${s.id}"
        tabindex="0"
        role="button"
        aria-label="${s.name}: ${s.formattedTime} (100%)"
      />
    `;
  } else {
    // Multiple subjects: proportional segments with 1.6% gap
    let accumulatedOffset = 0;

    const segmentsMarkup = activeSubjects.map(s => {
      const share = s.sharePct;
      const dash = Math.max(0.6, share - gap);
      const offset = -accumulatedOffset;
      accumulatedOffset += share;

      return `
        <circle
          cx="75" cy="75" r="${rRing}"
          pathLength="100"
          fill="none"
          stroke="${s.color || '#4ec9b0'}"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
          stroke-dasharray="${dash.toFixed(2)} ${(100 - dash).toFixed(2)}"
          stroke-dashoffset="${offset.toFixed(2)}"
          class="by-subject-segment"
          data-subject-id="${s.id}"
          tabindex="0"
          role="button"
          aria-label="${s.name}: ${s.formattedTime} (${Math.round(s.sharePct)}%)"
        />
      `;
    }).join('');

    ringSvgMarkup = segmentsMarkup;
  }

  // HTML layout with container queries
  const cardHtml = `
    <div class="by-subject-container" id="by-subject-container">
      <!-- Left: Segmented Ring -->
      <div class="by-subject-ring-wrapper">
        <div class="by-subject-ring-box">
          <svg class="by-subject-ring-svg" viewBox="0 0 150 150" aria-hidden="true">
            <g transform="rotate(-90 75 75)">
              ${ringSvgMarkup}
            </g>
          </svg>
          <div class="by-subject-ring-center">
            <span class="by-subject-ring-sub" id="by-subject-ring-sub">${tr().total || 'TOTAL'}</span>
            <span class="by-subject-ring-val" id="by-subject-ring-val">${formattedTotal}</span>
          </div>
        </div>
      </div>

      <!-- Right: Subject Chips Grid Container -->
      <div class="by-subject-chips-scroller ${isScrollable ? 'is-scrollable' : ''}" id="by-subject-chips-scroller" tabindex="0">
        <div class="by-subject-chips-grid count-${count}" id="by-subject-chips-grid">
          ${subjectList.map(item => {
            const isZero = item.timeSec <= 0;
            const isSelected = activeFilterId === item.id;
            const svgIcon = item.icon ? getSubjectSvg(item.icon) : (item.id === 'other' || item.id === 'math' || item.id === 'english' || item.id === 'physics' ? getSubjectSvg(item.id) : null);
            const iconHtml = svgIcon || `<span class="by-subject-dot" style="background-color: ${item.color};"></span>`;

            return `
              <div class="by-subject-chip ${isZero ? 'is-zero' : ''} ${isSelected ? 'is-selected' : ''}"
                   role="button"
                   tabindex="0"
                   data-subject-id="${item.id}"
                   data-subject-color="${item.color}"
                   data-subject-name="${encodeURIComponent(item.name)}"
                   data-subject-time="${item.formattedTime}"
                   aria-label="${item.name}: ${item.formattedTime}"
                   title="${item.name} (${item.formattedTime})">
                <div class="by-subject-chip-icon" style="background-color: ${item.color}24; color: ${item.color}; border-color: ${item.color}44;">
                  ${iconHtml}
                </div>
                <span class="by-subject-chip-name">${item.name}</span>
                <span class="by-subject-chip-time">${item.formattedTime}</span>
              </div>
            `;
          }).join('')}
        </div>
        ${isScrollable ? '<div class="by-subject-fade-gradient" aria-hidden="true"></div>' : ''}
      </div>
    </div>
  `;

  container.innerHTML = cardHtml;

  // Cached Elements
  const containerBox = container.querySelector('#by-subject-container');
  const scroller = container.querySelector('#by-subject-chips-scroller');
  const gridEl = container.querySelector('#by-subject-chips-grid');
  const ringBox = container.querySelector('.by-subject-ring-box');
  const centerSub = container.querySelector('#by-subject-ring-sub');
  const centerVal = container.querySelector('#by-subject-ring-val');

  const segments = container.querySelectorAll('.by-subject-segment');
  const chips = container.querySelectorAll('.by-subject-chip');

  let currentHoveredId = null;

  function highlightSubject(subjId, name, color, time) {
    if (currentHoveredId === subjId) return;
    currentHoveredId = subjId;

    if (centerSub && centerVal) {
      centerSub.textContent = decodeURIComponent(name);
      centerSub.style.color = color;
      centerSub.classList.add('is-hovered');
      centerVal.textContent = time;
    }

    containerBox?.classList.add('has-hover');

    // Highlight active chip
    chips.forEach(c => {
      const match = c.getAttribute('data-subject-id') === subjId;
      c.classList.toggle('active-hover', match);
    });

    // Highlight active segment
    segments.forEach(seg => {
      const match = seg.getAttribute('data-subject-id') === subjId;
      seg.classList.toggle('active-hover', match);
    });
  }

  function resetHighlight() {
    if (currentHoveredId === null) return;
    currentHoveredId = null;

    if (centerSub && centerVal) {
      centerSub.textContent = tr().total || 'TOTAL';
      centerSub.style.color = '';
      centerSub.classList.remove('is-hovered');
      centerVal.textContent = formattedTotal;
    }

    containerBox?.classList.remove('has-hover');

    chips.forEach(c => c.classList.remove('active-hover'));
    segments.forEach(s => s.classList.remove('active-hover'));
  }

  // Event Delegation for Chips Grid
  const onGridOver = (e) => {
    const chip = e.target.closest('.by-subject-chip');
    if (!chip) return;
    const id = chip.getAttribute('data-subject-id');
    const name = chip.getAttribute('data-subject-name');
    const color = chip.getAttribute('data-subject-color');
    const time = chip.getAttribute('data-subject-time');
    highlightSubject(id, name, color, time);
  };

  const onGridClick = (e) => {
    const chip = e.target.closest('.by-subject-chip');
    if (!chip) return;
    const id = chip.getAttribute('data-subject-id');
    // Toggle filtering activity list
    statsStore.setSubjectFilter(id);
  };

  const onGridKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const chip = e.target.closest('.by-subject-chip');
      if (chip) {
        e.preventDefault();
        const id = chip.getAttribute('data-subject-id');
        statsStore.setSubjectFilter(id);
      }
    }
  };

  if (gridEl) {
    gridEl.addEventListener('mouseover', onGridOver);
    gridEl.addEventListener('mouseleave', resetHighlight);
    gridEl.addEventListener('focusin', onGridOver);
    gridEl.addEventListener('focusout', (e) => {
      if (!gridEl.contains(e.relatedTarget)) resetHighlight();
    });
    gridEl.addEventListener('click', onGridClick);
    gridEl.addEventListener('keydown', onGridKey);
  }

  // Hover & click on SVG Segments
  segments.forEach(seg => {
    const id = seg.getAttribute('data-subject-id');
    const item = subjectList.find(s => s.id === id);
    if (!item) return;

    seg.addEventListener('mouseenter', () => highlightSubject(id, item.name, item.color, item.formattedTime));
    seg.addEventListener('mouseleave', resetHighlight);
    seg.addEventListener('focus', () => highlightSubject(id, item.name, item.color, item.formattedTime));
    seg.addEventListener('blur', resetHighlight);
    seg.addEventListener('click', () => statsStore.setSubjectFilter(id));
  });

  // Cleanup handler
  activeCleanup = () => {
    if (gridEl) {
      gridEl.removeEventListener('mouseover', onGridOver);
      gridEl.removeEventListener('mouseleave', resetHighlight);
      gridEl.removeEventListener('focusin', onGridOver);
      gridEl.removeEventListener('click', onGridClick);
      gridEl.removeEventListener('keydown', onGridKey);
    }
  };
}

let bySubjectSubscribed = false;

export function initBySubjectCard() {
  renderBySubjectCard();
  if (!bySubjectSubscribed) {
    bySubjectSubscribed = true;
    statsStore.subscribe(() => {
      renderBySubjectCard();
    });
  }
}
