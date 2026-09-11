import { modalState } from './state.js';
import { getSubjectSvg } from '../subjects-db.js';

export function updateLivePreview() {
  const previewBadge = document.getElementById('subject-modal-preview-badge');
  const previewDot = document.getElementById('subject-modal-preview-dot');
  const previewText = document.getElementById('subject-modal-preview-text');
  const nameInput = document.getElementById('subject-modal-name-input');

  const name = (nameInput && nameInput.value.trim()) || 'New Subject';

  if (previewDot) {
    const svg = getSubjectSvg(modalState.selectedIcon);
    if (svg) {
      previewDot.className = 'subject-modal-preview-dot has-icon';
      previewDot.style.backgroundColor = 'transparent';
      previewDot.innerHTML = svg;
      const svgEl = previewDot.querySelector('svg');
      if (svgEl) {
        const isFillOnly = svgEl.getAttribute('fill') === 'currentColor' && (!svgEl.getAttribute('stroke') || svgEl.getAttribute('stroke') === 'none');
        if (isFillOnly) {
          svgEl.style.fill = modalState.selectedColor;
          svgEl.style.color = modalState.selectedColor;
          svgEl.style.stroke = 'none';
        } else {
          svgEl.style.stroke = modalState.selectedColor;
          svgEl.style.color = modalState.selectedColor;
        }
      }
    } else {
      previewDot.className = 'subject-modal-preview-dot';
      previewDot.innerHTML = '';
      previewDot.style.backgroundColor = modalState.selectedColor;
    }
  }

  if (previewText) {
    previewText.textContent = name;
  }
  if (previewBadge) {
    previewBadge.style.borderColor = modalState.selectedColor;
  }
}
