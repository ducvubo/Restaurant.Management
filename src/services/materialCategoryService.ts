import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { 
  ResultMessage, 
  MaterialCategory,
  CreateMaterialCategoryRequest,
  UpdateMaterialCategoryRequest
} from '../types';

export const materialCategoryService = {
  // Lấy danh sách có phân trang
  getList: async (params: { page: number; size: number; keyword?: string }): Promise<{ items: MaterialCategory[]; total: number }> => {
    const response = await Api.get<ResultMessage<{ items: MaterialCategory[]; total: number }>>(API_ENDPOINTS.MATERIAL_CATEGORY_LIST, {
      params
    });
    return response.data.result;
  },

  // Lấy tất cả danh mục (cho combobox - vẫn giữ API cũ nếu cần, hoặc dùng getList với size lớn)
  getAll: async (): Promise<MaterialCategory[]> => {
    const response = await Api.get<ResultMessage<{ items: MaterialCategory[] }>>(API_ENDPOINTS.MATERIAL_CATEGORY_GET_ALL, {
        params: { page: 1, size: 1000 }
    });
    return response.data.result.items;
  },

  getById: async (id: string): Promise<MaterialCategory> => {
    const response = await Api.get<ResultMessage<MaterialCategory>>(API_ENDPOINTS.MATERIAL_CATEGORY_GET, {
      params: { id }
    });
    return response.data.result;
  },

  create: async (request: CreateMaterialCategoryRequest): Promise<ResultMessage<MaterialCategory>> => {
    const response = await Api.post<ResultMessage<MaterialCategory>>(API_ENDPOINTS.MATERIAL_CATEGORY_CREATE, request);
    return response.data;
  },

  update: async (request: UpdateMaterialCategoryRequest): Promise<ResultMessage<MaterialCategory>> => {
    const response = await Api.post<ResultMessage<MaterialCategory>>(API_ENDPOINTS.MATERIAL_CATEGORY_UPDATE, request);
    return response.data;
  },

  delete: async (id: string): Promise<ResultMessage<string>> => {
    const response = await Api.post<ResultMessage<string>>(API_ENDPOINTS.MATERIAL_CATEGORY_DEACTIVATE, null, {
      params: { id }
    });
    return response.data;
  },

  activate: async (id: string): Promise<ResultMessage<string>> => {
    const response = await Api.post<ResultMessage<string>>(API_ENDPOINTS.MATERIAL_CATEGORY_ACTIVATE, null, {
      params: { id }
    });
    return response.data;
  },

  deactivate: async (id: string): Promise<ResultMessage<string>> => {
    const response = await Api.post<ResultMessage<string>>(API_ENDPOINTS.MATERIAL_CATEGORY_DEACTIVATE, null, {
      params: { id }
    });
    return response.data;
  }
};
