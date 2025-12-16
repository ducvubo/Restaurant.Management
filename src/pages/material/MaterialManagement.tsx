import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Modal, Tooltip, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { Material, MaterialListRequest } from '@/types';
import { materialService } from '@/services/materialService';
import enumData from '@/enums/enums';

const { Search } = Input;

const MaterialManagement = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [currentPage, pageSize, statusFilter, categoryFilter]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const request: MaterialListRequest = {
        keyword: keyword || undefined,
        status: statusFilter,
        category: categoryFilter,
        page: currentPage,
        size: pageSize,
      };
      const data = await materialService.getList(request);
      setMaterials(data.items);
      setTotal(data.total);
    } catch (err) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrentPage(1);
    const request: MaterialListRequest = {
      keyword: value || undefined,
      status: statusFilter,
      category: categoryFilter,
      page: 1,
      size: pageSize,
    };
    setLoading(true);
    materialService.getList(request).then(data => {
      setMaterials(data.items);
      setTotal(data.total);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleCreate = () => {
    navigate('/materials/add');
  };

  const handleEdit = (material: Material) => {
    navigate(`/materials/update?id=${material.id}`);
  };

  const handleDeactivate = (material: Material) => {
    Modal.confirm({
      title: 'Vô Hiệu Hóa Nguyên Liệu',
      content: `Bạn có chắc chắn muốn vô hiệu hóa "${material.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await materialService.deactivateMaterial(material.id);
          loadMaterials();
        } catch (err) {
            // handled
        }
      },
    });
  };

  const handleActivate = (material: Material) => {
    Modal.confirm({
      title: 'Kích Hoạt Nguyên Liệu',
      content: `Bạn có chắc chắn muốn kích hoạt lại "${material.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await materialService.activateMaterial(material.id);
          loadMaterials();
        } catch (err) {
            // handled
        }
      },
    });
  };

  const columns: ColumnsType<Material> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: 'Tên Nguyên Liệu',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
        title: 'Đơn Vị',
        dataIndex: 'unitName',
        key: 'unitName',
        width: 100,
        render: (text) => text || '-',
    },
    {
        title: 'Đơn Giá',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        width: 120,
        render: (val) => val ? val.toLocaleString() : '-',
    },
    {
        title: 'Min',
        dataIndex: 'minStockLevel',
        key: 'minStockLevel',
        width: 80,
    },
    {
        title: 'Max',
        dataIndex: 'maxStockLevel',
        key: 'maxStockLevel',
        width: 80,
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
          <h1 className="text-xl font-bold m-0">Quản Lý Nguyên Vật Liệu</h1>
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
              Thêm Nguyên Liệu
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadMaterials}
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
              <Input
                placeholder="Danh Mục"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
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
          dataSource={materials}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} nguyên liệu`,
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

export default MaterialManagement;

