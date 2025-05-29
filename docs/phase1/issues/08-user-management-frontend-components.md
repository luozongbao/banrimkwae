# Issue #08: User Management Frontend Components

## Priority: High
## Estimated Time: 24-28 hours
## Dependencies: Issues #06, #07

## Description
Implement the complete user management frontend interface including user list, create/edit user forms, user profile management, and search/filter functionality. This issue covers all user management wireframes and interactions.

## Acceptance Criteria
- [ ] Responsive user management dashboard with data table
- [ ] Advanced search and filtering capabilities
- [ ] Add new user modal/form with file upload
- [ ] Edit user functionality with pre-populated data
- [ ] User profile page with avatar management
- [ ] Bulk operations (export users, bulk actions)
- [ ] Real-time status updates
- [ ] Pagination with configurable page sizes
- [ ] Sort functionality for all columns
- [ ] Role assignment and permission preview
- [ ] User activity logs display
- [ ] Proper form validation and error handling

## Implementation Details

### 1. User Management Dashboard Page

Create `src/pages/users/UserManagementPage.tsx`:
```tsx
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
import { User, UserFilters as UserFiltersType } from '../../types/user';
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
```

### 2. User Table Component

Create `src/components/users/UserTable.tsx`:
```tsx
import React from 'react';
import { DataTable } from '../ui/DataTable';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '../../hooks/useTranslation';
import { User } from '../../types/user';
import { 
  PencilIcon, 
  TrashIcon, 
  EllipsisVerticalIcon,
  ShieldCheckIcon,
  UserIcon 
} from '@heroicons/react/24/outline';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  selectedUsers: number[];
  onSelectionChange: (selectedIds: number[]) => void;
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
```

### 3. User Filters Component

Create `src/components/users/UserFilters.tsx`:
```tsx
import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useRoles } from '../../hooks/useRoles';
import { useDepartments } from '../../hooks/useDepartments';
import { useTranslation } from '../../hooks/useTranslation';
import { UserFilters as UserFiltersType } from '../../types/user';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: Partial<UserFiltersType>) => void;
  totalCount: number;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCount,
}) => {
  const { t } = useTranslation();
  const { roles } = useRoles();
  const { departments } = useDepartments();

  const handleFilterChange = (key: keyof UserFiltersType, value: string) => {
    onFiltersChange({ [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      role: '',
      status: '',
      department: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const roleOptions = [
    { value: '', label: t('users.allRoles') },
    ...roles.map(role => ({
      value: String(role.id),
      label: role.display_name,
    })),
  ];

  const statusOptions = [
    { value: '', label: t('users.allStatuses') },
    { value: 'active', label: t('users.active') },
    { value: 'inactive', label: t('users.inactive') },
  ];

  const departmentOptions = [
    { value: '', label: t('users.allDepartments') },
    ...departments.map(dept => ({
      value: dept.id,
      label: dept.name,
    })),
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
          <div className="relative">
            <Input
              placeholder={t('users.searchPlaceholder')}
              value={filters.search}
              onChange={(value) => handleFilterChange('search', value)}
              leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
              className="w-full sm:w-80"
            />
          </div>

          <Select
            value={filters.role}
            onChange={(value) => handleFilterChange('role', value)}
            options={roleOptions}
            placeholder={t('users.filterByRole')}
            className="w-full sm:w-40"
          />

          <Select
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            options={statusOptions}
            placeholder={t('users.filterByStatus')}
            className="w-full sm:w-40"
          />

          <Select
            value={filters.department}
            onChange={(value) => handleFilterChange('department', value)}
            options={departmentOptions}
            placeholder={t('users.filterByDepartment')}
            className="w-full sm:w-48"
          />

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              leftIcon={<XMarkIcon className="h-4 w-4" />}
            >
              {t('common.clearFilters')}
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-600">
          {t('users.totalUsers', { count: totalCount })}
        </div>
      </div>
    </div>
  );
};
```

### 4. Add User Modal Component

Create `src/components/users/AddUserModal.tsx`:
```tsx
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { UserForm } from './UserForm';
import { useCreateUser } from '../../hooks/useUsers';
import { useTranslation } from '../../hooks/useTranslation';
import { CreateUserData } from '../../types/user';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const { t } = useTranslation();
  const { createUser, isLoading } = useCreateUser();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateUserData) => {
    try {
      setError(null);
      await createUser(data);
      onUserCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || t('users.createError'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('users.addNewUser')}
      size="lg"
    >
      <UserForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
        error={error}
        submitButtonText={t('users.createUser')}
      />
    </Modal>
  );
};
```

### 5. User Form Component

Create `src/components/users/UserForm.tsx`:
```tsx
import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';
import { Alert } from '../ui/Alert';
import { useRoles } from '../../hooks/useRoles';
import { useDepartments } from '../../hooks/useDepartments';
import { useTranslation } from '../../hooks/useTranslation';
import { CreateUserData, User } from '../../types/user';
import { generatePassword } from '../../utils/password';

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserData) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
  submitButtonText: string;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading,
  error,
  submitButtonText,
}) => {
  const { t } = useTranslation();
  const { roles } = useRoles();
  const { departments } = useDepartments();

  const [formData, setFormData] = useState<CreateUserData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    username: user?.username || '',
    password: '',
    password_confirmation: '',
    role_id: user?.role.id || 0,
    department_id: user?.department_id || 0,
    position: user?.position || '',
    start_date: user?.start_date || '',
    avatar: null,
    is_active: user?.is_active ?? true,
    send_welcome_email: true,
    require_password_change: !user,
    expires_at: user?.expires_at || '',
    email_notifications: user?.email_notifications ?? true,
    sms_notifications: user?.sms_notifications ?? true,
    push_notifications: user?.push_notifications ?? false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateUserData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({
      ...prev,
      password: newPassword,
      password_confirmation: newPassword,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = t('validation.required', { field: t('users.firstName') });
    }

    if (!formData.last_name.trim()) {
      errors.last_name = t('validation.required', { field: t('users.lastName') });
    }

    if (!formData.email.trim()) {
      errors.email = t('validation.required', { field: t('users.email') });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('validation.invalidEmail');
    }

    if (!user && !formData.password) {
      errors.password = t('validation.required', { field: t('users.password') });
    } else if (formData.password && formData.password.length < 8) {
      errors.password = t('validation.minLength', { field: t('users.password'), length: 8 });
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      errors.password_confirmation = t('validation.passwordMismatch');
    }

    if (!formData.role_id) {
      errors.role_id = t('validation.required', { field: t('users.role') });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit(formData);
  };

  const roleOptions = roles.map(role => ({
    value: String(role.id),
    label: role.display_name,
  }));

  const departmentOptions = [
    { value: '', label: t('users.selectDepartment') },
    ...departments.map(dept => ({
      value: String(dept.id),
      label: dept.name,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
        />
      )}

      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('users.personalInformation')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FileUpload
              label={t('users.profilePhoto')}
              accept="image/*"
              onChange={(file) => handleInputChange('avatar', file)}
              preview={user?.avatar}
              className="mb-4"
            />
          </div>

          <Input
            label={t('users.firstName')}
            value={formData.first_name}
            onChange={(value) => handleInputChange('first_name', value)}
            error={validationErrors.first_name}
            required
          />

          <Input
            label={t('users.lastName')}
            value={formData.last_name}
            onChange={(value) => handleInputChange('last_name', value)}
            error={validationErrors.last_name}
            required
          />

          <Input
            label={t('users.email')}
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            error={validationErrors.email}
            required
          />

          <Input
            label={t('users.phone')}
            type="tel"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            error={validationErrors.phone}
          />
        </div>
      </div>

      {/* Account Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('users.accountInformation')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t('users.username')}
            value={formData.username}
            onChange={(value) => handleInputChange('username', value)}
            error={validationErrors.username}
          />

          <div className="space-y-4">
            <div className="flex items-end space-x-2">
              <Input
                label={t('users.password')}
                type="password"
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                error={validationErrors.password}
                required={!user}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePassword}
                className="whitespace-nowrap"
              >
                {t('users.generateRandom')}
              </Button>
            </div>

            <Input
              label={t('users.confirmPassword')}
              type="password"
              value={formData.password_confirmation}
              onChange={(value) => handleInputChange('password_confirmation', value)}
              error={validationErrors.password_confirmation}
              required={!!formData.password}
            />
          </div>
        </div>
      </div>

      {/* Role & Permissions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('users.roleAndPermissions')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t('users.primaryRole')}
            value={String(formData.role_id)}
            onChange={(value) => handleInputChange('role_id', Number(value))}
            options={roleOptions}
            error={validationErrors.role_id}
            required
          />

          <Select
            label={t('users.department')}
            value={String(formData.department_id)}
            onChange={(value) => handleInputChange('department_id', Number(value))}
            options={departmentOptions}
          />

          <Input
            label={t('users.position')}
            value={formData.position}
            onChange={(value) => handleInputChange('position', value)}
          />

          <Input
            label={t('users.startDate')}
            type="date"
            value={formData.start_date}
            onChange={(value) => handleInputChange('start_date', value)}
          />
        </div>
      </div>

      {/* Additional Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('users.additionalSettings')}
        </h3>
        
        <div className="space-y-4">
          {!user && (
            <>
              <Checkbox
                checked={formData.send_welcome_email}
                onChange={(checked) => handleInputChange('send_welcome_email', checked)}
                label={t('users.sendWelcomeEmail')}
              />
              
              <Checkbox
                checked={formData.require_password_change}
                onChange={(checked) => handleInputChange('require_password_change', checked)}
                label={t('users.requirePasswordChange')}
              />
            </>
          )}

          <div className="flex items-center space-x-4">
            <Checkbox
              checked={formData.is_active}
              onChange={(checked) => handleInputChange('is_active', checked)}
              label={t('users.accountActive')}
            />
            
            <Input
              label={t('users.accountExpires')}
              type="date"
              value={formData.expires_at}
              onChange={(value) => handleInputChange('expires_at', value)}
              className="w-48"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('users.notifications')}
        </h3>
        
        <div className="space-y-4">
          <Checkbox
            checked={formData.email_notifications}
            onChange={(checked) => handleInputChange('email_notifications', checked)}
            label={t('users.emailNotifications')}
          />
          
          <Checkbox
            checked={formData.sms_notifications}
            onChange={(checked) => handleInputChange('sms_notifications', checked)}
            label={t('users.smsNotifications')}
          />
          
          <Checkbox
            checked={formData.push_notifications}
            onChange={(checked) => handleInputChange('push_notifications', checked)}
            label={t('users.pushNotifications')}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('common.cancel')}
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};
```

### 6. User Profile Page

Create `src/pages/users/UserProfilePage.tsx`:
```tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProfileForm } from '../../components/users/ProfileForm';
import { PasswordChangeForm } from '../../components/users/PasswordChangeForm';
import { ActivityLog } from '../../components/users/ActivityLog';
import { useUser } from '../../hooks/useUsers';
import { useTranslation } from '../../hooks/useTranslation';
import { formatDistanceToNow } from 'date-fns';
import { 
  UserIcon,
  PencilIcon,
  ShieldCheckIcon,
  ClockIcon,
  BellIcon 
} from '@heroicons/react/24/outline';

export const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user, isLoading, refetch } = useUser(Number(id));
  const [activeTab, setActiveTab] = useState('profile');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const tabs = [
    { key: 'profile', label: t('users.profile'), icon: <UserIcon className="h-4 w-4" /> },
    { key: 'security', label: t('users.security'), icon: <ShieldCheckIcon className="h-4 w-4" /> },
    { key: 'activity', label: t('users.activity'), icon: <ClockIcon className="h-4 w-4" /> },
    { key: 'notifications', label: t('users.notifications'), icon: <BellIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.first_name} ${user.last_name}`}
        description={user.email}
        icon={<UserIcon className="h-6 w-6" />}
        actions={
          <Button
            variant="primary"
            leftIcon={<PencilIcon className="h-4 w-4" />}
          >
            {t('common.edit')}
          </Button>
        }
      />

      {/* User Overview Card */}
      <Card className="p-6">
        <div className="flex items-center space-x-6">
          <Avatar
            src={user.avatar}
            alt={`${user.first_name} ${user.last_name}`}
            size="xl"
            fallback={`${user.first_name[0]}${user.last_name[0]}`}
          />
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-gray-600">{user.position}</p>
            
            <div className="flex items-center space-x-4 mt-4">
              <Badge
                variant={user.is_active ? 'success' : 'error'}
                size="sm"
              >
                {user.is_active ? t('users.active') : t('users.inactive')}
              </Badge>
              
              <span className="text-sm text-gray-500">
                {user.role.display_name}
              </span>
              
              <span className="text-sm text-gray-500">
                {user.department}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {t('users.lastLogin')}
            </div>
            <div className="text-sm text-gray-900">
              {user.last_login_at
                ? formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })
                : t('users.neverLoggedIn')
              }
            </div>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-resort-blue-500 text-resort-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <ProfileForm user={user} onUpdate={refetch} />
        )}
        
        {activeTab === 'security' && (
          <PasswordChangeForm userId={user.id} />
        )}
        
        {activeTab === 'activity' && (
          <ActivityLog userId={user.id} />
        )}
        
        {activeTab === 'notifications' && (
          <div>Notification settings coming soon...</div>
        )}
      </div>
    </div>
  );
};
```

### 7. Custom Hooks for User Management

Create `src/hooks/useUsers.ts`:
```tsx
import { useState, useEffect } from 'react';
import { usersAPI } from '../services/usersAPI';
import { User, UserFilters, CreateUserData } from '../types/user';

export const useUsers = (filters: UserFilters & { page: number; per_page: number }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await usersAPI.getUsers(filters);
      setUsers(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [JSON.stringify(filters)]);

  const exportUsers = async (exportFilters: UserFilters) => {
    try {
      await usersAPI.exportUsers(exportFilters);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Export failed');
    }
  };

  const bulkUpdateUsers = async (userIds: number[], action: string) => {
    try {
      await usersAPI.bulkUpdate(userIds, action);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Bulk update failed');
    }
  };

  return {
    users,
    total,
    isLoading,
    error,
    refetch: fetchUsers,
    exportUsers,
    bulkUpdateUsers,
  };
};

export const useCreateUser = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (userData: CreateUserData) => {
    setIsLoading(true);
    try {
      const response = await usersAPI.createUser(userData);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, isLoading };
};

export const useUser = (id: number) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await usersAPI.getUser(id);
      setUser(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUser,
  };
};
```

## Testing Criteria
- [ ] User list loads and displays correctly
- [ ] Search and filtering functionality works
- [ ] Pagination works correctly
- [ ] Add user form validates properly
- [ ] Edit user form pre-populates data
- [ ] File upload for avatar works
- [ ] Bulk operations function correctly
- [ ] User profile page displays all information
- [ ] Responsive design works on all screen sizes
- [ ] Loading and error states display appropriately

## Related Issues
- **Depends on**: Issue #06 (Frontend Design System), Issue #07 (Frontend Authentication)
- **Blocks**: Issue #10 (Dashboard Implementation)

## Notes
- Ensure proper accessibility features for tables and forms
- Implement proper error handling for all operations
- Add proper loading states for better user experience
- Consider implementing virtual scrolling for large user lists
- Ensure all form validations match backend requirements
