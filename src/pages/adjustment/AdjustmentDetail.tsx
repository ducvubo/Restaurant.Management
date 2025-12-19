import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Button, Space, Tag, message, Tabs, Spin } from 'antd';
import { ArrowLeftOutlined, LockOutlined, EditOutlined, FilePdfOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { adjustmentService } from '@/services/adjustmentService';
import enums from '@/enums';

const AdjustmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      const result = await adjustmentService.get(id);
      setData(result);
    } catch (error) {
      message.error('Không thể tải thông tin phiếu điều chỉnh');
    }
  };

  const handleLock = async () => {
    if (!id) return;
    try {
      await adjustmentService.lock(id);
      loadData();
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi chốt phiếu');
    }
  };

  const loadPreview = async () => {
    if (!id) return;
    setPreviewLoading(true);
    try {
      const result = await adjustmentService.previewLedger(id);
      setPreviewData(result);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!id) return;
    setPdfLoading(true);
    try {
      await adjustmentService.exportPdf(id);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi xuất PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  // Auto-refresh preview every 10s when tab is active
  useEffect(() => {
    if (activeTab === 'preview' && !data?.isLocked) {
      loadPreview();
      const interval = setInterval(loadPreview, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab, data?.isLocked, id]);


  // Check if any item has batch info (from inventory count)
  const hasBatchInfo = data?.items?.some((item: any) => item.inventoryLedgerId);

  const columns = [
    {
      title: 'Nguyên Liệu',
      dataIndex: 'materialName',
      key: 'materialName',
    },
    ...(hasBatchInfo ? [
      {
        title: 'Số Lô',
        dataIndex: 'batchNumber',
        key: 'batchNumber',
        width: 150,
      },
    ] : []),
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
      render: (val: number) => val?.toLocaleString('vi-VN'),
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  if (!data) {
    return null;
  }

  return (
    <div>
      <Card styles={{ body: { padding: '12px' } }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold m-0">Chi Tiết Phiếu Điều Chỉnh</h2>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/adjustment')}
            >
              Quay Lại
            </Button>
            <Button
              type="default"
              icon={<FilePdfOutlined />}
              onClick={handleExportPdf}
              loading={pdfLoading}
            >
              Xuất PDF
            </Button>
            {!data.isLocked && (
              <>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/adjustment/edit/${id}`)}
                >
                  Sửa
                </Button>
                <Button
                  type="primary"
                  icon={<LockOutlined />}
                  onClick={handleLock}
                >
                  Chốt Phiếu
                </Button>
              </>
            )}
          </Space>
        </div>

        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Mã Phiếu">
            <strong>{data.transactionCode}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng Thái">
            {data.isLocked ? (
              <Tag color="red">Đã Chốt</Tag>
            ) : (
              <Tag color="green">Chưa Chốt</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Kho">
            {data.warehouseName}
          </Descriptions.Item>
          <Descriptions.Item label="Loại Điều Chỉnh">
            {data.adjustmentType === enums.adjustmentType.INCREASE.value && (
              <Tag color="green">{enums.adjustmentType.INCREASE.text}</Tag>
            )}
            {data.adjustmentType === enums.adjustmentType.DECREASE.value && (
              <Tag color="orange">{enums.adjustmentType.DECREASE.text}</Tag>
            )}
            {data.adjustmentType === enums.adjustmentType.INVENTORY_COUNT.value && (
              <Tag color="blue">{enums.adjustmentType.INVENTORY_COUNT.text}</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Nguồn">
            {data.adjustmentSource === 2 ? (
              <Tag color="blue" icon={<span>🔍</span>}>Từ Kiểm Kê</Tag>
            ) : (
              <Tag icon={<span>✏️</span>}>Thủ Công</Tag>
            )}
          </Descriptions.Item>
          {data.inventoryCountId && (
            <Descriptions.Item label="Phiếu Kiểm Kê" span={2}>
              <Button
                type="link"
                size="small"
                onClick={() => navigate(`/inventory-count/${data.inventoryCountId}`)}
              >
                {data.inventoryCountCode || 'Xem phiếu kiểm kê'}
              </Button>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Ngày Điều Chỉnh">
            {dayjs(data.transactionDate).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Số Tham Chiếu">
            {data.referenceNumber || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Lý Do" span={2}>
            {data.reason}
          </Descriptions.Item>
          <Descriptions.Item label="Người Điều Chỉnh">
            {data.performedByName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Người Lập Phiếu">
            {data.createdByName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi Chú" span={2}>
            {data.notes || '-'}
          </Descriptions.Item>
        </Descriptions>

        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginTop: 16 }}>
          <Tabs.TabPane tab="Danh Sách Nguyên Liệu" key="materials">
            <Table
              columns={columns}
              dataSource={data.items || []}
              rowKey="id"
              pagination={false}
              bordered
              size="small"
            />
          </Tabs.TabPane>

          {!data.isLocked && (
            <Tabs.TabPane tab="Xem Trước Sổ Cái" key="preview">
              <Spin spinning={previewLoading}>
                {previewData && (
                  <div>
                    {previewData.items?.map((item: any, index: number) => (
                      <div key={index} style={{ marginBottom: 24 }}>
                        <h4 style={{ marginBottom: 12 }}>
                          {index + 1}. {item.materialName}
                        </h4>
                        {item.batches && item.batches.length > 0 ? (
                          <Table
                            dataSource={item.batches}
                            pagination={false}
                            size="small"
                            bordered
                            columns={[
                              {
                                title: 'Batch (Phiếu Nhập)',
                                dataIndex: 'batchNumber',
                                key: 'batchNumber',
                              },
                              {
                                title: 'Ngày Nhập',
                                dataIndex: 'transactionDate',
                                key: 'transactionDate',
                                render: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm'),
                              },
                              {
                                title: 'SL Sử Dụng',
                                dataIndex: 'quantityUsed',
                                key: 'quantityUsed',
                                align: 'right',
                                render: (val: number) => val?.toLocaleString(),
                              },
                              {
                                title: 'Tồn Còn Lại',
                                dataIndex: 'remainingAfter',
                                key: 'remainingAfter',
                                align: 'right',
                                render: (val: number) => (
                                  <span className={val === 0 ? 'text-red-500' : 'text-green-600'}>
                                    {val?.toLocaleString()}
                                  </span>
                                ),
                              },
                            ]}
                          />
                        ) : (
                          <div style={{ padding: '12px', background: '#f0f0f0', borderRadius: 4 }}>
                            Điều chỉnh tăng: Sẽ tạo lô mới với số lượng {item.totalQuantity?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Spin>
            </Tabs.TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default AdjustmentDetail;
