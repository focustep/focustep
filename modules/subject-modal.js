import { getSubjects, addSubject, setActiveSubjectId } from './subjects.js';
import { renderDailyGoalCard } from './daily-goal.js';
import { renderStats } from './stats.js';

const PRESET_COLORS = [
  '#ea580c', // Orange (English)
  '#10b981', // Green (Physics)
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#7c3aed', // Purple (moved to 9th position)
  '#ef4444'  // Red
];

const PRESET_ICONS = [
  { id: 'book', label: 'Book', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>' },
  { id: 'math', label: 'Math', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>' },
  { id: 'code', label: 'Code', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>' },
  { id: 'science', label: 'Science', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31"></path><path d="M14 9.3V2"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>' },
  { id: 'globe', label: 'Language', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>' },
  { id: 'palette', label: 'Art', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>' },
  { id: 'music', label: 'Music', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>' },
  { id: 'target', label: 'Goal', svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>' }
];

let selectedColor = PRESET_COLORS[0];
let customColorValue = '#6366f1';
let isCustomSelected = false;
let selectedIcon = PRESET_ICONS[0].id;

let pickerHue = 238;
let pickerSat = 0.58;
let pickerVal = 0.94;
let isDraggingCanvas = false;

function hsvToHex(h, s, v) {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsv(hexStr) {
  let hex = hexStr.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) return { h: 240, s: 0.6, v: 0.9 };
  const num = parseInt(hex, 16);
  if (isNaN(num)) return { h: 240, s: 0.6, v: 0.9 };
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, v };
}

export function openSubjectModal() {
  const modal = document.getElementById('subject-custom-modal');
  if (!modal) return;

  const nameInput = document.getElementById('subject-modal-name-input');
  if (nameInput) {
    nameInput.value = '';
  }

  // Reset to first color and icon
  selectedColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
  selectedIcon = PRESET_ICONS[0].id;
  isCustomSelected = false;

  closeColorPickerPopover();
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
}

function openColorPickerPopover() {
  const popover = document.getElementById('subject-color-picker-popover');
  if (!popover) return;

  const hsv = hexToHsv(customColorValue);
  pickerHue = hsv.h;
  pickerSat = hsv.s;
  pickerVal = hsv.v;

  initColorPickerUI();
  popover.classList.add('open');
  popover.setAttribute('aria-hidden', 'false');
}

function closeColorPickerPopover() {
  const popover = document.getElementById('subject-color-picker-popover');
  if (popover) {
    popover.classList.remove('open');
    popover.setAttribute('aria-hidden', 'true');
  }
}

function initColorPickerUI() {
  const slider = document.getElementById('color-picker-hue-slider');
  const hexInput = document.getElementById('color-picker-hex-input');
  const previewDot = document.getElementById('color-picker-preview-dot');

  if (slider) slider.value = Math.round(pickerHue);
  if (hexInput) hexInput.value = customColorValue.replace(/^#/, '').toUpperCase();
  if (previewDot) previewDot.style.backgroundColor = customColorValue;

  drawCanvasGradient();
  updateCanvasCursor();
}

function drawCanvasGradient() {
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
  gradH.addColorStop(1, `hsl(${pickerHue}, 100%, 50%)`);
  ctx.fillStyle = gradH;
  ctx.fillRect(0, 0, width, height);

  // 2. Vertical gradient: Transparent to Black
  const gradV = ctx.createLinearGradient(0, 0, 0, height);
  gradV.addColorStop(0, 'rgba(0,0,0,0)');
  gradV.addColorStop(1, '#000000');
  ctx.fillStyle = gradV;
  ctx.fillRect(0, 0, width, height);
}

function updateCanvasCursor() {
  const canvas = document.getElementById('color-picker-canvas');
  const cursor = document.getElementById('color-picker-cursor');
  if (!canvas || !cursor) return;

  const rect = canvas.getBoundingClientRect();
  const x = pickerSat * rect.width;
  const y = (1 - pickerVal) * rect.height;

  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
}

function handleCanvasPick(e) {
  const canvas = document.getElementById('color-picker-canvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  let x = clientX - rect.left;
  let y = clientY - rect.top;

  x = Math.max(0, Math.min(rect.width, x));
  y = Math.max(0, Math.min(rect.height, y));

  pickerSat = x / rect.width;
  pickerVal = 1 - (y / rect.height);

  const hex = hsvToHex(pickerHue, pickerSat, pickerVal);
  setCustomColor(hex);

  const cursor = document.getElementById('color-picker-cursor');
  if (cursor) {
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  }
}

function setCustomColor(hex, updatePaletteDom = false) {
  customColorValue = hex;
  selectedColor = hex;
  isCustomSelected = true;

  const hexInput = document.getElementById('color-picker-hex-input');
  const previewDot = document.getElementById('color-picker-preview-dot');
  if (hexInput) hexInput.value = hex.replace(/^#/, '').toUpperCase();
  if (previewDot) previewDot.style.backgroundColor = hex;

  updateLivePreview();
  if (updatePaletteDom) {
    renderPalette();
  }
}

function renderPalette() {
  const paletteContainer = document.getElementById('subject-modal-colors');
  if (!paletteContainer) return;

  paletteContainer.innerHTML = '';

  // 1. Custom Rainbow Donut Swatch (First position in Row 1)
  const customBtn = document.createElement('button');
  customBtn.type = 'button';
  const isCustomActive = isCustomSelected || (!PRESET_COLORS.includes(selectedColor));
  customBtn.className = `subject-custom-color-swatch ${isCustomActive ? 'selected' : ''}`;
  customBtn.setAttribute('aria-label', 'Custom Color');
  customBtn.title = 'Choose custom color';

  customBtn.innerHTML = `
    <span class="rainbow-donut-circle"></span>
  `;

  customBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isCustomSelected = true;
    selectedColor = customColorValue;
    updateLivePreview();
    renderPalette();
    openColorPickerPopover();
  });

  paletteContainer.appendChild(customBtn);

  // 2. Preset Colors (Slots 2 to 10)
  PRESET_COLORS.forEach(color => {
    const sw = document.createElement('button');
    sw.type = 'button';
    const isSelected = (!isCustomActive) && (color === selectedColor);
    sw.className = `subject-color-swatch ${isSelected ? 'selected' : ''}`;
    sw.style.backgroundColor = color;
    sw.setAttribute('aria-label', color);
    
    if (isSelected) {
      sw.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    }

    sw.addEventListener('click', () => {
      isCustomSelected = false;
      selectedColor = color;
      closeColorPickerPopover();
      renderPalette();
      updateLivePreview();
    });

    paletteContainer.appendChild(sw);
  });
}

function renderIconSelector() {
  const iconContainer = document.getElementById('subject-modal-icons');
  if (!iconContainer) return;

  iconContainer.innerHTML = '';
  PRESET_ICONS.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `subject-icon-btn ${item.id === selectedIcon ? 'selected' : ''}`;
    btn.title = item.label;
    btn.innerHTML = item.svg;

    btn.addEventListener('click', () => {
      selectedIcon = item.id;
      renderIconSelector();
      updateLivePreview();
    });

    iconContainer.appendChild(btn);
  });
}

function updateLivePreview() {
  const previewBadge = document.getElementById('subject-modal-preview-badge');
  const previewDot = document.getElementById('subject-modal-preview-dot');
  const previewText = document.getElementById('subject-modal-preview-text');
  const nameInput = document.getElementById('subject-modal-name-input');

  const name = (nameInput && nameInput.value.trim()) || 'New Subject';

  if (previewDot) {
    previewDot.style.backgroundColor = selectedColor;
  }
  if (previewText) {
    previewText.textContent = name;
  }
  if (previewBadge) {
    previewBadge.style.borderColor = selectedColor;
  }
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

  if (backdrop) backdrop.addEventListener('click', closeSubjectModal);
  if (closeBtn) closeBtn.addEventListener('click', closeSubjectModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeSubjectModal);

  // Prevent clicks inside color picker popover from bubbling and triggering unwanted handlers
  if (pickerPopover) {
    pickerPopover.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    pickerPopover.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    pickerPopover.addEventListener('touchstart', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  // Handle Enter and Escape keys when color picker popover is open
  document.addEventListener('keydown', (e) => {
    if (pickerPopover && pickerPopover.classList.contains('open')) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        closeColorPickerPopover();
        renderPalette();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeColorPickerPopover();
        renderPalette();
      }
    }
  });

  // Close color picker popover ONLY when clicking genuinely outside both the popover and custom button
  document.addEventListener('click', (e) => {
    if (pickerPopover && pickerPopover.classList.contains('open')) {
      const isInside = pickerPopover.contains(e.target) || (e.target.closest && e.target.closest('.subject-custom-color-swatch'));
      if (!isInside) {
        closeColorPickerPopover();
        renderPalette();
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

  // 2D Canvas Drag / Click interactions
  if (pickerCanvasWrap) {
    pickerCanvasWrap.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDraggingCanvas = true;
      handleCanvasPick(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingCanvas) {
        handleCanvasPick(e);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDraggingCanvas) {
        isDraggingCanvas = false;
      }
    });

    pickerCanvasWrap.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      isDraggingCanvas = true;
      handleCanvasPick(e);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDraggingCanvas) {
        handleCanvasPick(e);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (isDraggingCanvas) {
        isDraggingCanvas = false;
      }
    });
  }

  // Hue Slider input
  if (pickerHueSlider) {
    pickerHueSlider.addEventListener('input', (e) => {
      pickerHue = parseFloat(e.target.value);
      drawCanvasGradient();
      const hex = hsvToHex(pickerHue, pickerSat, pickerVal);
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
        pickerHue = hsv.h;
        pickerSat = hsv.s;
        pickerVal = hsv.v;
        if (pickerHueSlider) pickerHueSlider.value = Math.round(pickerHue);
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
      e.target.value = customColorValue.replace(/^#/, '').toUpperCase();
    });
  }

  if (nameInput) {
    nameInput.addEventListener('input', updateLivePreview);
    nameInput.addEventListener('keydown', (e) => {
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
        color: selectedColor,
        icon: selectedIcon,
        defaultGoal: 60 // 1 hour default
      });

      setActiveSubjectId(created.id);
      closeSubjectModal();

      // Rerender daily goal & stats
      renderDailyGoalCard();
      renderStats();
    });
  }
}
