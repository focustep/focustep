export const TECH_SUBJECTS = [
  {
    id: 'ai',
    categoryId: 'tech',
    names: {
      uz: "AI (Sun'iy intellekt)",
      ru: "ИИ",
      en: "AI"
    },
    aliases: ['ai', 'gemini', 'suniy intellekt', 'sun\'iy intellekt', 'sun’iy intellekt', 'ии', 'искусственный интеллект', 'artificial intelligence', 'sparkles'],
    defaultColor: '#3b82f6',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>`
  },
  {
    id: 'ml',
    categoryId: 'tech',
    names: {
      uz: "Mashinali o‘rganish",
      ru: "Машинное обучение",
      en: "Machine Learning"
    },
    aliases: ['ml', 'mashinali organish', 'mashinali o\'rganish', 'mashinali o‘rganish', 'machine learning', 'машинное обучение'],
    defaultColor: '#6366f1',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="12" r="3"/><line x1="8.6" y1="7.4" x2="15.4" y2="10.6"/><line x1="8.6" y1="16.6" x2="15.4" y2="13.4"/><line x1="6" y1="9" x2="6" y2="15"/></svg>`
  },
  {
    id: 'cs',
    categoryId: 'tech',
    names: {
      uz: "Kompyuter fanlari",
      ru: "Компьютерные науки",
      en: "Computer Science"
    },
    aliases: ['cs', 'computer science', 'kompyuter fanlari', 'информатика', 'компьютерные науки'],
    defaultColor: '#0ea5e9',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><polyline points="9 7.5 6.5 10 9 12.5"/><polyline points="15 7.5 17.5 10 15 12.5"/></svg>`
  },
  {
    id: 'programming',
    categoryId: 'tech',
    names: {
      uz: "Dasturlash",
      ru: "Программирование",
      en: "Programming"
    },
    aliases: ['dasturlash', 'coding', 'programming', 'python', 'javascript', 'c++', 'java', 'программирование', 'кодинг'],
    defaultColor: '#10b981',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 8 2 12 6 16"/><polyline points="18 8 22 12 18 16"/><line x1="13.5" y1="5.5" x2="10.5" y2="18.5"/></svg>`
  },
  {
    id: 'data_science',
    categoryId: 'tech',
    names: {
      uz: "Ma’lumotlar fanlari",
      ru: "Наука о данных",
      en: "Data Science"
    },
    aliases: ['data science', 'malumotlar fanlari', 'ma\'lumotlar fanlari', 'ma’lumotlar fanlari', 'наука о данных', 'analiz dannix', 'data analytics', 'big data'],
    defaultColor: '#06b6d4',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="14" width="10.5" height="6.5" rx="2"/><circle cx="9.8" cy="17.25" r="0.5" fill="currentColor"/><circle cx="14.5" cy="7" r="4.2"/><path d="m17.5 10 4 4"/></svg>`
  },
  {
    id: 'cybersecurity',
    categoryId: 'tech',
    names: {
      uz: "Kiberxavfsizlik",
      ru: "Кибербезопасность",
      en: "Cybersecurity"
    },
    aliases: ['kiberxavfsizlik', 'cybersecurity', 'кибербезопасность', 'xavfsizlik', 'security', 'infosec'],
    defaultColor: '#ef4444',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect x="9" y="10" width="6" height="5" rx="1"/><path d="M10 10V8a2 2 0 0 1 4 0v2"/></svg>`
  },
  {
    id: 'cloud_computing',
    categoryId: 'tech',
    names: {
      uz: "Bulutli texnologiyalar",
      ru: "Облачные технологии",
      en: "Cloud Computing"
    },
    aliases: ['cloud computing', 'bulutli texnologiyalar', 'cloud', 'облачные технологии', 'aws', 'azure', 'gcp'],
    defaultColor: '#0284c7',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke-width="2.3" d="M19 18H6a5 5 0 0 1-.8-9.94A7 7 0 0 1 18.3 8.36 4.5 4.5 0 0 1 19 18Z"/><polyline stroke-width="2" points="9.5 12.5 12 10 14.5 12.5"/><line stroke-width="2" x1="12" y1="10" x2="12" y2="15"/></svg>`
  },
  {
    id: 'mobile_dev',
    categoryId: 'tech',
    names: {
      uz: "Mobil dasturlash",
      ru: "Мобильная разработка",
      en: "Mobile Dev"
    },
    aliases: ['mobil ilovalar yaratish', 'mobil dasturlash', 'mobile app development', 'mobile dev', 'мобильная разработка', 'flutter', 'react native', 'ios', 'android'],
    defaultColor: '#8b5cf6',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3" ry="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`
  },
  {
    id: 'web_dev',
    categoryId: 'tech',
    names: {
      uz: "Veb-dasturlash",
      ru: "Веб-разработка",
      en: "Web Development"
    },
    aliases: ['veb-dasturlash', 'veb dasturlash', 'web development', 'веб-разработка', 'frontend', 'backend', 'fullstack'],
    defaultColor: '#14b8a6',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="8" x2="22" y2="8"/><line x1="6" y1="5.5" x2="6.01" y2="5.5"/><line x1="9" y1="5.5" x2="9.01" y2="5.5"/><polyline points="8 15 10 13 8 11"/><line x1="12" y1="17" x2="16" y2="17"/></svg>`
  },
  {
    id: 'blockchain',
    categoryId: 'tech',
    names: {
      uz: "Blokcheyn va Kripto",
      ru: "Блокчейн и крипта",
      en: "Blockchain & Crypto"
    },
    aliases: ['blokcheyn', 'kriptovalyuta', 'blokcheyn va kriptovalyutalar', 'blokcheyn va kripto', 'blockchain', 'crypto', 'blockchain & crypto', 'блокчейн', 'криптовалюта', 'блокчейн и крипта'],
    defaultColor: '#f59e0b',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 7h3.8a2.5 2.5 0 0 1 0 5H9"/><path d="M9 12h4.2a2.5 2.5 0 0 1 0 5H9"/><line x1="9" y1="7" x2="9" y2="17"/></svg>`
  },
  {
    id: 'robotics',
    categoryId: 'tech',
    names: {
      uz: "Robototexnika",
      ru: "Робототехника",
      en: "Robotics"
    },
    aliases: ['robototexnika', 'robotics', 'робототехника', 'robot', 'automation'],
    defaultColor: '#ec4899',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M8 3.5h8c3.8 0 5.8 2.2 6 5.8v.8a2.4 2.4 0 0 1 0 4.8v.6c-.2 3.6-2.2 5.5-6 5.5H8c-3.8 0-5.8-1.9-6-5.5v-.6a2.4 2.4 0 0 1 0-4.8v-.8C2.2 5.7 4.2 3.5 8 3.5zm-2.2 3h12.4c1.3 0 2.3 1 2.3 2.3v5.4c0 1.3-1 2.3-2.3 2.3H5.8c-1.3 0-2.3-1-2.3-2.3V8.8c0-1.3 1-2.3 2.3-2.3z"/><circle cx="10.5" cy="11.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="11.5" r="1.5" fill="currentColor"/></svg>`
  },
  {
    id: 'ux_ui',
    categoryId: 'tech',
    names: {
      uz: "UX/UI dizayn",
      ru: "UX/UI-дизайн",
      en: "UX/UI Design"
    },
    aliases: ['ux/ui dizayn', 'ux/ui', 'ui/ux', 'ux ui', 'дизайн', 'ux/ui дизайн', 'figma', 'design'],
    defaultColor: '#a855f7',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg>`
  },
  {
    id: 'big_data',
    categoryId: 'tech',
    names: {
      uz: "Katta ma’lumotlar",
      ru: "Большие данные",
      en: "Big Data"
    },
    aliases: ['katta malumotlar', 'katta ma\'lumotlar', 'katta ma’lumotlar', 'big data', 'большие данные'],
    defaultColor: '#4f46e5',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="4" rx="8" ry="2.5"/><path d="M4 4v5c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V4"/><path d="M4 9v5c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V9"/><path d="M4 14v5c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-5"/></svg>`
  },
  {
    id: 'iot',
    categoryId: 'tech',
    names: {
      uz: "Buyumlar interneti (IoT)",
      ru: "Интернет вещей (IoT)",
      en: "Internet of Things (IoT)"
    },
    aliases: ['internet buyumlari', 'buyumlar interneti', 'iot', 'internet of things', 'интернет вещей'],
    defaultColor: '#10b981',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.86a10.5 10.5 0 0 1 14 0"/><path d="M8.5 16.42a6 6 0 0 1 7 0"/></svg>`
  },
  {
    id: 'vr_ar',
    categoryId: 'tech',
    names: {
      uz: "VR/AR",
      ru: "VR/AR",
      en: "VR/AR"
    },
    aliases: ['vr/ar', 'vr', 'ar', 'virtual reallik', 'virtual va kengaytirilgan reallik', 'виртуальная реальность', 'дополненная реальность', 'virtual reality', 'augmented reality'],
    defaultColor: '#ec4899',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4.5l-2.5-2.5-2.5 2.5H5a2 2 0 0 1-2-2V9zm5 5.75a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5zm8 0a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5z"/></svg>`
  }
];
