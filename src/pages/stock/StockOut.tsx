import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Button, Select, Space, InputNumber, message, DatePicker, Row, Col, Table, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Material, StockOutItemRequest, Unit, Warehouse } from '@/types';
import type { Customer } from '@/services/customerService';
import { warehouseService } from '@/services/warehouseService';
import { materialService } from '@/services/materialService';
import { unitService } from '@/services/unitService';
import { stockTransactionService } from '@/services/stockTransactionService';
import { inventoryLedgerService } from '@/services/inventoryLedgerService';
import { customerService } from '@/services/customerService';
import enumData from '@/enums/enums';

const { Option } = Select;
const { TextArea } = Input;

interface ItemRow extends StockOutItemRequest {
  key: string;
  availableStock?: number;
}

const StockOut = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [stockOutType, setStockOutType] = useState<number | undefined>(undefined);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>(undefined);
  
  const [items, setItems] = useState<ItemRow[]>([
    { key: '1', materialId: '', unitId: '', quantity: 0 }
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
      const [whData, matData, unitData, custData] = await Promise.all([
        warehouseService.getList({ page: 1, size: 100 }),
        materialService.getList({ page: 1, size: 100 }),
        unitService.getAllUnits(),
        customerService.getList(),
      ]);

      setWarehouses(whData.items);
      setMaterials(matData.items);
      setUnits(unitData);
      setCustomers(custData.items);
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
        stockOutType: transaction.stockOutType,
        destinationWarehouseId: transaction.destinationWarehouseId,
        customerId: transaction.customerId,
        disposalReason: transaction.disposalReason,
        destinationBranchId: transaction.destinationBranchId,
        transactionDate: transaction.transactionDate ? dayjs(transaction.transactionDate) : dayjs(),
        referenceNumber: transaction.referenceNumber,
        notes: transaction.notes,
      });
      
      // Set stock out type state
      if (transaction.stockOutType) {
        setStockOutType(transaction.stockOutType);
      }
      
      // Set selected warehouse
      if (transaction.warehouseId) {
        setSelectedWarehouse(transaction.warehouseId);
      }
      
      // Pre-fill items
      if (transaction.stockOutItems && transaction.stockOutItems.length > 0) {
        const loadedItems: ItemRow[] = transaction.stockOutItems.map((item, index) => ({
          key: String(index),
          materialId: item.materialId,
          unitId: item.unitId,
          quantity: item.quantity,
          notes: item.notes,
        }));
        setItems(loadedItems);
      }
    } catch (err) {
      message.error('Không thể tải thông tin phiếu xuất');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialChange = async (materialId: string, key: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      setItems(prev => prev.map(item => 
        item.key === key 
          ? { ...item, materialId, unitId: material.unitId, availableStock: undefined }
          : item
      ));
      
      // Load available stock
      const warehouseId = form.getFieldValue('warehouseId');
      if (warehouseId) {
        try {
          const stock = await inventoryLedgerService.getAvailableStock(warehouseId, materialId);
          setItems(prev => prev.map(item => 
            item.key === key ? { ...item, availableStock: stock } : item
          ));
        } catch (e) {
          console.error('Error loading stock:', e);
        }
      }
    }
  };

  const handleItemChange = (key: string, field: keyof ItemRow, value: any) => {
    setItems(prev => prev.map(item => 
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    const newKey = String(Date.now());
    setItems([...items, { key: newKey, materialId: '', unitId: '', quantity: 0 }]);
  };

  const removeItem = (key: string) => {
    if (items.length === 1) {
      message.warning('Phải có ít nhất 1 nguyên liệu');
      return;
    }
    setItems(items.filter(item => item.key !== key));
  };

  const onFinish = async (_: any) => {
    // Validate form fields first
    try {
      await form.validateFields();
    } catch (errorInfo) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

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
      const result = await stockTransactionService.stockOut({
        warehouseId: form.getFieldValue('warehouseId'),
        destinationBranchId: form.getFieldValue('destinationBranchId'),
        transactionDate: form.getFieldValue('transactionDate')?.toISOString(),
        referenceNumber: form.getFieldValue('referenceNumber'),
        notes: form.getFieldValue('notes'),
        // Stock Out Type fields
        stockOutType: form.getFieldValue('stockOutType'),
        destinationWarehouseId: form.getFieldValue('destinationWarehouseId'),
        customerId: form.getFieldValue('customerId'),
        disposalReason: form.getFieldValue('disposalReason'),
        items: items.map(item => ({
          materialId: item.materialId!,
          unitId: item.unitId!,
          quantity: item.quantity!,
          notes: item.notes,
        })),
      });

      if (result.success) {
        // baseHttp already shows success notification
        form.resetFields();
        setItems([{ key: String(Date.now()), materialId: '', unitId: '', quantity: 0 }]);
        setStockOutType(undefined);
        navigate('/stock-out');
      }
      // baseHttp already shows error notification if failed
    } catch (error: any) {
      // baseHttp already shows error notification
      console.error('Stock out error:', error);
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
      width: 300,
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
      width: 150,
      render: (value: number, record: ItemRow) => {
        const hasStock = record.availableStock !== undefined;
        const exceedsStock = hasStock && value > record.availableStock!;
        const lowStock = hasStock && record.availableStock! > 0 && record.availableStock! <= (record.availableStock! * 0.1);
        
        return (
          <div>
            <InputNumber
              value={value}
              onChange={(val) => handleItemChange(record.key, 'quantity', val || 0)}
              min={0.001}
              max={hasStock ? record.availableStock : undefined}
              style={{ width: '100%' }}
              placeholder="Số lượng"
              status={exceedsStock ? 'error' : undefined}
            />
            {exceedsStock && (
              <div className="text-red-500 text-xs mt-1">Vượt tồn kho!</div>
            )}
            {lowStock && !exceedsStock && (
              <div className="text-orange-500 text-xs mt-1">Tồn kho thấp!</div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'availableStock',
      width: 100,
      render: (stock: number | undefined) => {
        if (stock === undefined) return <span className="text-gray-400">-</span>;
        const isLow = stock > 0 && stock <= (stock * 0.1);
        return (
          <span className={isLow ? 'text-orange-600 font-bold' : 'text-green-600 font-bold'}>
            {stock}
          </span>
        );
      },
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      width: 200,
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
          <h1 className="text-xl font-bold m-0">Phiếu Xuất Kho</h1>
          <Space>
            <Button onClick={() => navigate('/stock-out')}>
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={form.submit}
              loading={loading}
            >
              Lưu Phiếu Xuất
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
                label="Kho Xuất"
                rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select 
                  placeholder="Chọn kho" 
                  showSearch 
                  filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}
                  onChange={(value) => setSelectedWarehouse(value)}
                >
                  {warehouses.map(w => (
                    <Option key={w.id} value={w.id}>{w.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="stockOutType"
                label="Loại Xuất Kho"
                rules={[{ required: true, message: 'Vui lòng chọn loại xuất kho' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select 
                  placeholder="Chọn loại xuất kho"
                  onChange={(value) => setStockOutType(value)}
                >
                  {enumData.stockOutType.list.map(item => (
                    <Option key={item.value} value={item.value}>{item.text}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Conditional Fields based on Stock Out Type */}
          {stockOutType === 1 && (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="destinationWarehouseId"
                  label="Kho Đích"
                  rules={[{ required: true, message: 'Vui lòng chọn kho đích' }]}
                  style={{ marginBottom: '12px' }}
                >
                  <Select 
                    placeholder="Chọn kho đích"
                    showSearch
                    filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}
                  >
                    {warehouses
                      .filter(w => w.id !== selectedWarehouse && w.status === 1)
                      .map(w => (
                        <Option key={w.id} value={w.id}>{w.name}</Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {stockOutType === 2 && (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="customerId"
                  label="Khách Hàng"
                  rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                  style={{ marginBottom: '12px' }}
                >
                  <Select
                    placeholder="Chọn khách hàng"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => 
                      (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                    }
                    dropdownRender={menu => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Button
                          type="link"
                          icon={<PlusOutlined />}
                          onClick={() => window.open('/customers/add', '_blank')}
                          style={{ width: '100%', textAlign: 'left' }}
                        >
                          Thêm khách hàng mới
                        </Button>
                      </>
                    )}
                  >
                    {customers
                      .filter(c => c.status === 1)
                      .map(c => (
                        <Option key={c.id} value={c.id}>
                          {c.name} {c.phone && `- ${c.phone}`}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          {stockOutType === 3 && (
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="disposalReason"
                  label="Lý Do Tiêu Hủy"
                  rules={[{ required: true, message: 'Vui lòng nhập lý do tiêu hủy' }]}
                  style={{ marginBottom: '12px' }}
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Nhập lý do tiêu hủy (VD: Hết hạn, hư hỏng, không đạt chất lượng...)" 
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="destinationBranchId"
                label="Nơi Nhận (Chi Nhánh)"
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập nơi nhận" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="transactionDate"
                label="Ngày Xuất"
                rules={[{ required: true, message: 'Vui lòng chọn ngày xuất' }]}
                style={{ marginBottom: '12px' }}
              >
                <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="referenceNumber"
                label="Số Chứng Từ"
                rules={[{ required: true, message: 'Vui lòng nhập số chứng từ' }]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập số chứng từ" />
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
            scroll={{ x: 900 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default StockOut;
