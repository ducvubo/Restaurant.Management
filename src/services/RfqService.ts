import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { 
  Rfq, 
  RfqRequest, 
  PurchaseListRequest, 
  PageResponse 
} from '../types/purchasing';
import type { ResultMessage } from '../types';

export const rfqService = {
  // Get list with pagination
  getList: async (request: PurchaseListRequest): Promise<PageResponse<Rfq>> => {
    const response = await Api.get<ResultMessage<PageResponse<Rfq>>>(
      API_ENDPOINTS.RFQ.LIST,
      { params: request }
    );
    return response.data.result;
  },

  // Get by ID
  getById: async (id: string): Promise<Rfq> => {
    const response = await Api.get<ResultMessage<Rfq>>(
      API_ENDPOINTS.RFQ.GET,
      { params: { id } }
    );
    return response.data.result;
  },

  // Create
  create: async (data: RfqRequest): Promise<ResultMessage<Rfq>> => {
    const response = await Api.post<ResultMessage<Rfq>>(
      API_ENDPOINTS.RFQ.CREATE,
      data
    );
    return response.data;
  },

  // Create from requisition
  createFromRequisition: async (requisitionId: string, supplierId: string): Promise<ResultMessage<Rfq>> => {
    const response = await Api.post<ResultMessage<Rfq>>(
      `${API_ENDPOINTS.RFQ.CREATE_FROM_REQUISITION}?requisitionId=${requisitionId}&supplierId=${supplierId}`
    );
    return response.data;
  },

  // Update
  update: async (id: string, data: RfqRequest): Promise<ResultMessage<Rfq>> => {
    const response = await Api.put<ResultMessage<Rfq>>(
      `${API_ENDPOINTS.RFQ.UPDATE}?id=${id}`,
      data
    );
    return response.data;
  },

  // Send to supplier
  send: async (id: string): Promise<ResultMessage<Rfq>> => {
    const response = await Api.post<ResultMessage<Rfq>>(
      `${API_ENDPOINTS.RFQ.SEND}?id=${id}`
    );
    return response.data;
  },

  // Receive quotation from supplier
  receiveQuotation: async (id: string, quotation: RfqRequest): Promise<ResultMessage<Rfq>> => {
    const response = await Api.post<ResultMessage<Rfq>>(
      `${API_ENDPOINTS.RFQ.RECEIVE_QUOTATION}?id=${id}`,
      quotation
    );
    return response.data;
  },

  // Accept
  accept: async (id: string): Promise<ResultMessage<Rfq>> => {
    const response = await Api.post<ResultMessage<Rfq>>(
      `${API_ENDPOINTS.RFQ.ACCEPT}?id=${id}`
    );
    return response.data;
  },

  // Reject
  reject: async (id: string): Promise<ResultMessage<Rfq>> => {
    const response = await Api.post<ResultMessage<Rfq>>(
      `${API_ENDPOINTS.RFQ.REJECT}?id=${id}`
    );
    return response.data;
  },

  // Cancel
  cancel: async (id: string): Promise<ResultMessage<Rfq>> => {
    const response = await Api.post<ResultMessage<Rfq>>(
      `${API_ENDPOINTS.RFQ.CANCEL}?id=${id}`
    );
    return response.data;
  },

  // Delete (only DRAFT)
  delete: async (id: string): Promise<ResultMessage<void>> => {
    const response = await Api.delete<ResultMessage<void>>(
      `${API_ENDPOINTS.RFQ.DELETE}?id=${id}`
    );
    return response.data;
  },
};
