import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { WorkflowNoteDTO, WorkflowNoteRequest } from '../types/purchasing';
import type { ResultMessage } from '../types';

export const workflowNoteService = {
  // Lấy danh sách ghi chú
  getList: async (referenceId: string, workflowType: number): Promise<WorkflowNoteDTO[]> => {
    const response = await Api.get<ResultMessage<WorkflowNoteDTO[]>>(
      API_ENDPOINTS.WORKFLOW_NOTE.LIST,
      { params: { referenceId, workflowType } }
    );
    return response.data.result;
  },

  // Tạo ghi chú mới
  create: async (request: WorkflowNoteRequest): Promise<ResultMessage<WorkflowNoteDTO>> => {
    const response = await Api.post<ResultMessage<WorkflowNoteDTO>>(
      API_ENDPOINTS.WORKFLOW_NOTE.CREATE,
      request
    );
    return response.data;
  },

  // Cập nhật ghi chú
  update: async (id: string, request: WorkflowNoteRequest): Promise<ResultMessage<WorkflowNoteDTO>> => {
    const response = await Api.put<ResultMessage<WorkflowNoteDTO>>(
      `${API_ENDPOINTS.WORKFLOW_NOTE.UPDATE}?id=${id}`,
      request
    );
    return response.data;
  },

  // Xóa ghi chú
  delete: async (id: string): Promise<ResultMessage<void>> => {
    const response = await Api.delete<ResultMessage<void>>(
      `${API_ENDPOINTS.WORKFLOW_NOTE.DELETE}?id=${id}`
    );
    return response.data;
  },
};
