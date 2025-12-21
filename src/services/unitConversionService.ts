import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';

export interface UnitConversion {
  id: string;
  fromUnitId: string;
  fromUnitName: string;
  fromUnitSymbol: string;
  toUnitId: string;
  toUnitName: string;
  toUnitSymbol: string;
  conversionFactor: number;
  status: string;
  usageCount: number;
}

export interface MaterialUnit {
  id: string;
  materialId: string;
  unitId: string;
  unitName: string;
  unitSymbol: string;
  isBaseUnit: boolean;
  conversionFactor?: number; // Conversion factor to base unit
}

export interface UnitConversionRequest {
  fromUnitId: string;
  toUnitId: string;
  conversionFactor: number;
  reason?: string;
}

const unitConversionService = {
  // List all conversions with pagination
  list: async (params?: { page?: number; size?: number; keyword?: string; status?: number; fromUnitId?: string; toUnitId?: string }) => {
    const response = await Api.get(API_ENDPOINTS.UNIT_CONVERSION_LIST, {
      params: params || { page: 1, size: 10 }
    });
    return response.data;
  },

  // Create conversion
  create: async (data: UnitConversionRequest) => {
    const response = await Api.post(API_ENDPOINTS.UNIT_CONVERSION_CREATE, data);
    return response.data;
  },

  // Update conversion
  update: async (id: string, data: UnitConversionRequest) => {
    const response = await Api.put(API_ENDPOINTS.UNIT_CONVERSION_UPDATE, data, {
      params: { id }
    });
    return response.data;
  },

  // Delete conversion
  delete: async (id: string) => {
    const response = await Api.delete(API_ENDPOINTS.UNIT_CONVERSION_DELETE, {
      params: { id }
    });
    return response.data;
  },

  // Convert quantity
  convert: async (quantity: number, fromUnitId: string, toUnitId: string) => {
    const response = await Api.get(API_ENDPOINTS.UNIT_CONVERSION_CONVERT, {
      params: { quantity, fromUnitId, toUnitId }
    });
    return response.data;
  },

  // Get units for material
  getUnitsForMaterial: async (materialId: string): Promise<MaterialUnit[]> => {
    const response = await Api.get(API_ENDPOINTS.UNIT_CONVERSION_MATERIAL_UNITS, {
      params: { materialId }
    });
    return response.data.result || [];
  },

  // Add unit to material
  addUnitToMaterial: async (materialId: string, unitId: string, isBaseUnit?: boolean) => {
    const response = await Api.post(
      API_ENDPOINTS.UNIT_CONVERSION_ADD_UNIT,
      null,
      { params: { materialId, unitId, isBaseUnit } }
    );
    return response.data;
  },

  // Remove unit from material
  removeUnitFromMaterial: async (materialId: string, unitId: string) => {
    const response = await Api.delete(
      API_ENDPOINTS.UNIT_CONVERSION_REMOVE_UNIT,
      { params: { materialId, unitId } }
    );
    return response.data;
  },

  // Set base unit
  setBaseUnit: async (materialId: string, unitId: string) => {
    const response = await Api.put(
      API_ENDPOINTS.UNIT_CONVERSION_SET_BASE,
      null,
      { params: { materialId, unitId } }
    );
    return response.data;
  },
};

export default unitConversionService;
