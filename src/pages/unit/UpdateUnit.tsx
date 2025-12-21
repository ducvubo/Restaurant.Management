import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, Space, Row, Col, Spin } from 'antd';
import type { UpdateUnitRequest } from '@/types';
import { unitService } from '@/services/unitService';

const { TextArea } = Input;

const UpdateUnit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unitId = searchParams.get('id');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (unitId) {
      loadData();
    }
  }, [unitId]);

  const loadData = async () => {
    try {
      setFetching(true);
      const unit = await unitService.getUnitById(unitId!);

      form.setFieldsValue({
        code: unit.code,
        name: unit.name,
        description: unit.description,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const request: UpdateUnitRequest = {
        id: unitId!,
        code: values.code,
        name: values.name,
        description: values.description,
      };

      setLoading(true);
      const resp = await unitService.updateUnit(unitId!, request);
      if (resp.success) {
        navigate('/units');
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold m-0">Cập Nhật Đơn Vị Tính</h1>
          <Space>
            <Button onClick={() => navigate('/units')}>
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
            >
              Cập Nhật
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

export default UpdateUnit;

