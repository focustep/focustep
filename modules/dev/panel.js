/**
 * Floating Developer Panel for Focustep
 * Rendered in Shadow DOM with drag/snap, persistence, and live store editing.
 */

import { focustepDev } from './api.js';
import { RECORD_REGISTRY } from './registry.js';
import { statsStore } from '../stats/store.js';
import { toLocalDateKey } from '../stats/selectors.js';
import { getSubjects } from '../subjects.js';

const STORAGE_STATE_KEY = 'focustepDevPanel';
const EDIT_BACKUP_SESSION_FLAG = 'focustep_dev_edit_backed_up';

export class DevPanel {
  constructor() {
    this.host = null;
    this.shadow = null;
    this.panelEl = null;
    this.pillEl = null;

    this.activeTab = 'sessions'; // 'sessions' | 'time' | 'presets' | 'subjects' | 'data'
    this.sessionFilter = 'all'; // 'all' | 'today' | 'week'
    this.isCollapsed = false;

    // Dimensions & Position
    this.width = 460;
    this.height = 540;
    this.x = Math.max(16, window.innerWidth - 480);
    this.y = 80;

    // Drag state
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.initialPanelX = 0;
    this.initialPanelY = 0;

    this.loadState();
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_STATE_KEY);
      if (raw) {
        const state = JSON.parse(raw);
        if (typeof state.x === 'number') this.x = state.x;
        if (typeof state.y === 'number') this.y = state.y;
        if (typeof state.width === 'number') this.width = Math.max(360, Math.min(650, state.width));
        if (typeof state.height === 'number') this.height = Math.max(400, Math.min(800, state.height));
        if (typeof state.isCollapsed === 'boolean') this.isCollapsed = state.isCollapsed;
        if (state.activeTab) this.activeTab = state.activeTab;
      }
    } catch (e) {}
    this.clampToViewport();
  }

  saveState() {
    try {
      const state = {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        isCollapsed: this.isCollapsed,
        activeTab: this.activeTab
      };
      localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  clampToViewport() {
    const margin = 12;
    const maxX = Math.max(margin, window.innerWidth - (this.isCollapsed ? 80 : this.width) - margin);
    const maxY = Math.max(margin, window.innerHeight - (this.isCollapsed ? 44 : this.height) - margin);

    this.x = Math.max(margin, Math.min(maxX, this.x));
    this.y = Math.max(margin, Math.min(maxY, this.y));
  }

  mount() {
    if (document.getElementById('focustep-dev-root')) return;

    this.host = document.createElement('div');
    this.host.id = 'focustep-dev-root';
    this.host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:999990;pointer-events:none;';
    document.body.appendChild(this.host);

    this.shadow = this.host.attachShadow({ mode: 'open' });
    this.render();

    // Event listeners
    window.addEventListener('resize', () => {
      this.clampToViewport();
      this.applyPosition();
    });
    window.addEventListener('orientationchange', () => {
      this.clampToViewport();
      this.applyPosition();
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Ctrl+Shift+D or Cmd+Shift+D: Toggle panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        this.toggleCollapsed();
      }
      // Esc: Collapse panel if open
      if (e.key === 'Escape' && !this.isCollapsed) {
        this.collapse();
      }
    });

    // Subscribe to store updates to keep Sessions & Subjects tabs in sync
    window.addEventListener('focustep:statsUpdated', () => {
      this.refreshTabContent();
    });
    window.addEventListener('focustep:sessionLogged', () => {
      this.refreshTabContent();
    });
    window.addEventListener('focustep:subjectsUpdated', () => {
      this.refreshTabContent();
    });

    // Ensure initial automatic backup
    focustepDev.ensureSessionBackup();
  }

  render() {
    this.shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 13px;
          line-height: 1.4;
          color: #e2e8f0;
          box-sizing: border-box;
        }
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* Collapsed DEV Pill */
        .dev-pill {
          position: fixed;
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #0f172a;
          color: #4ec9b0;
          border: 1px solid rgba(78, 201, 176, 0.4);
          border-radius: 9999px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 10px rgba(78, 201, 176, 0.2);
          cursor: pointer;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.05em;
          user-select: none;
          transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
          z-index: 999990;
        }
        .dev-pill:hover {
          background: #1e293b;
          border-color: #4ec9b0;
          transform: scale(1.05);
        }
        .dev-pill-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ec9b0;
          box-shadow: 0 0 6px #4ec9b0;
        }

        /* Expanded Floating Window */
        .dev-panel {
          position: fixed;
          pointer-events: auto;
          background: #11151a;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 999990;
          transition: box-shadow 0.2s ease;
        }
        .dev-panel.dragging {
          user-select: none;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(78, 201, 176, 0.5);
          cursor: grabbing;
        }

        /* Header (Drag Handle) */
        .dev-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #181d24;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          touch-action: none;
          cursor: grab;
          user-select: none;
        }
        .dev-header:active {
          cursor: grabbing;
        }
        .dev-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dev-logo-badge {
          background: rgba(78, 201, 176, 0.15);
          color: #4ec9b0;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.06em;
        }
        .dev-title {
          font-size: 12px;
          font-weight: 600;
          color: #f1f5f9;
        }
        .dev-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dev-icon-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 4px;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .dev-icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        /* Nav Tabs */
        .dev-tabs {
          display: flex;
          background: #14181f;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .dev-tabs::-webkit-scrollbar {
          display: none;
        }
        .dev-tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
          padding: 8px 10px;
          cursor: pointer;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
          text-align: center;
        }
        .dev-tab-btn:hover {
          color: #e2e8f0;
        }
        .dev-tab-btn.active {
          color: #4ec9b0;
          border-bottom-color: #4ec9b0;
          background: rgba(78, 201, 176, 0.04);
        }

        /* Body & Content */
        .dev-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          background: #0f1317;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Standard Controls */
        .dev-card {
          background: #161b22;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .dev-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dev-label {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .dev-input, .dev-select {
          background: #0d1117;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          color: #f1f5f9;
          font-size: 12px;
          padding: 5px 8px;
          outline: none;
          transition: border-color 0.15s;
        }
        .dev-input:focus, .dev-select:focus {
          border-color: #4ec9b0;
        }
        .dev-btn {
          background: #1e2631;
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          padding: 5px 10px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          user-select: none;
          transition: all 0.15s ease;
        }
        .dev-btn:hover {
          background: #27313f;
          border-color: rgba(255, 255, 255, 0.25);
          color: #fff;
        }
        .dev-btn-primary {
          background: rgba(78, 201, 176, 0.15);
          border-color: rgba(78, 201, 176, 0.5);
          color: #4ec9b0;
        }
        .dev-btn-primary:hover {
          background: #4ec9b0;
          color: #0f172a;
          border-color: #4ec9b0;
        }
        .dev-btn-danger {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.4);
          color: #f87171;
        }
        .dev-btn-danger:hover {
          background: #ef4444;
          color: #fff;
        }

        /* Chips & Badges */
        .dev-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .badge-seeded {
          background: rgba(78, 201, 176, 0.15);
          color: #4ec9b0;
          border: 1px solid rgba(78, 201, 176, 0.3);
        }
        .badge-real {
          background: rgba(148, 163, 184, 0.15);
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.25);
        }

        /* Sessions Table */
        .dev-table-wrap {
          overflow-x: auto;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #0d1117;
          max-height: 380px;
        }
        .dev-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .dev-table th {
          background: #161b22;
          color: #94a3b8;
          font-weight: 600;
          text-align: left;
          padding: 7px 8px;
          position: sticky;
          top: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 2;
        }
        .dev-table td {
          padding: 5px 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          vertical-align: middle;
        }
        .dev-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }
        .dev-table input, .dev-table select {
          background: #161b22;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          color: #f1f5f9;
          font-size: 11px;
          padding: 3px 5px;
          width: 100%;
        }

        /* Resizer handle in corner */
        .dev-resizer {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 14px;
          height: 14px;
          cursor: se-resize;
          background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.3) 70%, transparent 70%, transparent 85%, rgba(255, 255, 255, 0.3) 85%);
          pointer-events: auto;
        }

        /* JSON Inspector */
        .dev-json-box {
          background: #090d11;
          color: #38bdf8;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 8px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 10.5px;
          max-height: 240px;
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }
      </style>

      <!-- Collapsed Pill Button -->
      <div class="dev-pill" id="dev-pill-btn" style="display: ${this.isCollapsed ? 'flex' : 'none'};">
        <span class="dev-pill-dot"></span>
        <span>DEV</span>
      </div>

      <!-- Expanded Floating Panel -->
      <div class="dev-panel" id="dev-panel-el" style="display: ${this.isCollapsed ? 'none' : 'flex'}; width: ${this.width}px; height: ${this.height}px;">
        <!-- Header / Drag Handle -->
        <div class="dev-header" id="dev-drag-handle">
          <div class="dev-title-wrap">
            <span class="dev-logo-badge">DEV</span>
            <span class="dev-title">Focustep Testing Toolkit</span>
          </div>
          <div class="dev-header-actions">
            <button type="button" class="dev-icon-btn" id="dev-collapse-btn" title="Collapse (Esc)">−</button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="dev-tabs">
          <button type="button" class="dev-tab-btn ${this.activeTab === 'sessions' ? 'active' : ''}" data-tab="sessions">Sessions</button>
          <button type="button" class="dev-tab-btn ${this.activeTab === 'time' ? 'active' : ''}" data-tab="time">Time Machine</button>
          <button type="button" class="dev-tab-btn ${this.activeTab === 'presets' ? 'active' : ''}" data-tab="presets">Presets</button>
          <button type="button" class="dev-tab-btn ${this.activeTab === 'subjects' ? 'active' : ''}" data-tab="subjects">Subjects</button>
          <button type="button" class="dev-tab-btn ${this.activeTab === 'data' ? 'active' : ''}" data-tab="data">Data</button>
        </div>

        <!-- Tab Body -->
        <div class="dev-body" id="dev-tab-content">
          ${this.getTabHtml()}
        </div>

        <!-- Bottom-Right Resize Handle -->
        <div class="dev-resizer" id="dev-resizer-handle"></div>
      </div>
    `;

    this.panelEl = this.shadow.getElementById('dev-panel-el');
    this.pillEl = this.shadow.getElementById('dev-pill-btn');

    this.bindEvents();
    this.applyPosition();
  }

  applyPosition() {
    if (this.pillEl) {
      this.pillEl.style.left = `${this.x}px`;
      this.pillEl.style.top = `${this.y}px`;
    }
    if (this.panelEl) {
      this.panelEl.style.left = `${this.x}px`;
      this.panelEl.style.top = `${this.y}px`;
      this.panelEl.style.width = `${this.width}px`;
      this.panelEl.style.height = `${this.height}px`;
    }
  }

  toggleCollapsed() {
    if (this.isCollapsed) this.expand();
    else this.collapse();
  }

  collapse() {
    this.isCollapsed = true;
    if (this.panelEl) this.panelEl.style.display = 'none';
    if (this.pillEl) this.pillEl.style.display = 'flex';
    this.saveState();
  }

  expand() {
    this.isCollapsed = false;
    this.clampToViewport();
    if (this.panelEl) this.panelEl.style.display = 'flex';
    if (this.pillEl) this.pillEl.style.display = 'none';
    this.applyPosition();
    this.refreshTabContent();
    this.saveState();
  }

  bindEvents() {
    // Pill Click
    const pill = this.shadow.getElementById('dev-pill-btn');
    pill?.addEventListener('click', () => this.expand());

    // Collapse Click
    const collapseBtn = this.shadow.getElementById('dev-collapse-btn');
    collapseBtn?.addEventListener('click', () => this.collapse());

    // Header Pointer Drag
    const handle = this.shadow.getElementById('dev-drag-handle');
    if (handle) {
      handle.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.initialPanelX = this.x;
        this.initialPanelY = this.y;
        handle.setPointerCapture(e.pointerId);
        this.panelEl?.classList.add('dragging');
      });

      handle.addEventListener('pointermove', (e) => {
        if (!this.isDragging) return;
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        this.x = this.initialPanelX + dx;
        this.y = this.initialPanelY + dy;
        this.clampToViewport();
        this.applyPosition();
      });

      handle.addEventListener('pointerup', (e) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
        this.panelEl?.classList.remove('dragging');
        this.snapToNearestEdge();
        this.saveState();
      });

      handle.addEventListener('pointercancel', (e) => {
        this.isDragging = false;
        try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
        this.panelEl?.classList.remove('dragging');
      });
    }

    // Corner Resizer
    const resizer = this.shadow.getElementById('dev-resizer-handle');
    if (resizer) {
      let isResizing = false;
      let startW = 0, startH = 0, startX = 0, startY = 0;

      resizer.addEventListener('pointerdown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startW = this.width;
        startH = this.height;
        resizer.setPointerCapture(e.pointerId);
        e.stopPropagation();
      });

      resizer.addEventListener('pointermove', (e) => {
        if (!isResizing) return;
        const dw = e.clientX - startX;
        const dh = e.clientY - startY;
        this.width = Math.max(360, Math.min(680, startW + dw));
        this.height = Math.max(400, Math.min(800, startH + dh));
        this.applyPosition();
      });

      resizer.addEventListener('pointerup', (e) => {
        if (!isResizing) return;
        isResizing = false;
        try { resizer.releasePointerCapture(e.pointerId); } catch (_) {}
        this.saveState();
      });
    }

    // Tab buttons
    this.shadow.querySelectorAll('.dev-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.shadow.querySelectorAll('.dev-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.refreshTabContent();
        this.saveState();
      });
    });

    this.bindTabSpecificEvents();
  }

  snapToNearestEdge() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const snapThreshold = 35; // px from screen edge

    if (this.x < snapThreshold) this.x = 12;
    const rightDist = window.innerWidth - (this.x + this.width);
    if (rightDist < snapThreshold) this.x = window.innerWidth - this.width - 12;

    if (this.y < snapThreshold) this.y = 12;
    const bottomDist = window.innerHeight - (this.y + this.height);
    if (bottomDist < snapThreshold) this.y = window.innerHeight - this.height - 12;

    if (!prefersReducedMotion && this.panelEl) {
      this.panelEl.style.transition = 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1), top 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
      this.applyPosition();
      setTimeout(() => {
        if (this.panelEl) this.panelEl.style.transition = '';
      }, 200);
    } else {
      this.applyPosition();
    }
  }

  ensureFirstEditBackup() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        if (!sessionStorage.getItem(EDIT_BACKUP_SESSION_FLAG)) {
          focustepDev.backup('pre-first-edit');
          sessionStorage.setItem(EDIT_BACKUP_SESSION_FLAG, 'true');
        }
      }
    } catch (e) {}
  }

  refreshTabContent() {
    const container = this.shadow.getElementById('dev-tab-content');
    if (!container) return;
    container.innerHTML = this.getTabHtml();
    this.bindTabSpecificEvents();
  }

  getTabHtml() {
    switch (this.activeTab) {
      case 'sessions':
        return this.renderSessionsTab();
      case 'time':
        return this.renderTimeTab();
      case 'presets':
        return this.renderPresetsTab();
      case 'subjects':
        return this.renderSubjectsTab();
      case 'data':
        return this.renderDataTab();
      default:
        return '<p>Select a tab</p>';
    }
  }

  // ================= TAB 1: SESSIONS (Registry Driven) =================
  renderSessionsTab() {
    const sessionsRegistry = RECORD_REGISTRY.sessions;
    const rawSessions = sessionsRegistry.getRecords ? sessionsRegistry.getRecords(statsStore) : statsStore.getSessions();
    const subjects = statsStore.getSubjects();
    const effectiveNow = focustepDev.getEffectiveNow();
    const todayKey = toLocalDateKey(effectiveNow);

    let filteredSessions = [...rawSessions];
    if (this.sessionFilter === 'today') {
      filteredSessions = filteredSessions.filter(s => toLocalDateKey(new Date(s.timestamp)) === todayKey);
    } else if (this.sessionFilter === 'week') {
      const mon = getEffectiveNow();
      const offset = (mon.getDay() + 6) % 7;
      mon.setDate(mon.getDate() - offset);
      mon.setHours(0, 0, 0, 0);
      const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 7, 0, 0, 0, 0);
      filteredSessions = filteredSessions.filter(s => s.timestamp >= mon.getTime() && s.timestamp < sun.getTime());
    }

    const rowsHtml = filteredSessions.slice(0, 100).map(s => {
      const d = new Date(s.timestamp);
      // Format for datetime-local: YYYY-MM-DDTHH:mm
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const dtValue = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

      const options = subjects.map(subj => `
        <option value="${subj.id}" ${subj.id === s.subjectId ? 'selected' : ''}>${subj.name}</option>
      `).join('');

      const durationMinutes = Math.round((s.durationSec || 0) / 60);

      return `
        <tr data-id="${s.id}">
          <td style="width: 28px; text-align: center;">
            <span class="dev-badge ${s.seeded ? 'badge-seeded' : 'badge-real'}">${s.seeded ? 'SEEDED' : 'USER'}</span>
          </td>
          <td style="width: 100px;">
            <select class="dev-session-subj-select" data-id="${s.id}">
              ${options}
            </select>
          </td>
          <td>
            <input type="datetime-local" class="dev-session-dt-input" data-id="${s.id}" value="${dtValue}">
          </td>
          <td style="width: 55px;">
            <input type="number" class="dev-session-dur-input" data-id="${s.id}" value="${durationMinutes}" min="1" max="1440">
          </td>
          <td style="width: 28px; text-align: center;">
            <button type="button" class="dev-icon-btn dev-btn-delete-session" data-id="${s.id}" title="Delete session" style="color:#ef4444;">✕</button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="dev-row" style="justify-content: space-between;">
        <div class="dev-row">
          <span class="dev-label">Filter:</span>
          <select class="dev-select" id="dev-session-filter-select" style="font-size:11px; padding:3px 6px;">
            <option value="all" ${this.sessionFilter === 'all' ? 'selected' : ''}>All (${rawSessions.length})</option>
            <option value="today" ${this.sessionFilter === 'today' ? 'selected' : ''}>Today</option>
            <option value="week" ${this.sessionFilter === 'week' ? 'selected' : ''}>This Week</option>
          </select>
        </div>
        <button type="button" class="dev-btn dev-btn-primary" id="dev-btn-add-session">
          + Add Session
        </button>
      </div>

      <div class="dev-table-wrap">
        <table class="dev-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Subject</th>
              <th>Start Time</th>
              <th>Mins</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml.length > 0 ? rowsHtml : '<tr><td colspan="5" style="text-align:center; padding:16px; color:#64748b;">No sessions match filter</td></tr>'}
          </tbody>
        </table>
      </div>
      <div style="font-size:10.5px; color:#64748b; display:flex; justify-content:space-between;">
        <span>Showing ${filteredSessions.length} sessions (Registry: ${sessionsRegistry.key})</span>
        <span>Auto-saves & syncs live</span>
      </div>
    `;
  }

  // ================= TAB 2: TIME MACHINE =================
  renderTimeTab() {
    const isOverridden = focustepDev.isTimeOverridden();
    const effective = focustepDev.getEffectiveNow();

    const yyyy = effective.getFullYear();
    const mm = String(effective.getMonth() + 1).padStart(2, '0');
    const dd = String(effective.getDate()).padStart(2, '0');
    const hh = String(effective.getHours()).padStart(2, '0');
    const min = String(effective.getMinutes()).padStart(2, '0');
    const dtValue = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

    return `
      <div class="dev-card">
        <div class="dev-row" style="justify-content: space-between;">
          <span class="dev-label">Effective Clock State</span>
          <span class="dev-badge ${isOverridden ? 'badge-seeded' : 'badge-real'}" style="${isOverridden ? 'background:rgba(245,158,11,0.2);color:#fbbf24;border-color:rgba(245,158,11,0.4);' : ''}">
            ${isOverridden ? 'SIMULATED (OVERRIDDEN)' : 'LIVE (SYSTEM CLOCK)'}
          </span>
        </div>
        <div style="font-size: 14px; font-weight: 600; color: #f8fafc; font-variant-numeric: tabular-nums;">
          ${effective.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} · ${effective.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div class="dev-card">
        <span class="dev-label">Override Date & Time</span>
        <div class="dev-row">
          <input type="datetime-local" class="dev-input" id="dev-time-override-input" value="${dtValue}" style="flex:1;">
          <button type="button" class="dev-btn dev-btn-primary" id="dev-time-apply-btn">Apply</button>
        </div>
      </div>

      <div class="dev-card">
        <span class="dev-label">Quick Time Jump</span>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
          <button type="button" class="dev-btn" data-time-jump="today">Today (12:00)</button>
          <button type="button" class="dev-btn" data-time-jump="yesterday">Yesterday</button>
          <button type="button" class="dev-btn" data-time-jump="monday">Monday</button>
          <button type="button" class="dev-btn" data-time-jump="sunday">Sunday</button>
          <button type="button" class="dev-btn" data-time-jump="first_month">1st of Month</button>
          <button type="button" class="dev-btn" data-time-jump="prev_day">−1 Day</button>
          <button type="button" class="dev-btn" data-time-jump="next_day">+1 Day</button>
          <button type="button" class="dev-btn dev-btn-danger" data-time-jump="reset" style="grid-column: span 2;">Reset to Live Clock</button>
        </div>
      </div>
    `;
  }

  // ================= TAB 3: PRESETS =================
  renderPresetsTab() {
    return `
      <div class="dev-card">
        <span class="dev-label">Week Offset Selector</span>
        <div class="dev-row">
          <select class="dev-select" id="dev-preset-week-offset" style="flex:1;">
            <option value="0">This Week (Offset 0)</option>
            <option value="-1">Last Week (Offset -1 for ghost comparison)</option>
            <option value="1">Next Week (Offset +1)</option>
          </select>
        </div>
      </div>

      <div class="dev-card">
        <span class="dev-label">Seed Week Presets</span>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <button type="button" class="dev-btn dev-btn-primary" data-preset="normal">
            Normal Week
          </button>
          <button type="button" class="dev-btn" data-preset="heavy">
            Heavy (5h+ peak)
          </button>
          <button type="button" class="dev-btn" data-preset="midnight">
            Midnight Split
          </button>
          <button type="button" class="dev-btn" data-preset="peak2123">
            Peak 21:00 – 23:00
          </button>
          <button type="button" class="dev-btn dev-btn-danger" data-preset="empty" style="grid-column: span 2;">
            Empty Week (0 mins)
          </button>
        </div>
      </div>

      <div class="dev-card">
        <span class="dev-label">Quick Day Seeder</span>
        <div class="dev-row">
          <select class="dev-select" id="dev-quick-day-target" style="width: 120px;">
            <option value="0">Today</option>
            <option value="-1">Yesterday</option>
            <option value="-2">2 Days Ago</option>
            <option value="-3">3 Days Ago</option>
          </select>
          <input type="number" class="dev-input" id="dev-quick-day-mins" value="90" min="1" max="600" style="width: 70px;" placeholder="mins">
          <span style="font-size:11px; color:#94a3b8;">mins</span>
          <button type="button" class="dev-btn dev-btn-primary" id="dev-btn-seed-day" style="margin-left: auto;">
            Seed Day
          </button>
        </div>
      </div>
    `;
  }

  // ================= TAB 4: SUBJECTS =================
  renderSubjectsTab() {
    const subjects = statsStore.getSubjects();
    const seededCount = subjects.filter(s => s.seeded).length;
    const realCount = subjects.length - seededCount;

    const listItems = subjects.map(s => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:5px 8px; background:#0d1117; border:1px solid rgba(255,255,255,0.06); border-radius:6px; font-size:11.5px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="width:10px; height:10px; border-radius:50%; background:${s.color || '#4ec9b0'};"></span>
          <span style="font-weight:600; color:#f1f5f9;">${s.name}</span>
          <span style="color:#64748b; font-size:10px;">(${s.id})</span>
        </div>
        <span class="dev-badge ${s.seeded ? 'badge-seeded' : 'badge-real'}">${s.seeded ? 'TEST' : 'REAL'}</span>
      </div>
    `).join('');

    return `
      <div class="dev-card">
        <div class="dev-row" style="justify-content:space-between;">
          <span class="dev-label">Subject Registry</span>
          <span style="font-size:11px; color:#94a3b8;">${subjects.length} total (${realCount} real, ${seededCount} test)</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px; max-height:160px; overflow-y:auto;">
          ${listItems}
        </div>
      </div>

      <div class="dev-card">
        <span class="dev-label">Generate Test Subjects (with colors & icons)</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button type="button" class="dev-btn dev-btn-primary" data-seed-subj="1">+1 Subj</button>
          <button type="button" class="dev-btn dev-btn-primary" data-seed-subj="3">+3 Subj</button>
          <button type="button" class="dev-btn dev-btn-primary" data-seed-subj="5">+5 Subj</button>
          <button type="button" class="dev-btn dev-btn-primary" data-seed-subj="7">+7 Subj</button>
          <button type="button" class="dev-btn dev-btn-primary" data-seed-subj="12">+12 Subj</button>
        </div>
        <button type="button" class="dev-btn dev-btn-danger" id="dev-btn-remove-test-subj" style="margin-top:4px;">
          Remove All Test Subjects
        </button>
      </div>
    `;
  }

  // ================= TAB 5: DATA =================
  renderDataTab() {
    const backupInfo = focustepDev.getBackupInfo();
    const sessions = statsStore.getSessions();
    const subjects = statsStore.getSubjects();

    const jsonPreview = JSON.stringify({
      sessionsCount: sessions.length,
      subjectsCount: subjects.length,
      sampleSessions: sessions.slice(0, 3)
    }, null, 2);

    return `
      <div class="dev-card">
        <span class="dev-label">Backup & Restore</span>
        <div style="font-size:11px; color:#94a3b8;">
          ${backupInfo ? `Saved backup: ${backupInfo.dateStr || new Date(backupInfo.timestamp).toLocaleString()} (${backupInfo.sessions?.length || 0} sessions)` : 'No backup created yet'}
        </div>
        <div class="dev-row">
          <button type="button" class="dev-btn dev-btn-primary" id="dev-btn-backup">
            💾 Create Backup Now
          </button>
          <button type="button" class="dev-btn" id="dev-btn-restore" ${!backupInfo ? 'disabled' : ''}>
            ↺ Restore Backup
          </button>
        </div>
      </div>

      <div class="dev-card">
        <span class="dev-label">Data Purge</span>
        <div class="dev-row">
          <button type="button" class="dev-btn" id="dev-btn-clear-seeded" style="flex:1;">
            Clear Seeded Only
          </button>
          <button type="button" class="dev-btn dev-btn-danger" id="dev-btn-clear-all" style="flex:1;">
            ⚠️ Wipe ALL Data
          </button>
        </div>
        <span style="font-size:10px; color:#64748b;">"Clear Seeded Only" preserves all non-seeded study data.</span>
      </div>

      <div class="dev-card">
        <div class="dev-row" style="justify-content: space-between;">
          <span class="dev-label">Storage Inspector</span>
          <button type="button" class="dev-btn" id="dev-btn-copy-json" style="font-size:10px; padding:2px 6px;">
            Copy JSON
          </button>
        </div>
        <div class="dev-json-box" id="dev-json-viewer">${jsonPreview}</div>
      </div>
    `;
  }

  bindTabSpecificEvents() {
    // SESSIONS TAB EVENTS
    if (this.activeTab === 'sessions') {
      const filterSelect = this.shadow.getElementById('dev-session-filter-select');
      filterSelect?.addEventListener('change', (e) => {
        this.sessionFilter = e.target.value;
        this.refreshTabContent();
      });

      const addBtn = this.shadow.getElementById('dev-btn-add-session');
      addBtn?.addEventListener('click', () => {
        this.ensureFirstEditBackup();
        const subs = statsStore.getSubjects();
        focustepDev.addSession({
          subjectId: subs[0]?.id || 'other',
          start: focustepDev.getEffectiveNow(),
          minutes: 30
        });
        this.refreshTabContent();
      });

      // Inline edits in table
      this.shadow.querySelectorAll('.dev-session-subj-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
          this.ensureFirstEditBackup();
          const id = e.target.dataset.id;
          const newSubjId = e.target.value;
          const sessions = statsStore.getSessions();
          const sess = sessions.find(s => s.id === id);
          if (sess) {
            sess.subjectId = newSubjId;
            const sub = statsStore.getSubjects().find(s => s.id === newSubjId);
            if (sub) sess.subjectName = sub.name;
            localStorage.setItem('focustep_sessions', JSON.stringify(sessions));
            statsStore.loadSessions();
            statsStore.notify();
          }
        });
      });

      this.shadow.querySelectorAll('.dev-session-dt-input').forEach(inp => {
        inp.addEventListener('change', (e) => {
          this.ensureFirstEditBackup();
          const id = e.target.dataset.id;
          const newDt = new Date(e.target.value);
          if (!isNaN(newDt.getTime())) {
            const sessions = statsStore.getSessions();
            const sess = sessions.find(s => s.id === id);
            if (sess) {
              sess.timestamp = newDt.getTime();
              localStorage.setItem('focustep_sessions', JSON.stringify(sessions));
              statsStore.loadSessions();
              statsStore.notify();
            }
          }
        });
      });

      this.shadow.querySelectorAll('.dev-session-dur-input').forEach(inp => {
        inp.addEventListener('change', (e) => {
          this.ensureFirstEditBackup();
          const id = e.target.dataset.id;
          const newMins = Math.max(1, parseInt(e.target.value, 10) || 1);
          const sessions = statsStore.getSessions();
          const sess = sessions.find(s => s.id === id);
          if (sess) {
            sess.durationSec = newMins * 60;
            localStorage.setItem('focustep_sessions', JSON.stringify(sessions));
            statsStore.loadSessions();
            statsStore.notify();
          }
        });
      });

      this.shadow.querySelectorAll('.dev-btn-delete-session').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.ensureFirstEditBackup();
          const id = e.target.dataset.id;
          statsStore.deleteSession(id);
          this.refreshTabContent();
        });
      });
    }

    // TIME MACHINE EVENTS
    if (this.activeTab === 'time') {
      const applyBtn = this.shadow.getElementById('dev-time-apply-btn');
      const timeInp = this.shadow.getElementById('dev-time-override-input');
      applyBtn?.addEventListener('click', () => {
        if (timeInp && timeInp.value) {
          focustepDev.setNow(timeInp.value);
          this.refreshTabContent();
        }
      });

      this.shadow.querySelectorAll('[data-time-jump]').forEach(btn => {
        btn.addEventListener('click', () => {
          const jump = btn.dataset.timeJump;
          const cur = focustepDev.getEffectiveNow();
          switch (jump) {
            case 'today': {
              const d = new Date();
              d.setHours(12, 0, 0, 0);
              focustepDev.setNow(d);
              break;
            }
            case 'yesterday': {
              const d = new Date();
              d.setDate(d.getDate() - 1);
              d.setHours(12, 0, 0, 0);
              focustepDev.setNow(d);
              break;
            }
            case 'monday': {
              const d = new Date(cur);
              const day = (d.getDay() + 6) % 7;
              d.setDate(d.getDate() - day);
              d.setHours(12, 0, 0, 0);
              focustepDev.setNow(d);
              break;
            }
            case 'sunday': {
              const d = new Date(cur);
              const day = (d.getDay() + 6) % 7;
              d.setDate(d.getDate() - day + 6);
              d.setHours(12, 0, 0, 0);
              focustepDev.setNow(d);
              break;
            }
            case 'first_month': {
              const d = new Date(cur.getFullYear(), cur.getMonth(), 1, 12, 0, 0);
              focustepDev.setNow(d);
              break;
            }
            case 'prev_day': {
              const d = new Date(cur);
              d.setDate(d.getDate() - 1);
              focustepDev.setNow(d);
              break;
            }
            case 'next_day': {
              const d = new Date(cur);
              d.setDate(d.getDate() + 1);
              focustepDev.setNow(d);
              break;
            }
            case 'reset': {
              focustepDev.setNow(null);
              break;
            }
          }
          this.refreshTabContent();
        });
      });
    }

    // PRESETS EVENTS
    if (this.activeTab === 'presets') {
      const offsetSelect = this.shadow.getElementById('dev-preset-week-offset');

      this.shadow.querySelectorAll('[data-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.ensureFirstEditBackup();
          const preset = btn.dataset.preset;
          const offset = parseInt(offsetSelect?.value || '0', 10);
          focustepDev.seedWeek(preset, offset);
          this.refreshTabContent();
        });
      });

      const seedDayBtn = this.shadow.getElementById('dev-btn-seed-day');
      const targetSelect = this.shadow.getElementById('dev-quick-day-target');
      const minsInp = this.shadow.getElementById('dev-quick-day-mins');

      seedDayBtn?.addEventListener('click', () => {
        this.ensureFirstEditBackup();
        const offset = parseInt(targetSelect?.value || '0', 10);
        const mins = parseInt(minsInp?.value || '60', 10);
        focustepDev.setDay(offset, mins);
        this.refreshTabContent();
      });
    }

    // SUBJECTS EVENTS
    if (this.activeTab === 'subjects') {
      this.shadow.querySelectorAll('[data-seed-subj]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.ensureFirstEditBackup();
          const count = parseInt(btn.dataset.seedSubj, 10);
          focustepDev.seedSubjects(count);
          this.refreshTabContent();
        });
      });

      const removeSubjBtn = this.shadow.getElementById('dev-btn-remove-test-subj');
      removeSubjBtn?.addEventListener('click', () => {
        this.ensureFirstEditBackup();
        focustepDev.removeSeededSubjects();
        this.refreshTabContent();
      });
    }

    // DATA EVENTS
    if (this.activeTab === 'data') {
      const backupBtn = this.shadow.getElementById('dev-btn-backup');
      backupBtn?.addEventListener('click', () => {
        focustepDev.backup('user-manual');
        this.refreshTabContent();
      });

      const restoreBtn = this.shadow.getElementById('dev-btn-restore');
      restoreBtn?.addEventListener('click', () => {
        focustepDev.restore();
        this.refreshTabContent();
      });

      const clearSeededBtn = this.shadow.getElementById('dev-btn-clear-seeded');
      clearSeededBtn?.addEventListener('click', () => {
        this.ensureFirstEditBackup();
        focustepDev.clear({ seededOnly: true });
        this.refreshTabContent();
      });

      const clearAllBtn = this.shadow.getElementById('dev-btn-clear-all');
      clearAllBtn?.addEventListener('click', () => {
        this.ensureFirstEditBackup();
        focustepDev.clear({ seededOnly: false });
        this.refreshTabContent();
      });

      const copyJsonBtn = this.shadow.getElementById('dev-btn-copy-json');
      copyJsonBtn?.addEventListener('click', () => {
        const fullDump = JSON.stringify({
          sessions: statsStore.getSessions(),
          subjects: statsStore.getSubjects()
        }, null, 2);
        navigator.clipboard.writeText(fullDump).then(() => {
          copyJsonBtn.textContent = 'Copied!';
          setTimeout(() => { copyJsonBtn.textContent = 'Copy JSON'; }, 1500);
        });
      });
    }
  }
}
