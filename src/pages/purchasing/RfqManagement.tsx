import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Modal, Tooltip, Input, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  ReloadOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  StopOutlined,
  EyeOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import type { Rfq, PurchaseListRequest } from '@/types/purchasing';
import { rfqService } from '@/services/RfqService';
import { purchaseOrderService } from '@/services/PurchaseOrderService';
import enumData from '@/enums/enums';
import dayjs from 'dayjs';

const { Search } = Input;

const RfqManagement = () => {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    loadRfqs();
  }, [currentPage, pageSize, statusFilter]);

  const loadRfqs = async () => {
    try {
      setLoading(true);
      const request: PurchaseListRequest = {
        keyword: keyword || undefined,
        status: statusFilter,
        page: currentPage,
        size: pageSize,
      };
      const data = await rfqService.getList(request);
      setRfqs(data.items);
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
    loadRfqs();
  };

  const handleStatusFilterChange = (value: number | undefined) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    navigate('/purchasing/rfqs/add');
  };

  const handleEdit = (record: Rfq) => {
    navigate(`/purchasing/rfqs/update?id=${record.id}`);
  };

  const handleView = (record: Rfq) => {
    navigate(`/purchasing/rfqs/view?id=${record.id}`);
  };

  const handleDelete = (record: Rfq) => {
    Modal.confirm({
      title: 'Xóa Yêu Cầu Báo Giá',
      content: `Bạn có chắc chắn muốn xóa RFQ "${record.rfqCode}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          const result = await rfqService.delete(record.id);
          if (result.success) {
            message.success('Xóa thành công');
            loadRfqs();
          }
        } catch (err) {
          // Error handled by interceptor
        }
      },
    });
  };

  const handleSend = (record: Rfq) => {
    Modal.confirm({
      title: 'Gửi Đến Nhà Cung Cấp',
      content: `Bạn có chắc chắn muốn gửi RFQ "${record.rfqCode}" đến nhà cung cấp?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await rfqService.send(record.id);
          if (result.success) {
            message.success('Đã gửi RFQ');
            loadRfqs();
          }
        } catch (err) {
          // Error handled by interceptor
        }
      },
    });
  };

  const handleAccept = (record: Rfq) => {
    Modal.confirm({
      title: 'Chấp Nhận Báo Giá',
      content: `Bạn có chắc chắn muốn chấp nhận báo giá từ RFQ "${record.rfqCode}"?`,
      okText: 'Chấp Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await rfqService.accept(record.id);
          if (result.success) {
            message.success('Đã chấp nhận báo giá');
            loadRfqs();
          }
        } catch (err) {
          // Error handled by interceptor
        }
      },
    });
  };

  const handleReject = (record: Rfq) => {
    Modal.confirm({
      title: 'Từ Chối Báo Giá',
      content: `Bạn có chắc chắn muốn từ chối báo giá từ RFQ "${record.rfqCode}"?`,
      okText: 'Từ Chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await rfqService.reject(record.id);
          if (result.success) {
            message.success('Đã từ chối báo giá');
            loadRfqs();
          }
        } catch (err) {
          // Error handled by interceptor
        }
      },
    });
  };

  const handleCancel = (record: Rfq) => {
    Modal.confirm({
      title: 'Hủy RFQ',
      content: `Bạn có chắc chắn muốn hủy RFQ "${record.rfqCode}"?`,
      okText: 'Hủy RFQ',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          const result = await rfqService.cancel(record.id);
          if (result.success) {
            message.success('Đã hủy RFQ');
            loadRfqs();
          }
        } catch (err) {
          // Error handled by interceptor
        }
      },
    });
  };

  const handleCreatePO = (record: Rfq) => {
    Modal.confirm({
      title: 'Tạo Đơn Đặt Hàng',
      content: `Bạn có chắc chắn muốn tạo đơn đặt hàng từ RFQ "${record.rfqCode}"?`,
      okText: 'Tạo PO',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await purchaseOrderService.createFromRfq(record.id);
          if (result.success) {
            message.success('Đã tạo đơn đặt hàng');
            navigate('/purchasing/orders');
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
      case 2: return 'processing'; // SENT
      case 3: return 'purple'; // RECEIVED
      case 4: return 'success'; // ACCEPTED
      case 5: return 'error'; // REJECTED
      case 6: return 'warning'; // EXPIRED
      case -1: return 'default'; // CANCELLED
      default: return 'default';
    }
  };

  const columns: ColumnsType<Rfq> = [
    {
      title: 'Mã RFQ',
      dataIndex: 'rfqCode',
      key: 'rfqCode',
      width: 130,
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
      title: 'Ngày Gửi',
      dataIndex: 'sentDate',
      key: 'sentDate',
      width: 110,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Hiệu Lực Đến',
      dataIndex: 'validUntil',
      key: 'validUntil',
      width: 110,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      align: 'right',
      render: (amount) => amount ? amount.toLocaleString('vi-VN') + ' ₫' : '-',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: number) => {
        const statusItem = enumData.rfqStatus?.get(status);
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
      width: 220,
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
          
          {/* DRAFT: Can edit, delete, send */}
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
              <Tooltip title="Gửi NCC">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="small"
                  style={{ background: '#52c41a' }}
                  onClick={() => handleSend(record)}
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

          {/* RECEIVED: Can accept, reject */}
          {record.status === 3 && (
            <>
              <Tooltip title="Chấp Nhận">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  style={{ background: '#52c41a' }}
                  onClick={() => handleAccept(record)}
                />
              </Tooltip>
              <Tooltip title="Từ Chối">
                <Button
                  danger
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={() => handleReject(record)}
                />
              </Tooltip>
            </>
          )}

          {/* ACCEPTED: Can create PO */}
          {record.status === 4 && (
            <Tooltip title="Tạo Đơn Hàng">
              <Button
                type="primary"
                icon={<FileAddOutlined />}
                size="small"
                onClick={() => handleCreatePO(record)}
              />
            </Tooltip>
          )}

          {/* SENT, RECEIVED: Can cancel */}
          {(record.status === 2 || record.status === 3) && (
            <Tooltip title="Hủy">
              <Button
                icon={<StopOutlined />}
                size="small"
                onClick={() => handleCancel(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold m-0">Quản Lý Yêu Cầu Báo Giá (RFQ)</h1>
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
              Tạo RFQ
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadRfqs}
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
                placeholder="Tìm kiếm theo mã RFQ..."
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
                  { label: 'Đã gửi', value: 2 },
                  { label: 'Đã nhận báo giá', value: 3 },
                  { label: 'Đã chấp nhận', value: 4 },
                  { label: 'Đã từ chối', value: 5 },
                  { label: 'Hết hạn', value: 6 },
                  { label: 'Đã hủy', value: -1 },
                ]}
              />
            </div>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={rfqs}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} RFQ`,
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

export default RfqManagement;
