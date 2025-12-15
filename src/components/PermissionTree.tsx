import { useState, useEffect } from 'react';
import { Checkbox, Button, Space } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import type { PermissionModel, PermissionFunction } from '../services/permissionService';

interface PermissionTreeProps {
  permissions: PermissionModel[];
  selectedKeys: string[];
  onChange: (selectedKeys: string[]) => void;
}

const PermissionTree = ({ permissions, selectedKeys, onChange }: PermissionTreeProps) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // Initialize: expand all modules
  useEffect(() => {
    if (permissions.length > 0 && expandedKeys.length === 0) {
      setExpandedKeys(permissions.map(p => p.key));
    }
  }, [permissions]);

  // Get all action keys for a function
  const getFunctionActionKeys = (module: PermissionModel, func: PermissionFunction): string[] => {
    return func.actions?.map(action => action.key).filter(Boolean) || [];
  };

  // Get all action keys for a module (from functions)
  const getModuleActionKeys = (module: PermissionModel): string[] => {
    const keys: string[] = [];
    if (module.functions) {
      module.functions.forEach(func => {
        func.actions?.forEach(action => {
          if (action.key) {
            keys.push(action.key);
          }
        });
      });
    }
    if (module.actions) {
      module.actions.forEach(action => {
        if (action.key) {
          keys.push(action.key);
        }
      });
    }
    return keys;
  };

  // Check if all actions in a function are selected
  const isFunctionAllSelected = (module: PermissionModel, func: PermissionFunction): boolean => {
    const actionKeys = getFunctionActionKeys(module, func);
    if (actionKeys.length === 0) return false;
    return actionKeys.every(key => selectedKeys.includes(key));
  };

  // Check if some (but not all) actions in a function are selected
  const isFunctionIndeterminate = (module: PermissionModel, func: PermissionFunction): boolean => {
    const actionKeys = getFunctionActionKeys(module, func);
    if (actionKeys.length === 0) return false;
    const selectedCount = actionKeys.filter(key => selectedKeys.includes(key)).length;
    return selectedCount > 0 && selectedCount < actionKeys.length;
  };

  // Check if all actions in a module are selected
  const isModuleAllSelected = (module: PermissionModel): boolean => {
    const actionKeys = getModuleActionKeys(module);
    if (actionKeys.length === 0) return false;
    return actionKeys.every(key => selectedKeys.includes(key));
  };

  // Check if some (but not all) actions in a module are selected
  const isModuleIndeterminate = (module: PermissionModel): boolean => {
    const actionKeys = getModuleActionKeys(module);
    if (actionKeys.length === 0) return false;
    const selectedCount = actionKeys.filter(key => selectedKeys.includes(key)).length;
    return selectedCount > 0 && selectedCount < actionKeys.length;
  };

  // Handle function checkbox change
  const handleFunctionChange = (module: PermissionModel, func: PermissionFunction, checked: boolean) => {
    const actionKeys = getFunctionActionKeys(module, func);
    if (checked) {
      // Add all action keys
      onChange([...new Set([...selectedKeys, ...actionKeys])]);
    } else {
      // Remove all action keys
      onChange(selectedKeys.filter(key => !actionKeys.includes(key)));
    }
  };

  // Handle module "Select All" click
  const handleModuleSelectAll = (module: PermissionModel) => {
    const actionKeys = getModuleActionKeys(module);
    const isAllSelected = isModuleAllSelected(module);
    
    if (isAllSelected) {
      // Deselect all
      onChange(selectedKeys.filter(key => !actionKeys.includes(key)));
    } else {
      // Select all
      onChange([...new Set([...selectedKeys, ...actionKeys])]);
    }
  };

  // Handle function "Select All" click
  const handleFunctionSelectAll = (module: PermissionModel, func: PermissionFunction) => {
    const actionKeys = getFunctionActionKeys(module, func);
    const isAllSelected = isFunctionAllSelected(module, func);
    
    if (isAllSelected) {
      // Deselect all
      onChange(selectedKeys.filter(key => !actionKeys.includes(key)));
    } else {
      // Select all
      onChange([...new Set([...selectedKeys, ...actionKeys])]);
    }
  };

  // Handle individual action checkbox change
  const handleActionChange = (actionKey: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedKeys, actionKey]);
    } else {
      onChange(selectedKeys.filter(key => key !== actionKey));
    }
  };

  return (
    <div className="permission-tree">
      {permissions.map((module) => (
        <div key={module.key} className="mb-2 border border-gray-200 rounded-lg">
          {/* Module Header */}
          <div 
            className="flex items-center justify-between p-2 bg-gray-50 cursor-pointer"
            onClick={() => {
              if (expandedKeys.includes(module.key)) {
                setExpandedKeys(expandedKeys.filter(k => k !== module.key));
              } else {
                setExpandedKeys([...expandedKeys, module.key]);
              }
            }}
          >
            <Space>
              {expandedKeys.includes(module.key) ? (
                <DownOutlined className="text-gray-500" />
              ) : (
                <RightOutlined className="text-gray-500" />
              )}
              <span className="font-semibold text-base">{module.name}</span>
            </Space>
            <Button
              type="link"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleModuleSelectAll(module);
              }}
              style={{ padding: 0, color: '#1890ff' }}
            >
              Chọn tất cả
            </Button>
          </div>

          {/* Module Content */}
          {expandedKeys.includes(module.key) && (
            <div className="p-2">
              {module.functions && module.functions.length > 0 ? (
                module.functions.map((func) => (
                  <div key={func.key} className="mb-2 last:mb-0">
                    {/* Function Header */}
                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-gray-100">
                      <span className="font-medium text-sm text-gray-700">{func.name}</span>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleFunctionSelectAll(module, func)}
                        style={{ padding: 0, fontSize: '12px', color: '#1890ff' }}
                      >
                        Chọn tất cả
                      </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {func.actions?.map((action) => (
                        <Checkbox
                          key={action.key}
                          checked={selectedKeys.includes(action.key)}
                          onChange={(e) => handleActionChange(action.key, e.target.checked)}
                        >
                          <span className="text-sm">{action.method || action.key}</span>
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">Không có quyền nào</div>
              )}

              {/* Module-level actions (if any) */}
              {module.actions && module.actions.length > 0 && (
                <div className="mb-2 mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-1 pb-1 border-b border-gray-100">
                    <span className="font-medium text-sm text-gray-700">Quyền chung</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {module.actions.map((action) => (
                      <Checkbox
                        key={action.key}
                        checked={selectedKeys.includes(action.key)}
                        onChange={(e) => handleActionChange(action.key, e.target.checked)}
                      >
                        <span className="text-sm">{action.method || action.key}</span>
                      </Checkbox>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PermissionTree;

