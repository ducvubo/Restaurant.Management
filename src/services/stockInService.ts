import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { 
    StockTransaction, 
    StockInRequest, 
    StockTransactionListRequest, 
    StockTransactionListResponse, 
    ResultMessage
} from '../types';

/**
 * Stock In Service - handles all stock in operations
 * Uses new separated API endpoint: /api/management/stock-in
 */
export const stockInService = {
  /**
   * Create a new stock in transaction (draft)
   */
  create: async (data: StockInRequest): Promise<ResultMessage<StockTransaction>> => {
    const response = await Api.post<ResultMessage<StockTransaction>>(API_ENDPOINTS.STOCK_IN.CREATE, data);
    return response.data;
  },

  /**
   * Update an existing stock in transaction (only if not locked)
   */
  update: async (id: string, data: StockInRequest): Promise<ResultMessage<StockTransaction>> => {
    const response = await Api.put<ResultMessage<StockTransaction>>(API_ENDPOINTS.STOCK_IN.UPDATE, data, {
      params: { id }
    });
    return response.data;
  },

  /**
   * Get stock in transaction by ID
   */
  getById: async (id: string): Promise<StockTransaction> => {
    const response = await Api.get<ResultMessage<StockTransaction>>(API_ENDPOINTS.STOCK_IN.GET, {
      params: { id }
    });
    return response.data.result;
  },

  /**
   * Get paginated list of stock in transactions
   */
  getList: async (request: StockTransactionListRequest): Promise<StockTransactionListResponse> => {
    const response = await Api.get<ResultMessage<StockTransactionListResponse>>(API_ENDPOINTS.STOCK_IN.LIST, {
      params: request,
    });
    return response.data.result;
  },

  /**
   * Lock a stock in transaction (finalize and post to ledger)
   */
  lock: async (id: string): Promise<ResultMessage<string>> => {
    const response = await Api.post<ResultMessage<string>>(API_ENDPOINTS.STOCK_IN.LOCK, null, {
      params: { id }
    });
    return response.data;
  },

  /**
   * Unlock a stock in transaction (reverse ledger entries)
   */
  unlock: async (id: string): Promise<ResultMessage<string>> => {
    const response = await Api.post<ResultMessage<string>>(API_ENDPOINTS.STOCK_IN.UNLOCK, null, {
      params: { id }
    });
    return response.data;
  },

  /**
   * Preview ledger entries before locking
   */
  previewLedger: async (id: string): Promise<any> => {
    const response = await Api.get<ResultMessage<any>>(API_ENDPOINTS.STOCK_IN.PREVIEW, {
      params: { id }
    });
    return response.data.result;
  },

  /**
   * Export stock in transaction to PDF
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
    let filename = 'Phieu_Nhap_Kho.pdf';
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
