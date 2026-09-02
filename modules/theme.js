import { tr } from './i18n.js';

const ICON_SUN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
const ICON_MOON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

let themeWarnHideTimer = null;
let themeWarnEl = null;

export function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.innerHTML = t === 'dark' ? ICON_SUN : ICON_MOON;
    themeBtn.style.transform = 'rotate(180deg)';
    setTimeout(function(){ themeBtn.style.transform = ''; }, 400);
  }
}

function getThemeWarnEl() {
  if (themeWarnEl) return themeWarnEl;
  themeWarnEl = document.createElement('div');
  themeWarnEl.className = 'theme-warn';
  document.body.appendChild(themeWarnEl);
  return themeWarnEl;
}

function hideThemeWarn() {
  if (themeWarnEl) themeWarnEl.classList.remove('show');
  if (themeWarnHideTimer) { clearTimeout(themeWarnHideTimer); themeWarnHideTimer = null; }
}

function confirmThemeSwitch() {
  hideThemeWarn();
  applyTheme('light');
  try { localStorage.setItem('theme', 'light'); } catch(e){}
}

function positionThemeWarn(el, themeBtn) {
  const r = themeBtn.getBoundingClientRect();
  const elW = 195;
  const top = r.bottom + 9;
  let left = r.left + r.width / 2;

  const padding = 12;
  if (left + elW / 2 > window.innerWidth - padding) {
    left = window.innerWidth - padding - elW / 2;
  }
  if (left - elW / 2 < padding) {
    left = padding + elW / 2;
  }

  el.style.top = top + 'px';
  el.style.left = left + 'px';

  const arrowX = (r.left + r.width / 2) - (left - elW / 2);
  const clampedArrowX = Math.max(14, Math.min(elW - 14, arrowX));
  el.style.setProperty('--arrow-x', clampedArrowX + 'px');
}

function renderThemeWarn(themeBtn) {
  const el = getThemeWarnEl();
  el.innerHTML =
    '<p>' + tr().themeWarnQuestion + '</p>' +
    '<div class="theme-warn-actions">' +
      '<button type="button" class="theme-warn-btn theme-warn-yes" id="theme-warn-yes">' + tr().themeWarnYes + '</button>' +
      '<button type="button" class="theme-warn-btn theme-warn-no" id="theme-warn-no">' + tr().themeWarnNo + '</button>' +
    '</div>' +
    '<label class="theme-warn-dismiss-row"><span class="theme-warn-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span><input type="checkbox" id="theme-warn-dismiss">' + tr().themeWarnDismiss + '</label>';

  el.querySelector('#theme-warn-yes').addEventListener('click', confirmThemeSwitch);
  el.querySelector('#theme-warn-no').addEventListener('click', hideThemeWarn);

  const dismissCb = el.querySelector('#theme-warn-dismiss');
  const dismissRow = el.querySelector('.theme-warn-dismiss-row');
  dismissCb.addEventListener('change', function(e){
    dismissRow.classList.toggle('checked', e.target.checked);
    if (e.target.checked) {
      try { localStorage.setItem('hideThemeWarn', '1'); } catch(err){}
      setTimeout(confirmThemeSwitch, 380);
    }
  });
}

function showThemeWarn(themeBtn) {
  renderThemeWarn(themeBtn);
  const el = themeWarnEl;
  positionThemeWarn(el, themeBtn);
  el.classList.add('show');
  if (themeWarnHideTimer) clearTimeout(themeWarnHideTimer);
  themeWarnHideTimer = setTimeout(hideThemeWarn, 8000);
}

export function initTheme() {
  const themeBtn = document.getElementById('theme-toggle');
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('theme'); } catch(e){}
  applyTheme(savedTheme || 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const current = document.documentElement.getAttribute('data-theme');
      if (current !== 'dark') {
        applyTheme('dark');
        try { localStorage.setItem('theme', 'dark'); } catch(e){}
        hideThemeWarn();
        return;
      }
      let hideThemeWarnPref = null;
      try { hideThemeWarnPref = localStorage.getItem('hideThemeWarn'); } catch(e){}
      if (hideThemeWarnPref === '1') {
        confirmThemeSwitch();
      } else {
        showThemeWarn(themeBtn);
      }
    });
  }
}
