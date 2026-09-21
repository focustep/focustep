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
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10.8 1.5h2.4v2.05c2.8.3 4.8 1.8 5.6 4.15l-2.6 1.1c-.5-1.4-1.6-2.2-3-2.35v5.3c3.2.8 5.5 2.1 5.5 5.25 0 2.8-2.2 4.6-5.5 5.05v2.45h-2.4v-2.4c-2.9-.35-5-2-5.8-4.55l2.6-1.1c.5 1.6 1.7 2.6 3.2 2.75v-5.45c-3.2-.8-5.5-2.1-5.5-5.15 0-2.8 2.2-4.5 5.5-4.95V1.5Zm0 5.1c-1.4.3-2.3 1.1-2.3 2.15 0 1.05.8 1.7 2.3 2.1v-4.25Zm2.4 7.6v4.35c1.5-.3 2.4-1.2 2.4-2.25 0-1.1-.9-1.7-2.4-2.1Z"/></svg>`
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
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 3.5A9 9 0 1 0 20.8 11.8"/><path d="m7.5 11.5 4 4.5 8.5-11"/></svg>`
  }
];
