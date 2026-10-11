/**
 * Entry point for Focustep DEV Testing Toolkit
 * Exposes window.focustepDev console API and mounts the floating developer panel.
 */

import { focustepDev } from './api.js';
import { DevPanel } from './panel.js';

let devPanelInstance = null;

export function initDevToolkit() {
  if (typeof window === 'undefined') return;

  // 1. Mount Part A: window.focustepDev
  window.focustepDev = focustepDev;

  // 2. Mount Part B: Floating Dev Panel
  if (!devPanelInstance) {
    devPanelInstance = new DevPanel();
    devPanelInstance.mount();
  }

  console.log(
    '%c[focustepDev] DEV testing toolkit initialized! %cPress Ctrl+Shift+D (Cmd+Shift+D) to toggle panel. API available at window.focustepDev.',
    'color: #4ec9b0; font-weight: bold;',
    'color: #94a3b8;'
  );
}
