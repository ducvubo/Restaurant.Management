import React, { useState } from 'react';
import { Select, Button, Space, Modal, Form, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd';

interface SelectWithAddProps {
  value?: any;
  onChange?: (value: any) => void;
  selectProps: SelectProps;
  modalTitle: string;
  onAdd: (values: any) => Promise<string | void>; // Returns new item ID
  renderModalContent: (form: any) => React.ReactNode;
  addButtonTooltip?: string;
}

const SelectWithAdd: React.FC<SelectWithAddProps> = ({
  value,
  onChange,
  selectProps,
  modalTitle,
  onAdd,
  renderModalContent,
  addButtonTooltip = 'Thêm mới',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const newId = await onAdd(values);
      
      form.resetFields();
      setIsModalOpen(false);
      
      // Auto-select newly added item
      if (newId && onChange) {
        onChange(newId);
      }
    } catch (error: any) {
      if (error.errorFields) {
        // Validation error - do nothing, form will show errors
        return;
      }
      message.error(error.message || 'Có lỗi xảy ra khi thêm mới');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  return (
    <>
      <Space.Compact style={{ width: '100%' }}>
        <Select {...selectProps} value={value} onChange={onChange} style={{ width: '100%' }} />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          title={addButtonTooltip}
        />
      </Space.Compact>

      <Modal
        title={modalTitle}
        open={isModalOpen}
        onOk={handleAdd}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          {renderModalContent(form)}
        </Form>
      </Modal>
    </>
  );
};

export default SelectWithAdd;
