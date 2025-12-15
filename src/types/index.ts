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
  policyIds?: string[]; // policy ids assigned to user
  createdBy?: string; // UUID
  updatedBy?: string; // UUID
  deletedBy?: string; // UUID
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
  status: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  address?: string;
  policyIds?: string[]; // policy ids assigned to user
}

export interface UpdateUserRequest {
  id?: string; // UUID - required for update
  email?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  policyIds?: string[]; // policy ids assigned to user
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
}

export interface UserListRequest {
  keyword?: string;
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
  page?: number;
  size?: number;
}

export interface UserListResponse {
  items: User[];
  page: number;
  size: number;
  total: number;
}

// Policy types
export interface Policy {
  id: string; // UUID
  name: string;
  description?: string;
  policies: string[]; // List of permission keys
  status: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
  createdBy?: string; // UUID
  updatedBy?: string; // UUID
  deletedBy?: string; // UUID
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}

export interface CreatePolicyRequest {
  name: string;
  description?: string;
  policies: string[]; // List of permission keys
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
}

export interface UpdatePolicyRequest {
  id?: string; // UUID - required for update
  name?: string;
  description?: string;
  policies?: string[]; // List of permission keys
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
}

export interface PolicyListRequest {
  page?: number; // Backend uses 1-based page
  size?: number;
  keyword?: string; // Backend uses keyword instead of search
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
}

export interface PolicyListResponse {
  items: Policy[]; // Backend uses items instead of data
  page: number;
  size: number;
  total: number;
}

// Branch types
export interface Branch {
  id: string; // UUID
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  openingTime: string; // LocalTime format: "HH:mm:ss"
  closingTime: string; // LocalTime format: "HH:mm:ss"
  status: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE
  createdBy?: string; // UUID
  updatedBy?: string; // UUID
  createdDate: string;
  updatedDate: string;
}

export interface CreateBranchRequest {
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  openingTime: string; // LocalTime format: "HH:mm:ss"
  closingTime: string; // LocalTime format: "HH:mm:ss"
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE
}

export interface UpdateBranchRequest {
  id?: string; // UUID - required for update
  code?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  openingTime?: string; // LocalTime format: "HH:mm:ss"
  closingTime?: string; // LocalTime format: "HH:mm:ss"
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE
}


export interface BranchListRequest {
  keyword?: string;
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE
  page?: number;
  size?: number;
}

export interface BranchListResponse {
  items: Branch[];
  page: number;
  size: number;
  total: number;
}

// Unit types
export interface Unit {
  id: string; // UUID
  code: string;
  name: string;
  symbol?: string;
  baseUnitId?: string; // UUID
  baseUnitName?: string;
  conversionRate?: number;
  description?: string;
  status: number;
  createdBy?: string;
  updatedBy?: string;
  createdDate: string;
  updatedDate: string;
}

export interface CreateUnitRequest {
  code: string;
  name: string;
  symbol?: string;
  baseUnitId?: string;
  conversionRate?: number;
  description?: string;
}

export interface UpdateUnitRequest {
  id?: string;
  code: string;
  name: string;
  symbol?: string;
  baseUnitId?: string;
  conversionRate?: number;
  description?: string;
}

export interface UnitListRequest {
  keyword?: string;
  status?: number;
  page?: number;
  size?: number;
}

export interface UnitListResponse {
  items: Unit[];
  page: number;
  size: number;
  total: number;
}

// Supplier types
export interface Supplier {
  id: string; // UUID
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  paymentTerms?: string;
  rating?: number; // 1-5
  notes?: string;
  status: number;
  createdBy?: string;
  updatedBy?: string;
  createdDate: string;
  updatedDate: string;
}

export interface CreateSupplierRequest {
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
}

export interface UpdateSupplierRequest {
  id?: string;
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
}

export interface SupplierListRequest {
  keyword?: string;
  status?: number;
  page?: number;
  size?: number;
}

export interface SupplierListResponse {
  items: Supplier[];
  page: number;
  size: number;
  total: number;
}
