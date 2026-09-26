import { PRESET_ICONS } from './constants.js';
import { modalState } from './state.js';
import { updateLivePreview } from './preview.js';
import { closeColorPickerPopover } from './color-picker.js';
import { SUBJECT_CATEGORIES, SUBJECTS_DATABASE, getSubjectSvg } from '../subjects-db.js';
import { getLang, tr } from '../i18n.js';

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

    modalState.selectedIcon = itemId;
    modalState.isCustomIconSelected = true;

    const nameInput = document.getElementById('subject-modal-name-input');
    if (nameInput && !nameInput.value.trim() && localizedItemName) {
      nameInput.value = localizedItemName;
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

  // 1. Custom Icon Button (First position in Icon Grid)
  const isPresetIcon = PRESET_ICONS.some(p => p.id === modalState.selectedIcon);
  const isCustomActive = modalState.isCustomIconSelected || (!isPresetIcon && modalState.selectedIcon !== '');

  const customBtnLabel = tr().chooseCustomIcon || 'Choose custom icon';
  const customBtn = document.createElement('button');
  customBtn.type = 'button';
  customBtn.className = `subject-custom-icon-btn ${isCustomActive ? 'selected' : ''}`;
  customBtn.title = customBtnLabel;
  customBtn.setAttribute('aria-label', customBtnLabel);

  // If a custom subject icon is selected, show its SVG in the custom button; otherwise show the custom picker sparkle/add icon
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

  // 2. Preset Icons (Slots 2 to 8: Book, Math, Code, Science, Language, Art, Music)
  PRESET_ICONS.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isSelected = (!isCustomActive) && (item.id === modalState.selectedIcon);
    btn.className = `subject-icon-btn ${isSelected ? 'selected' : ''}`;
    btn.title = item.label;
    btn.innerHTML = item.svg;

    btn.addEventListener('click', () => {
      modalState.selectedIcon = item.id;
      modalState.isCustomIconSelected = false;
      closeIconPickerPopover();
      renderIconSelector();
      updateLivePreview();
    });

    iconContainer.appendChild(btn);
  });
}
