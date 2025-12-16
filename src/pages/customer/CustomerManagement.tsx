import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Card, Modal, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { customerService, type Customer } from '@/services/customerService';
import enumData from '@/enums/enums';

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getList();
      setCustomers(data.items);
    } catch (err) {
      // handled by baseHttp
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/customers/add');
  };

  const handleEdit = (customer: Customer) => {
    navigate(`/customers/update?id=${customer.id}`);
  };

  const handleDeactivate = (customer: Customer) => {
    Modal.confirm({
      title: 'Vô Hiệu Hóa Khách Hàng',
      content: `Bạn có chắc chắn muốn vô hiệu hóa khách hàng "${customer.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await customerService.deactivate(customer.id);
          loadCustomers();
        } catch (err) {
          // handled
        }
      },
    });
  };

  const handleActivate = (customer: Customer) => {
    Modal.confirm({
      title: 'Kích Hoạt Khách Hàng',
      content: `Bạn có chắc chắn muốn kích hoạt lại khách hàng "${customer.name}"?`,
      okText: 'Xác Nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await customerService.activate(customer.id);
          loadCustomers();
        } catch (err) {
          // handled
        }
      },
    });
  };

  const columns: ColumnsType<Customer> = [
    {
      title: 'Mã KH',
      dataIndex: 'customerCode',
      key: 'customerCode',
      width: 120,
    },
    {
      title: 'Tên Khách Hàng',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Loại',
      dataIndex: 'customerTypeName',
      key: 'customerTypeName',
      width: 120,
      render: (text: string, record: Customer) => (
        <Tag color={record.customerType === 1 ? 'blue' : 'green'}>{text}</Tag>
      ),
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
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
      title: 'Địa Chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: (text) => text || '-',
    },
    {
      title: 'Mã Số Thuế',
      dataIndex: 'taxCode',
      key: 'taxCode',
      width: 130,
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold m-0">Quản Lý Khách Hàng</h1>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Thêm Khách Hàng
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadCustomers}
              loading={loading}
            >
              Làm Mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} khách hàng`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>
    </div>
  );
};

export default CustomerManagement;
