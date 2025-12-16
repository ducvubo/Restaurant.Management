import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  customerType: number; // 1=Individual, 2=Company
  customerTypeName: string;
  status: number;
  createdDate: string;
  updatedDate?: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  customerType: number;
}

export interface UpdateCustomerRequest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  customerType: number;
}

export const customerService = {
  /**
   * Create new customer
   */
  create: async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await Api.post(API_ENDPOINTS.CUSTOMER_CREATE, data);
    return response.data.result;
  },

  /**
   * Update customer
   */
  update: async (data: UpdateCustomerRequest): Promise<Customer> => {
    const response = await Api.put(API_ENDPOINTS.CUSTOMER_UPDATE, data);
    return response.data.result;
  },

  /**
   * Get customer by ID
   */
  getById: async (id: string): Promise<Customer> => {
    const response = await Api.get(API_ENDPOINTS.CUSTOMER_GET, { params: { id } });
    return response.data.result;
  },

  /**
   * Get all customers
   */
  getList: async (): Promise<{ items: Customer[]; total: number }> => {
    const response = await Api.get(API_ENDPOINTS.CUSTOMER_LIST);
    return response.data.result;
  },

  /**
   * Deactivate customer
   */
  deactivate: async (id: string): Promise<void> => {
    await Api.put(API_ENDPOINTS.CUSTOMER_DEACTIVATE, null, { params: { id } });
  },

  /**
   * Activate customer
   */
  activate: async (id: string): Promise<void> => {
    await Api.put(API_ENDPOINTS.CUSTOMER_ACTIVATE, null, { params: { id } });
  },
};
