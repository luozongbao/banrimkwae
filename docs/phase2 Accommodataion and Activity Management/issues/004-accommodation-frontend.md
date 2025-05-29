# Issue #004: Accommodation Management Frontend Components

## Priority: High
## Estimated Duration: 10 days
## Dependencies: Issue #002 (Accommodation Backend), Phase 1 Frontend Framework

---

## Description
Develop the complete frontend interface for accommodation management including dashboard, forms, booking management, and guest interfaces. This system will provide intuitive interfaces for staff to manage accommodations and for guests to book stays.

## Acceptance Criteria

### 1. Accommodation Dashboard
- [x] Accommodation listing with filtering and search
- [x] Quick stats display (Total, Occupied, Available, Maintenance)
- [x] Status indicators with color coding
- [x] Calendar view toggle
- [x] Export functionality
- [x] Responsive design for mobile/tablet

### 2. Accommodation Management
- [x] Add/Edit accommodation form with validation
- [x] Image upload with preview and management
- [x] Room configuration interface
- [x] Amenities selection with icons
- [x] Pricing management (base, weekend, holiday rates)
- [x] Status management (active, inactive, maintenance)

### 3. Booking Management
- [x] Booking creation interface
- [x] Guest information management
- [x] Room selection with availability display
- [x] Payment summary and processing
- [x] Booking modification interface
- [x] Check-in/Check-out processes

### 4. Guest Interface
- [x] Accommodation browsing with filters
- [x] Availability search functionality
- [x] Booking form with guest information
- [x] Payment interface
- [x] Booking confirmation display

### 5. Calendar and Availability Views
- [x] Master calendar with accommodation status
- [x] Daily schedule view
- [x] Availability calendar for specific accommodations
- [x] Booking timeline visualization

## Component Structure

### Dashboard Components

#### AccommodationDashboard.tsx
```typescript
interface AccommodationDashboardProps {
  onViewChange: (view: 'list' | 'calendar') => void;
  currentView: 'list' | 'calendar';
}

const AccommodationDashboard: React.FC<AccommodationDashboardProps> = ({
  onViewChange,
  currentView
}) => {
  // Quick stats display
  // Filter and search functionality
  // View toggle (list/calendar)
  // Action buttons (Add, Import, Export)
  
  return (
    <div className="accommodation-dashboard">
      <DashboardHeader />
      <QuickStats />
      <FilterBar />
      {currentView === 'list' ? <AccommodationList /> : <AccommodationCalendar />}
    </div>
  );
};
```

#### QuickStats.tsx
```typescript
interface StatItem {
  label: string;
  value: number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

const QuickStats: React.FC = () => {
  const [stats, setStats] = useState<StatItem[]>([]);
  
  // Fetch accommodation statistics
  // Display cards with icons and values
  // Show trends if available
  
  return (
    <div className="quick-stats">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
```

### Accommodation Management Components

#### AccommodationForm.tsx
```typescript
interface AccommodationFormProps {
  accommodation?: Accommodation;
  onSubmit: (data: AccommodationFormData) => void;
  onCancel: () => void;
}

interface AccommodationFormData {
  name: string;
  code: string;
  accommodationType: string;
  description: string;
  location: string;
  maxOccupancy: number;
  baseRate: number;
  weekendRate?: number;
  holidayRate?: number;
  amenities: string[];
  images: File[];
  rooms: RoomData[];
}

const AccommodationForm: React.FC<AccommodationFormProps> = ({
  accommodation,
  onSubmit,
  onCancel
}) => {
  // Form state management
  // Validation logic
  // Image upload handling
  // Room configuration management
  
  return (
    <form onSubmit={handleSubmit} className="accommodation-form">
      <BasicInformation />
      <LocationAmenities />
      <PricingSection />
      <RoomConfiguration />
      <ImageUpload />
      <FormActions />
    </form>
  );
};
```

#### RoomConfiguration.tsx
```typescript
interface RoomData {
  id?: number;
  roomTypeId: number;
  roomNumber: string;
  maxOccupancy: number;
  ratePerNight: number;
}

const RoomConfiguration: React.FC<{
  rooms: RoomData[];
  onChange: (rooms: RoomData[]) => void;
}> = ({ rooms, onChange }) => {
  // Add/remove room functionality
  // Room type selection
  // Rate configuration
  // Validation for room data
  
  return (
    <div className="room-configuration">
      <div className="room-list">
        {rooms.map((room, index) => (
          <RoomConfigItem
            key={index}
            room={room}
            onUpdate={(updatedRoom) => updateRoom(index, updatedRoom)}
            onRemove={() => removeRoom(index)}
          />
        ))}
      </div>
      <Button onClick={addRoom}>Add Room</Button>
    </div>
  );
};
```

### Booking Management Components

#### BookingForm.tsx
```typescript
interface BookingFormProps {
  accommodationId?: number;
  onSubmit: (booking: BookingData) => void;
  onCancel: () => void;
}

interface BookingData {
  guestInfo: GuestInfo;
  accommodationId: number;
  checkInDate: Date;
  checkOutDate: Date;
  checkInTime: string;
  checkOutTime: string;
  adults: number;
  children: number;
  infants: number;
  roomIds: number[];
  specialRequests?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({
  accommodationId,
  onSubmit,
  onCancel
}) => {
  // Guest information handling
  // Date selection with validation
  // Room selection interface
  // Price calculation
  // Payment processing
  
  return (
    <div className="booking-form">
      <GuestInformation />
      <BookingDetails />
      <RoomSelection />
      <PaymentSummary />
      <FormActions />
    </div>
  );
};
```

#### RoomSelection.tsx
```typescript
const RoomSelection: React.FC<{
  accommodationId: number;
  checkIn: Date;
  checkOut: Date;
  selectedRooms: number[];
  onRoomToggle: (roomId: number) => void;
}> = ({ accommodationId, checkIn, checkOut, selectedRooms, onRoomToggle }) => {
  // Fetch available rooms
  // Display room cards with details
  // Handle room selection
  // Show pricing per room
  
  return (
    <div className="room-selection">
      <h3>Select Rooms</h3>
      <div className="room-grid">
        {availableRooms.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            selected={selectedRooms.includes(room.id)}
            onToggle={() => onRoomToggle(room.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

### Guest Interface Components

#### GuestAccommodationBrowser.tsx
```typescript
const GuestAccommodationBrowser: React.FC = () => {
  // Search and filter functionality
  // Accommodation cards with images
  // Availability checking
  // Price display
  // Booking initiation
  
  return (
    <div className="guest-accommodation-browser">
      <SearchFilters />
      <AccommodationGrid />
      <Pagination />
    </div>
  );
};
```

#### AccommodationCard.tsx
```typescript
interface AccommodationCardProps {
  accommodation: Accommodation;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  onSelect: (id: number) => void;
}

const AccommodationCard: React.FC<AccommodationCardProps> = ({
  accommodation,
  checkIn,
  checkOut,
  guests,
  onSelect
}) => {
  // Image carousel
  // Amenities display
  // Pricing information
  // Availability status
  // Selection action
  
  return (
    <div className="accommodation-card">
      <ImageCarousel images={accommodation.images} />
      <CardContent>
        <Title>{accommodation.name}</Title>
        <AmenitiesList amenities={accommodation.amenities} />
        <PriceDisplay rate={accommodation.baseRate} />
        <AvailabilityStatus />
        <SelectButton onClick={() => onSelect(accommodation.id)} />
      </CardContent>
    </div>
  );
};
```

### Calendar Components

#### AccommodationCalendar.tsx
```typescript
const AccommodationCalendar: React.FC = () => {
  // Month/week/day view toggle
  // Accommodation occupancy display
  // Booking status indicators
  // Quick actions (check-in/out)
  // Drag and drop booking management
  
  return (
    <div className="accommodation-calendar">
      <CalendarHeader />
      <CalendarGrid />
      <CalendarLegend />
    </div>
  );
};
```

#### DailyScheduleView.tsx
```typescript
const DailyScheduleView: React.FC<{
  date: Date;
  accommodations: Accommodation[];
}> = ({ date, accommodations }) => {
  // Time-based schedule display
  // Check-in/check-out events
  // Maintenance schedules
  // Staff task assignments
  
  return (
    <div className="daily-schedule">
      <ScheduleTimeline />
      <EventList />
    </div>
  );
};
```

## State Management

### Redux Store Structure
```typescript
interface AccommodationState {
  accommodations: {
    items: Accommodation[];
    loading: boolean;
    error: string | null;
    filters: AccommodationFilters;
    pagination: PaginationInfo;
  };
  bookings: {
    items: Booking[];
    loading: boolean;
    error: string | null;
    currentBooking: BookingFormData | null;
  };
  availability: {
    data: AvailabilityData;
    loading: boolean;
    error: string | null;
  };
  ui: {
    currentView: 'list' | 'calendar';
    selectedAccommodation: number | null;
    modalStates: ModalStates;
  };
}
```

### Actions
```typescript
// Accommodation actions
export const fetchAccommodations = createAsyncThunk(
  'accommodations/fetchAccommodations',
  async (params: AccommodationListParams) => {
    // API call to fetch accommodations
  }
);

export const createAccommodation = createAsyncThunk(
  'accommodations/createAccommodation',
  async (data: AccommodationFormData) => {
    // API call to create accommodation
  }
);

// Booking actions
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (data: BookingData) => {
    // API call to create booking
  }
);

export const checkAvailability = createAsyncThunk(
  'availability/checkAvailability',
  async (params: AvailabilityParams) => {
    // API call to check availability
  }
);
```

## Styling and Design

### Theme Integration
```scss
// Accommodation dashboard styles
.accommodation-dashboard {
  .quick-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }
  
  .stat-card {
    background: var(--color-surface);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md);
    box-shadow: var(--shadow-sm);
    
    .stat-value {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-primary);
    }
    
    .stat-label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
  }
}

// Accommodation form styles
.accommodation-form {
  .form-section {
    margin-bottom: var(--spacing-xl);
    
    .section-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--spacing-md);
      color: var(--color-text-primary);
    }
  }
  
  .room-configuration {
    .room-item {
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
    }
  }
}
```

### Responsive Design
```scss
// Mobile styles
@media (max-width: 768px) {
  .accommodation-dashboard {
    .quick-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .accommodation-form {
    .form-row {
      flex-direction: column;
    }
  }
  
  .accommodation-card {
    margin-bottom: var(--spacing-md);
  }
}

// Tablet styles
@media (min-width: 769px) and (max-width: 1024px) {
  .accommodation-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## API Integration

### Service Layer
```typescript
class AccommodationService {
  static async getAccommodations(params: AccommodationListParams): Promise<AccommodationListResponse> {
    return apiClient.get('/accommodations', { params });
  }
  
  static async createAccommodation(data: AccommodationFormData): Promise<Accommodation> {
    const formData = new FormData();
    // Handle file uploads and form data
    return apiClient.post('/accommodations', formData);
  }
  
  static async updateAccommodation(id: number, data: AccommodationFormData): Promise<Accommodation> {
    return apiClient.put(`/accommodations/${id}`, data);
  }
  
  static async deleteAccommodation(id: number): Promise<void> {
    return apiClient.delete(`/accommodations/${id}`);
  }
  
  static async checkAvailability(params: AvailabilityParams): Promise<AvailabilityResponse> {
    return apiClient.get(`/accommodations/${params.accommodationId}/availability`, { params });
  }
}

class BookingService {
  static async createBooking(data: BookingData): Promise<Booking> {
    return apiClient.post('/bookings', data);
  }
  
  static async getBookings(params: BookingListParams): Promise<BookingListResponse> {
    return apiClient.get('/bookings', { params });
  }
  
  static async updateBooking(id: number, data: Partial<BookingData>): Promise<Booking> {
    return apiClient.put(`/bookings/${id}`, data);
  }
  
  static async cancelBooking(id: number, reason?: string): Promise<void> {
    return apiClient.delete(`/bookings/${id}`, { data: { reason } });
  }
}
```

## Form Validation

### Validation Schema
```typescript
const accommodationSchema = yup.object({
  name: yup.string().required('Name is required').max(100),
  code: yup.string().required('Code is required').max(20),
  accommodationType: yup.string().required('Type is required'),
  description: yup.string().required('Description is required'),
  location: yup.string().required('Location is required'),
  maxOccupancy: yup.number().required('Max occupancy is required').min(1).max(20),
  baseRate: yup.number().required('Base rate is required').min(0),
  weekendRate: yup.number().min(0),
  holidayRate: yup.number().min(0),
  rooms: yup.array().of(
    yup.object({
      roomTypeId: yup.number().required('Room type is required'),
      roomNumber: yup.string().required('Room number is required'),
      maxOccupancy: yup.number().required('Max occupancy is required').min(1),
      ratePerNight: yup.number().required('Rate is required').min(0)
    })
  ).min(1, 'At least one room is required')
});

const bookingSchema = yup.object({
  guestInfo: yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().required('Phone is required')
  }),
  checkInDate: yup.date().required('Check-in date is required').min(new Date(), 'Cannot book past dates'),
  checkOutDate: yup.date().required('Check-out date is required')
    .when('checkInDate', (checkInDate, schema) => 
      checkInDate ? schema.min(checkInDate, 'Check-out must be after check-in') : schema
    ),
  adults: yup.number().required('Number of adults is required').min(1),
  children: yup.number().min(0),
  roomIds: yup.array().min(1, 'At least one room must be selected')
});
```

## Testing Requirements

### Unit Tests
- [ ] Component rendering tests
- [ ] Form validation tests
- [ ] State management tests
- [ ] Utility function tests

### Integration Tests
- [ ] API integration tests
- [ ] Form submission tests
- [ ] Navigation flow tests
- [ ] State persistence tests

### E2E Tests
- [ ] Accommodation creation workflow
- [ ] Booking process end-to-end
- [ ] Guest booking journey
- [ ] Calendar functionality tests

## Performance Optimization

### Component Optimization
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Lazy load images and components
- Debounce search and filter inputs

### Data Management
- Implement proper caching strategies
- Use pagination for large datasets
- Optimize API calls with proper loading states
- Implement optimistic updates where appropriate

## Accessibility

### WCAG Compliance
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management

### Usability Features
- Clear error messages and validation
- Loading states and progress indicators
- Confirmation dialogs for destructive actions
- Helpful tooltips and guidance text

## Documentation Requirements

- [ ] Component API documentation
- [ ] User interaction guides
- [ ] Styling guide and examples
- [ ] State management documentation
- [ ] Integration testing guide
