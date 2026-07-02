const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REMEMBER_KEY = 'rememberMe';

const isPersistentSession = () => localStorage.getItem(REMEMBER_KEY) === 'true';

const getAuthStorage = () => (isPersistentSession() ? localStorage : sessionStorage);

const getAuthToken = () => getAuthStorage().getItem(TOKEN_KEY);

const getAuthUser = () => {
  const storage = getAuthStorage();
  const raw = storage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const setAuthSession = (token, user, persistent) => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  if (persistent) {
    localStorage.setItem(REMEMBER_KEY, 'true');
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearAuthSession = () => {
  localStorage.removeItem(REMEMBER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

export {
  clearAuthSession,
  getAuthStorage,
  getAuthToken,
  getAuthUser,
  isPersistentSession,
  setAuthSession
};
