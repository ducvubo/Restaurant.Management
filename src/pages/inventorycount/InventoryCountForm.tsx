import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Button, Select, DatePicker, Input, Table, message, Space, Tag, Row, Col } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import inventoryCountService, { type InventoryCountItemRequest } from '@/services/inventoryCountService';
import { warehouseService } from '@/services/warehouseService';

const InventoryCountForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadWarehouses();
    if (id) {
      loadData();
    }
  }, [id]);

  const loadWarehouses = async () => {
    try {
      const result = await warehouseService.getList({ page: 1, size: 100, status: 1 });
      setWarehouses(result.items || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  const loadData = async () => {
    try {
      const response = await inventoryCountService.get(id!);
      const result = response.data;
      if (result.success && result.result) {
        const data = result.result;
        form.setFieldsValue({
          warehouseId: data.warehouseId,
          countDate: dayjs(data.countDate),
          notes: data.notes,
        });
        setSelectedWarehouse(data.warehouseId);
        setItems(data.items.map((item: any) => ({
          ...item,
          key: item.id,
        })));
      }
    } catch (error) {
      message.error('Lỗi khi tải thông tin');
    }
  };

  useEffect(() => {
    if (selectedWarehouse && !id) {
      // Clear old items first
      setItems([]);
      // Then load new batches
      handleLoadBatches();
    }
  }, [selectedWarehouse]);

  const handleLoadBatches = async () => {
    if (!selectedWarehouse) {
      message.warning('Vui lòng chọn kho');
      return;
    }

    try {
      const response = await inventoryCountService.loadBatches(selectedWarehouse);
      console.log('Load batches response:', response);
      
      // baseHttp returns raw axios response, so data is in response.data
      const result = response.data;
      console.log('Result:', result);
      
      if (result.success && result.result && result.result.length > 0) {
        console.log('Setting batches to table:', result.result);
        
        // Directly populate items table with all batches
        const newItems = result.result.map((batch: any) => ({
          key: batch.inventoryLedgerId,
          materialId: batch.materialId,
          materialName: batch.materialName,
          unitId: batch.unitId,
          unitName: batch.unitName,
          inventoryLedgerId: batch.inventoryLedgerId,
          batchNumber: batch.batchNumber,
          transactionDate: batch.transactionDate,
          systemQuantity: batch.remainingQuantity,
          actualQuantity: batch.remainingQuantity, // Default = system quantity
          differenceQuantity: 0,
        }));
        
        setItems(newItems);
      } else {
        message.info('Không có lô hàng nào trong kho này');
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      message.error('Lỗi khi tải danh sách lô');
    }
  };


  const getDifferenceTag = (diff: number) => {
    if (diff > 0) return <Tag color="green">+{diff}</Tag>;
    if (diff < 0) return <Tag color="red">{diff}</Tag>;
    return <Tag color="default">0</Tag>;
  };

  const handleActualQuantityChange = (key: string, value: number) => {
    setItems(prev => prev.map(item => {
      if (item.key === key) {
        const diff = value - item.systemQuantity;
        return { ...item, actualQuantity: value, differenceQuantity: diff };
      }
      return item;
    }));
  };

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.warning('Vui lòng chọn ít nhất một lô để kiểm kê');
      return;
    }

    try {
      setLoading(true);
      const requestItems: InventoryCountItemRequest[] = items.map(item => ({
        materialId: item.materialId,
        unitId: item.unitId,
        inventoryLedgerId: item.inventoryLedgerId,
        actualQuantity: item.actualQuantity,
        notes: item.notes,
      }));

      const request = {
        warehouseId: values.warehouseId,
        countDate: values.countDate.toISOString(),
        notes: values.notes,
        items: requestItems,
      };

      let response;
      if (id) {
        response = await inventoryCountService.update(id, request);
      } else {
        response = await inventoryCountService.create(request);
      }

      const result = response.data;
      if (result.success) {
        message.success(id ? 'Cập nhật thành công' : 'Tạo phiếu kiểm kê thành công');
        navigate('/inventory-count');
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi lưu phiếu kiểm kê');
    } finally {
      setLoading(false);
    }
  };


  const itemColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Nguyên Liệu',
      dataIndex: 'materialName',
      key: 'materialName',
    },
    {
      title: 'Số Lô',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
    },
    {
      title: 'Ngày Nhập',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Đơn Vị',
      dataIndex: 'unitName',
      key: 'unitName',
      width: 80,
    },
    {
      title: 'SL Sổ Sách',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      width: 110,
      align: 'right' as const,
    },
    {
      title: 'SL Thực Tế',
      key: 'actualQuantity',
      width: 130,
      render: (_: any, record: any) => (
        <Input
          type="number"
          value={record.actualQuantity}
          onChange={(e) => handleActualQuantityChange(record.key, parseFloat(e.target.value) || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Chênh Lệch',
      dataIndex: 'differenceQuantity',
      key: 'differenceQuantity',
      width: 110,
      align: 'right' as const,
      render: (diff: number) => getDifferenceTag(diff),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
        <Button
          type="link"
          danger
          size="small"
          onClick={() => setItems(prev => prev.filter(item => item.key !== record.key))}
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card styles={{ body: { padding: '16px' } }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold m-0">{id ? 'Sửa' : 'Tạo'} Phiếu Kiểm Kê</h1>
          <Space>
            <Button onClick={() => navigate('/inventory-count')}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} onClick={() => form.submit()}>
              Lưu
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            countDate: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Kho"
                name="warehouseId"
                rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
              >
                <Select
                  placeholder="Chọn kho"
                  onChange={(value) => setSelectedWarehouse(value)}
                  disabled={!!id}
                >
                  {warehouses.map(w => (
                    <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Ngày Kiểm Kê"
                name="countDate"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Ghi Chú" name="notes">
                <Input.TextArea rows={2} placeholder="Nhập ghi chú" />
              </Form.Item>
            </Col>
          </Row>

          <h3 className="text-lg font-semibold mb-2">Chi Tiết Kiểm Kê ({items.length} lô)</h3>
          <Table
            columns={itemColumns}
            dataSource={items}
            pagination={false}
            scroll={{ x: 1000 }}
            locale={{ emptyText: 'Chọn kho để tự động load danh sách lô hàng.' }}
          />
        </Form>
      </Card>
    </div>
  );
};

export default InventoryCountForm;
