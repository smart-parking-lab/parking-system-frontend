import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Button, message } from 'antd';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api.type';
import { AdminService } from '../../services/admin.service';
import { supabase } from '../../services/supabaseClient'; // IMPORT SUPABASE

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);

  const fetchApiSlotAdmin = async () =>{ 
    try {
      setLoading(true);
      const res = await AdminService.getParkingSlotAdmin();
      setSlots(res.data);
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>
      message.error(err.response?.data.detail)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 1. Tải dữ liệu lần đầu
    fetchApiSlotAdmin();

    // 2. Kích hoạt WebSocket lắng nghe cả 2 bảng: parking_slots và sensors
    const subscription = supabase
      .channel('admin-dashboard-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_slots' },
        () => {
          console.log('🔄 Bảng parking_slots thay đổi, đang tự động cập nhật...');
          fetchApiSlotAdmin(); // Tự động lấy lại dữ liệu mới
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sensors' },
        () => {
          console.log('🔄 Bảng sensors thay đổi, đang tự động cập nhật...');
          fetchApiSlotAdmin();
        }
      )
      .subscribe();

    // 3. Dọn dẹp khi rời trang
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Định nghĩa các cột cho bảng Ant Design
  const columns = [
    {
      title: 'Mã Ô Đỗ',
      dataIndex: 'slot_code',
      key: 'slot_code',
      fontWeight: 'bold',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Khu Vực',
      dataIndex: 'slot_code',
      key: 'zone',
      render: (text: string) => text.charAt(0), // Lấy chữ cái đầu (A hoặc B) làm khu vực
    },
    {
      title: 'Trạng Thái Ô Đỗ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        let text = 'Trống';
        if (status === 'occupied') { color = 'red'; text = 'Có Xe'; }
        if (status === 'empty') { color = 'green'; text = 'Trống'; } 
        return <Tag color={color} className="uppercase px-4 py-1">{text}</Tag>;
      },
    },
    {
      title: 'Trạng Thái Cảm Biến',
      dataIndex: 'sensors',
      key: 'sensor_status',
      render: (sensors: any) => {
        if (!sensors) return <Tag color="default">Không có cảm biến</Tag>;
        
        const status = sensors.status;
        if (status === 'online') {
          return <Tag icon={<CheckCircleOutlined />} color="success">Đang hoạt động</Tag>;
        }
        if (status === 'error') {
          return <Tag icon={<CloseCircleOutlined />} color="error">Lỗi phần cứng</Tag>;
        }
        return <Tag icon={<SyncOutlined spin />} color="warning">Mất kết nối</Tag>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={4} style={{ margin: 0 }}>Quản lý trạng thái bãi đỗ</Title>
        <Button type="primary" icon={<SyncOutlined />} onClick={fetchApiSlotAdmin}>
          Làm mới
        </Button>
      </div>

      <Card className="shadow-sm border-gray-200" bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={slots} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;