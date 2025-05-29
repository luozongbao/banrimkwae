# Issue #06: Inventory Analytics and Reporting System

## Overview
Implement a comprehensive analytics and reporting system for inventory management that provides usage pattern analysis, cost tracking, demand forecasting, performance KPIs, and interactive dashboards for the Banrimkwae Resort inventory system.

## Priority
Medium-High

## Estimated Duration
5-6 days

## Dependencies
- Issue #01: Database Schema Design
- Issue #02: Core Inventory Management Backend System
- Issue #05: Stock Movement and Transaction Tracking
- Basic dashboard framework

## Technical Requirements

### Backend Components

#### 1. InventoryAnalyticsController
Create `app/Http/Controllers/InventoryAnalyticsController.php`:

**API Endpoints:**
- `GET /api/analytics/inventory/dashboard` - Main dashboard data
- `GET /api/analytics/inventory/usage-patterns` - Usage pattern analysis
- `GET /api/analytics/inventory/cost-analysis` - Cost breakdown and trends
- `GET /api/analytics/inventory/abc-analysis` - ABC classification analysis
- `GET /api/analytics/inventory/turnover-rates` - Inventory turnover metrics
- `GET /api/analytics/inventory/demand-forecast` - Demand forecasting data
- `GET /api/analytics/inventory/stock-valuation` - Stock valuation reports
- `GET /api/analytics/inventory/performance-kpis` - Key performance indicators
- `GET /api/analytics/inventory/waste-analysis` - Waste and spoilage analysis
- `GET /api/analytics/inventory/supplier-performance` - Supplier analytics
- `POST /api/analytics/inventory/custom-report` - Generate custom reports

**Methods:**
```php
public function getDashboardData(Request $request)
public function getUsagePatterns(UsagePatternRequest $request)
public function getCostAnalysis(CostAnalysisRequest $request)
public function getAbcAnalysis(Request $request)
public function getTurnoverRates(Request $request)
public function getDemandForecast(ForecastRequest $request)
public function getStockValuation(Request $request)
public function getPerformanceKpis(Request $request)
public function getWasteAnalysis(Request $request)
public function getSupplierPerformance(Request $request)
public function generateCustomReport(CustomReportRequest $request)
```

#### 2. InventoryAnalyticsService
Create `app/Services/InventoryAnalyticsService.php`:

**Core Analytics Methods:**
```php
public function calculateInventoryTurnover($itemId, $period)
public function analyzeUsagePatterns($criteria)
public function performAbcAnalysis($locationId = null)
public function calculateCarryingCosts($period)
public function generateDemandForecast($itemId, $forecastPeriod)
public function analyzeStockoutFrequency($period)
public function calculateReorderOptimization($itemId)
public function analyzeCostTrends($period)
public function generateInventoryKpis($period)
public function analyzeSeasonalPatterns($itemId, $period)
```

**Advanced Analytics:**
```php
public function predictInventoryNeeds($department, $forecastDays)
public function optimizeStockLevels($criteria)
public function analyzeSupplierEfficiency($supplierId, $period)
public function calculateInventoryAccuracy($location, $period)
public function analyzeMovementVelocity($category, $period)
public function generateCostSavingOpportunities()
```

#### 3. ReportingService
Create `app/Services/ReportingService.php`:

**Report Generation:**
```php
public function generateInventoryReport($type, $parameters)
public function generateStockMovementReport($period, $filters)
public function generateCostAnalysisReport($period)
public function generateSupplierPerformanceReport($period)
public function generateWasteReport($period, $categories)
public function generateComplianceReport($period)
public function scheduleAutomaticReports($schedule)
public function exportReportToFormat($reportData, $format)
```

#### 4. ForecastingService
Create `app/Services/ForecastingService.php`:

**Demand Forecasting:**
```php
public function calculateMovingAverage($itemId, $periods)
public function calculateExponentialSmoothing($itemId, $alpha)
public function analyzeSeasonalTrends($itemId, $historicalPeriods)
public function predictFutureConsumption($itemId, $forecastDays)
public function adjustForecastForEvents($itemId, $events)
public function calculateForecastAccuracy($itemId, $actualVsPredicted)
public function generateReorderSuggestions($criteria)
```

### Data Models

#### 1. InventoryAnalytics Model
Create `app/Models/InventoryAnalytics.php`:

**Aggregated Data Storage:**
```php
protected $fillable = [
    'item_id',
    'location_id',
    'analysis_date',
    'analysis_type',
    'metric_name',
    'metric_value',
    'calculation_period',
    'metadata'
];

public function inventoryItem()
public function storageLocation()
```

#### 2. DemandForecast Model
Create `app/Models/DemandForecast.php`:

**Forecast Data:**
```php
protected $fillable = [
    'inventory_item_id',
    'forecast_date',
    'predicted_consumption',
    'confidence_level',
    'forecast_method',
    'historical_data_points',
    'seasonal_adjustment',
    'event_adjustment',
    'actual_consumption',
    'forecast_accuracy'
];
```

#### 3. InventoryKpi Model
Create `app/Models/InventoryKpi.php`:

**KPI Tracking:**
```php
protected $fillable = [
    'kpi_name',
    'kpi_value',
    'target_value',
    'period_start',
    'period_end',
    'department',
    'location_id',
    'calculation_method',
    'trend_direction'
];
```

### Features Implementation

#### 1. Usage Pattern Analysis
**Consumption Pattern Detection:**
```php
public function analyzeConsumptionPatterns($itemId, $period)
{
    $consumptions = ConsumptionRecord::where('inventory_item_id', $itemId)
        ->whereBetween('consumed_at', [$period['start'], $period['end']])
        ->get();
    
    $patterns = [
        'daily_average' => $this->calculateDailyAverage($consumptions),
        'peak_usage_times' => $this->identifyPeakUsageTimes($consumptions),
        'seasonal_trends' => $this->detectSeasonalTrends($consumptions),
        'department_breakdown' => $this->analyzeByDepartment($consumptions),
        'weekly_patterns' => $this->analyzeWeeklyPatterns($consumptions)
    ];
    
    return $patterns;
}
```

**ABC Classification:**
```php
public function performAbcClassification($locationId = null)
{
    $query = InventoryItem::with(['movements', 'currentStock']);
    
    if ($locationId) {
        $query->whereHas('currentStock', function ($q) use ($locationId) {
            $q->where('storage_location_id', $locationId);
        });
    }
    
    $items = $query->get()->map(function ($item) {
        return [
            'item_id' => $item->id,
            'annual_value' => $this->calculateAnnualValue($item),
            'annual_quantity' => $this->calculateAnnualQuantity($item),
            'movement_frequency' => $this->calculateMovementFrequency($item)
        ];
    });
    
    // Sort by annual value and classify
    $sortedItems = $items->sortByDesc('annual_value');
    $totalValue = $sortedItems->sum('annual_value');
    
    $classification = $this->classifyItems($sortedItems, $totalValue);
    
    return $classification;
}
```

#### 2. Cost Analysis
**Carrying Cost Calculation:**
```php
public function calculateCarryingCosts($period)
{
    $stockValues = $this->getAverageStockValues($period);
    
    $costs = [];
    foreach ($stockValues as $item) {
        $carryingCost = $this->calculateItemCarryingCost([
            'average_stock_value' => $item['average_value'],
            'storage_cost_rate' => 0.15, // 15% annual carrying cost
            'insurance_rate' => 0.02,
            'opportunity_cost_rate' => 0.08,
            'obsolescence_rate' => 0.05
        ]);
        
        $costs[] = [
            'item_id' => $item['item_id'],
            'carrying_cost' => $carryingCost,
            'cost_per_unit' => $carryingCost / max($item['average_quantity'], 1)
        ];
    }
    
    return $costs;
}
```

#### 3. Demand Forecasting
**Exponential Smoothing Forecast:**
```php
public function generateExponentialSmoothingForecast($itemId, $forecastPeriods, $alpha = 0.3)
{
    $historicalData = $this->getHistoricalConsumption($itemId, 90); // 90 days history
    
    if ($historicalData->count() < 10) {
        throw new InsufficientDataException('Insufficient historical data for forecasting');
    }
    
    $forecast = [];
    $smoothedValue = $historicalData->first()->daily_consumption;
    
    // Calculate initial smoothed values
    foreach ($historicalData as $data) {
        $smoothedValue = $alpha * $data->daily_consumption + (1 - $alpha) * $smoothedValue;
    }
    
    // Generate forecast
    for ($i = 1; $i <= $forecastPeriods; $i++) {
        $forecast[] = [
            'date' => now()->addDays($i)->format('Y-m-d'),
            'predicted_consumption' => round($smoothedValue, 2),
            'confidence_level' => $this->calculateConfidenceLevel($historicalData, $i),
            'forecast_method' => 'exponential_smoothing'
        ];
    }
    
    return $forecast;
}
```

#### 4. Performance KPIs
**Key Performance Indicators:**
```php
public function calculateInventoryKpis($period)
{
    return [
        'inventory_turnover' => $this->calculateInventoryTurnoverKpi($period),
        'stockout_frequency' => $this->calculateStockoutFrequency($period),
        'inventory_accuracy' => $this->calculateInventoryAccuracy($period),
        'carrying_cost_ratio' => $this->calculateCarryingCostRatio($period),
        'obsolete_inventory_ratio' => $this->calculateObsoleteInventoryRatio($period),
        'supplier_delivery_performance' => $this->calculateSupplierDeliveryKpi($period),
        'order_fill_rate' => $this->calculateOrderFillRate($period),
        'inventory_shrinkage' => $this->calculateInventoryShrinkage($period),
        'reorder_efficiency' => $this->calculateReorderEfficiency($period),
        'cost_variance' => $this->calculateCostVariance($period)
    ];
}
```

#### 5. Waste Analysis
**Spoilage and Waste Tracking:**
```php
public function analyzeWastePatterns($period)
{
    $wasteData = StockAdjustment::whereIn('adjustment_type', ['spoilage', 'expired', 'damage'])
        ->whereBetween('adjustment_date', [$period['start'], $period['end']])
        ->with('inventoryItem')
        ->get();
    
    $analysis = [
        'total_waste_value' => $wasteData->sum('total_value_impact'),
        'waste_by_category' => $this->groupWasteByCategory($wasteData),
        'waste_by_supplier' => $this->groupWasteBySuppli er($wasteData),
        'waste_trends' => $this->calculateWasteTrends($wasteData),
        'prevention_opportunities' => $this->identifyWastePreventionOpportunities($wasteData)
    ];
    
    return $analysis;
}
```

### Request Validation

#### 1. UsagePatternRequest
Create `app/Http/Requests/UsagePatternRequest.php`:

```php
public function rules()
{
    return [
        'start_date' => 'required|date|before_or_equal:today',
        'end_date' => 'required|date|after:start_date|before_or_equal:today',
        'item_ids' => 'nullable|array',
        'item_ids.*' => 'exists:inventory_items,id',
        'categories' => 'nullable|array',
        'departments' => 'nullable|array',
        'location_ids' => 'nullable|array',
        'location_ids.*' => 'exists:storage_locations,id',
        'granularity' => 'nullable|in:daily,weekly,monthly'
    ];
}
```

#### 2. ForecastRequest
Create `app/Http/Requests/ForecastRequest.php`:

```php
public function rules()
{
    return [
        'item_id' => 'required|exists:inventory_items,id',
        'forecast_days' => 'required|integer|min:1|max:365',
        'forecast_method' => 'nullable|in:moving_average,exponential_smoothing,linear_regression',
        'include_seasonality' => 'nullable|boolean',
        'include_events' => 'nullable|boolean',
        'confidence_level' => 'nullable|numeric|min:0.5|max:0.99'
    ];
}
```

### Database Migrations

#### 1. Inventory Analytics Migration
Create migration for `inventory_analytics` table:

```php
Schema::create('inventory_analytics', function (Blueprint $table) {
    $table->id();
    $table->foreignId('inventory_item_id')->nullable()->constrained()->onDelete('cascade');
    $table->foreignId('storage_location_id')->nullable()->constrained()->onDelete('cascade');
    $table->date('analysis_date');
    $table->string('analysis_type', 50); // usage, cost, abc, turnover, etc.
    $table->string('metric_name', 100);
    $table->decimal('metric_value', 15, 4);
    $table->string('calculation_period', 50);
    $table->json('metadata')->nullable(); // Additional context data
    $table->timestamps();
    
    $table->index(['analysis_date', 'analysis_type']);
    $table->index(['inventory_item_id', 'analysis_type']);
    $table->index(['metric_name', 'analysis_date']);
});
```

#### 2. Demand Forecasts Migration
```php
Schema::create('demand_forecasts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
    $table->date('forecast_date');
    $table->decimal('predicted_consumption', 10, 3);
    $table->decimal('confidence_level', 4, 3); // 0.000 to 1.000
    $table->string('forecast_method', 50);
    $table->integer('historical_data_points');
    $table->decimal('seasonal_adjustment', 8, 4)->default(1.0000);
    $table->decimal('event_adjustment', 8, 4)->default(1.0000);
    $table->decimal('actual_consumption', 10, 3)->nullable();
    $table->decimal('forecast_accuracy', 5, 2)->nullable(); // Percentage
    $table->json('forecast_metadata')->nullable();
    $table->timestamps();
    
    $table->index(['inventory_item_id', 'forecast_date']);
    $table->index(['forecast_date']);
});
```

#### 3. Inventory KPIs Migration
```php
Schema::create('inventory_kpis', function (Blueprint $table) {
    $table->id();
    $table->string('kpi_name', 100);
    $table->decimal('kpi_value', 15, 4);
    $table->decimal('target_value', 15, 4)->nullable();
    $table->date('period_start');
    $table->date('period_end');
    $table->string('department', 50)->nullable();
    $table->foreignId('storage_location_id')->nullable()->constrained();
    $table->text('calculation_method')->nullable();
    $table->enum('trend_direction', ['up', 'down', 'stable'])->nullable();
    $table->decimal('trend_percentage', 8, 2)->nullable();
    $table->timestamps();
    
    $table->index(['kpi_name', 'period_end']);
    $table->index(['department', 'period_end']);
});
```

### Integration Points

#### 1. Real-time Dashboard Updates
```php
public function generateRealTimeDashboard()
{
    return [
        'current_stock_value' => $this->getCurrentStockValue(),
        'low_stock_alerts' => $this->getLowStockItems(),
        'recent_movements' => $this->getRecentStockMovements(24), // Last 24 hours
        'top_consumers' => $this->getTopConsumingItems(7), // Last 7 days
        'pending_orders' => $this->getPendingPurchaseOrders(),
        'waste_today' => $this->getTodayWasteValue(),
        'forecast_alerts' => $this->getForecastAlerts()
    ];
}
```

#### 2. Automated Report Scheduling
```php
public function schedulePeriodicReports()
{
    // Daily reports
    Schedule::call(function () {
        $this->generateAndSendReport('daily_inventory_summary');
    })->dailyAt('08:00');
    
    // Weekly reports
    Schedule::call(function () {
        $this->generateAndSendReport('weekly_performance_kpis');
    })->weeklyOn(1, '09:00'); // Monday 9 AM
    
    // Monthly reports
    Schedule::call(function () {
        $this->generateAndSendReport('monthly_cost_analysis');
    })->monthlyOn(1, '10:00'); // 1st of month 10 AM
}
```

### Testing Requirements

#### 1. Unit Tests
Create `tests/Unit/Services/InventoryAnalyticsServiceTest.php`:
- Test KPI calculations
- Test forecasting algorithms
- Test ABC classification
- Test cost analysis calculations

#### 2. Feature Tests
Create `tests/Feature/InventoryAnalyticsTest.php`:
- Test analytics API endpoints
- Test report generation
- Test dashboard data aggregation
- Test forecast accuracy

### Performance Optimization

#### 1. Analytics Caching
```php
public function getCachedAnalytics($key, $ttl = 3600)
{
    return Cache::remember("analytics_{$key}", $ttl, function () use ($key) {
        return $this->calculateAnalytics($key);
    });
}
```

#### 2. Background Processing
```php
public function processAnalyticsInBackground()
{
    // Queue heavy analytics calculations
    ProcessInventoryAnalytics::dispatch($this->analyticsParameters)
        ->onQueue('analytics');
}
```

## Acceptance Criteria

1. **Analytics Dashboard:**
   - ✅ Real-time inventory KPI display
   - ✅ Interactive charts and visualizations
   - ✅ Customizable dashboard widgets

2. **Usage Analytics:**
   - ✅ Consumption pattern analysis
   - ✅ ABC classification of inventory items
   - ✅ Turnover rate calculations

3. **Cost Analysis:**
   - ✅ Carrying cost calculations
   - ✅ Cost trend analysis
   - ✅ Waste cost tracking

4. **Forecasting:**
   - ✅ Demand prediction algorithms
   - ✅ Seasonal pattern recognition
   - ✅ Forecast accuracy tracking

5. **Reporting:**
   - ✅ Automated report generation
   - ✅ Custom report builder
   - ✅ Multiple export formats

## Implementation Notes

1. **Data Aggregation:**
   - Implement efficient data aggregation strategies
   - Use materialized views for complex calculations
   - Schedule regular analytics updates

2. **Performance:**
   - Cache frequently accessed analytics data
   - Use background jobs for heavy calculations
   - Optimize database queries with proper indexes

3. **Accuracy:**
   - Validate forecast accuracy regularly
   - Adjust algorithms based on performance
   - Implement data quality checks

4. **Visualization:**
   - Create responsive chart components
   - Implement drill-down capabilities
   - Support multiple chart types

## Related Issues
- Issue #02: Core Inventory Management Backend System
- Issue #05: Stock Movement and Transaction Tracking
- Issue #10: Frontend Interface Development
- Issue #07: Mobile Inventory Application
