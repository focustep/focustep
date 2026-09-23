import { modalState } from './state.js';
import { updateLivePreview } from './preview.js';
import { renderIconSelector } from './icon-picker.js';
import { findMatchingSubjects } from '../subjects-db.js';
import { getLang } from '../i18n.js';

export function closeAutosuggest() {
  const box = document.getElementById('subject-name-autosuggest');
  if (box) {
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '';
  }
  modalState.autosuggestActiveIndex = -1;
  modalState.currentAutosuggestList = [];
}

export function handleAutosuggestSearch(query) {
  const box = document.getElementById('subject-name-autosuggest');
  if (!box) return;

  if (!query || query.trim().length === 0) {
    closeAutosuggest();
    return;
  }

  const matches = findMatchingSubjects(query);
  if (matches.length === 0) {
    closeAutosuggest();
    return;
  }

  modalState.currentAutosuggestList = matches;
  modalState.autosuggestActiveIndex = -1;
  box.innerHTML = '';

  const lang = getLang();

  matches.forEach((item, index) => {
    const itemBtn = document.createElement('button');
    itemBtn.type = 'button';
    itemBtn.className = 'subject-autosuggest-item';
    itemBtn.dataset.index = index;

    const primaryName = item.names?.[lang] || item.names?.uz || item.id;
    const otherLangs = ['uz', 'ru', 'en'].filter(l => l !== lang);
    const subText = otherLangs.map(l => item.names?.[l]).filter(Boolean).join(' · ');

    itemBtn.innerHTML = `
      <div class="subject-autosuggest-left">
        <div class="subject-autosuggest-icon-badge" style="color: ${modalState.selectedColor};">
          ${item.svg}
        </div>
        <div class="subject-autosuggest-text">
          <span class="subject-autosuggest-name">${primaryName}</span>
          <span class="subject-autosuggest-sub">${subText}</span>
        </div>
      </div>
      <span class="subject-autosuggest-category-tag">${item.category || item.categoryId || ''}</span>
    `;

    itemBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectAutosuggestItem(item);
    });

    box.appendChild(itemBtn);
  });

  box.classList.add('open');
  box.setAttribute('aria-hidden', 'false');
}

export function selectAutosuggestItem(item) {
  const nameInput = document.getElementById('subject-modal-name-input');
  const lang = getLang();
  if (nameInput) {
    nameInput.value = item.names?.[lang] || item.names?.uz || item.id;
  }

  modalState.selectedIcon = item.id;
  modalState.isCustomIconSelected = true;

  renderIconSelector();
  updateLivePreview();
  closeAutosuggest();
}

export function highlightAutosuggestItem(box) {
  const items = box.querySelectorAll('.subject-autosuggest-item');
  items.forEach((item, idx) => {
    if (idx === modalState.autosuggestActiveIndex) {
      item.classList.add('selected');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('selected');
    }
  });
}
