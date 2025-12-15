import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Space, message, Row, Col } from 'antd';
import type { CreateMaterialCategoryRequest } from '@/types';
import { materialCategoryService } from '@/services/materialCategoryService';

const { TextArea } = Input;

const AddMaterialCategory = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const request: CreateMaterialCategoryRequest = {
        code: values.code,
        name: values.name,
        description: values.description,
      };

      const result = await materialCategoryService.create(request);
      if (result.success) {
        navigate('/material-categories');
      } else {
        message.error(result.message || 'Tạo danh mục thất bại');
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
          <h1 className="text-xl font-bold m-0">Thêm Danh Mục Mới</h1>
          <Space>
            <Button onClick={() => navigate('/material-categories')}>
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
                label="Mã Danh Mục"
                rules={[{ required: true, message: 'Vui lòng nhập mã danh mục' }]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập mã danh mục" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Tên Danh Mục"
                rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập tên danh mục" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô Tả"
            style={{ marginBottom: '12px' }}
          >
            <TextArea rows={3} placeholder="Nhập mô tả danh mục" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddMaterialCategory;

