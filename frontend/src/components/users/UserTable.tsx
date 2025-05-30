import React from 'react';
import { DataTable } from '../ui/DataTable';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '../../hooks/useTranslation';
import type { User } from '../../types/user';
import { 
  PencilIcon, 
  TrashIcon, 
  EllipsisVerticalIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  selectedUsers: (string | number)[];
  onSelectionChange: (selectedIds: (string | number)[]) => void;
  onEditUser: (user: User) => void;
  onRefresh: () => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  error,
  selectedUsers,
  onSelectionChange,
  onEditUser,
  onRefresh,
  pagination,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation();

  const columns = [
    {
      key: 'user',
      title: t('users.user'),
      render: (user: User) => (
        <div className="flex items-center space-x-3">
          <Avatar
            src={user.avatar}
            alt={`${user.first_name} ${user.last_name}`}
            size="sm"
            fallback={`${user.first_name[0]}${user.last_name[0]}`}
          />
          <div>
            <div className="font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-gray-500">
              {user.email}
            </div>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'name',
    },
    {
      key: 'role',
      title: t('users.role'),
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{user.role.display_name}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'department',
      title: t('users.department'),
      render: (user: User) => (
        <span className="text-sm text-gray-900">
          {user.department || '-'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      title: t('users.status'),
      render: (user: User) => (
        <Badge
          variant={user.is_active ? 'success' : 'error'}
          size="sm"
        >
          {user.is_active ? t('users.active') : t('users.inactive')}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'last_login',
      title: t('users.lastLogin'),
      render: (user: User) => (
        <span className="text-sm text-gray-500">
          {user.last_login_at
            ? formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })
            : t('users.neverLoggedIn')
          }
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      title: t('common.actions'),
      render: (user: User) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditUser(user)}
            leftIcon={<PencilIcon className="h-4 w-4" />}
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
                label: t('users.viewProfile'),
                icon: <UserIcon className="h-4 w-4" />,
                onClick: () => console.log('View profile', user.id),
              },
              {
                label: t('users.resetPassword'),
                icon: <ShieldCheckIcon className="h-4 w-4" />,
                onClick: () => console.log('Reset password', user.id),
              },
              { type: 'divider' },
              {
                label: user.is_active ? t('users.deactivate') : t('users.activate'),
                onClick: () => console.log('Toggle status', user.id),
                className: 'text-orange-600',
              },
              {
                label: t('common.delete'),
                icon: <TrashIcon className="h-4 w-4" />,
                onClick: () => console.log('Delete user', user.id),
                className: 'text-red-600',
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      loading={isLoading}
      error={error}
      selectable
      selectedIds={selectedUsers}
      onSelectionChange={onSelectionChange}
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRefresh={onRefresh}
      emptyState={{
        icon: <UsersIcon className="h-12 w-12 text-gray-400" />,
        title: t('users.noUsersFound'),
        description: t('users.noUsersDescription'),
        action: (
          <Button variant="primary" onClick={() => console.log('Add user')}>
            {t('users.addFirstUser')}
          </Button>
        ),
      }}
    />
  );
};
