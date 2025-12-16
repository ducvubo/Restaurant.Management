import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Modal, Tooltip, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { Unit, UnitListRequest } from '@/types';
import { unitService } from '@/services/unitService';
import enumData from '@/enums/enums';

const { Search } = Input;

const UnitManagement = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    loadUnits();
  }, [currentPage, pageSize, statusFilter]);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const request: UnitListRequest = {
        keyword: keyword || undefined,
        status: statusFilter,
        page: currentPage,
        size: pageSize,
      };
      const data = await unitService.getUnitList(request);
      setUnits(data.items);
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
    const request: UnitListRequest = {
      keyword: value || undefined,
      status: statusFilter,
      page: 1,
      size: pageSize,
    };
    setLoading(true);
    unitService.getUnitList(request).then(data => {
      setUnits(data.items);
      setTotal(data.total);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleStatusFilterChange = (value: number | undefined) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    navigate('/units/add');
  };

  const handleEdit = (unit: Unit) => {
    navigate(`/units/update?id=${unit.id}`);
  };

  const handleDeactivate = (unit: Unit) => {
    Modal.confirm({
      title: 'Vô Hiệu Hóa Đơn Vị Tính',
      content: `Bạn có chắc chắn muốn vô hiệu hóa đơn vị tính "${unit.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await unitService.deactivateUnit(unit.id);
          loadUnits();
        } catch (err) {
          // Error đã được xử lý bởi baseHttp interceptor
        }
      },
    });
  };

  const handleActivate = (unit: Unit) => {
    Modal.confirm({
      title: 'Kích Hoạt Đơn Vị Tính',
      content: `Bạn có chắc chắn muốn kích hoạt lại đơn vị tính "${unit.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await unitService.activateUnit(unit.id);
          loadUnits();
        } catch (err) {
          // Error đã được xử lý bởi baseHttp interceptor
        }
      },
    });
  };

  const columns: ColumnsType<Unit> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: 'Tên Đơn Vị',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Ký Hiệu',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
    },
    {
      title: 'Đơn Vị Cơ Bản',
      dataIndex: 'baseUnitName',
      key: 'baseUnitName',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: 'Tỷ Lệ Chuyển Đổi',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      width: 120,
      render: (value) => value || '-',
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      render: (text) => text || '-',
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
          <h1 className="text-xl font-bold m-0">Quản Lý Đơn Vị Tính</h1>
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
              Tạo Đơn Vị Tính
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadUnits}
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
                placeholder="Tìm kiếm theo mã, tên, ký hiệu..."
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
          dataSource={units}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} đơn vị tính`,
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

export default UnitManagement;

