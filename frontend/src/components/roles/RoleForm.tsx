import React, { useState, useMemo } from 'react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SearchBox } from '../ui/SearchBox';
import { PermissionMatrix } from './PermissionMatrix';
import { usePermissions } from '../../hooks/useRoles';
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
