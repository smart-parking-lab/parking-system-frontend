import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Space, Button, message } from 'antd';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api.type';
import { AdminService } from '../../services/admin.service';
// import { supabase } from '../../services/supabaseClient'; // Tạm comment chờ nối API thật

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);

  // Tạm thời dùng dữ liệu giả (Dummy Data) bám sát DB để dàn layout trước
  // Dữ liệu này mix giữa bảng parking_slots và sensors
  const fetchDummyData = () => {
    setLoading(true);
    setTimeout(() => {
      setSlots([
        { id: '1', slot_code: 'A01', status: 'available', sensor_status: 'online', zone: 'A' },
        { id: '2', slot_code: 'A02', status: 'occupied', sensor_status: 'online', zone: 'A' },
        { id: '3', slot_code: 'B01', status: 'maintenance', sensor_status: 'offline', zone: 'B' },
        { id: '4', slot_code: 'B02', status: 'available', sensor_status: 'error', zone: 'B' },
      ]);
      setLoading(false);
    }, 800); // Giả lập mạng chậm 0.8s
  };

  const fetchApiSlotAdmin = async () =>{ 
    try {
      const res = await AdminService.getParkingSlotAdmin();
      console.log("res", res);
      setSlots(res.data);
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>
      console.log("Err", err.response)
      message.error(err.response?.data.detail)
    }
  }

  useEffect(() => {
    fetchApiSlotAdmin();
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
      dataIndex: 'zone',
      key: 'zone',
    },
    {
      title: 'Trạng Thái Ô Đỗ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        // Render màu sắc Tag dựa theo trạng thái
        let color = 'green';
        let text = 'Trống';
        if (status === 'occupied') { color = 'red'; text = 'Có Xe'; }
        if (status === 'maintenance') { color = 'default'; text = 'Bảo Trì'; }
        return <Tag color={color} className="uppercase px-4 py-1">{text}</Tag>;
      },
    },
    {
      title: 'Trạng Thái Cảm Biến',
      dataIndex: 'sensor_status',
      key: 'sensor_status',
      render: (sensor_status: string) => {
        if (sensor_status === 'online') {
          return <Tag icon={<CheckCircleOutlined />} color="success">Đang hoạt động</Tag>;
        }
        if (sensor_status === 'error') {
          return <Tag icon={<CloseCircleOutlined />} color="error">Lỗi phần cứng</Tag>;
        }
        return <Tag icon={<SyncOutlined spin />} color="warning">Mất kết nối</Tag>;
      },
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_:any, record: any) => (
        <Space size="middle">
          <Button type="link" onClick={() => alert(`Xem chi tiết ô ${record.slot_code}`)}>
            Chi tiết
          </Button>
        </Space>
      ),
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