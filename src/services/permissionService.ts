import Api from './baseHttp';
import { API_ENDPOINTS } from '../config/api';
import type { ResultMessage } from '../types';

export interface PermissionFunction {
  key: string;
  name: string;
  actions: PermissionAction[];
}

export interface PermissionAction {
  method?: string; // "Xem", "Thêm", "Sửa", "Xóa", etc.
  key: string;
  patchRequire?: string[];
}

export interface PermissionModel {
  key: string;
  name: string;
  functions?: PermissionFunction[];
  actions?: PermissionAction[];
}

export const permissionService = {
  // Get all permissions
  getAllPermissions: async (): Promise<PermissionModel[]> => {
    const response = await Api.get<ResultMessage<PermissionModel[]>>(API_ENDPOINTS.PERMISSION_LIST);
    return response.data.result || [];
  },

  // Extract all permission keys from permission structure
  getAllPermissionKeys: async (): Promise<string[]> => {
    try {
      const permissions = await permissionService.getAllPermissions();
      const keys: string[] = [];
      
      permissions.forEach((module) => {
        // Extract actions at permission level
        if (module.actions) {
          module.actions.forEach((action) => {
            if (action.key) {
              keys.push(action.key);
            }
          });
        }
        
        // Extract actions from functions
        if (module.functions) {
          module.functions.forEach((func) => {
            if (func.actions) {
              func.actions.forEach((action) => {
                if (action.key) {
                  keys.push(action.key);
                }
              });
            }
          });
        }
      });
      
      return [...new Set(keys)].sort(); // Remove duplicates and sort
    } catch (err) {
      console.error('Error extracting permission keys:', err);
      return [];
    }
  },
};

