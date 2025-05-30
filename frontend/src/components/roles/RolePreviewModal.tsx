import React from 'react';
import { Modal } from '../ui/Modal';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { Role } from '../../types/role';
import { 
  ShieldCheckIcon,
  UsersIcon,
  ClockIcon,
  PencilIcon 
} from '@heroicons/react/24/outline';

interface RolePreviewModalProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const RolePreviewModal: React.FC<RolePreviewModalProps> = ({
  role,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { t } = useTranslation();

  const groupedPermissions = role.permissions.reduce((groups, permission) => {
    const group = permission.group || 'other';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(permission);
    return groups;
  }, {} as Record<string, typeof role.permissions>);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role.display_name}
      size="lg"
      actions={
        !role.is_system_role && onEdit ? (
          <Button
            variant="primary"
            onClick={onEdit}
            leftIcon={<PencilIcon className="h-4 w-4" />}
          >
            {t('common.edit')}
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {/* Role Overview */}
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-resort-blue-100 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 text-resort-blue-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {role.display_name}
                </h3>
                {role.is_system_role && (
                  <Badge variant="primary" size="sm">
                    {t('roles.system')}
                  </Badge>
                )}
              </div>
              
              {role.description && (
                <p className="text-gray-600 mb-4">{role.description}</p>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <UsersIcon className="h-4 w-4" />
                  <span>{role.users_count || 0} {t('roles.usersAssigned')}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>{role.permissions.length} {t('roles.permissions')}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{t('common.createdAt')}: {new Date(role.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Permissions by Group */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            {t('roles.permissions')} ({role.permissions.length})
          </h4>
          
          {Object.entries(groupedPermissions).map(([groupKey, permissions]) => (
            <Card key={groupKey} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900 capitalize">
                  {groupKey.replace('_', ' ')}
                </h5>
                <Badge variant="default" size="sm">
                  {permissions.length}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      {permission.display_name}
                    </span>
                    {permission.is_dangerous && (
                      <Badge variant="error" size="xs">
                        {t('roles.dangerous')}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
          
          {role.permissions.length === 0 && (
            <Card className="p-8 text-center">
              <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('roles.noPermissionsAssigned')}</p>
            </Card>
          )}
        </div>

        {/* Assigned Users Preview */}
        {(role.users_count || 0) > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">
                {t('roles.assignedUsers')}
              </h5>
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('View all users')}
              >
                {t('roles.viewAllUsers')}
              </Button>
            </div>
            
            <p className="text-sm text-gray-600">
              {t('roles.usersWithThisRole', { count: role.users_count })}
            </p>
          </Card>
        )}
      </div>
    </Modal>
  );
};
