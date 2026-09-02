import { updateStadiumDimensions, resetFocusIdleTimer } from './timer.js';
import { renderTodos } from './todos.js';
import { renderStats, renderGoal } from './stats.js';
import { renderCalendar, renderDayDetail } from './calendar.js';

export function initUI() {
  // 1. Live Clock
  const liveClock = document.getElementById('live-clock');
  function updateLiveClock() {
    if (!liveClock) return;
    const d = new Date();
    liveClock.textContent = String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0') + ':' +
      String(d.getSeconds()).padStart(2, '0');
  }
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // 2. Fullscreen
  const fullscreenBtn = document.getElementById('fullscreen-toggle');
  function isFs() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  }
  function updateFsBtn() {
    if (fullscreenBtn) fullscreenBtn.classList.toggle('is-active', isFs());
  }
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      fullscreenBtn.classList.remove('anim-pop');
      void fullscreenBtn.offsetWidth;
      fullscreenBtn.classList.add('anim-pop');
      setTimeout(() => fullscreenBtn.classList.remove('anim-pop'), 500);

      if (!isFs()) {
        const el = document.documentElement;
        const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        if (req) {
          try {
            const res = req.call(el);
            if (res && res.catch) res.catch(function(){});
          } catch (_) {}
        }
      } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) {
          try {
            const res = exit.call(document);
            if (res && res.catch) res.catch(function(){});
          } catch (_) {}
        }
      }
    });
  }
  document.addEventListener('fullscreenchange', updateFsBtn);
  document.addEventListener('webkitfullscreenchange', updateFsBtn);

  // 3. Gear Settings Menu (Ham PC, ham Mobile uchun)
  const menuToggle = document.getElementById('menu-toggle');
  const menuPanel = document.getElementById('menu-panel');
  const desktopFaqBtn = document.getElementById('faq-btn');
  const mobileFaqBtn = document.getElementById('faq-btn-mobile');
  const faqModal = document.getElementById('faq-modal-overlay');
  const faqCloseBtn = document.getElementById('faq-modal-close');

  function closeMenu() {
    if (!menuPanel || !menuToggle) return;
    menuPanel.classList.remove('open');
    menuToggle.classList.remove('is-active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-is-open');
  }
  function openMenu() {
    if (!menuPanel || !menuToggle) return;
    menuPanel.classList.add('open');
    menuToggle.classList.add('is-active');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-is-open');
  }
  if (menuToggle && menuPanel) {
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (menuPanel.classList.contains('open')) closeMenu(); else openMenu();
    });
    document.addEventListener('click', function(e) {
      if (!menuPanel.classList.contains('open')) return;
      const path = e.composedPath ? e.composedPath() : [];
      if (path.includes(menuPanel) || path.includes(menuToggle)) return;
      if (menuPanel.contains(e.target) || e.target === menuToggle || menuToggle.contains(e.target)) return;
      const themeWarn = document.querySelector('.theme-warn');
      if (themeWarn && (themeWarn.contains(e.target) || path.includes(themeWarn))) return;
      closeMenu();
    });
  }

  // 4. Header Navigation Links & Subview Switching
  const navStatsBtn = document.getElementById('nav-stats-btn');
  const navCalendarBtn = document.getElementById('nav-calendar-btn');
  const navAiTeacherBtn = document.getElementById('nav-ai-teacher-btn');
  const logoBtn = document.getElementById('header-logo-btn');
  const brandTextBtn = document.getElementById('header-brand-text-btn');

  const mainFrame = document.getElementById('focus-main-frame');
  const sessionHeaderRow = document.getElementById('focus-session-header-row');
  const statsSubview = document.getElementById('stats-subview');
  const calendarSubview = document.getElementById('calendar-subview');
  const aiTeacherSubview = document.getElementById('ai-teacher-subview');

  const statsCloseBtn = document.getElementById('stats-subview-close');
  const calCloseBtn = document.getElementById('calendar-subview-close');
  const aiCloseBtn = document.getElementById('ai-teacher-subview-close');

  const allNavLinks = [navStatsBtn, navCalendarBtn, navAiTeacherBtn].filter(Boolean);
  const allSubviews = [statsSubview, calendarSubview, aiTeacherSubview].filter(Boolean);

  // Algorithmic Nav Underline Fit Controller
  function initNavUnderlineAlgorithm() {
    allNavLinks.forEach(link => {
      let textSpan = link.querySelector('.nav-text');
      if (!textSpan) {
        textSpan = document.createElement('span');
        textSpan.className = 'nav-text';
        textSpan.innerHTML = link.innerHTML;
        link.innerHTML = '';
        link.appendChild(textSpan);
      }

      const syncMetrics = () => {
        if (!textSpan) return;
        const width = Math.round(textSpan.getBoundingClientRect().width);
        if (width > 0) {
          link.style.setProperty('--nav-text-width', `${width}px`);
        }
      };

      syncMetrics();
      link.addEventListener('mouseenter', syncMetrics);
      link.addEventListener('focus', syncMetrics);
      link.addEventListener('pointerenter', syncMetrics);
    });

    const recalculateAll = () => {
      allNavLinks.forEach(link => {
        const textSpan = link.querySelector('.nav-text');
        if (textSpan) {
          const width = Math.round(textSpan.getBoundingClientRect().width);
          if (width > 0) {
            link.style.setProperty('--nav-text-width', `${width}px`);
          }
        }
      });
    };

    window.addEventListener('resize', recalculateAll, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(recalculateAll);
    }
    setTimeout(recalculateAll, 100);
    setTimeout(recalculateAll, 500);
  }
  initNavUnderlineAlgorithm();

  function showTimerView() {
    allNavLinks.forEach(l => {
      l.classList.remove('active', 'is-active');
      if (typeof l.blur === 'function') l.blur();
    });
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    allSubviews.forEach(v => {
      v.style.display = 'none';
      v.classList.remove('is-open');
    });
    if (mainFrame) {
      mainFrame.style.display = '';
      mainFrame.classList.remove('is-hidden');
    }
    if (sessionHeaderRow) {
      sessionHeaderRow.style.display = '';
    }
    requestAnimationFrame(updateStadiumDimensions);
  }

  function showSubview(targetView, activeLink) {
    if (mainFrame) {
      mainFrame.style.display = 'none';
      mainFrame.classList.add('is-hidden');
    }
    if (sessionHeaderRow) {
      sessionHeaderRow.style.display = 'none';
    }
    allSubviews.forEach(v => {
      if (v === targetView) {
        v.style.display = 'block';
        v.classList.add('is-open');
      } else {
        v.style.display = 'none';
        v.classList.remove('is-open');
      }
    });
    allNavLinks.forEach(l => {
      l.classList.toggle('active', l === activeLink);
      l.classList.toggle('is-active', l === activeLink);
      if (l !== activeLink && typeof l.blur === 'function') {
        l.blur();
      }
    });

    if (targetView === statsSubview) {
      renderStats();
      renderGoal();
    } else if (targetView === calendarSubview) {
      renderCalendar();
      renderDayDetail();
    }
  }

  if (navStatsBtn && statsSubview) {
    navStatsBtn.addEventListener('click', () => {
      if (statsSubview.style.display === 'block') {
        showTimerView();
      } else {
        showSubview(statsSubview, navStatsBtn);
      }
    });
  }

  if (navCalendarBtn && calendarSubview) {
    navCalendarBtn.addEventListener('click', () => {
      if (calendarSubview.style.display === 'block') {
        showTimerView();
      } else {
        showSubview(calendarSubview, navCalendarBtn);
      }
    });
  }

  if (navAiTeacherBtn && aiTeacherSubview) {
    navAiTeacherBtn.addEventListener('click', () => {
      if (aiTeacherSubview.style.display === 'block') {
        showTimerView();
      } else {
        showSubview(aiTeacherSubview, navAiTeacherBtn);
      }
    });
  }

  // Close (X / krestik) buttons to return directly to timer
  if (statsCloseBtn) statsCloseBtn.addEventListener('click', showTimerView);
  if (calCloseBtn) calCloseBtn.addEventListener('click', showTimerView);
  if (aiCloseBtn) aiCloseBtn.addEventListener('click', showTimerView);
  if (logoBtn) logoBtn.addEventListener('click', showTimerView);
  if (brandTextBtn) brandTextBtn.addEventListener('click', showTimerView);

  // AI Teacher Interactive logic
  const aiInput = document.getElementById('ai-teacher-input');
  const aiSendBtn = document.getElementById('ai-teacher-send-btn');
  const aiChatOutput = document.getElementById('ai-chat-output');
  const aiPills = document.querySelectorAll('.ai-prompt-pill');

  function handleAiSubmit(promptText) {
    const text = (promptText || (aiInput ? aiInput.value : '')).trim();
    if (!text || !aiChatOutput) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message user';
    userMsg.innerHTML = `<p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
    aiChatOutput.appendChild(userMsg);
    if (aiInput) aiInput.value = '';

    // Scroll to bottom
    aiChatOutput.scrollTop = aiChatOutput.scrollHeight;

    // Simulate smart AI study advice response
    setTimeout(() => {
      const assistantMsg = document.createElement('div');
      assistantMsg.className = 'ai-message assistant';
      let reply = "Ajoyib savol! Fokusni oshirish uchun har 25-50 daqiqada 5 daqiqalik tanaffus qiling va bitta vazifaga to'liq diqqat qarating.";
      if (text.toLowerCase().includes('pomodoro')) {
        reply = "Pomodoro bo'yicha 2 soatlik tavsiya:\n1. 25 daqiqa dars (Fokus)\n2. 5 daqiqa dam\n3. 25 daqiqa dars (Mashqlar)\n4. 5 daqiqa dam\n5. 50 daqiqa konspekt & umumlashtirish.";
      } else if (text.toLowerCase().includes('fokus') || text.toLowerCase().includes('maslahat')) {
        reply = "Diqqatni jamlash bo'yicha 3 ta qoida:\n1. Telefon va ijtimoiy tarmoqlarni boshqa xonaga qo'ying.\n2. Bir vaqtda faqat bitta rejani (Today's plans) bajaring.\n3. Oq shovqin yoki Yomg'ir ovozini yoqing.";
      } else if (text.toLowerCase().includes('tartib') || text.toLowerCase().includes('reja')) {
        reply = "Bugungi darslaringizni 'Eng qiyini birinchi' (Eat that frog) qoidasi bo'yicha boshlang. Energiya yuqori paytda asosiy fanni, keyin yengilroqlarini bajaring!";
      }
      assistantMsg.innerHTML = `<p>${reply.replace(/\n/g, '<br>')}</p>`;
      aiChatOutput.appendChild(assistantMsg);
      aiChatOutput.scrollTop = aiChatOutput.scrollHeight;
    }, 400);
  }

  if (aiSendBtn) aiSendBtn.addEventListener('click', () => handleAiSubmit());
  if (aiInput) {
    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAiSubmit();
      }
    });
  }
  aiPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const prompt = pill.getAttribute('data-prompt');
      handleAiSubmit(prompt);
    });
  });

  // 5. FAQ Modal Logic
  function openFaq() {
    if (faqModal) {
      faqModal.classList.add('open');
      faqModal.setAttribute('aria-hidden', 'false');
    }
    closeMenu();
  }
  function closeFaq() {
    if (faqModal) {
      faqModal.classList.remove('open');
      faqModal.setAttribute('aria-hidden', 'true');
    }
  }
  if (desktopFaqBtn) desktopFaqBtn.addEventListener('click', openFaq);
  if (mobileFaqBtn) mobileFaqBtn.addEventListener('click', openFaq);
  if (faqCloseBtn) faqCloseBtn.addEventListener('click', closeFaq);
  if (faqModal) {
    faqModal.addEventListener('click', function(e) {
      if (e.target === faqModal) closeFaq();
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeMenu();
      closeFaq();
    }
  });

  // Trigger stadium size calculation on initial load & resize
  requestAnimationFrame(function() {
    updateStadiumDimensions();
    setTimeout(updateStadiumDimensions, 100);
    setTimeout(updateStadiumDimensions, 300);
  });
  window.addEventListener('resize', function() {
    updateStadiumDimensions();
  });
}
