# Issue #07: Staff Mobile Application

## Overview
Develop a comprehensive mobile application for resort staff members to manage daily operations, guest services, and inter-departmental communication efficiently. This staff-focused mobile app will streamline workflows, improve service delivery, and enhance operational coordination across all resort departments.

## Priority
**High** - Critical for operational efficiency and service quality

## Estimated Timeline
**6 days** (Week 4 of Phase 6)

## Requirements

### 9.1 Digital Concierge Services
- **24/7 Chat Support**: Real-time chat with concierge team and AI assistant
- **Service Requests**: Room service, housekeeping, maintenance, and special requests
- **Local Recommendations**: Personalized suggestions for dining, shopping, and attractions
- **Transportation Services**: Airport transfers, taxi booking, and car rentals
- **Event Planning**: Special occasion planning and celebration arrangements

### 9.2 Guest Communication Hub
- **Multi-channel Support**: Chat, voice calls, video calls, and messaging
- **Language Support**: Multi-language concierge services
- **Request Tracking**: Real-time status updates for all service requests
- **Priority Handling**: VIP and loyalty member priority service
- **Escalation Management**: Automatic escalation for urgent requests

### 9.3 Personalized Services
- **Guest Preferences**: Learning and adapting to individual preferences
- **Smart Recommendations**: AI-powered suggestions based on guest history
- **Custom Itineraries**: Personalized daily schedules and activity planning
- **Special Celebrations**: Birthday, anniversary, and milestone recognition
- **Cultural Experiences**: Local culture and tradition recommendations

### 9.4 Service Integration
- **Resort Services**: Integration with all resort departments
- **External Partners**: Local tour operators, restaurants, and attractions
- **Real-time Updates**: Live service status and availability information
- **Quality Monitoring**: Service rating and feedback collection
- **Billing Integration**: Seamless charging to room or payment methods

## Technical Specifications

### 9.5 Database Schema

#### Guest Services and Concierge Tables
```sql
-- Digital concierge conversations
CREATE TABLE mobile_concierge_conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_uuid VARCHAR(36) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    guest_stay_id BIGINT,
    conversation_type ENUM('chat', 'voice', 'video', 'service_request') DEFAULT 'chat',
    language_code VARCHAR(10) DEFAULT 'en',
    priority_level ENUM('low', 'medium', 'high', 'urgent', 'vip') DEFAULT 'medium',
    status ENUM('active', 'waiting', 'resolved', 'escalated', 'closed') DEFAULT 'active',
    assigned_agent_id BIGINT,
    escalation_level INT DEFAULT 0,
    customer_satisfaction_rating TINYINT,
    resolution_time_minutes INT,
    tags JSON,
    conversation_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    INDEX idx_user_conversations (user_id, created_at),
    INDEX idx_agent_active (assigned_agent_id, status),
    INDEX idx_priority_status (priority_level, status),
    INDEX idx_conversation_uuid (conversation_uuid),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_stay_id) REFERENCES guest_stays(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_agent_id) REFERENCES concierge_agents(id) ON DELETE SET NULL
);

-- Conversation messages
CREATE TABLE mobile_concierge_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversation_id BIGINT NOT NULL,
    sender_type ENUM('guest', 'agent', 'system', 'ai_assistant') NOT NULL,
    sender_id BIGINT,
    message_type ENUM('text', 'image', 'voice', 'video', 'file', 'location', 'service_request') DEFAULT 'text',
    message_content TEXT,
    media_urls JSON,
    message_metadata JSON,
    is_translated BOOLEAN DEFAULT FALSE,
    original_language VARCHAR(10),
    translation_confidence DECIMAL(3,2),
    read_by_recipient BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_automated BOOLEAN DEFAULT FALSE,
    ai_confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation_messages (conversation_id, created_at),
    INDEX idx_sender (sender_type, sender_id),
    INDEX idx_unread (read_by_recipient, created_at),
    FOREIGN KEY (conversation_id) REFERENCES mobile_concierge_conversations(id) ON DELETE CASCADE
);

-- Service request management
CREATE TABLE mobile_service_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_uuid VARCHAR(36) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    conversation_id BIGINT,
    guest_stay_id BIGINT,
    service_category ENUM('housekeeping', 'room_service', 'maintenance', 'transportation', 'concierge', 'special_request') NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    request_title VARCHAR(200) NOT NULL,
    request_description TEXT,
    urgency_level ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    preferred_time TIMESTAMP,
    location VARCHAR(200),
    room_number VARCHAR(20),
    special_instructions TEXT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    request_status ENUM('submitted', 'acknowledged', 'assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'submitted',
    assigned_staff_id BIGINT,
    department_id BIGINT,
    estimated_completion TIMESTAMP,
    actual_completion TIMESTAMP,
    guest_rating TINYINT,
    guest_feedback TEXT,
    staff_notes TEXT,
    billing_method ENUM('room_charge', 'direct_payment', 'complimentary') DEFAULT 'room_charge',
    payment_status ENUM('pending', 'charged', 'paid', 'waived') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_requests (user_id, created_at),
    INDEX idx_status_category (request_status, service_category),
    INDEX idx_assigned_staff (assigned_staff_id, request_status),
    INDEX idx_guest_stay (guest_stay_id),
    INDEX idx_urgency_time (urgency_level, preferred_time),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES mobile_concierge_conversations(id) ON DELETE SET NULL,
    FOREIGN KEY (guest_stay_id) REFERENCES guest_stays(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_staff_id) REFERENCES staff_members(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Guest preferences and profile
CREATE TABLE mobile_guest_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    preference_category ENUM('dining', 'activities', 'room_preferences', 'communication', 'accessibility', 'cultural') NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSON,
    confidence_score DECIMAL(3,2) DEFAULT 0.50,
    learning_source ENUM('explicit', 'behavioral', 'feedback', 'booking_history') DEFAULT 'explicit',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_category (user_id, preference_category),
    INDEX idx_preference_key (preference_key),
    INDEX idx_confidence (confidence_score),
    INDEX idx_active (is_active),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preference (user_id, preference_category, preference_key)
);

-- Local recommendations and attractions
CREATE TABLE mobile_local_recommendations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    recommendation_type ENUM('restaurant', 'attraction', 'shopping', 'entertainment', 'cultural', 'adventure') NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    location_address TEXT,
    location_coordinates POINT,
    distance_from_resort_km DECIMAL(6,2),
    estimated_travel_time_minutes INT,
    price_range ENUM('budget', 'moderate', 'expensive', 'luxury') DEFAULT 'moderate',
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    opening_hours JSON,
    contact_information JSON,
    website_url VARCHAR(512),
    image_gallery JSON,
    special_offers TEXT,
    seasonal_availability JSON,
    age_suitability JSON,
    accessibility_features JSON,
    languages_supported JSON,
    booking_required BOOLEAN DEFAULT FALSE,
    booking_url VARCHAR(512),
    resort_partnership BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type_rating (recommendation_type, rating),
    INDEX idx_distance (distance_from_resort_km),
    INDEX idx_price_range (price_range),
    INDEX idx_featured (is_featured),
    INDEX idx_active (is_active),
    SPATIAL INDEX idx_location (location_coordinates)
);

-- Personalized recommendation tracking
CREATE TABLE mobile_recommendation_interactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    recommendation_id BIGINT NOT NULL,
    interaction_type ENUM('viewed', 'clicked', 'bookmarked', 'shared', 'booked', 'visited', 'reviewed') NOT NULL,
    interaction_context JSON,
    user_rating TINYINT,
    user_feedback TEXT,
    visit_date DATE,
    booking_reference VARCHAR(100),
    interaction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_interactions (user_id, interaction_timestamp),
    INDEX idx_recommendation_type (recommendation_id, interaction_type),
    INDEX idx_interaction_type (interaction_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recommendation_id) REFERENCES mobile_local_recommendations(id) ON DELETE CASCADE
);

-- Custom itinerary planning
CREATE TABLE mobile_guest_itineraries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    itinerary_uuid VARCHAR(36) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    guest_stay_id BIGINT,
    itinerary_name VARCHAR(200) NOT NULL,
    itinerary_description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    itinerary_type ENUM('custom', 'recommended', 'template', 'collaborative') DEFAULT 'custom',
    created_by ENUM('guest', 'concierge', 'ai_assistant') DEFAULT 'guest',
    is_shared BOOLEAN DEFAULT FALSE,
    share_permissions JSON,
    total_estimated_cost DECIMAL(12,2) DEFAULT 0.00,
    status ENUM('draft', 'planned', 'active', 'completed', 'cancelled') DEFAULT 'draft',
    last_modified_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_itineraries (user_id, start_date),
    INDEX idx_guest_stay (guest_stay_id),
    INDEX idx_status (status),
    INDEX idx_shared (is_shared),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_stay_id) REFERENCES guest_stays(id) ON DELETE SET NULL,
    FOREIGN KEY (last_modified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Itinerary items and activities
CREATE TABLE mobile_itinerary_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    itinerary_id BIGINT NOT NULL,
    item_type ENUM('activity', 'dining', 'transportation', 'accommodation', 'free_time', 'custom') NOT NULL,
    item_reference_id BIGINT,
    item_title VARCHAR(200) NOT NULL,
    item_description TEXT,
    scheduled_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INT,
    location VARCHAR(200),
    estimated_cost DECIMAL(10,2) DEFAULT 0.00,
    actual_cost DECIMAL(10,2),
    booking_status ENUM('not_booked', 'pending', 'confirmed', 'cancelled') DEFAULT 'not_booked',
    booking_reference VARCHAR(100),
    preparation_time_minutes INT DEFAULT 0,
    travel_time_minutes INT DEFAULT 0,
    notes TEXT,
    priority_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    weather_dependent BOOLEAN DEFAULT FALSE,
    item_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_itinerary_date (itinerary_id, scheduled_date),
    INDEX idx_item_type (item_type),
    INDEX idx_booking_status (booking_status),
    INDEX idx_item_order (item_order),
    FOREIGN KEY (itinerary_id) REFERENCES mobile_guest_itineraries(id) ON DELETE CASCADE
);

-- Concierge agent management
CREATE TABLE concierge_agents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    agent_uuid VARCHAR(36) UNIQUE NOT NULL,
    staff_id BIGINT NOT NULL,
    specializations JSON,
    languages_spoken JSON,
    expertise_areas JSON,
    current_capacity INT DEFAULT 5,
    max_capacity INT DEFAULT 10,
    active_conversations INT DEFAULT 0,
    average_response_time_seconds INT DEFAULT 300,
    customer_satisfaction_rating DECIMAL(3,2) DEFAULT 0.00,
    total_conversations_handled INT DEFAULT 0,
    shift_start_time TIME,
    shift_end_time TIME,
    availability_status ENUM('available', 'busy', 'away', 'offline') DEFAULT 'offline',
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_availability (availability_status),
    INDEX idx_capacity (current_capacity, max_capacity),
    INDEX idx_rating (customer_satisfaction_rating),
    INDEX idx_languages (languages_spoken(255)),
    FOREIGN KEY (staff_id) REFERENCES staff_members(id) ON DELETE CASCADE
);
```

### 9.6 Backend Implementation (Laravel)

#### Mobile Concierge Service
```php
<?php

namespace App\Services\Mobile;

use App\Models\MobileConciergeConversation;
use App\Models\MobileServiceRequest;
use App\Models\MobileGuestPreferences;
use App\Models\MobileLocalRecommendation;
use App\Models\ConciergeAgent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MobileConciergeService
{
    public function createConversation($userId, $type = 'chat', $guestStayId = null)
    {
        $conversation = MobileConciergeConversation::create([
            'conversation_uuid' => Str::uuid(),
            'user_id' => $userId,
            'guest_stay_id' => $guestStayId,
            'conversation_type' => $type,
            'language_code' => $this->getUserLanguage($userId),
            'priority_level' => $this->calculatePriorityLevel($userId)
        ]);
        
        // Auto-assign agent based on availability and specialization
        $agent = $this->assignBestAgent($conversation);
        if ($agent) {
            $conversation->update(['assigned_agent_id' => $agent->id]);
            $this->notifyAgent($agent, $conversation);
        }
        
        // Send welcome message
        $this->sendWelcomeMessage($conversation);
        
        return $conversation;
    }
    
    public function sendMessage($conversationId, $senderId, $senderType, $messageData)
    {
        try {
            DB::beginTransaction();
            
            $conversation = MobileConciergeConversation::findOrFail($conversationId);
            
            // Validate sender permissions
            if ($senderType === 'guest' && $conversation->user_id !== $senderId) {
                throw new \Exception('Unauthorized to send message in this conversation');
            }
            
            $message = $conversation->messages()->create([
                'sender_type' => $senderType,
                'sender_id' => $senderId,
                'message_type' => $messageData['type'] ?? 'text',
                'message_content' => $messageData['content'] ?? null,
                'media_urls' => $messageData['media_urls'] ?? null,
                'message_metadata' => $messageData['metadata'] ?? null,
                'original_language' => $messageData['language'] ?? 'en'
            ]);
            
            // Auto-translate if needed
            if ($this->needsTranslation($conversation, $message)) {
                $translation = $this->translateMessage($message);
                $message->update([
                    'is_translated' => true,
                    'translation_confidence' => $translation['confidence']
                ]);
            }
            
            // Check for service request intent
            if ($senderType === 'guest') {
                $serviceIntent = $this->detectServiceIntent($message);
                if ($serviceIntent) {
                    $this->createServiceRequestFromMessage($conversation, $message, $serviceIntent);
                }
            }
            
            // Update conversation status and priority
            $this->updateConversationStatus($conversation, $message);
            
            DB::commit();
            
            // Send real-time notifications
            $this->sendRealTimeNotifications($conversation, $message);
            
            return $message;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function createServiceRequest($userId, $requestData)
    {
        try {
            DB::beginTransaction();
            
            $serviceRequest = MobileServiceRequest::create([
                'request_uuid' => Str::uuid(),
                'user_id' => $userId,
                'conversation_id' => $requestData['conversation_id'] ?? null,
                'guest_stay_id' => $requestData['guest_stay_id'] ?? null,
                'service_category' => $requestData['category'],
                'service_type' => $requestData['type'],
                'request_title' => $requestData['title'],
                'request_description' => $requestData['description'] ?? null,
                'urgency_level' => $requestData['urgency'] ?? 'medium',
                'preferred_time' => $requestData['preferred_time'] ?? null,
                'location' => $requestData['location'] ?? null,
                'room_number' => $requestData['room_number'] ?? null,
                'special_instructions' => $requestData['special_instructions'] ?? null,
                'estimated_cost' => $requestData['estimated_cost'] ?? 0
            ]);
            
            // Auto-assign to appropriate department
            $department = $this->assignToDepartment($serviceRequest);
            if ($department) {
                $serviceRequest->update(['department_id' => $department->id]);
            }
            
            // Assign staff member if available
            $staff = $this->assignToStaff($serviceRequest);
            if ($staff) {
                $serviceRequest->update([
                    'assigned_staff_id' => $staff->id,
                    'request_status' => 'assigned'
                ]);
            }
            
            DB::commit();
            
            // Send notifications
            $this->notifyServiceTeam($serviceRequest);
            $this->sendRequestConfirmation($serviceRequest);
            
            return $serviceRequest;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function getPersonalizedRecommendations($userId, $filters = [])
    {
        $userPreferences = $this->getUserPreferences($userId);
        $userHistory = $this->getUserInteractionHistory($userId);
        
        $query = MobileLocalRecommendation::where('is_active', true);
        
        if (isset($filters['type'])) {
            $query->where('recommendation_type', $filters['type']);
        }
        
        if (isset($filters['distance_max'])) {
            $query->where('distance_from_resort_km', '<=', $filters['distance_max']);
        }
        
        if (isset($filters['price_range'])) {
            $query->where('price_range', $filters['price_range']);
        }
        
        $recommendations = $query->get();
        
        // Apply AI-powered personalization
        $personalizedRecommendations = $this->applyPersonalization(
            $recommendations,
            $userPreferences,
            $userHistory
        );
        
        // Sort by relevance score
        return $personalizedRecommendations->sortByDesc('relevance_score');
    }
    
    public function createCustomItinerary($userId, $itineraryData)
    {
        try {
            DB::beginTransaction();
            
            $itinerary = MobileGuestItinerary::create([
                'itinerary_uuid' => Str::uuid(),
                'user_id' => $userId,
                'guest_stay_id' => $itineraryData['guest_stay_id'] ?? null,
                'itinerary_name' => $itineraryData['name'],
                'itinerary_description' => $itineraryData['description'] ?? null,
                'start_date' => $itineraryData['start_date'],
                'end_date' => $itineraryData['end_date'],
                'itinerary_type' => $itineraryData['type'] ?? 'custom',
                'created_by' => 'guest'
            ]);
            
            // Add itinerary items
            if (isset($itineraryData['items'])) {
                foreach ($itineraryData['items'] as $itemData) {
                    $itinerary->items()->create([
                        'item_type' => $itemData['type'],
                        'item_reference_id' => $itemData['reference_id'] ?? null,
                        'item_title' => $itemData['title'],
                        'item_description' => $itemData['description'] ?? null,
                        'scheduled_date' => $itemData['date'],
                        'start_time' => $itemData['start_time'] ?? null,
                        'end_time' => $itemData['end_time'] ?? null,
                        'location' => $itemData['location'] ?? null,
                        'estimated_cost' => $itemData['estimated_cost'] ?? 0,
                        'notes' => $itemData['notes'] ?? null,
                        'item_order' => $itemData['order'] ?? 0
                    ]);
                }
            }
            
            // Calculate total estimated cost
            $totalCost = $itinerary->items()->sum('estimated_cost');
            $itinerary->update(['total_estimated_cost' => $totalCost]);
            
            DB::commit();
            
            return $itinerary->load('items');
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function generateAIRecommendations($userId, $context = [])
    {
        $userProfile = $this->buildUserProfile($userId);
        $contextData = array_merge($context, [
            'current_weather' => $this->getCurrentWeather(),
            'local_events' => $this->getLocalEvents(),
            'user_schedule' => $this->getUserSchedule($userId),
            'preferences' => $userProfile['preferences'],
            'past_activities' => $userProfile['history']
        ]);
        
        // Call AI recommendation engine
        $aiRecommendations = $this->callAIRecommendationEngine($contextData);
        
        // Validate and enrich recommendations
        $enrichedRecommendations = [];
        foreach ($aiRecommendations as $rec) {
            $enriched = $this->enrichRecommendation($rec);
            if ($enriched) {
                $enrichedRecommendations[] = $enriched;
            }
        }
        
        return $enrichedRecommendations;
    }
    
    public function trackRecommendationInteraction($userId, $recommendationId, $interactionType, $context = [])
    {
        $interaction = MobileRecommendationInteraction::create([
            'user_id' => $userId,
            'recommendation_id' => $recommendationId,
            'interaction_type' => $interactionType,
            'interaction_context' => $context,
            'user_rating' => $context['rating'] ?? null,
            'user_feedback' => $context['feedback'] ?? null,
            'visit_date' => $context['visit_date'] ?? null,
            'booking_reference' => $context['booking_reference'] ?? null
        ]);
        
        // Update user preferences based on interaction
        $this->updateUserPreferences($userId, $interaction);
        
        // Update recommendation popularity
        $this->updateRecommendationMetrics($recommendationId, $interactionType);
        
        return $interaction;
    }
    
    public function getUserServiceRequests($userId, $filters = [])
    {
        $query = MobileServiceRequest::with(['assignedStaff', 'department'])
            ->where('user_id', $userId);
            
        if (isset($filters['status'])) {
            $query->where('request_status', $filters['status']);
        }
        
        if (isset($filters['category'])) {
            $query->where('service_category', $filters['category']);
        }
        
        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        
        return $query->orderBy('created_at', 'desc')->paginate(20);
    }
    
    private function assignBestAgent($conversation)
    {
        $agents = ConciergeAgent::where('availability_status', 'available')
            ->where('current_capacity', '<', DB::raw('max_capacity'))
            ->orderBy('current_capacity')
            ->orderBy('customer_satisfaction_rating', 'desc')
            ->get();
            
        // Check for language compatibility
        $userLanguage = $conversation->language_code;
        $languageCompatibleAgents = $agents->filter(function($agent) use ($userLanguage) {
            $languages = $agent->languages_spoken ?? [];
            return in_array($userLanguage, $languages);
        });
        
        return $languageCompatibleAgents->first() ?? $agents->first();
    }
    
    private function detectServiceIntent($message)
    {
        $keywords = [
            'housekeeping' => ['clean', 'towels', 'sheets', 'housekeeping', 'room service'],
            'maintenance' => ['fix', 'broken', 'repair', 'maintenance', 'not working'],
            'transportation' => ['taxi', 'car', 'transport', 'airport', 'transfer'],
            'concierge' => ['book', 'reservation', 'recommend', 'suggest', 'help']
        ];
        
        $content = strtolower($message->message_content);
        
        foreach ($keywords as $category => $terms) {
            foreach ($terms as $term) {
                if (strpos($content, $term) !== false) {
                    return ['category' => $category, 'confidence' => 0.8];
                }
            }
        }
        
        return null;
    }
    
    private function applyPersonalization($recommendations, $preferences, $history)
    {
        return $recommendations->map(function($rec) use ($preferences, $history) {
            $score = 0.5; // Base score
            
            // Apply preference matching
            foreach ($preferences as $pref) {
                if ($this->matchesPreference($rec, $pref)) {
                    $score += $pref->confidence_score * 0.3;
                }
            }
            
            // Apply history-based scoring
            $historyScore = $this->calculateHistoryScore($rec, $history);
            $score += $historyScore * 0.2;
            
            $rec->relevance_score = min(1.0, $score);
            return $rec;
        });
    }
}
```

### 9.7 Flutter Implementation

#### Concierge Chat Interface
```dart
// lib/features/concierge/presentation/pages/concierge_chat_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/concierge_bloc.dart';
import '../widgets/chat_message_bubble.dart';
import '../widgets/message_input.dart';
import '../widgets/quick_actions.dart';

class ConciergeChatPage extends StatefulWidget {
  final String? conversationId;
  
  const ConciergeChatPage({Key? key, this.conversationId}) : super(key: key);
  
  @override
  _ConciergeChatPageState createState() => _ConciergeChatPageState();
}

class _ConciergeChatPageState extends State<ConciergeChatPage> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _messageController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    if (widget.conversationId != null) {
      context.read<ConciergeBloc>().add(LoadConversation(widget.conversationId!));
    } else {
      context.read<ConciergeBloc>().add(CreateNewConversation());
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: BlocBuilder<ConciergeBloc, ConciergeState>(
          builder: (context, state) {
            if (state is ConversationLoaded) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Concierge'),
                  if (state.assignedAgent != null)
                    Text(
                      state.assignedAgent!.name,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                ],
              );
            }
            return Text('Concierge');
          },
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.videocam),
            onPressed: () => _startVideoCall(),
          ),
          IconButton(
            icon: Icon(Icons.phone),
            onPressed: () => _startVoiceCall(),
          ),
          PopupMenuButton(
            itemBuilder: (context) => [
              PopupMenuItem(
                child: Text('Service Requests'),
                value: 'service_requests',
              ),
              PopupMenuItem(
                child: Text('Conversation History'),
                value: 'history',
              ),
              PopupMenuItem(
                child: Text('Rate Service'),
                value: 'rate',
              ),
            ],
            onSelected: _handleMenuAction,
          ),
        ],
      ),
      body: Column(
        children: [
          _buildQuickActions(),
          Expanded(
            child: BlocBuilder<ConciergeBloc, ConciergeState>(
              builder: (context, state) {
                if (state is ConversationLoading) {
                  return Center(child: CircularProgressIndicator());
                } else if (state is ConversationLoaded) {
                  return _buildChatView(state);
                } else if (state is ConciergeError) {
                  return _buildErrorView(state.message);
                }
                return Container();
              },
            ),
          ),
          _buildMessageInput(),
        ],
      ),
    );
  }
  
  Widget _buildQuickActions() {
    return Container(
      height: 60,
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: QuickActions(
        actions: [
          QuickAction(
            icon: Icons.room_service,
            label: 'Room Service',
            onTap: () => _createServiceRequest('room_service'),
          ),
          QuickAction(
            icon: Icons.cleaning_services,
            label: 'Housekeeping',
            onTap: () => _createServiceRequest('housekeeping'),
          ),
          QuickAction(
            icon: Icons.directions_car,
            label: 'Transportation',
            onTap: () => _createServiceRequest('transportation'),
          ),
          QuickAction(
            icon: Icons.recommend,
            label: 'Recommendations',
            onTap: () => _getRecommendations(),
          ),
        ],
      ),
    );
  }
  
  Widget _buildChatView(ConversationLoaded state) {
    return ListView.builder(
      controller: _scrollController,
      padding: EdgeInsets.all(16),
      itemCount: state.messages.length,
      itemBuilder: (context, index) {
        final message = state.messages[index];
        return ChatMessageBubble(
          message: message,
          isOwnMessage: message.senderType == 'guest',
          onServiceRequestTap: (requestId) => _viewServiceRequest(requestId),
          onRecommendationTap: (recId) => _viewRecommendation(recId),
        );
      },
    );
  }
  
  Widget _buildMessageInput() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: MessageInput(
        controller: _messageController,
        onSendMessage: _sendMessage,
        onAttachFile: _attachFile,
        onVoiceMessage: _recordVoiceMessage,
        onLocation: _shareLocation,
      ),
    );
  }
  
  void _sendMessage(String content) {
    if (content.trim().isEmpty) return;
    
    context.read<ConciergeBloc>().add(SendMessage(
      content: content,
      type: 'text',
    ));
    
    _messageController.clear();
    _scrollToBottom();
  }
  
  void _createServiceRequest(String category) {
    Navigator.pushNamed(
      context,
      '/concierge/service-request',
      arguments: {
        'category': category,
        'conversation_id': widget.conversationId,
      },
    );
  }
  
  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }
}
```

#### Service Request Form
```dart
// lib/features/concierge/presentation/pages/service_request_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/service_request_bloc.dart';
import '../widgets/service_category_selector.dart';
import '../widgets/urgency_selector.dart';
import '../widgets/time_preference_picker.dart';

class ServiceRequestPage extends StatefulWidget {
  final String? category;
  final String? conversationId;
  
  const ServiceRequestPage({
    Key? key,
    this.category,
    this.conversationId,
  }) : super(key: key);
  
  @override
  _ServiceRequestPageState createState() => _ServiceRequestPageState();
}

class _ServiceRequestPageState extends State<ServiceRequestPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _instructionsController = TextEditingController();
  
  String? _selectedCategory;
  String? _selectedType;
  String _urgencyLevel = 'medium';
  DateTime? _preferredTime;
  String? _location;
  
  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.category;
    context.read<ServiceRequestBloc>().add(LoadServiceTypes());
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Service Request'),
        actions: [
          TextButton(
            onPressed: _canSubmit() ? _submitRequest : null,
            child: Text('SUBMIT'),
          ),
        ],
      ),
      body: BlocListener<ServiceRequestBloc, ServiceRequestState>(
        listener: (context, state) {
          if (state is ServiceRequestSubmitted) {
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Service request submitted successfully'),
                backgroundColor: Colors.green,
              ),
            );
          } else if (state is ServiceRequestError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
        child: Form(
          key: _formKey,
          child: ListView(
            padding: EdgeInsets.all(16),
            children: [
              _buildCategorySection(),
              SizedBox(height: 24),
              _buildRequestDetails(),
              SizedBox(height: 24),
              _buildPreferences(),
              SizedBox(height: 24),
              _buildAdditionalInfo(),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildCategorySection() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Service Category',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: 12),
            ServiceCategorySelector(
              selectedCategory: _selectedCategory,
              onCategoryChanged: (category) {
                setState(() {
                  _selectedCategory = category;
                  _selectedType = null;
                });
                context.read<ServiceRequestBloc>().add(
                  LoadServiceTypes(category: category)
                );
              },
            ),
            if (_selectedCategory != null) ...[
              SizedBox(height: 16),
              BlocBuilder<ServiceRequestBloc, ServiceRequestState>(
                builder: (context, state) {
                  if (state is ServiceTypesLoaded) {
                    return DropdownButtonFormField<String>(
                      decoration: InputDecoration(
                        labelText: 'Service Type',
                        border: OutlineInputBorder(),
                      ),
                      value: _selectedType,
                      items: state.types.map((type) {
                        return DropdownMenuItem(
                          value: type.id,
                          child: Text(type.name),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedType = value;
                        });
                      },
                      validator: (value) {
                        if (value == null) {
                          return 'Please select a service type';
                        }
                        return null;
                      },
                    );
                  }
                  return CircularProgressIndicator();
                },
              ),
            ],
          ],
        ),
      ),
    );
  }
  
  Widget _buildRequestDetails() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Request Details',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: 16),
            TextFormField(
              controller: _titleController,
              decoration: InputDecoration(
                labelText: 'Request Title',
                border: OutlineInputBorder(),
                hintText: 'Brief description of your request',
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter a request title';
                }
                return null;
              },
            ),
            SizedBox(height: 16),
            TextFormField(
              controller: _descriptionController,
              decoration: InputDecoration(
                labelText: 'Description',
                border: OutlineInputBorder(),
                hintText: 'Provide detailed information about your request',
              ),
              maxLines: 4,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please provide a description';
                }
                return null;
              },
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildPreferences() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Preferences',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: 16),
            UrgencySelector(
              selectedUrgency: _urgencyLevel,
              onUrgencyChanged: (urgency) {
                setState(() {
                  _urgencyLevel = urgency;
                });
              },
            ),
            SizedBox(height: 16),
            TimePreferencePicker(
              selectedTime: _preferredTime,
              onTimeChanged: (time) {
                setState(() {
                  _preferredTime = time;
                });
              },
            ),
            SizedBox(height: 16),
            TextFormField(
              decoration: InputDecoration(
                labelText: 'Location (Optional)',
                border: OutlineInputBorder(),
                hintText: 'Specify location if relevant',
                suffixIcon: IconButton(
                  icon: Icon(Icons.my_location),
                  onPressed: _useCurrentLocation,
                ),
              ),
              onChanged: (value) {
                _location = value;
              },
            ),
          ],
        ),
      ),
    );
  }
  
  bool _canSubmit() {
    return _selectedCategory != null &&
           _selectedType != null &&
           _titleController.text.trim().isNotEmpty &&
           _descriptionController.text.trim().isNotEmpty;
  }
  
  void _submitRequest() {
    if (_formKey.currentState!.validate()) {
      context.read<ServiceRequestBloc>().add(SubmitServiceRequest(
        category: _selectedCategory!,
        type: _selectedType!,
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        urgency: _urgencyLevel,
        preferredTime: _preferredTime,
        location: _location,
        specialInstructions: _instructionsController.text.trim(),
        conversationId: widget.conversationId,
      ));
    }
  }
}
```

## Implementation Phases

### Phase 1: Core Concierge System (Days 1-2)
- Real-time chat system with agent assignment
- Basic service request creation and tracking
- Multi-language support and translation
- Agent management and availability system

### Phase 2: Personalization Engine (Days 3)
- Guest preference learning and storage
- AI-powered recommendation system
- Local attraction and service database
- Personalized suggestion algorithms

### Phase 3: Service Integration (Days 4)
- Department and staff assignment automation
- Service request workflow management
- Real-time status updates and notifications
- Billing and payment integration

### Phase 4: Advanced Features (Day 5)
- Custom itinerary planning and management
- Advanced AI recommendations and insights
- Social sharing and collaborative planning
- Analytics and service quality monitoring

## Quality Assurance

### Testing Requirements
- **Unit Tests**: AI recommendation logic, preference learning algorithms
- **Widget Tests**: All concierge interface components and chat features
- **Integration Tests**: End-to-end service request and recommendation flows
- **Performance Tests**: Real-time chat and message delivery
- **AI Tests**: Recommendation accuracy and personalization quality

### Security Validation
- **Data Privacy**: Personal preference and chat data protection
- **Communication Security**: End-to-end encrypted messaging
- **Staff Access**: Role-based access control for service teams
- **Guest Privacy**: Secure storage of personal requests and preferences

## Success Metrics
- Average response time under 2 minutes during business hours
- 95% service request completion rate
- 90% guest satisfaction with recommendations
- 85% accuracy rate for AI-powered suggestions
- 24/7 availability with automated assistance

## Risk Mitigation
- **Agent Availability**: AI fallback for off-hours support
- **Language Barriers**: Automatic translation with human verification
- **Service Delays**: Proactive status updates and alternatives
- **Data Accuracy**: Regular validation of local recommendation data
- **System Overload**: Scalable chat infrastructure and queue management

## Dependencies
- Guest management system from Phase 2
- Staff and department management systems
- Local attraction and service provider APIs
- Translation and AI service integrations
- Real-time communication infrastructure

## Deliverables
- Complete mobile concierge chat system with AI assistance
- Service request management with real-time tracking
- Personalized recommendation engine with learning algorithms
- Custom itinerary planning and management tools
- Multi-language support with automatic translation
- Guest preference learning and personalization system
- Integration with all resort service departments
