# Phase 5 Issue #07: API Testing and Quality Assurance

## Overview
Implement comprehensive API testing and quality assurance framework for the Banrimkwae Resort Management System, ensuring robust automated testing, performance validation, security verification, and continuous quality monitoring across all API endpoints and integrations.

## Priority: High
**Estimated Duration:** 4-5 days  
**Complexity:** High  
**Dependencies:** Issues #01 (API Gateway), #02 (Authentication), #03 (Documentation)

---

## Detailed Requirements

### 1. Automated Testing Framework
- **Unit Testing Suite**: Comprehensive unit tests for all API endpoints
- **Integration Testing**: End-to-end testing for external service integrations
- **Contract Testing**: API contract validation between services
- **Regression Testing**: Automated regression test suite for all releases
- **Smoke Testing**: Essential functionality validation for deployments
- **Mutation Testing**: Code quality validation through mutation testing

### 2. Performance Testing Infrastructure
- **Load Testing**: Sustained load testing for capacity planning
- **Stress Testing**: Breaking point identification and recovery validation
- **Spike Testing**: Sudden traffic surge handling verification
- **Volume Testing**: Large dataset processing performance validation
- **Endurance Testing**: Long-term stability and memory leak detection
- **Scalability Testing**: Horizontal and vertical scaling validation

### 3. Security Testing Suite
- **Vulnerability Scanning**: Automated security vulnerability detection
- **Penetration Testing**: Simulated attack scenario validation
- **Authentication Testing**: Security mechanism validation
- **Authorization Testing**: Role-based access control verification
- **Data Protection Testing**: Encryption and data handling validation
- **OWASP Compliance**: Security best practices compliance verification

### 4. API Monitoring and Quality Metrics
- **Real-time Monitoring**: Live API performance and health monitoring
- **Quality Metrics Dashboard**: Comprehensive quality metrics visualization
- **Alerting System**: Automated alerting for quality threshold breaches
- **Trend Analysis**: Historical quality trend analysis and reporting
- **SLA Monitoring**: Service level agreement compliance tracking
- **Error Tracking**: Comprehensive error logging and categorization

### 5. Test Data Management
- **Test Data Generation**: Automated test data creation and management
- **Data Anonymization**: Production data anonymization for testing
- **Environment Management**: Multiple testing environment provisioning
- **Data Cleanup**: Automated test data cleanup and reset procedures
- **Seed Data**: Consistent baseline data for testing scenarios
- **Mock Services**: External service mocking for isolated testing

### 6. Continuous Integration/Continuous Deployment (CI/CD)
- **Pipeline Integration**: Testing integrated into CI/CD pipelines
- **Automated Deployment**: Quality gate enforcement in deployment process
- **Rollback Mechanisms**: Automated rollback on quality failures
- **Feature Flags**: Gradual feature rollout with quality monitoring
- **Blue-Green Deployment**: Zero-downtime deployment with quality validation
- **Canary Releases**: Gradual release with real-time quality monitoring

---

## Technical Implementation

### Database Schema

```sql
-- Test Suites
CREATE TABLE test_suites (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    suite_type ENUM('unit', 'integration', 'performance', 'security', 'smoke') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    execution_order INT DEFAULT 0,
    timeout_minutes INT DEFAULT 30,
    retry_attempts INT DEFAULT 3,
    environment_requirements JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type_active (suite_type, is_active),
    INDEX idx_execution_order (execution_order)
);

-- Test Cases
CREATE TABLE test_cases (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    suite_id BIGINT UNSIGNED,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    test_type ENUM('functional', 'performance', 'security', 'accessibility') NOT NULL,
    priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    execution_order INT DEFAULT 0,
    timeout_seconds INT DEFAULT 300,
    expected_result TEXT,
    test_data JSON,
    assertions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (suite_id) REFERENCES test_suites(id) ON DELETE CASCADE,
    INDEX idx_suite_type (suite_id, test_type),
    INDEX idx_priority_active (priority, is_active)
);

-- Test Executions
CREATE TABLE test_executions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    execution_id VARCHAR(100) UNIQUE NOT NULL,
    suite_id BIGINT UNSIGNED,
    trigger_type ENUM('manual', 'scheduled', 'ci_cd', 'webhook') NOT NULL,
    triggered_by VARCHAR(100),
    environment VARCHAR(50) NOT NULL,
    branch_name VARCHAR(100),
    commit_hash VARCHAR(40),
    status ENUM('running', 'completed', 'failed', 'cancelled') DEFAULT 'running',
    total_tests INT DEFAULT 0,
    passed_tests INT DEFAULT 0,
    failed_tests INT DEFAULT 0,
    skipped_tests INT DEFAULT 0,
    execution_time_seconds INT,
    coverage_percentage DECIMAL(5,2),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (suite_id) REFERENCES test_suites(id),
    INDEX idx_execution_id (execution_id),
    INDEX idx_status_started (status, started_at),
    INDEX idx_environment_branch (environment, branch_name),
    PARTITION BY RANGE (UNIX_TIMESTAMP(started_at)) (
        PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
        PARTITION p202402 VALUES LESS THAN (UNIX_TIMESTAMP('2024-03-01')),
        PARTITION p202403 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
        PARTITION p_future VALUES LESS THAN MAXVALUE
    )
);

-- Test Results
CREATE TABLE test_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    execution_id BIGINT UNSIGNED,
    test_case_id BIGINT UNSIGNED,
    status ENUM('passed', 'failed', 'skipped', 'error') NOT NULL,
    execution_time_ms INT,
    error_message TEXT,
    stack_trace LONGTEXT,
    assertions_results JSON,
    performance_metrics JSON,
    screenshots_urls JSON,
    logs_content LONGTEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (execution_id) REFERENCES test_executions(id) ON DELETE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id),
    INDEX idx_execution_status (execution_id, status),
    INDEX idx_test_case_status (test_case_id, status),
    INDEX idx_started_at (started_at)
);

-- Performance Metrics
CREATE TABLE performance_metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    test_result_id BIGINT UNSIGNED,
    endpoint_path VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    response_time_ms INT NOT NULL,
    throughput_rps DECIMAL(10,2),
    cpu_usage_percent DECIMAL(5,2),
    memory_usage_mb DECIMAL(10,2),
    error_rate_percent DECIMAL(5,2),
    concurrent_users INT,
    data_transferred_kb DECIMAL(10,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    INDEX idx_endpoint_method (endpoint_path, http_method),
    INDEX idx_response_time (response_time_ms),
    INDEX idx_recorded_at (recorded_at)
);

-- Security Test Results
CREATE TABLE security_test_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    test_result_id BIGINT UNSIGNED,
    vulnerability_type VARCHAR(100) NOT NULL,
    severity ENUM('critical', 'high', 'medium', 'low', 'info') NOT NULL,
    affected_endpoint VARCHAR(255),
    description TEXT NOT NULL,
    remediation_steps TEXT,
    cvss_score DECIMAL(3,1),
    cwe_id VARCHAR(20),
    is_false_positive BOOLEAN DEFAULT FALSE,
    status ENUM('open', 'fixed', 'accepted', 'ignored') DEFAULT 'open',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    INDEX idx_severity_status (severity, status),
    INDEX idx_vulnerability_type (vulnerability_type),
    INDEX idx_detected_at (detected_at)
);

-- Quality Metrics
CREATE TABLE quality_metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    execution_id BIGINT UNSIGNED,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    threshold_value DECIMAL(15,4),
    is_within_threshold BOOLEAN,
    category ENUM('performance', 'security', 'functionality', 'accessibility') NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (execution_id) REFERENCES test_executions(id) ON DELETE CASCADE,
    INDEX idx_execution_category (execution_id, category),
    INDEX idx_metric_name (metric_name),
    INDEX idx_threshold_breach (is_within_threshold, recorded_at)
);
```

### Core Testing Framework

```php
<?php

namespace App\Services\Testing;

use App\Models\TestSuite;
use App\Models\TestCase;
use App\Models\TestExecution;
use App\Models\TestResult;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TestFramework
{
    private $environmentManager;
    private $dataManager;
    private $metricsCollector;
    
    public function __construct(
        EnvironmentManager $environmentManager,
        TestDataManager $dataManager,
        MetricsCollector $metricsCollector
    ) {
        $this->environmentManager = $environmentManager;
        $this->dataManager = $dataManager;
        $this->metricsCollector = $metricsCollector;
    }
    
    /**
     * Execute test suite with comprehensive monitoring
     */
    public function executeTestSuite(
        int $suiteId,
        string $environment = 'testing',
        array $options = []
    ): TestExecution {
        $suite = TestSuite::with('testCases')->findOrFail($suiteId);
        
        // Create test execution record
        $execution = TestExecution::create([
            'execution_id' => $this->generateExecutionId(),
            'suite_id' => $suiteId,
            'trigger_type' => $options['trigger_type'] ?? 'manual',
            'triggered_by' => $options['triggered_by'] ?? auth()->user()->email,
            'environment' => $environment,
            'branch_name' => $options['branch_name'] ?? 'main',
            'commit_hash' => $options['commit_hash'] ?? '',
            'total_tests' => $suite->testCases->count()
        ]);
        
        // Prepare test environment
        $this->environmentManager->prepareEnvironment($environment, $suite->environment_requirements);
        
        // Setup test data
        $this->dataManager->setupTestData($suite, $environment);
        
        try {
            // Execute test cases
            $results = $this->executeTestCases($execution, $suite->testCases, $options);
            
            // Calculate execution metrics
            $this->calculateExecutionMetrics($execution, $results);
            
            // Generate reports
            $this->generateTestReports($execution);
            
            // Cleanup
            $this->dataManager->cleanupTestData($suite, $environment);
            
            return $execution->fresh();
            
        } catch (\Exception $e) {
            $execution->update([
                'status' => 'failed',
                'completed_at' => now()
            ]);
            
            Log::error("Test suite execution failed: " . $e->getMessage(), [
                'execution_id' => $execution->execution_id,
                'suite_id' => $suiteId,
                'error' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }
    
    /**
     * Execute individual test cases
     */
    private function executeTestCases(TestExecution $execution, $testCases, array $options): array
    {
        $results = [];
        $parallelExecution = $options['parallel'] ?? false;
        
        if ($parallelExecution) {
            // Execute tests in parallel
            $chunks = $testCases->chunk(5); // 5 tests per chunk
            foreach ($chunks as $chunk) {
                $chunkResults = $this->executeTestChunk($execution, $chunk);
                $results = array_merge($results, $chunkResults);
            }
        } else {
            // Execute tests sequentially
            foreach ($testCases as $testCase) {
                $result = $this->executeTestCase($execution, $testCase);
                $results[] = $result;
                
                // Stop on critical failures if configured
                if ($options['stop_on_failure'] ?? false && $result->status === 'failed') {
                    break;
                }
            }
        }
        
        return $results;
    }
    
    /**
     * Execute single test case
     */
    private function executeTestCase(TestExecution $execution, TestCase $testCase): TestResult
    {
        $startTime = microtime(true);
        
        $result = TestResult::create([
            'execution_id' => $execution->id,
            'test_case_id' => $testCase->id,
            'status' => 'running'
        ]);
        
        try {
            // Prepare test data
            $testData = $this->dataManager->prepareTestCaseData($testCase);
            
            // Execute test based on type
            switch ($testCase->test_type) {
                case 'functional':
                    $outcome = $this->executeFunctionalTest($testCase, $testData);
                    break;
                case 'performance':
                    $outcome = $this->executePerformanceTest($testCase, $testData);
                    break;
                case 'security':
                    $outcome = $this->executeSecurityTest($testCase, $testData);
                    break;
                default:
                    throw new \InvalidArgumentException("Unknown test type: {$testCase->test_type}");
            }
            
            $executionTime = (microtime(true) - $startTime) * 1000; // Convert to milliseconds
            
            // Validate assertions
            $assertionResults = $this->validateAssertions($testCase->assertions, $outcome);
            $status = $assertionResults['passed'] ? 'passed' : 'failed';
            
            // Update test result
            $result->update([
                'status' => $status,
                'execution_time_ms' => $executionTime,
                'assertions_results' => $assertionResults,
                'performance_metrics' => $outcome['performance_metrics'] ?? [],
                'completed_at' => now()
            ]);
            
            // Record performance metrics if available
            if (isset($outcome['performance_metrics'])) {
                $this->recordPerformanceMetrics($result, $outcome['performance_metrics']);
            }
            
            // Record security findings if available
            if (isset($outcome['security_findings'])) {
                $this->recordSecurityFindings($result, $outcome['security_findings']);
            }
            
        } catch (\Exception $e) {
            $executionTime = (microtime(true) - $startTime) * 1000;
            
            $result->update([
                'status' => 'error',
                'execution_time_ms' => $executionTime,
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'completed_at' => now()
            ]);
            
            Log::error("Test case execution failed", [
                'test_case_id' => $testCase->id,
                'execution_id' => $execution->execution_id,
                'error' => $e->getMessage()
            ]);
        }
        
        return $result;
    }
    
    /**
     * Execute functional API test
     */
    private function executeFunctionalTest(TestCase $testCase, array $testData): array
    {
        $endpoint = $testData['endpoint'];
        $method = $testData['method'];
        $headers = $testData['headers'] ?? [];
        $body = $testData['body'] ?? [];
        
        $response = Http::withHeaders($headers)
            ->timeout($testCase->timeout_seconds)
            ->{strtolower($method)}($endpoint, $body);
        
        return [
            'response' => [
                'status_code' => $response->status(),
                'headers' => $response->headers(),
                'body' => $response->json(),
                'response_time' => $response->transferStats?->getTransferTime() * 1000 ?? 0
            ],
            'performance_metrics' => [
                'response_time_ms' => $response->transferStats?->getTransferTime() * 1000 ?? 0,
                'size_bytes' => strlen($response->body())
            ]
        ];
    }
    
    /**
     * Execute performance test
     */
    private function executePerformanceTest(TestCase $testCase, array $testData): array
    {
        $concurrentUsers = $testData['concurrent_users'] ?? 10;
        $duration = $testData['duration_seconds'] ?? 60;
        $endpoint = $testData['endpoint'];
        
        $performanceRunner = new PerformanceTestRunner();
        $metrics = $performanceRunner->runLoadTest([
            'endpoint' => $endpoint,
            'concurrent_users' => $concurrentUsers,
            'duration' => $duration,
            'method' => $testData['method'] ?? 'GET',
            'headers' => $testData['headers'] ?? [],
            'body' => $testData['body'] ?? []
        ]);
        
        return [
            'performance_metrics' => $metrics,
            'response' => [
                'status_code' => 200,
                'body' => ['test_type' => 'performance', 'completed' => true]
            ]
        ];
    }
    
    /**
     * Execute security test
     */
    private function executeSecurityTest(TestCase $testCase, array $testData): array
    {
        $securityScanner = new SecurityTestScanner();
        $findings = $securityScanner->scanEndpoint([
            'endpoint' => $testData['endpoint'],
            'method' => $testData['method'] ?? 'GET',
            'headers' => $testData['headers'] ?? [],
            'body' => $testData['body'] ?? [],
            'vulnerability_types' => $testData['vulnerability_types'] ?? ['xss', 'sqli', 'auth']
        ]);
        
        return [
            'security_findings' => $findings,
            'response' => [
                'status_code' => 200,
                'body' => ['test_type' => 'security', 'findings_count' => count($findings)]
            ]
        ];
    }
}

/**
 * Performance Test Runner
 */
class PerformanceTestRunner
{
    public function runLoadTest(array $config): array
    {
        $startTime = microtime(true);
        $requests = [];
        $errors = 0;
        $totalRequests = 0;
        
        // Simulate concurrent load testing
        $processes = [];
        for ($i = 0; $i < $config['concurrent_users']; $i++) {
            $processes[] = $this->startConcurrentUser($config);
        }
        
        // Wait for test duration
        sleep($config['duration']);
        
        // Collect results from all processes
        foreach ($processes as $process) {
            $result = $this->collectProcessResults($process);
            $requests = array_merge($requests, $result['requests']);
            $errors += $result['errors'];
            $totalRequests += $result['total_requests'];
        }
        
        $totalTime = microtime(true) - $startTime;
        
        return [
            'total_requests' => $totalRequests,
            'successful_requests' => $totalRequests - $errors,
            'failed_requests' => $errors,
            'requests_per_second' => $totalRequests / $totalTime,
            'average_response_time' => array_sum(array_column($requests, 'response_time')) / count($requests),
            'min_response_time' => min(array_column($requests, 'response_time')),
            'max_response_time' => max(array_column($requests, 'response_time')),
            'percentile_95' => $this->calculatePercentile($requests, 95),
            'percentile_99' => $this->calculatePercentile($requests, 99),
            'error_rate' => ($errors / $totalRequests) * 100
        ];
    }
    
    private function calculatePercentile(array $requests, int $percentile): float
    {
        $responseTimes = array_column($requests, 'response_time');
        sort($responseTimes);
        $index = ceil(($percentile / 100) * count($responseTimes)) - 1;
        return $responseTimes[$index] ?? 0;
    }
}

/**
 * Security Test Scanner
 */
class SecurityTestScanner
{
    public function scanEndpoint(array $config): array
    {
        $findings = [];
        
        foreach ($config['vulnerability_types'] as $type) {
            switch ($type) {
                case 'xss':
                    $findings = array_merge($findings, $this->scanXSS($config));
                    break;
                case 'sqli':
                    $findings = array_merge($findings, $this->scanSQLInjection($config));
                    break;
                case 'auth':
                    $findings = array_merge($findings, $this->scanAuthentication($config));
                    break;
            }
        }
        
        return $findings;
    }
    
    private function scanXSS(array $config): array
    {
        $xssPayloads = [
            '<script>alert("XSS")</script>',
            '"><script>alert("XSS")</script>',
            '<img src="x" onerror="alert(\'XSS\')">'
        ];
        
        $findings = [];
        foreach ($xssPayloads as $payload) {
            // Test XSS vulnerability with payload
            $testConfig = $config;
            $testConfig['body']['test_input'] = $payload;
            
            $response = Http::post($testConfig['endpoint'], $testConfig['body']);
            
            if (str_contains($response->body(), $payload)) {
                $findings[] = [
                    'type' => 'xss',
                    'severity' => 'high',
                    'description' => 'Potential XSS vulnerability detected',
                    'payload' => $payload,
                    'endpoint' => $testConfig['endpoint']
                ];
            }
        }
        
        return $findings;
    }
    
    private function scanSQLInjection(array $config): array
    {
        $sqlPayloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT 1,2,3 --"
        ];
        
        $findings = [];
        foreach ($sqlPayloads as $payload) {
            $testConfig = $config;
            $testConfig['body']['id'] = $payload;
            
            $response = Http::post($testConfig['endpoint'], $testConfig['body']);
            
            // Check for SQL error messages or unexpected responses
            if ($response->status() === 500 || 
                str_contains(strtolower($response->body()), 'sql') ||
                str_contains(strtolower($response->body()), 'mysql')) {
                $findings[] = [
                    'type' => 'sqli',
                    'severity' => 'critical',
                    'description' => 'Potential SQL injection vulnerability detected',
                    'payload' => $payload,
                    'endpoint' => $testConfig['endpoint']
                ];
            }
        }
        
        return $findings;
    }
}
```

### Test Dashboard Frontend

```javascript
// Test Management Dashboard
class TestDashboard {
    constructor() {
        this.currentExecution = null;
        this.metrics = new Map();
        this.initializeWebSocket();
        this.loadTestSuites();
    }
    
    async loadTestSuites() {
        try {
            const response = await fetch('/api/testing/suites');
            const suites = await response.json();
            
            this.renderTestSuites(suites);
            this.loadRecentExecutions();
        } catch (error) {
            console.error('Failed to load test suites:', error);
        }
    }
    
    renderTestSuites(suites) {
        const container = document.getElementById('test-suites-grid');
        container.innerHTML = '';
        
        suites.forEach(suite => {
            const card = document.createElement('div');
            card.className = `test-suite-card ${suite.is_active ? 'active' : 'inactive'}`;
            card.innerHTML = `
                <div class="suite-header">
                    <h3>${suite.name}</h3>
                    <span class="suite-type ${suite.suite_type}">${suite.suite_type.toUpperCase()}</span>
                </div>
                
                <div class="suite-description">
                    ${suite.description || 'No description available'}
                </div>
                
                <div class="suite-stats">
                    <div class="stat">
                        <span class="stat-label">Test Cases</span>
                        <span class="stat-value">${suite.test_cases_count}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Last Run</span>
                        <span class="stat-value">${this.formatDate(suite.last_execution_date)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Success Rate</span>
                        <span class="stat-value success-rate-${suite.id}">-</span>
                    </div>
                </div>
                
                <div class="suite-actions">
                    <button onclick="testDashboard.runTestSuite(${suite.id})" 
                            class="btn btn-run">Run Tests</button>
                    <button onclick="testDashboard.viewResults(${suite.id})" 
                            class="btn btn-results">View Results</button>
                    <button onclick="testDashboard.editSuite(${suite.id})" 
                            class="btn btn-edit">Edit</button>
                </div>
            `;
            
            container.appendChild(card);
        });
    }
    
    async runTestSuite(suiteId, options = {}) {
        const modal = document.getElementById('run-test-modal');
        const form = document.getElementById('run-test-form');
        
        // Show configuration modal
        modal.style.display = 'block';
        form.dataset.suiteId = suiteId;
        
        // Load environment options
        await this.loadEnvironmentOptions();
    }
    
    async executeTestSuite() {
        const form = document.getElementById('run-test-form');
        const formData = new FormData(form);
        const suiteId = form.dataset.suiteId;
        
        const config = {
            environment: formData.get('environment'),
            parallel: formData.get('parallel') === 'on',
            stop_on_failure: formData.get('stop_on_failure') === 'on',
            trigger_type: 'manual'
        };
        
        try {
            const response = await fetch(`/api/testing/suites/${suiteId}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(config)
            });
            
            const execution = await response.json();
            this.currentExecution = execution;
            
            // Close modal and show execution monitor
            document.getElementById('run-test-modal').style.display = 'none';
            this.showExecutionMonitor(execution);
            
        } catch (error) {
            this.showNotification('Failed to start test execution', 'error');
        }
    }
    
    showExecutionMonitor(execution) {
        const monitor = document.getElementById('execution-monitor');
        const content = document.getElementById('execution-content');
        
        content.innerHTML = `
            <div class="execution-header">
                <h3>Test Execution: ${execution.execution_id}</h3>
                <div class="execution-status ${execution.status}">${execution.status.toUpperCase()}</div>
            </div>
            
            <div class="execution-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="progress-text">
                    <span id="progress-current">0</span> / <span id="progress-total">${execution.total_tests}</span> tests completed
                </div>
            </div>
            
            <div class="execution-metrics">
                <div class="metric-card">
                    <div class="metric-value" id="passed-count">0</div>
                    <div class="metric-label">Passed</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" id="failed-count">0</div>
                    <div class="metric-label">Failed</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" id="skipped-count">0</div>
                    <div class="metric-label">Skipped</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" id="execution-time">0s</div>
                    <div class="metric-label">Duration</div>
                </div>
            </div>
            
            <div class="test-results-stream">
                <h4>Live Test Results</h4>
                <div id="results-stream" class="results-stream"></div>
            </div>
        `;
        
        monitor.style.display = 'block';
    }
    
    updateExecutionProgress(data) {
        if (!this.currentExecution || this.currentExecution.execution_id !== data.execution_id) {
            return;
        }
        
        const progressFill = document.querySelector('.progress-fill');
        const progressCurrent = document.getElementById('progress-current');
        const passedCount = document.getElementById('passed-count');
        const failedCount = document.getElementById('failed-count');
        const skippedCount = document.getElementById('skipped-count');
        const executionTime = document.getElementById('execution-time');
        
        const completed = data.passed_tests + data.failed_tests + data.skipped_tests;
        const progressPercent = (completed / data.total_tests) * 100;
        
        progressFill.style.width = `${progressPercent}%`;
        progressCurrent.textContent = completed;
        passedCount.textContent = data.passed_tests;
        failedCount.textContent = data.failed_tests;
        skippedCount.textContent = data.skipped_tests;
        
        if (data.execution_time_seconds) {
            executionTime.textContent = `${data.execution_time_seconds}s`;
        }
        
        // Update execution status
        const statusElement = document.querySelector('.execution-status');
        statusElement.className = `execution-status ${data.status}`;
        statusElement.textContent = data.status.toUpperCase();
    }
    
    addTestResult(result) {
        const stream = document.getElementById('results-stream');
        const resultElement = document.createElement('div');
        resultElement.className = `test-result ${result.status}`;
        resultElement.innerHTML = `
            <div class="result-header">
                <span class="test-name">${result.test_case_name}</span>
                <span class="result-status ${result.status}">${result.status.toUpperCase()}</span>
                <span class="result-time">${result.execution_time_ms}ms</span>
            </div>
            ${result.error_message ? `<div class="result-error">${result.error_message}</div>` : ''}
        `;
        
        stream.appendChild(resultElement);
        stream.scrollTop = stream.scrollHeight;
    }
    
    initializeWebSocket() {
        this.ws = new WebSocket(`wss://${window.location.host}/ws/testing`);
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                case 'execution_progress':
                    this.updateExecutionProgress(data);
                    break;
                case 'test_result':
                    this.addTestResult(data);
                    break;
                case 'execution_completed':
                    this.onExecutionCompleted(data);
                    break;
            }
        };
    }
    
    onExecutionCompleted(data) {
        this.showNotification(`Test execution completed: ${data.status}`, 
            data.status === 'completed' ? 'success' : 'error');
        
        // Generate and download test report
        if (data.status === 'completed') {
            this.generateTestReport(data.execution_id);
        }
    }
    
    async generateTestReport(executionId) {
        try {
            const response = await fetch(`/api/testing/executions/${executionId}/report`);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `test-report-${executionId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to generate test report:', error);
        }
    }
}

// Performance Metrics Visualization
class PerformanceChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.initializeChart();
    }
    
    initializeChart() {
        const ctx = this.container.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Response Time (ms)',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }, {
                    label: 'Throughput (RPS)',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y1',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }
    
    updateData(metrics) {
        const labels = metrics.map(m => new Date(m.recorded_at).toLocaleTimeString());
        const responseTimes = metrics.map(m => m.response_time_ms);
        const throughput = metrics.map(m => m.throughput_rps);
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = responseTimes;
        this.chart.data.datasets[1].data = throughput;
        
        this.chart.update();
    }
}

// Initialize dashboard
const testDashboard = new TestDashboard();
const performanceChart = new PerformanceChart('performance-chart');
```

---

## Implementation Steps

### Phase 1: Test Framework Foundation (Day 1)
1. **Database Schema Setup**
   - Create all testing-related tables
   - Set up proper indexes and partitioning
   - Configure automated data cleanup

2. **Core Testing Framework**
   - Implement TestFramework base class
   - Set up test execution engine
   - Create test result collection system

3. **Test Data Management**
   - Implement test data generation
   - Set up environment management
   - Create data cleanup procedures

### Phase 2: Automated Testing Suite (Day 2)
1. **Unit Testing Framework**
   - PHPUnit integration for PHP code
   - Jest setup for JavaScript code
   - Database testing utilities

2. **Integration Testing**
   - API endpoint testing framework
   - External service mocking
   - End-to-end test scenarios

3. **Test Case Management**
   - Test case creation and organization
   - Test suite configuration
   - Execution order management

### Phase 3: Performance Testing Infrastructure (Day 3)
1. **Load Testing Framework**
   - Concurrent user simulation
   - Throughput measurement
   - Response time analysis

2. **Performance Metrics Collection**
   - Real-time metrics gathering
   - Performance baseline establishment
   - Trend analysis implementation

3. **Scalability Testing**
   - Horizontal scaling tests
   - Resource utilization monitoring
   - Breaking point identification

### Phase 4: Security Testing Suite (Day 4)
1. **Vulnerability Scanning**
   - OWASP Top 10 testing
   - SQL injection detection
   - XSS vulnerability scanning

2. **Authentication Testing**
   - Access control validation
   - Token security verification
   - Session management testing

3. **Security Metrics**
   - Vulnerability severity classification
   - Security score calculation
   - Compliance verification

### Phase 5: Quality Monitoring and Reporting (Day 5)
1. **Real-time Monitoring Dashboard**
   - Live test execution monitoring
   - Quality metrics visualization
   - Alert system implementation

2. **Automated Reporting**
   - Test execution reports
   - Performance trend reports
   - Security assessment reports

3. **Quality Gates**
   - Deployment quality gates
   - Automated quality enforcement
   - Rollback trigger implementation

---

## Quality Assurance

### Testing Requirements
- **Framework Testing**: 95%+ code coverage for testing framework
- **Test Reliability**: < 1% flaky test rate
- **Performance Testing**: Accurate load simulation up to 1000 concurrent users
- **Security Testing**: 100% OWASP Top 10 coverage
- **Monitoring Accuracy**: Real-time metrics with < 5 second latency

### Performance Criteria
- **Test Execution Speed**: < 5 minutes for full regression suite
- **Parallel Execution**: Support for 50+ concurrent test cases
- **Data Processing**: Handle 10,000+ test results per hour
- **Report Generation**: < 30 seconds for comprehensive reports
- **Dashboard Responsiveness**: < 2 seconds for all dashboard operations

### Security Requirements
- **Test Data Security**: Encryption of sensitive test data
- **Access Control**: Role-based access to test results
- **Audit Logging**: Complete audit trail for all test activities
- **Vulnerability Detection**: 99%+ accuracy in security testing
- **Compliance**: GDPR/PDPA compliance for test data handling

---

## Success Criteria

### Functional Requirements
- ✅ Automated test execution for all API endpoints
- ✅ Performance testing covering all critical user journeys
- ✅ Security testing identifying vulnerabilities accurately
- ✅ Real-time test monitoring and reporting
- ✅ Quality gates preventing poor-quality deployments
- ✅ Comprehensive test data management

### Performance Metrics
- ✅ Test execution time reduced by 70%
- ✅ Test coverage increased to 95%+
- ✅ Bug detection rate improved by 80%
- ✅ False positive rate < 5%
- ✅ Mean time to bug detection < 1 hour

### Business Impact
- ✅ Deployment confidence increased significantly
- ✅ Production incidents reduced by 90%
- ✅ Development velocity maintained with quality
- ✅ Customer satisfaction improved through reliability
- ✅ Compliance requirements met consistently

---

## Risk Mitigation

### Technical Risks
- **Test Environment Instability**: Containerized environments and automated provisioning
- **Test Data Dependencies**: Automated data generation and isolation strategies
- **Performance Test Accuracy**: Production-like test environments and realistic load patterns
- **Security Test False Positives**: Continuous tuning and validation of security rules

### Operational Risks
- **Test Maintenance Overhead**: Automated test maintenance and self-healing capabilities
- **Resource Consumption**: Efficient resource allocation and cleanup procedures
- **Team Adoption**: Comprehensive training and gradual rollout strategy
- **Tool Integration**: Standardized APIs and flexible integration approaches

### Business Risks
- **Quality Gate Bottlenecks**: Parallel testing and smart quality gate logic
- **Testing Costs**: Cost optimization through efficient resource usage
- **Compliance Gaps**: Regular compliance audits and automated checks
- **Skills Gap**: Training programs and documentation for testing practices

This comprehensive API testing and quality assurance framework will ensure robust, secure, and high-performance APIs while maintaining development velocity and quality standards.
