import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Button, Select, Space, InputNumber, message, DatePicker, Row, Col, Table, Divider, Tag, Tooltip, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Material, StockOutItemRequest, Warehouse, Unit } from '@/types';
import type { Customer } from '@/services/customerService';
import { warehouseService } from '@/services/warehouseService';
import { materialService } from '@/services/materialService';
import { stockOutService } from '@/services/stockOutService';
import { inventoryLedgerService } from '@/services/inventoryLedgerService';
import { customerService } from '@/services/customerService';
import { userService } from '@/services/userService';
import { unitService } from '@/services/unitService';
import unitConversionService, { type MaterialUnit } from '@/services/unitConversionService';
import enumData from '@/enums/enums';

const { Option } = Select;
const { TextArea } = Input;

interface ItemRow extends StockOutItemRequest {
  key: string;
  availableStock?: number;
  unitPrice?: number;
  totalAmount?: number;
}

const StockOut = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [materialUnits, setMaterialUnits] = useState<Record<string, MaterialUnit[]>>({});
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [currentMaterialForUnit, setCurrentMaterialForUnit] = useState<{ id: string; name: string } | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  
  const [stockOutType, setStockOutType] = useState<number | undefined>(undefined);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>(undefined);
  
  const [items, setItems] = useState<ItemRow[]>([
    { key: '1', materialId: '', unitId: '', quantity: 0 }
  ]);

  useEffect(() => {
    loadMetaData();
  }, []);

  useEffect(() => {
    if (isEditMode && id && warehouses.length > 0 && materials.length > 0) {
      loadTransactionData();
    }
  }, [id, isEditMode, warehouses, materials]);

  const loadMetaData = async () => {
    try {
      const [whData, matData, custData, userData, unitData] = await Promise.all([
        warehouseService.getList({ page: 1, size: 100 }),
        materialService.getList({ page: 1, size: 100 }),
        customerService.getList(),
        userService.getAllUsers(),
        unitService.getAllUnits(),
      ]);

      setWarehouses(whData.items);
      setMaterials(matData.items);
      setCustomers(custData.items);
      setUsers(userData || []);
      setAllUnits(unitData);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTransactionData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const transaction = await stockOutService.getById(id);
      
      console.log('Loaded transaction:', transaction); // Debug log
      
      // Set stock out type state from transaction
      if (transaction.stockOutType) {
        setStockOutType(transaction.stockOutType);
      }
      
      // Set selected warehouse
      if (transaction.warehouseId) {
        setSelectedWarehouse(transaction.warehouseId);
      }
      
      // Pre-fill form AFTER setting states
      setTimeout(() => {
        form.setFieldsValue({
          warehouseId: transaction.warehouseId,
          stockOutType: transaction.stockOutType,
          destinationWarehouseId: transaction.destinationWarehouseId,
          customerId: transaction.customerId,
          disposalReason: transaction.disposalReason,
          destinationBranchId: transaction.destinationBranchId,
          transactionDate: transaction.transactionDate ? dayjs(transaction.transactionDate) : dayjs(),
          referenceNumber: transaction.referenceNumber,
          issuedBy: transaction.issuedBy,
          receivedBy: transaction.receivedBy,
          notes: transaction.notes,
        });
      }, 100);
      
      // Pre-fill items
      if (transaction.stockOutItems && transaction.stockOutItems.length > 0) {
        const loadedItems: ItemRow[] = await Promise.all(
          transaction.stockOutItems.map(async (item, index) => {
            let availableStock: number | undefined = undefined;
            
            // Load available stock for each item
            if (transaction.warehouseId && item.materialId) {
              try {
                availableStock = await inventoryLedgerService.getAvailableStock(
                  transaction.warehouseId,
                  item.materialId
                );
              } catch (error) {
                console.error('Failed to load stock for item:', error);
              }
            }
            
            return {
              key: String(index),
              materialId: item.materialId,
              unitId: item.unitId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalAmount: item.totalAmount,
              notes: item.notes,
              availableStock,
            };
          })
        );
        setItems(loadedItems);
        
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
          ? { 
              ...item, 
              materialId, 
              unitId: defaultUnitId, 
              availableStock: undefined,
              // Auto-fill unitPrice for retail sales
              ...(stockOutType === 2 && material?.unitPrice ? {
                unitPrice: material.unitPrice,
                totalAmount: (item.quantity || 0) * material.unitPrice
              } : {})
            }
          : item
      ));
    } catch (error) {
      // Fallback to material's default unit if conversion service fails
      if (material) {
        setItems(prev => prev.map(item => 
          item.key === key 
            ? { 
                ...item, 
                materialId, 
                unitId: material.unitId, 
                availableStock: undefined,
                ...(stockOutType === 2 && material.unitPrice ? {
                  unitPrice: material.unitPrice,
                  totalAmount: (item.quantity || 0) * material.unitPrice
                } : {})
              }
            : item
        ));
      }
    }
    
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

    // Check if quantity exceeds available stock
    const hasExceededStock = items.some(item => {
      if (item.availableStock !== undefined && item.quantity > item.availableStock) {
        return true;
      }
      return false;
    });
    if (hasExceededStock) {
      message.error('Số lượng xuất vượt quá tồn kho! Vui lòng kiểm tra lại.');
      return;
    }

    // Validate price for retail sales
    if (stockOutType === 2) {
      const hasInvalidPrice = items.some(item => !item.unitPrice || item.unitPrice <= 0);
      if (hasInvalidPrice) {
        message.error('Vui lòng nhập đơn giá cho tất cả các nguyên liệu khi bán lẻ');
        return;
      }
    }

    setLoading(true);
    try {
      const requestData = {
        warehouseId: form.getFieldValue('warehouseId'),
        destinationBranchId: form.getFieldValue('destinationBranchId'),
        transactionDate: form.getFieldValue('transactionDate')?.toISOString(),
        referenceNumber: form.getFieldValue('referenceNumber'),
        issuedBy: form.getFieldValue('issuedBy'),
        receivedBy: form.getFieldValue('receivedBy'),
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
          unitPrice: item.unitPrice,
          totalAmount: item.totalAmount,
          notes: item.notes,
        })),
      };

      // Use update API if in edit mode, otherwise create
      const result = isEditMode && id
        ? await stockOutService.update(id, requestData)
        : await stockOutService.create(requestData);

      if (result.success) {
        form.resetFields();
        setItems([{ key: String(Date.now()), materialId: '', unitId: '', quantity: 0 }]);
        setStockOutType(undefined);
        navigate('/stock-out');
      }
    } catch (error: any) {
      console.error('Stock out error:', error);
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
              onChange={(val) => {
                handleItemChange(record.key, 'quantity', val || 0);
                // Auto calculate totalAmount for retail sales
                if (stockOutType === 2 && record.unitPrice) {
                  handleItemChange(record.key, 'totalAmount', (val || 0) * record.unitPrice);
                }
              }}
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
      render: (stock: number | undefined, record: ItemRow) => {
        if (stock === undefined) return <span className="text-gray-400">-</span>;
        
        // Get units for this material
        const units = record.materialId ? materialUnits[record.materialId] || [] : [];
        const baseUnit = units.find(u => u.isBaseUnit);
        const selectedUnit = units.find(u => u.unitId === record.unitId);
        
        // Convert stock to selected unit if different from base unit
        let displayStock = stock;
        let displayUnitSymbol = baseUnit?.unitSymbol || '';
        
        if (selectedUnit && selectedUnit.conversionFactor && !selectedUnit.isBaseUnit) {
          // Convert from base unit to selected unit
          // Example: stock = 23.333 KG (base), selected = Gram (factor = 0.001)
          // displayStock = 23.333 / 0.001 = 23333 G
          displayStock = stock / selectedUnit.conversionFactor;
          displayUnitSymbol = selectedUnit.unitSymbol;
        }
        
        const isLow = stock > 0 && stock <= (stock * 0.1);
        
        return (
          <span className={isLow ? 'text-orange-600 font-bold' : 'text-green-600 font-bold'}>
            {displayStock.toFixed(3).replace(/\.?0+$/, '')} {displayUnitSymbol}
          </span>
        );
      },
    },
    ...(stockOutType === 2 ? [{
      title: <span className="text-red-500">* Đơn Giá</span>,
      dataIndex: 'unitPrice',
      width: 150,
      render: (value: number, record: ItemRow) => (
        <InputNumber
          value={value}
          onChange={(val) => {
            handleItemChange(record.key, 'unitPrice', val || 0);
            // Auto calculate totalAmount
            const qty = record.quantity || 0;
            const price = val || 0;
            handleItemChange(record.key, 'totalAmount', qty * price);
          }}
          min={0}
          style={{ width: '100%' }}
          placeholder="Đơn giá"
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
        />
      ),
    },
    {
      title: 'Thành Tiền',
      dataIndex: 'totalAmount',
      width: 150,
      render: (value: number) => (
        <div className="text-right font-semibold">
          {value ? value.toLocaleString('vi-VN') : '0'}
        </div>
      ),
    }] : []),
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
            <Col xs={24} sm={8}>
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
                  onChange={async (value) => {
                    setSelectedWarehouse(value);
                    // Reload stock for all items
                    const updatedItems = await Promise.all(
                      items.map(async (item) => {
                        if (item.materialId) {
                          try {
                            const stock = await inventoryLedgerService.getAvailableStock(value, item.materialId);
                            return { ...item, availableStock: stock };
                          } catch (error) {
                            console.error('Failed to load stock:', error);
                            return item;
                          }
                        }
                        return item;
                      })
                    );
                    setItems(updatedItems);
                  }}
                >
                  {warehouses.map(w => (
                    <Option key={w.id} value={w.id}>{w.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="stockOutType"
                label="Loại Xuất Kho"
                rules={[{ required: true, message: 'Vui lòng chọn loại xuất kho' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select 
                  placeholder="Chọn loại xuất kho"
                  onChange={(value) => setStockOutType(value)}
                  disabled={isEditMode}
                >
                  {enumData.stockOutType.list.map(item => (
                    <Option key={item.value} value={item.value}>{item.text}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="transactionDate"
                label="Ngày Xuất"
                rules={[{ required: true, message: 'Vui lòng chọn ngày xuất' }]}
                style={{ marginBottom: '12px' }}
              >
                <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
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
              <Col xs={24} sm={12}>
                <Form.Item
                  name="referenceNumber"
                  label="Số Chứng Từ"
                  style={{ marginBottom: '12px' }}
                >
                  <Input placeholder="Nhập số chứng từ" />
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
              <Col xs={24} sm={12}>
                <Form.Item
                  name="referenceNumber"
                  label="Số Chứng Từ"
                  style={{ marginBottom: '12px' }}
                >
                  <Input placeholder="Nhập số chứng từ" />
                </Form.Item>
              </Col>
            </Row>
          )}

          {stockOutType === 3 && (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="disposalReason"
                  label="Lý Do Tiêu Hủy"
                  rules={[{ required: true, message: 'Vui lòng nhập lý do tiêu hủy' }]}
                  style={{ marginBottom: '12px' }}
                >
                  <Input 
                    placeholder="Nhập lý do tiêu hủy (VD: Hết hạn, hư hỏng, không đạt chất lượng...)" 
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="referenceNumber"
                  label="Số Chứng Từ"
                  style={{ marginBottom: '12px' }}
                >
                  <Input placeholder="Nhập số chứng từ" />
                </Form.Item>
              </Col>
            </Row>
          )}

          {!stockOutType && (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="referenceNumber"
                  label="Số Chứng Từ"
                  style={{ marginBottom: '12px' }}
                >
                  <Input placeholder="Nhập số chứng từ" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="issuedBy"
                label="Người Xuất Kho"
                rules={[{ required: true, message: 'Vui lòng chọn người xuất kho' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select
                  showSearch
                  placeholder="Chọn người xuất kho"
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
            {stockOutType === 1 && (
              <Col xs={24} sm={12}>
                <Form.Item
                  name="receivedBy"
                  label="Người Tiếp Nhận"
                  rules={[{ required: true, message: 'Vui lòng chọn người tiếp nhận' }]}
                  style={{ marginBottom: '12px' }}
                >
                  <Select
                    showSearch
                    placeholder="Chọn người tiếp nhận"
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
            )}
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="notes"
                label="Ghi Chú"
                style={{ marginBottom: '12px' }}
              >
                <TextArea rows={2} placeholder="Nhập ghi chú" />
              </Form.Item>
            </Col>
          </Row>

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

export default StockOut;
