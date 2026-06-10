/** Версия политики — увеличивайте при существенных изменениях. */
export const PRIVACY_POLICY_VERSION = '1.0';

export const PRIVACY_POLICY_DATE = '28 мая 2026 г.';

export const DATA_RETENTION_LABEL =
  'до запуска платформы и не более 12 месяцев после уведомления о запуске, либо до отзыва согласия';

export const privacyConfig = {
  operatorName: import.meta.env.VITE_OPERATOR_NAME || 'Lesson Sale',
  operatorEmail:
    import.meta.env.VITE_OPERATOR_EMAIL || 'privacy@lessonsale.ru',
  operatorInn: import.meta.env.VITE_OPERATOR_INN || '',
  siteUrl: import.meta.env.VITE_SITE_URL || '',
};
