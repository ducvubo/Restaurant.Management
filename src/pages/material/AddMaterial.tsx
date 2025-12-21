import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Space, InputNumber, message, Row, Col } from 'antd';
import type { CreateMaterialRequest, MaterialCategory } from '@/types';
import { materialCategoryService } from '@/services/materialCategoryService';
import { materialService } from '@/services/materialService';
import SelectWithAdd from '@/components/SelectWithAdd';
import QuickAddCategory from '@/components/quickAdd/QuickAddCategory';

const { TextArea } = Input;

const AddMaterial = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const categoryData = await materialCategoryService.getAll();
      console.log('Loaded categories:', categoryData);
      setCategories(categoryData || []);
    } catch (e) {
      console.error(e);
      message.error('Lỗi tải dữ liệu');
    }
  };

  const handleAddCategory = async (values: any) => {
    const result = await materialCategoryService.create(values);
    if (result.success) {
      await loadData(); // Reload categories
      return result.result?.id;
    }
    throw new Error(result.message || 'Không thể tạo danh mục');
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
      <Card styles={{ body: { padding: '16px' } }}>
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
                <SelectWithAdd
                  key={`category-${(categories || []).length}`}
                  selectProps={{
                    placeholder: "Chọn danh mục",
                    options: (categories || []).map(c => ({ label: c.name, value: c.id })),
                    showSearch: true,
                    filterOption: (input, option) =>
                      String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }}
                  modalTitle="Thêm danh mục nhanh"
                  onAdd={handleAddCategory}
                  renderModalContent={() => <QuickAddCategory />}
                  addButtonTooltip="Thêm danh mục mới"
                />
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

