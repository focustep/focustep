export const HEALTHCARE_SUBJECTS = [
  {
    id: 'medicine',
    categoryId: 'healthcare',
    names: {
      uz: "Umumiy tibbiyot",
      ru: "Общая медицина (Лечебное дело)",
      en: "General Medicine"
    },
    aliases: ['umumiy tibbiyot', 'tibbiyot', 'davolash ishi', 'shifokor', 'doktor', 'terapiya', 'jarrohlik', 'medicine', 'общая медицина', 'лечебное дело'],
    defaultColor: '#ef4444',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 3v5a5.5 5.5 0 0 0 11 0V3"/><path d="M4 3h1"/><path d="M15 3h1"/><path d="M10 13.5V17a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3v-1"/><circle cx="17" cy="13" r="2"/></svg>`
  },
  {
    id: 'dentistry',
    categoryId: 'healthcare',
    names: {
      uz: "Stomatologiya",
      ru: "Стоматология",
      en: "Dentistry"
    },
    aliases: ['stomatologiya', 'tish', 'tish shifokori', 'dentistry', 'dental', 'ortodontiya', 'стоматология', 'зубной'],
    defaultColor: '#06b6d4',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.5 2 7 4.5 7 8c0 3.5 1 10 2.5 13 1.5 0 2-3 2.5-6 .5 3 1 6 2.5 6 1.5-3 2.5-9.5 2.5-13 0-3.5-1.5-6-5-6Z"/><path d="M9 7.5c.5-.5 1.5-.5 3 0 1.5-.5 2.5-.5 3 0"/></svg>`
  },
  {
    id: 'pharmacy',
    categoryId: 'healthcare',
    names: {
      uz: "Farmatsevtika",
      ru: "Фармацевтика и фармакология",
      en: "Pharmacy & Pharmacology"
    },
    aliases: ['farmatsevtika', 'farmakologiya', 'dori', 'dorishunoslik', 'apteka', 'pharmacy', 'pharmacology', 'фармацевтика', 'фармакология'],
    defaultColor: '#10b981',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/><circle cx="6" cy="18" r="2.5"/></svg>`
  },
  {
    id: 'nursing',
    categoryId: 'healthcare',
    names: {
      uz: "Hamshiralik ishi",
      ru: "Сестринское дело",
      en: "Nursing & Patient Care"
    },
    aliases: ['hamshiralik ishi', 'hamshira', 'medsestra', 'tibbiy parvarish', 'nursing', 'сестринское дело'],
    defaultColor: '#f43f5e',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 7v6"/><path d="M9 10h6"/></svg>`
  },
  {
    id: 'psychology',
    categoryId: 'healthcare',
    names: {
      uz: "Psixologiya",
      ru: "Психология",
      en: "Psychology"
    },
    aliases: ['psixologiya', 'ruhshunoslik', 'kognitiv psixologiya', 'psychology', 'психология'],
    defaultColor: '#8b5cf6',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2a5 5 0 0 0-5 5v2a5 5 0 0 0 2 4.1V18a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4.9A5 5 0 0 0 16.5 9v-2a5 5 0 0 0-5-5Z"/><path d="M9 10h6"/><path d="M12 7v6"/></svg>`
  },
  {
    id: 'psychiatry',
    categoryId: 'healthcare',
    names: {
      uz: "Psixiatriya",
      ru: "Психиатрия",
      en: "Psychiatry"
    },
    aliases: ['psixiatriya', 'ruhiy salomatlik', 'psychiatry', 'mental health', 'психиатрия'],
    defaultColor: '#6366f1',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M5 8v5a7 7 0 0 0 14 0V8"/><line x1="8" y1="22" x2="16" y2="22"/><line x1="4" y1="8" x2="6" y2="8"/><line x1="18" y1="8" x2="20" y2="8"/></svg>`
  },
  {
    id: 'physiotherapy',
    categoryId: 'healthcare',
    names: {
      uz: "Fizioterapiya",
      ru: "Физиотерапия и реабилитация",
      en: "Physiotherapy & Rehabilitation"
    },
    aliases: ['fizioterapiya', 'reabilitatsiya', 'davolash jismoniy tarbiyasi', 'physiotherapy', 'physical therapy', 'физиотерапия', 'реабилитация'],
    defaultColor: '#0ea5e9',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="m5 9 4-1 3 4 3-2 4 3"/><path d="m9 12-2 9"/><path d="m12 15 3 7"/></svg>`
  },
  {
    id: 'nutrition',
    categoryId: 'healthcare',
    names: {
      uz: "Ozuqalanish va dietologiya (Nutrition)",
      ru: "Нутрициология и диетология",
      en: "Nutrition & Dietetics"
    },
    aliases: ['ozuqalanish va dietologiya', 'nutrition', 'dietologiya', 'soglom ovqatlanish', 'parhez', 'нутрициология', 'диетология'],
    defaultColor: '#84cc16',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.94c1.88-1.1 4-3.54 4-7.94a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 4.4 2.12 6.84 4 7.94"/><path d="M12 3a3 3 0 0 0 3 3h1"/><path d="M12 7v13"/></svg>`
  },
  {
    id: 'veterinary',
    categoryId: 'healthcare',
    names: {
      uz: "Veterinariya",
      ru: "Ветеринария",
      en: "Veterinary Medicine"
    },
    aliases: ['veterinariya', 'veterinar', 'hayvonlar shifokori', 'veterinary', 'vet', 'ветеринария'],
    defaultColor: '#d97706',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 0-5 5v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a5 5 0 0 0-5-5Z"/><path d="M7 16h4"/><path d="M9 14v4"/></svg>`
  }
];
