# Issue #05: Stock Movement and Transaction Tracking

## Overview
Implement a comprehensive stock movement and transaction tracking system to maintain complete audit trails, handle stock transfers between locations, manage adjustments, and provide approval workflows for the Banrimkwae Resort inventory system.

## Priority
High

## Estimated Duration
6-7 days

## Dependencies
- Issue #01: Database Schema Design (inventory_movements table)
- Issue #02: Core Inventory Management Backend System
- Issue #04: Supplier Management System
- User authentication and authorization system

## Technical Requirements

### Backend Components

#### 1. StockMovementController
Create `app/Http/Controllers/StockMovementController.php`:

**API Endpoints:**
- `GET /api/stock-movements` - List all movements with filtering
- `POST /api/stock-movements/transfer` - Create stock transfer
- `POST /api/stock-movements/adjustment` - Create stock adjustment
- `POST /api/stock-movements/consumption` - Record consumption
- `GET /api/stock-movements/{id}` - Get movement details
- `PUT /api/stock-movements/{id}/approve` - Approve movement
- `PUT /api/stock-movements/{id}/reject` - Reject movement
- `GET /api/stock-movements/pending-approval` - Get pending approvals
- `GET /api/stock-movements/audit-trail/{item_id}` - Get item audit trail
- `POST /api/stock-movements/bulk-transfer` - Bulk transfer operation
- `GET /api/stock-movements/location/{location_id}` - Get location movements

**Methods:**
```php
public function index(Request $request)
public function createTransfer(StockTransferRequest $request)
public function createAdjustment(StockAdjustmentRequest $request)
public function recordConsumption(ConsumptionRequest $request)
public function show($id)
public function approve(ApprovalRequest $request, $id)
public function reject(RejectionRequest $request, $id)
public function getPendingApprovals()
public function getAuditTrail($itemId, Request $request)
public function bulkTransfer(BulkTransferRequest $request)
public function getLocationMovements($locationId, Request $request)
```

#### 2. StockMovementService
Create `app/Services/StockMovementService.php`:

**Core Methods:**
```php
public function createMovement($data)
public function processTransfer($fromLocation, $toLocation, $items)
public function processAdjustment($location, $items, $reason)
public function recordConsumption($location, $items, $reference)
public function approveMovement($movementId, $approverId)
public function rejectMovement($movementId, $approverId, $reason)
public function calculateStockImpact($movement)
public function validateMovement($movementData)
public function getMovementHistory($filters = [])
public function generateMovementReport($criteria)
```

**Advanced Features:**
```php
public function processAutoConsumption($orderId, $consumptionData)
public function handleReturnToStock($items, $reason)
public function processBulkAdjustment($adjustments, $reason)
public function schedulePeriodicStockCheck($location)
public function reconcileStockDiscrepancies($location)
```

#### 3. StockTransferService
Create `app/Services/StockTransferService.php`:

**Transfer Management:**
```php
public function initiateTransfer($data)
public function validateTransferRequest($fromLocation, $toLocation, $items)
public function processTransferApproval($transferId)
public function executeTransfer($transfer)
public function cancelTransfer($transferId, $reason)
public function getTransferStatus($transferId)
public function calculateTransferCost($transfer)
```

**Multi-location Support:**
```php
public function getAvailableStock($itemId, $locationId)
public function findNearestStockLocation($itemId, $requestingLocation)
public function balanceStockAcrossLocations($itemId)
public function generateTransferSuggestions($location)
```

#### 4. StockAdjustmentService
Create `app/Services/StockAdjustmentService.php`:

**Adjustment Processing:**
```php
public function createAdjustment($data)
public function validateAdjustmentReason($reason)
public function calculateVariance($itemId, $location, $countedQuantity)
public function processPhysicalCount($location, $countData)
public function handleSpoilage($items, $spoilageData)
public function processWarrantyReturn($items, $returnData)
public function generateVarianceReport($location, $period)
```

### Data Models

#### 1. StockMovement Model Enhancements
Extend `app/Models/StockMovement.php`:

**Relationships:**
```php
public function inventoryItem()
public function fromLocation()
public function toLocation()
public function createdBy()
public function approvedBy()
public function purchaseOrder()
public function consumptionOrder()
```

**Scopes:**
```php
public function scopeByType($query, $type)
public function scopeByLocation($query, $locationId)
public function scopePendingApproval($query)
public function scopeByDateRange($query, $start, $end)
public function scopeByItem($query, $itemId)
```

**Calculated Attributes:**
```php
public function getRunningBalanceAttribute()
public function getMovementValueAttribute()
public function getApprovalStatusAttribute()
```

#### 2. StockAdjustment Model
Create `app/Models/StockAdjustment.php`:

**Properties:**
- adjustment_id (unique)
- inventory_item_id
- storage_location_id
- adjustment_type (count, spoilage, damage, expired, theft, found)
- quantity_before
- quantity_after
- quantity_difference
- unit_cost
- total_value_impact
- reason_code
- detailed_reason
- reference_number
- adjustment_date
- counted_by
- approved_by
- approval_status

#### 3. ConsumptionRecord Model
Create `app/Models/ConsumptionRecord.php`:

**Tracking Usage:**
- consumption_id
- inventory_item_id
- storage_location_id
- quantity_consumed
- unit_cost
- total_cost
- consumption_type (kitchen, housekeeping, maintenance, activity)
- reference_type (order, reservation, maintenance_request)
- reference_id
- consumed_at
- recorded_by

### Features Implementation

#### 1. Stock Transfer System
**Transfer Workflow:**
```php
public function initiateStockTransfer($transferData)
{
    // Validate transfer request
    $this->validateTransferRequest($transferData);
    
    // Check stock availability
    $this->checkStockAvailability($transferData['from_location'], $transferData['items']);
    
    // Create transfer record
    $transfer = StockMovement::create([
        'type' => 'transfer',
        'from_location_id' => $transferData['from_location'],
        'to_location_id' => $transferData['to_location'],
        'status' => 'pending',
        'created_by' => auth()->id(),
        'reference_number' => $this->generateReferenceNumber('TRF')
    ]);
    
    // Add transfer items
    foreach ($transferData['items'] as $item) {
        $transfer->items()->create($item);
    }
    
    // Send for approval if required
    if ($this->requiresApproval($transfer)) {
        $this->sendForApproval($transfer);
    } else {
        $this->executeTransfer($transfer);
    }
    
    return $transfer;
}
```

#### 2. Stock Adjustment Processing
**Physical Count Reconciliation:**
```php
public function processPhysicalCount($locationId, $countData)
{
    $discrepancies = [];
    
    foreach ($countData as $item) {
        $currentStock = $this->getCurrentStock($item['inventory_item_id'], $locationId);
        $countedQuantity = $item['counted_quantity'];
        
        if ($currentStock != $countedQuantity) {
            $adjustment = $this->createAdjustment([
                'inventory_item_id' => $item['inventory_item_id'],
                'storage_location_id' => $locationId,
                'adjustment_type' => 'physical_count',
                'quantity_before' => $currentStock,
                'quantity_after' => $countedQuantity,
                'reason_code' => 'count_discrepancy',
                'detailed_reason' => $item['notes'] ?? 'Physical count adjustment',
                'counted_by' => auth()->id()
            ]);
            
            $discrepancies[] = $adjustment;
        }
    }
    
    return $discrepancies;
}
```

#### 3. Consumption Tracking
**Automatic Consumption Recording:**
```php
public function recordOrderConsumption($orderId, $orderType)
{
    $order = $this->getOrder($orderId, $orderType);
    $consumptions = [];
    
    foreach ($order->items as $orderItem) {
        // Get recipe ingredients for the item
        $ingredients = $this->getRecipeIngredients($orderItem->item_id);
        
        foreach ($ingredients as $ingredient) {
            $consumptionQuantity = $ingredient->quantity_per_unit * $orderItem->quantity;
            
            $consumption = ConsumptionRecord::create([
                'inventory_item_id' => $ingredient->inventory_item_id,
                'storage_location_id' => $this->getDefaultLocation($ingredient->inventory_item_id),
                'quantity_consumed' => $consumptionQuantity,
                'consumption_type' => $this->mapOrderTypeToConsumption($orderType),
                'reference_type' => $orderType,
                'reference_id' => $orderId,
                'consumed_at' => now(),
                'recorded_by' => auth()->id()
            ]);
            
            // Update stock levels
            $this->updateStockLevel($ingredient->inventory_item_id, -$consumptionQuantity);
            
            $consumptions[] = $consumption;
        }
    }
    
    return $consumptions;
}
```

#### 4. Approval Workflow
**Movement Approval System:**
```php
public function processMovementApproval($movementId, $action, $approverId, $comments = null)
{
    $movement = StockMovement::findOrFail($movementId);
    
    if ($action === 'approve') {
        $movement->update([
            'status' => 'approved',
            'approved_by' => $approverId,
            'approved_at' => now(),
            'approval_comments' => $comments
        ]);
        
        // Execute the movement
        $this->executeMovement($movement);
        
        // Send notification
        $this->notifyMovementApproved($movement);
        
    } else if ($action === 'reject') {
        $movement->update([
            'status' => 'rejected',
            'approved_by' => $approverId,
            'approved_at' => now(),
            'approval_comments' => $comments
        ]);
        
        // Notify rejection
        $this->notifyMovementRejected($movement);
    }
    
    return $movement;
}
```

### Request Validation

#### 1. StockTransferRequest
Create `app/Http/Requests/StockTransferRequest.php`:

```php
public function rules()
{
    return [
        'from_location_id' => 'required|exists:storage_locations,id',
        'to_location_id' => 'required|exists:storage_locations,id|different:from_location_id',
        'items' => 'required|array|min:1',
        'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
        'items.*.quantity' => 'required|numeric|min:0.01',
        'transfer_reason' => 'required|string|max:255',
        'notes' => 'nullable|string|max:1000',
        'scheduled_date' => 'nullable|date|after_or_equal:today'
    ];
}
```

#### 2. StockAdjustmentRequest
Create `app/Http/Requests/StockAdjustmentRequest.php`:

```php
public function rules()
{
    return [
        'storage_location_id' => 'required|exists:storage_locations,id',
        'adjustments' => 'required|array|min:1',
        'adjustments.*.inventory_item_id' => 'required|exists:inventory_items,id',
        'adjustments.*.adjustment_type' => 'required|in:count,spoilage,damage,expired,theft,found,return',
        'adjustments.*.quantity_difference' => 'required|numeric',
        'adjustments.*.reason' => 'required|string|max:255',
        'adjustment_date' => 'required|date|before_or_equal:today',
        'notes' => 'nullable|string|max:1000'
    ];
}
```

### Database Migrations

#### 1. Stock Adjustments Migration
Create migration for enhanced stock adjustments:

```php
Schema::create('stock_adjustments', function (Blueprint $table) {
    $table->id();
    $table->string('adjustment_id')->unique();
    $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
    $table->foreignId('storage_location_id')->constrained()->onDelete('cascade');
    $table->enum('adjustment_type', ['count', 'spoilage', 'damage', 'expired', 'theft', 'found', 'return']);
    $table->decimal('quantity_before', 10, 3);
    $table->decimal('quantity_after', 10, 3);
    $table->decimal('quantity_difference', 10, 3);
    $table->decimal('unit_cost', 10, 2);
    $table->decimal('total_value_impact', 12, 2);
    $table->string('reason_code', 50);
    $table->text('detailed_reason');
    $table->string('reference_number')->nullable();
    $table->datetime('adjustment_date');
    $table->foreignId('counted_by')->constrained('users');
    $table->foreignId('approved_by')->nullable()->constrained('users');
    $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
    $table->text('approval_comments')->nullable();
    $table->timestamps();
    
    $table->index(['storage_location_id', 'adjustment_date']);
    $table->index(['inventory_item_id', 'adjustment_date']);
});
```

#### 2. Consumption Records Migration
```php
Schema::create('consumption_records', function (Blueprint $table) {
    $table->id();
    $table->string('consumption_id')->unique();
    $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
    $table->foreignId('storage_location_id')->constrained()->onDelete('cascade');
    $table->decimal('quantity_consumed', 10, 3);
    $table->decimal('unit_cost', 10, 2);
    $table->decimal('total_cost', 12, 2);
    $table->enum('consumption_type', ['kitchen', 'housekeeping', 'maintenance', 'activity', 'front_desk']);
    $table->string('reference_type', 50); // order, reservation, maintenance_request
    $table->unsignedBigInteger('reference_id');
    $table->datetime('consumed_at');
    $table->foreignId('recorded_by')->constrained('users');
    $table->text('notes')->nullable();
    $table->timestamps();
    
    $table->index(['reference_type', 'reference_id']);
    $table->index(['inventory_item_id', 'consumed_at']);
    $table->index(['consumption_type', 'consumed_at']);
});
```

### Integration Points

#### 1. Restaurant System Integration
```php
public function integrateWithRestaurantOrders()
{
    // Auto-consume ingredients when orders are completed
    Event::listen(RestaurantOrderCompleted::class, function ($event) {
        $this->stockMovementService->recordOrderConsumption(
            $event->order->id, 
            'restaurant_order'
        );
    });
}
```

#### 2. Housekeeping Integration
```php
public function integrateWithHousekeeping()
{
    // Auto-consume amenities and supplies
    Event::listen(RoomCleaned::class, function ($event) {
        $this->stockMovementService->recordRoomConsumption(
            $event->room->id,
            $event->supplies_used
        );
    });
}
```

### Testing Requirements

#### 1. Unit Tests
Create `tests/Unit/Services/StockMovementServiceTest.php`:
- Test movement creation and validation
- Test transfer processing logic
- Test adjustment calculations
- Test consumption recording

#### 2. Feature Tests
Create `tests/Feature/StockMovementTest.php`:
- Test stock transfer workflows
- Test adjustment approval process
- Test consumption tracking
- Test audit trail generation

### Performance Optimization

#### 1. Caching Strategy
```php
public function getCachedStockLevel($itemId, $locationId)
{
    return Cache::remember("stock_level_{$itemId}_{$locationId}", 300, function () use ($itemId, $locationId) {
        return $this->calculateCurrentStock($itemId, $locationId);
    });
}
```

#### 2. Batch Processing
```php
public function processBulkMovements($movements)
{
    DB::transaction(function () use ($movements) {
        foreach ($movements as $movement) {
            $this->processMovement($movement);
        }
        
        // Clear relevant caches
        $this->clearStockCaches($movements);
    });
}
```

## Acceptance Criteria

1. **Movement Tracking:**
   - ✅ Complete audit trail for all stock movements
   - ✅ Real-time stock level updates
   - ✅ Movement categorization and filtering

2. **Transfer Management:**
   - ✅ Inter-location stock transfers
   - ✅ Transfer approval workflows
   - ✅ Bulk transfer operations

3. **Adjustment Processing:**
   - ✅ Physical count reconciliation
   - ✅ Spoilage and damage tracking
   - ✅ Variance reporting and analysis

4. **Consumption Tracking:**
   - ✅ Automatic consumption recording
   - ✅ Department-wise consumption tracking
   - ✅ Integration with operational systems

5. **Approval Workflows:**
   - ✅ Configurable approval thresholds
   - ✅ Multi-level approval support
   - ✅ Approval notification system

## Implementation Notes

1. **Data Integrity:**
   - Implement transaction locks for concurrent movements
   - Validate stock availability before transfers
   - Maintain referential integrity

2. **Performance:**
   - Optimize queries for large movement histories
   - Implement efficient caching strategies
   - Use database indexes appropriately

3. **Business Rules:**
   - Configure approval thresholds by value/quantity
   - Set up automatic movement triggers
   - Define consumption calculation rules

4. **Audit Requirements:**
   - Maintain immutable movement records
   - Track all changes with user attribution
   - Generate compliance reports

## Related Issues
- Issue #01: Database Schema Design
- Issue #02: Core Inventory Management Backend System
- Issue #04: Supplier Management System
- Issue #06: Inventory Analytics and Reporting System
