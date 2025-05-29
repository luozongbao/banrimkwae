# Issue #03: Purchase Order Management System

## Priority: High
## Estimated Duration: 5-6 days
## Phase: 4 - Stock/Inventory Management
## Dependencies: Issue #01 (Database Schema), Issue #02 (Backend System)

## Overview
Implement comprehensive purchase order management system to handle supplier orders, receiving processes, and automated procurement workflows. This system will streamline the ordering process and ensure proper stock replenishment across all resort operations.

## Technical Requirements

### 1. Purchase Order Management API

#### Purchase Order Controller
```php
<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\CreatePurchaseOrderRequest;
use App\Http\Requests\Inventory\UpdatePurchaseOrderRequest;
use App\Http\Requests\Inventory\ReceivePurchaseOrderRequest;
use App\Services\Inventory\PurchaseOrderService;
use App\Services\Inventory\ReceivingService;

class PurchaseOrderController extends Controller
{
    public function __construct(
        private PurchaseOrderService $poService,
        private ReceivingService $receivingService
    ) {}

    /**
     * List purchase orders with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'status' => 'in:draft,sent,confirmed,partially_received,completed,cancelled',
            'supplier_id' => 'integer|exists:suppliers,id',
            'start_date' => 'date',
            'end_date' => 'date',
            'search' => 'string|max:255',
            'per_page' => 'integer|min:1|max:100'
        ]);

        $orders = $this->poService->getOrders($filters);
        
        return response()->json([
            'data' => $orders,
            'meta' => [
                'pending_count' => $this->poService->getPendingOrdersCount(),
                'total_pending_value' => $this->poService->getTotalPendingValue(),
                'overdue_count' => $this->poService->getOverdueOrdersCount()
            ]
        ]);
    }

    /**
     * Get purchase order details
     */
    public function show(int $id): JsonResponse
    {
        $order = $this->poService->getOrderWithDetails($id);
        
        return response()->json([
            'data' => $order,
            'receiving_history' => $this->receivingService->getReceivingHistory($id),
            'can_receive' => $this->poService->canReceiveOrder($order)
        ]);
    }

    /**
     * Create new purchase order
     */
    public function store(CreatePurchaseOrderRequest $request): JsonResponse
    {
        $order = $this->poService->createOrder($request->validated());
        
        return response()->json([
            'message' => 'Purchase order created successfully',
            'data' => $order
        ], 201);
    }

    /**
     * Update purchase order
     */
    public function update(UpdatePurchaseOrderRequest $request, int $id): JsonResponse
    {
        $order = $this->poService->updateOrder($id, $request->validated());
        
        return response()->json([
            'message' => 'Purchase order updated successfully',
            'data' => $order
        ]);
    }

    /**
     * Send purchase order to supplier
     */
    public function send(int $id): JsonResponse
    {
        $order = $this->poService->sendOrder($id);
        
        return response()->json([
            'message' => 'Purchase order sent to supplier',
            'data' => $order
        ]);
    }

    /**
     * Receive purchase order items
     */
    public function receive(ReceivePurchaseOrderRequest $request, int $id): JsonResponse
    {
        $result = $this->receivingService->receiveOrder($id, $request->validated());
        
        return response()->json([
            'message' => 'Items received successfully',
            'data' => $result
        ]);
    }

    /**
     * Cancel purchase order
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $order = $this->poService->cancelOrder($id, $request->reason);
        
        return response()->json([
            'message' => 'Purchase order cancelled',
            'data' => $order
        ]);
    }

    /**
     * Generate purchase order PDF
     */
    public function generatePdf(int $id): Response
    {
        $pdf = $this->poService->generatePdf($id);
        
        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="purchase-order-' . $id . '.pdf"'
        ]);
    }

    /**
     * Auto-generate purchase orders for low stock items
     */
    public function autoGenerate(Request $request): JsonResponse
    {
        $request->validate([
            'location_ids' => 'array',
            'location_ids.*' => 'integer|exists:storage_locations,id',
            'category_ids' => 'array',
            'category_ids.*' => 'integer|exists:inventory_categories,id'
        ]);

        $orders = $this->poService->autoGenerateOrders($request->validated());
        
        return response()->json([
            'message' => 'Purchase orders generated successfully',
            'data' => $orders,
            'count' => count($orders)
        ]);
    }

    /**
     * Get supplier price comparison
     */
    public function priceComparison(Request $request): JsonResponse
    {
        $request->validate([
            'item_ids' => 'required|array',
            'item_ids.*' => 'integer|exists:inventory_items,id'
        ]);

        $comparison = $this->poService->getSupplierPriceComparison($request->item_ids);
        
        return response()->json(['data' => $comparison]);
    }
}
```

### 2. Purchase Order Service

```php
<?php

namespace App\Services\Inventory;

use App\Models\Inventory\PurchaseOrder;
use App\Models\Inventory\PurchaseOrderItem;
use App\Models\Inventory\InventoryItem;
use App\Models\Inventory\Supplier;
use App\Services\Notification\PurchaseOrderNotificationService;
use App\Services\PDF\PurchaseOrderPdfService;
use Illuminate\Support\Facades\DB;

class PurchaseOrderService
{
    public function __construct(
        private PurchaseOrderNotificationService $notificationService,
        private PurchaseOrderPdfService $pdfService
    ) {}

    public function getOrders(array $filters): LengthAwarePaginator
    {
        $query = PurchaseOrder::with(['supplier:id,company_name', 'deliveryLocation:id,name_en'])
            ->select([
                'purchase_orders.*',
                DB::raw('(SELECT COUNT(*) FROM purchase_order_items WHERE purchase_order_id = purchase_orders.id) as items_count'),
                DB::raw('(SELECT SUM(quantity_received) FROM purchase_order_items WHERE purchase_order_id = purchase_orders.id) as total_received'),
                DB::raw('(SELECT SUM(quantity_ordered) FROM purchase_order_items WHERE purchase_order_id = purchase_orders.id) as total_ordered')
            ]);

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (isset($filters['start_date'])) {
            $query->where('order_date', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->where('order_date', '<=', $filters['end_date']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('po_number', 'like', "%{$filters['search']}%")
                  ->orWhereHas('supplier', function ($sq) use ($filters) {
                      $sq->where('company_name', 'like', "%{$filters['search']}%");
                  });
            });
        }

        return $query->orderBy('order_date', 'desc')
                    ->paginate($filters['per_page'] ?? 25);
    }

    public function getOrderWithDetails(int $id): PurchaseOrder
    {
        return PurchaseOrder::with([
            'supplier',
            'deliveryLocation',
            'items.item:id,name_en,name_th,sku,unit_of_measure',
            'createdBy:id,name',
            'approvedBy:id,name',
            'receivedBy:id,name'
        ])->findOrFail($id);
    }

    public function createOrder(array $data): PurchaseOrder
    {
        DB::beginTransaction();
        
        try {
            // Generate PO number
            $poNumber = $this->generatePONumber();

            // Create purchase order
            $order = PurchaseOrder::create([
                'po_number' => $poNumber,
                'supplier_id' => $data['supplier_id'],
                'order_date' => $data['order_date'] ?? now()->toDateString(),
                'expected_delivery_date' => $data['expected_delivery_date'],
                'delivery_location_id' => $data['delivery_location_id'],
                'terms' => $data['terms'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // Add order items
            $subtotal = 0;
            foreach ($data['items'] as $itemData) {
                $lineTotal = $itemData['quantity'] * $itemData['unit_price'];
                $subtotal += $lineTotal;

                PurchaseOrderItem::create([
                    'purchase_order_id' => $order->id,
                    'item_id' => $itemData['item_id'],
                    'quantity_ordered' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'line_total' => $lineTotal,
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            // Calculate totals
            $discountAmount = $data['discount_amount'] ?? 0;
            $taxPercentage = $data['tax_percentage'] ?? 7;
            $shippingCost = $data['shipping_cost'] ?? 0;

            $afterDiscount = $subtotal - $discountAmount;
            $taxAmount = ($afterDiscount * $taxPercentage) / 100;
            $totalAmount = $afterDiscount + $taxAmount + $shippingCost;

            // Update order totals
            $order->update([
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_percentage' => $taxPercentage,
                'tax_amount' => $taxAmount,
                'shipping_cost' => $shippingCost,
                'total_amount' => $totalAmount,
            ]);

            DB::commit();
            return $order->load(['supplier', 'items.item']);
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function updateOrder(int $id, array $data): PurchaseOrder
    {
        $order = PurchaseOrder::findOrFail($id);
        
        if (!in_array($order->status, ['draft', 'sent'])) {
            throw new \Exception('Cannot update purchase order in current status');
        }

        DB::beginTransaction();
        
        try {
            // Update order details
            $order->update([
                'supplier_id' => $data['supplier_id'] ?? $order->supplier_id,
                'expected_delivery_date' => $data['expected_delivery_date'] ?? $order->expected_delivery_date,
                'delivery_location_id' => $data['delivery_location_id'] ?? $order->delivery_location_id,
                'terms' => $data['terms'] ?? $order->terms,
                'notes' => $data['notes'] ?? $order->notes,
            ]);

            // Update items if provided
            if (isset($data['items'])) {
                // Delete existing items
                $order->items()->delete();

                // Add new items
                $subtotal = 0;
                foreach ($data['items'] as $itemData) {
                    $lineTotal = $itemData['quantity'] * $itemData['unit_price'];
                    $subtotal += $lineTotal;

                    PurchaseOrderItem::create([
                        'purchase_order_id' => $order->id,
                        'item_id' => $itemData['item_id'],
                        'quantity_ordered' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'line_total' => $lineTotal,
                        'notes' => $itemData['notes'] ?? null,
                    ]);
                }

                // Recalculate totals
                $this->recalculateOrderTotals($order, $subtotal, $data);
            }

            DB::commit();
            return $order->load(['supplier', 'items.item']);
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function sendOrder(int $id): PurchaseOrder
    {
        $order = PurchaseOrder::findOrFail($id);
        
        if ($order->status !== 'draft') {
            throw new \Exception('Can only send draft purchase orders');
        }

        $order->update(['status' => 'sent']);

        // Send notification to supplier
        $this->notificationService->sendPurchaseOrderToSupplier($order);

        return $order;
    }

    public function cancelOrder(int $id, string $reason): PurchaseOrder
    {
        $order = PurchaseOrder::findOrFail($id);
        
        if (in_array($order->status, ['completed', 'cancelled'])) {
            throw new \Exception('Cannot cancel purchase order in current status');
        }

        $order->update([
            'status' => 'cancelled',
            'notes' => ($order->notes ?? '') . "\n\nCancellation reason: " . $reason
        ]);

        // Notify supplier if order was already sent
        if (in_array($order->status, ['sent', 'confirmed'])) {
            $this->notificationService->sendCancellationToSupplier($order, $reason);
        }

        return $order;
    }

    public function autoGenerateOrders(array $filters): array
    {
        $lowStockItems = InventoryItem::with(['primarySupplier', 'location'])
            ->whereColumn('current_stock', '<=', 'reorder_level')
            ->where('is_active', true);

        // Apply filters
        if (isset($filters['location_ids'])) {
            $lowStockItems->whereIn('location_id', $filters['location_ids']);
        }

        if (isset($filters['category_ids'])) {
            $lowStockItems->whereIn('category_id', $filters['category_ids']);
        }

        $items = $lowStockItems->get();

        // Group by supplier
        $supplierGroups = $items->groupBy('primary_supplier_id');
        
        $generatedOrders = [];

        DB::beginTransaction();
        
        try {
            foreach ($supplierGroups as $supplierId => $supplierItems) {
                if (!$supplierId) continue; // Skip items without primary supplier

                $supplier = Supplier::find($supplierId);
                if (!$supplier || !$supplier->is_active) continue;

                // Calculate order quantities
                $orderItems = [];
                $subtotal = 0;

                foreach ($supplierItems as $item) {
                    $supplierItem = $item->suppliers()
                        ->where('supplier_id', $supplierId)
                        ->where('is_primary_supplier', true)
                        ->first();

                    if (!$supplierItem) continue;

                    // Calculate suggested order quantity
                    $reorderQuantity = max(
                        $item->max_stock_level - $item->current_stock,
                        $supplierItem->minimum_order_quantity
                    );

                    $lineTotal = $reorderQuantity * $supplierItem->current_price;
                    $subtotal += $lineTotal;

                    $orderItems[] = [
                        'item_id' => $item->id,
                        'quantity' => $reorderQuantity,
                        'unit_price' => $supplierItem->current_price,
                        'line_total' => $lineTotal
                    ];
                }

                // Only create order if it meets minimum order value
                if ($subtotal >= $supplier->minimum_order_value) {
                    $order = $this->createOrder([
                        'supplier_id' => $supplierId,
                        'expected_delivery_date' => now()->addDays($supplier->lead_time_days)->toDateString(),
                        'delivery_location_id' => $supplierItems->first()->location_id,
                        'items' => $orderItems,
                        'notes' => 'Auto-generated order for low stock items'
                    ]);

                    $generatedOrders[] = $order;
                }
            }

            DB::commit();
            return $generatedOrders;
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function getSupplierPriceComparison(array $itemIds): array
    {
        $items = InventoryItem::with(['suppliers.supplier'])
            ->whereIn('id', $itemIds)
            ->get();

        $comparison = [];

        foreach ($items as $item) {
            $suppliers = $item->suppliers->map(function ($supplierItem) {
                return [
                    'supplier_id' => $supplierItem->supplier_id,
                    'supplier_name' => $supplierItem->supplier->company_name,
                    'price' => $supplierItem->current_price,
                    'minimum_quantity' => $supplierItem->minimum_order_quantity,
                    'lead_time' => $supplierItem->lead_time_days,
                    'is_primary' => $supplierItem->is_primary_supplier
                ];
            })->sortBy('price');

            $comparison[] = [
                'item_id' => $item->id,
                'item_name' => $item->name_en,
                'sku' => $item->sku,
                'current_stock' => $item->current_stock,
                'reorder_level' => $item->reorder_level,
                'suppliers' => $suppliers->values()
            ];
        }

        return $comparison;
    }

    public function canReceiveOrder(PurchaseOrder $order): bool
    {
        return in_array($order->status, ['sent', 'confirmed', 'partially_received']);
    }

    public function getPendingOrdersCount(): int
    {
        return PurchaseOrder::whereIn('status', ['sent', 'confirmed', 'partially_received'])->count();
    }

    public function getTotalPendingValue(): float
    {
        return PurchaseOrder::whereIn('status', ['sent', 'confirmed', 'partially_received'])
            ->sum('total_amount');
    }

    public function getOverdueOrdersCount(): int
    {
        return PurchaseOrder::whereIn('status', ['sent', 'confirmed', 'partially_received'])
            ->where('expected_delivery_date', '<', now()->toDateString())
            ->count();
    }

    public function generatePdf(int $id): \Dompdf\Dompdf
    {
        $order = $this->getOrderWithDetails($id);
        return $this->pdfService->generate($order);
    }

    private function generatePONumber(): string
    {
        $prefix = 'PO' . now()->format('Ym');
        
        $lastOrder = PurchaseOrder::where('po_number', 'like', $prefix . '%')
            ->orderBy('po_number', 'desc')
            ->first();

        if ($lastOrder) {
            $lastNumber = (int) substr($lastOrder->po_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    private function recalculateOrderTotals(PurchaseOrder $order, float $subtotal, array $data): void
    {
        $discountAmount = $data['discount_amount'] ?? $order->discount_amount;
        $taxPercentage = $data['tax_percentage'] ?? $order->tax_percentage;
        $shippingCost = $data['shipping_cost'] ?? $order->shipping_cost;

        $afterDiscount = $subtotal - $discountAmount;
        $taxAmount = ($afterDiscount * $taxPercentage) / 100;
        $totalAmount = $afterDiscount + $taxAmount + $shippingCost;

        $order->update([
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'tax_amount' => $taxAmount,
            'shipping_cost' => $shippingCost,
            'total_amount' => $totalAmount,
        ]);
    }
}
```

### 3. Receiving Service

```php
<?php

namespace App\Services\Inventory;

use App\Models\Inventory\PurchaseOrder;
use App\Models\Inventory\PurchaseOrderItem;
use App\Models\Inventory\InventoryMovement;
use App\Services\Inventory\StockMovementService;
use Illuminate\Support\Facades\DB;

class ReceivingService
{
    public function __construct(
        private StockMovementService $stockService
    ) {}

    public function receiveOrder(int $orderId, array $data): array
    {
        $order = PurchaseOrder::with('items.item')->findOrFail($orderId);
        
        if (!in_array($order->status, ['sent', 'confirmed', 'partially_received'])) {
            throw new \Exception('Cannot receive items for order in current status');
        }

        DB::beginTransaction();
        
        try {
            $receivedItems = [];
            $totalReceived = 0;
            $totalOrdered = 0;

            foreach ($data['items'] as $itemData) {
                $orderItem = $order->items()->where('item_id', $itemData['item_id'])->first();
                
                if (!$orderItem) {
                    throw new \Exception("Item {$itemData['item_id']} not found in purchase order");
                }

                $quantityToReceive = $itemData['quantity_received'];
                $alreadyReceived = $orderItem->quantity_received;
                $quantityOrdered = $orderItem->quantity_ordered;

                if (($alreadyReceived + $quantityToReceive) > $quantityOrdered) {
                    throw new \Exception("Cannot receive more than ordered quantity for item {$orderItem->item->name_en}");
                }

                // Update order item
                $orderItem->update([
                    'quantity_received' => $alreadyReceived + $quantityToReceive,
                    'received_date' => $data['received_date'] ?? now()->toDateString(),
                    'quality_status' => $itemData['quality_status'] ?? 'good',
                    'notes' => $itemData['notes'] ?? null,
                ]);

                // Update inventory stock
                if ($quantityToReceive > 0 && $itemData['quality_status'] === 'good') {
                    $this->stockService->updateStock($orderItem->item_id, [
                        'new_stock' => $orderItem->item->current_stock + $quantityToReceive,
                        'movement_type' => 'purchase',
                        'reference_type' => 'purchase_order',
                        'reference_id' => $order->id,
                        'unit_price' => $orderItem->unit_price,
                        'batch_number' => $itemData['batch_number'] ?? null,
                        'serial_number' => $itemData['serial_number'] ?? null,
                        'expiry_date' => $itemData['expiry_date'] ?? null,
                        'notes' => "Received from PO {$order->po_number}"
                    ]);
                }

                $receivedItems[] = [
                    'item_id' => $orderItem->item_id,
                    'item_name' => $orderItem->item->name_en,
                    'quantity_ordered' => $quantityOrdered,
                    'quantity_received' => $quantityToReceive,
                    'total_received' => $alreadyReceived + $quantityToReceive,
                    'quality_status' => $itemData['quality_status'] ?? 'good'
                ];

                $totalReceived += $alreadyReceived + $quantityToReceive;
                $totalOrdered += $quantityOrdered;
            }

            // Update order status
            $newStatus = 'partially_received';
            if ($totalReceived >= $totalOrdered) {
                $newStatus = 'completed';
            }

            $order->update([
                'status' => $newStatus,
                'actual_delivery_date' => $data['received_date'] ?? now()->toDateString(),
                'received_by' => auth()->id(),
            ]);

            DB::commit();

            return [
                'order' => $order->fresh(),
                'received_items' => $receivedItems,
                'summary' => [
                    'total_items' => count($receivedItems),
                    'total_received' => $totalReceived,
                    'total_ordered' => $totalOrdered,
                    'completion_percentage' => ($totalOrdered > 0) ? round(($totalReceived / $totalOrdered) * 100, 2) : 0
                ]
            ];
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function getReceivingHistory(int $orderId): Collection
    {
        return InventoryMovement::with(['item:id,name_en,sku', 'performedBy:id,name'])
            ->where('reference_type', 'purchase_order')
            ->where('reference_id', $orderId)
            ->where('movement_type', 'purchase')
            ->orderBy('performed_at', 'desc')
            ->get();
    }

    public function createReceivingDiscrepancyReport(int $orderId, array $discrepancies): array
    {
        $order = PurchaseOrder::with('supplier')->findOrFail($orderId);
        
        $report = [
            'order_id' => $orderId,
            'po_number' => $order->po_number,
            'supplier_name' => $order->supplier->company_name,
            'report_date' => now()->toDateString(),
            'reported_by' => auth()->user()->name,
            'discrepancies' => $discrepancies,
            'total_discrepancy_value' => 0
        ];

        $totalDiscrepancyValue = 0;
        
        foreach ($discrepancies as $discrepancy) {
            $orderItem = PurchaseOrderItem::with('item')->find($discrepancy['order_item_id']);
            
            if ($orderItem) {
                $discrepancyValue = $discrepancy['quantity_difference'] * $orderItem->unit_price;
                $totalDiscrepancyValue += abs($discrepancyValue);
                
                // Log discrepancy in notes
                $orderItem->update([
                    'notes' => ($orderItem->notes ?? '') . "\nDiscrepancy: " . $discrepancy['description']
                ]);
            }
        }

        $report['total_discrepancy_value'] = $totalDiscrepancyValue;

        // You might want to store this report in a dedicated table
        // or send notifications to management

        return $report;
    }
}
```

## API Routes

```php
// routes/api.php - Purchase Order routes
Route::prefix('inventory/purchase-orders')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/', [PurchaseOrderController::class, 'index']);
    Route::post('/', [PurchaseOrderController::class, 'store']);
    Route::get('/{id}', [PurchaseOrderController::class, 'show']);
    Route::put('/{id}', [PurchaseOrderController::class, 'update']);
    Route::delete('/{id}', [PurchaseOrderController::class, 'destroy']);
    
    // Order actions
    Route::post('/{id}/send', [PurchaseOrderController::class, 'send']);
    Route::post('/{id}/receive', [PurchaseOrderController::class, 'receive']);
    Route::post('/{id}/cancel', [PurchaseOrderController::class, 'cancel']);
    Route::get('/{id}/pdf', [PurchaseOrderController::class, 'generatePdf']);
    
    // Automation
    Route::post('/auto-generate', [PurchaseOrderController::class, 'autoGenerate']);
    Route::post('/price-comparison', [PurchaseOrderController::class, 'priceComparison']);
});
```

## Request Validation Classes

```php
<?php
// app/Http/Requests/Inventory/CreatePurchaseOrderRequest.php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class CreatePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->can('create_purchase_orders');
    }

    public function rules(): array
    {
        return [
            'supplier_id' => 'required|integer|exists:suppliers,id',
            'order_date' => 'nullable|date',
            'expected_delivery_date' => 'required|date|after:today',
            'delivery_location_id' => 'required|integer|exists:storage_locations,id',
            'terms' => 'nullable|string|max:1000',
            'notes' => 'nullable|string|max:1000',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_percentage' => 'nullable|numeric|min:0|max:100',
            'shipping_cost' => 'nullable|numeric|min:0',
            
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|integer|exists:inventory_items,id',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.notes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'supplier_id.required' => 'Please select a supplier',
            'expected_delivery_date.required' => 'Expected delivery date is required',
            'expected_delivery_date.after' => 'Expected delivery date must be in the future',
            'items.required' => 'At least one item is required',
            'items.*.item_id.required' => 'Item selection is required',
            'items.*.quantity.required' => 'Quantity is required',
            'items.*.quantity.min' => 'Quantity must be greater than 0',
            'items.*.unit_price.required' => 'Unit price is required',
        ];
    }
}
```

## Success Criteria
- [ ] Complete purchase order lifecycle management
- [ ] Automated reorder suggestions based on stock levels
- [ ] Supplier comparison and selection tools
- [ ] Receiving process with quality control
- [ ] Purchase order PDF generation
- [ ] Integration with inventory stock updates
- [ ] Approval workflow for high-value orders
- [ ] Comprehensive audit trail

## Testing Requirements
- [ ] Purchase order creation and modification tests
- [ ] Receiving process validation tests
- [ ] Stock update integration tests
- [ ] PDF generation tests
- [ ] Auto-generation algorithm tests
- [ ] Approval workflow tests

## Deliverables
1. Complete purchase order management system
2. Receiving and quality control processes
3. PDF generation for purchase orders
4. Auto-generation algorithms
5. Supplier comparison tools
6. API documentation
7. Unit and integration tests
