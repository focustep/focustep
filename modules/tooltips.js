/**
 * Shared Reusable Tooltip Component for Focustep
 * Renders an accessible floating popover card positioned next to trigger
 */

let tooltipEl = null;
let currentTrigger = null;
let isVisible = false;
let dismissTimer = null;

function createTooltipElement() {
  if (tooltipEl && document.body.contains(tooltipEl)) return tooltipEl;

  if (tooltipEl) {
    try { tooltipEl.remove(); } catch (e) {}
  }

  tooltipEl = document.createElement('div');
  tooltipEl.className = 'focustep-tooltip';
  tooltipEl.setAttribute('role', 'tooltip');
  tooltipEl.setAttribute('aria-hidden', 'true');
  tooltipEl.style.position = 'fixed';
  tooltipEl.style.top = '-9999px';
  tooltipEl.style.left = '-9999px';
  tooltipEl.style.pointerEvents = 'none';
  tooltipEl.style.zIndex = '100000';
  tooltipEl.style.opacity = '0';
  tooltipEl.style.transform = 'scale(0.96)';

  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

export function showTooltip(target, text, placement = 'top') {
  if (!target || !text) return;
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }

  const tip = createTooltipElement();
  currentTrigger = target;
  tip.textContent = text;
  tip.setAttribute('aria-hidden', 'false');

  // Suppress duplicate native browser tooltip
  if (target.hasAttribute('title')) {
    const rawTitle = target.getAttribute('title');
    if (rawTitle) target.setAttribute('data-stored-title', rawTitle);
    target.removeAttribute('title');
  }

  // Measure initial dimensions while invisible
  tip.style.display = 'block';
  tip.style.visibility = 'hidden';
  tip.style.opacity = '0';
  tip.style.transform = 'scale(1)';

  const triggerRect = target.getBoundingClientRect();
  const tipRect = tip.getBoundingClientRect();
  const pad = 10;
  const gap = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Center horizontally over target
  let left = triggerRect.left + (triggerRect.width - tipRect.width) / 2;

  // Clamp horizontally within viewport
  if (left < pad) {
    left = pad;
  } else if (left + tipRect.width > vw - pad) {
    left = Math.max(pad, vw - pad - tipRect.width);
  }

  // Vertical calculation: prefer above
  let top = triggerRect.top - tipRect.height - gap;

  if (placement === 'top') {
    // Auto-flip to bottom if clipping top
    if (top < pad && triggerRect.bottom + tipRect.height + gap <= vh - pad) {
      top = triggerRect.bottom + gap;
    }
  } else if (placement === 'bottom') {
    top = triggerRect.bottom + gap;
    // Auto-flip to top if clipping bottom
    if (top + tipRect.height > vh - pad && triggerRect.top - tipRect.height - gap >= pad) {
      top = triggerRect.top - tipRect.height - gap;
    }
  }

  // Clamp vertically within viewport
  if (top < pad) {
    top = pad;
  } else if (top + tipRect.height > vh - pad) {
    top = Math.max(pad, vh - pad - tipRect.height);
  }

  tip.style.top = `${Math.round(top)}px`;
  tip.style.left = `${Math.round(left)}px`;
  tip.style.visibility = 'visible';

  requestAnimationFrame(() => {
    tip.classList.add('visible');
    tip.style.opacity = '1';
    tip.style.transform = 'scale(1)';
    isVisible = true;
  });
}

export function hideTooltip() {
  if (!tooltipEl || !isVisible) return;
  isVisible = false;
  currentTrigger = null;

  tooltipEl.classList.remove('visible');
  tooltipEl.setAttribute('aria-hidden', 'true');
  tooltipEl.style.opacity = '0';
  tooltipEl.style.transform = 'scale(0.96)';

  if (dismissTimer) clearTimeout(dismissTimer);
  dismissTimer = setTimeout(() => {
    if (!isVisible && tooltipEl) {
      tooltipEl.style.visibility = 'hidden';
      tooltipEl.style.top = '-9999px';
      tooltipEl.style.left = '-9999px';
    }
  }, 160);
}

let tooltipsInitialized = false;

export function initTooltips() {
  if (tooltipsInitialized) return;
  tooltipsInitialized = true;
  createTooltipElement();

  const handleTriggerEnter = (target) => {
    if (!target) return;
    const el = target.closest('[data-tooltip]');
    if (!el) return;

    if (el.hasAttribute('title')) {
      const rawTitle = el.getAttribute('title');
      if (rawTitle) el.setAttribute('data-stored-title', rawTitle);
      el.removeAttribute('title');
    }

    const tipText = el.getAttribute('data-tooltip');
    if (!tipText) return;
    const placement = el.getAttribute('data-tooltip-pos') || 'top';
    showTooltip(el, tipText, placement);
  };

  const handleTriggerLeave = (target, relatedTarget) => {
    if (!currentTrigger) return;
    if (relatedTarget && currentTrigger.contains(relatedTarget)) return;
    hideTooltip();
  };

  // Mouse hover
  document.addEventListener('mouseover', (e) => {
    handleTriggerEnter(e.target);
  });

  document.addEventListener('mouseout', (e) => {
    handleTriggerLeave(e.target, e.relatedTarget);
  });

  // Keyboard focus & blur
  document.addEventListener('focusin', (e) => {
    handleTriggerEnter(e.target);
  });

  document.addEventListener('focusout', (e) => {
    handleTriggerLeave(e.target, e.relatedTarget);
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideTooltip();
    }
  });

  // Touch devices: tap on trigger shows tooltip, tap outside dismisses
  document.addEventListener('touchstart', (e) => {
    const el = e.target.closest('[data-tooltip]');
    if (el) {
      handleTriggerEnter(el);
    } else if (isVisible) {
      hideTooltip();
    }
  }, { passive: true });

  // Dismiss on window scroll
  window.addEventListener('scroll', () => {
    if (isVisible) hideTooltip();
  }, { passive: true });
}
