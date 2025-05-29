# Issue #04: Supplier Management System

## Overview
Implement a comprehensive supplier management system to handle vendor relationships, performance tracking, price management, and delivery scheduling for the Banrimkwae Resort inventory system.

## Priority
High

## Estimated Duration
5-6 days

## Dependencies
- Issue #01: Database Schema Design (suppliers table)
- Issue #02: Core Inventory Management Backend System
- Basic authentication and authorization system

## Technical Requirements

### Backend Components

#### 1. SupplierController
Create `app/Http/Controllers/SupplierController.php`:

**API Endpoints:**
- `GET /api/suppliers` - List all suppliers with filtering/pagination
- `POST /api/suppliers` - Create new supplier
- `GET /api/suppliers/{id}` - Get supplier details
- `PUT /api/suppliers/{id}` - Update supplier information
- `DELETE /api/suppliers/{id}` - Deactivate supplier
- `GET /api/suppliers/{id}/items` - Get supplier's inventory items
- `GET /api/suppliers/{id}/orders` - Get purchase order history
- `GET /api/suppliers/{id}/performance` - Get performance metrics
- `POST /api/suppliers/{id}/price-update` - Bulk update item prices
- `GET /api/suppliers/price-comparison/{item_id}` - Compare prices across suppliers

**Methods:**
```php
public function index(Request $request)
public function store(SupplierRequest $request)
public function show($id)
public function update(SupplierRequest $request, $id)
public function destroy($id)
public function getSupplierItems($id)
public function getOrderHistory($id)
public function getPerformanceMetrics($id)
public function updatePrices(PriceUpdateRequest $request, $id)
public function priceComparison($itemId)
```

#### 2. SupplierService
Create `app/Services/SupplierService.php`:

**Core Methods:**
```php
public function getAllSuppliers($filters = [])
public function createSupplier($data)
public function updateSupplier($id, $data)
public function deactivateSupplier($id)
public function getSupplierItems($supplierId)
public function updateSupplierPrices($supplierId, $priceData)
public function calculatePerformanceMetrics($supplierId)
public function getDeliverySchedule($supplierId)
public function findBestSupplierForItem($itemId, $criteria = [])
public function generateSupplierReport($supplierId, $period)
```

**Performance Tracking:**
- On-time delivery rate calculation
- Quality score tracking
- Price competitiveness analysis
- Order fulfillment accuracy
- Response time metrics

#### 3. SupplierItemService
Create `app/Services/SupplierItemService.php`:

**Methods:**
```php
public function syncSupplierItems($supplierId, $items)
public function updateItemPrice($supplierId, $itemId, $price)
public function getItemPriceHistory($supplierId, $itemId)
public function bulkPriceUpdate($supplierId, $priceUpdates)
public function compareSupplierPrices($itemId)
public function getSupplierCatalog($supplierId)
```

### Data Models

#### 1. Supplier Model Enhancements
Extend `app/Models/Supplier.php`:

**Relationships:**
```php
public function supplierItems()
public function purchaseOrders()
public function deliverySchedules()
public function performanceMetrics()
public function priceHistories()
```

**Scopes:**
```php
public function scopeActive($query)
public function scopeByCategory($query, $category)
public function scopeByRating($query, $minRating)
public function scopePreferred($query)
```

#### 2. SupplierItem Model
Create `app/Models/SupplierItem.php`:

**Properties:**
- supplier_id
- inventory_item_id
- supplier_sku
- current_price
- minimum_order_quantity
- lead_time_days
- is_preferred
- last_updated

#### 3. SupplierPerformance Model
Create `app/Models/SupplierPerformance.php`:

**Metrics Tracking:**
- delivery_accuracy_rate
- quality_score
- price_competitiveness
- response_time_hours
- order_fulfillment_rate
- period_start/end dates

### Features Implementation

#### 1. Supplier Profile Management
**Basic Information:**
- Company details (name, address, contact)
- Business registration information
- Tax identification numbers
- Contact persons and roles
- Payment terms and methods
- Delivery capabilities

**Advanced Features:**
- Document management (certificates, contracts)
- Supplier categorization and tagging
- Credit limit and payment history
- Preferred supplier designation
- Multi-location support

#### 2. Price Management System
**Price Tracking:**
```php
public function trackPriceChange($supplierId, $itemId, $oldPrice, $newPrice)
{
    return SupplierPriceHistory::create([
        'supplier_id' => $supplierId,
        'inventory_item_id' => $itemId,
        'old_price' => $oldPrice,
        'new_price' => $newPrice,
        'changed_at' => now(),
        'changed_by' => auth()->id()
    ]);
}
```

**Price Comparison:**
```php
public function getBestPriceSupplier($itemId, $quantity = 1)
{
    return SupplierItem::where('inventory_item_id', $itemId)
        ->where('minimum_order_quantity', '<=', $quantity)
        ->join('suppliers', 'suppliers.id', '=', 'supplier_items.supplier_id')
        ->where('suppliers.is_active', true)
        ->orderBy('current_price', 'asc')
        ->first();
}
```

#### 3. Performance Tracking
**Delivery Performance:**
```php
public function calculateDeliveryPerformance($supplierId, $period)
{
    $orders = PurchaseOrder::where('supplier_id', $supplierId)
        ->where('created_at', '>=', $period['start'])
        ->where('created_at', '<=', $period['end'])
        ->get();

    $onTimeDeliveries = $orders->where('delivered_at', '<=', 'expected_delivery_date')->count();
    $totalDeliveries = $orders->where('status', 'delivered')->count();

    return $totalDeliveries > 0 ? ($onTimeDeliveries / $totalDeliveries) * 100 : 0;
}
```

#### 4. Delivery Scheduling
**Schedule Management:**
```php
public function createDeliverySchedule($supplierId, $scheduleData)
{
    return SupplierDeliverySchedule::create([
        'supplier_id' => $supplierId,
        'delivery_days' => $scheduleData['days'], // JSON array
        'delivery_time_slots' => $scheduleData['time_slots'],
        'coverage_areas' => $scheduleData['areas'],
        'is_active' => true
    ]);
}
```

### Request Validation

#### 1. SupplierRequest
Create `app/Http/Requests/SupplierRequest.php`:

```php
public function rules()
{
    return [
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:suppliers,email,' . $this->route('id'),
        'phone' => 'required|string|max:20',
        'address' => 'required|string|max:500',
        'contact_person' => 'required|string|max:255',
        'payment_terms' => 'required|integer|min:0|max:365',
        'category' => 'required|string|in:food,beverage,amenities,maintenance,equipment',
        'tax_id' => 'nullable|string|max:50',
        'business_registration' => 'nullable|string|max:100'
    ];
}
```

#### 2. PriceUpdateRequest
Create `app/Http/Requests/PriceUpdateRequest.php`:

```php
public function rules()
{
    return [
        'items' => 'required|array|min:1',
        'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
        'items.*.price' => 'required|numeric|min:0',
        'items.*.minimum_order_quantity' => 'nullable|integer|min:1',
        'items.*.lead_time_days' => 'nullable|integer|min:0|max:365',
        'effective_date' => 'nullable|date|after_or_equal:today'
    ];
}
```

### Database Migrations

#### 1. Supplier Performance Migration
Create migration for `supplier_performance_metrics` table:

```php
Schema::create('supplier_performance_metrics', function (Blueprint $table) {
    $table->id();
    $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
    $table->decimal('delivery_accuracy_rate', 5, 2)->default(0);
    $table->decimal('quality_score', 3, 2)->default(0);
    $table->decimal('price_competitiveness', 5, 2)->default(0);
    $table->integer('response_time_hours')->default(0);
    $table->decimal('order_fulfillment_rate', 5, 2)->default(0);
    $table->date('period_start');
    $table->date('period_end');
    $table->timestamps();
    
    $table->index(['supplier_id', 'period_start', 'period_end']);
});
```

#### 2. Supplier Price History Migration
```php
Schema::create('supplier_price_histories', function (Blueprint $table) {
    $table->id();
    $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
    $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
    $table->decimal('old_price', 10, 2);
    $table->decimal('new_price', 10, 2);
    $table->timestamp('changed_at');
    $table->foreignId('changed_by')->constrained('users');
    $table->string('reason')->nullable();
    $table->timestamps();
    
    $table->index(['supplier_id', 'inventory_item_id']);
});
```

### Integration Points

#### 1. Purchase Order Integration
```php
public function getRecommendedSupplier($inventoryItemId, $quantity)
{
    return $this->supplierService->findBestSupplierForItem($inventoryItemId, [
        'quantity' => $quantity,
        'criteria' => ['price', 'delivery_time', 'quality_score']
    ]);
}
```

#### 2. Inventory System Integration
```php
public function updateSupplierItemAvailability($supplierId, $availabilityData)
{
    foreach ($availabilityData as $item) {
        SupplierItem::where('supplier_id', $supplierId)
            ->where('inventory_item_id', $item['inventory_item_id'])
            ->update([
                'is_available' => $item['is_available'],
                'stock_level' => $item['stock_level'],
                'last_updated' => now()
            ]);
    }
}
```

### Testing Requirements

#### 1. Unit Tests
Create `tests/Unit/Services/SupplierServiceTest.php`:
- Test supplier creation and updates
- Test performance metrics calculation
- Test price comparison algorithms
- Test delivery schedule management

#### 2. Feature Tests
Create `tests/Feature/SupplierManagementTest.php`:
- Test supplier CRUD operations
- Test price update functionality
- Test performance tracking
- Test supplier recommendation system

### Performance Optimization

#### 1. Caching Strategy
```php
public function getCachedSupplierPerformance($supplierId)
{
    return Cache::remember("supplier_performance_{$supplierId}", 3600, function () use ($supplierId) {
        return $this->calculatePerformanceMetrics($supplierId);
    });
}
```

#### 2. Database Optimization
- Index on frequently queried columns
- Optimize price comparison queries
- Implement pagination for large supplier lists

## Acceptance Criteria

1. **Supplier Management:**
   - ✅ Complete CRUD operations for suppliers
   - ✅ Supplier categorization and filtering
   - ✅ Contact management and communication tracking

2. **Price Management:**
   - ✅ Real-time price updates and history tracking
   - ✅ Price comparison across suppliers
   - ✅ Bulk price update functionality

3. **Performance Tracking:**
   - ✅ Automated performance metrics calculation
   - ✅ Delivery accuracy and quality scoring
   - ✅ Historical performance reporting

4. **Integration:**
   - ✅ Seamless integration with purchase order system
   - ✅ Inventory item association and management
   - ✅ Automated supplier recommendations

5. **API Documentation:**
   - ✅ Complete API documentation with examples
   - ✅ Request/response validation
   - ✅ Error handling and status codes

## Implementation Notes

1. **Data Migration:**
   - Plan for importing existing supplier data
   - Validate supplier information before migration
   - Set up initial performance baselines

2. **Business Logic:**
   - Implement supplier rating algorithms
   - Set up automated performance monitoring
   - Configure supplier preference criteria

3. **Security:**
   - Secure supplier financial information
   - Implement role-based access to supplier data
   - Audit trail for price changes

4. **Scalability:**
   - Design for multiple supplier locations
   - Handle high-volume price updates
   - Optimize for large supplier catalogs

## Related Issues
- Issue #01: Database Schema Design
- Issue #02: Core Inventory Management Backend System
- Issue #03: Purchase Order Management System
- Issue #05: Stock Movement and Transaction Tracking
