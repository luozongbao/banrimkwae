import React from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { EllipsisVerticalIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ChartWidgetProps {
  title: string;
  type: 'line' | 'area' | 'bar' | 'pie' | 'doughnut';
  data: any[];
  height?: number;
  showLegend?: boolean;
  color?: string;
  gradientFill?: boolean;
  className?: string;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  type,
  data,
  height = 300,
  color = '#2E86AB',
  gradientFill = false,
  className = ''
}) => {

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {`${entry.name || 'Value'}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No data available</p>
        </div>
      );
    }

    const commonProps = {
      width: '100%',
      height,
      data,
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date"
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#666" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                fillOpacity={1}
                fill={gradientFill ? "url(#colorGradient)" : color}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
                stroke="#666" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#666" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill={color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const COLORS = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#48BB78'];
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="flex items-center justify-center h-full">Unsupported chart type</div>;
    }
  };

  const handleExport = () => {
    // Mock export functionality
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Export
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <EllipsisVerticalIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="w-full" style={{ height }}>
          {renderChart()}
        </div>
      </Card>
    </motion.div>
  );
};

export default ChartWidget;
