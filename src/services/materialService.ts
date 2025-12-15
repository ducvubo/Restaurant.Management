import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { 
    Material, 
    CreateMaterialRequest, 
    UpdateMaterialRequest, 
    MaterialListRequest, 
    MaterialListResponse, 
    ResultMessage 
} from '../types';

export const materialService = {
  getMaterialById: async (id: string): Promise<Material> => {
    const response = await Api.get<ResultMessage<Material>>(API_ENDPOINTS.MATERIAL_GET, {
      params: { id },
    });
    return response.data.result;
  },

  createMaterial: async (data: CreateMaterialRequest): Promise<ResultMessage<Material>> => {
    const response = await Api.post<ResultMessage<Material>>(API_ENDPOINTS.MATERIAL_CREATE, data);
    return response.data;
  },

  updateMaterial: async (data: UpdateMaterialRequest): Promise<ResultMessage<Material>> => {
    const response = await Api.put<ResultMessage<Material>>(API_ENDPOINTS.MATERIAL_UPDATE, data);
    return response.data;
  },

  getList: async (request: MaterialListRequest): Promise<MaterialListResponse> => {
    const response = await Api.get<ResultMessage<MaterialListResponse>>(API_ENDPOINTS.MATERIAL_LIST, {
      params: request,
    });
    return response.data.result;
  },

  activateMaterial: async (id: string): Promise<string> => {
     const response = await Api.post<ResultMessage<string>>(API_ENDPOINTS.MATERIAL_ACTIVATE, null, {
        params: { id }
    });
    return response.data.result;
  },

  deactivateMaterial: async (id: string): Promise<string> => {
     const response = await Api.post<ResultMessage<string>>(API_ENDPOINTS.MATERIAL_DEACTIVATE, null, {
        params: { id }
    });
    return response.data.result;
  },
};
