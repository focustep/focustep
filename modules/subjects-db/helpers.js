import { standardIcons } from './standard-icons.js';

// Search helper function across UZ, RU, and EN
export function findMatchingSubjects(query, subjectsDatabase) {
  if (!query || !query.trim() || !subjectsDatabase) return [];
  const q = query.trim().toLowerCase();
  
  return subjectsDatabase.filter(item => {
    // Check in names
    if (item.names && (
      (item.names.uz && item.names.uz.toLowerCase().includes(q)) ||
      (item.names.ru && item.names.ru.toLowerCase().includes(q)) ||
      (item.names.en && item.names.en.toLowerCase().includes(q))
    )) return true;
    // Check in aliases
    if (item.aliases && item.aliases.some(a => a.includes(q) || q.includes(a))) return true;
    return false;
  });
}

// Find single exact or best match
export function getSubjectByMatch(name, subjectsDatabase) {
  if (!name || !name.trim() || !subjectsDatabase) return null;
  const q = name.trim().toLowerCase();
  
  // Exact match
  const exact = subjectsDatabase.find(item => 
    (item.id && item.id.toLowerCase() === q) ||
    (item.names && (
      (item.names.uz && item.names.uz.toLowerCase() === q) ||
      (item.names.ru && item.names.ru.toLowerCase() === q) ||
      (item.names.en && item.names.en.toLowerCase() === q)
    )) ||
    (item.aliases && item.aliases.includes(q))
  );
  if (exact) return exact;

  // Best partial match
  const matches = findMatchingSubjects(name, subjectsDatabase);
  return matches.length > 0 ? matches[0] : null;
}

// Localize subject name according to current language (uz, ru, en)
export function getSubjectLocalizedName(subject, lang = 'uz', subjectsDatabase = []) {
  if (!subject) return '';
  const l = (lang === 'ru' || lang === 'en') ? lang : 'uz';

  // 1. If subject is a string (id or name)
  if (typeof subject === 'string') {
    const sLower = subject.toLowerCase().trim();
    if (sLower === 'other' || sLower.includes('boshqa') || sLower.includes('другое')) {
      const otherNames = { uz: "Boshqa", ru: "Другое", en: "Other" };
      return otherNames[l];
    }
    if (sLower === 'math' || sLower === 'mathematics') {
      const mathNames = { uz: "Matematika", ru: "Математика", en: "Math" };
      return mathNames[l];
    }
    if (sLower === 'english' || sLower === 'english_lang') {
      const engNames = { uz: "Ingliz tili", ru: "Английский язык", en: "English" };
      return engNames[l];
    }
    if (sLower === 'physics') {
      const physNames = { uz: "Fizika", ru: "Физика", en: "Physics" };
      return physNames[l];
    }
    if (subjectsDatabase && subjectsDatabase.length > 0) {
      const found = subjectsDatabase.find(s => s.id === subject || s.id === sLower) || getSubjectByMatch(subject, subjectsDatabase);
      if (found && found.names) {
        return found.names[l] || found.names.uz || subject;
      }
    }
    return subject;
  }

  // 2. Direct .names property on subject object
  if (subject.names && typeof subject.names === 'object') {
    if (subject.names[l]) return subject.names[l];
    if (subject.names.uz) return subject.names.uz;
  }

  // Built-in special cases
  if (subject.id === 'other' || (subject.name && subject.name.toLowerCase() === 'other')) {
    const otherNames = { uz: "Boshqa", ru: "Другое", en: "Other" };
    return otherNames[l];
  }
  if (subject.id === 'math' || subject.id === 'mathematics') {
    const mathNames = { uz: "Matematika", ru: "Математика", en: "Math" };
    return mathNames[l];
  }
  if (subject.id === 'english' || subject.id === 'english_lang') {
    const engNames = { uz: "Ingliz tili", ru: "Английский язык", en: "English" };
    return engNames[l];
  }
  if (subject.id === 'physics') {
    const physNames = { uz: "Fizika", ru: "Физика", en: "Physics" };
    return physNames[l];
  }

  // 3. Match from database by id or icon
  if (subjectsDatabase && subjectsDatabase.length > 0) {
    const byIdOrIcon = subjectsDatabase.find(s => 
      s.id === subject.id || 
      (subject.icon && s.id === subject.icon)
    );
    if (byIdOrIcon && byIdOrIcon.names) {
      return byIdOrIcon.names[l] || byIdOrIcon.names.uz || subject.name;
    }

    // 4. Match from database by name or alias
    if (subject.name) {
      const byName = getSubjectByMatch(subject.name, subjectsDatabase);
      if (byName && byName.names) {
        return byName.names[l] || byName.names.uz || subject.name;
      }
    }
  }

  return subject.name || subject.id || '';
}

// Get SVG by icon ID or subject ID
export function getSubjectSvg(iconOrSubjectId, subjectsDatabase) {
  if (!iconOrSubjectId) return null;
  
  // Check in subjects database
  if (subjectsDatabase) {
    const foundSubj = subjectsDatabase.find(s => s.id === iconOrSubjectId);
    if (foundSubj) return foundSubj.svg;
  }

  return standardIcons[iconOrSubjectId] || null;
}
