# Issue #02: Core Inventory Management Backend System

## Priority: High
## Estimated Duration: 5-6 days
## Phase: 4 - Stock/Inventory Management
## Dependencies: Issue #01 (Database Schema)

## Overview
Develop the core backend system for inventory management including item management, stock tracking, automated reorder alerts, and real-time inventory updates. This system will serve as the foundation for all inventory operations across the resort.

## Technical Requirements

### 1. Inventory Item Management API

#### Inventory Item Controller
```php
<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\CreateItemRequest;
use App\Http\Requests\Inventory\UpdateItemRequest;
use App\Http\Requests\Inventory\StockUpdateRequest;
use App\Services\Inventory\InventoryItemService;
use App\Services\Inventory\StockMovementService;

class InventoryItemController extends Controller
{
    public function __construct(
        private InventoryItemService $itemService,
        private StockMovementService $stockService
    ) {}

    /**
     * List inventory items with filtering and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'category_id' => 'integer|exists:inventory_categories,id',
            'location_id' => 'integer|exists:storage_locations,id',
            'search' => 'string|max:255',
            'status' => 'in:in_stock,low_stock,out_of_stock',
            'barcode' => 'string|max:100',
            'per_page' => 'integer|min:1|max:100'
        ]);

        $items = $this->itemService->getItems($filters);
        
        return response()->json([
            'data' => $items,
            'meta' => [
                'low_stock_count' => $this->itemService->getLowStockCount(),
                'out_of_stock_count' => $this->itemService->getOutOfStockCount(),
                'total_value' => $this->itemService->getTotalInventoryValue()
            ]
        ]);
    }

    /**
     * Get item details with stock history
     */
    public function show(int $id): JsonResponse
    {
        $item = $this->itemService->getItemWithDetails($id);
        $movements = $this->stockService->getItemMovements($id, 30); // Last 30 days
        
        return response()->json([
            'item' => $item,
            'recent_movements' => $movements,
            'stock_analytics' => $this->itemService->getStockAnalytics($id)
        ]);
    }

    /**
     * Create new inventory item
     */
    public function store(CreateItemRequest $request): JsonResponse
    {
        $item = $this->itemService->createItem($request->validated());
        
        return response()->json([
            'message' => 'Inventory item created successfully',
            'data' => $item
        ], 201);
    }

    /**
     * Update inventory item
     */
    public function update(UpdateItemRequest $request, int $id): JsonResponse
    {
        $item = $this->itemService->updateItem($id, $request->validated());
        
        return response()->json([
            'message' => 'Inventory item updated successfully',
            'data' => $item
        ]);
    }

    /**
     * Update stock levels
     */
    public function updateStock(StockUpdateRequest $request, int $id): JsonResponse
    {
        $result = $this->stockService->updateStock($id, $request->validated());
        
        return response()->json([
            'message' => 'Stock updated successfully',
            'data' => $result
        ]);
    }

    /**
     * Get low stock items
     */
    public function lowStock(): JsonResponse
    {
        $items = $this->itemService->getLowStockItems();
        
        return response()->json([
            'data' => $items,
            'count' => count($items)
        ]);
    }

    /**
     * Barcode lookup
     */
    public function barcodeLookup(string $barcode): JsonResponse
    {
        $item = $this->itemService->findByBarcode($barcode);
        
        if (!$item) {
            return response()->json([
                'message' => 'Item not found'
            ], 404);
        }
        
        return response()->json(['data' => $item]);
    }
}
```

### 2. Inventory Item Service

```php
<?php

namespace App\Services\Inventory;

use App\Models\Inventory\InventoryItem;
use App\Models\Inventory\InventoryMovement;
use App\Services\Notification\LowStockNotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class InventoryItemService
{
    public function __construct(
        private LowStockNotificationService $notificationService
    ) {}

    public function getItems(array $filters): LengthAwarePaginator
    {
        $query = InventoryItem::with(['category', 'location', 'primarySupplier'])
            ->select([
                'inventory_items.*',
                DB::raw('CASE 
                    WHEN current_stock <= 0 THEN "out_of_stock"
                    WHEN current_stock <= reorder_level THEN "low_stock"
                    ELSE "in_stock"
                END as stock_status')
            ]);

        // Apply filters
        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['location_id'])) {
            $query->where('location_id', $filters['location_id']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name_en', 'like', "%{$filters['search']}%")
                  ->orWhere('name_th', 'like', "%{$filters['search']}%")
                  ->orWhere('sku', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['status'])) {
            switch ($filters['status']) {
                case 'out_of_stock':
                    $query->where('current_stock', '<=', 0);
                    break;
                case 'low_stock':
                    $query->whereColumn('current_stock', '<=', 'reorder_level')
                          ->where('current_stock', '>', 0);
                    break;
                case 'in_stock':
                    $query->whereColumn('current_stock', '>', 'reorder_level');
                    break;
            }
        }

        if (isset($filters['barcode'])) {
            $query->where('barcode', $filters['barcode']);
        }

        $query->where('is_active', true)
              ->orderBy('name_en');

        return $query->paginate($filters['per_page'] ?? 25);
    }

    public function getItemWithDetails(int $id): InventoryItem
    {
        return InventoryItem::with([
            'category',
            'location',
            'suppliers.supplier',
            'recentMovements' => function ($query) {
                $query->latest()->limit(10);
            }
        ])->findOrFail($id);
    }

    public function createItem(array $data): InventoryItem
    {
        DB::beginTransaction();
        
        try {
            // Generate SKU if not provided
            if (!isset($data['sku'])) {
                $data['sku'] = $this->generateSKU($data['category_id']);
            }

            $item = InventoryItem::create($data);

            // Create initial stock movement if current_stock > 0
            if ($item->current_stock > 0) {
                $this->createInitialStockMovement($item);
            }

            DB::commit();
            return $item->load(['category', 'location']);
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function updateItem(int $id, array $data): InventoryItem
    {
        $item = InventoryItem::findOrFail($id);
        
        DB::beginTransaction();
        
        try {
            $oldStock = $item->current_stock;
            $item->update($data);

            // If stock level changed, create movement record
            if (isset($data['current_stock']) && $data['current_stock'] != $oldStock) {
                $this->createStockAdjustmentMovement($item, $oldStock, $data['current_stock']);
            }

            // Check for low stock after update
            $this->checkLowStockAlert($item);

            DB::commit();
            return $item->load(['category', 'location']);
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function getLowStockItems(): Collection
    {
        return Cache::remember('low_stock_items', 300, function () {
            return InventoryItem::with(['category', 'location'])
                ->whereColumn('current_stock', '<=', 'reorder_level')
                ->where('is_active', true)
                ->orderBy('current_stock')
                ->get();
        });
    }

    public function getLowStockCount(): int
    {
        return Cache::remember('low_stock_count', 300, function () {
            return InventoryItem::whereColumn('current_stock', '<=', 'reorder_level')
                ->where('is_active', true)
                ->count();
        });
    }

    public function getOutOfStockCount(): int
    {
        return Cache::remember('out_of_stock_count', 300, function () {
            return InventoryItem::where('current_stock', '<=', 0)
                ->where('is_active', true)
                ->count();
        });
    }

    public function getTotalInventoryValue(): float
    {
        return Cache::remember('total_inventory_value', 600, function () {
            return InventoryItem::where('is_active', true)
                ->sum(DB::raw('current_stock * average_cost'));
        });
    }

    public function findByBarcode(string $barcode): ?InventoryItem
    {
        return InventoryItem::with(['category', 'location'])
            ->where('barcode', $barcode)
            ->where('is_active', true)
            ->first();
    }

    public function getStockAnalytics(int $itemId): array
    {
        $item = InventoryItem::findOrFail($itemId);
        
        $thirtyDaysAgo = now()->subDays(30);
        
        $movements = InventoryMovement::where('item_id', $itemId)
            ->where('performed_at', '>=', $thirtyDaysAgo)
            ->get();

        $totalConsumed = $movements->where('movement_type', 'consumption')->sum('quantity');
        $totalReceived = $movements->where('movement_type', 'purchase')->sum('quantity');
        $totalAdjusted = $movements->where('movement_type', 'adjustment')->sum('quantity');

        return [
            'current_stock' => $item->current_stock,
            'reorder_level' => $item->reorder_level,
            'days_of_stock' => $totalConsumed > 0 ? ($item->current_stock / ($totalConsumed / 30)) : null,
            'thirty_day_consumption' => $totalConsumed,
            'thirty_day_received' => $totalReceived,
            'thirty_day_adjustments' => $totalAdjusted,
            'turnover_rate' => $item->average_cost > 0 ? ($totalConsumed * $item->average_cost) / ($item->current_stock * $item->average_cost) : 0,
            'stock_status' => $this->getStockStatus($item)
        ];
    }

    private function generateSKU(int $categoryId): string
    {
        $category = \App\Models\Inventory\InventoryCategory::find($categoryId);
        $prefix = strtoupper(substr($category->name_en, 0, 3));
        
        $lastItem = InventoryItem::where('sku', 'like', $prefix . '%')
            ->orderBy('sku', 'desc')
            ->first();

        if ($lastItem) {
            $lastNumber = (int) substr($lastItem->sku, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    private function createInitialStockMovement(InventoryItem $item): void
    {
        InventoryMovement::create([
            'item_id' => $item->id,
            'movement_type' => 'adjustment',
            'quantity' => $item->current_stock,
            'before_stock' => 0,
            'after_stock' => $item->current_stock,
            'reference_type' => 'adjustment',
            'reference_id' => 0,
            'location_id' => $item->location_id,
            'notes' => 'Initial stock entry',
            'performed_by' => auth()->id() ?? 1,
        ]);
    }

    private function createStockAdjustmentMovement(InventoryItem $item, float $oldStock, float $newStock): void
    {
        $quantity = $newStock - $oldStock;
        
        InventoryMovement::create([
            'item_id' => $item->id,
            'movement_type' => 'adjustment',
            'quantity' => $quantity,
            'before_stock' => $oldStock,
            'after_stock' => $newStock,
            'reference_type' => 'adjustment',
            'reference_id' => 0,
            'location_id' => $item->location_id,
            'notes' => 'Stock adjustment',
            'performed_by' => auth()->id() ?? 1,
        ]);
    }

    private function checkLowStockAlert(InventoryItem $item): void
    {
        if ($item->current_stock <= $item->reorder_level) {
            $this->notificationService->sendLowStockAlert($item);
        }
    }

    private function getStockStatus(InventoryItem $item): string
    {
        if ($item->current_stock <= 0) {
            return 'out_of_stock';
        } elseif ($item->current_stock <= $item->reorder_level) {
            return 'low_stock';
        } else {
            return 'in_stock';
        }
    }
}
```

### 3. Stock Movement Service

```php
<?php

namespace App\Services\Inventory;

use App\Models\Inventory\InventoryItem;
use App\Models\Inventory\InventoryMovement;
use App\Models\Inventory\StockAdjustment;
use Illuminate\Support\Facades\DB;

class StockMovementService
{
    public function updateStock(int $itemId, array $data): array
    {
        DB::beginTransaction();
        
        try {
            $item = InventoryItem::findOrFail($itemId);
            $oldStock = $item->current_stock;
            $newStock = $data['new_stock'];
            $quantity = $newStock - $oldStock;

            // Update item stock
            $item->update([
                'current_stock' => $newStock,
                'updated_by' => auth()->id()
            ]);

            // Create movement record
            $movement = InventoryMovement::create([
                'item_id' => $itemId,
                'movement_type' => $data['movement_type'] ?? 'adjustment',
                'quantity' => $quantity,
                'unit_price' => $data['unit_price'] ?? $item->average_cost,
                'total_value' => abs($quantity) * ($data['unit_price'] ?? $item->average_cost),
                'before_stock' => $oldStock,
                'after_stock' => $newStock,
                'reference_type' => $data['reference_type'] ?? 'adjustment',
                'reference_id' => $data['reference_id'] ?? 0,
                'batch_number' => $data['batch_number'] ?? null,
                'serial_number' => $data['serial_number'] ?? null,
                'expiry_date' => $data['expiry_date'] ?? null,
                'location_id' => $item->location_id,
                'notes' => $data['notes'] ?? null,
                'performed_by' => auth()->id(),
            ]);

            // Create adjustment record if needed
            if ($data['movement_type'] === 'adjustment' && isset($data['adjustment_reason'])) {
                $this->createAdjustmentRecord($item, $quantity, $data);
            }

            // Update average cost if it's a purchase
            if ($data['movement_type'] === 'purchase' && isset($data['unit_price'])) {
                $this->updateAverageCost($item, $quantity, $data['unit_price']);
            }

            // Clear cache
            $this->clearInventoryCaches();

            DB::commit();

            return [
                'item' => $item->fresh(),
                'movement' => $movement,
                'old_stock' => $oldStock,
                'new_stock' => $newStock
            ];
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function getItemMovements(int $itemId, int $days = 30): Collection
    {
        $startDate = now()->subDays($days);
        
        return InventoryMovement::with(['performedBy:id,name'])
            ->where('item_id', $itemId)
            ->where('performed_at', '>=', $startDate)
            ->orderBy('performed_at', 'desc')
            ->get();
    }

    public function getLocationMovements(int $locationId, array $filters = []): Collection
    {
        $query = InventoryMovement::with(['item:id,name_en,sku', 'performedBy:id,name'])
            ->where('location_id', $locationId);

        if (isset($filters['start_date'])) {
            $query->where('performed_at', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->where('performed_at', '<=', $filters['end_date']);
        }

        if (isset($filters['movement_type'])) {
            $query->where('movement_type', $filters['movement_type']);
        }

        return $query->orderBy('performed_at', 'desc')
                    ->limit($filters['limit'] ?? 100)
                    ->get();
    }

    public function transferStock(int $fromLocationId, int $toLocationId, array $items): array
    {
        DB::beginTransaction();
        
        try {
            $results = [];
            
            foreach ($items as $itemData) {
                $itemId = $itemData['item_id'];
                $quantity = $itemData['quantity'];
                
                // Get source item
                $sourceItem = InventoryItem::where('id', $itemId)
                    ->where('location_id', $fromLocationId)
                    ->firstOrFail();

                if ($sourceItem->current_stock < $quantity) {
                    throw new \Exception("Insufficient stock for item {$sourceItem->name_en}");
                }

                // Get or create destination item
                $destItem = InventoryItem::where('sku', $sourceItem->sku)
                    ->where('location_id', $toLocationId)
                    ->first();

                if (!$destItem) {
                    $destItem = $this->createLocationItem($sourceItem, $toLocationId);
                }

                // Update source stock
                $sourceItem->decrement('current_stock', $quantity);

                // Update destination stock
                $destItem->increment('current_stock', $quantity);

                // Create movement records
                $transferId = uniqid('TRF');

                InventoryMovement::create([
                    'item_id' => $sourceItem->id,
                    'movement_type' => 'transfer_out',
                    'quantity' => -$quantity,
                    'before_stock' => $sourceItem->current_stock + $quantity,
                    'after_stock' => $sourceItem->current_stock,
                    'reference_type' => 'transfer',
                    'reference_id' => $transferId,
                    'location_id' => $fromLocationId,
                    'notes' => "Transfer to location {$toLocationId}",
                    'performed_by' => auth()->id(),
                ]);

                InventoryMovement::create([
                    'item_id' => $destItem->id,
                    'movement_type' => 'transfer_in',
                    'quantity' => $quantity,
                    'before_stock' => $destItem->current_stock - $quantity,
                    'after_stock' => $destItem->current_stock,
                    'reference_type' => 'transfer',
                    'reference_id' => $transferId,
                    'location_id' => $toLocationId,
                    'notes' => "Transfer from location {$fromLocationId}",
                    'performed_by' => auth()->id(),
                ]);

                $results[] = [
                    'source_item' => $sourceItem->fresh(),
                    'destination_item' => $destItem->fresh(),
                    'quantity_transferred' => $quantity,
                    'transfer_id' => $transferId
                ];
            }

            $this->clearInventoryCaches();
            DB::commit();

            return $results;
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    private function createAdjustmentRecord(InventoryItem $item, float $quantity, array $data): void
    {
        StockAdjustment::create([
            'adjustment_number' => 'ADJ-' . now()->format('Ymd-His'),
            'item_id' => $item->id,
            'adjustment_type' => $data['adjustment_type'] ?? 'count_correction',
            'quantity_before' => $item->current_stock - $quantity,
            'quantity_adjusted' => $quantity,
            'quantity_after' => $item->current_stock,
            'unit_cost' => $data['unit_price'] ?? $item->average_cost,
            'total_value_impact' => abs($quantity) * ($data['unit_price'] ?? $item->average_cost),
            'reason' => $data['adjustment_reason'],
            'requires_approval' => abs($quantity * $item->average_cost) > 1000, // Requires approval if > 1000 THB
            'status' => abs($quantity * $item->average_cost) > 1000 ? 'pending_approval' : 'approved',
            'created_by' => auth()->id(),
            'adjustment_date' => now()->toDateString(),
        ]);
    }

    private function updateAverageCost(InventoryItem $item, float $quantity, float $unitPrice): void
    {
        if ($quantity > 0 && $unitPrice > 0) {
            $oldValue = $item->current_stock * $item->average_cost;
            $newValue = $quantity * $unitPrice;
            $newTotalQuantity = $item->current_stock + $quantity;
            
            if ($newTotalQuantity > 0) {
                $newAverageCost = ($oldValue + $newValue) / $newTotalQuantity;
                $item->update(['average_cost' => $newAverageCost]);
            }
        }
    }

    private function createLocationItem(InventoryItem $sourceItem, int $locationId): InventoryItem
    {
        return InventoryItem::create([
            'sku' => $sourceItem->sku,
            'name_en' => $sourceItem->name_en,
            'name_th' => $sourceItem->name_th,
            'description_en' => $sourceItem->description_en,
            'description_th' => $sourceItem->description_th,
            'category_id' => $sourceItem->category_id,
            'subcategory_id' => $sourceItem->subcategory_id,
            'unit_of_measure' => $sourceItem->unit_of_measure,
            'current_stock' => 0,
            'reorder_level' => $sourceItem->reorder_level,
            'max_stock_level' => $sourceItem->max_stock_level,
            'purchase_price' => $sourceItem->purchase_price,
            'average_cost' => $sourceItem->average_cost,
            'location_id' => $locationId,
            'storage_requirements' => $sourceItem->storage_requirements,
            'shelf_life_days' => $sourceItem->shelf_life_days,
            'track_expiry' => $sourceItem->track_expiry,
            'track_serial' => $sourceItem->track_serial,
            'track_batch' => $sourceItem->track_batch,
            'is_active' => true,
            'created_by' => auth()->id(),
        ]);
    }

    private function clearInventoryCaches(): void
    {
        Cache::forget('low_stock_items');
        Cache::forget('low_stock_count');
        Cache::forget('out_of_stock_count');
        Cache::forget('total_inventory_value');
    }
}
```

## API Routes

```php
// routes/api.php
Route::prefix('inventory')->middleware(['auth:sanctum'])->group(function () {
    // Inventory Items
    Route::get('items', [InventoryItemController::class, 'index']);
    Route::post('items', [InventoryItemController::class, 'store']);
    Route::get('items/{id}', [InventoryItemController::class, 'show']);
    Route::put('items/{id}', [InventoryItemController::class, 'update']);
    Route::delete('items/{id}', [InventoryItemController::class, 'destroy']);
    
    // Stock Operations
    Route::put('items/{id}/stock', [InventoryItemController::class, 'updateStock']);
    Route::get('low-stock', [InventoryItemController::class, 'lowStock']);
    Route::get('barcode/{barcode}', [InventoryItemController::class, 'barcodeLookup']);
    
    // Stock Movements
    Route::get('movements', [StockMovementController::class, 'index']);
    Route::post('transfer', [StockMovementController::class, 'transfer']);
    Route::get('movements/location/{locationId}', [StockMovementController::class, 'locationMovements']);
    
    // Dashboard
    Route::get('dashboard', [InventoryDashboardController::class, 'index']);
    Route::get('analytics', [InventoryAnalyticsController::class, 'index']);
});
```

## Success Criteria
- [ ] Complete CRUD operations for inventory items
- [ ] Real-time stock level tracking
- [ ] Automated low stock alerts
- [ ] Stock movement audit trail
- [ ] Barcode lookup functionality
- [ ] Multi-location stock transfers
- [ ] Performance optimized for large inventories
- [ ] Comprehensive API documentation

## Testing Requirements
- [ ] Unit tests for all service methods
- [ ] Integration tests for API endpoints
- [ ] Performance tests with large datasets
- [ ] Concurrency testing for stock updates
- [ ] Cache invalidation testing

## Deliverables
1. Complete backend API system
2. Service layer implementations
3. API route definitions
4. Request validation classes
5. Unit and integration tests
6. API documentation
7. Performance optimization guidelines
