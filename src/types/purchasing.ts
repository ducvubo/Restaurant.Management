// =============================================
// Purchase Requisition Types
// =============================================

export interface PurchaseRequisition {
  id: string;
  requisitionCode: string;
  warehouseId: string;
  warehouseName?: string;
  requestedBy: string;
  requestedByName?: string;
  requestDate: string;
  requiredDate?: string;
  priority: number;
  priorityName?: string;
  notes?: string;
  status: number;
  statusName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  totalEstimatedAmount?: number;
  createdBy?: string;
  updatedBy?: string;
  createdDate?: string;
  updatedDate?: string;
  items?: PurchaseRequisitionItem[];
}

export interface PurchaseRequisitionItem {
  id?: string;
  requisitionId?: string;
  materialId: string;
  materialCode?: string;
  materialName?: string;
  quantity: number;
  unitId: string;
  unitName?: string;
  estimatedPrice?: number;
  estimatedAmount?: number;
  notes?: string;
}

export interface PurchaseRequisitionRequest {
  id?: string;
  warehouseId: string;
  requiredDate?: string;
  priority?: number;
  notes?: string;
  items: PurchaseRequisitionItemRequest[];
}

export interface PurchaseRequisitionItemRequest {
  id?: string;
  materialId: string;
  quantity: number;
  unitId: string;
  estimatedPrice?: number;
  notes?: string;
}

// =============================================
// RFQ Types
// =============================================

export interface Rfq {
  id: string;
  rfqCode: string;
  requisitionId?: string;
  requisitionCode?: string;
  supplierId: string;
  supplierName?: string;
  sentDate?: string;
  validUntil?: string;
  totalAmount?: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  status: number;
  statusName?: string;
  createdBy?: string;
  updatedBy?: string;
  createdDate?: string;
  updatedDate?: string;
  items?: RfqItem[];
}

export interface RfqItem {
  id?: string;
  rfqId?: string;
  materialId: string;
  materialCode?: string;
  materialName?: string;
  quantity: number;
  unitId: string;
  unitName?: string;
  unitPrice?: number;
  amount?: number;
  notes?: string;
}

export interface RfqRequest {
  id?: string;
  requisitionId?: string;
  supplierId: string;
  validUntil?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  items: RfqItemRequest[];
}

export interface RfqItemRequest {
  id?: string;
  materialId: string;
  quantity: number;
  unitId: string;
  unitPrice?: number;
  notes?: string;
}

// =============================================
// Purchase Order Types
// =============================================

export interface PurchaseOrder {
  id: string;
  poCode: string;
  rfqId?: string;
  rfqCode?: string;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  totalAmount?: number;
  receivedAmount?: number;
  remainingAmount?: number;
  receivingProgress?: number;
  notes?: string;
  status: number;
  statusName?: string;
  createdBy?: string;
  updatedBy?: string;
  createdDate?: string;
  updatedDate?: string;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id?: string;
  poId?: string;
  materialId: string;
  materialCode?: string;
  materialName?: string;
  quantity: number;
  receivedQuantity?: number;
  remainingQuantity?: number;
  unitId: string;
  unitName?: string;
  unitPrice: number;
  amount?: number;
  notes?: string;
  isFullyReceived?: boolean;
}

export interface PurchaseOrderRequest {
  id?: string;
  rfqId?: string;
  supplierId: string;
  warehouseId: string;
  expectedDeliveryDate?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  items: PurchaseOrderItemRequest[];
}

export interface PurchaseOrderItemRequest {
  id?: string;
  materialId: string;
  quantity: number;
  unitId: string;
  unitPrice: number;
  notes?: string;
}

export interface ReceiveGoodsRequest {
  performedBy?: string;
  notes?: string;
  items: ReceiveGoodsItemRequest[];
}

export interface ReceiveGoodsItemRequest {
  poItemId: string;
  receivedQuantity: number;
  notes?: string;
}

// =============================================
// Common Types
// =============================================

export interface PurchaseListRequest {
  page?: number;
  size?: number;
  keyword?: string;
  warehouseId?: string;
  supplierId?: string;
  status?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDir?: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
