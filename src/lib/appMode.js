/** Режим листа ожидания выключен: открыт полный интерфейс приложения.
 *  Чтобы снова показать только лендинг, задайте VITE_WAITLIST_MODE=true. */
export function isWaitlistMode() {
  return import.meta.env.VITE_WAITLIST_MODE === 'true';
}
