import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, Select, Space, Row, Col } from 'antd';
import { userService } from '../services/userService';
import { policyService } from '../services/policyService';
import enumData from '../enums';
import type { UpdateUserRequest, Policy } from '../types';

const { TextArea } = Input;

const UpdateUser = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      loadUser();
      loadPolicies();
    } else {
      navigate('/users');
    }
  }, [userId]);

  const loadPolicies = async () => {
    try {
      const data = await policyService.getAllPolicies();
      setPolicies(data);
    } catch (err) {
      console.error('Error loading policies:', err);
    }
  };

  const loadUser = async () => {
    try {
      setLoadingUser(true);
      const user = await userService.getUserById(userId!);
      form.setFieldsValue({
        email: user.email,
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        status: user.status,
      });
      setSelectedPolicyIds(user.policyIds || []);
    } catch (err) {
      console.error('Error loading user:', err);
      navigate('/users');
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const request: UpdateUserRequest = {
        id: userId!,
        email: values.email,
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        status: values.status,
        policyIds: selectedPolicyIds,
      };

      setLoading(true);
      const resp = await userService.updateUser(userId!, request);
      if (resp.success) {
        navigate('/users');
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="text-center py-8">Đang tải thông tin người dùng...</div>
      </Card>
    );
  }

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold m-0">Chỉnh Sửa Người Dùng</h1>
          <Space>
            <Button onClick={() => navigate('/users')}>
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
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Họ Tên"
                name="fullName"
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập họ tên" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số Điện Thoại"
                name="phone"
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
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
            label="Địa Chỉ"
            name="address"
            style={{ marginBottom: '12px' }}
          >
            <TextArea rows={2} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            label="Danh Sách Tập Quyền"
            required
            help={
              selectedPolicyIds.length > 0
                ? `Đã chọn ${selectedPolicyIds.length} tập quyền`
                : 'Vui lòng chọn ít nhất một tập quyền'
            }
          >
            <Select
              mode="multiple"
              placeholder="Chọn tập quyền"
              style={{ width: '100%' }}
              value={selectedPolicyIds}
              onChange={setSelectedPolicyIds}
              options={policies.map((p) => ({
                label: p.name,
                value: p.id,
              }))}
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateUser;

