export const HEALTHCARE_SUBJECTS = [
  {
    id: 'medicine',
    categoryId: 'healthcare',
    names: {
      uz: "Tibbiyot (Medicine)",
      ru: "Медицина (Medicine)",
      en: "Medicine"
    },
    aliases: ['umumiy tibbiyot', 'tibbiyot', 'davolash ishi', 'shifokor', 'doktor', 'terapiya', 'jarrohlik', 'medicine', 'общая медицина', 'лечебное дело'],
    defaultColor: '#ef4444',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 5C5 3.2 3.5 5 3.5 7.5l3.3 8a6 6 0 0 0 10.4 0l3.3-8c0-2.5-1.5-4.3-3-2.5"/><circle cx="7.5" cy="4" r="1.4"/><circle cx="16.5" cy="4" r="1.4"/><path d="M12 18.2V23.5"/></svg>`
  },
  {
    id: 'dentistry',
    categoryId: 'healthcare',
    names: {
      uz: "Stomatologiya (Dental)",
      ru: "Стоматология (Dental)",
      en: "Dentistry"
    },
    aliases: ['stomatologiya', 'tish', 'tish shifokori', 'dentistry', 'dental', 'ortodontiya', 'стоматология', 'зубной'],
    defaultColor: '#06b6d4',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.8c-2.5-1.6-5.5-1.6-7.5.7-2 2.3-2 5-.5 6.5l1.5 6.5c.5 2.3 1.5 4.3 3 4.3s2-2.8 2.5-6.8c.3-1.8 1.7-1.8 2 0 .5 4 1 6.8 2.5 6.8s2.5-2 3-4.3l1.5-6.5c1.5-1.5 1.5-4.2-.5-6.5-2-2.3-5-2.3-7.5-.7Z"/></svg>`
  },
  {
    id: 'pharmacy',
    categoryId: 'healthcare',
    names: {
      uz: "Farmatsevtika (Pharmacy)",
      ru: "Фармацевтика (Pharmacy)",
      en: "Pharmacy"
    },
    aliases: ['farmatsevtika', 'farmakologiya', 'dori', 'dorishunoslik', 'apteka', 'pharmacy', 'pharmacology', 'фармацевтика', 'фармакология'],
    defaultColor: '#10b981',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9.5 17.5 6a3.2 3.2 0 0 0-4.5-4.5L3.5 11a3.2 3.2 0 0 0 4.5 4.5L10.5 13"/><path d="m7.8 5.8 4.7 4.7"/><circle cx="15.8" cy="15.8" r="5.5"/><path d="m11.9 17.8 7.8-4"/></svg>`
  },
  {
    id: 'nursing',
    categoryId: 'healthcare',
    names: {
      uz: "Hamshiralik (Nursing)",
      ru: "Сестринское дело (Nursing)",
      en: "Nursing"
    },
    aliases: ['hamshiralik ishi', 'hamshira', 'medsestra', 'tibbiy parvarish', 'nursing', 'сестринское дело'],
    defaultColor: '#f43f5e',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 7v6"/><path d="M9 10h6"/></svg>`
  },
  {
    id: 'psychology',
    categoryId: 'healthcare',
    names: {
      uz: "Psixologiya (Psychology)",
      ru: "Психология (Psychology)",
      en: "Psychology"
    },
    aliases: ['psixologiya', 'ruhshunoslik', 'kognitiv psixologiya', 'psychology', 'психология'],
    defaultColor: '#8b5cf6',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M5 8v5a7 7 0 0 0 14 0V8"/><line x1="8" y1="22" x2="16" y2="22"/><line x1="4" y1="8" x2="6" y2="8"/><line x1="18" y1="8" x2="20" y2="8"/></svg>`
  },
  {
    id: 'nutrition',
    categoryId: 'healthcare',
    names: {
      uz: "Nutritsiologiya (Nutrition)",
      ru: "Нутрициология (Nutrition)",
      en: "Nutrition & Diet"
    },
    aliases: ['ozuqalanish va dietologiya', 'nutrition', 'dietologiya', 'soglom ovqatlanish', 'parhez', 'nutritsiologiya', 'нутрициология', 'диетология'],
    defaultColor: '#84cc16',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7.5c-1.8-2-5.5-2-7.8.8-2.5 3-2 8 .8 11.2 2.2 2.5 5 2.5 7 1 2 1.5 4.8 1.5 7-1 2.8-3.2 3.3-8.2.8-11.2-2.3-2.8-6-2.8-7.8-.8Z"/><path d="M12 7.5c-.8-2.5-2.5-4.2-4.8-4.8"/><path d="M12 7.2c1.2-2.8 3.5-4.2 5.5-4.2 0 2.5-1.5 4.8-5.5 4.2Z"/></svg>`
  },
  {
    id: 'veterinary',
    categoryId: 'healthcare',
    names: {
      uz: "Veterinariya (Vet)",
      ru: "Ветеринария (Vet)",
      en: "Veterinary"
    },
    aliases: ['veterinariya', 'veterinar', 'hayvonlar shifokori', 'veterinary', 'vet', 'ветеринария'],
    defaultColor: '#d97706',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11.5c-4.5 0-7.5 3-7.5 6.5 0 2.5 2 4 4.5 4 1.8 0 2.5-1.5 3-1.5s1.2 1.5 3 1.5c2.5 0 4.5-1.5 4.5-4 0-3.5-3-6.5-7.5-6.5Z"/><ellipse cx="3.8" cy="11.8" rx="2" ry="3.2" transform="rotate(-15 3.8 11.8)"/><ellipse cx="8.5" cy="5.8" rx="2.3" ry="3.8" transform="rotate(-5 8.5 5.8)"/><ellipse cx="15.5" cy="5.8" rx="2.3" ry="3.8" transform="rotate(5 15.5 5.8)"/><ellipse cx="20.2" cy="11.8" rx="2" ry="3.2" transform="rotate(15 20.2 11.8)"/></svg>`
  }
];
