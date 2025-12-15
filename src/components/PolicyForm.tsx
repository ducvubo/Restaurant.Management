import { Form, Input, Button, Modal, Select, Switch } from 'antd';
import { useEffect } from 'react';
import type { Policy, CreatePolicyRequest, UpdatePolicyRequest } from '../types';

const { TextArea } = Input;

interface PolicyFormProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: CreatePolicyRequest | UpdatePolicyRequest) => Promise<void>;
  initialValues?: Policy;
  isEdit?: boolean;
  loading?: boolean;
  availablePermissions?: string[]; // List of available permission keys
}

const PolicyForm = ({ 
  open, 
  onCancel, 
  onFinish, 
  initialValues, 
  isEdit = false, 
  loading = false,
  availablePermissions = []
}: PolicyFormProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues && isEdit) {
        form.setFieldsValue({
          name: initialValues.name,
          description: initialValues.description || '',
          policies: initialValues.policies || [],
          status: initialValues.status,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: 1, // ACTIVE
          policies: [],
        });
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
      // title={isEdit ? 'Chỉnh Sửa Tập Quyền' : 'Tạo Tập Quyền Mới'}
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
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 1, // ACTIVE
          policies: [],
        }}
      >
        <Form.Item
          label="Tên Tập Quyền"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên tập quyền' },
            { min: 3, message: 'Tên tập quyền phải có ít nhất 3 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên tập quyền" />
        </Form.Item>

        <Form.Item
          label="Mô Tả"
          name="description"
        >
          <TextArea rows={3} placeholder="Nhập mô tả tập quyền" />
        </Form.Item>

        <Form.Item
          label="Danh Sách Quyền"
          name="policies"
          rules={[
            { required: true, message: 'Vui lòng chọn ít nhất một quyền' },
            { type: 'array', min: 1, message: 'Vui lòng chọn ít nhất một quyền' },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn các quyền"
            style={{ width: '100%' }}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={availablePermissions.map(permission => ({
              label: permission,
              value: permission,
            }))}
          />
        </Form.Item>

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
      </Form>
    </Modal>
  );
};

export default PolicyForm;

