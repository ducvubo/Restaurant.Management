import Api from './baseHttp';
import type { ResultMessage } from '../types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string; // UUID
    username: string;
    email: string;
    fullName?: string;
    phone?: string;
    address?: string;
    isActive: boolean;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await Api.post<ResultMessage<LoginResponse>>(
      '/management/auth/login',
      credentials
    );
    const loginResponse = response.data.result;
    
    // Store tokens
    if (loginResponse) {
      localStorage.setItem('accessToken', loginResponse.accessToken);
      localStorage.setItem('refreshToken', loginResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(loginResponse.user));
    }
    
    return loginResponse;
  },

  // Logout
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await Api.post('/management/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Refresh token
  refreshToken: async (): Promise<LoginResponse | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await Api.post<ResultMessage<LoginResponse>>(
        '/management/auth/refresh',
        { refreshToken }
      );
      const loginResponse = response.data.result;
      
      // Update tokens
      if (loginResponse) {
        localStorage.setItem('accessToken', loginResponse.accessToken);
        localStorage.setItem('refreshToken', loginResponse.refreshToken);
        localStorage.setItem('user', JSON.stringify(loginResponse.user));
      }
      
      return loginResponse;
    } catch (error) {
      // Refresh token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return null;
    }
  },

  // Get current user
  getCurrentUser: (): LoginResponse['user'] | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },
};

