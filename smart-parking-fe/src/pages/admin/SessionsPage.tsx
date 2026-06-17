import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, Input, Card, Image } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { AdminService } from '../../services/admin.service';
import type { ParkingSessions } from '../../types/parking.type';
import { supabase } from '../../services/supabaseClient'; // IMPORT SUPABASE

const { Title } = Typography;

const SessionsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ParkingSessions[]>([]);
  const [searchText, setSearchText] = useState('');

  const fetchMockSessions = async() => {
    try {
      setLoading(true);
      const response = await AdminService.getAllParkingSessions();
      setSessions(response.data);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    // 1. Tải danh sách lần đầu
    fetchMockSessions();

    // 2. Kích hoạt WebSocket lắng nghe bảng parking_sessions
    const subscription = supabase
      .channel('admin-sessions-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_sessions' },
        (payload) => {
          console.log('🔄 Bảng parking_sessions thay đổi:', payload);
          fetchMockSessions(); // Gọi lại API để load dòng lịch sử mới/cập nhật giờ ra
        }
      )
      .subscribe();

    // 3. Dọn dẹp
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return <span className="text-gray-400">Chưa có</span>;
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const columns = [
    {
      title: 'Biển Số',
      dataIndex: 'plate_number',
      key: 'plate_number',
      fontWeight: 'bold',
      render: (text: string) => <strong className="text-lg text-blue-800">{text}</strong>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'processing' : 'default'} className="uppercase">
          {status === 'active' ? 'Đang đỗ' : 'Đã rời đi'}
        </Tag>
      ),
    },
    {
      title: 'Giờ Vào',
      dataIndex: 'entry_time',
      key: 'entry_time',
      render: (time: string) => formatDateTime(time),
    },
    {
      title: 'Ảnh Lúc Vào',
      dataIndex: 'entry_image_url',
      key: 'entry_image_url',
      render: (url: string) => (
        url ? <Image width={80} src={url} alt="Entry" className="rounded border" /> : 'Không có ảnh'
      ),
    },
    {
      title: 'Giờ Ra',
      dataIndex: 'exit_time',
      key: 'exit_time',
      render: (time: string) => formatDateTime(time),
    },
    {
      title: 'Ảnh Lúc Ra',
      dataIndex: 'exit_image_url',
      key: 'exit_image_url',
      render: (url: string) => (
        url ? <Image width={80} src={url} alt="Exit" className="rounded border" /> : 'Chưa ra'
      ),
    },
  ];

  const filteredSessions = sessions.filter(session => 
    session.plate_number.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={4} style={{ margin: 0 }}>Lịch sử xe ra vào</Title>
        <Input 
          placeholder="Nhập biển số để tìm..." 
          prefix={<SearchOutlined className="text-gray-400" />} 
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Card className="shadow-sm border-gray-200" bodyStyle={{ padding: 0 }}>
        <Table 
          columns={columns} 
          dataSource={filteredSessions} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
};

export default SessionsPage;