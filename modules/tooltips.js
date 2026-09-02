/**
 * Custom Floating Tooltips System for Focus Step
 * Adds smooth, accessible, non-intrusive hover tooltips
 */

let tooltipEl = null;

function createTooltipElement() {
  if (tooltipEl) return tooltipEl;
  tooltipEl = document.createElement('div');
  tooltipEl.className = 'focustep-tooltip';
  tooltipEl.setAttribute('role', 'tooltip');
  tooltipEl.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

export function showTooltip(target, text, placement = 'top') {
  if (!text) return;
  const tip = createTooltipElement();
  tip.textContent = text;
  tip.classList.add('visible');
  tip.setAttribute('aria-hidden', 'false');

  const rect = target.getBoundingClientRect();
  const tipRect = tip.getBoundingClientRect();

  let top = 0;
  let left = 0;

  if (placement === 'top') {
    top = rect.top - tipRect.height - 8;
    left = rect.left + (rect.width - tipRect.width) / 2;
  } else if (placement === 'bottom') {
    top = rect.bottom + 8;
    left = rect.left + (rect.width - tipRect.width) / 2;
  } else if (placement === 'left') {
    top = rect.top + (rect.height - tipRect.height) / 2;
    left = rect.left - tipRect.width - 8;
  } else if (placement === 'right') {
    top = rect.top + (rect.height - tipRect.height) / 2;
    left = rect.right + 8;
  }

  // Viewport bounds protection
  const pad = 10;
  if (left < pad) left = pad;
  if (left + tipRect.width > window.innerWidth - pad) {
    left = window.innerWidth - pad - tipRect.width;
  }
  if (top < pad) {
    // Flip to bottom if clipping top
    top = rect.bottom + 8;
  }

  tip.style.top = `${Math.round(top)}px`;
  tip.style.left = `${Math.round(left)}px`;
}

export function hideTooltip() {
  if (!tooltipEl) return;
  tooltipEl.classList.remove('visible');
  tooltipEl.setAttribute('aria-hidden', 'true');
}

export function initTooltips() {
  createTooltipElement();

  // Attach event delegation for [data-tooltip]
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[data-tooltip]');
    if (el) {
      const tipText = el.getAttribute('data-tooltip');
      const placement = el.getAttribute('data-tooltip-pos') || 'top';
      showTooltip(el, tipText, placement);
    }
  });

  document.addEventListener('mouseout', (e) => {
    const el = e.target.closest('[data-tooltip]');
    if (el) {
      hideTooltip();
    }
  });

  // Hide tooltip on scroll or click
  window.addEventListener('scroll', hideTooltip, { passive: true });
  document.addEventListener('click', hideTooltip);
}
