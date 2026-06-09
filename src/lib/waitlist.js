const WAITLIST_STORAGE_KEY = 'lesson_sale_waitlist';

const isBrowser = typeof window !== 'undefined';

const readList = () => {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(WAITLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeList = (entries) => {
  if (!isBrowser) return;
  window.localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(entries));
};

export async function getWaitlistEntries() {
  return readList();
}

export async function joinWaitlist({ full_name, email, user_type }) {
  const normalizedEmail = email.trim().toLowerCase();
  const entries = readList();

  if (entries.some((entry) => entry.email === normalizedEmail)) {
    const error = new Error('duplicate_email');
    error.code = 'duplicate_email';
    throw error;
  }

  const entry = {
    id: `waitlist_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    full_name: full_name.trim(),
    email: normalizedEmail,
    user_type,
    status: 'pending',
    created_date: new Date().toISOString(),
  };

  entries.push(entry);
  writeList(entries);
  return entry;
}
