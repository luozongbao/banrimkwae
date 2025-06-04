import React from 'react'
import { cn } from '../../lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
  className?: string
  label?: string
  description?: string
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'default',
  className,
  label,
  description,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-8',
    default: 'h-6 w-11',
    lg: 'h-8 w-14',
  }

  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-5 w-5',
    lg: 'h-7 w-7',
  }

  const translateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0',
    default: checked ? 'translate-x-5' : 'translate-x-0',
    lg: checked ? 'translate-x-6' : 'translate-x-0',
  }

  return (
    <div className={cn('flex items-center', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-resort-blue-500 focus:ring-offset-2',
          checked ? 'bg-resort-blue-600' : 'bg-gray-200',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          sizeClasses[size]
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out',
            thumbSizeClasses[size],
            translateClasses[size]
          )}
        />
      </button>
      
      {(label || description) && (
        <div className="ml-3">
          {label && (
            <label className="text-sm font-medium text-gray-900">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
