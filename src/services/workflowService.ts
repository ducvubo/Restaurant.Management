import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { Workflow, CreateWorkflowRequest, UpdateWorkflowRequest, WorkflowListRequest, WorkflowListResponse, ResultMessage, BpmnValidationResult } from '../types';

export const workflowService = {
    // Get workflow list (with pagination and search)
    getWorkflowList: async (request: WorkflowListRequest): Promise<WorkflowListResponse> => {
        const response = await Api.get<ResultMessage<WorkflowListResponse>>(API_ENDPOINTS.WORKFLOW_LIST, {
            params: request,
        });
        return response.data.result;
    },

    // Get workflow by ID
    getWorkflowById: async (id: string): Promise<Workflow> => {
        const response = await Api.get<ResultMessage<Workflow>>(API_ENDPOINTS.WORKFLOW_GET, {
            params: { id },
        });
        return response.data.result;
    },

    // Get active workflow by type
    getActiveWorkflowByType: async (workflowType: number): Promise<Workflow> => {
        const response = await Api.get<ResultMessage<Workflow>>(API_ENDPOINTS.WORKFLOW_GET_ACTIVE_BY_TYPE, {
            params: { workflowType },
        });
        return response.data.result;
    },

    // Create workflow
    createWorkflow: async (workflowData: CreateWorkflowRequest, isForceActive: boolean = false): Promise<ResultMessage<Workflow>> => {
        const response = await Api.post<ResultMessage<Workflow>>(
            `${API_ENDPOINTS.WORKFLOW_CREATE}?isForceActive=${isForceActive}`,
            workflowData
        );
        return response.data;
    },

    // Update workflow
    updateWorkflow: async (id: string, workflowData: UpdateWorkflowRequest, isForceActive: boolean = false): Promise<ResultMessage<Workflow>> => {
        const response = await Api.put<ResultMessage<Workflow>>(
            `${API_ENDPOINTS.WORKFLOW_UPDATE}?id=${id}&isForceActive=${isForceActive}`,
            workflowData
        );
        return response.data;
    },

    // Delete workflow
    deleteWorkflow: async (id: string): Promise<void> => {
        await Api.delete<ResultMessage<string>>(
            `${API_ENDPOINTS.WORKFLOW_DELETE}?id=${id}`
        );
    },


    // Activate workflow
    activateWorkflow: async (id: string, isForceActive: boolean = false): Promise<void> => {
        await Api.put<ResultMessage<string>>(
            `${API_ENDPOINTS.WORKFLOW_ACTIVATE}?id=${id}&isForceActive=${isForceActive}`,
            {}
        );
    },

    // Deactivate workflow
    deactivateWorkflow: async (id: string): Promise<void> => {
        await Api.put<ResultMessage<string>>(
            `${API_ENDPOINTS.WORKFLOW_DEACTIVATE}?id=${id}`,
            {}
        );
    },

    // Validate BPMN XML
    validateBpmn: async (bpmnXml: string): Promise<BpmnValidationResult> => {
        const response = await Api.post<BpmnValidationResult>(API_ENDPOINTS.WORKFLOW_VALIDATE_BPMN, {
            bpmnXml,
        });
        return response.data;
    },

    // Extract policy IDs from BPMN
    extractPolicyIds: async (bpmnXml: string): Promise<string[]> => {
        const response = await Api.post<ResultMessage<string[]>>(API_ENDPOINTS.WORKFLOW_EXTRACT_POLICY_IDS, {
            bpmnXml,
        });
        return response.data.result;
    },
};
