const STORAGE_KEYS = {
  auth: "lesson_sale_auth_v3",
  user: "lesson_sale_user_v3",
  collections: "lesson_sale_collections_v3",
};

const DEFAULT_USER = {
  id: "local-user-1",
  full_name: "Локальный пользователь",
  email: "local@example.com",
  user_type: "student",
  onboarding_completed: false,
  avatar_url: "",
  phone: "",
  bio: "",
  experience_years: 0,
  subject: "Английский язык",
  average_rating: 5,
  rating_count: 0,
  total_lessons: 0,
  support_chat_id: null,
  notification_settings: {
    email_new_message: true,
    email_new_booking: true,
    email_lesson_reminder: true,
    push_new_message: true,
    push_new_booking: true,
  },
};

const isBrowser = typeof window !== "undefined";

const nowIso = () => new Date().toISOString();

const readJson = (key, fallback) => {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const ensureAuthState = () => {
  const auth = readJson(STORAGE_KEYS.auth, null);
  if (auth) return auth;
  const initial = { isAuthenticated: true };
  writeJson(STORAGE_KEYS.auth, initial);
  return initial;
};

const makeDemoLessons = () => {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  const at = (offsetMs) => new Date(now + offsetMs).toISOString();

  const base = [
    {
      teacher_name: "Анна Петрова",
      teacher_rating: 4.9,
      subject: "Английский язык",
      student_level: "intermediate",
      lesson_date: at(6 * hour),
      original_price: 2000,
      discounted_price: 1200,
    },
    {
      teacher_name: "Игорь Смирнов",
      teacher_rating: 4.7,
      subject: "Математика",
      student_level: "advanced",
      lesson_date: at(day + 2 * hour),
      original_price: 2500,
      discounted_price: 1500,
    },
    {
      teacher_name: "Мария Кузнецова",
      teacher_rating: 5.0,
      subject: "Испанский язык",
      student_level: "beginner",
      lesson_date: at(2 * day + 4 * hour),
      original_price: 1800,
      discounted_price: 990,
    },
  ];

  return base.map((item, index) => ({
    id: `demo_lesson_${index + 1}`,
    teacher_id: `demo_teacher_${index + 1}`,
    teacher_avatar: "",
    format: "online",
    status: "active",
    expires_at: at(day),
    created_date: nowIso(),
    updated_date: nowIso(),
    ...item,
  }));
};

const ensureCollections = () => {
  const collections = readJson(STORAGE_KEYS.collections, null);
  if (collections) return ensureWaitlistCollection(collections);
  const initial = {
    User: [],
    Lesson: makeDemoLessons(),
    Chat: [],
    Message: [],
    Notification: [],
    Review: [],
    SupportTicket: [],
    WaitlistEntry: [],
  };
  writeJson(STORAGE_KEYS.collections, initial);
  return initial;
};

const ensureWaitlistCollection = (collections) => {
  if (!collections.WaitlistEntry) {
    collections.WaitlistEntry = [];
    writeJson(STORAGE_KEYS.collections, collections);
  }
  return collections;
};

const ensureUser = () => {
  const saved = readJson(STORAGE_KEYS.user, null);
  if (saved) return saved;
  const user = { ...DEFAULT_USER, created_date: nowIso(), updated_date: nowIso() };
  writeJson(STORAGE_KEYS.user, user);
  const collections = ensureCollections();
  if (!collections.User.find((u) => u.id === user.id)) {
    collections.User.push(user);
    writeJson(STORAGE_KEYS.collections, collections);
  }
  return user;
};

const setCurrentUser = (user) => {
  writeJson(STORAGE_KEYS.user, user);
  const collections = ensureCollections();
  const idx = collections.User.findIndex((u) => u.id === user.id);
  if (idx >= 0) collections.User[idx] = user;
  else collections.User.push(user);
  writeJson(STORAGE_KEYS.collections, collections);
};

const nextId = (collectionName) =>
  `${collectionName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const sortItems = (items, sortBy) => {
  if (!sortBy) return items;
  const desc = sortBy.startsWith("-");
  const key = desc ? sortBy.slice(1) : sortBy;
  return [...items].sort((a, b) => {
    const av = a?.[key];
    const bv = b?.[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
};

const filterItems = (items, where = {}) =>
  items.filter((item) =>
    Object.entries(where).every(([k, v]) => {
      if (v === undefined) return true;
      return item?.[k] === v;
    })
  );

const getCollectionApi = (collectionName) => ({
  async filter(where = {}, sortBy) {
    const collections = ensureWaitlistCollection(ensureCollections());
    const rows = collections[collectionName] ?? [];
    return sortItems(filterItems(rows, where), sortBy);
  },

  async create(payload = {}) {
    const collections = ensureWaitlistCollection(ensureCollections());
    const rows = collections[collectionName] ?? [];
    const row = {
      id: payload.id ?? nextId(collectionName),
      ...payload,
      created_date: payload.created_date ?? nowIso(),
      updated_date: nowIso(),
    };
    rows.push(row);
    collections[collectionName] = rows;
    writeJson(STORAGE_KEYS.collections, collections);
    return row;
  },

  async update(id, patch = {}) {
    const collections = ensureCollections();
    const rows = collections[collectionName] ?? [];
    const idx = rows.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error(`${collectionName} with id "${id}" not found`);
    rows[idx] = { ...rows[idx], ...patch, updated_date: nowIso() };
    collections[collectionName] = rows;
    writeJson(STORAGE_KEYS.collections, collections);
    return rows[idx];
  },
});

const entities = new Proxy(
  {},
  {
    get(_, name) {
      return getCollectionApi(String(name));
    },
  }
);

const auth = {
  async isAuthenticated() {
    return ensureAuthState().isAuthenticated;
  },

  async me() {
    const state = ensureAuthState();
    if (!state.isAuthenticated) {
      const err = new Error("Authentication required");
      err.status = 401;
      throw err;
    }
    return ensureUser();
  },

  async updateMe(patch = {}) {
    const current = await auth.me();
    const updated = { ...current, ...patch, updated_date: nowIso() };
    setCurrentUser(updated);
    return updated;
  },

  /** Локальный «вход»: включает сессию и возвращает текущего пользователя. */
  async login() {
    writeJson(STORAGE_KEYS.auth, { isAuthenticated: true });
    return ensureUser();
  },

  /** Выход: сбрасывает демо-пользователя, чтобы «Попробовать сейчас» снова открывал онбординг. */
  logout(redirectTo) {
    writeJson(STORAGE_KEYS.auth, { isAuthenticated: false });
    const freshUser = {
      ...DEFAULT_USER,
      id: nextId("user"),
      created_date: nowIso(),
      updated_date: nowIso(),
    };
    writeJson(STORAGE_KEYS.user, freshUser);
    if (isBrowser && redirectTo) window.location.assign(redirectTo);
  },

  redirectToLogin(targetPath = "/") {
    writeJson(STORAGE_KEYS.auth, { isAuthenticated: true });
    ensureUser();
    if (isBrowser) window.location.assign(targetPath);
  },
};

const integrations = {
  Core: {
    async SendEmail() {
      return { success: true };
    },
    async UploadFile({ file }) {
      return { file_url: file ? URL.createObjectURL(file) : "" };
    },
  },
};

const appLogs = {
  async logUserInApp() {
    return { ok: true };
  },
};

export const base44 = { auth, entities, integrations, appLogs };
