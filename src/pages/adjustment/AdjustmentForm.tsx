import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Select, Button, Card, message, DatePicker, Table, InputNumber, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { adjustmentService } from '@/services/adjustmentService';
import { warehouseService } from '@/services/warehouseService';
import { materialService } from '@/services/materialService';
import { unitService } from '@/services/unitService';
import Api from '@/services/baseHttp';
import { API_ENDPOINTS } from '@/config/api';
import type { ResultMessage } from '@/types';
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

interface Unit {
  id: string;
  name: string;
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
  const [units, setUnits] = useState<Unit[]>([]);
  const [stockQuantities, setStockQuantities] = useState<Record<string, number>>({});
  
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
      const [whData, matData, unitData] = await Promise.all([
        warehouseService.getList({ page: 1, size: 100 }),
        materialService.getList({ page: 1, size: 100 }),
        unitService.getAllUnits(),
      ]);

      setWarehouses(whData.items);
      setMaterials(matData.items);
      setUnits(unitData);
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
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialChange = async (materialId: string, key: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      setItems(prev => prev.map(item => 
        item.key === key 
          ? { ...item, materialId, unitId: material.unitId }
          : item
      ));

      // Load stock quantity for this material
      const warehouseId = form.getFieldValue('warehouseId');
      if (warehouseId) {
        await loadStockQuantity(warehouseId, materialId);
      }
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
          message.error(`Số lượng giảm của "${material?.name}" (${item.quantity}) vượt quá tồn kho (${currentStock})`);
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
        message.success('Tạo phiếu điều chỉnh thành công');
      }
      
      navigate('/adjustment');
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
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
      width: 100,
      render: (value: string) => {
        const unit = units.find(u => u.id === value);
        return unit?.name || '-';
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
        return stock !== undefined ? stock.toLocaleString('vi-VN') : '-';
      },
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      render: (value: number, record: ItemRow) => (
        <InputNumber
          min={0}
          value={value}
          onChange={(val) => handleItemChange(record.key, 'quantity', val || 0)}
          style={{ width: '100%' }}
        />
      ),
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
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label="Kho"
              name="warehouseId"
              rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
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

            <Form.Item
              label="Loại Điều Chỉnh"
              name="adjustmentType"
              rules={[{ required: true, message: 'Vui lòng chọn loại điều chỉnh' }]}
            >
              <Select placeholder="Chọn loại">
                <Option value={enums.adjustmentType.INCREASE.value}>
                  {enums.adjustmentType.INCREASE.text}
                </Option>
                <Option value={enums.adjustmentType.DECREASE.value}>
                  {enums.adjustmentType.DECREASE.text}
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Ngày Điều Chỉnh"
              name="transactionDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
            </Form.Item>

            <Form.Item label="Số Tham Chiếu" name="referenceNumber">
              <Input placeholder="Nhập số tham chiếu" />
            </Form.Item>
          </div>

          <Form.Item
            label="Lý Do Điều Chỉnh"
            name="reason"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <TextArea rows={2} placeholder="Nhập lý do điều chỉnh (bắt buộc)" />
          </Form.Item>

          <Form.Item label="Ghi Chú" name="notes">
            <TextArea rows={2} placeholder="Nhập ghi chú" />
          </Form.Item>

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
    </div>
  );
};

export default AdjustmentForm;
