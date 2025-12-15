import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Card, Select, DatePicker, Statistic, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { InventoryLedger, InventoryLedgerListRequest, Material, Warehouse } from '@/types';
import { warehouseService } from '@/services/warehouseService';
import { materialService } from '@/services/materialService';
import { inventoryLedgerService } from '@/services/inventoryLedgerService';

const { Option } = Select;
const { RangePicker } = DatePicker;

const InventoryLedgerManagement = () => {
  const [ledgers, setLedgers] = useState<InventoryLedger[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined);
  const [materialId, setMaterialId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<any>(null);
  const [currentStock, setCurrentStock] = useState<number>(0);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    loadMetaData();
  }, []);

  useEffect(() => {
    if (warehouseId && materialId) {
        loadLedger();
        loadCurrentStock();
    }
  }, [currentPage, pageSize, warehouseId, materialId, dateRange]);

  const loadMetaData = async () => {
      try {
          const [whData, matData] = await Promise.all([
              warehouseService.getList({ page: 1, size: 100 }),
              materialService.getList({ page: 1, size: 100 })
          ]);
          setWarehouses(whData.items);
          setMaterials(matData.items);
          // Set defaults if available
          if (whData.items.length > 0) setWarehouseId(whData.items[0].id);
          if (matData.items.length > 0) setMaterialId(matData.items[0].id);
      } catch (e) {
          console.error(e);
      }
  };

  const loadLedger = async () => {
    if (!warehouseId || !materialId) return;

    try {
      setLoading(true);
      const request: InventoryLedgerListRequest = {
        warehouseId,
        materialId,
        startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
        endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
        page: currentPage,
        size: pageSize,
      };
      const data = await inventoryLedgerService.getLedger(request);
      setLedgers(data.items);
      setTotal(data.total);
    } catch (err) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentStock = async () => {
      if (!warehouseId || !materialId) return;
      try {
          const stock = await inventoryLedgerService.getCurrentStock(warehouseId, materialId);
          setCurrentStock(stock);
      } catch (e) {
          console.error(e);
      }
  };

  const columns: ColumnsType<InventoryLedger> = [
    {
      title: 'Ngày GD',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 150,
      render: (val) => val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: 'Mã GD',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      width: 120,
    },
    {
      title: 'Loại GD',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 120,
      render: (type: number) => {
          if (type === 1) return <Tag color="green">Nhập</Tag>;
          if (type === 2) return <Tag color="orange">Xuất</Tag>;
          return type;
      }
    },
    {
      title: 'Nhập',
      dataIndex: 'quantityIn',
      key: 'quantityIn',
      width: 100,
      render: (val) => val > 0 ? <span className="text-green-600 font-bold">+{val}</span> : '-',
    },
    {
      title: 'Xuất',
      dataIndex: 'quantityOut',
      key: 'quantityOut',
      width: 100,
      render: (val) => val > 0 ? <span className="text-orange-600 font-bold">-{val}</span> : '-',
    },
    {
      title: 'Tồn Cuối',
      dataIndex: 'balance',
      key: 'balance',
      width: 100,
      render: (val) => <strong>{val}</strong>,
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (val) => val ? val.toLocaleString() : '0',
    },
    {
      title: 'Giá Trị Tồn',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 150,
      render: (val) => val ? val.toLocaleString() : '0',
    },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold m-0">Sổ Cái Tồn Kho (Thẻ Kho)</h1>
          <Space>
             <Button
              icon={<ReloadOutlined />}
              onClick={() => { loadLedger(); loadCurrentStock(); }}
              loading={loading}
            >
              Làm Mới
            </Button>
          </Space>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
           <Row gutter={[16, 16]} align="middle">
               <Col span={6}>
                   <Select
                    placeholder="Chọn Kho"
                    style={{ width: '100%' }}
                    value={warehouseId}
                    onChange={(val) => { setWarehouseId(val); setCurrentPage(1); }}
                    showSearch
                    filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}
                  >
                      {warehouses.map(w => (
                          <Option key={w.id} value={w.id}>{w.name}</Option>
                      ))}
                  </Select>
               </Col>
               <Col span={6}>
                   <Select
                    placeholder="Chọn Nguyên Liệu"
                    style={{ width: '100%' }}
                    value={materialId}
                    onChange={(val) => { setMaterialId(val); setCurrentPage(1); }}
                     showSearch
                    filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}
                  >
                      {materials.map(m => (
                          <Option key={m.id} value={m.id}>{m.name}</Option>
                      ))}
                  </Select>
               </Col>
               <Col span={8}>
                   <RangePicker
                     value={dateRange}
                     onChange={setDateRange}
                     style={{ width: '100%' }}
                  />
               </Col>
               <Col span={4}>
                   <Card size="small">
                       <Statistic title="Tồn Hiện Tại" value={currentStock} valueStyle={{ color: '#3f8600' }} />
                   </Card>
               </Col>
           </Row>
        </div>

        <Table
          columns={columns}
          dataSource={ledgers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} dòng`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            pageSizeOptions: ['20', '50', '100'],
          }}
        />
      </Card>
    </div>
  );
};

export default InventoryLedgerManagement;

