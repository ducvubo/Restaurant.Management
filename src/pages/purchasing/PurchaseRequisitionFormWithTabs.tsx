import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, Card, Button, message, Alert, Spin, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { purchaseRequisitionService } from '@/services/PurchaseRequisitionService';
import { workflowService } from '@/services/workflowService';
import type { PurchaseRequisition, WorkflowStateDTO } from '@/types/purchasing';
import PurchaseRequisitionGeneralTab, { type GeneralTabHandle } from './tabs/PurchaseRequisitionGeneralTab';
import WorkflowDisplayTab from './tabs/WorkflowDisplayTab';
import WorkflowNotesTab from './tabs/WorkflowNotesTab';
import WorkflowHistoryTab from './tabs/WorkflowHistoryTab';

// WorkflowType enum tương ứng backend
const WORKFLOW_TYPE_PURCHASE_REQUEST = 1;

const PurchaseRequisitionFormWithTabs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingWorkflow, setCheckingWorkflow] = useState(true);
  const [hasActiveWorkflow, setHasActiveWorkflow] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<any>(null);
  const [requisition, setRequisition] = useState<PurchaseRequisition | null>(null);
  const [workflowState, setWorkflowState] = useState<WorkflowStateDTO | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const generalTabRef = useRef<GeneralTabHandle>(null);

  useEffect(() => {
    if (isEditMode && id) {
      loadRequisition();
    } else {
      // Chế độ thêm mới - kiểm tra workflow đang active
      checkWorkflow();
    }
  }, [id, isEditMode]);

  const checkWorkflow = async () => {
    try {
      setCheckingWorkflow(true);
      const result = await workflowService.getActiveWorkflowByType(WORKFLOW_TYPE_PURCHASE_REQUEST);
      if (result) {
        setHasActiveWorkflow(true);
        setActiveWorkflow(result);
      } else {
        setHasActiveWorkflow(false);
      }
    } catch (error) {
      console.error('Error checking workflow:', error);
      setHasActiveWorkflow(false);
    } finally {
      setCheckingWorkflow(false);
    }
  };

  const loadRequisition = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setCheckingWorkflow(true);
      
      // Load requisition data
      const reqData = await purchaseRequisitionService.getById(id);
      setRequisition(reqData);
      
      // Load workflow state và workflow bằng workflowId từ requisition
      const [stateData, workflowData] = await Promise.all([
        purchaseRequisitionService.getWorkflowState(id),
        reqData.workflowId ? workflowService.getWorkflowById(reqData.workflowId) : Promise.resolve(null),
      ]);
      
      setWorkflowState(stateData);
      if (workflowData) {
        setActiveWorkflow(workflowData);
        setHasActiveWorkflow(true);
      }
    } catch (error) {
      message.error('Lỗi khi tải thông tin yêu cầu mua hàng');
    } finally {
      setLoading(false);
      setCheckingWorkflow(false);
    }
  };

  const handleBack = () => {
    navigate('/purchasing/requisitions');
  };

  const handleSaveSuccess = (savedRequisition: PurchaseRequisition) => {
    setRequisition(savedRequisition);
    setSaving(false);
    if (!isEditMode) {
      // Sau khi tạo mới, navigate sang edit để hiện đầy đủ tabs
      navigate(`/purchasing/requisitions/form?id=${savedRequisition.id}`);
    }
  };

  const handleSave = async () => {
    if (activeTab === 'general' && generalTabRef.current) {
      setSaving(true);
      try {
        await generalTabRef.current.submitForm();
      } catch {
        setSaving(false);
      }
    }
  };

  // Kiểm tra workflow
  if (checkingWorkflow) {
    return (
      <Card>
        <Spin tip="Đang kiểm tra quy trình..." />
      </Card>
    );
  }

  // Không có workflow active -> cảnh báo
  if (!hasActiveWorkflow && !isEditMode) {
    return (
      <Card>
        <Alert
          message="Không có quy trình phê duyệt"
          description="Chưa có quy trình phê duyệt yêu cầu mua hàng được kích hoạt. Vui lòng liên hệ quản trị viên để thiết lập quy trình trước khi tạo yêu cầu mới."
          type="warning"
          showIcon
        />
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          style={{ marginTop: 16 }}
        >
          Quay lại
        </Button>
      </Card>
    );
  }

  // Tab items
  const tabItems = [
    {
      key: 'general',
      label: 'Thông tin chung',
      children: (
        <PurchaseRequisitionGeneralTab
          ref={generalTabRef}
          isEditMode={isEditMode}
          requisition={requisition}
          onSaveSuccess={handleSaveSuccess}
        />
      ),
    },
    {
      key: 'workflow',
      label: 'Quy trình',
      children: (
        <WorkflowDisplayTab
          workflow={activeWorkflow}
          workflowState={workflowState}
          requisitionId={id || undefined}
          onActionComplete={loadRequisition}
        />
      ),
    },
  ];

  // Thêm tabs Ghi chú và Lịch sử nếu đang edit
  if (isEditMode && id) {
    tabItems.push(
      {
        key: 'notes',
        label: 'Ghi chú',
        children: (
          <WorkflowNotesTab
            referenceId={id}
            workflowType={WORKFLOW_TYPE_PURCHASE_REQUEST}
          />
        ),
      },
      {
        key: 'history',
        label: 'Lịch sử',
        children: (
          <WorkflowHistoryTab
            referenceId={id}
          />
        ),
      }
    );
  }

  return (
    <Card
      title={isEditMode ? `Sửa yêu cầu mua hàng: ${requisition?.requisitionCode || ''}` : 'Thêm mới yêu cầu mua hàng'}
      extra={
        <Space>
          {activeTab === 'general' && (
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSave}
              loading={saving}
            >
              {isEditMode ? 'Cập nhật' : 'Lưu đề nghị'}
            </Button>
          )}
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Quay lại
          </Button>
        </Space>
      }
      loading={loading}
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

export default PurchaseRequisitionFormWithTabs;
