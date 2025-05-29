# Issue #06: Spa & Wellness Booking System

## Overview
Develop a comprehensive mobile spa and wellness booking system with treatment browsing, therapist selection, appointment scheduling, and wellness package management for both guest and staff applications.

## Priority
**High** - Core guest experience feature

## Estimated Timeline
**6 days** (Week 3 of Phase 6)

## Requirements

### 6.1 Spa Services Management
- **Treatment Catalog**: Comprehensive spa services with descriptions, durations, and pricing
- **Service Categories**: Massage, facial, body treatments, wellness packages
- **Therapist Profiles**: Staff specializations, availability, and ratings
- **Facility Management**: Room availability, equipment requirements
- **Package Deals**: Multi-service packages with discounts

### 6.2 Booking & Scheduling
- **Real-time Availability**: Live therapist and room availability
- **Flexible Scheduling**: Single and recurring appointments
- **Group Bookings**: Couple and group treatment options
- **Waitlist Management**: Automatic notification for cancellations
- **Preference Matching**: Therapist gender, specialty preferences

### 6.3 Guest Experience
- **Service Discovery**: Visual browsing with high-quality images
- **Personalized Recommendations**: Based on previous bookings and preferences
- **Pre-treatment Questionnaire**: Health and preference forms
- **Preparation Instructions**: What to expect and how to prepare
- **Post-treatment Care**: Aftercare recommendations and product suggestions

### 6.4 Staff Operations
- **Schedule Management**: Real-time therapist schedule updates
- **Client Preparation**: Guest preferences and health information
- **Treatment Documentation**: Session notes and recommendations
- **Inventory Integration**: Product usage tracking
- **Performance Analytics**: Therapist utilization and guest satisfaction

## Technical Specifications

### 6.5 Database Schema

```sql
-- Spa service categories
CREATE TABLE spa_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_display_order (display_order),
    INDEX idx_active (is_active)
);

-- Spa services and treatments
CREATE TABLE spa_services (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    duration_minutes INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2),
    therapist_required BOOLEAN DEFAULT TRUE,
    room_type ENUM('private', 'couple', 'group') DEFAULT 'private',
    max_participants INT DEFAULT 1,
    preparation_time_minutes INT DEFAULT 15,
    cleanup_time_minutes INT DEFAULT 15,
    advance_booking_hours INT DEFAULT 2,
    cancellation_hours INT DEFAULT 24,
    requires_health_form BOOLEAN DEFAULT FALSE,
    age_restriction INT,
    gender_restriction ENUM('male', 'female', 'any') DEFAULT 'any',
    image_url VARCHAR(255),
    gallery_images JSON,
    benefits TEXT,
    contraindications TEXT,
    preparation_instructions TEXT,
    aftercare_instructions TEXT,
    is_signature BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category_id),
    INDEX idx_slug (slug),
    INDEX idx_duration (duration_minutes),
    INDEX idx_price (price),
    INDEX idx_active (is_active),
    INDEX idx_signature (is_signature),
    FOREIGN KEY (category_id) REFERENCES spa_categories(id) ON DELETE RESTRICT
);

-- Spa therapists
CREATE TABLE spa_therapists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    specializations JSON, -- Array of service IDs
    certifications JSON, -- Array of certification objects
    languages JSON, -- Array of language codes
    experience_years INT DEFAULT 0,
    bio TEXT,
    profile_image_url VARCHAR(255),
    hourly_rate DECIMAL(8,2),
    commission_rate DECIMAL(5,2),
    availability_pattern JSON, -- Weekly availability pattern
    is_active BOOLEAN DEFAULT TRUE,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    total_bookings INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_active (is_active),
    INDEX idx_rating (rating_average),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Spa treatment rooms
CREATE TABLE spa_rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    room_number VARCHAR(50) UNIQUE NOT NULL,
    room_type ENUM('private', 'couple', 'group', 'relaxation') NOT NULL,
    capacity INT NOT NULL,
    amenities JSON, -- Array of amenities
    equipment JSON, -- Array of equipment
    location VARCHAR(255),
    size_sqm DECIMAL(6,2),
    image_url VARCHAR(255),
    gallery_images JSON,
    is_active BOOLEAN DEFAULT TRUE,
    maintenance_schedule JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_number (room_number),
    INDEX idx_room_type (room_type),
    INDEX idx_capacity (capacity),
    INDEX idx_active (is_active)
);

-- Spa wellness packages
CREATE TABLE spa_packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    total_duration_minutes INT NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    package_price DECIMAL(10,2) NOT NULL,
    savings_amount DECIMAL(10,2) GENERATED ALWAYS AS (original_price - package_price) STORED,
    max_participants INT DEFAULT 1,
    validity_days INT DEFAULT 90,
    image_url VARCHAR(255),
    gallery_images JSON,
    inclusions JSON, -- Array of included services with details
    benefits TEXT,
    restrictions TEXT,
    is_seasonal BOOLEAN DEFAULT FALSE,
    season_start DATE,
    season_end DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_price (package_price),
    INDEX idx_seasonal (is_seasonal, season_start, season_end),
    INDEX idx_active (is_active)
);

-- Spa bookings
CREATE TABLE spa_bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    guest_id BIGINT NOT NULL,
    service_id BIGINT,
    package_id BIGINT,
    therapist_id BIGINT,
    room_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    participants INT DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status ENUM('pending', 'partial', 'paid', 'refunded') DEFAULT 'pending',
    booking_status ENUM('confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'confirmed',
    special_requests TEXT,
    health_form_completed BOOLEAN DEFAULT FALSE,
    health_form_data JSON,
    guest_preferences JSON,
    preparation_notes TEXT,
    treatment_notes TEXT,
    therapist_notes TEXT,
    rating INT,
    review TEXT,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    cancelled_by BIGINT,
    checked_in_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_booking_reference (booking_reference),
    INDEX idx_guest_id (guest_id),
    INDEX idx_service_id (service_id),
    INDEX idx_package_id (package_id),
    INDEX idx_therapist_id (therapist_id),
    INDEX idx_room_id (room_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_start_time (start_time),
    INDEX idx_status (booking_status),
    INDEX idx_payment_status (payment_status),
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (service_id) REFERENCES spa_services(id) ON DELETE RESTRICT,
    FOREIGN KEY (package_id) REFERENCES spa_packages(id) ON DELETE RESTRICT,
    FOREIGN KEY (therapist_id) REFERENCES spa_therapists(id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES spa_rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Spa therapist availability
CREATE TABLE spa_therapist_availability (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    therapist_id BIGINT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    unavailable_reason VARCHAR(255),
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_therapist_date_time (therapist_id, date, start_time),
    INDEX idx_therapist_date (therapist_id, date),
    INDEX idx_date_range (date),
    FOREIGN KEY (therapist_id) REFERENCES spa_therapists(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Spa booking waitlist
CREATE TABLE spa_booking_waitlist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guest_id BIGINT NOT NULL,
    service_id BIGINT,
    package_id BIGINT,
    preferred_therapist_id BIGINT,
    preferred_date DATE,
    preferred_time_start TIME,
    preferred_time_end TIME,
    flexible_date BOOLEAN DEFAULT FALSE,
    flexible_time BOOLEAN DEFAULT FALSE,
    max_wait_days INT DEFAULT 30,
    participants INT DEFAULT 1,
    special_requests TEXT,
    status ENUM('active', 'notified', 'booked', 'expired', 'cancelled') DEFAULT 'active',
    notified_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_guest_id (guest_id),
    INDEX idx_service_id (service_id),
    INDEX idx_package_id (package_id),
    INDEX idx_therapist_id (preferred_therapist_id),
    INDEX idx_preferred_date (preferred_date),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES spa_services(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES spa_packages(id) ON DELETE CASCADE,
    FOREIGN KEY (preferred_therapist_id) REFERENCES spa_therapists(id) ON DELETE SET NULL
);
```

### 6.6 Backend Implementation (Laravel)

#### Spa Service Management
```php
<?php

namespace App\Services\Mobile;

use App\Models\SpaService;
use App\Models\SpaCategory;
use App\Models\SpaTherapist;
use App\Models\SpaRoom;
use App\Models\SpaPackage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SpaServiceService
{
    public function getServiceCategories()
    {
        return SpaCategory::where('is_active', true)
            ->orderBy('display_order')
            ->with(['services' => function($query) {
                $query->where('is_active', true)
                      ->select('id', 'category_id', 'name', 'short_description', 
                              'duration_minutes', 'price', 'discounted_price', 
                              'image_url', 'is_signature');
            }])
            ->get();
    }
    
    public function getServiceDetails($serviceId)
    {
        $service = SpaService::with([
            'category',
            'availableTherapists' => function($query) {
                $query->where('is_active', true)
                      ->select('id', 'user_id', 'experience_years', 'rating_average', 'bio')
                      ->with('user:id,name,profile_image_url');
            }
        ])->findOrFail($serviceId);
        
        // Get available time slots for next 30 days
        $availableSlots = $this->getAvailableTimeSlots($serviceId, 30);
        
        return [
            'service' => $service,
            'available_slots' => $availableSlots,
            'similar_services' => $this->getSimilarServices($service),
            'packages' => $this->getPackagesWithService($serviceId)
        ];
    }
    
    public function getAvailableTimeSlots($serviceId, $days = 7, $therapistId = null)
    {
        $service = SpaService::findOrFail($serviceId);
        $slots = [];
        
        for ($i = 0; $i < $days; $i++) {
            $date = Carbon::today()->addDays($i);
            
            if ($date->isPast()) continue;
            
            $daySlots = $this->getDayAvailableSlots($service, $date, $therapistId);
            
            if (!empty($daySlots)) {
                $slots[$date->format('Y-m-d')] = $daySlots;
            }
        }
        
        return $slots;
    }
    
    private function getDayAvailableSlots($service, $date, $therapistId = null)
    {
        $dayOfWeek = $date->dayOfWeek;
        $slots = [];
        
        // Get available therapists for this day
        $therapistsQuery = SpaTherapist::where('is_active', true)
            ->whereJsonContains('specializations', $service->id);
            
        if ($therapistId) {
            $therapistsQuery->where('id', $therapistId);
        }
        
        $therapists = $therapistsQuery->get();
        
        foreach ($therapists as $therapist) {
            $availability = $this->getTherapistAvailability($therapist, $date);
            
            foreach ($availability as $timeSlot) {
                $startTime = Carbon::parse($date->format('Y-m-d') . ' ' . $timeSlot['start']);
                $endTime = $startTime->copy()->addMinutes($service->duration_minutes);
                
                // Check if slot is available (no existing bookings)
                if ($this->isSlotAvailable($therapist->id, $startTime, $endTime)) {
                    $slots[] = [
                        'therapist_id' => $therapist->id,
                        'therapist_name' => $therapist->user->name,
                        'start_time' => $timeSlot['start'],
                        'end_time' => $endTime->format('H:i'),
                        'available_rooms' => $this->getAvailableRooms($startTime, $endTime, $service->room_type)
                    ];
                }
            }
        }
        
        return $slots;
    }
    
    public function searchServices($query, $filters = [])
    {
        $services = SpaService::where('is_active', true);
        
        if ($query) {
            $services->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhere('short_description', 'LIKE', "%{$query}%");
            });
        }
        
        if (isset($filters['category_id'])) {
            $services->where('category_id', $filters['category_id']);
        }
        
        if (isset($filters['duration_range'])) {
            $services->whereBetween('duration_minutes', $filters['duration_range']);
        }
        
        if (isset($filters['price_range'])) {
            $services->whereBetween('price', $filters['price_range']);
        }
        
        if (isset($filters['room_type'])) {
            $services->where('room_type', $filters['room_type']);
        }
        
        $sortBy = $filters['sort_by'] ?? 'name';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        
        return $services->orderBy($sortBy, $sortOrder)
                       ->with('category:id,name')
                       ->paginate(20);
    }
    
    public function getRecommendedServices($guestId)
    {
        // Get guest's booking history
        $previousBookings = DB::table('spa_bookings')
            ->where('guest_id', $guestId)
            ->where('booking_status', 'completed')
            ->pluck('service_id')
            ->toArray();
            
        if (empty($previousBookings)) {
            // Return popular services for new guests
            return SpaService::where('is_active', true)
                ->where('is_signature', true)
                ->orderBy('total_bookings', 'desc')
                ->limit(5)
                ->get();
        }
        
        // Get similar services based on category and preferences
        $categories = SpaService::whereIn('id', $previousBookings)
            ->pluck('category_id')
            ->unique();
            
        return SpaService::where('is_active', true)
            ->whereIn('category_id', $categories)
            ->whereNotIn('id', $previousBookings)
            ->orderBy('rating_average', 'desc')
            ->limit(5)
            ->get();
    }
    
    private function getTherapistAvailability($therapist, $date)
    {
        // Implementation to get therapist's availability pattern for the date
        $availability = $therapist->availability_pattern;
        $dayOfWeek = $date->dayOfWeek;
        
        return $availability[$dayOfWeek] ?? [];
    }
    
    private function isSlotAvailable($therapistId, $startTime, $endTime)
    {
        return !DB::table('spa_bookings')
            ->where('therapist_id', $therapistId)
            ->where('appointment_date', $startTime->format('Y-m-d'))
            ->where(function($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime->format('H:i'), $endTime->format('H:i')])
                      ->orWhereBetween('end_time', [$startTime->format('H:i'), $endTime->format('H:i')])
                      ->orWhere(function($q) use ($startTime, $endTime) {
                          $q->where('start_time', '<=', $startTime->format('H:i'))
                            ->where('end_time', '>=', $endTime->format('H:i'));
                      });
            })
            ->whereIn('booking_status', ['confirmed', 'checked_in', 'in_progress'])
            ->exists();
    }
    
    private function getAvailableRooms($startTime, $endTime, $roomType)
    {
        return DB::table('spa_rooms')
            ->where('room_type', $roomType)
            ->where('is_active', true)
            ->whereNotExists(function($query) use ($startTime, $endTime) {
                $query->select(DB::raw(1))
                      ->from('spa_bookings')
                      ->whereRaw('spa_bookings.room_id = spa_rooms.id')
                      ->where('appointment_date', $startTime->format('Y-m-d'))
                      ->where(function($q) use ($startTime, $endTime) {
                          $q->whereBetween('start_time', [$startTime->format('H:i'), $endTime->format('H:i')])
                            ->orWhereBetween('end_time', [$startTime->format('H:i'), $endTime->format('H:i')])
                            ->orWhere(function($subq) use ($startTime, $endTime) {
                                $subq->where('start_time', '<=', $startTime->format('H:i'))
                                     ->where('end_time', '>=', $endTime->format('H:i'));
                            });
                      })
                      ->whereIn('booking_status', ['confirmed', 'checked_in', 'in_progress']);
            })
            ->get();
    }
}
```

#### Spa Booking Service
```php
<?php

namespace App\Services\Mobile;

use App\Models\SpaBooking;
use App\Models\SpaService;
use App\Models\SpaPackage;
use App\Models\SpaBookingWaitlist;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SpaBookingService
{
    public function createBooking($guestId, $bookingData)
    {
        try {
            DB::beginTransaction();
            
            // Validate availability
            if (!$this->validateAvailability($bookingData)) {
                throw new \Exception('Selected time slot is no longer available');
            }
            
            // Calculate pricing
            $pricing = $this->calculatePricing($bookingData);
            
            // Generate booking reference
            $bookingReference = $this->generateBookingReference();
            
            $booking = SpaBooking::create([
                'booking_reference' => $bookingReference,
                'guest_id' => $guestId,
                'service_id' => $bookingData['service_id'] ?? null,
                'package_id' => $bookingData['package_id'] ?? null,
                'therapist_id' => $bookingData['therapist_id'],
                'room_id' => $bookingData['room_id'],
                'appointment_date' => $bookingData['appointment_date'],
                'start_time' => $bookingData['start_time'],
                'end_time' => $bookingData['end_time'],
                'duration_minutes' => $bookingData['duration_minutes'],
                'participants' => $bookingData['participants'] ?? 1,
                'total_amount' => $pricing['total_amount'],
                'special_requests' => $bookingData['special_requests'] ?? null,
                'guest_preferences' => $bookingData['guest_preferences'] ?? null,
                'health_form_data' => $bookingData['health_form_data'] ?? null,
                'health_form_completed' => !empty($bookingData['health_form_data'])
            ]);
            
            // Send confirmation notifications
            $this->sendBookingConfirmation($booking);
            
            // Check and notify waitlist if cancellation
            $this->processWaitlistNotifications($bookingData);
            
            DB::commit();
            
            return $booking->load(['service', 'package', 'therapist.user', 'room']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function rescheduleBooking($bookingId, $newDateTime, $therapistId = null)
    {
        $booking = SpaBooking::findOrFail($bookingId);
        
        if (!in_array($booking->booking_status, ['confirmed'])) {
            throw new \Exception('Booking cannot be rescheduled');
        }
        
        // Check cancellation policy
        $appointmentTime = Carbon::parse($booking->appointment_date . ' ' . $booking->start_time);
        $cancellationDeadline = $appointmentTime->subHours($booking->service->cancellation_hours ?? 24);
        
        if (now() > $cancellationDeadline) {
            throw new \Exception('Rescheduling deadline has passed');
        }
        
        // Validate new time slot availability
        if (!$this->validateAvailability([
            'appointment_date' => $newDateTime['date'],
            'start_time' => $newDateTime['time'],
            'therapist_id' => $therapistId ?? $booking->therapist_id,
            'duration_minutes' => $booking->duration_minutes
        ])) {
            throw new \Exception('New time slot is not available');
        }
        
        $endTime = Carbon::parse($newDateTime['date'] . ' ' . $newDateTime['time'])
            ->addMinutes($booking->duration_minutes);
        
        $booking->update([
            'appointment_date' => $newDateTime['date'],
            'start_time' => $newDateTime['time'],
            'end_time' => $endTime->format('H:i'),
            'therapist_id' => $therapistId ?? $booking->therapist_id
        ]);
        
        $this->sendRescheduleNotification($booking);
        
        return $booking->fresh();
    }
    
    public function cancelBooking($bookingId, $cancellationReason, $cancelledBy)
    {
        $booking = SpaBooking::findOrFail($bookingId);
        
        if (!in_array($booking->booking_status, ['confirmed'])) {
            throw new \Exception('Booking cannot be cancelled');
        }
        
        // Calculate refund amount based on cancellation policy
        $refundAmount = $this->calculateRefundAmount($booking);
        
        $booking->update([
            'booking_status' => 'cancelled',
            'cancellation_reason' => $cancellationReason,
            'cancelled_by' => $cancelledBy,
            'cancelled_at' => now()
        ]);
        
        // Process refund if applicable
        if ($refundAmount > 0) {
            $this->processRefund($booking, $refundAmount);
        }
        
        // Notify waitlisted guests
        $this->notifyWaitlistedGuests($booking);
        
        $this->sendCancellationNotification($booking);
        
        return ['booking' => $booking, 'refund_amount' => $refundAmount];
    }
    
    public function addToWaitlist($guestId, $waitlistData)
    {
        $waitlist = SpaBookingWaitlist::create([
            'guest_id' => $guestId,
            'service_id' => $waitlistData['service_id'] ?? null,
            'package_id' => $waitlistData['package_id'] ?? null,
            'preferred_therapist_id' => $waitlistData['preferred_therapist_id'] ?? null,
            'preferred_date' => $waitlistData['preferred_date'],
            'preferred_time_start' => $waitlistData['preferred_time_start'],
            'preferred_time_end' => $waitlistData['preferred_time_end'],
            'flexible_date' => $waitlistData['flexible_date'] ?? false,
            'flexible_time' => $waitlistData['flexible_time'] ?? false,
            'max_wait_days' => $waitlistData['max_wait_days'] ?? 30,
            'participants' => $waitlistData['participants'] ?? 1,
            'special_requests' => $waitlistData['special_requests'] ?? null,
            'expires_at' => now()->addDays($waitlistData['max_wait_days'] ?? 30)
        ]);
        
        return $waitlist;
    }
    
    public function getGuestBookings($guestId, $status = null)
    {
        $query = SpaBooking::where('guest_id', $guestId)
            ->with(['service', 'package', 'therapist.user', 'room']);
            
        if ($status) {
            $query->where('booking_status', $status);
        }
        
        return $query->orderBy('appointment_date', 'desc')
                     ->orderBy('start_time', 'desc')
                     ->get();
    }
    
    private function validateAvailability($bookingData)
    {
        $startTime = Carbon::parse($bookingData['appointment_date'] . ' ' . $bookingData['start_time']);
        $endTime = $startTime->copy()->addMinutes($bookingData['duration_minutes']);
        
        // Check therapist availability
        $therapistConflict = SpaBooking::where('therapist_id', $bookingData['therapist_id'])
            ->where('appointment_date', $bookingData['appointment_date'])
            ->where(function($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime->format('H:i'), $endTime->format('H:i')])
                      ->orWhereBetween('end_time', [$startTime->format('H:i'), $endTime->format('H:i')])
                      ->orWhere(function($q) use ($startTime, $endTime) {
                          $q->where('start_time', '<=', $startTime->format('H:i'))
                            ->where('end_time', '>=', $endTime->format('H:i'));
                      });
            })
            ->whereIn('booking_status', ['confirmed', 'checked_in', 'in_progress'])
            ->exists();
            
        if ($therapistConflict) {
            return false;
        }
        
        // Check room availability if specified
        if (isset($bookingData['room_id'])) {
            $roomConflict = SpaBooking::where('room_id', $bookingData['room_id'])
                ->where('appointment_date', $bookingData['appointment_date'])
                ->where(function($query) use ($startTime, $endTime) {
                    $query->whereBetween('start_time', [$startTime->format('H:i'), $endTime->format('H:i')])
                          ->orWhereBetween('end_time', [$startTime->format('H:i'), $endTime->format('H:i')])
                          ->orWhere(function($q) use ($startTime, $endTime) {
                              $q->where('start_time', '<=', $startTime->format('H:i'))
                                ->where('end_time', '>=', $endTime->format('H:i'));
                          });
                })
                ->whereIn('booking_status', ['confirmed', 'checked_in', 'in_progress'])
                ->exists();
                
            if ($roomConflict) {
                return false;
            }
        }
        
        return true;
    }
    
    private function calculatePricing($bookingData)
    {
        $totalAmount = 0;
        
        if (isset($bookingData['service_id'])) {
            $service = SpaService::findOrFail($bookingData['service_id']);
            $totalAmount = $service->discounted_price ?: $service->price;
        }
        
        if (isset($bookingData['package_id'])) {
            $package = SpaPackage::findOrFail($bookingData['package_id']);
            $totalAmount = $package->package_price;
        }
        
        // Apply participant multiplier if applicable
        $participants = $bookingData['participants'] ?? 1;
        if ($participants > 1) {
            $totalAmount *= $participants;
        }
        
        return ['total_amount' => $totalAmount];
    }
    
    private function generateBookingReference()
    {
        do {
            $reference = 'SPA' . date('Ymd') . strtoupper(uniqid());
        } while (SpaBooking::where('booking_reference', $reference)->exists());
        
        return $reference;
    }
}
```

### 6.7 Flutter Implementation

#### Spa Services Screen
```dart
// lib/features/spa/presentation/pages/spa_services_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/spa_services_bloc.dart';
import '../widgets/service_category_card.dart';
import '../widgets/featured_service_card.dart';
import '../widgets/spa_search_bar.dart';

class SpaServicesPage extends StatefulWidget {
  @override
  _SpaServicesPageState createState() => _SpaServicesPageState();
}

class _SpaServicesPageState extends State<SpaServicesPage> {
  final TextEditingController _searchController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    context.read<SpaServicesBloc>().add(LoadSpaCategories());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Spa & Wellness'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      body: BlocBuilder<SpaServicesBloc, SpaServicesState>(
        builder: (context, state) {
          if (state is SpaServicesLoading) {
            return Center(child: CircularProgressIndicator());
          }
          
          if (state is SpaServicesError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text(state.message),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.read<SpaServicesBloc>().add(LoadSpaCategories()),
                    child: Text('Retry'),
                  ),
                ],
              ),
            );
          }
          
          if (state is SpaServicesLoaded) {
            return SingleChildScrollView(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SpaSearchBar(
                    controller: _searchController,
                    onSearchChanged: (query) {
                      context.read<SpaServicesBloc>().add(SearchServices(query));
                    },
                  ),
                  SizedBox(height: 24),
                  
                  if (state.featuredServices.isNotEmpty) ...[
                    Text(
                      'Featured Treatments',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    SizedBox(height: 16),
                    SizedBox(
                      height: 280,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: state.featuredServices.length,
                        itemBuilder: (context, index) {
                          return FeaturedServiceCard(
                            service: state.featuredServices[index],
                            onTap: () => _navigateToServiceDetail(state.featuredServices[index].id),
                          );
                        },
                      ),
                    ),
                    SizedBox(height: 32),
                  ],
                  
                  Text(
                    'Service Categories',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  SizedBox(height: 16),
                  
                  GridView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 1.2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                    ),
                    itemCount: state.categories.length,
                    itemBuilder: (context, index) {
                      return ServiceCategoryCard(
                        category: state.categories[index],
                        onTap: () => _navigateToCategoryServices(state.categories[index]),
                      );
                    },
                  ),
                ],
              ),
            );
          }
          
          return Container();
        },
      ),
    );
  }
  
  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => SpaFilterSheet(),
    );
  }
  
  void _navigateToServiceDetail(int serviceId) {
    Navigator.pushNamed(context, '/spa/service/$serviceId');
  }
  
  void _navigateToCategoryServices(SpaCategory category) {
    Navigator.pushNamed(context, '/spa/category/${category.id}');
  }
}
```

#### Service Detail Screen
```dart
// lib/features/spa/presentation/pages/service_detail_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/service_detail_bloc.dart';
import '../widgets/service_image_gallery.dart';
import '../widgets/therapist_selection_card.dart';
import '../widgets/time_slot_selector.dart';
import '../widgets/booking_summary_card.dart';

class ServiceDetailPage extends StatefulWidget {
  final int serviceId;
  
  const ServiceDetailPage({required this.serviceId});

  @override
  _ServiceDetailPageState createState() => _ServiceDetailPageState();
}

class _ServiceDetailPageState extends State<ServiceDetailPage> {
  int? selectedTherapistId;
  DateTime? selectedDate;
  String? selectedTime;
  
  @override
  void initState() {
    super.initState();
    context.read<ServiceDetailBloc>().add(LoadServiceDetail(widget.serviceId));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<ServiceDetailBloc, ServiceDetailState>(
        builder: (context, state) {
          if (state is ServiceDetailLoading) {
            return Center(child: CircularProgressIndicator());
          }
          
          if (state is ServiceDetailError) {
            return Center(child: Text(state.message));
          }
          
          if (state is ServiceDetailLoaded) {
            return CustomScrollView(
              slivers: [
                SliverAppBar(
                  expandedHeight: 300,
                  pinned: true,
                  flexibleSpace: FlexibleSpaceBar(
                    background: ServiceImageGallery(
                      images: state.service.galleryImages,
                      heroTag: 'service_${widget.serviceId}',
                    ),
                  ),
                ),
                
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildServiceHeader(state.service),
                        SizedBox(height: 24),
                        _buildServiceDescription(state.service),
                        SizedBox(height: 24),
                        _buildTherapistSelection(state.service.therapists),
                        SizedBox(height: 24),
                        _buildTimeSlotSelection(state.availableSlots),
                        SizedBox(height: 24),
                        _buildAdditionalInfo(state.service),
                        SizedBox(height: 100), // Space for bottom button
                      ],
                    ),
                  ),
                ),
              ],
            );
          }
          
          return Container();
        },
      ),
      bottomNavigationBar: _buildBookingButton(),
    );
  }
  
  Widget _buildServiceHeader(SpaService service) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            if (service.isSignature)
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.amber,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'SIGNATURE',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ),
            Spacer(),
            Icon(Icons.access_time, size: 16, color: Colors.grey),
            SizedBox(width: 4),
            Text('${service.durationMinutes} min'),
          ],
        ),
        SizedBox(height: 8),
        Text(
          service.name,
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        SizedBox(height: 8),
        Row(
          children: [
            if (service.discountedPrice != null) ...[
              Text(
                '\$${service.price}',
                style: TextStyle(
                  decoration: TextDecoration.lineThrough,
                  color: Colors.grey,
                ),
              ),
              SizedBox(width: 8),
              Text(
                '\$${service.discountedPrice}',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Theme.of(context).primaryColor,
                ),
              ),
            ] else
              Text(
                '\$${service.price}',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Theme.of(context).primaryColor,
                ),
              ),
          ],
        ),
      ],
    );
  }
  
  Widget _buildTherapistSelection(List<SpaTherapist> therapists) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Choose Your Therapist',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        SizedBox(height: 16),
        ...therapists.map((therapist) => TherapistSelectionCard(
          therapist: therapist,
          isSelected: selectedTherapistId == therapist.id,
          onTap: () => setState(() => selectedTherapistId = therapist.id),
        )).toList(),
      ],
    );
  }
  
  Widget _buildTimeSlotSelection(Map<String, List<TimeSlot>> availableSlots) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Date & Time',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        SizedBox(height: 16),
        TimeSlotSelector(
          availableSlots: availableSlots,
          selectedDate: selectedDate,
          selectedTime: selectedTime,
          onDateSelected: (date) => setState(() {
            selectedDate = date;
            selectedTime = null; // Reset time when date changes
          }),
          onTimeSelected: (time) => setState(() => selectedTime = time),
        ),
      ],
    );
  }
  
  Widget _buildBookingButton() {
    final canBook = selectedTherapistId != null && 
                   selectedDate != null && 
                   selectedTime != null;
    
    return Container(
      padding: EdgeInsets.all(16),
      child: ElevatedButton(
        onPressed: canBook ? _proceedToBooking : null,
        style: ElevatedButton.styleFrom(
          padding: EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: Text(
          'Book Appointment',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
  
  void _proceedToBooking() {
    Navigator.pushNamed(
      context,
      '/spa/booking/confirm',
      arguments: {
        'serviceId': widget.serviceId,
        'therapistId': selectedTherapistId,
        'date': selectedDate,
        'time': selectedTime,
      },
    );
  }
}
```

## Implementation Phases

### Phase 1: Service Management Setup (Days 1-2)
- Database schema implementation
- Backend service and API development
- Basic Flutter spa services listing
- Service category and detail screens

### Phase 2: Booking System (Days 3-4)
- Booking flow implementation
- Therapist and time slot management
- Real-time availability checking
- Booking confirmation and notifications

### Phase 3: Enhanced Features (Days 5-6)
- Waitlist management system
- Health form and preferences
- Package deals and recommendations
- Staff booking management interface

## Quality Assurance

### Testing Requirements
- **Unit Tests**: Service logic and booking validation
- **Widget Tests**: All booking flow components
- **Integration Tests**: End-to-end booking process
- **Performance Tests**: Real-time availability checking
- **User Experience Tests**: Booking flow usability

### Security Validation
- **Data Privacy**: Health information encryption
- **Access Control**: Role-based booking permissions
- **Payment Security**: Secure payment processing
- **Audit Trail**: Booking modification tracking

## Success Metrics
- Booking completion rate > 85%
- Average booking time < 3 minutes
- Therapist utilization rate > 75%
- Guest satisfaction rating > 4.5/5
- Same-day booking availability > 60%

## Risk Mitigation
- **Double Booking**: Real-time conflict detection
- **Cancellation Policy**: Clear policy enforcement
- **Staff Scheduling**: Automated availability management
- **Health Compliance**: HIPAA-compliant data handling
- **Peak Time Management**: Waitlist and queue system

## Dependencies
- User authentication system (Issue #01)
- Payment processing integration
- Push notification service
- Calendar synchronization
- Staff management system

## Deliverables
- Complete spa service browsing and booking system
- Real-time availability and scheduling management
- Therapist selection and preference matching
- Comprehensive booking management for staff
- Health form and guest preference system
- Waitlist and notification management
