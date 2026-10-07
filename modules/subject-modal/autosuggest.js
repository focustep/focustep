import { modalState } from './state.js';
import { updateLivePreview } from './preview.js';
import { renderIconSelector, recordUsedIcon } from './icon-picker.js';
import { findMatchingSubjects, getSubjectLocalizedName } from '../subjects-db.js';
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

  const matches = findMatchingSubjects(query).slice(0, 16);
  const lang = getLang();

  if (matches.length === 0) {
    modalState.currentAutosuggestList = [];
    modalState.autosuggestActiveIndex = -1;
    box.innerHTML = '';

    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'subject-autosuggest-empty';
    
    let msg = "Hech qanday standart fan topilmadi, o'z nomingiz bilan davom eting";
    if (lang === 'ru') {
      msg = "Стандартный предмет не найден, продолжайте с вашим названием";
    } else if (lang === 'en') {
      msg = "No standard subject found, continue with your custom name";
    }

    emptyDiv.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="subject-autosuggest-empty-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span>${msg}</span>
    `;

    box.appendChild(emptyDiv);
    box.classList.add('open');
    box.setAttribute('aria-hidden', 'false');
    return;
  }

  modalState.currentAutosuggestList = matches;
  modalState.autosuggestActiveIndex = -1;
  box.innerHTML = '';

  const fragment = document.createDocumentFragment();

  matches.forEach((item, index) => {
    const itemBtn = document.createElement('button');
    itemBtn.type = 'button';
    itemBtn.className = 'subject-autosuggest-item';
    itemBtn.dataset.index = index;

    const primaryName = getSubjectLocalizedName(item, lang) || item.id;

    itemBtn.innerHTML = `
      <div class="subject-autosuggest-left">
        <div class="subject-autosuggest-icon-badge" style="color: ${modalState.selectedColor};">
          ${item.svg}
        </div>
        <span class="subject-autosuggest-name">${primaryName}</span>
      </div>
    `;

    itemBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectAutosuggestItem(item);
    });

    fragment.appendChild(itemBtn);
  });

  box.appendChild(fragment);
  box.classList.add('open');
  box.setAttribute('aria-hidden', 'false');
}

export function selectAutosuggestItem(item) {
  const nameInput = document.getElementById('subject-modal-name-input');
  const lang = getLang();
  if (nameInput) {
    const val = getSubjectLocalizedName(item, lang) || item.id;
    nameInput.value = val;
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  modalState.selectedIcon = item.id;
  modalState.isCustomIconSelected = true;
  recordUsedIcon(item.id);

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
