import Api from './baseHttp';
import type { 
  ResultMessage, 
  MaterialCategory,
  CreateMaterialCategoryRequest,
  UpdateMaterialCategoryRequest
} from '../types';

const API_URL = '/management/material-categories';

export const materialCategoryService = {
  // Lấy danh sách có phân trang
  getList: async (params: { page: number; size: number; keyword?: string }): Promise<{ items: MaterialCategory[]; total: number }> => {
    const response = await Api.get<ResultMessage<{ items: MaterialCategory[]; total: number }>>(`${API_URL}/list`, {
      params
    });
    return response.data.result;
  },

  // Lấy tất cả danh mục (cho combobox - vẫn giữ API cũ nếu cần, hoặc dùng getList với size lớn)
  getAll: async (): Promise<MaterialCategory[]> => {
    const response = await Api.get<ResultMessage<{ items: MaterialCategory[] }>>(`${API_URL}/list`, {
        params: { page: 1, size: 1000 }
    });
    return response.data.result.items;
  },

  getById: async (id: string): Promise<MaterialCategory> => {
    const response = await Api.get<ResultMessage<MaterialCategory>>(`${API_URL}/get`, {
      params: { id }
    });
    return response.data.result;
  },

  create: async (request: CreateMaterialCategoryRequest): Promise<ResultMessage<MaterialCategory>> => {
    const response = await Api.post<ResultMessage<MaterialCategory>>(`${API_URL}/create`, request);
    return response.data;
  },

  update: async (request: UpdateMaterialCategoryRequest): Promise<ResultMessage<MaterialCategory>> => {
    const response = await Api.post<ResultMessage<MaterialCategory>>(`${API_URL}/update`, request);
    return response.data;
  },

  delete: async (id: string): Promise<ResultMessage<string>> => {
    const response = await Api.post<ResultMessage<string>>(`${API_URL}/delete`, null, {
      params: { id }
    });
    return response.data;
  },

  activate: async (id: string): Promise<ResultMessage<string>> => {
    const response = await Api.post<ResultMessage<string>>(`${API_URL}/activate`, null, {
      params: { id }
    });
    return response.data;
  },

  deactivate: async (id: string): Promise<ResultMessage<string>> => {
    const response = await Api.post<ResultMessage<string>>(`${API_URL}/deactivate`, null, {
      params: { id }
    });
    return response.data;
  }
};
