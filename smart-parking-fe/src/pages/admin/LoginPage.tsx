import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const { Title } = Typography;


const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Hàm xử lý khi người dùng bấm nút Submit
  const onFinish = async (values: any) => {
    setLoading(true);
    const { email, password } = values;

    if (isMockMode) {
      // Giả lập API gọi mất 1 giây
      setTimeout(() => {
        if (email === 'admin@gmail.com' && password === '123456') {
          localStorage.setItem('mock_session', 'true');
          toast.success('Đăng nhập (Chế độ giả lập) thành công!');
          // Refresh lại trang để AuthContext cập nhật state
          window.location.href = '/admin/slot'; 
        } else {
          toast.error('Sai tài khoản! Gợi ý: admin@gmail.com / 123456');
          setLoading(false);
        }
      }, 1000);
      return;
    }

    // Gọi backend login thay Supabase
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        toast.error('Đăng nhập thất bại: Sai email hoặc mật khẩu!');
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data?.access_token) localStorage.setItem('access_token', data.access_token);

      toast.success('Đăng nhập thành công!');
      window.location.href = '/admin/slot';
    } catch {
      toast.error('Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Dùng Tailwind để căn giữa form ra giữa màn hình
    <div className="flex h-screen items-center justify-center bg-gray-200">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <div className="text-center mb-6">
          <Title level={3} style={{ margin: 0, color: '#1677ff' }}>Smart Parking</Title>
          <p className="text-gray-500 mt-2">Đăng nhập hệ thống quản trị</p>
        </div>

        <Form
          name="login_form"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Định dạng email không hợp lệ!' }
            ]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Email quản trị" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;