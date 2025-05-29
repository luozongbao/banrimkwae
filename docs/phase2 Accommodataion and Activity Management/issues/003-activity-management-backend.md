# Issue #003: Activity Management System Backend

## Priority: High
## Estimated Duration: 7 days
## Dependencies: Issue #001 (Database Schema Design)

---

## Description
Develop the complete backend system for activity management including activity catalog, scheduling, booking management, and package deals. This system will handle all activity-related operations including CRUD operations, scheduling management, and guest activity bookings.

## Acceptance Criteria

### 1. Models and Relationships
- [x] `Activity` model with proper relationships
- [x] `ActivityCategory` model
- [x] `ActivitySchedule` model for time slot management
- [x] `ActivityBooking` model for guest reservations
- [x] `ActivityPackage` model for bundled deals
- [x] `PackageActivity` junction model
- [x] Eloquent relationships properly defined
- [x] Model validation rules implemented

### 2. Service Classes
- [x] `ActivityService` for business logic
- [x] `ActivityBookingService` for reservation management
- [x] `ActivityScheduleService` for scheduling management
- [x] `PackageService` for package management
- [x] `ActivityAvailabilityService` for availability calculations

### 3. API Controllers
- [x] `ActivityController` with full CRUD operations
- [x] `ActivityBookingController` for reservation management
- [x] `ActivityScheduleController` for schedule management
- [x] `ActivityPackageController` for package management
- [x] `ActivityCategoryController` for category management

### 4. API Endpoints
- [x] GET `/api/activities` - List activities with filtering
- [x] POST `/api/activities` - Create new activity
- [x] GET `/api/activities/{id}` - Get activity details
- [x] PUT `/api/activities/{id}` - Update activity
- [x] DELETE `/api/activities/{id}` - Delete activity
- [x] GET `/api/activities/{id}/schedule` - Get activity schedule
- [x] POST `/api/activities/{id}/schedule` - Create schedule slots
- [x] GET `/api/activities/calendar` - Get activity calendar view
- [x] POST `/api/activity-bookings` - Book activity
- [x] GET `/api/activity-bookings` - List bookings with filtering
- [x] PUT `/api/activity-bookings/{id}` - Update booking
- [x] DELETE `/api/activity-bookings/{id}` - Cancel booking
- [x] GET `/api/activity-packages` - List packages
- [x] POST `/api/activity-packages` - Create package
- [x] PUT `/api/activity-packages/{id}` - Update package
- [x] POST `/api/activity-packages/{id}/book` - Book package

### 5. Business Logic Implementation
- [x] Activity availability calculation
- [x] Schedule conflict prevention
- [x] Package pricing calculations
- [x] Participant limit enforcement
- [x] Age restriction validation

## Technical Implementation

### Model Structure

#### Activity Model
```php
class Activity extends Model
{
    protected $fillable = [
        'activity_category_id', 'name', 'description', 'type',
        'duration_hours', 'duration_minutes', 'max_participants',
        'min_age', 'difficulty_level', 'adult_price', 'child_price',
        'group_discount_percentage', 'equipment_provided',
        'equipment_list', 'requirements', 'images', 'status'
    ];

    protected $casts = [
        'equipment_provided' => 'boolean',
        'adult_price' => 'decimal:2',
        'child_price' => 'decimal:2',
        'group_discount_percentage' => 'decimal:2',
        'images' => 'array'
    ];

    // Relationships
    public function category()
    public function schedules()
    public function bookings()
    public function packages()
    
    // Scopes
    public function scopeActive()
    public function scopeByType()
    public function scopeByCategory()
    public function scopeAvailableToday()
    
    // Methods
    public function getTotalDuration()
    public function isFree()
    public function isPaid()
    public function getAvailableSlots($date)
    public function calculatePrice($adults, $children)
}
```

#### ActivitySchedule Model
```php
class ActivitySchedule extends Model
{
    protected $fillable = [
        'activity_id', 'day_of_week', 'start_time', 'end_time',
        'max_participants', 'is_active'
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_active' => 'boolean'
    ];

    // Relationships
    public function activity()
    public function bookings()
    
    // Methods
    public function getAvailableSpots($date)
    public function isFullyBooked($date)
    public function canAccommodate($participants)
    public function getBookingCount($date)
}
```

#### ActivityBooking Model
```php
class ActivityBooking extends Model
{
    protected $fillable = [
        'activity_id', 'activity_schedule_id', 'guest_id',
        'booking_date', 'adults', 'children', 'total_participants',
        'total_amount', 'payment_status', 'booking_status',
        'special_requests', 'package_booking_id'
    ];

    protected $casts = [
        'booking_date' => 'date',
        'total_amount' => 'decimal:2'
    ];

    // Relationships
    public function activity()
    public function schedule()
    public function guest()
    public function packageBooking()
    
    // Scopes
    public function scopeUpcoming()
    public function scopeToday()
    public function scopeActive()
    
    // Methods
    public function canCancel()
    public function calculateRefund()
    public function isPackageBooking()
}
```

#### ActivityPackage Model
```php
class ActivityPackage extends Model
{
    protected $fillable = [
        'name', 'description', 'duration_days', 'package_price',
        'regular_price', 'savings_amount', 'max_bookings_per_day',
        'advance_booking_days', 'cancellation_hours',
        'allow_partial_booking', 'require_consecutive_days',
        'valid_from', 'valid_to', 'status'
    ];

    protected $casts = [
        'package_price' => 'decimal:2',
        'regular_price' => 'decimal:2',
        'savings_amount' => 'decimal:2',
        'allow_partial_booking' => 'boolean',
        'require_consecutive_days' => 'boolean',
        'valid_from' => 'date',
        'valid_to' => 'date'
    ];

    // Relationships
    public function activities()
    public function bookings()
    
    // Methods
    public function calculateSavings()
    public function isValid($date)
    public function getIncludedActivities()
    public function canBookPartially()
}
```

### Service Classes

#### ActivityService
```php
class ActivityService
{
    public function createActivity(array $data)
    public function updateActivity(Activity $activity, array $data)
    public function deleteActivity(Activity $activity)
    public function getActivitiesByCategory($categoryId)
    public function getActivitiesByType($type)
    public function searchActivities($query, $filters = [])
    public function uploadActivityImages(Activity $activity, array $images)
    public function duplicateActivity(Activity $activity, array $modifications = [])
}
```

#### ActivityScheduleService
```php
class ActivityScheduleService
{
    public function createSchedule(Activity $activity, array $scheduleData)
    public function updateSchedule(ActivitySchedule $schedule, array $data)
    public function deleteSchedule(ActivitySchedule $schedule)
    public function getWeeklySchedule(Activity $activity)
    public function createRecurringSchedule(Activity $activity, array $pattern)
    public function getConflictingSchedules(Activity $activity, $startTime, $endTime, $dayOfWeek)
    public function getAvailableTimeSlots(Activity $activity, $date)
}
```

#### ActivityBookingService
```php
class ActivityBookingService
{
    public function bookActivity(array $bookingData)
    public function cancelBooking(ActivityBooking $booking, $reason = null)
    public function updateBooking(ActivityBooking $booking, array $data)
    public function checkAvailability(Activity $activity, $date, $scheduleId, $participants)
    public function calculateBookingTotal(Activity $activity, $adults, $children)
    public function sendBookingConfirmation(ActivityBooking $booking)
    public function processRefund(ActivityBooking $booking)
    public function getGuestBookingHistory($guestId)
}
```

#### PackageService
```php
class PackageService
{
    public function createPackage(array $packageData)
    public function updatePackage(ActivityPackage $package, array $data)
    public function addActivitiesToPackage(ActivityPackage $package, array $activityIds)
    public function removeActivityFromPackage(ActivityPackage $package, $activityId)
    public function bookPackage(array $bookingData)
    public function calculatePackagePrice(ActivityPackage $package)
    public function getAvailablePackages($date)
    public function validatePackageBooking(ActivityPackage $package, $startDate, $participants)
}
```

### API Controller Implementation

#### ActivityController
```php
class ActivityController extends Controller
{
    public function index(Request $request)
    {
        // List activities with filtering
        // Filters: category, type, difficulty, price range, availability
        // Include schedule information and availability
    }

    public function store(ActivityRequest $request)
    {
        // Create new activity with validation
        // Handle image uploads
        // Create default schedules if provided
    }

    public function show(Activity $activity)
    {
        // Return activity with schedules and availability
        // Include pricing information
        // Return booking statistics
    }

    public function update(ActivityRequest $request, Activity $activity)
    {
        // Update activity details
        // Handle image updates
        // Update schedules if provided
    }

    public function destroy(Activity $activity)
    {
        // Soft delete activity
        // Check for active bookings
        // Handle schedule cleanup
    }

    public function schedule(Request $request, Activity $activity)
    {
        // Return activity schedules with availability
        // Filter by date range if provided
        // Include booking counts
    }

    public function calendar(Request $request)
    {
        // Return calendar view of all activities
        // Group by date and time
        // Include booking status
    }
}
```

#### ActivityBookingController
```php
class ActivityBookingController extends Controller
{
    public function index(Request $request)
    {
        // List activity bookings with filtering
        // Filters: date range, activity, guest, status
        // Include guest and activity information
    }

    public function store(ActivityBookingRequest $request)
    {
        // Create new activity booking
        // Validate availability and participants
        // Calculate pricing and create booking
    }

    public function show(ActivityBooking $booking)
    {
        // Return booking details with activity and guest info
        // Include cancellation policies
        // Return payment information
    }

    public function update(ActivityBookingRequest $request, ActivityBooking $booking)
    {
        // Update booking details
        // Validate changes against availability
        // Recalculate pricing if needed
    }

    public function destroy(ActivityBooking $booking)
    {
        // Cancel booking with proper validation
        // Calculate refund amount
        // Send cancellation notification
    }

    public function checkAvailability(Request $request)
    {
        // Check activity availability for specific date/time
        // Return available spots and pricing
        // Include alternative suggestions
    }
}
```

### Request Validation

#### ActivityRequest
```php
class ActivityRequest extends FormRequest
{
    public function rules()
    {
        return [
            'name' => 'required|string|max:100',
            'activity_category_id' => 'required|exists:activity_categories,id',
            'description' => 'required|string',
            'type' => 'required|in:free,paid',
            'duration_hours' => 'required|integer|min:0|max:23',
            'duration_minutes' => 'required|integer|min:0|max:59',
            'max_participants' => 'required|integer|min:1|max:50',
            'min_age' => 'nullable|integer|min:0|max:100',
            'difficulty_level' => 'required|in:easy,medium,hard',
            'adult_price' => 'required_if:type,paid|nullable|numeric|min:0',
            'child_price' => 'nullable|numeric|min:0',
            'group_discount_percentage' => 'nullable|numeric|min:0|max:100',
            'equipment_provided' => 'boolean',
            'equipment_list' => 'nullable|string',
            'requirements' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'schedules' => 'nullable|array',
            'schedules.*.day_of_week' => 'required_with:schedules|integer|min:0|max:6',
            'schedules.*.start_time' => 'required_with:schedules|date_format:H:i',
            'schedules.*.end_time' => 'required_with:schedules|date_format:H:i|after:schedules.*.start_time',
            'schedules.*.max_participants' => 'required_with:schedules|integer|min:1'
        ];
    }
}
```

#### ActivityBookingRequest
```php
class ActivityBookingRequest extends FormRequest
{
    public function rules()
    {
        return [
            'activity_id' => 'required|exists:activities,id',
            'activity_schedule_id' => 'required|exists:activity_schedules,id',
            'guest_id' => 'nullable|exists:guests,id',
            'guest.first_name' => 'required_without:guest_id|string|max:50',
            'guest.last_name' => 'required_without:guest_id|string|max:50',
            'guest.email' => 'required_without:guest_id|email|max:100',
            'guest.phone' => 'required_without:guest_id|string|max:20',
            'booking_date' => 'required|date|after_or_equal:today',
            'adults' => 'required|integer|min:1|max:20',
            'children' => 'nullable|integer|min:0|max:10',
            'special_requests' => 'nullable|string|max:500'
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $this->validateActivityAvailability($validator);
            $this->validateParticipantLimits($validator);
            $this->validateAgeRequirements($validator);
        });
    }
}
```

## Testing Requirements

### Unit Tests
- [ ] Activity model tests
- [ ] Schedule management tests
- [ ] Booking validation tests
- [ ] Package calculation tests
- [ ] Availability algorithm tests

### Feature Tests
- [ ] Activity CRUD API tests
- [ ] Booking flow tests
- [ ] Package booking tests
- [ ] Schedule conflict tests
- [ ] Availability checking tests

### Integration Tests
- [ ] Guest booking journey tests
- [ ] Package booking workflow tests
- [ ] Schedule and availability integration tests
- [ ] Payment integration tests

## Performance Optimization

### Database Optimization
- Index activity search fields
- Optimize availability queries
- Use database views for complex reporting
- Implement query result caching

### Caching Strategy
- Cache activity listings (30 minutes TTL)
- Cache schedule data (1 hour TTL)
- Cache availability calculations (15 minutes TTL)
- Cache package information (1 hour TTL)

### API Optimization
- Implement pagination for activity listings
- Use field selection for API responses
- Optimize query loading with relationships
- Implement API response caching

## Business Logic Requirements

### Availability Calculations
1. Check schedule exists for requested date/time
2. Verify participant limits not exceeded
3. Check age requirements met
4. Validate advance booking requirements
5. Handle package booking conflicts

### Pricing Calculations
1. Base adult/child pricing
2. Group discount applications
3. Package pricing with savings
4. Seasonal pricing adjustments
5. Special promotion handling

### Booking Validations
1. Activity must be active
2. Schedule must be available
3. Participant limits respected
4. Age requirements met
5. Advance booking time met
6. No scheduling conflicts

## Integration Points

### Guest Management Integration
- Link activity bookings to guest profiles
- Track guest activity history
- Implement guest preferences

### Billing System Integration (Phase 3)
- Record activity charges for guest bills
- Handle package deal billing
- Track payment status for activities

### Notification System
- Booking confirmation emails
- Reminder notifications
- Cancellation notifications
- Schedule change alerts

## Documentation Requirements

- [ ] API documentation with examples
- [ ] Activity management workflows
- [ ] Booking process documentation
- [ ] Package creation guidelines
- [ ] Integration specifications
