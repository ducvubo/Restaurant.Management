import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Space, Button } from 'antd';
import type { MenuProps } from 'antd';
import { authService } from '../services/authService';
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
  ShopOutlined,
  AppstoreOutlined,
  TeamOutlined,
  InboxOutlined,
  BankOutlined,
  GoldOutlined,
  SwapOutlined,
  ReadOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content, Footer } = AntLayout;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <span className="font-semibold">Bảng Điều Khiển</span>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <span className="font-semibold">Quản Lý Người Dùng</span>,
    },
    {
      key: '/policies',
      icon: <SafetyOutlined />,
      label: <span className="font-semibold">Quản Lý Tập Quyền</span>,
    },
    {
      key: '/branches',
      icon: <ShopOutlined />,
      label: <span className="font-semibold">Quản Lý Chi Nhánh</span>,
    },
    {
      key: 'warehouse',
      icon: <InboxOutlined />,
      label: <span className="font-semibold">Quản Lý Kho</span>,
      children: [
        {
        key: '/warehouses',
        icon: <BankOutlined />,
        label: <span className="font-semibold">Kho</span>,
      },
      {
        key: '/materials',
        icon: <GoldOutlined />,
        label: <span className="font-semibold">Nguyên Vật Liệu</span>,
      },
      {
        key: '/stock-transactions',
        icon: <SwapOutlined />,
        label: <span className="font-semibold">Nhập/Xuất Kho</span>,
      },
      {
        key: '/inventory-ledger',
        icon: <ReadOutlined />,
        label: <span className="font-semibold">Sổ Cái Tồn Kho</span>,
      },
      {
        key: '/units',
        icon: <AppstoreOutlined />,
        label: <span className="font-semibold">Đơn Vị Tính</span>,
      },
      {
        key: '/suppliers',
        icon: <TeamOutlined />,
        label: <span className="font-semibold">Nhà Cung Cấp</span>,
      },
      ],
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng Xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout className="min-h-screen">
      <Sider
        width={250}
        collapsed={collapsed}
        collapsible
        trigger={null}
        style={{ 
          backgroundColor: '#ffffff',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
        }}
        theme="light"
      >
        <div className="h-[55px] flex items-center justify-center" style={{ backgroundColor: '#2e4baa', borderColor: '#e5e7eb' }}>
          {!collapsed && <h2 className="text-xl font-bold m-0" style={{ color: '#ffffff' }}>Quản Lý Nhà Hàng</h2>}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-r-0"
          style={{ borderRight: 0 }}
        />
      </Sider>
      <AntLayout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <Header className="flex items-center justify-between sticky top-0 z-50" style={{ backgroundColor: '#2e4baa', color: '#ffffff', height: '55px', lineHeight: '48px', padding: '0 24px' }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: '#ffffff', fontSize: '16px' }}
            />
            <div className="text-base font-semibold" style={{ color: '#ffffff' }}>Hệ Thống Quản Lý Nhà Hàng</div>
          </Space>
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="cursor-pointer">
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                <span style={{ color: '#ffffff' }}>{user.username}</span>
              </Space>
            </Dropdown>
          )}
        </Header>
       <Content className="p-2 bg-white" style={{ minHeight: 'calc(100vh - 103px)' }}>
          <Outlet />
        </Content>
        <Footer style={{  textAlign: 'center', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb', padding: '10px 20px', position: 'sticky', bottom: 0, zIndex: 100 }}>
          © 2025 - Hệ thống quản lý nhà hàng
        </Footer>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
