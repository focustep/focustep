import { getSubjects, getActiveSubjectId, setActiveSubjectId, getGoalForSubject, setGoalForSubject, getSessions } from './subjects.js';
import { openSubjectModal } from './subject-modal.js';
import { renderTimerSubjectBadge } from './timer-subject-badge.js';

let isWheelOpen = false;
let isSubjectDropdownOpen = false;

function formatGoalHM(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h 00m`;
  return `${m}m`;
}

function getTodaySubjectStudiedMinutes(subjectId) {
  const sessions = getSessions();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  
  let totalSec = 0;
  sessions.forEach(s => {
    if (s.timestamp >= todayStart && s.subjectId === subjectId) {
      totalSec += (s.durationSec || 0);
    }
  });

  return Math.round(totalSec / 60);
}

export function renderDailyGoalCard() {
  const subjects = getSubjects();
  const activeSubjectId = getActiveSubjectId();
  const currentSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0] || { id: 'math', name: 'Math', color: '#7c3aed' };
  
  const targetMinutes = getGoalForSubject(currentSubject.id);
  const studiedMinutes = getTodaySubjectStudiedMinutes(currentSubject.id);
  
  // Progress calculation
  let percent = 0;
  if (targetMinutes > 0) {
    percent = Math.min(100, Math.round((studiedMinutes / targetMinutes) * 100));
  }

  // Update UI Elements
  const ringSvg = document.getElementById('daily-goal-ring-circle');
  const percentEl = document.getElementById('daily-goal-percent-text');
  const timeTextEl = document.getElementById('daily-goal-time-text');
  const subjectBtn = document.getElementById('daily-goal-subject-trigger');
  const subjectDot = document.getElementById('daily-goal-subject-dot');
  const subjectName = document.getElementById('daily-goal-subject-name');
  
  if (subjectDot) {
    subjectDot.style.backgroundColor = currentSubject.color;
  }
  if (subjectName) {
    subjectName.textContent = currentSubject.name;
  }

  if (percentEl) {
    percentEl.textContent = `${percent}%`;
  }

  if (timeTextEl) {
    timeTextEl.textContent = `${formatGoalHM(studiedMinutes)} / ${formatGoalHM(targetMinutes)}`;
  }

  if (ringSvg) {
    // Circle circumference for r=40 is 2 * PI * 40 ~= 251.32
    const circumference = 2 * Math.PI * 40;
    const strokeOffset = circumference - (percent / 100) * circumference;
    ringSvg.style.stroke = currentSubject.color;
    ringSvg.style.strokeDasharray = `${circumference}`;
    ringSvg.style.strokeDashoffset = `${strokeOffset}`;
  }

  renderSubjectDropdownList();
  renderTimerSubjectBadge();
}

function renderSubjectDropdownList() {
  const dropdown = document.getElementById('daily-goal-subject-menu');
  if (!dropdown) return;

  const subjects = getSubjects();
  const activeSubjectId = getActiveSubjectId();

  dropdown.innerHTML = '';
  
  subjects.forEach(sub => {
    const item = document.createElement('div');
    item.className = `daily-goal-dropdown-item ${sub.id === activeSubjectId ? 'selected' : ''}`;
    item.innerHTML = `
      <span class="subject-color-bullet" style="background-color: ${sub.color};"></span>
      <span class="subject-item-name">${sub.name}</span>
      ${sub.id === activeSubjectId ? '<svg class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
    `;
    item.addEventListener('click', () => {
      setActiveSubjectId(sub.id);
      closeSubjectDropdown();
      renderDailyGoalCard();
      renderTimerSubjectBadge();
    });
    dropdown.appendChild(item);
  });

  // Divider + Add Subject button
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'daily-goal-dropdown-add-btn';
  addBtn.id = 'daily-goal-open-add-modal-btn';
  addBtn.innerHTML = `
    <span>+ Add subject</span>
  `;
  addBtn.addEventListener('click', () => {
    closeSubjectDropdown();
    openSubjectModal();
  });
  dropdown.appendChild(addBtn);
}

function toggleSubjectDropdown() {
  const dropdown = document.getElementById('daily-goal-subject-menu');
  if (!dropdown) return;
  isSubjectDropdownOpen = !isSubjectDropdownOpen;
  if (isSubjectDropdownOpen) {
    dropdown.classList.add('open');
  } else {
    dropdown.classList.remove('open');
  }
}

function closeSubjectDropdown() {
  const dropdown = document.getElementById('daily-goal-subject-menu');
  if (dropdown) {
    dropdown.classList.remove('open');
    isSubjectDropdownOpen = false;
  }
}

/* Time Target Picker Logic */
let selectedHours = 2;
let selectedMinutes = 0;

export function openGoalTimeWheel() {
  const activeSubjectId = getActiveSubjectId();
  const currentGoalMins = getGoalForSubject(activeSubjectId);
  selectedHours = Math.floor(currentGoalMins / 60);
  selectedMinutes = Math.round((currentGoalMins % 60) / 5) * 5;
  if (selectedMinutes >= 60) selectedMinutes = 55;

  const modal = document.getElementById('goal-wheel-modal');
  if (!modal) return;

  updatePickerDisplay();
  modal.classList.add('open');
  isWheelOpen = true;
}

export function closeGoalTimeWheel() {
  const modal = document.getElementById('goal-wheel-modal');
  if (modal) {
    modal.classList.remove('open');
    isWheelOpen = false;
  }
}

function updatePickerDisplay() {
  const hInput = document.getElementById('goal-input-hours');
  const mInput = document.getElementById('goal-input-minutes');
  if (hInput) hInput.value = String(selectedHours);
  if (mInput) mInput.value = String(selectedMinutes).padStart(2, '0');

  // Highlight active preset chip if any
  const totalMins = selectedHours * 60 + selectedMinutes;
  document.querySelectorAll('.goal-preset-chip').forEach(chip => {
    const mins = parseInt(chip.dataset.mins, 10);
    if (mins === totalMins) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

export function initDailyGoalCard() {
  const triggerBtn = document.getElementById('daily-goal-subject-trigger');
  if (triggerBtn) {
    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSubjectDropdown();
    });
  }

  document.addEventListener('click', (e) => {
    if (isSubjectDropdownOpen && !e.target.closest('#daily-goal-subject-select-wrapper')) {
      closeSubjectDropdown();
    }
  });

  const editGoalBtn = document.getElementById('daily-goal-edit-btn');
  if (editGoalBtn) {
    editGoalBtn.addEventListener('click', () => {
      openGoalTimeWheel();
    });
  }

  // Dual Rounded Square Boxes - Mouse Wheel Reroll & Typing
  const hBox = document.getElementById('goal-time-box-hours');
  const mBox = document.getElementById('goal-time-box-minutes');
  const hInput = document.getElementById('goal-input-hours');
  const mInput = document.getElementById('goal-input-minutes');

  // 1. Wheel scroll on Hours box
  if (hBox) {
    hBox.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        // Scroll Up -> Increase
        selectedHours = Math.min(23, selectedHours + 1);
      } else {
        // Scroll Down -> Decrease
        selectedHours = Math.max(0, selectedHours - 1);
      }
      updatePickerDisplay();
    }, { passive: false });

    // Focus input on click
    hBox.addEventListener('click', () => {
      if (hInput) {
        hInput.focus();
        hInput.select();
      }
    });
  }

  // 2. Wheel scroll on Minutes box
  if (mBox) {
    mBox.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        // Scroll Up -> Increase by 5 mins (or wrap to next hour)
        if (selectedMinutes < 55) {
          selectedMinutes += 5;
        } else {
          selectedMinutes = 0;
          selectedHours = Math.min(23, selectedHours + 1);
        }
      } else {
        // Scroll Down -> Decrease by 5 mins (or wrap to prev hour)
        if (selectedMinutes >= 5) {
          selectedMinutes -= 5;
        } else if (selectedHours > 0) {
          selectedMinutes = 55;
          selectedHours = Math.max(0, selectedHours - 1);
        }
      }
      updatePickerDisplay();
    }, { passive: false });

    // Focus input on click
    mBox.addEventListener('click', () => {
      if (mInput) {
        mInput.focus();
        mInput.select();
      }
    });
  }

  // 3. Direct Typing and Input validation on Hours
  if (hInput) {
    hInput.addEventListener('input', () => {
      let val = parseInt(hInput.value, 10);
      if (isNaN(val)) val = 0;
      if (val > 23) val = 23;
      if (val < 0) val = 0;
      selectedHours = val;
      // Highlight preset chips accordingly
      const totalMins = selectedHours * 60 + selectedMinutes;
      document.querySelectorAll('.goal-preset-chip').forEach(chip => {
        const mins = parseInt(chip.dataset.mins, 10);
        chip.classList.toggle('active', mins === totalMins);
      });
    });

    hInput.addEventListener('blur', () => {
      hInput.value = String(selectedHours);
    });
  }

  // 4. Direct Typing and Input validation on Minutes
  if (mInput) {
    mInput.addEventListener('input', () => {
      let val = parseInt(mInput.value, 10);
      if (isNaN(val)) val = 0;
      if (val > 59) val = 59;
      if (val < 0) val = 0;
      selectedMinutes = val;
      const totalMins = selectedHours * 60 + selectedMinutes;
      document.querySelectorAll('.goal-preset-chip').forEach(chip => {
        const mins = parseInt(chip.dataset.mins, 10);
        chip.classList.toggle('active', mins === totalMins);
      });
    });

    mInput.addEventListener('blur', () => {
      mInput.value = String(selectedMinutes).padStart(2, '0');
    });
  }

  // Quick preset chips
  document.querySelectorAll('.goal-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const mins = parseInt(chip.dataset.mins, 10);
      if (!isNaN(mins)) {
        selectedHours = Math.floor(mins / 60);
        selectedMinutes = mins % 60;
        updatePickerDisplay();
      }
    });
  });

  // Time Wheel Modal handlers
  const saveGoalBtn = document.getElementById('goal-wheel-save-btn');
  const cancelGoalBtn = document.getElementById('goal-wheel-cancel-btn');
  const wheelBackdrop = document.getElementById('goal-wheel-backdrop');

  if (saveGoalBtn) {
    saveGoalBtn.addEventListener('click', () => {
      const activeSubjectId = getActiveSubjectId();
      const totalMins = selectedHours * 60 + selectedMinutes;
      setGoalForSubject(activeSubjectId, totalMins);
      closeGoalTimeWheel();
      renderDailyGoalCard();
    });
  }

  if (cancelGoalBtn) {
    cancelGoalBtn.addEventListener('click', closeGoalTimeWheel);
  }

  if (wheelBackdrop) {
    wheelBackdrop.addEventListener('click', closeGoalTimeWheel);
  }

  renderDailyGoalCard();
}
