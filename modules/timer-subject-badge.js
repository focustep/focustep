import { getSubjects, getActiveSubjectId, setActiveSubjectId, getSubjectName } from './subjects.js';
import { renderDailyGoalCard } from './daily-goal.js';
import { renderStats } from './stats.js';
import { openSubjectModal } from './subject-modal.js';
import { getSubjectSvg } from './subjects-db.js';

export function renderTimerSubjectBadge() {
  const badgeEl = document.getElementById('timer-subject-badge');
  const dotEl = document.getElementById('timer-subject-dot');
  const nameEl = document.getElementById('timer-subject-name');
  const chevronEl = badgeEl?.querySelector('.timer-subject-chevron');
  const editBtn = document.getElementById('timer-subject-edit-btn');
  if (!dotEl || !nameEl || !badgeEl) return;

  const subjects = getSubjects();
  const activeId = getActiveSubjectId();
  const activeSubject = subjects.find(s => s.id === activeId) || subjects[0] || { name: 'Math', color: '#7c3aed' };
  const color = activeSubject.color || '#4ec9b0';

  // Render SVG Icon if subject has icon, otherwise render glowing dot indicator
  const svg = getSubjectSvg(activeSubject.icon || activeSubject.id);
  if (svg) {
    dotEl.className = 'timer-subject-dot has-icon';
    dotEl.style.backgroundColor = 'transparent';
    dotEl.style.boxShadow = 'none';
    dotEl.innerHTML = svg;
    const svgEl = dotEl.querySelector('svg');
    if (svgEl) {
      const isFillOnly = svgEl.getAttribute('fill') === 'currentColor' && (!svgEl.getAttribute('stroke') || svgEl.getAttribute('stroke') === 'none');
      if (isFillOnly) {
        svgEl.style.fill = color;
        svgEl.style.color = color;
        svgEl.style.stroke = 'none';
      } else {
        svgEl.style.stroke = color;
        svgEl.style.color = color;
      }
      svgEl.style.width = '18px';
      svgEl.style.height = '18px';
    }
  } else {
    dotEl.className = 'timer-subject-dot';
    dotEl.innerHTML = '';
    dotEl.style.backgroundColor = color;
    dotEl.style.boxShadow = `0 0 10px ${color}99`;
  }
  
  nameEl.textContent = getSubjectName(activeSubject);
  nameEl.style.color = '#ffffff';
  
  badgeEl.style.borderColor = `${color}66`;
  badgeEl.style.boxShadow = `0 4px 14px rgba(0, 0, 0, 0.25), 0 0 12px ${color}22`;
  
  if (chevronEl) {
    chevronEl.style.color = color;
  }

  if (editBtn) {
    editBtn.style.borderColor = `${color}44`;
  }

  renderTimerSubjectDropdown();
}

export function renderTimerSubjectDropdown() {
  const listEl = document.getElementById('timer-subject-dropdown-list');
  if (!listEl) return;

  const subjects = getSubjects();
  const activeId = getActiveSubjectId();
  listEl.innerHTML = '';

  subjects.forEach(subject => {
    const item = document.createElement('button');
    item.type = 'button';
    const isSelected = subject.id === activeId;
    const isOther = subject.id === 'other' || subject.name.toLowerCase() === 'other';
    const color = subject.color || (isOther ? '#4ec9b0' : '#7c3aed');
    const svg = getSubjectSvg(subject.icon || subject.id);
    
    item.className = `timer-subject-dropdown-item ${isSelected ? 'active' : ''} ${isOther ? 'is-other' : ''}`;
    if (isSelected) {
      item.style.borderColor = `${color}55`;
    }
    
    const iconHtml = svg ? `
      <div class="timer-subject-item-icon-wrap" style="color: ${color}; background-color: ${color}15; border-color: ${color}33;">
        ${svg}
      </div>
    ` : `
      <div class="timer-subject-item-icon-wrap" style="color: ${color}; background-color: ${color}15; border-color: ${color}33;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color}; box-shadow: 0 0 6px ${color}88;"></span>
      </div>
    `;

    item.innerHTML = `
      <div class="timer-subject-item-left">
        ${iconHtml}
        <span class="timer-subject-item-text" style="color: #ffffff !important;">${getSubjectName(subject)}</span>
      </div>
      ${isSelected ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
    `;

    const itemSvg = item.querySelector('.timer-subject-item-icon-wrap svg');
    if (itemSvg) {
      const isFillOnly = itemSvg.getAttribute('fill') === 'currentColor' && (!itemSvg.getAttribute('stroke') || itemSvg.getAttribute('stroke') === 'none');
      if (isFillOnly) {
        itemSvg.style.fill = color;
        itemSvg.style.color = color;
        itemSvg.style.stroke = 'none';
      } else {
        itemSvg.style.stroke = color;
        itemSvg.style.color = color;
      }
      itemSvg.style.width = '17px';
      itemSvg.style.height = '17px';
    }

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveSubjectId(subject.id);
      renderTimerSubjectBadge();
      renderDailyGoalCard();
      renderStats();
      closeTimerSubjectDropdown();
    });

    listEl.appendChild(item);
  });

  // Ensure scroll is isolated to dropdown list
  if (!listEl.dataset.scrollIsolated) {
    listEl.dataset.scrollIsolated = 'true';
    listEl.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: false });
  }
}

export function closeTimerSubjectDropdown() {
  const wrapper = document.getElementById('timer-subject-badge-wrapper');
  if (wrapper) {
    wrapper.classList.remove('open');
  }
}

export function toggleTimerSubjectDropdown() {
  const wrapper = document.getElementById('timer-subject-badge-wrapper');
  if (!wrapper) return;
  const isOpening = !wrapper.classList.contains('open');
  if (isOpening) {
    renderTimerSubjectDropdown();
    wrapper.classList.add('open');
  } else {
    wrapper.classList.remove('open');
  }
}

export function initTimerSubjectBadge() {
  const badgeEl = document.getElementById('timer-subject-badge');
  const editBtn = document.getElementById('timer-subject-edit-btn');
  const addBtn = document.getElementById('timer-subject-dropdown-add-btn');
  const wrapper = document.getElementById('timer-subject-badge-wrapper');

  if (badgeEl) {
    badgeEl.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTimerSubjectDropdown();
    });
  }

  if (editBtn) {
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTimerSubjectDropdown();
      // Fast transition to Stats & Goals subview
      const navStatsBtn = document.getElementById('nav-stats-btn');
      if (navStatsBtn) {
        navStatsBtn.click();
      }
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTimerSubjectDropdown();
      // Open subject modal directly on current screen with glass blur overlay
      openSubjectModal();
    });
  }

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!wrapper) return;
    if (!wrapper.contains(e.target)) {
      closeTimerSubjectDropdown();
    }
  });

  renderTimerSubjectBadge();
}
