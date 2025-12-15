import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Form, Input, Button, Space, message, Spin, Row, Col } from 'antd';
import { materialCategoryService } from '@/services/materialCategoryService';
import type { UpdateMaterialCategoryRequest } from '@/types';

const { TextArea } = Input;

const UpdateMaterialCategory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!id) {
      message.error('Không tìm thấy ID danh mục');
      navigate('/material-categories');
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const data = await materialCategoryService.getById(id!);
      form.setFieldsValue(data);
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
      const request: UpdateMaterialCategoryRequest = {
        id: id!,
        code: values.code,
        name: values.name,
        description: values.description,
      };

      const result = await materialCategoryService.update(request);
      if (result.success) {
        navigate('/material-categories');
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
          <h1 className="text-xl font-bold m-0">Cập Nhật Danh Mục</h1>
          <Space>
            <Button onClick={() => navigate('/material-categories')}>
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

export default UpdateMaterialCategory;

