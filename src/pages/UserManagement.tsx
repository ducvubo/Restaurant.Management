import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { userService } from '../services/userService';
import type { User } from '../types';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    message.info(`Chỉnh sửa người dùng: ${user.username}`);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (user: User) => {
    try {
      await userService.deleteUser(user.id);
      message.success('Xóa người dùng thành công');
      loadUsers();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Không thể xóa người dùng');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Tên Đăng Nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Họ Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => text || '-',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text || '-',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt Động' : 'Không Hoạt Động'}
        </Tag>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold m-0">Quản Lý Người Dùng</h1>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={loadUsers}
            loading={loading}
          >
            Làm Mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} người dùng`,
          }}
        />
      </Card>
    </div>
  );
};

export default UserManagement;
