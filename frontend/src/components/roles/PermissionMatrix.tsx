import React from 'react';
import { Checkbox } from '../ui/Checkbox';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { useTranslation } from '../../hooks/useTranslation';
import { Permission, PermissionGroup } from '../../types/role';
import { 
  InformationCircleIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface PermissionMatrixProps {
  permissions: Permission[];
  permissionGroups: PermissionGroup[];
  selectedPermissions: number[];
  onPermissionToggle: (permissionId: number) => void;
  onGroupToggle: (groupPermissions: Permission[], allSelected: boolean) => void;
  showGroupFilter: boolean;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  permissions,
  permissionGroups,
  selectedPermissions,
  onPermissionToggle,
  onGroupToggle,
  showGroupFilter,
}) => {
  const { t } = useTranslation();

  const getPermissionsByGroup = (groupKey: string) => {
    return permissions.filter(p => p.group === groupKey);
  };

  const isGroupFullySelected = (groupPermissions: Permission[]) => {
    return groupPermissions.every(p => selectedPermissions.includes(p.id));
  };

  const isGroupPartiallySelected = (groupPermissions: Permission[]) => {
    const selectedInGroup = groupPermissions.filter(p => selectedPermissions.includes(p.id));
    return selectedInGroup.length > 0 && selectedInGroup.length < groupPermissions.length;
  };

  const getPermissionIcon = (permission: Permission) => {
    if (permission.is_dangerous) {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    }
    if (permission.requires_confirmation) {
      return <ShieldExclamationIcon className="h-4 w-4 text-orange-500" />;
    }
    return null;
  };

  const getPermissionBadge = (permission: Permission) => {
    if (permission.is_dangerous) {
      return <Badge variant="error" size="xs">{t('roles.dangerous')}</Badge>;
    }
    if (permission.requires_confirmation) {
      return <Badge variant="warning" size="xs">{t('roles.requiresConfirmation')}</Badge>;
    }
    return null;
  };

  if (!showGroupFilter) {
    // Simple list view when filtering by specific group
    return (
      <div className="space-y-2">
        {permissions.map((permission) => (
          <div
            key={permission.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={selectedPermissions.includes(permission.id)}
                onChange={() => onPermissionToggle(permission.id)}
              />
              <div className="flex items-center space-x-2">
                {getPermissionIcon(permission)}
                <span className="font-medium text-gray-900">
                  {permission.display_name}
                </span>
                {getPermissionBadge(permission)}
              </div>
            </div>
            
            {permission.description && (
              <Tooltip content={permission.description}>
                <InformationCircleIcon className="h-4 w-4 text-gray-400" />
              </Tooltip>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Grouped view
  return (
    <div className="space-y-6">
      {permissionGroups.map((group) => {
        const groupPermissions = getPermissionsByGroup(group.key);
        
        if (groupPermissions.length === 0) return null;

        const isFullySelected = isGroupFullySelected(groupPermissions);
        const isPartiallySelected = isGroupPartiallySelected(groupPermissions);

        return (
          <Card key={group.key} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={isFullySelected}
                  indeterminate={isPartiallySelected}
                  onChange={() => onGroupToggle(groupPermissions, isFullySelected)}
                />
                <div>
                  <h4 className="font-medium text-gray-900">{group.name}</h4>
                  {group.description && (
                    <p className="text-sm text-gray-500">{group.description}</p>
                  )}
                </div>
              </div>
              
              <Badge variant="default" size="sm">
                {groupPermissions.filter(p => selectedPermissions.includes(p.id)).length} / {groupPermissions.length}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groupPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <Checkbox
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => onPermissionToggle(permission.id)}
                    />
                    <div className="flex items-center space-x-2 flex-1">
                      {getPermissionIcon(permission)}
                      <span className="text-sm font-medium text-gray-900">
                        {permission.display_name}
                      </span>
                      {getPermissionBadge(permission)}
                    </div>
                  </div>
                  
                  {permission.description && (
                    <Tooltip content={permission.description}>
                      <InformationCircleIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
