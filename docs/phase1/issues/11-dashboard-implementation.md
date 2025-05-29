# Issue #11: Dashboard Implementation with Analytics and Widgets

## Issue Information
- **Issue ID**: #11
- **Priority**: High
- **Estimated Hours**: 20-24 hours
- **Assignee**: Frontend Developer
- **Dependencies**: Issues #01-#10 (Backend API, Authentication, User Management)
- **Labels**: Frontend, Dashboard, Analytics, Widgets, Charts

## Phase 1 Context
This issue implements the main dashboard interface that serves as the central hub for the Banrimkwae Resort Management System. The dashboard provides real-time analytics, key performance indicators (KPIs), and quick access to all system modules while maintaining responsive design and role-based access control.

## Objective
Create a comprehensive dashboard interface with:
- Real-time KPI widgets and analytics
- Interactive charts and data visualizations
- Quick action panels and module navigation
- Responsive design for all devices
- Role-based dashboard customization
- Performance monitoring and alerts

## Scope

### Core Features
1. **Main Dashboard Layout**
   - Header with navigation and notifications
   - Sidebar navigation integration
   - Responsive grid layout for widgets
   - Quick stats summary bar

2. **KPI Widgets System**
   - Revenue tracking widgets
   - Occupancy rate displays
   - Activity participation metrics
   - Restaurant performance indicators
   - Inventory status alerts

3. **Interactive Charts**
   - Revenue trend charts
   - Occupancy rate visualizations
   - Activity booking patterns
   - Performance comparison charts

4. **Quick Actions Panel**
   - Module access shortcuts
   - Recent activity feed
   - Alert notifications
   - User quick actions

5. **Real-time Updates**
   - WebSocket integration for live data
   - Auto-refresh mechanisms
   - Performance optimization
   - Loading states management

## Technical Requirements

### Frontend Technology Stack
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Charts**: Chart.js or Recharts for data visualization
- **State Management**: React Query for server state, Zustand for client state
- **Real-time**: Socket.io-client for live updates
- **Icons**: Heroicons
- **Animations**: Framer Motion

### Performance Requirements
- Initial load time: < 2 seconds
- Widget refresh rate: 30 seconds for critical data
- Chart animations: < 500ms
- Mobile responsiveness: All breakpoints supported
- Accessibility: WCAG 2.1 AA compliance

## Implementation Plan

### Phase 1: Core Dashboard Structure (6-8 hours)

#### 1.1 Dashboard Layout Component
```typescript
// components/Dashboard/DashboardLayout.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import KPIWidget from './KPIWidget';
import ChartWidget from './ChartWidget';
import QuickActionsPanel from './QuickActionsPanel';
import AlertsSection from './AlertsSection';

interface DashboardProps {
  userRole: string;
  permissions: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ userRole, permissions }) => {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error } = useDashboardData();
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [refreshInterval, setRefreshInterval] = useState(30000);

  const getVisibleWidgets = () => {
    const baseWidgets = ['revenue', 'occupancy'];
    
    if (permissions.includes('view_restaurant')) {
      baseWidgets.push('restaurant');
    }
    
    if (permissions.includes('view_activities')) {
      baseWidgets.push('activities');
    }
    
    if (permissions.includes('view_inventory')) {
      baseWidgets.push('inventory');
    }
    
    return baseWidgets;
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.language === 'th' ? 'แดชบอร์ด' : 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {user?.language === 'th' 
                ? 'ภาพรวมการจัดการรีสอร์ท'
                : 'Resort Management Overview'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <DateRangePicker 
              value={selectedDateRange}
              onChange={setSelectedDateRange}
            />
            <RefreshButton 
              onClick={() => window.location.reload()}
              lastUpdated={dashboardData?.lastUpdated}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <QuickStat
            icon="currency-dollar"
            label={user?.language === 'th' ? 'รายได้วันนี้' : 'Today\'s Revenue'}
            value={`THB ${dashboardData?.todayRevenue?.toLocaleString() || '0'}`}
            trend={dashboardData?.revenueTrend}
          />
          <QuickStat
            icon="home"
            label={user?.language === 'th' ? 'อัตราการเข้าพัก' : 'Occupancy Rate'}
            value={`${dashboardData?.occupancyRate || 0}%`}
            trend={dashboardData?.occupancyTrend}
          />
          <QuickStat
            icon="calendar"
            label={user?.language === 'th' ? 'การจองวันนี้' : 'Today\'s Bookings'}
            value={dashboardData?.todayBookings || 0}
            trend={dashboardData?.bookingsTrend}
          />
          <QuickStat
            icon="users"
            label={user?.language === 'th' ? 'แขกที่เข้าพัก' : 'Current Guests'}
            value={dashboardData?.currentGuests || 0}
            trend={dashboardData?.guestsTrend}
          />
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Widgets */}
          <div className="lg:col-span-2 space-y-6">
            {getVisibleWidgets().map((widgetType) => (
              <DashboardWidget
                key={widgetType}
                type={widgetType}
                data={dashboardData?.[widgetType]}
                dateRange={selectedDateRange}
                userRole={userRole}
                language={user?.language}
              />
            ))}
          </div>

          {/* Right Column - Side Panels */}
          <div className="space-y-6">
            <QuickActionsPanel 
              userRole={userRole}
              permissions={permissions}
              language={user?.language}
            />
            
            <AlertsSection 
              alerts={dashboardData?.alerts || []}
              language={user?.language}
            />
            
            <RecentActivity 
              activities={dashboardData?.recentActivities || []}
              language={user?.language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

#### 1.2 KPI Widget Component
```typescript
// components/Dashboard/KPIWidget.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    period: string;
  };
  color?: string;
  onClick?: () => void;
}

const KPIWidget: React.FC<KPIWidgetProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  onClick
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    const IconComponent = trend.direction === 'up' ? ArrowUpIcon : ArrowDownIcon;
    const trendColor = trend.direction === 'up' ? 'text-green-500' : 'text-red-500';
    
    return (
      <div className={`flex items-center ${trendColor}`}>
        <IconComponent className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">{trend.percentage}%</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`
        bg-white rounded-lg border-2 p-6 cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${colorClasses[color]}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              {getTrendIcon()}
              <span className="text-sm text-gray-500 ml-2">
                vs {trend.period}
              </span>
            </div>
          )}
        </div>
        
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${colorClasses[color]}
        `}>
          <HeroIcon name={icon} className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default KPIWidget;
```

### Phase 2: Chart Widgets and Analytics (6-8 hours)

#### 2.1 Chart Widget Component
```typescript
// components/Dashboard/ChartWidget.tsx
import React, { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface ChartWidgetProps {
  title: string;
  type: 'line' | 'area' | 'bar' | 'pie' | 'doughnut';
  data: any[];
  height?: number;
  showLegend?: boolean;
  color?: string;
  gradientFill?: boolean;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  type,
  data,
  height = 300,
  showLegend = true,
  color = '#2E86AB',
  gradientFill = false
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const renderChart = () => {
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
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
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
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
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
              <XAxis dataKey="category" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill={color}
                radius={[4, 4, 0, 0]}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
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
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <button className="text-sm text-gray-500 hover:text-gray-700">
            Export
          </button>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            ⋮
          </button>
        </div>
      </div>
      
      <div className="w-full">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartWidget;
```

#### 2.2 Dashboard Data Hook
```typescript
// hooks/useDashboardData.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export const useDashboardData = (dateRange = 'today', refreshInterval = 30000) => {
  return useQuery({
    queryKey: ['dashboard-data', dateRange],
    queryFn: () => dashboardService.getDashboardData(dateRange),
    refetchInterval: refreshInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useRealtimeUpdates = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001');
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Dashboard WebSocket connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Dashboard WebSocket disconnected');
    });

    newSocket.on('dashboard_update', (data) => {
      // Handle real-time dashboard updates
      queryClient.setQueryData(['dashboard-data'], (oldData: any) => ({
        ...oldData,
        ...data,
        lastUpdated: new Date().toISOString(),
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, isConnected };
};
```

### Phase 3: Quick Actions and Navigation (4-6 hours)

#### 3.1 Quick Actions Panel
```typescript
// components/Dashboard/QuickActionsPanel.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  href: string;
  permission?: string;
  count?: number;
}

interface QuickActionsPanelProps {
  userRole: string;
  permissions: string[];
  language: string;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  userRole,
  permissions,
  language
}) => {
  const router = useRouter();

  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [
      {
        id: 'new-booking',
        title: language === 'th' ? 'จองที่พักใหม่' : 'New Booking',
        icon: 'calendar-plus',
        color: 'blue',
        href: '/bookings/new',
        permission: 'create_booking'
      },
      {
        id: 'check-in',
        title: language === 'th' ? 'เช็คอิน' : 'Check In',
        icon: 'login',
        color: 'green',
        href: '/bookings/check-in',
        permission: 'manage_checkin'
      },
      {
        id: 'add-user',
        title: language === 'th' ? 'เพิ่มผู้ใช้' : 'Add User',
        icon: 'user-plus',
        color: 'purple',
        href: '/users/new',
        permission: 'create_user'
      },
      {
        id: 'inventory-alert',
        title: language === 'th' ? 'แจ้งเตือนสต็อก' : 'Inventory Alerts',
        icon: 'exclamation-triangle',
        color: 'orange',
        href: '/inventory/alerts',
        permission: 'view_inventory',
        count: 5
      },
      {
        id: 'reports',
        title: language === 'th' ? 'รายงาน' : 'Reports',
        icon: 'chart-bar',
        color: 'indigo',
        href: '/reports',
        permission: 'view_reports'
      },
      {
        id: 'settings',
        title: language === 'th' ? 'ตั้งค่า' : 'Settings',
        icon: 'cog',
        color: 'gray',
        href: '/settings',
        permission: 'manage_settings'
      }
    ];

    return actions.filter(action => 
      !action.permission || permissions.includes(action.permission)
    );
  };

  const handleActionClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {language === 'th' ? 'การดำเนินการด่วน' : 'Quick Actions'}
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {getQuickActions().map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleActionClick(action.href)}
            className={`
              relative p-4 rounded-lg border-2 text-left
              transition-all duration-200 hover:shadow-md
              bg-${action.color}-50 border-${action.color}-200
              hover:bg-${action.color}-100
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <HeroIcon 
                  name={action.icon} 
                  className={`w-6 h-6 text-${action.color}-600 mb-2`}
                />
                <p className="text-sm font-medium text-gray-900">
                  {action.title}
                </p>
              </div>
              
              {action.count && (
                <div className={`
                  absolute -top-2 -right-2 w-6 h-6 rounded-full
                  bg-${action.color}-600 text-white text-xs
                  flex items-center justify-center font-bold
                `}>
                  {action.count}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsPanel;
```

#### 3.2 Alerts Section Component
```typescript
// components/Dashboard/AlertsSection.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  dismissible?: boolean;
}

interface AlertsSectionProps {
  alerts: Alert[];
  language: string;
  onDismiss?: (alertId: string) => void;
}

const AlertsSection: React.FC<AlertsSectionProps> = ({
  alerts,
  language,
  onDismiss
}) => {
  const getAlertStyles = (type: Alert['type']) => {
    const styles = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      success: 'bg-green-50 border-green-200 text-green-800',
    };
    return styles[type];
  };

  const getAlertIcon = (type: Alert['type']) => {
    const icons = {
      info: 'information-circle',
      warning: 'exclamation-triangle',
      error: 'x-circle',
      success: 'check-circle',
    };
    return icons[type];
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'th' ? 'การแจ้งเตือน' : 'Alerts'}
        </h3>
        <div className="text-center py-8">
          <HeroIcon name="check-circle" className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-gray-500">
            {language === 'th' ? 'ไม่มีการแจ้งเตือน' : 'No alerts'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {language === 'th' ? 'การแจ้งเตือน' : 'Alerts'}
        </h3>
        <span className="text-sm text-gray-500">
          {alerts.length} {language === 'th' ? 'รายการ' : 'items'}
        </span>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`
                p-4 rounded-lg border-2 relative
                ${getAlertStyles(alert.type)}
              `}
            >
              <div className="flex items-start">
                <HeroIcon 
                  name={getAlertIcon(alert.type)}
                  className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {alert.title}
                  </p>
                  <p className="text-sm mt-1 opacity-90">
                    {alert.message}
                  </p>
                  <p className="text-xs mt-2 opacity-70">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                  
                  {alert.actionUrl && (
                    <button
                      onClick={() => window.open(alert.actionUrl, '_blank')}
                      className="text-sm font-medium underline mt-2 hover:no-underline"
                    >
                      {language === 'th' ? 'ดูรายละเอียด' : 'View Details'}
                    </button>
                  )}
                </div>
                
                {alert.dismissible && onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertsSection;
```

### Phase 4: Mobile Responsiveness and Performance (4-6 hours)

#### 4.1 Responsive Dashboard Components
```typescript
// components/Dashboard/ResponsiveDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const ResponsiveDashboard: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const [collapsedPanels, setCollapsedPanels] = useState<string[]>([]);

  const togglePanel = (panelId: string) => {
    setCollapsedPanels(prev =>
      prev.includes(panelId)
        ? prev.filter(id => id !== panelId)
        : [...prev, panelId]
    );
  };

  // Mobile-specific grid layout
  const getMobileLayout = () => ({
    gridTemplateColumns: '1fr',
    gap: '16px',
  });

  // Tablet-specific grid layout
  const getTabletLayout = () => ({
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  });

  // Desktop grid layout
  const getDesktopLayout = () => ({
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  });

  const getGridLayout = () => {
    if (isMobile) return getMobileLayout();
    if (isTablet) return getTabletLayout();
    return getDesktopLayout();
  };

  return (
    <div 
      className="dashboard-grid"
      style={getGridLayout()}
    >
      {/* Mobile-optimized widgets */}
      {isMobile ? (
        <MobileWidgetStack />
      ) : (
        <DesktopWidgetGrid />
      )}
    </div>
  );
};

// Mobile-specific widget stack
const MobileWidgetStack: React.FC = () => {
  return (
    <div className="space-y-4">
      <CollapsibleWidget
        title="Quick Stats"
        defaultCollapsed={false}
        priority="high"
      >
        <MobileKPIGrid />
      </CollapsibleWidget>
      
      <CollapsibleWidget
        title="Revenue Chart"
        defaultCollapsed={false}
        priority="high"
      >
        <MobileChart type="revenue" />
      </CollapsibleWidget>
      
      <CollapsibleWidget
        title="Quick Actions"
        defaultCollapsed={true}
        priority="medium"
      >
        <MobileQuickActions />
      </CollapsibleWidget>
    </div>
  );
};
```

#### 4.2 Performance Optimization
```typescript
// utils/dashboardOptimization.ts
import { memo, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

// Memoized widget components for performance
export const MemoizedKPIWidget = memo(KPIWidget, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.trend?.percentage === nextProps.trend?.percentage
  );
});

export const MemoizedChartWidget = memo(ChartWidget, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});

// Debounced refresh function
export const useDebouncedRefresh = (refreshFn: () => void, delay = 1000) => {
  return useCallback(
    debounce(refreshFn, delay),
    [refreshFn, delay]
  );
};

// Data transformation utilities
export const useMemoizedChartData = (rawData: any[], transformFn: (data: any) => any) => {
  return useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return transformFn(rawData);
  }, [rawData, transformFn]);
};

// Lazy loading for dashboard modules
export const LazyReportsModule = lazy(() => import('@/components/Reports/ReportsModule'));
export const LazyAnalyticsModule = lazy(() => import('@/components/Analytics/AnalyticsModule'));

// Dashboard performance monitoring
export const useDashboardPerformance = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    dataFetchTime: 0,
  });

  const measurePerformance = useCallback((metricName: string, duration: number) => {
    setMetrics(prev => ({
      ...prev,
      [metricName]: duration,
    }));
  }, []);

  return { metrics, measurePerformance };
};
```

## API Integration

### Dashboard Service
```typescript
// services/dashboardService.ts
import { ApiClient } from './apiClient';

export interface DashboardData {
  todayRevenue: number;
  occupancyRate: number;
  todayBookings: number;
  currentGuests: number;
  revenueTrend: TrendData;
  occupancyTrend: TrendData;
  revenueChart: ChartDataPoint[];
  occupancyChart: ChartDataPoint[];
  alerts: Alert[];
  recentActivities: Activity[];
  lastUpdated: string;
}

export interface TrendData {
  direction: 'up' | 'down' | 'neutral';
  percentage: number;
  period: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  category?: string;
}

class DashboardService extends ApiClient {
  async getDashboardData(dateRange: string = 'today'): Promise<DashboardData> {
    const response = await this.get(`/dashboard/summary`, {
      params: { date_range: dateRange }
    });
    return response.data;
  }

  async getKPIData(kpiType: string, dateRange: string): Promise<any> {
    const response = await this.get(`/dashboard/kpi/${kpiType}`, {
      params: { date_range: dateRange }
    });
    return response.data;
  }

  async getChartData(chartType: string, filters: any): Promise<ChartDataPoint[]> {
    const response = await this.get(`/dashboard/charts/${chartType}`, {
      params: filters
    });
    return response.data;
  }

  async dismissAlert(alertId: string): Promise<void> {
    await this.post(`/dashboard/alerts/${alertId}/dismiss`);
  }

  async getRealtimeUpdates(): Promise<any> {
    const response = await this.get('/dashboard/realtime');
    return response.data;
  }
}

export const dashboardService = new DashboardService();
```

## Testing Requirements

### Unit Tests
```typescript
// tests/Dashboard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/components/Dashboard/Dashboard';

describe('Dashboard Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderDashboard = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Dashboard userRole="admin" permissions={['view_all']} {...props} />
      </QueryClientProvider>
    );
  };

  test('renders dashboard header correctly', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('displays KPI widgets based on permissions', () => {
    renderDashboard({ permissions: ['view_revenue', 'view_occupancy'] });
    expect(screen.getByText(/revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/occupancy/i)).toBeInTheDocument();
  });

  test('handles widget interactions correctly', async () => {
    renderDashboard();
    const revenueWidget = screen.getByText(/revenue/i);
    fireEvent.click(revenueWidget);
    
    await waitFor(() => {
      // Verify navigation or modal opening
    });
  });

  test('refreshes data on button click', async () => {
    renderDashboard();
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      // Verify data refresh
    });
  });
});
```

### Integration Tests
```typescript
// tests/dashboard.integration.test.tsx
describe('Dashboard Integration Tests', () => {
  test('loads complete dashboard data correctly', async () => {
    // Mock API responses
    // Test full dashboard load
    // Verify all widgets render with data
  });

  test('handles real-time updates properly', async () => {
    // Test WebSocket connections
    // Verify live data updates
    // Test reconnection logic
  });

  test('responsive design works across breakpoints', () => {
    // Test mobile layout
    // Test tablet layout
    // Test desktop layout
  });
});
```

## Acceptance Criteria

### Core Functionality
- [ ] Dashboard loads within 2 seconds on initial visit
- [ ] All KPI widgets display correct data based on user permissions
- [ ] Charts render properly with interactive tooltips and legends
- [ ] Real-time updates work without page refresh
- [ ] Quick actions navigate to correct pages based on permissions
- [ ] Alerts system displays and allows dismissal of notifications
- [ ] Date range filtering affects all relevant widgets

### User Experience
- [ ] Dashboard is fully responsive on mobile, tablet, and desktop
- [ ] Loading states provide clear feedback during data fetching
- [ ] Error states display helpful messages with retry options
- [ ] Animations enhance user experience without causing distraction
- [ ] Accessibility standards are met (WCAG 2.1 AA)
- [ ] Multi-language support works correctly (Thai/English)

### Performance
- [ ] Dashboard widgets load incrementally for better perceived performance
- [ ] Chart animations complete within 500ms
- [ ] WebSocket connections handle disconnections gracefully
- [ ] Memory usage remains stable during extended use
- [ ] No memory leaks detected in browser dev tools

### Security
- [ ] Dashboard data respects role-based access control
- [ ] API endpoints validate user permissions
- [ ] Sensitive data is not exposed in client-side code
- [ ] WebSocket connections use proper authentication

## Dependencies

### External Libraries
```json
{
  "recharts": "^2.8.0",
  "framer-motion": "^10.16.0",
  "socket.io-client": "^4.7.0",
  "@tanstack/react-query": "^4.35.0",
  "date-fns": "^2.30.0",
  "lodash": "^4.17.21"
}
```

### Internal Dependencies
- Issue #07: Frontend Authentication (for user context)
- Issue #08: User Management (for permission checks)
- Backend APIs for dashboard data
- WebSocket server for real-time updates

## Deployment Notes

### Environment Variables
```env
NEXT_PUBLIC_WS_URL=wss://api.banrimkwae.com/ws
NEXT_PUBLIC_DASHBOARD_REFRESH_INTERVAL=30000
NEXT_PUBLIC_CHART_ANIMATION_DURATION=500
```

### Performance Monitoring
- Implement Lighthouse CI for performance tracking
- Monitor Core Web Vitals in production
- Set up error tracking for dashboard components
- Configure analytics for user interactions

## Implementation Notes

### Code Organization
```
src/
├── components/
│   └── Dashboard/
│       ├── Dashboard.tsx
│       ├── KPIWidget.tsx
│       ├── ChartWidget.tsx
│       ├── QuickActionsPanel.tsx
│       ├── AlertsSection.tsx
│       └── ResponsiveDashboard.tsx
├── hooks/
│   ├── useDashboardData.ts
│   ├── useRealtimeUpdates.ts
│   └── useMediaQuery.ts
├── services/
│   └── dashboardService.ts
├── utils/
│   └── dashboardOptimization.ts
└── types/
    └── dashboard.ts
```

### Best Practices
1. **Performance**: Use React.memo and useMemo for expensive calculations
2. **Error Handling**: Implement proper error boundaries and retry logic
3. **Accessibility**: Ensure all interactive elements are keyboard navigable
4. **Testing**: Maintain high test coverage for critical dashboard functionality
5. **Documentation**: Document all custom hooks and complex components

This dashboard implementation provides a comprehensive, performant, and user-friendly interface that serves as the central hub for the Banrimkwae Resort Management System, with proper attention to responsive design, real-time capabilities, and role-based access control.
