import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';

export interface InventoryCountItemRequest {
  materialId: string;
  unitId: string;
  inventoryLedgerId: string;
  actualQuantity: number;
  notes?: string;
}

export interface InventoryCountRequest {
  warehouseId: string;
  countDate: string;
  notes?: string;
  items: InventoryCountItemRequest[];
}

export interface InventoryCountItem {
  id: string;
  inventoryCountId: string;
  materialId: string;
  materialName: string;
  unitId: string;
  unitName: string;
  inventoryLedgerId: string;
  batchNumber: string;
  transactionDate: string;
  systemQuantity: number;
  actualQuantity: number;
  differenceQuantity: number;
  notes?: string;
  createdDate: string;
}

export interface InventoryCount {
  id: string;
  countCode: string;
  warehouseId: string;
  warehouseName: string;
  countDate: string;
  countStatus: number;
  countStatusName: string;
  notes?: string;
  adjustmentTransactionId?: string;
  adjustmentTransactionCode?: string;
  performedBy?: string;
  performedByName?: string;
  status: number;
  createdDate: string;
  updatedDate?: string;
  items: InventoryCountItem[];
}

export interface BatchInfo {
  inventoryLedgerId: string;
  materialId: string;
  materialName: string;
  unitId: string;
  unitName: string;
  batchNumber: string;
  transactionDate: string;
  remainingQuantity: number;
}

export interface InventoryCountListRequest {
  page?: number;
  size?: number;
  warehouseId?: string;
  countStatus?: number;
  fromDate?: string;
  toDate?: string;
  status?: number;
}

export interface InventoryCountListResponse {
  items: InventoryCount[];
  total: number;
  page: number;
  size: number;
}

const inventoryCountService = {
  create: (data: InventoryCountRequest) => {
    return Api.post(API_ENDPOINTS.INVENTORY_COUNT.CREATE, data);
  },

  update: (id: string, data: InventoryCountRequest) => {
    return Api.put(`${API_ENDPOINTS.INVENTORY_COUNT.UPDATE}?id=${id}`, data);
  },

  get: (id: string) => {
    return Api.get(`${API_ENDPOINTS.INVENTORY_COUNT.GET}?id=${id}`);
  },

  list: (params: InventoryCountListRequest) => {
    return Api.get(API_ENDPOINTS.INVENTORY_COUNT.LIST, { params });
  },

  delete: (id: string) => {
    return Api.delete(`${API_ENDPOINTS.INVENTORY_COUNT.DELETE}?id=${id}`);
  },

  loadBatches: (warehouseId: string) => {
    return Api.get(`${API_ENDPOINTS.INVENTORY_COUNT.LOAD_BATCHES}?warehouseId=${warehouseId}`);
  },

  complete: (id: string) => {
    return Api.post(`${API_ENDPOINTS.INVENTORY_COUNT.COMPLETE}?id=${id}`);
  },

  cancel: (id: string) => {
    return Api.post(`${API_ENDPOINTS.INVENTORY_COUNT.CANCEL}?id=${id}`);
  },

  exportPdf: async (id: string): Promise<void> => {
    const response = await Api.get(`${API_ENDPOINTS.INVENTORY_COUNT.BASE}/export-pdf`, {
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
    let filename = 'Phieu_KiemKe.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=\"?(.+)\"?/);
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

export default inventoryCountService;
