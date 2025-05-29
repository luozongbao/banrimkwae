# Issue #05: Table and Reservation Management System

## Priority: High
## Estimated Time: 5-6 days
## Dependencies: Issue #01, #02, #03
## Assignee: Full-stack Developer

## Description
Develop comprehensive table management and reservation system including floor map visualization, table status tracking, reservation booking, and integration with order management.

## Requirements

### 1. Table Management API

#### Table Configuration Endpoints:
```
GET    /api/restaurants/{id}/tables           # List all tables
GET    /api/restaurants/{id}/tables/{tableId} # Get table details
POST   /api/restaurants/{id}/tables           # Create table
PUT    /api/restaurants/{id}/tables/{tableId} # Update table
DELETE /api/restaurants/{id}/tables/{tableId} # Delete table
PUT    /api/restaurants/{id}/tables/{tableId}/status # Update table status
```

#### Floor Map Management:
```
GET    /api/restaurants/{id}/floor-map        # Get floor map layout
PUT    /api/restaurants/{id}/floor-map        # Update floor map layout
POST   /api/restaurants/{id}/tables/bulk      # Bulk create tables
PUT    /api/restaurants/{id}/tables/positions # Update table positions
```

#### Table Status Endpoints:
```
GET    /api/restaurants/{id}/tables/status    # Get all table statuses
PUT    /api/tables/{tableId}/occupy           # Mark table as occupied
PUT    /api/tables/{tableId}/clean            # Mark table for cleaning
PUT    /api/tables/{tableId}/available        # Mark table as available
PUT    /api/tables/{tableId}/maintenance      # Mark table for maintenance
```

### 2. Table Data Models

#### Table Model:
```typescript
interface Table {
  id: number;
  restaurantId: number;
  tableNumber: string;
  capacity: number;
  location: string; // floor section (e.g., "main", "patio", "private")
  position: {
    x: number; // pixel coordinates for floor map
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  shape: 'rectangle' | 'circle' | 'square';
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
  features: string[]; // ["window_view", "wheelchair_accessible", "high_top"]
  qrCode: string; // for mobile ordering
  currentOrder?: {
    orderId: number;
    guestCount: number;
    seatedAt: Date;
    estimatedDuration: number;
  };
  lastCleaned?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Floor Map Model:
```typescript
interface FloorMap {
  id: number;
  restaurantId: number;
  name: string; // "Main Dining", "Patio", etc.
  dimensions: {
    width: number;
    height: number;
  };
  backgroundImage?: string;
  tables: Table[];
  staticElements: FloorElement[]; // walls, doors, kitchen entrance, etc.
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FloorElement {
  id: string;
  type: 'wall' | 'door' | 'window' | 'kitchen_entrance' | 'restroom' | 'bar';
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  rotation?: number;
  color?: string;
  label?: string;
}
```

### 3. Reservation Management API

#### Reservation Endpoints:
```
GET    /api/restaurants/{id}/reservations     # List reservations
GET    /api/reservations/{reservationId}      # Get reservation details
POST   /api/restaurants/{id}/reservations     # Create reservation
PUT    /api/reservations/{reservationId}      # Update reservation
DELETE /api/reservations/{reservationId}      # Cancel reservation
PUT    /api/reservations/{reservationId}/confirm # Confirm reservation
PUT    /api/reservations/{reservationId}/seat   # Seat guests (assign table)
PUT    /api/reservations/{reservationId}/no-show # Mark as no-show
```

#### Availability Check:
```
GET    /api/restaurants/{id}/availability     # Check table availability
POST   /api/restaurants/{id}/availability/check # Check specific time slot
GET    /api/restaurants/{id}/availability/calendar # Monthly availability
```

#### Guest Reservation Portal:
```
GET    /api/restaurants/{id}/reservations/public # Public reservation form
POST   /api/restaurants/{id}/reservations/public # Create public reservation
GET    /api/reservations/{reservationId}/status  # Check reservation status
PUT    /api/reservations/{reservationId}/modify  # Modify reservation (guest)
```

### 4. Reservation Data Models

#### Reservation Model:
```typescript
interface Reservation {
  id: number;
  restaurantId: number;
  guestId?: number; // null for walk-in reservations
  confirmationNumber: string;
  reservationDate: Date;
  reservationTime: string; // "19:30"
  partySize: number;
  duration: number; // expected duration in minutes
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  tableId?: number; // assigned when seated
  guestInfo: {
    name: string;
    phone: string;
    email?: string;
    specialRequests?: string;
  };
  preferredSeating?: string[]; // ["window", "quiet", "wheelchair_accessible"]
  occasion?: string; // "birthday", "anniversary", "business"
  notes?: string;
  seatedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Availability Model:
```typescript
interface TableAvailability {
  date: string;
  timeSlots: Array<{
    time: string;
    availableTables: number;
    totalCapacity: number;
    tables: Array<{
      tableId: number;
      tableNumber: string;
      capacity: number;
      features: string[];
    }>;
  }>;
}

interface AvailabilityCheck {
  restaurantId: number;
  date: string;
  time: string;
  partySize: number;
  duration?: number;
  preferences?: string[];
}

interface AvailabilityResult {
  available: boolean;
  suggestedTables: Table[];
  alternativeTimes: string[];
  reason?: string;
}
```

### 5. Table Assignment Logic

#### Automatic Table Assignment:
```typescript
class TableAssignmentService {
  findBestTable(reservation: Reservation): Table | null;
  optimizeSeating(reservations: Reservation[]): TableAssignment[];
  calculateTableTurnover(tableId: number, date: string): number;
  predictAvailability(date: string, time: string): AvailabilityPrediction;
}

interface TableAssignment {
  reservationId: number;
  tableId: number;
  score: number; // assignment quality score
  reasons: string[]; // why this table was chosen
}

interface SeatingOptimization {
  assignments: TableAssignment[];
  utilizationRate: number;
  conflicts: Array<{
    reservationId: number;
    issue: string;
    suggestions: string[];
  }>;
}
```

### 6. Floor Map Visualization

#### Interactive Floor Map Component:
```typescript
interface FloorMapProps {
  restaurant: Restaurant;
  tables: Table[];
  selectedTable?: number;
  mode: 'view' | 'edit' | 'assign';
  onTableClick: (table: Table) => void;
  onTableMove?: (tableId: number, position: Position) => void;
  showReservations?: boolean;
  timeSlot?: string;
}

interface TableVisualization {
  table: Table;
  status: TableStatus;
  reservation?: Reservation;
  currentOccupancy?: {
    guestCount: number;
    duration: number;
    estimatedCompletion: Date;
  };
  isSelectable: boolean;
  conflicts: string[];
}
```

#### Floor Map Editor:
```typescript
interface FloorMapEditor {
  mode: 'select' | 'add_table' | 'move_table' | 'add_element';
  selectedItem?: string;
  tools: {
    addTable: (position: Position, capacity: number) => void;
    moveTable: (tableId: number, newPosition: Position) => void;
    resizeTable: (tableId: number, newDimensions: Dimensions) => void;
    deleteTable: (tableId: number) => void;
    addElement: (element: FloorElement) => void;
  };
  history: {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
  };
}
```

### 7. Real-time Table Status

#### WebSocket Integration:
```typescript
interface TableStatusEvent {
  type: 'status_change' | 'reservation_update' | 'occupancy_change';
  tableId: number;
  restaurantId: number;
  data: {
    previousStatus?: TableStatus;
    newStatus: TableStatus;
    reservation?: Reservation;
    occupancy?: TableOccupancy;
  };
  timestamp: Date;
}

// WebSocket endpoint
/ws/restaurant/{restaurantId}/tables

class TableStatusManager {
  updateTableStatus(tableId: number, status: TableStatus): void;
  broadcastStatusChange(event: TableStatusEvent): void;
  handleReservationSeating(reservationId: number, tableId: number): void;
  handleTableClearance(tableId: number): void;
}
```

### 8. Reservation Analytics

#### Reservation Performance Metrics:
```
GET /api/restaurants/{id}/analytics/reservations # Reservation analytics
GET /api/restaurants/{id}/analytics/table-turnover # Table turnover analysis
GET /api/restaurants/{id}/analytics/no-shows      # No-show analysis
GET /api/restaurants/{id}/analytics/occupancy     # Occupancy patterns
```

#### Analytics Models:
```typescript
interface ReservationAnalytics {
  period: string;
  totalReservations: number;
  confirmedReservations: number;
  completedReservations: number;
  noShows: number;
  cancellations: number;
  averagePartySize: number;
  averageDuration: number;
  peakTimes: Array<{
    time: string;
    reservationCount: number;
    utilizationRate: number;
  }>;
  tableUtilization: Array<{
    tableId: number;
    tableNumber: string;
    utilizationRate: number;
    turnoverCount: number;
    averageDuration: number;
  }>;
}
```

### 9. Mobile Table Management

#### QR Code Integration:
```typescript
interface QRCodeOrder {
  tableId: number;
  qrCode: string;
  sessionId: string;
  guestCount?: number;
  orders: Order[];
  createdAt: Date;
}

// QR code endpoints
GET    /api/tables/qr/{qrCode}           # Get table info from QR code
POST   /api/tables/qr/{qrCode}/session   # Start table session
GET    /api/tables/qr/{qrCode}/menu      # Get menu for table
POST   /api/tables/qr/{qrCode}/order     # Place order from table
```

#### Mobile Table Status:
```typescript
interface MobileTableInterface {
  tableInfo: Table;
  currentSession?: TableSession;
  availableActions: string[]; // ["order", "call_waiter", "request_bill"]
  orderHistory: Order[];
  guestCount: number;
}
```

## Implementation Requirements

### 1. UI/UX Design
- Intuitive drag-and-drop floor map editor
- Real-time visual status updates
- Mobile-responsive reservation form
- Accessible color coding for table statuses

### 2. Performance Optimization
- Efficient floor map rendering
- Optimized table availability calculations
- Cached reservation lookups
- Minimal re-renders on status updates

### 3. Business Logic
- Intelligent table assignment algorithms
- Overbooking prevention
- Automatic table turnover calculations
- Reservation conflict detection

### 4. Integration Points
- Order management system integration
- Guest management system integration
- Payment processing integration
- Staff notification system

## Acceptance Criteria

- [ ] Complete table management functionality
- [ ] Interactive floor map with drag-and-drop editing
- [ ] Reservation booking and management system
- [ ] Real-time table status updates
- [ ] Automatic table assignment optimization
- [ ] Mobile QR code ordering integration
- [ ] Comprehensive reservation analytics
- [ ] Guest self-service reservation portal
- [ ] Staff table management interface
- [ ] Integration with order management system

## Testing Requirements

- [ ] Table CRUD operations testing
- [ ] Reservation workflow testing
- [ ] Floor map editor functionality testing
- [ ] Real-time status update testing
- [ ] Table assignment algorithm testing
- [ ] Mobile QR code functionality testing
- [ ] Integration testing with order system

## Implementation Notes

- Implement table assignment optimization algorithms
- Use canvas or SVG for floor map rendering
- Implement proper conflict resolution for concurrent table updates
- Consider implementing waitlist functionality for full capacity
- Design for scalability with multiple restaurant locations

## Related Issues
- Depends on: Issue #01 (Database), Issue #02 (Restaurant Backend), Issue #03 (Menu/Order Management)
- Related: Issue #04 (Kitchen Management), Issue #07 (Guest Interface)
- Blocks: Issue #08 (Billing Integration), Issue #10 (Restaurant Reporting)
