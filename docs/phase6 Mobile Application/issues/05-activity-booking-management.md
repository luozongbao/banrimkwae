# Issue #05: Activity Booking & Management System

## Overview
Develop a comprehensive mobile activity booking and management system that allows guests to discover, book, and manage resort activities, tours, and experiences through their mobile devices, while providing staff with real-time activity management and guest coordination capabilities.

## Priority: High
## Estimated Time: 6 days
## Dependencies: Issue #01 (Core Architecture), Issue #02 (Guest App), Issue #03 (Staff App)

## Technical Requirements

### Core Features
1. **Activity Discovery & Browsing**
   - Interactive activity catalog with high-quality media
   - Real-time availability and pricing display
   - Weather-dependent activity recommendations
   - Personalized activity suggestions based on guest preferences
   - Multi-language activity descriptions and instructions

2. **Advanced Booking System**
   - Real-time slot availability checking
   - Group booking capabilities with dynamic pricing
   - Equipment rental integration
   - Age and skill level requirements validation
   - Automatic waitlist management

3. **Activity Management**
   - Digital check-in/check-out process
   - Real-time activity status updates
   - Emergency contact and safety information
   - Activity rating and review system
   - Photo sharing and memory creation

4. **Staff Coordination Tools**
   - Activity guide assignment and scheduling
   - Equipment inventory tracking
   - Guest safety checklist management
   - Real-time communication with guests
   - Activity performance analytics

## Database Schema

### Tables to Create/Modify

```sql
-- Mobile Activity Categories
CREATE TABLE mobile_activity_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_th VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_th TEXT,
    icon_url VARCHAR(500),
    color_code VARCHAR(7) DEFAULT '#007bff',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    requires_age_verification BOOLEAN DEFAULT FALSE,
    min_age INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_order (is_active, display_order),
    INDEX idx_age_verification (requires_age_verification, min_age)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mobile Activities
CREATE TABLE mobile_activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_th VARCHAR(255) NOT NULL,
    description_en TEXT NOT NULL,
    description_th TEXT NOT NULL,
    short_description_en VARCHAR(500),
    short_description_th VARCHAR(500),
    price_adult DECIMAL(10,2) NOT NULL,
    price_child DECIMAL(10,2) DEFAULT NULL,
    price_group DECIMAL(10,2) DEFAULT NULL, -- per group pricing
    duration_minutes INT NOT NULL,
    max_participants INT DEFAULT 10,
    min_participants INT DEFAULT 1,
    difficulty_level ENUM('easy', 'moderate', 'challenging', 'expert') DEFAULT 'easy',
    physical_requirements_en TEXT,
    physical_requirements_th TEXT,
    what_to_bring_en TEXT,
    what_to_bring_th TEXT,
    safety_instructions_en TEXT,
    safety_instructions_th TEXT,
    cancellation_policy_en TEXT,
    cancellation_policy_th TEXT,
    booking_advance_hours INT DEFAULT 24, -- minimum hours before booking
    cancellation_hours INT DEFAULT 24, -- hours before activity for free cancellation
    location_name VARCHAR(255),
    meeting_point_en TEXT,
    meeting_point_th TEXT,
    location_lat DECIMAL(10, 7) DEFAULT NULL,
    location_lng DECIMAL(10, 7) DEFAULT NULL,
    is_weather_dependent BOOLEAN DEFAULT FALSE,
    is_equipment_provided BOOLEAN DEFAULT TRUE,
    is_transportation_included BOOLEAN DEFAULT FALSE,
    is_meal_included BOOLEAN DEFAULT FALSE,
    is_photo_service_included BOOLEAN DEFAULT FALSE,
    requires_swimming BOOLEAN DEFAULT FALSE,
    requires_certification BOOLEAN DEFAULT FALSE,
    age_restriction_min INT DEFAULT NULL,
    age_restriction_max INT DEFAULT NULL,
    fitness_level_required ENUM('none', 'basic', 'good', 'excellent') DEFAULT 'none',
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    seasonal_start_date DATE DEFAULT NULL,
    seasonal_end_date DATE DEFAULT NULL,
    operating_days JSON DEFAULT NULL, -- ['monday', 'tuesday', ...]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES mobile_activity_categories(id) ON DELETE CASCADE,
    INDEX idx_category_available (category_id, is_available),
    INDEX idx_featured_activities (is_featured, is_available),
    INDEX idx_difficulty_price (difficulty_level, price_adult),
    INDEX idx_seasonal_dates (seasonal_start_date, seasonal_end_date),
    INDEX idx_location (location_lat, location_lng),
    FULLTEXT idx_search_en (name_en, description_en, short_description_en),
    FULLTEXT idx_search_th (name_th, description_th, short_description_th)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mobile Activity Media
CREATE TABLE mobile_activity_media (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    activity_id BIGINT UNSIGNED NOT NULL,
    media_type ENUM('image', 'video', 'virtual_tour') NOT NULL,
    media_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) DEFAULT NULL,
    title_en VARCHAR(255),
    title_th VARCHAR(255),
    description_en TEXT,
    description_th TEXT,
    display_order INT DEFAULT 0,
    is_cover BOOLEAN DEFAULT FALSE,
    duration_seconds INT DEFAULT NULL, -- for videos
    file_size_mb DECIMAL(8,2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES mobile_activities(id) ON DELETE CASCADE,
    INDEX idx_activity_type (activity_id, media_type),
    INDEX idx_cover_media (activity_id, is_cover),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mobile Activity Time Slots
CREATE TABLE mobile_activity_time_slots (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    activity_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_participants INT NOT NULL,
    current_bookings INT DEFAULT 0,
    price_adult DECIMAL(10,2) DEFAULT NULL, -- override default price
    price_child DECIMAL(10,2) DEFAULT NULL,
    guide_staff_id BIGINT UNSIGNED DEFAULT NULL,
    status ENUM('available', 'full', 'cancelled', 'completed') DEFAULT 'available',
    special_notes_en TEXT,
    special_notes_th TEXT,
    weather_status ENUM('good', 'warning', 'cancelled') DEFAULT 'good',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES mobile_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (guide_staff_id) REFERENCES staff(id) ON DELETE SET NULL,
    UNIQUE KEY unique_activity_datetime (activity_id, date, start_time),
    INDEX idx_activity_date (activity_id, date),
    INDEX idx_availability (date, status, max_participants, current_bookings),
    INDEX idx_guide_schedule (guide_staff_id, date, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mobile Activity Bookings
CREATE TABLE mobile_activity_bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    guest_id BIGINT UNSIGNED NOT NULL,
    time_slot_id BIGINT UNSIGNED NOT NULL,
    booking_type ENUM('individual', 'group', 'private') DEFAULT 'individual',
    adults_count INT NOT NULL DEFAULT 1,
    children_count INT DEFAULT 0,
    total_participants INT NOT NULL,
    price_per_adult DECIMAL(10,2) NOT NULL,
    price_per_child DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('room_charge', 'credit_card', 'cash', 'digital_wallet') NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    status ENUM('pending', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    special_requirements TEXT,
    dietary_restrictions TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    pickup_location VARCHAR(255) DEFAULT NULL,
    participant_details JSON DEFAULT NULL, -- names, ages, etc.
    equipment_requests JSON DEFAULT NULL,
    waiver_signed BOOLEAN DEFAULT FALSE,
    waiver_signed_at TIMESTAMP NULL,
    checked_in_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    guest_rating INT DEFAULT NULL,
    guest_review TEXT,
    review_submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    FOREIGN KEY (time_slot_id) REFERENCES mobile_activity_time_slots(id) ON DELETE CASCADE,
    INDEX idx_guest_bookings (guest_id, created_at DESC),
    INDEX idx_booking_number (booking_number),
    INDEX idx_time_slot_status (time_slot_id, status),
    INDEX idx_payment_status (payment_status, total_amount),
    INDEX idx_booking_date (created_at, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mobile Activity Equipment
CREATE TABLE mobile_activity_equipment (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    activity_id BIGINT UNSIGNED NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_th VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_th TEXT,
    is_included BOOLEAN DEFAULT TRUE,
    rental_price DECIMAL(10,2) DEFAULT 0,
    sizes_available JSON DEFAULT NULL, -- ['S', 'M', 'L', 'XL']
    total_quantity INT DEFAULT 0,
    available_quantity INT DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    safety_equipment BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES mobile_activities(id) ON DELETE CASCADE,
    INDEX idx_activity_equipment (activity_id, is_included),
    INDEX idx_rental_equipment (rental_price, available_quantity),
    INDEX idx_safety_equipment (safety_equipment, is_required)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mobile Activity Booking Equipment
CREATE TABLE mobile_activity_booking_equipment (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    equipment_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    size VARCHAR(10) DEFAULT NULL,
    rental_price DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('reserved', 'assigned', 'returned', 'damaged', 'lost') DEFAULT 'reserved',
    assigned_at TIMESTAMP NULL,
    returned_at TIMESTAMP NULL,
    condition_notes TEXT,
    damage_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES mobile_activity_bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES mobile_activity_equipment(id) ON DELETE CASCADE,
    INDEX idx_booking_equipment (booking_id),
    INDEX idx_equipment_status (equipment_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mobile Activity Check-ins (for staff use)
CREATE TABLE mobile_activity_checkins (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    staff_id BIGINT UNSIGNED NOT NULL,
    check_type ENUM('pre_activity', 'equipment_check', 'safety_briefing', 'activity_start', 'activity_end', 'post_activity') NOT NULL,
    status ENUM('pending', 'completed', 'skipped', 'failed') DEFAULT 'pending',
    checklist_items JSON DEFAULT NULL,
    notes TEXT,
    signature_data TEXT DEFAULT NULL, -- base64 encoded signature
    photo_urls JSON DEFAULT NULL,
    location_lat DECIMAL(10, 7) DEFAULT NULL,
    location_lng DECIMAL(10, 7) DEFAULT NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES mobile_activity_bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    INDEX idx_booking_checks (booking_id, check_type),
    INDEX idx_staff_checks (staff_id, completed_at),
    INDEX idx_status_type (status, check_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Backend Implementation

### Laravel Services

```php
<?php
// app/Services/Mobile/MobileActivityService.php

namespace App\Services\Mobile;

use App\Models\MobileActivity;
use App\Models\MobileActivityCategory;
use App\Models\MobileActivityTimeSlot;
use App\Models\MobileActivityBooking;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MobileActivityService
{
    public function getActivitiesByCategory($language = 'en', $filters = [])
    {
        $cacheKey = "mobile_activities_{$language}_" . md5(serialize($filters));
        
        return Cache::remember($cacheKey, 1800, function () use ($language, $filters) {
            $categories = MobileActivityCategory::where('is_active', true)
                ->orderBy('display_order')
                ->get();
            
            $result = [];
            
            foreach ($categories as $category) {
                $query = MobileActivity::where('category_id', $category->id)
                    ->where('is_available', true);
                
                // Apply filters
                if (isset($filters['difficulty_level'])) {
                    $query->where('difficulty_level', $filters['difficulty_level']);
                }
                
                if (isset($filters['max_price'])) {
                    $query->where('price_adult', '<=', $filters['max_price']);
                }
                
                if (isset($filters['max_duration'])) {
                    $query->where('duration_minutes', '<=', $filters['max_duration']);
                }
                
                if (isset($filters['weather_independent'])) {
                    $query->where('is_weather_dependent', false);
                }
                
                if (isset($filters['includes_equipment'])) {
                    $query->where('is_equipment_provided', true);
                }
                
                // Seasonal filtering
                $today = Carbon::today();
                $query->where(function ($q) use ($today) {
                    $q->whereNull('seasonal_start_date')
                      ->orWhere(function ($sq) use ($today) {
                          $sq->where('seasonal_start_date', '<=', $today)
                             ->where('seasonal_end_date', '>=', $today);
                      });
                });
                
                $activities = $query->with(['media', 'equipment'])
                    ->orderByDesc('is_featured')
                    ->orderBy('name_' . $language)
                    ->get();
                
                if ($activities->isNotEmpty()) {
                    $result[] = [
                        'category' => [
                            'id' => $category->id,
                            'name' => $language === 'th' ? $category->name_th : $category->name_en,
                            'description' => $language === 'th' ? $category->description_th : $category->description_en,
                            'icon_url' => $category->icon_url,
                            'color_code' => $category->color_code,
                        ],
                        'activities' => $this->formatActivities($activities, $language)
                    ];
                }
            }
            
            return $result;
        });
    }
    
    public function getActivityDetails($activityId, $language = 'en')
    {
        $activity = MobileActivity::with([
            'category',
            'media' => function ($query) {
                $query->orderBy('display_order')->orderByDesc('is_cover');
            },
            'equipment' => function ($query) {
                $query->orderBy('is_required', 'desc')->orderBy('name_en');
            }
        ])->findOrFail($activityId);
        
        // Get available time slots for next 30 days
        $availableSlots = $this->getAvailableTimeSlots($activityId, 30);
        
        return [
            'activity' => $this->formatActivityDetails($activity, $language),
            'available_slots' => $availableSlots,
            'equipment' => $this->formatEquipment($activity->equipment, $language),
            'cancellation_policy' => $this->getCancellationPolicy($activity, $language),
        ];
    }
    
    public function getAvailableTimeSlots($activityId, $daysAhead = 30, $date = null)
    {
        $activity = MobileActivity::findOrFail($activityId);
        
        if ($date) {
            $startDate = Carbon::parse($date);
            $endDate = $startDate->copy();
        } else {
            $startDate = Carbon::tomorrow(); // Can't book for today
            $endDate = Carbon::today()->addDays($daysAhead);
        }
        
        $slots = MobileActivityTimeSlot::where('activity_id', $activityId)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->where('status', 'available')
            ->whereRaw('max_participants > current_bookings')
            ->where('date', '>=', now()->addHours($activity->booking_advance_hours)->toDateString())
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();
        
        $result = [];
        foreach ($slots as $slot) {
            $availableSpots = $slot->max_participants - $slot->current_bookings;
            
            $result[] = [
                'id' => $slot->id,
                'date' => $slot->date,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'available_spots' => $availableSpots,
                'price_adult' => $slot->price_adult ?? $activity->price_adult,
                'price_child' => $slot->price_child ?? $activity->price_child,
                'guide_name' => $slot->guide ? $slot->guide->name : null,
                'weather_status' => $slot->weather_status,
                'special_notes' => [
                    'en' => $slot->special_notes_en,
                    'th' => $slot->special_notes_th,
                ]
            ];
        }
        
        return $result;
    }
    
    public function searchActivities($query, $filters = [], $language = 'en')
    {
        $searchQuery = MobileActivity::where('is_available', true);
        
        // Full-text search
        if ($query) {
            if ($language === 'th') {
                $searchQuery->whereRaw("MATCH(name_th, description_th, short_description_th) AGAINST(? IN BOOLEAN MODE)", [$query]);
            } else {
                $searchQuery->whereRaw("MATCH(name_en, description_en, short_description_en) AGAINST(? IN BOOLEAN MODE)", [$query]);
            }
        }
        
        // Apply filters
        if (isset($filters['category_id'])) {
            $searchQuery->where('category_id', $filters['category_id']);
        }
        
        if (isset($filters['difficulty_levels'])) {
            $searchQuery->whereIn('difficulty_level', $filters['difficulty_levels']);
        }
        
        if (isset($filters['price_range'])) {
            $searchQuery->whereBetween('price_adult', [
                $filters['price_range']['min'],
                $filters['price_range']['max']
            ]);
        }
        
        if (isset($filters['duration_range'])) {
            $searchQuery->whereBetween('duration_minutes', [
                $filters['duration_range']['min'],
                $filters['duration_range']['max']
            ]);
        }
        
        if (isset($filters['features'])) {
            foreach ($filters['features'] as $feature) {
                switch ($feature) {
                    case 'equipment_provided':
                        $searchQuery->where('is_equipment_provided', true);
                        break;
                    case 'transportation_included':
                        $searchQuery->where('is_transportation_included', true);
                        break;
                    case 'meal_included':
                        $searchQuery->where('is_meal_included', true);
                        break;
                    case 'photo_service':
                        $searchQuery->where('is_photo_service_included', true);
                        break;
                    case 'weather_independent':
                        $searchQuery->where('is_weather_dependent', false);
                        break;
                }
            }
        }
        
        if (isset($filters['age_suitable_for'])) {
            $age = $filters['age_suitable_for'];
            $searchQuery->where(function ($q) use ($age) {
                $q->whereNull('age_restriction_min')
                  ->orWhere('age_restriction_min', '<=', $age);
            })->where(function ($q) use ($age) {
                $q->whereNull('age_restriction_max')
                  ->orWhere('age_restriction_max', '>=', $age);
            });
        }
        
        return $searchQuery->with(['category', 'media'])
            ->orderByDesc('is_featured')
            ->paginate(20);
    }
    
    private function formatActivities($activities, $language)
    {
        return $activities->map(function ($activity) use ($language) {
            return [
                'id' => $activity->id,
                'name' => $language === 'th' ? $activity->name_th : $activity->name_en,
                'short_description' => $language === 'th' ? $activity->short_description_th : $activity->short_description_en,
                'price_adult' => $activity->price_adult,
                'price_child' => $activity->price_child,
                'duration_minutes' => $activity->duration_minutes,
                'difficulty_level' => $activity->difficulty_level,
                'max_participants' => $activity->max_participants,
                'is_featured' => $activity->is_featured,
                'is_weather_dependent' => $activity->is_weather_dependent,
                'cover_image' => $activity->media->where('is_cover', true)->first()?->media_url,
                'rating_average' => $this->getActivityRating($activity->id),
                'next_available_slot' => $this->getNextAvailableSlot($activity->id),
            ];
        });
    }
    
    private function formatActivityDetails($activity, $language)
    {
        return [
            'id' => $activity->id,
            'category' => [
                'id' => $activity->category->id,
                'name' => $language === 'th' ? $activity->category->name_th : $activity->category->name_en,
            ],
            'name' => $language === 'th' ? $activity->name_th : $activity->name_en,
            'description' => $language === 'th' ? $activity->description_th : $activity->description_en,
            'short_description' => $language === 'th' ? $activity->short_description_th : $activity->short_description_en,
            'price_adult' => $activity->price_adult,
            'price_child' => $activity->price_child,
            'price_group' => $activity->price_group,
            'duration_minutes' => $activity->duration_minutes,
            'max_participants' => $activity->max_participants,
            'min_participants' => $activity->min_participants,
            'difficulty_level' => $activity->difficulty_level,
            'physical_requirements' => $language === 'th' ? $activity->physical_requirements_th : $activity->physical_requirements_en,
            'what_to_bring' => $language === 'th' ? $activity->what_to_bring_th : $activity->what_to_bring_en,
            'safety_instructions' => $language === 'th' ? $activity->safety_instructions_th : $activity->safety_instructions_en,
            'meeting_point' => $language === 'th' ? $activity->meeting_point_th : $activity->meeting_point_en,
            'location' => [
                'name' => $activity->location_name,
                'lat' => $activity->location_lat,
                'lng' => $activity->location_lng,
            ],
            'features' => [
                'weather_dependent' => $activity->is_weather_dependent,
                'equipment_provided' => $activity->is_equipment_provided,
                'transportation_included' => $activity->is_transportation_included,
                'meal_included' => $activity->is_meal_included,
                'photo_service_included' => $activity->is_photo_service_included,
                'requires_swimming' => $activity->requires_swimming,
                'requires_certification' => $activity->requires_certification,
            ],
            'restrictions' => [
                'age_min' => $activity->age_restriction_min,
                'age_max' => $activity->age_restriction_max,
                'fitness_level' => $activity->fitness_level_required,
            ],
            'booking_policy' => [
                'advance_hours' => $activity->booking_advance_hours,
                'cancellation_hours' => $activity->cancellation_hours,
            ],
            'media' => $activity->media->map(function ($media) use ($language) {
                return [
                    'type' => $media->media_type,
                    'url' => $media->media_url,
                    'thumbnail_url' => $media->thumbnail_url,
                    'title' => $language === 'th' ? $media->title_th : $media->title_en,
                    'description' => $language === 'th' ? $media->description_th : $media->description_en,
                    'is_cover' => $media->is_cover,
                    'duration_seconds' => $media->duration_seconds,
                ];
            }),
            'rating_average' => $this->getActivityRating($activity->id),
            'total_reviews' => $this->getActivityReviewCount($activity->id),
        ];
    }
    
    private function getActivityRating($activityId)
    {
        return MobileActivityBooking::whereHas('timeSlot', function ($query) use ($activityId) {
            $query->where('activity_id', $activityId);
        })->whereNotNull('guest_rating')->avg('guest_rating') ?? 0;
    }
    
    private function getActivityReviewCount($activityId)
    {
        return MobileActivityBooking::whereHas('timeSlot', function ($query) use ($activityId) {
            $query->where('activity_id', $activityId);
        })->whereNotNull('guest_review')->count();
    }
    
    private function getNextAvailableSlot($activityId)
    {
        $slot = MobileActivityTimeSlot::where('activity_id', $activityId)
            ->where('status', 'available')
            ->whereRaw('max_participants > current_bookings')
            ->where('date', '>=', Carbon::tomorrow()->toDateString())
            ->orderBy('date')
            ->orderBy('start_time')
            ->first();
        
        return $slot ? [
            'date' => $slot->date,
            'start_time' => $slot->start_time,
            'available_spots' => $slot->max_participants - $slot->current_bookings,
        ] : null;
    }
}

<?php
// app/Services/Mobile/ActivityBookingService.php

namespace App\Services\Mobile;

use App\Models\MobileActivityBooking;
use App\Models\MobileActivityTimeSlot;
use App\Models\MobileActivityBookingEquipment;
use App\Services\NotificationService;
use App\Services\PaymentService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ActivityBookingService
{
    protected $notificationService;
    protected $paymentService;
    
    public function __construct(NotificationService $notificationService, PaymentService $paymentService)
    {
        $this->notificationService = $notificationService;
        $this->paymentService = $paymentService;
    }
    
    public function createBooking($guestId, $bookingData)
    {
        return DB::transaction(function () use ($guestId, $bookingData) {
            $timeSlot = MobileActivityTimeSlot::with('activity')->findOrFail($bookingData['time_slot_id']);
            
            // Check availability
            $this->validateAvailability($timeSlot, $bookingData['total_participants']);
            
            // Check booking advance requirements
            $this->validateBookingAdvance($timeSlot);
            
            // Calculate pricing
            $pricing = $this->calculatePricing($timeSlot, $bookingData);
            
            // Create booking
            $booking = MobileActivityBooking::create([
                'booking_number' => $this->generateBookingNumber(),
                'guest_id' => $guestId,
                'time_slot_id' => $bookingData['time_slot_id'],
                'booking_type' => $bookingData['booking_type'] ?? 'individual',
                'adults_count' => $bookingData['adults_count'],
                'children_count' => $bookingData['children_count'] ?? 0,
                'total_participants' => $bookingData['total_participants'],
                'price_per_adult' => $pricing['price_per_adult'],
                'price_per_child' => $pricing['price_per_child'],
                'subtotal' => $pricing['subtotal'],
                'discount_amount' => $pricing['discount_amount'],
                'tax_amount' => $pricing['tax_amount'],
                'total_amount' => $pricing['total_amount'],
                'payment_method' => $bookingData['payment_method'],
                'special_requirements' => $bookingData['special_requirements'] ?? null,
                'dietary_restrictions' => $bookingData['dietary_restrictions'] ?? null,
                'emergency_contact_name' => $bookingData['emergency_contact_name'],
                'emergency_contact_phone' => $bookingData['emergency_contact_phone'],
                'pickup_location' => $bookingData['pickup_location'] ?? null,
                'participant_details' => $bookingData['participant_details'] ?? null,
            ]);
            
            // Reserve equipment if requested
            if (isset($bookingData['equipment_requests'])) {
                $this->reserveEquipment($booking, $bookingData['equipment_requests']);
            }
            
            // Update time slot availability
            $timeSlot->increment('current_bookings', $bookingData['total_participants']);
            
            // Send confirmation
            $this->notificationService->sendActivityBookingConfirmation($booking);
            
            return $booking->load('timeSlot.activity', 'equipmentBookings.equipment');
        });
    }
    
    public function checkInGuest($bookingId, $staffId, $checkType, $checklistData)
    {
        $booking = MobileActivityBooking::findOrFail($bookingId);
        
        // Create check-in record
        $checkin = MobileActivityCheckin::create([
            'booking_id' => $bookingId,
            'staff_id' => $staffId,
            'check_type' => $checkType,
            'status' => 'completed',
            'checklist_items' => $checklistData['checklist_items'] ?? null,
            'notes' => $checklistData['notes'] ?? null,
            'signature_data' => $checklistData['signature'] ?? null,
            'photo_urls' => $checklistData['photos'] ?? null,
            'location_lat' => $checklistData['location']['lat'] ?? null,
            'location_lng' => $checklistData['location']['lng'] ?? null,
            'completed_at' => now(),
        ]);
        
        // Update booking status based on check type
        switch ($checkType) {
            case 'pre_activity':
                $booking->update(['status' => 'checked_in', 'checked_in_at' => now()]);
                break;
            case 'activity_start':
                $booking->update(['status' => 'in_progress', 'started_at' => now()]);
                break;
            case 'activity_end':
                $booking->update(['status' => 'completed', 'completed_at' => now()]);
                break;
        }
        
        // Send status update notification
        $this->notificationService->sendActivityStatusUpdate($booking);
        
        return $checkin;
    }
    
    public function cancelBooking($bookingId, $reason = null, $initiatedBy = 'guest')
    {
        return DB::transaction(function () use ($bookingId, $reason, $initiatedBy) {
            $booking = MobileActivityBooking::with('timeSlot.activity')->findOrFail($bookingId);
            
            // Check if cancellation is allowed
            $this->validateCancellation($booking);
            
            // Calculate refund amount
            $refundAmount = $this->calculateRefund($booking);
            
            // Update booking
            $booking->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $reason,
                'refund_amount' => $refundAmount,
            ]);
            
            // Release time slot capacity
            $booking->timeSlot->decrement('current_bookings', $booking->total_participants);
            
            // Release equipment reservations
            $booking->equipmentBookings()->update(['status' => 'cancelled']);
            
            // Process refund if applicable
            if ($refundAmount > 0) {
                $this->paymentService->processRefund($booking, $refundAmount);
            }
            
            // Send cancellation notification
            $this->notificationService->sendActivityCancellationNotification($booking, $initiatedBy);
            
            return $booking;
        });
    }
    
    public function submitReview($bookingId, $rating, $review = null, $photos = [])
    {
        $booking = MobileActivityBooking::findOrFail($bookingId);
        
        // Validate booking status
        if (!in_array($booking->status, ['completed'])) {
            throw new \Exception('Can only review completed activities');
        }
        
        // Check if already reviewed
        if ($booking->guest_rating) {
            throw new \Exception('Activity already reviewed');
        }
        
        $booking->update([
            'guest_rating' => $rating,
            'guest_review' => $review,
            'review_submitted_at' => now(),
        ]);
        
        // Store review photos if provided
        if (!empty($photos)) {
            $this->storeReviewPhotos($booking, $photos);
        }
        
        return $booking;
    }
    
    private function validateAvailability($timeSlot, $requestedParticipants)
    {
        $availableSpots = $timeSlot->max_participants - $timeSlot->current_bookings;
        
        if ($availableSpots < $requestedParticipants) {
            throw new \Exception("Only {$availableSpots} spots available for this time slot");
        }
        
        if ($timeSlot->status !== 'available') {
            throw new \Exception('This time slot is no longer available');
        }
    }
    
    private function validateBookingAdvance($timeSlot)
    {
        $activity = $timeSlot->activity;
        $requiredAdvance = $activity->booking_advance_hours;
        
        $slotDateTime = Carbon::parse($timeSlot->date . ' ' . $timeSlot->start_time);
        $hoursDifference = now()->diffInHours($slotDateTime, false);
        
        if ($hoursDifference < $requiredAdvance) {
            throw new \Exception("Must book at least {$requiredAdvance} hours in advance");
        }
    }
    
    private function calculatePricing($timeSlot, $bookingData)
    {
        $activity = $timeSlot->activity;
        
        $priceAdult = $timeSlot->price_adult ?? $activity->price_adult;
        $priceChild = $timeSlot->price_child ?? $activity->price_child;
        
        $adultTotal = $bookingData['adults_count'] * $priceAdult;
        $childTotal = ($bookingData['children_count'] ?? 0) * $priceChild;
        
        $subtotal = $adultTotal + $childTotal;
        
        // Apply group pricing if applicable
        if ($bookingData['booking_type'] === 'group' && $activity->price_group && $bookingData['total_participants'] >= 6) {
            $subtotal = $activity->price_group;
        }
        
        // Apply discounts (if any)
        $discountAmount = 0; // Would implement discount logic here
        
        // Calculate tax
        $taxAmount = ($subtotal - $discountAmount) * 0.07; // 7% VAT
        
        $totalAmount = $subtotal - $discountAmount + $taxAmount;
        
        return [
            'price_per_adult' => $priceAdult,
            'price_per_child' => $priceChild,
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
        ];
    }
    
    private function reserveEquipment($booking, $equipmentRequests)
    {
        foreach ($equipmentRequests as $request) {
            $equipment = MobileActivityEquipment::findOrFail($request['equipment_id']);
            
            // Check availability
            if ($equipment->available_quantity < $request['quantity']) {
                throw new \Exception("Not enough {$equipment->name_en} available");
            }
            
            // Create reservation
            MobileActivityBookingEquipment::create([
                'booking_id' => $booking->id,
                'equipment_id' => $equipment->id,
                'quantity' => $request['quantity'],
                'size' => $request['size'] ?? null,
                'rental_price' => $equipment->rental_price,
                'total_price' => $equipment->rental_price * $request['quantity'],
            ]);
            
            // Update availability
            $equipment->decrement('available_quantity', $request['quantity']);
        }
    }
    
    private function generateBookingNumber()
    {
        do {
            $number = 'AB' . date('Ymd') . Str::random(4);
        } while (MobileActivityBooking::where('booking_number', $number)->exists());
        
        return $number;
    }
    
    private function validateCancellation($booking)
    {
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            throw new \Exception('Cannot cancel booking with status: ' . $booking->status);
        }
        
        $activity = $booking->timeSlot->activity;
        $slotDateTime = Carbon::parse($booking->timeSlot->date . ' ' . $booking->timeSlot->start_time);
        $hoursUntilActivity = now()->diffInHours($slotDateTime, false);
        
        if ($hoursUntilActivity < $activity->cancellation_hours) {
            throw new \Exception("Cannot cancel less than {$activity->cancellation_hours} hours before the activity");
        }
    }
    
    private function calculateRefund($booking)
    {
        $activity = $booking->timeSlot->activity;
        $slotDateTime = Carbon::parse($booking->timeSlot->date . ' ' . $booking->timeSlot->start_time);
        $hoursUntilActivity = now()->diffInHours($slotDateTime, false);
        
        // Full refund if cancelled within policy period
        if ($hoursUntilActivity >= $activity->cancellation_hours) {
            return $booking->total_amount;
        }
        
        // No refund for late cancellations
        return 0;
    }
}
```

## Frontend Implementation (Flutter)

### Flutter Widgets and Screens

```dart
// lib/features/activities/screens/activities_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/widgets/search_bar.dart';
import '../bloc/activities_bloc.dart';
import '../widgets/activity_category_grid.dart';
import '../widgets/featured_activities_carousel.dart';
import '../widgets/activity_filter_chip.dart';

class ActivitiesScreen extends StatefulWidget {
  @override
  _ActivitiesScreenState createState() => _ActivitiesScreenState();
}

class _ActivitiesScreenState extends State<ActivitiesScreen> {
  String _searchQuery = '';
  Map<String, dynamic> _filters = {};
  
  @override
  void initState() {
    super.initState();
    context.read<ActivitiesBloc>().add(LoadActivitiesEvent());
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('กิจกรรม'),
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list),
            onPressed: () => _showFilterBottomSheet(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          context.read<ActivitiesBloc>().add(LoadActivitiesEvent());
        },
        child: Column(
          children: [
            _buildSearchSection(),
            _buildActiveFilters(),
            Expanded(
              child: BlocBuilder<ActivitiesBloc, ActivitiesState>(
                builder: (context, state) {
                  if (state is ActivitiesLoading) {
                    return Center(child: CircularProgressIndicator());
                  }
                  
                  if (state is ActivitiesError) {
                    return _buildErrorState(state.message);
                  }
                  
                  if (state is ActivitiesLoaded) {
                    return _buildActivitiesContent(state);
                  }
                  
                  return Container();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildSearchSection() {
    return Container(
      padding: EdgeInsets.all(16),
      child: CustomSearchBar(
        hintText: 'ค้นหากิจกรรม...',
        onChanged: (query) {
          setState(() => _searchQuery = query);
          _performSearch();
        },
      ),
    );
  }
  
  Widget _buildActiveFilters() {
    if (_filters.isEmpty) return SizedBox.shrink();
    
    return Container(
      height: 40,
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: _filters.entries.map((entry) {
          return ActivityFilterChip(
            label: _getFilterDisplayName(entry.key, entry.value),
            onRemove: () => _removeFilter(entry.key),
          );
        }).toList(),
      ),
    );
  }
  
  Widget _buildActivitiesContent(ActivitiesLoaded state) {
    if (_searchQuery.isNotEmpty || _filters.isNotEmpty) {
      return _buildSearchResults(state.searchResults);
    }
    
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (state.featuredActivities.isNotEmpty) ...[
            Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'กิจกรรมแนะนำ',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            ),
            FeaturedActivitiesCarousel(
              activities: state.featuredActivities,
              onActivityTap: (activity) => _navigateToActivityDetails(activity),
            ),
            SizedBox(height: 24),
          ],
          
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'หมวดหมู่กิจกรรม',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
          ),
          SizedBox(height: 16),
          
          ActivityCategoryGrid(
            categories: state.categories,
            onCategoryTap: (category) => _navigateToCategory(category),
            onActivityTap: (activity) => _navigateToActivityDetails(activity),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSearchResults(List<Activity> results) {
    if (results.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('ไม่พบกิจกรรมที่ค้นหา'),
            SizedBox(height: 8),
            Text('ลองเปลี่ยนคำค้นหาหรือปรับเงื่อนไขการกรอง'),
          ],
        ),
      );
    }
    
    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: results.length,
      itemBuilder: (context, index) {
        return ActivityCard(
          activity: results[index],
          onTap: () => _navigateToActivityDetails(results[index]),
        );
      },
    );
  }
  
  Widget _buildErrorState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: Colors.grey),
          SizedBox(height: 16),
          Text(message),
          SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => context.read<ActivitiesBloc>().add(LoadActivitiesEvent()),
            child: Text('ลองใหม่'),
          ),
        ],
      ),
    );
  }
  
  void _performSearch() {
    if (_searchQuery.isNotEmpty || _filters.isNotEmpty) {
      context.read<ActivitiesBloc>().add(SearchActivitiesEvent(_searchQuery, _filters));
    } else {
      context.read<ActivitiesBloc>().add(LoadActivitiesEvent());
    }
  }
  
  void _showFilterBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => ActivityFilterBottomSheet(
        currentFilters: _filters,
        onFiltersApplied: (filters) {
          setState(() => _filters = filters);
          _performSearch();
        },
      ),
    );
  }
  
  void _removeFilter(String key) {
    setState(() => _filters.remove(key));
    _performSearch();
  }
  
  void _navigateToActivityDetails(Activity activity) {
    Navigator.pushNamed(
      context,
      '/activity-details',
      arguments: activity.id,
    );
  }
  
  void _navigateToCategory(ActivityCategory category) {
    Navigator.pushNamed(
      context,
      '/category-activities',
      arguments: category.id,
    );
  }
  
  String _getFilterDisplayName(String key, dynamic value) {
    // Implementation for converting filter keys to display names
    switch (key) {
      case 'difficulty_level':
        return 'ระดับ: $value';
      case 'max_price':
        return 'ราคาสูงสุด: ฿$value';
      case 'max_duration':
        return 'ระยะเวลา: $value นาที';
      default:
        return '$key: $value';
    }
  }
}

// lib/features/activities/screens/activity_details_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/widgets/cached_network_image.dart';
import '../bloc/activity_details_bloc.dart';
import '../widgets/activity_media_gallery.dart';
import '../widgets/activity_info_tabs.dart';
import '../widgets/time_slots_bottom_sheet.dart';

class ActivityDetailsScreen extends StatefulWidget {
  final String activityId;
  
  const ActivityDetailsScreen({Key? key, required this.activityId}) : super(key: key);
  
  @override
  _ActivityDetailsScreenState createState() => _ActivityDetailsScreenState();
}

class _ActivityDetailsScreenState extends State<ActivityDetailsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ActivityDetailsBloc>().add(LoadActivityDetailsEvent(widget.activityId));
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<ActivityDetailsBloc, ActivityDetailsState>(
        builder: (context, state) {
          if (state is ActivityDetailsLoading) {
            return Center(child: CircularProgressIndicator());
          }
          
          if (state is ActivityDetailsError) {
            return _buildErrorState(state.message);
          }
          
          if (state is ActivityDetailsLoaded) {
            return _buildActivityDetails(state);
          }
          
          return Container();
        },
      ),
    );
  }
  
  Widget _buildActivityDetails(ActivityDetailsLoaded state) {
    final activity = state.activity;
    
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 300,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            background: ActivityMediaGallery(
              mediaItems: activity.media,
              heroTag: 'activity_${activity.id}',
            ),
          ),
          actions: [
            IconButton(
              icon: Icon(Icons.share),
              onPressed: () => _shareActivity(activity),
            ),
            IconButton(
              icon: Icon(Icons.favorite_border), // Would toggle based on favorites
              onPressed: () => _toggleFavorite(activity),
            ),
          ],
        ),
        
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildActivityHeader(activity),
                SizedBox(height: 16),
                _buildQuickInfo(activity),
                SizedBox(height: 24),
                ActivityInfoTabs(
                  activity: activity,
                  equipment: state.equipment,
                  cancellationPolicy: state.cancellationPolicy,
                ),
                SizedBox(height: 100), // Space for bottom button
              ],
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildActivityHeader(Activity activity) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: activity.category.colorCode.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                activity.category.name,
                style: TextStyle(
                  color: activity.category.colorCode,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Spacer(),
            if (activity.ratingAverage > 0) ...[
              Icon(Icons.star, color: Colors.amber, size: 16),
              SizedBox(width: 4),
              Text(
                activity.ratingAverage.toStringAsFixed(1),
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
              SizedBox(width: 4),
              Text(
                '(${activity.totalReviews})',
                style: TextStyle(color: Colors.grey[600], fontSize: 12),
              ),
            ],
          ],
        ),
        SizedBox(height: 8),
        
        Text(
          activity.name,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 8),
        
        Text(
          activity.shortDescription,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: Colors.grey[700],
          ),
        ),
      ],
    );
  }
  
  Widget _buildQuickInfo(Activity activity) {
    return Row(
      children: [
        _buildInfoChip(
          icon: Icons.access_time,
          label: '${activity.durationMinutes} นาที',
        ),
        SizedBox(width: 12),
        _buildInfoChip(
          icon: Icons.people,
          label: '${activity.minParticipants}-${activity.maxParticipants} คน',
        ),
        SizedBox(width: 12),
        _buildInfoChip(
          icon: Icons.trending_up,
          label: activity.difficultyLevel,
          color: _getDifficultyColor(activity.difficultyLevel),
        ),
      ],
    );
  }
  
  Widget _buildInfoChip({
    required IconData icon,
    required String label,
    Color? color,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: (color ?? Colors.grey).withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: color ?? Colors.grey[600],
          ),
          SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color ?? Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildErrorState(String message) {
    return Scaffold(
      appBar: AppBar(),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(message),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                context.read<ActivityDetailsBloc>()
                    .add(LoadActivityDetailsEvent(widget.activityId));
              },
              child: Text('ลองใหม่'),
            ),
          ],
        ),
      ),
    );
  }
  
  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Colors.green;
      case 'moderate':
        return Colors.orange;
      case 'challenging':
        return Colors.red;
      case 'expert':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }
  
  void _shareActivity(Activity activity) {
    // Implementation for sharing activity
  }
  
  void _toggleFavorite(Activity activity) {
    // Implementation for toggling favorites
  }
}
```

## Testing Strategy

### Unit Tests
```dart
// test/features/activities/services/activity_booking_service_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('ActivityBookingService', () {
    late ActivityBookingService service;
    
    setUp(() {
      service = ActivityBookingService();
    });
    
    test('should create booking with correct pricing', () async {
      final bookingData = {
        'time_slot_id': '1',
        'adults_count': 2,
        'children_count': 1,
        'total_participants': 3,
        'payment_method': 'room_charge',
      };
      
      final result = await service.createBooking('guest123', bookingData);
      
      expect(result.bookingNumber, isNotNull);
      expect(result.totalParticipants, equals(3));
      expect(result.status, equals('pending'));
    });
    
    test('should validate availability before booking', () async {
      final timeSlot = MockTimeSlot();
      when(timeSlot.maxParticipants).thenReturn(10);
      when(timeSlot.currentBookings).thenReturn(8);
      
      expect(
        () => service.validateAvailability(timeSlot, 5),
        throwsA(isA<Exception>()),
      );
    });
  });
}
```

## Implementation Plan

### Day 1-2: Database and Core Services
- Create all activity-related database tables
- Implement activity search and filtering service
- Set up media management for activities
- Create time slot management system

### Day 3-4: Booking System
- Implement activity booking service
- Add equipment reservation functionality
- Create check-in/check-out system
- Set up payment integration

### Day 5: Mobile Interface
- Build activity discovery screens
- Implement activity details and booking flow
- Add booking management features
- Create staff activity management tools

### Day 6: Testing and Optimization
- Comprehensive testing suite
- Performance optimization
- Bug fixes and refinements
- Documentation completion

## Success Metrics
- Activity booking conversion rate > 60%
- Search response time < 300ms
- Guest satisfaction with activity experience > 4.7/5
- Staff efficiency improvement of 30% in activity management
- Equipment utilization rate > 80%
