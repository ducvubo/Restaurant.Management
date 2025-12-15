import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Modal, Input, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { policyService } from '../services/policyService';
import type { Policy } from '../types';

const PolicyManagement = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadPolicies();
  }, [pagination.current, pagination.pageSize, searchText]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await policyService.getPolicyList({
        page: pagination.current, // Backend uses 1-based page
        size: pagination.pageSize,
        keyword: searchText || undefined,
      });
      setPolicies(response.items || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
      }));
    } catch (err) {
      // Error đã được xử lý bởi baseHttp interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/policies/add');
  };

  const handleEdit = (policy: Policy) => {
    navigate(`/policies/update?id=${policy.id}`);
  };

  const handleDelete = (policy: Policy) => {
    Modal.confirm({
      title: 'Xóa Tập Quyền',
      content: `Bạn có chắc chắn muốn xóa tập quyền "${policy.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await policyService.deletePolicy(policy.id);
          loadPolicies();
        } catch (err) {
          // Error đã được xử lý bởi baseHttp interceptor
        }
      },
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const columns: ColumnsType<Policy> = [
    {
      title: 'Tên Tập Quyền',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (text) => text || '-',
      ellipsis: true,
    },
    {
      title: 'Số Lượng Quyền',
      key: 'policiesCount',
      width: 120,
      render: (_, record) => (
        <Tag color="blue">{record.policies?.length || 0} quyền</Tag>
      ),
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
          <Tooltip title="Xóa">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold m-0">Quản Lý Tập Quyền</h1>
          <Space>
            <Input
              placeholder="Tìm kiếm tập quyền..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              allowClear
              onPressEnter={(e) => handleSearch(e.currentTarget.value)}
              onChange={(e) => {
                if (!e.target.value) {
                  handleSearch('');
                }
              }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Tạo Tập Quyền
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadPolicies}
              loading={loading}
            >
              Làm Mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={policies}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} tập quyền`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || 10,
              }));
            },
          }}
        />
      </Card>
    </div>
  );
};

export default PolicyManagement;

