import { tr, getLang } from './i18n.js';

let notificationTimeout = null;

export function showTopNotification(message, options = {}) {
  if (typeof document === 'undefined') return;

  const msg = message || (tr() && tr().chooseSubjectToEdit) || (getLang() === 'uz' ? 'Tahrirlash uchun fanni tanlang' : getLang() === 'ru' ? 'Выберите предмет для редактирования' : 'Choose subject to edit');

  let toast = document.getElementById('top-site-notification');

  if (toast) {
    // If notification is already present in UI: DO NOT duplicate!
    const textEl = toast.querySelector('.top-site-notification-text');
    if (textEl) textEl.textContent = msg;

    // Trigger crisp shake animation when user clicks repeatedly
    toast.classList.remove('shake');
    void toast.offsetWidth; // Force CSS reflow
    toast.classList.add('shake');

    // Reset auto-dismiss timer
    if (notificationTimeout) clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
      dismissTopNotification(toast);
    }, options.duration || 3200);

    return;
  }

  // Create notification banner at top of site
  toast = document.createElement('div');
  toast.id = 'top-site-notification';
  toast.className = 'top-site-notification';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');

  toast.innerHTML = `
    <div class="top-site-notification-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <span class="top-site-notification-text">${msg}</span>
  `;

  document.body.appendChild(toast);

  // Trigger entrance transition in next frame
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  if (notificationTimeout) clearTimeout(notificationTimeout);
  notificationTimeout = setTimeout(() => {
    dismissTopNotification(toast);
  }, options.duration || 3200);
}

function dismissTopNotification(toast) {
  if (!toast) return;
  toast.classList.remove('visible');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 320);
}
