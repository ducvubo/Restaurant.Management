import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { 
    StockTransaction, 
    StockInRequest, 
    StockOutRequest, 
    StockTransactionListRequest, 
    StockTransactionListResponse, 
    ResultMessage 
} from '../types';

export const stockTransactionService = {
  stockIn: async (data: StockInRequest): Promise<ResultMessage<StockTransaction>> => {
    const response = await Api.post<ResultMessage<StockTransaction>>(API_ENDPOINTS.STOCK_TRANSACTION_IN, data);
    return response.data;
  },

  stockOut: async (data: StockOutRequest): Promise<ResultMessage<StockTransaction>> => {
    const response = await Api.post<ResultMessage<StockTransaction>>(API_ENDPOINTS.STOCK_TRANSACTION_OUT, data);
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
};
