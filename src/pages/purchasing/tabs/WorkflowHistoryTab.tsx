import { useState, useEffect } from 'react';
import { Timeline, Empty, Spin, Typography, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { purchaseRequisitionService } from '@/services/PurchaseRequisitionService';
import type { WorkflowActivityDTO } from '@/types/purchasing';
import dayjs from 'dayjs';

const { Text } = Typography;

interface Props {
  referenceId: string;
}

const WorkflowHistoryTab: React.FC<Props> = ({ referenceId }) => {
  const [activities, setActivities] = useState<WorkflowActivityDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [referenceId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await purchaseRequisitionService.getHistory(referenceId);
      setActivities(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin tip="Đang tải lịch sử..." />;
  }

  if (activities.length === 0) {
    return <Empty description="Chưa có lịch sử thao tác" />;
  }

  const timelineItems = activities.map((activity, index) => ({
    key: activity.id || index,
    color: index === activities.length - 1 ? 'blue' : 'green',
    dot: index === activities.length - 1 ? <ClockCircleOutlined /> : <CheckCircleOutlined />,
    children: (
      <div>
        <div style={{ marginBottom: 4 }}>
          <Tag color="blue">{activity.stepName || activity.stepId}</Tag>
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
            {dayjs(activity.actionDate).format('DD/MM/YYYY HH:mm:ss')}
          </Text>
        </div>
        <div style={{ marginBottom: 4 }}>
          <Text>{activity.content}</Text>
        </div>
        <div>
          <UserOutlined style={{ marginRight: 4 }} />
          <Text type="secondary">{activity.userName || 'Người dùng'}</Text>
        </div>
      </div>
    ),
  }));

  return (
    <Timeline items={timelineItems} />
  );
};

export default WorkflowHistoryTab;
