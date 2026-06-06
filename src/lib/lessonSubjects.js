export const LANGUAGE_SUBJECTS = [
  'Английский язык',
  'Испанский язык',
  'Китайский язык',
  'Немецкий язык',
];

export const CREATIVE_SUBJECTS = [
  'Кулинария',
  'Вокал',
  'Кинематографика',
  'Ораторское искусство',
  'Танцы',
  'Рисование',
  'Фотография',
  'Гитара',
  'Актёрское мастерство',
];

export const SCHOOL_SUBJECTS = [
  'Математика',
  'Русский язык',
  'Физика',
  'Химия',
  'Биология',
  'История',
  'Обществознание',
  'Литература',
  'География',
  'Программирование',
];

export const EXTRA_SUBJECTS = [
  'SMM',
  'Блогинг',
  'Монтаж видео',
  'Шахматы',
  'Логопедия',
];

export const SUBJECT_GROUPS = [
  { label: 'Школьные предметы', subjects: SCHOOL_SUBJECTS },
  { label: 'Языки', subjects: LANGUAGE_SUBJECTS },
  { label: 'Творческие направления', subjects: CREATIVE_SUBJECTS },
  { label: 'Дополнительные направления', subjects: EXTRA_SUBJECTS },
];

export const ALL_SUBJECTS = SUBJECT_GROUPS.flatMap((group) => group.subjects);

export const CEFR_LEVELS = [
  { value: 'beginner', label: 'Начинающий (A1)' },
  { value: 'elementary', label: 'Элементарный (A2)' },
  { value: 'intermediate', label: 'Средний (B1)' },
  { value: 'upper_intermediate', label: 'Выше среднего (B2)' },
  { value: 'advanced', label: 'Продвинутый (C1)' },
];

export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Начинающий' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' },
];

const LEVEL_LABELS = {
  beginner: 'Начинающий',
  elementary: 'Элементарный',
  intermediate: 'Средний',
  upper_intermediate: 'Выше среднего',
  advanced: 'Продвинутый',
};

export function isLanguageSubject(subject) {
  return LANGUAGE_SUBJECTS.includes(subject);
}

export function getLevelsForSubject(subject) {
  return isLanguageSubject(subject) ? CEFR_LEVELS : SKILL_LEVELS;
}

export function getDefaultLevelForSubject(subject) {
  return getLevelsForSubject(subject)[0].value;
}

export function normalizeLevelForSubject(subject, level) {
  const levels = getLevelsForSubject(subject);
  if (levels.some((item) => item.value === level)) {
    return level;
  }
  return levels[0].value;
}

export function getStudentLevelLabel(level, subject) {
  const levels = subject ? getLevelsForSubject(subject) : [...CEFR_LEVELS, ...SKILL_LEVELS];
  const match = levels.find((item) => item.value === level);
  if (match) return match.label;
  return LEVEL_LABELS[level] || level;
}
