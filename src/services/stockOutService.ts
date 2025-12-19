import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { 
    StockTransaction, 
    StockTransactionListRequest, 
    StockTransactionListResponse, 
    ResultMessage,
    StockOutItemRequest
} from '../types';

export interface StockOutRequest {
  warehouseId: string;
  destinationBranchId?: string;
  transactionDate?: string;
  referenceNumber?: string;
  notes?: string;
  issuedBy?: string;              // Người xuất kho
  receivedBy?: string;            // Người tiếp nhận (chuyển kho)
  items: StockOutItemRequest[];
  // Stock Out Type fields
  stockOutType?: number;              // 1=Transfer, 2=Sale, 3=Disposal
  destinationWarehouseId?: string;    // For INTERNAL_TRANSFER
  customerId?: string;                // For RETAIL_SALE
  disposalReason?: string;            // For DISPOSAL
}

/**
 * Stock Out Service - handles all stock out operations
 * Uses new separated API endpoint: /api/management/stock-out
 */
export const stockOutService = {
  /**
   * Create a new stock out transaction (draft)
   */
  create: async (data: StockOutRequest): Promise<ResultMessage<StockTransaction>> => {
    const response = await Api.post<ResultMessage<StockTransaction>>(API_ENDPOINTS.STOCK_OUT.CREATE, data);
    return response.data;
  },

  /**
   * Update an existing stock out transaction (only if not locked)
   */
  update: async (id: string, data: StockOutRequest): Promise<ResultMessage<StockTransaction>> => {
    const response = await Api.put<ResultMessage<StockTransaction>>(API_ENDPOINTS.STOCK_OUT.UPDATE, data, {
      params: { id }
    });
    return response.data;
  },

  /**
   * Get stock out transaction by ID
   */
  getById: async (id: string): Promise<StockTransaction> => {
    const response = await Api.get<ResultMessage<StockTransaction>>(API_ENDPOINTS.STOCK_OUT.GET, {
      params: { id }
    });
    return response.data.result;
  },

  /**
   * Get paginated list of stock out transactions
   */
  getList: async (request: StockTransactionListRequest): Promise<StockTransactionListResponse> => {
    const response = await Api.get<ResultMessage<StockTransactionListResponse>>(API_ENDPOINTS.STOCK_OUT.LIST, {
      params: request,
    });
    return response.data.result;
  },

  /**
   * Lock a stock out transaction (finalize, deduct inventory, post to ledger)
   */
  lock: async (id: string): Promise<ResultMessage<string>> => {
    const response = await Api.post<ResultMessage<string>>(API_ENDPOINTS.STOCK_OUT.LOCK, null, {
      params: { id }
    });
    return response.data;
  },

  /**
   * Unlock a stock out transaction (reverse inventory deduction)
   */
  unlock: async (id: string): Promise<ResultMessage<string>> => {
    const response = await Api.post<ResultMessage<string>>(API_ENDPOINTS.STOCK_OUT.UNLOCK, null, {
      params: { id }
    });
    return response.data;
  },

  /**
   * Preview ledger entries and FIFO batch allocation before locking
   */
  previewLedger: async (id: string): Promise<any> => {
    const response = await Api.get<ResultMessage<any>>(API_ENDPOINTS.STOCK_OUT.PREVIEW, {
      params: { id }
    });
    return response.data.result;
  },

  /**
   * Export stock out transaction to PDF
   */
  exportPdf: async (id: string): Promise<void> => {
    const response = await Api.get(`${API_ENDPOINTS.STOCK_TRANSACTION_BASE}/export-pdf`, {
      params: { id },
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'Phieu_Xuat_Kho.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
