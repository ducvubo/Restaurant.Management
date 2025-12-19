import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Space, Tag, message, DatePicker, Select, Tooltip } from 'antd';
import { PlusOutlined, EyeOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import inventoryCountService, { type InventoryCount } from '@/services/inventoryCountService';
import { warehouseService } from '@/services/warehouseService';

const { RangePicker } = DatePicker;

const InventoryCountManagement = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<InventoryCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    warehouseId: undefined as string | undefined,
    countStatus: undefined as number | undefined,
    dateRange: null as any,
  });

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadWarehouses = async () => {
    try {
      const result = await warehouseService.getList({ page: 1, size: 100, status: 1 });
      setWarehouses(result.items || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await inventoryCountService.list({
        page: pagination.current,
        size: pagination.pageSize,
        warehouseId: filters.warehouseId,
        countStatus: filters.countStatus,
        fromDate: filters.dateRange?.[0]?.toISOString(),
        toDate: filters.dateRange?.[1]?.toISOString(),
      });
      
      const result = response.data;
      if (result.success && result.result) {
        setData(result.result.items || []);
        setPagination(prev => ({ ...prev, total: result.result?.total || 0 }));
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const response = await inventoryCountService.complete(id);
      const result = response.data;
      if (result.success) {
        loadData();
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi hoàn thành kiểm kê');
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1: return <Tag color="default">Nháp</Tag>;
      case 2: return <Tag color="processing">Đang kiểm kê</Tag>;
      case 3: return <Tag color="success">Hoàn thành</Tag>;
      case 4: return <Tag color="error">Đã hủy</Tag>;
      default: return <Tag>Không xác định</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã Phiếu',
      dataIndex: 'countCode',
      key: 'countCode',
      width: 140,
    },
    {
      title: 'Kho',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Ngày Kiểm Kê',
      dataIndex: 'countDate',
      key: 'countDate',
      width: 130,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'countStatus',
      key: 'countStatus',
      width: 110,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: 'Phiếu Điều Chỉnh',
      dataIndex: 'adjustmentTransactionCode',
      key: 'adjustmentTransactionCode',
      width: 140,
      render: (code: string, record: InventoryCount) => 
        code ? (
          <Button 
            type="link" 
            size="small"
            onClick={() => navigate(`/adjustment/${record.adjustmentTransactionId}`)}
          >
            {code}
          </Button>
        ) : '-',
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      width: 120,
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right' as const,
      width: 50,
      render: (_: any, record: InventoryCount) => (
        <Space>
          <Tooltip title="Xem">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/inventory-count/${record.id}`)}
            />
          </Tooltip>
          {record.countStatus !== 3 && record.countStatus !== 4 && (
            <>
              <Tooltip title="Sửa">
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/inventory-count/edit/${record.id}`)}
                />
              </Tooltip>
              <Tooltip title="Hoàn thành">
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleComplete(record.id)}
              />
            </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card styles={{ body: { padding: '16px' } }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold m-0">Quản Lý Kiểm Kê Kho</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/inventory-count/add')}
          >
            Tạo Phiếu Kiểm Kê
          </Button>
        </div>

        <div className="mb-4 flex gap-2">
          <Select
            placeholder="Chọn kho"
            style={{ width: 200 }}
            allowClear
            value={filters.warehouseId}
            onChange={(value) => setFilters(prev => ({ ...prev, warehouseId: value }))}
          >
            {warehouses.map(w => (
              <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            allowClear
            value={filters.countStatus}
            onChange={(value) => setFilters(prev => ({ ...prev, countStatus: value }))}
          >
            <Select.Option value={1}>Nháp</Select.Option>
            <Select.Option value={2}>Đang kiểm kê</Select.Option>
            <Select.Option value={3}>Hoàn thành</Select.Option>
            <Select.Option value={4}>Đã hủy</Select.Option>
          </Select>

          <RangePicker
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            value={filters.dateRange}
            onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
          />
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phiếu`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
            },
          }}
        />
      </Card>
    </div>
  );
};

export default InventoryCountManagement;
