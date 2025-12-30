import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Select, Button, Card, message, DatePicker, Table, InputNumber, Space, Row, Col, Tag, Tooltip, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { purchaseRequisitionService } from '@/services/PurchaseRequisitionService';
import { warehouseService } from '@/services/warehouseService';
import { materialService } from '@/services/materialService';
import { unitService } from '@/services/unitService';
import unitConversionService, { type MaterialUnit } from '@/services/unitConversionService';
import enumData from '@/enums/enums';
import type { PurchaseRequisitionRequest } from '@/types/purchasing';
import type { Unit } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

interface Warehouse {
  id: string;
  name: string;
}

interface Material {
  id: string;
  code: string;
  name: string;
  unitId: string;
  unitName?: string;
}

interface ItemRow {
  key: string;
  materialId: string;
  materialName?: string;
  quantity: number;
  unitId: string;
  estimatedPrice: number;
  notes: string;
}

const PurchaseRequisitionForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const isEditMode = !!id;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialUnits, setMaterialUnits] = useState<Record<string, MaterialUnit[]>>({});
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [currentMaterialForUnit, setCurrentMaterialForUnit] = useState<{ id: string; name: string } | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  
  const [items, setItems] = useState<ItemRow[]>([
    { key: '1', materialId: '', materialName: '', quantity: 1, unitId: '', estimatedPrice: 0, notes: '' }
  ]);

  useEffect(() => {
    loadMetaData();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      loadRequisitionData();
    }
  }, [id, isEditMode]);

  const loadMetaData = async () => {
    try {
      const [whData, matData, unitData] = await Promise.all([
        warehouseService.getList({ page: 1, size: 100, status: 1 }),
        materialService.getList({ page: 1, size: 500, status: 1 }),
        unitService.getAllUnits(),
      ]);
      setWarehouses(whData.items);
      setMaterials(matData.items);
      setAllUnits(unitData);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRequisitionData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const requisition = await purchaseRequisitionService.getById(id);
      
      form.setFieldsValue({
        warehouseId: requisition.warehouseId,
        requiredDate: requisition.requiredDate ? dayjs(requisition.requiredDate) : null,
        priority: requisition.priority || 2,
        notes: requisition.notes,
      });
      
      const loadedItems: ItemRow[] = (requisition.items || []).map((item: any, index: number) => ({
        key: String(index),
        materialId: item.materialId,
        materialName: item.materialName,
        quantity: item.quantity,
        unitId: item.unitId,
        estimatedPrice: item.estimatedPrice || 0,
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
                unitId: baseUnit?.unitId || '' 
              }
            : item
        ));
      } catch (e) {
        console.error('Error loading units:', e);
        setItems(prev => prev.map(item => 
          item.key === key 
            ? { ...item, materialId, materialName: material?.name, unitId: '' }
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
              unitId: baseUnit?.unitId || '' 
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
    setItems([...items, { key: newKey, materialId: '', materialName: '', quantity: 1, unitId: '', estimatedPrice: 0, notes: '' }]);
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
      const requestData: PurchaseRequisitionRequest = {
        warehouseId: values.warehouseId,
        requiredDate: values.requiredDate ? values.requiredDate.toISOString() : undefined,
        priority: values.priority,
        notes: values.notes,
        items: items.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity,
          unitId: item.unitId,
          estimatedPrice: item.estimatedPrice || undefined,
          notes: item.notes || undefined,
        })),
      };

      if (isEditMode && id) {
        requestData.id = id;
        await purchaseRequisitionService.update(id, requestData);
      } else {
        await purchaseRequisitionService.create(requestData);
      }
      
      navigate('/purchasing/requisitions');
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
          filterOption={(input, option) =>
            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {materials.map(m => (
            <Option key={m.id} value={m.id}>
              {m.name}
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
      title: 'Giá Ước Tính',
      dataIndex: 'estimatedPrice',
      key: 'estimatedPrice',
      width: 150,
      render: (value: number, record: ItemRow) => (
        <InputNumber
          min={0}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'estimatedPrice', val || 0)}
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
        const amount = (record.quantity || 0) * (record.estimatedPrice || 0);
        return amount.toLocaleString('vi-VN') + ' ₫';
      },
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      key: 'notes',
      width: 180,
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
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.estimatedPrice || 0), 0);
  };

  return (
    <div>
      <Card bodyStyle={{ padding: '12px' }}>
        <div className="flex items-center justify-between mb-3">
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/purchasing/requisitions')}
            />
            <h2 className="text-xl font-bold m-0">
              {isEditMode ? 'Sửa Yêu Cầu Mua Hàng' : 'Tạo Yêu Cầu Mua Hàng'}
            </h2>
          </Space>
          <Space>
            <Button onClick={() => navigate('/purchasing/requisitions')}>
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
          initialValues={{
            priority: 2,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Kho Yêu Cầu"
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
                label="Ngày Cần Hàng"
                name="requiredDate"
                style={{ marginBottom: '12px' }}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Độ Ưu Tiên"
                name="priority"
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn độ ưu tiên">
                  {enumData.purchasePriority?.list.map((p: any) => (
                    <Option key={p.value} value={p.value}>{p.text}</Option>
                  ))}
                </Select>
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
                <TextArea rows={2} placeholder="Nhập ghi chú cho yêu cầu mua hàng" />
              </Form.Item>
            </Col>
          </Row>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Danh Sách Nguyên Liệu Cần Mua</h3>
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
                <div className="text-right font-bold">
                  Tổng ước tính: {calculateTotal().toLocaleString('vi-VN')} ₫
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

export default PurchaseRequisitionForm;
