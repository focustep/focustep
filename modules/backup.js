import { tr } from './i18n.js';
import { loadTimerState } from './timer.js';
import { loadNotes } from './todos.js';
import { renderCalendar, renderDayDetail } from './calendar.js';
import { renderStats, renderGoal } from './stats.js';

export function initBackup() {
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importFile = document.getElementById('import-file');
  const saveInfo = document.getElementById('save-info');

  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.indexOf('timer_') === 0 || key.indexOf('notes_') === 0 || key === 'goal_days' || key === 'daily_goal_hours')) {
          data[key] = localStorage.getItem(key);
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'study-timer-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  if (importBtn && importFile) {
    importBtn.addEventListener('click', function() {
      importFile.click();
    });

    importFile.addEventListener('change', function() {
      const file = importFile.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function() {
        try {
          const data = JSON.parse(reader.result);
          Object.keys(data).forEach(function(key) {
            if (key.indexOf('timer_') === 0 || key.indexOf('notes_') === 0 || key === 'goal_days' || key === 'daily_goal_hours') {
              localStorage.setItem(key, data[key]);
            }
          });
          const g = localStorage.getItem('daily_goal_hours');
          const dailyGoalInput = document.getElementById('daily-goal-input');
          if (g && dailyGoalInput) dailyGoalInput.value = parseFloat(g) || 3;

          loadTimerState();
          loadNotes();
          renderCalendar();
          renderDayDetail();
          renderStats();
          renderGoal();
          if (saveInfo) saveInfo.textContent = tr().imported;
        } catch(e) {
          alert(tr().invalidFile);
        }
      };
      reader.readAsText(file);
      importFile.value = '';
    });
  }
}
