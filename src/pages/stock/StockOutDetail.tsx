import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Space, Descriptions, Table, Tag, Modal, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { stockTransactionService } from '@/services/stockTransactionService';
import type { StockTransaction } from '@/types';
import enumData from '@/enums/enums';
import dayjs from 'dayjs';

const StockOutDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<StockTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTransaction();
    }
  }, [id]);

  const loadTransaction = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await stockTransactionService.getTransaction(id);
      setTransaction(data);
    } catch (err: any) {
      setError('Không thể tải thông tin phiếu xuất');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    Modal.confirm({
      title: 'Chốt Phiếu Xuất',
      content: 'Sau khi chốt, phiếu sẽ được ghi vào sổ cái và KHÔNG THỂ sửa đổi. Bạn có chắc chắn?',
      okText: 'Chốt Phiếu',
      cancelText: 'Hủy',
      okType: 'primary',
      onOk: async () => {
        if (!id) return;
        try {
          await stockTransactionService.lockTransaction(id);
          loadTransaction(); // Reload to get updated status
        } catch (err) {
          // Error handled by baseHttp
        }
      },
    });
  };

  const handleEdit = () => {
    navigate(`/stock-out/edit/${id}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <Card>
        <Alert
          message="Lỗi"
          description={error || 'Không tìm thấy phiếu xuất'}
          type="error"
          showIcon
        />
        <Button onClick={() => navigate('/stock-out')} style={{ marginTop: 16 }}>
          Quay lại
        </Button>
      </Card>
    );
  }

  const isLocked = transaction.isLocked;
  const stockOutType = transaction.stockOutType;
  const stockOutTypeName = stockOutType ? enumData.stockOutType.get(stockOutType)?.text : '-';

  const columns: ColumnsType<any> = [
    {
      title: 'STT',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nguyên Liệu',
      dataIndex: 'materialName',
      key: 'materialName',
    },
    {
      title: 'Đơn Vị',
      dataIndex: 'unitName',
      key: 'unitName',
      width: 100,
    },
    {
      title: 'Số Lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'right',
      render: (val) => val?.toLocaleString(),
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  return (
    <div>
      <Card bodyStyle={{ padding: '16px' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold m-0">Phiếu Xuất Kho #{transaction.transactionCode}</h1>
            <Tag color={isLocked ? 'green' : 'orange'}>
              {isLocked ? '✓ Đã Chốt' : '⏳ Nháp'}
            </Tag>
          </div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/stock-out')}>
              Quay Lại
            </Button>
            {!isLocked && (
              <>
                <Button type="default" icon={<EditOutlined />} onClick={handleEdit}>
                  Chỉnh Sửa
                </Button>
                <Button type="primary" icon={<LockOutlined />} onClick={handleLock}>
                  Chốt Phiếu
                </Button>
              </>
            )}
          </Space>
        </div>

        <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Kho Xuất">{transaction.warehouseName}</Descriptions.Item>
          <Descriptions.Item label="Loại Xuất Kho">
            <Tag color="blue">{stockOutTypeName}</Tag>
          </Descriptions.Item>
          
          {/* Conditional fields based on stock out type */}
          {stockOutType === 1 && (
            <Descriptions.Item label="Kho Đích" span={2}>
              {transaction.destinationWarehouseName || '-'}
            </Descriptions.Item>
          )}
          
          {stockOutType === 2 && (
            <Descriptions.Item label="Khách Hàng" span={2}>
              {transaction.customerName || '-'}
            </Descriptions.Item>
          )}
          
          {stockOutType === 3 && (
            <Descriptions.Item label="Lý Do Tiêu Hủy" span={2}>
              {transaction.disposalReason || '-'}
            </Descriptions.Item>
          )}
          
          <Descriptions.Item label="Ngày Xuất">
            {transaction.transactionDate ? dayjs(transaction.transactionDate).format('DD/MM/YYYY HH:mm') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Số Chứng Từ">{transaction.referenceNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="Ghi Chú" span={2}>{transaction.notes || '-'}</Descriptions.Item>
        </Descriptions>

        <h3 className="text-lg font-semibold mb-2">Danh Sách Nguyên Liệu</h3>
        <Table
          columns={columns}
          dataSource={transaction.stockOutItems || []}
          pagination={false}
          rowKey="id"
          size="small"
          bordered
        />
      </Card>
    </div>
  );
};

export default StockOutDetail;
