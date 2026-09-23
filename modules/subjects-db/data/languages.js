export const LANGUAGES_SUBJECTS = [
  {
    id: 'english_lang',
    categoryId: 'languages',
    names: {
      uz: "Ingliz tili (English)",
      ru: "Английский (English)",
      en: "English"
    },
    aliases: ['ingliz tili', 'english', 'ielts', 'toefl', 'cefr', 'inglizcha', 'английский язык', 'английский'],
    defaultColor: '#3b82f6',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><text x="12" y="17.8" text-anchor="middle" font-size="17" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" letter-spacing="-0.5">En</text></svg>`
  },
  {
    id: 'chinese_lang',
    categoryId: 'languages',
    names: {
      uz: "Xitoy tili (Chinese)",
      ru: "Китайский (Chinese)",
      en: "Chinese"
    },
    aliases: ['xitoy tili', 'mandarin', 'xitoycha', 'hsk', 'chinese', 'китайский язык', 'китайский', 'мандарин'],
    defaultColor: '#ef4444',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/><path d="m4.93 4.93 14.14 14.14M4.93 19.07 19.07 4.93"/></svg>`
  },
  {
    id: 'spanish_lang',
    categoryId: 'languages',
    names: {
      uz: "Ispan tili (Spanish)",
      ru: "Испанский (Spanish)",
      en: "Spanish"
    },
    aliases: ['ispan tili', 'espanol', 'español', 'ispancha', 'dele', 'spanish', 'испанский язык', 'испанский'],
    defaultColor: '#f97316',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><text x="12" y="18.5" text-anchor="middle" font-size="16.5" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Ñ</text></svg>`
  },
  {
    id: 'arabic_lang',
    categoryId: 'languages',
    names: {
      uz: "Arab tili (Arabic)",
      ru: "Арабский (Arabic)",
      en: "Arabic"
    },
    aliases: ['arab tili', 'arabcha', 'arab tili grammatikasi', 'tajvid', 'arabic', 'арабский язык', 'арабский'],
    defaultColor: '#10b981',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
  },
  {
    id: 'french_lang',
    categoryId: 'languages',
    names: {
      uz: "Fransuz tili (French)",
      ru: "Французский (French)",
      en: "French"
    },
    aliases: ['fransuz tili', 'fransuzcha', 'francais', 'français', 'delf', 'dalf', 'french', 'французский язык', 'французский'],
    defaultColor: '#0284c7',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><text x="12" y="18.5" text-anchor="middle" font-size="16.5" font-weight="800" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">É</text></svg>`
  },
  {
    id: 'russian_lang',
    categoryId: 'languages',
    names: {
      uz: "Rus tili (Russian)",
      ru: "Русский (Russian)",
      en: "Russian"
    },
    aliases: ['rus tili', 'ruscha', 'grammatika', 'russian', 'русский язык', 'русский', 'рки'],
    defaultColor: '#6366f1',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><text x="12" y="19" text-anchor="middle" font-size="21" font-weight="900" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Я</text></svg>`
  },
  {
    id: 'korean_lang',
    categoryId: 'languages',
    names: {
      uz: "Koreys tili (Korean)",
      ru: "Корейский (Korean)",
      en: "Korean"
    },
    aliases: ['koreys tili', 'hangul', 'koreyscha', 'topik', 'korean', 'корейский язык', 'корейский', 'топик'],
    defaultColor: '#ec4899',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a5 5 0 0 0 0 10 5 5 0 0 1 0 10"/><circle cx="12" cy="7" r="1.5" fill="currentColor"/><circle cx="12" cy="17" r="1.5" fill="currentColor"/></svg>`
  },
  {
    id: 'japanese_lang',
    categoryId: 'languages',
    names: {
      uz: "Yapon tili (Japanese)",
      ru: "Японский (Japanese)",
      en: "Japanese"
    },
    aliases: ['yapon tili', 'nihongo', 'kanji', 'hiragana', 'katakana', 'jlpt', 'japanese', 'японский язык', 'японский'],
    defaultColor: '#e11d48',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5h20"/><path d="M4 8h16"/><path d="M7 5v16"/><path d="M17 5v16"/><path d="M10 8h4"/></svg>`
  }
];
