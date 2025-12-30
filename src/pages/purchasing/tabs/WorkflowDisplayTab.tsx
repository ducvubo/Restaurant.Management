import { Empty, Button, Space, message, Alert, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { purchaseRequisitionService } from '@/services/PurchaseRequisitionService';
import BpmnViewerReadonly from '@/components/BpmnViewerReadonly';
import type { WorkflowStateDTO } from '@/types/purchasing';

interface Props {
  workflow: any; // WorkflowDTO
  workflowState: WorkflowStateDTO | null;
  requisitionId?: string;
  onActionComplete?: () => void;
}

const WorkflowDisplayTab: React.FC<Props> = ({ workflow, workflowState, requisitionId, onActionComplete }) => {
  const handleAction = async (actionKey: string, actionName: string) => {
    if (!requisitionId) return;
    
    try {
      const comment = `Thực hiện: ${actionName}`;
      const result = await purchaseRequisitionService.performWorkflowAction(requisitionId, {
        actionKey,
        comment,
      });
      
      if (result.success) {
        onActionComplete?.();
      } else {
        message.error(result.message || 'Lỗi khi thực hiện');
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi thực hiện');
    }
  };

  if (!workflow) {
    return <Empty description="Không có thông tin quy trình" />;
  }

  return (
    <div>
      {/* Thông tin quy trình - 1 dòng với thao tác bên phải */}
      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <span><strong>Quy trình:</strong> {workflow.description || 'Quy trình phê duyệt yêu cầu mua hàng'}</span>
          <span><strong>Phiên bản:</strong> <Tag color="blue" style={{ marginLeft: 4 }}>{workflow.version}</Tag></span>
          {workflowState && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {workflowState.isComplete ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ClockCircleOutlined style={{ color: '#1890ff' }} />}
              <strong>{workflowState.currentStepName}</strong>
              <Tag color={workflowState.isComplete ? 'success' : 'processing'}>
                {workflowState.isComplete ? 'Hoàn thành' : 'Đang xử lý'}
              </Tag>
            </span>
          )}
        </div>
        
        {/* Thao tác - bên phải */}
        {workflowState && !workflowState.isComplete && workflowState.availableActions && workflowState.availableActions.length > 0 && (
          <Space size="small">
            {workflowState.availableActions.map((action) => (
              <Button
                key={action.actionKey}
                type="primary"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleAction(action.actionKey, action.actionName)}
              >
                {action.actionName}
              </Button>
            ))}
          </Space>
        )}
      </div>

      {/* BPMN Diagram Readonly */}
      {workflow.workflowDiagram && (
        <div style={{ marginBottom: 8 }}>
          <BpmnViewerReadonly 
            xml={workflow.workflowDiagram} 
            height={400}
            highlightElementId={workflowState?.currentStepId || undefined}
          />
        </div>
      )}

      {workflowState?.isComplete && (
        <Alert
          message="Quy trình đã hoàn thành"
          type="success"
          showIcon
          style={{ marginTop: 8 }}
        />
      )}
    </div>
  );
};

export default WorkflowDisplayTab;


