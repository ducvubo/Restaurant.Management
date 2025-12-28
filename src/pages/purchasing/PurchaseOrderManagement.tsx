import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Modal, Tooltip, Input, Select, message, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  ReloadOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined,
  CheckOutlined,
  StopOutlined,
  EyeOutlined,
  InboxOutlined
} from '@ant-design/icons';
import type { PurchaseOrder, PurchaseListRequest } from '@/types/purchasing';
import { purchaseOrderService } from '@/services/PurchaseOrderService';
import enumData from '@/enums/enums';
import dayjs from 'dayjs';

const { Search } = Input;

const PurchaseOrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [currentPage, pageSize, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const request: PurchaseListRequest = {
        keyword: keyword || undefined,
        status: statusFilter,
        page: currentPage,
        size: pageSize,
      };
      const data = await purchaseOrderService.getList(request);
      setOrders(data.items);
      setTotal(data.total);
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
    loadOrders();
  };

  const handleStatusFilterChange = (value: number | undefined) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    navigate('/purchasing/orders/add');
  };

  const handleEdit = (record: PurchaseOrder) => {
    navigate(`/purchasing/orders/update?id=${record.id}`);
  };

  const handleView = (record: PurchaseOrder) => {
    navigate(`/purchasing/orders/view?id=${record.id}`);
  };

  const handleReceiveGoods = (record: PurchaseOrder) => {
    navigate(`/purchasing/orders/receive?id=${record.id}`);
  };

  const handleDelete = (record: PurchaseOrder) => {
    Modal.confirm({
      title: 'Xóa Đơn Hàng',
      content: `Bạn có chắc chắn muốn xóa đơn hàng "${record.poCode}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          const result = await purchaseOrderService.delete(record.id);
          if (result.success) {
            message.success('Xóa thành công');
            loadOrders();
          }
        } catch (err) {
          // Error handled by interceptor
        }
      },
    });
  };

  const handleConfirm = (record: PurchaseOrder) => {
    Modal.confirm({
      title: 'Xác Nhận Đơn Hàng',
      content: `Bạn có chắc chắn muốn xác nhận đơn hàng "${record.poCode}" với nhà cung cấp?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await purchaseOrderService.confirm(record.id);
          if (result.success) {
            message.success('Đã xác nhận đơn hàng');
            loadOrders();
          }
        } catch (err) {
          // Error handled by interceptor
        }
      },
    });
  };

  const handleCancel = (record: PurchaseOrder) => {
    Modal.confirm({
      title: 'Hủy Đơn Hàng',
      content: `Bạn có chắc chắn muốn hủy đơn hàng "${record.poCode}"?`,
      okText: 'Hủy Đơn',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          const result = await purchaseOrderService.cancel(record.id);
          if (result.success) {
            message.success('Đã hủy đơn hàng');
            loadOrders();
          }
        } catch (err) {
          // Error handled by interceptor
        }
      },
    });
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'default'; // DRAFT
      case 2: return 'processing'; // CONFIRMED
      case 3: return 'warning'; // PARTIALLY_RECEIVED
      case 4: return 'success'; // COMPLETED
      case -1: return 'default'; // CANCELLED
      default: return 'default';
    }
  };

  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: 'Mã Đơn Hàng',
      dataIndex: 'poCode',
      key: 'poCode',
      width: 140,
      fixed: 'left',
    },
    {
      title: 'Nhà Cung Cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 180,
      render: (text) => text || '-',
    },
    {
      title: 'Kho',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: 'Ngày Đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 110,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      align: 'right',
      render: (amount) => amount?.toLocaleString('vi-VN') + ' ₫' || '-',
    },
    {
      title: 'Tiến Độ',
      key: 'progress',
      width: 120,
      render: (_, record) => {
        const progress = record.receivingProgress || 0;
        return (
          <Progress 
            percent={progress} 
            size="small" 
            status={progress >= 100 ? 'success' : 'active'}
          />
        );
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: number) => {
        const statusItem = enumData.purchaseOrderStatus?.get(status);
        return (
          <Tag color={getStatusColor(status)}>
            {statusItem?.text || 'Không xác định'}
          </Tag>
        );
      },
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem Chi Tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record)}
            />
          </Tooltip>
          
          {/* DRAFT: Can edit, delete, confirm */}
          {record.status === 1 && (
            <>
              <Tooltip title="Chỉnh Sửa">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip title="Xác Nhận Đơn">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  style={{ background: '#52c41a' }}
                  onClick={() => handleConfirm(record)}
                />
              </Tooltip>
              <Tooltip title="Xóa">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => handleDelete(record)}
                />
              </Tooltip>
            </>
          )}

          {/* CONFIRMED or PARTIALLY_RECEIVED: Can receive goods, cancel */}
          {(record.status === 2 || record.status === 3) && (
            <>
              <Tooltip title="Nhận Hàng">
                <Button
                  type="primary"
                  icon={<InboxOutlined />}
                  size="small"
                  onClick={() => handleReceiveGoods(record)}
                />
              </Tooltip>
              <Tooltip title="Hủy Đơn">
                <Button
                  icon={<StopOutlined />}
                  size="small"
                  onClick={() => handleCancel(record)}
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
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold m-0">Quản Lý Đơn Đặt Hàng</h1>
          <Space>
            <Tooltip title={showAdvancedSearch ? "Ẩn tìm kiếm nâng cao" : "Hiện tìm kiếm nâng cao"}>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                type={showAdvancedSearch ? "primary" : "default"}
              >
                Tìm Kiếm Nâng Cao
              </Button>
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Tạo Đơn Hàng
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadOrders}
              loading={loading}
            >
              Làm Mới
            </Button>
          </Space>
        </div>

        {/* Advanced Search */}
        {showAdvancedSearch && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex gap-4 flex-wrap">
              <Search
                placeholder="Tìm kiếm theo mã đơn hàng..."
                allowClear
                enterButton={<SearchOutlined />}
                size="middle"
                onSearch={handleSearch}
                style={{ width: 300 }}
              />
              <Select
                placeholder="Lọc theo trạng thái"
                allowClear
                style={{ width: 200 }}
                value={statusFilter}
                onChange={handleStatusFilterChange}
                options={[
                  { label: 'Tất cả', value: undefined },
                  { label: 'Nháp', value: 1 },
                  { label: 'Đã xác nhận', value: 2 },
                  { label: 'Nhận một phần', value: 3 },
                  { label: 'Hoàn thành', value: 4 },
                  { label: 'Đã hủy', value: -1 },
                ]}
              />
            </div>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} đơn hàng`,
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

export default PurchaseOrderManagement;
