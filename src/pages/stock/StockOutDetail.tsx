import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Space, Descriptions, Table, Tag, Modal, Spin, Alert, Tabs, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, LockOutlined, FilePdfOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { stockOutService } from '@/services/stockOutService';
import { inventoryLedgerService } from '@/services/inventoryLedgerService';
import unitConversionService, { type MaterialUnit } from '@/services/unitConversionService';
import type { StockTransaction } from '@/types';
import enumData from '@/enums/enums';
import dayjs from 'dayjs';

const StockOutDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState<StockTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [materialUnits, setMaterialUnits] = useState<Record<string, MaterialUnit[]>>({});

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
      const data = await stockOutService.getById(id);
      
      // Load available stock for each item
      if (data.stockOutItems && data.stockOutItems.length > 0 && data.warehouseId) {
        const itemsWithStock = await Promise.all(
          data.stockOutItems.map(async (item) => {
            try {
              const stock = await inventoryLedgerService.getAvailableStock(
                data.warehouseId!,
                item.materialId
              );
              return { ...item, availableStock: stock };
            } catch (error) {
              console.error('Failed to load stock:', error);
              return item;
            }
          })
        );
        data.stockOutItems = itemsWithStock;
        
        // Load units for each material
        const uniqueMaterialIds = [...new Set(itemsWithStock.map(item => item.materialId))];
        for (const materialId of uniqueMaterialIds) {
          try {
            const units = await unitConversionService.getUnitsForMaterial(materialId);
            setMaterialUnits(prev => ({
              ...prev,
              [materialId]: units
            }));
          } catch (error) {
            console.error(`Failed to load units for material ${materialId}:`, error);
          }
        }
      }
      
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
          await stockOutService.lock(id);
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

  const handleExportPdf = async () => {
    if (!id) return;
    setPdfLoading(true);
    try {
      await stockOutService.exportPdf(id);
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi xuất PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const loadPreview = async () => {
    if (!id) return;
    
    setPreviewLoading(true);
    try {
      const data = await stockOutService.previewLedger(id);
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
          title="Lỗi"
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
      title: 'Tồn Kho',
      key: 'availableStock',
      width: 120,
      align: 'right',
      render: (_: any, record: any) => {
        if (record.availableStock === undefined) {
          return <span className="text-gray-400">-</span>;
        }
        
        // Get units for this material
        const units = record.materialId ? materialUnits[record.materialId] || [] : [];
        const baseUnit = units.find(u => u.isBaseUnit);
        const selectedUnit = units.find(u => u.unitId === record.unitId);
        
        // Convert stock to selected unit if different from base unit
        let displayStock = record.availableStock;
        let displayUnitSymbol = baseUnit?.unitSymbol || '';
        
        if (selectedUnit && selectedUnit.conversionFactor && !selectedUnit.isBaseUnit) {
          // Convert from base unit to selected unit
          displayStock = record.availableStock / selectedUnit.conversionFactor;
          displayUnitSymbol = selectedUnit.unitSymbol;
        }
        
        return (
          <span className="text-green-600 font-bold">
            {displayStock.toFixed(3).replace(/\.?0+$/, '')} {displayUnitSymbol}
          </span>
        );
      },
    },
    {
      title: 'Đơn Giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      align: 'right',
      render: (val) => val ? <span>{val.toLocaleString()} đ</span> : <span className="text-gray-400">-</span>,
    },
    {
      title: 'Thành Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right',
      render: (val) => val ? <strong>{val.toLocaleString()} đ</strong> : <span className="text-gray-400">-</span>,
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  return (
    <div>
      <Card styles={{ body: { padding: '16px' } }}>
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
            <Button
              type="default"
              icon={<FilePdfOutlined />}
              onClick={handleExportPdf}
              loading={pdfLoading}
            >
              Xuất PDF
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
          <Descriptions.Item label="Người Xuất Kho">
            {transaction.issuedByName || '-'}
          </Descriptions.Item>
          {stockOutType === 1 && (
            <Descriptions.Item label="Người Tiếp Nhận">
              {transaction.receivedByName || '-'}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Người Lập Phiếu">
            {transaction.createdByName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi Chú" span={2}>{transaction.notes || '-'}</Descriptions.Item>
        </Descriptions>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Thông Tin Phiếu" key="info">
            <h3 className="text-lg font-semibold mb-2">Danh Sách Nguyên Liệu</h3>
            <Table
              columns={columns}
              dataSource={transaction.stockOutItems || []}
              pagination={false}
              rowKey="id"
              size="small"
              bordered
            />
          </Tabs.TabPane>

          {!isLocked && (
            <Tabs.TabPane tab="Xem Trước Sổ Cái" key="preview">
              <Spin spinning={previewLoading}>
                {previewData && previewData.items && (
                  <div>
                    {previewData.items.map((item: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: 24 }}>
                        <h4 className="font-semibold mb-2">{item.materialName}</h4>
                        <Table
                          size="small"
                          bordered
                          pagination={false}
                          dataSource={item.batches || []}
                          rowKey="batchId"
                          columns={[
                            {
                              title: 'Batch (Phiếu Nhập)',
                              dataIndex: 'batchNumber',
                              key: 'batchNumber',
                              width: 150,
                            },
                            {
                              title: 'Ngày Nhập',
                              key: 'transactionDate',
                              width: 140,
                              render: (record: any) => {
                                // Get transaction date from batch if available
                                return record.transactionDate 
                                  ? dayjs(record.transactionDate).format('DD/MM/YYYY HH:mm')
                                  : '-';
                              },
                            },
                            {
                              title: 'SL Xuất',
                              dataIndex: 'quantityUsed',
                              key: 'quantityUsed',
                              width: 100,
                              align: 'right',
                              render: (val: number) => `${val?.toLocaleString()} ${item.baseUnitSymbol || ''}`,
                            },
                            {
                              title: 'Đơn Giá',
                              dataIndex: 'unitPrice',
                              key: 'unitPrice',
                              align: 'right',
                              render: (val: number) => val?.toLocaleString() + ' đ',
                            },
                            {
                              title: 'Thành Tiền',
                              dataIndex: 'totalAmount',
                              key: 'totalAmount',
                              align: 'right',
                              render: (val: number) => <strong>{val?.toLocaleString()} đ</strong>,
                            },
                            {
                              title: 'Tồn Hiện Tại',
                              dataIndex: 'remainingBefore',
                              key: 'remainingBefore',
                              align: 'right',
                              render: (val: number) => <span className="text-blue-600">{val?.toLocaleString()} {item.baseUnitSymbol || ''}</span>,
                            },
                            {
                              title: 'Tồn Còn Lại',
                              dataIndex: 'remainingAfter',
                              key: 'remainingAfter',
                              align: 'right',
                              render: (val: number) => (
                                <span className={val === 0 ? 'text-red-500' : 'text-green-600'}>
                                  {val?.toLocaleString()} {item.baseUnitSymbol || ''}
                                </span>
                              ),
                            },
                          ]}
                          summary={() => (
                            <Table.Summary>
                              <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={3}>
                                  <strong>Tổng {item.materialName}</strong>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="right">
                                  <strong>{item.totalAmount?.toLocaleString()} đ</strong>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} />
                              </Table.Summary.Row>
                            </Table.Summary>
                          )}
                        />
                      </div>
                    ))}
                    <div style={{ textAlign: 'right', marginTop: 16, fontSize: 18 }}>
                      <strong>Tổng Giá Trị Xuất: </strong>
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

export default StockOutDetail;
