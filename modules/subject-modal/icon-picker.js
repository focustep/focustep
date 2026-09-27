import { modalState } from './state.js';
import { updateLivePreview } from './preview.js';
import { closeColorPickerPopover } from './color-picker.js';
import { SUBJECT_CATEGORIES, SUBJECTS_DATABASE, getSubjectSvg } from '../subjects-db.js';
import { getLang, tr } from '../i18n.js';

const STORAGE_KEY = 'focustep_recent_preset_icons';

// Helper to look up full subject icon data by ID
export function getSubjectItemById(iconId) {
  if (!iconId) return null;
  const found = SUBJECTS_DATABASE.find(s => s.id === iconId);
  if (found) {
    return {
      id: found.id,
      names: found.names,
      svg: found.svg,
      categoryId: found.categoryId || found.category
    };
  }
  const svg = getSubjectSvg(iconId);
  if (svg) {
    return {
      id: iconId,
      names: { uz: iconId, ru: iconId, en: iconId },
      svg: svg,
      categoryId: 'custom'
    };
  }
  return null;
}

// Generate randomized icons from diverse categories across SUBJECTS_DATABASE
export function generateRandomSessionIcons(count = 7) {
  const categories = [...SUBJECT_CATEGORIES].sort(() => Math.random() - 0.5);
  const picked = [];
  const usedSubjectIds = new Set();
  const usedCategoryIds = new Set();

  for (const cat of categories) {
    if (picked.length >= count) break;
    const catSubjects = SUBJECTS_DATABASE.filter(s => (s.categoryId === cat.id || s.category === cat.id) && s.svg);
    if (catSubjects.length > 0) {
      const available = catSubjects.filter(s => !usedSubjectIds.has(s.id));
      const pool = available.length > 0 ? available : catSubjects;
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      if (chosen && !usedSubjectIds.has(chosen.id)) {
        usedSubjectIds.add(chosen.id);
        usedCategoryIds.add(cat.id);
        picked.push({
          id: chosen.id,
          names: chosen.names,
          svg: chosen.svg,
          categoryId: cat.id
        });
      }
    }
  }

  // Fallback if needed to reach count
  if (picked.length < count) {
    const remaining = SUBJECTS_DATABASE.filter(s => s.svg && !usedSubjectIds.has(s.id)).sort(() => Math.random() - 0.5);
    for (const item of remaining) {
      if (picked.length >= count) break;
      usedSubjectIds.add(item.id);
      picked.push({
        id: item.id,
        names: item.names,
        svg: item.svg,
        categoryId: item.categoryId || item.category
      });
    }
  }

  return picked;
}

function savePresetIconsToStorage(list) {
  try {
    const ids = list.map(item => item.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {}
}

// Initialize recent preset icons from storage or generate fresh
export function initRecentPresetIcons() {
  let savedIds = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) savedIds = JSON.parse(raw);
  } catch (e) {}

  const result = [];
  const usedIds = new Set();

  if (Array.isArray(savedIds) && savedIds.length > 0) {
    for (const id of savedIds) {
      if (result.length >= 7) break;
      if (id && !usedIds.has(id)) {
        const item = getSubjectItemById(id);
        if (item) {
          result.push(item);
          usedIds.add(id);
        }
      }
    }
  }

  if (result.length < 7) {
    const randoms = generateRandomSessionIcons(7 - result.length);
    for (const r of randoms) {
      if (result.length >= 7) break;
      if (!usedIds.has(r.id)) {
        result.push(r);
        usedIds.add(r.id);
      }
    }
  }

  if (result.length < 7) {
    for (const s of SUBJECTS_DATABASE) {
      if (result.length >= 7) break;
      if (s.svg && !usedIds.has(s.id)) {
        result.push({
          id: s.id,
          names: s.names,
          svg: s.svg,
          categoryId: s.categoryId || s.category
        });
        usedIds.add(s.id);
      }
    }
  }

  savePresetIconsToStorage(result);
  return result;
}

// Persistent preset icon queue (max 7 preset icons)
export let sessionPresetIcons = initRecentPresetIcons();

export function getSessionPresetIcons() {
  return sessionPresetIcons;
}

// Shifts newly used icon to slot 1, pushes existing right, deletes the last one
export function recordUsedIcon(iconId) {
  if (!iconId) return;
  const item = getSubjectItemById(iconId);
  if (!item) return;

  const existingIndex = sessionPresetIcons.findIndex(p => p.id === iconId);
  if (existingIndex !== -1) {
    sessionPresetIcons.splice(existingIndex, 1);
  }

  sessionPresetIcons.unshift(item);

  if (sessionPresetIcons.length > 7) {
    sessionPresetIcons = sessionPresetIcons.slice(0, 7);
  }

  savePresetIconsToStorage(sessionPresetIcons);
}

export function openIconPickerPopover() {
  closeColorPickerPopover();
  const popover = document.getElementById('subject-icon-picker-popover');
  if (!popover) return;

  const titleEl = popover.querySelector('.icon-picker-title');
  if (titleEl && tr().chooseCustomIcon) {
    titleEl.textContent = tr().chooseCustomIcon;
  }

  const searchInput = document.getElementById('icon-picker-search-input');
  if (searchInput) {
    searchInput.placeholder = tr().searchIconPlaceholder || 'Qidirish...';
    searchInput.value = '';
    setTimeout(() => searchInput.focus(), 60);
  }

  renderIconPickerContent('');
  popover.classList.add('open');
  popover.setAttribute('aria-hidden', 'false');
}

export function closeIconPickerPopover() {
  const popover = document.getElementById('subject-icon-picker-popover');
  if (popover && popover.classList.contains('open')) {
    popover.classList.remove('open');
    popover.setAttribute('aria-hidden', 'true');
  }
}

let isScrollAreaListenerAttached = false;

function initScrollAreaDelegation(scrollArea) {
  if (isScrollAreaListenerAttached || !scrollArea) return;
  isScrollAreaListenerAttached = true;
  scrollArea.addEventListener('click', (e) => {
    const btn = e.target.closest('.icon-picker-item');
    if (!btn) return;
    e.stopPropagation();
    const itemId = btn.dataset.itemId;
    const localizedItemName = btn.dataset.itemName;
    if (!itemId) return;

    if (modalState.selectedIcon === itemId) {
      modalState.selectedIcon = '';
      modalState.isCustomIconSelected = false;
    } else {
      modalState.selectedIcon = itemId;
      modalState.isCustomIconSelected = true;
      recordUsedIcon(itemId);

      const nameInput = document.getElementById('subject-modal-name-input');
      if (nameInput && localizedItemName) {
        nameInput.value = localizedItemName;
      }
    }

    renderIconSelector();
    updateLivePreview();
    closeIconPickerPopover();
  });
}

export function renderIconPickerContent(query = '') {
  const scrollArea = document.getElementById('icon-picker-scroll-area');
  if (!scrollArea) return;

  initScrollAreaDelegation(scrollArea);

  scrollArea.innerHTML = '';
  const q = query.trim().toLowerCase();
  const lang = getLang();
  const fragment = document.createDocumentFragment();

  SUBJECT_CATEGORIES.forEach(cat => {
    let items = SUBJECTS_DATABASE.filter(item => item.categoryId === cat.id);
    if (q) {
      items = items.filter(item => {
        const uz = (item.names?.uz || '').toLowerCase();
        const ru = (item.names?.ru || '').toLowerCase();
        const en = (item.names?.en || '').toLowerCase();
        const aliases = (item.aliases || []).join(' ').toLowerCase();
        return uz.includes(q) || ru.includes(q) || en.includes(q) || aliases.includes(q);
      });
    }

    if (items.length === 0) return;

    const groupEl = document.createElement('div');
    groupEl.className = 'icon-picker-category-group';

    const titleEl = document.createElement('span');
    titleEl.className = 'icon-picker-category-title';
    titleEl.textContent = cat.names?.[lang] || cat.names?.uz || cat.id;
    groupEl.appendChild(titleEl);

    const gridEl = document.createElement('div');
    gridEl.className = 'icon-picker-grid';

    items.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isSelected = modalState.selectedIcon === item.id;
      btn.className = `icon-picker-item ${isSelected ? 'selected' : ''}`;
      const localizedItemName = item.names?.[lang] || item.names?.uz || item.id;
      btn.title = localizedItemName;
      btn.dataset.itemId = item.id;
      btn.dataset.itemName = localizedItemName;

      btn.innerHTML = `
        ${item.svg}
        <span class="icon-picker-item-label">${localizedItemName}</span>
      `;

      gridEl.appendChild(btn);
    });

    groupEl.appendChild(gridEl);
    fragment.appendChild(groupEl);
  });

  if (fragment.children.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.style.padding = '20px 10px';
    emptyEl.style.textAlign = 'center';
    emptyEl.style.fontSize = '12px';
    emptyEl.style.color = 'var(--text-muted)';
    emptyEl.textContent = tr().nothingFound || 'Hech narsa topilmadi';
    fragment.appendChild(emptyEl);
  }

  scrollArea.appendChild(fragment);
}

export function renderIconSelector() {
  const iconContainer = document.getElementById('subject-modal-icons');
  if (!iconContainer) return;

  iconContainer.innerHTML = '';

  const isPresetIcon = sessionPresetIcons.some(p => p.id === modalState.selectedIcon);
  const isCustomActive = modalState.isCustomIconSelected || (!isPresetIcon && modalState.selectedIcon !== '');

  // 1. Static Custom Icon Button (Always fixed in first position - Slot 1)
  const customBtnLabel = tr().chooseCustomIcon || 'Choose custom icon';
  const customBtn = document.createElement('button');
  customBtn.type = 'button';
  customBtn.className = `subject-custom-icon-btn ${isCustomActive ? 'selected' : ''}`;
  customBtn.title = customBtnLabel;
  customBtn.setAttribute('aria-label', customBtnLabel);

  // If a custom subject icon is selected, show its SVG in the custom button; otherwise show the custom picker plus/circle icon
  const currentCustomSvg = (!isPresetIcon && getSubjectSvg(modalState.selectedIcon)) || `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  `;

  customBtn.innerHTML = currentCustomSvg;

  customBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const popover = document.getElementById('subject-icon-picker-popover');
    const isOpen = popover && popover.classList.contains('open');

    if (isOpen) {
      closeIconPickerPopover();
    } else {
      openIconPickerPopover();
    }
  });

  iconContainer.appendChild(customBtn);

  // 2. Randomized Preset Icons (Slots 2 to 8: 7 randomized icons from categories)
  const lang = getLang();
  sessionPresetIcons.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isSelected = (!isCustomActive) && (item.id === modalState.selectedIcon);
    btn.className = `subject-icon-btn ${isSelected ? 'selected' : ''}`;
    
    const label = item.names?.[lang] || item.names?.uz || item.names?.en || item.id;
    btn.title = label;
    btn.setAttribute('aria-label', label);
    btn.innerHTML = item.svg;

    btn.addEventListener('click', () => {
      if (modalState.selectedIcon === item.id && !modalState.isCustomIconSelected) {
        modalState.selectedIcon = '';
        modalState.isCustomIconSelected = false;
      } else {
        modalState.selectedIcon = item.id;
        modalState.isCustomIconSelected = false;
        recordUsedIcon(item.id);

        const nameInput = document.getElementById('subject-modal-name-input');
        const itemName = item.names?.[lang] || item.names?.uz || item.names?.ru || item.names?.en || item.id;
        if (nameInput && itemName) {
          nameInput.value = itemName;
        }
      }

      closeIconPickerPopover();
      renderIconSelector();
      updateLivePreview();
    });

    iconContainer.appendChild(btn);
  });
}
