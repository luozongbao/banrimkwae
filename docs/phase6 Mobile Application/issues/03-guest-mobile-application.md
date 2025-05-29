# Issue #03: Guest Mobile Application Interface

## Overview
Develop the comprehensive Guest Mobile Application with intuitive booking interfaces, service management, dining features, and integrated billing - providing guests with seamless access to all resort services through a beautiful and responsive mobile experience.

## Priority
**High** - Primary guest-facing mobile interface

## Estimated Timeline
**6 days** (Week 2 of Phase 6)

## Requirements

### 3.1 Guest Onboarding & Registration
- **Welcome Flow**: Multi-step onboarding with resort introduction
- **Registration Options**: Email, social login (Google, Facebook, Apple)
- **Guest Preferences**: Dietary restrictions, accessibility needs, communication preferences
- **Profile Management**: Comprehensive guest profile with photo upload
- **Language Support**: Thai and English with easy switching

### 3.2 Home Dashboard
- **Personalized Experience**: Weather-aware recommendations and greetings
- **Quick Actions**: One-tap access to key features (Book, Dine, Services, Account)
- **Current Stay Integration**: Real-time accommodation and billing information
- **Featured Content**: Promotions, activities, and resort announcements
- **Emergency Access**: One-tap emergency contacts and safety information

### 3.3 Accommodation Booking
- **Advanced Search**: Date ranges, guest count, amenities, price filters
- **Visual Discovery**: High-quality photo galleries with 360° views
- **Real-time Availability**: Live pricing and availability updates
- **Room Comparison**: Side-by-side room feature and price comparison
- **Instant Booking**: One-tap booking with confirmation

### 3.4 Service Management
- **Service Request Hub**: Housekeeping, maintenance, concierge requests
- **Request Tracking**: Real-time status updates with push notifications
- **Service History**: Complete history of all service interactions
- **Rating System**: Service feedback and rating collection
- **Priority Requests**: Urgent request escalation and handling

### 3.5 Interactive Resort Map
- **GPS Integration**: Real-time location tracking and navigation
- **Point of Interest**: Interactive map with all resort facilities
- **Walking Directions**: Turn-by-turn navigation within resort
- **Facility Information**: Operating hours, capacity, and current status
- **Event Locations**: Dynamic event and activity location display

## Technical Specifications

### 3.6 Database Schema

#### Guest Application Tables
```sql
-- Guest app sessions and preferences
CREATE TABLE guest_app_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guest_id BIGINT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSON,
    app_version VARCHAR(20),
    platform ENUM('ios', 'android', 'web') NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    session_duration_minutes INT,
    location_data JSON,
    preferences_cache JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_guest_session (guest_id, is_active),
    INDEX idx_session_token (session_token),
    INDEX idx_platform (platform),
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Guest service requests
CREATE TABLE guest_service_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_number VARCHAR(20) UNIQUE NOT NULL,
    guest_id BIGINT NOT NULL,
    request_type ENUM('housekeeping', 'maintenance', 'concierge', 'dining', 'other') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    room_number VARCHAR(20),
    preferred_time DATETIME,
    status ENUM('pending', 'acknowledged', 'assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    assigned_staff_id BIGINT,
    estimated_completion DATETIME,
    actual_completion DATETIME,
    guest_rating DECIMAL(3,2),
    guest_feedback TEXT,
    staff_notes TEXT,
    attachments JSON,
    cost DECIMAL(10,2) DEFAULT 0,
    is_billable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_guest_requests (guest_id, status),
    INDEX idx_request_type (request_type),
    INDEX idx_assigned_staff (assigned_staff_id),
    INDEX idx_status_priority (status, priority),
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Guest app feedback and ratings
CREATE TABLE guest_app_feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guest_id BIGINT NOT NULL,
    feedback_type ENUM('feature', 'bug', 'general', 'service') NOT NULL,
    rating DECIMAL(3,2),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    app_version VARCHAR(20),
    device_info JSON,
    screenshot_url VARCHAR(500),
    status ENUM('new', 'reviewed', 'resolved', 'closed') DEFAULT 'new',
    admin_response TEXT,
    response_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_guest_feedback (guest_id, feedback_type),
    INDEX idx_feedback_status (status),
    INDEX idx_rating (rating),
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Guest location tracking (with privacy controls)
CREATE TABLE guest_location_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guest_id BIGINT NOT NULL,
    location POINT NOT NULL,
    location_name VARCHAR(255),
    facility_type VARCHAR(100),
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP NULL,
    duration_minutes INT,
    privacy_level ENUM('public', 'staff_only', 'private') DEFAULT 'staff_only',
    location_accuracy DECIMAL(8,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_guest_location (guest_id, check_in_time),
    INDEX idx_location_facility (facility_type),
    INDEX idx_privacy_level (privacy_level),
    SPATIAL INDEX idx_location (location),
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3.7 Backend Services (Laravel)

#### Guest Application Service
```php
<?php

namespace App\Services\Mobile;

use App\Models\User;
use App\Models\GuestServiceRequest;
use App\Models\GuestAppSession;
use App\Models\GuestAppFeedback;
use App\Models\GuestLocationHistory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class GuestApplicationService
{
    /**
     * Initialize guest app session
     */
    public function initializeGuestSession($guestId, $deviceInfo)
    {
        // Create new session
        $session = GuestAppSession::create([
            'guest_id' => $guestId,
            'session_token' => $this->generateSessionToken(),
            'device_info' => $deviceInfo,
            'app_version' => request()->header('App-Version', '1.0.0'),
            'platform' => $this->detectPlatform($deviceInfo),
            'is_active' => true
        ]);

        // Load guest preferences
        $preferences = $this->loadGuestPreferences($guestId);
        
        // Cache session data
        Cache::put("guest_session_{$session->session_token}", [
            'guest_id' => $guestId,
            'preferences' => $preferences,
            'device_info' => $deviceInfo
        ], 86400); // 24 hours

        return $session;
    }

    /**
     * Create service request
     */
    public function createServiceRequest($guestId, $requestData)
    {
        DB::beginTransaction();
        
        try {
            $request = GuestServiceRequest::create([
                'request_number' => $this->generateRequestNumber(),
                'guest_id' => $guestId,
                'request_type' => $requestData['type'],
                'priority' => $requestData['priority'] ?? 'medium',
                'title' => $requestData['title'],
                'description' => $requestData['description'],
                'location' => $requestData['location'] ?? null,
                'room_number' => $requestData['room_number'] ?? null,
                'preferred_time' => $requestData['preferred_time'] ?? null,
                'attachments' => $requestData['attachments'] ?? [],
                'is_billable' => $requestData['is_billable'] ?? false
            ]);

            // Auto-assign based on request type and availability
            $this->autoAssignRequest($request);

            // Send notifications
            $this->notifyStaffOfNewRequest($request);
            
            DB::commit();
            return $request;
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * Track guest location (with privacy controls)
     */
    public function trackGuestLocation($guestId, $locationData)
    {
        // Check privacy settings
        $guest = User::find($guestId);
        if (!$guest->privacy_settings['location_tracking']) {
            return false;
        }

        return GuestLocationHistory::create([
            'guest_id' => $guestId,
            'location' => DB::raw("POINT({$locationData['longitude']}, {$locationData['latitude']})"),
            'location_name' => $locationData['location_name'] ?? null,
            'facility_type' => $locationData['facility_type'] ?? null,
            'privacy_level' => $guest->privacy_settings['location_privacy'] ?? 'staff_only',
            'location_accuracy' => $locationData['accuracy'] ?? null
        ]);
    }

    /**
     * Get personalized dashboard content
     */
    public function getDashboardContent($guestId)
    {
        $guest = User::find($guestId);
        
        // Weather information
        $weather = $this->getWeatherData();
        
        // Personalized recommendations
        $recommendations = $this->getPersonalizedRecommendations($guest);
        
        // Current bookings
        $currentBookings = $this->getCurrentBookings($guestId);
        
        // Quick actions based on preferences
        $quickActions = $this->getPersonalizedQuickActions($guest);
        
        // Featured content
        $featuredContent = $this->getFeaturedContent($guest);

        return [
            'weather' => $weather,
            'recommendations' => $recommendations,
            'current_bookings' => $currentBookings,
            'quick_actions' => $quickActions,
            'featured_content' => $featuredContent,
            'emergency_contacts' => $this->getEmergencyContacts()
        ];
    }

    /**
     * Submit app feedback
     */
    public function submitFeedback($guestId, $feedbackData)
    {
        return GuestAppFeedback::create([
            'guest_id' => $guestId,
            'feedback_type' => $feedbackData['type'],
            'rating' => $feedbackData['rating'] ?? null,
            'subject' => $feedbackData['subject'] ?? null,
            'message' => $feedbackData['message'],
            'app_version' => request()->header('App-Version'),
            'device_info' => $feedbackData['device_info'] ?? [],
            'screenshot_url' => $feedbackData['screenshot_url'] ?? null
        ]);
    }

    /**
     * Get guest service request status
     */
    public function getServiceRequestStatus($guestId, $requestId = null)
    {
        $query = GuestServiceRequest::where('guest_id', $guestId)
            ->with(['assignedStaff:id,name,department'])
            ->orderBy('created_at', 'desc');

        if ($requestId) {
            $query->where('id', $requestId);
            return $query->firstOrFail();
        }

        return $query->paginate(20);
    }

    private function generateSessionToken()
    {
        return bin2hex(random_bytes(32));
    }

    private function generateRequestNumber()
    {
        return 'GSR' . date('Ymd') . str_pad(
            GuestServiceRequest::whereDate('created_at', today())->count() + 1,
            4, '0', STR_PAD_LEFT
        );
    }

    private function detectPlatform($deviceInfo)
    {
        $userAgent = $deviceInfo['user_agent'] ?? '';
        
        if (strpos($userAgent, 'iPhone') !== false || strpos($userAgent, 'iPad') !== false) {
            return 'ios';
        } elseif (strpos($userAgent, 'Android') !== false) {
            return 'android';
        }
        
        return 'web';
    }

    private function autoAssignRequest($request)
    {
        // Auto-assignment logic based on request type and staff availability
        // This would integrate with staff scheduling system
        
        $availableStaff = $this->getAvailableStaffForRequest($request);
        if ($availableStaff) {
            $request->update([
                'assigned_staff_id' => $availableStaff->id,
                'status' => 'assigned'
            ]);
        }
    }
}
```

### 3.8 Flutter Implementation

#### Guest App Main Structure
```dart
// lib/features/guest/presentation/pages/guest_dashboard.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/presentation/widgets/weather_widget.dart';
import '../../../core/presentation/widgets/quick_actions_grid.dart';
import '../../../core/presentation/widgets/recommendations_carousel.dart';
import '../blocs/guest_dashboard_bloc.dart';

class GuestDashboardPage extends StatefulWidget {
  @override
  _GuestDashboardPageState createState() => _GuestDashboardPageState();
}

class _GuestDashboardPageState extends State<GuestDashboardPage> {
  @override
  void initState() {
    super.initState();
    context.read<GuestDashboardBloc>().add(LoadDashboardContent());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Welcome to Banrimkwae'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.notifications),
            onPressed: () => _showNotifications(context),
          ),
          IconButton(
            icon: Icon(Icons.account_circle),
            onPressed: () => _showProfile(context),
          ),
        ],
      ),
      body: BlocBuilder<GuestDashboardBloc, GuestDashboardState>(
        builder: (context, state) {
          if (state is GuestDashboardLoading) {
            return Center(child: CircularProgressIndicator());
          }
          
          if (state is GuestDashboardError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error, size: 64, color: Colors.red),
                  SizedBox(height: 16),
                  Text('Error loading dashboard'),
                  ElevatedButton(
                    onPressed: () => context.read<GuestDashboardBloc>()
                        .add(LoadDashboardContent()),
                    child: Text('Retry'),
                  ),
                ],
              ),
            );
          }
          
          if (state is GuestDashboardLoaded) {
            return RefreshIndicator(
              onRefresh: () async {
                context.read<GuestDashboardBloc>().add(RefreshDashboard());
              },
              child: SingleChildScrollView(
                physics: AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Weather and greeting section
                    Container(
                      padding: EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _getGreeting(),
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          SizedBox(height: 8),
                          WeatherWidget(weather: state.dashboardData.weather),
                        ],
                      ),
                    ),
                    
                    // Quick actions grid
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'Quick Actions',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                    SizedBox(height: 8),
                    QuickActionsGrid(
                      actions: state.dashboardData.quickActions,
                      onActionTap: _handleQuickAction,
                    ),
                    
                    SizedBox(height: 24),
                    
                    // Recommendations carousel
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'Recommended for You',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                    SizedBox(height: 8),
                    RecommendationsCarousel(
                      recommendations: state.dashboardData.recommendations,
                      onRecommendationTap: _handleRecommendation,
                    ),
                    
                    SizedBox(height: 24),
                    
                    // Current bookings
                    if (state.dashboardData.currentBookings.isNotEmpty) ...[
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'Your Current Bookings',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                      ),
                      SizedBox(height: 8),
                      ...state.dashboardData.currentBookings.map(
                        (booking) => _buildBookingCard(booking),
                      ),
                    ],
                    
                    SizedBox(height: 24),
                    
                    // Featured content
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'Featured at Banrimkwae',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                    SizedBox(height: 8),
                    ...state.dashboardData.featuredContent.map(
                      (content) => _buildFeaturedCard(content),
                    ),
                    
                    SizedBox(height: 100), // Bottom padding
                  ],
                ),
              ),
            );
          }
          
          return Container();
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showEmergencyContacts,
        icon: Icon(Icons.emergency),
        label: Text('Emergency'),
        backgroundColor: Colors.red,
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return 'Good Morning!';
    } else if (hour < 17) {
      return 'Good Afternoon!';
    } else {
      return 'Good Evening!';
    }
  }

  void _handleQuickAction(String action) {
    switch (action) {
      case 'book_room':
        Navigator.pushNamed(context, '/booking');
        break;
      case 'order_food':
        Navigator.pushNamed(context, '/restaurant');
        break;
      case 'spa_booking':
        Navigator.pushNamed(context, '/spa');
        break;
      case 'activities':
        Navigator.pushNamed(context, '/activities');
        break;
      case 'services':
        Navigator.pushNamed(context, '/services');
        break;
      case 'concierge':
        Navigator.pushNamed(context, '/concierge');
        break;
    }
  }

  void _handleRecommendation(dynamic recommendation) {
    // Handle recommendation tap based on type
    Navigator.pushNamed(
      context, 
      '/${recommendation.type}',
      arguments: recommendation,
    );
  }

  Widget _buildBookingCard(dynamic booking) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        leading: Icon(_getBookingIcon(booking.type)),
        title: Text(booking.title),
        subtitle: Text(booking.details),
        trailing: Text(booking.time),
        onTap: () => _showBookingDetails(booking),
      ),
    );
  }

  Widget _buildFeaturedCard(dynamic content) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: InkWell(
        onTap: () => _handleFeaturedContent(content),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (content.imageUrl != null)
              Image.network(
                content.imageUrl,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    content.title,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  SizedBox(height: 8),
                  Text(content.description),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getBookingIcon(String type) {
    switch (type) {
      case 'accommodation':
        return Icons.hotel;
      case 'restaurant':
        return Icons.restaurant;
      case 'spa':
        return Icons.spa;
      case 'activity':
        return Icons.sports;
      default:
        return Icons.bookmark;
    }
  }

  void _showNotifications(BuildContext context) {
    Navigator.pushNamed(context, '/notifications');
  }

  void _showProfile(BuildContext context) {
    Navigator.pushNamed(context, '/profile');
  }

  void _showEmergencyContacts() {
    showModalBottomSheet(
      context: context,
      builder: (context) => EmergencyContactsSheet(),
    );
  }

  void _showBookingDetails(dynamic booking) {
    Navigator.pushNamed(
      context,
      '/booking-details',
      arguments: booking,
    );
  }

  void _handleFeaturedContent(dynamic content) {
    Navigator.pushNamed(
      context,
      '/featured-content',
      arguments: content,
    );
  }
}
```

#### Service Request Feature
```dart
// lib/features/guest/presentation/pages/service_request_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/service_request_bloc.dart';

class ServiceRequestPage extends StatefulWidget {
  @override
  _ServiceRequestPageState createState() => _ServiceRequestPageState();
}

class _ServiceRequestPageState extends State<ServiceRequestPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  String _selectedType = 'housekeeping';
  String _selectedPriority = 'medium';
  DateTime? _preferredTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Service Request'),
      ),
      body: BlocListener<ServiceRequestBloc, ServiceRequestState>(
        listener: (context, state) {
          if (state is ServiceRequestSuccess) {
            Navigator.pop(context, state.request);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Service request submitted successfully')),
            );
          } else if (state is ServiceRequestError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Error: ${state.message}')),
            );
          }
        },
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Request type selection
                Text(
                  'Request Type',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedType,
                  items: [
                    DropdownMenuItem(value: 'housekeeping', child: Text('Housekeeping')),
                    DropdownMenuItem(value: 'maintenance', child: Text('Maintenance')),
                    DropdownMenuItem(value: 'concierge', child: Text('Concierge')),
                    DropdownMenuItem(value: 'dining', child: Text('Dining')),
                    DropdownMenuItem(value: 'other', child: Text('Other')),
                  ],
                  onChanged: (value) => setState(() => _selectedType = value!),
                  decoration: InputDecoration(
                    border: OutlineInputBorder(),
                  ),
                ),
                
                SizedBox(height: 16),
                
                // Priority selection
                Text(
                  'Priority',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: RadioListTile<String>(
                        title: Text('Low'),
                        value: 'low',
                        groupValue: _selectedPriority,
                        onChanged: (value) => setState(() => _selectedPriority = value!),
                      ),
                    ),
                    Expanded(
                      child: RadioListTile<String>(
                        title: Text('Medium'),
                        value: 'medium',
                        groupValue: _selectedPriority,
                        onChanged: (value) => setState(() => _selectedPriority = value!),
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Expanded(
                      child: RadioListTile<String>(
                        title: Text('High'),
                        value: 'high',
                        groupValue: _selectedPriority,
                        onChanged: (value) => setState(() => _selectedPriority = value!),
                      ),
                    ),
                    Expanded(
                      child: RadioListTile<String>(
                        title: Text('Urgent'),
                        value: 'urgent',
                        groupValue: _selectedPriority,
                        onChanged: (value) => setState(() => _selectedPriority = value!),
                      ),
                    ),
                  ],
                ),
                
                SizedBox(height: 16),
                
                // Title input
                TextFormField(
                  controller: _titleController,
                  decoration: InputDecoration(
                    labelText: 'Request Title *',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a title';
                    }
                    return null;
                  },
                ),
                
                SizedBox(height: 16),
                
                // Description input
                TextFormField(
                  controller: _descriptionController,
                  decoration: InputDecoration(
                    labelText: 'Description *',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 4,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a description';
                    }
                    return null;
                  },
                ),
                
                SizedBox(height: 16),
                
                // Preferred time
                ListTile(
                  title: Text('Preferred Time (Optional)'),
                  subtitle: Text(_preferredTime?.toString() ?? 'No time selected'),
                  trailing: Icon(Icons.schedule),
                  onTap: _selectPreferredTime,
                ),
                
                SizedBox(height: 32),
                
                // Submit button
                BlocBuilder<ServiceRequestBloc, ServiceRequestState>(
                  builder: (context, state) {
                    return SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: state is ServiceRequestLoading 
                            ? null 
                            : _submitRequest,
                        child: state is ServiceRequestLoading
                            ? CircularProgressIndicator()
                            : Text('Submit Request'),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _selectPreferredTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(Duration(days: 30)),
    );
    
    if (date != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
      );
      
      if (time != null) {
        setState(() {
          _preferredTime = DateTime(
            date.year,
            date.month,
            date.day,
            time.hour,
            time.minute,
          );
        });
      }
    }
  }

  void _submitRequest() {
    if (_formKey.currentState!.validate()) {
      context.read<ServiceRequestBloc>().add(
        SubmitServiceRequest(
          type: _selectedType,
          priority: _selectedPriority,
          title: _titleController.text,
          description: _descriptionController.text,
          preferredTime: _preferredTime,
        ),
      );
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }
}
```

## Testing Strategy

### 3.9 Unit Tests
- **Component Testing**: Test individual UI components
- **Service Testing**: Test API service calls and data handling
- **State Management Testing**: Test BLoC state changes
- **Navigation Testing**: Test routing and navigation flows

### 3.10 Integration Tests
- **Feature Flow Testing**: Complete user journey testing
- **API Integration Testing**: Backend service integration
- **Offline Functionality Testing**: Test offline capabilities
- **Performance Testing**: Load testing and responsiveness

### 3.11 User Acceptance Testing
- **Guest Experience Testing**: Real guest feedback sessions
- **Accessibility Testing**: Screen reader and accessibility compliance
- **Usability Testing**: Task completion and user satisfaction
- **Cross-platform Testing**: iOS and Android compatibility

## Dependencies
- **Issue #01**: Mobile App Core Architecture (authentication, offline capabilities)
- **Issue #02**: Guest Profile & Preferences Management (personalization data)

## Success Criteria
- [ ] Guest onboarding process completed in under 3 minutes
- [ ] Service requests submitted and acknowledged within 30 seconds
- [ ] 95% app crash-free rate
- [ ] 4.5+ star rating in app stores
- [ ] 80% feature adoption rate among guests

## Risk Mitigation
- **Performance Issues**: Implement lazy loading and image optimization
- **Offline Functionality**: Comprehensive offline testing and sync validation
- **User Experience**: Continuous user feedback and iterative improvements
- **Security Concerns**: Regular security audits and penetration testing
