import { Form, Input, Button, Modal, Switch } from 'antd';
import { useEffect } from 'react';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types';

interface UserFormProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  initialValues?: User;
  isEdit?: boolean;
  loading?: boolean;
}

const UserForm = ({ open, onCancel, onFinish, initialValues, isEdit = false, loading = false }: UserFormProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues && isEdit) {
        form.setFieldsValue({
          username: initialValues.username,
          email: initialValues.email,
          fullName: initialValues.fullName || '',
          phone: initialValues.phone || '',
          address: initialValues.address || '',
          status: initialValues.status,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, isEdit, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onFinish(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Chỉnh Sửa Người Dùng' : 'Tạo Người Dùng Mới'}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          {isEdit ? 'Cập Nhật' : 'Tạo Mới'}
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 1, // ACTIVE
        }}
      >
        {!isEdit && (
          <Form.Item
            label="Tên Đăng Nhập"
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tên đăng nhập" />
          </Form.Item>
        )}

        {!isEdit && (
          <Form.Item
            label="Mật Khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
        )}

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          label="Họ Tên"
          name="fullName"
        >
          <Input placeholder="Nhập họ tên" />
        </Form.Item>

        <Form.Item
          label="Số Điện Thoại"
          name="phone"
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          label="Địa Chỉ"
          name="address"
        >
          <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
        </Form.Item>

        {isEdit && (
          <Form.Item
            label="Trạng Thái"
            name="status"
          >
            <Switch 
              checked={form.getFieldValue('status') === 1}
              checkedChildren="Hoạt Động" 
              unCheckedChildren="Không Hoạt Động"
              onChange={(checked) => form.setFieldValue('status', checked ? 1 : 0)}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default UserForm;

