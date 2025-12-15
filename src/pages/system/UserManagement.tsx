import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Modal, Tooltip, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { User, UserListRequest } from '@/types';
import { userService } from '@/services/userService';

const { Search } = Input;

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const request: UserListRequest = {
        keyword: keyword || undefined,
        status: statusFilter,
        page: currentPage,
        size: pageSize,
      };
      const data = await userService.getUserList(request);
      setUsers(data.items);
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
    const request: UserListRequest = {
      keyword: value || undefined,
      status: statusFilter,
      page: 1,
      size: pageSize,
    };
    setLoading(true);
    userService.getUserList(request).then(data => {
      setUsers(data.items);
      setTotal(data.total);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleStatusFilterChange = (value: number | undefined) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleCreate = () => {
    navigate('/users/add');
  };

  const handleEdit = (user: User) => {
    navigate(`/users/update?id=${user.id}`);
  };

  const handleDisable = (user: User) => {
    Modal.confirm({
      title: 'Vô Hiệu Hóa Người Dùng',
      content: `Bạn có chắc chắn muốn vô hiệu hóa người dùng "${user.username}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await userService.disableUser(user.id);
          loadUsers();
        } catch (err) {
          // Error đã được xử lý bởi baseHttp interceptor
        }
      },
    });
  };

  const handleEnable = (user: User) => {
    Modal.confirm({
      title: 'Kích Hoạt Người Dùng',
      content: `Bạn có chắc chắn muốn kích hoạt lại người dùng "${user.username}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await userService.enableUser(user.id);
          loadUsers();
        } catch (err) {
          // Error đã được xử lý bởi baseHttp interceptor
        }
      },
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Tên Đăng Nhập',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Họ Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: 'Địa Chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: (text) => text || '-',
      ellipsis: true,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: number) => {
        // DataStatus: 1 = ACTIVE, 0 = INACTIVE, -1 = DELETED
        if (status === 1) {
          return <Tag color="green">Hoạt Động</Tag>;
        } else if (status === 0) {
          return <Tag color="red">Không Hoạt Động</Tag>;
        } else {
          return <Tag color="default">Đã Xóa</Tag>;
        }
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
                onClick={() => handleDisable(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Kích Hoạt">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => handleEnable(record)}
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
          <h1 className="text-xl font-bold m-0">Quản Lý Người Dùng</h1>
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
              Tạo Người Dùng
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadUsers}
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
                placeholder="Tìm kiếm theo tên đăng nhập, email, họ tên, số điện thoại, địa chỉ..."
                allowClear
                enterButton={<SearchOutlined />}
                size="middle"
                onSearch={handleSearch}
                style={{ width: 450 }}
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
                  { label: 'Đã xóa', value: -1 },
                ]}
              />
            </div>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} người dùng`,
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

export default UserManagement;

