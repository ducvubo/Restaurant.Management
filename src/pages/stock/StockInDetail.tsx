import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Space, Descriptions, Table, Tag, Modal, Spin, Alert, Tabs } from 'antd';
import { ArrowLeftOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { stockTransactionService } from '@/services/stockTransactionService';
import type { StockTransaction } from '@/types';
import dayjs from 'dayjs';

const StockInDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<StockTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

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
      setError('Không thể tải thông tin phiếu nhập');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLock = () => {
    Modal.confirm({
      title: 'Chốt Phiếu Nhập',
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
    navigate(`/stock-in/edit/${id}`);
  };

  const loadPreview = async () => {
    if (!id) return;
    
    setPreviewLoading(true);
    try {
      const data = await stockTransactionService.previewLedger(id);
      setPreviewData(data);
    } catch (err) {
      console.error('Failed to load preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Auto-refresh preview every 10s when tab is active
  useEffect(() => {
    if (activeTab === 'preview' && !transaction?.isLocked) {
      loadPreview();
      const interval = setInterval(loadPreview, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab, transaction?.isLocked, id]);

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
          description={error || 'Không tìm thấy phiếu nhập'}
          type="error"
          showIcon
        />
        <Button onClick={() => navigate('/stock-in')} style={{ marginTop: 16 }}>
          Quay lại
        </Button>
      </Card>
    );
  }

  const isLocked = transaction.isLocked;

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
      title: 'Đơn Giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      align: 'right',
      render: (val) => val?.toLocaleString() + ' đ',
    },
    {
      title: 'Thành Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right',
      render: (val) => <strong>{val?.toLocaleString()} đ</strong>,
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
            <h1 className="text-xl font-bold m-0">Phiếu Nhập Kho #{transaction.transactionCode}</h1>
            <Tag color={isLocked ? 'green' : 'orange'}>
              {isLocked ? '✓ Đã Chốt' : '⏳ Nháp'}
            </Tag>
          </div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/stock-in')}>
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
          <Descriptions.Item label="Kho Nhập">{transaction.warehouseName}</Descriptions.Item>
          <Descriptions.Item label="Nhà Cung Cấp">{transaction.supplierName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Loại Nhập">
            {transaction.stockInType === 2 ? (
              <Tag color="blue">Chuyển kho nội bộ</Tag>
            ) : (
              <Tag color="green">Nhập từ NCC</Tag>
            )}
          </Descriptions.Item>
          {transaction.stockInType === 2 && transaction.relatedTransactionCode && (
            <Descriptions.Item label="Từ Phiếu Xuất">
              <a 
                href={`/stock-out/${transaction.relatedTransactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1890ff' }}
              >
                {transaction.relatedTransactionCode}
              </a>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Ngày Nhập">
            {transaction.transactionDate ? dayjs(transaction.transactionDate).format('DD/MM/YYYY HH:mm') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Số Chứng Từ">{transaction.referenceNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="Ghi Chú" span={2}>{transaction.notes || '-'}</Descriptions.Item>
        </Descriptions>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Thông Tin Phiếu" key="info">
            <h3 className="text-lg font-semibold mb-2">Danh Sách Nguyên Liệu</h3>
            <Table
              columns={columns}
              dataSource={transaction.stockInItems || []}
              pagination={false}
              rowKey="id"
              size="small"
              bordered
            />

            <div style={{ textAlign: 'right', marginTop: 16, fontSize: 16 }}>
              <strong>Tổng Tiền: </strong>
              <span style={{ color: '#1890ff', fontSize: 18, fontWeight: 'bold' }}>
                {transaction.totalAmount?.toLocaleString() || 0} đ
              </span>
            </div>
          </Tabs.TabPane>

          {!isLocked && (
            <Tabs.TabPane tab="Xem Trước Sổ Cái" key="preview">
              <Spin spinning={previewLoading}>
                {previewData && previewData.items && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Batch Mới Sẽ Được Tạo</h3>
                    <Table
                      size="small"
                      bordered
                      pagination={false}
                      dataSource={previewData.items}
                      rowKey="materialId"
                      columns={[
                        {
                          title: 'Nguyên Liệu',
                          dataIndex: 'materialName',
                          key: 'materialName',
                        },
                        {
                          title: 'Batch (Phiếu Nhập)',
                          key: 'batchNumber',
                          render: (record: any) => record.batches?.[0]?.batchNumber || '-',
                        },
                        {
                          title: 'Số Lượng',
                          dataIndex: 'totalQuantity',
                          key: 'totalQuantity',
                          align: 'right',
                          render: (val: number) => val?.toLocaleString(),
                        },
                        {
                          title: 'Đơn Giá',
                          key: 'unitPrice',
                          align: 'right',
                          render: (record: any) => (record.batches?.[0]?.unitPrice?.toLocaleString() || 0) + ' đ',
                        },
                        {
                          title: 'Thành Tiền',
                          dataIndex: 'totalAmount',
                          key: 'totalAmount',
                          align: 'right',
                          render: (val: number) => <strong>{val?.toLocaleString()} đ</strong>,
                        },
                      ]}
                    />
                    <div style={{ textAlign: 'right', marginTop: 16, fontSize: 18 }}>
                      <strong>Tổng Giá Trị Nhập: </strong>
                      <span style={{ color: '#1890ff', fontSize: 20, fontWeight: 'bold' }}>
                        {previewData.grandTotal?.toLocaleString() || 0} đ
                      </span>
                    </div>
                  </div>
                )}
                {!previewData && !previewLoading && (
                  <Alert message="Không có dữ liệu preview" type="info" />
                )}
              </Spin>
            </Tabs.TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default StockInDetail;
