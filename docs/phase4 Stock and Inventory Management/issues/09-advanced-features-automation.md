# Issue #09: Advanced Features and Automation

## Overview
Implement advanced inventory management features including automated reordering systems, predictive analytics, AI-powered optimization algorithms, smart alerts, and intelligent forecasting to enhance efficiency and reduce manual intervention for the Banrimkwae Resort inventory system.

## Priority
Medium

## Estimated Duration
6-7 days

## Dependencies
- Issue #01: Database Schema Design
- Issue #02: Core Inventory Management Backend System
- Issue #03: Purchase Order Management System
- Issue #04: Supplier Management System
- Issue #05: Stock Movement and Transaction Tracking
- Issue #06: Inventory Analytics and Reporting System

## Technical Requirements

### Automated Reordering System

#### 1. AutoReorderController
Create `app/Http/Controllers/AutoReorderController.php`:

**API Endpoints:**
- `GET /api/auto-reorder/rules` - Get reorder rules
- `POST /api/auto-reorder/rules` - Create/update reorder rules
- `DELETE /api/auto-reorder/rules/{id}` - Delete reorder rule
- `GET /api/auto-reorder/suggestions` - Get reorder suggestions
- `POST /api/auto-reorder/execute` - Execute automatic reorders
- `GET /api/auto-reorder/history` - Get auto-reorder history
- `PUT /api/auto-reorder/rules/{id}/toggle` - Enable/disable rule

**Methods:**
```php
public function getReorderRules(Request $request)
public function createReorderRule(ReorderRuleRequest $request)
public function updateReorderRule(ReorderRuleRequest $request, $id)
public function deleteReorderRule($id)
public function getReorderSuggestions(Request $request)
public function executeAutoReorders(ExecuteReorderRequest $request)
public function getAutoReorderHistory(Request $request)
public function toggleReorderRule($id)
```

#### 2. AutoReorderService
Create `app/Services/AutoReorderService.php`:

**Core Automation Logic:**
```php
public function generateReorderSuggestions()
{
    $suggestions = [];
    $activeRules = AutoReorderRule::where('is_active', true)->get();
    
    foreach ($activeRules as $rule) {
        $item = $rule->inventoryItem;
        $currentStock = $this->getCurrentStock($item->id, $rule->location_id);
        
        if ($this->shouldReorder($rule, $currentStock)) {
            $suggestion = $this->createReorderSuggestion($rule, $item, $currentStock);
            $suggestions[] = $suggestion;
        }
    }
    
    return $suggestions;
}

private function shouldReorder($rule, $currentStock)
{
    switch ($rule->trigger_type) {
        case 'minimum_stock':
            return $currentStock <= $rule->minimum_threshold;
            
        case 'consumption_rate':
            $avgConsumption = $this->calculateAverageConsumption(
                $rule->inventory_item_id, 
                $rule->calculation_days
            );
            $daysRemaining = $currentStock / max($avgConsumption, 0.1);
            return $daysRemaining <= $rule->lead_time_buffer;
            
        case 'seasonal_pattern':
            return $this->checkSeasonalReorderNeed($rule, $currentStock);
            
        case 'predictive':
            return $this->checkPredictiveReorderNeed($rule, $currentStock);
            
        default:
            return false;
    }
}

public function calculateOptimalOrderQuantity($item, $rule, $currentStock)
{
    $methods = [
        'eoq' => $this->calculateEOQ($item),
        'fixed_quantity' => $rule->reorder_quantity,
        'up_to_max' => $rule->maximum_stock - $currentStock,
        'consumption_based' => $this->calculateConsumptionBasedQuantity($item, $rule)
    ];
    
    return $methods[$rule->quantity_calculation_method] ?? $rule->reorder_quantity;
}

private function calculateEOQ($item)
{
    $annualDemand = $this->getAnnualDemand($item->id);
    $orderingCost = $this->getOrderingCost($item);
    $holdingCostRate = $this->getHoldingCostRate($item);
    $unitCost = $this->getAverageUnitCost($item->id);
    
    $holdingCost = $unitCost * $holdingCostRate;
    
    if ($holdingCost <= 0 || $annualDemand <= 0) {
        return $item->minimum_stock ?? 10;
    }
    
    $eoq = sqrt((2 * $annualDemand * $orderingCost) / $holdingCost);
    
    return max($eoq, $item->minimum_order_quantity ?? 1);
}
```

#### 3. Smart Alert System
Create `app/Services/SmartAlertService.php`:

**Intelligent Alerting:**
```php
public function generateSmartAlerts()
{
    $alerts = collect();
    
    // Stock level alerts
    $alerts = $alerts->merge($this->generateStockLevelAlerts());
    
    // Demand spike alerts
    $alerts = $alerts->merge($this->generateDemandSpikeAlerts());
    
    // Expiration alerts
    $alerts = $alerts->merge($this->generateExpirationAlerts());
    
    // Supplier performance alerts
    $alerts = $alerts->merge($this->generateSupplierAlerts());
    
    // Cost variance alerts
    $alerts = $alerts->merge($this->generateCostVarianceAlerts());
    
    return $this->prioritizeAlerts($alerts);
}

private function generateDemandSpikeAlerts()
{
    $alerts = [];
    $items = InventoryItem::where('track_consumption', true)->get();
    
    foreach ($items as $item) {
        $recentConsumption = $this->getRecentConsumption($item->id, 7); // Last 7 days
        $historicalAverage = $this->getHistoricalAverage($item->id, 30); // Last 30 days
        
        if ($recentConsumption > ($historicalAverage * 1.5)) { // 50% spike
            $alerts[] = new SmartAlert([
                'type' => 'demand_spike',
                'severity' => 'high',
                'item_id' => $item->id,
                'message' => "Unusual demand spike detected for {$item->name}",
                'data' => [
                    'recent_consumption' => $recentConsumption,
                    'historical_average' => $historicalAverage,
                    'spike_percentage' => (($recentConsumption / $historicalAverage) - 1) * 100
                ],
                'recommended_actions' => [
                    'review_recent_orders',
                    'check_for_events',
                    'consider_emergency_reorder'
                ]
            ]);
        }
    }
    
    return $alerts;
}

private function generateExpirationAlerts()
{
    $alerts = [];
    $expiringItems = $this->getItemsNearExpiration();
    
    foreach ($expiringItems as $item) {
        $daysUntilExpiry = $item->days_until_expiry;
        $severity = $this->calculateExpirySeverity($daysUntilExpiry);
        
        $alerts[] = new SmartAlert([
            'type' => 'expiration_warning',
            'severity' => $severity,
            'item_id' => $item->inventory_item_id,
            'message' => "Item expiring in {$daysUntilExpiry} days: {$item->name}",
            'data' => [
                'expiry_date' => $item->expiry_date,
                'quantity' => $item->quantity,
                'batch_number' => $item->batch_number
            ],
            'recommended_actions' => $this->getExpiryActions($daysUntilExpiry)
        ]);
    }
    
    return $alerts;
}
```

### Predictive Analytics Engine

#### 1. PredictiveAnalyticsService
Create `app/Services/PredictiveAnalyticsService.php`:

**Machine Learning Integration:**
```php
public function predictFutureDemand($itemId, $forecastDays, $options = [])
{
    $historicalData = $this->getHistoricalConsumptionData($itemId);
    
    if ($historicalData->count() < 30) {
        throw new InsufficientDataException('Need at least 30 days of data for prediction');
    }
    
    $model = $this->selectBestModel($historicalData);
    $prediction = $this->runPrediction($model, $historicalData, $forecastDays, $options);
    
    return [
        'item_id' => $itemId,
        'forecast_days' => $forecastDays,
        'predictions' => $prediction['values'],
        'confidence_intervals' => $prediction['confidence'],
        'model_used' => $model,
        'accuracy_score' => $this->calculateModelAccuracy($model, $historicalData)
    ];
}

private function selectBestModel($data)
{
    $models = [
        'linear_regression' => $this->testLinearRegression($data),
        'exponential_smoothing' => $this->testExponentialSmoothing($data),
        'seasonal_arima' => $this->testSeasonalArima($data),
        'neural_network' => $this->testNeuralNetwork($data)
    ];
    
    // Select model with best accuracy
    return array_keys($models, max($models))[0];
}

public function detectSeasonalPatterns($itemId)
{
    $data = $this->getHistoricalConsumptionData($itemId, 365); // Full year
    
    if ($data->count() < 365) {
        return null;
    }
    
    $patterns = [
        'weekly' => $this->detectWeeklyPattern($data),
        'monthly' => $this->detectMonthlyPattern($data),
        'seasonal' => $this->detectSeasonalPattern($data),
        'special_events' => $this->detectEventPatterns($data)
    ];
    
    return $patterns;
}

public function optimizeStockLevels($locationId = null)
{
    $items = $this->getItemsForOptimization($locationId);
    $optimizations = [];
    
    foreach ($items as $item) {
        $currentLevels = [
            'minimum_stock' => $item->minimum_stock,
            'maximum_stock' => $item->maximum_stock,
            'reorder_point' => $item->reorder_point
        ];
        
        $optimizedLevels = $this->calculateOptimalLevels($item);
        
        if ($this->shouldUpdateLevels($currentLevels, $optimizedLevels)) {
            $optimizations[] = [
                'item_id' => $item->id,
                'current_levels' => $currentLevels,
                'optimized_levels' => $optimizedLevels,
                'potential_savings' => $this->calculatePotentialSavings($item, $optimizedLevels),
                'risk_assessment' => $this->assessOptimizationRisk($item, $optimizedLevels)
            ];
        }
    }
    
    return $optimizations;
}
```

#### 2. AI-Powered Optimization
Create `app/Services/AiOptimizationService.php`:

**Advanced Algorithms:**
```php
public function optimizeInventoryPortfolio($constraints = [])
{
    $items = $this->getAllInventoryItems();
    $optimization = new InventoryOptimizer();
    
    $result = $optimization->optimize([
        'items' => $items,
        'budget_constraint' => $constraints['budget'] ?? null,
        'space_constraint' => $constraints['space'] ?? null,
        'service_level_target' => $constraints['service_level'] ?? 0.95,
        'objectives' => [
            'minimize_total_cost',
            'maximize_service_level',
            'minimize_stockout_risk'
        ]
    ]);
    
    return $result;
}

public function detectAnomalies($period = 30)
{
    $anomalies = [];
    $items = InventoryItem::where('track_anomalies', true)->get();
    
    foreach ($items as $item) {
        $data = $this->getItemDataForAnomalyDetection($item->id, $period);
        $anomalyScore = $this->calculateAnomalyScore($data);
        
        if ($anomalyScore > 0.8) { // High anomaly threshold
            $anomalies[] = [
                'item_id' => $item->id,
                'anomaly_type' => $this->classifyAnomaly($data),
                'severity' => $this->calculateAnomalySeverity($anomalyScore),
                'description' => $this->generateAnomalyDescription($item, $data),
                'recommended_actions' => $this->getAnomalyActions($item, $data)
            ];
        }
    }
    
    return $anomalies;
}

public function optimizeSupplierMix($itemId)
{
    $suppliers = $this->getItemSuppliers($itemId);
    $criteria = [
        'cost' => 0.4,
        'quality' => 0.3,
        'delivery_time' => 0.2,
        'reliability' => 0.1
    ];
    
    $optimization = [];
    foreach ($suppliers as $supplier) {
        $score = $this->calculateSupplierScore($supplier, $criteria);
        $optimization[] = [
            'supplier_id' => $supplier->id,
            'score' => $score,
            'recommended_allocation' => $this->calculateOptimalAllocation($supplier, $score)
        ];
    }
    
    return collect($optimization)->sortByDesc('score')->values();
}
```

### Advanced Data Models

#### 1. AutoReorderRule Model
Create `app/Models/AutoReorderRule.php`:

```php
protected $fillable = [
    'inventory_item_id',
    'location_id',
    'rule_name',
    'trigger_type',
    'minimum_threshold',
    'maximum_stock',
    'reorder_quantity',
    'quantity_calculation_method',
    'lead_time_buffer',
    'calculation_days',
    'seasonal_adjustments',
    'is_active',
    'created_by'
];

protected $casts = [
    'seasonal_adjustments' => 'array',
    'is_active' => 'boolean'
];

public function inventoryItem()
{
    return $this->belongsTo(InventoryItem::class);
}

public function location()
{
    return $this->belongsTo(StorageLocation::class);
}

public function executions()
{
    return $this->hasMany(AutoReorderExecution::class);
}
```

#### 2. SmartAlert Model
Create `app/Models/SmartAlert.php`:

```php
protected $fillable = [
    'alert_type',
    'severity',
    'title',
    'message',
    'data',
    'item_id',
    'location_id',
    'status',
    'generated_at',
    'acknowledged_at',
    'acknowledged_by',
    'resolved_at',
    'resolved_by'
];

protected $casts = [
    'data' => 'array',
    'generated_at' => 'datetime',
    'acknowledged_at' => 'datetime',
    'resolved_at' => 'datetime'
];

public function inventoryItem()
{
    return $this->belongsTo(InventoryItem::class, 'item_id');
}

public function acknowledgedBy()
{
    return $this->belongsTo(User::class, 'acknowledged_by');
}
```

#### 3. PredictionModel Model
Create `app/Models/PredictionModel.php`:

```php
protected $fillable = [
    'model_name',
    'model_type',
    'item_id',
    'model_parameters',
    'training_data_period',
    'accuracy_score',
    'last_trained_at',
    'is_active'
];

protected $casts = [
    'model_parameters' => 'array',
    'last_trained_at' => 'datetime',
    'is_active' => 'boolean'
];
```

### Automation Workflows

#### 1. Scheduled Automation Jobs
Create automated job classes:

```php
class GenerateReorderSuggestions extends Job
{
    public function handle(AutoReorderService $service)
    {
        $suggestions = $service->generateReorderSuggestions();
        
        foreach ($suggestions as $suggestion) {
            if ($suggestion['auto_execute'] && $suggestion['confidence'] > 0.8) {
                $service->executeAutoReorder($suggestion);
            } else {
                $service->createReorderNotification($suggestion);
            }
        }
    }
}

class UpdatePredictiveModels extends Job
{
    public function handle(PredictiveAnalyticsService $service)
    {
        $items = InventoryItem::where('enable_prediction', true)->get();
        
        foreach ($items as $item) {
            $service->updatePredictionModel($item->id);
        }
    }
}

class GenerateSmartAlerts extends Job
{
    public function handle(SmartAlertService $service)
    {
        $alerts = $service->generateSmartAlerts();
        
        foreach ($alerts as $alert) {
            $service->processAlert($alert);
        }
    }
}
```

### Request Validation

#### 1. ReorderRuleRequest
Create `app/Http/Requests/ReorderRuleRequest.php`:

```php
public function rules()
{
    return [
        'inventory_item_id' => 'required|exists:inventory_items,id',
        'location_id' => 'nullable|exists:storage_locations,id',
        'rule_name' => 'required|string|max:255',
        'trigger_type' => 'required|in:minimum_stock,consumption_rate,seasonal_pattern,predictive',
        'minimum_threshold' => 'required_if:trigger_type,minimum_stock|nullable|numeric|min:0',
        'maximum_stock' => 'nullable|numeric|min:0',
        'reorder_quantity' => 'required|numeric|min:1',
        'quantity_calculation_method' => 'required|in:eoq,fixed_quantity,up_to_max,consumption_based',
        'lead_time_buffer' => 'nullable|integer|min:0|max:365',
        'calculation_days' => 'nullable|integer|min:7|max:365',
        'seasonal_adjustments' => 'nullable|array',
        'is_active' => 'boolean'
    ];
}
```

### Database Migrations

#### 1. Auto Reorder Rules Migration
```php
Schema::create('auto_reorder_rules', function (Blueprint $table) {
    $table->id();
    $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
    $table->foreignId('location_id')->nullable()->constrained('storage_locations');
    $table->string('rule_name');
    $table->enum('trigger_type', ['minimum_stock', 'consumption_rate', 'seasonal_pattern', 'predictive']);
    $table->decimal('minimum_threshold', 10, 3)->nullable();
    $table->decimal('maximum_stock', 10, 3)->nullable();
    $table->decimal('reorder_quantity', 10, 3);
    $table->enum('quantity_calculation_method', ['eoq', 'fixed_quantity', 'up_to_max', 'consumption_based']);
    $table->integer('lead_time_buffer')->default(7);
    $table->integer('calculation_days')->default(30);
    $table->json('seasonal_adjustments')->nullable();
    $table->boolean('auto_execute')->default(false);
    $table->decimal('confidence_threshold', 3, 2)->default(0.80);
    $table->boolean('is_active')->default(true);
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();
    
    $table->index(['inventory_item_id', 'is_active']);
});
```

#### 2. Smart Alerts Migration
```php
Schema::create('smart_alerts', function (Blueprint $table) {
    $table->id();
    $table->enum('alert_type', ['stock_level', 'demand_spike', 'expiration_warning', 'supplier_issue', 'cost_variance', 'anomaly']);
    $table->enum('severity', ['low', 'medium', 'high', 'critical']);
    $table->string('title');
    $table->text('message');
    $table->json('data')->nullable();
    $table->json('recommended_actions')->nullable();
    $table->foreignId('item_id')->nullable()->constrained('inventory_items');
    $table->foreignId('location_id')->nullable()->constrained('storage_locations');
    $table->enum('status', ['active', 'acknowledged', 'resolved', 'dismissed'])->default('active');
    $table->timestamp('generated_at');
    $table->timestamp('acknowledged_at')->nullable();
    $table->foreignId('acknowledged_by')->nullable()->constrained('users');
    $table->timestamp('resolved_at')->nullable();
    $table->foreignId('resolved_by')->nullable()->constrained('users');
    $table->timestamps();
    
    $table->index(['alert_type', 'status']);
    $table->index(['severity', 'generated_at']);
});
```

#### 3. Prediction Models Migration
```php
Schema::create('prediction_models', function (Blueprint $table) {
    $table->id();
    $table->string('model_name');
    $table->enum('model_type', ['linear_regression', 'exponential_smoothing', 'seasonal_arima', 'neural_network']);
    $table->foreignId('item_id')->nullable()->constrained('inventory_items');
    $table->json('model_parameters');
    $table->integer('training_data_period')->default(90); // days
    $table->decimal('accuracy_score', 5, 4)->nullable();
    $table->decimal('mape_score', 5, 2)->nullable(); // Mean Absolute Percentage Error
    $table->timestamp('last_trained_at')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    
    $table->index(['model_type', 'is_active']);
    $table->index(['item_id', 'accuracy_score']);
});
```

### Performance Optimization

#### 1. Caching Strategy
```php
public function getCachedPrediction($itemId, $days)
{
    $cacheKey = "prediction_{$itemId}_{$days}";
    
    return Cache::remember($cacheKey, 3600, function () use ($itemId, $days) {
        return $this->predictiveService->predictFutureDemand($itemId, $days);
    });
}
```

#### 2. Background Processing
```php
// Queue heavy computational tasks
dispatch(new TrainPredictionModels($itemIds))->onQueue('ml-processing');
dispatch(new GenerateOptimizationRecommendations())->onQueue('optimization');
```

## Acceptance Criteria

1. **Automated Reordering:**
   - ✅ Configurable reorder rules and triggers
   - ✅ Multiple calculation methods for order quantities
   - ✅ Automatic execution with confidence thresholds

2. **Smart Alerts:**
   - ✅ Intelligent alert generation based on patterns
   - ✅ Priority-based alert routing
   - ✅ Actionable recommendations with alerts

3. **Predictive Analytics:**
   - ✅ Demand forecasting with multiple models
   - ✅ Seasonal pattern detection
   - ✅ Anomaly detection and classification

4. **Optimization:**
   - ✅ Stock level optimization algorithms
   - ✅ Supplier mix optimization
   - ✅ Cost optimization recommendations

5. **Automation Workflows:**
   - ✅ Scheduled background processing
   - ✅ Event-driven automation triggers
   - ✅ Manual override capabilities

## Implementation Notes

1. **Machine Learning:**
   - Start with simple statistical models
   - Gradually incorporate more sophisticated ML algorithms
   - Validate model accuracy regularly

2. **Performance:**
   - Use background queues for heavy computations
   - Implement efficient caching strategies
   - Optimize database queries for large datasets

3. **Reliability:**
   - Include manual override options
   - Implement confidence thresholds for automation
   - Maintain audit trails for all automated actions

4. **Scalability:**
   - Design for handling large numbers of items
   - Use batch processing for bulk operations
   - Implement horizontal scaling capabilities

## Related Issues
- Issue #02: Core Inventory Management Backend System
- Issue #03: Purchase Order Management System
- Issue #04: Supplier Management System
- Issue #06: Inventory Analytics and Reporting System
- Issue #11: Testing and Quality Assurance
