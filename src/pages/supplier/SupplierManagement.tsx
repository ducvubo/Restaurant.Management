import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Modal, Tooltip, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { Supplier, SupplierListRequest } from '@/types';
import { supplierService } from '@/services/supplierService';

const { Search } = Input;

const SupplierManagement = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, [currentPage, pageSize, statusFilter]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const request: SupplierListRequest = {
        keyword: keyword || undefined,
        status: statusFilter,
        page: currentPage,
        size: pageSize,
      };
      const data = await supplierService.getSupplierList(request);
      setSuppliers(data.items);
      setTotal(data.total);
    } catch (err) {
      // Error đã được xử lý bởi baseHttp interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
    const request: SupplierListRequest = {
      keyword: value || undefined,
      status: statusFilter,
      page: 1,
      size: pageSize,
    };
    setLoading(true);
    supplierService.getSupplierList(request).then(data => {
      setSuppliers(data.items);
      setTotal(data.total);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleStatusFilterChange = (value: number | undefined) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    navigate('/suppliers/add');
  };

  const handleEdit = (supplier: Supplier) => {
    navigate(`/suppliers/update?id=${supplier.id}`);
  };

  const handleDeactivate = (supplier: Supplier) => {
    Modal.confirm({
      title: 'Vô Hiệu Hóa Nhà Cung Cấp',
      content: `Bạn có chắc chắn muốn vô hiệu hóa nhà cung cấp "${supplier.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await supplierService.deactivateSupplier(supplier.id);
          loadSuppliers();
        } catch (err) {
          // Error đã được xử lý bởi baseHttp interceptor
        }
      },
    });
  };

  const handleActivate = (supplier: Supplier) => {
    Modal.confirm({
      title: 'Kích Hoạt Nhà Cung Cấp',
      content: `Bạn có chắc chắn muốn kích hoạt lại nhà cung cấp "${supplier.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await supplierService.activateSupplier(supplier.id);
          loadSuppliers();
        } catch (err) {
          // Error đã được xử lý bởi baseHttp interceptor
        }
      },
    });
  };

  const columns: ColumnsType<Supplier> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: 'Tên Nhà Cung Cấp',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: 'Người Liên Hệ',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 140,
      render: (text) => text || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
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
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: number) => {
        if (status === 1) {
          return <Tag color="green">Hoạt Động</Tag>;
        } else {
          return <Tag color="red">Không Hoạt Động</Tag>;
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
          <h1 className="text-xl font-bold m-0">Quản Lý Nhà Cung Cấp</h1>
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
              Tạo Nhà Cung Cấp
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadSuppliers}
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
                placeholder="Tìm kiếm theo mã, tên, email, SĐT..."
                allowClear
                enterButton={<SearchOutlined />}
                size="middle"
                onSearch={handleSearch}
                style={{ width: 350 }}
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
          dataSource={suppliers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} nhà cung cấp`,
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

export default SupplierManagement;

