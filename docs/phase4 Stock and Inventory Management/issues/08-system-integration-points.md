# Issue #08: System Integration Points

## Overview
Implement comprehensive integration points between the inventory management system and other resort operational systems including restaurant/kitchen operations, accommodation housekeeping, activity equipment management, and front desk services for the Banrimkwae Resort.

## Priority
High

## Estimated Duration
5-6 days

## Dependencies
- Issue #01: Database Schema Design
- Issue #02: Core Inventory Management Backend System
- Issue #05: Stock Movement and Transaction Tracking
- Existing restaurant/accommodation/activity systems

## Technical Requirements

### Integration Architecture

#### 1. Integration Service Layer
Create `app/Services/IntegrationService.php`:

**Core Integration Methods:**
```php
public function registerIntegrationPoint($systemName, $config)
public function processExternalEvent($systemName, $eventType, $data)
public function syncDataWithExternalSystem($systemName, $syncType)
public function handleWebhookNotification($systemName, $payload)
public function generateIntegrationReport($systemName, $period)
public function validateIntegrationData($systemName, $data)
public function retryFailedIntegrations($systemName = null)
```

#### 2. Event-Driven Integration
**Integration Event Handler:**
```php
class IntegrationEventHandler
{
    public function handle($event)
    {
        switch ($event->type) {
            case 'restaurant.order.completed':
                return $this->handleRestaurantOrderCompleted($event);
            case 'housekeeping.room.cleaned':
                return $this->handleRoomCleaned($event);
            case 'activity.equipment.used':
                return $this->handleEquipmentUsed($event);
            case 'front_desk.amenity.provided':
                return $this->handleAmenityProvided($event);
            default:
                $this->logUnhandledEvent($event);
        }
    }
}
```

### Restaurant/Kitchen Integration

#### 1. RestaurantIntegrationController
Create `app/Http/Controllers/RestaurantIntegrationController.php`:

**API Endpoints:**
- `POST /api/integration/restaurant/order-consumption` - Process order ingredient consumption
- `GET /api/integration/restaurant/recipe-ingredients/{recipe_id}` - Get recipe ingredients
- `POST /api/integration/restaurant/menu-item-availability` - Update menu availability based on stock
- `GET /api/integration/restaurant/kitchen-stock/{location}` - Get kitchen stock levels
- `POST /api/integration/restaurant/ingredient-request` - Handle ingredient requests
- `PUT /api/integration/restaurant/waste-report` - Report kitchen waste

**Methods:**
```php
public function processOrderConsumption(OrderConsumptionRequest $request)
public function getRecipeIngredients($recipeId)
public function updateMenuAvailability(Request $request)
public function getKitchenStock($location)
public function handleIngredientRequest(IngredientRequestRequest $request)
public function reportKitchenWaste(WasteReportRequest $request)
```

#### 2. RestaurantIntegrationService
Create `app/Services/RestaurantIntegrationService.php`:

**Core Integration Features:**
```php
public function consumeIngredientsForOrder($orderId, $orderItems)
{
    $consumptions = [];
    
    foreach ($orderItems as $item) {
        $recipe = $this->getRecipeForMenuItem($item['menu_item_id']);
        
        if (!$recipe) {
            continue; // Skip items without recipes
        }
        
        foreach ($recipe->ingredients as $ingredient) {
            $requiredQuantity = $ingredient->quantity_per_unit * $item['quantity'];
            
            // Check stock availability
            $available = $this->checkStockAvailability(
                $ingredient->inventory_item_id,
                $requiredQuantity,
                'kitchen'
            );
            
            if (!$available) {
                throw new InsufficientStockException(
                    "Insufficient stock for ingredient: {$ingredient->inventory_item->name}"
                );
            }
            
            // Record consumption
            $consumption = $this->recordConsumption([
                'inventory_item_id' => $ingredient->inventory_item_id,
                'quantity_consumed' => $requiredQuantity,
                'consumption_type' => 'kitchen',
                'reference_type' => 'restaurant_order',
                'reference_id' => $orderId,
                'consumed_at' => now()
            ]);
            
            $consumptions[] = $consumption;
        }
    }
    
    return $consumptions;
}

public function updateMenuItemAvailability()
{
    $menuItems = $this->getMenuItemsWithRecipes();
    $availabilityUpdates = [];
    
    foreach ($menuItems as $menuItem) {
        $isAvailable = $this->checkMenuItemStockAvailability($menuItem);
        
        if ($menuItem->is_available !== $isAvailable) {
            $availabilityUpdates[] = [
                'menu_item_id' => $menuItem->id,
                'is_available' => $isAvailable,
                'reason' => $isAvailable ? 'stock_available' : 'insufficient_stock'
            ];
        }
    }
    
    // Send updates to restaurant system
    if (!empty($availabilityUpdates)) {
        $this->sendMenuAvailabilityUpdates($availabilityUpdates);
    }
    
    return $availabilityUpdates;
}
```

### Accommodation/Housekeeping Integration

#### 1. HousekeepingIntegrationController
Create `app/Http/Controllers/HousekeepingIntegrationController.php`:

**API Endpoints:**
- `POST /api/integration/housekeeping/room-consumption` - Record room amenity consumption
- `GET /api/integration/housekeeping/amenity-stock/{location}` - Get housekeeping stock
- `POST /api/integration/housekeeping/minibar-restock` - Handle minibar restocking
- `POST /api/integration/housekeeping/linen-tracking` - Track linen usage
- `GET /api/integration/housekeeping/supply-requirements` - Get daily supply requirements

**Methods:**
```php
public function recordRoomConsumption(RoomConsumptionRequest $request)
public function getAmenityStock($location)
public function processMinibarRestock(MinibarRestockRequest $request)
public function trackLinenUsage(LinenTrackingRequest $request)
public function getDailySupplyRequirements(Request $request)
```

#### 2. HousekeepingIntegrationService
Create `app/Services/HousekeepingIntegrationService.php`:

**Room Service Integration:**
```php
public function processRoomCleaning($roomId, $cleaningData)
{
    $consumptions = [];
    
    // Standard amenity consumption per room type
    $roomType = $this->getRoomType($roomId);
    $standardAmenities = $this->getStandardAmenities($roomType);
    
    foreach ($standardAmenities as $amenity) {
        $consumption = $this->recordConsumption([
            'inventory_item_id' => $amenity['inventory_item_id'],
            'quantity_consumed' => $amenity['quantity_per_cleaning'],
            'consumption_type' => 'housekeeping',
            'reference_type' => 'room_cleaning',
            'reference_id' => $roomId,
            'location_id' => $this->getHousekeepingStockLocation($roomId)
        ]);
        
        $consumptions[] = $consumption;
    }
    
    // Additional amenities used (from cleaning report)
    if (isset($cleaningData['additional_amenities'])) {
        foreach ($cleaningData['additional_amenities'] as $amenity) {
            $consumption = $this->recordConsumption([
                'inventory_item_id' => $amenity['item_id'],
                'quantity_consumed' => $amenity['quantity'],
                'consumption_type' => 'housekeeping',
                'reference_type' => 'room_cleaning_additional',
                'reference_id' => $roomId
            ]);
            
            $consumptions[] = $consumption;
        }
    }
    
    return $consumptions;
}

public function manageMinibarStock($roomId, $minibarData)
{
    $movements = [];
    
    foreach ($minibarData['items'] as $item) {
        if ($item['consumed'] > 0) {
            // Record consumption
            $this->recordConsumption([
                'inventory_item_id' => $item['inventory_item_id'],
                'quantity_consumed' => $item['consumed'],
                'consumption_type' => 'minibar',
                'reference_type' => 'guest_consumption',
                'reference_id' => $roomId
            ]);
        }
        
        if ($item['restock_quantity'] > 0) {
            // Record restock movement
            $movement = $this->createStockMovement([
                'type' => 'transfer',
                'inventory_item_id' => $item['inventory_item_id'],
                'from_location_id' => $this->getMainStockLocation(),
                'to_location_id' => $this->getMinibarLocation($roomId),
                'quantity' => $item['restock_quantity'],
                'reference_type' => 'minibar_restock',
                'reference_id' => $roomId
            ]);
            
            $movements[] = $movement;
        }
    }
    
    return $movements;
}
```

### Activity Equipment Integration

#### 1. ActivityIntegrationController
Create `app/Http/Controllers/ActivityIntegrationController.php`:

**API Endpoints:**
- `POST /api/integration/activity/equipment-checkout` - Check out equipment
- `POST /api/integration/activity/equipment-return` - Return equipment
- `GET /api/integration/activity/equipment-availability` - Check equipment availability
- `POST /api/integration/activity/equipment-maintenance` - Report maintenance needs
- `GET /api/integration/activity/activity-supplies/{activity}` - Get activity supply requirements

**Methods:**
```php
public function checkoutEquipment(EquipmentCheckoutRequest $request)
public function returnEquipment(EquipmentReturnRequest $request)
public function checkEquipmentAvailability(Request $request)
public function reportEquipmentMaintenance(MaintenanceRequest $request)
public function getActivitySupplies($activityType, Request $request)
```

#### 2. ActivityIntegrationService
Create `app/Services/ActivityIntegrationService.php`:

**Equipment Management:**
```php
public function processEquipmentCheckout($checkoutData)
{
    $checkouts = [];
    
    foreach ($checkoutData['equipment'] as $equipment) {
        // Validate availability
        $available = $this->checkEquipmentAvailability(
            $equipment['inventory_item_id'],
            $equipment['quantity'],
            $equipment['checkout_date']
        );
        
        if (!$available) {
            throw new EquipmentUnavailableException(
                "Equipment not available: {$equipment['name']}"
            );
        }
        
        // Create checkout record
        $checkout = EquipmentCheckout::create([
            'inventory_item_id' => $equipment['inventory_item_id'],
            'quantity' => $equipment['quantity'],
            'checked_out_to' => $checkoutData['guest_id'],
            'activity_type' => $checkoutData['activity_type'],
            'checkout_date' => $equipment['checkout_date'],
            'expected_return_date' => $equipment['expected_return_date'],
            'checked_out_by' => auth()->id(),
            'status' => 'checked_out'
        ]);
        
        // Update available stock
        $this->updateAvailableStock(
            $equipment['inventory_item_id'],
            -$equipment['quantity']
        );
        
        $checkouts[] = $checkout;
    }
    
    return $checkouts;
}

public function processEquipmentReturn($returnData)
{
    $returns = [];
    
    foreach ($returnData['equipment'] as $equipment) {
        $checkout = EquipmentCheckout::find($equipment['checkout_id']);
        
        if (!$checkout) {
            throw new CheckoutNotFoundException("Checkout record not found");
        }
        
        // Update checkout record
        $checkout->update([
            'returned_quantity' => $equipment['returned_quantity'],
            'return_date' => $equipment['return_date'],
            'condition_on_return' => $equipment['condition'],
            'return_notes' => $equipment['notes'],
            'returned_by' => auth()->id(),
            'status' => 'returned'
        ]);
        
        // Handle damaged equipment
        if ($equipment['condition'] === 'damaged') {
            $this->handleDamagedEquipment($checkout, $equipment);
        } else {
            // Return to available stock
            $this->updateAvailableStock(
                $checkout->inventory_item_id,
                $equipment['returned_quantity']
            );
        }
        
        $returns[] = $checkout;
    }
    
    return $returns;
}
```

### Front Desk Integration

#### 1. FrontDeskIntegrationController
Create `app/Http/Controllers/FrontDeskIntegrationController.php`:

**API Endpoints:**
- `POST /api/integration/front-desk/guest-amenities` - Provide guest amenities
- `GET /api/integration/front-desk/welcome-kit-items` - Get welcome kit contents
- `POST /api/integration/front-desk/special-requests` - Handle special amenity requests
- `GET /api/integration/front-desk/amenity-inventory` - Check front desk inventory

**Front Desk Service Integration:**
```php
public function provideGuestAmenities($guestId, $amenities)
{
    $provisions = [];
    
    foreach ($amenities as $amenity) {
        // Validate stock availability
        $available = $this->checkStockAvailability(
            $amenity['inventory_item_id'],
            $amenity['quantity'],
            'front_desk'
        );
        
        if (!$available) {
            throw new InsufficientStockException(
                "Insufficient stock for amenity: {$amenity['name']}"
            );
        }
        
        // Record provision
        $provision = $this->recordConsumption([
            'inventory_item_id' => $amenity['inventory_item_id'],
            'quantity_consumed' => $amenity['quantity'],
            'consumption_type' => 'front_desk',
            'reference_type' => 'guest_amenity',
            'reference_id' => $guestId
        ]);
        
        $provisions[] = $provision;
    }
    
    return $provisions;
}
```

### Integration Data Models

#### 1. SystemIntegration Model
Create `app/Models/SystemIntegration.php`:

**Integration Configuration:**
```php
protected $fillable = [
    'system_name',
    'integration_type',
    'endpoint_url',
    'authentication_method',
    'configuration',
    'is_active',
    'last_sync_at',
    'sync_frequency'
];

protected $casts = [
    'configuration' => 'array',
    'is_active' => 'boolean',
    'last_sync_at' => 'datetime'
];
```

#### 2. IntegrationLog Model
Create `app/Models/IntegrationLog.php`:

**Integration Audit Trail:**
```php
protected $fillable = [
    'system_name',
    'integration_type',
    'event_type',
    'payload',
    'response',
    'status',
    'error_message',
    'processed_at'
];

protected $casts = [
    'payload' => 'array',
    'response' => 'array',
    'processed_at' => 'datetime'
];
```

### Request Validation

#### 1. OrderConsumptionRequest
Create `app/Http/Requests/OrderConsumptionRequest.php`:

```php
public function rules()
{
    return [
        'order_id' => 'required|integer',
        'order_items' => 'required|array|min:1',
        'order_items.*.menu_item_id' => 'required|integer',
        'order_items.*.quantity' => 'required|integer|min:1',
        'consumption_location' => 'required|exists:storage_locations,id',
        'order_completed_at' => 'required|date'
    ];
}
```

#### 2. RoomConsumptionRequest
Create `app/Http/Requests/RoomConsumptionRequest.php`:

```php
public function rules()
{
    return [
        'room_id' => 'required|string|max:20',
        'room_type' => 'required|string|max:50',
        'cleaning_type' => 'required|in:checkout,maintenance,deep_cleaning,standard',
        'amenities_used' => 'nullable|array',
        'amenities_used.*.inventory_item_id' => 'required|exists:inventory_items,id',
        'amenities_used.*.quantity' => 'required|numeric|min:0',
        'cleaned_at' => 'required|date',
        'cleaned_by' => 'required|exists:users,id'
    ];
}
```

### Database Migrations

#### 1. System Integrations Migration
```php
Schema::create('system_integrations', function (Blueprint $table) {
    $table->id();
    $table->string('system_name', 100)->unique();
    $table->enum('integration_type', ['api', 'webhook', 'event', 'batch']);
    $table->string('endpoint_url')->nullable();
    $table->enum('authentication_method', ['none', 'api_key', 'oauth', 'basic']);
    $table->json('configuration')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamp('last_sync_at')->nullable();
    $table->integer('sync_frequency_minutes')->default(60);
    $table->timestamps();
});
```

#### 2. Equipment Checkouts Migration
```php
Schema::create('equipment_checkouts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
    $table->integer('quantity');
    $table->string('checked_out_to', 100); // Guest ID or name
    $table->string('activity_type', 50);
    $table->datetime('checkout_date');
    $table->datetime('expected_return_date');
    $table->datetime('return_date')->nullable();
    $table->integer('returned_quantity')->nullable();
    $table->enum('condition_on_return', ['good', 'fair', 'damaged', 'lost'])->nullable();
    $table->text('return_notes')->nullable();
    $table->foreignId('checked_out_by')->constrained('users');
    $table->foreignId('returned_by')->nullable()->constrained('users');
    $table->enum('status', ['checked_out', 'returned', 'overdue', 'lost']);
    $table->timestamps();
    
    $table->index(['inventory_item_id', 'status']);
    $table->index(['checkout_date']);
});
```

### Integration Testing

#### 1. Integration Test Suites
Create comprehensive test suites for each integration:

```php
class RestaurantIntegrationTest extends TestCase
{
    public function test_order_consumption_records_correct_ingredients()
    {
        // Test ingredient consumption recording
        $order = $this->createTestOrder();
        $result = $this->restaurantService->consumeIngredientsForOrder($order->id, $order->items);
        
        $this->assertCount(3, $result); // Expected number of consumptions
        $this->assertDatabaseHas('consumption_records', [
            'reference_type' => 'restaurant_order',
            'reference_id' => $order->id
        ]);
    }
    
    public function test_menu_availability_updates_when_stock_low()
    {
        // Test menu item availability updates
        $this->setLowStock('ingredient_123');
        $updates = $this->restaurantService->updateMenuItemAvailability();
        
        $this->assertArrayContains([
            'is_available' => false,
            'reason' => 'insufficient_stock'
        ], $updates);
    }
}
```

## Acceptance Criteria

1. **Restaurant Integration:**
   - ✅ Automatic ingredient consumption tracking
   - ✅ Real-time menu availability updates
   - ✅ Kitchen stock level monitoring

2. **Housekeeping Integration:**
   - ✅ Room amenity consumption tracking
   - ✅ Minibar stock management
   - ✅ Linen and supply tracking

3. **Activity Integration:**
   - ✅ Equipment checkout/return system
   - ✅ Equipment availability tracking
   - ✅ Maintenance reporting integration

4. **Front Desk Integration:**
   - ✅ Guest amenity provision tracking
   - ✅ Welcome kit management
   - ✅ Special request handling

5. **Data Consistency:**
   - ✅ Real-time stock updates across systems
   - ✅ Conflict resolution mechanisms
   - ✅ Integration audit trails

## Implementation Notes

1. **Event-Driven Architecture:**
   - Use Laravel Events for loose coupling
   - Implement retry mechanisms for failed integrations
   - Maintain integration logs for troubleshooting

2. **Data Validation:**
   - Validate all integration data thoroughly
   - Handle external system failures gracefully
   - Implement rollback mechanisms

3. **Performance:**
   - Use queues for heavy integration processing
   - Implement caching for frequently accessed data
   - Optimize database queries for integration endpoints

4. **Security:**
   - Secure integration endpoints with authentication
   - Validate all incoming webhook data
   - Implement rate limiting for integration APIs

## Related Issues
- Issue #02: Core Inventory Management Backend System
- Issue #05: Stock Movement and Transaction Tracking
- Issue #09: Advanced Features and Automation
- Issue #11: Testing and Quality Assurance
