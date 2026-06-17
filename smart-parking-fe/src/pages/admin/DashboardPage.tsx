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

  const fetchApiSlotAdmin = async () =>{ 
    try {
      setLoading(true);
      const res = await AdminService.getParkingSlotAdmin();
      console.log("res", res);
      setSlots(res.data);
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>
      console.log("Err", err.response)
      message.error(err.response?.data.detail)
    }finally{
      setLoading(false);
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
      dataIndex: 'slot_code',
      key: 'slot_code', 
    },
    {
      title: 'Trạng Thái Ô Đỗ',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        let text = 'Trống';
        if (status === 'occupied') { color = 'red'; text = 'Có Xe'; }
        // Lưu ý: DB em đang trả về 'empty', hãy sửa lại ở đây
        if (status === 'empty') { color = 'green'; text = 'Trống'; } 
        return <Tag color={color} className="uppercase px-4 py-1">{text}</Tag>;
      },
    },
    {
      title: 'Trạng Thái Cảm Biến',
      dataIndex: 'sensors', // Trỏ vào object con
      key: 'sensor_status',
      render: (sensors: any) => {
        // Kiểm tra nếu không có sensor hoặc status bị null
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