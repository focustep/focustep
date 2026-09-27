import { getSubjects, getActiveSubjectId, setActiveSubjectId, getSubjectName, deleteSubject } from './subjects.js';
import { renderDailyGoalCard } from './daily-goal.js';
import { renderStats } from './stats.js';
import { openSubjectModal } from './subject-modal.js';
import { getSubjectSvg } from './subjects-db.js';
import { showToast } from './activity.js';
import { tr, onLanguageChange } from './i18n.js';

export function renderTimerSubjectBadge(syncDropdown = false) {
  const badgeEl = document.getElementById('timer-subject-badge');
  const dotEl = document.getElementById('timer-subject-dot');
  const nameEl = document.getElementById('timer-subject-name');
  const chevronEl = badgeEl?.querySelector('.timer-subject-chevron');
  const editBtn = document.getElementById('timer-subject-edit-btn');
  if (!dotEl || !nameEl || !badgeEl) return;

  const subjects = getSubjects();
  const activeId = getActiveSubjectId();
  const activeSubject = subjects.find(s => s.id === activeId);

  // 1. Agar hamma fanlar o'chirilgan bo'lsa (ro'yxatda birorta ham fan qolmasa):
  // previewda dumaloq mint indikator va mint plashka bo'ladi,
  // subject name esa 3 ta tilga mos "Add subject" / "Fan qo'shish" / "Добавить предмет" bo'ladi.
  if (subjects.length === 0) {
    const mintColor = '#4ec9b0';
    dotEl.className = 'timer-subject-dot';
    dotEl.innerHTML = '';
    dotEl.style.backgroundColor = mintColor;
    dotEl.style.boxShadow = `0 0 10px ${mintColor}99`;

    const addText = tr().addSubject || (tr().localeCode === 'ru-RU' ? 'Добавить предмет' : tr().localeCode === 'uz-UZ' ? "Fan qo'shish" : 'Add subject');
    nameEl.textContent = addText;
    nameEl.style.color = '#ffffff';

    badgeEl.style.borderColor = `${mintColor}66`;
    badgeEl.style.boxShadow = `0 4px 14px rgba(0, 0, 0, 0.25), 0 0 12px ${mintColor}33`;

    if (chevronEl) {
      chevronEl.style.color = mintColor;
    }
    if (editBtn) {
      editBtn.style.borderColor = `${mintColor}44`;
    }
    if (syncDropdown) {
      renderTimerSubjectDropdown();
    }
    updateDropdownPosition();
    return;
  }

  // 2. Fanlar mavjud bo'lsa, ammo tanlangan fan yo'q bo'lsa (tanlov olib tashlangan):
  // preview plashkasida dumaloq mint rangli indikator (icon o'rniga) va "Choose subject" / "Fan tanlash" / "Выбрать предмет" chiqadi.
  if (!activeSubject) {
    const mintColor = '#4ec9b0';
    dotEl.className = 'timer-subject-dot';
    dotEl.innerHTML = '';
    dotEl.style.backgroundColor = mintColor;
    dotEl.style.boxShadow = `0 0 10px ${mintColor}99`;

    const chooseText = tr().chooseSubject || (tr().localeCode === 'ru-RU' ? 'Выбрать предмет' : tr().localeCode === 'uz-UZ' ? "Fan tanlash" : 'Choose subject');
    nameEl.textContent = chooseText;
    nameEl.style.color = '#ffffff';

    badgeEl.style.borderColor = `${mintColor}66`;
    badgeEl.style.boxShadow = `0 4px 14px rgba(0, 0, 0, 0.25), 0 0 12px ${mintColor}33`;

    if (chevronEl) {
      chevronEl.style.color = mintColor;
    }
    if (editBtn) {
      editBtn.style.borderColor = `${mintColor}44`;
    }
    if (syncDropdown) {
      renderTimerSubjectDropdown();
    }
    updateDropdownPosition();
    return;
  }

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

  if (syncDropdown) {
    renderTimerSubjectDropdown();
  }
  updateDropdownPosition();
}

export function renderTimerSubjectDropdown() {
  const listEl = document.getElementById('timer-subject-dropdown-list');
  if (!listEl) return;

  const allSubjects = getSubjects();
  const activeId = getActiveSubjectId();
  const canDeleteAny = true; // Barcha fanlarni, hatto oxirgisini ham o'chirishga ruxsat beriladi

  // Yangi qo'shilgan fan yoki tanlangan fan har doim 1 da (ro'yxat boshida) tursin
  const subjects = [...allSubjects].sort((a, b) => {
    if (activeId) {
      if (a.id === activeId) return -1;
      if (b.id === activeId) return 1;
    }
    return 0;
  });

  // Keyed reconciliation: preserve existing DOM elements without modifying innerHTML on existing elements
  const existingElements = new Map();
  Array.from(listEl.children).forEach(el => {
    if (el.dataset && el.dataset.subjectId) {
      existingElements.set(el.dataset.subjectId, el);
    }
  });

  const currentSubjectIds = new Set(subjects.map(s => s.id));

  // Remove elements that no longer exist
  existingElements.forEach((el, id) => {
    if (!currentSubjectIds.has(id)) {
      el.remove();
      existingElements.delete(id);
    }
  });

  subjects.forEach(subject => {
    let item = existingElements.get(subject.id);
    const isSelected = subject.id === activeId;
    const isOther = subject.id === 'other' || subject.name.toLowerCase() === 'other';
    const color = subject.color || (isOther ? '#4ec9b0' : '#7c3aed');
    const svg = getSubjectSvg(subject.icon || subject.id);
    const subjName = getSubjectName(subject);

    if (!item) {
      item = document.createElement('button');
      item.type = 'button';
      item.dataset.subjectId = subject.id;
      item.className = `timer-subject-dropdown-item ${isSelected ? 'active' : ''} ${isOther ? 'is-other' : ''}`;
      item.style.borderColor = isSelected ? `${color}55` : 'transparent';

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
          <span class="timer-subject-item-text" style="color: #ffffff !important;">${subjName}</span>
        </div>
        <div class="timer-subject-item-right">
          <svg class="timer-subject-check-icon" style="display: ${isSelected ? 'block' : 'none'};" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span role="button" tabindex="0" class="timer-subject-item-delete-btn" style="display: ${canDeleteAny ? 'flex' : 'none'};" aria-label="Delete ${subjName}" title="O'chirish">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </span>
        </div>
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
        if (e.target.closest('.timer-subject-item-delete-btn')) return;
        e.stopPropagation();
        const curActiveId = getActiveSubjectId();
        if (curActiveId === item.dataset.subjectId) {
          // Tanlangan predmet ustiga yana bir marta bosilsa tanlov olib tashlanadi
          setActiveSubjectId(null);
        } else {
          setActiveSubjectId(item.dataset.subjectId);
        }
        renderTimerSubjectBadge();
        renderDailyGoalCard();
        renderStats();
        closeTimerSubjectDropdown();
      });

      const delBtn = item.querySelector('.timer-subject-item-delete-btn');
      if (delBtn) {
        const handleDelete = (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (item.classList.contains('is-deleting')) return;
          
          item.classList.add('is-deleting');
          const msg = typeof tr().subjectDeleted === 'function' ? tr().subjectDeleted(subjName) : `${subjName} deleted (Ctrl+Z)`;
          showToast(msg);

          setTimeout(() => {
            const deleted = deleteSubject(subject.id);
            if (deleted) {
              item.remove();

              const remainingSubjects = getSubjects();
              if (remainingSubjects.length === 0) {
                // Agar barcha fanlar o'chirilgan bo'lsa, menyuni darhol yopamiz
                closeTimerSubjectDropdown();
                renderTimerSubjectBadge(false);
                renderDailyGoalCard();
                renderStats();
                return;
              }

              // O'chirilgan fan ayni paytda tanlangan bo'lsa, dropdown ro'yxatida yangi faol fanga checkmarkni o'tkazamiz
              const newActiveId = getActiveSubjectId();
              Array.from(listEl.children).forEach(child => {
                if (child.dataset && child.dataset.subjectId) {
                  const isNowSelected = Boolean(newActiveId && child.dataset.subjectId === newActiveId);
                  const chk = child.querySelector('.timer-subject-check-icon');
                  if (chk) {
                    chk.style.display = isNowSelected ? 'block' : 'none';
                  }
                  child.classList.toggle('active', isNowSelected);
                }
              });

              // Tepadagi preview nishoni darhol yangi tanlangan fanga yangilanadi
              renderTimerSubjectBadge(false);
              renderDailyGoalCard();
              renderStats();
            }
          }, 200);
        };

        delBtn.addEventListener('click', handleDelete);
        delBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleDelete(e);
          }
        });
      }

      listEl.appendChild(item);
    } else {
      // Element already exists in DOM: Update properties without replacing innerHTML to prevent hover flicker
      item.className = `timer-subject-dropdown-item ${isSelected ? 'active' : ''} ${isOther ? 'is-other' : ''}`;
      item.style.borderColor = isSelected ? `${color}55` : 'transparent';
      const checkEl = item.querySelector('.timer-subject-check-icon');
      if (checkEl) {
        checkEl.style.display = isSelected ? 'block' : 'none';
        checkEl.setAttribute('stroke', color);
      }
      const delEl = item.querySelector('.timer-subject-item-delete-btn');
      if (delEl) {
        delEl.style.display = canDeleteAny ? 'flex' : 'none';
      }
      listEl.appendChild(item);
    }
  });

  // Ensure scroll is isolated to dropdown list
  if (!listEl.dataset.scrollIsolated) {
    listEl.dataset.scrollIsolated = 'true';
    listEl.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: false });
  }
}

export function updateDropdownPosition() {
  const wrapper = document.getElementById('timer-subject-badge-wrapper');
  const badgeEl = document.getElementById('timer-subject-badge');
  const dropdown = document.getElementById('timer-subject-dropdown');
  if (!wrapper || !badgeEl || !dropdown) return;

  const badgeCenter = badgeEl.offsetLeft + (badgeEl.offsetWidth / 2);
  dropdown.style.left = `${badgeCenter}px`;
  dropdown.classList.add('aligned-to-badge');
}

export function closeTimerSubjectDropdown() {
  const wrapper = document.getElementById('timer-subject-badge-wrapper');
  if (wrapper) {
    const wasOpen = wrapper.classList.contains('open');
    wrapper.classList.remove('open');
    if (wasOpen) {
      // Dropdown yopilganda badge'ni eng so'nggi faol fanga moslab silliq yangilaymiz
      renderTimerSubjectBadge(false);
      updateDropdownPosition();
    }
  }
}

export function toggleTimerSubjectDropdown() {
  const wrapper = document.getElementById('timer-subject-badge-wrapper');
  if (!wrapper) return;
  const subjects = getSubjects();
  if (subjects.length === 0) {
    closeTimerSubjectDropdown();
    openSubjectModal();
    return;
  }
  const isOpening = !wrapper.classList.contains('open');
  if (isOpening) {
    renderTimerSubjectDropdown();
    updateDropdownPosition();
    wrapper.classList.add('open');
  } else {
    closeTimerSubjectDropdown();
  }
}

export function initTimerSubjectBadge() {
  const badgeEl = document.getElementById('timer-subject-badge');
  const editBtn = document.getElementById('timer-subject-edit-btn');
  const addBtn = document.getElementById('timer-subject-dropdown-add-btn');
  const wrapper = document.getElementById('timer-subject-badge-wrapper');

  const updateAddBtnText = () => {
    if (addBtn) {
      const span = addBtn.querySelector('span');
      if (span) {
        span.textContent = tr().addSubject || 'Add subject';
      }
    }
  };
  updateAddBtnText();

  onLanguageChange(() => {
    updateAddBtnText();
    renderTimerSubjectBadge();
  });

  if (badgeEl) {
    badgeEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const subjects = getSubjects();
      if (subjects.length === 0) {
        openSubjectModal();
        return;
      }
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

  // Close when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wrapper?.classList.contains('open')) {
      closeTimerSubjectDropdown();
    }
  });

  window.addEventListener('resize', () => {
    updateDropdownPosition();
  });

  renderTimerSubjectBadge();
}
