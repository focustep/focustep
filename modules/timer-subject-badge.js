import { getSubjects, getActiveSubjectId, setActiveSubjectId, getSubjectName, deleteSubject } from './subjects.js';
import { renderDailyGoalCard } from './daily-goal.js';
import { renderStats } from './stats.js';
import { openSubjectModal } from './subject-modal.js';
import { getSubjectSvg } from './subjects-db.js';
import { showToast } from './activity.js';
import { tr, onLanguageChange } from './i18n.js';
import { getThemeSafeColor } from './subject-modal/color-utils.js';

let currentBadgeIconKey = null;
let badgeIconAnimTimeout = null;

function formatBadgeSvg(svg, color) {
  if (!svg) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (svgEl) {
    const isFillOnly = svgEl.getAttribute('fill') === 'currentColor' && (!svgEl.getAttribute('stroke') || svgEl.getAttribute('stroke') === 'none');
    if (isFillOnly) {
      svgEl.setAttribute('fill', color);
      svgEl.removeAttribute('stroke');
    } else {
      svgEl.setAttribute('stroke', color);
    }
    svgEl.setAttribute('width', '18');
    svgEl.setAttribute('height', '18');
    svgEl.style.width = '18px';
    svgEl.style.height = '18px';
    svgEl.style.display = 'block';
    return svgEl.outerHTML;
  }
  return svg;
}

function updateBadgeIcon(dotEl, iconHtml, iconKey, shouldAnimate = true) {
  if (!dotEl) return;

  dotEl.className = 'timer-subject-dot';
  dotEl.style.backgroundColor = 'transparent';
  dotEl.style.boxShadow = 'none';

  // If initial load or animation explicitly not requested:
  if (currentBadgeIconKey === null || !shouldAnimate) {
    currentBadgeIconKey = iconKey;
    if (badgeIconAnimTimeout) {
      clearTimeout(badgeIconAnimTimeout);
      badgeIconAnimTimeout = null;
    }
    dotEl.innerHTML = `<span class="timer-subject-icon-content">${iconHtml}</span>`;
    return;
  }

  // If icon has not changed, don't re-animate
  if (currentBadgeIconKey === iconKey) {
    let contentEl = dotEl.querySelector('.timer-subject-icon-content');
    if (!contentEl) {
      dotEl.innerHTML = `<span class="timer-subject-icon-content">${iconHtml}</span>`;
    }
    return;
  }

  currentBadgeIconKey = iconKey;

  if (badgeIconAnimTimeout) {
    clearTimeout(badgeIconAnimTimeout);
    badgeIconAnimTimeout = null;
  }

  let contentEl = dotEl.querySelector('.timer-subject-icon-content');
  if (!contentEl) {
    dotEl.innerHTML = `<span class="timer-subject-icon-content">${dotEl.innerHTML}</span>`;
    contentEl = dotEl.querySelector('.timer-subject-icon-content');
  }

  // Phase 1: First icon becomes smaller (duration: 75ms)
  contentEl.classList.remove('icon-scale-up', 'icon-scale-init');
  contentEl.classList.add('icon-scale-down');

  badgeIconAnimTimeout = setTimeout(() => {
    // Phase 2: Second icon must have been already small
    contentEl.className = 'timer-subject-icon-content icon-scale-init';
    contentEl.innerHTML = iconHtml;

    // Force layout reflow so the browser commits the small (scale 0.18, opacity 0) state
    void contentEl.offsetWidth;

    // Phase 3: At the end second icon becomes in normal state (duration: 95ms)
    contentEl.className = 'timer-subject-icon-content icon-scale-up';

    badgeIconAnimTimeout = setTimeout(() => {
      if (contentEl) {
        contentEl.className = 'timer-subject-icon-content';
      }
      badgeIconAnimTimeout = null;
    }, 95);
  }, 75);
}

export function renderTimerSubjectBadge(syncDropdown = false, animate = true) {
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
    const dotHtml = `<span class="timer-subject-dot-circle" style="background-color: ${mintColor}; box-shadow: 0 0 10px ${mintColor}99;"></span>`;
    updateBadgeIcon(dotEl, dotHtml, '__empty__', animate);

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
    const dotHtml = `<span class="timer-subject-dot-circle" style="background-color: ${mintColor}; box-shadow: 0 0 10px ${mintColor}99;"></span>`;
    updateBadgeIcon(dotEl, dotHtml, '__none__', animate);

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

  const rawColor = activeSubject.color || '#4ec9b0';
  const color = getThemeSafeColor(rawColor);

  // Render SVG Icon if subject has icon, otherwise render glowing dot indicator
  const svg = getSubjectSvg(activeSubject.icon || activeSubject.id);
  if (svg) {
    const formattedSvg = formatBadgeSvg(svg, color);
    const iconKey = `${activeSubject.id}_${activeSubject.icon || activeSubject.id}_${color}`;
    updateBadgeIcon(dotEl, formattedSvg, iconKey, animate);
  } else {
    const dotHtml = `<span class="timer-subject-dot-circle" style="background-color: ${color}; box-shadow: 0 0 10px ${color}99;"></span>`;
    const iconKey = `${activeSubject.id}_dot_${color}`;
    updateBadgeIcon(dotEl, dotHtml, iconKey, animate);
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

function renderOrUpdateDropdownItem(item, subject, isSelected, canDeleteAny) {
  const isOther = subject.id === 'other' || subject.name.toLowerCase() === 'other';
  const rawColor = subject.color || (isOther ? '#4ec9b0' : '#7c3aed');
  const color = getThemeSafeColor(rawColor);
  const svg = getSubjectSvg(subject.icon || subject.id);
  const subjName = getSubjectName(subject);

  item.dataset.subjectId = subject.id;
  item.dataset.subjectName = subjName;
  item.className = `timer-subject-dropdown-item ${isSelected ? 'active' : ''} ${isOther ? 'is-other' : ''}`;
  item.style.borderColor = isSelected ? `${color}55` : 'transparent';

  let iconWrap = item.querySelector('.timer-subject-item-icon-wrap');
  let textEl = item.querySelector('.timer-subject-item-text');
  let checkEl = item.querySelector('.timer-subject-check-icon');
  let delEl = item.querySelector('.timer-subject-item-delete-btn');

  if (!iconWrap || !textEl || !checkEl || !delEl) {
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </span>
      </div>
    `;
    iconWrap = item.querySelector('.timer-subject-item-icon-wrap');
  } else {
    // 1. Update Icon and Color Wrap
    iconWrap.style.color = color;
    iconWrap.style.backgroundColor = `${color}15`;
    iconWrap.style.borderColor = `${color}33`;
    if (svg) {
      iconWrap.innerHTML = svg;
    } else {
      iconWrap.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color}; box-shadow: 0 0 6px ${color}88;"></span>`;
    }

    // 2. Update Subject Name
    textEl.textContent = subjName;

    // 3. Update Check Icon
    checkEl.style.display = isSelected ? 'block' : 'none';
    checkEl.setAttribute('stroke', color);

    // 4. Update Delete Button
    delEl.style.display = canDeleteAny ? 'flex' : 'none';
    delEl.setAttribute('aria-label', `Delete ${subjName}`);
  }

  // Format SVG inside iconWrap properly
  const itemSvg = iconWrap?.querySelector('svg');
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

  const fragment = document.createDocumentFragment();

  subjects.forEach(subject => {
    let item = existingElements.get(subject.id);
    const isSelected = subject.id === activeId;

    if (!item) {
      item = document.createElement('button');
      item.type = 'button';
      renderOrUpdateDropdownItem(item, subject, isSelected, canDeleteAny);
      fragment.appendChild(item);
    } else {
      renderOrUpdateDropdownItem(item, subject, isSelected, canDeleteAny);
      listEl.appendChild(item);
    }
  });

  if (fragment.children.length > 0) {
    listEl.appendChild(fragment);
  }

  // Set up high-performance delegated event listener once
  if (!listEl.dataset.delegationAttached) {
    listEl.dataset.delegationAttached = 'true';

    listEl.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.timer-subject-item-delete-btn');
      const item = e.target.closest('.timer-subject-dropdown-item');
      if (!item) return;

      const subjectId = item.dataset.subjectId;
      const subjName = item.dataset.subjectName || '';
      if (!subjectId) return;

      if (delBtn) {
        e.stopPropagation();
        e.preventDefault();

        const deleted = deleteSubject(subjectId);
        if (deleted) {
          item.remove();

          const msg = typeof tr().subjectDeleted === 'function' ? tr().subjectDeleted(subjName) : `${subjName} deleted (Ctrl+Z)`;
          showToast(msg);

          const remainingSubjects = getSubjects();
          if (remainingSubjects.length === 0) {
            closeTimerSubjectDropdown();
            renderTimerSubjectBadge(false);
            renderDailyGoalCard();
            requestAnimationFrame(() => renderStats());
            return;
          }

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

          renderTimerSubjectBadge(false);
          renderDailyGoalCard();
          requestAnimationFrame(() => renderStats());
        }
        return;
      }

      e.stopPropagation();
      const curActiveId = getActiveSubjectId();
      if (curActiveId === subjectId) {
        setActiveSubjectId(null);
      } else {
        setActiveSubjectId(subjectId);
      }
      renderTimerSubjectBadge();
      renderDailyGoalCard();
      renderStats();
      closeTimerSubjectDropdown();
    });

    listEl.addEventListener('keydown', (e) => {
      const delBtn = e.target.closest('.timer-subject-item-delete-btn');
      if (delBtn && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        delBtn.click();
      }
    });
  }

  // Ensure scroll is isolated to dropdown list
  if (!listEl.dataset.scrollIsolated) {
    listEl.dataset.scrollIsolated = 'true';
    listEl.addEventListener('wheel', (e) => {
      e.stopPropagation();
    }, { passive: true });
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

let topAlertTimeout = null;

export function showTopNotification(message = 'Choose subject to edit') {
  if (typeof document === 'undefined') return;

  let alertEl = document.getElementById('top-alert-notification');
  const isVisible = alertEl && alertEl.classList.contains('visible');

  if (!alertEl) {
    alertEl = document.createElement('div');
    alertEl.id = 'top-alert-notification';
    alertEl.className = 'top-alert-notification hidden-state';
    alertEl.setAttribute('role', 'alert');
    alertEl.setAttribute('aria-live', 'assertive');

    alertEl.innerHTML = `
      <svg class="top-alert-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span class="top-alert-text"></span>
    `;
    alertEl.addEventListener('animationend', (e) => {
      if (e.animationName === 'topAlertShake') {
        alertEl.classList.remove('shake');
      }
    });
    document.body.appendChild(alertEl);
  }

  const textEl = alertEl.querySelector('.top-alert-text');
  if (textEl) {
    textEl.textContent = message;
  }

  if (isVisible) {
    // Prevent duplication: trigger shake animation to grab attention
    alertEl.classList.remove('shake');
    void alertEl.offsetWidth; // Force reflow
    alertEl.classList.add('shake');
  } else {
    // Show notification
    alertEl.classList.remove('hidden-state');
    alertEl.classList.remove('shake');
    void alertEl.offsetWidth; // Force reflow
    alertEl.classList.add('visible');
  }

  if (topAlertTimeout) {
    clearTimeout(topAlertTimeout);
  }
  topAlertTimeout = setTimeout(() => {
    if (alertEl) {
      alertEl.classList.remove('visible');
      alertEl.classList.remove('shake');
      alertEl.classList.add('hidden-state');
    }
  }, 2600);
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

  const updateEditBtnTooltip = () => {
    if (editBtn) {
      const tip = tr().subjectEditor || 'Subject Editor';
      editBtn.setAttribute('data-tooltip', tip);
      editBtn.setAttribute('aria-label', tip);
    }
  };

  updateAddBtnText();
  updateEditBtnTooltip();

  onLanguageChange(() => {
    updateAddBtnText();
    updateEditBtnTooltip();
    renderTimerSubjectBadge(false, false);
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

      const subjects = getSubjects();
      const activeId = getActiveSubjectId();
      const activeSubject = activeId ? subjects.find(s => s.id === activeId) : null;

      if (activeSubject) {
        // Open Subject Editor for currently selected subject
        openSubjectModal(activeSubject);
      } else {
        // No subject selected: Show top notification with shake effect
        const msg = (tr() && tr().chooseSubjectToEdit) || 'Choose subject to edit';
        showTopNotification(msg);
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

  window.addEventListener('focustep:subjectsUpdated', () => {
    renderTimerSubjectBadge(false, true);
    renderTimerSubjectDropdown();
    updateDropdownPosition();
  });

  renderTimerSubjectBadge(false, false);
}
