import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { Branch, CreateBranchRequest, UpdateBranchRequest, BranchListRequest, BranchListResponse, ResultMessage } from '../types';

export const branchService = {
  // Get all branches
  getAllBranches: async (): Promise<Branch[]> => {
    const response = await Api.get<ResultMessage<Branch[]>>(API_ENDPOINTS.BRANCH_GET_ALL);
    return response.data.result || [];
  },

  // Get all active branches
  getAllActiveBranches: async (): Promise<Branch[]> => {
    const response = await Api.get<ResultMessage<Branch[]>>(API_ENDPOINTS.BRANCH_GET_ALL_ACTIVE);
    return response.data.result || [];
  },

  // Get branch list (with pagination and search)
  getBranchList: async (request: BranchListRequest): Promise<BranchListResponse> => {
    const response = await Api.get<ResultMessage<BranchListResponse>>(API_ENDPOINTS.BRANCH_LIST, {
      params: request,
    });
    return response.data.result;
  },

  // Get branch by ID
  getBranchById: async (id: string): Promise<Branch> => {
    const response = await Api.get<ResultMessage<Branch>>(API_ENDPOINTS.BRANCH_GET, {
      params: { id },
    });
    return response.data.result;
  },

  // Create branch
  createBranch: async (branchData: CreateBranchRequest): Promise<ResultMessage<Branch>> => {
    const response = await Api.post<ResultMessage<Branch>>(API_ENDPOINTS.BRANCH_CREATE, branchData);
    return response.data;
  },

  // Update branch
  updateBranch: async (id: string, branchData: UpdateBranchRequest): Promise<ResultMessage<Branch>> => {
    const response = await Api.put<ResultMessage<Branch>>(
      `${API_ENDPOINTS.BRANCH_UPDATE}?id=${id}`,
      branchData
    );
    return response.data;
  },

  // Activate branch
  activateBranch: async (id: string): Promise<Branch> => {
    const response = await Api.put<ResultMessage<Branch>>(
      `${API_ENDPOINTS.BRANCH_ACTIVATE}?id=${id}`,
      {}
    );
    return response.data.result;
  },

  // Deactivate branch
  deactivateBranch: async (id: string): Promise<Branch> => {
    const response = await Api.put<ResultMessage<Branch>>(
      `${API_ENDPOINTS.BRANCH_DEACTIVATE}?id=${id}`,
      {}
    );
    return response.data.result;
  },
};
