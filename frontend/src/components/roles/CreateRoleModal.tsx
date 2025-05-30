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
