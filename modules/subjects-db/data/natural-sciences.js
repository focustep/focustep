export const NATURAL_SCIENCES_SUBJECTS = [
  {
    id: 'mathematics',
    categoryId: 'natural_sciences',
    names: {
      uz: "Matematika",
      ru: "Математика",
      en: "Mathematics"
    },
    aliases: ['matematika', 'algebra', 'geometriya', 'oliy matematika', 'math', 'mathematics', 'математика', 'алгебра', 'геометрия'],
    defaultColor: '#7c3aed',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`
  },
  {
    id: 'physics',
    categoryId: 'natural_sciences',
    names: {
      uz: "Fizika",
      ru: "Физика",
      en: "Physics"
    },
    aliases: ['fizika', 'physics', 'kvant fizikasi', 'mexanika', 'физика'],
    defaultColor: '#10b981',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.5" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)"/></svg>`
  },
  {
    id: 'chemistry',
    categoryId: 'natural_sciences',
    names: {
      uz: "Kimyo",
      ru: "Химия",
      en: "Chemistry"
    },
    aliases: ['kimyo', 'chemistry', 'organik kimyo', 'anorganik kimyo', 'химия'],
    defaultColor: '#06b6d4',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V2"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/><circle cx="10" cy="19" r="1" fill="currentColor"/><circle cx="14" cy="18" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'biology',
    categoryId: 'natural_sciences',
    names: {
      uz: "Biologiya",
      ru: "Биология",
      en: "Biology"
    },
    aliases: ['biologiya', 'biology', 'botanika', 'zoologiya', 'биология'],
    defaultColor: '#84cc16',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`
  },
  {
    id: 'astronomy',
    categoryId: 'natural_sciences',
    names: {
      uz: "Astronomiya",
      ru: "Астрономия",
      en: "Astronomy"
    },
    aliases: ['astronomiya', 'astronomy', 'astrofizika', 'kosmos', 'space', 'астрономия'],
    defaultColor: '#6366f1',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6"/><ellipse cx="12" cy="12" rx="11" ry="3.5" transform="rotate(-25 12 12)"/><path d="M19 4l.5 1.5L21 6l-1.5.5L19 8l-.5-1.5L17 6l1.5-.5z"/><circle cx="5" cy="5" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'geology',
    categoryId: 'natural_sciences',
    names: {
      uz: "Geologiya",
      ru: "Геология",
      en: "Geology"
    },
    aliases: ['geologiya', 'geology', 'minerologiya', 'geofizika', 'геология'],
    defaultColor: '#d97706',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="M4.14 15h15.72"/><path d="M6.5 11h6.5"/></svg>`
  },
  {
    id: 'ecology',
    categoryId: 'natural_sciences',
    names: {
      uz: "Ekologiya",
      ru: "Экология",
      en: "Ecology"
    },
    aliases: ['ekologiya', 'ecology', 'atrof-muhit', 'tabiat', 'экология'],
    defaultColor: '#059669',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7c2.5 0 4.5 2 4.5 4.5S14.5 16 12 16"/><path d="M12 16v3"/><path d="M9.5 13.5C9.5 11.5 10.5 9 12 7"/></svg>`
  },
  {
    id: 'genetics',
    categoryId: 'natural_sciences',
    names: {
      uz: "Genetika",
      ru: "Генетика",
      en: "Genetics"
    },
    aliases: ['genetika', 'genetics', 'dnk', 'dna', 'genomika', 'генетика'],
    defaultColor: '#db2777',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="M17 6l-2.5-2.5"/><path d="M14 8l-1-1"/><path d="M7 18l2.5 2.5"/><path d="M3.5 14.5l1.5 1.5"/><path d="M20 9.5l-1.5-1.5"/></svg>`
  },
  {
    id: 'neurobiology',
    categoryId: 'natural_sciences',
    names: {
      uz: "Neyrobiologiya",
      ru: "Нейробиология",
      en: "Neurobiology"
    },
    aliases: ['neyrobiologiya', 'neurobiology', 'neuroscience', 'neyroilm', 'miya', 'нейробиология'],
    defaultColor: '#9333ea',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/></svg>`
  },
  {
    id: 'statistics',
    categoryId: 'natural_sciences',
    names: {
      uz: "Statistika",
      ru: "Статистика",
      en: "Statistics"
    },
    aliases: ['statistika', 'statistics', 'stats', 'ehtimollar nazariyasi', 'статистика'],
    defaultColor: '#ea580c',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/><path d="M4 11l4-3 5 5 6-7"/></svg>`
  }
];
