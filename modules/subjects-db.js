import { SUBJECT_CATEGORIES } from './subjects-db/categories.js';
import { TECH_SUBJECTS } from './subjects-db/data/tech.js';
import { NATURAL_SCIENCES_SUBJECTS } from './subjects-db/data/natural-sciences.js';
import { PERSONAL_DEVELOPMENT_SUBJECTS } from './subjects-db/data/personal-development.js';
import { HEALTHCARE_SUBJECTS } from './subjects-db/data/healthcare.js';
import { BUSINESS_SUBJECTS } from './subjects-db/data/business.js';
import { SOCIAL_SCIENCES_SUBJECTS } from './subjects-db/data/social-sciences.js';
import { HUMANITIES_SUBJECTS } from './subjects-db/data/humanities.js';
import { LANGUAGES_SUBJECTS } from './subjects-db/data/languages.js';
import { ARTS_SUBJECTS } from './subjects-db/data/arts.js';
import { EMERGING_SUBJECTS } from './subjects-db/data/emerging.js';
import { standardIcons } from './subjects-db/standard-icons.js';
import { 
  findMatchingSubjects as findMatchingSubjectsHelper, 
  getSubjectByMatch as getSubjectByMatchHelper, 
  getSubjectSvg as getSubjectSvgHelper,
  getSubjectLocalizedName as getSubjectLocalizedNameHelper
} from './subjects-db/helpers.js';

export { SUBJECT_CATEGORIES };

export const SUBJECTS_DATABASE = [
  ...TECH_SUBJECTS,
  ...NATURAL_SCIENCES_SUBJECTS,
  ...PERSONAL_DEVELOPMENT_SUBJECTS,
  ...HEALTHCARE_SUBJECTS,
  ...BUSINESS_SUBJECTS,
  ...SOCIAL_SCIENCES_SUBJECTS,
  ...HUMANITIES_SUBJECTS,
  ...LANGUAGES_SUBJECTS,
  ...ARTS_SUBJECTS,
  ...EMERGING_SUBJECTS
];

// Search helper function across UZ, RU, and EN
export function findMatchingSubjects(query) {
  return findMatchingSubjectsHelper(query, SUBJECTS_DATABASE);
}

// Find single exact or best match
export function getSubjectByMatch(name) {
  return getSubjectByMatchHelper(name, SUBJECTS_DATABASE);
}

// Get SVG by icon ID or subject ID
export function getSubjectSvg(iconOrSubjectId) {
  return getSubjectSvgHelper(iconOrSubjectId, SUBJECTS_DATABASE);
}

// Localize subject name according to language (uz, ru, en)
export function getSubjectLocalizedName(subject, lang = 'uz') {
  return getSubjectLocalizedNameHelper(subject, lang, SUBJECTS_DATABASE);
}

export { standardIcons };
