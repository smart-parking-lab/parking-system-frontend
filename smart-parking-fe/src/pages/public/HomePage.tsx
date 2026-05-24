import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Badge, Statistic, message } from 'antd';
import { CarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { homeService } from '../../services/home.service';
import type { ParkingSLots } from '../../types/parking.type';

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState< ParkingSLots[]>([]);

  const fetchMockSlots = async () => {
    setLoading(true);
    try {
      const response = await homeService.getAllParkingSlot();
      console.log("response", response);
      setSlots(response.data)
    } catch (error) {
      console.log("err", error)
    }finally{
      setLoading(false)
    }
  };



  useEffect(() => {
    fetchMockSlots();
  }, []);


  // Tính toán số lượng chỗ trống
  const availableCount = slots.filter(s => s.status === 'empty').length;
  const totalCount = slots.length;

  
  // Hàm render giao diện từng ô đỗ xe
  const renderSlot = (slot: any) => {
    let bgColor = '#f5f5f5'; // Mặc định là xám (Bảo trì)
    let borderColor = '#d9d9d9';
    let textColor = '#000';
    let icon = null;

    if (slot.status === 'available') {
      bgColor = '#f6ffed'; // Xanh nhạt
      borderColor = '#b7eb8f'; // Viền xanh lá
      textColor = '#389e0d';
      icon = <CheckCircleOutlined />;
    } else if (slot.status === 'occupied') {
      bgColor = '#fff1f0'; // Đỏ nhạt
      borderColor = '#ffa39e'; // Viền đỏ
      textColor = '#cf1322';
      icon = <CarOutlined />;
    }

    return (
      <Col span={4} key={slot.id} xs={12} sm={8} md={6} lg={4}>
        <div 
          style={{
            background: bgColor,
            border: `2px solid ${borderColor}`,
            borderRadius: '8px',
            padding: '20px 0',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.3s'
          }}
        >
          <Title level={4} style={{ margin: 0, color: textColor }}>
            {slot.slot_code}
          </Title>
          <div style={{ fontSize: '24px', color: textColor, marginTop: '8px' }}>
            {icon}
          </div>
        </div>
      </Col>
    );
  };

  return (
    <div className="space-y-8">
      {/* Phần 1: Thống kê tổng quan */}
      <Row gutter={16} justify="center">
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-md text-center" style={{ borderRadius: '12px' }}>
            <Statistic
              title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>SỐ CHỖ TRỐNG HIỆN TẠI</span>}
              value={availableCount}
              suffix={`/ ${totalCount}`}
              valueStyle={{ color: '#3f8600', fontSize: '48px', fontWeight: '900' }}
            />
            <Text type="secondary">Cập nhật theo thời gian thực</Text>
          </Card>
        </Col>
      </Row>

      {/* Phần 2: Sơ đồ Khu vực A */}
      <Card title="📍 Khu Vực A" className="shadow-sm" headStyle={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
        <Row gutter={[16, 16]}>
          {slots.filter(s => s.slot_code.startsWith('A')).map(renderSlot)}
        </Row>
      </Card>

      {/* Phần 3: Sơ đồ Khu vực B */}
      <Card title="📍 Khu Vực B" className="shadow-sm" headStyle={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
        <Row gutter={[16, 16]}>
          {slots.filter(s => s.slot_code.startsWith('B')).map(renderSlot)}
        </Row>
      </Card>

      {/* Chú thích */}
      <div className="flex justify-center gap-6 mt-4">
        <Badge color="green" text={<Text strong>Trống</Text>} />
        <Badge color="red" text={<Text strong>Có xe</Text>} />
        <Badge color="default" text={<Text strong>Bảo trì</Text>} />
      </div>
    </div>
  );
};

export default HomePage;