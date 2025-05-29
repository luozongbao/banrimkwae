# Issue #04: Rate Limiting and Quota Management

## Issue Overview
Implement comprehensive rate limiting and quota management system to prevent API abuse, ensure fair usage, and maintain system performance across different user types and authentication methods.

## Priority: HIGH
**Estimated Time**: 3-4 days  
**Dependencies**: Issue #01 (API Gateway), Issue #02 (Authentication)  
**Assigned Module**: Rate Limiting & Traffic Management  

## Detailed Requirements

### 1. Multi-Tier Rate Limiting System
**Objective**: Implement flexible rate limiting with different tiers based on authentication and user types

**Rate Limiting Tiers**:
```php
class RateLimitTiers {
    const TIERS = [
        'anonymous' => [
            'requests_per_minute' => 20,
            'requests_per_hour' => 100,
            'requests_per_day' => 1000,
            'burst_limit' => 5,
            'quota_reset' => 'daily'
        ],
        'basic_api_key' => [
            'requests_per_minute' => 100,
            'requests_per_hour' => 2000,
            'requests_per_day' => 10000,
            'burst_limit' => 20,
            'quota_reset' => 'daily'
        ],
        'premium_api_key' => [
            'requests_per_minute' => 500,
            'requests_per_hour' => 10000,
            'requests_per_day' => 100000,
            'burst_limit' => 100,
            'quota_reset' => 'daily'
        ],
        'authenticated_user' => [
            'requests_per_minute' => 200,
            'requests_per_hour' => 5000,
            'requests_per_day' => 25000,
            'burst_limit' => 50,
            'quota_reset' => 'daily'
        ],
        'internal_service' => [
            'requests_per_minute' => 2000,
            'requests_per_hour' => 50000,
            'requests_per_day' => 1000000,
            'burst_limit' => 500,
            'quota_reset' => 'monthly'
        ]
    ];
}
```

**Database Schema for Rate Limiting**:
```sql
-- Rate Limiting Configuration
CREATE TABLE rate_limit_tiers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    requests_per_minute INT NOT NULL DEFAULT 60,
    requests_per_hour INT NOT NULL DEFAULT 1000,
    requests_per_day INT NOT NULL DEFAULT 10000,
    requests_per_month INT NULL,
    burst_limit INT NOT NULL DEFAULT 10,
    quota_reset_period ENUM('hourly', 'daily', 'monthly') DEFAULT 'daily',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Rate Limit Assignments
CREATE TABLE user_rate_limits (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    api_key_id BIGINT NULL,
    tier_id BIGINT,
    custom_requests_per_minute INT NULL,
    custom_requests_per_day INT NULL,
    override_reason TEXT,
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effective_until TIMESTAMP NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
    FOREIGN KEY (tier_id) REFERENCES rate_limit_tiers(id),
    INDEX idx_user_effective (user_id, effective_from, effective_until)
);

-- Rate Limit Tracking (Redis-backed)
CREATE TABLE rate_limit_violations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(255) NOT NULL,
    identifier_type ENUM('ip', 'user', 'api_key', 'session') NOT NULL,
    endpoint VARCHAR(500),
    violation_type ENUM('minute_limit', 'hour_limit', 'day_limit', 'burst_limit') NOT NULL,
    limit_value INT NOT NULL,
    current_count INT NOT NULL,
    window_start TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier_type (identifier, identifier_type),
    INDEX idx_endpoint_violations (endpoint, created_at),
    INDEX idx_violation_analysis (violation_type, created_at)
);

-- Quota Usage Tracking
CREATE TABLE quota_usage (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    api_key_id BIGINT NULL,
    quota_period_start DATE NOT NULL,
    quota_period_end DATE NOT NULL,
    requests_used INT DEFAULT 0,
    quota_limit INT NOT NULL,
    quota_remaining INT NOT NULL,
    last_request_at TIMESTAMP NULL,
    status ENUM('active', 'exhausted', 'suspended') DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_period (user_id, quota_period_start),
    INDEX idx_quota_tracking (user_id, quota_period_start, status)
);
```

### 2. Rate Limiting Algorithms Implementation
**Objective**: Implement multiple rate limiting algorithms for different scenarios

**Algorithm Implementations**:

#### A. Token Bucket Algorithm
```php
class TokenBucketRateLimiter {
    private $redis;
    
    public function __construct($redis) {
        $this->redis = $redis;
    }
    
    public function isAllowed($identifier, $capacity, $refillRate, $tokens = 1) {
        $key = "token_bucket:{$identifier}";
        $now = microtime(true);
        
        // Get current bucket state
        $bucket = $this->redis->hMGet($key, ['tokens', 'last_refill']);
        $currentTokens = $bucket['tokens'] ?? $capacity;
        $lastRefill = $bucket['last_refill'] ?? $now;
        
        // Calculate tokens to add based on time elapsed
        $tokensToAdd = ($now - $lastRefill) * $refillRate;
        $newTokens = min($capacity, $currentTokens + $tokensToAdd);
        
        // Check if request can be allowed
        if ($newTokens >= $tokens) {
            $newTokens -= $tokens;
            
            // Update bucket state
            $this->redis->hMSet($key, [
                'tokens' => $newTokens,
                'last_refill' => $now
            ]);
            $this->redis->expire($key, 3600); // 1 hour TTL
            
            return true;
        }
        
        // Update last_refill even if request is denied
        $this->redis->hMSet($key, [
            'tokens' => $newTokens,
            'last_refill' => $now
        ]);
        $this->redis->expire($key, 3600);
        
        return false;
    }
}
```

#### B. Sliding Window Algorithm
```php
class SlidingWindowRateLimiter {
    private $redis;
    
    public function __construct($redis) {
        $this->redis = $redis;
    }
    
    public function isAllowed($identifier, $limit, $windowSizeSeconds) {
        $key = "sliding_window:{$identifier}";
        $now = time();
        $windowStart = $now - $windowSizeSeconds;
        
        // Remove old entries
        $this->redis->zRemRangeByScore($key, 0, $windowStart);
        
        // Count current requests in window
        $currentCount = $this->redis->zCard($key);
        
        if ($currentCount < $limit) {
            // Add current request
            $this->redis->zAdd($key, $now, $now . ':' . uniqid());
            $this->redis->expire($key, $windowSizeSeconds + 1);
            return true;
        }
        
        return false;
    }
    
    public function getRemainingRequests($identifier, $limit, $windowSizeSeconds) {
        $key = "sliding_window:{$identifier}";
        $now = time();
        $windowStart = $now - $windowSizeSeconds;
        
        // Clean old entries and count current
        $this->redis->zRemRangeByScore($key, 0, $windowStart);
        $currentCount = $this->redis->zCard($key);
        
        return max(0, $limit - $currentCount);
    }
}
```

#### C. Fixed Window Algorithm
```php
class FixedWindowRateLimiter {
    private $redis;
    
    public function __construct($redis) {
        $this->redis = $redis;
    }
    
    public function isAllowed($identifier, $limit, $windowSizeSeconds) {
        $now = time();
        $windowStart = intval($now / $windowSizeSeconds) * $windowSizeSeconds;
        $key = "fixed_window:{$identifier}:{$windowStart}";
        
        $current = $this->redis->incr($key);
        
        if ($current === 1) {
            $this->redis->expire($key, $windowSizeSeconds);
        }
        
        return $current <= $limit;
    }
}
```

### 3. Rate Limiting Middleware
**Objective**: Implement comprehensive rate limiting middleware

**Main Rate Limiting Middleware**:
```php
class RateLimitMiddleware {
    private $tokenBucket;
    private $slidingWindow;
    private $fixedWindow;
    private $quotaManager;
    
    public function __construct(
        TokenBucketRateLimiter $tokenBucket,
        SlidingWindowRateLimiter $slidingWindow,
        FixedWindowRateLimiter $fixedWindow,
        QuotaManager $quotaManager
    ) {
        $this->tokenBucket = $tokenBucket;
        $this->slidingWindow = $slidingWindow;
        $this->fixedWindow = $fixedWindow;
        $this->quotaManager = $quotaManager;
    }
    
    public function handle($request, $next) {
        $identifier = $this->getIdentifier($request);
        $limits = $this->getRateLimits($request);
        
        // Check different time window limits
        $checks = [
            'minute' => $this->checkMinuteLimit($identifier, $limits, $request),
            'hour' => $this->checkHourLimit($identifier, $limits, $request),
            'day' => $this->checkDayLimit($identifier, $limits, $request),
            'burst' => $this->checkBurstLimit($identifier, $limits, $request)
        ];
        
        // If any check fails, return rate limit exceeded response
        foreach ($checks as $type => $result) {
            if (!$result['allowed']) {
                return $this->rateLimitExceededResponse($type, $result, $request);
            }
        }
        
        // Check daily/monthly quota
        if (!$this->quotaManager->checkQuota($identifier, $request)) {
            return $this->quotaExceededResponse($request);
        }
        
        // Add rate limit headers to response
        $response = $next($request);
        return $this->addRateLimitHeaders($response, $checks, $identifier);
    }
    
    private function getIdentifier($request) {
        // Priority order: API Key > User ID > IP Address
        if ($apiKey = $request->getApiKey()) {
            return "api_key:{$apiKey->id}";
        } elseif ($user = $request->user()) {
            return "user:{$user->id}";
        } else {
            return "ip:{$request->ip()}";
        }
    }
    
    private function getRateLimits($request) {
        $user = $request->user();
        $apiKey = $request->getApiKey();
        
        if ($apiKey) {
            return $this->getApiKeyLimits($apiKey);
        } elseif ($user) {
            return $this->getUserLimits($user);
        } else {
            return RateLimitTiers::TIERS['anonymous'];
        }
    }
    
    private function checkMinuteLimit($identifier, $limits, $request) {
        $allowed = $this->slidingWindow->isAllowed(
            $identifier . ':minute',
            $limits['requests_per_minute'],
            60
        );
        
        $remaining = $this->slidingWindow->getRemainingRequests(
            $identifier . ':minute',
            $limits['requests_per_minute'],
            60
        );
        
        return [
            'allowed' => $allowed,
            'limit' => $limits['requests_per_minute'],
            'remaining' => $remaining,
            'reset_time' => time() + 60
        ];
    }
    
    private function rateLimitExceededResponse($type, $result, $request) {
        $this->logRateLimitViolation($request, $type, $result);
        
        return response()->json([
            'success' => false,
            'message' => 'Rate limit exceeded',
            'error_code' => 'RATE_LIMIT_EXCEEDED',
            'details' => [
                'limit_type' => $type,
                'limit' => $result['limit'],
                'remaining' => $result['remaining'],
                'reset_time' => $result['reset_time'],
                'retry_after' => $result['reset_time'] - time()
            ]
        ], 429, [
            'X-RateLimit-Limit' => $result['limit'],
            'X-RateLimit-Remaining' => $result['remaining'],
            'X-RateLimit-Reset' => $result['reset_time'],
            'Retry-After' => $result['reset_time'] - time()
        ]);
    }
}
```

### 4. Quota Management System
**Objective**: Implement comprehensive quota tracking and management

**Quota Manager Implementation**:
```php
class QuotaManager {
    private $redis;
    private $database;
    
    public function __construct($redis, $database) {
        $this->redis = $redis;
        $this->database = $database;
    }
    
    public function checkQuota($identifier, $request) {
        $quotaInfo = $this->getQuotaInfo($identifier);
        
        if (!$quotaInfo) {
            return true; // No quota restrictions
        }
        
        // Check if quota is exhausted
        if ($quotaInfo['requests_used'] >= $quotaInfo['quota_limit']) {
            return false;
        }
        
        // Increment usage
        $this->incrementQuotaUsage($identifier, $quotaInfo);
        
        return true;
    }
    
    public function getQuotaInfo($identifier) {
        // Try Redis cache first
        $cacheKey = "quota:{$identifier}";
        $cached = $this->redis->hGetAll($cacheKey);
        
        if ($cached) {
            return $cached;
        }
        
        // Get from database
        $quota = $this->database->table('quota_usage')
            ->where('identifier', $identifier)
            ->where('quota_period_start', '<=', now())
            ->where('quota_period_end', '>=', now())
            ->first();
        
        if ($quota) {
            // Cache for fast access
            $this->redis->hMSet($cacheKey, [
                'quota_limit' => $quota->quota_limit,
                'requests_used' => $quota->requests_used,
                'quota_remaining' => $quota->quota_remaining,
                'period_end' => $quota->quota_period_end
            ]);
            $this->redis->expire($cacheKey, 3600);
        }
        
        return $quota ? $quota->toArray() : null;
    }
    
    public function incrementQuotaUsage($identifier, $quotaInfo) {
        // Atomic increment in Redis
        $cacheKey = "quota:{$identifier}";
        $this->redis->hIncrBy($cacheKey, 'requests_used', 1);
        $this->redis->hIncrBy($cacheKey, 'quota_remaining', -1);
        
        // Async database update (use queue for high volume)
        dispatch(new UpdateQuotaUsageJob($identifier));
    }
    
    public function resetQuota($identifier, $period) {
        $quotaInfo = $this->getQuotaInfo($identifier);
        
        if (!$quotaInfo) {
            return false;
        }
        
        // Reset quota in database
        $this->database->table('quota_usage')
            ->where('identifier', $identifier)
            ->update([
                'requests_used' => 0,
                'quota_remaining' => $quotaInfo['quota_limit'],
                'quota_period_start' => now()->startOf($period),
                'quota_period_end' => now()->endOf($period),
                'status' => 'active'
            ]);
        
        // Clear Redis cache
        $this->redis->del("quota:{$identifier}");
        
        return true;
    }
}
```

### 5. Rate Limit Configuration Interface
**Objective**: Admin interface for managing rate limits and quotas

**Admin Configuration Controller**:
```php
class RateLimitConfigController {
    public function index() {
        $tiers = RateLimitTier::with(['users', 'apiKeys'])->get();
        $violations = $this->getRecentViolations();
        $usage = $this->getUsageStatistics();
        
        return view('admin.rate-limits.index', compact('tiers', 'violations', 'usage'));
    }
    
    public function createTier(Request $request) {
        $validated = $request->validate([
            'name' => 'required|unique:rate_limit_tiers',
            'display_name' => 'required',
            'requests_per_minute' => 'required|integer|min:1',
            'requests_per_hour' => 'required|integer|min:1',
            'requests_per_day' => 'required|integer|min:1',
            'burst_limit' => 'required|integer|min:1',
            'quota_reset_period' => 'required|in:hourly,daily,monthly'
        ]);
        
        $tier = RateLimitTier::create($validated);
        
        return redirect()->route('admin.rate-limits.index')
            ->with('success', 'Rate limit tier created successfully');
    }
    
    public function updateUserRateLimit(Request $request, $userId) {
        $validated = $request->validate([
            'tier_id' => 'required|exists:rate_limit_tiers,id',
            'custom_requests_per_minute' => 'nullable|integer|min:1',
            'custom_requests_per_day' => 'nullable|integer|min:1',
            'effective_until' => 'nullable|date|after:now',
            'override_reason' => 'nullable|string'
        ]);
        
        UserRateLimit::updateOrCreate(
            ['user_id' => $userId],
            $validated + ['created_by' => auth()->id()]
        );
        
        // Clear cache for this user
        $this->clearUserRateLimitCache($userId);
        
        return redirect()->back()
            ->with('success', 'User rate limit updated successfully');
    }
    
    public function getViolationAnalytics() {
        $analytics = [
            'violations_by_type' => $this->getViolationsByType(),
            'violations_by_endpoint' => $this->getViolationsByEndpoint(),
            'violations_over_time' => $this->getViolationsOverTime(),
            'top_violators' => $this->getTopViolators()
        ];
        
        return response()->json($analytics);
    }
}
```

### 6. Rate Limit Monitoring and Alerting
**Objective**: Monitor rate limit usage and send alerts for abuse

**Monitoring System**:
```php
class RateLimitMonitor {
    private $alertManager;
    
    public function __construct(AlertManager $alertManager) {
        $this->alertManager = $alertManager;
    }
    
    public function monitorViolations() {
        // Check for abuse patterns
        $this->checkRepeatedViolations();
        $this->checkSuddenSpikes();
        $this->checkSuspiciousPatterns();
        
        // Check quota exhaustion
        $this->checkQuotaExhaustion();
        
        // System health checks
        $this->checkSystemPerformance();
    }
    
    private function checkRepeatedViolations() {
        $repeatedViolators = DB::table('rate_limit_violations')
            ->select('identifier', DB::raw('COUNT(*) as violation_count'))
            ->where('created_at', '>=', now()->subHour())
            ->groupBy('identifier')
            ->having('violation_count', '>', 10)
            ->get();
        
        foreach ($repeatedViolators as $violator) {
            $this->alertManager->sendAlert([
                'type' => 'repeated_rate_limit_violations',
                'identifier' => $violator->identifier,
                'violation_count' => $violator->violation_count,
                'time_window' => '1 hour',
                'severity' => 'medium',
                'recommended_action' => 'Consider temporary IP ban or API key suspension'
            ]);
        }
    }
    
    private function checkSuddenSpikes() {
        // Check for unusual traffic spikes
        $currentHourRequests = $this->getRequestCount(now()->subHour(), now());
        $averageHourRequests = $this->getAverageRequestCount(24); // 24 hour average
        
        if ($currentHourRequests > ($averageHourRequests * 3)) {
            $this->alertManager->sendAlert([
                'type' => 'traffic_spike',
                'current_requests' => $currentHourRequests,
                'average_requests' => $averageHourRequests,
                'spike_ratio' => $currentHourRequests / $averageHourRequests,
                'severity' => 'high',
                'recommended_action' => 'Investigate for potential DDoS attack'
            ]);
        }
    }
}
```

## Technical Specifications

### Performance Requirements
- **Rate Limit Check**: < 5ms per request
- **Quota Check**: < 10ms per request  
- **Redis Operations**: < 2ms response time
- **Database Updates**: Async processing for high volume
- **Memory Usage**: Efficient Redis memory utilization

### Scalability Requirements
- **Horizontal Scaling**: Stateless rate limiting design
- **Redis Clustering**: Support for Redis cluster deployment
- **High Availability**: Multi-node Redis setup with failover
- **Load Distribution**: Consistent hashing for distributed rate limiting
- **Performance Under Load**: 10,000+ requests per second

### Security Requirements
- **IP-based Limiting**: Protection against IP-based attacks
- **Distributed Attack Prevention**: Cross-server rate limit coordination
- **Gradual Penalties**: Increasing penalties for repeated violations
- **Whitelist Management**: Emergency bypass capabilities
- **Audit Logging**: Complete rate limit violation tracking

## Implementation Steps

### Phase 1: Core Rate Limiting (1.5 days)
1. **Algorithm Implementation**
   - Implement token bucket, sliding window, and fixed window algorithms
   - Set up Redis integration for rate limit storage
   - Create rate limiting middleware
   - Implement basic violation logging

2. **Database Setup**
   - Create rate limiting database tables
   - Set up indexes for performance
   - Implement data retention policies
   - Create configuration management

### Phase 2: Quota Management (1 day)
1. **Quota System**
   - Implement quota tracking and management
   - Create quota reset mechanisms
   - Set up async quota updates
   - Implement quota alerts and notifications

### Phase 3: Configuration Interface (1 day)
1. **Admin Interface**
   - Create rate limit tier management
   - Implement user-specific rate limit overrides
   - Build violation monitoring dashboard
   - Create analytics and reporting tools

### Phase 4: Monitoring and Alerting (0.5 days)
1. **Monitoring System**
   - Implement abuse pattern detection
   - Set up automated alerting
   - Create performance monitoring
   - Build violation analysis tools

## Success Criteria

### Functional Success Criteria
- [ ] Multiple rate limiting algorithms work correctly
- [ ] User-specific and API key-specific limits enforced
- [ ] Quota management tracks usage accurately
- [ ] Admin interface allows easy configuration
- [ ] Monitoring detects and alerts on abuse patterns
- [ ] Performance remains stable under high load

### Performance Success Criteria
- [ ] Rate limit checks complete within 5ms
- [ ] System handles 10,000+ requests per second
- [ ] Redis operations maintain sub-2ms latency
- [ ] Memory usage remains optimized
- [ ] No performance degradation under load

### Security Success Criteria
- [ ] Effectively prevents API abuse and DDoS attacks
- [ ] Graduated response to repeated violations
- [ ] Comprehensive audit trail of all violations
- [ ] Emergency bypass capabilities work correctly
- [ ] Distributed attack coordination functions properly

This comprehensive rate limiting and quota management system provides robust protection against API abuse while ensuring fair usage and optimal performance for legitimate users.
