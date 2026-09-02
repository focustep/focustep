import { getSubjects, getActiveSubjectId, setActiveSubjectId } from './subjects.js';
import { renderDailyGoalCard } from './daily-goal.js';
import { renderStats } from './stats.js';
import { openSubjectModal } from './subject-modal.js';

export function renderTimerSubjectBadge() {
  const dotEl = document.getElementById('timer-subject-dot');
  const nameEl = document.getElementById('timer-subject-name');
  if (!dotEl || !nameEl) return;

  const subjects = getSubjects();
  const activeId = getActiveSubjectId();
  const activeSubject = subjects.find(s => s.id === activeId) || subjects[0] || { name: 'Math', color: '#7c3aed' };

  dotEl.style.backgroundColor = activeSubject.color || '#7c3aed';
  nameEl.textContent = activeSubject.name;
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
    item.className = `timer-subject-dropdown-item ${subject.id === activeId ? 'active' : ''}`;
    
    const color = subject.color || '#4ec9b0';
    item.innerHTML = `
      <div class="timer-subject-item-left">
        <span class="timer-subject-dot" style="background-color: ${color}"></span>
        <span>${subject.name}</span>
      </div>
      ${subject.id === activeId ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
    `;

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
      const navStatsBtn = document.getElementById('nav-stats-btn');
      if (navStatsBtn) {
        navStatsBtn.click();
      }
      setTimeout(() => {
        openSubjectModal();
      }, 100);
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
