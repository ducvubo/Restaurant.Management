import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { User, CreateUserRequest, UpdateUserRequest, UserListRequest, UserListResponse, ResultMessage } from '../types';

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await Api.get<ResultMessage<User[]>>(API_ENDPOINTS.USERS + '/get-all');
    return response.data.result || [];
  },

  // Get user list (with pagination and search)
  getUserList: async (request: UserListRequest): Promise<UserListResponse> => {
    const response = await Api.get<ResultMessage<UserListResponse>>(API_ENDPOINTS.USER_LIST, {
      params: request,
    });
    return response.data.result;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await Api.get<ResultMessage<User>>(API_ENDPOINTS.USER_GET, {
      params: { id },
    });
    return response.data.result;
  },

  // Get user by username
  getUserByUsername: async (username: string): Promise<User> => {
    const response = await Api.get<ResultMessage<User>>(API_ENDPOINTS.USER_GET_BY_USERNAME, {
      params: { username },
    });
    return response.data.result;
  },

  // Create user
  createUser: async (userData: CreateUserRequest): Promise<ResultMessage<User>> => {
    const response = await Api.post<ResultMessage<User>>(API_ENDPOINTS.USER_ADD, userData);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<ResultMessage<User>> => {
    const response = await Api.put<ResultMessage<User>>(API_ENDPOINTS.USER_UPDATE, {
      ...userData,
      id,
    });
    return response.data;
  },

  // Disable user
  disableUser: async (id: string): Promise<User> => {
    const response = await Api.put<ResultMessage<User>>(
      `${API_ENDPOINTS.USER_DISABLE}?id=${id}`,
      {}
    );
    return response.data.result;
  },

  // Enable user
  enableUser: async (id: string): Promise<User> => {
    const response = await Api.put<ResultMessage<User>>(
      `${API_ENDPOINTS.USER_ENABLE}?id=${id}`,
      {}
    );
    return response.data.result;
  },
};

