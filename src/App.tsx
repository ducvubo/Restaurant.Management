import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
// Admin
import BranchManagement from './pages/system/BranchManagement';
import AddBranch from './pages/system/AddBranch';
import UpdateBranch from './pages/system/UpdateBranch';
import UserManagement from './pages/system/UserManagement';
import AddUser from './pages/system/AddUser';
import UpdateUser from './pages/system/UpdateUser';
import PolicyManagement from './pages/system/PolicyManagement';
import AddPolicy from './pages/system/AddPolicy';
import UpdatePolicy from './pages/system/UpdatePolicy';
// Warehouse
import WarehouseManagement from './pages/warehouse/WarehouseManagement';
import AddWarehouse from './pages/warehouse/AddWarehouse';
import UpdateWarehouse from './pages/warehouse/UpdateWarehouse';
// Material
import MaterialCategoryManagement from './pages/material/MaterialCategoryManagement';
import AddMaterialCategory from './pages/material/AddMaterialCategory';
import UpdateMaterialCategory from './pages/material/UpdateMaterialCategory';
import MaterialManagement from './pages/material/MaterialManagement';
import AddMaterial from './pages/material/AddMaterial';
import UpdateMaterial from './pages/material/UpdateMaterial';
import UnitManagement from './pages/unit/UnitManagement';
import AddUnit from './pages/unit/AddUnit';
import UpdateUnit from './pages/unit/UpdateUnit';
import SupplierManagement from './pages/supplier/SupplierManagement';
import AddSupplier from './pages/supplier/AddSupplier';
import UpdateSupplier from './pages/supplier/UpdateSupplier';
// Customer
import CustomerManagement from './pages/customer/CustomerManagement';
import AddCustomer from './pages/customer/AddCustomer';
import UpdateCustomer from './pages/customer/UpdateCustomer';
// Stock
import StockTransactionManagement from './pages/stock/StockTransactionManagement';
import StockInManagement from './pages/stock/StockInManagement';
import StockOutManagement from './pages/stock/StockOutManagement';
import StockIn from './pages/stock/StockIn';
import StockInDetail from './pages/stock/StockInDetail';
import StockOut from './pages/stock/StockOut';
import StockOutDetail from './pages/stock/StockOutDetail';
import InventoryLedgerManagement from './pages/stock/InventoryLedgerManagement';
import AdjustmentManagement from './pages/adjustment/AdjustmentManagement';
import AdjustmentForm from './pages/adjustment/AdjustmentForm';
import AdjustmentDetail from './pages/adjustment/AdjustmentDetail';
// Inventory Count
import InventoryCountManagement from './pages/inventorycount/InventoryCountManagement';
import InventoryCountForm from './pages/inventorycount/InventoryCountForm';
import InventoryCountDetail from './pages/inventorycount/InventoryCountDetail';
import { authService } from './services/authService';
import { setNotificationApi } from './services/notificationService';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2e4baa',
        },
        components: {
          Menu: {
            itemSelectedBg: 'rgba(46, 75, 170, 0.1)',
            itemSelectedColor: '#2e4baa',
            itemHoverBg: 'rgba(46, 75, 170, 0.05)',
            itemHoverColor: '#2e4baa',
          },
        },
      }}
    >
      <AntApp>
        <AppContent />
      </AntApp>
    </ConfigProvider>
  );
}

function AppContent() {
  const { notification } = AntApp.useApp();
  
  // Set notification API for use in baseHttp
  useEffect(() => {
    setNotificationApi(notification);
  }, [notification]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/add" element={<AddUser />} />
          <Route path="users/update" element={<UpdateUser />} />
          <Route path="policies" element={<PolicyManagement />} />
          <Route path="policies/add" element={<AddPolicy />} />
          <Route path="policies/update" element={<UpdatePolicy />} />
          <Route path="branches" element={<BranchManagement />} />
          <Route path="branches/add" element={<AddBranch />} />
          <Route path="branches/update" element={<UpdateBranch />} />
          <Route path="units" element={<UnitManagement />} />
          <Route path="units/add" element={<AddUnit />} />
          <Route path="units/update" element={<UpdateUnit />} />
          <Route path="suppliers" element={<SupplierManagement />} />
          <Route path="suppliers/add" element={<AddSupplier />} />
          <Route path="suppliers/add" element={<AddSupplier />} />
          <Route path="suppliers/update" element={<UpdateSupplier />} />
          
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="customers/add" element={<AddCustomer />} />
          <Route path="customers/update" element={<UpdateCustomer />} />
          
          <Route path="warehouses" element={<WarehouseManagement />} />
          <Route path="warehouses/add" element={<AddWarehouse />} />
          <Route path="warehouses/update" element={<UpdateWarehouse />} />
          
          <Route path="material-categories" element={<MaterialCategoryManagement />} />
          <Route path="material-categories/add" element={<AddMaterialCategory />} />
          <Route path="material-categories/update" element={<UpdateMaterialCategory />} />

          <Route path="materials" element={<MaterialManagement />} />
          <Route path="materials/add" element={<AddMaterial />} />
          <Route path="materials/update" element={<UpdateMaterial />} />
          
          <Route path="stock-in" element={<StockInManagement />} />
          <Route path="stock-in/add" element={<StockIn />} />
          <Route path="stock-in/:id" element={<StockInDetail />} />
          <Route path="stock-in/edit/:id" element={<StockIn />} />
          
          <Route path="stock-out" element={<StockOutManagement />} />
          <Route path="stock-out/add" element={<StockOut />} />
          <Route path="stock-out/:id" element={<StockOutDetail />} />
          <Route path="stock-out/edit/:id" element={<StockOut />} />
          
          <Route path="stock-transactions" element={<StockTransactionManagement />} />
          <Route path="stock-transactions/in" element={<StockIn />} />
          <Route path="stock-transactions/out" element={<StockOut />} />
          <Route path="inventory-ledger" element={<InventoryLedgerManagement />} />
          
          <Route path="adjustment" element={<AdjustmentManagement />} />
          <Route path="adjustment/add" element={<AdjustmentForm />} />
          <Route path="adjustment/:id" element={<AdjustmentDetail />} />
          <Route path="adjustment/edit/:id" element={<AdjustmentForm />} />
          
          <Route path="inventory-count" element={<InventoryCountManagement />} />
          <Route path="inventory-count/add" element={<InventoryCountForm />} />
          <Route path="inventory-count/:id" element={<InventoryCountDetail />} />
          <Route path="inventory-count/edit/:id" element={<InventoryCountForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
