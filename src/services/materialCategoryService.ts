import Api from './baseHttp';
import type { 
  ResultMessage, 
  MaterialCategory,
  CreateMaterialCategoryRequest,
  UpdateMaterialCategoryRequest
} from '../types';

const API_URL = '/management/material-categories';

export const materialCategoryService = {
  // Lấy tất cả danh mục (cho combobox)
  getAll: async (): Promise<MaterialCategory[]> => {
    const response = await Api.get<ResultMessage<MaterialCategory[]>>(`${API_URL}/list-all`);
    return response.data.result;
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
  }
};
