# Issue #06: Guest Interface for Restaurant Services

## Priority: High
## Estimated Time: 4-5 days
## Dependencies: Issue #01, #02, #03, #05
## Assignee: Frontend Developer

## Description
Develop mobile-first guest interface for restaurant services including menu browsing, online ordering, reservation management, and order tracking for both in-house guests and external customers.

## Requirements

### 1. Guest Restaurant Portal

#### Public Restaurant Interface:
```
GET    /api/public/restaurants           # List available restaurants
GET    /api/public/restaurants/{id}      # Restaurant details and menu
GET    /api/public/restaurants/{id}/menu # Public menu with pricing
GET    /api/public/restaurants/{id}/hours # Operating hours
GET    /api/public/restaurants/{id}/info  # Location and contact info
```

#### Guest Authentication (Optional):
```
POST   /api/auth/guest/login            # Guest login
POST   /api/auth/guest/register         # Guest registration
GET    /api/auth/guest/profile          # Guest profile
PUT    /api/auth/guest/profile          # Update guest profile
GET    /api/auth/guest/orders           # Guest order history
```

### 2. Mobile Menu Interface

#### Menu Display Components:
```typescript
interface MenuDisplayProps {
  restaurant: Restaurant;
  categories: MenuCategory[];
  items: MenuItem[];
  filters: MenuFilters;
  searchQuery?: string;
  orderType: 'dine_in' | 'takeaway' | 'room_service';
}

interface MenuFilters {
  category?: string;
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  allergens: string[];
  priceRange: {
    min: number;
    max: number;
  };
  preparationTime: {
    max: number; // maximum minutes
  };
}

interface MenuItemCard {
  item: MenuItem;
  isAvailable: boolean;
  estimatedTime: number;
  customizations: MenuCustomization[];
  onAddToCart: (item: MenuItem, customizations: any) => void;
  showNutrition: boolean;
  showAllergens: boolean;
}
```

#### Mobile Menu Features:
- Responsive grid/list layout
- High-quality food images
- Detailed item descriptions
- Allergen and nutrition information
- Real-time availability updates
- Advanced filtering and search
- Customization options
- Quick add to cart functionality

### 3. Online Ordering System

#### Order Creation Interface:
```typescript
interface OrderCreationFlow {
  steps: 'menu' | 'customize' | 'cart' | 'details' | 'payment' | 'confirmation';
  currentStep: string;
  orderData: {
    restaurantId: number;
    orderType: OrderType;
    items: CartItem[];
    customerInfo: CustomerInfo;
    deliveryInfo?: DeliveryInfo;
    paymentInfo: PaymentInfo;
    specialInstructions?: string;
  };
}

interface CartItem {
  menuItemId: number;
  menuItem: MenuItem;
  quantity: number;
  customizations: Array<{
    optionId: number;
    name: string;
    value: string;
    priceModifier: number;
  }>;
  specialInstructions?: string;
  subtotal: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  isGuest?: boolean; // not logged in
  roomNumber?: string; // for room service
  tableNumber?: string; // for dine-in via QR code
}
```

#### Shopping Cart Management:
```typescript
interface ShoppingCart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  estimatedReadyTime: Date;
  actions: {
    addItem: (item: MenuItem, customizations: any) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    removeItem: (itemId: number) => void;
    clearCart: () => void;
    applyPromo: (promoCode: string) => void;
  };
}
```

### 4. Order Tracking Interface

#### Real-time Order Status:
```typescript
interface OrderTracking {
  order: Order;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  estimatedCompletion: Date;
  realTimeUpdates: boolean;
  trackingNumber: string;
}

interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: Date;
  message: string;
  icon: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

// Order status progression for different order types
const ORDER_STATUS_FLOW = {
  dine_in: [
    { status: 'confirmed', message: 'Order confirmed', icon: '✓' },
    { status: 'preparing', message: 'Kitchen is preparing your order', icon: '👨‍🍳' },
    { status: 'ready', message: 'Order ready for service', icon: '🔔' },
    { status: 'served', message: 'Enjoy your meal!', icon: '🍽️' }
  ],
  takeaway: [
    { status: 'confirmed', message: 'Order confirmed', icon: '✓' },
    { status: 'preparing', message: 'Preparing your order', icon: '👨‍🍳' },
    { status: 'ready', message: 'Ready for pickup', icon: '📦' },
    { status: 'completed', message: 'Order picked up', icon: '✅' }
  ],
  room_service: [
    { status: 'confirmed', message: 'Order confirmed', icon: '✓' },
    { status: 'preparing', message: 'Kitchen is preparing your order', icon: '👨‍🍳' },
    { status: 'ready', message: 'Out for delivery to your room', icon: '🚶' },
    { status: 'completed', message: 'Delivered to your room', icon: '🏨' }
  ]
};
```

### 5. QR Code Table Ordering

#### QR Code Scanning Interface:
```typescript
interface QROrderInterface {
  tableInfo: {
    tableNumber: string;
    restaurantName: string;
    capacity: number;
    features: string[];
  };
  sessionId: string;
  guestCount?: number;
  currentOrders: Order[];
  actions: {
    startSession: (guestCount: number) => void;
    addOrder: (items: CartItem[]) => void;
    callWaiter: () => void;
    requestBill: () => void;
    endSession: () => void;
  };
}

// QR code scanning component
interface QRScannerProps {
  onScanSuccess: (qrData: string) => void;
  onScanError: (error: string) => void;
  isActive: boolean;
}
```

### 6. Reservation Management Interface

#### Guest Reservation Portal:
```typescript
interface ReservationForm {
  restaurant: Restaurant;
  selectedDate?: Date;
  selectedTime?: string;
  partySize: number;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  preferences: {
    seatingPreference?: string;
    occasion?: string;
    specialRequests?: string;
  };
  availability: TableAvailability[];
}

interface ReservationConfirmation {
  reservation: Reservation;
  confirmationNumber: string;
  restaurantInfo: Restaurant;
  reminderSettings: {
    sms: boolean;
    email: boolean;
    timeBeforeReservation: number; // hours
  };
  actions: {
    modify: () => void;
    cancel: () => void;
    addToCalendar: () => void;
  };
}
```

### 7. Mobile App Features

#### Progressive Web App (PWA):
```typescript
interface PWAFeatures {
  offline: {
    cacheMenu: boolean;
    offlineOrders: boolean;
    syncWhenOnline: boolean;
  };
  notifications: {
    orderUpdates: boolean;
    reservationReminders: boolean;
    promotions: boolean;
  };
  installation: {
    showInstallPrompt: boolean;
    addToHomeScreen: boolean;
  };
}
```

#### Mobile Optimization:
- Touch-friendly interface design
- Optimized for various screen sizes
- Fast loading with image optimization
- Offline capability for menu browsing
- Push notifications for order updates
- Native app-like experience

### 8. Guest Preferences and History

#### Guest Profile Management:
```typescript
interface GuestProfile {
  id: number;
  personalInfo: {
    name: string;
    phone: string;
    email?: string;
    dateOfBirth?: Date;
  };
  preferences: {
    dietaryRestrictions: string[];
    favoriteItems: number[];
    allergies: string[];
    defaultOrderType: OrderType;
    communicationPreferences: {
      sms: boolean;
      email: boolean;
      push: boolean;
    };
  };
  orderHistory: Order[];
  reservationHistory: Reservation[];
  loyaltyPoints?: number;
  membershipLevel?: string;
}
```

#### Personalization Features:
- Recommended items based on history
- Quick reorder from previous orders
- Saved customization preferences
- Favorite items list
- Dietary restriction filtering
- Personalized promotions

### 9. Payment Integration

#### Payment Methods:
```typescript
interface PaymentMethods {
  cash: boolean;
  card: {
    enabled: boolean;
    acceptedTypes: string[]; // ['visa', 'mastercard', 'amex']
  };
  digitalWallet: {
    enabled: boolean;
    providers: string[]; // ['apple_pay', 'google_pay', 'samsung_pay']
  };
  roomCharge: {
    enabled: boolean;
    requiresGuestId: boolean;
  };
  giftCard: boolean;
  loyaltyPoints: boolean;
}

interface PaymentFlow {
  step: 'method' | 'details' | 'processing' | 'confirmation';
  selectedMethod: PaymentMethod;
  amount: number;
  processingStatus: 'pending' | 'success' | 'failed';
  transactionId?: string;
  receipt?: PaymentReceipt;
}
```

### 10. Responsive Design Implementation

#### Mobile-First CSS Structure:
```css
/* Base mobile styles */
.menu-container {
  padding: 16px;
  max-width: 100vw;
}

.menu-item-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 16px;
  overflow: hidden;
}

.menu-item-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/* Tablet styles */
@media (min-width: 768px) {
  .menu-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 24px;
  }
  
  .menu-item-card {
    flex-direction: row;
  }
  
  .menu-item-image {
    width: 150px;
    height: 120px;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .menu-container {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

## Implementation Requirements

### 1. Performance Optimization
- Lazy loading for menu images
- Virtual scrolling for large menus
- Optimized bundle size
- Efficient state management
- Caching strategies

### 2. Accessibility
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode
- Large text options

### 3. Cross-browser Compatibility
- Modern browser support
- iOS Safari compatibility
- Android Chrome compatibility
- Progressive enhancement

### 4. Security
- Input validation and sanitization
- XSS prevention
- CSRF protection
- Secure payment processing
- Data privacy compliance

## Acceptance Criteria

- [ ] Mobile-responsive menu browsing
- [ ] Complete online ordering workflow
- [ ] Real-time order tracking
- [ ] QR code table ordering functionality
- [ ] Guest reservation management
- [ ] Payment processing integration
- [ ] Guest profile and preferences
- [ ] PWA installation capability
- [ ] Offline functionality for menu browsing
- [ ] Push notifications for order updates

## Testing Requirements

- [ ] Mobile device testing across platforms
- [ ] Order flow end-to-end testing
- [ ] Payment processing testing
- [ ] QR code functionality testing
- [ ] Real-time update testing
- [ ] Performance testing on various networks
- [ ] Accessibility compliance testing

## Implementation Notes

- Implement progressive web app (PWA) features
- Use responsive design principles throughout
- Optimize for touch interactions
- Implement proper error handling and retry mechanisms
- Consider implementing offline order queuing
- Ensure smooth animations and transitions

## Related Issues
- Depends on: Issue #01 (Database), Issue #02 (Restaurant Backend), Issue #03 (Menu/Order Management), Issue #05 (Table Management)
- Related: Issue #07 (Billing Integration), Issue #08 (Restaurant Inventory)
- Blocks: Issue #11 (Performance Optimization), Issue #13 (Integration Testing)
