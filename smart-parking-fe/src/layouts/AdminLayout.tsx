import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme } from 'antd';
import { 
  DashboardOutlined, 
  VideoCameraOutlined, 
  LineChartOutlined, 
  LogoutOutlined 
} from '@ant-design/icons';

// 1. IMPORT HOOK TỪ AUTH CONTEXT CỦA EM (Nhớ trỏ đúng đường dẫn file)
import { useAuth } from '../features/auth/AuthContext'; 

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const { token: { colorBgContainer } } = theme.useToken();

  // 2. GỌI HOOK LẤY TRẠNG THÁI THẬT (Thay thế dòng hardcode cũ)
  const { isAuthenticated } = useAuth();

  // 3. KIỂM TRA ĐIỀU KIỆN
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    { key: '/admin/slot', icon: <DashboardOutlined />, label: 'Quản lý Ô đỗ' },
    { key: '/admin/parking-session', icon: <VideoCameraOutlined />, label: 'Phiên ra vào' },
    { key: '/admin/revenue', icon: <LineChartOutlined />, label: 'Doanh thu' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Cột Sidebar bên trái */}
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} >
        <div className="text-white text-center py-4 font-bold">
          {!collapsed ? 'SMART PARKING' : 'SP'}
        </div>
        
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
          onClick={({ key }) => navigate(key)} 
        />
      </Sider>

      {/* Khu vực nội dung bên phải */}
      <Layout>
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
            onClick={() => {
              // Xóa token và dùng navigate thay vì reload lại nguyên trang
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token'); // Nhớ xóa cả refresh token
              window.location.href = '/admin/login';
            }}
          >
            Đăng xuất
          </Button>
        </Header>

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