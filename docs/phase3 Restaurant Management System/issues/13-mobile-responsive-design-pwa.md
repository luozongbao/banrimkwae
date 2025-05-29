# Issue #13: Mobile Responsive Design and PWA Implementation

## Priority: High
## Estimated Time: 5-6 days
## Dependencies: Issue #04, #05, #06 (Kitchen, Table, Guest interfaces)
## Assignee: Frontend Developer + UX/UI Designer

## Description
Implement comprehensive mobile-responsive design and Progressive Web App (PWA) functionality for the restaurant management system, ensuring optimal user experience across all devices including smartphones, tablets, and kitchen display screens.

## Requirements

### 1. Progressive Web App (PWA) Implementation

#### Service Worker Configuration:
```typescript
// Service worker for offline functionality
class RestaurantServiceWorker {
  // Cache strategies for different content types
  async cacheMenuData(restaurantId: number): Promise<void>;
  async cacheOrderData(orderId: number): Promise<void>;
  async cacheStaticAssets(): Promise<void>;
  
  // Offline functionality
  async handleOfflineOrder(orderData: OfflineOrderData): Promise<void>;
  async syncOfflineOrders(): Promise<void>;
  async getOfflineMenuData(restaurantId: number): Promise<MenuData>;
  
  // Background sync for real-time updates
  async registerBackgroundSync(tag: string): Promise<void>;
  async handleBackgroundSync(event: BackgroundSyncEvent): Promise<void>;
  
  // Push notifications
  async registerPushNotifications(): Promise<PushSubscription>;
  async handlePushNotification(event: PushEvent): Promise<void>;
  async showOrderStatusNotification(orderData: OrderNotification): Promise<void>;
}

// PWA manifest configuration
interface PWAManifest {
  name: "Banrimkwae Restaurant Manager";
  short_name: "Restaurant Manager";
  description: "Complete restaurant management system";
  start_url: "/restaurant";
  display: "standalone";
  background_color: "#ffffff";
  theme_color: "#2563eb";
  orientation: "portrait-primary";
  categories: ["business", "food", "productivity"];
  icons: [
    {
      src: "/icons/icon-72x72.png",
      sizes: "72x72",
      type: "image/png",
      purpose: "any"
    },
    {
      src: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any maskable"
    },
    {
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable"
    }
  ];
}
```

#### Offline-First Architecture:
```typescript
// Offline data management
class OfflineDataManager {
  private localDB: IDBDatabase;
  
  // Offline menu management
  async storeMenuOffline(restaurantId: number, menuData: MenuData): Promise<void>;
  async getOfflineMenu(restaurantId: number): Promise<MenuData | null>;
  async updateOfflineMenuItems(updates: MenuItemUpdate[]): Promise<void>;
  
  // Offline order management
  async createOfflineOrder(orderData: CreateOrderRequest): Promise<OfflineOrder>;
  async getOfflineOrders(): Promise<OfflineOrder[]>;
  async syncOrderToServer(offlineOrder: OfflineOrder): Promise<SyncResult>;
  async markOrderSynced(offlineOrderId: string): Promise<void>;
  
  // Conflict resolution
  async resolveDataConflicts(conflicts: DataConflict[]): Promise<ConflictResolution[]>;
  async mergeOfflineChanges(serverData: any, localData: any): Promise<MergedData>;
}
```

### 2. Responsive Design System

#### Mobile-First Component Library:
```typescript
// Responsive grid system
interface ResponsiveGridProps {
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap: ResponsiveValue<number>;
  children: React.ReactNode;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ columns, gap, children }) => {
  return (
    <Grid
      templateColumns={{
        base: `repeat(${columns.mobile}, 1fr)`,
        md: `repeat(${columns.tablet}, 1fr)`,
        lg: `repeat(${columns.desktop}, 1fr)`
      }}
      gap={gap}
    >
      {children}
    </Grid>
  );
};

// Touch-friendly components
const TouchFriendlyButton: React.FC<TouchButtonProps> = ({ 
  size = "lg", 
  variant = "solid", 
  isLoading,
  children,
  ...props 
}) => {
  return (
    <Button
      size={size}
      variant={variant}
      isLoading={isLoading}
      minH={{ base: "48px", md: "40px" }} // Minimum touch target size
      px={{ base: 6, md: 4 }}
      fontSize={{ base: "md", md: "sm" }}
      {...props}
    >
      {children}
    </Button>
  );
};
```

#### Breakpoint System:
```scss
// Responsive breakpoints
$breakpoints: (
  'mobile': 320px,
  'mobile-lg': 480px,
  'tablet': 768px,
  'tablet-lg': 1024px,
  'desktop': 1200px,
  'desktop-lg': 1440px,
  'kitchen-display': 1920px
);

// Mixins for responsive design
@mixin mobile-only {
  @media (max-width: map-get($breakpoints, 'tablet') - 1px) {
    @content;
  }
}

@mixin tablet-only {
  @media (min-width: map-get($breakpoints, 'tablet')) and (max-width: map-get($breakpoints, 'desktop') - 1px) {
    @content;
  }
}

@mixin desktop-and-up {
  @media (min-width: map-get($breakpoints, 'desktop')) {
    @content;
  }
}

@mixin kitchen-display {
  @media (min-width: map-get($breakpoints, 'kitchen-display')) {
    @content;
  }
}
```

### 3. Mobile Restaurant Staff Interface

#### Mobile Kitchen Management:
```typescript
// Mobile kitchen interface components
const MobileKitchenQueue: React.FC = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  
  return (
    <Box>
      {/* Swipeable order cards */}
      <VStack spacing={2} p={4}>
        {orders.map(order => (
          <SwipeableOrderCard
            key={order.id}
            order={order}
            onSwipeRight={() => updateOrderStatus(order.id, 'preparing')}
            onSwipeLeft={() => updateOrderStatus(order.id, 'ready')}
            onTap={() => setSelectedOrder(order)}
          />
        ))}
      </VStack>
      
      {/* Order details modal */}
      <OrderDetailsModal
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </Box>
  );
};

// Swipeable order card component
const SwipeableOrderCard: React.FC<SwipeableOrderCardProps> = ({
  order,
  onSwipeRight,
  onSwipeLeft,
  onTap
}) => {
  const swipeHandlers = useSwipeable({
    onSwipedRight: onSwipeRight,
    onSwipedLeft: onSwipeLeft,
    threshold: 50,
    preventDefaultTouchmoveEvent: true
  });

  return (
    <Box
      {...swipeHandlers}
      bg="white"
      p={4}
      borderRadius="lg"
      shadow="md"
      borderLeft="4px solid"
      borderLeftColor={getOrderStatusColor(order.status)}
      onClick={onTap}
      cursor="pointer"
      w="full"
    >
      <OrderCardContent order={order} />
    </Box>
  );
};
```

#### Mobile Table Management:
```typescript
// Touch-friendly table management
const MobileTableMap: React.FC<TableMapProps> = ({ restaurantId }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  
  return (
    <Box>
      {/* Zoomable table layout */}
      <PinchZoomPan
        min={0.5}
        max={2}
        captureWheel={false}
      >
        <TableFloorPlan
          tables={tables}
          onTableSelect={setSelectedTable}
          interactive={true}
          touchFriendly={true}
        />
      </PinchZoomPan>
      
      {/* Table action drawer */}
      <Drawer
        isOpen={!!selectedTable}
        placement="bottom"
        onClose={() => setSelectedTable(null)}
      >
        <DrawerContent>
          <TableActionPanel table={selectedTable} />
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

// Mobile-optimized table status grid
const MobileTableGrid: React.FC = () => {
  const { tables } = useTableManagement();
  
  return (
    <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3} p={4}>
      {tables.map(table => (
        <TableStatusCard
          key={table.id}
          table={table}
          size="compact"
          showQuickActions={true}
        />
      ))}
    </SimpleGrid>
  );
};
```

### 4. Guest Mobile Experience

#### Mobile Menu Browsing:
```typescript
// Mobile-optimized menu interface
const MobileMenuBrowser: React.FC<MenuBrowserProps> = ({ restaurantId }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  return (
    <Box>
      {/* Sticky category filter */}
      <Box
        position="sticky"
        top={0}
        bg="white"
        zIndex={10}
        borderBottom="1px solid"
        borderColor="gray.200"
        p={4}
      >
        <HStack spacing={2} overflowX="auto" pb={2}>
          <CategoryFilterChips
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </HStack>
        
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search menu items..."
          size="lg"
        />
      </Box>
      
      {/* Menu items list */}
      <VirtualizedMenuList
        items={filteredMenuItems}
        renderItem={({ item }) => (
          <MobileMenuItem
            item={item}
            onAddToCart={addToCart}
            onViewDetails={openItemDetails}
          />
        )}
      />
    </Box>
  );
};

// Touch-friendly menu item card
const MobileMenuItem: React.FC<MobileMenuItemProps> = ({ 
  item, 
  onAddToCart, 
  onViewDetails 
}) => {
  return (
    <Box
      bg="white"
      p={4}
      borderBottom="1px solid"
      borderColor="gray.100"
    >
      <HStack spacing={4} align="start">
        <Image
          src={item.imageUrl}
          alt={item.name}
          boxSize="80px"
          objectFit="cover"
          borderRadius="md"
          fallback={<MenuItemImageFallback />}
        />
        
        <VStack flex={1} align="start" spacing={2}>
          <Text fontWeight="semibold" fontSize="lg">
            {item.name}
          </Text>
          <Text color="gray.600" fontSize="sm" noOfLines={2}>
            {item.description}
          </Text>
          <HStack justify="space-between" w="full">
            <Text fontWeight="bold" color="green.600" fontSize="lg">
              ฿{item.price}
            </Text>
            <QuickAddButton
              onAdd={() => onAddToCart(item)}
              disabled={!item.isAvailable}
            />
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};
```

#### Mobile Order Tracking:
```typescript
// Real-time mobile order tracking
const MobileOrderTracking: React.FC<OrderTrackingProps> = ({ orderId }) => {
  const { order, isLoading } = useRealtimeOrder(orderId);
  
  if (isLoading) return <OrderTrackingSkeletons />;
  
  return (
    <Box p={4}>
      {/* Order progress indicator */}
      <OrderProgressStepper
        currentStatus={order.status}
        estimatedTime={order.estimatedDeliveryTime}
        mobile={true}
      />
      
      {/* Order details */}
      <Card mt={6}>
        <CardBody>
          <VStack spacing={4} align="start">
            <HStack justify="space-between" w="full">
              <Text fontWeight="semibold">Order #{order.orderNumber}</Text>
              <Badge colorScheme={getStatusColorScheme(order.status)}>
                {order.status}
              </Badge>
            </HStack>
            
            <Divider />
            
            {/* Order items */}
            <VStack spacing={3} w="full">
              {order.items.map(item => (
                <OrderItemSummary key={item.id} item={item} compact={true} />
              ))}
            </VStack>
            
            <Divider />
            
            {/* Total and actions */}
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold" fontSize="lg">
                Total: ฿{order.totalAmount}
              </Text>
              {order.status === 'pending' && (
                <Button
                  variant="outline"
                  colorScheme="red"
                  size="sm"
                  onClick={() => cancelOrder(order.id)}
                >
                  Cancel Order
                </Button>
              )}
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};
```

### 5. QR Code Integration

#### QR Code Table Ordering:
```typescript
// QR code scanning and table ordering
const QRCodeTableOrdering: React.FC = () => {
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  
  const handleQRScan = async (result: string) => {
    try {
      const qrData = parseQRCode(result);
      if (qrData.type === 'table') {
        setScanResult(qrData);
        await initializeTableSession(qrData.tableId, qrData.restaurantId);
        setShowScanner(false);
      }
    } catch (error) {
      showToast({
        title: "Invalid QR Code",
        description: "Please scan a valid table QR code",
        status: "error"
      });
    }
  };
  
  return (
    <Box>
      {!scanResult ? (
        <VStack spacing={6} py={8}>
          <VStack spacing={4}>
            <Icon as={FaQrcode} boxSize="80px" color="gray.400" />
            <Text fontSize="xl" fontWeight="semibold">
              Scan Table QR Code
            </Text>
            <Text color="gray.600" textAlign="center">
              Point your camera at the QR code on your table to start ordering
            </Text>
          </VStack>
          
          <Button
            size="lg"
            colorScheme="blue"
            leftIcon={<FaCamera />}
            onClick={() => setShowScanner(true)}
          >
            Open Camera
          </Button>
        </VStack>
      ) : (
        <TableOrderingInterface
          tableId={scanResult.tableId}
          restaurantId={scanResult.restaurantId}
        />
      )}
      
      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleQRScan}
      />
    </Box>
  );
};

// QR Scanner Component
const QRScannerModal: React.FC<QRScannerProps> = ({ 
  isOpen, 
  onClose, 
  onScan 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg="black">
        <ModalCloseButton color="white" />
        <ModalBody p={0}>
          <QrScanner
            onDecode={onScan}
            onError={(error) => console.error(error)}
            constraints={{
              facingMode: 'environment' // Use back camera
            }}
            containerStyle={{
              width: '100%',
              height: '100vh'
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
```

### 6. Mobile Performance Optimization

#### Touch Performance and Gestures:
```typescript
// Optimized touch interactions
class TouchOptimizationService {
  // Debounced touch handlers
  createDebouncedTouchHandler(handler: Function, delay: number = 150): Function {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handler(...args), delay);
    };
  }
  
  // Fast tap detection
  setupFastTap(element: HTMLElement, handler: Function): void {
    let touchStartTime: number;
    
    element.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
    });
    
    element.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration < 200) { // Fast tap
        e.preventDefault();
        handler(e);
      }
    });
  }
  
  // Scroll optimization
  optimizeScrolling(container: HTMLElement): void {
    container.style.webkitOverflowScrolling = 'touch';
    container.style.overflowScrolling = 'touch';
  }
}

// Mobile viewport optimization
const useMobileViewport = () => {
  useEffect(() => {
    // Prevent zoom on input focus
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
    
    // Handle safe area insets
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    
    return () => window.removeEventListener('resize', setViewportHeight);
  }, []);
};
```

### 7. Push Notifications

#### Mobile Push Notification System:
```typescript
// Push notification service
class MobilePushNotificationService {
  // Register for push notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }
    
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription> {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.vapidPublicKey
    });
    
    await this.sendSubscriptionToServer(subscription);
    return subscription;
  }
  
  // Order status notifications
  async sendOrderStatusNotification(orderData: OrderNotificationData): Promise<void> {
    const notification = {
      title: `Order #${orderData.orderNumber} Update`,
      body: `Your order is now ${orderData.status}`,
      icon: '/icons/order-icon.png',
      badge: '/icons/badge-icon.png',
      tag: `order-${orderData.orderId}`,
      data: {
        orderId: orderData.orderId,
        action: 'view-order'
      },
      actions: [
        {
          action: 'view',
          title: 'View Order'
        },
        {
          action: 'track',
          title: 'Track Order'
        }
      ]
    };
    
    await this.sendNotification(notification);
  }
  
  // Kitchen notifications for staff
  async sendKitchenNotification(kitchenData: KitchenNotificationData): Promise<void> {
    const notification = {
      title: 'New Order Received',
      body: `Table ${kitchenData.tableNumber} - ${kitchenData.itemCount} items`,
      icon: '/icons/kitchen-icon.png',
      tag: `kitchen-order-${kitchenData.orderId}`,
      requireInteraction: true,
      data: {
        orderId: kitchenData.orderId,
        action: 'kitchen-view'
      }
    };
    
    await this.sendNotification(notification);
  }
}
```

## Implementation Requirements

### 1. Device Compatibility
- iOS Safari (iOS 12+)
- Android Chrome (Android 8+)
- Progressive Web App installation support
- Touch gesture optimization
- Device orientation handling

### 2. Performance Standards
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3.0s
- 60 FPS touch interactions
- Offline functionality for core features

### 3. Accessibility
- WCAG 2.1 AA compliance
- Screen reader support
- High contrast mode support
- Large text options
- Voice navigation support

### 4. Progressive Enhancement
- Core functionality without JavaScript
- Enhanced experience with JavaScript
- Graceful degradation for older devices
- Adaptive loading based on connection speed

## Acceptance Criteria

- [ ] PWA installation and offline functionality working
- [ ] Mobile-responsive design across all screen sizes
- [ ] Touch-friendly interfaces for all user roles
- [ ] QR code scanning and table ordering functional
- [ ] Push notifications for order updates
- [ ] 60 FPS performance on mobile devices
- [ ] Offline menu browsing capability
- [ ] Kitchen display optimization for tablets
- [ ] Guest mobile ordering experience complete
- [ ] Staff mobile interfaces fully functional

## Testing Requirements

- [ ] Mobile device testing across iOS and Android
- [ ] PWA installation and offline testing
- [ ] Touch gesture and interaction testing
- [ ] Performance testing on various devices
- [ ] QR code scanning functionality testing
- [ ] Push notification delivery testing
- [ ] Screen orientation testing
- [ ] Accessibility testing on mobile devices

## Implementation Notes

- Use native device capabilities where available
- Implement progressive loading for better performance
- Optimize images and assets for mobile bandwidth
- Use CSS Grid and Flexbox for responsive layouts
- Implement proper caching strategies for mobile data
- Consider device battery life in implementation decisions
- Test extensively on real devices, not just emulators

## Related Issues
- Depends on: Issue #04 (Kitchen Management), Issue #05 (Table Management), Issue #06 (Guest Interface)
- Related: Issue #11 (Performance Optimization), Issue #14 (Integration Testing)
- Enhances: All user interfaces with mobile optimization
