# Issue #09: Role Management Frontend Interface

## Priority: High
## Estimated Time: 18-22 hours
## Dependencies: Issues #06, #07, #08

## Description
Implement the complete role management frontend interface including role dashboard, create/edit role modals, permission management, and role assignment features. This issue covers the role management wireframes and complex permission system interactions.

## Acceptance Criteria
- [ ] Role management dashboard with searchable table
- [ ] Create new role modal with permission matrix
- [ ] Edit role functionality with existing permissions
- [ ] Permission grouping and hierarchical display
- [ ] Role assignment to users interface
- [ ] Role usage statistics and user count
- [ ] Permission dependency validation
- [ ] Role deletion with safety checks
- [ ] Bulk role operations
- [ ] Real-time permission preview
- [ ] Role templates for common setups
- [ ] Permission inheritance visualization

## Implementation Details

### 1. Role Management Dashboard Page

Create `src/pages/roles/RoleManagementPage.tsx`:
```tsx
import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { RoleTable } from '../../components/roles/RoleTable';
import { RoleFilters } from '../../components/roles/RoleFilters';
import { CreateRoleModal } from '../../components/roles/CreateRoleModal';
import { EditRoleModal } from '../../components/roles/EditRoleModal';
import { RolePreviewModal } from '../../components/roles/RolePreviewModal';
import { Button } from '../../components/ui/Button';
import { useRoles } from '../../hooks/useRoles';
import { useTranslation } from '../../hooks/useTranslation';
import { Role, RoleFilters as RoleFiltersType } from '../../types/role';
import { 
  PlusIcon, 
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

export const RoleManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [previewingRole, setPreviewingRole] = useState<Role | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const [filters, setFilters] = useState<RoleFiltersType>({
    search: '',
    permission_type: '',
    user_count: '',
  });

  const {
    roles,
    isLoading,
    error,
    refetch,
    duplicateRole,
    bulkDeleteRoles,
  } = useRoles(filters);

  const handleFilterChange = (newFilters: Partial<RoleFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
  };

  const handlePreviewRole = (role: Role) => {
    setPreviewingRole(role);
  };

  const handleDuplicateRole = async (role: Role) => {
    try {
      await duplicateRole(role.id);
      refetch();
    } catch (error) {
      console.error('Failed to duplicate role:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRoles.length === 0) return;
    
    if (window.confirm(t('roles.confirmBulkDelete', { count: selectedRoles.length }))) {
      try {
        await bulkDeleteRoles(selectedRoles);
        setSelectedRoles([]);
        refetch();
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
  };

  const pageHeaderActions = (
    <div className="flex items-center space-x-3">
      {selectedRoles.length > 0 && (
        <div className="flex items-center space-x-2 mr-4">
          <span className="text-sm text-gray-600">
            {t('roles.selectedCount', { count: selectedRoles.length })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDelete}
            className="text-red-600 hover:text-red-700"
          >
            {t('common.delete')}
          </Button>
        </div>
      )}
      
      <Button
        variant="outline"
        leftIcon={<Cog6ToothIcon className="h-4 w-4" />}
      >
        {t('roles.roleTemplates')}
      </Button>
      
      <Button
        variant="primary"
        onClick={() => setIsCreateModalOpen(true)}
        leftIcon={<PlusIcon className="h-4 w-4" />}
      >
        {t('roles.createNewRole')}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('roles.roleManagement')}
        description={t('roles.manageSystemRoles')}
        icon={<ShieldCheckIcon className="h-6 w-6" />}
        actions={pageHeaderActions}
      />

      <RoleFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
        totalCount={roles.length}
      />

      <RoleTable
        roles={roles}
        isLoading={isLoading}
        error={error}
        selectedRoles={selectedRoles}
        onSelectionChange={setSelectedRoles}
        onEditRole={handleEditRole}
        onPreviewRole={handlePreviewRole}
        onDuplicateRole={handleDuplicateRole}
        onRefresh={refetch}
      />

      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoleCreated={() => {
          refetch();
          setIsCreateModalOpen(false);
        }}
      />

      {editingRole && (
        <EditRoleModal
          role={editingRole}
          isOpen={true}
          onClose={() => setEditingRole(null)}
          onRoleUpdated={() => {
            refetch();
            setEditingRole(null);
          }}
        />
      )}

      {previewingRole && (
        <RolePreviewModal
          role={previewingRole}
          isOpen={true}
          onClose={() => setPreviewingRole(null)}
        />
      )}
    </div>
  );
};
```

### 2. Role Table Component

Create `src/components/roles/RoleTable.tsx`:
```tsx
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
```

### 3. Create/Edit Role Modal

Create `src/components/roles/CreateRoleModal.tsx`:
```tsx
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { RoleForm } from './RoleForm';
import { useCreateRole } from '../../hooks/useRoles';
import { useTranslation } from '../../hooks/useTranslation';
import { CreateRoleData } from '../../types/role';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleCreated: () => void;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onRoleCreated,
}) => {
  const { t } = useTranslation();
  const { createRole, isLoading } = useCreateRole();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateRoleData) => {
    try {
      setError(null);
      await createRole(data);
      onRoleCreated();
    } catch (err: any) {
      setError(err.response?.data?.message || t('roles.createError'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('roles.createNewRole')}
      size="xl"
    >
      <RoleForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
        error={error}
        submitButtonText={t('roles.createRole')}
      />
    </Modal>
  );
};
```

### 4. Role Form with Permission Matrix

Create `src/components/roles/RoleForm.tsx`:
```tsx
import React, { useState, useMemo } from 'react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SearchBox } from '../ui/SearchBox';
import { PermissionMatrix } from './PermissionMatrix';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslation } from '../../hooks/useTranslation';
import { CreateRoleData, Role, Permission } from '../../types/role';

interface RoleFormProps {
  role?: Role;
  onSubmit: (data: CreateRoleData) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
  submitButtonText: string;
}

export const RoleForm: React.FC<RoleFormProps> = ({
  role,
  onSubmit,
  onCancel,
  isLoading,
  error,
  submitButtonText,
}) => {
  const { t } = useTranslation();
  const { permissions, permissionGroups } = usePermissions();

  const [formData, setFormData] = useState<CreateRoleData>({
    name: role?.name || '',
    display_name: role?.display_name || '',
    description: role?.description || '',
    permissions: role?.permissions.map(p => p.id) || [],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  const filteredPermissions = useMemo(() => {
    let filtered = permissions;

    // Filter by group
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(p => p.group === selectedGroup);
    }

    // Filter by search
    if (permissionSearch) {
      filtered = filtered.filter(p =>
        p.display_name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
        p.description?.toLowerCase().includes(permissionSearch.toLowerCase())
      );
    }

    return filtered;
  }, [permissions, selectedGroup, permissionSearch]);

  const handleInputChange = (field: keyof CreateRoleData, value: any) => {
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

  const handlePermissionToggle = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleGroupToggle = (groupPermissions: Permission[], allSelected: boolean) => {
    const groupIds = groupPermissions.map(p => p.id);
    
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(id => !groupIds.includes(id))
        : [...new Set([...prev.permissions, ...groupIds])]
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = t('validation.required', { field: t('roles.name') });
    }

    if (!formData.display_name.trim()) {
      errors.display_name = t('validation.required', { field: t('roles.displayName') });
    }

    if (formData.permissions.length === 0) {
      errors.permissions = t('validation.required', { field: t('roles.permissions') });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit(formData);
  };

  const getSelectedPermissionsCount = () => formData.permissions.length;
  const getTotalPermissionsCount = () => permissions.length;
  const getSelectedPercentage = () => {
    const total = getTotalPermissionsCount();
    const selected = getSelectedPermissionsCount();
    return total > 0 ? Math.round((selected / total) * 100) : 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-6"
        />
      )}

      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('roles.basicInformation')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t('roles.name')}
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            error={validationErrors.name}
            placeholder="e.g., hotel_manager"
            help={t('roles.nameHelp')}
            required
          />

          <Input
            label={t('roles.displayName')}
            value={formData.display_name}
            onChange={(value) => handleInputChange('display_name', value)}
            error={validationErrors.display_name}
            placeholder="e.g., Hotel Manager"
            required
          />
        </div>

        <div className="mt-6">
          <Textarea
            label={t('roles.description')}
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
            placeholder={t('roles.descriptionPlaceholder')}
            rows={3}
          />
        </div>
      </Card>

      {/* Permission Selection */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t('roles.permissions')}
          </h3>
          <div className="flex items-center space-x-2">
            <Badge variant="info" size="sm">
              {getSelectedPermissionsCount()} / {getTotalPermissionsCount()}
            </Badge>
            <Badge variant={getSelectedPercentage() > 70 ? 'warning' : 'default'} size="sm">
              {getSelectedPercentage()}%
            </Badge>
          </div>
        </div>

        {validationErrors.permissions && (
          <Alert
            type="error"
            message={validationErrors.permissions}
            className="mb-4"
          />
        )}

        {/* Permission Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <SearchBox
            value={permissionSearch}
            onChange={setPermissionSearch}
            placeholder={t('roles.searchPermissions')}
            className="w-full sm:w-80"
          />

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{t('roles.group')}:</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">{t('roles.allGroups')}</option>
              {permissionGroups.map(group => (
                <option key={group.key} value={group.key}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Permission Matrix */}
        <PermissionMatrix
          permissions={filteredPermissions}
          permissionGroups={permissionGroups}
          selectedPermissions={formData.permissions}
          onPermissionToggle={handlePermissionToggle}
          onGroupToggle={handleGroupToggle}
          showGroupFilter={selectedGroup === 'all'}
        />
      </Card>

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

### 5. Permission Matrix Component

Create `src/components/roles/PermissionMatrix.tsx`:
```tsx
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
```

### 6. Role Preview Modal

Create `src/components/roles/RolePreviewModal.tsx`:
```tsx
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
```

### 7. Custom Hooks for Role Management

Create `src/hooks/useRoles.ts`:
```tsx
import { useState, useEffect } from 'react';
import { rolesAPI } from '../services/rolesAPI';
import { Role, RoleFilters, CreateRoleData } from '../types/role';

export const useRoles = (filters: RoleFilters) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rolesAPI.getRoles(filters);
      setRoles(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch roles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [JSON.stringify(filters)]);

  const duplicateRole = async (roleId: number) => {
    const response = await rolesAPI.duplicateRole(roleId);
    return response.data;
  };

  const bulkDeleteRoles = async (roleIds: number[]) => {
    await rolesAPI.bulkDelete(roleIds);
  };

  return {
    roles,
    isLoading,
    error,
    refetch: fetchRoles,
    duplicateRole,
    bulkDeleteRoles,
  };
};

export const useCreateRole = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createRole = async (roleData: CreateRoleData) => {
    setIsLoading(true);
    try {
      const response = await rolesAPI.createRole(roleData);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return { createRole, isLoading };
};
```

### 8. Role Types Definition

Create `src/types/role.ts`:
```tsx
export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  permissions: Permission[];
  users_count?: number;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  group: string;
  is_dangerous: boolean;
  requires_confirmation: boolean;
}

export interface PermissionGroup {
  key: string;
  name: string;
  description?: string;
  permissions_count: number;
}

export interface CreateRoleData {
  name: string;
  display_name: string;
  description?: string;
  permissions: number[];
}

export interface RoleFilters {
  search: string;
  permission_type: string;
  user_count: string;
}
```

## Testing Criteria
- [ ] Role dashboard loads and displays correctly
- [ ] Create role modal opens and form validation works
- [ ] Permission matrix allows proper selection
- [ ] Edit role form pre-populates existing data
- [ ] Role preview shows all details correctly
- [ ] Permission grouping and filtering works
- [ ] Bulk operations function properly
- [ ] Role duplication creates proper copies
- [ ] Permission dependencies are validated
- [ ] Responsive design works on all devices

## Related Issues
- **Depends on**: Issue #06 (Frontend Design System), Issue #07 (Frontend Authentication), Issue #08 (User Management Frontend)
- **Blocks**: Issue #10 (Dashboard Implementation), Issue #11 (Settings Management Frontend)

## Notes
- Implement proper permission hierarchy validation
- Add role templates for common use cases
- Consider permission inheritance for complex role structures
- Ensure proper accessibility for the permission matrix
- Add comprehensive error handling for role operations
- Implement proper confirmation dialogs for dangerous operations
