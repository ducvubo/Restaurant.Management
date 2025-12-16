// Common types
export interface ResultMessage<T> {
  success: boolean;
  message: string;
  code: number;
  timestamp: number;
  result: T;
}

// User types
export interface User {
  id: string; // UUID
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  policyIds?: string[]; // policy ids assigned to user
  createdBy?: string; // UUID
  updatedBy?: string; // UUID
  deletedBy?: string; // UUID
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
  status: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  address?: string;
  policyIds?: string[]; // policy ids assigned to user
}

export interface UpdateUserRequest {
  id?: string; // UUID - required for update
  email?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  policyIds?: string[]; // policy ids assigned to user
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
}

export interface UserListRequest {
  keyword?: string;
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
  page?: number;
  size?: number;
}

export interface UserListResponse {
  items: User[];
  page: number;
  size: number;
  total: number;
}

// Policy types
export interface Policy {
  id: string; // UUID
  name: string;
  description?: string;
  policies: string[]; // List of permission keys
  status: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
  createdBy?: string; // UUID
  updatedBy?: string; // UUID
  deletedBy?: string; // UUID
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}

export interface CreatePolicyRequest {
  name: string;
  description?: string;
  policies: string[]; // List of permission keys
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
}

export interface UpdatePolicyRequest {
  id?: string; // UUID - required for update
  name?: string;
  description?: string;
  policies?: string[]; // List of permission keys
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
}

export interface PolicyListRequest {
  page?: number; // Backend uses 1-based page
  size?: number;
  keyword?: string; // Backend uses keyword instead of search
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
}

export interface PolicyListResponse {
  items: Policy[]; // Backend uses items instead of data
  page: number;
  size: number;
  total: number;
}

// Branch types
export interface Branch {
  id: string; // UUID
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  openingTime: string; // LocalTime format: "HH:mm:ss"
  closingTime: string; // LocalTime format: "HH:mm:ss"
  status: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE
  createdBy?: string; // UUID
  updatedBy?: string; // UUID
  createdDate: string;
  updatedDate: string;
}

export interface CreateBranchRequest {
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  openingTime: string; // LocalTime format: "HH:mm:ss"
  closingTime: string; // LocalTime format: "HH:mm:ss"
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE
}

export interface UpdateBranchRequest {
  id?: string; // UUID - required for update
  code?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  openingTime?: string; // LocalTime format: "HH:mm:ss"
  closingTime?: string; // LocalTime format: "HH:mm:ss"
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE
}


export interface BranchListRequest {
  keyword?: string;
  status?: number; // DataStatus: 1 = ACTIVE, 0 = INACTIVE
  page?: number;
  size?: number;
}

export interface BranchListResponse {
  items: Branch[];
  page: number;
  size: number;
  total: number;
}

// Unit types
export interface Unit {
  id: string; // UUID
  code: string;
  name: string;
  symbol?: string;
  baseUnitId?: string; // UUID
  baseUnitName?: string;
  conversionRate?: number;
  description?: string;
  status: number;
  createdBy?: string;
  updatedBy?: string;
  createdDate: string;
  updatedDate: string;
}

export interface CreateUnitRequest {
  code: string;
  name: string;
  symbol?: string;
  baseUnitId?: string;
  conversionRate?: number;
  description?: string;
}

export interface UpdateUnitRequest {
  id?: string;
  code: string;
  name: string;
  symbol?: string;
  baseUnitId?: string;
  conversionRate?: number;
  description?: string;
}

export interface UnitListRequest {
  keyword?: string;
  status?: number;
  page?: number;
  size?: number;
}

export interface UnitListResponse {
  items: Unit[];
  page: number;
  size: number;
  total: number;
}

// Supplier types
export interface Supplier {
  id: string; // UUID
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  paymentTerms?: string;
  rating?: number; // 1-5
  notes?: string;
  status: number;
  createdBy?: string;
  updatedBy?: string;
  createdDate: string;
  updatedDate: string;
}

export interface CreateSupplierRequest {
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
}

export interface UpdateSupplierRequest {
  id?: string;
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
}

export interface SupplierListRequest {
  keyword?: string;
  status?: number;
  page?: number;
  size?: number;
}

export interface SupplierListResponse {
  items: Supplier[];
  page: number;
  size: number;
  total: number;
}

// Warehouse Types
export interface Warehouse {
    id: string;
    code: string;
    name: string;
    branchId: string;
    branchName?: string;
    address: string;
    capacity: number;
    managerId: string;
    managerName?: string;
    warehouseType: number;
    warehouseTypeName?: string;
    status: number;
    createdDate?: string;
    updatedDate?: string;
}

export interface CreateWarehouseRequest {
    code: string;
    name: string;
    branchId: string;
    address: string;
    capacity: number;
    managerId: string;
    warehouseType: number;
}

export interface UpdateWarehouseRequest {
    id: string;
    code: string;
    name: string;
    branchId: string;
    address: string;
    capacity: number;
    managerId: string;
    warehouseType: number;
}

export interface WarehouseListRequest {
    page?: number;
    size?: number;
    keyword?: string;
    status?: number;
    branchId?: string;
    warehouseType?: number;
}

export interface WarehouseListResponse {
    items: Warehouse[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
}

// Material Types
export interface Material {
    id: string;
    code: string;
    name: string;
    category: string;
    unitId: string;
    unitName?: string;
    unitPrice: number;
    minStockLevel: number;
    maxStockLevel: number;
    description: string;
    status: number;
    createdDate?: string;
    updatedDate?: string;
}

export interface CreateMaterialRequest {
    code: string;
    name: string;
    category: string;
    unitId: string;
    unitPrice: number;
    minStockLevel: number;
    maxStockLevel: number;
    description: string;
}

export interface UpdateMaterialRequest {
    id: string;
    code: string;
    name: string;
    category: string;
    unitId: string;
    unitPrice: number;
    minStockLevel: number;
    maxStockLevel: number;
    description: string;
}

export interface MaterialListRequest {
    page?: number;
    size?: number;
    keyword?: string;
    status?: number;
    category?: string;
}

export interface MaterialListResponse {
    items: Material[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
}

// Stock Transaction Types (Combined DTO for both IN and OUT)
export interface StockTransaction {
    id: string;
    transactionCode: string;
    warehouseId: string;
    warehouseName: string;
    materialId?: string;
    materialName?: string;
    supplierId?: string;
    supplierName?: string;
    transactionType: number; // 1=IN, 2=OUT
    transactionTypeName: string;
    quantity?: number;
    unitId?: string;
    unitName?: string;
    unitPrice?: number;
    totalAmount?: number;
    transactionDate: string;
    referenceNumber?: string;
    destinationBranchId?: string;
    notes?: string;
    performedBy?: string;
    status: number;
    createdBy?: string;
    createdDate: string;
    isLocked: boolean;
    
    // Stock In specific
    stockInItems?: StockInItemDTO[];
    
    // Stock Out specific
    stockOutItems?: StockOutItemDTO[];
    stockOutType?: number;              // 1=Transfer, 2=Sale, 3=Disposal
    stockOutTypeName?: string;
    destinationWarehouseId?: string;    // For INTERNAL_TRANSFER
    destinationWarehouseName?: string;
    customerId?: string;                // For RETAIL_SALE
    customerName?: string;
    disposalReason?: string;            // For DISPOSAL
}

// Stock In/Out Item types
export interface StockInItemRequest {
    materialId: string;
    unitId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
}

export interface StockOutItemRequest {
    materialId: string;
    unitId: string;
    quantity: number;
    notes?: string;
}

export interface StockInItemDTO {
    id: string;
    materialId: string;
    materialName?: string;
    unitId: string;
    unitName?: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    notes?: string;
}

export interface StockOutItemDTO {
    id: string;
    materialId: string;
    materialName?: string;
    unitId: string;
    unitName?: string;
    quantity: number;
    unitPrice?: number;
    totalAmount?: number;
    notes?: string;
    batchMappings?: StockOutBatchMappingDTO[];
}

export interface StockOutBatchMappingDTO {
    id: string;
    inventoryLedgerId: string;
    sourceBatchNumber?: string;
    quantity: number;
    unitPrice?: number;
    totalAmount?: number;
}

export interface StockInRequest {
    warehouseId: string;
    supplierId: string;
    transactionDate: string; // ISO string
    referenceNumber: string;
    notes?: string;
    items: StockInItemRequest[]; // Danh sách nguyên liệu
}

export interface StockOutRequest {
    warehouseId: string;
    destinationBranchId?: string;
    transactionDate: string; // ISO string
    referenceNumber: string;
    notes?: string;
    items: StockOutItemRequest[]; // Danh sách nguyên liệu
}

export interface StockTransactionListRequest {
    page?: number;
    size?: number;
    warehouseId?: string;
    materialId?: string;
    transactionType?: number;
    startDate?: string;
    endDate?: string;
}

export interface StockTransactionListResponse {
    items: StockTransaction[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
}

// Inventory Ledger Types
export interface InventoryLedger {
    id: string;
    warehouseId: string;
    warehouseName?: string;
    materialId: string;
    materialName?: string;
    transactionId: string;
    transactionCode?: string;
    transactionDate: string;
    transactionType: number;
    transactionTypeName?: string;
    quantityIn: number;
    quantityOut: number;
    balance: number;
    remainingQuantity?: number;  // Số lượng còn lại (cho FIFO)
    unitPrice: number;
    totalValue: number;
    inventoryMethod: number;
    batchNumber: string;
    createdDate: string;
}

export interface InventoryLedgerListRequest {
    page?: number;
    size?: number;
    warehouseId: string; // Required
    materialId: string; // Required
    startDate?: string;
    endDate?: string;
}

export interface InventoryLedgerListResponse {
    items: InventoryLedger[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
}
// Material Category Types
export interface MaterialCategory {
    id: string;
    code: string;
    name: string;
    description?: string;
    status: number;
    createdDate: string;
    updatedDate?: string;
}

export interface CreateMaterialCategoryRequest {
    code: string;
    name: string;
    description?: string;
}

export interface UpdateMaterialCategoryRequest {
    id: string;
    code: string;
    name: string;
    description?: string;
}

export interface MaterialCategoryListRequest {
    page?: number;
    size?: number;
    keyword?: string;
}

export interface MaterialCategoryListResponse {
    items: MaterialCategory[];
    page: number;
    size: number;
    total: number;
}
