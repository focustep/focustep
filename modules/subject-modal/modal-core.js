import { modalState, resetModalState } from './state.js';
import { renderPalette, openColorPickerPopover, closeColorPickerPopover, drawCanvasGradient, updateCanvasCursor, handleCanvasPick, setCustomColor } from './color-picker.js';
import { renderIconSelector, openIconPickerPopover, closeIconPickerPopover, renderIconPickerContent } from './icon-picker.js';
import { updateLivePreview } from './preview.js';
import { closeAutosuggest, handleAutosuggestSearch, selectAutosuggestItem, highlightAutosuggestItem } from './autosuggest.js';
import { hsvToHex, hexToHsv } from './color-utils.js';
import { addSubject, setActiveSubjectId } from '../subjects.js';
import { renderDailyGoalCard } from '../daily-goal.js';
import { renderStats } from '../stats.js';
import { renderTimerSubjectBadge, renderTimerSubjectDropdown } from '../timer-subject-badge.js';
import { getSubjectByMatch } from '../subjects-db.js';

export function openSubjectModal() {
  const modal = document.getElementById('subject-custom-modal');
  if (!modal) return;

  const nameInput = document.getElementById('subject-modal-name-input');
  if (nameInput) {
    nameInput.value = '';
  }

  // Reset to random color and first icon
  resetModalState();

  closeColorPickerPopover();
  closeIconPickerPopover();
  closeAutosuggest();
  renderPalette();
  renderIconSelector();
  updateLivePreview();

  modal.classList.add('open');
  if (nameInput) {
    setTimeout(() => nameInput.focus(), 50);
  }
}

export function closeSubjectModal() {
  const modal = document.getElementById('subject-custom-modal');
  if (modal) {
    modal.classList.remove('open');
  }
  closeColorPickerPopover();
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

  // Color picker elements
  const pickerCanvasWrap = document.getElementById('color-picker-canvas-wrap');
  const pickerHueSlider = document.getElementById('color-picker-hue-slider');
  const pickerHexInput = document.getElementById('color-picker-hex-input');
  const pickerApplyBtn = document.getElementById('color-picker-apply-btn');
  const pickerCloseBtn = document.getElementById('color-picker-close-btn');
  const pickerPopover = document.getElementById('subject-color-picker-popover');

  // Icon picker elements
  const iconPickerCloseBtn = document.getElementById('icon-picker-close-btn');
  const iconPickerSearchInput = document.getElementById('icon-picker-search-input');
  const iconPickerPopover = document.getElementById('subject-icon-picker-popover');

  if (backdrop) backdrop.addEventListener('click', closeSubjectModal);
  if (closeBtn) closeBtn.addEventListener('click', closeSubjectModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeSubjectModal);

  // Prevent clicks inside color picker popover from bubbling
  if (pickerPopover) {
    pickerPopover.addEventListener('click', (e) => e.stopPropagation());
    pickerPopover.addEventListener('mousedown', (e) => e.stopPropagation());
    pickerPopover.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
  }

  // Prevent clicks inside icon picker popover from bubbling
  if (iconPickerPopover) {
    iconPickerPopover.addEventListener('click', (e) => e.stopPropagation());
    iconPickerPopover.addEventListener('mousedown', (e) => e.stopPropagation());
    iconPickerPopover.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
  }

  // Handle Enter and Escape keys when popovers are open
  document.addEventListener('keydown', (e) => {
    if (pickerPopover && pickerPopover.classList.contains('open')) {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeColorPickerPopover();
        renderPalette();
      }
    } else if (iconPickerPopover && iconPickerPopover.classList.contains('open')) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeIconPickerPopover();
      }
    }
  });

  // Global click handler to close popovers and autosuggest on outside click
  document.addEventListener('click', (e) => {
    if (pickerPopover && pickerPopover.classList.contains('open')) {
      const isInside = pickerPopover.contains(e.target) || (e.target.closest && e.target.closest('.subject-custom-color-swatch'));
      if (!isInside) {
        closeColorPickerPopover();
        renderPalette();
      }
    }

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

  if (pickerCloseBtn) {
    pickerCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeColorPickerPopover();
      renderPalette();
    });
  }

  if (pickerApplyBtn) {
    pickerApplyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeColorPickerPopover();
      renderPalette();
    });
  }

  if (iconPickerCloseBtn) {
    iconPickerCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeIconPickerPopover();
    });
  }

  if (iconPickerSearchInput) {
    iconPickerSearchInput.addEventListener('input', (e) => {
      renderIconPickerContent(e.target.value);
    });
  }

  // 2D Canvas Drag / Click interactions
  if (pickerCanvasWrap) {
    pickerCanvasWrap.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      modalState.isDraggingCanvas = true;
      handleCanvasPick(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (modalState.isDraggingCanvas) {
        handleCanvasPick(e);
      }
    });

    window.addEventListener('mouseup', () => {
      if (modalState.isDraggingCanvas) {
        modalState.isDraggingCanvas = false;
      }
    });

    pickerCanvasWrap.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      modalState.isDraggingCanvas = true;
      handleCanvasPick(e);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (modalState.isDraggingCanvas) {
        handleCanvasPick(e);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (modalState.isDraggingCanvas) {
        modalState.isDraggingCanvas = false;
      }
    });
  }

  // Hue Slider input
  if (pickerHueSlider) {
    pickerHueSlider.addEventListener('input', (e) => {
      modalState.pickerHue = parseFloat(e.target.value);
      drawCanvasGradient();
      const hex = hsvToHex(modalState.pickerHue, modalState.pickerSat, modalState.pickerVal);
      setCustomColor(hex);
    });
  }

  // Hex text input & Enter key support
  if (pickerHexInput) {
    pickerHexInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/[^0-9a-fA-F]/g, '');
      if (val.length > 6) val = val.substring(0, 6);
      if (val.length === 6) {
        const hex = '#' + val;
        setCustomColor(hex);
        const hsv = hexToHsv(hex);
        modalState.pickerHue = hsv.h;
        modalState.pickerSat = hsv.s;
        modalState.pickerVal = hsv.v;
        if (pickerHueSlider) pickerHueSlider.value = Math.round(modalState.pickerHue);
        drawCanvasGradient();
        updateCanvasCursor();
      }
    });

    pickerHexInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        closeColorPickerPopover();
        renderPalette();
      }
    });

    pickerHexInput.addEventListener('blur', (e) => {
      e.target.value = modalState.customColorValue.replace(/^#/, '').toUpperCase();
    });
  }

  // Name Input & Auto-suggest interactions
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value;
      updateLivePreview();
      handleAutosuggestSearch(val);

      // Instant match detection
      const directMatch = getSubjectByMatch(val);
      if (directMatch) {
        modalState.selectedIcon = directMatch.id;
        modalState.isCustomIconSelected = true;
        renderIconSelector();
        updateLivePreview();
      }
    });

    nameInput.addEventListener('focus', (e) => {
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
        if (nameInput) nameInput.focus();
        return;
      }

      const created = addSubject({
        name,
        color: modalState.selectedColor,
        icon: modalState.selectedIcon,
        defaultGoal: 60 // 1 hour default
      });

      setActiveSubjectId(created.id);
      closeSubjectModal();

      // Immediately rerender on current screen
      renderTimerSubjectBadge();
      renderTimerSubjectDropdown();
      renderDailyGoalCard();
      renderStats();
    });
  }
}
