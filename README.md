# Focustep DEV Testing Toolkit

DEV-only testing toolkit for focustep to test stats, graphs, subject attribution, and week boundaries without running physical timers for hours.

---

## Architecture Overview

1. **`modules/stats/time.js`**: Centralized time override module (`getEffectiveNow`, `setEffectiveNow`, `resetEffectiveNow`). All selectors and date calculations default to `getEffectiveNow()`.
2. **`modules/dev/registry.js`**: Generic record registry configuring schemas, keys, date fields, duration fields, and metadata so UI views and editors dynamically adapt without hardcoding.
3. **`modules/dev/api.js`**: `window.focustepDev` console API with methods for setting days, seeding weeks, adding/editing sessions, seeding/removing subjects, backup/restore, time machine control, and safe clearing (`seeded: true` flag).
4. **`modules/dev/panel.js`**: Single floating developer panel mounted inside an isolated **Shadow DOM** (`<div id="focustep-dev-host">`). Supports Pointer Events dragging, edge/corner magnetic snap, resize clamp, keyboard shortcuts, and full live updates without blocking the UI.
5. **`modules/dev/index.js`**: Entry point loaded only in DEV mode via dynamic import behind `if (import.meta.env.DEV)`. Automatically stripped from production builds.

---

## Part A: Console API (`window.focustepDev`)

Open DevTools Console (`F12` or `Cmd+Option+I`) and call:

### 1. `focustepDev.setDay(dateOrOffset, minutesOrMap, opts?)`
Sets the total focus time for a specific day by safely replacing any existing seeded sessions for that day while preserving real user sessions. Generates 1–3 realistic sessions per subject.
- **`dateOrOffset`**: Date string (`"2026-10-06"`) or relative day integer (`0` = today, `-1` = yesterday, `-2` = 2 days ago).
- **`minutesOrMap`**: Total minutes integer (e.g. `140`, distributed across active subjects) OR an object mapping subject IDs to minutes (e.g. `{ web: 60, trade: 45, accounting: 35 }`).
- **`opts`** *(optional)*: `{ startHour: 14 }` to specify start hour (0–23).
```javascript
// Examples:
focustepDev.setDay(0, 45);
focustepDev.setDay(-2, { web: 90, cs: 30 });
focustepDev.setDay("2026-10-05", 180, { startHour: 9 });
```

### 2. `focustepDev.seedWeek(presetOrArray, weekOffset = 0)`
Seeds an entire 7-day week (Mon..Sun). `weekOffset = 0` is current week; `weekOffset = -1` is previous week (ideal for ghost/comparison curve testing).
- **Preset strings**:
  - `"empty"`: Clears all seeded sessions for the week (0m).
  - `"normal"`: Balanced study schedule (~120–210 min on weekdays, light weekends).
  - `"heavy"`: Intense schedule with 5+ hours (330m) on a single day.
  - `"midnight"`: Creates a session from 23:50 to 00:20 crossing local midnight to test split attribution.
  - `"peak2123"`: Clusters high volume between 21:00 and 23:00 to verify peak window detection.
- **Array of 7 numbers**: Minutes for Mon, Tue, Wed, Thu, Fri, Sat, Sun.
```javascript
// Examples:
focustepDev.seedWeek("normal", 0);
focustepDev.seedWeek("midnight", 0);
focustepDev.seedWeek("heavy", -1); // Previous week comparison
focustepDev.seedWeek([60, 90, 45, 120, 0, 180, 75], 0);
```

### 3. `focustepDev.seedSubjects(n)`
Generates `n` test subjects (e.g. `1, 3, 5, 7, 12`) with vibrant colors and icons to test the *By Subject* layout, scroll containment, and pie breakdown.
```javascript
focustepDev.seedSubjects(7);
focustepDev.removeSeededSubjects(); // Cleans them up
```

### 4. `focustepDev.addSession({ subjectId, start, minutes })`
Adds a single custom session marked with `seeded: true`.
```javascript
focustepDev.addSession({
  subjectId: "web",
  start: new Date(), // or "2026-10-10T14:30:00"
  minutes: 45
});
```

### 5. `focustepDev.setNow(dateString | Date | null)`
Overrides the effective "now" used by all stats selectors and date calculations. Pass `null` to reset back to actual system time.
```javascript
focustepDev.setNow("2026-10-05T12:00:00"); // Simulate Monday noon
focustepDev.setNow("2026-10-01T09:00:00"); // Simulate 1st of month
focustepDev.setNow(null);                  // Reset
```

### 6. `focustepDev.backup()` & `focustepDev.restore()`
Saves current `localStorage` state into a backup slot and restores it whenever needed.
```javascript
focustepDev.backup();
focustepDev.restore();
```

### 7. `focustepDev.clear({ seededOnly = true })`
Cleans data safely:
- `focustepDev.clear({ seededOnly: true })` removes only items flagged `seeded: true`. Non-seeded user data is kept untouched.
- `focustepDev.clear({ seededOnly: false })` wipes all sessions and custom subjects after browser confirmation.

---

## Part B: Floating Developer Panel

A single floating panel rendered inside its own **Shadow DOM** so it never clashes with application CSS. The background page remains interactive so you can monitor stats updating in real time.

### Keyboard Shortcuts & Interaction
- **`Ctrl+Shift+D`** or **`Cmd+Shift+D`**: Toggle panel expanded / collapsed.
- **`Esc`**: Collapse panel into the compact "DEV" pill.
- **Click Pill**: Expands panel at saved position.
- **Drag Handle**: Grab header using mouse or touch (`setPointerCapture`) and drag smoothly.
- **Magnetic Snap**: On release, snaps to the nearest viewport edge with subtle easing.
- **Viewport Clamping**: Re-clamps on window resize and orientation change to prevent disappearing offscreen.
- **State Persistence**: Position, dock side, active tab, and open/closed state are saved in `localStorage.getItem("focustepDevPanel")`.
- **Automatic Safety Backup**: Automatically creates a backup snapshot on first open of the session and before first edit.

### Panel Tabs
1. **Sessions Tab**:
   - Table driven by `RECORD_REGISTRY` with filter buttons (*All*, *Today*, *This Week*, *Seeded Only*).
   - Inline editing for Subject, Start datetime, and Duration (min).
   - "Seeded" badge on mock rows.
   - Delete row button and "+ Add Session" quick form.
   - Updates `statsStore`, writes to `localStorage`, and fires `focustep:statsUpdated` and `focustep:sessionLogged`.
2. **Time Machine Tab**:
   - Quick date buttons: *Today*, *Yesterday*, *Monday*, *Sunday*, *1st of Month*, *+1 Day*, *-1 Day*, *Reset*.
   - Live effective timestamp display and manual datetime picker.
3. **Presets Tab**:
   - Week offset picker: *This Week (0)* or *Last Week (-1)*.
   - One-click presets: *Empty*, *Normal (~12h)*, *Heavy (5h+ peak)*, *Midnight split*, *Peak 21:00–23:00*.
4. **Subjects Tab**:
   - Quick seed buttons: *1*, *3*, *5*, *7*, *12*.
   - Current subject count and "Remove Seeded Subjects" button.
5. **Data Tab**:
   - "Backup Current State" and "Restore Backup" buttons.
   - "Clear Seeded Only" and "Wipe All Data" buttons.
   - Live formatted JSON inspector of `statsStore` and `localStorage`.

---

## Manual QA Checklist

- [x] **Production Build Check**:
  - Run `npm run build`.
  - Verify `dist/assets/*.js` contains neither `focustepDev` nor `DevPanel`.
  - Dynamic import `if (import.meta.env.DEV) import('./modules/dev/index.js')` is eliminated by Vite during tree-shaking.
- [x] **Drag & Magnetic Snap**:
  - Drag the panel across the screen using mouse or touch.
  - Release to ensure it snaps to the nearest edge and respects viewport boundaries without covering toasts.
- [x] **Persistence After Reload**:
  - Move panel to bottom right, switch to *Time Machine* tab, refresh browser (`F5`).
  - Panel reopens at the same coordinates with the active tab preserved.
- [x] **Live Stats and Activity Updates**:
  - Open app on *Stats* or *Activity* tab.
  - Run `focustepDev.seedWeek("normal")` or edit a session inline in the panel.
  - Observe bar charts, streak count, peak window, and activity feed immediately updating without page reload.
- [x] **Midnight Split Test**:
  - Run `focustepDev.seedWeek("midnight")`.
  - Check that 23:50–00:20 split into 10 minutes attributed to the start day and 20 minutes attributed to the next day.
- [x] **Peak 21–23 Test**:
  - Run `focustepDev.seedWeek("peak2123")`.
  - Check that the Peak 2-hour window highlights `21:00 – 23:00`.
- [x] **Time Machine Edge Cases**:
  - Click *Monday* -> verify This Week displays Monday as current day with future days grayed out.
  - Click *Sunday* -> verify all 7 days of the week are past/active.
  - Click *1st of Month* -> verify month streak and metrics reset correctly.
  - Click *Reset* -> restores actual local device time.
- [x] **Backup & Restore**:
  - Click *Backup Current State* in Data tab.
  - Click *Clear Seeded Only* or add sessions.
  - Click *Restore Backup* -> verify previous data is restored cleanly.
