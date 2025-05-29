# Issue #02: Guest Profile & Preferences Management

## Overview
Develop a comprehensive guest profile and preferences management system that learns from guest behavior, manages loyalty programs, and provides personalized experiences throughout their stay at Banrimkwae Resort. This system will include AI-driven preference learning, detailed guest profiles, and intelligent recommendation engines.

## Priority
**High** - Core personalization foundation

## Estimated Timeline
**7 days** (Week 2 of Phase 6)

## Requirements

### 2.1 Guest Profile Management
- **Comprehensive Profiles**: Personal information, contact details, emergency contacts
- **Preference Tracking**: Dining preferences, activity interests, accommodation needs
- **Special Requirements**: Accessibility needs, dietary restrictions, medical considerations
- **Document Management**: ID verification, travel documents, reservation confirmations
- **Family/Group Management**: Linked profiles for families and travel groups

### 2.2 Preference Learning System
- **Behavioral Analysis**: Track user interactions and preferences automatically
- **AI Recommendations**: Machine learning-based personalized suggestions
- **Pattern Recognition**: Identify guest behavior patterns and preferences
- **Feedback Integration**: Learn from guest ratings and feedback
- **Predictive Preferences**: Anticipate needs based on historical data

### 2.3 Loyalty Program Integration
- **Points Management**: Earn and redeem loyalty points
- **Tier Management**: Silver, Gold, Platinum membership levels
- **Exclusive Benefits**: Member-only perks and early access
- **Anniversary Tracking**: Special occasion recognition and rewards
- **Partner Benefits**: Integration with partner programs and airlines

### 2.4 Communication Preferences
- **Channel Preferences**: Email, SMS, push notifications, in-app messaging
- **Frequency Settings**: Marketing communications, service updates, emergency alerts
- **Language Preferences**: Multi-language support with automatic detection
- **Time Zone Management**: Respect guest time zones for communications
- **Privacy Controls**: Granular privacy settings and data sharing controls

### 2.5 Personalization Engine
- **Dynamic Content**: Personalized home screen content and recommendations
- **Smart Suggestions**: Context-aware activity and dining recommendations
- **Adaptive Interface**: UI adapts to user behavior and preferences
- **Contextual Offers**: Time and location-based personalized offers
- **Experience Customization**: Tailored experiences based on guest profile

## Technical Specifications

### 2.6 Database Schema

#### Guest Profile Tables
```sql
-- Enhanced guest profiles
CREATE TABLE guest_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    profile_completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    nationality VARCHAR(100),
    passport_number VARCHAR(50),
    passport_expiry DATE,
    phone_country_code VARCHAR(10),
    phone_number VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(30),
    emergency_contact_relationship VARCHAR(100),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    occupation VARCHAR(255),
    company VARCHAR(255),
    anniversary_date DATE,
    special_occasions JSON,
    accessibility_needs JSON,
    medical_conditions TEXT,
    insurance_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_profile (user_id),
    INDEX idx_date_of_birth (date_of_birth),
    INDEX idx_nationality (nationality)
);

-- Comprehensive guest preferences
CREATE TABLE guest_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    category ENUM('dining', 'activities', 'accommodation', 'spa', 'communication', 'general') NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSON NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.50, -- AI confidence in this preference
    source ENUM('explicit', 'implicit', 'inferred', 'feedback') DEFAULT 'explicit',
    last_confirmed_at TIMESTAMP,
    weight DECIMAL(3,2) DEFAULT 1.00, -- Importance weight
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preference (user_id, category, preference_key),
    INDEX idx_category (category),
    INDEX idx_confidence (confidence_score),
    INDEX idx_source (source)
);

-- Guest behavior tracking
CREATE TABLE guest_behavior_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(255),
    action_type ENUM('view', 'click', 'book', 'cancel', 'rate', 'search', 'share') NOT NULL,
    entity_type ENUM('room', 'restaurant', 'activity', 'spa', 'service', 'content') NOT NULL,
    entity_id BIGINT,
    entity_metadata JSON,
    context_data JSON, -- time of day, weather, location, etc.
    duration_seconds INT, -- time spent on action
    rating DECIMAL(2,1), -- if applicable
    feedback TEXT,
    device_type ENUM('mobile', 'tablet', 'web') DEFAULT 'mobile',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_behavior (user_id, created_at),
    INDEX idx_action_entity (action_type, entity_type),
    INDEX idx_session (session_id),
    INDEX idx_entity (entity_type, entity_id)
);

-- Loyalty program
CREATE TABLE loyalty_memberships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    membership_number VARCHAR(50) UNIQUE NOT NULL,
    tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
    points_balance INT DEFAULT 0,
    points_lifetime_earned INT DEFAULT 0,
    tier_progress_points INT DEFAULT 0,
    next_tier_threshold INT,
    tier_expiry_date DATE,
    enrollment_date DATE NOT NULL,
    last_activity_date DATE,
    referral_code VARCHAR(20) UNIQUE,
    referred_by_user_id BIGINT,
    anniversary_bonus_eligible BOOLEAN DEFAULT true,
    special_status JSON, -- VIP flags, corporate discounts, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_membership_number (membership_number),
    INDEX idx_tier (tier),
    INDEX idx_points_balance (points_balance),
    INDEX idx_referral_code (referral_code)
);

-- Loyalty points transactions
CREATE TABLE loyalty_points_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    transaction_type ENUM('earn', 'redeem', 'expire', 'bonus', 'adjustment') NOT NULL,
    points_amount INT NOT NULL,
    points_balance_after INT NOT NULL,
    source_type ENUM('booking', 'dining', 'spa', 'activity', 'referral', 'review', 'birthday', 'anniversary', 'manual') NOT NULL,
    source_id BIGINT,
    source_reference VARCHAR(255),
    description TEXT,
    expiry_date DATE, -- for earned points
    processed_by_user_id BIGINT, -- for manual adjustments
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_transactions (user_id, created_at),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_source (source_type, source_id),
    INDEX idx_expiry (expiry_date)
);

-- Communication preferences
CREATE TABLE communication_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    email_marketing BOOLEAN DEFAULT true,
    email_service_updates BOOLEAN DEFAULT true,
    email_emergency_alerts BOOLEAN DEFAULT true,
    sms_marketing BOOLEAN DEFAULT false,
    sms_service_updates BOOLEAN DEFAULT true,
    sms_emergency_alerts BOOLEAN DEFAULT true,
    push_marketing BOOLEAN DEFAULT true,
    push_service_updates BOOLEAN DEFAULT true,
    push_emergency_alerts BOOLEAN DEFAULT true,
    inapp_marketing BOOLEAN DEFAULT true,
    inapp_service_updates BOOLEAN DEFAULT true,
    preferred_contact_method ENUM('email', 'sms', 'push', 'inapp') DEFAULT 'push',
    marketing_frequency ENUM('daily', 'weekly', 'monthly', 'never') DEFAULT 'weekly',
    language_preference VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50),
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_communication (user_id)
);

-- Guest recommendations
CREATE TABLE guest_recommendations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    recommendation_type ENUM('room', 'restaurant', 'activity', 'spa', 'service', 'offer') NOT NULL,
    entity_id BIGINT NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL,
    reasoning JSON, -- explanation of why this was recommended
    context_factors JSON, -- time, weather, previous bookings, etc.
    display_priority INT DEFAULT 0,
    shown_count INT DEFAULT 0,
    clicked BOOLEAN DEFAULT false,
    clicked_at TIMESTAMP NULL,
    converted BOOLEAN DEFAULT false, -- user took action (booked, etc.)
    converted_at TIMESTAMP NULL,
    feedback_rating DECIMAL(2,1),
    feedback_comment TEXT,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_recommendations (user_id, is_active, display_priority),
    INDEX idx_recommendation_type (recommendation_type),
    INDEX idx_confidence (confidence_score),
    INDEX idx_expires_at (expires_at)
);
```

### 2.7 Laravel Backend Implementation

#### Guest Profile Service
```php
<?php

namespace App\Services\Mobile;

use App\Models\User;
use App\Models\GuestProfile;
use App\Models\GuestPreference;
use App\Models\GuestBehaviorLog;
use App\Models\LoyaltyMembership;
use App\Models\CommunicationPreference;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class GuestProfileService
{
    public function getCompleteProfile(int $userId): array
    {
        $cacheKey = "guest_profile_{$userId}";
        
        return Cache::remember($cacheKey, 3600, function () use ($userId) {
            $user = User::with([
                'profile',
                'preferences',
                'loyaltyMembership',
                'communicationPreferences'
            ])->findOrFail($userId);

            return [
                'user' => $user,
                'profile_completion' => $this->calculateProfileCompletion($user),
                'recommendations' => $this->getPersonalizedRecommendations($userId),
                'loyalty_status' => $this->getLoyaltyStatus($userId),
                'recent_activity' => $this->getRecentActivity($userId),
                'preferences_summary' => $this->getPreferencesSummary($userId)
            ];
        });
    }

    public function updateProfile(int $userId, array $profileData): GuestProfile
    {
        DB::beginTransaction();
        
        try {
            $profile = GuestProfile::updateOrCreate(
                ['user_id' => $userId],
                $profileData
            );

            // Calculate and update profile completion
            $completionPercentage = $this->calculateProfileCompletion($profile->user);
            $profile->update(['profile_completion_percentage' => $completionPercentage]);

            // Clear cache
            Cache::forget("guest_profile_{$userId}");

            DB::commit();
            return $profile;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updatePreferences(int $userId, array $preferences): array
    {
        DB::beginTransaction();
        
        try {
            $updatedPreferences = [];

            foreach ($preferences as $category => $categoryPrefs) {
                foreach ($categoryPrefs as $key => $value) {
                    $preference = GuestPreference::updateOrCreate(
                        [
                            'user_id' => $userId,
                            'category' => $category,
                            'preference_key' => $key
                        ],
                        [
                            'preference_value' => json_encode($value),
                            'source' => 'explicit',
                            'confidence_score' => 1.00,
                            'last_confirmed_at' => now()
                        ]
                    );
                    
                    $updatedPreferences[] = $preference;
                }
            }

            // Clear cache and trigger recommendation refresh
            Cache::forget("guest_profile_{$userId}");
            $this->triggerRecommendationRefresh($userId);

            DB::commit();
            return $updatedPreferences;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function logBehavior(int $userId, array $behaviorData): GuestBehaviorLog
    {
        $log = GuestBehaviorLog::create([
            'user_id' => $userId,
            'session_id' => $behaviorData['session_id'] ?? session()->getId(),
            'action_type' => $behaviorData['action_type'],
            'entity_type' => $behaviorData['entity_type'],
            'entity_id' => $behaviorData['entity_id'] ?? null,
            'entity_metadata' => $behaviorData['entity_metadata'] ?? null,
            'context_data' => $behaviorData['context_data'] ?? null,
            'duration_seconds' => $behaviorData['duration_seconds'] ?? null,
            'rating' => $behaviorData['rating'] ?? null,
            'feedback' => $behaviorData['feedback'] ?? null,
            'device_type' => $behaviorData['device_type'] ?? 'mobile',
            'location_lat' => $behaviorData['location_lat'] ?? null,
            'location_lng' => $behaviorData['location_lng'] ?? null
        ]);

        // Async process for preference learning
        $this->processImplicitPreferences($userId, $behaviorData);

        return $log;
    }

    public function getPersonalizedRecommendations(int $userId, int $limit = 10): array
    {
        // Get user preferences and behavior
        $preferences = GuestPreference::where('user_id', $userId)
            ->where('is_active', true)
            ->get()
            ->groupBy('category');

        $recentBehavior = GuestBehaviorLog::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->take(100)
            ->get();

        // Generate recommendations based on ML algorithm
        $recommendations = $this->generateMLRecommendations($userId, $preferences, $recentBehavior);

        return $recommendations->take($limit);
    }

    private function calculateProfileCompletion(User $user): float
    {
        $requiredFields = [
            'email', 'first_name', 'last_name', 'phone_number',
            'date_of_birth', 'nationality', 'address_line1', 'city', 'country'
        ];

        $profile = $user->profile;
        if (!$profile) return 0.0;

        $completedFields = 0;
        $totalFields = count($requiredFields);

        foreach ($requiredFields as $field) {
            if ($field === 'email' || $field === 'first_name' || $field === 'last_name') {
                if (!empty($user->$field)) $completedFields++;
            } else {
                if (!empty($profile->$field)) $completedFields++;
            }
        }

        // Bonus points for optional but valuable fields
        if ($profile->avatar_url) $completedFields += 0.5;
        if ($profile->emergency_contact_name) $completedFields += 0.5;
        if ($profile->occupation) $completedFields += 0.3;
        if ($profile->anniversary_date) $completedFields += 0.2;

        return min(100, ($completedFields / $totalFields) * 100);
    }

    private function processImplicitPreferences(int $userId, array $behaviorData): void
    {
        // Queue job for ML processing
        \Queue::push(new \App\Jobs\ProcessImplicitPreferences($userId, $behaviorData));
    }

    private function generateMLRecommendations(int $userId, $preferences, $recentBehavior): \Illuminate\Support\Collection
    {
        // Simplified ML algorithm - in production, this would use proper ML models
        $recommendations = collect();

        // Content-based filtering
        $contentRecommendations = $this->getContentBasedRecommendations($userId, $preferences);
        
        // Collaborative filtering
        $collaborativeRecommendations = $this->getCollaborativeRecommendations($userId, $recentBehavior);
        
        // Hybrid approach combining both
        $hybridRecommendations = $contentRecommendations->merge($collaborativeRecommendations)
            ->sortByDesc('confidence_score')
            ->unique('entity_id');

        return $hybridRecommendations;
    }

    private function getContentBasedRecommendations(int $userId, $preferences): \Illuminate\Support\Collection
    {
        // Implementation for content-based filtering
        return collect();
    }

    private function getCollaborativeRecommendations(int $userId, $recentBehavior): \Illuminate\Support\Collection
    {
        // Implementation for collaborative filtering
        return collect();
    }

    private function triggerRecommendationRefresh(int $userId): void
    {
        Cache::forget("recommendations_{$userId}");
        \Queue::push(new \App\Jobs\RefreshUserRecommendations($userId));
    }

    private function getLoyaltyStatus(int $userId): array
    {
        $loyalty = LoyaltyMembership::where('user_id', $userId)->first();
        
        if (!$loyalty) {
            return ['tier' => 'none', 'points' => 0];
        }

        return [
            'tier' => $loyalty->tier,
            'points_balance' => $loyalty->points_balance,
            'points_to_next_tier' => $loyalty->next_tier_threshold - $loyalty->tier_progress_points,
            'tier_expiry' => $loyalty->tier_expiry_date,
            'benefits' => $this->getTierBenefits($loyalty->tier)
        ];
    }

    private function getRecentActivity(int $userId): array
    {
        return GuestBehaviorLog::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->toArray();
    }

    private function getPreferencesSummary(int $userId): array
    {
        return GuestPreference::where('user_id', $userId)
            ->where('is_active', true)
            ->get()
            ->groupBy('category')
            ->map(function ($preferences) {
                return $preferences->pluck('preference_value', 'preference_key');
            })
            ->toArray();
    }

    private function getTierBenefits(string $tier): array
    {
        $benefits = [
            'bronze' => ['Welcome bonus', 'Basic member pricing'],
            'silver' => ['Welcome bonus', 'Member pricing', 'Priority reservations', 'Late checkout'],
            'gold' => ['All Silver benefits', 'Room upgrades', 'Welcome amenity', 'Flexible cancellation'],
            'platinum' => ['All Gold benefits', 'Guaranteed availability', 'Personal concierge', 'VIP experiences']
        ];

        return $benefits[$tier] ?? [];
    }
}
```

#### Loyalty Points Service
```php
<?php

namespace App\Services\Mobile;

use App\Models\LoyaltyMembership;
use App\Models\LoyaltyPointsTransaction;
use Illuminate\Support\Facades\DB;

class LoyaltyPointsService
{
    private const TIER_THRESHOLDS = [
        'bronze' => 0,
        'silver' => 1000,
        'gold' => 5000,
        'platinum' => 15000
    ];

    private const EARNING_RATES = [
        'booking' => 10, // points per dollar
        'dining' => 5,
        'spa' => 8,
        'activity' => 6,
        'review' => 100,
        'referral' => 500,
        'birthday' => 200,
        'anniversary' => 300
    ];

    public function earnPoints(int $userId, string $sourceType, int $sourceId, float $amount, string $description = null): LoyaltyPointsTransaction
    {
        DB::beginTransaction();
        
        try {
            $membership = $this->ensureMembership($userId);
            $pointsToEarn = $this->calculatePointsToEarn($sourceType, $amount);
            
            $transaction = LoyaltyPointsTransaction::create([
                'user_id' => $userId,
                'transaction_type' => 'earn',
                'points_amount' => $pointsToEarn,
                'points_balance_after' => $membership->points_balance + $pointsToEarn,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'description' => $description,
                'expiry_date' => now()->addYears(2) // Points expire in 2 years
            ]);

            $membership->update([
                'points_balance' => $membership->points_balance + $pointsToEarn,
                'points_lifetime_earned' => $membership->points_lifetime_earned + $pointsToEarn,
                'tier_progress_points' => $membership->tier_progress_points + $pointsToEarn,
                'last_activity_date' => now()
            ]);

            $this->checkTierUpgrade($membership);

            DB::commit();
            return $transaction;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function redeemPoints(int $userId, int $pointsAmount, string $sourceType, int $sourceId, string $description = null): LoyaltyPointsTransaction
    {
        DB::beginTransaction();
        
        try {
            $membership = LoyaltyMembership::where('user_id', $userId)->firstOrFail();
            
            if ($membership->points_balance < $pointsAmount) {
                throw new \Exception('Insufficient points balance');
            }

            $transaction = LoyaltyPointsTransaction::create([
                'user_id' => $userId,
                'transaction_type' => 'redeem',
                'points_amount' => -$pointsAmount,
                'points_balance_after' => $membership->points_balance - $pointsAmount,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'description' => $description
            ]);

            $membership->update([
                'points_balance' => $membership->points_balance - $pointsAmount,
                'last_activity_date' => now()
            ]);

            DB::commit();
            return $transaction;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getPointsHistory(int $userId, int $limit = 50): \Illuminate\Pagination\LengthAwarePaginator
    {
        return LoyaltyPointsTransaction::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($limit);
    }

    public function getAvailableRedemptions(int $userId): array
    {
        $membership = LoyaltyMembership::where('user_id', $userId)->first();
        
        if (!$membership) {
            return [];
        }

        $redemptions = [
            ['name' => 'Room Upgrade', 'points' => 2000, 'available' => $membership->points_balance >= 2000],
            ['name' => 'Spa Credit $50', 'points' => 1500, 'available' => $membership->points_balance >= 1500],
            ['name' => 'Dining Credit $25', 'points' => 1000, 'available' => $membership->points_balance >= 1000],
            ['name' => 'Late Checkout', 'points' => 500, 'available' => $membership->points_balance >= 500],
            ['name' => 'Welcome Amenity', 'points' => 300, 'available' => $membership->points_balance >= 300]
        ];

        // Add tier-specific redemptions
        if ($membership->tier === 'gold' || $membership->tier === 'platinum') {
            $redemptions[] = ['name' => 'VIP Experience', 'points' => 5000, 'available' => $membership->points_balance >= 5000];
        }

        return $redemptions;
    }

    private function ensureMembership(int $userId): LoyaltyMembership
    {
        return LoyaltyMembership::firstOrCreate(
            ['user_id' => $userId],
            [
                'membership_number' => $this->generateMembershipNumber(),
                'tier' => 'bronze',
                'enrollment_date' => now(),
                'referral_code' => $this->generateReferralCode()
            ]
        );
    }

    private function calculatePointsToEarn(string $sourceType, float $amount): int
    {
        $rate = self::EARNING_RATES[$sourceType] ?? 1;
        
        if (in_array($sourceType, ['review', 'referral', 'birthday', 'anniversary'])) {
            return $rate; // Fixed amount for these activities
        }
        
        return (int) ($amount * $rate);
    }

    private function checkTierUpgrade(LoyaltyMembership $membership): void
    {
        $currentTier = $membership->tier;
        $newTier = $this->calculateTier($membership->tier_progress_points);
        
        if ($newTier !== $currentTier) {
            $membership->update([
                'tier' => $newTier,
                'tier_expiry_date' => now()->addYear()
            ]);

            // Send tier upgrade notification
            $this->sendTierUpgradeNotification($membership->user, $newTier);
        }
    }

    private function calculateTier(int $points): string
    {
        foreach (array_reverse(self::TIER_THRESHOLDS, true) as $tier => $threshold) {
            if ($points >= $threshold) {
                return $tier;
            }
        }
        return 'bronze';
    }

    private function generateMembershipNumber(): string
    {
        return 'BK' . now()->format('Y') . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function generateReferralCode(): string
    {
        return strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 8));
    }

    private function sendTierUpgradeNotification($user, string $newTier): void
    {
        // Implementation for sending tier upgrade notification
    }
}
```

### 2.8 Flutter Implementation

#### Profile Management BLoC
```dart
// lib/features/profile/bloc/profile_bloc.dart
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:injectable/injectable.dart';
import '../../../core/models/guest_profile.dart';
import '../../../core/models/user_preferences.dart';
import '../../../core/models/loyalty_status.dart';
import '../../../core/services/profile_service.dart';

part 'profile_event.dart';
part 'profile_state.dart';

@injectable
class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final ProfileService _profileService;

  ProfileBloc(this._profileService) : super(ProfileInitial()) {
    on<LoadProfile>(_onLoadProfile);
    on<UpdateProfile>(_onUpdateProfile);
    on<UpdatePreferences>(_onUpdatePreferences);
    on<LogBehavior>(_onLogBehavior);
    on<LoadRecommendations>(_onLoadRecommendations);
  }

  Future<void> _onLoadProfile(
    LoadProfile event,
    Emitter<ProfileState> emit,
  ) async {
    emit(ProfileLoading());

    try {
      final profileData = await _profileService.getCompleteProfile();
      
      emit(ProfileLoaded(
        profile: profileData.profile,
        preferences: profileData.preferences,
        loyaltyStatus: profileData.loyaltyStatus,
        recommendations: profileData.recommendations,
        profileCompletion: profileData.profileCompletion,
        recentActivity: profileData.recentActivity,
      ));
    } catch (e) {
      emit(ProfileError(message: e.toString()));
    }
  }

  Future<void> _onUpdateProfile(
    UpdateProfile event,
    Emitter<ProfileState> emit,
  ) async {
    if (state is ProfileLoaded) {
      final currentState = state as ProfileLoaded;
      emit(ProfileUpdating(currentState));

      try {
        final updatedProfile = await _profileService.updateProfile(event.profileData);
        
        emit(currentState.copyWith(
          profile: updatedProfile,
          profileCompletion: updatedProfile.profileCompletionPercentage,
        ));
      } catch (e) {
        emit(ProfileUpdateError(
          message: e.toString(),
          previousState: currentState,
        ));
      }
    }
  }

  Future<void> _onUpdatePreferences(
    UpdatePreferences event,
    Emitter<ProfileState> emit,
  ) async {
    if (state is ProfileLoaded) {
      final currentState = state as ProfileLoaded;

      try {
        await _profileService.updatePreferences(event.preferences);
        
        // Reload recommendations after preference update
        final recommendations = await _profileService.getRecommendations();
        
        emit(currentState.copyWith(
          preferences: event.preferences,
          recommendations: recommendations,
        ));
      } catch (e) {
        emit(ProfileError(message: e.toString()));
      }
    }
  }

  Future<void> _onLogBehavior(
    LogBehavior event,
    Emitter<ProfileState> emit,
  ) async {
    // Log behavior asynchronously without affecting UI state
    try {
      await _profileService.logBehavior(event.behaviorData);
    } catch (e) {
      // Silent fail for behavior logging
      print('Failed to log behavior: $e');
    }
  }

  Future<void> _onLoadRecommendations(
    LoadRecommendations event,
    Emitter<ProfileState> emit,
  ) async {
    if (state is ProfileLoaded) {
      final currentState = state as ProfileLoaded;

      try {
        final recommendations = await _profileService.getRecommendations();
        emit(currentState.copyWith(recommendations: recommendations));
      } catch (e) {
        // Don't emit error for recommendations failure
        print('Failed to load recommendations: $e');
      }
    }
  }
}
```

#### Profile Screen
```dart
// lib/features/profile/screens/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/profile_bloc.dart';
import '../widgets/profile_header.dart';
import '../widgets/profile_completion_card.dart';
import '../widgets/loyalty_status_card.dart';
import '../widgets/preferences_section.dart';
import '../widgets/recommendations_section.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/error_widget.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ProfileBloc>().add(LoadProfile());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<ProfileBloc, ProfileState>(
        builder: (context, state) {
          if (state is ProfileLoading) {
            return const LoadingWidget();
          }

          if (state is ProfileError) {
            return CustomErrorWidget(
              message: state.message,
              onRetry: () => context.read<ProfileBloc>().add(LoadProfile()),
            );
          }

          if (state is ProfileLoaded) {
            return RefreshIndicator(
              onRefresh: () async {
                context.read<ProfileBloc>().add(LoadProfile());
              },
              child: CustomScrollView(
                slivers: [
                  SliverAppBar(
                    expandedHeight: 200,
                    pinned: true,
                    flexibleSpace: FlexibleSpaceBar(
                      title: const Text('My Profile'),
                      background: ProfileHeader(
                        profile: state.profile,
                        loyaltyStatus: state.loyaltyStatus,
                      ),
                    ),
                  ),
                  
                  SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        // Profile Completion Card
                        ProfileCompletionCard(
                          completionPercentage: state.profileCompletion,
                          onTapComplete: () => _navigateToEditProfile(),
                        ),
                        
                        const SizedBox(height: 16),
                        
                        // Loyalty Status Card
                        LoyaltyStatusCard(
                          loyaltyStatus: state.loyaltyStatus,
                          onTapViewHistory: () => _navigateToLoyaltyHistory(),
                        ),
                        
                        const SizedBox(height: 24),
                        
                        // Preferences Section
                        PreferencesSection(
                          preferences: state.preferences,
                          onUpdatePreferences: (preferences) {
                            context.read<ProfileBloc>().add(
                              UpdatePreferences(preferences: preferences),
                            );
                          },
                        ),
                        
                        const SizedBox(height: 24),
                        
                        // Recommendations Section
                        RecommendationsSection(
                          recommendations: state.recommendations,
                          onRecommendationTap: (recommendation) {
                            _handleRecommendationTap(recommendation);
                          },
                        ),
                        
                        const SizedBox(height: 100), // Bottom padding
                      ]),
                    ),
                  ),
                ],
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }

  void _navigateToEditProfile() {
    // Navigate to edit profile screen
  }

  void _navigateToLoyaltyHistory() {
    // Navigate to loyalty history screen
  }

  void _handleRecommendationTap(dynamic recommendation) {
    // Log behavior
    context.read<ProfileBloc>().add(
      LogBehavior(
        behaviorData: {
          'action_type': 'click',
          'entity_type': recommendation.recommendationType,
          'entity_id': recommendation.entityId,
          'context_data': {
            'recommendation_id': recommendation.id,
            'confidence_score': recommendation.confidenceScore,
          },
        },
      ),
    );

    // Navigate to recommendation details
    _navigateToRecommendation(recommendation);
  }

  void _navigateToRecommendation(dynamic recommendation) {
    // Implementation for navigation based on recommendation type
  }
}
```

#### Preferences Widget
```dart
// lib/features/profile/widgets/preferences_section.dart
import 'package:flutter/material.dart';
import '../../../core/models/user_preferences.dart';

class PreferencesSection extends StatelessWidget {
  final UserPreferences preferences;
  final Function(UserPreferences) onUpdatePreferences;

  const PreferencesSection({
    Key? key,
    required this.preferences,
    required this.onUpdatePreferences,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'My Preferences',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                TextButton(
                  onPressed: () => _showPreferencesDialog(context),
                  child: const Text('Edit'),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            _buildPreferenceChips(context),
          ],
        ),
      ),
    );
  }

  Widget _buildPreferenceChips(BuildContext context) {
    final List<String> preferenceLabels = [];
    
    // Dining preferences
    if (preferences.dining.isVegetarian) preferenceLabels.add('Vegetarian');
    if (preferences.dining.isVegan) preferenceLabels.add('Vegan');
    if (preferences.dining.isGlutenFree) preferenceLabels.add('Gluten-Free');
    
    // Activity preferences
    if (preferences.activities.likesAdventure) preferenceLabels.add('Adventure');
    if (preferences.activities.likesRelaxation) preferenceLabels.add('Relaxation');
    if (preferences.activities.likesWaterSports) preferenceLabels.add('Water Sports');
    
    // Accommodation preferences
    if (preferences.accommodation.prefersSeaView) preferenceLabels.add('Sea View');
    if (preferences.accommodation.prefersHighFloor) preferenceLabels.add('High Floor');

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: preferenceLabels.map((label) {
        return Chip(
          label: Text(label),
          avatar: const Icon(Icons.favorite, size: 16),
        );
      }).toList(),
    );
  }

  void _showPreferencesDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => PreferencesEditDialog(
        preferences: preferences,
        onSave: onUpdatePreferences,
      ),
    );
  }
}

class PreferencesEditDialog extends StatefulWidget {
  final UserPreferences preferences;
  final Function(UserPreferences) onSave;

  const PreferencesEditDialog({
    Key? key,
    required this.preferences,
    required this.onSave,
  }) : super(key: key);

  @override
  State<PreferencesEditDialog> createState() => _PreferencesEditDialogState();
}

class _PreferencesEditDialogState extends State<PreferencesEditDialog> {
  late UserPreferences _editingPreferences;

  @override
  void initState() {
    super.initState();
    _editingPreferences = widget.preferences.copyWith();
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      maxChildSize: 0.9,
      builder: (context, scrollController) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Edit Preferences',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  TextButton(
                    onPressed: () {
                      widget.onSave(_editingPreferences);
                      Navigator.of(context).pop();
                    },
                    child: const Text('Save'),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              Expanded(
                child: ListView(
                  controller: scrollController,
                  children: [
                    _buildDiningPreferences(),
                    const SizedBox(height: 24),
                    _buildActivityPreferences(),
                    const SizedBox(height: 24),
                    _buildAccommodationPreferences(),
                    const SizedBox(height: 24),
                    _buildCommunicationPreferences(),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDiningPreferences() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Dining Preferences',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            
            const SizedBox(height: 12),
            
            SwitchListTile(
              title: const Text('Vegetarian'),
              value: _editingPreferences.dining.isVegetarian,
              onChanged: (value) {
                setState(() {
                  _editingPreferences = _editingPreferences.copyWith(
                    dining: _editingPreferences.dining.copyWith(isVegetarian: value),
                  );
                });
              },
            ),
            
            SwitchListTile(
              title: const Text('Vegan'),
              value: _editingPreferences.dining.isVegan,
              onChanged: (value) {
                setState(() {
                  _editingPreferences = _editingPreferences.copyWith(
                    dining: _editingPreferences.dining.copyWith(isVegan: value),
                  );
                });
              },
            ),
            
            SwitchListTile(
              title: const Text('Gluten-Free'),
              value: _editingPreferences.dining.isGlutenFree,
              onChanged: (value) {
                setState(() {
                  _editingPreferences = _editingPreferences.copyWith(
                    dining: _editingPreferences.dining.copyWith(isGlutenFree: value),
                  );
                });
              },
            ),
            
            // Spice level preference
            ListTile(
              title: const Text('Spice Level'),
              subtitle: Slider(
                value: _editingPreferences.dining.spiceLevel.toDouble(),
                min: 1,
                max: 5,
                divisions: 4,
                label: _getSpiceLevelLabel(_editingPreferences.dining.spiceLevel),
                onChanged: (value) {
                  setState(() {
                    _editingPreferences = _editingPreferences.copyWith(
                      dining: _editingPreferences.dining.copyWith(spiceLevel: value.round()),
                    );
                  });
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityPreferences() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Activity Preferences',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            
            const SizedBox(height: 12),
            
            SwitchListTile(
              title: const Text('Adventure Activities'),
              subtitle: const Text('Rock climbing, zip-lining, etc.'),
              value: _editingPreferences.activities.likesAdventure,
              onChanged: (value) {
                setState(() {
                  _editingPreferences = _editingPreferences.copyWith(
                    activities: _editingPreferences.activities.copyWith(likesAdventure: value),
                  );
                });
              },
            ),
            
            SwitchListTile(
              title: const Text('Water Sports'),
              subtitle: const Text('Kayaking, snorkeling, diving'),
              value: _editingPreferences.activities.likesWaterSports,
              onChanged: (value) {
                setState(() {
                  _editingPreferences = _editingPreferences.copyWith(
                    activities: _editingPreferences.activities.copyWith(likesWaterSports: value),
                  );
                });
              },
            ),
            
            SwitchListTile(
              title: const Text('Relaxation Activities'),
              subtitle: const Text('Spa, meditation, yoga'),
              value: _editingPreferences.activities.likesRelaxation,
              onChanged: (value) {
                setState(() {
                  _editingPreferences = _editingPreferences.copyWith(
                    activities: _editingPreferences.activities.copyWith(likesRelaxation: value),
                  );
                });
              },
            ),
            
            SwitchListTile(
              title: const Text('Cultural Experiences'),
              subtitle: const Text('Local tours, workshops'),
              value: _editingPreferences.activities.likesCultural,
              onChanged: (value) {
                setState(() {
                  _editingPreferences = _editingPreferences.copyWith(
                    activities: _editingPreferences.activities.copyWith(likesCultural: value),
                  );
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccommodationPreferences() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Accommodation Preferences',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            
            const SizedBox(height: 12),
            
            SwitchListTile(
              title: const Text('Sea View'),
              value: _editingPreferences.accommodation.prefersSeaView,
              onChanged: (value) {
                setState(() {
                  _editingPreferences = _editingPreferences.copyWith(
                    accommodation: _editingPreferences.accommodation.copyWith(prefersSeaView: value),
                  );
                });
              },
            ),
            
            SwitchListTile(
              title: const Text('High Floor'),
              value: _editingPreferences.accommodation.prefersHighFloor,
              onChanged: (value) {
                setState(() {
                  _editingPreferences = _editingPreferences.copyWith(
                    accommodation: _editingPreferences.accommodation.copyWith(prefersHighFloor: value),
                  );
                });
              },
            ),
            
            SwitchListTile(
              title: const Text('Non-Smoking'),
              value: _editingPreferences.accommodation.prefersNonSmoking,
              onChanged: (value) {
                setState(() {
                  _editingPreferences = _editingPreferences.copyWith(
                    accommodation: _editingPreferences.accommodation.copyWith(prefersNonSmoking: value),
                  );
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCommunicationPreferences() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Communication Preferences',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            
            const SizedBox(height: 12),
            
            SwitchListTile(
              title: const Text('Marketing Notifications'),
              subtitle: const Text('Promotions and special offers'),
              value: _editingPreferences.communication.allowMarketing,
              onChanged: (value) {
                setState(() {
                  _editingPreferences = _editingPreferences.copyWith(
                    communication: _editingPreferences.communication.copyWith(allowMarketing: value),
                  );
                });
              },
            ),
            
            SwitchListTile(
              title: const Text('Service Updates'),
              subtitle: const Text('Booking confirmations and updates'),
              value: _editingPreferences.communication.allowServiceUpdates,
              onChanged: (value) {
                setState(() {
                  _editingPreferences = _editingPreferences.copyWith(
                    communication: _editingPreferences.communication.copyWith(allowServiceUpdates: value),
                  );
                });
              },
            ),
            
            ListTile(
              title: const Text('Preferred Language'),
              subtitle: DropdownButton<String>(
                value: _editingPreferences.communication.preferredLanguage,
                items: const [
                  DropdownMenuItem(value: 'en', child: Text('English')),
                  DropdownMenuItem(value: 'th', child: Text('ไทย (Thai)')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _editingPreferences = _editingPreferences.copyWith(
                        communication: _editingPreferences.communication.copyWith(preferredLanguage: value),
                      );
                    });
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getSpiceLevelLabel(int level) {
    switch (level) {
      case 1: return 'Mild';
      case 2: return 'Medium';
      case 3: return 'Spicy';
      case 4: return 'Very Spicy';
      case 5: return 'Extra Hot';
      default: return 'Medium';
    }
  }
}
```

## Implementation Phases

### Phase 2.1: Core Profile System (Days 1-2)
- Database schema implementation
- Basic profile CRUD operations
- Profile completion calculation
- User interface for profile management

### Phase 2.2: Preferences & Behavior Tracking (Days 3-4)
- Preference management system
- Behavior logging infrastructure
- Implicit preference learning algorithms
- Preference UI components

### Phase 2.3: Loyalty Program Integration (Days 5-6)
- Loyalty membership system
- Points earning and redemption
- Tier management and benefits
- Loyalty program UI

### Phase 2.4: Personalization Engine (Day 7)
- Recommendation algorithm implementation
- ML-based preference learning
- Personalized content delivery
- A/B testing framework for recommendations

## Quality Assurance

### Data Privacy & Security
- GDPR/CCPA compliance validation
- Data encryption verification
- Privacy controls testing
- Consent management validation

### Personalization Accuracy
- Recommendation relevance testing
- Preference learning validation
- Behavioral analysis accuracy
- A/B testing of recommendation algorithms

### Performance Testing
- Profile loading performance
- Recommendation generation speed
- Large dataset handling
- Background processing efficiency

## Success Metrics

- **Profile Completion Rate**: >80% of users complete full profiles
- **Preference Accuracy**: >85% user satisfaction with recommendations
- **Loyalty Engagement**: >60% of users actively use loyalty features
- **Personalization CTR**: >25% click-through rate on personalized recommendations
- **Data Quality**: <5% preference conflicts or inconsistencies

## Dependencies

- Issue #01 (Mobile Foundation & Authentication)
- Machine learning/recommendation service
- Image storage and processing service
- Push notification service
- Analytics and behavior tracking infrastructure

## Deliverables

1. **Complete Profile Management System**
   - Personal information management
   - Preference tracking and learning
   - Behavior analysis infrastructure

2. **Loyalty Program Integration**
   - Points earning and redemption system
   - Tier management
   - Member benefits platform

3. **Personalization Engine**
   - AI-driven recommendations
   - Adaptive user interface
   - Contextual content delivery

4. **Documentation & Analytics**
   - User behavior analytics
   - Personalization performance metrics
   - Privacy compliance documentation

## Risk Mitigation

- **Privacy Concerns**: Implement transparent privacy controls and clear data usage policies
- **Recommendation Accuracy**: Continuous A/B testing and user feedback integration
- **Data Quality**: Regular data audits and validation processes
- **Performance Issues**: Efficient caching and background processing
- **User Adoption**: Gamification and clear value demonstration for profile completion

This comprehensive guest profile and preferences management system provides the foundation for personalized experiences throughout the Banrimkwae Resort mobile application, ensuring guests receive tailored recommendations and services that enhance their stay experience.
