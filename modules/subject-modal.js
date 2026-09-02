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
}

function renderPalette() {
  const paletteContainer = document.getElementById('subject-modal-colors');
  if (!paletteContainer) return;

  paletteContainer.innerHTML = '';

  // 1. Custom Rainbow Donut + Pencil Swatch (First position in Row 1)
  const customBtn = document.createElement('button');
  customBtn.type = 'button';
  const isCustomActive = isCustomSelected || (!PRESET_COLORS.includes(selectedColor));
  customBtn.className = `subject-custom-color-swatch ${isCustomActive ? 'selected' : ''}`;
  customBtn.setAttribute('aria-label', 'Custom Color');
  customBtn.title = 'Choose custom color';

  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.className = 'subject-hidden-color-input';
  colorInput.value = customColorValue || '#6366f1';

  customBtn.innerHTML = `
    <span class="rainbow-donut-circle"></span>
  `;
  customBtn.appendChild(colorInput);

  customBtn.addEventListener('click', () => {
    isCustomSelected = true;
    selectedColor = colorInput.value;
    updateLivePreview();
    renderPalette();
    colorInput.click();
  });

  colorInput.addEventListener('input', (e) => {
    isCustomSelected = true;
    customColorValue = e.target.value;
    selectedColor = e.target.value;
    updateLivePreview();
  });

  colorInput.addEventListener('change', (e) => {
    isCustomSelected = true;
    customColorValue = e.target.value;
    selectedColor = e.target.value;
    updateLivePreview();
    renderPalette();
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

  if (backdrop) backdrop.addEventListener('click', closeSubjectModal);
  if (closeBtn) closeBtn.addEventListener('click', closeSubjectModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeSubjectModal);

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
