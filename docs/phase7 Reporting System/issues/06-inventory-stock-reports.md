# Issue #06: Inventory and Stock Reports

**Priority:** Medium  
**Estimated Time:** 8-10 days  
**Dependencies:** Issues #01, #05  
**Assignee:** Backend Developer + Frontend Developer

## Overview
Implement comprehensive inventory management reporting system covering stock levels, consumption patterns, supplier performance, cost analysis, and automated reordering alerts.

## Requirements

### 1. Database Schema Extensions

#### 1.1 Inventory Analytics Tables
```sql
-- Inventory movement tracking
CREATE TABLE inventory_movements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inventory_item_id BIGINT UNSIGNED NOT NULL,
    movement_type ENUM('in', 'out', 'adjustment', 'waste', 'transfer') NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    reference_type VARCHAR(50), -- 'purchase', 'order', 'adjustment', 'waste'
    reference_id BIGINT UNSIGNED,
    notes TEXT,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_inventory_movements_item (inventory_item_id),
    INDEX idx_inventory_movements_type (movement_type),
    INDEX idx_inventory_movements_date (created_at),
    INDEX idx_inventory_movements_reference (reference_type, reference_id)
);

-- Daily inventory snapshots
CREATE TABLE inventory_snapshots (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inventory_item_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    opening_stock DECIMAL(10,3) DEFAULT 0,
    closing_stock DECIMAL(10,3) DEFAULT 0,
    total_in DECIMAL(10,3) DEFAULT 0,
    total_out DECIMAL(10,3) DEFAULT 0,
    adjustments DECIMAL(10,3) DEFAULT 0,
    waste_quantity DECIMAL(10,3) DEFAULT 0,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(12,2) GENERATED ALWAYS AS (closing_stock * unit_cost) STORED,
    turnover_rate DECIMAL(8,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    UNIQUE KEY uk_inventory_snapshot_item_date (inventory_item_id, date),
    INDEX idx_inventory_snapshots_date (date),
    INDEX idx_inventory_snapshots_item (inventory_item_id)
);

-- Supplier performance metrics
CREATE TABLE supplier_performance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT UNSIGNED NOT NULL,
    month CHAR(7) NOT NULL, -- YYYY-MM format
    total_orders INT DEFAULT 0,
    orders_on_time INT DEFAULT 0,
    orders_complete INT DEFAULT 0,
    total_order_value DECIMAL(15,2) DEFAULT 0,
    average_delivery_time DECIMAL(5,2) DEFAULT 0, -- in days
    quality_score DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    price_competitiveness DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    overall_rating DECIMAL(3,2) DEFAULT 0, -- 0-10 scale
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_supplier_performance_month (supplier_id, month),
    INDEX idx_supplier_performance_month (month),
    INDEX idx_supplier_performance_rating (overall_rating)
);

-- Stock alerts and thresholds
CREATE TABLE stock_alerts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inventory_item_id BIGINT UNSIGNED NOT NULL,
    alert_type ENUM('low_stock', 'out_of_stock', 'overstock', 'expiring_soon', 'expired') NOT NULL,
    current_quantity DECIMAL(10,3) NOT NULL,
    threshold_quantity DECIMAL(10,3),
    expiry_date DATE,
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    status ENUM('active', 'acknowledged', 'resolved') NOT NULL DEFAULT 'active',
    acknowledged_by BIGINT UNSIGNED,
    acknowledged_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (acknowledged_by) REFERENCES users(id),
    INDEX idx_stock_alerts_item (inventory_item_id),
    INDEX idx_stock_alerts_type (alert_type),
    INDEX idx_stock_alerts_status (status),
    INDEX idx_stock_alerts_priority (priority)
);

-- ABC analysis results
CREATE TABLE abc_analysis (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inventory_item_id BIGINT UNSIGNED NOT NULL,
    analysis_period_start DATE NOT NULL,
    analysis_period_end DATE NOT NULL,
    annual_consumption_value DECIMAL(15,2) NOT NULL,
    consumption_percentage DECIMAL(5,2) NOT NULL,
    abc_category ENUM('A', 'B', 'C') NOT NULL,
    velocity_category ENUM('fast', 'medium', 'slow') NOT NULL,
    reorder_point DECIMAL(10,3) NOT NULL,
    optimal_order_quantity DECIMAL(10,3) NOT NULL,
    safety_stock DECIMAL(10,3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    INDEX idx_abc_analysis_item (inventory_item_id),
    INDEX idx_abc_analysis_category (abc_category),
    INDEX idx_abc_analysis_period (analysis_period_start, analysis_period_end)
);
```

### 2. Backend Implementation

#### 2.1 Inventory Analytics Service
```php
// app/Services/Reporting/InventoryAnalyticsService.php
<?php

namespace App\Services\Reporting;

use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\Supplier;
use App\Services\Reporting\BaseReportService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InventoryAnalyticsService extends BaseReportService
{
    public function generateStockLevelsReport(array $filters = []): array
    {
        $categoryId = $filters['category_id'] ?? null;
        $lowStockOnly = $filters['low_stock_only'] ?? false;
        $date = $filters['date'] ?? now()->toDateString();

        $query = DB::table('inventory_items as ii')
            ->leftJoin('inventory_categories as ic', 'ii.category_id', '=', 'ic.id')
            ->leftJoin('inventory_snapshots as is', function($join) use ($date) {
                $join->on('ii.id', '=', 'is.inventory_item_id')
                     ->where('is.date', '=', $date);
            })
            ->select([
                'ii.id',
                'ii.name',
                'ii.sku',
                'ic.name as category_name',
                'ii.unit',
                'ii.current_stock',
                'ii.minimum_stock',
                'ii.maximum_stock',
                'ii.reorder_point',
                'ii.cost_per_unit',
                DB::raw('(ii.current_stock * ii.cost_per_unit) as current_value'),
                DB::raw('CASE 
                    WHEN ii.current_stock <= 0 THEN "out_of_stock"
                    WHEN ii.current_stock <= ii.minimum_stock THEN "low_stock" 
                    WHEN ii.current_stock >= ii.maximum_stock THEN "overstock"
                    ELSE "normal" 
                END as stock_status'),
                'is.turnover_rate',
                'is.waste_quantity'
            ]);

        if ($categoryId) {
            $query->where('ii.category_id', $categoryId);
        }

        if ($lowStockOnly) {
            $query->where('ii.current_stock', '<=', DB::raw('ii.minimum_stock'));
        }

        $stockData = $query->orderBy('ii.name')->get();

        return [
            'data' => $stockData,
            'summary' => $this->calculateStockSummary($stockData),
            'alerts' => $this->generateStockAlerts($stockData),
            'total_value' => $stockData->sum('current_value')
        ];
    }

    public function generateConsumptionReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subDays(30);
        $endDate = $filters['end_date'] ?? now();
        $categoryId = $filters['category_id'] ?? null;

        $query = DB::table('inventory_movements as im')
            ->join('inventory_items as ii', 'im.inventory_item_id', '=', 'ii.id')
            ->leftJoin('inventory_categories as ic', 'ii.category_id', '=', 'ic.id')
            ->whereBetween('im.created_at', [$startDate, $endDate])
            ->where('im.movement_type', 'out');

        if ($categoryId) {
            $query->where('ii.category_id', $categoryId);
        }

        $consumptionData = $query->select([
            'ii.id',
            'ii.name',
            'ii.sku',
            'ic.name as category_name',
            'ii.unit',
            DB::raw('SUM(im.quantity) as total_consumed'),
            DB::raw('SUM(im.total_cost) as total_cost'),
            DB::raw('AVG(im.quantity) as avg_daily_consumption'),
            DB::raw('COUNT(DISTINCT DATE(im.created_at)) as consumption_days'),
            DB::raw('SUM(im.quantity) / COUNT(DISTINCT DATE(im.created_at)) as daily_avg_consumption')
        ])
        ->groupBy('ii.id', 'ii.name', 'ii.sku', 'ic.name', 'ii.unit')
        ->orderBy('total_consumed', 'DESC')
        ->get();

        return [
            'data' => $consumptionData,
            'top_consumers' => $consumptionData->take(10),
            'consumption_trends' => $this->calculateConsumptionTrends($consumptionData),
            'cost_analysis' => $this->analyzeConsumptionCosts($consumptionData)
        ];
    }

    public function generateSupplierPerformanceReport(array $filters = []): array
    {
        $startMonth = $filters['start_month'] ?? now()->subMonths(12)->format('Y-m');
        $endMonth = $filters['end_month'] ?? now()->format('Y-m');

        $performanceData = DB::table('supplier_performance as sp')
            ->join('suppliers as s', 'sp.supplier_id', '=', 's.id')
            ->whereBetween('sp.month', [$startMonth, $endMonth])
            ->select([
                's.id as supplier_id',
                's.name as supplier_name',
                's.contact_email',
                's.phone',
                DB::raw('AVG(sp.overall_rating) as avg_rating'),
                DB::raw('AVG(sp.average_delivery_time) as avg_delivery_time'),
                DB::raw('SUM(sp.total_orders) as total_orders'),
                DB::raw('SUM(sp.orders_on_time) as total_on_time'),
                DB::raw('SUM(sp.total_order_value) as total_value'),
                DB::raw('(SUM(sp.orders_on_time) / SUM(sp.total_orders) * 100) as on_time_percentage'),
                DB::raw('AVG(sp.quality_score) as avg_quality_score'),
                DB::raw('AVG(sp.price_competitiveness) as avg_price_score')
            ])
            ->groupBy('s.id', 's.name', 's.contact_email', 's.phone')
            ->orderBy('avg_rating', 'DESC')
            ->get();

        return [
            'data' => $performanceData,
            'top_performers' => $performanceData->take(5),
            'improvement_needed' => $performanceData->sortBy('avg_rating')->take(5),
            'performance_trends' => $this->analyzeSupplierTrends($performanceData)
        ];
    }

    public function generateWasteAnalysisReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subDays(30);
        $endDate = $filters['end_date'] ?? now();

        $wasteData = DB::table('inventory_movements as im')
            ->join('inventory_items as ii', 'im.inventory_item_id', '=', 'ii.id')
            ->leftJoin('inventory_categories as ic', 'ii.category_id', '=', 'ic.id')
            ->whereBetween('im.created_at', [$startDate, $endDate])
            ->where('im.movement_type', 'waste')
            ->select([
                'ii.id',
                'ii.name',
                'ii.sku',
                'ic.name as category_name',
                'ii.unit',
                DB::raw('SUM(im.quantity) as total_waste'),
                DB::raw('SUM(im.total_cost) as waste_cost'),
                DB::raw('COUNT(*) as waste_incidents'),
                DB::raw('AVG(im.quantity) as avg_waste_per_incident')
            ])
            ->groupBy('ii.id', 'ii.name', 'ii.sku', 'ic.name', 'ii.unit')
            ->orderBy('waste_cost', 'DESC')
            ->get();

        // Calculate waste percentages
        $wasteWithPercentages = $wasteData->map(function ($item) {
            $totalConsumption = $this->getTotalConsumption($item->id);
            $item->waste_percentage = $totalConsumption > 0 
                ? round(($item->total_waste / $totalConsumption) * 100, 2) 
                : 0;
            return $item;
        });

        return [
            'data' => $wasteWithPercentages,
            'total_waste_cost' => $wasteData->sum('waste_cost'),
            'high_waste_items' => $wasteWithPercentages->where('waste_percentage', '>', 10),
            'waste_trends' => $this->calculateWasteTrends($startDate, $endDate),
            'reduction_opportunities' => $this->identifyWasteReductionOpportunities($wasteWithPercentages)
        ];
    }

    public function generateABCAnalysis(array $filters = []): array
    {
        $analysisStartDate = $filters['analysis_start_date'] ?? now()->subYear();
        $analysisEndDate = $filters['analysis_end_date'] ?? now();

        // Calculate annual consumption values
        $consumptionData = DB::table('inventory_movements as im')
            ->join('inventory_items as ii', 'im.inventory_item_id', '=', 'ii.id')
            ->whereBetween('im.created_at', [$analysisStartDate, $analysisEndDate])
            ->where('im.movement_type', 'out')
            ->select([
                'ii.id',
                'ii.name',
                'ii.sku',
                DB::raw('SUM(im.total_cost) as annual_consumption_value')
            ])
            ->groupBy('ii.id', 'ii.name', 'ii.sku')
            ->orderBy('annual_consumption_value', 'DESC')
            ->get();

        $totalConsumptionValue = $consumptionData->sum('annual_consumption_value');
        $cumulativePercentage = 0;

        $abcClassified = $consumptionData->map(function ($item, $index) use ($totalConsumptionValue, &$cumulativePercentage) {
            $percentage = $totalConsumptionValue > 0 
                ? ($item->annual_consumption_value / $totalConsumptionValue) * 100 
                : 0;
            $cumulativePercentage += $percentage;

            // Classify into A, B, C categories
            if ($cumulativePercentage <= 80) {
                $category = 'A';
            } elseif ($cumulativePercentage <= 95) {
                $category = 'B';
            } else {
                $category = 'C';
            }

            $item->consumption_percentage = round($percentage, 2);
            $item->cumulative_percentage = round($cumulativePercentage, 2);
            $item->abc_category = $category;

            return $item;
        });

        return [
            'data' => $abcClassified,
            'category_summary' => [
                'A' => $abcClassified->where('abc_category', 'A')->count(),
                'B' => $abcClassified->where('abc_category', 'B')->count(),
                'C' => $abcClassified->where('abc_category', 'C')->count()
            ],
            'value_distribution' => [
                'A' => $abcClassified->where('abc_category', 'A')->sum('annual_consumption_value'),
                'B' => $abcClassified->where('abc_category', 'B')->sum('annual_consumption_value'),
                'C' => $abcClassified->where('abc_category', 'C')->sum('annual_consumption_value')
            ],
            'recommendations' => $this->generateABCRecommendations($abcClassified)
        ];
    }

    public function generateReorderReport(array $filters = []): array
    {
        $urgencyLevel = $filters['urgency_level'] ?? 'all';

        $reorderData = DB::table('inventory_items as ii')
            ->leftJoin('inventory_categories as ic', 'ii.category_id', '=', 'ic.id')
            ->leftJoin('suppliers as s', 'ii.primary_supplier_id', '=', 's.id')
            ->select([
                'ii.id',
                'ii.name',
                'ii.sku',
                'ic.name as category_name',
                'ii.current_stock',
                'ii.minimum_stock',
                'ii.reorder_point',
                'ii.economic_order_quantity',
                'ii.lead_time_days',
                'ii.cost_per_unit',
                's.name as supplier_name',
                's.contact_email as supplier_email',
                DB::raw('(ii.reorder_point - ii.current_stock) as shortage'),
                DB::raw('CASE 
                    WHEN ii.current_stock <= 0 THEN "critical"
                    WHEN ii.current_stock <= ii.minimum_stock THEN "urgent" 
                    WHEN ii.current_stock <= ii.reorder_point THEN "normal"
                    ELSE "not_needed" 
                END as urgency_level')
            ])
            ->where('ii.current_stock', '<=', DB::raw('ii.reorder_point'))
            ->orderBy('urgency_level')
            ->orderBy('shortage', 'DESC');

        if ($urgencyLevel !== 'all') {
            $query->havingRaw('urgency_level = ?', [$urgencyLevel]);
        }

        $reorderItems = $query->get();

        return [
            'data' => $reorderItems,
            'critical_items' => $reorderItems->where('urgency_level', 'critical'),
            'urgent_items' => $reorderItems->where('urgency_level', 'urgent'),
            'total_reorder_cost' => $this->calculateTotalReorderCost($reorderItems),
            'supplier_orders' => $this->groupBySupplier($reorderItems)
        ];
    }

    private function calculateStockSummary($stockData): array
    {
        return [
            'total_items' => $stockData->count(),
            'out_of_stock' => $stockData->where('stock_status', 'out_of_stock')->count(),
            'low_stock' => $stockData->where('stock_status', 'low_stock')->count(),
            'overstock' => $stockData->where('stock_status', 'overstock')->count(),
            'normal_stock' => $stockData->where('stock_status', 'normal')->count(),
            'total_value' => $stockData->sum('current_value'),
            'avg_turnover_rate' => $stockData->where('turnover_rate', '>', 0)->avg('turnover_rate')
        ];
    }

    private function generateABCRecommendations($abcData): array
    {
        return [
            'A_items' => [
                'recommendation' => 'Tight control, frequent monitoring, accurate forecasting',
                'suggested_actions' => [
                    'Daily stock monitoring',
                    'Safety stock optimization',
                    'Multiple supplier sourcing',
                    'Demand forecasting improvement'
                ]
            ],
            'B_items' => [
                'recommendation' => 'Moderate control, periodic review',
                'suggested_actions' => [
                    'Weekly stock reviews',
                    'Automated reordering',
                    'Quarterly supplier evaluation'
                ]
            ],
            'C_items' => [
                'recommendation' => 'Simple control, bulk ordering',
                'suggested_actions' => [
                    'Monthly stock checks',
                    'Large order quantities',
                    'Single supplier relationships'
                ]
            ]
        ];
    }
}
```

#### 2.2 Inventory Reports Controller
```php
// app/Http/Controllers/Api/Reports/InventoryReportsController.php
<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use App\Services\Reporting\InventoryAnalyticsService;
use App\Http\Requests\ReportFilterRequest;
use Illuminate\Http\JsonResponse;

class InventoryReportsController extends Controller
{
    private InventoryAnalyticsService $analyticsService;

    public function __construct(InventoryAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function stockLevels(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateStockLevelsReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function consumptionAnalysis(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateConsumptionReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function supplierPerformance(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateSupplierPerformanceReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function wasteAnalysis(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateWasteAnalysisReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function abcAnalysis(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateABCAnalysis($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function reorderReport(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateReorderReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function inventoryDashboard(ReportFilterRequest $request): JsonResponse
    {
        $dashboard = [
            'stock_overview' => $this->analyticsService->generateStockLevelsReport($request->validated()),
            'consumption_trends' => $this->analyticsService->generateConsumptionReport($request->validated()),
            'reorder_alerts' => $this->analyticsService->generateReorderReport(['urgency_level' => 'urgent']),
            'waste_summary' => $this->analyticsService->generateWasteAnalysisReport($request->validated())
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

#### 3.1 Inventory Dashboard Component
```typescript
// src/components/reports/inventory/InventoryReportsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Select, Tabs, Alert, Badge } from 'antd';
import { inventoryReportsAPI } from '../../../services/api/reports';
import { StockLevelsOverview } from './components/StockLevelsOverview';
import { ConsumptionTrends } from './components/ConsumptionTrends';
import { ReorderAlerts } from './components/ReorderAlerts';
import { WasteSummary } from './components/WasteSummary';
import { ABCAnalysisChart } from './components/ABCAnalysisChart';
import { SupplierPerformanceTable } from './components/SupplierPerformanceTable';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

export const InventoryReportsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, categoryFilter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const filters = {
        start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
        end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
        category_id: categoryFilter !== 'all' ? categoryFilter : undefined
      };

      const response = await inventoryReportsAPI.getDashboard(filters);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading inventory dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const criticalAlertsCount = dashboardData?.reorder_alerts?.critical_items?.length || 0;
  const urgentAlertsCount = dashboardData?.reorder_alerts?.urgent_items?.length || 0;

  return (
    <div className="inventory-reports-dashboard">
      <div className="dashboard-header">
        <h2>Inventory Management Dashboard</h2>
        <div className="dashboard-filters">
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ marginRight: 16 }}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 200 }}
            placeholder="Select Category"
          >
            <Option value="all">All Categories</Option>
            {/* Dynamic category options */}
          </Select>
        </div>
      </div>

      {(criticalAlertsCount > 0 || urgentAlertsCount > 0) && (
        <Alert
          message={`Inventory Alerts: ${criticalAlertsCount} critical, ${urgentAlertsCount} urgent items need reordering`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Tabs defaultActiveKey="overview" type="card">
        <TabPane 
          tab={
            <span>
              Overview
              {(criticalAlertsCount > 0 || urgentAlertsCount > 0) && (
                <Badge count={criticalAlertsCount + urgentAlertsCount} style={{ marginLeft: 8 }} />
              )}
            </span>
          } 
          key="overview"
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <StockLevelsOverview data={dashboardData?.stock_overview} />
            </Col>
            <Col span={12}>
              <ReorderAlerts data={dashboardData?.reorder_alerts} />
            </Col>
            <Col span={12}>
              <ConsumptionTrends data={dashboardData?.consumption_trends} />
            </Col>
            <Col span={12}>
              <WasteSummary data={dashboardData?.waste_summary} />
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Stock Analysis" key="stock">
          <StockAnalysisTab dateRange={dateRange} categoryFilter={categoryFilter} />
        </TabPane>

        <TabPane tab="Consumption" key="consumption">
          <ConsumptionAnalysisTab dateRange={dateRange} categoryFilter={categoryFilter} />
        </TabPane>

        <TabPane tab="ABC Analysis" key="abc">
          <ABCAnalysisTab />
        </TabPane>

        <TabPane tab="Suppliers" key="suppliers">
          <SupplierPerformanceTab dateRange={dateRange} />
        </TabPane>

        <TabPane tab="Waste Analysis" key="waste">
          <WasteAnalysisTab dateRange={dateRange} categoryFilter={categoryFilter} />
        </TabPane>
      </Tabs>
    </div>
  );
};
```

### 4. API Routes

```php
// routes/api.php (Inventory Reports section)
Route::prefix('reports/inventory')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', [InventoryReportsController::class, 'inventoryDashboard']);
    Route::get('/stock-levels', [InventoryReportsController::class, 'stockLevels']);
    Route::get('/consumption', [InventoryReportsController::class, 'consumptionAnalysis']);
    Route::get('/supplier-performance', [InventoryReportsController::class, 'supplierPerformance']);
    Route::get('/waste-analysis', [InventoryReportsController::class, 'wasteAnalysis']);
    Route::get('/abc-analysis', [InventoryReportsController::class, 'abcAnalysis']);
    Route::get('/reorder-report', [InventoryReportsController::class, 'reorderReport']);
});
```

### 5. Testing Requirements

#### 5.1 Unit Tests
- Inventory analytics calculations
- ABC analysis algorithm
- Stock level calculations
- Reorder point logic

#### 5.2 Integration Tests
- API endpoint responses
- Report data accuracy
- Alert generation

#### 5.3 Performance Tests
- Large inventory dataset handling
- Report generation speed
- Real-time alert performance

### 6. Documentation

#### 6.1 API Documentation
- Inventory reports endpoints
- Filter parameters
- Response formats

#### 6.2 User Guide
- Inventory management best practices
- ABC analysis interpretation
- Reorder optimization strategies

## Acceptance Criteria

- [ ] Stock levels report shows current inventory status
- [ ] Consumption analysis tracks usage patterns
- [ ] Supplier performance evaluates delivery and quality metrics
- [ ] Waste analysis identifies cost reduction opportunities
- [ ] ABC analysis categorizes inventory importance
- [ ] Reorder reports generate purchase recommendations
- [ ] Real-time alerts for critical stock situations
- [ ] Reports export to multiple formats
- [ ] Mobile-responsive dashboard
- [ ] Role-based access control
- [ ] Performance optimized for large inventories
- [ ] Comprehensive test coverage (>80%)

## Dependencies

- Issue #01: Core reporting infrastructure
- Inventory management system
- Purchase order system
- Supplier management system

## Notes

- Implement real-time stock level monitoring
- Consider automated reorder suggestions
- Ensure data accuracy through proper inventory tracking
- Plan for integration with procurement systems
