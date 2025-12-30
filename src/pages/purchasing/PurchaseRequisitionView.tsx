import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, Card, Button, message, Spin, Descriptions, Table, Tag, Space, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { purchaseRequisitionService } from '@/services/PurchaseRequisitionService';
import { workflowService } from '@/services/workflowService';
import { warehouseService } from '@/services/warehouseService';
import { materialService } from '@/services/materialService';
import { unitService } from '@/services/unitService';
import type { PurchaseRequisition, PurchaseRequisitionItem, WorkflowStateDTO } from '@/types/purchasing';
import WorkflowDisplayTab from './tabs/WorkflowDisplayTab';
import WorkflowNotesTab from './tabs/WorkflowNotesTab';
import WorkflowHistoryTab from './tabs/WorkflowHistoryTab';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// WorkflowType enum tương ứng backend
const WORKFLOW_TYPE_PURCHASE_REQUEST = 1;

const PurchaseRequisitionView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [requisition, setRequisition] = useState<PurchaseRequisition | null>(null);
  const [workflowState, setWorkflowState] = useState<WorkflowStateDTO | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('general');
  
  // Metadata
  const [warehouses, setWarehouses] = useState<Record<string, string>>({});
  const [materials, setMaterials] = useState<Record<string, string>>({});
  const [units, setUnits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      
      // Load requisition data
      const reqData = await purchaseRequisitionService.getById(id);
      setRequisition(reqData);
      
      // Load workflow info
      const [stateData, workflowData] = await Promise.all([
        purchaseRequisitionService.getWorkflowState(id),
        reqData.workflowId ? workflowService.getWorkflowById(reqData.workflowId) : Promise.resolve(null),
      ]);
      
      setWorkflowState(stateData);
      if (workflowData) {
        setActiveWorkflow(workflowData);
      }
      
      // Load metadata
      const [whData, matData, unitData] = await Promise.all([
        warehouseService.getList({ page: 1, size: 100 }),
        materialService.getList({ page: 1, size: 500 }),
        unitService.getAllUnits(),
      ]);
      
      const whMap: Record<string, string> = {};
      whData.items.forEach((w: any) => { whMap[w.id] = w.name; });
      setWarehouses(whMap);
      
      const matMap: Record<string, string> = {};
      matData.items.forEach((m: any) => { matMap[m.id] = m.name; });
      setMaterials(matMap);
      
      const unitMap: Record<string, string> = {};
      unitData.forEach((u: any) => { unitMap[u.id] = u.name; });
      setUnits(unitMap);
      
    } catch (error) {
      message.error('Lỗi khi tải thông tin yêu cầu mua hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/purchasing/requisitions');
  };

  const handleEdit = () => {
    navigate(`/purchasing/requisitions/update?id=${id}`);
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1: return { text: 'Thấp', color: 'default' };
      case 2: return { text: 'Bình thường', color: 'processing' };
      case 3: return { text: 'Cao', color: 'warning' };
      case 4: return { text: 'Khẩn cấp', color: 'error' };
      default: return { text: 'Không xác định', color: 'default' };
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return { text: 'Nháp', color: 'default' };
      case 2: return { text: 'Chờ phê duyệt', color: 'processing' };
      case 3: return { text: 'Đã phê duyệt', color: 'success' };
      case 4: return { text: 'Từ chối', color: 'error' };
      case 5: return { text: 'Đã chuyển đổi', color: 'purple' };
      case -1: return { text: 'Đã hủy', color: 'default' };
      default: return { text: 'Không xác định', color: 'default' };
    }
  };

  const itemColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Nguyên vật liệu',
      dataIndex: 'materialId',
      key: 'materialId',
      render: (id: string) => materials[id] || id,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (val: number) => val?.toLocaleString('vi-VN'),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unitId',
      key: 'unitId',
      width: 100,
      render: (id: string) => units[id] || id,
    },
    {
      title: 'Đơn giá ước tính',
      dataIndex: 'estimatedPrice',
      key: 'estimatedPrice',
      width: 130,
      render: (val: number) => val?.toLocaleString('vi-VN') + ' ₫',
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: 130,
      render: (_: any, record: PurchaseRequisitionItem) => 
        ((record.quantity || 0) * (record.estimatedPrice || 0)).toLocaleString('vi-VN') + ' ₫',
    },
  ];

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      </Card>
    );
  }

  if (!requisition) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text type="danger">Không tìm thấy yêu cầu mua hàng</Text>
          <br /><br />
          <Button onClick={handleBack}>Quay lại danh sách</Button>
        </div>
      </Card>
    );
  }

  const canEdit = requisition.status === 1; // Only DRAFT can be edited
  const priorityInfo = getPriorityText(requisition.priority);
  const statusInfo = getStatusText(requisition.status);

  // Calculate total
  const totalAmount = requisition.items?.reduce((sum, item) => 
    sum + (item.quantity || 0) * (item.estimatedPrice || 0), 0) || 0;

  // Tab items
  const tabItems = [
    {
      key: 'general',
      label: 'Thông tin chung',
      children: (
        <div>
          <Descriptions bordered column={3} size="small" style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Mã yêu cầu">
              <Text strong>{requisition.requisitionCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Kho nhận hàng">
              {requisition.warehouseName || warehouses[requisition.warehouseId] || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Ngày yêu cầu">
              {requisition.requestDate ? dayjs(requisition.requestDate).format('DD/MM/YYYY HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cần hàng">
              {requisition.requiredDate ? dayjs(requisition.requiredDate).format('DD/MM/YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Độ ưu tiên">
              <Tag color={priorityInfo.color}>{priorityInfo.text}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Người yêu cầu">
              {requisition.requestedByName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Bước hiện tại">
              {(() => {
                const step = requisition.workflowStep;
                if (!step) return <Tag>-</Tag>;
                if (step === 'StartEvent_Begin') return <Tag color="blue">Bắt đầu</Tag>;
                if (step === 'EndEvent_Completed') return <Tag color="green">Hoàn thành</Tag>;
                return <Tag color="processing">{requisition.workflowStepName || step}</Tag>;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền ước tính">
              <Text strong style={{ color: '#1890ff' }}>{totalAmount.toLocaleString('vi-VN')} ₫</Text>
            </Descriptions.Item>

            {requisition.notes && (
              <Descriptions.Item label="Ghi chú" span={3}>
                {requisition.notes}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Title level={5} style={{ marginBottom: 16 }}>Danh sách nguyên vật liệu</Title>
          <Table
            columns={itemColumns}
            dataSource={requisition.items || []}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={5} align="right">
                  <Text strong>Tổng cộng:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong style={{ color: '#1890ff' }}>{totalAmount.toLocaleString('vi-VN')} ₫</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </div>
      ),
    },
  ];

  // Add workflow tabs for view
  if (requisition.workflowId) {
    tabItems.push(
      {
        key: 'workflow',
        label: 'Quy trình',
        children: (
          <WorkflowDisplayTab
            workflow={activeWorkflow}
            workflowState={workflowState}
            requisitionId={id || undefined}
          />
        ),
      },
      {
        key: 'notes',
        label: 'Ghi chú',
        children: (
          <WorkflowNotesTab
            referenceId={id || ''}
            workflowType={WORKFLOW_TYPE_PURCHASE_REQUEST}
          />
        ),
      },
      {
        key: 'history',
        label: 'Lịch sử',
        children: (
          <WorkflowHistoryTab
            referenceId={id || ''}
          />
        ),
      }
    );
  }

  return (
    <Card
      title={`Chi tiết yêu cầu mua hàng: ${requisition.requisitionCode}`}
      extra={
        <Space>
          {canEdit && (
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={handleEdit}
            >
              Chỉnh sửa
            </Button>
          )}
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Quay lại
          </Button>
        </Space>
      }
      className='p-1'
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
      />
    </Card>
  );
};

export default PurchaseRequisitionView;
