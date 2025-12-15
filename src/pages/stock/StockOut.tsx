import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Select, Space, InputNumber, message, DatePicker, Row, Col } from 'antd';
import type { Branch, Material, StockOutRequest, Unit, Warehouse } from '@/types';
import { warehouseService } from '@/services/warehouseService';
import { materialService } from '@/services/materialService';
import { unitService } from '@/services/unitService';
import { branchService } from '@/services/branchService';
import { inventoryLedgerService } from '@/services/inventoryLedgerService';
import { stockTransactionService } from '@/services/stockTransactionService';
import dayjs from 'dayjs';
const { Option } = Select;
const { TextArea } = Input;

const StockOut = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentStock, setCurrentStock] = useState<number | null>(null);

  useEffect(() => {
    loadMetaData();
  }, []);

  const loadMetaData = async () => {
    try {
      const [whData, matData, unitData, branchData] = await Promise.all([
        warehouseService.getList({ page: 1, size: 100 }),
        materialService.getList({ page: 1, size: 100 }),
        unitService.getAllUnits(),
        branchService.getAllActiveBranches(),
      ]);

      setWarehouses(whData.items);
      setMaterials(matData.items);
      setUnits(unitData);
      setBranches(branchData);
    } catch (e) {
      console.error(e);
    }
  };

  const checkStockAndUnit = async (warehouseId: string, materialId: string) => {
    if (warehouseId && materialId) {
      try {
        const stock = await inventoryLedgerService.getCurrentStock(warehouseId, materialId);
        setCurrentStock(stock);
      } catch (e) {
        console.error(e);
      }
      const material = materials.find(m => m.id === materialId);
      if (material) {
        form.setFieldsValue({ unitId: material.unitId });
      }
    }
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.warehouseId || changedValues.materialId) {
      if (allValues.warehouseId && allValues.materialId) {
        checkStockAndUnit(allValues.warehouseId, allValues.materialId);
      }
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const request: StockOutRequest = {
        warehouseId: values.warehouseId,
        materialId: values.materialId,
        quantity: values.quantity,
        unitId: values.unitId,
        transactionDate: values.transactionDate.toISOString(),
        referenceNumber: values.referenceNumber,
        destinationBranchId: values.destinationBranchId,
        notes: values.notes,
      };

      const result = await stockTransactionService.stockOut(request);
      if (result.success) {
        message.success('Xuất kho thành công');
        navigate('/stock-transactions');
      } else {
        message.error(result.message || 'Xuất kho thất bại');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold m-0">Xuất Kho</h1>
          <Space>
            <Button onClick={() => navigate('/stock-transactions')}>
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
          onValuesChange={handleValuesChange}
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
                <Select placeholder="Chọn kho" showSearch filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>
                  {warehouses.map(w => (
                    <Option key={w.id} value={w.id}>{w.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="materialId"
                label="Nguyên Liệu"
                rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu' }]}
                help={currentStock !== null ? `Tồn kho hiện tại: ${currentStock}` : null}
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn nguyên liệu" showSearch filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>
                  {materials.map(m => (
                    <Option key={m.id} value={m.id}>{m.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="unitId"
                label="Đơn Vị Tính"
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn đơn vị" disabled>
                  {units.map(u => (
                    <Option key={u.id} value={u.id}>{u.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="quantity"
                label="Số Lượng Xuất"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                style={{ marginBottom: '12px' }}
              >
                <InputNumber style={{ width: '100%' }} min={0.001} placeholder="Nhập số lượng" />
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
                name="destinationBranchId"
                label="Chi Nhánh Nhận (Nếu chuyển kho)"
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn chi nhánh nhận (Tùy chọn)" allowClear>
                  {branches.map(b => (
                    <Option key={b.id} value={b.id}>{b.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="referenceNumber"
                label="Số Phiếu / Chứng Từ"
                rules={[{ required: true, message: 'Vui lòng nhập số chứng từ' }]}
                style={{ marginBottom: '12px' }}
              >
                <Input placeholder="Nhập số phiếu/chứng từ" />
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
      </Card>
    </div>
  );
};

export default StockOut;

