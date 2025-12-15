import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Form, Input, Button, Select, Space, InputNumber, message, Spin, Row, Col } from 'antd';
import type { Branch, UpdateWarehouseRequest } from '@/types';
import { branchService } from '@/services/branchService';
import { warehouseService } from '@/services/warehouseService';

const { Option } = Select;
const { TextArea } = Input;

const UpdateWarehouse = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    if (!id) {
        message.error('Không tìm thấy ID kho');
        navigate('/warehouses');
        return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
        const [branchData, warehouseData] = await Promise.all([
            branchService.getAllActiveBranches(),
            warehouseService.getWarehouseById(id!)
        ]);
        setBranches(branchData);
        form.setFieldsValue(warehouseData);
    } catch (e) {
         console.error(e);
         message.error('Lỗi tải dữ liệu');
    } finally {
        setFetching(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const request: UpdateWarehouseRequest = {
        id: id!,
        code: values.code,
        name: values.name,
        branchId: values.branchId,
        address: values.address,
        capacity: values.capacity,
        managerId: values.managerId,
        warehouseType: values.warehouseType,
      };

      const result = await warehouseService.updateWarehouse(request);
      if (result.success) {
        message.success('Cập nhật kho thành công');
        navigate('/warehouses');
      } else {
        message.error(result.message || 'Cập nhật thất bại');
      }
    } catch (error: any) {
         if (error.response?.data?.message) {
             message.error(error.response.data.message);
        }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Spin size="large" className="flex justify-center mt-10" />;

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold m-0">Cập Nhật Kho</h1>
          <Space>
            <Button onClick={() => navigate('/warehouses')}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              onClick={form.submit} 
              loading={loading}
            >
              Lưu Thay Đổi
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
                name="code"
                label="Mã Kho"
                rules={[{ required: true, message: 'Vui lòng nhập mã kho' }]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập mã kho" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Tên Kho"
                rules={[{ required: true, message: 'Vui lòng nhập tên kho' }]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập tên kho" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>

             <Col xs={24} sm={12}>
              <Form.Item
                name="warehouseType"
                label="Loại Kho"
                rules={[{ required: true, message: 'Vui lòng chọn loại kho' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select onChange={(value) => {
                  if (value === 1) { 
                    form.setFieldsValue({ branchId: undefined });
                  }
                }}>
                  <Option value={1}>Kho Tổng</Option>
                  <Option value={2}>Kho Chi Nhánh</Option>
                </Select>
              </Form.Item>
            </Col>
             <Col xs={24} sm={12}>
               <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.warehouseType !== currentValues.warehouseType}
              >
                {({ getFieldValue }) => (
                  <Form.Item
                    name="branchId"
                    label="Chi Nhánh"
                    rules={[{ required: getFieldValue('warehouseType') === 2, message: 'Vui lòng chọn chi nhánh' }]}
                    style={{ marginBottom: '12px' }}
                  >
                    <Select placeholder="Chọn chi nhánh" disabled={getFieldValue('warehouseType') === 1}>
                      {branches.map(b => (
                          <Option key={b.id} value={b.id}>{b.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="capacity"
                label="Sức Chứa"
                style={{ marginBottom: '12px' }}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập sức chứa" />
              </Form.Item>
            </Col>

          </Row>

          <Form.Item
            name="address"
            label="Địa Chỉ"
            style={{ marginBottom: '12px' }}
          >
            <TextArea rows={2} placeholder="Nhập địa chỉ kho" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateWarehouse;

