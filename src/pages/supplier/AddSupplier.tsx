import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Space, Row, Col } from 'antd';
import type { CreateSupplierRequest } from '@/types';
import { supplierService } from '@/services/supplierService';

const { TextArea } = Input;

const AddSupplier = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const request: CreateSupplierRequest = {
        code: values.code,
        name: values.name,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        address: values.address,
        taxCode: values.taxCode,
        paymentTerms: values.paymentTerms,
        rating: values.rating,
        notes: values.notes,
      };

      setLoading(true);
      const resp = await supplierService.createSupplier(request);
      if (resp.success) {
        navigate('/suppliers');
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
          <h1 className="text-xl font-bold m-0">Tạo Nhà Cung Cấp Mới</h1>
          <Space>
            <Button onClick={() => navigate('/suppliers')}>
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
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mã Nhà Cung Cấp"
                name="code"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã nhà cung cấp' },
                  { min: 2, message: 'Mã phải có ít nhất 2 ký tự' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập mã nhà cung cấp (VD: NCC001)" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên Nhà Cung Cấp"
                name="name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên nhà cung cấp' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập tên nhà cung cấp" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Người Liên Hệ"
                name="contactPerson"
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập tên người liên hệ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số Điện Thoại"
                name="phone"
                rules={[
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mã Số Thuế"
                name="taxCode"
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập mã số thuế" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Điều Khoản Thanh Toán"
            name="paymentTerms"
            style={{ marginBottom: '12px' }}
          >
            <Input placeholder="VD: Thanh toán trong 30 ngày" />
          </Form.Item>
          <Form.Item
            label="Địa Chỉ"
            name="address"
            style={{ marginBottom: '12px' }}
          >
            <TextArea rows={2} placeholder="Nhập địa chỉ nhà cung cấp" />
          </Form.Item>
          <Form.Item
            label="Ghi Chú"
            name="notes"
            style={{ marginBottom: '12px' }}
          >
            <TextArea rows={3} placeholder="Nhập ghi chú về nhà cung cấp" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddSupplier;

