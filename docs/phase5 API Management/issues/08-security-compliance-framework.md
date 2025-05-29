# Phase 5 Issue #08: Security and Compliance Framework

## Overview
Implement comprehensive security and compliance framework for the Banrimkwae Resort Management System API, ensuring GDPR/PDPA compliance, advanced security monitoring, threat detection, audit logging, and regulatory compliance across all API operations and data handling processes.

## Priority: Critical
**Estimated Duration:** 5-6 days  
**Complexity:** Very High  
**Dependencies:** Issues #01 (API Gateway), #02 (Authentication), #05 (Analytics), #07 (Testing)

---

## Detailed Requirements

### 1. Data Protection and Privacy Compliance
- **GDPR/PDPA Compliance**: Full compliance with European and Thai data protection regulations
- **Data Classification**: Automated data sensitivity classification and labeling
- **Consent Management**: Granular consent tracking and management system
- **Right to Erasure**: Automated data deletion and anonymization processes
- **Data Portability**: Standardized data export and transfer capabilities
- **Privacy by Design**: Built-in privacy controls and data minimization

### 2. Security Monitoring and Threat Detection
- **Real-time Threat Detection**: Advanced threat detection using AI/ML algorithms
- **Security Information and Event Management (SIEM)**: Centralized security monitoring
- **Intrusion Detection System (IDS)**: Network and application-level intrusion detection
- **Anomaly Detection**: Behavioral analysis and anomaly identification
- **Security Incident Response**: Automated incident response and escalation
- **Threat Intelligence Integration**: External threat intelligence feeds integration

### 3. Audit Logging and Compliance Reporting
- **Comprehensive Audit Trails**: Immutable audit logs for all system activities
- **Compliance Reporting**: Automated compliance report generation
- **Log Integrity**: Tamper-proof logging with cryptographic verification
- **Retention Policies**: Automated log retention and archival management
- **Forensic Analysis**: Advanced log analysis and forensic investigation tools
- **Regulatory Dashboards**: Real-time compliance status monitoring

### 4. Security Access Controls and Identity Management
- **Zero Trust Security Model**: Comprehensive zero-trust implementation
- **Multi-Factor Authentication (MFA)**: Advanced MFA with biometric support
- **Privileged Access Management (PAM)**: Elevated privilege control and monitoring
- **Identity Federation**: Single sign-on (SSO) and identity federation
- **Role-Based Access Control (RBAC)**: Granular permission management
- **Attribute-Based Access Control (ABAC)**: Context-aware access decisions

### 5. Data Encryption and Key Management
- **End-to-End Encryption**: Complete data encryption in transit and at rest
- **Key Management System (KMS)**: Enterprise-grade key lifecycle management
- **Hardware Security Modules (HSM)**: Hardware-based key protection
- **Certificate Management**: Automated SSL/TLS certificate lifecycle
- **Encryption Standards**: Implementation of latest encryption algorithms
- **Key Rotation**: Automated key rotation and versioning

### 6. Security Testing and Vulnerability Management
- **Automated Security Scanning**: Continuous vulnerability assessment
- **Penetration Testing**: Regular external penetration testing
- **Code Security Analysis**: Static and dynamic code security analysis
- **Dependency Scanning**: Third-party library vulnerability monitoring
- **Security Metrics**: Comprehensive security posture measurement
- **Vulnerability Remediation**: Automated vulnerability patching workflows

---

## Technical Implementation

### Database Schema

```sql
-- Security Events
CREATE TABLE security_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(100) UNIQUE NOT NULL,
    event_type ENUM('authentication', 'authorization', 'data_access', 'system', 'network', 'application') NOT NULL,
    severity ENUM('critical', 'high', 'medium', 'low', 'info') NOT NULL,
    source_ip VARCHAR(45),
    user_id BIGINT UNSIGNED NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    result ENUM('success', 'failure', 'blocked', 'suspicious') NOT NULL,
    risk_score INT DEFAULT 0,
    threat_indicators JSON,
    raw_data LONGTEXT,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type_severity (event_type, severity),
    INDEX idx_user_id_processed (user_id, processed_at),
    INDEX idx_source_ip_processed (source_ip, processed_at),
    INDEX idx_risk_score (risk_score),
    PARTITION BY RANGE (UNIX_TIMESTAMP(processed_at)) (
        PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
        PARTITION p202402 VALUES LESS THAN (UNIX_TIMESTAMP('2024-03-01')),
        PARTITION p202403 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
        PARTITION p_future VALUES LESS THAN MAXVALUE
    )
);

-- Audit Logs
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    audit_id VARCHAR(100) UNIQUE NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    session_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    old_values JSON,
    new_values JSON,
    metadata JSON,
    checksum VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id_timestamp (user_id, timestamp),
    INDEX idx_action_timestamp (action, timestamp),
    INDEX idx_resource_timestamp (resource_type, resource_id, timestamp),
    INDEX idx_session_id (session_id),
    PARTITION BY RANGE (UNIX_TIMESTAMP(timestamp)) (
        PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
        PARTITION p202402 VALUES LESS THAN (UNIX_TIMESTAMP('2024-03-01')),
        PARTITION p202403 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
        PARTITION p_future VALUES LESS THAN MAXVALUE
    )
);

-- Data Protection Compliance
CREATE TABLE data_protection_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    data_subject_id VARCHAR(100) NOT NULL,
    data_type ENUM('personal', 'sensitive', 'financial', 'health', 'biometric') NOT NULL,
    processing_purpose VARCHAR(255) NOT NULL,
    legal_basis ENUM('consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests') NOT NULL,
    consent_given_at TIMESTAMP NULL,
    consent_withdrawn_at TIMESTAMP NULL,
    retention_period_days INT NOT NULL,
    deletion_scheduled_at TIMESTAMP NULL,
    anonymization_scheduled_at TIMESTAMP NULL,
    status ENUM('active', 'deleted', 'anonymized', 'exported') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_data_subject_type (data_subject_id, data_type),
    INDEX idx_status_scheduled (status, deletion_scheduled_at),
    INDEX idx_legal_basis (legal_basis),
    INDEX idx_retention_schedule (retention_period_days, created_at)
);

-- Security Policies
CREATE TABLE security_policies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    policy_name VARCHAR(100) NOT NULL UNIQUE,
    policy_type ENUM('access_control', 'data_protection', 'network_security', 'encryption', 'audit') NOT NULL,
    description TEXT,
    rules JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    enforcement_level ENUM('enforce', 'warn', 'monitor') DEFAULT 'enforce',
    created_by BIGINT UNSIGNED,
    approved_by BIGINT UNSIGNED,
    effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NULL,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_policy_type_active (policy_type, is_active),
    INDEX idx_effective_expiry (effective_date, expiry_date)
);

-- Threat Intelligence
CREATE TABLE threat_intelligence (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    indicator_type ENUM('ip', 'domain', 'url', 'hash', 'email', 'user_agent') NOT NULL,
    indicator_value VARCHAR(500) NOT NULL,
    threat_type ENUM('malware', 'phishing', 'botnet', 'spam', 'suspicious', 'known_attacker') NOT NULL,
    severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
    confidence_score INT DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    description TEXT,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSON,
    INDEX idx_indicator_type_value (indicator_type, indicator_value),
    INDEX idx_threat_type_severity (threat_type, severity),
    INDEX idx_confidence_active (confidence_score, is_active),
    INDEX idx_source_last_seen (source, last_seen)
);

-- Compliance Reports
CREATE TABLE compliance_reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(100) UNIQUE NOT NULL,
    regulation ENUM('gdpr', 'pdpa', 'pci_dss', 'iso27001', 'sox', 'hipaa') NOT NULL,
    report_type ENUM('assessment', 'audit', 'monitoring', 'incident') NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    compliance_score DECIMAL(5,2),
    findings JSON,
    recommendations JSON,
    status ENUM('draft', 'review', 'approved', 'submitted') DEFAULT 'draft',
    generated_by BIGINT UNSIGNED,
    approved_by BIGINT UNSIGNED,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    INDEX idx_regulation_period (regulation, period_start, period_end),
    INDEX idx_status_generated (status, generated_at),
    INDEX idx_compliance_score (compliance_score)
);

-- Encryption Keys Management
CREATE TABLE encryption_keys (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    key_id VARCHAR(100) UNIQUE NOT NULL,
    key_type ENUM('symmetric', 'asymmetric', 'signing', 'master') NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    key_size INT NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    status ENUM('active', 'rotating', 'retired', 'compromised') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP NULL,
    rotation_scheduled_at TIMESTAMP NULL,
    retired_at TIMESTAMP NULL,
    metadata JSON,
    INDEX idx_key_type_status (key_type, status),
    INDEX idx_purpose_status (purpose, status),
    INDEX idx_rotation_scheduled (rotation_scheduled_at)
);
```

### Core Security Framework

```php
<?php

namespace App\Services\Security;

use App\Models\SecurityEvent;
use App\Models\AuditLog;
use App\Models\DataProtectionRecord;
use App\Models\ThreatIntelligence;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class SecurityManager
{
    private $threatDetector;
    private $auditLogger;
    private $encryptionService;
    private $complianceManager;
    
    public function __construct(
        ThreatDetectionService $threatDetector,
        AuditLogger $auditLogger,
        EncryptionService $encryptionService,
        ComplianceManager $complianceManager
    ) {
        $this->threatDetector = $threatDetector;
        $this->auditLogger = $auditLogger;
        $this->encryptionService = $encryptionService;
        $this->complianceManager = $complianceManager;
    }
    
    /**
     * Comprehensive security event processing
     */
    public function processSecurityEvent(array $eventData): SecurityEvent
    {
        // Generate unique event ID
        $eventId = $this->generateEventId();
        
        // Analyze threat level
        $riskScore = $this->threatDetector->calculateRiskScore($eventData);
        $threatIndicators = $this->threatDetector->identifyThreatIndicators($eventData);
        
        // Create security event record
        $securityEvent = SecurityEvent::create([
            'event_id' => $eventId,
            'event_type' => $eventData['type'],
            'severity' => $this->determineSeverity($riskScore),
            'source_ip' => $eventData['source_ip'] ?? null,
            'user_id' => $eventData['user_id'] ?? null,
            'resource_type' => $eventData['resource_type'] ?? null,
            'resource_id' => $eventData['resource_id'] ?? null,
            'action' => $eventData['action'],
            'result' => $eventData['result'],
            'risk_score' => $riskScore,
            'threat_indicators' => $threatIndicators,
            'raw_data' => json_encode($eventData)
        ]);
        
        // Process high-risk events immediately
        if ($riskScore >= 80) {
            $this->handleHighRiskEvent($securityEvent);
        }
        
        // Update threat intelligence if needed
        if (!empty($threatIndicators)) {
            $this->updateThreatIntelligence($threatIndicators, $eventData);
        }
        
        // Trigger real-time alerts if necessary
        if ($securityEvent->severity === 'critical') {
            $this->triggerSecurityAlert($securityEvent);
        }
        
        return $securityEvent;
    }
    
    /**
     * Comprehensive audit logging
     */
    public function logAuditEvent(array $auditData): AuditLog
    {
        $auditId = $this->generateAuditId();
        $checksum = $this->calculateChecksum($auditData);
        
        $auditLog = AuditLog::create([
            'audit_id' => $auditId,
            'user_id' => $auditData['user_id'] ?? null,
            'session_id' => $auditData['session_id'] ?? null,
            'ip_address' => $auditData['ip_address'] ?? null,
            'user_agent' => $auditData['user_agent'] ?? null,
            'action' => $auditData['action'],
            'resource_type' => $auditData['resource_type'] ?? null,
            'resource_id' => $auditData['resource_id'] ?? null,
            'old_values' => $auditData['old_values'] ?? null,
            'new_values' => $auditData['new_values'] ?? null,
            'metadata' => $auditData['metadata'] ?? null,
            'checksum' => $checksum
        ]);
        
        // Process for compliance requirements
        $this->complianceManager->processAuditEvent($auditLog);
        
        return $auditLog;
    }
    
    /**
     * Data protection compliance management
     */
    public function registerDataProcessing(array $dataProcessing): DataProtectionRecord
    {
        $retentionDays = $this->calculateRetentionPeriod(
            $dataProcessing['data_type'],
            $dataProcessing['processing_purpose']
        );
        
        $record = DataProtectionRecord::create([
            'data_subject_id' => $dataProcessing['data_subject_id'],
            'data_type' => $dataProcessing['data_type'],
            'processing_purpose' => $dataProcessing['processing_purpose'],
            'legal_basis' => $dataProcessing['legal_basis'],
            'consent_given_at' => $dataProcessing['consent_given_at'] ?? null,
            'retention_period_days' => $retentionDays,
            'deletion_scheduled_at' => now()->addDays($retentionDays)
        ]);
        
        // Schedule automated data lifecycle management
        $this->scheduleDataLifecycleActions($record);
        
        return $record;
    }
    
    /**
     * Advanced threat detection
     */
    public function detectThreats(array $requestData): array
    {
        $threats = [];
        
        // Check against threat intelligence
        $ipThreats = $this->checkThreatIntelligence('ip', $requestData['source_ip'] ?? '');
        if (!empty($ipThreats)) {
            $threats[] = [
                'type' => 'malicious_ip',
                'severity' => 'high',
                'details' => $ipThreats
            ];
        }
        
        // Behavioral analysis
        $behavioralThreats = $this->analyzeBehavior($requestData);
        $threats = array_merge($threats, $behavioralThreats);
        
        // Pattern matching
        $patternThreats = $this->matchThreatPatterns($requestData);
        $threats = array_merge($threats, $patternThreats);
        
        // Machine learning-based detection
        $mlThreats = $this->mlThreatDetection($requestData);
        $threats = array_merge($threats, $mlThreats);
        
        return $threats;
    }
    
    /**
     * Encryption key management
     */
    public function rotateEncryptionKeys(): void
    {
        $keysToRotate = EncryptionKey::where('rotation_scheduled_at', '<=', now())
            ->where('status', 'active')
            ->get();
            
        foreach ($keysToRotate as $key) {
            try {
                // Generate new key
                $newKey = $this->encryptionService->generateKey([
                    'type' => $key->key_type,
                    'algorithm' => $key->algorithm,
                    'size' => $key->key_size,
                    'purpose' => $key->purpose
                ]);
                
                // Update key status
                $key->update(['status' => 'rotating']);
                
                // Re-encrypt data with new key
                $this->reEncryptData($key, $newKey);
                
                // Retire old key
                $key->update([
                    'status' => 'retired',
                    'retired_at' => now()
                ]);
                
                // Activate new key
                EncryptionKey::create([
                    'key_id' => $newKey['id'],
                    'key_type' => $key->key_type,
                    'algorithm' => $key->algorithm,
                    'key_size' => $key->key_size,
                    'purpose' => $key->purpose,
                    'status' => 'active',
                    'activated_at' => now(),
                    'rotation_scheduled_at' => now()->addMonths(3)
                ]);
                
                Log::info("Key rotation completed successfully", ['key_id' => $key->key_id]);
                
            } catch (\Exception $e) {
                Log::error("Key rotation failed", [
                    'key_id' => $key->key_id,
                    'error' => $e->getMessage()
                ]);
                
                // Mark key as compromised if rotation fails
                $key->update(['status' => 'compromised']);
            }
        }
    }
    
    private function handleHighRiskEvent(SecurityEvent $event): void
    {
        // Immediate security response
        switch ($event->event_type) {
            case 'authentication':
                $this->handleAuthenticationThreat($event);
                break;
            case 'data_access':
                $this->handleDataAccessThreat($event);
                break;
            case 'network':
                $this->handleNetworkThreat($event);
                break;
        }
        
        // Notify security team
        $this->notifySecurityTeam($event);
        
        // Update threat intelligence
        $this->updateThreatIntelligence($event->threat_indicators, json_decode($event->raw_data, true));
    }
    
    private function analyzeBehavior(array $requestData): array
    {
        $threats = [];
        $userId = $requestData['user_id'] ?? null;
        
        if ($userId) {
            // Check for unusual access patterns
            $recentEvents = SecurityEvent::where('user_id', $userId)
                ->where('processed_at', '>=', now()->subHours(1))
                ->get();
                
            $uniqueIps = $recentEvents->pluck('source_ip')->unique()->count();
            if ($uniqueIps > 5) {
                $threats[] = [
                    'type' => 'unusual_access_pattern',
                    'severity' => 'medium',
                    'details' => "User accessed from {$uniqueIps} different IPs in the last hour"
                ];
            }
            
            // Check for rapid successive requests
            $requestCount = $recentEvents->count();
            if ($requestCount > 100) {
                $threats[] = [
                    'type' => 'potential_automated_attack',
                    'severity' => 'high',
                    'details' => "User made {$requestCount} requests in the last hour"
                ];
            }
        }
        
        return $threats;
    }
}

/**
 * GDPR/PDPA Compliance Manager
 */
class ComplianceManager
{
    public function processDataSubjectRequest(string $type, array $requestData): array
    {
        switch ($type) {
            case 'right_to_access':
                return $this->handleDataAccessRequest($requestData);
            case 'right_to_erasure':
                return $this->handleDataErasureRequest($requestData);
            case 'right_to_portability':
                return $this->handleDataPortabilityRequest($requestData);
            case 'right_to_rectification':
                return $this->handleDataRectificationRequest($requestData);
            default:
                throw new \InvalidArgumentException("Unknown request type: $type");
        }
    }
    
    private function handleDataAccessRequest(array $requestData): array
    {
        $dataSubjectId = $requestData['data_subject_id'];
        
        // Collect all personal data
        $personalData = $this->collectPersonalData($dataSubjectId);
        
        // Generate data export
        $exportData = [
            'data_subject_id' => $dataSubjectId,
            'request_date' => now()->toISOString(),
            'data_categories' => $personalData,
            'processing_purposes' => $this->getProcessingPurposes($dataSubjectId),
            'data_recipients' => $this->getDataRecipients($dataSubjectId),
            'retention_periods' => $this->getRetentionPeriods($dataSubjectId)
        ];
        
        // Log compliance action
        AuditLog::create([
            'audit_id' => Str::uuid(),
            'action' => 'data_access_request_processed',
            'resource_type' => 'personal_data',
            'resource_id' => $dataSubjectId,
            'metadata' => ['request_type' => 'right_to_access'],
            'checksum' => hash('sha256', json_encode($exportData))
        ]);
        
        return $exportData;
    }
    
    private function handleDataErasureRequest(array $requestData): array
    {
        $dataSubjectId = $requestData['data_subject_id'];
        
        // Verify erasure is allowed
        $canErase = $this->verifyErasureAllowed($dataSubjectId);
        if (!$canErase) {
            throw new ComplianceException('Data erasure not permitted due to legal obligations');
        }
        
        // Schedule data deletion
        $deletionResults = $this->scheduleDataDeletion($dataSubjectId);
        
        // Update compliance records
        DataProtectionRecord::where('data_subject_id', $dataSubjectId)
            ->update([
                'status' => 'deleted',
                'deletion_scheduled_at' => now()
            ]);
        
        return [
            'status' => 'scheduled',
            'deletion_date' => now()->addDays(30)->toISOString(),
            'affected_records' => $deletionResults['record_count']
        ];
    }
    
    public function generateComplianceReport(string $regulation, array $period): array
    {
        $report = [
            'regulation' => $regulation,
            'period' => $period,
            'generated_at' => now()->toISOString(),
            'compliance_score' => 0,
            'findings' => [],
            'recommendations' => []
        ];
        
        switch ($regulation) {
            case 'gdpr':
                $report = $this->generateGDPRReport($report, $period);
                break;
            case 'pdpa':
                $report = $this->generatePDPAReport($report, $period);
                break;
            case 'pci_dss':
                $report = $this->generatePCIDSSReport($report, $period);
                break;
        }
        
        // Calculate overall compliance score
        $report['compliance_score'] = $this->calculateComplianceScore($report['findings']);
        
        return $report;
    }
}

/**
 * Advanced Threat Detection Service
 */
class ThreatDetectionService
{
    private $mlModel;
    
    public function calculateRiskScore(array $eventData): int
    {
        $score = 0;
        
        // Base risk factors
        $riskFactors = [
            'failed_authentication' => 20,
            'suspicious_ip' => 30,
            'unusual_access_pattern' => 25,
            'privilege_escalation' => 40,
            'data_exfiltration' => 50,
            'malware_detected' => 60
        ];
        
        foreach ($riskFactors as $factor => $points) {
            if ($this->checkRiskFactor($factor, $eventData)) {
                $score += $points;
            }
        }
        
        // Machine learning enhancement
        $mlScore = $this->mlModel->predictRisk($eventData);
        $score = ($score + $mlScore) / 2;
        
        return min(100, max(0, $score));
    }
    
    public function identifyThreatIndicators(array $eventData): array
    {
        $indicators = [];
        
        // Check threat intelligence database
        $threatIntel = ThreatIntelligence::where('indicator_value', $eventData['source_ip'] ?? '')
            ->where('is_active', true)
            ->first();
            
        if ($threatIntel) {
            $indicators[] = [
                'type' => 'known_threat_ip',
                'confidence' => $threatIntel->confidence_score,
                'source' => $threatIntel->source
            ];
        }
        
        // Pattern-based detection
        $patterns = $this->detectPatterns($eventData);
        $indicators = array_merge($indicators, $patterns);
        
        return $indicators;
    }
}
```

### Security Dashboard Frontend

```javascript
// Security Operations Center (SOC) Dashboard
class SecurityDashboard {
    constructor() {
        this.realTimeThreats = [];
        this.complianceMetrics = {};
        this.initializeWebSocket();
        this.loadSecurityMetrics();
        this.initializeCharts();
    }
    
    async loadSecurityMetrics() {
        try {
            const response = await fetch('/api/security/metrics');
            const metrics = await response.json();
            
            this.updateThreatMetrics(metrics.threats);
            this.updateComplianceMetrics(metrics.compliance);
            this.updateAuditMetrics(metrics.audit);
        } catch (error) {
            console.error('Failed to load security metrics:', error);
        }
    }
    
    updateThreatMetrics(threats) {
        document.getElementById('active-threats').textContent = threats.active_count;
        document.getElementById('threats-today').textContent = threats.today_count;
        document.getElementById('avg-risk-score').textContent = threats.avg_risk_score.toFixed(1);
        document.getElementById('critical-alerts').textContent = threats.critical_count;
        
        this.updateThreatChart(threats.hourly_data);
    }
    
    updateComplianceMetrics(compliance) {
        this.complianceMetrics = compliance;
        
        Object.keys(compliance.scores).forEach(regulation => {
            const scoreElement = document.getElementById(`compliance-${regulation}`);
            if (scoreElement) {
                scoreElement.textContent = `${compliance.scores[regulation]}%`;
                scoreElement.className = this.getComplianceClass(compliance.scores[regulation]);
            }
        });
        
        this.updateComplianceChart(compliance);
    }
    
    initializeWebSocket() {
        this.ws = new WebSocket(`wss://${window.location.host}/ws/security`);
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                case 'security_event':
                    this.handleSecurityEvent(data);
                    break;
                case 'threat_alert':
                    this.handleThreatAlert(data);
                    break;
                case 'compliance_update':
                    this.handleComplianceUpdate(data);
                    break;
            }
        };
    }
    
    handleSecurityEvent(event) {
        // Add to real-time feed
        this.addToSecurityFeed(event);
        
        // Update counters
        this.updateSecurityCounters(event);
        
        // Show alert if high severity
        if (event.severity === 'critical' || event.severity === 'high') {
            this.showSecurityAlert(event);
        }
    }
    
    addToSecurityFeed(event) {
        const feed = document.getElementById('security-feed');
        const eventElement = document.createElement('div');
        eventElement.className = `security-event ${event.severity}`;
        eventElement.innerHTML = `
            <div class="event-header">
                <span class="event-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
                <span class="event-type">${event.event_type}</span>
                <span class="event-severity ${event.severity}">${event.severity.toUpperCase()}</span>
            </div>
            <div class="event-details">
                <div class="event-source">Source: ${event.source_ip || 'Unknown'}</div>
                <div class="event-action">Action: ${event.action}</div>
                <div class="event-result">Result: ${event.result}</div>
                ${event.risk_score ? `<div class="event-risk">Risk Score: ${event.risk_score}</div>` : ''}
            </div>
            <div class="event-actions">
                <button onclick="securityDashboard.investigateEvent('${event.event_id}')" class="btn btn-sm">Investigate</button>
                <button onclick="securityDashboard.blockSource('${event.source_ip}')" class="btn btn-sm btn-danger">Block IP</button>
            </div>
        `;
        
        feed.insertBefore(eventElement, feed.firstChild);
        
        // Keep only latest 50 events in DOM
        while (feed.children.length > 50) {
            feed.removeChild(feed.lastChild);
        }
    }
    
    showSecurityAlert(event) {
        const alert = document.createElement('div');
        alert.className = `security-alert ${event.severity}`;
        alert.innerHTML = `
            <div class="alert-header">
                <strong>Security Alert - ${event.severity.toUpperCase()}</strong>
                <button onclick="this.parentElement.parentElement.remove()" class="close-btn">&times;</button>
            </div>
            <div class="alert-body">
                <p><strong>Event Type:</strong> ${event.event_type}</p>
                <p><strong>Source:</strong> ${event.source_ip || 'Unknown'}</p>
                <p><strong>Risk Score:</strong> ${event.risk_score}</p>
                <p><strong>Action Required:</strong> Immediate investigation recommended</p>
            </div>
            <div class="alert-actions">
                <button onclick="securityDashboard.respondToThreat('${event.event_id}')" class="btn btn-primary">Respond</button>
                <button onclick="securityDashboard.acknowledgeAlert('${event.event_id}')" class="btn btn-secondary">Acknowledge</button>
            </div>
        `;
        
        document.getElementById('alerts-container').appendChild(alert);
        
        // Auto-remove after 5 minutes if not acknowledged
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 300000);
    }
    
    async investigateEvent(eventId) {
        try {
            const response = await fetch(`/api/security/events/${eventId}/investigate`);
            const investigation = await response.json();
            
            this.showInvestigationModal(investigation);
        } catch (error) {
            console.error('Failed to start investigation:', error);
        }
    }
    
    showInvestigationModal(investigation) {
        const modal = document.getElementById('investigation-modal');
        const content = document.getElementById('investigation-content');
        
        content.innerHTML = `
            <h3>Security Investigation - ${investigation.event_id}</h3>
            
            <div class="investigation-timeline">
                <h4>Event Timeline</h4>
                ${investigation.timeline.map(event => `
                    <div class="timeline-item">
                        <span class="timeline-time">${new Date(event.timestamp).toLocaleString()}</span>
                        <span class="timeline-event">${event.description}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="investigation-context">
                <h4>Related Events</h4>
                <div class="related-events">
                    ${investigation.related_events.map(event => `
                        <div class="related-event">
                            <span class="event-type">${event.event_type}</span>
                            <span class="event-time">${new Date(event.timestamp).toLocaleString()}</span>
                            <span class="event-risk">Risk: ${event.risk_score}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="investigation-recommendations">
                <h4>Recommended Actions</h4>
                <ul>
                    ${investigation.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div class="investigation-actions">
                <button onclick="securityDashboard.takeAction('block_ip', '${investigation.source_ip}')" class="btn btn-danger">Block IP</button>
                <button onclick="securityDashboard.takeAction('quarantine_user', '${investigation.user_id}')" class="btn btn-warning">Quarantine User</button>
                <button onclick="securityDashboard.takeAction('escalate', '${investigation.event_id}')" class="btn btn-primary">Escalate</button>
                <button onclick="securityDashboard.closeInvestigation('${investigation.event_id}')" class="btn btn-secondary">Mark as Resolved</button>
            </div>
        `;
        
        modal.style.display = 'block';
    }
    
    async generateComplianceReport(regulation) {
        const modal = document.getElementById('compliance-report-modal');
        const form = document.getElementById('compliance-report-form');
        
        form.innerHTML = `
            <h3>Generate ${regulation.toUpperCase()} Compliance Report</h3>
            
            <div class="form-group">
                <label for="report-period">Reporting Period:</label>
                <select id="report-period" name="period" required>
                    <option value="last_month">Last Month</option>
                    <option value="last_quarter">Last Quarter</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Custom Range</option>
                </select>
            </div>
            
            <div class="form-group" id="custom-range" style="display: none;">
                <label for="start-date">Start Date:</label>
                <input type="date" id="start-date" name="start_date">
                <label for="end-date">End Date:</label>
                <input type="date" id="end-date" name="end_date">
            </div>
            
            <div class="form-group">
                <label for="report-format">Report Format:</label>
                <select id="report-format" name="format" required>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="json">JSON</option>
                </select>
            </div>
            
            <div class="form-actions">
                <button type="button" onclick="securityDashboard.submitComplianceReport('${regulation}')" class="btn btn-primary">Generate Report</button>
                <button type="button" onclick="document.getElementById('compliance-report-modal').style.display='none'" class="btn btn-secondary">Cancel</button>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // Show/hide custom date range
        document.getElementById('report-period').addEventListener('change', function() {
            const customRange = document.getElementById('custom-range');
            customRange.style.display = this.value === 'custom' ? 'block' : 'none';
        });
    }
    
    async submitComplianceReport(regulation) {
        const form = document.getElementById('compliance-report-form');
        const formData = new FormData(form);
        
        try {
            const response = await fetch(`/api/security/compliance/${regulation}/report`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${regulation}-compliance-report.${formData.get('format')}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                document.getElementById('compliance-report-modal').style.display = 'none';
                this.showNotification('Compliance report generated successfully', 'success');
            } else {
                throw new Error('Failed to generate report');
            }
        } catch (error) {
            this.showNotification('Failed to generate compliance report', 'error');
        }
    }
}

// Data Protection Management
class DataProtectionManager {
    constructor() {
        this.pendingRequests = [];
        this.loadPendingRequests();
    }
    
    async loadPendingRequests() {
        try {
            const response = await fetch('/api/security/data-protection/requests');
            const requests = await response.json();
            
            this.renderDataRequests(requests);
        } catch (error) {
            console.error('Failed to load data protection requests:', error);
        }
    }
    
    renderDataRequests(requests) {
        const container = document.getElementById('data-requests-list');
        container.innerHTML = '';
        
        requests.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.className = `data-request ${request.status}`;
            requestElement.innerHTML = `
                <div class="request-header">
                    <h4>${request.request_type.replace('_', ' ').toUpperCase()}</h4>
                    <span class="request-status ${request.status}">${request.status}</span>
                </div>
                
                <div class="request-details">
                    <p><strong>Data Subject:</strong> ${request.data_subject_id}</p>
                    <p><strong>Requested:</strong> ${new Date(request.created_at).toLocaleString()}</p>
                    <p><strong>Deadline:</strong> ${new Date(request.deadline).toLocaleString()}</p>
                    ${request.description ? `<p><strong>Description:</strong> ${request.description}</p>` : ''}
                </div>
                
                <div class="request-actions">
                    <button onclick="dataProtectionManager.processRequest('${request.id}')" class="btn btn-primary">Process</button>
                    <button onclick="dataProtectionManager.viewDetails('${request.id}')" class="btn btn-secondary">View Details</button>
                </div>
            `;
            
            container.appendChild(requestElement);
        });
    }
    
    async processDataSubjectRequest(type) {
        const modal = document.getElementById('data-request-modal');
        const form = document.getElementById('data-request-form');
        
        form.innerHTML = `
            <h3>Process ${type.replace('_', ' ').toUpperCase()} Request</h3>
            
            <div class="form-group">
                <label for="data-subject-id">Data Subject ID:</label>
                <input type="text" id="data-subject-id" name="data_subject_id" required>
            </div>
            
            <div class="form-group">
                <label for="verification-method">Identity Verification:</label>
                <select id="verification-method" name="verification_method" required>
                    <option value="email">Email Verification</option>
                    <option value="phone">Phone Verification</option>
                    <option value="in_person">In-Person Verification</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="request-details">Additional Details:</label>
                <textarea id="request-details" name="details" rows="4"></textarea>
            </div>
            
            <div class="form-actions">
                <button type="button" onclick="dataProtectionManager.submitRequest('${type}')" class="btn btn-primary">Submit Request</button>
                <button type="button" onclick="document.getElementById('data-request-modal').style.display='none'" class="btn btn-secondary">Cancel</button>
            </div>
        `;
        
        modal.style.display = 'block';
    }
}

// Initialize security dashboard
const securityDashboard = new SecurityDashboard();
const dataProtectionManager = new DataProtectionManager();
```

---

## Implementation Steps

### Phase 1: Foundation and Compliance Framework (Day 1)
1. **Database Schema Implementation**
   - Create all security and compliance tables
   - Set up proper indexes and partitioning
   - Configure audit trail integrity mechanisms

2. **Core Security Services**
   - Implement SecurityManager base class
   - Set up audit logging framework
   - Create compliance management system

3. **Encryption and Key Management**
   - Implement encryption service
   - Set up key management system
   - Configure automated key rotation

### Phase 2: Threat Detection and Monitoring (Day 2)
1. **Threat Detection Engine**
   - Implement real-time threat detection
   - Set up behavioral analysis algorithms
   - Create threat intelligence integration

2. **Security Event Processing**
   - Build security event pipeline
   - Implement risk scoring algorithms
   - Set up automated response triggers

3. **SIEM Integration**
   - Configure centralized log collection
   - Implement security dashboards
   - Set up alerting mechanisms

### Phase 3: Data Protection and Privacy (Day 3)
1. **GDPR/PDPA Compliance**
   - Implement data subject rights management
   - Set up consent tracking system
   - Create automated data lifecycle management

2. **Data Classification**
   - Implement data sensitivity classification
   - Set up automated data discovery
   - Create data mapping and inventory

3. **Privacy Controls**
   - Implement privacy by design principles
   - Set up data minimization controls
   - Create anonymization procedures

### Phase 4: Security Testing and Vulnerability Management (Day 4)
1. **Automated Security Scanning**
   - Implement vulnerability scanners
   - Set up penetration testing automation
   - Create security code analysis

2. **Security Metrics and KPIs**
   - Implement security posture measurement
   - Set up trend analysis and reporting
   - Create compliance scoring system

3. **Incident Response**
   - Create automated incident response
   - Set up escalation procedures
   - Implement forensic analysis tools

### Phase 5: Advanced Security Features (Day 5)
1. **Zero Trust Implementation**
   - Implement zero trust architecture
   - Set up micro-segmentation
   - Create dynamic access controls

2. **Machine Learning Security**
   - Implement ML-based threat detection
   - Set up anomaly detection algorithms
   - Create predictive security analytics

3. **Advanced Encryption**
   - Implement quantum-resistant encryption
   - Set up homomorphic encryption for analytics
   - Create secure multi-party computation

### Phase 6: Integration and Optimization (Day 6)
1. **Security Dashboard**
   - Complete SOC dashboard implementation
   - Set up real-time monitoring displays
   - Create executive security reports

2. **Integration Testing**
   - Test all security components
   - Validate compliance procedures
   - Verify incident response workflows

3. **Documentation and Training**
   - Create security operation procedures
   - Develop compliance documentation
   - Conduct security awareness training

---

## Quality Assurance

### Security Testing Requirements
- **Penetration Testing**: Quarterly external penetration tests
- **Vulnerability Scanning**: Daily automated vulnerability scans
- **Code Security Analysis**: 100% code coverage for security analysis
- **Compliance Auditing**: Monthly compliance audit procedures
- **Incident Response Testing**: Quarterly incident response drills

### Performance Criteria
- **Threat Detection Speed**: < 1 second for real-time threat detection
- **Audit Log Processing**: 10,000+ events per second
- **Compliance Report Generation**: < 5 minutes for comprehensive reports
- **Security Dashboard Response**: < 2 seconds for all dashboard operations
- **Key Rotation Performance**: < 30 seconds for key rotation procedures

### Compliance Requirements
- **GDPR Compliance**: 100% compliance with all GDPR requirements
- **PDPA Compliance**: Full compliance with Thai data protection laws
- **Audit Trail Integrity**: Tamper-proof audit logs with cryptographic verification
- **Data Retention**: Automated compliance with retention policies
- **Privacy Controls**: Complete implementation of privacy by design principles

---

## Success Criteria

### Security Objectives
- ✅ Zero successful security breaches
- ✅ 99.9% threat detection accuracy
- ✅ < 5 minutes mean time to threat detection
- ✅ 100% compliance with security policies
- ✅ Complete audit trail for all operations
- ✅ Automated incident response operational

### Compliance Metrics
- ✅ 100% GDPR/PDPA compliance score
- ✅ Zero compliance violations
- ✅ Complete data subject rights implementation
- ✅ Automated compliance reporting
- ✅ Privacy impact assessments completed
- ✅ Data protection officer requirements met

### Business Impact
- ✅ Customer trust enhanced through robust security
- ✅ Regulatory compliance achieved and maintained
- ✅ Security incidents reduced by 95%
- ✅ Audit costs reduced through automation
- ✅ Security awareness improved across organization
- ✅ Business continuity maintained during security events

---

## Risk Mitigation

### Security Risks
- **Advanced Persistent Threats**: Multi-layered defense and continuous monitoring
- **Zero-Day Vulnerabilities**: Rapid patch management and virtual patching
- **Insider Threats**: Behavior monitoring and access controls
- **Data Breaches**: Encryption, access controls, and incident response

### Compliance Risks
- **Regulatory Changes**: Continuous monitoring of regulatory updates
- **Audit Failures**: Regular internal audits and remediation procedures
- **Data Subject Complaints**: Efficient request processing and resolution
- **Cross-Border Data Transfers**: Appropriate safeguards and legal mechanisms

### Operational Risks
- **System Complexity**: Comprehensive documentation and training
- **Performance Impact**: Optimized security controls and monitoring
- **False Positives**: Machine learning tuning and human validation
- **Security Team Workload**: Automation and intelligent alerting

This comprehensive security and compliance framework will provide enterprise-grade protection while ensuring full regulatory compliance and maintaining operational efficiency.
