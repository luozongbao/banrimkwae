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
