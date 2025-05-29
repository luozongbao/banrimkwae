# Issue #05: Restaurant Operations Reports

**Priority:** Medium  
**Estimated Time:** 10-12 days  
**Dependencies:** Issues #01, #03  
**Assignee:** Backend Developer + Frontend Developer

## Overview
Implement comprehensive restaurant operations reporting system covering sales performance, menu analysis, kitchen efficiency, table turnover, and cost management.

## Requirements

### 1. Database Schema Extensions

#### 1.1 Restaurant Analytics Tables
```sql
-- Restaurant performance metrics
CREATE TABLE restaurant_metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    shift_type ENUM('breakfast', 'lunch', 'dinner', 'all_day') NOT NULL,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_covers INT DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    table_turnover_rate DECIMAL(5,2) DEFAULT 0,
    kitchen_efficiency_score DECIMAL(5,2) DEFAULT 0,
    customer_satisfaction_score DECIMAL(3,2) DEFAULT 0,
    food_cost_percentage DECIMAL(5,2) DEFAULT 0,
    labor_cost_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_restaurant_metrics_date (date),
    INDEX idx_restaurant_metrics_shift (shift_type),
    INDEX idx_restaurant_metrics_date_shift (date, shift_type)
);

-- Menu item performance
CREATE TABLE menu_item_analytics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    menu_item_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    quantity_sold INT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    preparation_time_avg INT DEFAULT 0, -- in minutes
    return_rate DECIMAL(5,4) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    popularity_rank INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    INDEX idx_menu_analytics_item_date (menu_item_id, date),
    INDEX idx_menu_analytics_date (date),
    INDEX idx_menu_analytics_popularity (popularity_rank)
);

-- Kitchen performance metrics
CREATE TABLE kitchen_performance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    shift_type ENUM('breakfast', 'lunch', 'dinner') NOT NULL,
    average_prep_time DECIMAL(5,2) DEFAULT 0, -- in minutes
    order_completion_rate DECIMAL(5,2) DEFAULT 0,
    waste_percentage DECIMAL(5,2) DEFAULT 0,
    staff_efficiency_score DECIMAL(5,2) DEFAULT 0,
    equipment_downtime_minutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_kitchen_performance_date (date),
    INDEX idx_kitchen_performance_shift (shift_type)
);

-- Table turnover analytics
CREATE TABLE table_analytics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    table_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    total_seatings INT DEFAULT 0,
    average_dining_duration DECIMAL(5,2) DEFAULT 0, -- in minutes
    revenue_per_table DECIMAL(10,2) DEFAULT 0,
    utilization_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    INDEX idx_table_analytics_table_date (table_id, date),
    INDEX idx_table_analytics_date (date)
);
```

### 2. Backend Implementation

#### 2.1 Restaurant Analytics Service
```php
// app/Services/Reporting/RestaurantAnalyticsService.php
<?php

namespace App\Services\Reporting;

use App\Models\Order;
use App\Models\MenuItem;
use App\Models\RestaurantTable;
use App\Services\Reporting\BaseReportService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RestaurantAnalyticsService extends BaseReportService
{
    public function generateSalesReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subDays(30);
        $endDate = $filters['end_date'] ?? now();
        $shiftType = $filters['shift_type'] ?? null;

        $query = DB::table('orders as o')
            ->join('order_items as oi', 'o.id', '=', 'oi.order_id')
            ->join('menu_items as mi', 'oi.menu_item_id', '=', 'mi.id')
            ->whereBetween('o.created_at', [$startDate, $endDate])
            ->where('o.status', 'completed');

        if ($shiftType) {
            $query->where('o.shift_type', $shiftType);
        }

        $salesData = $query->select([
            DB::raw('DATE(o.created_at) as date'),
            DB::raw('o.shift_type'),
            DB::raw('SUM(oi.quantity * oi.unit_price) as total_revenue'),
            DB::raw('COUNT(DISTINCT o.id) as total_orders'),
            DB::raw('SUM(oi.quantity) as total_items'),
            DB::raw('AVG(o.total_amount) as average_order_value')
        ])
        ->groupBy('date', 'shift_type')
        ->orderBy('date')
        ->get();

        return [
            'data' => $salesData,
            'summary' => $this->calculateSalesSummary($salesData),
            'trends' => $this->calculateSalesTrends($salesData)
        ];
    }

    public function generateMenuPerformanceReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subDays(30);
        $endDate = $filters['end_date'] ?? now();
        $categoryId = $filters['category_id'] ?? null;

        $query = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('menu_items as mi', 'oi.menu_item_id', '=', 'mi.id')
            ->join('menu_categories as mc', 'mi.category_id', '=', 'mc.id')
            ->whereBetween('o.created_at', [$startDate, $endDate])
            ->where('o.status', 'completed');

        if ($categoryId) {
            $query->where('mi.category_id', $categoryId);
        }

        $menuData = $query->select([
            'mi.id',
            'mi.name',
            'mc.name as category_name',
            'mi.price',
            DB::raw('SUM(oi.quantity) as quantity_sold'),
            DB::raw('SUM(oi.quantity * oi.unit_price) as total_revenue'),
            DB::raw('AVG(oi.unit_price) as average_price'),
            DB::raw('(SUM(oi.quantity * oi.unit_price) - SUM(oi.quantity * mi.cost_price)) as profit'),
            DB::raw('((SUM(oi.quantity * oi.unit_price) - SUM(oi.quantity * mi.cost_price)) / SUM(oi.quantity * oi.unit_price) * 100) as profit_margin')
        ])
        ->groupBy('mi.id', 'mi.name', 'mc.name', 'mi.price')
        ->orderBy('quantity_sold', 'DESC')
        ->get();

        return [
            'data' => $menuData,
            'top_performers' => $menuData->take(10),
            'low_performers' => $menuData->sortBy('quantity_sold')->take(10),
            'profitability_analysis' => $this->analyzeProfitability($menuData)
        ];
    }

    public function generateKitchenEfficiencyReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subDays(7);
        $endDate = $filters['end_date'] ?? now();

        $kitchenData = DB::table('orders as o')
            ->join('kitchen_orders as ko', 'o.id', '=', 'ko.order_id')
            ->whereBetween('o.created_at', [$startDate, $endDate])
            ->where('o.status', 'completed')
            ->select([
                DB::raw('DATE(o.created_at) as date'),
                DB::raw('o.shift_type'),
                DB::raw('AVG(TIMESTAMPDIFF(MINUTE, ko.started_at, ko.completed_at)) as avg_prep_time'),
                DB::raw('COUNT(CASE WHEN ko.status = "completed" THEN 1 END) / COUNT(*) * 100 as completion_rate'),
                DB::raw('COUNT(CASE WHEN ko.status = "cancelled" THEN 1 END) / COUNT(*) * 100 as cancellation_rate'),
                DB::raw('COUNT(*) as total_orders')
            ])
            ->groupBy('date', 'shift_type')
            ->orderBy('date')
            ->get();

        return [
            'data' => $kitchenData,
            'efficiency_trends' => $this->calculateEfficiencyTrends($kitchenData),
            'bottlenecks' => $this->identifyBottlenecks($kitchenData)
        ];
    }

    public function generateTableTurnoverReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subDays(30);
        $endDate = $filters['end_date'] ?? now();

        $tableData = DB::table('reservations as r')
            ->join('restaurant_tables as rt', 'r.table_id', '=', 'rt.id')
            ->whereBetween('r.reservation_date', [$startDate, $endDate])
            ->where('r.status', 'completed')
            ->select([
                'rt.id as table_id',
                'rt.table_number',
                'rt.capacity',
                DB::raw('COUNT(r.id) as total_reservations'),
                DB::raw('AVG(TIMESTAMPDIFF(MINUTE, r.start_time, r.end_time)) as avg_dining_duration'),
                DB::raw('SUM(r.total_amount) as total_revenue'),
                DB::raw('AVG(r.total_amount) as avg_revenue_per_seating')
            ])
            ->groupBy('rt.id', 'rt.table_number', 'rt.capacity')
            ->orderBy('total_revenue', 'DESC')
            ->get();

        return [
            'data' => $tableData,
            'utilization_analysis' => $this->calculateTableUtilization($tableData),
            'revenue_optimization' => $this->suggestRevenueOptimization($tableData)
        ];
    }

    public function generateCostAnalysisReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subDays(30);
        $endDate = $filters['end_date'] ?? now();

        // Food cost analysis
        $foodCosts = DB::table('order_items as oi')
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->join('menu_items as mi', 'oi.menu_item_id', '=', 'mi.id')
            ->whereBetween('o.created_at', [$startDate, $endDate])
            ->where('o.status', 'completed')
            ->select([
                DB::raw('DATE(o.created_at) as date'),
                DB::raw('SUM(oi.quantity * mi.cost_price) as total_food_cost'),
                DB::raw('SUM(oi.quantity * oi.unit_price) as total_revenue'),
                DB::raw('(SUM(oi.quantity * mi.cost_price) / SUM(oi.quantity * oi.unit_price) * 100) as food_cost_percentage')
            ])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Labor cost analysis (assuming staff_shifts table exists)
        $laborCosts = DB::table('staff_shifts as ss')
            ->join('users as u', 'ss.user_id', '=', 'u.id')
            ->whereBetween('ss.shift_date', [$startDate, $endDate])
            ->where('u.department', 'restaurant')
            ->select([
                DB::raw('DATE(ss.shift_date) as date'),
                DB::raw('SUM(ss.hours_worked * u.hourly_rate) as total_labor_cost')
            ])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'food_costs' => $foodCosts,
            'labor_costs' => $laborCosts,
            'cost_trends' => $this->analyzeCostTrends($foodCosts, $laborCosts),
            'optimization_suggestions' => $this->generateCostOptimizationSuggestions($foodCosts, $laborCosts)
        ];
    }

    private function calculateSalesSummary($salesData): array
    {
        $totalRevenue = $salesData->sum('total_revenue');
        $totalOrders = $salesData->sum('total_orders');
        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        return [
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'average_order_value' => round($averageOrderValue, 2),
            'peak_day' => $salesData->sortByDesc('total_revenue')->first(),
            'growth_rate' => $this->calculateGrowthRate($salesData)
        ];
    }

    private function calculateEfficiencyTrends($kitchenData): array
    {
        return [
            'avg_prep_time_trend' => $this->calculateTrend($kitchenData, 'avg_prep_time'),
            'completion_rate_trend' => $this->calculateTrend($kitchenData, 'completion_rate'),
            'peak_efficiency_times' => $this->identifyPeakTimes($kitchenData)
        ];
    }

    private function calculateTableUtilization($tableData): array
    {
        $avgUtilization = $tableData->avg('total_reservations');
        $topPerformers = $tableData->sortByDesc('total_revenue')->take(5);
        $underUtilized = $tableData->sortBy('total_reservations')->take(5);

        return [
            'average_utilization' => round($avgUtilization, 2),
            'top_performers' => $topPerformers,
            'under_utilized' => $underUtilized,
            'optimization_score' => $this->calculateOptimizationScore($tableData)
        ];
    }
}
```

#### 2.2 Restaurant Reports Controller
```php
// app/Http/Controllers/Api/Reports/RestaurantReportsController.php
<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use App\Services\Reporting\RestaurantAnalyticsService;
use App\Http\Requests\ReportFilterRequest;
use Illuminate\Http\JsonResponse;

class RestaurantReportsController extends Controller
{
    private RestaurantAnalyticsService $analyticsService;

    public function __construct(RestaurantAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function salesReport(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateSalesReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function menuPerformance(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateMenuPerformanceReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function kitchenEfficiency(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateKitchenEfficiencyReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function tableTurnover(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateTableTurnoverReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function costAnalysis(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateCostAnalysisReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function restaurantDashboard(ReportFilterRequest $request): JsonResponse
    {
        $dashboard = [
            'sales_overview' => $this->analyticsService->generateSalesReport($request->validated()),
            'top_menu_items' => $this->analyticsService->generateMenuPerformanceReport($request->validated())['top_performers'],
            'kitchen_efficiency' => $this->analyticsService->generateKitchenEfficiencyReport($request->validated()),
            'table_utilization' => $this->analyticsService->generateTableTurnoverReport($request->validated())['utilization_analysis']
        ];

        return response()->json([
            'success' => true,
            'data' => $dashboard,
            'generated_at' => now()->toISOString()
        ]);
    }
}
```

### 3. Frontend Implementation

#### 3.1 Restaurant Reports Dashboard
```typescript
// src/components/reports/restaurant/RestaurantReportsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Select, Tabs, Spin } from 'antd';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { restaurantReportsAPI } from '../../../services/api/reports';
import { SalesOverviewCard } from './components/SalesOverviewCard';
import { MenuPerformanceTable } from './components/MenuPerformanceTable';
import { KitchenEfficiencyChart } from './components/KitchenEfficiencyChart';
import { TableUtilizationChart } from './components/TableUtilizationChart';
import { CostAnalysisChart } from './components/CostAnalysisChart';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

interface RestaurantDashboardData {
  sales_overview: any;
  top_menu_items: any[];
  kitchen_efficiency: any;
  table_utilization: any;
}

export const RestaurantReportsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<RestaurantDashboardData | null>(null);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [shiftType, setShiftType] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, shiftType]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const filters = {
        start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
        end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
        shift_type: shiftType !== 'all' ? shiftType : undefined
      };

      const response = await restaurantReportsAPI.getDashboard(filters);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading restaurant dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="restaurant-reports-dashboard">
      <div className="dashboard-header">
        <h2>Restaurant Operations Dashboard</h2>
        <div className="dashboard-filters">
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ marginRight: 16 }}
          />
          <Select
            value={shiftType}
            onChange={setShiftType}
            style={{ width: 120 }}
          >
            <Option value="all">All Shifts</Option>
            <Option value="breakfast">Breakfast</Option>
            <Option value="lunch">Lunch</Option>
            <Option value="dinner">Dinner</Option>
          </Select>
        </div>
      </div>

      <Spin spinning={loading}>
        <Tabs defaultActiveKey="overview" type="card">
          <TabPane tab="Overview" key="overview">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <SalesOverviewCard data={dashboardData?.sales_overview} />
              </Col>
              <Col span={12}>
                <MenuPerformanceTable data={dashboardData?.top_menu_items} />
              </Col>
              <Col span={12}>
                <KitchenEfficiencyChart data={dashboardData?.kitchen_efficiency} />
              </Col>
              <Col span={24}>
                <TableUtilizationChart data={dashboardData?.table_utilization} />
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Sales Analysis" key="sales">
            <SalesAnalysisTab dateRange={dateRange} shiftType={shiftType} />
          </TabPane>

          <TabPane tab="Menu Performance" key="menu">
            <MenuPerformanceTab dateRange={dateRange} />
          </TabPane>

          <TabPane tab="Kitchen Efficiency" key="kitchen">
            <KitchenEfficiencyTab dateRange={dateRange} />
          </TabPane>

          <TabPane tab="Cost Analysis" key="costs">
            <CostAnalysisTab dateRange={dateRange} />
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};
```

#### 3.2 Sales Analysis Component
```typescript
// src/components/reports/restaurant/SalesAnalysisTab.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { restaurantReportsAPI } from '../../../services/api/reports';

interface SalesAnalysisProps {
  dateRange: [moment.Moment, moment.Moment] | null;
  shiftType: string;
}

export const SalesAnalysisTab: React.FC<SalesAnalysisProps> = ({
  dateRange,
  shiftType
}) => {
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSalesData();
  }, [dateRange, shiftType]);

  const loadSalesData = async () => {
    setLoading(true);
    try {
      const filters = {
        start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
        end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
        shift_type: shiftType !== 'all' ? shiftType : undefined
      };

      const response = await restaurantReportsAPI.getSalesReport(filters);
      setSalesData(response.data);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Shift',
      dataIndex: 'shift_type',
      key: 'shift_type',
    },
    {
      title: 'Revenue',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Orders',
      dataIndex: 'total_orders',
      key: 'total_orders',
    },
    {
      title: 'Avg Order Value',
      dataIndex: 'average_order_value',
      key: 'average_order_value',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
  ];

  return (
    <div className="sales-analysis-tab">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={salesData?.summary?.total_revenue || 0}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={salesData?.summary?.total_orders || 0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Order Value"
              value={salesData?.summary?.average_order_value || 0}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Growth Rate"
              value={salesData?.summary?.growth_rate || 0}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Sales Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData?.data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_revenue"
                  stroke="#8884d8"
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="total_orders"
                  stroke="#82ca9d"
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Detailed Sales Data">
            <Table
              columns={columns}
              dataSource={salesData?.data || []}
              loading={loading}
              pagination={{ pageSize: 10 }}
              rowKey="date"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
```

### 4. API Routes

```php
// routes/api.php (Restaurant Reports section)
Route::prefix('reports/restaurant')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', [RestaurantReportsController::class, 'restaurantDashboard']);
    Route::get('/sales', [RestaurantReportsController::class, 'salesReport']);
    Route::get('/menu-performance', [RestaurantReportsController::class, 'menuPerformance']);
    Route::get('/kitchen-efficiency', [RestaurantReportsController::class, 'kitchenEfficiency']);
    Route::get('/table-turnover', [RestaurantReportsController::class, 'tableTurnover']);
    Route::get('/cost-analysis', [RestaurantReportsController::class, 'costAnalysis']);
});
```

### 5. Testing Requirements

#### 5.1 Unit Tests
- Restaurant analytics service methods
- Report calculation accuracy
- Data aggregation functions

#### 5.2 Integration Tests
- API endpoint responses
- Database query performance
- Report generation workflow

#### 5.3 Performance Tests
- Large dataset handling
- Report generation speed
- Concurrent user access

### 6. Documentation

#### 6.1 API Documentation
- Restaurant reports endpoints
- Request/response formats
- Filter parameters

#### 6.2 User Guide
- Report interpretation
- Best practices for restaurant analysis
- Performance optimization tips

## Acceptance Criteria

- [ ] All restaurant reports generate accurate data
- [ ] Sales analysis shows revenue trends and patterns
- [ ] Menu performance identifies top and bottom performers
- [ ] Kitchen efficiency tracks preparation times and completion rates
- [ ] Table turnover analysis optimizes seating utilization
- [ ] Cost analysis tracks food and labor costs
- [ ] Reports export to PDF, Excel, and CSV formats
- [ ] Real-time dashboard updates
- [ ] Mobile-responsive design
- [ ] Role-based access control implemented
- [ ] Performance optimized for large datasets
- [ ] Comprehensive test coverage (>80%)

## Dependencies

- Issue #01: Core reporting infrastructure
- Restaurant management system (Phase 3)
- Order management system
- Menu management system

## Notes

- Implement caching for frequently accessed reports
- Consider real-time updates for dashboard metrics
- Ensure data privacy and access controls
- Plan for scalability with increasing data volume
