import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { ResultMessage } from '../types';

export interface AdjustmentItemRequest {
  materialId: string;
  unitId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface AdjustmentTransactionRequest {
  warehouseId: string;
  adjustmentType: number;
  transactionDate: string;
  reason: string;
  referenceNumber?: string;
  notes?: string;
  items: AdjustmentItemRequest[];
}

export interface AdjustmentTransaction {
  id: string;
  transactionCode: string;
  warehouseId: string;
  warehouseName: string;
  adjustmentType: number;
  adjustmentTypeName: string;
  transactionDate: string;
  reason: string;
  referenceNumber?: string;
  notes?: string;
  totalAmount: number;
  isLocked: boolean;
  status: number;
  createdDate: string;
  items?: AdjustmentItemRequest[];
}

export interface AdjustmentListResponse {
  items: AdjustmentTransaction[];
  total: number;
  page: number;
  size: number;
}

export const adjustmentService = {
  list: async (page: number = 1, size: number = 10): Promise<AdjustmentListResponse> => {
    const response = await Api.get<ResultMessage<AdjustmentListResponse>>(API_ENDPOINTS.ADJUSTMENT_LIST, {
      params: { page, size }
    });
    return response.data.result;
  },

  get: async (id: string): Promise<AdjustmentTransaction> => {
    const response = await Api.get<ResultMessage<AdjustmentTransaction>>(API_ENDPOINTS.ADJUSTMENT_GET, {
      params: { id }
    });
    return response.data.result;
  },

  create: async (data: AdjustmentTransactionRequest): Promise<ResultMessage<AdjustmentTransaction>> => {
    const response = await Api.post<ResultMessage<AdjustmentTransaction>>(API_ENDPOINTS.ADJUSTMENT_CREATE, data);
    return response.data;
  },

  update: async (id: string, data: AdjustmentTransactionRequest): Promise<ResultMessage<AdjustmentTransaction>> => {
    const response = await Api.put<ResultMessage<AdjustmentTransaction>>(`${API_ENDPOINTS.ADJUSTMENT_UPDATE}?id=${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ResultMessage<void>> => {
    const response = await Api.delete<ResultMessage<void>>(`${API_ENDPOINTS.ADJUSTMENT_DELETE}?id=${id}`);
    return response.data;
  },

  lock: async (id: string): Promise<ResultMessage<void>> => {
    const response = await Api.post<ResultMessage<void>>(API_ENDPOINTS.ADJUSTMENT_LOCK, null, {
      params: { id }
    });
    return response.data;
  },

  unlock: async (id: string): Promise<ResultMessage<void>> => {
    const response = await Api.post<ResultMessage<void>>(API_ENDPOINTS.ADJUSTMENT_UNLOCK, null, {
      params: { id }
    });
    return response.data;
  },

  previewLedger: async (id: string) => {
    const response = await Api.get<ResultMessage<any>>(API_ENDPOINTS.ADJUSTMENT_PREVIEW_LEDGER, {
      params: { id }
    });
    return response.data.result;
  },
};
