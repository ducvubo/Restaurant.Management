import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Space, Row, Col, Select } from 'antd';
import { userService } from '../services/userService';
import { policyService } from '../services/policyService';
import type { CreateUserRequest, Policy, ResultMessage, User } from '../types';

const { TextArea } = Input;

const AddUser = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>([]);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const data = await policyService.getAllPolicies();
      setPolicies(data);
    } catch (err) {
      console.error('Error loading policies:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const request: CreateUserRequest = {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
        policyIds: selectedPolicyIds,
      };

      setLoading(true);
      const resp = await userService.createUser(request);
      if (resp.success) {
        navigate('/users');
      }
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
          <h1 className="text-xl font-bold m-0">Tạo Người Dùng Mới</h1>
          <Space>
            <Button onClick={() => navigate('/users')}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={loading}
            >
              Tạo Mới
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
                label="Tên Đăng Nhập"
                name="username"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                  { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập tên đăng nhập" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mật Khẩu"
                name="password"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                ]}
                style={{ marginBottom: '12px' }}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
            </Col>
          </Row>

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

export default AddUser;

