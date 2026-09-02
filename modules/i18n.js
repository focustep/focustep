export const I18N = {
  uz: {
    localeCode: 'uz-UZ',
    brandSub: "just study it",
    themeTitle: "Rejimni almashtirish", themeAria: "Mavzu",
    muteTitle: "Ovozni yoqish/o'chirish", muteAria: "Ovoz",
    langTitle: "Tilni almashtirish",
    fullscreenTitle: "To'liq ekran", fullscreenAria: "To'liq ekran rejimi",
    setDurationTitle: "Vaqtni belgilash",
    hoursLabel: "Soat", minutesLabel: "Daqiqa", secondsLabel: "Soniya",
    noLimitLabel: "Cheklov yo'q",
    toggleAria: "Bo'limni ochish/yopish",
    calPrevAria: "Oldingi oy", calNextAria: "Keyingi oy", addAria: "Qo'shish", pomodoroSwitchAria: "Pomodoro rejimi",
    focusTitle: "Fokus vaqti", focusSub: "Bugungi o'qish sessiyasi",
    start: "Boshlash", stop: "To'xtatish", reset: "Qayta boshlash",
    dailyGoal: "Kunlik maqsad", hours: "soat",
    pomodoroTitle: "Pomodoro rejimi", pomodoroSub: "25 daqiqa ish, 5 daqiqa tanaffus",
    pomodoroSwitchName: "Pomodoro tsiklini yoqish", pomodoroSwitchDesc: "Ish va tanaffus davrlari avtomatik almashadi",
    currentPhase: "joriy bosqich", remainingTime: "qolgan vaqt",
    work: "Ish", breakWord: "Tanaffus", workTime: "Ish vaqti", restTime: "Dam olish",
    todoTitle: "Bugungi rejalar", todoSub: "Nimalarni bajarishni xohlaysiz?",
    todoPlaceholder: "Yangi reja qo'shish...", todoEmpty: "Hozircha reja yo'q — birinchisini qo'shing",
    autoSave: "Avtomatik saqlanadi", saving: "Yozilmoqda...", saved: "Saqlandi",
    saveError: "Saqlashda xatolik", imported: "Import qilindi",
    statsTitle: "Statistika va maqsad", statsSub: "Umumiy progress",
    thisWeek: "Bu hafta", thisMonth: "Bu oy",
    monthlyGoal: "Oylik maqsad:", days: "kun",
    goalStatus: function(done, goal){ return done + '/' + goal + " kun bajarildi (bu oy)"; },
    calTitle: "Kalendar va tarix", calSub: "Kunlarni ko'rish va tekshirish",
    weekdays: ["Du","Se","Cho","Pa","Ju","Sh","Ya"],
    legendDone: "To'liq bajarilgan", legendPartial: "Yeta olmagan", legendExtra: "Extra vaqt qo'shilgan",
    streakActive: function(s){ return "🔥 " + s + " kunlik seriya"; },
    streakNone: "Hali seriya yo'q — bugundan boshlang",
    noActivity: "Bu kunda faoliyat yo'q", studied: "O'qildi: ",
    limitDone: " — limit to'liq bajarildi", limitPartial: " — limitga yetilmadi",
    extraAddedLine: function(n){ return " · +" + n + " min extra qo'shilgan"; },
    noPlan: "Reja yozilmagan",
    backupTitle: "Zaxira nusxa", backupSub: "Ma'lumotlarni saqlash va tiklash",
    exportBtn: "Export", importBtn: "Import",
    backupNote: "Barcha ma'lumotlar shu qurilma brauzerida saqlanadi. Boshqa qurilmaga o'tkazish uchun eksport qiling.",
    invalidFile: "Fayl noto'g'ri formatda",
    footer: "Bo'shliq tugmasi — boshlash / to'xtatish",
    notifyBreakTitle: "Tanaffus vaqti", notifyBreakBody: "Sessiyani yaxshi bajardingiz — 5 daqiqa dam oling.",
    notifyWorkTitle: "Ish vaqti", notifyWorkBody: "Tanaffus tugadi — yangi fokus davri boshlandi.",
    notifyDoneTitle: "Barakalla!", notifyDoneBody: "Bugungi maqsad bajarildi.",
    themeWarnQuestion: "Yorug' rejimga o'tishni xohlaysizmi?",
    themeWarnYes: "Ha", themeWarnNo: "Yo'q",
    themeWarnDismiss: "Boshqa ko'rsatilmasin",
    selectCustomMode: "Select/Custom Mode",
    modeTimer: "Timer",
    modePomodoro: "Pomodoro",
    modeUltradian: "Ultradian Rythm",
    modeClock: "Clock",
    modeStopwatch: "Stopwatch",
    setTimeLabel: "SET TIME",
    setDurationLabel: "Set duration",
    focusTime: "Focus time",
    breakTime: "Break time",
    shortBreak: "Short break",
    longBreak: "Long break",
    sessionLabel: "Sessiya",
    restart: "Restart",
    autoStartBlocks: "Auto-start focus blocks",
    autoStartDesc: "Dam olish tugaganda avtomatik ravishda keyingi fokus taymerini boshlaydi. Qo'lda boshlash uchun o'chiring.",
    autoStartCycles: "Auto-start focus and break cycles",
    autoStartCyclesDesc: "Sikllar (ish va dam olish) tugaganda keyingi bosqichni avtomatik boshlaydi. Qo'lda boshlash uchun o'chiring.",
    ultradianNote: "The duration of the cycles (90 min work / 20 min rest) is fixed on the basis of the biological rhythms of the human brain and is not subject to change.",
    showSeconds: "Show seconds",
    use12HourFormat: "12-hour format",
    stopwatchNote: "Use a stopwatch to track tasks for free"
  },
  ru: {
    localeCode: 'ru-RU',
    brandSub: "just study it",
    themeTitle: "Сменить тему", themeAria: "Тема",
    muteTitle: "Включить/выключить звук", muteAria: "Звук",
    langTitle: "Сменить язык",
    fullscreenTitle: "Полный экран", fullscreenAria: "Полноэкранный режим",
    setDurationTitle: "Установить время",
    hoursLabel: "Часы", minutesLabel: "Минуты", secondsLabel: "Секунды",
    noLimitLabel: "Без ограничений",
    toggleAria: "Развернуть/свернуть раздел",
    calPrevAria: "Предыдущий месяц", calNextAria: "Следующий месяц", addAria: "Добавить", pomodoroSwitchAria: "Режим Помодоро",
    focusTitle: "Время фокуса", focusSub: "Сегодняшняя учебная сессия",
    start: "Начать", stop: "Остановить", reset: "Сбросить",
    dailyGoal: "Дневная цель", hours: "часов",
    pomodoroTitle: "Режим Помодоро", pomodoroSub: "25 мин работы, 5 мин отдыха",
    pomodoroSwitchName: "Включить цикл Помодоро", pomodoroSwitchDesc: "Периоды работы и отдыха чередуются автоматически",
    currentPhase: "текущая фаза", remainingTime: "осталось времени",
    work: "Работа", breakWord: "Перерыв", workTime: "Время работы", restTime: "Отдых",
    todoTitle: "Планы на сегодня", todoSub: "Что вы хотите сделать?",
    todoPlaceholder: "Добавить новый план...", todoEmpty: "Пока нет планов — добавьте первый",
    autoSave: "Сохраняется автоматически", saving: "Сохранение...", saved: "Сохранено",
    saveError: "Ошибка сохранения", imported: "Импортировано",
    statsTitle: "Статистика и цель", statsSub: "Общий прогресс",
    thisWeek: "На этой неделе", thisMonth: "В этом месяце",
    monthlyGoal: "Месячная цель:", days: "дней",
    goalStatus: function(done, goal){ return done + '/' + goal + " дней выполнено (в этом месяце)"; },
    calTitle: "Календарь и история", calSub: "Просмотр и проверка дней",
    weekdays: ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],
    legendDone: "Полностью выполнено", legendPartial: "Не достигнуто", legendExtra: "Добавлено доп. время",
    streakActive: function(s){ return "🔥 Серия " + s + " дн."; },
    streakNone: "Серии пока нет — начните сегодня",
    noActivity: "В этот день нет активности", studied: "Изучено: ",
    limitDone: " — лимит полностью выполнен", limitPartial: " — лимит не достигнут",
    extraAddedLine: function(n){ return " · +" + n + " мин доп. добавлено"; },
    noPlan: "План не написан",
    backupTitle: "Резервная копия", backupSub: "Сохранение и восстановление данных",
    exportBtn: "Экспорт", importBtn: "Импорт",
    backupNote: "Все данные хранятся в браузере этого устройства. Экспортируйте, чтобы перенести на другое устройство.",
    invalidFile: "Неверный формат файла",
    footer: "Пробел — старт / стоп",
    notifyBreakTitle: "Время перерыва", notifyBreakBody: "Отличная сессия — отдохните 5 минут.",
    notifyWorkTitle: "Время работы", notifyWorkBody: "Перерыв закончен — начался новый период фокуса.",
    notifyDoneTitle: "Отлично!", notifyDoneBody: "Сегодняшняя цель достигнута.",
    themeWarnQuestion: "Хотите переключиться на светлую тему?",
    themeWarnYes: "Да", themeWarnNo: "Нет",
    themeWarnDismiss: "Больше не показывать",
    selectCustomMode: "Select/Custom Mode",
    modeTimer: "Timer",
    modePomodoro: "Pomodoro",
    modeUltradian: "Ultradian Rythm",
    modeClock: "Clock",
    modeStopwatch: "Stopwatch",
    setTimeLabel: "SET TIME",
    setDurationLabel: "Set duration",
    focusTime: "Focus time",
    breakTime: "Break time",
    shortBreak: "Short break",
    longBreak: "Long break",
    sessionLabel: "Сессия",
    restart: "Restart",
    autoStartBlocks: "Auto-start focus blocks",
    autoStartDesc: "Автоматически запускает следующий таймер фокуса после окончания отдыха. Отключите для запуска вручную.",
    autoStartCycles: "Auto-start focus and break cycles",
    autoStartCyclesDesc: "Автоматически запускает следующий цикл (фокус или отдых). Отключите для ручного запуска.",
    ultradianNote: "The duration of the cycles (90 min work / 20 min rest) is fixed on the basis of the biological rhythms of the human brain and is not subject to change.",
    showSeconds: "Показывать секунды",
    use12HourFormat: "12-часовой формат",
    stopwatchNote: "Use a stopwatch to track tasks for free"
  },
  en: {
    localeCode: 'en-US',
    brandSub: "just study it",
    themeTitle: "Switch theme", themeAria: "Theme",
    muteTitle: "Toggle sound", muteAria: "Sound",
    langTitle: "Change language",
    fullscreenTitle: "Fullscreen", fullscreenAria: "Fullscreen mode",
    setDurationTitle: "Set time",
    hoursLabel: "Hours", minutesLabel: "Minutes", secondsLabel: "Seconds",
    noLimitLabel: "No limit",
    toggleAria: "Expand/collapse section",
    calPrevAria: "Previous month", calNextAria: "Next month", addAria: "Add", pomodoroSwitchAria: "Pomodoro mode",
    focusTitle: "Focus Time", focusSub: "Today's study session",
    start: "Start", stop: "Stop", reset: "Restart",
    dailyGoal: "Daily goal", hours: "hrs",
    pomodoroTitle: "Pomodoro Mode", pomodoroSub: "25 min work, 5 min break",
    pomodoroSwitchName: "Enable Pomodoro cycle", pomodoroSwitchDesc: "Work and break periods switch automatically",
    currentPhase: "current phase", remainingTime: "time left",
    work: "Work", breakWord: "Break", workTime: "Work time", restTime: "Break time",
    todoTitle: "Today's Plans", todoSub: "What do you want to get done?",
    todoPlaceholder: "Add a new plan...", todoEmpty: "No plans yet — add your first one",
    autoSave: "Auto-saved", saving: "Saving...", saved: "Saved",
    saveError: "Save failed", imported: "Imported",
    statsTitle: "Stats & Goal", statsSub: "Overall progress",
    thisWeek: "This week", thisMonth: "This month",
    monthlyGoal: "Monthly goal:", days: "days",
    goalStatus: function(done, goal){ return done + '/' + goal + " days completed (this month)"; },
    calTitle: "Calendar & History", calSub: "View and check your days",
    weekdays: ["Mo","Tu","We","Th","Fr","Sa","Su"],
    legendDone: "Fully completed", legendPartial: "Fell short", legendExtra: "Extra time added",
    streakActive: function(s){ return "🔥 " + s + "-day streak"; },
    streakNone: "No streak yet — start today",
    noActivity: "No activity this day", studied: "Studied: ",
    limitDone: " — goal fully reached", limitPartial: " — goal not reached",
    extraAddedLine: function(n){ return " · +" + n + " min extra added"; },
    noPlan: "No plan written",
    backupTitle: "Backup", backupSub: "Save and restore your data",
    exportBtn: "Export", importBtn: "Import",
    backupNote: "All data is stored in this device's browser. Export it to move it to another device.",
    invalidFile: "Invalid file format",
    footer: "Spacebar — start / stop",
    notifyBreakTitle: "Break time", notifyBreakBody: "Great session — take a 20 minute break.",
    notifyWorkTitle: "Work time", notifyWorkBody: "Break's over — a new 90 min focus period has started.",
    notifyDoneTitle: "Well done!", notifyDoneBody: "Today's goal has been reached.",
    themeWarnQuestion: "Switch to light mode?",
    themeWarnYes: "Yes", themeWarnNo: "No",
    themeWarnDismiss: "Don't show again",
    selectCustomMode: "Select/Custom Mode",
    modeTimer: "Timer",
    modePomodoro: "Pomodoro",
    modeUltradian: "Ultradian Rythm",
    modeClock: "Clock",
    modeStopwatch: "Stopwatch",
    setTimeLabel: "SET TIME",
    setDurationLabel: "Set duration",
    focusTime: "Focus time",
    breakTime: "Break time",
    shortBreak: "Short break",
    longBreak: "Long break",
    sessionLabel: "Session",
    restart: "Restart",
    autoStartBlocks: "Auto-start focus blocks",
    autoStartDesc: "Automatically starts the next focus timer when rest ends. Toggle off to start manually.",
    autoStartCycles: "Auto-start focus and break cycles",
    autoStartCyclesDesc: "Automatically starts the next cycle when the current one ends. Toggle off to start manually.",
    ultradianNote: "The duration of the cycles (90 min work / 20 min rest) is fixed on the basis of the biological rhythms of the human brain and is not subject to change.",
    showSeconds: "Show seconds",
    use12HourFormat: "12-hour format",
    stopwatchNote: "Use a stopwatch to track tasks for free"
  }
};

let currentLang = 'uz';
try { currentLang = localStorage.getItem('lang') || 'uz'; } catch(e){}
if (!I18N[currentLang]) currentLang = 'uz';

export function tr() {
  return I18N[currentLang];
}

export function getLang() {
  return currentLang;
}

export function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    const val = tr()[el.dataset.i18n];
    if (typeof val === 'string') el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    const val = tr()[el.dataset.i18nPlaceholder];
    if (typeof val === 'string') el.placeholder = val;
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
    const val = tr()[el.dataset.i18nTitle];
    if (typeof val === 'string') el.title = val;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(function(el) {
    const val = tr()[el.dataset.i18nAria];
    if (typeof val === 'string') el.setAttribute('aria-label', val);
  });
  const wds = tr().weekdays;
  for (let i = 0; i < 7; i++) {
    const el = document.getElementById('wd' + i);
    if (el) el.textContent = wds[i];
  }
}

const LANG_ORDER = ['uz', 'ru', 'en'];
const listeners = [];

export function onLanguageChange(fn) {
  listeners.push(fn);
}

export function setLang(l) {
  currentLang = l;
  try { localStorage.setItem('lang', l); } catch(e){}
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.textContent = l.toUpperCase();
    langBtn.classList.remove('anim-flip');
    void langBtn.offsetWidth;
    langBtn.classList.add('anim-flip');
    setTimeout(() => langBtn.classList.remove('anim-flip'), 500);
  }
  applyStaticI18n();
  listeners.forEach(fn => fn(l));
}

export function initI18n() {
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.textContent = currentLang.toUpperCase();
    langBtn.addEventListener('click', function() {
      const idx = LANG_ORDER.indexOf(currentLang);
      setLang(LANG_ORDER[(idx + 1) % LANG_ORDER.length]);
    });
  }
  applyStaticI18n();
}
