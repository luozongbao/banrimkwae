# Issue #005: Activity Management Frontend Components

## Priority: High
## Estimated Duration: 9 days
## Dependencies: Issue #003 (Activity Management Backend), Phase 1 Frontend Framework

---

## Description
Develop the complete frontend interface for activity management including activity dashboard, scheduling interface, booking management, package creation, and guest activity booking interface. This system will provide intuitive interfaces for staff to manage activities and for guests to book activities.

## Acceptance Criteria

### 1. Activity Dashboard
- [x] Activity listing with filtering and search
- [x] Quick stats display (Free, Paid, Packages, Active Today)
- [x] Activity status indicators
- [x] Today's schedule overview
- [x] Calendar view integration
- [x] Responsive design for mobile/tablet

### 2. Activity Management
- [x] Add/Edit activity form with validation
- [x] Image upload and management
- [x] Schedule configuration interface
- [x] Equipment and requirements management
- [x] Pricing configuration for paid activities
- [x] Category and difficulty level selection

### 3. Package Management
- [x] Package creation interface
- [x] Activity selection for packages
- [x] Pricing and discount calculations
- [x] Package booking settings
- [x] Package availability management

### 4. Booking Management
- [x] Activity booking interface
- [x] Schedule selection with availability
- [x] Participant management
- [x] Group booking functionality
- [x] Payment processing integration

### 5. Guest Interface
- [x] Activity browsing with categories
- [x] Package deals display
- [x] Real-time availability checking
- [x] Booking form with validation
- [x] Activity calendar view

## Component Structure

### Dashboard Components

#### ActivityDashboard.tsx
```typescript
interface ActivityDashboardProps {
  onViewChange: (view: 'list' | 'calendar' | 'schedule') => void;
  currentView: 'list' | 'calendar' | 'schedule';
}

const ActivityDashboard: React.FC<ActivityDashboardProps> = ({
  onViewChange,
  currentView
}) => {
  // Quick stats display
  // Filter and search functionality
  // View toggle (list/calendar/schedule)
  // Action buttons (Add Activity, Create Package, Reports)
  
  return (
    <div className="activity-dashboard">
      <DashboardHeader />
      <QuickStats />
      <TodaysSchedule />
      <FilterBar />
      {renderCurrentView()}
    </div>
  );
};
```

#### ActivityQuickStats.tsx
```typescript
interface ActivityStats {
  freeActivities: number;
  paidActivities: number;
  packages: number;
  activeToday: number;
  totalParticipants: number;
  revenue: number;
}

const ActivityQuickStats: React.FC = () => {
  const [stats, setStats] = useState<ActivityStats>();
  
  // Fetch activity statistics
  // Display cards with icons and values
  // Show trends and comparisons
  
  return (
    <div className="activity-quick-stats">
      <div className="stats-grid">
        <StatCard
          title="Free Activities"
          value={stats?.freeActivities}
          icon="🚣"
          color="green"
        />
        <StatCard
          title="Paid Activities"
          value={stats?.paidActivities}
          icon="💰"
          color="blue"
        />
        <StatCard
          title="Packages"
          value={stats?.packages}
          icon="📦"
          color="purple"
        />
        <StatCard
          title="Active Today"
          value={stats?.activeToday}
          icon="🎯"
          color="orange"
        />
      </div>
    </div>
  );
};
```

### Activity Management Components

#### ActivityForm.tsx
```typescript
interface ActivityFormProps {
  activity?: Activity;
  onSubmit: (data: ActivityFormData) => void;
  onCancel: () => void;
}

interface ActivityFormData {
  name: string;
  categoryId: number;
  description: string;
  type: 'free' | 'paid';
  durationHours: number;
  durationMinutes: number;
  maxParticipants: number;
  minAge?: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  adultPrice?: number;
  childPrice?: number;
  groupDiscountPercentage?: number;
  equipmentProvided: boolean;
  equipmentList?: string;
  requirements?: string;
  images: File[];
  schedules: ActivityScheduleData[];
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  activity,
  onSubmit,
  onCancel
}) => {
  // Form state management with validation
  // Schedule configuration
  // Pricing management for paid activities
  // Equipment and requirements handling
  
  return (
    <form onSubmit={handleSubmit} className="activity-form">
      <BasicInformation />
      <ActivityDetails />
      <PricingSection />
      <RequirementsEquipment />
      <ScheduleConfiguration />
      <ImageUpload />
      <FormActions />
    </form>
  );
};
```

#### ScheduleConfiguration.tsx
```typescript
interface ActivityScheduleData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxParticipants: number;
}

const ScheduleConfiguration: React.FC<{
  schedules: ActivityScheduleData[];
  onChange: (schedules: ActivityScheduleData[]) => void;
}> = ({ schedules, onChange }) => {
  // Weekly schedule configuration
  // Time slot management
  // Participant limits per slot
  // Conflict detection
  
  return (
    <div className="schedule-configuration">
      <h3>Weekly Schedule</h3>
      <div className="schedule-grid">
        {DAYS_OF_WEEK.map(day => (
          <DaySchedule
            key={day.value}
            day={day}
            schedules={schedules.filter(s => s.dayOfWeek === day.value)}
            onUpdate={(daySchedules) => updateDaySchedules(day.value, daySchedules)}
          />
        ))}
      </div>
      <Button onClick={addTimeSlot}>Add Time Slot</Button>
    </div>
  );
};
```

### Package Management Components

#### PackageForm.tsx
```typescript
interface PackageFormProps {
  package?: ActivityPackage;
  onSubmit: (data: PackageFormData) => void;
  onCancel: () => void;
}

interface PackageFormData {
  name: string;
  description: string;
  durationDays: number;
  packagePrice: number;
  validFrom: Date;
  validTo: Date;
  maxBookingsPerDay: number;
  advanceBookingDays: number;
  cancellationHours: number;
  allowPartialBooking: boolean;
  requireConsecutiveDays: boolean;
  includedActivities: PackageActivityData[];
}

const PackageForm: React.FC<PackageFormProps> = ({
  package: packageData,
  onSubmit,
  onCancel
}) => {
  // Package information management
  // Activity selection and scheduling
  // Pricing calculations with savings display
  // Booking rules configuration
  
  return (
    <form onSubmit={handleSubmit} className="package-form">
      <PackageInformation />
      <IncludedActivities />
      <PricingCalculation />
      <BookingSettings />
      <FormActions />
    </form>
  );
};
```

#### ActivitySelector.tsx
```typescript
const ActivitySelector: React.FC<{
  selectedActivities: PackageActivityData[];
  onSelectionChange: (activities: PackageActivityData[]) => void;
}> = ({ selectedActivities, onSelectionChange }) => {
  // Available activities list
  // Search and filter functionality
  // Day and time assignment
  // Price calculation display
  
  return (
    <div className="activity-selector">
      <div className="available-activities">
        <SearchFilter />
        <ActivityList
          activities={availableActivities}
          onSelect={handleActivitySelect}
        />
      </div>
      <div className="selected-activities">
        <h4>Package Activities</h4>
        {selectedActivities.map(activity => (
          <SelectedActivityItem
            key={activity.id}
            activity={activity}
            onUpdate={updateActivity}
            onRemove={removeActivity}
          />
        ))}
      </div>
    </div>
  );
};
```

### Booking Management Components

#### ActivityBookingForm.tsx
```typescript
interface ActivityBookingFormProps {
  activityId?: number;
  packageId?: number;
  onSubmit: (booking: ActivityBookingData) => void;
  onCancel: () => void;
}

interface ActivityBookingData {
  activityId?: number;
  packageId?: number;
  scheduleId?: number;
  guestInfo: GuestInfo;
  bookingDate: Date;
  adults: number;
  children: number;
  specialRequests?: string;
}

const ActivityBookingForm: React.FC<ActivityBookingFormProps> = ({
  activityId,
  packageId,
  onSubmit,
  onCancel
}) => {
  // Guest information handling
  // Date and time selection
  // Participant count management
  // Availability checking
  // Price calculation and display
  
  return (
    <div className="activity-booking-form">
      <GuestInformation />
      <ActivitySelection />
      <ScheduleSelection />
      <ParticipantSelection />
      <BookingSummary />
      <FormActions />
    </div>
  );
};
```

#### ScheduleSelection.tsx
```typescript
const ScheduleSelection: React.FC<{
  activityId: number;
  selectedDate: Date;
  onScheduleSelect: (scheduleId: number) => void;
}> = ({ activityId, selectedDate, onScheduleSelect }) => {
  // Available time slots for selected date
  // Participant availability display
  // Price per slot display
  // Conflict indicators
  
  return (
    <div className="schedule-selection">
      <h3>Available Time Slots</h3>
      <div className="time-slots">
        {availableSlots.map(slot => (
          <TimeSlotCard
            key={slot.id}
            slot={slot}
            onSelect={() => onScheduleSelect(slot.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

### Guest Interface Components

#### GuestActivityBrowser.tsx
```typescript
const GuestActivityBrowser: React.FC = () => {
  // Category filtering
  // Featured packages display
  // Activity cards with pricing
  // Search functionality
  // Booking initiation
  
  return (
    <div className="guest-activity-browser">
      <FeaturedPackages />
      <CategoryFilter />
      <ActivityGrid />
      <MyBookings />
    </div>
  );
};
```

#### ActivityCard.tsx
```typescript
interface ActivityCardProps {
  activity: Activity;
  onBook: (activityId: number) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onBook }) => {
  // Activity image display
  // Name and description
  // Duration and difficulty
  // Price display (free/paid)
  // Available time slots
  // Book now button
  
  return (
    <div className="activity-card">
      <ActivityImage src={activity.images?.[0]} alt={activity.name} />
      <CardContent>
        <Title>{activity.name}</Title>
        <Duration>{formatDuration(activity.durationHours, activity.durationMinutes)}</Duration>
        <Difficulty level={activity.difficultyLevel} />
        <Price activity={activity} />
        <AvailableSlots activityId={activity.id} />
        <BookButton onClick={() => onBook(activity.id)} />
      </CardContent>
    </div>
  );
};
```

#### PackageCard.tsx
```typescript
interface PackageCardProps {
  package: ActivityPackage;
  onBook: (packageId: number) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ package: packageData, onBook }) => {
  // Package name and description
  // Included activities list
  // Savings display
  // Duration and validity
  // Book package button
  
  return (
    <div className="package-card featured">
      <PackageHeader>
        <Title>{packageData.name}</Title>
        <Savings amount={packageData.savingsAmount} />
      </PackageHeader>
      <IncludedActivitiesList activities={packageData.activities} />
      <PackageDetails>
        <Duration>{packageData.durationDays} days</Duration>
        <Price>{packageData.packagePrice} THB</Price>
      </PackageDetails>
      <BookButton onClick={() => onBook(packageData.id)} />
    </div>
  );
};
```

### Calendar Components

#### ActivityCalendar.tsx
```typescript
const ActivityCalendar: React.FC = () => {
  // Monthly/weekly view toggle
  // Activity schedule display
  // Booking status indicators
  // Quick booking actions
  // Schedule conflict highlighting
  
  return (
    <div className="activity-calendar">
      <CalendarHeader />
      <CalendarGrid />
      <CalendarLegend />
    </div>
  );
};
```

#### DailyActivitySchedule.tsx
```typescript
const DailyActivitySchedule: React.FC<{
  date: Date;
  activities: Activity[];
}> = ({ date, activities }) => {
  // Time-based schedule display
  // Activity sessions with participant counts
  // Staff assignments
  // Equipment requirements
  // Real-time updates
  
  return (
    <div className="daily-activity-schedule">
      <ScheduleHeader date={date} />
      <TimelineView>
        {timeSlots.map(slot => (
          <TimeSlot key={slot.time} time={slot.time}>
            {slot.activities.map(activity => (
              <ActivitySession
                key={activity.id}
                activity={activity}
                participantCount={activity.bookingCount}
                maxParticipants={activity.maxParticipants}
              />
            ))}
          </TimeSlot>
        ))}
      </TimelineView>
    </div>
  );
};
```

## State Management

### Redux Store Structure
```typescript
interface ActivityState {
  activities: {
    items: Activity[];
    loading: boolean;
    error: string | null;
    filters: ActivityFilters;
    categories: ActivityCategory[];
  };
  packages: {
    items: ActivityPackage[];
    loading: boolean;
    error: string | null;
  };
  bookings: {
    items: ActivityBooking[];
    loading: boolean;
    error: string | null;
    currentBooking: ActivityBookingData | null;
  };
  schedule: {
    dailySchedule: DailySchedule[];
    loading: boolean;
    error: string | null;
  };
  ui: {
    currentView: 'list' | 'calendar' | 'schedule';
    selectedActivity: number | null;
    modalStates: ActivityModalStates;
  };
}
```

### Actions and Thunks
```typescript
// Activity actions
export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (params: ActivityListParams) => {
    return ActivityService.getActivities(params);
  }
);

export const createActivity = createAsyncThunk(
  'activities/createActivity',
  async (data: ActivityFormData) => {
    return ActivityService.createActivity(data);
  }
);

// Package actions
export const createPackage = createAsyncThunk(
  'packages/createPackage',
  async (data: PackageFormData) => {
    return PackageService.createPackage(data);
  }
);

// Booking actions
export const bookActivity = createAsyncThunk(
  'bookings/bookActivity',
  async (data: ActivityBookingData) => {
    return ActivityBookingService.bookActivity(data);
  }
);

export const checkActivityAvailability = createAsyncThunk(
  'activities/checkAvailability',
  async (params: ActivityAvailabilityParams) => {
    return ActivityService.checkAvailability(params);
  }
);
```

## Styling and Design

### Component Styles
```scss
// Activity dashboard styles
.activity-dashboard {
  .quick-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    
    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .todays-schedule {
    background: var(--color-surface);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    
    .schedule-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-sm);
      border-bottom: 1px solid var(--color-border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .time {
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary);
        min-width: 80px;
      }
      
      .activity-name {
        flex: 1;
        margin-left: var(--spacing-md);
      }
      
      .participant-count {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
      }
    }
  }
}

// Activity form styles
.activity-form {
  .schedule-configuration {
    .schedule-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      
      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }
    
    .day-schedule {
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-sm);
      
      .day-header {
        font-weight: var(--font-weight-semibold);
        text-align: center;
        margin-bottom: var(--spacing-sm);
        color: var(--color-text-primary);
      }
      
      .time-slot {
        background: var(--color-background);
        border-radius: var(--border-radius-sm);
        padding: var(--spacing-xs);
        margin-bottom: var(--spacing-xs);
        font-size: var(--font-size-sm);
      }
    }
  }
}

// Guest activity browser styles
.guest-activity-browser {
  .featured-packages {
    margin-bottom: var(--spacing-xl);
    
    .package-card {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: white;
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: url('pattern.svg') repeat;
        opacity: 0.1;
        transform: rotate(45deg);
      }
      
      .savings-badge {
        position: absolute;
        top: var(--spacing-md);
        right: var(--spacing-md);
        background: var(--color-accent);
        color: white;
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--border-radius-full);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
      }
    }
  }
  
  .activity-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-lg);
    
    .activity-card {
      background: var(--color-surface);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
      
      .activity-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }
      
      .card-content {
        padding: var(--spacing-md);
        
        .activity-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          margin-bottom: var(--spacing-sm);
          color: var(--color-text-primary);
        }
        
        .activity-meta {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
          
          .duration, .difficulty {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: var(--font-size-sm);
            color: var(--color-text-secondary);
          }
        }
        
        .price-display {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
          margin-bottom: var(--spacing-md);
          
          &.free {
            color: var(--color-success);
          }
        }
        
        .available-slots {
          margin-bottom: var(--spacing-md);
          
          .slot-chip {
            display: inline-block;
            background: var(--color-background);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-full);
            padding: var(--spacing-xs) var(--spacing-sm);
            margin: 0 var(--spacing-xs) var(--spacing-xs) 0;
            font-size: var(--font-size-sm);
            
            &.available {
              background: var(--color-success-light);
              border-color: var(--color-success);
              color: var(--color-success-dark);
            }
            
            &.limited {
              background: var(--color-warning-light);
              border-color: var(--color-warning);
              color: var(--color-warning-dark);
            }
            
            &.full {
              background: var(--color-error-light);
              border-color: var(--color-error);
              color: var(--color-error-dark);
            }
          }
        }
      }
    }
  }
}
```

## API Integration

### Service Layer
```typescript
class ActivityService {
  static async getActivities(params: ActivityListParams): Promise<ActivityListResponse> {
    return apiClient.get('/activities', { params });
  }
  
  static async createActivity(data: ActivityFormData): Promise<Activity> {
    const formData = new FormData();
    // Handle file uploads and form data
    return apiClient.post('/activities', formData);
  }
  
  static async updateActivity(id: number, data: ActivityFormData): Promise<Activity> {
    return apiClient.put(`/activities/${id}`, data);
  }
  
  static async deleteActivity(id: number): Promise<void> {
    return apiClient.delete(`/activities/${id}`);
  }
  
  static async getActivitySchedule(id: number, params?: ScheduleParams): Promise<ActivitySchedule[]> {
    return apiClient.get(`/activities/${id}/schedule`, { params });
  }
  
  static async checkAvailability(params: ActivityAvailabilityParams): Promise<AvailabilityResponse> {
    return apiClient.get('/activities/availability', { params });
  }
}

class ActivityBookingService {
  static async bookActivity(data: ActivityBookingData): Promise<ActivityBooking> {
    return apiClient.post('/activity-bookings', data);
  }
  
  static async getBookings(params: BookingListParams): Promise<BookingListResponse> {
    return apiClient.get('/activity-bookings', { params });
  }
  
  static async cancelBooking(id: number, reason?: string): Promise<void> {
    return apiClient.delete(`/activity-bookings/${id}`, { data: { reason } });
  }
}

class PackageService {
  static async getPackages(params?: PackageListParams): Promise<PackageListResponse> {
    return apiClient.get('/activity-packages', { params });
  }
  
  static async createPackage(data: PackageFormData): Promise<ActivityPackage> {
    return apiClient.post('/activity-packages', data);
  }
  
  static async bookPackage(id: number, data: PackageBookingData): Promise<PackageBooking> {
    return apiClient.post(`/activity-packages/${id}/book`, data);
  }
}
```

## Form Validation

### Validation Schemas
```typescript
const activitySchema = yup.object({
  name: yup.string().required('Activity name is required').max(100),
  categoryId: yup.number().required('Category is required'),
  description: yup.string().required('Description is required'),
  type: yup.string().oneOf(['free', 'paid']).required('Type is required'),
  durationHours: yup.number().min(0).max(23).required('Duration hours is required'),
  durationMinutes: yup.number().min(0).max(59).required('Duration minutes is required'),
  maxParticipants: yup.number().min(1).max(50).required('Max participants is required'),
  minAge: yup.number().min(0).max(100),
  difficultyLevel: yup.string().oneOf(['easy', 'medium', 'hard']).required('Difficulty is required'),
  adultPrice: yup.number().when('type', {
    is: 'paid',
    then: (schema) => schema.required('Adult price is required for paid activities').min(0),
    otherwise: (schema) => schema.nullable()
  }),
  childPrice: yup.number().min(0),
  schedules: yup.array().of(
    yup.object({
      dayOfWeek: yup.number().min(0).max(6).required(),
      startTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      endTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      maxParticipants: yup.number().min(1).required()
    })
  ).min(1, 'At least one schedule is required')
});

const packageSchema = yup.object({
  name: yup.string().required('Package name is required').max(100),
  description: yup.string().required('Description is required'),
  durationDays: yup.number().min(1).max(30).required('Duration is required'),
  packagePrice: yup.number().min(0).required('Package price is required'),
  validFrom: yup.date().required('Valid from date is required'),
  validTo: yup.date().required('Valid to date is required')
    .when('validFrom', (validFrom, schema) => 
      validFrom ? schema.min(validFrom, 'Valid to must be after valid from') : schema
    ),
  maxBookingsPerDay: yup.number().min(1).required('Max bookings per day is required'),
  includedActivities: yup.array().min(1, 'At least one activity must be included')
});

const activityBookingSchema = yup.object({
  activityId: yup.number().required('Activity is required'),
  scheduleId: yup.number().required('Schedule is required'),
  bookingDate: yup.date().required('Booking date is required')
    .min(new Date(), 'Cannot book for past dates'),
  adults: yup.number().min(1).required('At least one adult is required'),
  children: yup.number().min(0),
  guestInfo: yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string().required('Phone is required')
  })
});
```

## Testing Requirements

### Unit Tests
- [ ] Component rendering and props tests
- [ ] Form validation logic tests
- [ ] State management tests
- [ ] Utility function tests
- [ ] Availability calculation tests

### Integration Tests
- [ ] API service integration tests
- [ ] Form submission workflows
- [ ] Booking process tests
- [ ] Package creation tests

### E2E Tests
- [ ] Activity creation workflow
- [ ] Package creation and booking
- [ ] Guest activity booking journey
- [ ] Schedule management tests

## Performance Optimization

### Component Performance
- Implement React.memo for expensive re-renders
- Use useCallback for event handlers
- Implement virtual scrolling for activity lists
- Lazy load activity images

### Data Management
- Cache activity data with appropriate TTL
- Implement optimistic updates for bookings
- Use pagination for large activity lists
- Debounce search and filter inputs

## Accessibility

### WCAG Compliance
- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

### Usability Features
- Clear form validation messages
- Loading states and progress indicators
- Confirmation dialogs for bookings
- Helpful tooltips and guidance

## Documentation Requirements

- [ ] Component API documentation
- [ ] Activity management workflows
- [ ] Package creation guidelines
- [ ] Guest booking process guide
- [ ] Integration testing procedures
