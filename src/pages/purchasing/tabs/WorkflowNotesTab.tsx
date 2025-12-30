import { useState, useEffect } from 'react';
import { List, Button, Input, Card, Space, Popconfirm, message, Empty, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { workflowNoteService } from '@/services/WorkflowNoteService';
import type { WorkflowNoteDTO, WorkflowNoteRequest } from '@/types/purchasing';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

interface Props {
  referenceId: string;
  workflowType: number;
}

const WorkflowNotesTab: React.FC<Props> = ({ referenceId, workflowType }) => {
  const [notes, setNotes] = useState<WorkflowNoteDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  useEffect(() => {
    loadNotes();
  }, [referenceId, workflowType]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await workflowNoteService.getList(referenceId, workflowType);
      setNotes(data);
    } catch (error) {
      message.error('Lỗi khi tải ghi chú');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      message.warning('Vui lòng nhập nội dung ghi chú');
      return;
    }

    try {
      const request: WorkflowNoteRequest = {
        referenceId,
        workflowType,
        content: newNoteContent,
      };
      const result = await workflowNoteService.create(request);
      if (result.success) {
        setNewNoteContent('');
        setShowAddNew(false);
        loadNotes();
      } else {
        message.error(result.message || 'Lỗi khi thêm ghi chú');
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi thêm ghi chú');
    }
  };

  const handleEditNote = (note: WorkflowNoteDTO) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) {
      message.warning('Nội dung không được để trống');
      return;
    }

    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return;

      const request: WorkflowNoteRequest = {
        referenceId: note.referenceId,
        workflowType: note.workflowType,
        stepId: note.stepId,
        stepName: note.stepName,
        content: editContent,
      };
      const result = await workflowNoteService.update(noteId, request);
      if (result.success) {
        setEditingId(null);
        loadNotes();
      } else {
        message.error(result.message || 'Lỗi khi cập nhật');
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi cập nhật');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const result = await workflowNoteService.delete(noteId);
      if (result.success) {
        loadNotes();
      } else {
        message.error(result.message || 'Lỗi khi xóa');
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi xóa');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        {showAddNew ? (
          <Card size="small">
            <TextArea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Nhập nội dung ghi chú..."
              rows={3}
              style={{ marginBottom: 8 }}
            />
            <Space>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleAddNote}>Lưu</Button>
              <Button icon={<CloseOutlined />} onClick={() => { setShowAddNew(false); setNewNoteContent(''); }}>Hủy</Button>
            </Space>
          </Card>
        ) : (
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setShowAddNew(true)}>
            Thêm ghi chú
          </Button>
        )}
      </div>

      {notes.length === 0 ? (
        <Empty description="Chưa có ghi chú nào" />
      ) : (
        <List
          loading={loading}
          dataSource={notes}
          renderItem={(note) => (
            <List.Item
              actions={note.canEdit || note.canDelete ? [
                note.canEdit && editingId !== note.id && (
                  <Button size="small" type="link" icon={<EditOutlined />} onClick={() => handleEditNote(note)}>Sửa</Button>
                ),
                note.canDelete && (
                  <Popconfirm title="Xóa ghi chú này?" onConfirm={() => handleDeleteNote(note.id)}>
                    <Button size="small" type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
                  </Popconfirm>
                ),
              ].filter(Boolean) : undefined}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{note.userName || 'Người dùng'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(note.createdDate).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </Space>
                }
                description={
                  editingId === note.id ? (
                    <div>
                      <TextArea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        style={{ marginBottom: 8 }}
                      />
                      <Space>
                        <Button size="small" type="primary" onClick={() => handleSaveEdit(note.id)}>Lưu</Button>
                        <Button size="small" onClick={() => setEditingId(null)}>Hủy</Button>
                      </Space>
                    </div>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{note.content}</div>
                  )
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default WorkflowNotesTab;
