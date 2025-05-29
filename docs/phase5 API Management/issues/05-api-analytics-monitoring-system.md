# Issue #05: API Analytics and Monitoring System

## Issue Overview
Implement comprehensive API analytics and monitoring system to track usage patterns, performance metrics, security events, and provide actionable insights for API optimization and business intelligence.

## Priority: HIGH
**Estimated Time**: 4-5 days  
**Dependencies**: Issues #01-04 (Core Infrastructure, Auth, Documentation, Rate Limiting)  
**Assigned Module**: Analytics & Monitoring  

## Detailed Requirements

### 1. Real-Time Analytics Collection
**Objective**: Capture comprehensive metrics for all API interactions

**Analytics Data Model**:
```php
class APIAnalyticsCollector {
    private $analytics = [
        'request_id' => null,
        'timestamp' => null,
        'endpoint' => null,
        'method' => null,
        'user_id' => null,
        'api_key_id' => null,
        'ip_address' => null,
        'user_agent' => null,
        'referer' => null,
        'response_status' => null,
        'response_time_ms' => null,
        'request_size_bytes' => null,
        'response_size_bytes' => null,
        'geographic_location' => null,
        'device_type' => null,
        'error_code' => null,
        'error_message' => null,
        'cache_hit' => null,
        'database_queries' => null,
        'memory_usage' => null
    ];
}
```

**Database Schema for Analytics**:
```sql
-- Main Analytics Table (Partitioned by date)
CREATE TABLE api_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(64) UNIQUE NOT NULL,
    timestamp TIMESTAMP(3) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    user_id BIGINT NULL,
    api_key_id BIGINT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer VARCHAR(500),
    response_status SMALLINT,
    response_time_ms INT,
    request_size_bytes INT,
    response_size_bytes INT,
    geographic_country VARCHAR(2),
    geographic_city VARCHAR(100),
    device_type ENUM('desktop', 'mobile', 'tablet', 'bot', 'unknown'),
    error_code VARCHAR(50),
    error_message TEXT,
    cache_hit BOOLEAN DEFAULT FALSE,
    database_queries_count SMALLINT DEFAULT 0,
    memory_usage_mb DECIMAL(8,2),
    created_date DATE AS (DATE(timestamp)) STORED,
    INDEX idx_timestamp (timestamp),
    INDEX idx_endpoint_method (endpoint, method),
    INDEX idx_user_timestamp (user_id, timestamp),
    INDEX idx_status_timestamp (response_status, timestamp),
    INDEX idx_date_endpoint (created_date, endpoint)
) PARTITION BY RANGE (TO_DAYS(created_date)) (
    PARTITION p_2025_05 VALUES LESS THAN (TO_DAYS('2025-06-01')),
    PARTITION p_2025_06 VALUES LESS THAN (TO_DAYS('2025-07-01')),
    PARTITION p_2025_07 VALUES LESS THAN (TO_DAYS('2025-08-01')),
    PARTITION p_2025_08 VALUES LESS THAN (TO_DAYS('2025-09-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Aggregated Hourly Statistics
CREATE TABLE api_analytics_hourly (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hour_timestamp TIMESTAMP NOT NULL,
    endpoint VARCHAR(500),
    method VARCHAR(10),
    total_requests INT DEFAULT 0,
    successful_requests INT DEFAULT 0,
    error_requests INT DEFAULT 0,
    avg_response_time_ms DECIMAL(8,2),
    min_response_time_ms INT,
    max_response_time_ms INT,
    p95_response_time_ms INT,
    total_bytes_transferred BIGINT DEFAULT 0,
    unique_users INT DEFAULT 0,
    unique_ips INT DEFAULT 0,
    cache_hit_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_hour_endpoint (hour_timestamp, endpoint, method),
    INDEX idx_hour_timestamp (hour_timestamp),
    INDEX idx_endpoint_hour (endpoint, hour_timestamp)
);

-- Daily Summary Statistics
CREATE TABLE api_analytics_daily (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    endpoint VARCHAR(500),
    method VARCHAR(10),
    total_requests INT DEFAULT 0,
    successful_requests INT DEFAULT 0,
    error_requests INT DEFAULT 0,
    avg_response_time_ms DECIMAL(8,2),
    p95_response_time_ms INT,
    total_bytes_transferred BIGINT DEFAULT 0,
    unique_users INT DEFAULT 0,
    unique_ips INT DEFAULT 0,
    top_user_agents JSON,
    top_countries JSON,
    error_breakdown JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date_endpoint (date, endpoint, method),
    INDEX idx_date (date),
    INDEX idx_endpoint_date (endpoint, date)
);

-- Error Tracking and Analysis
CREATE TABLE api_error_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(64),
    timestamp TIMESTAMP(3) NOT NULL,
    endpoint VARCHAR(500),
    method VARCHAR(10),
    error_type ENUM('4xx_client', '5xx_server', 'timeout', 'rate_limit', 'auth_failure'),
    error_code VARCHAR(50),
    error_message TEXT,
    stack_trace LONGTEXT,
    user_id BIGINT NULL,
    api_key_id BIGINT NULL,
    ip_address VARCHAR(45),
    resolution_status ENUM('new', 'investigating', 'resolved', 'ignored') DEFAULT 'new',
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp),
    INDEX idx_error_type (error_type, timestamp),
    INDEX idx_endpoint_errors (endpoint, error_type),
    INDEX idx_resolution_status (resolution_status)
);
```

### 2. Real-Time Monitoring Dashboard
**Objective**: Provide live monitoring interface for API health and performance

**Dashboard Controller**:
```php
class MonitoringDashboardController {
    private $analyticsService;
    private $cacheService;
    
    public function __construct(AnalyticsService $analyticsService, CacheService $cacheService) {
        $this->analyticsService = $analyticsService;
        $this->cacheService = $cacheService;
    }
    
    public function dashboard() {
        $metrics = [
            'realtime' => $this->getRealTimeMetrics(),
            'today' => $this->getTodayMetrics(),
            'week' => $this->getWeekMetrics(),
            'alerts' => $this->getActiveAlerts()
        ];
        
        return view('admin.monitoring.dashboard', compact('metrics'));
    }
    
    public function realTimeMetrics() {
        $cacheKey = 'realtime_metrics';
        
        return $this->cacheService->remember($cacheKey, 30, function() {
            return [
                'requests_per_minute' => $this->getRequestsPerMinute(),
                'avg_response_time' => $this->getAverageResponseTime(),
                'error_rate' => $this->getCurrentErrorRate(),
                'active_users' => $this->getActiveUsers(),
                'top_endpoints' => $this->getTopEndpoints(),
                'geographic_distribution' => $this->getGeographicDistribution(),
                'system_health' => $this->getSystemHealth()
            ];
        });
    }
    
    private function getRequestsPerMinute() {
        $now = now();
        $minute_ago = $now->copy()->subMinute();
        
        return DB::table('api_analytics')
            ->where('timestamp', '>=', $minute_ago)
            ->where('timestamp', '<=', $now)
            ->count();
    }
    
    private function getCurrentErrorRate() {
        $now = now();
        $hour_ago = $now->copy()->subHour();
        
        $total = DB::table('api_analytics')
            ->where('timestamp', '>=', $hour_ago)
            ->count();
            
        $errors = DB::table('api_analytics')
            ->where('timestamp', '>=', $hour_ago)
            ->where('response_status', '>=', 400)
            ->count();
            
        return $total > 0 ? round(($errors / $total) * 100, 2) : 0;
    }
}
```

**Real-Time Dashboard Interface**:
```html
<!-- Real-Time Monitoring Dashboard -->
<div class="monitoring-dashboard">
    <!-- Key Metrics Cards -->
    <div class="metrics-grid">
        <div class="metric-card requests-per-minute">
            <h3>Requests/Minute</h3>
            <div class="metric-value" id="rpm-value">0</div>
            <div class="metric-trend" id="rpm-trend"></div>
        </div>
        
        <div class="metric-card response-time">
            <h3>Avg Response Time</h3>
            <div class="metric-value" id="response-time-value">0ms</div>
            <div class="metric-trend" id="response-time-trend"></div>
        </div>
        
        <div class="metric-card error-rate">
            <h3>Error Rate</h3>
            <div class="metric-value" id="error-rate-value">0%</div>
            <div class="metric-trend" id="error-rate-trend"></div>
        </div>
        
        <div class="metric-card active-users">
            <h3>Active Users</h3>
            <div class="metric-value" id="active-users-value">0</div>
            <div class="metric-trend" id="active-users-trend"></div>
        </div>
    </div>
    
    <!-- Real-Time Charts -->
    <div class="charts-section">
        <div class="chart-container">
            <h4>Request Volume</h4>
            <canvas id="request-volume-chart"></canvas>
        </div>
        
        <div class="chart-container">
            <h4>Response Time Distribution</h4>
            <canvas id="response-time-chart"></canvas>
        </div>
        
        <div class="chart-container">
            <h4>Geographic Distribution</h4>
            <div id="geographic-map"></div>
        </div>
        
        <div class="chart-container">
            <h4>Top Endpoints</h4>
            <canvas id="top-endpoints-chart"></canvas>
        </div>
    </div>
    
    <!-- Active Alerts -->
    <div class="alerts-section">
        <h4>Active Alerts</h4>
        <div id="active-alerts-list"></div>
    </div>
    
    <!-- Live Activity Feed -->
    <div class="activity-feed">
        <h4>Live Activity Feed</h4>
        <div id="live-activity-stream"></div>
    </div>
</div>
```

**Real-Time Updates JavaScript**:
```javascript
class MonitoringDashboard {
    constructor() {
        this.socket = null;
        this.charts = {};
        this.updateInterval = 30000; // 30 seconds
        this.initializeCharts();
        this.setupWebSocket();
        this.startPeriodicUpdates();
    }
    
    setupWebSocket() {
        this.socket = new WebSocket('wss://api.banrimkwae.com/monitoring');
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateMetrics(data);
        };
        
        this.socket.onclose = () => {
            // Fallback to HTTP polling if WebSocket fails
            console.log('WebSocket closed, falling back to HTTP polling');
            this.startHttpPolling();
        };
    }
    
    async fetchMetrics() {
        try {
            const response = await fetch('/api/admin/monitoring/realtime');
            const data = await response.json();
            this.updateMetrics(data);
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
        }
    }
    
    updateMetrics(data) {
        // Update metric cards
        document.getElementById('rpm-value').textContent = data.requests_per_minute;
        document.getElementById('response-time-value').textContent = `${data.avg_response_time}ms`;
        document.getElementById('error-rate-value').textContent = `${data.error_rate}%`;
        document.getElementById('active-users-value').textContent = data.active_users;
        
        // Update charts
        this.updateCharts(data);
        
        // Update alerts
        this.updateAlerts(data.alerts);
        
        // Update activity feed
        this.updateActivityFeed(data.recent_activity);
    }
    
    initializeCharts() {
        // Request Volume Chart
        const ctx1 = document.getElementById('request-volume-chart').getContext('2d');
        this.charts.requestVolume = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Requests per Minute',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                animation: false
            }
        });
        
        // Response Time Chart
        const ctx2 = document.getElementById('response-time-chart').getContext('2d');
        this.charts.responseTime = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Average',
                        data: [],
                        borderColor: 'rgb(54, 162, 235)',
                        tension: 0.1
                    },
                    {
                        label: '95th Percentile',
                        data: [],
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Response Time (ms)'
                        }
                    }
                },
                animation: false
            }
        });
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MonitoringDashboard();
});
```

### 3. Performance Analytics Engine
**Objective**: Analyze API performance trends and identify optimization opportunities

**Performance Analytics Service**:
```php
class PerformanceAnalyticsService {
    public function generatePerformanceReport($timeframe = '7days') {
        return [
            'overview' => $this->getPerformanceOverview($timeframe),
            'endpoint_analysis' => $this->getEndpointPerformanceAnalysis($timeframe),
            'trends' => $this->getPerformanceTrends($timeframe),
            'bottlenecks' => $this->identifyBottlenecks($timeframe),
            'recommendations' => $this->generateRecommendations($timeframe)
        ];
    }
    
    private function getEndpointPerformanceAnalysis($timeframe) {
        $endpointStats = DB::table('api_analytics')
            ->select([
                'endpoint',
                'method',
                DB::raw('COUNT(*) as total_requests'),
                DB::raw('AVG(response_time_ms) as avg_response_time'),
                DB::raw('PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY response_time_ms) as median_response_time'),
                DB::raw('PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time'),
                DB::raw('PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) as p99_response_time'),
                DB::raw('MIN(response_time_ms) as min_response_time'),
                DB::raw('MAX(response_time_ms) as max_response_time'),
                DB::raw('COUNT(CASE WHEN response_status >= 400 THEN 1 END) as error_count'),
                DB::raw('AVG(request_size_bytes) as avg_request_size'),
                DB::raw('AVG(response_size_bytes) as avg_response_size'),
                DB::raw('AVG(database_queries_count) as avg_db_queries'),
                DB::raw('AVG(memory_usage_mb) as avg_memory_usage')
            ])
            ->where('timestamp', '>=', $this->getTimeframeStart($timeframe))
            ->groupBy(['endpoint', 'method'])
            ->orderBy('total_requests', 'desc')
            ->get();
            
        return $endpointStats->map(function($stat) {
            $stat->error_rate = $stat->total_requests > 0 ? 
                round(($stat->error_count / $stat->total_requests) * 100, 2) : 0;
            $stat->efficiency_score = $this->calculateEfficiencyScore($stat);
            return $stat;
        });
    }
    
    private function calculateEfficiencyScore($stat) {
        // Scoring algorithm based on multiple factors
        $responseTimeScore = max(0, 100 - ($stat->avg_response_time / 10)); // Lower is better
        $errorRateScore = max(0, 100 - ($stat->error_rate * 10)); // Lower is better
        $throughputScore = min(100, ($stat->total_requests / 100)); // Higher is better
        
        return round(($responseTimeScore + $errorRateScore + $throughputScore) / 3, 1);
    }
    
    private function identifyBottlenecks($timeframe) {
        $bottlenecks = [];
        
        // Slow endpoints
        $slowEndpoints = DB::table('api_analytics')
            ->select(['endpoint', 'method', DB::raw('AVG(response_time_ms) as avg_time')])
            ->where('timestamp', '>=', $this->getTimeframeStart($timeframe))
            ->groupBy(['endpoint', 'method'])
            ->having('avg_time', '>', 1000) // Slower than 1 second
            ->orderBy('avg_time', 'desc')
            ->limit(10)
            ->get();
            
        if ($slowEndpoints->count() > 0) {
            $bottlenecks[] = [
                'type' => 'slow_endpoints',
                'severity' => 'high',
                'description' => 'Endpoints with high response times',
                'data' => $slowEndpoints,
                'recommendations' => [
                    'Add database indexes for slow queries',
                    'Implement response caching',
                    'Optimize database queries',
                    'Consider endpoint-specific rate limiting'
                ]
            ];
        }
        
        // High error rate endpoints
        $errorEndpoints = DB::table('api_analytics')
            ->select([
                'endpoint', 
                'method',
                DB::raw('COUNT(*) as total'),
                DB::raw('COUNT(CASE WHEN response_status >= 400 THEN 1 END) as errors'),
                DB::raw('(COUNT(CASE WHEN response_status >= 400 THEN 1 END) / COUNT(*)) * 100 as error_rate')
            ])
            ->where('timestamp', '>=', $this->getTimeframeStart($timeframe))
            ->groupBy(['endpoint', 'method'])
            ->having('error_rate', '>', 5) // Error rate > 5%
            ->orderBy('error_rate', 'desc')
            ->get();
            
        if ($errorEndpoints->count() > 0) {
            $bottlenecks[] = [
                'type' => 'high_error_rate',
                'severity' => 'medium',
                'description' => 'Endpoints with high error rates',
                'data' => $errorEndpoints,
                'recommendations' => [
                    'Review error logs for common issues',
                    'Improve input validation',
                    'Add better error handling',
                    'Monitor for abuse patterns'
                ]
            ];
        }
        
        return $bottlenecks;
    }
}
```

### 4. User Behavior Analytics
**Objective**: Analyze user patterns and API usage behaviors

**User Analytics Service**:
```php
class UserAnalyticsService {
    public function getUserBehaviorAnalysis($timeframe = '30days') {
        return [
            'user_segments' => $this->getUserSegments($timeframe),
            'usage_patterns' => $this->getUsagePatterns($timeframe),
            'feature_adoption' => $this->getFeatureAdoption($timeframe),
            'user_journey' => $this->getUserJourneyAnalysis($timeframe),
            'retention_metrics' => $this->getRetentionMetrics($timeframe)
        ];
    }
    
    private function getUserSegments($timeframe) {
        $segments = [
            'power_users' => $this->getPowerUsers($timeframe),
            'regular_users' => $this->getRegularUsers($timeframe),
            'occasional_users' => $this->getOccasionalUsers($timeframe),
            'inactive_users' => $this->getInactiveUsers($timeframe)
        ];
        
        return $segments;
    }
    
    private function getPowerUsers($timeframe) {
        return DB::table('api_analytics')
            ->select([
                'user_id',
                DB::raw('COUNT(*) as request_count'),
                DB::raw('COUNT(DISTINCT DATE(timestamp)) as active_days'),
                DB::raw('COUNT(DISTINCT endpoint) as endpoints_used'),
                DB::raw('AVG(response_time_ms) as avg_response_time')
            ])
            ->whereNotNull('user_id')
            ->where('timestamp', '>=', $this->getTimeframeStart($timeframe))
            ->groupBy('user_id')
            ->having('request_count', '>', 1000) // More than 1000 requests
            ->having('active_days', '>', 20) // Active more than 20 days
            ->orderBy('request_count', 'desc')
            ->get();
    }
    
    private function getUsagePatterns($timeframe) {
        // Hourly usage patterns
        $hourlyPattern = DB::table('api_analytics')
            ->select([
                DB::raw('HOUR(timestamp) as hour'),
                DB::raw('COUNT(*) as request_count'),
                DB::raw('COUNT(DISTINCT user_id) as unique_users')
            ])
            ->where('timestamp', '>=', $this->getTimeframeStart($timeframe))
            ->groupBy(DB::raw('HOUR(timestamp)'))
            ->orderBy('hour')
            ->get();
            
        // Daily usage patterns
        $dailyPattern = DB::table('api_analytics')
            ->select([
                DB::raw('DAYOFWEEK(timestamp) as day_of_week'),
                DB::raw('COUNT(*) as request_count'),
                DB::raw('COUNT(DISTINCT user_id) as unique_users')
            ])
            ->where('timestamp', '>=', $this->getTimeframeStart($timeframe))
            ->groupBy(DB::raw('DAYOFWEEK(timestamp)'))
            ->orderBy('day_of_week')
            ->get();
            
        return [
            'hourly' => $hourlyPattern,
            'daily' => $dailyPattern
        ];
    }
    
    private function getFeatureAdoption($timeframe) {
        $endpointCategories = [
            'Authentication' => ['auth/login', 'auth/logout', 'auth/refresh'],
            'Accommodation' => ['accommodations', 'bookings'],
            'Activities' => ['activities', 'activity-bookings'],
            'Restaurant' => ['menu', 'orders'],
            'Inventory' => ['inventory', 'stock']
        ];
        
        $adoption = [];
        
        foreach ($endpointCategories as $category => $endpoints) {
            $categoryStats = DB::table('api_analytics')
                ->select([
                    DB::raw('COUNT(DISTINCT user_id) as unique_users'),
                    DB::raw('COUNT(*) as total_requests'),
                    DB::raw('AVG(response_time_ms) as avg_response_time')
                ])
                ->where('timestamp', '>=', $this->getTimeframeStart($timeframe))
                ->where(function($query) use ($endpoints) {
                    foreach ($endpoints as $endpoint) {
                        $query->orWhere('endpoint', 'LIKE', "%{$endpoint}%");
                    }
                })
                ->first();
                
            $adoption[$category] = $categoryStats;
        }
        
        return $adoption;
    }
}
```

### 5. Security Analytics and Threat Detection
**Objective**: Monitor for security threats and suspicious activities

**Security Analytics Service**:
```php
class SecurityAnalyticsService {
    public function analyzeSecurityEvents($timeframe = '24hours') {
        return [
            'threat_summary' => $this->getThreatSummary($timeframe),
            'suspicious_activities' => $this->getSuspiciousActivities($timeframe),
            'authentication_analysis' => $this->getAuthenticationAnalysis($timeframe),
            'geographic_anomalies' => $this->getGeographicAnomalies($timeframe),
            'rate_limit_violations' => $this->getRateLimitViolations($timeframe)
        ];
    }
    
    private function getSuspiciousActivities($timeframe) {
        $suspicious = [];
        
        // Multiple failed authentication attempts
        $failedAuthAttempts = DB::table('api_analytics')
            ->select([
                'ip_address',
                'user_agent',
                DB::raw('COUNT(*) as failed_attempts'),
                DB::raw('MIN(timestamp) as first_attempt'),
                DB::raw('MAX(timestamp) as last_attempt')
            ])
            ->where('timestamp', '>=', $this->getTimeframeStart($timeframe))
            ->where('endpoint', 'LIKE', '%auth%')
            ->where('response_status', '=', 401)
            ->groupBy(['ip_address', 'user_agent'])
            ->having('failed_attempts', '>', 10)
            ->get();
            
        if ($failedAuthAttempts->count() > 0) {
            $suspicious[] = [
                'type' => 'brute_force_authentication',
                'severity' => 'high',
                'count' => $failedAuthAttempts->count(),
                'data' => $failedAuthAttempts,
                'recommendation' => 'Consider blocking these IP addresses'
            ];
        }
        
        // Unusual endpoint access patterns
        $unusualPatterns = DB::table('api_analytics')
            ->select([
                'ip_address',
                'user_id',
                DB::raw('COUNT(DISTINCT endpoint) as unique_endpoints'),
                DB::raw('COUNT(*) as total_requests'),
                DB::raw('COUNT(CASE WHEN response_status >= 400 THEN 1 END) as error_requests')
            ])
            ->where('timestamp', '>=', $this->getTimeframeStart($timeframe))
            ->groupBy(['ip_address', 'user_id'])
            ->having('unique_endpoints', '>', 20) // Accessing many different endpoints
            ->having('error_requests', '>', 50) // Many error responses
            ->get();
            
        if ($unusualPatterns->count() > 0) {
            $suspicious[] = [
                'type' => 'api_enumeration',
                'severity' => 'medium',
                'count' => $unusualPatterns->count(),
                'data' => $unusualPatterns,
                'recommendation' => 'Monitor for potential API discovery attacks'
            ];
        }
        
        return $suspicious;
    }
    
    private function getGeographicAnomalies($timeframe) {
        // Users accessing from unusual geographic locations
        $userLocations = DB::table('api_analytics')
            ->select([
                'user_id',
                'geographic_country',
                'geographic_city',
                DB::raw('COUNT(*) as request_count'),
                DB::raw('COUNT(DISTINCT ip_address) as unique_ips')
            ])
            ->whereNotNull('user_id')
            ->where('timestamp', '>=', $this->getTimeframeStart($timeframe))
            ->groupBy(['user_id', 'geographic_country', 'geographic_city'])
            ->get();
            
        $anomalies = [];
        
        // Group by user and detect multiple countries
        $userCountries = $userLocations->groupBy('user_id');
        
        foreach ($userCountries as $userId => $locations) {
            $countries = $locations->pluck('geographic_country')->unique();
            
            if ($countries->count() > 2) { // User accessed from more than 2 countries
                $anomalies[] = [
                    'user_id' => $userId,
                    'countries' => $countries->toArray(),
                    'locations' => $locations->toArray(),
                    'risk_level' => $countries->count() > 3 ? 'high' : 'medium'
                ];
            }
        }
        
        return $anomalies;
    }
}
```

## Technical Specifications

### Performance Requirements
- **Data Collection**: < 5ms overhead per request
- **Real-Time Updates**: Updates within 30 seconds
- **Query Performance**: Analytics queries < 2 seconds
- **Dashboard Load**: < 3 seconds initial load
- **Data Retention**: 90 days detailed, 2 years aggregated

### Scalability Requirements
- **Data Volume**: Handle 1M+ requests per day
- **Concurrent Users**: Support 100+ dashboard users
- **Storage Efficiency**: Optimized data partitioning and archival
- **Query Optimization**: Indexed and aggregated data
- **Real-Time Processing**: Stream processing for live metrics

### Integration Requirements
- **Alerting Systems**: Email, SMS, Slack integration
- **External Analytics**: Google Analytics, Mixpanel export
- **Business Intelligence**: Data export for BI tools
- **API Integration**: RESTful API for external access
- **Webhook Support**: Real-time event notifications

## Implementation Steps

### Phase 1: Data Collection Infrastructure (1.5 days)
1. **Analytics Collection**
   - Implement analytics middleware
   - Set up database schema with partitioning
   - Create data aggregation jobs
   - Implement error tracking

2. **Real-Time Processing**
   - Set up Redis for real-time metrics
   - Implement WebSocket connections
   - Create metric calculation services
   - Set up data streaming pipeline

### Phase 2: Dashboard and Visualization (1.5 days)
1. **Monitoring Dashboard**
   - Create real-time dashboard interface
   - Implement interactive charts and graphs
   - Add geographic visualization
   - Create alert management interface

2. **Analytics Reports**
   - Build performance analytics reports
   - Create user behavior analysis
   - Implement custom report builder
   - Add export and sharing capabilities

### Phase 3: Advanced Analytics (1.5 days)
1. **Performance Analytics**
   - Implement bottleneck detection
   - Create optimization recommendations
   - Build trend analysis
   - Add predictive analytics

2. **Security Analytics**
   - Implement threat detection algorithms
   - Create suspicious activity monitoring
   - Add geographic anomaly detection
   - Build security incident tracking

### Phase 4: Integration and Optimization (0.5 days)
1. **External Integrations**
   - Set up alerting integrations
   - Create webhook notifications
   - Implement data export APIs
   - Add third-party analytics integration

## Success Criteria

### Functional Success Criteria
- [ ] Comprehensive analytics data collection for all API requests
- [ ] Real-time monitoring dashboard with live updates
- [ ] Performance analytics with bottleneck identification
- [ ] User behavior analysis and segmentation
- [ ] Security threat detection and alerting
- [ ] Custom reporting and data export capabilities

### Performance Success Criteria
- [ ] Analytics collection adds < 5ms overhead per request
- [ ] Dashboard loads within 3 seconds
- [ ] Real-time updates within 30 seconds
- [ ] Analytics queries complete within 2 seconds
- [ ] System handles 1M+ requests per day efficiently

### Business Impact Success Criteria
- [ ] Actionable insights for API optimization
- [ ] Proactive security threat detection
- [ ] Data-driven decision making capabilities
- [ ] Improved user experience through analytics insights
- [ ] Reduced security incidents through monitoring

This comprehensive analytics and monitoring system provides deep insights into API usage, performance, and security while enabling proactive management and optimization of the resort's API infrastructure.
