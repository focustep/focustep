import { modalState } from './state.js';
import { getSubjectSvg } from '../subjects-db.js';
import { tr } from '../i18n.js';
import { getSafeColor, isWhiteColor } from './color-utils.js';

export function updateLivePreview() {
  const previewBadge = document.getElementById('subject-modal-preview-badge');
  const previewDot = document.getElementById('subject-modal-preview-dot');
  const previewText = document.getElementById('subject-modal-preview-text');
  const nameInput = document.getElementById('subject-modal-name-input');

  const defaultName = (tr() && tr().subjectModalPreviewDefault) || 'New Subject';
  const name = (nameInput && nameInput.value.trim()) || defaultName;
  const rawColor = modalState.selectedColor || '#4ec9b0';
  const isWhite = isWhiteColor(rawColor);
  const color = isWhite ? '#ffffff' : getSafeColor(rawColor);

  if (previewDot) {
    const svg = getSubjectSvg(modalState.selectedIcon);
    if (svg) {
      previewDot.className = 'subject-modal-preview-dot has-icon';
      previewDot.style.backgroundColor = 'transparent';
      previewDot.style.boxShadow = 'none';
      previewDot.innerHTML = svg;
      const svgEl = previewDot.querySelector('svg');
      if (svgEl) {
        const isFillOnly = svgEl.getAttribute('fill') === 'currentColor' && (!svgEl.getAttribute('stroke') || svgEl.getAttribute('stroke') === 'none');
        if (isFillOnly) {
          svgEl.style.fill = color;
          svgEl.style.color = color;
          svgEl.style.stroke = 'none';
        } else {
          svgEl.style.stroke = color;
          svgEl.style.color = color;
        }
        svgEl.style.filter = 'none';
      }
    } else {
      previewDot.className = 'subject-modal-preview-dot';
      previewDot.style.backgroundColor = 'transparent';
      previewDot.style.boxShadow = 'none';
      previewDot.innerHTML = '<span class="subject-modal-dot-circle"></span>';
      const circleEl = previewDot.querySelector('.subject-modal-dot-circle');
      if (circleEl) {
        circleEl.style.backgroundColor = color;
        circleEl.style.boxShadow = isWhite
          ? '0 0 6px rgba(255, 255, 255, 0.4)'
          : `0 0 10px ${color}99`;
      }
    }
  }

  if (previewText) {
    previewText.textContent = name;
  }
  if (previewBadge) {
    previewBadge.style.borderColor = color;
    previewBadge.style.boxShadow = isWhite
      ? '0 2px 8px rgba(0, 0, 0, 0.2)'
      : `0 0 12px ${color}20`;
  }
}
