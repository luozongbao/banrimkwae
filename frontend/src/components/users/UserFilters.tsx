import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useRoles } from '../../hooks/useUsers';
import { useDepartments } from '../../hooks/useUsers';
import { useTranslation } from '../../hooks/useTranslation';
import type { UserFilters as UserFiltersType } from '../../types/user';
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
              onChange={(e) => handleFilterChange('search', e.target.value)}
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
