import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Modal, Tooltip, Input, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { Branch, Warehouse, WarehouseListRequest } from '@/types';
import { warehouseService } from '@/services/warehouseService';
import { branchService } from '@/services/branchService';

const { Search } = Input;
const { Option } = Select;

const WarehouseManagement = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<number | undefined>(undefined);
  const [branchFilter, setBranchFilter] = useState<string | undefined>(undefined);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadWarehouses();
  }, [currentPage, pageSize, statusFilter, typeFilter, branchFilter]);

  const loadBranches = async () => {
    try {
      const data = await branchService.getAllActiveBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to load branches", error);
    }
  };

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const request: WarehouseListRequest = {
        keyword: keyword || undefined,
        status: statusFilter,
        warehouseType: typeFilter,
        branchId: branchFilter,
        page: currentPage,
        size: pageSize,
      };
      const data = await warehouseService.getList(request);
      setWarehouses(data.items);
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
    const request: WarehouseListRequest = {
      keyword: value || undefined,
      status: statusFilter,
      warehouseType: typeFilter,
      branchId: branchFilter,
      page: 1,
      size: pageSize,
    };
    setLoading(true);
    warehouseService.getList(request).then(data => {
      setWarehouses(data.items);
      setTotal(data.total);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleCreate = () => {
    navigate('/warehouses/add');
  };

  const handleEdit = (warehouse: Warehouse) => {
    navigate(`/warehouses/update?id=${warehouse.id}`);
  };

  const handleDeactivate = (warehouse: Warehouse) => {
    Modal.confirm({
      title: 'Vô Hiệu Hóa Kho',
      content: `Bạn có chắc chắn muốn vô hiệu hóa kho "${warehouse.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await warehouseService.deactivateWarehouse(warehouse.id);
          message.success("Vô hiệu hóa kho thành công");
          loadWarehouses();
        } catch (err) {
          // handled
        }
      },
    });
  };

  const handleActivate = (warehouse: Warehouse) => {
    Modal.confirm({
      title: 'Kích Hoạt Kho',
      content: `Bạn có chắc chắn muốn kích hoạt lại kho "${warehouse.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await warehouseService.activateWarehouse(warehouse.id);
          message.success("Kích hoạt kho thành công");
          loadWarehouses();
        } catch (err) {
          // handled
        }
      },
    });
  };

  const warehouseTypeMap: Record<number, string> = {
    1: 'Kho Tổng',
    2: 'Kho Chi Nhánh'
  };

  const columns: ColumnsType<Warehouse> = [
    {
      title: 'Mã Kho',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: 'Tên Kho',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Chi Nhánh',
      dataIndex: 'branchName', // Assuming DTO has branchName (I added it in backend) - wait, check DTO.
      // DTO has branchId. Does it have branchName? Yes, I added logic in AppService to set UnitName but Warehouse AppService?
      // Check WarehouseMapper... I didn't add branchName population in `toDTO` nor AppService `getList`.
      // I only did it for Material.
      // So Frontend might need to map branchId -> branchName from `branches` state.
      key: 'branchName',
      width: 150,
      render: (_, record) => {
        if (record.branchName) return record.branchName;
        const branch = branches.find(b => b.id === record.branchId);
        return branch ? branch.name : record.branchId;
      }
    },
    {
      title: 'Loại Kho',
      dataIndex: 'warehouseType',
      key: 'warehouseType',
      width: 120,
      render: (type: number) => warehouseTypeMap[type] || type,
    },
    {
      title: 'Sức Chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      render: (val) => val ? val.toLocaleString() : '-',
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
          <h1 className="text-xl font-bold m-0">Quản Lý Kho</h1>
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
              Tạo Kho Mới
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadWarehouses}
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
                placeholder="Tìm kiếm theo mã, tên..."
                allowClear
                enterButton={<SearchOutlined />}
                size="middle"
                onSearch={handleSearch}
                style={{ width: 300 }}
              />
              <Select
                placeholder="Chi Nhánh"
                allowClear
                style={{ width: 200 }}
                value={branchFilter}
                onChange={setBranchFilter}
              >
                {branches.map(b => (
                  <Option key={b.id} value={b.id}>{b.name}</Option>
                ))}
              </Select>
              <Select
                placeholder="Loại Kho"
                allowClear
                style={{ width: 200 }}
                value={typeFilter}
                onChange={setTypeFilter}
              >
                <Option value={1}>Kho Tổng</Option>
                <Option value={2}>Kho Chi Nhánh</Option>
              </Select>
              <Select
                placeholder="Trạng Thái"
                allowClear
                style={{ width: 150 }}
                value={statusFilter}
                onChange={setStatusFilter}
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
          dataSource={warehouses}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} kho`,
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

export default WarehouseManagement;

