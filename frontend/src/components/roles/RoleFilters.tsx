import React from 'react';
import { SearchBox } from '../ui/SearchBox';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useTranslation } from '../../hooks/useTranslation';
import { RoleFilters as RoleFiltersType } from '../../types/role';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface RoleFiltersProps {
  filters: RoleFiltersType;
  onFiltersChange: (filters: Partial<RoleFiltersType>) => void;
  totalCount: number;
}

export const RoleFilters: React.FC<RoleFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCount,
}) => {
  const { t } = useTranslation();

  const permissionTypeOptions = [
    { value: '', label: t('roles.allPermissionTypes') },
    { value: 'system', label: t('roles.systemPermissions') },
    { value: 'user_management', label: t('roles.userManagement') },
    { value: 'content_management', label: t('roles.contentManagement') },
    { value: 'booking_management', label: t('roles.bookingManagement') },
    { value: 'financial', label: t('roles.financialPermissions') },
    { value: 'reporting', label: t('roles.reportingPermissions') },
  ];

  const userCountOptions = [
    { value: '', label: t('roles.allUserCounts') },
    { value: '0', label: t('roles.noUsersAssigned') },
    { value: '1-10', label: t('roles.oneToTenUsers') },
    { value: '11-50', label: t('roles.elevenToFiftyUsers') },
    { value: '50+', label: t('roles.moreThanFiftyUsers') },
  ];

  const handleSearchChange = (search: string) => {
    onFiltersChange({ search });
  };

  const handlePermissionTypeChange = (permission_type: string) => {
    onFiltersChange({ permission_type });
  };

  const handleUserCountChange = (user_count: string) => {
    onFiltersChange({ user_count });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      permission_type: '',
      user_count: '',
    });
  };

  const hasActiveFilters = filters.search || filters.permission_type || filters.user_count;

  return (
    <Card className="p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {t('common.filters')}
          </span>
          <Badge variant="default" size="sm">
            {totalCount} {t('roles.roles')}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 flex-1 lg:max-w-2xl">
          <SearchBox
            value={filters.search}
            onChange={handleSearchChange}
            placeholder={t('roles.searchRoles')}
            className="w-full sm:w-80"
          />

          <Select
            value={filters.permission_type}
            onChange={handlePermissionTypeChange}
            options={permissionTypeOptions}
            placeholder={t('roles.selectPermissionType')}
            className="w-full sm:w-48"
          />

          <Select
            value={filters.user_count}
            onChange={handleUserCountChange}
            options={userCountOptions}
            placeholder={t('roles.selectUserCount')}
            className="w-full sm:w-48"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-resort-blue-600 hover:text-resort-blue-700 font-medium whitespace-nowrap"
          >
            {t('common.clearFilters')}
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
          <span className="text-sm text-gray-500">{t('common.activeFilters')}:</span>
          
          {filters.search && (
            <Badge
              variant="info"
              size="sm"
              onRemove={() => onFiltersChange({ search: '' })}
            >
              {t('common.search')}: {filters.search}
            </Badge>
          )}
          
          {filters.permission_type && (
            <Badge
              variant="info"
              size="sm"
              onRemove={() => onFiltersChange({ permission_type: '' })}
            >
              {permissionTypeOptions.find(opt => opt.value === filters.permission_type)?.label}
            </Badge>
          )}
          
          {filters.user_count && (
            <Badge
              variant="info"
              size="sm"
              onRemove={() => onFiltersChange({ user_count: '' })}
            >
              {userCountOptions.find(opt => opt.value === filters.user_count)?.label}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
};
