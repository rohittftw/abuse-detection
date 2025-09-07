// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  FETCH_TWEETS: `${API_BASE_URL}/api/fetch-tweets`,
  SESSIONS: `${API_BASE_URL}/api/sessions`,
  SESSION_TWEETS: (sessionName: string) => `${API_BASE_URL}/api/sessions/${encodeURIComponent(sessionName)}/tweets`,
} as const;
