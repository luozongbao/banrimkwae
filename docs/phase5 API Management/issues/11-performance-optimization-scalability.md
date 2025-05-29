# Issue #11: Performance Optimization and Scalability

## Overview
Implement comprehensive performance optimization and scalability features for the Banrimkwae Resort Management System API to ensure high throughput, low latency, and efficient resource utilization under varying load conditions.

## Requirements

### Functional Requirements
1. **Response Caching System**
   - Multi-level caching strategy
   - Cache invalidation mechanisms
   - Cache warming and preloading
   - Distributed cache management

2. **Database Optimization**
   - Query optimization and indexing
   - Connection pooling management
   - Read replica load balancing
   - Database sharding strategy

3. **API Response Optimization**
   - Response compression (gzip, brotli)
   - Pagination optimization
   - Field filtering and selection
   - Lazy loading implementation

4. **Load Balancing and Scaling**
   - Horizontal scaling capabilities
   - Auto-scaling triggers
   - Load distribution algorithms
   - Health check mechanisms

### Technical Requirements
1. **Performance Monitoring**
   - Real-time performance metrics
   - Response time tracking
   - Throughput monitoring
   - Resource utilization analysis

2. **Caching Infrastructure**
   - Redis cluster configuration
   - Cache hit rate optimization
   - Memory usage optimization
   - Cache strategy per endpoint

3. **Database Performance**
   - Query execution time monitoring
   - Slow query detection and optimization
   - Index usage analysis
   - Connection pool optimization

## Database Schema

```sql
-- Performance metrics tracking
CREATE TABLE api_performance_metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    endpoint_path VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    response_time_ms INT NOT NULL,
    request_size_bytes INT,
    response_size_bytes INT,
    cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
    database_queries_count INT NOT NULL DEFAULT 0,
    database_time_ms INT NOT NULL DEFAULT 0,
    memory_usage_mb DECIMAL(10,2),
    cpu_usage_percent DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    
    INDEX idx_endpoint_method (endpoint_path, http_method),
    INDEX idx_timestamp (timestamp),
    INDEX idx_response_time (response_time_ms),
    INDEX idx_cache_hit (cache_hit),
    PARTITION BY RANGE (UNIX_TIMESTAMP(timestamp)) (
        PARTITION p_current VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
        PARTITION p_future VALUES LESS THAN MAXVALUE
    )
);

-- Cache configuration per endpoint
CREATE TABLE api_cache_config (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    endpoint_pattern VARCHAR(255) NOT NULL,
    http_methods JSON NOT NULL,
    cache_ttl_seconds INT NOT NULL DEFAULT 300,
    cache_strategy ENUM('simple', 'tagged', 'hierarchical') NOT NULL DEFAULT 'simple',
    cache_key_pattern VARCHAR(500),
    invalidation_triggers JSON,
    cache_warming_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    compression_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_endpoint_pattern (endpoint_pattern),
    INDEX idx_cache_strategy (cache_strategy),
    INDEX idx_active (is_active)
);

-- Query performance tracking
CREATE TABLE database_query_performance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    query_hash VARCHAR(64) NOT NULL,
    query_type ENUM('SELECT', 'INSERT', 'UPDATE', 'DELETE') NOT NULL,
    table_names JSON NOT NULL,
    execution_time_ms DECIMAL(10,3) NOT NULL,
    rows_examined INT,
    rows_sent INT,
    query_text TEXT,
    execution_plan JSON,
    index_usage JSON,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endpoint_path VARCHAR(255),
    request_id VARCHAR(100),
    
    INDEX idx_query_hash (query_hash),
    INDEX idx_execution_time (execution_time_ms),
    INDEX idx_executed_at (executed_at),
    INDEX idx_endpoint (endpoint_path),
    PARTITION BY RANGE (UNIX_TIMESTAMP(executed_at)) (
        PARTITION p_current VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
        PARTITION p_future VALUES LESS THAN MAXVALUE
    )
);

-- Auto-scaling configuration
CREATE TABLE auto_scaling_config (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    min_instances INT NOT NULL DEFAULT 2,
    max_instances INT NOT NULL DEFAULT 20,
    target_cpu_percent DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    target_memory_percent DECIMAL(5,2) NOT NULL DEFAULT 80.00,
    target_response_time_ms INT NOT NULL DEFAULT 200,
    scale_up_cooldown_seconds INT NOT NULL DEFAULT 300,
    scale_down_cooldown_seconds INT NOT NULL DEFAULT 600,
    scale_up_threshold_count INT NOT NULL DEFAULT 2,
    scale_down_threshold_count INT NOT NULL DEFAULT 3,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_service_name (service_name),
    INDEX idx_enabled (is_enabled)
);

-- Scaling events log
CREATE TABLE scaling_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    event_type ENUM('scale_up', 'scale_down', 'scale_triggered', 'scale_failed') NOT NULL,
    from_instances INT NOT NULL,
    to_instances INT NOT NULL,
    trigger_metric VARCHAR(50) NOT NULL,
    trigger_value DECIMAL(10,2) NOT NULL,
    threshold_value DECIMAL(10,2) NOT NULL,
    event_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_service_event (service_name, event_type),
    INDEX idx_created_at (created_at)
);

-- Performance optimization recommendations
CREATE TABLE performance_recommendations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recommendation_type ENUM('cache', 'index', 'query', 'scaling', 'configuration') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    target_resource VARCHAR(255) NOT NULL,
    current_metric_value DECIMAL(15,3),
    recommended_metric_value DECIMAL(15,3),
    description TEXT NOT NULL,
    implementation_steps JSON,
    expected_improvement TEXT,
    impact_analysis JSON,
    status ENUM('pending', 'implementing', 'completed', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    implemented_at TIMESTAMP NULL,
    
    INDEX idx_type_priority (recommendation_type, priority),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Cache statistics
CREATE TABLE cache_statistics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cache_key_pattern VARCHAR(255) NOT NULL,
    cache_layer ENUM('application', 'redis', 'cdn') NOT NULL,
    total_requests BIGINT NOT NULL DEFAULT 0,
    cache_hits BIGINT NOT NULL DEFAULT 0,
    cache_misses BIGINT NOT NULL DEFAULT 0,
    hit_ratio DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_requests > 0 THEN (cache_hits * 100.0 / total_requests)
            ELSE 0
        END
    ) STORED,
    avg_response_time_ms DECIMAL(10,3),
    total_bytes_served BIGINT NOT NULL DEFAULT 0,
    evictions_count BIGINT NOT NULL DEFAULT 0,
    date_recorded DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_cache_pattern_layer_date (cache_key_pattern, cache_layer, date_recorded),
    INDEX idx_hit_ratio (hit_ratio),
    INDEX idx_date (date_recorded)
);
```

## Backend Implementation

### Performance Optimization Service

```php
<?php

namespace App\Services\API;

use App\Models\APIPerformanceMetrics;
use App\Models\APICacheConfig;
use App\Models\DatabaseQueryPerformance;
use App\Models\PerformanceRecommendations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Carbon\Carbon;

class PerformanceOptimizationService
{
    private $cachePrefix = 'api_perf:';
    private $metricsCollectionEnabled = true;

    public function recordPerformanceMetrics(Request $request, $response, array $metrics): void
    {
        if (!$this->metricsCollectionEnabled) {
            return;
        }

        APIPerformanceMetrics::create([
            'endpoint_path' => $request->path(),
            'http_method' => $request->method(),
            'response_time_ms' => $metrics['response_time_ms'],
            'request_size_bytes' => strlen($request->getContent()),
            'response_size_bytes' => strlen($response->getContent()),
            'cache_hit' => $metrics['cache_hit'] ?? false,
            'database_queries_count' => $metrics['db_queries_count'] ?? 0,
            'database_time_ms' => $metrics['db_time_ms'] ?? 0,
            'memory_usage_mb' => $metrics['memory_usage_mb'] ?? null,
            'cpu_usage_percent' => $metrics['cpu_usage_percent'] ?? null,
            'client_id' => $request->attributes->get('client_id'),
            'user_id' => auth()->id(),
        ]);
    }

    public function getCacheConfig(string $endpoint, string $method): ?APICacheConfig
    {
        $cacheKey = $this->cachePrefix . "config:{$endpoint}:{$method}";
        
        return Cache::remember($cacheKey, 300, function () use ($endpoint, $method) {
            return APICacheConfig::where('is_active', true)
                ->where(function ($query) use ($endpoint) {
                    $query->where('endpoint_pattern', $endpoint)
                          ->orWhere('endpoint_pattern', 'LIKE', str_replace('*', '%', $endpoint));
                })
                ->whereJsonContains('http_methods', $method)
                ->orderBy('endpoint_pattern')
                ->first();
        });
    }

    public function shouldCacheResponse(Request $request): bool
    {
        $config = $this->getCacheConfig($request->path(), $request->method());
        
        if (!$config) {
            return false;
        }

        // Don't cache responses with user-specific data unless explicitly configured
        if (auth()->check() && !$this->isUserSpecificCachingEnabled($config)) {
            return false;
        }

        // Don't cache POST, PUT, DELETE requests by default
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return false;
        }

        return true;
    }

    public function generateCacheKey(Request $request, APICacheConfig $config): string
    {
        $pattern = $config->cache_key_pattern ?: 'default';
        
        $replacements = [
            '{endpoint}' => $request->path(),
            '{method}' => $request->method(),
            '{query}' => http_build_query($request->query()),
            '{user_id}' => auth()->id() ?? 'anonymous',
            '{client_id}' => $request->attributes->get('client_id', 'unknown'),
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $pattern);
    }

    public function optimizeQueryPerformance(): array
    {
        $recommendations = [];

        // Analyze slow queries
        $slowQueries = $this->getSlowQueries();
        foreach ($slowQueries as $query) {
            $recommendations[] = $this->generateQueryOptimizationRecommendation($query);
        }

        // Analyze cache hit rates
        $lowHitRateEndpoints = $this->getLowCacheHitRateEndpoints();
        foreach ($lowHitRateEndpoints as $endpoint) {
            $recommendations[] = $this->generateCacheOptimizationRecommendation($endpoint);
        }

        // Analyze high response times
        $slowEndpoints = $this->getSlowEndpoints();
        foreach ($slowEndpoints as $endpoint) {
            $recommendations[] = $this->generateResponseTimeOptimizationRecommendation($endpoint);
        }

        return $recommendations;
    }

    private function getSlowQueries(int $thresholdMs = 1000): array
    {
        return DatabaseQueryPerformance::where('execution_time_ms', '>', $thresholdMs)
            ->where('executed_at', '>=', Carbon::now()->subDays(7))
            ->selectRaw('
                query_hash,
                AVG(execution_time_ms) as avg_execution_time,
                COUNT(*) as execution_count,
                MAX(execution_time_ms) as max_execution_time,
                query_text
            ')
            ->groupBy('query_hash', 'query_text')
            ->orderBy('avg_execution_time', 'desc')
            ->limit(10)
            ->get()
            ->toArray();
    }

    private function getLowCacheHitRateEndpoints(float $threshold = 0.5): array
    {
        return APIPerformanceMetrics::where('timestamp', '>=', Carbon::now()->subDays(7))
            ->selectRaw('
                endpoint_path,
                http_method,
                COUNT(*) as total_requests,
                SUM(CASE WHEN cache_hit = 1 THEN 1 ELSE 0 END) as cache_hits,
                AVG(response_time_ms) as avg_response_time
            ')
            ->groupBy('endpoint_path', 'http_method')
            ->havingRaw('(SUM(CASE WHEN cache_hit = 1 THEN 1 ELSE 0 END) / COUNT(*)) < ?', [$threshold])
            ->orderBy('total_requests', 'desc')
            ->get()
            ->toArray();
    }

    private function getSlowEndpoints(int $thresholdMs = 500): array
    {
        return APIPerformanceMetrics::where('timestamp', '>=', Carbon::now()->subDays(7))
            ->selectRaw('
                endpoint_path,
                http_method,
                AVG(response_time_ms) as avg_response_time,
                COUNT(*) as request_count,
                MAX(response_time_ms) as max_response_time,
                MIN(response_time_ms) as min_response_time
            ')
            ->groupBy('endpoint_path', 'http_method')
            ->having('avg_response_time', '>', $thresholdMs)
            ->orderBy('avg_response_time', 'desc')
            ->get()
            ->toArray();
    }

    private function generateQueryOptimizationRecommendation(array $query): array
    {
        return [
            'type' => 'query',
            'priority' => $query['avg_execution_time'] > 2000 ? 'high' : 'medium',
            'target_resource' => "Query: {$query['query_hash']}",
            'current_metric_value' => $query['avg_execution_time'],
            'recommended_metric_value' => min($query['avg_execution_time'] * 0.3, 100),
            'description' => "Slow query detected with average execution time of {$query['avg_execution_time']}ms",
            'implementation_steps' => [
                'Analyze query execution plan',
                'Add appropriate indexes',
                'Consider query rewriting',
                'Implement query result caching'
            ],
            'expected_improvement' => 'Reduce query execution time by 70%',
        ];
    }

    private function generateCacheOptimizationRecommendation(array $endpoint): array
    {
        $hitRate = $endpoint['cache_hits'] / $endpoint['total_requests'];
        
        return [
            'type' => 'cache',
            'priority' => $hitRate < 0.3 ? 'high' : 'medium',
            'target_resource' => "{$endpoint['http_method']} {$endpoint['endpoint_path']}",
            'current_metric_value' => $hitRate * 100,
            'recommended_metric_value' => 80,
            'description' => "Low cache hit rate of " . number_format($hitRate * 100, 1) . "% detected",
            'implementation_steps' => [
                'Review cache configuration',
                'Increase cache TTL',
                'Implement cache warming',
                'Add cache tags for better invalidation'
            ],
            'expected_improvement' => 'Increase cache hit rate to 80%+',
        ];
    }

    private function isUserSpecificCachingEnabled(APICacheConfig $config): bool
    {
        return $config->cache_strategy === 'hierarchical' || 
               strpos($config->cache_key_pattern, '{user_id}') !== false;
    }

    public function getPerformanceReport(string $period = '7d'): array
    {
        $startDate = Carbon::now()->sub($this->parsePeriod($period));
        
        return [
            'summary' => $this->getPerformanceSummary($startDate),
            'top_slow_endpoints' => $this->getTopSlowEndpoints($startDate, 10),
            'cache_performance' => $this->getCachePerformanceStats($startDate),
            'database_performance' => $this->getDatabasePerformanceStats($startDate),
            'recommendations' => $this->getActiveRecommendations(),
        ];
    }

    private function getPerformanceSummary(Carbon $startDate): array
    {
        $metrics = APIPerformanceMetrics::where('timestamp', '>=', $startDate)
            ->selectRaw('
                COUNT(*) as total_requests,
                AVG(response_time_ms) as avg_response_time,
                MAX(response_time_ms) as max_response_time,
                MIN(response_time_ms) as min_response_time,
                SUM(CASE WHEN cache_hit = 1 THEN 1 ELSE 0 END) as cache_hits,
                AVG(database_queries_count) as avg_db_queries,
                AVG(database_time_ms) as avg_db_time
            ')
            ->first();

        return [
            'total_requests' => $metrics->total_requests,
            'avg_response_time_ms' => round($metrics->avg_response_time, 2),
            'max_response_time_ms' => $metrics->max_response_time,
            'min_response_time_ms' => $metrics->min_response_time,
            'cache_hit_rate' => $metrics->total_requests > 0 ? 
                round(($metrics->cache_hits / $metrics->total_requests) * 100, 2) : 0,
            'avg_db_queries_per_request' => round($metrics->avg_db_queries, 2),
            'avg_db_time_ms' => round($metrics->avg_db_time, 2),
        ];
    }

    private function parsePeriod(string $period): string
    {
        $map = [
            '1h' => '1 hour',
            '24h' => '24 hours',
            '7d' => '7 days',
            '30d' => '30 days',
            '90d' => '90 days',
        ];

        return $map[$period] ?? '7 days';
    }
}
```

### Auto-Scaling Service

```php
<?php

namespace App\Services\API;

use App\Models\AutoScalingConfig;
use App\Models\ScalingEvents;
use App\Models\APIPerformanceMetrics;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AutoScalingService
{
    private $containerOrchestrator;
    private $metricsCollector;

    public function __construct()
    {
        $this->containerOrchestrator = app('container.orchestrator');
        $this->metricsCollector = app('metrics.collector');
    }

    public function evaluateScaling(): void
    {
        $configs = AutoScalingConfig::where('is_enabled', true)->get();
        
        foreach ($configs as $config) {
            $this->evaluateServiceScaling($config);
        }
    }

    private function evaluateServiceScaling(AutoScalingConfig $config): void
    {
        $currentInstances = $this->getCurrentInstanceCount($config->service_name);
        $metrics = $this->collectServiceMetrics($config->service_name);
        
        $scaleDecision = $this->makeScalingDecision($config, $metrics, $currentInstances);
        
        if ($scaleDecision['action'] !== 'none') {
            $this->executeScaling($config, $scaleDecision, $currentInstances);
        }
    }

    private function collectServiceMetrics(string $serviceName): array
    {
        $endTime = Carbon::now();
        $startTime = $endTime->copy()->subMinutes(5);
        
        // Collect performance metrics
        $performanceMetrics = APIPerformanceMetrics::whereBetween('timestamp', [$startTime, $endTime])
            ->selectRaw('
                AVG(response_time_ms) as avg_response_time,
                MAX(response_time_ms) as max_response_time,
                AVG(cpu_usage_percent) as avg_cpu_usage,
                AVG(memory_usage_mb) as avg_memory_usage,
                COUNT(*) as request_count
            ')
            ->first();

        // Collect system metrics from container orchestrator
        $systemMetrics = $this->metricsCollector->getSystemMetrics($serviceName);
        
        return [
            'response_time_ms' => $performanceMetrics->avg_response_time ?? 0,
            'max_response_time_ms' => $performanceMetrics->max_response_time ?? 0,
            'cpu_usage_percent' => $systemMetrics['cpu_usage'] ?? 0,
            'memory_usage_percent' => $systemMetrics['memory_usage'] ?? 0,
            'request_count' => $performanceMetrics->request_count ?? 0,
            'request_rate' => ($performanceMetrics->request_count ?? 0) / 300, // per second
        ];
    }

    private function makeScalingDecision(AutoScalingConfig $config, array $metrics, int $currentInstances): array
    {
        $decision = ['action' => 'none', 'target_instances' => $currentInstances, 'reason' => []];
        
        // Check scale-up conditions
        if ($currentInstances < $config->max_instances) {
            $scaleUpReasons = [];
            
            if ($metrics['cpu_usage_percent'] > $config->target_cpu_percent) {
                $scaleUpReasons[] = "CPU usage {$metrics['cpu_usage_percent']}% > {$config->target_cpu_percent}%";
            }
            
            if ($metrics['memory_usage_percent'] > $config->target_memory_percent) {
                $scaleUpReasons[] = "Memory usage {$metrics['memory_usage_percent']}% > {$config->target_memory_percent}%";
            }
            
            if ($metrics['response_time_ms'] > $config->target_response_time_ms) {
                $scaleUpReasons[] = "Response time {$metrics['response_time_ms']}ms > {$config->target_response_time_ms}ms";
            }
            
            if (count($scaleUpReasons) >= $config->scale_up_threshold_count) {
                if ($this->canScaleUp($config)) {
                    $decision = [
                        'action' => 'scale_up',
                        'target_instances' => min($currentInstances + 1, $config->max_instances),
                        'reason' => $scaleUpReasons,
                        'trigger_metric' => 'multiple_thresholds'
                    ];
                }
            }
        }
        
        // Check scale-down conditions (only if not scaling up)
        if ($decision['action'] === 'none' && $currentInstances > $config->min_instances) {
            $scaleDownReasons = [];
            
            if ($metrics['cpu_usage_percent'] < ($config->target_cpu_percent * 0.5)) {
                $scaleDownReasons[] = "CPU usage {$metrics['cpu_usage_percent']}% < " . ($config->target_cpu_percent * 0.5) . "%";
            }
            
            if ($metrics['memory_usage_percent'] < ($config->target_memory_percent * 0.5)) {
                $scaleDownReasons[] = "Memory usage {$metrics['memory_usage_percent']}% < " . ($config->target_memory_percent * 0.5) . "%";
            }
            
            if ($metrics['response_time_ms'] < ($config->target_response_time_ms * 0.5)) {
                $scaleDownReasons[] = "Response time {$metrics['response_time_ms']}ms < " . ($config->target_response_time_ms * 0.5) . "ms";
            }
            
            if (count($scaleDownReasons) >= $config->scale_down_threshold_count) {
                if ($this->canScaleDown($config)) {
                    $decision = [
                        'action' => 'scale_down',
                        'target_instances' => max($currentInstances - 1, $config->min_instances),
                        'reason' => $scaleDownReasons,
                        'trigger_metric' => 'multiple_thresholds'
                    ];
                }
            }
        }
        
        return $decision;
    }

    private function canScaleUp(AutoScalingConfig $config): bool
    {
        $lastScaleEvent = ScalingEvents::where('service_name', $config->service_name)
            ->where('event_type', 'scale_up')
            ->where('created_at', '>=', Carbon::now()->subSeconds($config->scale_up_cooldown_seconds))
            ->first();
            
        return !$lastScaleEvent;
    }

    private function canScaleDown(AutoScalingConfig $config): bool
    {
        $lastScaleEvent = ScalingEvents::where('service_name', $config->service_name)
            ->where('event_type', 'scale_down')
            ->where('created_at', '>=', Carbon::now()->subSeconds($config->scale_down_cooldown_seconds))
            ->first();
            
        return !$lastScaleEvent;
    }

    private function executeScaling(AutoScalingConfig $config, array $decision, int $currentInstances): void
    {
        try {
            // Log scaling attempt
            ScalingEvents::create([
                'service_name' => $config->service_name,
                'event_type' => 'scale_triggered',
                'from_instances' => $currentInstances,
                'to_instances' => $decision['target_instances'],
                'trigger_metric' => $decision['trigger_metric'],
                'trigger_value' => 0, // Would be specific metric value
                'threshold_value' => 0, // Would be specific threshold
                'event_details' => [
                    'reasons' => $decision['reason'],
                    'decision' => $decision
                ]
            ]);

            // Execute scaling via container orchestrator
            $success = $this->containerOrchestrator->scaleService(
                $config->service_name,
                $decision['target_instances']
            );

            if ($success) {
                ScalingEvents::create([
                    'service_name' => $config->service_name,
                    'event_type' => $decision['action'],
                    'from_instances' => $currentInstances,
                    'to_instances' => $decision['target_instances'],
                    'trigger_metric' => $decision['trigger_metric'],
                    'trigger_value' => 0,
                    'threshold_value' => 0,
                    'event_details' => ['success' => true]
                ]);

                Log::info("Successfully scaled {$config->service_name} from {$currentInstances} to {$decision['target_instances']} instances");
            } else {
                throw new \Exception('Container orchestrator scaling failed');
            }
        } catch (\Exception $e) {
            ScalingEvents::create([
                'service_name' => $config->service_name,
                'event_type' => 'scale_failed',
                'from_instances' => $currentInstances,
                'to_instances' => $decision['target_instances'],
                'trigger_metric' => $decision['trigger_metric'],
                'trigger_value' => 0,
                'threshold_value' => 0,
                'event_details' => [
                    'error' => $e->getMessage(),
                    'decision' => $decision
                ]
            ]);

            Log::error("Failed to scale {$config->service_name}: " . $e->getMessage());
        }
    }

    private function getCurrentInstanceCount(string $serviceName): int
    {
        return $this->containerOrchestrator->getInstanceCount($serviceName);
    }
}
```

## Frontend Implementation

### Performance Dashboard

```javascript
// Performance Dashboard Component
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  LineChart,
  BarChart,
  AreaChart,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Alert,
  Progress,
  Select,
} from '@/components/ui';

const PerformanceDashboard = () => {
  const [performanceData, setPerformanceData] = useState({});
  const [scalingEvents, setScalingEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
    const interval = autoRefresh ? setInterval(fetchPerformanceData, 30000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedPeriod, autoRefresh]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      const [perfResponse, scalingResponse, recsResponse] = await Promise.all([
        fetch(`/api/admin/performance/report?period=${selectedPeriod}`),
        fetch(`/api/admin/scaling/events?period=${selectedPeriod}`),
        fetch('/api/admin/performance/recommendations')
      ]);

      const perfData = await perfResponse.json();
      const scalingData = await scalingResponse.json();
      const recsData = await recsResponse.json();

      setPerformanceData(perfData);
      setScalingEvents(scalingData.events);
      setRecommendations(recsData.recommendations);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = (value, thresholds) => {
    if (value <= thresholds.good) return { status: 'good', color: 'bg-green-500' };
    if (value <= thresholds.warning) return { status: 'warning', color: 'bg-yellow-500' };
    return { status: 'critical', color: 'bg-red-500' };
  };

  const formatNumber = (num, decimals = 2) => {
    return typeof num === 'number' ? num.toFixed(decimals) : '0.00';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </Select>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto Refresh {autoRefresh ? 'On' : 'Off'}
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(performanceData.summary?.avg_response_time_ms)}ms
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                getHealthStatus(performanceData.summary?.avg_response_time_ms || 0, {
                  good: 200, warning: 500
                }).color
              }`}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(performanceData.summary?.cache_hit_rate)}%
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                getHealthStatus(100 - (performanceData.summary?.cache_hit_rate || 0), {
                  good: 20, warning: 40
                }).color
              }`}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performanceData.summary?.total_requests?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">DB Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(performanceData.summary?.avg_db_time_ms)}ms
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                getHealthStatus(performanceData.summary?.avg_db_time_ms || 0, {
                  good: 50, warning: 100
                }).color
              }`}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoint Performance</TabsTrigger>
          <TabsTrigger value="scaling">Auto Scaling</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Response Time Trend</h3>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={performanceData.response_time_trend || []}
                  xKey="timestamp"
                  yKey="avg_response_time"
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Request Volume</h3>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={performanceData.request_volume_trend || []}
                  xKey="timestamp"
                  yKey="request_count"
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Slowest Endpoints</h3>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Avg Response Time</TableHead>
                    <TableHead>Request Count</TableHead>
                    <TableHead>Max Response Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(performanceData.top_slow_endpoints || []).map((endpoint, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{endpoint.endpoint_path}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{endpoint.http_method}</Badge>
                      </TableCell>
                      <TableCell>{formatNumber(endpoint.avg_response_time)}ms</TableCell>
                      <TableCell>{endpoint.request_count}</TableCell>
                      <TableCell>{formatNumber(endpoint.max_response_time)}ms</TableCell>
                      <TableCell>
                        <Badge className={
                          endpoint.avg_response_time > 1000 ? 'bg-red-100 text-red-800' :
                          endpoint.avg_response_time > 500 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {endpoint.avg_response_time > 1000 ? 'Critical' :
                           endpoint.avg_response_time > 500 ? 'Warning' : 'Good'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scaling">
          <ScalingDashboard events={scalingEvents} />
        </TabsContent>

        <TabsContent value="cache">
          <CachePerformanceDashboard data={performanceData.cache_performance} />
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationsDashboard 
            recommendations={recommendations}
            onUpdate={fetchPerformanceData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Scaling Dashboard Component
const ScalingDashboard = ({ events }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Scaling Events</h3>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>From → To Instances</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{event.service_name}</TableCell>
                  <TableCell>
                    <Badge className={
                      event.event_type === 'scale_up' ? 'bg-green-100 text-green-800' :
                      event.event_type === 'scale_down' ? 'bg-blue-100 text-blue-800' :
                      event.event_type === 'scale_failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {event.event_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.from_instances} → {event.to_instances}</TableCell>
                  <TableCell>{event.trigger_metric}</TableCell>
                  <TableCell>{new Date(event.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={
                      event.event_type === 'scale_failed' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {event.event_type === 'scale_failed' ? 'Failed' : 'Success'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;
```

## Implementation Phases

### Phase 1: Performance Monitoring Infrastructure (2 days)
- **Day 1**: Database schema setup and metrics collection
- **Day 2**: Performance monitoring service implementation

### Phase 2: Caching Optimization (2 days)
- **Day 3**: Cache configuration system and optimization
- **Day 4**: Cache performance analysis and recommendations

### Phase 3: Auto-Scaling Implementation (1 day)
- **Day 5**: Auto-scaling service and configuration

### Phase 4: Dashboard and Optimization (1 day)
- **Day 6**: Performance dashboard and optimization tools

## Quality Assurance

### Testing Requirements
1. **Performance Tests**
   - Load testing under various conditions
   - Cache performance validation
   - Database optimization verification
   - Auto-scaling trigger testing

2. **Monitoring Tests**
   - Metrics collection accuracy
   - Alert system functionality
   - Dashboard real-time updates
   - Recommendation system effectiveness

### Security Requirements
1. **Access Control**
   - Performance data access restrictions
   - Scaling configuration security
   - Audit logging for changes
   - Sensitive metrics protection

## Success Metrics

### Technical Metrics
- Response time improvement: 50% reduction
- Cache hit rate: >80%
- Database query optimization: 70% faster
- Auto-scaling efficiency: 95% accuracy

### Business Metrics
- Improved user experience
- Reduced infrastructure costs
- Better resource utilization
- Faster issue resolution

## Risk Mitigation

### Technical Risks
1. **Performance Degradation**
   - Mitigation: Comprehensive monitoring
   - Fallback: Automatic rollback procedures

2. **Scaling Issues**
   - Mitigation: Conservative scaling policies
   - Fallback: Manual scaling override

---

**Estimated Timeline**: 6 days
**Priority**: High
**Dependencies**: API Gateway, Monitoring System, Database Infrastructure
**Team**: Backend Developer, DevOps Engineer, Performance Engineer
