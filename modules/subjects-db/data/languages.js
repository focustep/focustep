export const LANGUAGES_SUBJECTS = [
  {
    id: 'english_lang',
    categoryId: 'languages',
    names: {
      uz: "Ingliz tili (English)",
      ru: "Английский язык (English)",
      en: "English (IELTS / TOEFL / CEFR)"
    },
    aliases: ['ingliz tili', 'english', 'ielts', 'toefl', 'cefr', 'inglizcha', 'английский язык', 'английский'],
    defaultColor: '#3b82f6',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/><path d="m4.93 4.93 14.14 14.14M4.93 19.07 19.07 4.93"/></svg>`
  },
  {
    id: 'chinese_lang',
    categoryId: 'languages',
    names: {
      uz: "Xitoy tili (Mandarin)",
      ru: "Китайский язык (Мандарин / HSK)",
      en: "Chinese (Mandarin / HSK)"
    },
    aliases: ['xitoy tili', 'mandarin', 'xitoycha', 'hsk', 'chinese', 'китайский язык', 'китайский', 'мандарин'],
    defaultColor: '#ef4444',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M5 7h14v8H5zM2 15h20"/></svg>`
  },
  {
    id: 'spanish_lang',
    categoryId: 'languages',
    names: {
      uz: "Ispan tili (Español)",
      ru: "Испанский язык (Español / DELE)",
      en: "Spanish (Español / DELE)"
    },
    aliases: ['ispan tili', 'espanol', 'español', 'ispancha', 'dele', 'spanish', 'испанский язык', 'испанский'],
    defaultColor: '#f97316',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 20V4h3l8 16h3V4"/><path d="M8 2c2-1 6-1 8 0"/></svg>`
  },
  {
    id: 'arabic_lang',
    categoryId: 'languages',
    names: {
      uz: "Arab tili",
      ru: "Арабский язык",
      en: "Arabic Language"
    },
    aliases: ['arab tili', 'arabcha', 'arab tili grammatikasi', 'tajvid', 'arabic', 'арабский язык', 'арабский'],
    defaultColor: '#10b981',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1Z"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/></svg>`
  },
  {
    id: 'french_lang',
    categoryId: 'languages',
    names: {
      uz: "Fransuz tili (Français)",
      ru: "Французский язык (Français / DELF)",
      en: "French (Français / DELF)"
    },
    aliases: ['fransuz tili', 'fransuzcha', 'francais', 'français', 'delf', 'dalf', 'french', 'французский язык', 'французский'],
    defaultColor: '#0284c7',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2-3 15h6L12 2z"/><path d="M6 22h12"/><path d="M8 17h8"/><path d="m9 22-1-5"/><path d="m15 22 1-5"/><path d="M10 9h4"/></svg>`
  },
  {
    id: 'russian_lang',
    categoryId: 'languages',
    names: {
      uz: "Rus tili",
      ru: "Русский язык",
      en: "Russian Language"
    },
    aliases: ['rus tili', 'ruscha', 'grammatika', 'russian', 'русский язык', 'русский', 'рки'],
    defaultColor: '#6366f1',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V4H10a6 6 0 0 0 0 12h8"/><path d="m14 12 4 8"/><path d="M6 20h12"/></svg>`
  },
  {
    id: 'korean_lang',
    categoryId: 'languages',
    names: {
      uz: "Koreys tili (Hangul)",
      ru: "Корейский язык (TOPIK)",
      en: "Korean (TOPIK / Hangul)"
    },
    aliases: ['koreys tili', 'hangul', 'koreyscha', 'topik', 'korean', 'корейский язык', 'корейский', 'топик'],
    defaultColor: '#ec4899',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a5 5 0 0 0 0 10 5 5 0 0 1 0 10"/><circle cx="12" cy="7" r="1.5" fill="currentColor"/><circle cx="12" cy="17" r="1.5" fill="currentColor"/></svg>`
  },
  {
    id: 'japanese_lang',
    categoryId: 'languages',
    names: {
      uz: "Yapon tili (Nihongo)",
      ru: "Японский язык (JLPT)",
      en: "Japanese (JLPT / Nihongo)"
    },
    aliases: ['yapon tili', 'nihongo', 'kanji', 'hiragana', 'katakana', 'jlpt', 'japanese', 'японский язык', 'японский'],
    defaultColor: '#e11d48',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5h20"/><path d="M4 8h16"/><path d="M7 5v16"/><path d="M17 5v16"/><path d="M10 8h4"/></svg>`
  }
];
