
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Form, Input, Button, Select, Space, InputNumber, message, Spin, Row, Col } from 'antd';
import { materialService } from '../services/materialService';
import { unitService } from '../services/unitService';
import { materialCategoryService } from '../services/materialCategoryService';
import type { UpdateMaterialRequest, Unit, MaterialCategory } from '../types';

const { Option } = Select;
const { TextArea } = Input;

const UpdateMaterial = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);

  useEffect(() => {
    if (!id) {
        message.error('Không tìm thấy ID NVL');
        navigate('/materials');
        return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
        const [unitData, categoryData, materialData] = await Promise.all([
            unitService.getAllUnits(),
            materialCategoryService.getAll(),
            materialService.getMaterialById(id!)
        ]);
        setUnits(unitData);
        setCategories(categoryData);
        
        // Map data to form
        form.setFieldsValue({
            ...materialData,
            categoryId: (materialData as any).categoryId, // Ensure TS knows about categoryId
        });
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
      const request: UpdateMaterialRequest = {
        id: id!,
        code: values.code,
        name: values.name,
        category: '', // Provide empty string as fallback
        categoryId: values.categoryId,
        unitId: values.unitId,
        unitPrice: values.unitPrice,
        minStockLevel: values.minStockLevel,
        maxStockLevel: values.maxStockLevel,
        description: values.description,
      } as any; // Cast

      const result = await materialService.updateMaterial(request);
      if (result.success) {
        message.success('Cập nhật NVL thành công');
        navigate('/materials');
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
          <h1 className="text-xl font-bold m-0">Cập Nhật Nguyên Vật Liệu</h1>
          <Space>
            <Button onClick={() => navigate('/materials')}>
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

export default UpdateMaterial;
