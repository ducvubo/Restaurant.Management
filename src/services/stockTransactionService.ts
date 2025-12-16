import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { 
    StockTransaction, 
    StockInRequest, 
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
  items: StockOutItemRequest[];
  // Stock Out Type fields
  stockOutType?: number;              // 1=Transfer, 2=Sale, 3=Disposal
  destinationWarehouseId?: string;    // For INTERNAL_TRANSFER
  customerId?: string;                // For RETAIL_SALE
  disposalReason?: string;            // For DISPOSAL
}

export const stockTransactionService = {
  stockIn: async (data: StockInRequest): Promise<ResultMessage<StockTransaction>> => {
    const response = await Api.post<ResultMessage<StockTransaction>>(API_ENDPOINTS.STOCK_TRANSACTION_IN, data);
    return response.data;
  },

  updateStockIn: async (id: string, data: StockInRequest): Promise<ResultMessage<StockTransaction>> => {
    const response = await Api.put<ResultMessage<StockTransaction>>(`${API_ENDPOINTS.STOCK_TRANSACTION_IN}?id=${id}`, data);
    return response.data;
  },

  stockOut: async (data: StockOutRequest): Promise<ResultMessage<StockTransaction>> => {
    const response = await Api.post<ResultMessage<StockTransaction>>(API_ENDPOINTS.STOCK_TRANSACTION_OUT, data);
    return response.data;
  },

  updateStockOut: async (id: string, data: StockOutRequest): Promise<ResultMessage<StockTransaction>> => {
    const response = await Api.put<ResultMessage<StockTransaction>>(`${API_ENDPOINTS.STOCK_TRANSACTION_OUT}?id=${id}`, data);
    return response.data;
  },

  getTransaction: async (id: string): Promise<StockTransaction> => {
    const response = await Api.get<ResultMessage<StockTransaction>>(API_ENDPOINTS.STOCK_TRANSACTION_GET, {
      params: { id },
    });
    return response.data.result;
  },

  getList: async (request: StockTransactionListRequest): Promise<StockTransactionListResponse> => {
    const response = await Api.get<ResultMessage<StockTransactionListResponse>>(API_ENDPOINTS.STOCK_TRANSACTION_LIST, {
      params: request,
    });
    return response.data.result;
  },

  lockTransaction: async (id: string): Promise<ResultMessage<string>> => {
    const response = await Api.post<ResultMessage<string>>(`${API_ENDPOINTS.STOCK_TRANSACTION_BASE}/lock`, null, {
      params: { id },
    });
    return response.data;
  },

  unlockTransaction: async (id: string): Promise<ResultMessage<string>> => {
    const response = await Api.post<ResultMessage<string>>(API_ENDPOINTS.STOCK_TRANSACTION_UNLOCK, null, {
      params: { id },
    });
    return response.data;
  },

  previewLedger: async (id: string): Promise<any> => {
    const response = await Api.get<ResultMessage<any>>(API_ENDPOINTS.STOCK_TRANSACTION_PREVIEW_LEDGER, {
      params: { id },
    });
    return response.data.result;
  },
};
