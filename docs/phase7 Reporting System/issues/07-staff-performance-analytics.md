# Issue #07: Staff Performance Analytics

**Priority:** Medium  
**Estimated Time:** 8-10 days  
**Dependencies:** Issues #01, #06  
**Assignee:** Backend Developer + Frontend Developer

## Overview
Implement comprehensive staff performance analytics system covering productivity metrics, attendance tracking, performance evaluations, training progress, and department-wise performance analysis.

## Requirements

### 1. Database Schema Extensions

#### 1.1 Staff Performance Tables
```sql
-- Staff performance metrics
CREATE TABLE staff_performance_metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT UNSIGNED NOT NULL,
    evaluation_period_start DATE NOT NULL,
    evaluation_period_end DATE NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL,
    -- Core metrics
    attendance_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    punctuality_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    productivity_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    quality_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    customer_service_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    teamwork_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    initiative_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    -- Overall
    overall_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    performance_grade ENUM('A', 'B', 'C', 'D', 'F') DEFAULT 'C',
    -- Goals and achievements
    goals_set INT DEFAULT 0,
    goals_achieved INT DEFAULT 0,
    goals_achievement_rate DECIMAL(5,2) DEFAULT 0,
    -- Feedback
    supervisor_comments TEXT,
    improvement_areas TEXT,
    strengths TEXT,
    evaluated_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluated_by) REFERENCES users(id),
    INDEX idx_staff_performance_staff (staff_id),
    INDEX idx_staff_performance_period (evaluation_period_start, evaluation_period_end),
    INDEX idx_staff_performance_department (department),
    INDEX idx_staff_performance_score (overall_score)
);

-- Attendance tracking
CREATE TABLE staff_attendance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    actual_clock_in TIME,
    actual_clock_out TIME,
    -- Calculated fields
    scheduled_hours DECIMAL(4,2) GENERATED ALWAYS AS (TIME_TO_SEC(TIMEDIFF(shift_end_time, shift_start_time)) / 3600) STORED,
    actual_hours DECIMAL(4,2),
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    break_minutes INT DEFAULT 0,
    -- Status
    attendance_status ENUM('present', 'absent', 'late', 'partial', 'leave') NOT NULL,
    late_minutes INT DEFAULT 0,
    early_departure_minutes INT DEFAULT 0,
    -- Leave details
    leave_type ENUM('sick', 'vacation', 'personal', 'emergency', 'unpaid') NULL,
    leave_approved BOOLEAN DEFAULT FALSE,
    leave_approved_by BIGINT UNSIGNED NULL,
    -- Notes
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_approved_by) REFERENCES users(id),
    UNIQUE KEY uk_staff_attendance_date (staff_id, date),
    INDEX idx_staff_attendance_date (date),
    INDEX idx_staff_attendance_status (attendance_status)
);

-- Task assignments and completion
CREATE TABLE staff_tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT UNSIGNED NOT NULL,
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_category ENUM('daily', 'weekly', 'monthly', 'project', 'training', 'maintenance') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    assigned_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completed_date DATE NULL,
    estimated_hours DECIMAL(4,2) NOT NULL,
    actual_hours DECIMAL(4,2) NULL,
    completion_status ENUM('pending', 'in_progress', 'completed', 'overdue', 'cancelled') NOT NULL DEFAULT 'pending',
    quality_rating DECIMAL(3,2) NULL, -- 0-10 scale
    assigned_by BIGINT UNSIGNED NOT NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_staff_tasks_staff (staff_id),
    INDEX idx_staff_tasks_status (completion_status),
    INDEX idx_staff_tasks_date (assigned_date, due_date),
    INDEX idx_staff_tasks_category (task_category)
);

-- Training and development tracking
CREATE TABLE staff_training (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT UNSIGNED NOT NULL,
    training_program_id BIGINT UNSIGNED NOT NULL,
    enrollment_date DATE NOT NULL,
    start_date DATE NOT NULL,
    expected_completion_date DATE NOT NULL,
    actual_completion_date DATE NULL,
    training_status ENUM('enrolled', 'in_progress', 'completed', 'failed', 'dropped') NOT NULL DEFAULT 'enrolled',
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    final_score DECIMAL(5,2) NULL,
    certification_earned BOOLEAN DEFAULT FALSE,
    certification_expiry_date DATE NULL,
    training_cost DECIMAL(10,2) DEFAULT 0,
    trainer_id BIGINT UNSIGNED NULL,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (training_program_id) REFERENCES training_programs(id),
    FOREIGN KEY (trainer_id) REFERENCES users(id),
    INDEX idx_staff_training_staff (staff_id),
    INDEX idx_staff_training_program (training_program_id),
    INDEX idx_staff_training_status (training_status),
    INDEX idx_staff_training_dates (start_date, expected_completion_date)
);

-- Customer feedback about staff
CREATE TABLE staff_customer_feedback (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT UNSIGNED NOT NULL,
    customer_id BIGINT UNSIGNED NULL,
    feedback_date DATE NOT NULL,
    service_type ENUM('accommodation', 'restaurant', 'activities', 'reception', 'maintenance', 'other') NOT NULL,
    rating DECIMAL(3,2) NOT NULL, -- 1-5 scale
    feedback_text TEXT,
    feedback_category ENUM('positive', 'neutral', 'negative') NOT NULL,
    response_provided BOOLEAN DEFAULT FALSE,
    response_text TEXT,
    responded_by BIGINT UNSIGNED NULL,
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (responded_by) REFERENCES users(id),
    INDEX idx_staff_feedback_staff (staff_id),
    INDEX idx_staff_feedback_date (feedback_date),
    INDEX idx_staff_feedback_rating (rating),
    INDEX idx_staff_feedback_category (feedback_category)
);

-- Department performance summary
CREATE TABLE department_performance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(50) NOT NULL,
    period_month CHAR(7) NOT NULL, -- YYYY-MM format
    total_staff INT DEFAULT 0,
    average_performance_score DECIMAL(5,2) DEFAULT 0,
    average_attendance_rate DECIMAL(5,2) DEFAULT 0,
    total_tasks_assigned INT DEFAULT 0,
    total_tasks_completed INT DEFAULT 0,
    task_completion_rate DECIMAL(5,2) DEFAULT 0,
    average_customer_rating DECIMAL(3,2) DEFAULT 0,
    total_training_hours DECIMAL(8,2) DEFAULT 0,
    total_overtime_hours DECIMAL(8,2) DEFAULT 0,
    staff_turnover_count INT DEFAULT 0,
    department_efficiency_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_department_performance_month (department, period_month),
    INDEX idx_department_performance_month (period_month),
    INDEX idx_department_performance_score (average_performance_score)
);
```

### 2. Backend Implementation

#### 2.1 Staff Analytics Service
```php
// app/Services/Reporting/StaffAnalyticsService.php
<?php

namespace App\Services\Reporting;

use App\Models\User;
use App\Models\StaffPerformanceMetric;
use App\Models\StaffAttendance;
use App\Models\StaffTask;
use App\Services\Reporting\BaseReportService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StaffAnalyticsService extends BaseReportService
{
    public function generatePerformanceReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subMonth();
        $endDate = $filters['end_date'] ?? now();
        $department = $filters['department'] ?? null;
        $performanceGrade = $filters['performance_grade'] ?? null;

        $query = DB::table('staff_performance_metrics as spm')
            ->join('users as u', 'spm.staff_id', '=', 'u.id')
            ->whereBetween('spm.evaluation_period_start', [$startDate, $endDate])
            ->where('u.status', 'active');

        if ($department) {
            $query->where('spm.department', $department);
        }

        if ($performanceGrade) {
            $query->where('spm.performance_grade', $performanceGrade);
        }

        $performanceData = $query->select([
            'u.id as staff_id',
            'u.name as staff_name',
            'u.email',
            'spm.department',
            'spm.position',
            'spm.attendance_score',
            'spm.punctuality_score',
            'spm.productivity_score',
            'spm.quality_score',
            'spm.customer_service_score',
            'spm.teamwork_score',
            'spm.initiative_score',
            'spm.overall_score',
            'spm.performance_grade',
            'spm.goals_achievement_rate',
            'spm.evaluation_period_start',
            'spm.evaluation_period_end'
        ])
        ->orderBy('spm.overall_score', 'DESC')
        ->get();

        return [
            'data' => $performanceData,
            'summary' => $this->calculatePerformanceSummary($performanceData),
            'top_performers' => $performanceData->take(10),
            'improvement_needed' => $performanceData->sortBy('overall_score')->take(10),
            'department_comparison' => $this->compareDepartmentPerformance($performanceData)
        ];
    }

    public function generateAttendanceReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subMonth();
        $endDate = $filters['end_date'] ?? now();
        $department = $filters['department'] ?? null;

        $query = DB::table('staff_attendance as sa')
            ->join('users as u', 'sa.staff_id', '=', 'u.id')
            ->whereBetween('sa.date', [$startDate, $endDate])
            ->where('u.status', 'active');

        if ($department) {
            $query->where('u.department', $department);
        }

        $attendanceData = $query->select([
            'u.id as staff_id',
            'u.name as staff_name',
            'u.department',
            DB::raw('COUNT(sa.id) as total_days'),
            DB::raw('SUM(CASE WHEN sa.attendance_status = "present" THEN 1 ELSE 0 END) as present_days'),
            DB::raw('SUM(CASE WHEN sa.attendance_status = "absent" THEN 1 ELSE 0 END) as absent_days'),
            DB::raw('SUM(CASE WHEN sa.attendance_status = "late" THEN 1 ELSE 0 END) as late_days'),
            DB::raw('SUM(sa.late_minutes) as total_late_minutes'),
            DB::raw('SUM(sa.overtime_hours) as total_overtime_hours'),
            DB::raw('AVG(sa.actual_hours) as avg_daily_hours'),
            DB::raw('(SUM(CASE WHEN sa.attendance_status = "present" THEN 1 ELSE 0 END) / COUNT(sa.id) * 100) as attendance_rate'),
            DB::raw('(SUM(CASE WHEN sa.late_minutes = 0 AND sa.attendance_status = "present" THEN 1 ELSE 0 END) / SUM(CASE WHEN sa.attendance_status = "present" THEN 1 ELSE 0 END) * 100) as punctuality_rate')
        ])
        ->groupBy('u.id', 'u.name', 'u.department')
        ->orderBy('attendance_rate', 'DESC')
        ->get();

        return [
            'data' => $attendanceData,
            'summary' => $this->calculateAttendanceSummary($attendanceData),
            'trends' => $this->calculateAttendanceTrends($startDate, $endDate),
            'chronic_absentees' => $attendanceData->where('attendance_rate', '<', 85),
            'perfect_attendance' => $attendanceData->where('attendance_rate', '=', 100)
        ];
    }

    public function generateProductivityReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subMonth();
        $endDate = $filters['end_date'] ?? now();
        $department = $filters['department'] ?? null;

        $query = DB::table('staff_tasks as st')
            ->join('users as u', 'st.staff_id', '=', 'u.id')
            ->whereBetween('st.assigned_date', [$startDate, $endDate])
            ->where('u.status', 'active');

        if ($department) {
            $query->where('u.department', $department);
        }

        $productivityData = $query->select([
            'u.id as staff_id',
            'u.name as staff_name',
            'u.department',
            DB::raw('COUNT(st.id) as total_tasks'),
            DB::raw('SUM(CASE WHEN st.completion_status = "completed" THEN 1 ELSE 0 END) as completed_tasks'),
            DB::raw('SUM(CASE WHEN st.completion_status = "overdue" THEN 1 ELSE 0 END) as overdue_tasks'),
            DB::raw('SUM(st.estimated_hours) as total_estimated_hours'),
            DB::raw('SUM(st.actual_hours) as total_actual_hours'),
            DB::raw('AVG(st.quality_rating) as avg_quality_rating'),
            DB::raw('(SUM(CASE WHEN st.completion_status = "completed" THEN 1 ELSE 0 END) / COUNT(st.id) * 100) as completion_rate'),
            DB::raw('(SUM(st.estimated_hours) / NULLIF(SUM(st.actual_hours), 0) * 100) as efficiency_rate'),
            DB::raw('AVG(DATEDIFF(st.completed_date, st.assigned_date)) as avg_completion_time')
        ])
        ->groupBy('u.id', 'u.name', 'u.department')
        ->orderBy('completion_rate', 'DESC')
        ->get();

        return [
            'data' => $productivityData,
            'summary' => $this->calculateProductivitySummary($productivityData),
            'high_performers' => $productivityData->where('completion_rate', '>', 90),
            'efficiency_analysis' => $this->analyzeEfficiency($productivityData),
            'workload_distribution' => $this->analyzeWorkloadDistribution($productivityData)
        ];
    }

    public function generateTrainingReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subYear();
        $endDate = $filters['end_date'] ?? now();
        $department = $filters['department'] ?? null;

        $query = DB::table('staff_training as st')
            ->join('users as u', 'st.staff_id', '=', 'u.id')
            ->join('training_programs as tp', 'st.training_program_id', '=', 'tp.id')
            ->whereBetween('st.start_date', [$startDate, $endDate])
            ->where('u.status', 'active');

        if ($department) {
            $query->where('u.department', $department);
        }

        $trainingData = $query->select([
            'u.id as staff_id',
            'u.name as staff_name',
            'u.department',
            'tp.name as training_program',
            'tp.category as training_category',
            'st.training_status',
            'st.progress_percentage',
            'st.final_score',
            'st.certification_earned',
            'st.training_cost',
            'st.start_date',
            'st.expected_completion_date',
            'st.actual_completion_date'
        ])
        ->orderBy('st.start_date', 'DESC')
        ->get();

        $trainingStats = DB::table('staff_training as st')
            ->join('users as u', 'st.staff_id', '=', 'u.id')
            ->whereBetween('st.start_date', [$startDate, $endDate])
            ->where('u.status', 'active')
            ->select([
                'u.id as staff_id',
                'u.name as staff_name',
                'u.department',
                DB::raw('COUNT(st.id) as total_trainings'),
                DB::raw('SUM(CASE WHEN st.training_status = "completed" THEN 1 ELSE 0 END) as completed_trainings'),
                DB::raw('SUM(CASE WHEN st.certification_earned = 1 THEN 1 ELSE 0 END) as certifications_earned'),
                DB::raw('SUM(st.training_cost) as total_training_cost'),
                DB::raw('AVG(st.final_score) as avg_training_score'),
                DB::raw('(SUM(CASE WHEN st.training_status = "completed" THEN 1 ELSE 0 END) / COUNT(st.id) * 100) as completion_rate')
            ])
            ->groupBy('u.id', 'u.name', 'u.department')
            ->get();

        return [
            'detailed_data' => $trainingData,
            'staff_stats' => $trainingStats,
            'program_effectiveness' => $this->analyzeTrainingEffectiveness($trainingData),
            'roi_analysis' => $this->calculateTrainingROI($trainingData),
            'upcoming_requirements' => $this->identifyTrainingNeeds($department)
        ];
    }

    public function generateCustomerFeedbackReport(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? now()->subMonth();
        $endDate = $filters['end_date'] ?? now();
        $department = $filters['department'] ?? null;

        $query = DB::table('staff_customer_feedback as scf')
            ->join('users as u', 'scf.staff_id', '=', 'u.id')
            ->whereBetween('scf.feedback_date', [$startDate, $endDate])
            ->where('u.status', 'active');

        if ($department) {
            $query->where('u.department', $department);
        }

        $feedbackData = $query->select([
            'u.id as staff_id',
            'u.name as staff_name',
            'u.department',
            DB::raw('COUNT(scf.id) as total_feedback'),
            DB::raw('AVG(scf.rating) as avg_rating'),
            DB::raw('SUM(CASE WHEN scf.feedback_category = "positive" THEN 1 ELSE 0 END) as positive_feedback'),
            DB::raw('SUM(CASE WHEN scf.feedback_category = "negative" THEN 1 ELSE 0 END) as negative_feedback'),
            DB::raw('SUM(CASE WHEN scf.feedback_category = "neutral" THEN 1 ELSE 0 END) as neutral_feedback'),
            DB::raw('(SUM(CASE WHEN scf.feedback_category = "positive" THEN 1 ELSE 0 END) / COUNT(scf.id) * 100) as positive_rate')
        ])
        ->groupBy('u.id', 'u.name', 'u.department')
        ->having('total_feedback', '>', 0)
        ->orderBy('avg_rating', 'DESC')
        ->get();

        return [
            'data' => $feedbackData,
            'summary' => $this->calculateFeedbackSummary($feedbackData),
            'service_excellence' => $feedbackData->where('avg_rating', '>', 4.5),
            'improvement_opportunities' => $feedbackData->where('avg_rating', '<', 3.5),
            'sentiment_analysis' => $this->analyzeFeedbackSentiment($feedbackData)
        ];
    }

    public function generateDepartmentAnalysis(array $filters = []): array
    {
        $month = $filters['month'] ?? now()->format('Y-m');

        $departmentData = DB::table('department_performance')
            ->where('period_month', $month)
            ->select([
                'department',
                'total_staff',
                'average_performance_score',
                'average_attendance_rate',
                'task_completion_rate',
                'average_customer_rating',
                'total_training_hours',
                'total_overtime_hours',
                'staff_turnover_count',
                'department_efficiency_score'
            ])
            ->orderBy('department_efficiency_score', 'DESC')
            ->get();

        return [
            'data' => $departmentData,
            'best_performing' => $departmentData->first(),
            'needs_attention' => $departmentData->last(),
            'benchmarks' => $this->calculateDepartmentBenchmarks($departmentData),
            'recommendations' => $this->generateDepartmentRecommendations($departmentData)
        ];
    }

    private function calculatePerformanceSummary($performanceData): array
    {
        return [
            'total_staff' => $performanceData->count(),
            'avg_overall_score' => round($performanceData->avg('overall_score'), 2),
            'grade_distribution' => [
                'A' => $performanceData->where('performance_grade', 'A')->count(),
                'B' => $performanceData->where('performance_grade', 'B')->count(),
                'C' => $performanceData->where('performance_grade', 'C')->count(),
                'D' => $performanceData->where('performance_grade', 'D')->count(),
                'F' => $performanceData->where('performance_grade', 'F')->count()
            ],
            'avg_goals_achievement' => round($performanceData->avg('goals_achievement_rate'), 2),
            'top_score' => $performanceData->max('overall_score'),
            'lowest_score' => $performanceData->min('overall_score')
        ];
    }

    private function calculateAttendanceSummary($attendanceData): array
    {
        return [
            'total_staff' => $attendanceData->count(),
            'avg_attendance_rate' => round($attendanceData->avg('attendance_rate'), 2),
            'avg_punctuality_rate' => round($attendanceData->avg('punctuality_rate'), 2),
            'total_overtime_hours' => $attendanceData->sum('total_overtime_hours'),
            'perfect_attendance_count' => $attendanceData->where('attendance_rate', 100)->count(),
            'chronic_absentee_count' => $attendanceData->where('attendance_rate', '<', 85)->count()
        ];
    }

    private function generateDepartmentRecommendations($departmentData): array
    {
        $recommendations = [];

        foreach ($departmentData as $department) {
            $deptRecommendations = [];

            if ($department->average_performance_score < 70) {
                $deptRecommendations[] = 'Implement performance improvement programs';
            }

            if ($department->average_attendance_rate < 90) {
                $deptRecommendations[] = 'Address attendance issues with staff engagement initiatives';
            }

            if ($department->task_completion_rate < 85) {
                $deptRecommendations[] = 'Review workload distribution and task management processes';
            }

            if ($department->total_overtime_hours > 100) {
                $deptRecommendations[] = 'Consider additional staffing to reduce overtime dependency';
            }

            $recommendations[$department->department] = $deptRecommendations;
        }

        return $recommendations;
    }
}
```

#### 2.2 Staff Reports Controller
```php
// app/Http/Controllers/Api/Reports/StaffReportsController.php
<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use App\Services\Reporting\StaffAnalyticsService;
use App\Http\Requests\ReportFilterRequest;
use Illuminate\Http\JsonResponse;

class StaffReportsController extends Controller
{
    private StaffAnalyticsService $analyticsService;

    public function __construct(StaffAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function performanceReport(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generatePerformanceReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function attendanceReport(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateAttendanceReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function productivityReport(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateProductivityReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function trainingReport(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateTrainingReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function customerFeedbackReport(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateCustomerFeedbackReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function departmentAnalysis(ReportFilterRequest $request): JsonResponse
    {
        $report = $this->analyticsService->generateDepartmentAnalysis($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'generated_at' => now()->toISOString()
        ]);
    }

    public function staffDashboard(ReportFilterRequest $request): JsonResponse
    {
        $dashboard = [
            'performance_overview' => $this->analyticsService->generatePerformanceReport($request->validated()),
            'attendance_summary' => $this->analyticsService->generateAttendanceReport($request->validated()),
            'productivity_metrics' => $this->analyticsService->generateProductivityReport($request->validated()),
            'customer_feedback' => $this->analyticsService->generateCustomerFeedbackReport($request->validated())
        ];

        return response()->json([
            'success' => true,
            'data' => $dashboard,
            'generated_at' => now()->toISOString()
        ]);
    }
}
```

### 3. Frontend Implementation

#### 3.1 Staff Performance Dashboard
```typescript
// src/components/reports/staff/StaffReportsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Select, Tabs, Progress, Tag } from 'antd';
import { staffReportsAPI } from '../../../services/api/reports';
import { PerformanceOverviewCard } from './components/PerformanceOverviewCard';
import { AttendanceChart } from './components/AttendanceChart';
import { ProductivityMetrics } from './components/ProductivityMetrics';
import { TrainingProgress } from './components/TrainingProgress';
import { CustomerFeedbackSummary } from './components/CustomerFeedbackSummary';
import { DepartmentComparison } from './components/DepartmentComparison';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

export const StaffReportsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, departmentFilter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const filters = {
        start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
        end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
        department: departmentFilter !== 'all' ? departmentFilter : undefined
      };

      const response = await staffReportsAPI.getDashboard(filters);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading staff dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 75) return '#1890ff';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  };

  return (
    <div className="staff-reports-dashboard">
      <div className="dashboard-header">
        <h2>Staff Performance Dashboard</h2>
        <div className="dashboard-filters">
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ marginRight: 16 }}
          />
          <Select
            value={departmentFilter}
            onChange={setDepartmentFilter}
            style={{ width: 200 }}
            placeholder="Select Department"
          >
            <Option value="all">All Departments</Option>
            <Option value="front_desk">Front Desk</Option>
            <Option value="housekeeping">Housekeeping</Option>
            <Option value="restaurant">Restaurant</Option>
            <Option value="activities">Activities</Option>
            <Option value="maintenance">Maintenance</Option>
          </Select>
        </div>
      </div>

      <Tabs defaultActiveKey="overview" type="card">
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card>
                <div className="metric-card">
                  <h3>Average Performance</h3>
                  <Progress
                    type="circle"
                    percent={dashboardData?.performance_overview?.summary?.avg_overall_score || 0}
                    strokeColor={getPerformanceColor(dashboardData?.performance_overview?.summary?.avg_overall_score || 0)}
                  />
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div className="metric-card">
                  <h3>Attendance Rate</h3>
                  <Progress
                    type="circle"
                    percent={dashboardData?.attendance_summary?.summary?.avg_attendance_rate || 0}
                    strokeColor="#1890ff"
                  />
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div className="metric-card">
                  <h3>Task Completion</h3>
                  <Progress
                    type="circle"
                    percent={dashboardData?.productivity_metrics?.summary?.avg_completion_rate || 0}
                    strokeColor="#52c41a"
                  />
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div className="metric-card">
                  <h3>Customer Rating</h3>
                  <div className="rating-display">
                    <span className="rating-value">
                      {dashboardData?.customer_feedback?.summary?.avg_rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="rating-scale">/5.0</span>
                  </div>
                </div>
              </Card>
            </Col>

            <Col span={12}>
              <PerformanceOverviewCard data={dashboardData?.performance_overview} />
            </Col>
            <Col span={12}>
              <AttendanceChart data={dashboardData?.attendance_summary} />
            </Col>
            <Col span={12}>
              <ProductivityMetrics data={dashboardData?.productivity_metrics} />
            </Col>
            <Col span={12}>
              <CustomerFeedbackSummary data={dashboardData?.customer_feedback} />
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Performance Analysis" key="performance">
          <PerformanceAnalysisTab dateRange={dateRange} departmentFilter={departmentFilter} />
        </TabPane>

        <TabPane tab="Attendance & Time" key="attendance">
          <AttendanceAnalysisTab dateRange={dateRange} departmentFilter={departmentFilter} />
        </TabPane>

        <TabPane tab="Productivity" key="productivity">
          <ProductivityAnalysisTab dateRange={dateRange} departmentFilter={departmentFilter} />
        </TabPane>

        <TabPane tab="Training & Development" key="training">
          <TrainingAnalysisTab dateRange={dateRange} departmentFilter={departmentFilter} />
        </TabPane>

        <TabPane tab="Department Comparison" key="departments">
          <DepartmentComparisonTab />
        </TabPane>
      </Tabs>
    </div>
  );
};
```

### 4. API Routes

```php
// routes/api.php (Staff Reports section)
Route::prefix('reports/staff')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', [StaffReportsController::class, 'staffDashboard']);
    Route::get('/performance', [StaffReportsController::class, 'performanceReport']);
    Route::get('/attendance', [StaffReportsController::class, 'attendanceReport']);
    Route::get('/productivity', [StaffReportsController::class, 'productivityReport']);
    Route::get('/training', [StaffReportsController::class, 'trainingReport']);
    Route::get('/customer-feedback', [StaffReportsController::class, 'customerFeedbackReport']);
    Route::get('/department-analysis', [StaffReportsController::class, 'departmentAnalysis']);
});
```

### 5. Testing Requirements

#### 5.1 Unit Tests
- Performance calculation algorithms
- Attendance rate calculations
- Productivity metrics
- Grade assignment logic

#### 5.2 Integration Tests
- API endpoint responses
- Report data accuracy
- Dashboard integration

#### 5.3 Performance Tests
- Large staff dataset handling
- Report generation speed
- Concurrent access

### 6. Documentation

#### 6.1 API Documentation
- Staff reports endpoints
- Performance metrics definitions
- Calculation methodologies

#### 6.2 User Guide
- Performance evaluation guidelines
- Report interpretation
- Best practices for staff management

## Acceptance Criteria

- [ ] Performance reports track multiple evaluation criteria
- [ ] Attendance analysis shows punctuality and presence patterns
- [ ] Productivity metrics measure task completion and efficiency
- [ ] Training reports track development progress and ROI
- [ ] Customer feedback analysis provides service quality insights
- [ ] Department comparison identifies best practices
- [ ] Performance grades calculated automatically
- [ ] Reports export to multiple formats
- [ ] Real-time dashboard updates
- [ ] Role-based access control
- [ ] Mobile-responsive design
- [ ] Comprehensive test coverage (>80%)

## Dependencies

- Issue #01: Core reporting infrastructure
- HR management system
- Staff management system
- Training management system

## Notes

- Ensure data privacy and confidentiality
- Implement fair and transparent evaluation criteria
- Consider integration with payroll systems
- Plan for performance improvement workflows
