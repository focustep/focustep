export const ARTS_SUBJECTS = [
  {
    id: 'music',
    categoryId: 'arts',
    names: {
      uz: "Musiqa (nazariya, ijro, prodyuserlik)",
      ru: "Музыка (теория, исполнение, продакшн)",
      en: "Music (Theory, Performance & Production)"
    },
    aliases: ['musiqa', 'fortepiano', 'gitara', 'vokal', 'solfedjio', 'musiqa nazariyasi', 'musiqiy prodakshn', 'music', 'музыка', 'вокал', 'сольфеджио', 'битмейкинг'],
    defaultColor: '#ec4899',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`
  },
  {
    id: 'filmmaking',
    categoryId: 'arts',
    names: {
      uz: "Kino va videoprodyuserlik",
      ru: "Кино и видеопроизводство (Режиссура)",
      en: "Film & Video Production (Cinematography)"
    },
    aliases: ['kino va videoprodyuserlik', 'kino', 'videoprodyuserlik', 'rejissura', 'operatorlik', 'montaj', 'kinematografiya', 'film', 'filmmaking', 'кино', 'видеомонтаж', 'режиссура'],
    defaultColor: '#f43f5e',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.8 17.2-5.1z"/><path d="M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"/><path d="m9.5 13.5 6 3.5-6 3.5v-7z"/></svg>`
  },
  {
    id: 'graphic_design',
    categoryId: 'arts',
    names: {
      uz: "Grafik dizayn",
      ru: "Графический дизайн",
      en: "Graphic Design"
    },
    aliases: ['grafik dizayn', 'photoshop', 'illustrator', 'banner', 'vektor', 'graphic design', 'графический дизайн', 'дизайн'],
    defaultColor: '#a855f7',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="6.5" cy="6.5" r="1.5"/></svg>`
  },
  {
    id: 'fine_arts',
    categoryId: 'arts',
    names: {
      uz: "Rassomchilik (Fine Arts)",
      ru: "Изобразительное искусство (Живопись)",
      en: "Fine Arts & Painting"
    },
    aliases: ['rassomchilik', 'tasviriy sanat', 'tasviriy san\'at', 'rangtasvir', 'chizmachilik', 'akvarel', 'fine arts', 'painting', 'живопись', 'изобразительное искусство', 'рисование'],
    defaultColor: '#f59e0b',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`
  },
  {
    id: 'photography',
    categoryId: 'arts',
    names: {
      uz: "Fotografiya",
      ru: "Фотография (Фотоискусство)",
      en: "Photography & Photo Editing"
    },
    aliases: ['fotografiya', 'fotosurat', 'foto', 'mobilografiya', 'photography', 'photo', 'фотография', 'фото'],
    defaultColor: '#0ea5e9',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`
  },
  {
    id: 'dance_choreography',
    categoryId: 'arts',
    names: {
      uz: "Raqs va xoreografiya",
      ru: "Танец и хореография",
      en: "Dance & Choreography"
    },
    aliases: ['raqs va xoreografiya', 'raqs', 'xoreografiya', 'balet', 'zamonaviy raqs', 'dance', 'choreography', 'танцы', 'хореография'],
    defaultColor: '#e11d48',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="m9 20 3-6 4 2 3-5"/><path d="m6 8 6 2 3-3 5 2"/><path d="M12 14l-3 6"/></svg>`
  },
  {
    id: 'theatre_arts',
    categoryId: 'arts',
    names: {
      uz: "Teatr san'ati",
      ru: "Театральное искусство (Актерское мастерство)",
      en: "Theatre Arts & Acting"
    },
    aliases: ['teatr sanati', 'teatr san\'ati', 'teatr', 'aktyorlik', 'sahna nutqi', 'dramaturgiya', 'theatre', 'acting', 'театр', 'актерское мастерство'],
    defaultColor: '#d97706',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="7"/><path d="M7 8h.01"/><path d="M11 8h.01"/><path d="M7 11c.5 1.2 2.5 1.2 3 0"/><path d="M17 10c2.5.5 4.5 2.5 4.5 5.5s-2 5.5-5.5 5.5c-1.2 0-2.3-.4-3.2-1"/><path d="M18 14h.01"/><path d="M16 17c.5-.8 1.8-.8 2.3 0"/></svg>`
  },
  {
    id: 'architecture',
    categoryId: 'arts',
    names: {
      uz: "Arxitektura",
      ru: "Архитектура и градостроительство",
      en: "Architecture & Urban Design"
    },
    aliases: ['arxitektura', 'bino loyihalash', 'shaharsozlik', 'interyer dizayn', 'architecture', 'архитектура', 'интерьер'],
    defaultColor: '#6366f1',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 10h6"/><path d="M9 14h6"/><path d="M9 18h6"/></svg>`
  },
  {
    id: 'fashion_design',
    categoryId: 'arts',
    names: {
      uz: "Moda dizayni",
      ru: "Дизайн одежды и мода",
      en: "Fashion Design & Styling"
    },
    aliases: ['moda dizayni', 'kiyim dizayni', 'moda', 'modeler', 'fashion design', 'fashion', 'дизайн одежды', 'мода'],
    defaultColor: '#db2777',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3a4 4 0 0 0-8 0v2"/><path d="M3 11 12 7l9 4-3 10H6L3 11z"/><path d="M9 11v10"/><path d="M15 11v10"/></svg>`
  },
  {
    id: 'animation_3d',
    categoryId: 'arts',
    names: {
      uz: "Animatsiya va 3D-modellashtirish",
      ru: "Анимация и 3D-моделирование",
      en: "Animation & 3D Modeling (CGI)"
    },
    aliases: ['animatsiya', '3d-modellashtirish', '3d', 'blender', 'maya', 'motion design', 'animation', '3d modeling', 'анимация', '3d-моделирование'],
    defaultColor: '#10b981',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 8-9-5-9 5v8l9 5 9-5V8z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v9"/></svg>`
  },
  {
    id: 'creative_writing',
    categoryId: 'arts',
    names: {
      uz: "Yozuvchilik (Creative Writing) / kontent yaratish",
      ru: "Креативное писательство и копирайтинг",
      en: "Creative Writing & Content Creation"
    },
    aliases: ['yozuvchilik', 'creative writing', 'kontent yaratish', 'kopirayting', 'senariy', 'bloging', 'копирайтинг', 'писательство', 'сценарий'],
    defaultColor: '#8b5cf6',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/><path d="m15 5 4 4"/></svg>`
  }
];
