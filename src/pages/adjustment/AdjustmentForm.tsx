import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Select, Button, Card, message, DatePicker, Table, InputNumber, Space, Row, Col, Tag, Tooltip, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { adjustmentService } from '@/services/adjustmentService';
import { warehouseService } from '@/services/warehouseService';
import { materialService } from '@/services/materialService';
import { userService } from '@/services/userService';
import { unitService } from '@/services/unitService';
import unitConversionService, { type MaterialUnit } from '@/services/unitConversionService';
import Api from '@/services/baseHttp';
import { API_ENDPOINTS } from '@/config/api';
import type { ResultMessage, Unit } from '@/types';
import enums from '@/enums';

const { Option } = Select;
const { TextArea } = Input;

interface Warehouse {
  id: string;
  name: string;
}

interface Material {
  id: string;
  name: string;
  unitId: string;
}

interface ItemRow {
  key: string;
  materialId: string;
  unitId: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}

const AdjustmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stockQuantities, setStockQuantities] = useState<Record<string, number>>({});
  const [materialUnits, setMaterialUnits] = useState<Record<string, MaterialUnit[]>>({});
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [currentMaterialForUnit, setCurrentMaterialForUnit] = useState<{ id: string; name: string } | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  
  const [items, setItems] = useState<ItemRow[]>([
    { key: '1', materialId: '', unitId: '', quantity: 0, unitPrice: 0, notes: '' }
  ]);

  useEffect(() => {
    loadMetaData();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      loadAdjustmentData();
    }
  }, [id, isEditMode]);

  const loadMetaData = async () => {
    try {
      const [whData, matData, userData, unitData] = await Promise.all([
        warehouseService.getList({ page: 1, size: 100 }),
        materialService.getList({ page: 1, size: 100 }),
        userService.getAllUsers(),
        unitService.getAllUnits(),
      ]);

      setWarehouses(whData.items);
      setMaterials(matData.items);
      setUsers(userData || []);
      setAllUnits(unitData);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAdjustmentData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const adjustment = await adjustmentService.get(id);
      
      form.setFieldsValue({
        warehouseId: adjustment.warehouseId,
        adjustmentType: adjustment.adjustmentType,
        transactionDate: dayjs(adjustment.transactionDate),
        reason: adjustment.reason,
        referenceNumber: adjustment.referenceNumber,
        performedBy: adjustment.performedBy,
        notes: adjustment.notes,
      });
      
      const loadedItems: ItemRow[] = (adjustment.items || []).map((item: any, index: number) => ({
        key: String(index),
        materialId: item.materialId,
        unitId: item.unitId,
        quantity: item.quantity,
        unitPrice: 0,
        notes: item.notes,
      }));
      setItems(loadedItems);

      // Load stock quantities for all materials
      if (adjustment.warehouseId) {
        for (const item of loadedItems) {
          if (item.materialId) {
            await loadStockQuantity(adjustment.warehouseId, item.materialId);
          }
        }
      }
      
      // Load units for each material in items
      const uniqueMaterialIds = [...new Set(loadedItems.map(item => item.materialId).filter(Boolean))];
      for (const materialId of uniqueMaterialIds) {
        try {
          const units = await unitConversionService.getUnitsForMaterial(materialId);
          setMaterialUnits(prev => ({
            ...prev,
            [materialId]: units
          }));
        } catch (error) {
          console.error(`Failed to load units for material ${materialId}:`, error);
        }
      }
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialChange = async (materialId: string, key: string) => {
    const material = materials.find(m => m.id === materialId);
    
    // Load allowed units for this material
    try {
      const allowedUnits = await unitConversionService.getUnitsForMaterial(materialId);
      setMaterialUnits(prev => ({
        ...prev,
        [materialId]: allowedUnits
      }));
      
      // Set default to base unit
      const baseUnit = allowedUnits.find(u => u.isBaseUnit);
      const defaultUnitId = baseUnit?.unitId || material?.unitId || '';
      
      setItems(prev => prev.map(item => 
        item.key === key 
          ? { ...item, materialId, unitId: defaultUnitId }
          : item
      ));
    } catch (error) {
      // Fallback to material's default unit
      if (material) {
        setItems(prev => prev.map(item => 
          item.key === key 
            ? { ...item, materialId, unitId: material.unitId }
            : item
        ));
      }
    }

    // Load stock quantity for this material
    const warehouseId = form.getFieldValue('warehouseId');
    if (warehouseId) {
      await loadStockQuantity(warehouseId, materialId);
    }
  };

  const loadStockQuantity = async (warehouseId: string, materialId: string) => {
    try {
      const response = await Api.get<ResultMessage<number>>(API_ENDPOINTS.INVENTORY_CURRENT_STOCK, {
        params: { warehouseId, materialId }
      });
      setStockQuantities(prev => ({
        ...prev,
        [`${warehouseId}_${materialId}`]: response.data.result || 0
      }));
    } catch (error) {
      console.error('Error loading stock quantity:', error);
    }
  };

  const handleItemChange = (key: string, field: keyof ItemRow, value: any) => {
    setItems(prev => prev.map(item => item.key === key ? { ...item, [field]: value } : item));
  };

  const handleWarehouseChange = async (warehouseId: string) => {
    // Reload stock quantities for all selected materials
    for (const item of items) {
      if (item.materialId) {
        await loadStockQuantity(warehouseId, item.materialId);
      }
    }
  };

  const addItem = () => {
    const newKey = String(Date.now());
    setItems([...items, { key: newKey, materialId: '', unitId: '', quantity: 0, unitPrice: 0, notes: '' }]);
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

    // Validate stock quantity for decrease adjustments
    if (values.adjustmentType === enums.adjustmentType.DECREASE.value) {
      const warehouseId = values.warehouseId;
      for (const item of items) {
        const stockKey = `${warehouseId}_${item.materialId}`;
        const currentStock = stockQuantities[stockKey] || 0;
        if (item.quantity > currentStock) {
          const material = materials.find(m => m.id === item.materialId);
          message.error(
            `Số lượng giảm vượt quá tồn kho!\n` +
            `Nguyên liệu: "${material?.name}"\n` +
            `Tồn kho hiện tại: ${currentStock.toLocaleString('vi-VN')}\n` +
            `Yêu cầu giảm: ${item.quantity.toLocaleString('vi-VN')}`
          );
          return;
        }
      }
    }

    setLoading(true);
    try {
      const requestData = {
        warehouseId: values.warehouseId,
        adjustmentType: values.adjustmentType,
        transactionDate: values.transactionDate ? values.transactionDate.toISOString() : new Date().toISOString(),
        reason: values.reason,
        referenceNumber: values.referenceNumber,
        performedBy: values.performedBy,
        notes: values.notes,
        items: items.map(item => ({
          materialId: item.materialId,
          unitId: item.unitId,
          quantity: item.quantity,
          unitPrice: 0,
          notes: item.notes,
        })),
      };

      if (isEditMode && id) {
        await adjustmentService.update(id, requestData);
      } else {
        await adjustmentService.create(requestData);
      }
      
      navigate('/adjustment');
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
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
      width: 250,
      render: (value: string, record: ItemRow) => {
        return (
          <Select
            style={{ width: '100%' }}
            value={value}
            onChange={(val) => handleMaterialChange(val, record.key)}
            placeholder="Chọn nguyên liệu"
            showSearch
            optionFilterProp="children"
          >
            {materials.map(m => (
              <Option key={m.id} value={m.id}>
                {m.name}
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: 'Đơn Vị',
      dataIndex: 'unitId',
      key: 'unitId',
      width: 170,
      render: (value: string, record: ItemRow) => {
        const allowedUnits = record.materialId ? materialUnits[record.materialId] || [] : [];
        const material = materials.find(m => m.id === record.materialId);
        
        if (!record.materialId) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        
        if (allowedUnits.length === 0) {
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
            placeholder="Đơn vị"
            onChange={(val) => handleItemChange(record.key, 'unitId', val)}
            style={{ width: '100%' }}
          >
            {allowedUnits.map(u => (
              <Option key={u.unitId} value={u.unitId}>
                {u.unitSymbol} ({u.unitName})
                {u.isBaseUnit && <Tag color="blue" style={{ marginLeft: 4 }}>Cơ sở</Tag>}
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: 'Tồn Kho',
      key: 'stock',
      width: 100,
      render: (_: any, record: ItemRow) => {
        const warehouseId = form.getFieldValue('warehouseId');
        if (!warehouseId || !record.materialId) return '-';
        const stockKey = `${warehouseId}_${record.materialId}`;
        const stock = stockQuantities[stockKey];
        if (stock === undefined) return '-';
        
        // Get units for this material
        const units = record.materialId ? materialUnits[record.materialId] || [] : [];
        const baseUnit = units.find(u => u.isBaseUnit);
        const selectedUnit = units.find(u => u.unitId === record.unitId);
        
        // Convert stock to selected unit if different from base unit
        let displayStock = stock;
        let displayUnitSymbol = baseUnit?.unitSymbol || '';
        
        if (selectedUnit && selectedUnit.conversionFactor && !selectedUnit.isBaseUnit) {
          // Convert from base unit to selected unit
          displayStock = stock / selectedUnit.conversionFactor;
          displayUnitSymbol = selectedUnit.unitSymbol;
        }
        
        return (
          <span>
            {displayStock.toFixed(3).replace(/\.?0+$/, '')} {displayUnitSymbol}
          </span>
        );
      },
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      render: (value: number, record: ItemRow) => {
        const adjustmentType = form.getFieldValue('adjustmentType');
        const warehouseId = form.getFieldValue('warehouseId');
        
        // Calculate max value for decrease adjustments
        let maxValue = undefined;
        if (adjustmentType === enums.adjustmentType.DECREASE.value && warehouseId && record.materialId) {
          const stockKey = `${warehouseId}_${record.materialId}`;
          maxValue = stockQuantities[stockKey] || 0;
        }
        
        return (
          <InputNumber
            min={0}
            max={maxValue}
            value={value}
            onChange={(val) => handleItemChange(record.key, 'quantity', val || 0)}
            style={{ width: '100%' }}
            placeholder={maxValue !== undefined ? `Tối đa: ${maxValue}` : undefined}
          />
        );
      },
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (value: string, record: ItemRow) => (
        <Input
          value={value}
          onChange={(e) => handleItemChange(record.key, 'notes', e.target.value)}
          placeholder="Nhập ghi chú"
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
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

  return (
    <div>
      <Card bodyStyle={{ padding: '12px' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold m-0">
            {isEditMode ? 'Sửa Phiếu Điều Chỉnh' : 'Tạo Phiếu Điều Chỉnh'}
          </h2>
          <Space>
            <Button onClick={() => navigate('/adjustment')}>
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
            transactionDate: dayjs(),
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Kho"
                name="warehouseId"
                rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select 
                  placeholder="Chọn kho"
                  onChange={handleWarehouseChange}
                >
                  {warehouses.map(w => (
                    <Option key={w.id} value={w.id}>{w.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Loại Điều Chỉnh"
                name="adjustmentType"
                rules={[{ required: true, message: 'Vui lòng chọn loại điều chỉnh' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn loại" disabled={isEditMode}>
                  <Option value={enums.adjustmentType.INCREASE.value}>
                    {enums.adjustmentType.INCREASE.text}
                  </Option>
                  <Option value={enums.adjustmentType.DECREASE.value}>
                    {enums.adjustmentType.DECREASE.text}
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ngày Điều Chỉnh"
                name="transactionDate"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                style={{ marginBottom: '12px' }}
              >
                <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item 
                label="Số Tham Chiếu" 
                name="referenceNumber"
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập số tham chiếu" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              
              <Form.Item
                label="Người Điều Chỉnh"
                name="performedBy"
                rules={[{ required: true, message: 'Vui lòng chọn người điều chỉnh' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select
                  showSearch
                  placeholder="Chọn người điều chỉnh"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={users.map(user => ({
                    value: user.id,
                    label: user.fullName || user.username,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Lý Do Điều Chỉnh"
                name="reason"
                rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
                style={{ marginBottom: '12px' }}
              >
                <TextArea rows={2} placeholder="Nhập lý do điều chỉnh (bắt buộc)" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item 
                label="Ghi Chú" 
                name="notes"
                style={{ marginBottom: '12px' }}
              >
                <TextArea rows={2} placeholder="Nhập ghi chú" />
              </Form.Item>
            </Col>
          </Row>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Danh Sách Nguyên Liệu</h3>
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

export default AdjustmentForm;
