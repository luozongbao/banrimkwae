# Issue #08: Guest Services & Concierge Features

## Overview
Develop a comprehensive mobile guest services and concierge system for the Banrimkwae Resort mobile application, providing 24/7 digital concierge services, service requests, local recommendations, and personalized guest assistance directly through mobile devices.

## Priority
**High** - Core guest experience and service differentiation

## Estimated Timeline
**5 days** (Week 5 of Phase 6)

## Requirements

### 10.1 Staff Authentication & Role Management
- **Secure Login**: Multi-factor authentication with biometric support
- **Role-Based Access**: Department-specific features and permissions
- **Shift Management**: Clock in/out, break tracking, and schedule viewing
- **Staff Directory**: Internal contact directory with role information
- **Emergency Protocols**: Quick access to emergency procedures and contacts

### 10.2 Task & Service Management
- **Task Assignment**: Receive and manage assigned tasks from supervisors
- **Service Requests**: Handle guest service requests with priority management
- **Work Orders**: Maintenance and repair request management
- **Quality Checklists**: Digital checklists for routine inspections
- **Status Updates**: Real-time progress reporting and task completion

### 10.3 Guest Interaction Tools
- **Guest Profiles**: Quick access to guest information and preferences
- **Service History**: Track guest interaction history and notes
- **Communication Hub**: Direct messaging with guests and departments
- **Special Requests**: Handle VIP guests and special occasion services
- **Incident Reporting**: Report and track guest-related incidents

### 10.4 Operational Coordination
- **Inter-Department Communication**: Real-time messaging between departments
- **Resource Management**: Equipment and supply tracking
- **Handover Notes**: Shift handover documentation and notes
- **Performance Metrics**: Personal and department performance tracking
- **Training Materials**: Access to training videos and procedures

## Technical Specifications

### 10.5 Database Schema

#### Staff Mobile Operations Tables
```sql
-- Staff mobile sessions and authentication
CREATE TABLE staff_mobile_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_uuid VARCHAR(36) UNIQUE NOT NULL,
    staff_id BIGINT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    device_info JSON,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    session_status ENUM('active', 'inactive', 'expired', 'revoked') DEFAULT 'active',
    ip_address VARCHAR(45),
    location_data JSON,
    biometric_verified BOOLEAN DEFAULT FALSE,
    mfa_verified BOOLEAN DEFAULT FALSE,
    security_level ENUM('basic', 'standard', 'high', 'critical') DEFAULT 'standard',
    INDEX idx_staff_active (staff_id, session_status),
    INDEX idx_device_session (device_id, session_status),
    INDEX idx_session_uuid (session_uuid),
    FOREIGN KEY (staff_id) REFERENCES staff_members(id) ON DELETE CASCADE
);

-- Staff task management
CREATE TABLE staff_mobile_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_uuid VARCHAR(36) UNIQUE NOT NULL,
    assigned_to_staff_id BIGINT NOT NULL,
    assigned_by_staff_id BIGINT,
    department_id BIGINT,
    task_category ENUM('guest_service', 'maintenance', 'housekeeping', 'admin', 'emergency', 'training') NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    task_title VARCHAR(200) NOT NULL,
    task_description TEXT,
    priority_level ENUM('low', 'medium', 'high', 'urgent', 'emergency') DEFAULT 'medium',
    estimated_duration_minutes INT,
    actual_duration_minutes INT,
    location VARCHAR(200),
    room_number VARCHAR(20),
    guest_id BIGINT,
    service_request_id BIGINT,
    related_task_ids JSON,
    task_status ENUM('pending', 'assigned', 'in_progress', 'paused', 'completed', 'cancelled', 'escalated') DEFAULT 'assigned',
    due_date TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    quality_rating TINYINT,
    completion_notes TEXT,
    equipment_needed JSON,
    skills_required JSON,
    safety_requirements TEXT,
    photos_before JSON,
    photos_after JSON,
    guest_feedback_rating TINYINT,
    guest_feedback_notes TEXT,
    supervisor_approved BOOLEAN DEFAULT FALSE,
    billing_category VARCHAR(50),
    cost_center VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_assigned_staff (assigned_to_staff_id, task_status),
    INDEX idx_department_priority (department_id, priority_level),
    INDEX idx_due_date (due_date),
    INDEX idx_guest_tasks (guest_id),
    INDEX idx_service_request (service_request_id),
    INDEX idx_task_status (task_status),
    FOREIGN KEY (assigned_to_staff_id) REFERENCES staff_members(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by_staff_id) REFERENCES staff_members(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL,
    FOREIGN KEY (service_request_id) REFERENCES mobile_service_requests(id) ON DELETE SET NULL
);

-- Staff shift and time tracking
CREATE TABLE staff_mobile_shifts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shift_uuid VARCHAR(36) UNIQUE NOT NULL,
    staff_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    shift_date DATE NOT NULL,
    scheduled_start_time TIME NOT NULL,
    scheduled_end_time TIME NOT NULL,
    actual_start_time TIME,
    actual_end_time TIME,
    clock_in_location JSON,
    clock_out_location JSON,
    clock_in_method ENUM('manual', 'biometric', 'qr_code', 'nfc') DEFAULT 'manual',
    clock_out_method ENUM('manual', 'biometric', 'qr_code', 'nfc') DEFAULT 'manual',
    total_hours_worked DECIMAL(4,2),
    break_time_minutes INT DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0.00,
    shift_status ENUM('scheduled', 'started', 'on_break', 'completed', 'missed', 'partial') DEFAULT 'scheduled',
    performance_rating DECIMAL(3,2),
    supervisor_notes TEXT,
    staff_notes TEXT,
    tasks_completed INT DEFAULT 0,
    tasks_assigned INT DEFAULT 0,
    guest_interactions INT DEFAULT 0,
    incidents_reported INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_staff_date (staff_id, shift_date),
    INDEX idx_department_date (department_id, shift_date),
    INDEX idx_shift_status (shift_status),
    INDEX idx_shift_uuid (shift_uuid),
    FOREIGN KEY (staff_id) REFERENCES staff_members(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Staff communication and messaging
CREATE TABLE staff_mobile_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    message_uuid VARCHAR(36) UNIQUE NOT NULL,
    sender_staff_id BIGINT NOT NULL,
    recipient_type ENUM('individual', 'department', 'role', 'broadcast') NOT NULL,
    recipient_staff_id BIGINT,
    recipient_department_id BIGINT,
    recipient_role VARCHAR(100),
    message_type ENUM('text', 'voice', 'image', 'video', 'file', 'alert', 'announcement') DEFAULT 'text',
    subject VARCHAR(200),
    message_content TEXT,
    media_urls JSON,
    priority_level ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_emergency BOOLEAN DEFAULT FALSE,
    delivery_status ENUM('sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
    read_by_recipients JSON,
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    acknowledgments JSON,
    expires_at TIMESTAMP,
    related_task_id BIGINT,
    related_incident_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sender_messages (sender_staff_id, created_at),
    INDEX idx_recipient_individual (recipient_staff_id, delivery_status),
    INDEX idx_recipient_department (recipient_department_id, delivery_status),
    INDEX idx_priority_emergency (priority_level, is_emergency),
    INDEX idx_message_uuid (message_uuid),
    FOREIGN KEY (sender_staff_id) REFERENCES staff_members(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_staff_id) REFERENCES staff_members(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (related_task_id) REFERENCES staff_mobile_tasks(id) ON DELETE SET NULL
);

-- Guest interaction tracking
CREATE TABLE staff_guest_interactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    interaction_uuid VARCHAR(36) UNIQUE NOT NULL,
    staff_id BIGINT NOT NULL,
    guest_id BIGINT NOT NULL,
    guest_stay_id BIGINT,
    interaction_type ENUM('service_delivery', 'complaint_resolution', 'information_request', 'special_assistance', 'emergency_response') NOT NULL,
    interaction_category VARCHAR(100),
    interaction_location VARCHAR(200),
    interaction_duration_minutes INT,
    guest_mood_before ENUM('very_unhappy', 'unhappy', 'neutral', 'happy', 'very_happy'),
    guest_mood_after ENUM('very_unhappy', 'unhappy', 'neutral', 'happy', 'very_happy'),
    service_provided TEXT,
    resolution_provided TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP,
    follow_up_notes TEXT,
    guest_feedback_immediate TEXT,
    guest_rating TINYINT,
    staff_notes TEXT,
    supervisor_review_required BOOLEAN DEFAULT FALSE,
    supervisor_reviewed BOOLEAN DEFAULT FALSE,
    supervisor_comments TEXT,
    language_used VARCHAR(50) DEFAULT 'English',
    cultural_considerations TEXT,
    upsell_opportunities JSON,
    preferences_learned JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_staff_interactions (staff_id, created_at),
    INDEX idx_guest_interactions (guest_id, created_at),
    INDEX idx_guest_stay (guest_stay_id),
    INDEX idx_follow_up (follow_up_required, follow_up_date),
    INDEX idx_supervisor_review (supervisor_review_required),
    FOREIGN KEY (staff_id) REFERENCES staff_members(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_stay_id) REFERENCES guest_stays(id) ON DELETE SET NULL
);

-- Incident reporting and management
CREATE TABLE staff_incident_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    incident_uuid VARCHAR(36) UNIQUE NOT NULL,
    reported_by_staff_id BIGINT NOT NULL,
    department_id BIGINT,
    incident_category ENUM('safety', 'security', 'guest_complaint', 'equipment_failure', 'policy_violation', 'emergency', 'other') NOT NULL,
    incident_severity ENUM('minor', 'moderate', 'major', 'critical') DEFAULT 'minor',
    incident_title VARCHAR(200) NOT NULL,
    incident_description TEXT NOT NULL,
    incident_location VARCHAR(200),
    incident_date_time TIMESTAMP NOT NULL,
    guests_involved JSON,
    staff_involved JSON,
    witnesses JSON,
    immediate_actions_taken TEXT,
    photos_evidence JSON,
    video_evidence JSON,
    injury_occurred BOOLEAN DEFAULT FALSE,
    medical_attention_required BOOLEAN DEFAULT FALSE,
    emergency_services_called BOOLEAN DEFAULT FALSE,
    authorities_notified BOOLEAN DEFAULT FALSE,
    insurance_claim_required BOOLEAN DEFAULT FALSE,
    guest_compensation_required BOOLEAN DEFAULT FALSE,
    incident_status ENUM('reported', 'investigating', 'resolved', 'escalated', 'closed') DEFAULT 'reported',
    assigned_investigator_id BIGINT,
    investigation_notes TEXT,
    resolution_actions TEXT,
    prevention_measures TEXT,
    lessons_learned TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP,
    supervisor_notified BOOLEAN DEFAULT FALSE,
    management_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reported_by (reported_by_staff_id, created_at),
    INDEX idx_department_category (department_id, incident_category),
    INDEX idx_severity_status (incident_severity, incident_status),
    INDEX idx_incident_date (incident_date_time),
    INDEX idx_follow_up (follow_up_required, follow_up_date),
    FOREIGN KEY (reported_by_staff_id) REFERENCES staff_members(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_investigator_id) REFERENCES staff_members(id) ON DELETE SET NULL
);

-- Staff performance metrics
CREATE TABLE staff_mobile_performance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    staff_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    metric_date DATE NOT NULL,
    metric_period ENUM('daily', 'weekly', 'monthly') DEFAULT 'daily',
    tasks_completed INT DEFAULT 0,
    tasks_assigned INT DEFAULT 0,
    task_completion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_task_completion_time_minutes DECIMAL(8,2) DEFAULT 0.00,
    guest_interactions INT DEFAULT 0,
    positive_guest_feedback INT DEFAULT 0,
    negative_guest_feedback INT DEFAULT 0,
    guest_satisfaction_rating DECIMAL(3,2) DEFAULT 0.00,
    punctuality_score DECIMAL(3,2) DEFAULT 0.00,
    attendance_rate DECIMAL(5,2) DEFAULT 0.00,
    overtime_hours DECIMAL(6,2) DEFAULT 0.00,
    incidents_reported INT DEFAULT 0,
    safety_violations INT DEFAULT 0,
    upsell_amount DECIMAL(10,2) DEFAULT 0.00,
    training_hours_completed DECIMAL(6,2) DEFAULT 0.00,
    peer_feedback_rating DECIMAL(3,2) DEFAULT 0.00,
    supervisor_rating DECIMAL(3,2) DEFAULT 0.00,
    overall_performance_score DECIMAL(5,2) DEFAULT 0.00,
    improvement_areas JSON,
    achievements JSON,
    goals_for_next_period JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_staff_performance (staff_id, metric_date),
    INDEX idx_department_performance (department_id, metric_date),
    INDEX idx_performance_score (overall_performance_score),
    INDEX idx_metric_period (metric_period, metric_date),
    FOREIGN KEY (staff_id) REFERENCES staff_members(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Equipment and resource tracking
CREATE TABLE staff_equipment_tracking (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tracking_uuid VARCHAR(36) UNIQUE NOT NULL,
    staff_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,
    department_id BIGINT,
    action_type ENUM('checkout', 'checkin', 'maintenance', 'repair', 'damaged', 'lost') NOT NULL,
    checkout_time TIMESTAMP,
    expected_return_time TIMESTAMP,
    actual_return_time TIMESTAMP,
    condition_checkout ENUM('excellent', 'good', 'fair', 'poor', 'damaged') DEFAULT 'good',
    condition_return ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
    location_used VARCHAR(200),
    purpose_of_use TEXT,
    issues_reported TEXT,
    maintenance_required BOOLEAN DEFAULT FALSE,
    photos_checkout JSON,
    photos_return JSON,
    supervisor_approval_required BOOLEAN DEFAULT FALSE,
    supervisor_approved BOOLEAN DEFAULT FALSE,
    cost_charged DECIMAL(8,2) DEFAULT 0.00,
    insurance_claim BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_staff_equipment (staff_id, action_type),
    INDEX idx_equipment_tracking (equipment_id, action_type),
    INDEX idx_department_equipment (department_id, action_type),
    INDEX idx_checkout_time (checkout_time),
    INDEX idx_overdue (expected_return_time, actual_return_time),
    FOREIGN KEY (staff_id) REFERENCES staff_members(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment_inventory(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);
```

### 10.6 Backend Implementation (Laravel)

#### Staff Mobile Service
```php
<?php

namespace App\Services\Mobile;

use App\Models\StaffMobileSession;
use App\Models\StaffMobileTask;
use App\Models\StaffMobileShift;
use App\Models\StaffGuestInteraction;
use App\Models\StaffIncidentReport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class StaffMobileService
{
    public function authenticateStaff($credentials, $deviceInfo)
    {
        try {
            DB::beginTransaction();
            
            // Authenticate staff member
            $staff = $this->validateStaffCredentials($credentials);
            if (!$staff) {
                throw new \Exception('Invalid credentials');
            }
            
            // Check if staff has mobile app access
            if (!$staff->hasPermission('mobile_app_access')) {
                throw new \Exception('Mobile app access not authorized');
            }
            
            // Create mobile session
            $session = StaffMobileSession::create([
                'session_uuid' => Str::uuid(),
                'staff_id' => $staff->id,
                'device_id' => $deviceInfo['device_id'],
                'device_info' => $deviceInfo,
                'ip_address' => request()->ip(),
                'location_data' => $deviceInfo['location'] ?? null,
                'biometric_verified' => $credentials['biometric_verified'] ?? false,
                'mfa_verified' => $credentials['mfa_verified'] ?? false,
                'security_level' => $this->calculateSecurityLevel($staff, $credentials)
            ]);
            
            // Check for existing active shift
            $activeShift = $this->getActiveShift($staff->id);
            
            DB::commit();
            
            return [
                'session' => $session,
                'staff' => $staff->load(['department', 'roles', 'permissions']),
                'active_shift' => $activeShift,
                'pending_tasks' => $this->getPendingTasks($staff->id),
                'unread_messages' => $this->getUnreadMessages($staff->id)
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function clockIn($staffId, $locationData, $method = 'manual')
    {
        try {
            DB::beginTransaction();
            
            // Check for scheduled shift
            $scheduledShift = StaffMobileShift::where('staff_id', $staffId)
                ->where('shift_date', now()->toDateString())
                ->where('shift_status', 'scheduled')
                ->first();
            
            if (!$scheduledShift) {
                throw new \Exception('No scheduled shift found for today');
            }
            
            // Update shift with clock-in information
            $scheduledShift->update([
                'actual_start_time' => now()->format('H:i:s'),
                'clock_in_location' => $locationData,
                'clock_in_method' => $method,
                'shift_status' => 'started'
            ]);
            
            // Log the clock-in event
            $this->logStaffActivity($staffId, 'clock_in', [
                'shift_id' => $scheduledShift->id,
                'location' => $locationData,
                'method' => $method
            ]);
            
            DB::commit();
            
            return $scheduledShift->fresh();
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function assignTask($taskData, $assignedBy)
    {
        try {
            DB::beginTransaction();
            
            $task = StaffMobileTask::create([
                'task_uuid' => Str::uuid(),
                'assigned_to_staff_id' => $taskData['assigned_to'],
                'assigned_by_staff_id' => $assignedBy,
                'department_id' => $taskData['department_id'] ?? null,
                'task_category' => $taskData['category'],
                'task_type' => $taskData['type'],
                'task_title' => $taskData['title'],
                'task_description' => $taskData['description'] ?? null,
                'priority_level' => $taskData['priority'] ?? 'medium',
                'estimated_duration_minutes' => $taskData['estimated_duration'] ?? null,
                'location' => $taskData['location'] ?? null,
                'room_number' => $taskData['room_number'] ?? null,
                'guest_id' => $taskData['guest_id'] ?? null,
                'service_request_id' => $taskData['service_request_id'] ?? null,
                'due_date' => $taskData['due_date'] ?? null,
                'equipment_needed' => $taskData['equipment_needed'] ?? null,
                'skills_required' => $taskData['skills_required'] ?? null,
                'safety_requirements' => $taskData['safety_requirements'] ?? null
            ]);
            
            // Send notification to assigned staff
            $this->sendTaskNotification($task);
            
            // Update related service request if applicable
            if (isset($taskData['service_request_id'])) {
                $this->updateServiceRequestStatus($taskData['service_request_id'], 'assigned');
            }
            
            DB::commit();
            
            return $task->load(['assignedTo', 'assignedBy', 'guest']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function updateTaskStatus($taskId, $staffId, $statusData)
    {
        try {
            DB::beginTransaction();
            
            $task = StaffMobileTask::where('id', $taskId)
                ->where('assigned_to_staff_id', $staffId)
                ->firstOrFail();
            
            $updateData = [
                'task_status' => $statusData['status'],
                'updated_at' => now()
            ];
            
            switch ($statusData['status']) {
                case 'in_progress':
                    $updateData['started_at'] = now();
                    break;
                    
                case 'completed':
                    $updateData['completed_at'] = now();
                    $updateData['completion_notes'] = $statusData['completion_notes'] ?? null;
                    $updateData['photos_after'] = $statusData['photos_after'] ?? null;
                    $updateData['actual_duration_minutes'] = $this->calculateActualDuration($task);
                    break;
                    
                case 'paused':
                    $updateData['completion_notes'] = $statusData['pause_reason'] ?? null;
                    break;
            }
            
            $task->update($updateData);
            
            // Update related service request
            if ($task->service_request_id) {
                $this->updateServiceRequestFromTask($task);
            }
            
            // Notify supervisors if task is completed
            if ($statusData['status'] === 'completed') {
                $this->notifyTaskCompletion($task);
            }
            
            DB::commit();
            
            return $task->fresh();
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function recordGuestInteraction($staffId, $interactionData)
    {
        try {
            DB::beginTransaction();
            
            $interaction = StaffGuestInteraction::create([
                'interaction_uuid' => Str::uuid(),
                'staff_id' => $staffId,
                'guest_id' => $interactionData['guest_id'],
                'guest_stay_id' => $interactionData['guest_stay_id'] ?? null,
                'interaction_type' => $interactionData['type'],
                'interaction_category' => $interactionData['category'] ?? null,
                'interaction_location' => $interactionData['location'] ?? null,
                'interaction_duration_minutes' => $interactionData['duration'] ?? null,
                'guest_mood_before' => $interactionData['mood_before'] ?? null,
                'guest_mood_after' => $interactionData['mood_after'] ?? null,
                'service_provided' => $interactionData['service_provided'] ?? null,
                'resolution_provided' => $interactionData['resolution'] ?? null,
                'follow_up_required' => $interactionData['follow_up_required'] ?? false,
                'follow_up_date' => $interactionData['follow_up_date'] ?? null,
                'guest_feedback_immediate' => $interactionData['guest_feedback'] ?? null,
                'guest_rating' => $interactionData['guest_rating'] ?? null,
                'staff_notes' => $interactionData['staff_notes'] ?? null,
                'language_used' => $interactionData['language_used'] ?? 'English',
                'cultural_considerations' => $interactionData['cultural_considerations'] ?? null,
                'upsell_opportunities' => $interactionData['upsell_opportunities'] ?? null,
                'preferences_learned' => $interactionData['preferences_learned'] ?? null
            ]);
            
            // Update guest preferences if learned
            if (isset($interactionData['preferences_learned'])) {
                $this->updateGuestPreferences($interactionData['guest_id'], $interactionData['preferences_learned']);
            }
            
            // Track performance metrics
            $this->updateStaffPerformanceMetrics($staffId, 'guest_interaction', $interaction);
            
            DB::commit();
            
            return $interaction;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function reportIncident($staffId, $incidentData)
    {
        try {
            DB::beginTransaction();
            
            $incident = StaffIncidentReport::create([
                'incident_uuid' => Str::uuid(),
                'reported_by_staff_id' => $staffId,
                'department_id' => $incidentData['department_id'] ?? null,
                'incident_category' => $incidentData['category'],
                'incident_severity' => $incidentData['severity'] ?? 'minor',
                'incident_title' => $incidentData['title'],
                'incident_description' => $incidentData['description'],
                'incident_location' => $incidentData['location'] ?? null,
                'incident_date_time' => $incidentData['date_time'] ?? now(),
                'guests_involved' => $incidentData['guests_involved'] ?? null,
                'staff_involved' => $incidentData['staff_involved'] ?? null,
                'witnesses' => $incidentData['witnesses'] ?? null,
                'immediate_actions_taken' => $incidentData['immediate_actions'] ?? null,
                'photos_evidence' => $incidentData['photos'] ?? null,
                'injury_occurred' => $incidentData['injury_occurred'] ?? false,
                'medical_attention_required' => $incidentData['medical_attention'] ?? false,
                'emergency_services_called' => $incidentData['emergency_services'] ?? false
            ]);
            
            // Auto-assign based on severity and category
            $investigator = $this->assignIncidentInvestigator($incident);
            if ($investigator) {
                $incident->update(['assigned_investigator_id' => $investigator->id]);
            }
            
            // Send notifications based on severity
            $this->sendIncidentNotifications($incident);
            
            DB::commit();
            
            return $incident;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    public function getStaffDashboard($staffId)
    {
        $staff = StaffMember::with(['department', 'currentShift'])->findOrFail($staffId);
        
        return [
            'staff_info' => $staff,
            'current_shift' => $this->getCurrentShiftInfo($staffId),
            'pending_tasks' => $this->getPendingTasks($staffId),
            'recent_messages' => $this->getRecentMessages($staffId),
            'today_performance' => $this->getTodayPerformance($staffId),
            'upcoming_schedule' => $this->getUpcomingSchedule($staffId),
            'department_announcements' => $this->getDepartmentAnnouncements($staff->department_id),
            'training_due' => $this->getTrainingDue($staffId),
            'equipment_checked_out' => $this->getCheckedOutEquipment($staffId)
        ];
    }
    
    public function sendStaffMessage($senderId, $messageData)
    {
        try {
            DB::beginTransaction();
            
            $message = StaffMobileMessage::create([
                'message_uuid' => Str::uuid(),
                'sender_staff_id' => $senderId,
                'recipient_type' => $messageData['recipient_type'],
                'recipient_staff_id' => $messageData['recipient_staff_id'] ?? null,
                'recipient_department_id' => $messageData['recipient_department_id'] ?? null,
                'recipient_role' => $messageData['recipient_role'] ?? null,
                'message_type' => $messageData['type'] ?? 'text',
                'subject' => $messageData['subject'] ?? null,
                'message_content' => $messageData['content'],
                'media_urls' => $messageData['media_urls'] ?? null,
                'priority_level' => $messageData['priority'] ?? 'medium',
                'is_emergency' => $messageData['is_emergency'] ?? false,
                'requires_acknowledgment' => $messageData['requires_acknowledgment'] ?? false,
                'expires_at' => $messageData['expires_at'] ?? null,
                'related_task_id' => $messageData['related_task_id'] ?? null
            ]);
            
            // Send real-time notifications
            $this->sendRealTimeNotifications($message);
            
            DB::commit();
            
            return $message;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    private function calculateSecurityLevel($staff, $credentials)
    {
        $level = 'standard';
        
        if ($credentials['biometric_verified'] && $credentials['mfa_verified']) {
            $level = 'high';
        }
        
        if ($staff->hasRole(['manager', 'supervisor', 'security'])) {
            $level = 'critical';
        }
        
        return $level;
    }
    
    private function calculateActualDuration($task)
    {
        if ($task->started_at) {
            return now()->diffInMinutes($task->started_at);
        }
        
        return null;
    }
    
    private function updateStaffPerformanceMetrics($staffId, $metricType, $data)
    {
        // Implementation for updating daily performance metrics
    }
    
    private function sendTaskNotification($task)
    {
        // Implementation for sending task notifications
    }
    
    private function sendIncidentNotifications($incident)
    {
        // Implementation for sending incident notifications based on severity
    }
}
```

### 10.7 Flutter Implementation

#### Staff Dashboard
```dart
// lib/features/staff/presentation/pages/staff_dashboard_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/staff_bloc.dart';
import '../widgets/shift_status_card.dart';
import '../widgets/task_summary_card.dart';
import '../widgets/performance_metrics_card.dart';
import '../widgets/quick_actions_grid.dart';

class StaffDashboardPage extends StatefulWidget {
  @override
  _StaffDashboardPageState createState() => _StaffDashboardPageState();
}

class _StaffDashboardPageState extends State<StaffDashboardPage> {
  @override
  void initState() {
    super.initState();
    context.read<StaffBloc>().add(LoadStaffDashboard());
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: BlocBuilder<StaffBloc, StaffState>(
          builder: (context, state) {
            if (state is StaffDashboardLoaded) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Welcome back'),
                  Text(
                    state.staffInfo.name,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              );
            }
            return Text('Staff Portal');
          },
        ),
        actions: [
          IconButton(
            icon: Badge(
              label: BlocBuilder<StaffBloc, StaffState>(
                builder: (context, state) {
                  if (state is StaffDashboardLoaded) {
                    return Text('${state.recentMessages.length}');
                  }
                  return Text('0');
                },
              ),
              child: Icon(Icons.message),
            ),
            onPressed: () => Navigator.pushNamed(context, '/staff/messages'),
          ),
          IconButton(
            icon: Icon(Icons.settings),
            onPressed: () => Navigator.pushNamed(context, '/staff/settings'),
          ),
        ],
      ),
      body: BlocBuilder<StaffBloc, StaffState>(
        builder: (context, state) {
          if (state is StaffLoading) {
            return Center(child: CircularProgressIndicator());
          } else if (state is StaffDashboardLoaded) {
            return RefreshIndicator(
              onRefresh: () async {
                context.read<StaffBloc>().add(RefreshDashboard());
              },
              child: _buildDashboardContent(state),
            );
          } else if (state is StaffError) {
            return _buildErrorState(state.message);
          }
          return Container();
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showQuickActionSheet(),
        child: Icon(Icons.add),
        tooltip: 'Quick Actions',
      ),
    );
  }
  
  Widget _buildDashboardContent(StaffDashboardLoaded state) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildShiftStatus(state.currentShift),
          SizedBox(height: 16),
          _buildQuickActionsGrid(),
          SizedBox(height: 16),
          _buildTaskSummary(state.pendingTasks),
          SizedBox(height: 16),
          _buildPerformanceMetrics(state.todayPerformance),
          SizedBox(height: 16),
          _buildRecentMessages(state.recentMessages),
          SizedBox(height: 16),
          _buildDepartmentAnnouncements(state.departmentAnnouncements),
        ],
      ),
    );
  }
  
  Widget _buildShiftStatus(StaffShift? currentShift) {
    return ShiftStatusCard(
      shift: currentShift,
      onClockIn: () => _handleClockIn(),
      onClockOut: () => _handleClockOut(),
      onBreakStart: () => _handleBreakStart(),
      onBreakEnd: () => _handleBreakEnd(),
    );
  }
  
  Widget _buildQuickActionsGrid() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Quick Actions',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: 12),
            QuickActionsGrid(
              actions: [
                QuickAction(
                  icon: Icons.assignment,
                  label: 'My Tasks',
                  onTap: () => Navigator.pushNamed(context, '/staff/tasks'),
                ),
                QuickAction(
                  icon: Icons.people,
                  label: 'Guest Info',
                  onTap: () => Navigator.pushNamed(context, '/staff/guests'),
                ),
                QuickAction(
                  icon: Icons.report_problem,
                  label: 'Report Issue',
                  onTap: () => _reportIncident(),
                ),
                QuickAction(
                  icon: Icons.inventory,
                  label: 'Equipment',
                  onTap: () => Navigator.pushNamed(context, '/staff/equipment'),
                ),
                QuickAction(
                  icon: Icons.message,
                  label: 'Messages',
                  onTap: () => Navigator.pushNamed(context, '/staff/messages'),
                ),
                QuickAction(
                  icon: Icons.schedule,
                  label: 'Schedule',
                  onTap: () => Navigator.pushNamed(context, '/staff/schedule'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildTaskSummary(List<StaffTask> pendingTasks) {
    return TaskSummaryCard(
      pendingTasks: pendingTasks,
      onViewAllTasks: () => Navigator.pushNamed(context, '/staff/tasks'),
      onTaskTap: (task) => _navigateToTaskDetails(task),
    );
  }
  
  void _handleClockIn() {
    showDialog(
      context: context,
      builder: (context) => ClockInDialog(
        onClockIn: (method, location) {
          context.read<StaffBloc>().add(ClockIn(
            method: method,
            location: location,
          ));
        },
      ),
    );
  }
  
  void _reportIncident() {
    Navigator.pushNamed(context, '/staff/incident-report');
  }
  
  void _navigateToTaskDetails(StaffTask task) {
    Navigator.pushNamed(
      context,
      '/staff/task-details',
      arguments: task,
    );
  }
}
```

#### Task Management Screen
```dart
// lib/features/staff/presentation/pages/task_management_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/task_bloc.dart';
import '../widgets/task_card.dart';
import '../widgets/task_filter_chips.dart';

class TaskManagementPage extends StatefulWidget {
  @override
  _TaskManagementPageState createState() => _TaskManagementPageState();
}

class _TaskManagementPageState extends State<TaskManagementPage>
    with TickerProviderStateMixin {
  late TabController _tabController;
  String _selectedFilter = 'all';
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    context.read<TaskBloc>().add(LoadStaffTasks());
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('My Tasks'),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: 'Pending'),
            Tab(text: 'In Progress'),
            Tab(text: 'Completed'),
            Tab(text: 'All'),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list),
            onPressed: () => _showFilterOptions(),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilterChips(),
          Expanded(
            child: BlocBuilder<TaskBloc, TaskState>(
              builder: (context, state) {
                if (state is TaskLoading) {
                  return Center(child: CircularProgressIndicator());
                } else if (state is TaskLoaded) {
                  return _buildTaskTabView(state);
                } else if (state is TaskError) {
                  return _buildErrorState(state.message);
                }
                return Container();
              },
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildFilterChips() {
    return Container(
      height: 60,
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: TaskFilterChips(
        selectedFilter: _selectedFilter,
        onFilterChanged: (filter) {
          setState(() {
            _selectedFilter = filter;
          });
          context.read<TaskBloc>().add(FilterTasks(filter));
        },
      ),
    );
  }
  
  Widget _buildTaskTabView(TaskLoaded state) {
    return TabBarView(
      controller: _tabController,
      children: [
        _buildTaskList(state.pendingTasks),
        _buildTaskList(state.inProgressTasks),
        _buildTaskList(state.completedTasks),
        _buildTaskList(state.allTasks),
      ],
    );
  }
  
  Widget _buildTaskList(List<StaffTask> tasks) {
    if (tasks.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.task_alt,
              size: 64,
              color: Colors.grey[400],
            ),
            SizedBox(height: 16),
            Text(
              'No tasks found',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      );
    }
    
    return RefreshIndicator(
      onRefresh: () async {
        context.read<TaskBloc>().add(RefreshTasks());
      },
      child: ListView.builder(
        padding: EdgeInsets.all(16),
        itemCount: tasks.length,
        itemBuilder: (context, index) {
          return TaskCard(
            task: tasks[index],
            onTap: () => _navigateToTaskDetails(tasks[index]),
            onStatusUpdate: (status) => _updateTaskStatus(tasks[index], status),
            onStartTask: () => _startTask(tasks[index]),
            onCompleteTask: () => _completeTask(tasks[index]),
          );
        },
      ),
    );
  }
  
  void _navigateToTaskDetails(StaffTask task) {
    Navigator.pushNamed(
      context,
      '/staff/task-details',
      arguments: task,
    );
  }
  
  void _updateTaskStatus(StaffTask task, String status) {
    context.read<TaskBloc>().add(UpdateTaskStatus(
      taskId: task.id,
      status: status,
    ));
  }
  
  void _startTask(StaffTask task) {
    context.read<TaskBloc>().add(StartTask(task.id));
  }
  
  void _completeTask(StaffTask task) {
    Navigator.pushNamed(
      context,
      '/staff/task-completion',
      arguments: task,
    );
  }
}
```

## Implementation Phases

### Phase 1: Core Staff Authentication & Dashboard (Days 1-2)
- Secure staff authentication with multi-factor support
- Role-based access control and permissions
- Staff dashboard with shift and task overview
- Basic shift management and time tracking

### Phase 2: Task & Service Management (Days 3-4)
- Task assignment and tracking system
- Service request handling and workflow
- Real-time task status updates
- Performance metrics and reporting

### Phase 3: Communication & Coordination (Days 5)
- Inter-departmental messaging system
- Guest interaction tracking and notes
- Incident reporting and management
- Equipment and resource tracking

### Phase 4: Advanced Features & Integration (Day 6)
- Performance analytics and insights
- Training material access and tracking
- Advanced reporting and documentation
- Integration testing and optimization

## Quality Assurance

### Testing Requirements
- **Unit Tests**: Task management logic, performance calculations
- **Widget Tests**: All staff interface components and workflows
- **Integration Tests**: End-to-end staff operations and communication
- **Security Tests**: Role-based access and data protection
- **Performance Tests**: Real-time messaging and task synchronization

### Security Validation
- **Authentication Security**: Multi-factor authentication and biometric support
- **Role-Based Access**: Strict permission controls for sensitive operations
- **Data Protection**: Staff and guest information encryption
- **Audit Trails**: Complete logging of staff actions and decisions

## Success Metrics
- Staff login completion within 30 seconds
- Task assignment and updates in real-time
- 95% staff adoption rate within first month
- 90% improvement in inter-departmental communication
- 85% reduction in task completion time

## Risk Mitigation
- **Device Security**: Secure device enrollment and management
- **Data Synchronization**: Offline capability with sync when connected
- **Staff Training**: Comprehensive onboarding and training program
- **Performance Impact**: Optimized for various mobile device capabilities
- **System Reliability**: Robust error handling and fallback procedures

## Dependencies
- Staff management system from Phase 2
- Guest management and service request systems
- Department and role management systems
- Real-time communication infrastructure
- Equipment and resource tracking systems

## Deliverables
- Complete staff mobile application with role-based access
- Task assignment and management system with real-time updates
- Guest interaction tracking and service management tools
- Inter-departmental communication and messaging platform
- Incident reporting and management system
- Performance tracking and analytics dashboard
- Equipment and resource management integration
- Comprehensive staff training materials and documentation
