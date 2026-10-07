import { modalState, resetModalState } from './state.js';
import { renderPalette, recordUsedColor, resetPresetColorsToDefault } from './color-picker.js';
import { renderIconSelector, openIconPickerPopover, closeIconPickerPopover, renderIconPickerContent, recordUsedIcon, sessionPresetIcons } from './icon-picker.js';
import { updateLivePreview } from './preview.js';
import { closeAutosuggest, handleAutosuggestSearch, selectAutosuggestItem, highlightAutosuggestItem } from './autosuggest.js';
import { addSubject, updateSubject, setActiveSubjectId, getSubjectName, isDuplicateSubjectName } from '../subjects.js';
import { renderDailyGoalCard } from '../daily-goal.js';
import { renderStats } from '../stats.js';
import { renderTimerSubjectBadge, renderTimerSubjectDropdown, showTopNotification } from '../timer-subject-badge.js';
import { getSubjectByMatch, getSubjectSvg } from '../subjects-db.js';
import { onLanguageChange, tr, getLang } from '../i18n.js';
import { getSafeColor, isWhiteColor } from './color-utils.js';
import { showToast } from '../activity.js';

export function updateCharCounter(val = '') {
  const counter = document.getElementById('subject-modal-char-counter');
  if (!counter) return;
  const len = (val || '').length;
  counter.textContent = `${len}/20`;
  if (len >= 20) {
    counter.classList.add('limit-reached');
  } else {
    counter.classList.remove('limit-reached');
  }
}

export function triggerEmptyInputError() {
  const nameInput = document.getElementById('subject-modal-name-input');
  const inputWrap = document.getElementById('subject-modal-input-wrap');
  const errorText = document.getElementById('subject-modal-error-text');

  const msg = tr().subjectModalEmptyError || (getLang() === 'ru' ? 'Введите название предмета' : getLang() === 'en' ? 'Please enter a subject name' : 'Fan nomini kiriting');

  if (errorText) {
    errorText.textContent = msg;
    errorText.style.display = 'inline';
  }

  if (nameInput) {
    nameInput.classList.add('is-invalid');
    nameInput.focus();
  }

  if (inputWrap) {
    inputWrap.classList.remove('shake-error');
    void inputWrap.offsetWidth; // trigger reflow
    inputWrap.classList.add('shake-error');
  }
}

export function clearInputError() {
  const nameInput = document.getElementById('subject-modal-name-input');
  const inputWrap = document.getElementById('subject-modal-input-wrap');
  const errorText = document.getElementById('subject-modal-error-text');

  if (nameInput) nameInput.classList.remove('is-invalid');
  if (inputWrap) inputWrap.classList.remove('shake-error');
  if (errorText) errorText.style.display = 'none';
}

let isOpeningModalFocus = false;

export function openSubjectModal(subjectToEdit = null) {
  const modal = document.getElementById('subject-custom-modal');
  if (!modal) return;

  const titleEl = document.getElementById('subject-modal-title');
  const saveBtn = document.getElementById('subject-modal-save-btn');
  const nameInput = document.getElementById('subject-modal-name-input');

  resetModalState();
  clearInputError();

  if (subjectToEdit && typeof subjectToEdit === 'object' && subjectToEdit.id) {
    // Subject Editor Mode: Edit currently selected subject
    modalState.editingSubjectId = subjectToEdit.id;
    const initialName = getSubjectName(subjectToEdit);
    if (nameInput) {
      nameInput.value = initialName;
    }
    updateCharCounter(initialName);

    const rawColor = subjectToEdit.color || '#4ec9b0';
    modalState.selectedColor = isWhiteColor(rawColor) ? '#ffffff' : rawColor;
    modalState.selectedIcon = subjectToEdit.icon || '';

    // Check if icon is preset or custom
    const isPreset = sessionPresetIcons.some(p => p.id === modalState.selectedIcon);
    modalState.isCustomIconSelected = Boolean(modalState.selectedIcon && !isPreset);

    if (titleEl) {
      titleEl.textContent = tr().subjectEditor || (getLang() === 'ru' ? 'Редактор предмета' : getLang() === 'uz' ? 'Fanni tahrirlash' : 'Subject Editor');
    }
    if (saveBtn) {
      saveBtn.textContent = tr().saveChanges || (getLang() === 'ru' ? 'Сохранить изменения' : getLang() === 'uz' ? "O'zgarishlarni saqlash" : 'Save Changes');
    }
  } else {
    // Add New Subject Mode
    modalState.editingSubjectId = null;
    if (nameInput) {
      nameInput.value = '';
    }
    updateCharCounter('');

    if (titleEl) {
      titleEl.textContent = tr().subjectModalTitle || (getLang() === 'ru' ? 'Добавить предмет' : getLang() === 'uz' ? "Yangi fan qo'shish" : 'Add New Subject');
    }
    if (saveBtn) {
      saveBtn.textContent = tr().subjectModalSave || (getLang() === 'ru' ? 'Создать предмет' : getLang() === 'uz' ? 'Fan yaratish' : 'Create Subject');
    }
  }

  closeIconPickerPopover();
  closeAutosuggest();
  renderPalette();
  renderIconSelector();
  updateLivePreview();

  // Update reset color button tooltip
  const resetColorBtn = document.getElementById('subject-color-reset-btn');
  if (resetColorBtn) {
    const tip = tr().subjectModalResetColors || 'Ranglar tarixini standart holatga qaytarish';
    resetColorBtn.title = tip;
    resetColorBtn.setAttribute('aria-label', tip);
  }

  modal.classList.add('open');
  document.body.classList.add('subject-modal-open');
  document.documentElement.classList.add('subject-modal-open');

  // Immediate autofocus and smart selection for snappy typing experience
  isOpeningModalFocus = true;
  requestAnimationFrame(() => {
    if (nameInput) {
      nameInput.focus();
      if (subjectToEdit) {
        nameInput.select();
      }
    }
    setTimeout(() => {
      isOpeningModalFocus = false;
    }, 150);
  });
}

export function closeSubjectModal() {
  const modal = document.getElementById('subject-custom-modal');
  if (modal) {
    modal.classList.remove('open');
  }
  document.body.classList.remove('subject-modal-open');
  document.documentElement.classList.remove('subject-modal-open');
  modalState.editingSubjectId = null;
  closeIconPickerPopover();
  closeAutosuggest();
}

export function initSubjectModal() {
  const modal = document.getElementById('subject-custom-modal');
  const backdrop = document.getElementById('subject-modal-backdrop');
  const closeBtn = document.getElementById('subject-modal-close-btn');
  const cancelBtn = document.getElementById('subject-modal-cancel-btn');
  const saveBtn = document.getElementById('subject-modal-save-btn');
  const nameInput = document.getElementById('subject-modal-name-input');

  // Icon picker elements
  const iconPickerCloseBtn = document.getElementById('icon-picker-close-btn');
  const iconPickerSearchInput = document.getElementById('icon-picker-search-input');
  const iconPickerPopover = document.getElementById('subject-icon-picker-popover');

  if (backdrop) backdrop.addEventListener('click', closeSubjectModal);
  if (closeBtn) closeBtn.addEventListener('click', closeSubjectModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeSubjectModal);

  // Prevent clicks inside icon picker popover from bubbling
  if (iconPickerPopover) {
    iconPickerPopover.addEventListener('click', (e) => e.stopPropagation());
    iconPickerPopover.addEventListener('mousedown', (e) => e.stopPropagation());
    iconPickerPopover.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
  }

  // Handle Enter and Escape keys
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (iconPickerPopover && iconPickerPopover.classList.contains('open')) {
        e.preventDefault();
        e.stopPropagation();
        closeIconPickerPopover();
        return;
      }
      const autosuggestBox = document.getElementById('subject-name-autosuggest');
      if (autosuggestBox && autosuggestBox.classList.contains('open')) {
        e.preventDefault();
        e.stopPropagation();
        closeAutosuggest();
        return;
      }
      if (modal && modal.classList.contains('open')) {
        e.preventDefault();
        e.stopPropagation();
        closeSubjectModal();
        return;
      }
    }
  });

  // Global click handler to close popovers and autosuggest on outside click
  document.addEventListener('click', (e) => {
    if (iconPickerPopover && iconPickerPopover.classList.contains('open')) {
      const isInside = iconPickerPopover.contains(e.target) || (e.target.closest && e.target.closest('.subject-custom-icon-btn'));
      if (!isInside) {
        closeIconPickerPopover();
      }
    }

    const autosuggestBox = document.getElementById('subject-name-autosuggest');
    if (autosuggestBox && autosuggestBox.classList.contains('open')) {
      const isInsideInput = e.target === nameInput || (autosuggestBox && autosuggestBox.contains(e.target));
      if (!isInsideInput) {
        closeAutosuggest();
      }
    }
  });

  if (iconPickerCloseBtn) {
    iconPickerCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeIconPickerPopover();
    });
  }

  const iconPickerClearBtn = document.getElementById('icon-picker-clear-btn');
  let searchUndoStack = [];
  let searchRedoStack = [];

  function updateIconClearBtnVisibility(val) {
    if (iconPickerClearBtn) {
      iconPickerClearBtn.style.display = val && val.trim().length > 0 ? 'flex' : 'none';
    }
  }

  if (iconPickerSearchInput) {
    let iconSearchRaf = null;

    iconPickerSearchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      updateIconClearBtnVisibility(val);

      if (iconSearchRaf) cancelAnimationFrame(iconSearchRaf);
      iconSearchRaf = requestAnimationFrame(() => {
        renderIconPickerContent(val);
      });
    });

    // Undo / Redo keydown (Ctrl+Z / Cmd+Z / Cmd+Shift+Z / Ctrl+Y)
    iconPickerSearchInput.addEventListener('keydown', (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        if (!e.shiftKey) {
          // Undo
          if (searchUndoStack.length > 0) {
            e.preventDefault();
            const prev = searchUndoStack.pop();
            searchRedoStack.push(iconPickerSearchInput.value);
            iconPickerSearchInput.value = prev;
            updateIconClearBtnVisibility(prev);
            renderIconPickerContent(prev);
          }
        } else {
          // Redo (Cmd+Shift+Z)
          if (searchRedoStack.length > 0) {
            e.preventDefault();
            const next = searchRedoStack.pop();
            searchUndoStack.push(iconPickerSearchInput.value);
            iconPickerSearchInput.value = next;
            updateIconClearBtnVisibility(next);
            renderIconPickerContent(next);
          }
        }
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
        // Redo (Ctrl+Y)
        if (searchRedoStack.length > 0) {
          e.preventDefault();
          const next = searchRedoStack.pop();
          searchUndoStack.push(iconPickerSearchInput.value);
          iconPickerSearchInput.value = next;
          updateIconClearBtnVisibility(next);
          renderIconPickerContent(next);
        }
      }
    });
  }

  if (iconPickerClearBtn && iconPickerSearchInput) {
    iconPickerClearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentVal = iconPickerSearchInput.value;
      if (currentVal && currentVal.trim().length > 0) {
        searchUndoStack.push(currentVal);
        searchRedoStack = [];
      }
      iconPickerSearchInput.value = '';
      updateIconClearBtnVisibility('');
      renderIconPickerContent('');
      iconPickerSearchInput.focus();
    });
  }

  // Name Input & Auto-suggest interactions
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value;
      updateCharCounter(val);
      if (val.trim().length > 0) {
        clearInputError();
      }

      updateLivePreview();
      handleAutosuggestSearch(val);
    });

    nameInput.addEventListener('focus', (e) => {
      if (isOpeningModalFocus) return;
      if (e.target.value.trim().length > 0) {
        handleAutosuggestSearch(e.target.value);
      }
    });

    nameInput.addEventListener('keydown', (e) => {
      const autosuggestBox = document.getElementById('subject-name-autosuggest');
      const isAutosuggestOpen = autosuggestBox && autosuggestBox.classList.contains('open');

      if (isAutosuggestOpen && modalState.currentAutosuggestList.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          modalState.autosuggestActiveIndex = (modalState.autosuggestActiveIndex + 1) % modalState.currentAutosuggestList.length;
          highlightAutosuggestItem(autosuggestBox);
          return;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          modalState.autosuggestActiveIndex = (modalState.autosuggestActiveIndex - 1 + modalState.currentAutosuggestList.length) % modalState.currentAutosuggestList.length;
          highlightAutosuggestItem(autosuggestBox);
          return;
        } else if (e.key === 'Enter') {
          if (modalState.autosuggestActiveIndex >= 0 && modalState.autosuggestActiveIndex < modalState.currentAutosuggestList.length) {
            e.preventDefault();
            selectAutosuggestItem(modalState.currentAutosuggestList[modalState.autosuggestActiveIndex]);
            return;
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeAutosuggest();
          return;
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (saveBtn) saveBtn.click();
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = nameInput ? nameInput.value.trim() : '';
      if (!name) {
        triggerEmptyInputError();
        return;
      }

      // Check for duplicate subject name (in both Add New Subject and Subject Editor modes)
      if (isDuplicateSubjectName(name, modalState.editingSubjectId)) {
        const alertMsg = (tr() && tr().subjectAlreadyExists) || 'The subject already existing';
        showTopNotification(alertMsg);

        if (nameInput) {
          nameInput.classList.add('is-invalid');
        }
        const inputWrap = document.getElementById('subject-modal-input-wrap');
        if (inputWrap) {
          inputWrap.classList.remove('shake-error');
          void inputWrap.offsetWidth;
          inputWrap.classList.add('shake-error');
        }
        return;
      }

      const chosenColor = modalState.selectedColor || '#4ec9b0';
      const safeColor = isWhiteColor(chosenColor) ? '#ffffff' : getSafeColor(chosenColor);

      if (modalState.editingSubjectId) {
        // Edit existing subject
        const updated = updateSubject(modalState.editingSubjectId, {
          name,
          color: safeColor,
          icon: modalState.selectedIcon
        });

        if (safeColor) {
          recordUsedColor(safeColor);
        }

        if (modalState.selectedIcon) {
          recordUsedIcon(modalState.selectedIcon);
        }

        closeSubjectModal();

        // Immediately rerender on current screen
        renderTimerSubjectBadge();
        renderTimerSubjectDropdown();
        renderDailyGoalCard();
        renderStats();

        const toastMsg = typeof tr().subjectUpdated === 'function' ? tr().subjectUpdated(name) : `${name} updated`;
        showToast(toastMsg);
        return;
      }

      // Add new subject
      const created = addSubject({
        name,
        color: safeColor,
        icon: modalState.selectedIcon,
        defaultGoal: 60 // 1 hour default
      });

      if (safeColor) {
        recordUsedColor(safeColor);
      }

      if (modalState.selectedIcon) {
        recordUsedIcon(modalState.selectedIcon);
      }

      setActiveSubjectId(created.id);
      closeSubjectModal();

      // Immediately rerender on current screen
      renderTimerSubjectBadge();
      renderTimerSubjectDropdown();
      renderDailyGoalCard();
      renderStats();

      const createMsg = typeof tr().subjectCreated === 'function' ? tr().subjectCreated(name) : `${name} created`;
      showToast(createMsg);
    });
  }

  // Reload button to reset recent colors back to default static palette
  let resetColorTimeout = null;
  const resetColorBtn = document.getElementById('subject-color-reset-btn');
  if (resetColorBtn) {
    resetColorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (resetColorTimeout) {
        clearTimeout(resetColorTimeout);
        resetColorTimeout = null;
      }
      resetColorBtn.classList.remove('spinning');
      void resetColorBtn.offsetWidth;
      resetColorBtn.classList.add('spinning');
      resetColorTimeout = setTimeout(() => {
        resetColorBtn.classList.remove('spinning');
        resetColorTimeout = null;
      }, 550);
      resetPresetColorsToDefault();
    });
  }

  // Trash / Clear button to erase text in subject name input
  const nameClearBtn = document.getElementById('subject-name-clear-btn');
  if (nameClearBtn && nameInput) {
    nameClearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      nameInput.value = '';
      updateCharCounter('');
      clearInputError();
      closeAutosuggest();
      updateLivePreview();
      nameInput.focus();
    });
  }

  const updateModalI18nLabels = () => {
    const nameLabel = document.getElementById('subject-modal-name-label');
    if (nameLabel && tr().subjectModalNameLabel) {
      nameLabel.textContent = tr().subjectModalNameLabel;
    }
    const colorLabel = document.getElementById('subject-modal-color-label');
    if (colorLabel && tr().subjectModalColorLabel) {
      colorLabel.textContent = tr().subjectModalColorLabel;
    }
    const colorResetBtn = document.getElementById('subject-color-reset-btn');
    if (colorResetBtn && tr().subjectModalResetColors) {
      colorResetBtn.title = tr().subjectModalResetColors;
      colorResetBtn.setAttribute('aria-label', tr().subjectModalResetColors);
    }
    const nameClearBtnEl = document.getElementById('subject-name-clear-btn');
    if (nameClearBtnEl && tr().subjectModalClearName) {
      nameClearBtnEl.title = tr().subjectModalClearName;
      nameClearBtnEl.setAttribute('aria-label', tr().subjectModalClearName);
    }
  };

  updateModalI18nLabels();

  onLanguageChange(() => {
    updateModalI18nLabels();
    updateLivePreview();
    renderIconSelector();
  });
}
