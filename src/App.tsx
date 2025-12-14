import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
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
          Notification: {
            width: 320,
            paddingContent: 12,
            paddingBlock: 12,
            paddingInline: 16,
            marginBottom: 8,
            borderRadius: 6,
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
