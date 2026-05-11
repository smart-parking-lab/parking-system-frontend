import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme } from 'antd';
import {
  DashboardOutlined,
  VideoCameraOutlined,
  LineChartOutlined,
  LogoutOutlined,
} from '@ant-design/icons';


const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  // Trạng thái đóng/mở sidebar
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Để lấy current path active menu
  
  // Lấy màu nền chuẩn của Antd
  const { token: { colorBgContainer } } = theme.useToken();

  const isAuthenticated = true; // Tạm thời hardcode

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Cấu hình các item trong Menu
  const menuItems = [
    { key: '/admin/slot', icon: <DashboardOutlined />, label: 'Quản lý Ô đỗ' },
    { key: '/admin/parking-session', icon: <VideoCameraOutlined />, label: 'Phiên ra vào' },
    { key: '/admin/revenue', icon: <LineChartOutlined />, label: 'Doanh thu' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Cột Sidebar bên trái */}
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div >
          {!collapsed ? 'SMART PARKING' : 'SP'}
        </div>
        
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} // Tự động highlight menu đang đứng
          items={menuItems} 
          onClick={({ key }) => navigate(key)} // Điều hướng khi click
        />
      </Sider>

      {/* Khu vực nội dung bên phải */}
      <Layout>
        {/* Header (Thanh trên cùng) */}
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer, 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center' 
        }}>
          <Button 
          type="text" danger 
          icon={<LogoutOutlined />}
          onClick={async () => {
            if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
              localStorage.removeItem('mock_session');
              window.location.href = '/admin/login';
              return;
            }
            localStorage.removeItem('access_token');
            window.location.href = '/admin/login';
          }}

          >
            Đăng xuất
          </Button>
        </Header>

        {/* Nội dung chính thay đổi theo Route */}
        <Content style={{ margin: '16px' }}>
          <div>
             <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;