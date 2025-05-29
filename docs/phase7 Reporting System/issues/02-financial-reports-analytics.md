# Issue #02: Financial Reports and Analytics

## Overview
Implement comprehensive financial reporting and analytics capabilities including revenue tracking, cost analysis, profitability reports, billing analytics, and financial performance dashboards. This module provides critical business intelligence for financial decision-making and performance monitoring.

## Priority
**High** - Essential for business operations and financial management

## Estimated Timeline
**5 days (Week 1-2)**

## Requirements

### 1. Revenue Dashboard
- **Revenue Summary Cards**: Daily, weekly, monthly, yearly totals
- **Revenue by Module**: Accommodation, activities, restaurant breakdown
- **Revenue Trends**: Interactive charts with drill-down capabilities
- **Financial KPIs**: ADR, RevPAR, average guest spend, conversion rates
- **Year-over-Year Comparison**: Historical revenue analysis

### 2. Cost Analysis Reports
- **Cost Overview**: Total costs by category and department
- **Cost Trends**: Historical cost analysis and projections
- **Budget vs Actual**: Variance analysis and budget tracking
- **Profitability Analysis**: Gross margins and net profit calculations
- **Cost Per Guest**: Operational efficiency metrics

### 3. Billing and Payment Reports
- **Payment Summary**: Daily collections and payment methods
- **Outstanding Balances**: Accounts receivable tracking
- **Billing Analytics**: Average bill amounts and payment patterns
- **Refund Tracking**: Refund analysis and adjustment reporting

### 4. Financial Performance Metrics
- **Operational Efficiency**: Cost ratios and productivity metrics
- **Revenue Optimization**: Pricing analysis and opportunity identification
- **Cash Flow Analysis**: Inflow and outflow tracking
- **Seasonal Analysis**: Performance by season and period

## Technical Specifications

### Backend Implementation

#### Financial Report Services
```php
// Financial Reporting Services
app/Services/Reporting/Financial/
├── RevenueAnalyticsService.php      // Revenue calculations and analytics
├── CostAnalysisService.php          // Cost tracking and analysis
├── BillingReportService.php         // Billing and payment analytics
├── FinancialMetricsService.php      // KPI calculations
├── ProfitabilityService.php         // Profit analysis
└── CashFlowService.php              // Cash flow analytics

// Controllers
app/Http/Controllers/Reporting/Financial/
├── RevenueController.php            // Revenue endpoints
├── CostAnalysisController.php       // Cost analysis endpoints
├── BillingController.php            // Billing reports
└── FinancialDashboardController.php // Dashboard data
```

#### Revenue Analytics Service
```php
<?php

namespace App\Services\Reporting\Financial;

use App\Models\Booking;
use App\Models\ActivityBooking;
use App\Models\RestaurantOrder;
use App\Services\Reporting\BaseReportService;
use Carbon\Carbon;

class RevenueAnalyticsService extends BaseReportService
{
    public function getRevenueSummary(string $period, array $filters = []): array
    {
        $dateRange = $this->getDateRange($period, $filters);
        
        return [
            'total_revenue' => $this->getTotalRevenue($dateRange, $filters),
            'accommodation_revenue' => $this->getAccommodationRevenue($dateRange, $filters),
            'activity_revenue' => $this->getActivityRevenue($dateRange, $filters),
            'restaurant_revenue' => $this->getRestaurantRevenue($dateRange, $filters),
            'revenue_trends' => $this->getRevenueTrends($dateRange, $filters),
            'kpis' => $this->getRevenueKPIs($dateRange, $filters),
        ];
    }

    public function getRevenueTrends(array $dateRange, array $filters = []): array
    {
        $cacheKey = "revenue_trends:" . md5(serialize([$dateRange, $filters]));
        
        return cache()->remember($cacheKey, 1800, function () use ($dateRange, $filters) {
            $trends = [];
            $currentDate = Carbon::parse($dateRange['start']);
            $endDate = Carbon::parse($dateRange['end']);

            while ($currentDate <= $endDate) {
                $dayRevenue = [
                    'date' => $currentDate->format('Y-m-d'),
                    'accommodation' => $this->getDailyAccommodationRevenue($currentDate, $filters),
                    'activities' => $this->getDailyActivityRevenue($currentDate, $filters),
                    'restaurant' => $this->getDailyRestaurantRevenue($currentDate, $filters),
                ];
                
                $dayRevenue['total'] = array_sum(array_slice($dayRevenue, 1));
                $trends[] = $dayRevenue;
                
                $currentDate->addDay();
            }

            return $trends;
        });
    }

    public function getRevenueKPIs(array $dateRange, array $filters = []): array
    {
        return [
            'adr' => $this->calculateADR($dateRange, $filters),
            'revpar' => $this->calculateRevPAR($dateRange, $filters),
            'average_guest_spend' => $this->calculateAverageGuestSpend($dateRange, $filters),
            'conversion_rate' => $this->calculateConversionRate($dateRange, $filters),
            'revenue_per_square_meter' => $this->calculateRevenuePerSqm($dateRange, $filters),
        ];
    }

    private function calculateADR(array $dateRange, array $filters): float
    {
        $totalRevenue = Booking::whereBetween('check_in_date', [$dateRange['start'], $dateRange['end']])
            ->where('status', 'confirmed')
            ->sum('total_amount');

        $totalRooms = Booking::whereBetween('check_in_date', [$dateRange['start'], $dateRange['end']])
            ->where('status', 'confirmed')
            ->count();

        return $totalRooms > 0 ? round($totalRevenue / $totalRooms, 2) : 0;
    }

    private function calculateRevPAR(array $dateRange, array $filters): float
    {
        $totalRevenue = $this->getAccommodationRevenue($dateRange, $filters);
        $availableRoomNights = $this->calculateAvailableRoomNights($dateRange);

        return $availableRoomNights > 0 ? round($totalRevenue / $availableRoomNights, 2) : 0;
    }
}
```

#### Cost Analysis Service
```php
<?php

namespace App\Services\Reporting\Financial;

use App\Models\Expense;
use App\Models\Staff;
use App\Models\InventoryTransaction;
use App\Services\Reporting\BaseReportService;

class CostAnalysisService extends BaseReportService
{
    public function getCostAnalysis(string $period, array $filters = []): array
    {
        $dateRange = $this->getDateRange($period, $filters);
        
        return [
            'total_costs' => $this->getTotalCosts($dateRange, $filters),
            'cost_breakdown' => $this->getCostBreakdown($dateRange, $filters),
            'cost_trends' => $this->getCostTrends($dateRange, $filters),
            'budget_variance' => $this->getBudgetVariance($dateRange, $filters),
            'cost_per_guest' => $this->getCostPerGuest($dateRange, $filters),
        ];
    }

    public function getCostBreakdown(array $dateRange, array $filters = []): array
    {
        return [
            'staff_costs' => $this->getStaffCosts($dateRange, $filters),
            'inventory_costs' => $this->getInventoryCosts($dateRange, $filters),
            'utilities_costs' => $this->getUtilitiesCosts($dateRange, $filters),
            'maintenance_costs' => $this->getMaintenanceCosts($dateRange, $filters),
            'marketing_costs' => $this->getMarketingCosts($dateRange, $filters),
            'administrative_costs' => $this->getAdministrativeCosts($dateRange, $filters),
        ];
    }

    public function getProfitabilityAnalysis(array $dateRange, array $filters = []): array
    {
        $revenue = app(RevenueAnalyticsService::class)->getTotalRevenue($dateRange, $filters);
        $costs = $this->getTotalCosts($dateRange, $filters);

        return [
            'gross_revenue' => $revenue,
            'total_costs' => $costs,
            'gross_profit' => $revenue - $costs,
            'gross_margin' => $revenue > 0 ? round((($revenue - $costs) / $revenue) * 100, 2) : 0,
            'cost_ratio' => $revenue > 0 ? round(($costs / $revenue) * 100, 2) : 0,
            'profit_by_module' => $this->getProfitByModule($dateRange, $filters),
        ];
    }
}
```

### API Endpoints

#### Revenue Analytics APIs
```php
// routes/api.php - Financial Reporting Routes
Route::prefix('reporting/financial')->middleware(['auth:sanctum'])->group(function () {
    // Revenue Analytics
    Route::get('/revenue/summary', [RevenueController::class, 'getSummary']);
    Route::get('/revenue/trends', [RevenueController::class, 'getTrends']);
    Route::get('/revenue/breakdown', [RevenueController::class, 'getBreakdown']);
    Route::get('/revenue/kpis', [RevenueController::class, 'getKPIs']);
    
    // Cost Analysis
    Route::get('/costs/analysis', [CostAnalysisController::class, 'getAnalysis']);
    Route::get('/costs/breakdown', [CostAnalysisController::class, 'getBreakdown']);
    Route::get('/costs/trends', [CostAnalysisController::class, 'getTrends']);
    Route::get('/costs/budget-variance', [CostAnalysisController::class, 'getBudgetVariance']);
    
    // Billing Reports
    Route::get('/billing/summary', [BillingController::class, 'getSummary']);
    Route::get('/billing/payments', [BillingController::class, 'getPayments']);
    Route::get('/billing/outstanding', [BillingController::class, 'getOutstanding']);
    Route::get('/billing/analytics', [BillingController::class, 'getAnalytics']);
    
    // Financial Dashboard
    Route::get('/dashboard', [FinancialDashboardController::class, 'getDashboard']);
    Route::get('/dashboard/kpis', [FinancialDashboardController::class, 'getKPIs']);
    Route::get('/dashboard/alerts', [FinancialDashboardController::class, 'getAlerts']);
});
```

### Frontend Implementation

#### Financial Dashboard Component
```typescript
// src/components/Reporting/Financial/FinancialDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Select, Spin } from 'antd';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useFinancialReports } from '../../../hooks/useFinancialReports';
import RevenueSummaryCards from './RevenueSummaryCards';
import RevenueTrendsChart from './RevenueTrendsChart';
import CostAnalysisChart from './CostAnalysisChart';
import FinancialKPIs from './FinancialKPIs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface FinancialDashboardProps {
  userRole: string;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ userRole }) => {
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [filters, setFilters] = useState({
    module: 'all',
    department: 'all',
  });

  const {
    revenueSummary,
    costAnalysis,
    billingData,
    kpis,
    loading,
    error,
    refreshData,
  } = useFinancialReports(dateRange, filters);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Financial Performance Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('th-TH', {
              style: 'currency',
              currency: 'THB',
            }).format(value);
          },
        },
      },
    },
  };

  return (
    <div className="financial-dashboard">
      <div className="dashboard-header">
        <Row justify="space-between" align="middle">
          <Col>
            <h2>Financial Reports & Analytics</h2>
          </Col>
          <Col>
            <div className="dashboard-filters">
              <RangePicker
                onChange={(dates, dateStrings) => setDateRange(dateStrings as [string, string])}
                style={{ marginRight: 16 }}
              />
              <Select
                value={filters.module}
                onChange={(value) => setFilters({ ...filters, module: value })}
                style={{ width: 150, marginRight: 16 }}
              >
                <Option value="all">All Modules</Option>
                <Option value="accommodation">Accommodation</Option>
                <Option value="activities">Activities</Option>
                <Option value="restaurant">Restaurant</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </div>

      <Spin spinning={loading}>
        {/* Revenue Summary Cards */}
        <RevenueSummaryCards data={revenueSummary} />

        {/* Financial KPIs */}
        <FinancialKPIs data={kpis} />

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {/* Revenue Trends Chart */}
          <Col span={16}>
            <Card title="Revenue Trends">
              <RevenueTrendsChart 
                data={revenueSummary?.trends} 
                options={chartOptions} 
              />
            </Card>
          </Col>

          {/* Revenue Breakdown */}
          <Col span={8}>
            <Card title="Revenue by Module">
              <Pie
                data={{
                  labels: ['Accommodation', 'Activities', 'Restaurant'],
                  datasets: [{
                    data: [
                      revenueSummary?.accommodation_revenue || 0,
                      revenueSummary?.activity_revenue || 0,
                      revenueSummary?.restaurant_revenue || 0,
                    ],
                    backgroundColor: [
                      '#2563EB',
                      '#059669',
                      '#D97706',
                    ],
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {/* Cost Analysis */}
          <Col span={12}>
            <Card title="Cost Analysis">
              <CostAnalysisChart data={costAnalysis} />
            </Card>
          </Col>

          {/* Profitability Analysis */}
          <Col span={12}>
            <Card title="Profitability Analysis">
              <div className="profitability-metrics">
                <div className="metric-item">
                  <span className="metric-label">Gross Profit:</span>
                  <span className="metric-value">
                    {new Intl.NumberFormat('th-TH', {
                      style: 'currency',
                      currency: 'THB',
                    }).format(costAnalysis?.gross_profit || 0)}
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Gross Margin:</span>
                  <span className="metric-value">{costAnalysis?.gross_margin || 0}%</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Cost Ratio:</span>
                  <span className="metric-value">{costAnalysis?.cost_ratio || 0}%</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default FinancialDashboard;
```

#### Revenue Summary Cards Component
```typescript
// src/components/Reporting/Financial/RevenueSummaryCards.tsx
import React from 'react';
import { Card, Row, Col, Statistic, Badge } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface RevenueSummaryProps {
  data: {
    total_revenue: number;
    accommodation_revenue: number;
    activity_revenue: number;
    restaurant_revenue: number;
    growth_rate: number;
    previous_period: number;
  };
}

const RevenueSummaryCards: React.FC<RevenueSummaryProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthIcon = (rate: number) => {
    return rate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  const getGrowthColor = (rate: number) => {
    return rate >= 0 ? '#3f8600' : '#cf1322';
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Total Revenue"
            value={data?.total_revenue || 0}
            formatter={(value) => formatCurrency(Number(value))}
            prefix={getGrowthIcon(data?.growth_rate || 0)}
            valueStyle={{ color: getGrowthColor(data?.growth_rate || 0) }}
          />
          <div style={{ marginTop: 8 }}>
            <Badge 
              color={data?.growth_rate >= 0 ? 'green' : 'red'}
              text={`${Math.abs(data?.growth_rate || 0).toFixed(1)}% vs previous period`}
            />
          </div>
        </Card>
      </Col>

      <Col span={6}>
        <Card>
          <Statistic
            title="Accommodation Revenue"
            value={data?.accommodation_revenue || 0}
            formatter={(value) => formatCurrency(Number(value))}
            valueStyle={{ color: '#2563EB' }}
          />
          <div style={{ marginTop: 8 }}>
            <Badge 
              color="blue"
              text={`${((data?.accommodation_revenue / data?.total_revenue) * 100).toFixed(1)}% of total`}
            />
          </div>
        </Card>
      </Col>

      <Col span={6}>
        <Card>
          <Statistic
            title="Activity Revenue"
            value={data?.activity_revenue || 0}
            formatter={(value) => formatCurrency(Number(value))}
            valueStyle={{ color: '#059669' }}
          />
          <div style={{ marginTop: 8 }}>
            <Badge 
              color="green"
              text={`${((data?.activity_revenue / data?.total_revenue) * 100).toFixed(1)}% of total`}
            />
          </div>
        </Card>
      </Col>

      <Col span={6}>
        <Card>
          <Statistic
            title="Restaurant Revenue"
            value={data?.restaurant_revenue || 0}
            formatter={(value) => formatCurrency(Number(value))}
            valueStyle={{ color: '#D97706' }}
          />
          <div style={{ marginTop: 8 }}>
            <Badge 
              color="orange"
              text={`${((data?.restaurant_revenue / data?.total_revenue) * 100).toFixed(1)}% of total`}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default RevenueSummaryCards;
```

## Implementation Phases

### Phase 1: Revenue Analytics (2 days)
1. **Revenue Service Development**
   - Implement RevenueAnalyticsService
   - Create revenue calculation methods
   - Build KPI calculation functions

2. **Revenue API Endpoints**
   - Develop RevenueController
   - Create revenue summary endpoints
   - Implement revenue trends APIs

3. **Revenue Frontend Components**
   - Build RevenueSummaryCards component
   - Create RevenueTrendsChart component
   - Implement revenue filtering

### Phase 2: Cost Analysis (1.5 days)
1. **Cost Analysis Service**
   - Implement CostAnalysisService
   - Create cost breakdown methods
   - Build profitability calculations

2. **Cost Analysis APIs**
   - Develop CostAnalysisController
   - Create cost breakdown endpoints
   - Implement budget variance APIs

3. **Cost Analysis Frontend**
   - Build CostAnalysisChart component
   - Create cost breakdown displays
   - Implement profitability visualization

### Phase 3: Billing and Payment Reports (1 day)
1. **Billing Service Development**
   - Implement BillingReportService
   - Create payment analytics methods
   - Build outstanding balance tracking

2. **Billing API Endpoints**
   - Develop BillingController
   - Create payment summary endpoints
   - Implement billing analytics APIs

3. **Billing Frontend Components**
   - Build billing summary displays
   - Create payment analytics charts
   - Implement outstanding balance reports

### Phase 4: Integration and Testing (0.5 days)
1. **Component Integration**
   - Integrate all financial components
   - Implement unified dashboard
   - Add export functionality

2. **Testing and Optimization**
   - Test all financial reports
   - Optimize query performance
   - Validate calculations

## Quality Assurance

### Testing Requirements
1. **Unit Tests**
   - Service method testing
   - Calculation validation
   - API endpoint testing

2. **Integration Tests**
   - Database integration testing
   - Cache functionality testing
   - Cross-module data testing

3. **Performance Tests**
   - Large dataset handling
   - Query optimization testing
   - Cache efficiency validation

## Success Metrics

### Performance Metrics
- **Report Generation**: < 15 seconds for financial reports
- **Data Accuracy**: 100% accuracy in calculations
- **Cache Efficiency**: > 85% cache hit rate
- **API Response Time**: < 3 seconds for dashboard data

### Business Metrics
- **KPI Accuracy**: Validated against manual calculations
- **User Adoption**: Financial reports accessed daily
- **Decision Support**: Reports used for business decisions
- **Export Usage**: Regular export of financial data

## Risk Mitigation

### Data Accuracy Risks
- **Calculation Validation**: Comprehensive testing of all calculations
- **Data Consistency**: Regular data validation checks
- **Audit Trails**: Tracking of all financial calculations

### Performance Risks
- **Large Dataset Handling**: Implement pagination and chunking
- **Complex Calculations**: Optimize database queries
- **Cache Management**: Efficient cache invalidation strategies

## Dependencies

### Internal Dependencies
- **Issue #01**: Core reporting architecture
- **Phase 2**: Accommodation booking data
- **Phase 3**: Restaurant billing data
- **Phase 4**: Inventory cost data

### External Dependencies
- **Chart.js**: For financial visualizations
- **Ant Design**: For UI components
- **Laravel Excel**: For export functionality

## Deliverables

### Backend Deliverables
- [ ] Revenue analytics service
- [ ] Cost analysis service
- [ ] Billing report service
- [ ] Financial API controllers
- [ ] Database optimizations

### Frontend Deliverables
- [ ] Financial dashboard component
- [ ] Revenue summary cards
- [ ] Cost analysis charts
- [ ] Billing report displays
- [ ] Export functionality

### Testing Deliverables
- [ ] Unit test suite
- [ ] Integration tests
- [ ] Performance tests
- [ ] Calculation validation tests

---

**Estimated Completion**: End of Week 2
**Next Phase**: Accommodation Performance Reports (Issue #03)
