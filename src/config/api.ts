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
  UNIT_CREATE: '/management/units/create',
  UNIT_UPDATE: '/management/units/update',
  UNIT_ACTIVATE: '/management/units/activate',
  UNIT_DEACTIVATE: '/management/units/deactivate',
  UNIT_LIST: '/management/units/list',
  // Unit Conversion Management
  UNIT_CONVERSION_LIST: '/management/unit-conversions/list',
  UNIT_CONVERSION_CREATE: '/management/unit-conversions/create',
  UNIT_CONVERSION_UPDATE: '/management/unit-conversions/update',
  UNIT_CONVERSION_DELETE: '/management/unit-conversions/delete',
  UNIT_CONVERSION_CONVERT: '/management/unit-conversions/convert',
  UNIT_CONVERSION_MATERIAL_UNITS: '/management/unit-conversions/materials/units',
  UNIT_CONVERSION_ADD_UNIT: '/management/unit-conversions/materials/units/add',
  UNIT_CONVERSION_REMOVE_UNIT: '/management/unit-conversions/materials/units/remove',
  UNIT_CONVERSION_SET_BASE: '/management/unit-conversions/materials/units/set-base',
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

  STOCK_TRANSACTION_BASE: '/management/stock-transactions',
  STOCK_TRANSACTION_IN: '/management/stock-transactions/in',
  STOCK_TRANSACTION_OUT: '/management/stock-transactions/out',
  STOCK_TRANSACTION_GET: '/management/stock-transactions/get',
  STOCK_TRANSACTION_LIST: '/management/stock-transactions/list',
  STOCK_TRANSACTION_LOCK: '/management/stock-transactions/lock',
  STOCK_TRANSACTION_UNLOCK: '/management/stock-transactions/unlock',
  STOCK_TRANSACTION_PREVIEW_LEDGER: '/management/stock-transactions/preview-ledger',

  // Stock In Management (New Separated API)
  STOCK_IN: {
    BASE: '/management/stock-in',
    CREATE: '/management/stock-in',
    UPDATE: '/management/stock-in',
    GET: '/management/stock-in/get',
    LIST: '/management/stock-in/list',
    LOCK: '/management/stock-in/lock',
    UNLOCK: '/management/stock-in/unlock',
    PREVIEW: '/management/stock-in/preview-ledger',
  },

  // Stock Out Management (New Separated API)
  STOCK_OUT: {
    BASE: '/management/stock-out',
    CREATE: '/management/stock-out',
    UPDATE: '/management/stock-out',
    GET: '/management/stock-out/get',
    LIST: '/management/stock-out/list',
    LOCK: '/management/stock-out/lock',
    UNLOCK: '/management/stock-out/unlock',
    PREVIEW: '/management/stock-out/preview-ledger',
  },

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

  // Unit Conversion Management
  UNIT_CONVERSION: {
    BASE: '/management/unit-conversions',
    LIST: '/management/unit-conversions',
    CREATE: '/management/unit-conversions',
    UPDATE: '/management/unit-conversions',
    DELETE: '/management/unit-conversions',
    CONVERT: '/management/unit-conversions/convert',
    MATERIAL_UNITS: '/management/unit-conversions/materials',
  },

  // Workflow Management
  WORKFLOW_CREATE: '/management/workflows/create',
  WORKFLOW_UPDATE: '/management/workflows/update',
  WORKFLOW_DELETE: '/management/workflows/delete',
  WORKFLOW_GET: '/management/workflows/get',
  WORKFLOW_LIST: '/management/workflows/list',
  WORKFLOW_GET_ACTIVE_BY_TYPE: '/management/workflows/get-active-by-type',
  WORKFLOW_ACTIVATE: '/management/workflows/activate',
  WORKFLOW_DEACTIVATE: '/management/workflows/deactivate',
  WORKFLOW_VALIDATE_BPMN: '/management/workflows/validate-bpmn',
  WORKFLOW_EXTRACT_POLICY_IDS: '/management/workflows/extract-policy-ids',

  // Workflow Notes Management
  WORKFLOW_NOTE: {
    LIST: '/management/workflow-notes/list',
    CREATE: '/management/workflow-notes/create',
    UPDATE: '/management/workflow-notes/update',
    DELETE: '/management/workflow-notes/delete',
  },

  // Purchase Requisition Management
  PURCHASE_REQUISITION: {
    CREATE: '/management/purchase-requisitions/create',
    UPDATE: '/management/purchase-requisitions/update',
    GET: '/management/purchase-requisitions/get',
    LIST: '/management/purchase-requisitions/list',
    DELETE: '/management/purchase-requisitions/delete',
    SUBMIT: '/management/purchase-requisitions/submit',
    APPROVE: '/management/purchase-requisitions/approve',
    REJECT: '/management/purchase-requisitions/reject',
    CANCEL: '/management/purchase-requisitions/cancel',
    // Workflow APIs
    WORKFLOW_STATE: '/management/purchase-requisitions/workflow-state',
    WORKFLOW_ACTION: '/management/purchase-requisitions/workflow-action',
    HISTORY: '/management/purchase-requisitions/history',
  },

  // RFQ (Request For Quotation) Management
  RFQ: {
    CREATE: '/management/rfqs/create',
    CREATE_FROM_REQUISITION: '/management/rfqs/create-from-requisition',
    UPDATE: '/management/rfqs/update',
    GET: '/management/rfqs/get',
    LIST: '/management/rfqs/list',
    DELETE: '/management/rfqs/delete',
    SEND: '/management/rfqs/send',
    RECEIVE_QUOTATION: '/management/rfqs/receive-quotation',
    ACCEPT: '/management/rfqs/accept',
    REJECT: '/management/rfqs/reject',
    CANCEL: '/management/rfqs/cancel',
  },

  // Purchase Order Management
  PURCHASE_ORDER: {
    CREATE: '/management/purchase-orders/create',
    CREATE_FROM_RFQ: '/management/purchase-orders/create-from-rfq',
    UPDATE: '/management/purchase-orders/update',
    GET: '/management/purchase-orders/get',
    LIST: '/management/purchase-orders/list',
    DELETE: '/management/purchase-orders/delete',
    CONFIRM: '/management/purchase-orders/confirm',
    RECEIVE_GOODS: '/management/purchase-orders/receive-goods',
    CANCEL: '/management/purchase-orders/cancel',
  },
} as const;
