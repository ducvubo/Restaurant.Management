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
        style={{ backgroundColor: '#ffffff' }}
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
        />
      </Sider>
      <AntLayout>
        <Header className="flex items-center justify-between" style={{ backgroundColor: '#2e4baa', color: '#ffffff', height: '55px', lineHeight: '48px', padding: '0 24px' }}>
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
        <Footer style={{ textAlign: 'center', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb', padding: '10px 20px' }}>
          © 2025 - Hệ thống quản lý nhà hàng
        </Footer>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
