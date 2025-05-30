import React from 'react';
import { DataTable } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { ProgressBar } from '../ui/ProgressBar';
import { useTranslation } from '../../hooks/useTranslation';
import { Role } from '../../types/role';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  ShieldCheckIcon,
  UsersIcon 
} from '@heroicons/react/24/outline';

interface RoleTableProps {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  selectedRoles: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  onEditRole: (role: Role) => void;
  onPreviewRole: (role: Role) => void;
  onDuplicateRole: (role: Role) => void;
  onRefresh: () => void;
}

export const RoleTable: React.FC<RoleTableProps> = ({
  roles,
  isLoading,
  error,
  selectedRoles,
  onSelectionChange,
  onEditRole,
  onPreviewRole,
  onDuplicateRole,
  onRefresh,
}) => {
  const { t } = useTranslation();

  const getPermissionCoverage = (role: Role) => {
    const totalPermissions = 50; // Total available permissions
    const rolePermissions = role.permissions.length;
    return Math.round((rolePermissions / totalPermissions) * 100);
  };

  const getRoleTypeColor = (role: Role) => {
    if (role.is_system_role) return 'primary';
    if (role.permissions.length > 30) return 'warning';
    if (role.permissions.length > 15) return 'info';
    return 'default';
  };

  const columns = [
    {
      key: 'role',
      title: t('roles.role'),
      render: (role: Role) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-resort-blue-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-5 w-5 text-resort-blue-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{role.display_name}</span>
              {role.is_system_role && (
                <Badge variant="primary" size="xs">
                  {t('roles.system')}
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {role.description || t('roles.noDescription')}
            </div>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'display_name',
    },
    {
      key: 'permissions',
      title: t('roles.permissions'),
      render: (role: Role) => {
        const coverage = getPermissionCoverage(role);
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {role.permissions.length} {t('roles.permissions')}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {coverage}%
              </span>
            </div>
            <ProgressBar
              value={coverage}
              max={100}
              size="sm"
              color={coverage > 70 ? 'warning' : coverage > 40 ? 'info' : 'success'}
            />
          </div>
        );
      },
      sortable: true,
      sortKey: 'permissions_count',
    },
    {
      key: 'users',
      title: t('roles.users'),
      render: (role: Role) => (
        <div className="flex items-center space-x-2">
          <UsersIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {role.users_count || 0}
          </span>
          <span className="text-sm text-gray-500">
            {t('roles.usersAssigned')}
          </span>
        </div>
      ),
      sortable: true,
      sortKey: 'users_count',
    },
    {
      key: 'type',
      title: t('roles.type'),
      render: (role: Role) => (
        <Badge
          variant={getRoleTypeColor(role)}
          size="sm"
        >
          {role.is_system_role ? t('roles.systemRole') : t('roles.customRole')}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      title: t('common.actions'),
      render: (role: Role) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreviewRole(role)}
            leftIcon={<EyeIcon className="h-4 w-4" />}
          >
            {t('common.view')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditRole(role)}
            leftIcon={<PencilIcon className="h-4 w-4" />}
            disabled={role.is_system_role}
          >
            {t('common.edit')}
          </Button>
          
          <Dropdown
            trigger={
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<EllipsisVerticalIcon className="h-4 w-4" />}
              />
            }
            items={[
              {
                label: t('roles.duplicate'),
                icon: <DocumentDuplicateIcon className="h-4 w-4" />,
                onClick: () => onDuplicateRole(role),
              },
              {
                label: t('roles.viewUsers'),
                icon: <UsersIcon className="h-4 w-4" />,
                onClick: () => console.log('View users', role.id),
              },
              { type: 'divider' },
              {
                label: t('common.delete'),
                icon: <TrashIcon className="h-4 w-4" />,
                onClick: () => console.log('Delete role', role.id),
                className: 'text-red-600',
                disabled: role.is_system_role || (role.users_count || 0) > 0,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={roles}
      columns={columns}
      loading={isLoading}
      error={error}
      selectable
      selectedIds={selectedRoles}
      onSelectionChange={onSelectionChange}
      onRefresh={onRefresh}
      emptyState={{
        icon: <ShieldCheckIcon className="h-12 w-12 text-gray-400" />,
        title: t('roles.noRolesFound'),
        description: t('roles.noRolesDescription'),
        action: (
          <Button variant="primary" onClick={() => console.log('Create role')}>
            {t('roles.createFirstRole')}
          </Button>
        ),
      }}
    />
  );
};
