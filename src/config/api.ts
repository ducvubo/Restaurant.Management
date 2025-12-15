export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/management/auth/login',
  LOGOUT: '/management/auth/logout',
  REFRESH_TOKEN: '/management/auth/refresh',
  // User Management
  USERS: '/management/users',
  USER_GET: '/management/users/get',
  USER_GET_BY_USERNAME: '/management/users/getByUsername',
  USER_ADD: '/management/users/add',
  USER_UPDATE: '/management/users/update',
  USER_DISABLE: '/management/users/disable',
  USER_ENABLE: '/management/users/enable',
  // Policy Management
  POLICY_GET: '/management/policy/get',
  POLICY_ADD: '/management/policy/add',
  POLICY_UPDATE: '/management/policy/update',
  POLICY_DELETE: '/management/policy/delete',
  POLICY_LIST: '/management/policy/list',
  POLICY_ALL: '/management/policy/all',
  // Permission
  PERMISSION_LIST: '/management/permission/list',
} as const;

