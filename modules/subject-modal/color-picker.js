import { PRESET_COLORS } from './constants.js';
import { modalState } from './state.js';
import { updateLivePreview } from './preview.js';
import { closeIconPickerPopover } from './icon-picker.js';
import { isWhiteColor } from './color-utils.js';

export const sessionPresetColors = [...PRESET_COLORS];

export function getSessionPresetColors() {
  return sessionPresetColors;
}

export function recordUsedColor(hex) {
  // No-op: Palette colors remain static and curated
}

export function resetPresetColorsToDefault() {
  modalState.selectedColor = PRESET_COLORS[0];
  modalState.isCustomSelected = false;
  renderPalette();
  updateLivePreview();
}

export function openColorPickerPopover() {
  // Popover removed
}

export function closeColorPickerPopover() {
  // Popover removed
}

export function setCustomColor(hex) {
  modalState.selectedColor = hex;
  updateLivePreview();
  renderPalette();
}

export function drawCanvasGradient() {}
export function updateCanvasCursor() {}
export function handleCanvasPick() {}

export function renderPalette() {
  const paletteContainer = document.getElementById('subject-modal-colors');
  if (!paletteContainer) return;

  paletteContainer.innerHTML = '';

  PRESET_COLORS.forEach(color => {
    const sw = document.createElement('button');
    sw.type = 'button';
    const isWhite = isWhiteColor(color);
    const isSelected = (color.toLowerCase() === (modalState.selectedColor || '').toLowerCase()) ||
                       (isWhite && isWhiteColor(modalState.selectedColor));
    
    sw.className = `subject-color-swatch ${isSelected ? 'selected' : ''} ${isWhite ? 'is-white-swatch' : ''}`;
    sw.style.backgroundColor = isWhite ? '#ffffff' : color;
    sw.setAttribute('aria-label', isWhite ? 'White' : color);
    sw.setAttribute('data-color', isWhite ? '#ffffff' : color);
    
    if (isSelected) {
      const checkStroke = '#000000';
      sw.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${checkStroke}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }

    sw.addEventListener('click', (e) => {
      e.stopPropagation();
      modalState.selectedColor = isWhite ? '#ffffff' : color;
      modalState.isCustomSelected = false;
      closeIconPickerPopover();
      renderPalette();
      updateLivePreview();
    });

    paletteContainer.appendChild(sw);
  });
}
