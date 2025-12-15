import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { 
    InventoryLedgerListRequest, 
    InventoryLedgerListResponse, 
    ResultMessage 
} from '../types';

export const inventoryLedgerService = {
  getLedger: async (request: InventoryLedgerListRequest): Promise<InventoryLedgerListResponse> => {
    const response = await Api.get<ResultMessage<InventoryLedgerListResponse>>(API_ENDPOINTS.INVENTORY_LEDGER_GET, {
      params: request,
    });
    return response.data.result;
  },

  getCurrentStock: async (warehouseId: string, materialId: string): Promise<number> => {
    const response = await Api.get<ResultMessage<number>>(API_ENDPOINTS.INVENTORY_LEDGER_CURRENT_STOCK, {
      params: { warehouseId, materialId },
    });
    return response.data.result;
  },
};
