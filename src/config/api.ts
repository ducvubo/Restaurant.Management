export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/management/auth/login',
  LOGOUT: '/management/auth/logout',
  REFRESH_TOKEN: '/management/auth/refresh',
  // User Management
  USERS: '/management/users',
  USER_BY_ID: (id: string) => `/management/users/${id}`,
  USER_BY_USERNAME: (username: string) => `/management/users/username/${username}`,
} as const;

