import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Space, Row, Col, TimePicker } from 'antd';
import { branchService } from '../services/branchService';
import type { CreateBranchRequest } from '../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const AddBranch = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const request: CreateBranchRequest = {
        code: values.code,
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        openingTime: values.openingTime.format('HH:mm:ss'),
        closingTime: values.closingTime.format('HH:mm:ss'),
        status: 1, // ACTIVE by default
      };

      setLoading(true);
      const resp = await branchService.createBranch(request);
      if (resp.success) {
        navigate('/branches');
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold m-0">Tạo Chi Nhánh Mới</h1>
          <Space>
            <Button onClick={() => navigate('/branches')}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={loading}
            >
              Tạo Mới
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            openingTime: dayjs('08:00:00', 'HH:mm:ss'),
            closingTime: dayjs('22:00:00', 'HH:mm:ss'),
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mã Chi Nhánh"
                name="code"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã chi nhánh' },
                  { min: 2, message: 'Mã chi nhánh phải có ít nhất 2 ký tự' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập mã chi nhánh (VD: HN001)" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên Chi Nhánh"
                name="name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên chi nhánh' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập tên chi nhánh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số Điện Thoại"
                name="phone"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Địa Chỉ"
            name="address"
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ' },
            ]}
            style={{ marginBottom: '12px' }}
          >
            <TextArea rows={2} placeholder="Nhập địa chỉ chi nhánh" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giờ Mở Cửa"
                name="openingTime"
                rules={[
                  { required: true, message: 'Vui lòng chọn giờ mở cửa' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <TimePicker 
                  format="HH:mm" 
                  placeholder="Chọn giờ mở cửa"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giờ Đóng Cửa"
                name="closingTime"
                rules={[
                  { required: true, message: 'Vui lòng chọn giờ đóng cửa' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <TimePicker 
                  format="HH:mm" 
                  placeholder="Chọn giờ đóng cửa"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AddBranch;
