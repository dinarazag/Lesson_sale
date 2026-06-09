/** Пока true — доступен только лендинг с waitlist. */
export function isWaitlistMode() {
  return import.meta.env.VITE_WAITLIST_MODE !== 'false';
}
