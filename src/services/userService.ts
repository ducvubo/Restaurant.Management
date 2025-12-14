import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { User, CreateUserRequest, UpdateUserRequest, ResultMessage } from '../types';

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await Api.get<ResultMessage<User[]>>(API_ENDPOINTS.USERS);
    return response.data.result || [];
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await Api.get<ResultMessage<User>>(API_ENDPOINTS.USER_BY_ID(id));
    return response.data.result;
  },

  // Get user by username
  getUserByUsername: async (username: string): Promise<User> => {
    const response = await Api.get<ResultMessage<User>>(API_ENDPOINTS.USER_BY_USERNAME(username));
    return response.data.result;
  },

  // Create user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await Api.post<ResultMessage<User>>(API_ENDPOINTS.USERS, userData);
    return response.data.result;
  },

  // Update user
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    const response = await Api.put<ResultMessage<User>>(API_ENDPOINTS.USER_BY_ID(id), userData);
    return response.data.result;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await Api.delete(API_ENDPOINTS.USER_BY_ID(id));
  },
};

