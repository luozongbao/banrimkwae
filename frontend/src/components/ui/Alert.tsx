import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { cn } from '../../lib/utils';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const alertStyles = {
  success: {
    container: 'bg-success-50 border-success-200',
    icon: 'text-success-400',
    title: 'text-success-800',
    message: 'text-success-700',
    closeButton: 'text-success-500 hover:text-success-600',
  },
  error: {
    container: 'bg-error-50 border-error-200',
    icon: 'text-error-400',
    title: 'text-error-800',
    message: 'text-error-700',
    closeButton: 'text-error-500 hover:text-error-600',
  },
  warning: {
    container: 'bg-warning-50 border-warning-200',
    icon: 'text-warning-400',
    title: 'text-warning-800',
    message: 'text-warning-700',
    closeButton: 'text-warning-500 hover:text-warning-600',
  },
  info: {
    container: 'bg-info-50 border-info-200',
    icon: 'text-info-400',
    title: 'text-info-800',
    message: 'text-info-700',
    closeButton: 'text-info-500 hover:text-info-600',
  },
};

const alertIcons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  className,
}) => {
  const styles = alertStyles[type];
  const IconComponent = alertIcons[type];

  return (
    <div className={cn(
      'rounded-md border p-4',
      styles.container,
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={cn('h-5 w-5', styles.icon)} aria-hidden="true" />
        </div>
        <div className="ml-3">
          {title && (
            <h3 className={cn('text-sm font-medium', styles.title)}>
              {title}
            </h3>
          )}
          <div className={cn('text-sm', title ? 'mt-2' : '', styles.message)}>
            <p>{message}</p>
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  styles.closeButton
                )}
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
