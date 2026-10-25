// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  FETCH_TWEETS: `${API_BASE_URL}/api/fetch-tweets`,
  SESSIONS: `${API_BASE_URL}/api/sessions`,
  SESSION_TWEETS: (sessionName: string) => `${API_BASE_URL}/api/sessions/${encodeURIComponent(sessionName)}/tweets`,
  REANALYZE_TWEET: (tweetId: string) => `${API_BASE_URL}/api/tweets/${tweetId}/reanalyze`,
  REANALYZE_SESSION: (sessionName: string) => `${API_BASE_URL}/api/sessions/${encodeURIComponent(sessionName)}/reanalyze`,
} as const;

export const AUTH_ENDPOINTS = {
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  ME: `${API_BASE_URL}/api/auth/me`,
} as const;

export const TOKEN_STORAGE_KEY = 'tweetwatch.auth.token';
export const UNAUTHORIZED_EVENT = 'tweetwatch:unauthorized';

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode); the in-memory state still works.
  }
};

/**
 * `fetch` wrapper that attaches the stored bearer token and clears the session
 * when the API answers 401.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getStoredToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    setStoredToken(null);
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  return response;
}
