import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Select, Space, Row, Col } from 'antd';
import { customerService, type CreateCustomerRequest } from '@/services/customerService';
import enumData from '@/enums/enums';

const { Option } = Select;
const { TextArea } = Input;

const AddCustomer = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const request: CreateCustomerRequest = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
        taxCode: values.taxCode,
        customerType: values.customerType,
      };

      await customerService.create(request);
      navigate('/customers');
    } catch (error) {
      // handled by baseHttp
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold m-0">Thêm Khách Hàng Mới</h1>
          <Space>
            <Button onClick={() => navigate('/customers')}>
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={form.submit}
              loading={loading}
            >
              Lưu
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Tên Khách Hàng"
                rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập tên khách hàng" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="customerType"
                label="Loại Khách Hàng"
                rules={[{ required: true, message: 'Vui lòng chọn loại khách hàng' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn loại khách hàng">
                  {enumData.customerType.list.map(item => (
                    <Option key={item.value} value={item.value}>{item.text}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Số Điện Thoại"
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Địa Chỉ"
            style={{ marginBottom: '12px' }}
          >
            <TextArea rows={2} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            name="taxCode"
            label="Mã Số Thuế"
            style={{ marginBottom: '12px' }}
          >
            <Input placeholder="Nhập mã số thuế (bắt buộc với doanh nghiệp)" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddCustomer;
