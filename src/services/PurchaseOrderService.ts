import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { 
  PurchaseOrder, 
  PurchaseOrderRequest, 
  ReceiveGoodsRequest,
  PurchaseListRequest, 
  PageResponse 
} from '../types/purchasing';
import type { ResultMessage } from '../types';

export const purchaseOrderService = {
  // Get list with pagination
  getList: async (request: PurchaseListRequest): Promise<PageResponse<PurchaseOrder>> => {
    const response = await Api.get<ResultMessage<PageResponse<PurchaseOrder>>>(
      API_ENDPOINTS.PURCHASE_ORDER.LIST,
      { params: request }
    );
    return response.data.result;
  },

  // Get by ID
  getById: async (id: string): Promise<PurchaseOrder> => {
    const response = await Api.get<ResultMessage<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDER.GET,
      { params: { id } }
    );
    return response.data.result;
  },

  // Create
  create: async (data: PurchaseOrderRequest): Promise<ResultMessage<PurchaseOrder>> => {
    const response = await Api.post<ResultMessage<PurchaseOrder>>(
      API_ENDPOINTS.PURCHASE_ORDER.CREATE,
      data
    );
    return response.data;
  },

  // Create from RFQ
  createFromRfq: async (rfqId: string): Promise<ResultMessage<PurchaseOrder>> => {
    const response = await Api.post<ResultMessage<PurchaseOrder>>(
      `${API_ENDPOINTS.PURCHASE_ORDER.CREATE_FROM_RFQ}?rfqId=${rfqId}`
    );
    return response.data;
  },

  // Update
  update: async (id: string, data: PurchaseOrderRequest): Promise<ResultMessage<PurchaseOrder>> => {
    const response = await Api.put<ResultMessage<PurchaseOrder>>(
      `${API_ENDPOINTS.PURCHASE_ORDER.UPDATE}?id=${id}`,
      data
    );
    return response.data;
  },

  // Confirm with supplier
  confirm: async (id: string): Promise<ResultMessage<PurchaseOrder>> => {
    const response = await Api.post<ResultMessage<PurchaseOrder>>(
      `${API_ENDPOINTS.PURCHASE_ORDER.CONFIRM}?id=${id}`
    );
    return response.data;
  },

  // Receive goods
  receiveGoods: async (id: string, data: ReceiveGoodsRequest): Promise<ResultMessage<PurchaseOrder>> => {
    const response = await Api.post<ResultMessage<PurchaseOrder>>(
      `${API_ENDPOINTS.PURCHASE_ORDER.RECEIVE_GOODS}?id=${id}`,
      data
    );
    return response.data;
  },

  // Cancel
  cancel: async (id: string): Promise<ResultMessage<PurchaseOrder>> => {
    const response = await Api.post<ResultMessage<PurchaseOrder>>(
      `${API_ENDPOINTS.PURCHASE_ORDER.CANCEL}?id=${id}`
    );
    return response.data;
  },

  // Delete (only DRAFT)
  delete: async (id: string): Promise<ResultMessage<void>> => {
    const response = await Api.delete<ResultMessage<void>>(
      `${API_ENDPOINTS.PURCHASE_ORDER.DELETE}?id=${id}`
    );
    return response.data;
  },
};
