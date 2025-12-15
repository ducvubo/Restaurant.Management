import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Tooltip,  Select, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, FilterOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { stockTransactionService } from '../services/stockTransactionService';
import { warehouseService } from '../services/warehouseService';
import { materialService } from '../services/materialService';
import type { StockTransaction, StockTransactionListRequest, Warehouse, Material } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const StockTransactionManagement = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined);
  const [materialId, setMaterialId] = useState<string | undefined>(undefined);
  const [transactionType, setTransactionType] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<any>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    loadMetaData();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [currentPage, pageSize, warehouseId, materialId, transactionType, dateRange]);

  const loadMetaData = async () => {
      try {
          const [whData, matData] = await Promise.all([
              warehouseService.getList({ page: 1, size: 100 }), // Load top 100 for filter
              materialService.getList({ page: 1, size: 100 })
          ]);
          setWarehouses(whData.items);
          setMaterials(matData.items);
      } catch (e) {
          console.error(e);
      }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const request: StockTransactionListRequest = {
        warehouseId,
        materialId,
        transactionType,
        startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
        endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
        page: currentPage,
        size: pageSize,
      };
      const data = await stockTransactionService.getList(request);
      setTransactions(data.items);
      setTotal(data.total);
    } catch (err) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleStockIn = () => {
    navigate('/stock-transactions/in');
  };

  const handleStockOut = () => {
    navigate('/stock-transactions/out');
  };

  const columns: ColumnsType<StockTransaction> = [
    {
      title: 'Mã GD',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      width: 120,
    },
    {
      title: 'Ngày GD',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 150,
      render: (val) => val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: 'Loại',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 100,
      render: (type: number) => {
        if (type === 1) {
          return <Tag color="green" icon={<ArrowDownOutlined />}>Nhập Kho</Tag>;
        } else {
          return <Tag color="orange" icon={<ArrowUpOutlined />}>Xuất Kho</Tag>;
        }
      },
    },
    {
        title: 'Kho',
        dataIndex: 'warehouseName',
        key: 'warehouseName',
        width: 150,
        render: (text) => text || '-',
    },
    {
        title: 'Nguyên Liệu',
        dataIndex: 'materialName',
        key: 'materialName',
        width: 150,
        render: (text) => text || '-',
    },
    {
        title: 'Số Lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 100,
        render: (val) => val ? val.toLocaleString() : '0',
    },
    {
        title: 'Đơn Vị',
        dataIndex: 'unitName',
        key: 'unitName',
        width: 80,
    },
    {
        title: 'Đơn Giá',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        width: 120,
        render: (val) => val ? val.toLocaleString() : '0',
    },
    {
        title: 'Thành Tiền',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        width: 120,
        render: (val) => val ? val.toLocaleString() : '0',
    },
    {
        title: 'Tham Chiếu',
        dataIndex: 'referenceNumber',
        key: 'referenceNumber',
        width: 120,
    }
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold m-0">Quản Lý Nhập/Xuất Kho</h1>
          <Space>
            <Tooltip title={showAdvancedSearch ? "Ẩn bộ lọc" : "Hiện bộ lọc"}>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                type={showAdvancedSearch ? "primary" : "default"}
              >
                Bộ Lọc
              </Button>
            </Tooltip>
            <Button
              type="primary"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              icon={<ArrowDownOutlined />}
              onClick={handleStockIn}
            >
              Nhập Kho
            </Button>
            <Button
              type="primary"
              style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
              icon={<ArrowUpOutlined />}
              onClick={handleStockOut}
            >
              Xuất Kho
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadTransactions}
              loading={loading}
            >
              Làm Mới
            </Button>
          </Space>
        </div>

        {/* Filter */}
        {showAdvancedSearch && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex gap-4 flex-wrap">
              <Select
                placeholder="Chọn Kho"
                allowClear
                style={{ width: 200 }}
                value={warehouseId}
                onChange={setWarehouseId}
                showSearch
                filterOption={(input, option) =>
                    (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
              >
                  {warehouses.map(w => (
                      <Option key={w.id} value={w.id}>{w.name}</Option>
                  ))}
              </Select>
              <Select
                placeholder="Chọn Nguyên Liệu"
                allowClear
                style={{ width: 200 }}
                value={materialId}
                onChange={setMaterialId}
                showSearch
                filterOption={(input, option) =>
                    (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                }
              >
                  {materials.map(m => (
                      <Option key={m.id} value={m.id}>{m.name}</Option>
                  ))}
              </Select>
              <Select
                placeholder="Loại Giao Dịch"
                allowClear
                style={{ width: 150 }}
                value={transactionType}
                onChange={setTransactionType}
              >
                  <Option value={1}>Nhập Kho</Option>
                  <Option value={2}>Xuất Kho</Option>
              </Select>
              <RangePicker
                 value={dateRange}
                 onChange={setDateRange}
                 style={{ width: 250 }}
                 placeholder={['Từ ngày', 'Đến ngày']}
              />
            </div>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} giao dịch`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>
    </div>
  );
};

export default StockTransactionManagement;
