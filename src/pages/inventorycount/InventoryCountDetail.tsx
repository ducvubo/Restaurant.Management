import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Button, Space, Tag, message, Spin } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import inventoryCountService, { type InventoryCount } from '@/services/inventoryCountService';

const InventoryCountDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<InventoryCount | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await inventoryCountService.get(id!);
      const result = response.data;
      if (result.success && result.result) {
        setData(result.result);
      }
    } catch (error) {
      message.error('Lỗi khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await inventoryCountService.complete(id!);
      const result = response.data;
      if (result.success) {
        message.success('Hoàn thành kiểm kê thành công');
        loadData();
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi hoàn thành kiểm kê');
    }
  };

  const handleCancel = async () => {
    try {
      const response = await inventoryCountService.cancel(id!);
      const result = response.data;
      if (result.success) {
        message.success('Hủy phiếu kiểm kê thành công');
        loadData();
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi hủy phiếu');
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1: return <Tag color="default">Nháp</Tag>;
      case 2: return <Tag color="processing">Đang kiểm kê</Tag>;
      case 3: return <Tag color="success">Hoàn thành</Tag>;
      case 4: return <Tag color="error">Đã hủy</Tag>;
      default: return <Tag>Không xác định</Tag>;
    }
  };

  const getDifferenceTag = (diff: number) => {
    if (diff > 0) return <Tag color="green">+{diff}</Tag>;
    if (diff < 0) return <Tag color="red">{diff}</Tag>;
    return <Tag color="default">0</Tag>;
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Nguyên Liệu',
      dataIndex: 'materialName',
      key: 'materialName',
    },
    {
      title: 'Số Lô',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
    },
    {
      title: 'Ngày Nhập',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Đơn Vị',
      dataIndex: 'unitName',
      key: 'unitName',
      width: 80,
    },
    {
      title: 'SL Sổ Sách',
      dataIndex: 'systemQuantity',
      key: 'systemQuantity',
      width: 110,
      align: 'right' as const,
    },
    {
      title: 'SL Thực Tế',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: 110,
      align: 'right' as const,
    },
    {
      title: 'Chênh Lệch',
      dataIndex: 'differenceQuantity',
      key: 'differenceQuantity',
      width: 110,
      align: 'right' as const,
      render: (diff: number) => getDifferenceTag(diff),
    },
    {
      title: 'Ghi Chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return <div>Không tìm thấy thông tin</div>;
  }

  return (
    <div>
      <Card styles={{ body: { padding: '16px' } }}>
        <div className="flex items-center justify-between mb-4">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/inventory-count')}>
              Quay lại
            </Button>
            <h1 className="text-xl font-bold m-0">Chi Tiết Phiếu Kiểm Kê</h1>
          </Space>
          <Space>
            {data.countStatus !== 3 && data.countStatus !== 4 && (
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleComplete}
                >
                  Hoàn Thành
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                >
                  Hủy
                </Button>
              </>
            )}
          </Space>
        </div>

        <Descriptions 
          bordered 
          size="small"
          column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
          className="mb-4"
        >
          <Descriptions.Item label="Mã Phiếu">{data.countCode}</Descriptions.Item>
          <Descriptions.Item label="Kho">{data.warehouseName}</Descriptions.Item>
          <Descriptions.Item label="Ngày Kiểm Kê">
            {dayjs(data.countDate).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng Thái">{getStatusTag(data.countStatus)}</Descriptions.Item>
          {data.adjustmentTransactionCode && (
            <Descriptions.Item label="Phiếu Điều Chỉnh" span={4}>
              <Button
                type="link"
                size="small"
                onClick={() => navigate(`/adjustment/${data.adjustmentTransactionId}`)}
              >
                {data.adjustmentTransactionCode}
              </Button>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Ghi Chú" span={4}>
            {data.notes || '-'}
          </Descriptions.Item>
        </Descriptions>

        <h3 className="text-lg font-semibold mb-2">Chi Tiết Kiểm Kê</h3>
        <Table
          columns={columns}
          dataSource={data.items}
          rowKey="id"
          pagination={false}
          summary={(pageData) => {
            const totalDiff = pageData.reduce((sum, item) => sum + (item.differenceQuantity || 0), 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={7} align="right">
                  <strong>Tổng chênh lệch:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  {getDifferenceTag(totalDiff)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default InventoryCountDetail;
