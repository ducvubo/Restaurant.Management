import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Form, Input, Select, Button, DatePicker, Table, InputNumber, Space, Row, Col, Tag, Tooltip, Modal, message, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { purchaseRequisitionService } from '@/services/PurchaseRequisitionService';
import { warehouseService } from '@/services/warehouseService';
import { materialService } from '@/services/materialService';
import { unitService } from '@/services/unitService';
import unitConversionService, { type MaterialUnit } from '@/services/unitConversionService';
import type { PurchaseRequisition, PurchaseRequisitionRequest } from '@/types/purchasing';
import type { Unit } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

export interface GeneralTabHandle {
  submitForm: () => Promise<void>;
}

interface Props {
  isEditMode: boolean;
  requisition: PurchaseRequisition | null;
  onSaveSuccess: (requisition: PurchaseRequisition) => void;
}

interface Warehouse { id: string; name: string; }
interface Material { id: string; code: string; name: string; unitId: string; }
interface ItemRow { key: string; materialId: string; materialName?: string; quantity: number; unitId: string; estimatedPrice: number; notes: string; }

const PurchaseRequisitionGeneralTab = forwardRef<GeneralTabHandle, Props>(({ isEditMode, requisition, onSaveSuccess }, ref) => {
  const [form] = Form.useForm();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialUnits, setMaterialUnits] = useState<Record<string, MaterialUnit[]>>({});
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [currentMaterialForUnit, setCurrentMaterialForUnit] = useState<{ id: string; name: string } | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [items, setItems] = useState<ItemRow[]>([
    { key: '1', materialId: '', materialName: '', quantity: 1, unitId: '', estimatedPrice: 0, notes: '' }
  ]);

  // Expose submitForm method to parent via ref
  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      await form.validateFields();
      await onFinish(form.getFieldsValue());
    }
  }));

  useEffect(() => {
    loadMetaData();
  }, []);

  useEffect(() => {
    if (isEditMode && requisition) {
      populateForm();
    }
  }, [requisition, isEditMode]);

  const loadMetaData = async () => {
    try {
      setLoadingMetadata(true);
      const [whData, matData, unitData] = await Promise.all([
        warehouseService.getList({ page: 1, size: 100, status: 1 }),
        materialService.getList({ page: 1, size: 500, status: 1 }),
        unitService.getAllUnits(),
      ]);
      setWarehouses(whData.items);
      setMaterials(matData.items);
      setAllUnits(unitData);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoadingMetadata(false);
    }
  };

  const populateForm = useCallback(() => {
    if (!requisition) return;
    form.setFieldsValue({
      warehouseId: requisition.warehouseId,
      requiredDate: requisition.requiredDate ? dayjs(requisition.requiredDate) : null,
      priority: requisition.priority,
      notes: requisition.notes,
    });
    if (requisition.items && requisition.items.length > 0) {
      const loadedItems = requisition.items.map((item, index) => ({
        key: item.id || `${index + 1}`,
        materialId: item.materialId,
        materialName: item.materialName,
        quantity: item.quantity,
        unitId: item.unitId,
        estimatedPrice: item.estimatedPrice || 0,
        notes: item.notes || '',
      }));
      setItems(loadedItems);
      // Load units for each material
      requisition.items.forEach(item => {
        if (item.materialId) {
          loadMaterialUnits(item.materialId);
        }
      });
    }
  }, [requisition, form]);

  const loadMaterialUnits = async (materialId: string) => {
    if (materialUnits[materialId]) return;
    try {
      const units = await unitConversionService.getUnitsForMaterial(materialId);
      setMaterialUnits(prev => ({ ...prev, [materialId]: units }));
    } catch (error) {
      console.error('Error loading material units:', error);
    }
  };

  const handleMaterialChange = async (materialId: string, key: string) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;
    
    await loadMaterialUnits(materialId);
    
    setItems(prev => prev.map(item => {
      if (item.key === key) {
        return { ...item, materialId, materialName: material.name, unitId: '' };
      }
      return item;
    }));
  };

  const handleItemChange = (key: string, field: keyof ItemRow, value: any) => {
    setItems(prev => prev.map(item => item.key === key ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    const newKey = `${Date.now()}`;
    setItems(prev => [...prev, { key: newKey, materialId: '', materialName: '', quantity: 1, unitId: '', estimatedPrice: 0, notes: '' }]);
  };

  const removeItem = (key: string) => {
    if (items.length <= 1) {
      message.warning('Phải có ít nhất một mặt hàng');
      return;
    }
    setItems(prev => prev.filter(item => item.key !== key));
  };

  const onFinish = async (values: any) => {
    // Validate items
    const validItems = items.filter(item => item.materialId && item.quantity > 0);
    if (validItems.length === 0) {
      message.error('Vui lòng thêm ít nhất một mặt hàng hợp lệ');
      return;
    }

    const request: PurchaseRequisitionRequest = {
      warehouseId: values.warehouseId,
      requiredDate: values.requiredDate?.toISOString(),
      priority: values.priority || 2,
      notes: values.notes,
      items: validItems.map(item => ({
        materialId: item.materialId,
        quantity: item.quantity,
        unitId: item.unitId || '',
        estimatedPrice: item.estimatedPrice || 0,
        notes: item.notes,
      })),
    };

    try {
      let result;
      if (isEditMode && requisition) {
        result = await purchaseRequisitionService.update(requisition.id, request);
      } else {
        result = await purchaseRequisitionService.create(request);
      }
      if (result.success) {
        onSaveSuccess(result.result);
      } else {
        message.error(result.message || 'Lỗi khi lưu');
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi lưu yêu cầu mua hàng');
    }
  };

  const openAddUnitModal = (materialId: string, materialName: string) => {
    setCurrentMaterialForUnit({ id: materialId, name: materialName });
    setSelectedUnitId('');
    setUnitModalVisible(true);
  };

  const handleAddUnitToMaterial = async () => {
    if (!currentMaterialForUnit || !selectedUnitId) return;
    try {
      // Không gán isBaseUnit=true vì nguyên liệu có thể đã có base unit
      await unitConversionService.addUnitToMaterial(currentMaterialForUnit.id, selectedUnitId, false);
      // Reload để cập nhật lại cache
      setMaterialUnits(prev => {
        const updated = { ...prev };
        delete updated[currentMaterialForUnit.id];
        return updated;
      });
      await loadMaterialUnits(currentMaterialForUnit.id);
      setUnitModalVisible(false);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi thêm đơn vị');
    }
  };

  const columns = [
    {
      title: 'Nguyên vật liệu',
      dataIndex: 'materialId',
      key: 'materialId',
      width: 250,
      render: (value: string, record: ItemRow) => (
        <Select
          value={value || undefined}
          placeholder="Chọn nguyên vật liệu"
          showSearch
          optionFilterProp="children"
          style={{ width: '100%' }}
          onChange={(val) => handleMaterialChange(val, record.key)}
        >
          {materials.map(m => (
            <Option key={m.id} value={m.id}>{m.name}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (value: number, record: ItemRow) => (
        <InputNumber
          value={value}
          min={0.01}
          step={0.01}
          style={{ width: '100%' }}
          onChange={(val) => handleItemChange(record.key, 'quantity', val || 0)}
        />
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unitId',
      key: 'unitId',
      width: 180,
      render: (value: string, record: ItemRow) => {
        const units = materialUnits[record.materialId] || [];
        if (record.materialId && units.length === 0) {
          return (
            <Space>
              <Tooltip title="Chưa cấu hình đơn vị cho nguyên vật liệu này">
                <Tag color="warning" icon={<WarningOutlined />}>Chưa có ĐV</Tag>
              </Tooltip>
              <Button size="small" type="link" onClick={() => openAddUnitModal(record.materialId, record.materialName || '')}>
                Thêm ĐV
              </Button>
            </Space>
          );
        }
        return (
          <Select
            value={value || undefined}
            placeholder="Chọn đơn vị"
            style={{ width: '100%' }}
            onChange={(val) => handleItemChange(record.key, 'unitId', val)}
          >
            {units.map(u => (
              <Option key={u.unitId} value={u.unitId}>
                {u.unitName} {u.isBaseUnit && <Tag color="blue" style={{ marginLeft: 4 }}>Gốc</Tag>}
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: 'Đơn giá ước tính',
      dataIndex: 'estimatedPrice',
      key: 'estimatedPrice',
      width: 150,
      render: (value: number, record: ItemRow) => (
        <InputNumber
          value={value}
          min={0}
          formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(val) => val?.replace(/\$\s?|(,*)/g, '') as any}
          style={{ width: '100%' }}
          onChange={(val) => handleItemChange(record.key, 'estimatedPrice', val || 0)}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'amount',
      width: 120,
      render: (_: any, record: ItemRow) => (
        <span>{((record.quantity || 0) * (record.estimatedPrice || 0)).toLocaleString()}</span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_: any, record: ItemRow) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(record.key)} />
      ),
    },
  ];

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.estimatedPrice || 0), 0);
  };

  return (
    <Spin spinning={loadingMetadata} tip="Đang tải dữ liệu...">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="warehouseId" label="Kho nhận hàng" rules={[{ required: true, message: 'Vui lòng chọn kho' }]}>
              <Select placeholder="Chọn kho">
                {warehouses.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="requiredDate" label="Ngày cần hàng">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="priority" label="Độ ưu tiên" initialValue={2}>
              <Select>
                <Option value={1}>Thấp</Option>
                <Option value={2}>Bình thường</Option>
                <Option value={3}>Cao</Option>
                <Option value={4}>Khẩn cấp</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label="Ghi chú">
          <TextArea rows={2} placeholder="Nhập ghi chú..." />
        </Form.Item>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>Danh sách nguyên vật liệu</h4>
          <Button type="dashed" icon={<PlusOutlined />} onClick={addItem}>Thêm dòng</Button>
        </div>

        <Table
          columns={columns}
          dataSource={items}
          pagination={false}
          size="small"
          bordered
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="right"><strong>Tổng cộng:</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={1}><strong>{calculateTotal().toLocaleString()}</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
            </Table.Summary.Row>
          )}
        />
      </Form>

      <Modal
        title={`Thêm đơn vị cho: ${currentMaterialForUnit?.name}`}
        open={unitModalVisible}
        onOk={handleAddUnitToMaterial}
        onCancel={() => setUnitModalVisible(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Select
          placeholder="Chọn đơn vị"
          style={{ width: '100%' }}
          value={selectedUnitId || undefined}
          onChange={setSelectedUnitId}
        >
          {allUnits.map(u => <Option key={u.id} value={u.id}>{u.name}</Option>)}
        </Select>
      </Modal>
    </Spin>
  );
});

export default PurchaseRequisitionGeneralTab;
