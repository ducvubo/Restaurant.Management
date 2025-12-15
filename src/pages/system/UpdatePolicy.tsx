import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, Select, Space, Row, Col } from 'antd';
import { permissionService, type PermissionModel } from '@/services/permissionService';
import { policyService } from '@/services/policyService';
import type { UpdatePolicyRequest } from '@/types';
import enumData from '@/enums';
import PermissionTree from '@/components/PermissionTree';

const { TextArea } = Input;

const UpdatePolicy = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const policyId = searchParams.get('id');

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingPolicy, setLoadingPolicy] = useState(true);
  const [permissions, setPermissions] = useState<PermissionModel[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (policyId) {
      loadPolicy();
      loadPermissions();
    } else {
      navigate('/policies');
    }
  }, [policyId]);

  const loadPolicy = async () => {
    try {
      setLoadingPolicy(true);
      const policy = await policyService.getPolicyById(policyId!);
      form.setFieldsValue({
        name: policy.name,
        description: policy.description || '',
        status: policy.status,
      });
      setSelectedKeys(policy.policies || []);
    } catch (err) {
      console.error('Error loading policy:', err);
      navigate('/policies');
    } finally {
      setLoadingPolicy(false);
    }
  };

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

      const request: UpdatePolicyRequest = {
        id: policyId!,
        name: values.name,
        description: values.description,
        policies: selectedKeys,
        status: values.status,
      };

      setLoading(true);
      await policyService.updatePolicy(policyId!, request);
      navigate('/policies');
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPolicy) {
    return (
      <Card>
        <div className="text-center py-8">Đang tải thông tin tập quyền...</div>
      </Card>
    );
  }

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold m-0">Chỉnh Sửa Tập Quyền</h1>
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
            <div className="border border-gray-200 rounded-lg p-2 bg-white max-h-150 overflow-y-auto">
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

export default UpdatePolicy;


