// Common types
export interface ResultMessage<T> {
  success: boolean;
  message: string;
  code: number;
  timestamp: number;
  result: T;
}

// User types
export interface User {
  id: string; // UUID
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdBy?: string; // UUID
  updatedBy?: string; // UUID
  deletedBy?: string; // UUID
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
  status: 'Active' | 'Inactive' | 'Deleted';
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

