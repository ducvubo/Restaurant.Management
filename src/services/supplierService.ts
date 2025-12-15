import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest, SupplierListRequest, SupplierListResponse, ResultMessage } from '../types';

export const supplierService = {
  // Get all suppliers
  getAllSuppliers: async (): Promise<Supplier[]> => {
    const response = await Api.get<ResultMessage<Supplier[]>>(API_ENDPOINTS.SUPPLIER_GET_ALL);
    return response.data.result || [];
  },

  // Get supplier list (with pagination and search)
  getSupplierList: async (request: SupplierListRequest): Promise<SupplierListResponse> => {
    const response = await Api.get<ResultMessage<SupplierListResponse>>(API_ENDPOINTS.SUPPLIER_LIST, {
      params: request,
    });
    return response.data.result;
  },

  // Get supplier by ID
  getSupplierById: async (id: string): Promise<Supplier> => {
    const response = await Api.get<ResultMessage<Supplier>>(API_ENDPOINTS.SUPPLIER_GET, {
      params: { id },
    });
    return response.data.result;
  },

  // Create supplier
  createSupplier: async (supplierData: CreateSupplierRequest): Promise<ResultMessage<Supplier>> => {
    const response = await Api.post<ResultMessage<Supplier>>(API_ENDPOINTS.SUPPLIER_CREATE, supplierData);
    return response.data;
  },

  // Update supplier
  updateSupplier: async (id: string, supplierData: UpdateSupplierRequest): Promise<ResultMessage<Supplier>> => {
    const response = await Api.put<ResultMessage<Supplier>>(
      `${API_ENDPOINTS.SUPPLIER_UPDATE}?id=${id}`,
      supplierData
    );
    return response.data;
  },

  // Activate supplier
  activateSupplier: async (id: string): Promise<Supplier> => {
    const response = await Api.put<ResultMessage<Supplier>>(
      `${API_ENDPOINTS.SUPPLIER_ACTIVATE}?id=${id}`,
      {}
    );
    return response.data.result;
  },

  // Deactivate supplier
  deactivateSupplier: async (id: string): Promise<Supplier> => {
    const response = await Api.put<ResultMessage<Supplier>>(
      `${API_ENDPOINTS.SUPPLIER_DEACTIVATE}?id=${id}`,
      {}
    );
    return response.data.result;
  },
};
