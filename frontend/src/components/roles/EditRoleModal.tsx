import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { RoleForm } from './RoleForm';
import { useUpdateRole } from '../../hooks/useRoles';
import { useTranslation } from '../../hooks/useTranslation';
import { CreateRoleData, Role } from '../../types/role';

interface EditRoleModalProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  onRoleUpdated: () => void;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({
  role,
  isOpen,
  onClose,
  onRoleUpdated,
}) => {
  const { t } = useTranslation();
  const { updateRole, isLoading } = useUpdateRole();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateRoleData) => {
    try {
      setError(null);
      await updateRole(role.id, data);
      onRoleUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || t('roles.updateError'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('roles.editRole', { name: role.display_name })}
      size="xl"
    >
      <RoleForm
        role={role}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
        error={error}
        submitButtonText={t('roles.updateRole')}
      />
    </Modal>
  );
};
