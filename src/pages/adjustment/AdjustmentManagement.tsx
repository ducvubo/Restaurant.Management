import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Space, Tag, message } from 'antd';
import { PlusOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { adjustmentService } from '@/services/adjustmentService';
import enums from '@/enums';

interface AdjustmentTransaction {
  id: string;
  transactionCode: string;
  warehouseId: string;
  warehouseName: string;
  adjustmentType: number;
  adjustmentTypeName: string;
  transactionDate: string;
  reason: string;
  totalAmount: number;
  isLocked: boolean;
}

const AdjustmentManagement = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdjustmentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await adjustmentService.list(pagination.current, pagination.pageSize);
      setData(result.items || []);
      setPagination(prev => ({ ...prev, total: result.total || 0 }));
    } catch (error) {
      message.error('Lỗi khi tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id: string) => {
    try {
      await adjustmentService.lock(id);
      loadData();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi chốt phiếu');
    }
  };



  const columns = [
    {
      title: 'Mã Phiếu',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      width: 170,
    },
    {
      title: 'Kho',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 120,
    },
    {
      title: 'Loại',
      dataIndex: 'adjustmentType',
      key: 'adjustmentType',
      width: 110,
      render: (type: number) => {
        if (type === enums.adjustmentType.INCREASE.value) {
          return <Tag color="green">Tăng</Tag>;
        }
        return <Tag color="orange">Giảm</Tag>;
      },
    },
    {
      title: 'Lý Do',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Ngày',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 140,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'TT',
      key: 'isLocked',
      width: 90,
      render: (_: any, record: AdjustmentTransaction) => (
        record.isLocked ? (
          <Tag color="red">Chốt</Tag>
        ) : (
          <Tag color="green">Nháp</Tag>
        )
      ),
    },
    {
      title: '',
      key: 'action',
      fixed: 'right' as const,
      width: 180,
      render: (_: any, record: AdjustmentTransaction) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/adjustment/${record.id}`)}
          >
            Xem
          </Button>
          {!record.isLocked && (
            <Button
              type="link"
              size="small"
              icon={<LockOutlined />}
              onClick={() => handleLock(record.id)}
            >
              Chốt
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold m-0">Quản Lý Phiếu Điều Chỉnh Kho</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/adjustment/add')}
          >
            Tạo Phiếu Điều Chỉnh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phiếu`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 10 }));
            },
          }}
        />
      </Card>
    </div>
  );
};

export default AdjustmentManagement;
