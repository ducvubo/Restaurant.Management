import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, InputNumber, Select, message, Tag, Input, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import unitConversionService from '../../services/unitConversionService';
import type { UnitConversion, UnitConversionRequest } from '../../services/unitConversionService';
import { unitService } from '../../services/unitService';

const UnitConversionManagement: React.FC = () => {
  const [conversions, setConversions] = useState<UnitConversion[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });

  useEffect(() => {
    loadData();
  }, [pagination.page, pagination.size]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [conversionsRes, unitsRes] = await Promise.all([
        unitConversionService.list({ page: pagination.page, size: pagination.size }),
        unitService.getUnitList({ page: 1, size: 1000 })
      ]);
      setConversions(conversionsRes.result?.items || []);
      setPagination(prev => ({ ...prev, total: conversionsRes.result?.total || 0 }));
      setUnits(unitsRes.items || []);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: UnitConversion) => {
    if (record.usageCount > 0) {
      Modal.confirm({
        title: 'Cảnh báo',
        content: `Có ${record.usageCount} giao dịch đang sử dụng hệ số này. Hệ số mới chỉ áp dụng cho giao dịch sau này. Tiếp tục?`,
        onOk: () => showEditForm(record)
      });
    } else {
      showEditForm(record);
    }
  };

  const showEditForm = (record: UnitConversion) => {
    setEditingId(record.id);
    form.setFieldsValue({
      fromUnitId: record.fromUnitId,
      toUnitId: record.toUnitId,
      conversionFactor: record.conversionFactor
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: UnitConversionRequest) => {
    try {
      if (editingId) {
        await unitConversionService.update(editingId, values);
        message.success('Cập nhật thành công');
      } else {
        await unitConversionService.create(values);
        message.success('Tạo mới thành công');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa hệ số chuyển đổi này?',
      onOk: async () => {
        try {
          const result = await unitConversionService.delete(id);
          message.success(result.message || 'Xóa thành công');
          loadData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể xóa');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Từ Đơn Vị',
      dataIndex: 'fromUnitName',
      render: (text: string, record: UnitConversion) => 
        `${record.fromUnitSymbol} (${text})`
    },
    {
      title: 'Sang Đơn Vị',
      dataIndex: 'toUnitName',
      render: (text: string, record: UnitConversion) => 
        `${record.toUnitSymbol} (${text})`
    },
    {
      title: 'Hệ Số',
      dataIndex: 'conversionFactor',
      render: (val: number) => {
        // Remove trailing zeros
        const formatted = val.toFixed(6);
        return parseFloat(formatted).toString();
      }
    },
    {
      title: 'Giao Dịch Sử Dụng',
      dataIndex: 'usageCount',
      render: (count: number) => 
        count > 0 ? <Tag color="warning">{count}</Tag> : <Tag>0</Tag>
    },
    {
      title: 'Thao Tác',
      render: (_: any, record: UnitConversion) => (
        <>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </>
      )
    }
  ];

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Quản Lý Hệ Số Chuyển Đổi</span>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Thêm Hệ Số Chuyển Đổi
          </Button>
        </div>
      }
    >
      <Table 
        dataSource={conversions}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.page,
          pageSize: pagination.size,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bản ghi`,
          onChange: (page, size) => setPagination(prev => ({ ...prev, page, size: size || 10 }))
        }}
      />

      <Modal
        title={editingId ? 'Sửa Hệ Số Chuyển Đổi' : 'Thêm Hệ Số Chuyển Đổi'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        onOk={() => form.submit()}
        width={600}
        styles={{ body: { paddingTop: 16 } }}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Từ Đơn Vị" 
                name="fromUnitId"
                rules={[
                  { required: true, message: 'Vui lòng chọn đơn vị' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || !getFieldValue('toUnitId') || value !== getFieldValue('toUnitId')) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Đơn vị nguồn và đích phải khác nhau!'));
                    },
                  }),
                ]}
              >
                <Select 
                  placeholder="Chọn đơn vị nguồn" 
                  showSearch 
                  optionFilterProp="children"
                  onChange={() => form.validateFields(['toUnitId'])}
                  disabled={!!editingId} // Disable when editing
                >
                  {units.map(u => (
                    <Select.Option key={u.id} value={u.id}>
                      {u.code} - {u.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item 
                label="Sang Đơn Vị" 
                name="toUnitId"
                rules={[
                  { required: true, message: 'Vui lòng chọn đơn vị' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || !getFieldValue('fromUnitId') || value !== getFieldValue('fromUnitId')) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Đơn vị nguồn và đích phải khác nhau!'));
                    },
                  }),
                ]}
              >
                <Select 
                  placeholder="Chọn đơn vị đích" 
                  showSearch 
                  optionFilterProp="children"
                  onChange={() => form.validateFields(['fromUnitId'])}
                  disabled={!!editingId} // Disable when editing
                >
                  {units.map(u => (
                    <Select.Option key={u.id} value={u.id}>
                      {u.code} - {u.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="Hệ Số Chuyển Đổi" 
            name="conversionFactor"
            rules={[
              { required: true, message: 'Vui lòng nhập hệ số' },
              { type: 'number', min: 0.000001, message: 'Hệ số phải > 0' }
            ]}
            extra="VD: 1 KG = 1000 G → nhập 1000"
          >
            <InputNumber 
              style={{ width: '100%' }}
              step={0.000001}
              placeholder="Nhập hệ số chuyển đổi"
              formatter={(value) => {
                if (!value) return '';
                // Remove trailing zeros
                return parseFloat(value.toString()).toString();
              }}
              parser={(value) => {
                if (!value) return 0;
                return parseFloat(value);
              }}
            />
          </Form.Item>

          <Form.Item label="Lý Do" name="reason">
            <Input.TextArea rows={3} placeholder="Lý do thay đổi (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UnitConversionManagement;
