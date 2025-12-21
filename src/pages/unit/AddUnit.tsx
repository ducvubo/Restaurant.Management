import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Space, Row, Col } from 'antd';
import { unitService } from '@/services/unitService';
import type { CreateUnitRequest } from '@/types';

const { TextArea } = Input;

const AddUnit = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const request: CreateUnitRequest = {
        code: values.code,
        name: values.name,
        description: values.description,
      };

      setLoading(true);
      const resp = await unitService.createUnit(request);
      if (resp.success) {
        navigate('/units');
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
          <h1 className="text-xl font-bold m-0">Tạo Đơn Vị Tính Mới</h1>
          <Space>
            <Button onClick={() => navigate('/units')}>
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
                label="Mã Đơn Vị"
                name="code"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã đơn vị' },
                  { min: 2, message: 'Mã đơn vị phải có ít nhất 2 ký tự' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập mã đơn vị (VD: KG, CHAI)" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên Đơn Vị"
                name="name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đơn vị' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập tên đơn vị" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô Tả"
            name="description"
            style={{ marginBottom: '12px' }}
          >
            <TextArea rows={3} placeholder="Nhập mô tả đơn vị tính" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddUnit;

