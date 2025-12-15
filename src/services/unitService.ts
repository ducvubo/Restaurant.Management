import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { Unit, CreateUnitRequest, UpdateUnitRequest, UnitListRequest, UnitListResponse, ResultMessage } from '../types';

export const unitService = {
  // Get all units
  getAllUnits: async (): Promise<Unit[]> => {
    const response = await Api.get<ResultMessage<Unit[]>>(API_ENDPOINTS.UNIT_GET_ALL);
    return response.data.result || [];
  },

  // Get base units
  getBaseUnits: async (): Promise<Unit[]> => {
    const response = await Api.get<ResultMessage<Unit[]>>(API_ENDPOINTS.UNIT_BASE_UNITS);
    return response.data.result || [];
  },

  // Get unit list (with pagination and search)
  getUnitList: async (request: UnitListRequest): Promise<UnitListResponse> => {
    const response = await Api.get<ResultMessage<UnitListResponse>>(API_ENDPOINTS.UNIT_LIST, {
      params: request,
    });
    return response.data.result;
  },

  // Get unit by ID
  getUnitById: async (id: string): Promise<Unit> => {
    const response = await Api.get<ResultMessage<Unit>>(API_ENDPOINTS.UNIT_GET, {
      params: { id },
    });
    return response.data.result;
  },

  // Create unit
  createUnit: async (unitData: CreateUnitRequest): Promise<ResultMessage<Unit>> => {
    const response = await Api.post<ResultMessage<Unit>>(API_ENDPOINTS.UNIT_CREATE, unitData);
    return response.data;
  },

  // Update unit
  updateUnit: async (id: string, unitData: UpdateUnitRequest): Promise<ResultMessage<Unit>> => {
    const response = await Api.put<ResultMessage<Unit>>(
      `${API_ENDPOINTS.UNIT_UPDATE}?id=${id}`,
      unitData
    );
    return response.data;
  },

  // Activate unit
  activateUnit: async (id: string): Promise<Unit> => {
    const response = await Api.put<ResultMessage<Unit>>(
      `${API_ENDPOINTS.UNIT_ACTIVATE}?id=${id}`,
      {}
    );
    return response.data.result;
  },

  // Deactivate unit
  deactivateUnit: async (id: string): Promise<Unit> => {
    const response = await Api.put<ResultMessage<Unit>>(
      `${API_ENDPOINTS.UNIT_DEACTIVATE}?id=${id}`,
      {}
    );
    return response.data.result;
  },
};
