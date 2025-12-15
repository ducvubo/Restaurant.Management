import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, Space, Row, Col, InputNumber, Select, Spin } from 'antd';
import { unitService } from '../services/unitService';
import type { UpdateUnitRequest, Unit } from '../types';

const { TextArea } = Input;

const UpdateUnit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const unitId = searchParams.get('id');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [baseUnits, setBaseUnits] = useState<Unit[]>([]);

  useEffect(() => {
    if (unitId) {
      loadUnit();
      loadBaseUnits();
    }
  }, [unitId]);

  const loadUnit = async () => {
    try {
      setFetching(true);
      const unit = await unitService.getUnitById(unitId!);
      form.setFieldsValue({
        code: unit.code,
        name: unit.name,
        symbol: unit.symbol,
        baseUnitId: unit.baseUnitId,
        conversionRate: unit.conversionRate,
        description: unit.description,
      });
    } catch (error) {
      console.error('Error loading unit:', error);
    } finally {
      setFetching(false);
    }
  };

  const loadBaseUnits = async () => {
    try {
      const units = await unitService.getBaseUnits();
      setBaseUnits(units);
    } catch (error) {
      console.error('Error loading base units:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const request: UpdateUnitRequest = {
        id: unitId!,
        code: values.code,
        name: values.name,
        symbol: values.symbol,
        baseUnitId: values.baseUnitId,
        conversionRate: values.conversionRate,
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

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ký Hiệu"
                name="symbol"
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập ký hiệu (VD: kg, ml)" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Đơn Vị Cơ Bản"
                name="baseUnitId"
                style={{ marginBottom: '12px' }}
              >
                <Select
                  placeholder="Chọn đơn vị cơ bản (nếu có)"
                  allowClear
                  options={baseUnits.map(unit => ({
                    label: `${unit.name} (${unit.code})`,
                    value: unit.id,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tỷ Lệ Chuyển Đổi"
                name="conversionRate"
                tooltip="VD: 1 thùng = 24 chai, nhập 24"
                style={{ marginBottom: '12px' }}
              >
                <InputNumber
                  placeholder="Nhập tỷ lệ chuyển đổi"
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                />
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
