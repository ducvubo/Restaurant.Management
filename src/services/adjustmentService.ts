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
  performedBy?: string;
  performedByName?: string;
  createdBy?: string;
  createdByName?: string;
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

  exportPdf: async (id: string): Promise<void> => {
    const response = await Api.get(`${API_ENDPOINTS.ADJUSTMENT_BASE}/export-pdf`, {
      params: { id },
      responseType: 'blob'
    });
    
    // Create blob from response
    const blob = new Blob([response.data], { type: 'application/pdf' });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from content-disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'Phieu_DieuChinh.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
