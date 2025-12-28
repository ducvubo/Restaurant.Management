import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Modal, Tooltip, Input, Select, message, DatePicker } from 'antd';
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
  EyeOutlined
} from '@ant-design/icons';
import type { PurchaseRequisition, PurchaseListRequest } from '@/types/purchasing';
import { purchaseRequisitionService } from '@/services/PurchaseRequisitionService';
import enumData from '@/enums/enums';
import dayjs from 'dayjs';

const { Search } = Input;
const { RangePicker } = DatePicker;

const PurchaseRequisitionManagement = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    loadRequisitions();
  }, [currentPage, pageSize, statusFilter]);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const request: PurchaseListRequest = {
        keyword: keyword || undefined,
        status: statusFilter,
        page: currentPage,
        size: pageSize,
      };
      const data = await purchaseRequisitionService.getList(request);
      setRequisitions(data.items);
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
    loadRequisitions();
  };

  const handleStatusFilterChange = (value: number | undefined) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    navigate('/purchasing/requisitions/add');
  };

  const handleEdit = (record: PurchaseRequisition) => {
    navigate(`/purchasing/requisitions/update?id=${record.id}`);
  };

  const handleView = (record: PurchaseRequisition) => {
    navigate(`/purchasing/requisitions/view?id=${record.id}`);
  };

  const handleDelete = (record: PurchaseRequisition) => {
    Modal.confirm({
      title: 'Xóa Yêu Cầu Mua Hàng',
      content: `Bạn có chắc chắn muốn xóa yêu cầu "${record.requisitionCode}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          const result = await purchaseRequisitionService.delete(record.id);
          if (result.success) {
            message.success('Xóa thành công');
            loadRequisitions();
          }
        } catch (err) {
          // Error handled by interceptor
        }
      },
    });
  };

  const handleSubmit = (record: PurchaseRequisition) => {
    Modal.confirm({
      title: 'Gửi Phê Duyệt',
      content: `Bạn có chắc chắn muốn gửi yêu cầu "${record.requisitionCode}" để phê duyệt?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await purchaseRequisitionService.submit(record.id);
          if (result.success) {
            message.success('Đã gửi phê duyệt');
            loadRequisitions();
          }
        } catch (err) {
          // Error handled by interceptor
        }
      },
    });
  };

  const handleApprove = (record: PurchaseRequisition) => {
    Modal.confirm({
      title: 'Phê Duyệt',
      content: `Bạn có chắc chắn muốn phê duyệt yêu cầu "${record.requisitionCode}"?`,
      okText: 'Phê Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await purchaseRequisitionService.approve(record.id);
          if (result.success) {
            message.success('Đã phê duyệt');
            loadRequisitions();
          }
        } catch (err) {
          // Error handled by interceptor
        }
      },
    });
  };

  const handleReject = (record: PurchaseRequisition) => {
    Modal.confirm({
      title: 'Từ Chối',
      content: `Bạn có chắc chắn muốn từ chối yêu cầu "${record.requisitionCode}"?`,
      okText: 'Từ Chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const result = await purchaseRequisitionService.reject(record.id);
          if (result.success) {
            message.success('Đã từ chối');
            loadRequisitions();
          }
        } catch (err) {
          // Error handled by interceptor
        }
      },
    });
  };

  const handleCancel = (record: PurchaseRequisition) => {
    Modal.confirm({
      title: 'Hủy Yêu Cầu',
      content: `Bạn có chắc chắn muốn hủy yêu cầu "${record.requisitionCode}"?`,
      okText: 'Hủy Yêu Cầu',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          const result = await purchaseRequisitionService.cancel(record.id);
          if (result.success) {
            message.success('Đã hủy yêu cầu');
            loadRequisitions();
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
      case 2: return 'processing'; // PENDING_APPROVAL
      case 3: return 'success'; // APPROVED
      case 4: return 'error'; // REJECTED
      case 5: return 'purple'; // CONVERTED
      case -1: return 'default'; // CANCELLED
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'default'; // LOW
      case 2: return 'blue'; // NORMAL
      case 3: return 'orange'; // HIGH
      case 4: return 'red'; // URGENT
      default: return 'default';
    }
  };

  const columns: ColumnsType<PurchaseRequisition> = [
    {
      title: 'Mã Yêu Cầu',
      dataIndex: 'requisitionCode',
      key: 'requisitionCode',
      width: 140,
      fixed: 'left',
    },
    {
      title: 'Kho',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: 'Ngày Yêu Cầu',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Ngày Cần',
      dataIndex: 'requiredDate',
      key: 'requiredDate',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Độ Ưu Tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: number) => {
        const priorityItem = enumData.purchasePriority?.get(priority);
        return (
          <Tag color={getPriorityColor(priority)}>
            {priorityItem?.text || 'Không xác định'}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: number) => {
        const statusItem = enumData.purchaseRequisitionStatus?.get(status);
        return (
          <Tag color={getStatusColor(status)}>
            {statusItem?.text || 'Không xác định'}
          </Tag>
        );
      },
    },
    {
      title: 'Người Tạo',
      dataIndex: 'requestedByName',
      key: 'requestedByName',
      width: 130,
      render: (text) => text || '-',
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
          
          {/* DRAFT: Can edit, delete, submit */}
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
              <Tooltip title="Gửi Phê Duyệt">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="small"
                  style={{ background: '#52c41a' }}
                  onClick={() => handleSubmit(record)}
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

          {/* PENDING_APPROVAL: Can approve, reject */}
          {record.status === 2 && (
            <>
              <Tooltip title="Phê Duyệt">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  style={{ background: '#52c41a' }}
                  onClick={() => handleApprove(record)}
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

          {/* APPROVED, PENDING: Can cancel */}
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
          <h1 className="text-xl font-bold m-0">Quản Lý Yêu Cầu Mua Hàng</h1>
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
              Tạo Yêu Cầu
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadRequisitions}
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
                placeholder="Tìm kiếm theo mã yêu cầu..."
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
                  { label: 'Chờ phê duyệt', value: 2 },
                  { label: 'Đã phê duyệt', value: 3 },
                  { label: 'Từ chối', value: 4 },
                  { label: 'Đã chuyển thành PO', value: 5 },
                  { label: 'Đã hủy', value: -1 },
                ]}
              />
            </div>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={requisitions}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} yêu cầu`,
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

export default PurchaseRequisitionManagement;
