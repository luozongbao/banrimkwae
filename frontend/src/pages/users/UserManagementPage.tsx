import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserTable } from '../../components/users/UserTable';
import { UserFilters } from '../../components/users/UserFilters';
import { AddUserModal } from '../../components/users/AddUserModal';
import { EditUserModal } from '../../components/users/EditUserModal';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { useUsers } from '../../hooks/useUsers';
import { useTranslation } from '../../hooks/useTranslation';
import type { User, UserFilters as UserFiltersType } from '../../types/user';
import { 
  PlusIcon, 
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  UsersIcon 
} from '@heroicons/react/24/outline';

export const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const [filters, setFilters] = useState<UserFiltersType>({
    search: searchParams.get('search') || '',
    role: searchParams.get('role') || '',
    status: searchParams.get('status') || '',
    department: searchParams.get('department') || '',
  });

  const [pagination, setPagination] = useState({
    page: Number(searchParams.get('page')) || 1,
    per_page: Number(searchParams.get('per_page')) || 10,
  });

  const {
    users,
    total,
    isLoading,
    error,
    refetch,
    exportUsers,
    bulkUpdateUsers,
  } = useUsers({ ...filters, ...pagination });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    setSearchParams(params);
  }, [filters, pagination, setSearchParams]);

  const handleFilterChange = (newFilters: Partial<UserFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (per_page: number) => {
    setPagination({ page: 1, per_page });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUserUpdated = () => {
    refetch();
    setEditingUser(null);
  };

  const handleUserCreated = () => {
    refetch();
    setIsAddModalOpen(false);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      await bulkUpdateUsers(selectedUsers, action);
      setSelectedUsers([]);
      refetch();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportUsers(filters);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const pageHeaderActions = (
    <div className="flex items-center space-x-3">
      {selectedUsers.length > 0 && (
        <div className="flex items-center space-x-2 mr-4">
          <span className="text-sm text-gray-600">
            {t('users.selectedCount', { count: selectedUsers.length })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('activate')}
          >
            {t('users.activate')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('deactivate')}
          >
            {t('users.deactivate')}
          </Button>
        </div>
      )}
      
      <Button
        variant="outline"
        onClick={handleExport}
        leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
      >
        {t('common.export')}
      </Button>
      
      <Button
        variant="outline"
        leftIcon={<DocumentArrowUpIcon className="h-4 w-4" />}
      >
        {t('common.import')}
      </Button>
      
      <Button
        variant="primary"
        onClick={() => setIsAddModalOpen(true)}
        leftIcon={<PlusIcon className="h-4 w-4" />}
      >
        {t('users.addNewUser')}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('users.userManagement')}
        description={t('users.manageSystemUsers')}
        icon={<UsersIcon className="h-6 w-6" />}
        actions={pageHeaderActions}
      />

      <UserFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
        totalCount={total}
      />

      <UserTable
        users={users}
        isLoading={isLoading}
        error={error}
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
        onEditUser={handleEditUser}
        onRefresh={refetch}
        pagination={{
          current: pagination.page,
          pageSize: pagination.per_page,
          total,
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={true}
          onClose={() => setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
};
