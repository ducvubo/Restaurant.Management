import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';

export const inventoryLedgerService = {
  /**
   * Get inventory ledger entries
   */
  get: async (params: {
    warehouseId?: string;
    materialId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  }): Promise<any> => {
    const response = await Api.get(API_ENDPOINTS.INVENTORY_LEDGER_GET, { params });
    return response.data.result;
  },

  /**
   * Get current stock (total)
   */
  getCurrentStock: async (warehouseId: string, materialId: string): Promise<number> => {
    const response = await Api.get(API_ENDPOINTS.INVENTORY_LEDGER_CURRENT_STOCK, {
      params: { warehouseId, materialId },
    });
    return response.data.result;
  },
  /**
   * Get available stock (can be used for stock out)
   */
  getAvailableStock: async (warehouseId: string, materialId: string): Promise<number> => {
    const response = await Api.get(API_ENDPOINTS.INVENTORY_LEDGER_AVAILABLE_STOCK, {
      params: { warehouseId, materialId },
    });
    return response.data.result;
  },
};
