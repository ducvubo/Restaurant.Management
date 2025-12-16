import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Modal, Tooltip, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { Branch, BranchListRequest } from '@/types';
import { branchService } from '@/services/branchService';
import enumData from '@/enums/enums';

const { Search } = Input;

const BranchManagement = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    loadBranches();
  }, [currentPage, pageSize, statusFilter]);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const request: BranchListRequest = {
        keyword: keyword || undefined,
        status: statusFilter,
        page: currentPage,
        size: pageSize,
      };
      const data = await branchService.getBranchList(request);
      setBranches(data.items);
      setTotal(data.total);
    } catch (err) {
      // Error đã được xử lý bởi baseHttp interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrentPage(1); // Reset to first page when searching
    // Trigger load with new keyword
    const request: BranchListRequest = {
      keyword: value || undefined,
      status: statusFilter,
      page: 1,
      size: pageSize,
    };
    setLoading(true);
    branchService.getBranchList(request).then(data => {
      setBranches(data.items);
      setTotal(data.total);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleStatusFilterChange = (value: number | undefined) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCreate = () => {
    navigate('/branches/add');
  };

  const handleEdit = (branch: Branch) => {
    navigate(`/branches/update?id=${branch.id}`);
  };

  const handleDeactivate = (branch: Branch) => {
    Modal.confirm({
      title: 'Vô Hiệu Hóa Chi Nhánh',
      content: `Bạn có chắc chắn muốn vô hiệu hóa chi nhánh "${branch.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await branchService.deactivateBranch(branch.id);
          loadBranches();
        } catch (err) {
          // Error đã được xử lý bởi baseHttp interceptor
        }
      },
    });
  };

  const handleActivate = (branch: Branch) => {
    Modal.confirm({
      title: 'Kích Hoạt Chi Nhánh',
      content: `Bạn có chắc chắn muốn kích hoạt lại chi nhánh "${branch.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await branchService.activateBranch(branch.id);
          loadBranches();
        } catch (err) {
          // Error đã được xử lý bởi baseHttp interceptor
        }
      },
    });
  };

  const columns: ColumnsType<Branch> = [
    {
      title: 'Mã Chi Nhánh',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Tên Chi Nhánh',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: 'Địa Chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Giờ Mở Cửa',
      dataIndex: 'openingTime',
      key: 'openingTime',
      width: 100,
    },
    {
      title: 'Giờ Đóng Cửa',
      dataIndex: 'closingTime',
      key: 'closingTime',
      width: 100,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: number) => {
        const statusItem = enumData.dataStatus.get(status);
        return (
          <Tag color={status === 1 ? 'green' : 'red'}>
            {statusItem?.text || 'Không xác định'}
          </Tag>
        );
      },
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh Sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.status === 1 ? (
            <Tooltip title="Vô Hiệu Hóa">
              <Button
                type="primary"
                danger
                icon={<StopOutlined />}
                size="small"
                onClick={() => handleDeactivate(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Kích Hoạt">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => handleActivate(record)}
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
          <h1 className="text-xl font-bold m-0">Quản Lý Chi Nhánh</h1>
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
              Tạo Chi Nhánh
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadBranches}
              loading={loading}
            >
              Làm Mới
            </Button>
          </Space>
        </div>

        {/* Advanced Search - Collapsible */}
        {showAdvancedSearch && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex gap-4 flex-wrap">
              <Search
                placeholder="Tìm kiếm theo mã, tên, email, số điện thoại, địa chỉ..."
                allowClear
                enterButton={<SearchOutlined />}
                size="middle"
                onSearch={handleSearch}
                style={{ width: 400 }}
              />
              <Select
                placeholder="Lọc theo trạng thái"
                allowClear
                style={{ width: 200 }}
                value={statusFilter}
                onChange={handleStatusFilterChange}
                options={[
                  { label: 'Tất cả', value: undefined },
                  { label: 'Hoạt động', value: 1 },
                  { label: 'Không hoạt động', value: 0 },
                ]}
              />
            </div>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={branches}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} chi nhánh`,
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

export default BranchManagement;

