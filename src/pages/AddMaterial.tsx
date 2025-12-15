import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Select, Space, InputNumber, message, Row, Col } from 'antd';
import { materialService } from '../services/materialService';
import { unitService } from '../services/unitService';
import { materialCategoryService } from '../services/materialCategoryService';
import type { CreateMaterialRequest, Unit, MaterialCategory } from '../types';

const { Option } = Select;
const { TextArea } = Input;

const AddMaterial = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [unitData, categoryData] = await Promise.all([
          unitService.getAllUnits(),
          materialCategoryService.getAll()
      ]);
      setUnits(unitData);
      setCategories(categoryData);
    } catch (e) {
      console.error(e);
      message.error('Lỗi tải dữ liệu');
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const request: CreateMaterialRequest = {
        code: values.code,
        name: values.name,
        category: '', // Provide empty string or just ignore it if backend ignores it. Better to rely on categoryId
        categoryId: values.categoryId,
        unitId: values.unitId,
        unitPrice: values.unitPrice,
        minStockLevel: values.minStockLevel,
        maxStockLevel: values.maxStockLevel,
        description: values.description,
      } as any; // Cast to any to include categoryId if not yet in interface or just to suppress

      const result = await materialService.createMaterial(request);
      if (result.success) {
        message.success('Tạo nguyên vật liệu thành công');
        navigate('/materials');
      } else {
        message.error(result.message || 'Tạo thất bại');
      }
    } catch (error: any) {
         if (error.response?.data?.message) {
             message.error(error.response.data.message);
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold m-0">Thêm Nguyên Vật Liệu Mới</h1>
          <Space>
            <Button onClick={() => navigate('/materials')}>
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
                name="code"
                label="Mã NVL"
                rules={[{ required: true, message: 'Vui lòng nhập mã NVL' }]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập mã NVL" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Tên NVL"
                rules={[{ required: true, message: 'Vui lòng nhập tên NVL' }]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập tên NVL" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
             <Col xs={24} sm={12}>
              <Form.Item
                name="categoryId"
                label="Danh Mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                style={{ marginBottom: '12px' }}
              >
               <Select placeholder="Chọn danh mục">
                  {categories.map(c => (
                      <Option key={c.id} value={c.id}>{c.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="unitId"
                label="Đơn Vị Tính"
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn đơn vị">
                  {units.map(u => (
                      <Option key={u.id} value={u.id}>{u.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="unitPrice"
                label="Đơn Giá"
                rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}
                style={{ marginBottom: '12px' }}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
             <Col xs={24} sm={12}>
              <Form.Item
                name="minStockLevel"
                label="Tồn Tối Thiểu"
                style={{ marginBottom: '12px' }}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
             <Col xs={24} sm={12}>
              <Form.Item
                name="maxStockLevel"
                label="Tồn Tối Đa"
                style={{ marginBottom: '12px' }}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô Tả"
            style={{ marginBottom: '12px' }}
          >
            <TextArea rows={2} placeholder="Nhập mô tả" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddMaterial;
