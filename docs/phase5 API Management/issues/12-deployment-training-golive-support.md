# Issue #12: Deployment, Training, and Go-Live Support

## Overview
Implement comprehensive deployment strategy, training programs, and go-live support for the Banrimkwae Resort Management System API Management infrastructure to ensure smooth transition, user adoption, and operational excellence.

## Requirements

### Functional Requirements
1. **Deployment Automation**
   - Infrastructure as Code (IaC) implementation
   - CI/CD pipeline configuration
   - Blue-green deployment strategy
   - Rollback mechanisms and procedures

2. **Training and Documentation**
   - Comprehensive user training programs
   - API documentation and guides
   - Video tutorials and walkthroughs
   - Best practices documentation

3. **Go-Live Support**
   - 24/7 support during initial rollout
   - Performance monitoring and alerting
   - Issue escalation procedures
   - Success metrics tracking

4. **Knowledge Transfer**
   - Technical handover documentation
   - Operational runbooks
   - Troubleshooting guides
   - Maintenance procedures

### Technical Requirements
1. **Infrastructure Deployment**
   - Container orchestration setup
   - Load balancer configuration
   - Database deployment and clustering
   - Monitoring and logging infrastructure

2. **Environment Management**
   - Development, staging, production environments
   - Environment-specific configurations
   - Data migration procedures
   - Backup and recovery systems

3. **Security Implementation**
   - SSL/TLS certificate management
   - Firewall and network security
   - Access control implementation
   - Security monitoring setup

## Database Schema

```sql
-- Deployment tracking
CREATE TABLE deployments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    deployment_id VARCHAR(100) NOT NULL UNIQUE,
    environment ENUM('development', 'staging', 'production') NOT NULL,
    version VARCHAR(50) NOT NULL,
    deployment_type ENUM('blue_green', 'rolling', 'canary', 'hotfix') NOT NULL,
    status ENUM('initiated', 'in_progress', 'completed', 'failed', 'rolled_back') NOT NULL,
    deployed_by VARCHAR(100) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    rollback_at TIMESTAMP NULL,
    deployment_config JSON,
    deployment_log TEXT,
    health_check_status JSON,
    performance_metrics JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_deployment_status (status),
    INDEX idx_environment_version (environment, version),
    INDEX idx_started_at (started_at)
);

-- Training programs and sessions
CREATE TABLE training_programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_name VARCHAR(200) NOT NULL,
    program_type ENUM('api_usage', 'admin_training', 'developer_onboarding', 'troubleshooting') NOT NULL,
    target_audience ENUM('developers', 'administrators', 'end_users', 'support_staff') NOT NULL,
    duration_minutes INT NOT NULL,
    prerequisites TEXT,
    learning_objectives JSON,
    program_content JSON,
    training_materials JSON,
    assessment_criteria JSON,
    is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_program_type (program_type),
    INDEX idx_target_audience (target_audience),
    INDEX idx_active (is_active)
);

-- Training sessions and attendance
CREATE TABLE training_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT UNSIGNED NOT NULL,
    session_name VARCHAR(200) NOT NULL,
    instructor_name VARCHAR(100) NOT NULL,
    session_type ENUM('in_person', 'virtual', 'self_paced', 'workshop') NOT NULL,
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    actual_start TIMESTAMP NULL,
    actual_end TIMESTAMP NULL,
    max_participants INT,
    location VARCHAR(200),
    meeting_link VARCHAR(500),
    session_materials JSON,
    session_recording_url VARCHAR(500),
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    feedback_summary JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE,
    INDEX idx_session_status (status),
    INDEX idx_scheduled_start (scheduled_start),
    INDEX idx_instructor (instructor_name)
);

-- Training attendance and progress
CREATE TABLE training_attendance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_status ENUM('registered', 'attended', 'completed', 'no_show', 'cancelled') NOT NULL DEFAULT 'registered',
    completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    assessment_score DECIMAL(5,2),
    feedback_rating INT CHECK (feedback_rating BETWEEN 1 AND 5),
    feedback_comments TEXT,
    certificate_issued BOOLEAN NOT NULL DEFAULT FALSE,
    certificate_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_session_user (session_id, user_id),
    INDEX idx_user_attendance (user_id, attendance_status),
    INDEX idx_completion (completion_percentage)
);

-- Support tickets and issues
CREATE TABLE support_tickets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    category ENUM('api_access', 'performance', 'security', 'documentation', 'training', 'technical', 'other') NOT NULL,
    status ENUM('open', 'in_progress', 'waiting_response', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    reporter_name VARCHAR(100) NOT NULL,
    reporter_email VARCHAR(255) NOT NULL,
    reporter_role VARCHAR(50),
    assigned_to VARCHAR(100),
    environment ENUM('development', 'staging', 'production') NOT NULL,
    api_endpoint VARCHAR(255),
    error_details JSON,
    steps_to_reproduce TEXT,
    expected_behavior TEXT,
    actual_behavior TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    INDEX idx_ticket_status (status),
    INDEX idx_priority_category (priority, category),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_created_at (created_at)
);

-- Go-live checklist and milestones
CREATE TABLE golive_checklist (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    environment ENUM('staging', 'production') NOT NULL,
    milestone_category ENUM('infrastructure', 'security', 'performance', 'monitoring', 'training', 'documentation') NOT NULL,
    milestone_name VARCHAR(200) NOT NULL,
    milestone_description TEXT,
    acceptance_criteria JSON NOT NULL,
    responsible_team VARCHAR(100) NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'blocked', 'skipped') NOT NULL DEFAULT 'pending',
    priority_order INT NOT NULL,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    completed_by VARCHAR(100),
    completed_at TIMESTAMP NULL,
    verification_notes TEXT,
    dependencies JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_environment_status (environment, status),
    INDEX idx_category_priority (milestone_category, priority_order),
    INDEX idx_responsible_team (responsible_team)
);

-- Knowledge base articles
CREATE TABLE knowledge_base (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    article_title VARCHAR(300) NOT NULL,
    article_slug VARCHAR(300) NOT NULL UNIQUE,
    category ENUM('api_reference', 'tutorials', 'troubleshooting', 'best_practices', 'faq', 'release_notes') NOT NULL,
    subcategory VARCHAR(100),
    content TEXT NOT NULL,
    content_type ENUM('markdown', 'html') NOT NULL DEFAULT 'markdown',
    tags JSON,
    author_name VARCHAR(100) NOT NULL,
    reviewer_name VARCHAR(100),
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    estimated_read_time INT, -- minutes
    view_count BIGINT NOT NULL DEFAULT 0,
    helpful_votes INT NOT NULL DEFAULT 0,
    unhelpful_votes INT NOT NULL DEFAULT 0,
    last_updated_by VARCHAR(100),
    status ENUM('draft', 'review', 'published', 'archived') NOT NULL DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category_status (category, status),
    INDEX idx_published_at (published_at),
    INDEX idx_tags (tags),
    FULLTEXT KEY ft_content (article_title, content)
);

-- Operational metrics and KPIs
CREATE TABLE operational_metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_category ENUM('performance', 'availability', 'security', 'usage', 'support', 'training') NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    target_value DECIMAL(15,4),
    threshold_warning DECIMAL(15,4),
    threshold_critical DECIMAL(15,4),
    measurement_period ENUM('real_time', 'hourly', 'daily', 'weekly', 'monthly') NOT NULL,
    environment ENUM('development', 'staging', 'production') NOT NULL,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    additional_data JSON,
    
    INDEX idx_metric_category (metric_category),
    INDEX idx_measured_at (measured_at),
    INDEX idx_environment_metric (environment, metric_name)
);
```

## Backend Implementation

### Deployment Management Service

```php
<?php

namespace App\Services\Deployment;

use App\Models\Deployment;
use App\Models\GoLiveChecklist;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Carbon\Carbon;

class DeploymentService
{
    private $containerRegistry;
    private $orchestrator;
    private $monitoringService;

    public function __construct()
    {
        $this->containerRegistry = app('container.registry');
        $this->orchestrator = app('container.orchestrator');
        $this->monitoringService = app('monitoring.service');
    }

    public function initiateDeployment(array $config): Deployment
    {
        $deployment = Deployment::create([
            'deployment_id' => $this->generateDeploymentId(),
            'environment' => $config['environment'],
            'version' => $config['version'],
            'deployment_type' => $config['deployment_type'] ?? 'blue_green',
            'status' => 'initiated',
            'deployed_by' => auth()->user()->name ?? 'system',
            'deployment_config' => $config,
        ]);

        // Start deployment process
        $this->executeDeployment($deployment);

        return $deployment;
    }

    private function executeDeployment(Deployment $deployment): void
    {
        try {
            $deployment->update(['status' => 'in_progress']);

            $config = $deployment->deployment_config;
            
            switch ($deployment->deployment_type) {
                case 'blue_green':
                    $this->executeBlueGreenDeployment($deployment, $config);
                    break;
                case 'rolling':
                    $this->executeRollingDeployment($deployment, $config);
                    break;
                case 'canary':
                    $this->executeCanaryDeployment($deployment, $config);
                    break;
                default:
                    throw new \Exception("Unsupported deployment type: {$deployment->deployment_type}");
            }

            // Verify deployment health
            $healthStatus = $this->performHealthChecks($deployment);
            
            if ($healthStatus['overall_status'] === 'healthy') {
                $deployment->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                    'health_check_status' => $healthStatus,
                ]);
                
                Log::info("Deployment {$deployment->deployment_id} completed successfully");
            } else {
                throw new \Exception('Health checks failed: ' . json_encode($healthStatus));
            }

        } catch (\Exception $e) {
            $deployment->update([
                'status' => 'failed',
                'deployment_log' => $e->getMessage(),
            ]);

            Log::error("Deployment {$deployment->deployment_id} failed: " . $e->getMessage());
            
            // Attempt automatic rollback
            $this->rollbackDeployment($deployment);
        }
    }

    private function executeBlueGreenDeployment(Deployment $deployment, array $config): void
    {
        $greenEnvironment = $config['green_environment'] ?? 'green';
        $blueEnvironment = $config['blue_environment'] ?? 'blue';

        // Deploy to green environment
        $this->deployToEnvironment($greenEnvironment, $config);
        
        // Perform smoke tests on green
        $smokeTestResults = $this->runSmokeTests($greenEnvironment);
        
        if (!$smokeTestResults['passed']) {
            throw new \Exception('Smoke tests failed on green environment');
        }

        // Switch traffic to green environment
        $this->switchTraffic($blueEnvironment, $greenEnvironment);
        
        // Monitor for a few minutes
        sleep(300); // 5 minutes
        
        // Final health check
        $finalHealthCheck = $this->performEnvironmentHealthCheck($greenEnvironment);
        
        if (!$finalHealthCheck['healthy']) {
            // Switch back to blue
            $this->switchTraffic($greenEnvironment, $blueEnvironment);
            throw new \Exception('Final health check failed, rolled back to blue environment');
        }

        $deployment->deployment_log = "Blue-green deployment completed successfully";
    }

    private function performHealthChecks(Deployment $deployment): array
    {
        $checks = [
            'api_endpoints' => $this->checkAPIEndpoints(),
            'database_connectivity' => $this->checkDatabaseConnectivity(),
            'cache_connectivity' => $this->checkCacheConnectivity(),
            'external_services' => $this->checkExternalServices(),
            'performance_metrics' => $this->checkPerformanceMetrics(),
        ];

        $healthyCount = count(array_filter($checks, fn($check) => $check['status'] === 'healthy'));
        $totalChecks = count($checks);
        
        return [
            'overall_status' => $healthyCount === $totalChecks ? 'healthy' : 'unhealthy',
            'checks' => $checks,
            'healthy_count' => $healthyCount,
            'total_checks' => $totalChecks,
            'checked_at' => now()->toISOString(),
        ];
    }

    public function rollbackDeployment(Deployment $deployment): bool
    {
        try {
            $deployment->update(['status' => 'rolling_back']);

            // Get previous successful deployment
            $previousDeployment = Deployment::where('environment', $deployment->environment)
                ->where('status', 'completed')
                ->where('id', '<', $deployment->id)
                ->orderBy('id', 'desc')
                ->first();

            if (!$previousDeployment) {
                throw new \Exception('No previous successful deployment found for rollback');
            }

            // Execute rollback
            $rollbackConfig = $previousDeployment->deployment_config;
            $rollbackConfig['is_rollback'] = true;
            $rollbackConfig['rollback_from'] = $deployment->version;
            $rollbackConfig['rollback_to'] = $previousDeployment->version;

            $this->deployToEnvironment($deployment->environment, $rollbackConfig);

            // Verify rollback
            $healthStatus = $this->performHealthChecks($deployment);
            
            if ($healthStatus['overall_status'] === 'healthy') {
                $deployment->update([
                    'status' => 'rolled_back',
                    'rollback_at' => now(),
                ]);
                
                Log::info("Deployment {$deployment->deployment_id} rolled back successfully");
                return true;
            }

            throw new \Exception('Rollback verification failed');

        } catch (\Exception $e) {
            Log::error("Rollback failed for deployment {$deployment->deployment_id}: " . $e->getMessage());
            return false;
        }
    }

    private function checkAPIEndpoints(): array
    {
        $endpoints = [
            '/api/health',
            '/api/auth/check',
            '/api/reservations',
            '/api/rooms',
        ];

        $results = [];
        foreach ($endpoints as $endpoint) {
            try {
                $response = Http::timeout(10)->get(config('app.url') . $endpoint);
                $results[$endpoint] = [
                    'status' => $response->successful() ? 'healthy' : 'unhealthy',
                    'response_time' => $response->transferStats->getTransferTime(),
                    'status_code' => $response->status(),
                ];
            } catch (\Exception $e) {
                $results[$endpoint] = [
                    'status' => 'unhealthy',
                    'error' => $e->getMessage(),
                ];
            }
        }

        $healthyCount = count(array_filter($results, fn($r) => $r['status'] === 'healthy'));
        
        return [
            'status' => $healthyCount === count($endpoints) ? 'healthy' : 'unhealthy',
            'endpoints' => $results,
        ];
    }

    private function generateDeploymentId(): string
    {
        return 'dep_' . now()->format('YmdHis') . '_' . substr(md5(uniqid()), 0, 8);
    }
}
```

### Training Management Service

```php
<?php

namespace App\Services\Training;

use App\Models\TrainingProgram;
use App\Models\TrainingSession;
use App\Models\TrainingAttendance;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class TrainingService
{
    public function createTrainingProgram(array $data): TrainingProgram
    {
        return TrainingProgram::create([
            'program_name' => $data['program_name'],
            'program_type' => $data['program_type'],
            'target_audience' => $data['target_audience'],
            'duration_minutes' => $data['duration_minutes'],
            'prerequisites' => $data['prerequisites'] ?? null,
            'learning_objectives' => $data['learning_objectives'],
            'program_content' => $data['program_content'],
            'training_materials' => $data['training_materials'] ?? [],
            'assessment_criteria' => $data['assessment_criteria'] ?? [],
            'is_mandatory' => $data['is_mandatory'] ?? false,
        ]);
    }

    public function scheduleTrainingSession(int $programId, array $sessionData): TrainingSession
    {
        $program = TrainingProgram::findOrFail($programId);
        
        $session = TrainingSession::create([
            'program_id' => $program->id,
            'session_name' => $sessionData['session_name'],
            'instructor_name' => $sessionData['instructor_name'],
            'session_type' => $sessionData['session_type'],
            'scheduled_start' => $sessionData['scheduled_start'],
            'scheduled_end' => $sessionData['scheduled_end'],
            'max_participants' => $sessionData['max_participants'] ?? null,
            'location' => $sessionData['location'] ?? null,
            'meeting_link' => $sessionData['meeting_link'] ?? null,
            'session_materials' => $sessionData['session_materials'] ?? [],
        ]);

        // Send notifications to eligible participants
        $this->notifyEligibleParticipants($session);

        return $session;
    }

    public function registerForTraining(int $sessionId, array $userData): TrainingAttendance
    {
        $session = TrainingSession::findOrFail($sessionId);
        
        // Check if session is full
        if ($session->max_participants) {
            $currentRegistrations = TrainingAttendance::where('session_id', $sessionId)
                ->whereIn('attendance_status', ['registered', 'attended', 'completed'])
                ->count();
                
            if ($currentRegistrations >= $session->max_participants) {
                throw new \Exception('Training session is full');
            }
        }

        return TrainingAttendance::create([
            'session_id' => $session->id,
            'user_id' => $userData['user_id'],
            'user_name' => $userData['user_name'],
            'user_email' => $userData['user_email'],
            'user_role' => $userData['user_role'],
            'attendance_status' => 'registered',
        ]);
    }

    public function recordAttendance(int $sessionId, array $attendanceData): void
    {
        foreach ($attendanceData as $attendance) {
            TrainingAttendance::where('session_id', $sessionId)
                ->where('user_id', $attendance['user_id'])
                ->update([
                    'attendance_status' => $attendance['status'],
                    'completion_percentage' => $attendance['completion_percentage'] ?? 0,
                    'assessment_score' => $attendance['assessment_score'] ?? null,
                ]);
        }
    }

    public function generateTrainingReport(array $filters = []): array
    {
        $query = TrainingAttendance::with(['session.program']);

        if (isset($filters['program_type'])) {
            $query->whereHas('session.program', function ($q) use ($filters) {
                $q->where('program_type', $filters['program_type']);
            });
        }

        if (isset($filters['date_from'])) {
            $query->whereHas('session', function ($q) use ($filters) {
                $q->where('scheduled_start', '>=', $filters['date_from']);
            });
        }

        if (isset($filters['date_to'])) {
            $query->whereHas('session', function ($q) use ($filters) {
                $q->where('scheduled_start', '<=', $filters['date_to']);
            });
        }

        $attendances = $query->get();

        return [
            'total_participants' => $attendances->count(),
            'completion_rate' => $attendances->where('attendance_status', 'completed')->count() / max($attendances->count(), 1) * 100,
            'average_score' => $attendances->whereNotNull('assessment_score')->avg('assessment_score'),
            'programs_summary' => $this->generateProgramsSummary($attendances),
            'attendance_by_role' => $this->generateAttendanceByRole($attendances),
        ];
    }

    private function notifyEligibleParticipants(TrainingSession $session): void
    {
        // Implementation would send notifications to users based on target audience
        // This is a placeholder for the actual notification logic
        Log::info("Notifications sent for training session: {$session->session_name}");
    }

    private function generateProgramsSummary($attendances): array
    {
        return $attendances->groupBy('session.program.program_name')
            ->map(function ($group, $programName) {
                return [
                    'program_name' => $programName,
                    'total_participants' => $group->count(),
                    'completed' => $group->where('attendance_status', 'completed')->count(),
                    'completion_rate' => $group->where('attendance_status', 'completed')->count() / max($group->count(), 1) * 100,
                    'average_score' => $group->whereNotNull('assessment_score')->avg('assessment_score'),
                ];
            })->values()->toArray();
    }

    private function generateAttendanceByRole($attendances): array
    {
        return $attendances->groupBy('user_role')
            ->map(function ($group, $role) {
                return [
                    'role' => $role,
                    'total_participants' => $group->count(),
                    'completion_rate' => $group->where('attendance_status', 'completed')->count() / max($group->count(), 1) * 100,
                ];
            })->values()->toArray();
    }
}
```

## Frontend Implementation

### Deployment Dashboard

```javascript
// Deployment and Go-Live Dashboard
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Progress,
  Alert,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  Form,
  Input,
  Textarea,
} from '@/components/ui';

const DeploymentDashboard = () => {
  const [deployments, setDeployments] = useState([]);
  const [goLiveChecklist, setGoLiveChecklist] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [trainingProgress, setTrainingProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedEnvironment]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [deploymentsRes, checklistRes, ticketsRes, trainingRes] = await Promise.all([
        fetch(`/api/admin/deployments?environment=${selectedEnvironment}`),
        fetch(`/api/admin/golive/checklist?environment=${selectedEnvironment}`),
        fetch('/api/admin/support/tickets?status=open'),
        fetch('/api/admin/training/progress')
      ]);

      const deploymentsData = await deploymentsRes.json();
      const checklistData = await checklistRes.json();
      const ticketsData = await ticketsRes.json();
      const trainingData = await trainingRes.json();

      setDeployments(deploymentsData.deployments);
      setGoLiveChecklist(checklistData.checklist);
      setSupportTickets(ticketsData.tickets);
      setTrainingProgress(trainingData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rolled_back: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleInitiateDeployment = async (deploymentConfig) => {
    try {
      const response = await fetch('/api/admin/deployments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deploymentConfig),
      });

      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to initiate deployment:', error);
    }
  };

  const calculateGoLiveProgress = () => {
    const totalItems = goLiveChecklist.length;
    const completedItems = goLiveChecklist.filter(item => item.status === 'completed').length;
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
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
        <h1 className="text-3xl font-bold text-gray-900">Deployment & Go-Live Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </Select>
          <Button onClick={() => setIsDeployModalOpen(true)}>
            New Deployment
          </Button>
        </div>
      </div>

      {/* Go-Live Progress Overview */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Go-Live Progress</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">
                {goLiveChecklist.filter(item => item.status === 'completed').length} / {goLiveChecklist.length} completed
              </span>
            </div>
            <Progress value={calculateGoLiveProgress()} className="w-full" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
              {['infrastructure', 'security', 'performance', 'monitoring', 'training', 'documentation'].map(category => {
                const categoryItems = goLiveChecklist.filter(item => item.milestone_category === category);
                const completedItems = categoryItems.filter(item => item.status === 'completed');
                const progress = categoryItems.length > 0 ? (completedItems.length / categoryItems.length) * 100 : 0;
                
                return (
                  <div key={category} className="text-center">
                    <div className="text-sm font-medium capitalize mb-1">{category}</div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-gray-600 mt-1">{Math.round(progress)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="deployments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="checklist">Go-Live Checklist</TabsTrigger>
          <TabsTrigger value="training">Training Progress</TabsTrigger>
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Recent Deployments</h2>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deployment ID</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deployed By</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deployments.map((deployment) => (
                    <TableRow key={deployment.id}>
                      <TableCell className="font-medium">{deployment.deployment_id}</TableCell>
                      <TableCell>{deployment.version}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{deployment.deployment_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(deployment.status)}>
                          {deployment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{deployment.deployed_by}</TableCell>
                      <TableCell>{new Date(deployment.started_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                          {deployment.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              Rollback
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist">
          <GoLiveChecklistComponent 
            checklist={goLiveChecklist}
            onUpdate={fetchDashboardData}
          />
        </TabsContent>

        <TabsContent value="training">
          <TrainingProgressComponent 
            trainingData={trainingProgress}
            onUpdate={fetchDashboardData}
          />
        </TabsContent>

        <TabsContent value="support">
          <SupportTicketsComponent 
            tickets={supportTickets}
            onUpdate={fetchDashboardData}
          />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeBaseComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Go-Live Checklist Component
const GoLiveChecklistComponent = ({ checklist, onUpdate }) => {
  const [filter, setFilter] = useState('all');

  const filteredChecklist = checklist.filter(item => {
    if (filter === 'all') return true;
    return item.milestone_category === filter;
  });

  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      await fetch(`/api/admin/golive/checklist/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      onUpdate();
    } catch (error) {
      console.error('Failed to update checklist item:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Go-Live Checklist</h2>
          <Select value={filter} onValueChange={setFilter}>
            <option value="all">All Categories</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="security">Security</option>
            <option value="performance">Performance</option>
            <option value="monitoring">Monitoring</option>
            <option value="training">Training</option>
            <option value="documentation">Documentation</option>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredChecklist.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="capitalize">
                    {item.milestone_category}
                  </Badge>
                  <h3 className="font-medium">{item.milestone_name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Select 
                    value={item.status} 
                    onValueChange={(value) => handleStatusUpdate(item.id, value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                    <option value="skipped">Skipped</option>
                  </Select>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{item.milestone_description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Responsible: {item.responsible_team}</span>
                {item.completed_at && (
                  <span>Completed: {new Date(item.completed_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeploymentDashboard;
```

## Implementation Phases

### Phase 1: Infrastructure Deployment (2 days)
- **Day 1**: Container orchestration and environment setup
- **Day 2**: CI/CD pipeline configuration and testing

### Phase 2: Training and Documentation (2 days)
- **Day 3**: Training program creation and scheduling
- **Day 4**: Documentation and knowledge base setup

### Phase 3: Go-Live Preparation (1 day)
- **Day 5**: Go-live checklist completion and verification

### Phase 4: Launch and Support (1 day)
- **Day 6**: Production deployment and 24/7 support activation

## Quality Assurance

### Testing Requirements
1. **Deployment Testing**
   - Blue-green deployment validation
   - Rollback procedure testing
   - Health check verification
   - Performance impact assessment

2. **Training Validation**
   - Training content accuracy
   - Assessment effectiveness
   - User feedback collection
   - Knowledge retention testing

### Security Requirements
1. **Production Security**
   - SSL/TLS implementation
   - Access control verification
   - Security monitoring activation
   - Compliance validation

## Success Metrics

### Technical Metrics
- Zero-downtime deployment: 100%
- Rollback time: <5 minutes
- Health check accuracy: 99.9%
- Training completion rate: >90%

### Business Metrics
- User adoption rate: >80%
- Support ticket resolution: <4 hours
- System availability: 99.9%
- User satisfaction: >4.5/5

## Risk Mitigation

### Deployment Risks
1. **Production Issues**
   - Mitigation: Comprehensive testing and staging
   - Fallback: Automated rollback procedures

2. **User Adoption**
   - Mitigation: Comprehensive training programs
   - Fallback: Extended support periods

---

**Estimated Timeline**: 6 days
**Priority**: Critical
**Dependencies**: All previous phases
**Team**: DevOps Engineer, Training Coordinator, Support Manager, QA Engineer
