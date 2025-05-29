# Issue #10: Mobile Analytics & Performance Monitoring

## Overview
Implement comprehensive mobile analytics and performance monitoring system to track app usage, user behavior, performance metrics, and business intelligence across the Banrimkwae Resort mobile application ecosystem.

## Priority
**High** - Critical for continuous improvement and optimization

## Estimated Timeline
**5 days** (Week 6 of Phase 6)

## Requirements

### 10.1 User Analytics & Behavior Tracking
- **User Journey Analytics**: Track complete user paths and conversion funnels
- **Feature Usage Analytics**: Monitor feature adoption and usage patterns
- **Session Analytics**: Track session duration, frequency, and engagement
- **A/B Testing Framework**: Test different UI/UX variations and features
- **Cohort Analysis**: Track user retention and lifetime value

### 10.2 Performance Monitoring
- **App Performance Metrics**: Track loading times, crash rates, and responsiveness
- **API Performance Monitoring**: Monitor backend API response times and errors
- **Device Performance**: Track performance across different devices and OS versions
- **Network Performance**: Monitor app performance under different network conditions
- **Real User Monitoring**: Track actual user experience metrics

### 10.3 Business Intelligence & Reporting
- **Revenue Analytics**: Track mobile-driven revenue and conversion rates
- **Service Usage Analytics**: Monitor booking patterns and service preferences
- **Guest Satisfaction Metrics**: Track ratings, reviews, and feedback
- **Operational Metrics**: Monitor staff efficiency and service delivery
- **Predictive Analytics**: Forecast demand and optimize resource allocation

### 10.4 Error Tracking & Debugging
- **Crash Reporting**: Automatic crash detection and reporting
- **Error Logging**: Comprehensive error tracking with stack traces
- **Performance Issues**: Identify and track performance bottlenecks
- **User Feedback Integration**: Link crashes to user feedback
- **Real-time Alerting**: Immediate notifications for critical issues

### 10.5 Privacy & Compliance
- **GDPR Compliance**: Ensure data collection complies with privacy regulations
- **Data Anonymization**: Anonymize personal data in analytics
- **Consent Management**: User consent for data collection
- **Data Retention**: Automatic data purging based on policies
- **Security Monitoring**: Track security-related events and anomalies

## Technical Specifications

### 10.6 Database Schema

#### Analytics and Monitoring Tables
```sql
-- Mobile app analytics events
CREATE TABLE mobile_analytics_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id VARCHAR(100) UNIQUE NOT NULL,
    user_id BIGINT,
    session_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_category VARCHAR(100),
    event_properties JSON,
    screen_name VARCHAR(255),
    timestamp TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    device_info JSON,
    app_version VARCHAR(20),
    platform ENUM('ios', 'android', 'web') NOT NULL,
    network_type VARCHAR(50),
    location_data JSON,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_events (user_id, timestamp),
    INDEX idx_session_events (session_id, timestamp),
    INDEX idx_event_type (event_type, timestamp),
    INDEX idx_event_name (event_name, timestamp),
    INDEX idx_platform_events (platform, timestamp),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Mobile app user sessions
CREATE TABLE mobile_analytics_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id BIGINT,
    device_id VARCHAR(255),
    start_time TIMESTAMP(6) NOT NULL,
    end_time TIMESTAMP(6),
    duration_seconds INT,
    page_views INT DEFAULT 0,
    events_count INT DEFAULT 0,
    is_bounce BOOLEAN DEFAULT FALSE,
    entry_screen VARCHAR(255),
    exit_screen VARCHAR(255),
    app_version VARCHAR(20),
    platform ENUM('ios', 'android', 'web') NOT NULL,
    device_model VARCHAR(100),
    os_version VARCHAR(50),
    network_type VARCHAR(50),
    country VARCHAR(2),
    city VARCHAR(100),
    is_new_user BOOLEAN DEFAULT FALSE,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_sessions (user_id, start_time),
    INDEX idx_session_duration (duration_seconds),
    INDEX idx_platform_sessions (platform, start_time),
    INDEX idx_bounce_sessions (is_bounce),
    INDEX idx_new_user_sessions (is_new_user, start_time),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Mobile app performance metrics
CREATE TABLE mobile_performance_metrics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    metric_id VARCHAR(100) UNIQUE NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    metric_type ENUM('app_start', 'screen_load', 'api_call', 'user_interaction') NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    value DECIMAL(10,3) NOT NULL, -- milliseconds or other unit
    unit VARCHAR(20) DEFAULT 'ms',
    additional_data JSON,
    timestamp TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    device_info JSON,
    network_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_metrics (session_id, timestamp),
    INDEX idx_metric_type (metric_type, timestamp),
    INDEX idx_metric_name (metric_name, timestamp),
    INDEX idx_performance_value (value, metric_type),
    FOREIGN KEY (session_id) REFERENCES mobile_analytics_sessions(session_id) ON DELETE CASCADE
);

-- Mobile app crashes and errors
CREATE TABLE mobile_app_crashes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    crash_id VARCHAR(100) UNIQUE NOT NULL,
    user_id BIGINT,
    session_id VARCHAR(100),
    crash_type ENUM('crash', 'error', 'exception', 'anr') NOT NULL,
    error_message TEXT,
    stack_trace TEXT,
    error_code VARCHAR(50),
    app_version VARCHAR(20),
    platform ENUM('ios', 'android', 'web') NOT NULL,
    device_model VARCHAR(100),
    os_version VARCHAR(50),
    available_memory BIGINT,
    used_memory BIGINT,
    battery_level INT,
    network_status VARCHAR(50),
    location_data JSON,
    breadcrumbs JSON, -- user actions leading to crash
    custom_data JSON,
    is_fatal BOOLEAN DEFAULT TRUE,
    occurred_at TIMESTAMP(6) NOT NULL,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('new', 'investigating', 'resolved', 'ignored') DEFAULT 'new',
    assigned_to BIGINT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_crashes (user_id, occurred_at),
    INDEX idx_session_crashes (session_id),
    INDEX idx_crash_type (crash_type, occurred_at),
    INDEX idx_platform_crashes (platform, occurred_at),
    INDEX idx_app_version_crashes (app_version, occurred_at),
    INDEX idx_crash_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Mobile business intelligence metrics
CREATE TABLE mobile_business_metrics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    unit VARCHAR(50),
    dimensions JSON, -- additional grouping dimensions
    platform ENUM('ios', 'android', 'web', 'all') DEFAULT 'all',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_metric_date (metric_date, metric_type),
    INDEX idx_metric_name (metric_name, metric_date),
    INDEX idx_platform_metrics (platform, metric_date),
    UNIQUE KEY unique_daily_metric (metric_date, metric_type, metric_name, platform)
);

-- A/B testing experiments
CREATE TABLE mobile_ab_experiments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    experiment_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    hypothesis TEXT,
    status ENUM('draft', 'running', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    traffic_allocation DECIMAL(5,2) DEFAULT 100.00, -- percentage
    success_metric VARCHAR(255),
    variants JSON, -- experiment variants configuration
    results JSON, -- experiment results
    statistical_significance DECIMAL(5,4),
    confidence_level DECIMAL(5,2) DEFAULT 95.00,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_experiment_status (status),
    INDEX idx_experiment_dates (start_date, end_date),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- A/B testing user assignments
CREATE TABLE mobile_ab_user_assignments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    experiment_id VARCHAR(100) NOT NULL,
    variant_id VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_exposure_at TIMESTAMP NULL,
    conversions JSON, -- tracked conversions for this user
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_experiments (user_id, experiment_id),
    INDEX idx_experiment_assignments (experiment_id, variant_id),
    INDEX idx_assigned_date (assigned_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_experiment (user_id, experiment_id)
);
```

### 10.7 Backend Services (Laravel)

#### Mobile Analytics Service
```php
<?php

namespace App\Services\Mobile;

use App\Models\MobileAnalyticsEvent;
use App\Models\MobileAnalyticsSession;
use App\Models\MobilePerformanceMetric;
use App\Models\MobileAppCrash;
use App\Models\MobileBusinessMetric;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class MobileAnalyticsService
{
    /**
     * Track analytics event
     */
    public function trackEvent($eventData)
    {
        // Validate event data
        $this->validateEventData($eventData);
        
        // Store event
        $event = MobileAnalyticsEvent::create([
            'event_id' => $this->generateEventId(),
            'user_id' => $eventData['user_id'] ?? null,
            'session_id' => $eventData['session_id'],
            'event_type' => $eventData['event_type'],
            'event_name' => $eventData['event_name'],
            'event_category' => $eventData['event_category'] ?? null,
            'event_properties' => $eventData['properties'] ?? [],
            'screen_name' => $eventData['screen_name'] ?? null,
            'timestamp' => Carbon::createFromTimestamp($eventData['timestamp']),
            'device_info' => $eventData['device_info'] ?? [],
            'app_version' => $eventData['app_version'],
            'platform' => $eventData['platform'],
            'network_type' => $eventData['network_type'] ?? null,
            'location_data' => $eventData['location'] ?? [],
            'is_anonymous' => !isset($eventData['user_id'])
        ]);
        
        // Update session metrics
        $this->updateSessionMetrics($eventData['session_id']);
        
        // Process real-time analytics
        $this->processRealTimeAnalytics($event);
        
        return $event;
    }

    /**
     * Start new session
     */
    public function startSession($sessionData)
    {
        return MobileAnalyticsSession::create([
            'session_id' => $sessionData['session_id'],
            'user_id' => $sessionData['user_id'] ?? null,
            'device_id' => $sessionData['device_id'],
            'start_time' => Carbon::createFromTimestamp($sessionData['start_time']),
            'entry_screen' => $sessionData['entry_screen'] ?? null,
            'app_version' => $sessionData['app_version'],
            'platform' => $sessionData['platform'],
            'device_model' => $sessionData['device_model'] ?? null,
            'os_version' => $sessionData['os_version'] ?? null,
            'network_type' => $sessionData['network_type'] ?? null,
            'country' => $sessionData['country'] ?? null,
            'city' => $sessionData['city'] ?? null,
            'is_new_user' => $sessionData['is_new_user'] ?? false,
            'user_agent' => $sessionData['user_agent'] ?? null
        ]);
    }

    /**
     * End session
     */
    public function endSession($sessionId, $endData)
    {
        $session = MobileAnalyticsSession::where('session_id', $sessionId)->first();
        
        if ($session) {
            $endTime = Carbon::createFromTimestamp($endData['end_time']);
            $duration = $endTime->diffInSeconds($session->start_time);
            
            $session->update([
                'end_time' => $endTime,
                'duration_seconds' => $duration,
                'exit_screen' => $endData['exit_screen'] ?? null,
                'is_bounce' => $duration < 10 // Less than 10 seconds considered bounce
            ]);
        }
        
        return $session;
    }

    /**
     * Track performance metric
     */
    public function trackPerformance($performanceData)
    {
        return MobilePerformanceMetric::create([
            'metric_id' => $this->generateMetricId(),
            'session_id' => $performanceData['session_id'],
            'metric_type' => $performanceData['metric_type'],
            'metric_name' => $performanceData['metric_name'],
            'value' => $performanceData['value'],
            'unit' => $performanceData['unit'] ?? 'ms',
            'additional_data' => $performanceData['additional_data'] ?? [],
            'timestamp' => Carbon::createFromTimestamp($performanceData['timestamp']),
            'device_info' => $performanceData['device_info'] ?? [],
            'network_info' => $performanceData['network_info'] ?? []
        ]);
    }

    /**
     * Report crash
     */
    public function reportCrash($crashData)
    {
        $crash = MobileAppCrash::create([
            'crash_id' => $this->generateCrashId(),
            'user_id' => $crashData['user_id'] ?? null,
            'session_id' => $crashData['session_id'] ?? null,
            'crash_type' => $crashData['crash_type'],
            'error_message' => $crashData['error_message'] ?? null,
            'stack_trace' => $crashData['stack_trace'] ?? null,
            'error_code' => $crashData['error_code'] ?? null,
            'app_version' => $crashData['app_version'],
            'platform' => $crashData['platform'],
            'device_model' => $crashData['device_model'] ?? null,
            'os_version' => $crashData['os_version'] ?? null,
            'available_memory' => $crashData['available_memory'] ?? null,
            'used_memory' => $crashData['used_memory'] ?? null,
            'battery_level' => $crashData['battery_level'] ?? null,
            'network_status' => $crashData['network_status'] ?? null,
            'location_data' => $crashData['location'] ?? [],
            'breadcrumbs' => $crashData['breadcrumbs'] ?? [],
            'custom_data' => $crashData['custom_data'] ?? [],
            'is_fatal' => $crashData['is_fatal'] ?? true,
            'occurred_at' => Carbon::createFromTimestamp($crashData['occurred_at'])
        ]);
        
        // Send immediate alert for critical crashes
        if ($crashData['is_fatal'] && $this->isCriticalCrash($crash)) {
            $this->sendCrashAlert($crash);
        }
        
        return $crash;
    }

    /**
     * Generate analytics dashboard data
     */
    public function getDashboardData($dateRange = 7)
    {
        $startDate = Carbon::now()->subDays($dateRange);
        $endDate = Carbon::now();
        
        return [
            'user_metrics' => $this->getUserMetrics($startDate, $endDate),
            'session_metrics' => $this->getSessionMetrics($startDate, $endDate),
            'performance_metrics' => $this->getPerformanceMetrics($startDate, $endDate),
            'error_metrics' => $this->getErrorMetrics($startDate, $endDate),
            'business_metrics' => $this->getBusinessMetrics($startDate, $endDate),
            'real_time_metrics' => $this->getRealTimeMetrics()
        ];
    }

    /**
     * Generate business intelligence report
     */
    public function generateBusinessReport($filters = [])
    {
        $query = MobileBusinessMetric::query();
        
        if (isset($filters['date_from'])) {
            $query->whereDate('metric_date', '>=', $filters['date_from']);
        }
        
        if (isset($filters['date_to'])) {
            $query->whereDate('metric_date', '<=', $filters['date_to']);
        }
        
        if (isset($filters['metric_type'])) {
            $query->where('metric_type', $filters['metric_type']);
        }
        
        if (isset($filters['platform'])) {
            $query->where('platform', $filters['platform']);
        }
        
        $metrics = $query->orderBy('metric_date', 'desc')->get();
        
        return [
            'metrics' => $metrics,
            'summary' => $this->calculateMetricsSummary($metrics),
            'trends' => $this->calculateTrends($metrics),
            'insights' => $this->generateInsights($metrics)
        ];
    }

    private function updateSessionMetrics($sessionId)
    {
        $session = MobileAnalyticsSession::where('session_id', $sessionId)->first();
        if ($session) {
            $session->increment('events_count');
        }
    }

    private function processRealTimeAnalytics($event)
    {
        // Update real-time counters in cache
        $cacheKey = "realtime_events_" . date('Y-m-d-H-i');
        Cache::increment($cacheKey, 1);
        Cache::expire($cacheKey, 3600); // 1 hour TTL
        
        // Process conversion events
        if ($event->event_type === 'conversion') {
            $this->processConversionEvent($event);
        }
    }

    private function generateEventId()
    {
        return 'evt_' . uniqid() . '_' . time();
    }

    private function generateMetricId()
    {
        return 'met_' . uniqid() . '_' . time();
    }

    private function generateCrashId()
    {
        return 'crash_' . uniqid() . '_' . time();
    }
}
```

### 10.8 Flutter Implementation

#### Analytics SDK
```dart
// lib/core/analytics/analytics_service.dart
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../network/api_client.dart';
import '../storage/local_storage.dart';

class AnalyticsService {
  static final AnalyticsService _instance = AnalyticsService._internal();
  factory AnalyticsService() => _instance;
  AnalyticsService._internal();

  final ApiClient _apiClient = ApiClient();
  final LocalStorage _localStorage = LocalStorage();
  
  String? _sessionId;
  DateTime? _sessionStartTime;
  int _eventCount = 0;

  /// Initialize analytics service
  Future<void> initialize() async {
    await _startNewSession();
    _setupLifecycleObserver();
  }

  /// Track custom event
  Future<void> trackEvent({
    required String eventName,
    String? eventCategory,
    Map<String, dynamic>? properties,
    String? screenName,
  }) async {
    try {
      final event = await _buildEventData(
        eventType: 'custom',
        eventName: eventName,
        eventCategory: eventCategory,
        properties: properties,
        screenName: screenName,
      );

      await _sendEvent(event);
      _eventCount++;
    } catch (e) {
      print('Analytics tracking error: $e');
    }
  }

  /// Track screen view
  Future<void> trackScreenView(String screenName) async {
    await trackEvent(
      eventName: 'screen_view',
      eventCategory: 'navigation',
      properties: {'screen_name': screenName},
      screenName: screenName,
    );
  }

  /// Track user action
  Future<void> trackUserAction({
    required String action,
    String? target,
    Map<String, dynamic>? context,
  }) async {
    await trackEvent(
      eventName: action,
      eventCategory: 'user_interaction',
      properties: {
        'target': target,
        ...?context,
      },
    );
  }

  /// Track conversion event
  Future<void> trackConversion({
    required String conversionType,
    required double value,
    String? currency,
    Map<String, dynamic>? properties,
  }) async {
    await trackEvent(
      eventName: 'conversion',
      eventCategory: 'business',
      properties: {
        'conversion_type': conversionType,
        'value': value,
        'currency': currency ?? 'THB',
        ...?properties,
      },
    );
  }

  /// Track performance metric
  Future<void> trackPerformance({
    required String metricName,
    required String metricType,
    required double value,
    String unit = 'ms',
    Map<String, dynamic>? additionalData,
  }) async {
    try {
      final performanceData = {
        'session_id': _sessionId,
        'metric_type': metricType,
        'metric_name': metricName,
        'value': value,
        'unit': unit,
        'additional_data': additionalData,
        'timestamp': DateTime.now().millisecondsSinceEpoch / 1000,
        'device_info': await _getDeviceInfo(),
        'network_info': await _getNetworkInfo(),
      };

      await _apiClient.post('/analytics/performance', performanceData);
    } catch (e) {
      print('Performance tracking error: $e');
    }
  }

  /// Track error or crash
  Future<void> trackError({
    required String errorType,
    required String errorMessage,
    String? stackTrace,
    Map<String, dynamic>? context,
    bool isFatal = false,
  }) async {
    try {
      final crashData = {
        'session_id': _sessionId,
        'crash_type': errorType,
        'error_message': errorMessage,
        'stack_trace': stackTrace,
        'is_fatal': isFatal,
        'app_version': await _getAppVersion(),
        'platform': await _getPlatform(),
        'device_info': await _getDeviceInfo(),
        'custom_data': context,
        'occurred_at': DateTime.now().millisecondsSinceEpoch / 1000,
      };

      await _apiClient.post('/analytics/crash', crashData);
    } catch (e) {
      print('Error tracking error: $e');
    }
  }

  /// Start timing for performance measurement
  PerformanceTimer startTimer(String operationName) {
    return PerformanceTimer(operationName, this);
  }

  /// Set user properties
  Future<void> setUserProperties(Map<String, dynamic> properties) async {
    await _localStorage.setUserProperties(properties);
  }

  /// Set user ID
  Future<void> setUserId(String userId) async {
    await _localStorage.setUserId(userId);
  }

  Future<void> _startNewSession() async {
    _sessionId = Uuid().v4();
    _sessionStartTime = DateTime.now();
    _eventCount = 0;

    final sessionData = {
      'session_id': _sessionId,
      'user_id': await _localStorage.getUserId(),
      'device_id': await _localStorage.getDeviceId(),
      'start_time': _sessionStartTime!.millisecondsSinceEpoch / 1000,
      'app_version': await _getAppVersion(),
      'platform': await _getPlatform(),
      'device_info': await _getDeviceInfo(),
      'is_new_user': await _isNewUser(),
    };

    try {
      await _apiClient.post('/analytics/session/start', sessionData);
    } catch (e) {
      print('Session start error: $e');
    }
  }

  Future<void> _endSession() async {
    if (_sessionId == null || _sessionStartTime == null) return;

    final endData = {
      'session_id': _sessionId,
      'end_time': DateTime.now().millisecondsSinceEpoch / 1000,
      'events_count': _eventCount,
    };

    try {
      await _apiClient.post('/analytics/session/end', endData);
    } catch (e) {
      print('Session end error: $e');
    }
  }

  Future<Map<String, dynamic>> _buildEventData({
    required String eventType,
    required String eventName,
    String? eventCategory,
    Map<String, dynamic>? properties,
    String? screenName,
  }) async {
    return {
      'session_id': _sessionId,
      'user_id': await _localStorage.getUserId(),
      'event_type': eventType,
      'event_name': eventName,
      'event_category': eventCategory,
      'properties': properties ?? {},
      'screen_name': screenName,
      'timestamp': DateTime.now().millisecondsSinceEpoch / 1000,
      'device_info': await _getDeviceInfo(),
      'app_version': await _getAppVersion(),
      'platform': await _getPlatform(),
      'network_type': await _getNetworkType(),
    };
  }

  Future<void> _sendEvent(Map<String, dynamic> eventData) async {
    try {
      await _apiClient.post('/analytics/event', eventData);
    } catch (e) {
      // Store event locally for retry
      await _localStorage.storeFailedEvent(eventData);
    }
  }

  void _setupLifecycleObserver() {
    WidgetsBinding.instance.addObserver(_AppLifecycleObserver(this));
  }

  Future<Map<String, dynamic>> _getDeviceInfo() async {
    // Implementation to get device information
    return {};
  }

  Future<String> _getAppVersion() async {
    // Implementation to get app version
    return '1.0.0';
  }

  Future<String> _getPlatform() async {
    // Implementation to get platform
    return 'android';
  }

  Future<String?> _getNetworkType() async {
    // Implementation to get network type
    return 'wifi';
  }

  Future<Map<String, dynamic>> _getNetworkInfo() async {
    // Implementation to get network information
    return {};
  }

  Future<bool> _isNewUser() async {
    return await _localStorage.isNewUser();
  }
}

class PerformanceTimer {
  final String operationName;
  final AnalyticsService analyticsService;
  final DateTime startTime;

  PerformanceTimer(this.operationName, this.analyticsService)
      : startTime = DateTime.now();

  void stop({Map<String, dynamic>? additionalData}) {
    final duration = DateTime.now().difference(startTime).inMilliseconds;
    analyticsService.trackPerformance(
      metricName: operationName,
      metricType: 'user_interaction',
      value: duration.toDouble(),
      additionalData: additionalData,
    );
  }
}

class _AppLifecycleObserver extends WidgetsBindingObserver {
  final AnalyticsService analyticsService;

  _AppLifecycleObserver(this.analyticsService);

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.paused:
        analyticsService._endSession();
        break;
      case AppLifecycleState.resumed:
        analyticsService._startNewSession();
        break;
      default:
        break;
    }
  }
}
```

## Testing Strategy

### 10.9 Analytics Testing
- **Event Tracking Testing**: Validate all event tracking implementations
- **Performance Monitoring Testing**: Test performance metric collection
- **Data Quality Testing**: Ensure data accuracy and completeness
- **Privacy Compliance Testing**: Validate GDPR and privacy compliance

### 10.10 A/B Testing Framework
- **Experiment Setup**: Test A/B testing experiment creation and management
- **Variant Distribution**: Validate proper user assignment to variants
- **Results Collection**: Test conversion tracking and results calculation
- **Statistical Analysis**: Validate statistical significance calculations

## Dependencies
- **All Previous Issues**: Analytics integration across all mobile features
- **Issue #01**: Core architecture for data collection infrastructure

## Success Criteria
- [ ] 99.9% data collection accuracy
- [ ] Real-time dashboard with sub-second updates
- [ ] Complete user journey tracking
- [ ] Actionable business insights generated
- [ ] Full GDPR compliance maintained

## Risk Mitigation
- **Data Loss**: Implement offline event storage and retry mechanisms
- **Performance Impact**: Optimize data collection to minimize app performance impact
- **Privacy Violations**: Regular privacy audits and compliance monitoring
- **Data Overload**: Implement data sampling and retention policies
