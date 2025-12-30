import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { 
  PurchaseRequisition, 
  PurchaseRequisitionRequest, 
  PurchaseListRequest, 
  PageResponse,
  WorkflowStateDTO,
  WorkflowActionRequest,
  WorkflowActivityDTO
} from '../types/purchasing';
import type { ResultMessage } from '../types';

export const purchaseRequisitionService = {
  // Get list with pagination
  getList: async (request: PurchaseListRequest): Promise<PageResponse<PurchaseRequisition>> => {
    const response = await Api.get<ResultMessage<PageResponse<PurchaseRequisition>>>(
      API_ENDPOINTS.PURCHASE_REQUISITION.LIST,
      { params: request }
    );
    return response.data.result;
  },

  // Get by ID
  getById: async (id: string): Promise<PurchaseRequisition> => {
    const response = await Api.get<ResultMessage<PurchaseRequisition>>(
      API_ENDPOINTS.PURCHASE_REQUISITION.GET,
      { params: { id } }
    );
    return response.data.result;
  },

  // Create
  create: async (data: PurchaseRequisitionRequest): Promise<ResultMessage<PurchaseRequisition>> => {
    const response = await Api.post<ResultMessage<PurchaseRequisition>>(
      API_ENDPOINTS.PURCHASE_REQUISITION.CREATE,
      data
    );
    return response.data;
  },

  // Update
  update: async (id: string, data: PurchaseRequisitionRequest): Promise<ResultMessage<PurchaseRequisition>> => {
    const response = await Api.put<ResultMessage<PurchaseRequisition>>(
      `${API_ENDPOINTS.PURCHASE_REQUISITION.UPDATE}?id=${id}`,
      data
    );
    return response.data;
  },

  // Submit for approval
  submit: async (id: string): Promise<ResultMessage<PurchaseRequisition>> => {
    const response = await Api.post<ResultMessage<PurchaseRequisition>>(
      `${API_ENDPOINTS.PURCHASE_REQUISITION.SUBMIT}?id=${id}`
    );
    return response.data;
  },

  // Approve
  approve: async (id: string): Promise<ResultMessage<PurchaseRequisition>> => {
    const response = await Api.post<ResultMessage<PurchaseRequisition>>(
      `${API_ENDPOINTS.PURCHASE_REQUISITION.APPROVE}?id=${id}`
    );
    return response.data;
  },

  // Reject
  reject: async (id: string, reason?: string): Promise<ResultMessage<PurchaseRequisition>> => {
    const response = await Api.post<ResultMessage<PurchaseRequisition>>(
      `${API_ENDPOINTS.PURCHASE_REQUISITION.REJECT}?id=${id}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`
    );
    return response.data;
  },

  // Cancel
  cancel: async (id: string): Promise<ResultMessage<PurchaseRequisition>> => {
    const response = await Api.post<ResultMessage<PurchaseRequisition>>(
      `${API_ENDPOINTS.PURCHASE_REQUISITION.CANCEL}?id=${id}`
    );
    return response.data;
  },

  // Delete (only DRAFT)
  delete: async (id: string): Promise<ResultMessage<void>> => {
    const response = await Api.delete<ResultMessage<void>>(
      `${API_ENDPOINTS.PURCHASE_REQUISITION.DELETE}?id=${id}`
    );
    return response.data;
  },
  
  // ===== Workflow Methods =====
  
  // Lấy trạng thái workflow hiện tại
  getWorkflowState: async (id: string): Promise<WorkflowStateDTO> => {
    const response = await Api.get<ResultMessage<WorkflowStateDTO>>(
      API_ENDPOINTS.PURCHASE_REQUISITION.WORKFLOW_STATE,
      { params: { id } }
    );
    return response.data.result;
  },
  
  // Thực hiện action trong workflow
  performWorkflowAction: async (id: string, request: WorkflowActionRequest): Promise<ResultMessage<PurchaseRequisition>> => {
    const response = await Api.post<ResultMessage<PurchaseRequisition>>(
      `${API_ENDPOINTS.PURCHASE_REQUISITION.WORKFLOW_ACTION}?id=${id}`,
      request
    );
    return response.data;
  },
  
  // Lấy lịch sử thao tác
  getHistory: async (id: string): Promise<WorkflowActivityDTO[]> => {
    const response = await Api.get<ResultMessage<WorkflowActivityDTO[]>>(
      API_ENDPOINTS.PURCHASE_REQUISITION.HISTORY,
      { params: { id } }
    );
    return response.data.result;
  },
};

