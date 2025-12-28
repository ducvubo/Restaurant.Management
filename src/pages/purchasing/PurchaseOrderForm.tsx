import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Select, Button, Card, message, DatePicker, Table, InputNumber, Space, Row, Col, Tag, Tooltip, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { purchaseOrderService } from '@/services/PurchaseOrderService';
import { warehouseService } from '@/services/warehouseService';
import { supplierService } from '@/services/supplierService';
import { materialService } from '@/services/materialService';
import { unitService } from '@/services/unitService';
import unitConversionService, { type MaterialUnit } from '@/services/unitConversionService';
import type { PurchaseOrderRequest } from '@/types/purchasing';
import type { Unit } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

interface Warehouse {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  code: string;
  name: string;
}

interface Material {
  id: string;
  code: string;
  name: string;
  unitId: string;
  unitName?: string;
  unitPrice: number;
}

interface ItemRow {
  key: string;
  materialId: string;
  materialName?: string;
  quantity: number;
  unitId: string;
  unitPrice: number;
  notes: string;
}

const PurchaseOrderForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const isEditMode = !!id;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialUnits, setMaterialUnits] = useState<Record<string, MaterialUnit[]>>({});
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [currentMaterialForUnit, setCurrentMaterialForUnit] = useState<{ id: string; name: string } | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  
  const [items, setItems] = useState<ItemRow[]>([
    { key: '1', materialId: '', materialName: '', quantity: 1, unitId: '', unitPrice: 0, notes: '' }
  ]);

  useEffect(() => {
    loadMetaData();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      loadOrderData();
    }
  }, [id, isEditMode]);

  const loadMetaData = async () => {
    try {
      const [whData, supData, matData, unitData] = await Promise.all([
        warehouseService.getList({ page: 1, size: 100, status: 1 }),
        supplierService.getSupplierList({ page: 1, size: 200, status: 1 }),
        materialService.getList({ page: 1, size: 500, status: 1 }),
        unitService.getAllUnits(),
      ]);
      setWarehouses(whData.items);
      setSuppliers(supData.items);
      setMaterials(matData.items);
      setAllUnits(unitData);
    } catch (e) {
      console.error(e);
    }
  };

  const loadOrderData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const order = await purchaseOrderService.getById(id);
      
      form.setFieldsValue({
        supplierId: order.supplierId,
        warehouseId: order.warehouseId,
        expectedDeliveryDate: order.expectedDeliveryDate ? dayjs(order.expectedDeliveryDate) : null,
        paymentTerms: order.paymentTerms,
        deliveryTerms: order.deliveryTerms,
        notes: order.notes,
      });
      
      const loadedItems: ItemRow[] = (order.items || []).map((item: any, index: number) => ({
        key: String(index),
        materialId: item.materialId,
        materialName: item.materialName,
        quantity: item.quantity,
        unitId: item.unitId,
        unitPrice: item.unitPrice || 0,
        notes: item.notes || '',
      }));
      
      if (loadedItems.length > 0) {
        setItems(loadedItems);
      }
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialChange = async (materialId: string, key: string) => {
    const material = materials.find(m => m.id === materialId);
    
    // Load units for this material if not already loaded
    if (materialId && !materialUnits[materialId]) {
      try {
        const units = await unitConversionService.getUnitsForMaterial(materialId);
        setMaterialUnits(prev => ({ ...prev, [materialId]: units }));
        const baseUnit = units.find(u => u.isBaseUnit);
        setItems(prev => prev.map(item => 
          item.key === key 
            ? { 
                ...item, 
                materialId, 
                materialName: material?.name,
                unitId: baseUnit?.unitId || '',
                unitPrice: material?.unitPrice || 0
              }
            : item
        ));
      } catch (e) {
        console.error('Error loading units:', e);
        setItems(prev => prev.map(item => 
          item.key === key 
            ? { ...item, materialId, materialName: material?.name, unitId: '', unitPrice: material?.unitPrice || 0 }
            : item
        ));
      }
    } else {
      const units = materialUnits[materialId] || [];
      const baseUnit = units.find(u => u.isBaseUnit);
      setItems(prev => prev.map(item => 
        item.key === key 
          ? { 
              ...item, 
              materialId, 
              materialName: material?.name,
              unitId: baseUnit?.unitId || '',
              unitPrice: material?.unitPrice || 0
            }
          : item
      ));
    }
  };

  const handleItemChange = (key: string, field: keyof ItemRow, value: any) => {
    setItems(prev => prev.map(item => item.key === key ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    const newKey = String(Date.now());
    setItems([...items, { key: newKey, materialId: '', materialName: '', quantity: 1, unitId: '', unitPrice: 0, notes: '' }]);
  };

  const removeItem = (key: string) => {
    if (items.length === 1) {
      message.warning('Phải có ít nhất 1 nguyên liệu');
      return;
    }
    setItems(items.filter(item => item.key !== key));
  };

  const onFinish = async (values: any) => {
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
      const requestData: PurchaseOrderRequest = {
        supplierId: values.supplierId,
        warehouseId: values.warehouseId,
        expectedDeliveryDate: values.expectedDeliveryDate ? values.expectedDeliveryDate.toISOString() : undefined,
        paymentTerms: values.paymentTerms,
        deliveryTerms: values.deliveryTerms,
        notes: values.notes,
        items: items.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity,
          unitId: item.unitId,
          unitPrice: item.unitPrice,
          notes: item.notes || undefined,
        })),
      };

      if (isEditMode && id) {
        requestData.id = id;
        await purchaseOrderService.update(id, requestData);
        message.success('Cập nhật thành công');
      } else {
        await purchaseOrderService.create(requestData);
        message.success('Tạo đơn hàng thành công');
      }
      
      navigate('/purchasing/orders');
    } catch (error: any) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const openAddUnitModal = (materialId: string, materialName: string) => {
    setCurrentMaterialForUnit({ id: materialId, name: materialName });
    setSelectedUnitId('');
    setUnitModalVisible(true);
  };

  const handleAddUnitToMaterial = async () => {
    if (!currentMaterialForUnit || !selectedUnitId) {
      message.warning('Vui lòng chọn đơn vị');
      return;
    }
    try {
      await unitConversionService.addUnitToMaterial(currentMaterialForUnit.id, selectedUnitId, true);
      message.success('Thêm đơn vị thành công');
      const units = await unitConversionService.getUnitsForMaterial(currentMaterialForUnit.id);
      setMaterialUnits(prev => ({ ...prev, [currentMaterialForUnit.id]: units }));
      setUnitModalVisible(false);
    } catch (e) {
      // Error handled by interceptor
    }
  };

  const columns = [
    {
      title: 'Nguyên Liệu',
      dataIndex: 'materialId',
      key: 'materialId',
      width: 280,
      render: (value: string, record: ItemRow) => (
        <Select
          style={{ width: '100%' }}
          value={value || undefined}
          onChange={(val) => handleMaterialChange(val, record.key)}
          placeholder="Chọn nguyên liệu"
          showSearch
          optionFilterProp="children"
        >
          {materials.map(m => (
            <Option key={m.id} value={m.id}>
              {m.code} - {m.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Đơn Vị',
      key: 'unit',
      dataIndex: 'unitId',
      width: 160,
      render: (value: string, record: ItemRow) => {
        const units = materialUnits[record.materialId] || [];
        const material = materials.find(m => m.id === record.materialId);
        
        if (!record.materialId) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        
        if (units.length === 0) {
          return (
            <Tooltip title="Nguyên liệu này chưa có đơn vị. Nhấn để thêm.">
              <Button 
                type="link" 
                danger 
                size="small" 
                icon={<WarningOutlined />}
                onClick={() => openAddUnitModal(record.materialId, material?.name || '')}
              >
                Thêm ĐV
              </Button>
            </Tooltip>
          );
        }
        
        return (
          <Select
            value={value || undefined}
            onChange={(val) => handleItemChange(record.key, 'unitId', val)}
            style={{ width: '100%' }}
            placeholder="Chọn"
          >
            {units.map(u => (
              <Option key={u.unitId} value={u.unitId}>
                {u.unitSymbol}
                {u.isBaseUnit && <Tag color="blue" style={{ marginLeft: 4, fontSize: 10 }}>Cơ sở</Tag>}
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (value: number, record: ItemRow) => (
        <InputNumber
          min={0.01}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'quantity', val || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      render: (value: number, record: ItemRow) => (
        <InputNumber
          min={0}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'unitPrice', val || 0)}
          style={{ width: '100%' }}
          formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={v => Number(v!.replace(/\$\s?|(,*)/g, '')) || 0}
        />
      ),
    },
    {
      title: 'Thành Tiền',
      key: 'amount',
      width: 130,
      render: (_: any, record: ItemRow) => {
        const amount = (record.quantity || 0) * (record.unitPrice || 0);
        return amount.toLocaleString('vi-VN') + ' ₫';
      },
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      key: 'notes',
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
      key: 'action',
      width: 50,
      render: (_: any, record: ItemRow) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
        />
      ),
    },
  ];

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  };

  return (
    <div>
      <Card bodyStyle={{ padding: '12px' }}>
        <div className="flex items-center justify-between mb-3">
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/purchasing/orders')}
            />
            <h2 className="text-xl font-bold m-0">
              {isEditMode ? 'Sửa Đơn Đặt Hàng' : 'Tạo Đơn Đặt Hàng'}
            </h2>
          </Space>
          <Space>
            <Button onClick={() => navigate('/purchasing/orders')}>
              Hủy
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={loading}
            >
              Lưu
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Nhà Cung Cấp"
                name="supplierId"
                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select 
                  placeholder="Chọn nhà cung cấp"
                  showSearch
                  optionFilterProp="children"
                >
                  {suppliers.map(s => (
                    <Option key={s.id} value={s.id}>{s.code} - {s.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Kho Nhận Hàng"
                name="warehouseId"
                rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn kho">
                  {warehouses.map(w => (
                    <Option key={w.id} value={w.id}>{w.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Ngày Giao Dự Kiến"
                name="expectedDeliveryDate"
                style={{ marginBottom: '12px' }}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item 
                label="Điều Khoản Thanh Toán" 
                name="paymentTerms"
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="VD: Thanh toán sau 30 ngày" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                label="Điều Khoản Giao Hàng" 
                name="deliveryTerms"
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="VD: Giao tại kho" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item 
                label="Ghi Chú" 
                name="notes"
                style={{ marginBottom: '12px' }}
              >
                <TextArea rows={2} placeholder="Nhập ghi chú cho đơn hàng" />
              </Form.Item>
            </Col>
          </Row>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Chi Tiết Đơn Hàng</h3>
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
              scroll={{ x: 1000 }}
              footer={() => (
                <div className="text-right font-bold text-lg">
                  Tổng cộng: {calculateTotal().toLocaleString('vi-VN')} ₫
                </div>
              )}
            />
          </div>
        </Form>
      </Card>

      {/* Modal thêm nhanh đơn vị cho nguyên liệu */}
      <Modal
        title={`Thêm đơn vị cho: ${currentMaterialForUnit?.name || ''}`}
        open={unitModalVisible}
        onOk={handleAddUnitToMaterial}
        onCancel={() => setUnitModalVisible(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 16 }}>
          <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
          Nguyên liệu này chưa có đơn vị. Vui lòng chọn đơn vị cơ sở cho nguyên liệu.
        </div>
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn đơn vị"
          value={selectedUnitId || undefined}
          onChange={setSelectedUnitId}
          showSearch
          optionFilterProp="children"
        >
          {allUnits.map(u => (
            <Option key={u.id} value={u.id}>
              {u.code} - {u.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default PurchaseOrderForm;
