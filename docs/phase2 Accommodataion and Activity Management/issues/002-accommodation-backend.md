# Issue #002: Accommodation Management System Backend

## Priority: High
## Estimated Duration: 8 days
## Dependencies: Issue #001 (Database Schema Design)

---

## Description
Develop the complete backend system for accommodation management including models, controllers, services, and API endpoints. This system will handle all accommodation-related operations including CRUD operations, availability checking, and booking management.

## Acceptance Criteria

### 1. Models and Relationships
- [x] `Accommodation` model with proper relationships
- [x] `AccommodationType` model
- [x] `Room` model with accommodation relationship
- [x] `RoomType` model
- [x] `Booking` model with complex relationships
- [x] `Guest` model with booking history
- [x] Eloquent relationships properly defined
- [x] Model validation rules implemented

### 2. Service Classes
- [x] `AccommodationService` for business logic
- [x] `BookingService` for reservation management
- [x] `AvailabilityService` for availability calculations
- [x] `PricingService` for rate calculations
- [x] `ValidationService` for business rule validation

### 3. API Controllers
- [x] `AccommodationController` with full CRUD operations
- [x] `BookingController` for reservation management
- [x] `AvailabilityController` for availability queries
- [x] `RoomController` for room management
- [x] `GuestController` for guest management

### 4. API Endpoints
- [x] GET `/api/accommodations` - List accommodations with filtering
- [x] POST `/api/accommodations` - Create new accommodation
- [x] GET `/api/accommodations/{id}` - Get accommodation details
- [x] PUT `/api/accommodations/{id}` - Update accommodation
- [x] DELETE `/api/accommodations/{id}` - Delete accommodation
- [x] GET `/api/accommodations/{id}/availability` - Check availability
- [x] GET `/api/accommodations/{id}/rooms` - Get accommodation rooms
- [x] POST `/api/bookings` - Create booking
- [x] GET `/api/bookings` - List bookings with filtering
- [x] GET `/api/bookings/{id}` - Get booking details
- [x] PUT `/api/bookings/{id}` - Update booking
- [x] DELETE `/api/bookings/{id}` - Cancel booking
- [x] POST `/api/bookings/{id}/checkin` - Check-in process
- [x] POST `/api/bookings/{id}/checkout` - Check-out process

### 5. Business Logic Implementation
- [x] Availability calculation algorithms
- [x] Booking conflict prevention
- [x] Dynamic pricing based on dates and seasons
- [x] Room assignment optimization
- [x] Booking validation and verification

## Technical Implementation

### Model Structure

#### Accommodation Model
```php
class Accommodation extends Model
{
    protected $fillable = [
        'accommodation_type_id', 'name', 'code', 'description',
        'location', 'max_occupancy', 'base_rate', 'weekend_rate',
        'holiday_rate', 'amenities', 'images', 'status'
    ];

    protected $casts = [
        'amenities' => 'array',
        'images' => 'array',
        'base_rate' => 'decimal:2',
        'weekend_rate' => 'decimal:2',
        'holiday_rate' => 'decimal:2'
    ];

    // Relationships
    public function accommodationType()
    public function rooms()
    public function bookings()
    public function activeBookings()
    
    // Scopes
    public function scopeAvailable()
    public function scopeByType()
    public function scopeActive()
    
    // Methods
    public function isAvailable($checkIn, $checkOut)
    public function getAvailableRooms($checkIn, $checkOut)
    public function calculateRate($checkIn, $checkOut)
}
```

#### Booking Model
```php
class Booking extends Model
{
    protected $fillable = [
        'guest_id', 'accommodation_id', 'check_in_date',
        'check_out_date', 'check_in_time', 'check_out_time',
        'adults', 'children', 'infants', 'total_amount',
        'deposit_amount', 'payment_status', 'booking_status',
        'special_requests'
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'check_in_time' => 'datetime:H:i',
        'check_out_time' => 'datetime:H:i',
        'total_amount' => 'decimal:2',
        'deposit_amount' => 'decimal:2'
    ];

    // Relationships
    public function guest()
    public function accommodation()
    public function rooms()
    public function charges()
    
    // Scopes
    public function scopeActive()
    public function scopeCurrentStay()
    public function scopeUpcoming()
    
    // Methods
    public function getNights()
    public function getTotalGuests()
    public function canCheckIn()
    public function canCheckOut()
    public function calculateTotal()
}
```

### Service Classes

#### AccommodationService
```php
class AccommodationService
{
    public function getAvailableAccommodations($checkIn, $checkOut, $guests)
    public function createAccommodation(array $data)
    public function updateAccommodation(Accommodation $accommodation, array $data)
    public function deleteAccommodation(Accommodation $accommodation)
    public function getAccommodationWithRooms(int $accommodationId)
    public function uploadAccommodationImages(Accommodation $accommodation, array $images)
    public function updateRoomConfiguration(Accommodation $accommodation, array $rooms)
}
```

#### BookingService
```php
class BookingService
{
    public function createBooking(array $bookingData)
    public function updateBooking(Booking $booking, array $data)
    public function cancelBooking(Booking $booking, string $reason = null)
    public function checkInGuest(Booking $booking)
    public function checkOutGuest(Booking $booking)
    public function validateBookingDates($checkIn, $checkOut, $accommodationId)
    public function assignRooms(Booking $booking, array $roomIds)
    public function calculateBookingTotal(Booking $booking)
    public function sendBookingConfirmation(Booking $booking)
}
```

#### AvailabilityService
```php
class AvailabilityService
{
    public function checkAccommodationAvailability($accommodationId, $checkIn, $checkOut)
    public function getAvailableRooms($accommodationId, $checkIn, $checkOut)
    public function checkRoomAvailability($roomId, $checkIn, $checkOut)
    public function getOccupancyCalendar($accommodationId, $month, $year)
    public function getAvailabilityStats($dateRange)
    public function findAlternativeAccommodations($checkIn, $checkOut, $guests)
}
```

### API Controller Implementation

#### AccommodationController
```php
class AccommodationController extends Controller
{
    public function index(Request $request)
    {
        // List accommodations with filtering, sorting, pagination
        // Filters: type, status, availability, price range
        // Search: name, location, amenities
    }

    public function store(AccommodationRequest $request)
    {
        // Create new accommodation with validation
        // Handle image uploads
        // Create associated rooms
    }

    public function show(Accommodation $accommodation)
    {
        // Return accommodation with rooms, current bookings
        // Include availability calendar
        // Return pricing information
    }

    public function update(AccommodationRequest $request, Accommodation $accommodation)
    {
        // Update accommodation details
        // Handle image updates
        // Update room configuration
    }

    public function destroy(Accommodation $accommodation)
    {
        // Soft delete accommodation
        // Check for active bookings
        // Handle cascading updates
    }

    public function availability(Request $request, Accommodation $accommodation)
    {
        // Return availability for date range
        // Include room-level availability
        // Return pricing for dates
    }
}
```

### Request Validation

#### AccommodationRequest
```php
class AccommodationRequest extends FormRequest
{
    public function rules()
    {
        return [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:accommodations,code,' . $this->accommodation?->id,
            'accommodation_type_id' => 'required|exists:accommodation_types,id',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'max_occupancy' => 'required|integer|min:1|max:20',
            'base_rate' => 'required|numeric|min:0',
            'weekend_rate' => 'nullable|numeric|min:0',
            'holiday_rate' => 'nullable|numeric|min:0',
            'amenities' => 'nullable|array',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'rooms' => 'required|array|min:1',
            'rooms.*.room_type_id' => 'required|exists:room_types,id',
            'rooms.*.room_number' => 'required|string|max:10',
            'rooms.*.max_occupancy' => 'required|integer|min:1',
            'rooms.*.rate_per_night' => 'required|numeric|min:0'
        ];
    }
}
```

#### BookingRequest
```php
class BookingRequest extends FormRequest
{
    public function rules()
    {
        return [
            'guest_id' => 'nullable|exists:guests,id',
            'guest.first_name' => 'required_without:guest_id|string|max:50',
            'guest.last_name' => 'required_without:guest_id|string|max:50',
            'guest.email' => 'required_without:guest_id|email|max:100',
            'guest.phone' => 'required_without:guest_id|string|max:20',
            'guest.id_passport' => 'required_without:guest_id|string|max:50',
            'guest.nationality' => 'required_without:guest_id|string|max:50',
            'accommodation_id' => 'required|exists:accommodations,id',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
            'adults' => 'required|integer|min:1|max:10',
            'children' => 'nullable|integer|min:0|max:5',
            'infants' => 'nullable|integer|min:0|max:3',
            'room_ids' => 'required|array|min:1',
            'room_ids.*' => 'exists:rooms,id',
            'special_requests' => 'nullable|string|max:500'
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $this->validateBookingAvailability($validator);
            $this->validateGuestCapacity($validator);
        });
    }
}
```

## API Response Format

### Success Response Structure
```json
{
    "success": true,
    "data": {...},
    "message": "Operation completed successfully",
    "meta": {
        "pagination": {...},
        "filters": {...}
    }
}
```

### Error Response Structure
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Validation failed",
        "details": {
            "field_name": ["Error message"]
        }
    }
}
```

## Testing Requirements

### Unit Tests
- [ ] Model relationship tests
- [ ] Model validation tests
- [ ] Service class method tests
- [ ] Business logic validation tests

### Feature Tests
- [ ] API endpoint tests
- [ ] Authentication and authorization tests
- [ ] Data validation tests
- [ ] Complex business scenario tests

### Integration Tests
- [ ] Database transaction tests
- [ ] File upload tests
- [ ] Email notification tests
- [ ] Cache integration tests

## Performance Optimization

### Database Optimization
- Use eager loading for relationships
- Implement database indexes for common queries
- Use database views for complex availability queries
- Implement query result caching

### Caching Strategy
- Cache accommodation details (1 hour TTL)
- Cache availability data (15 minutes TTL)
- Cache pricing calculations (30 minutes TTL)
- Invalidate cache on data updates

### API Optimization
- Implement API rate limiting
- Use pagination for list endpoints
- Implement field selection for responses
- Use HTTP caching headers

## Security Considerations

### Authentication & Authorization
- Implement role-based access control
- Validate user permissions for each operation
- Log all booking operations for audit

### Data Protection
- Sanitize all input data
- Use parameterized queries
- Encrypt sensitive guest information
- Implement GDPR compliance for guest data

### API Security
- Implement request rate limiting
- Validate all input parameters
- Use HTTPS for all API communications
- Implement CSRF protection

## Documentation Requirements

- [ ] API documentation with examples
- [ ] Service class documentation
- [ ] Model relationship documentation
- [ ] Business logic documentation
- [ ] Error code documentation
