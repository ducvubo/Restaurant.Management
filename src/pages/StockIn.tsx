import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Select, Space, InputNumber, message, DatePicker, Row, Col } from 'antd';
import { stockTransactionService } from '../services/stockTransactionService';
import { warehouseService } from '../services/warehouseService';
import { materialService } from '../services/materialService';
import { unitService } from '../services/unitService';
import { supplierService } from '../services/supplierService';
import type { StockInRequest, Warehouse, Material, Unit, Supplier } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const StockIn = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    loadMetaData();
  }, []);

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

  const handleMaterialChange = (materialId: string) => {
      const material = materials.find(m => m.id === materialId);
      if (material) {
          form.setFieldsValue({
              unitId: material.unitId,
              unitPrice: material.unitPrice
          });
      }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const request: StockInRequest = {
        warehouseId: values.warehouseId,
        materialId: values.materialId,
        supplierId: values.supplierId,
        quantity: values.quantity,
        unitId: values.unitId,
        unitPrice: values.unitPrice,
        transactionDate: values.transactionDate.toISOString(),
        referenceNumber: values.referenceNumber,
        notes: values.notes,
      };

      const result = await stockTransactionService.stockIn(request);
      if (result.success) {
        message.success('Nhập kho thành công');
        navigate('/stock-transactions');
      } else {
        message.error(result.message || 'Nhập kho thất bại');
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
          <h1 className="text-xl font-bold m-0">Nhập Kho</h1>
          <Space>
            <Button onClick={() => navigate('/stock-transactions')}>
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
                name="materialId"
                label="Nguyên Liệu"
                rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn nguyên liệu" onChange={handleMaterialChange} showSearch filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>
                   {materials.map(m => (
                       <Option key={m.id} value={m.id}>{m.name}</Option>
                   ))}
                </Select>
              </Form.Item>
            </Col>
             <Col xs={24} sm={12}>
              <Form.Item
                name="unitId"
                label="Đơn Vị Tính"
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
                style={{ marginBottom: '12px' }}
              >
                <Select placeholder="Chọn đơn vị">
                   {units.map(u => (
                       <Option key={u.id} value={u.id}>{u.name}</Option>
                   ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
             <Col xs={24} sm={12}>
              <Form.Item
                name="quantity"
                label="Số Lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                style={{ marginBottom: '12px' }}
              >
                 <InputNumber style={{ width: '100%' }} min={0.001} placeholder="Nhập số lượng" />
              </Form.Item>
            </Col>
             <Col xs={24} sm={12}>
              <Form.Item
                name="unitPrice"
                label="Đơn Giá Nhập"
                rules={[{ required: true, message: 'Vui lòng nhập đơn giá' }]}
                style={{ marginBottom: '12px' }}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập đơn giá" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
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
      </Card>
    </div>
  );
};

export default StockIn;
