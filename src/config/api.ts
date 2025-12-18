export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/management/auth/login',
  LOGOUT: '/management/auth/logout',
  REFRESH_TOKEN: '/management/auth/refresh',
  // User Management
  USERS: '/management/users',
  USER_GET: '/management/users/get',
  USER_GET_BY_USERNAME: '/management/users/getByUsername',
  USER_ADD: '/management/users/add',
  USER_UPDATE: '/management/users/update',
  USER_DISABLE: '/management/users/disable',
  USER_ENABLE: '/management/users/enable',
  USER_LIST: '/management/users/list',
  // Policy Management
  POLICY_GET: '/management/policy/get',
  POLICY_ADD: '/management/policy/add',
  POLICY_UPDATE: '/management/policy/update',
  POLICY_DELETE: '/management/policy/delete',
  POLICY_LIST: '/management/policy/list',
  POLICY_ALL: '/management/policy/all',
  // Permission
  PERMISSION_LIST: '/management/permission/list',
  // Branch Management
  BRANCH_GET: '/management/branches/get',
  BRANCH_GET_ALL: '/management/branches/get-all',
  BRANCH_GET_ALL_ACTIVE: '/management/branches/get-all-active',
  BRANCH_CREATE: '/management/branches/create',
  BRANCH_UPDATE: '/management/branches/update',
  BRANCH_ACTIVATE: '/management/branches/activate',
  BRANCH_DEACTIVATE: '/management/branches/deactivate',
  BRANCH_LIST: '/management/branches/list',
  // Unit Management
  UNIT_GET: '/management/units/get',
  UNIT_GET_ALL: '/management/units/get-all',
  UNIT_BASE_UNITS: '/management/units/base-units',
  UNIT_CREATE: '/management/units/create',
  UNIT_UPDATE: '/management/units/update',
  UNIT_ACTIVATE: '/management/units/activate',
  UNIT_DEACTIVATE: '/management/units/deactivate',
  UNIT_LIST: '/management/units/list',
  // Supplier Management
  SUPPLIER_GET: '/management/suppliers/get',
  SUPPLIER_GET_ALL: '/management/suppliers/get-all',
  SUPPLIER_CREATE: '/management/suppliers/create',
  SUPPLIER_UPDATE: '/management/suppliers/update',
  SUPPLIER_ACTIVATE: '/management/suppliers/activate',
  SUPPLIER_DEACTIVATE: '/management/suppliers/deactivate',
  SUPPLIER_LIST: '/management/suppliers/list',

  // Warehouse Management
  WAREHOUSE_GET: '/management/warehouses/get',
  WAREHOUSE_CREATE: '/management/warehouses/create',
  WAREHOUSE_UPDATE: '/management/warehouses/update',
  WAREHOUSE_LIST: '/management/warehouses/list',
  WAREHOUSE_ACTIVATE: '/management/warehouses/activate',
  WAREHOUSE_DEACTIVATE: '/management/warehouses/deactivate',

  // Material Management
  MATERIAL_GET: '/management/materials/get',
  MATERIAL_CREATE: '/management/materials/create',
  MATERIAL_UPDATE: '/management/materials/update',
  MATERIAL_LIST: '/management/materials/list',
  MATERIAL_ACTIVATE: '/management/materials/activate',
  MATERIAL_DEACTIVATE: '/management/materials/deactivate',

  // Material Category Management
  MATERIAL_CATEGORY_GET: '/management/material-categories/get',
  MATERIAL_CATEGORY_GET_ALL: '/management/material-categories/get-all',
  MATERIAL_CATEGORY_CREATE: '/management/material-categories/create',
  MATERIAL_CATEGORY_UPDATE: '/management/material-categories/update',
  MATERIAL_CATEGORY_ACTIVATE: '/management/material-categories/activate',
  MATERIAL_CATEGORY_DEACTIVATE: '/management/material-categories/deactivate',
  MATERIAL_CATEGORY_LIST: '/management/material-categories/list',

  // Customer Management
  CUSTOMER_GET: '/management/customers/get',
  CUSTOMER_CREATE: '/management/customers/create',
  CUSTOMER_UPDATE: '/management/customers/update',
  CUSTOMER_LIST: '/management/customers/list',
  CUSTOMER_DEACTIVATE: '/management/customers/deactivate',
  CUSTOMER_ACTIVATE: '/management/customers/activate',

  // Stock Transaction Management
  STOCK_TRANSACTION_BASE: '/management/stock-transactions',
  STOCK_TRANSACTION_IN: '/management/stock-transactions/in',
  STOCK_TRANSACTION_OUT: '/management/stock-transactions/out',
  STOCK_TRANSACTION_GET: '/management/stock-transactions/get',
  STOCK_TRANSACTION_LIST: '/management/stock-transactions/list',
  STOCK_TRANSACTION_LOCK: '/management/stock-transactions/lock',
  STOCK_TRANSACTION_UNLOCK: '/management/stock-transactions/unlock',
  STOCK_TRANSACTION_PREVIEW_LEDGER: '/management/stock-transactions/preview-ledger',

  // Inventory Ledger Management
  INVENTORY_LEDGER_GET: '/management/inventory-ledger/get',
  INVENTORY_LEDGER_CURRENT_STOCK: '/management/inventory-ledger/current-stock',
  INVENTORY_LEDGER_AVAILABLE_STOCK: '/management/inventory-ledger/available-stock',

  // Adjustment Management
  ADJUSTMENT_BASE: '/management/adjustments',
  ADJUSTMENT_LIST: '/management/adjustments/list',
  ADJUSTMENT_GET: '/management/adjustments/get',
  ADJUSTMENT_CREATE: '/management/adjustments',
  ADJUSTMENT_UPDATE: '/management/adjustments',
  ADJUSTMENT_DELETE: '/management/adjustments',
  ADJUSTMENT_LOCK: '/management/adjustments/lock',
  ADJUSTMENT_UNLOCK: '/management/adjustments/unlock',
  ADJUSTMENT_PREVIEW_LEDGER: '/management/adjustments/preview-ledger',

  // Inventory Ledger
  INVENTORY_CURRENT_STOCK: '/management/inventory-ledger/current-stock',
  INVENTORY_AVAILABLE_STOCK: '/management/inventory-ledger/available-stock',

  // Inventory Count Management
  INVENTORY_COUNT: {
    BASE: '/management/inventory-counts',
    CREATE: '/management/inventory-counts',
    UPDATE: '/management/inventory-counts',
    GET: '/management/inventory-counts/get',
    LIST: '/management/inventory-counts/list',
    DELETE: '/management/inventory-counts',
    LOAD_BATCHES: '/management/inventory-counts/load-batches',
    COMPLETE: '/management/inventory-counts/complete',
    CANCEL: '/management/inventory-counts/cancel',
  },
} as const;
