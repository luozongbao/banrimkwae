import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const options = [
    { value: 'today', label: t('dashboard.today') },
    { value: 'yesterday', label: t('dashboard.yesterday') },
    { value: 'week', label: t('dashboard.thisWeek') },
    { value: 'month', label: t('dashboard.thisMonth') },
    { value: 'year', label: t('dashboard.thisYear') },
  ];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  );
};

export default DateRangePicker;
