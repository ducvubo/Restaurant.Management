import React from 'react';
import { Form, Input } from 'antd';

const QuickAddUnit: React.FC = () => {
  return (
    <>
      <Form.Item
        name="code"
        label="Mã đơn vị"
        rules={[{ required: true, message: 'Vui lòng nhập mã đơn vị' }]}
      >
        <Input placeholder="Ví dụ: KG, L, CAI" maxLength={10} />
      </Form.Item>

      <Form.Item
        name="name"
        label="Tên đơn vị"
        rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị' }]}
      >
        <Input placeholder="Ví dụ: Kilogram, Lít, Cái" />
      </Form.Item>
      
      <Form.Item
        name="description"
        label="Mô tả"
      >
        <Input.TextArea rows={2} placeholder="Nhập mô tả (tùy chọn)" />
      </Form.Item>
    </>
  );
};

export default QuickAddUnit;
