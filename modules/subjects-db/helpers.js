import { standardIcons } from './standard-icons.js';

// Search helper function across UZ, RU, and EN
export function findMatchingSubjects(query, subjectsDatabase) {
  if (!query || !query.trim() || !subjectsDatabase) return [];
  const q = query.trim().toLowerCase();
  
  return subjectsDatabase.filter(item => {
    // Check in names
    if (item.names.uz.toLowerCase().includes(q)) return true;
    if (item.names.ru.toLowerCase().includes(q)) return true;
    if (item.names.en.toLowerCase().includes(q)) return true;
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
    item.names.uz.toLowerCase() === q ||
    item.names.ru.toLowerCase() === q ||
    item.names.en.toLowerCase() === q ||
    (item.aliases && item.aliases.includes(q))
  );
  if (exact) return exact;

  // Best partial match
  const matches = findMatchingSubjects(name, subjectsDatabase);
  return matches.length > 0 ? matches[0] : null;
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
