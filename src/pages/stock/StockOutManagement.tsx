import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { StockTransaction } from '@/types';
import { stockTransactionService } from '@/services/stockTransactionService';

const StockOutManagement = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await stockTransactionService.getList({
        page: pagination.current,
        size: pagination.pageSize,
        transactionType: 2, // STOCK_OUT = 2
      });
      setData(result.items);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id: string) => {
    try {
      await stockTransactionService.lockTransaction(id);
      loadData();
    } catch (error: any) {
      console.error('Lock transaction error:', error);
    }
  };

  const columns = [
    {
      title: 'Mã Phiếu',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      width: 150,
    },
    {
      title: 'Kho',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
    },
    {
      title: 'Ngày Xuất',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      render: (amount: number) => `${amount?.toLocaleString('vi-VN') || 0} đ`,
    },
    {
      title: 'Trạng Thái',
      key: 'isLocked',
      width: 120,
      render: (_: any, record: StockTransaction) => (
        record.isLocked ? (
          <Tag color="red">Đã Chốt</Tag>
        ) : (
          <Tag color="green">Chưa Chốt</Tag>
        )
      ),
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 150,
      render: (_: any, record: StockTransaction) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/stock-out/${record.id}`)}
          >
            Xem
          </Button>
          {!record.isLocked && (
            <Button
              type="link"
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
          <h1 className="text-xl font-bold m-0">Quản Lý Phiếu Xuất Kho</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/stock-out/add')}
          >
            Tạo Phiếu Xuất
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
              setPagination(prev => ({ ...prev, current: page, pageSize }));
            },
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default StockOutManagement;
