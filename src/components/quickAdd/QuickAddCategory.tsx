import React from 'react';
import { Form, Input } from 'antd';

const { TextArea } = Input;

const QuickAddCategory: React.FC = () => {
  return (
    <>
      <Form.Item
        name="code"
        label="Mã danh mục"
        rules={[{ required: true, message: 'Vui lòng nhập mã danh mục' }]}
      >
        <Input placeholder="Nhập mã danh mục" />
      </Form.Item>

      <Form.Item
        name="name"
        label="Tên danh mục"
        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
      >
        <Input placeholder="Nhập tên danh mục" />
      </Form.Item>
      
      <Form.Item
        name="description"
        label="Mô tả"
      >
        <TextArea rows={3} placeholder="Nhập mô tả (tùy chọn)" />
      </Form.Item>
    </>
  );
};

export default QuickAddCategory;
