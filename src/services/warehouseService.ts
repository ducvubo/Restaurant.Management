import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { 
    Warehouse, 
    CreateWarehouseRequest, 
    UpdateWarehouseRequest, 
    WarehouseListRequest, 
    WarehouseListResponse, 
    ResultMessage 
} from '../types';

export const warehouseService = {
  // Get warehouse by ID
  getWarehouseById: async (id: string): Promise<Warehouse> => {
    const response = await Api.get<ResultMessage<Warehouse>>(API_ENDPOINTS.WAREHOUSE_GET, {
      params: { id },
    });
    return response.data.result;
  },

  // Create warehouse
  createWarehouse: async (data: CreateWarehouseRequest): Promise<ResultMessage<Warehouse>> => {
    const response = await Api.post<ResultMessage<Warehouse>>(API_ENDPOINTS.WAREHOUSE_CREATE, data);
    return response.data;
  },

  // Update warehouse
  updateWarehouse: async (data: UpdateWarehouseRequest): Promise<ResultMessage<Warehouse>> => {
    const response = await Api.put<ResultMessage<Warehouse>>(API_ENDPOINTS.WAREHOUSE_UPDATE, data);
    return response.data;
  },

  // Get list
  getList: async (request: WarehouseListRequest): Promise<WarehouseListResponse> => {
    const response = await Api.get<ResultMessage<WarehouseListResponse>>(API_ENDPOINTS.WAREHOUSE_LIST, {
      params: request,
    });
    return response.data.result;
  },

  // Activate
  activateWarehouse: async (id: string): Promise<string> => {
    const response = await Api.post<ResultMessage<string>>(API_ENDPOINTS.WAREHOUSE_ACTIVATE, null, {
        params: { id }
    });
    return response.data.result;
  },

  // Deactivate
  deactivateWarehouse: async (id: string): Promise<string> => {
    const response = await Api.post<ResultMessage<string>>(API_ENDPOINTS.WAREHOUSE_DEACTIVATE, null, {
        params: { id }
    });
    return response.data.result;
  },
};
