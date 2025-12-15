import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Select, Space, Row, Col } from 'antd';
import { permissionService, type PermissionModel } from '@/services/permissionService';
import type { CreatePolicyRequest } from '@/types';
import enumData from '@/enums';
import { policyService } from '@/services/policyService';
import PermissionTree from '@/components/PermissionTree';

const { TextArea } = Input;

const AddPolicy = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionModel[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
    } catch (err) {
      console.error('Error loading permissions:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const request: CreatePolicyRequest = {
        name: values.name,
        description: values.description,
        policies: selectedKeys,
        status: values.status || enumData.dataStatus.ACTIVE.value,
      };

      setLoading(true);
      await policyService.createPolicy(request);
      navigate('/policies');
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
          <h1 className="text-xl font-bold m-0">Tạo Tập Quyền Mới</h1>
          <Space>
            <Button onClick={() => navigate('/policies')}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={loading}
              disabled={selectedKeys.length === 0}
            >
              Tạo Mới
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: enumData.dataStatus.ACTIVE.value,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                label="Tên Tập Quyền"
                name="name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên tập quyền' },
                  { min: 3, message: 'Tên tập quyền phải có ít nhất 3 ký tự' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập tên tập quyền" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Trạng Thái"
                name="status"
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn trạng thái" style={{ width: '100%' }}>
                  {enumData.dataStatus.list
                    .filter(item => item.value !== enumData.dataStatus.DELETED.value)
                    .map(item => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.text}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô Tả"
            name="description"
            style={{ marginBottom: '12px' }}
          >
            <TextArea rows={2} placeholder="Nhập mô tả tập quyền" />
          </Form.Item>

          <Form.Item
            label="Danh Sách Quyền"
            required
            help={selectedKeys.length > 0 ? `Đã chọn ${selectedKeys.length} quyền` : 'Vui lòng chọn ít nhất một quyền'}
          >
            <div className="">
              {permissions.length > 0 ? (
                <PermissionTree
                  permissions={permissions}
                  selectedKeys={selectedKeys}
                  onChange={setSelectedKeys}
                />
              ) : (
                <div className="text-center text-gray-400 py-8">Đang tải danh sách quyền...</div>
              )}
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddPolicy;


