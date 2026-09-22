export const HUMANITIES_SUBJECTS = [
  {
    id: 'history',
    categoryId: 'humanities',
    names: {
      uz: "Tarix",
      ru: "История",
      en: "History"
    },
    aliases: ['tarix', 'jahon tarixi', 'ozbekiston tarixi', 'o\'zbekiston tarixi', 'qadimgi dunyo', 'history', 'история', 'всемирная история'],
    defaultColor: '#d97706',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`
  },
  {
    id: 'philosophy',
    categoryId: 'humanities',
    names: {
      uz: "Falsafa",
      ru: "Философия",
      en: "Philosophy"
    },
    aliases: ['falsafa', 'falsafiy tafakkur', 'mantiq', 'etika', 'philosophy', 'философия', 'логика'],
    defaultColor: '#8b5cf6',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16"/><path d="M6 4v16"/><path d="M10 4v16"/><path d="M14 4v16"/><path d="M18 4v16"/><path d="M4 20h16"/><path d="M2 22h20"/><path d="M2 2h20"/></svg>`
  },
  {
    id: 'religious_studies',
    categoryId: 'humanities',
    names: {
      uz: "Din tarixi va diniyot",
      ru: "Религиоведение и теология",
      en: "Religious Studies & Theology"
    },
    aliases: ['din tarixi va diniyot', 'dinshunoslik', 'islomshunoslik', 'teologiya', 'din', 'religious studies', 'theology', 'религиоведение', 'теология'],
    defaultColor: '#059669',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/><path d="M12 3v4"/><circle cx="12" cy="2" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'literature',
    categoryId: 'humanities',
    names: {
      uz: "Adabiyot",
      ru: "Литература",
      en: "Literature"
    },
    aliases: ['adabiyot', 'badiiy adabiyot', 'ozbek adabiyoti', 'o\'zbek adabiyoti', 'jahon adabiyoti', 'literature', 'литература'],
    defaultColor: '#ef4444',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4-12 12H6v-4L18 2Z"/><path d="m15 5 3 3"/><path d="M2 22h20"/></svg>`
  },
  {
    id: 'linguistics',
    categoryId: 'humanities',
    names: {
      uz: "Tilshunoslik",
      ru: "Лингвистика и языкознание",
      en: "Linguistics"
    },
    aliases: ['tilshunoslik', 'lingvistika', 'filologiya', 'grammatika', 'linguistics', 'лингвистика', 'языкознание'],
    defaultColor: '#0284c7',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.4 3h3.2l6.2 18h-2.9l-1.6-6H8.7l-1.6 6H4.2L10.4 3Zm1.6 4.2 1.8 5.6h-3.6l1.8-5.6Z"/></svg>`
  },
  {
    id: 'archaeology',
    categoryId: 'humanities',
    names: {
      uz: "Arxeologiya",
      ru: "Археология",
      en: "Archaeology"
    },
    aliases: ['arxeologiya', 'qazilmalar', 'qadimgi buyumlar', 'archaeology', 'археология'],
    defaultColor: '#b45309',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.2 3.2 12.5 6.8c1 .4 1.3 1.8.4 2.4l-3.7 3.7c-.6.9-2 .6-2.4-.4L3.2 4.2c-.3-.9.4-1.6 1-1Z"/><path d="m11 11 3.5 3.5"/><path d="m13.4 15.6 2.2-2.2 4 4a1.55 1.55 0 0 1-2.2 2.2Z"/></svg>`
  },
  {
    id: 'cultural_studies',
    categoryId: 'humanities',
    names: {
      uz: "Madaniyatshunoslik",
      ru: "Культурология",
      en: "Cultural Studies"
    },
    aliases: ['madaniyatshunoslik', 'kulturologiya', 'madaniyat', 'cultural studies', 'культурология'],
    defaultColor: '#db2777',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 3.8C8 5.4 12 5.8 12 5.8s4-.4 6.5-2c1.3.8 2 3 1.8 6-.3 5-2.5 9.5-8.3 11.7C6.2 19.3 4 14.8 3.7 9.8c-.2-3 .5-5.2 1.8-6Z"/><path d="M7.2 11.2c.7-1.8 2.5-1.8 3.2 0" stroke-width="2.4"/><path d="M13.6 11.2c.7-1.8 2.5-1.8 3.2 0" stroke-width="2.4"/><path d="M8.8 15.2c1.2 2.6 5.2 2.6 6.4 0" stroke-width="2.4"/></svg>`
  }
];
