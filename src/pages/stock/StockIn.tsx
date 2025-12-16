import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Button, Select, Space, InputNumber, message, DatePicker, Row, Col, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Material, StockInRequest, StockInItemRequest, Supplier, Unit, Warehouse } from '@/types';
import { warehouseService } from '@/services/warehouseService';
import { materialService } from '@/services/materialService';
import { unitService } from '@/services/unitService';
import { supplierService } from '@/services/supplierService';
import { stockTransactionService } from '@/services/stockTransactionService';

const { Option } = Select;
const { TextArea } = Input;

interface ItemRow extends StockInItemRequest {
  key: string;
}

const StockIn = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  const [items, setItems] = useState<ItemRow[]>([
    { key: '1', materialId: '', unitId: '', quantity: 0, unitPrice: 0 }
  ]);

  useEffect(() => {
    loadMetaData();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      loadTransactionData();
    }
  }, [id, isEditMode]);

  const loadMetaData = async () => {
    try {
      const [whData, matData, unitData, supData] = await Promise.all([
        warehouseService.getList({ page: 1, size: 100 }),
        materialService.getList({ page: 1, size: 100 }),
        unitService.getAllUnits(),
        supplierService.getAllSuppliers(),
      ]);

      setWarehouses(whData.items);
      setMaterials(matData.items);
      setUnits(unitData);
      setSuppliers(supData);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTransactionData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const transaction = await stockTransactionService.getTransaction(id);
      
      // Pre-fill form
      form.setFieldsValue({
        warehouseId: transaction.warehouseId,
        supplierId: transaction.supplierId,
        transactionDate: transaction.transactionDate ? dayjs(transaction.transactionDate) : dayjs(),
        referenceNumber: transaction.referenceNumber,
        notes: transaction.notes,
      });
      
      // Pre-fill items
      if (transaction.stockInItems && transaction.stockInItems.length > 0) {
        const loadedItems: ItemRow[] = transaction.stockInItems.map((item, index) => ({
          key: String(index),
          materialId: item.materialId,
          unitId: item.unitId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes,
        }));
        setItems(loadedItems);
      }
    } catch (err) {
      message.error('Không thể tải thông tin phiếu nhập');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialChange = (materialId: string, key: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      setItems(prev => prev.map(item => 
        item.key === key 
          ? { ...item, materialId, unitId: material.unitId, unitPrice: material.unitPrice || 0 }
          : item
      ));
    }
  };

  const handleItemChange = (key: string, field: keyof ItemRow, value: any) => {
    setItems(prev => prev.map(item => 
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    const newKey = String(Date.now());
    setItems([...items, { key: newKey, materialId: '', unitId: '', quantity: 0, unitPrice: 0 }]);
  };

  const removeItem = (key: string) => {
    if (items.length === 1) {
      message.warning('Phải có ít nhất 1 nguyên liệu');
      return;
    }
    setItems(items.filter(item => item.key !== key));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const onFinish = async (values: any) => {
    // Validate items
    const hasEmptyMaterial = items.some(item => !item.materialId);
    if (hasEmptyMaterial) {
      message.error('Vui lòng chọn nguyên liệu cho tất cả các dòng');
      return;
    }

    const hasInvalidQuantity = items.some(item => !item.quantity || item.quantity <= 0);
    if (hasInvalidQuantity) {
      message.error('Số lượng phải lớn hơn 0');
      return;
    }

    setLoading(true);
    try {
      const request: StockInRequest = {
        warehouseId: values.warehouseId,
        supplierId: values.supplierId,
        transactionDate: values.transactionDate.toISOString(),
        referenceNumber: values.referenceNumber,
        notes: values.notes || '',
        items: items.map(({ key, ...item }) => item), // Remove key field
      };

      const result = await stockTransactionService.stockIn(request);
      if (result.success) {
        // baseHttp already shows success notification
        form.resetFields();
        setItems([{ key: String(Date.now()), materialId: '', unitId: '', quantity: 0, unitPrice: 0 }]);
        navigate('/stock-in');
      }
      // baseHttp already shows error notification if failed
    } catch (error: any) {
      // baseHttp already shows error notification
      console.error('Stock in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: <span className="text-red-500">* Nguyên Liệu</span>,
      dataIndex: 'materialId',
      width: 250,
      render: (value: string, record: ItemRow) => (
        <Select
          value={value || undefined}
          placeholder="Chọn nguyên liệu"
          onChange={(val) => handleMaterialChange(val, record.key)}
          showSearch
          filterOption={(input, option) => 
            (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
          }
          style={{ width: '100%' }}
        >
          {materials.map(m => (
            <Option key={m.id} value={m.id}>{m.name}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Đơn Vị',
      dataIndex: 'unitId',
      width: 120,
      render: (value: string, record: ItemRow) => (
        <Select
          value={value || undefined}
          placeholder="Đơn vị"
          onChange={(val) => handleItemChange(record.key, 'unitId', val)}
          style={{ width: '100%' }}
        >
          {units.map(u => (
            <Option key={u.id} value={u.id}>{u.name}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: <span className="text-red-500">* Số Lượng</span>,
      dataIndex: 'quantity',
      width: 120,
      render: (value: number, record: ItemRow) => (
        <InputNumber
          value={value}
          onChange={(val) => handleItemChange(record.key, 'quantity', val || 0)}
          min={0.001}
          style={{ width: '100%' }}
          placeholder="Số lượng"
        />
      ),
    },
    {
      title: <span className="text-red-500">* Đơn Giá</span>,
      dataIndex: 'unitPrice',
      width: 150,
      render: (value: number, record: ItemRow) => (
        <InputNumber
          value={value}
          onChange={(val) => handleItemChange(record.key, 'unitPrice', val || 0)}
          min={0}
          style={{ width: '100%' }}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
          placeholder="Đơn giá"
        />
      ),
    },
    {
      title: 'Thành Tiền',
      width: 150,
      render: (_: any, record: ItemRow) => (
        <span className="font-semibold">
          {(record.quantity * record.unitPrice).toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      width: 150,
      render: (value: string, record: ItemRow) => (
        <Input
          value={value}
          onChange={(e) => handleItemChange(record.key, 'notes', e.target.value)}
          placeholder="Ghi chú"
        />
      ),
    },
    {
      title: '',
      width: 60,
      render: (_: any, record: ItemRow) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
          disabled={items.length === 1}
        />
      ),
    },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold m-0">Phiếu Nhập Kho</h1>
          <Space>
            <Button onClick={() => navigate('/stock-in')}>
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={form.submit}
              loading={loading}
            >
              Lưu Phiếu Nhập
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ transactionDate: dayjs() }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="warehouseId"
                label="Kho Nhập"
                rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn kho" showSearch filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>
                  {warehouses.map(w => (
                    <Option key={w.id} value={w.id}>{w.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="supplierId"
                label="Nhà Cung Cấp"
                rules={[{ required: true, message: 'Vui lòng chọn NCC' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn NCC" showSearch filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>
                  {suppliers.map(s => (
                    <Option key={s.id} value={s.id}>{s.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="transactionDate"
                label="Ngày Nhập"
                rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
                style={{ marginBottom: '12px' }}
              >
                <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="referenceNumber"
                label="Số Hóa Đơn / Chứng Từ"
                rules={[{ required: true, message: 'Vui lòng nhập số chứng từ' }]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập số hóa đơn/chứng từ" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi Chú"
            style={{ marginBottom: '12px' }}
          >
            <TextArea rows={2} placeholder="Nhập ghi chú" />
          </Form.Item>
        </Form>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold m-0">Danh Sách Nguyên Liệu</h3>
            <Button type="dashed" icon={<PlusOutlined />} onClick={addItem}>
              Thêm Nguyên Liệu
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={items}
            pagination={false}
            bordered
            size="small"
            scroll={{ x: 1200 }}
          />

          <div className="mt-4 text-right">
            <span className="text-lg font-bold">
              Tổng Cộng: <span className="text-blue-600">{calculateTotal().toLocaleString('vi-VN')} đ</span>
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StockIn;
