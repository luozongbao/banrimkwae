# Issue #08: Restaurant Inventory Foundation

## Priority: Medium
## Estimated Time: 4-5 days
## Dependencies: Issue #01, #02, #03
## Assignee: Backend Developer

## Description
Develop foundational restaurant inventory management system including ingredient tracking, recipe management, basic stock monitoring, and integration with menu items for preparation requirements.

## Requirements

### 1. Inventory Management API

#### Inventory Item Endpoints:
```
GET    /api/restaurants/{id}/inventory          # List inventory items
GET    /api/restaurants/{id}/inventory/{itemId} # Get inventory item details
POST   /api/restaurants/{id}/inventory          # Create inventory item
PUT    /api/restaurants/{id}/inventory/{itemId} # Update inventory item
DELETE /api/restaurants/{id}/inventory/{itemId} # Delete inventory item
PUT    /api/restaurants/{id}/inventory/{itemId}/stock # Update stock levels
```

#### Stock Management:
```
POST   /api/restaurants/{id}/inventory/restock  # Record restock transaction
POST   /api/restaurants/{id}/inventory/adjust   # Stock adjustment
GET    /api/restaurants/{id}/inventory/low-stock # Get low stock items
GET    /api/restaurants/{id}/inventory/usage    # Get usage reports
POST   /api/restaurants/{id}/inventory/transfer # Transfer between locations
```

#### Recipe Management:
```
GET    /api/restaurants/{id}/recipes           # List recipes
GET    /api/recipes/{recipeId}                 # Get recipe details
POST   /api/restaurants/{id}/recipes           # Create recipe
PUT    /api/recipes/{recipeId}                 # Update recipe
DELETE /api/recipes/{recipeId}                 # Delete recipe
POST   /api/recipes/{recipeId}/cost-analysis   # Calculate recipe cost
```

### 2. Inventory Data Models

#### Inventory Item Model:
```typescript
interface InventoryItem {
  id: number;
  restaurantId: number;
  name: string;
  category: 'protein' | 'vegetable' | 'dairy' | 'grain' | 'spice' | 'beverage' | 'condiment' | 'other';
  sku?: string;
  barcode?: string;
  unitOfMeasure: 'kg' | 'g' | 'l' | 'ml' | 'pieces' | 'cups' | 'tbsp' | 'tsp';
  currentStock: number;
  minimumThreshold: number;
  maximumCapacity: number;
  costPerUnit: number;
  currency: string;
  supplierInfo: {
    primarySupplier: Supplier;
    alternativeSuppliers: Supplier[];
    orderLeadTimeDays: number;
    minimumOrderQuantity: number;
  };
  storageInfo: {
    location: string; // "main_kitchen", "cold_storage", "dry_storage"
    temperature?: number;
    humidity?: number;
    expirationTracking: boolean;
  };
  isActive: boolean;
  lastRestockedAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Supplier {
  id: number;
  name: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  paymentTerms: string;
  deliveryDays: string[];
  minimumOrderValue: number;
  rating: number;
  isActive: boolean;
}
```

#### Recipe Model:
```typescript
interface Recipe {
  id: number;
  menuItemId: number;
  name: string;
  description: string;
  servingSize: number;
  yield: number; // number of servings produced
  preparationTimeMinutes: number;
  cookingTimeMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
  cost: {
    ingredientCost: number;
    laborCost: number;
    totalCost: number;
    costPerServing: number;
    profitMargin: number;
  };
  allergens: string[];
  tags: string[]; // "vegetarian", "gluten-free", "spicy"
  isActive: boolean;
  version: number;
  createdBy: number;
  approvedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RecipeIngredient {
  id: number;
  inventoryItemId: number;
  inventoryItem: InventoryItem;
  quantity: number;
  unitOfMeasure: string;
  preparation?: string; // "diced", "chopped", "grilled"
  isOptional: boolean;
  substitutions?: Array<{
    inventoryItemId: number;
    quantity: number;
    conversionRatio: number;
  }>;
}

interface RecipeStep {
  stepNumber: number;
  instruction: string;
  timeMinutes?: number;
  temperature?: number;
  equipment?: string[];
  tips?: string;
}
```

### 3. Stock Transaction Management

#### Stock Transaction Model:
```typescript
interface StockTransaction {
  id: number;
  restaurantId: number;
  inventoryItemId: number;
  transactionType: 'restock' | 'usage' | 'adjustment' | 'transfer' | 'waste' | 'return';
  quantity: number;
  unitOfMeasure: string;
  unitCost?: number;
  totalCost?: number;
  previousStock: number;
  newStock: number;
  reference?: {
    orderId?: number; // for usage transactions
    purchaseOrderId?: string; // for restock transactions
    transferId?: string; // for transfer transactions
    adjustmentReason?: string; // for adjustment transactions
  };
  notes?: string;
  performedBy: number; // user ID
  performedAt: Date;
  createdAt: Date;
}

interface StockUsage {
  orderId: number;
  orderItems: Array<{
    menuItemId: number;
    quantity: number;
    recipeId: number;
    ingredientsUsed: Array<{
      inventoryItemId: number;
      quantityUsed: number;
      unitCost: number;
    }>;
  }>;
  totalIngredientCost: number;
  timestamp: Date;
}
```

### 4. Automatic Stock Deduction

#### Recipe-Based Stock Deduction:
```typescript
class StockDeductionService {
  async deductStockForOrder(orderId: number): Promise<StockDeductionResult>;
  async validateStockAvailability(orderItems: OrderItem[]): Promise<AvailabilityResult>;
  async calculateIngredientRequirements(menuItemId: number, quantity: number): Promise<IngredientRequirement[]>;
  async processStockDeduction(requirements: IngredientRequirement[]): Promise<void>;
  async revertStockDeduction(orderId: number): Promise<void>; // for order cancellations
}

interface IngredientRequirement {
  inventoryItemId: number;
  requiredQuantity: number;
  availableQuantity: number;
  isAvailable: boolean;
  alternatives?: Array<{
    inventoryItemId: number;
    conversionRatio: number;
    availableQuantity: number;
  }>;
}

interface StockDeductionResult {
  success: boolean;
  deductedItems: Array<{
    inventoryItemId: number;
    quantityDeducted: number;
    newStockLevel: number;
  }>;
  warnings: Array<{
    inventoryItemId: number;
    warning: string;
    currentStock: number;
    minimumThreshold: number;
  }>;
  errors?: string[];
}
```

### 5. Inventory Analytics and Reporting

#### Analytics Endpoints:
```
GET /api/restaurants/{id}/inventory/analytics/usage     # Usage analytics
GET /api/restaurants/{id}/inventory/analytics/cost      # Cost analysis
GET /api/restaurants/{id}/inventory/analytics/waste     # Waste tracking
GET /api/restaurants/{id}/inventory/analytics/turnover  # Inventory turnover
GET /api/restaurants/{id}/inventory/analytics/trending  # Trending items
```

#### Analytics Models:
```typescript
interface InventoryAnalytics {
  period: string;
  totalInventoryValue: number;
  totalUsageValue: number;
  totalWasteValue: number;
  averageTurnoverRate: number;
  topUsedItems: Array<{
    inventoryItemId: number;
    itemName: string;
    quantityUsed: number;
    value: number;
    percentage: number;
  }>;
  lowStockItems: Array<{
    inventoryItemId: number;
    itemName: string;
    currentStock: number;
    minimumThreshold: number;
    daysUntilOut: number;
  }>;
  costTrends: Array<{
    date: string;
    totalCost: number;
    ingredientCost: number;
    wasteValue: number;
  }>;
}

interface RecipeCostAnalysis {
  recipeId: number;
  recipeName: string;
  currentCost: {
    ingredientCost: number;
    laborCost: number;
    overheadCost: number;
    totalCost: number;
    costPerServing: number;
  };
  historicalCosts: Array<{
    date: string;
    costPerServing: number;
  }>;
  costBreakdown: Array<{
    ingredientName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    percentage: number;
  }>;
  profitability: {
    sellingPrice: number;
    grossMargin: number;
    grossMarginPercentage: number;
  };
}
```

### 6. Low Stock Alerts and Notifications

#### Alert System:
```typescript
interface InventoryAlert {
  id: number;
  type: 'low_stock' | 'out_of_stock' | 'overstocked' | 'expiring_soon' | 'high_cost_variance';
  severity: 'info' | 'warning' | 'urgent' | 'critical';
  inventoryItemId: number;
  itemName: string;
  currentValue: number;
  thresholdValue: number;
  message: string;
  recommendedAction: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: number;
  resolvedAt?: Date;
  isActive: boolean;
}

class InventoryAlertService {
  checkLowStockAlerts(): Promise<InventoryAlert[]>;
  checkExpirationAlerts(): Promise<InventoryAlert[]>;
  checkCostVarianceAlerts(): Promise<InventoryAlert[]>;
  sendNotifications(alerts: InventoryAlert[]): Promise<void>;
  acknowledgeAlert(alertId: number, userId: number): Promise<void>;
  resolveAlert(alertId: number, userId: number): Promise<void>;
}
```

### 7. Purchase Order Integration

#### Purchase Order Management:
```typescript
interface PurchaseOrder {
  id: string;
  restaurantId: number;
  supplierId: number;
  orderNumber: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'delivered' | 'cancelled';
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  terms: string;
  notes?: string;
  createdBy: number;
  approvedBy?: number;
  receivedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PurchaseOrderItem {
  id: number;
  inventoryItemId: number;
  inventoryItem: InventoryItem;
  quantityOrdered: number;
  quantityReceived?: number;
  unitPrice: number;
  totalPrice: number;
  isReceived: boolean;
  notes?: string;
}

// Purchase order endpoints
GET    /api/restaurants/{id}/purchase-orders        # List purchase orders
POST   /api/restaurants/{id}/purchase-orders        # Create purchase order
PUT    /api/purchase-orders/{id}/receive            # Receive goods
POST   /api/inventory/auto-order                    # Auto-generate orders for low stock
```

### 8. Integration with Menu Management

#### Menu-Inventory Integration:
```typescript
interface MenuItemInventoryInfo {
  menuItemId: number;
  isAvailable: boolean;
  unavailableReasons: string[];
  costToMake: number;
  profitMargin: number;
  requiredIngredients: Array<{
    inventoryItemId: number;
    itemName: string;
    requiredQuantity: number;
    availableQuantity: number;
    isAvailable: boolean;
  }>;
  estimatedPrepTime: number;
}

class MenuInventoryService {
  checkMenuItemAvailability(menuItemId: number): Promise<boolean>;
  getUnavailableMenuItems(restaurantId: number): Promise<number[]>;
  updateMenuItemAvailability(menuItemId: number, isAvailable: boolean): Promise<void>;
  calculateMenuItemCost(menuItemId: number): Promise<number>;
  optimizeMenuBasedOnInventory(restaurantId: number): Promise<MenuOptimizationResult>;
}
```

### 9. Waste Tracking and Management

#### Waste Management:
```typescript
interface WasteEntry {
  id: number;
  restaurantId: number;
  inventoryItemId: number;
  quantity: number;
  wasteCost: number;
  wasteReason: 'expired' | 'spoiled' | 'overcooked' | 'dropped' | 'wrong_preparation' | 'other';
  wasteCategory: 'food_prep' | 'cooking' | 'service' | 'storage';
  description?: string;
  reportedBy: number;
  wasteDate: Date;
  createdAt: Date;
}

interface WasteAnalytics {
  period: string;
  totalWaste: {
    quantity: number;
    value: number;
    percentage: number; // percentage of total inventory value
  };
  wasteByCategory: Array<{
    category: string;
    quantity: number;
    value: number;
    percentage: number;
  }>;
  wasteByReason: Array<{
    reason: string;
    occurrences: number;
    value: number;
  }>;
  trends: Array<{
    date: string;
    wasteValue: number;
    wastePercentage: number;
  }>;
}
```

## Implementation Requirements

### 1. Data Integration
- Integration with menu management system
- Automatic stock deduction on order creation
- Real-time inventory level updates
- Recipe cost calculation automation

### 2. Performance Optimization
- Efficient inventory queries and updates
- Optimized recipe cost calculations
- Cached frequently accessed data
- Batch processing for stock transactions

### 3. Business Logic
- Automatic low stock detection
- Recipe-based ingredient requirements
- Cost variance tracking
- Inventory turnover calculations

### 4. User Interface
- Intuitive inventory management interface
- Recipe builder with cost tracking
- Real-time stock level displays
- Mobile-friendly design for kitchen staff

## Acceptance Criteria

- [ ] Complete inventory item management
- [ ] Recipe creation and management system
- [ ] Automatic stock deduction for orders
- [ ] Low stock alerts and notifications
- [ ] Cost tracking and analytics
- [ ] Integration with menu management
- [ ] Waste tracking functionality
- [ ] Purchase order management foundation
- [ ] Real-time inventory updates
- [ ] Comprehensive reporting system

## Testing Requirements

- [ ] Inventory CRUD operations testing
- [ ] Recipe management testing
- [ ] Stock deduction accuracy testing
- [ ] Cost calculation validation
- [ ] Alert system testing
- [ ] Integration testing with menu system
- [ ] Performance testing with large inventories

## Implementation Notes

- Implement proper transaction handling for stock operations
- Consider implementing inventory forecasting algorithms
- Design for scalability with multiple restaurant locations
- Implement proper audit trails for all inventory changes
- Consider integrating with external inventory management systems

## Related Issues
- Depends on: Issue #01 (Database), Issue #02 (Restaurant Backend), Issue #03 (Menu/Order Management)
- Related: Issue #04 (Kitchen Management), Issue #10 (Restaurant Reporting)
- Future Enhancement: Advanced inventory analytics and forecasting
