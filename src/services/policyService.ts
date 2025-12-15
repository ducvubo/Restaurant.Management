import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { Policy, CreatePolicyRequest, UpdatePolicyRequest, PolicyListRequest, PolicyListResponse, ResultMessage } from '../types';

export const policyService = {
  // Get all policies (active only)
  getAllPolicies: async (): Promise<Policy[]> => {
    const response = await Api.get<ResultMessage<Policy[]>>(API_ENDPOINTS.POLICY_ALL);
    return response.data.result || [];
  },

  // Get policy by ID
  getPolicyById: async (id: string): Promise<Policy> => {
    const response = await Api.get<ResultMessage<Policy>>(API_ENDPOINTS.POLICY_GET, {
      params: { id },
    });
    return response.data.result;
  },

  // Get policy list (with pagination and search)
  getPolicyList: async (request: PolicyListRequest): Promise<PolicyListResponse> => {
    const response = await Api.get<ResultMessage<PolicyListResponse>>(API_ENDPOINTS.POLICY_LIST, {
      params: request,
    });
    return response.data.result;
  },

  // Create policy
  createPolicy: async (policyData: CreatePolicyRequest): Promise<Policy> => {
    const response = await Api.post<ResultMessage<Policy>>(API_ENDPOINTS.POLICY_ADD, policyData);
    return response.data.result;
  },

  // Update policy
  updatePolicy: async (id: string, policyData: UpdatePolicyRequest): Promise<Policy> => {
    const response = await Api.put<ResultMessage<Policy>>(API_ENDPOINTS.POLICY_UPDATE, {
      ...policyData,
      id,
    });
    return response.data.result;
  },

  // Delete policy
  deletePolicy: async (id: string): Promise<void> => {
    await Api.delete(`${API_ENDPOINTS.POLICY_DELETE}?id=${id}`);
  },
};

