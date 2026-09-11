export const BUSINESS_SUBJECTS = [
  {
    id: 'economics',
    categoryId: 'business',
    names: {
      uz: "Iqtisodiyot",
      ru: "Экономика",
      en: "Economics"
    },
    aliases: ['iqtisodiyot', 'makroiqtisodiyot', 'mikroiqtisodiyot', 'iqtisod', 'economics', 'economy', 'экономика'],
    defaultColor: '#059669',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/><path d="M19 14V9h-5"/></svg>`
  },
  {
    id: 'mba',
    categoryId: 'business',
    names: {
      uz: "Biznes boshqaruvi (MBA)",
      ru: "Бизнес-администрирование (MBA)",
      en: "Business Administration (MBA)"
    },
    aliases: ['biznes boshqaruvi', 'mba', 'biznes', 'business administration', 'бизнес-администрирование', 'управление бизнесом'],
    defaultColor: '#3b82f6',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
  },
  {
    id: 'marketing',
    categoryId: 'business',
    names: {
      uz: "Marketing",
      ru: "Маркетинг",
      en: "Marketing & Advertising"
    },
    aliases: ['marketing', 'raqamli marketing', 'smm', 'brending', 'reklama', 'marketing', 'smm', 'маркетинг', 'реклама'],
    defaultColor: '#f43f5e',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`
  },
  {
    id: 'finance',
    categoryId: 'business',
    names: {
      uz: "Moliya",
      ru: "Финансы и инвестиции",
      en: "Finance & Banking"
    },
    aliases: ['moliya', 'investitsiya', 'bank ishi', 'kapital', 'finance', 'banking', 'финансы', 'инвестиции'],
    defaultColor: '#eab308',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M15 9.5a2.5 2.5 0 0 0-5 0c0 3 5 2 5 5a2.5 2.5 0 0 1-5 0"/></svg>`
  },
  {
    id: 'accounting',
    categoryId: 'business',
    names: {
      uz: "Buxgalteriya hisobi",
      ru: "Бухгалтерский учет и аудит",
      en: "Accounting & Auditing"
    },
    aliases: ['buxgalteriya hisobi', 'buxgalteriya', 'audit', 'soliq', 'accounting', 'auditing', 'бухгалтерия', 'бухучет', 'аудит'],
    defaultColor: '#0284c7',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16.01" y1="14" y2="14"/><line x1="16" x2="16.01" y1="18" y2="18"/><line x1="12" x2="12.01" y1="10" y2="10"/><line x1="12" x2="12.01" y1="14" y2="14"/><line x1="12" x2="12.01" y1="18" y2="18"/><line x1="8" x2="8.01" y1="10" y2="10"/><line x1="8" x2="8.01" y1="14" y2="14"/><line x1="8" x2="8.01" y1="18" y2="18"/></svg>`
  },
  {
    id: 'management',
    categoryId: 'business',
    names: {
      uz: "Menejment",
      ru: "Менеджмент и управление",
      en: "Management & Leadership"
    },
    aliases: ['menejment', 'yetakchilik', 'boshqaruv', 'hr', 'management', 'leadership', 'менеджмент', 'управление'],
    defaultColor: '#6366f1',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  {
    id: 'entrepreneurship',
    categoryId: 'business',
    names: {
      uz: "Tadbirkorlik (Entrepreneurship)",
      ru: "Предпринимательство (Стартапы)",
      en: "Entrepreneurship & Startups"
    },
    aliases: ['tadbirkorlik', 'startap', 'startup', 'biznes boshlash', 'entrepreneurship', 'предпринимательство', 'стартап'],
    defaultColor: '#f97316',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>`
  },
  {
    id: 'international_trade',
    categoryId: 'business',
    names: {
      uz: "Xalqaro savdo",
      ru: "Международная торговля (ВЭД)",
      en: "International Trade & Commerce"
    },
    aliases: ['xalqaro savdo', 'eksport-import', 'eksport', 'import', 'bojxona', 'logistika', 'international trade', 'международная торговля', 'вэд'],
    defaultColor: '#0ea5e9',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/><path d="m15 9 3 3-3 3"/><path d="m9 15-3-3 3-3"/></svg>`
  },
  {
    id: 'project_management',
    categoryId: 'business',
    names: {
      uz: "Loyihalarni boshqarish",
      ru: "Управление проектами (PM)",
      en: "Project Management"
    },
    aliases: ['loyihalarni boshqarish', 'project management', 'agile', 'scrum', 'pmp', 'kanban', 'управление проектами'],
    defaultColor: '#8b5cf6',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>`
  }
];
