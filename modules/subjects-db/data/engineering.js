export const ENGINEERING_SUBJECTS = [
  {
    id: 'electrical_eng',
    categoryId: 'engineering',
    names: {
      uz: "Elektrotexnika muhandisligi",
      ru: "Электротехника (Инженерия)",
      en: "Electrical Engineering"
    },
    aliases: ['elektrotexnika muhandisligi', 'elektrotexnika', 'elektronika', 'sxemotexnika', 'electrical engineering', 'электротехника', 'электроинженерия'],
    defaultColor: '#eab308',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>`
  },
  {
    id: 'mechanical_eng',
    categoryId: 'engineering',
    names: {
      uz: "Mexanika muhandisligi",
      ru: "Механическая инженерия",
      en: "Mechanical Engineering"
    },
    aliases: ['mexanika muhandisligi', 'mexanika', 'mashinasozlik', 'mechanical engineering', 'механика', 'машиностроение'],
    defaultColor: '#64748b',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
  },
  {
    id: 'civil_eng',
    categoryId: 'engineering',
    names: {
      uz: "Fuqarolik (qurilish) muhandisligi",
      ru: "Гражданская и строительная инженерия",
      en: "Civil & Structural Engineering"
    },
    aliases: ['fuqarolik muhandisligi', 'qurilish muhandisligi', 'qurilish', 'bino loyihalash', 'civil engineering', 'строительная инженерия', 'гражданское строительство'],
    defaultColor: '#f97316',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`
  },
  {
    id: 'chemical_eng',
    categoryId: 'engineering',
    names: {
      uz: "Kimyoviy muhandislik",
      ru: "Химическая инженерия",
      en: "Chemical Engineering"
    },
    aliases: ['kimyoviy muhandislik', 'kimyo muhandisligi', 'neft-gaz', 'chemical engineering', 'химическая инженерия', 'нефтехимия'],
    defaultColor: '#0284c7',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v6l3 4v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8l3-4V2"/><path d="M4 2h16"/><path d="M9 16h6"/><circle cx="10" cy="19" r="1" fill="currentColor"/><circle cx="14" cy="18" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'aerospace_eng',
    categoryId: 'engineering',
    names: {
      uz: "Aerokosmik muhandislik",
      ru: "Аэрокосмическая инженерия",
      en: "Aerospace Engineering"
    },
    aliases: ['aerokosmik muhandislik', 'aerokosmik', 'aviatsiya', 'raketasozlik', 'aerospace engineering', 'аэрокосмическая инженерия', 'ракетостроение', 'авиастроение'],
    defaultColor: '#3b82f6',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`
  },
  {
    id: 'automotive_eng',
    categoryId: 'engineering',
    names: {
      uz: "Avtomobilsozlik muhandisligi",
      ru: "Автомобильная инженерия (Автопром)",
      en: "Automotive Engineering"
    },
    aliases: ['avtomobilsozlik muhandisligi', 'avtomobilsozlik', 'avtomobil', 'automotive engineering', 'mashinasozlik', 'автомобилестроение', 'автопром'],
    defaultColor: '#dc2626',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.7 2 11.3 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`
  },
  {
    id: 'energy_eng',
    categoryId: 'engineering',
    names: {
      uz: "Energetika muhandisligi",
      ru: "Энергетическая инженерия",
      en: "Energy & Power Engineering"
    },
    aliases: ['energetika muhandisligi', 'energetika', 'quyosh energiyasi', 'shamol energiyasi', 'energy engineering', 'power engineering', 'энергетика'],
    defaultColor: '#10b981',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M12 12l5-5a4 4 0 0 1-5.66-5.66L12 2v10z"/><path d="M12 12l-5 5a4 4 0 0 1 5.66 5.66L12 22V12z"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>`
  },
  {
    id: 'biomedical_eng',
    categoryId: 'engineering',
    names: {
      uz: "Biotibbiy muhandislik",
      ru: "Биомедицинская инженерия",
      en: "Biomedical Engineering"
    },
    aliases: ['biotibbiy muhandislik', 'biomedical engineering', 'biotibbiyot', 'protezlar', 'биомедицинская инженерия', 'биоинженерия'],
    defaultColor: '#ec4899',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h6.28"/></svg>`
  }
];
