import { PRESET_COLORS } from './constants.js';
import { modalState } from './state.js';
import { hsvToHex, hexToHsv } from './color-utils.js';
import { updateLivePreview } from './preview.js';
import { closeIconPickerPopover } from './icon-picker.js';

export function triggerDonutSpin(reverse = false) {
  const donut = document.querySelector('.subject-custom-color-swatch .rainbow-donut-circle');
  if (!donut) return;
  donut.classList.remove('anim-spin', 'anim-spin-reverse');
  void donut.offsetWidth;
  donut.classList.add(reverse ? 'anim-spin-reverse' : 'anim-spin');
  setTimeout(() => {
    donut.classList.remove('anim-spin', 'anim-spin-reverse');
  }, 750);
}

export function openColorPickerPopover() {
  closeIconPickerPopover();
  const popover = document.getElementById('subject-color-picker-popover');
  if (!popover) return;

  const hsv = hexToHsv(modalState.customColorValue);
  modalState.pickerHue = hsv.h;
  modalState.pickerSat = hsv.s;
  modalState.pickerVal = hsv.v;

  initColorPickerUI();
  popover.classList.add('open');
  popover.setAttribute('aria-hidden', 'false');
  triggerDonutSpin(false);
}

export function closeColorPickerPopover() {
  const popover = document.getElementById('subject-color-picker-popover');
  if (popover && popover.classList.contains('open')) {
    popover.classList.remove('open');
    popover.setAttribute('aria-hidden', 'true');
    triggerDonutSpin(true);
  }
}

export function initColorPickerUI() {
  const slider = document.getElementById('color-picker-hue-slider');
  const hexInput = document.getElementById('color-picker-hex-input');
  const previewDot = document.getElementById('color-picker-preview-dot');

  if (slider) slider.value = Math.round(modalState.pickerHue);
  if (hexInput) hexInput.value = modalState.customColorValue.replace(/^#/, '').toUpperCase();
  if (previewDot) previewDot.style.backgroundColor = modalState.customColorValue;

  drawCanvasGradient();
  updateCanvasCursor();
}

export function drawCanvasGradient() {
  const canvas = document.getElementById('color-picker-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // 1. Horizontal gradient: White to Hue Color
  const gradH = ctx.createLinearGradient(0, 0, width, 0);
  gradH.addColorStop(0, '#ffffff');
  gradH.addColorStop(1, `hsl(${modalState.pickerHue}, 100%, 50%)`);
  ctx.fillStyle = gradH;
  ctx.fillRect(0, 0, width, height);

  // 2. Vertical gradient: Transparent to Black
  const gradV = ctx.createLinearGradient(0, 0, 0, height);
  gradV.addColorStop(0, 'rgba(0,0,0,0)');
  gradV.addColorStop(1, '#000000');
  ctx.fillStyle = gradV;
  ctx.fillRect(0, 0, width, height);
}

export function updateCanvasCursor() {
  const canvas = document.getElementById('color-picker-canvas');
  const cursor = document.getElementById('color-picker-cursor');
  if (!canvas || !cursor) return;

  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const rawX = modalState.pickerSat * rect.width;
  const rawY = (1 - modalState.pickerVal) * rect.height;

  const cursorRadius = 7;
  const visualX = Math.max(cursorRadius, Math.min(rect.width - cursorRadius, rawX));
  const visualY = Math.max(cursorRadius, Math.min(rect.height - cursorRadius, rawY));

  cursor.style.left = `${visualX}px`;
  cursor.style.top = `${visualY}px`;
}

export function handleCanvasPick(e) {
  const canvas = document.getElementById('color-picker-canvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  let clientX, clientY;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else if (typeof e.clientX === 'number') {
    clientX = e.clientX;
    clientY = e.clientY;
  } else {
    return;
  }

  const rawX = clientX - rect.left;
  const rawY = clientY - rect.top;

  const clampedX = Math.max(0, Math.min(rect.width, rawX));
  const clampedY = Math.max(0, Math.min(rect.height, rawY));

  modalState.pickerSat = clampedX / rect.width;
  modalState.pickerVal = 1 - (clampedY / rect.height);

  const hex = hsvToHex(modalState.pickerHue, modalState.pickerSat, modalState.pickerVal);
  setCustomColor(hex);

  const cursor = document.getElementById('color-picker-cursor');
  if (cursor) {
    const cursorRadius = 7;
    const visualX = Math.max(cursorRadius, Math.min(rect.width - cursorRadius, clampedX));
    const visualY = Math.max(cursorRadius, Math.min(rect.height - cursorRadius, clampedY));
    cursor.style.left = `${visualX}px`;
    cursor.style.top = `${visualY}px`;
  }
}

export function setCustomColor(hex, updatePaletteDom = false) {
  modalState.customColorValue = hex;
  modalState.selectedColor = hex;
  modalState.isCustomSelected = true;

  const hexInput = document.getElementById('color-picker-hex-input');
  const previewDot = document.getElementById('color-picker-preview-dot');
  if (hexInput) hexInput.value = hex.replace(/^#/, '').toUpperCase();
  if (previewDot) previewDot.style.backgroundColor = hex;

  updateLivePreview();
  if (updatePaletteDom) {
    renderPalette();
  }
}

export function renderPalette() {
  const paletteContainer = document.getElementById('subject-modal-colors');
  if (!paletteContainer) return;

  paletteContainer.innerHTML = '';

  // 1. Custom Rainbow Donut Swatch (First position in Row 1)
  const customBtn = document.createElement('button');
  customBtn.type = 'button';
  const isCustomActive = modalState.isCustomSelected || (!PRESET_COLORS.includes(modalState.selectedColor));
  customBtn.className = `subject-custom-color-swatch ${isCustomActive ? 'selected' : ''}`;
  customBtn.setAttribute('aria-label', 'Custom Color');
  customBtn.title = 'Choose custom color';

  customBtn.innerHTML = `
    <span class="rainbow-donut-circle"></span>
  `;

  customBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const popover = document.getElementById('subject-color-picker-popover');
    const isOpen = popover && popover.classList.contains('open');

    if (isOpen) {
      closeColorPickerPopover();
    } else {
      modalState.isCustomSelected = true;
      modalState.selectedColor = modalState.customColorValue;
      updateLivePreview();
      renderPalette();
      openColorPickerPopover();
    }
  });

  paletteContainer.appendChild(customBtn);

  // 2. Preset Colors (Slots 2 to 10)
  PRESET_COLORS.forEach(color => {
    const sw = document.createElement('button');
    sw.type = 'button';
    const isSelected = (!isCustomActive) && (color === modalState.selectedColor);
    sw.className = `subject-color-swatch ${isSelected ? 'selected' : ''}`;
    sw.style.backgroundColor = color;
    sw.setAttribute('aria-label', color);
    
    if (isSelected) {
      sw.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    }

    sw.addEventListener('click', () => {
      modalState.isCustomSelected = false;
      modalState.selectedColor = color;
      closeColorPickerPopover();
      renderPalette();
      updateLivePreview();
    });

    paletteContainer.appendChild(sw);
  });
}
