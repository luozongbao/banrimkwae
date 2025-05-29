# Issue #08: Custom Report Builder

**Priority:** High  
**Estimated Time:** 12-14 days  
**Dependencies:** Issues #01-#07  
**Assignee:** Full-Stack Developer + UI/UX Designer

## Overview
Implement a comprehensive custom report builder system that allows users to create, configure, and schedule personalized reports by selecting data sources, applying filters, choosing visualizations, and setting up automated delivery.

## Requirements

### 1. Database Schema Extensions

#### 1.1 Custom Report Management Tables
```sql
-- Custom report definitions
CREATE TABLE custom_reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('financial', 'accommodation', 'restaurant', 'inventory', 'staff', 'activities', 'custom') NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    -- Report configuration
    data_sources JSON NOT NULL, -- Array of data source configurations
    filters JSON, -- Filter configurations
    grouping JSON, -- Grouping and aggregation settings  
    sorting JSON, -- Sort configurations
    visualization_config JSON, -- Chart/table configurations
    columns_config JSON, -- Column selections and formatting
    -- Scheduling
    schedule_enabled BOOLEAN DEFAULT FALSE,
    schedule_frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NULL,
    schedule_day_of_week TINYINT NULL, -- 0=Sunday, 6=Saturday
    schedule_day_of_month TINYINT NULL, -- 1-31
    schedule_time TIME NULL,
    schedule_timezone VARCHAR(50) DEFAULT 'UTC',
    last_generated_at TIMESTAMP NULL,
    next_scheduled_at TIMESTAMP NULL,
    -- Access control
    access_level ENUM('private', 'department', 'manager', 'admin', 'public') DEFAULT 'private',
    allowed_departments JSON, -- Array of department names
    allowed_roles JSON, -- Array of role names
    allowed_users JSON, -- Array of user IDs
    -- Status
    status ENUM('draft', 'active', 'archived', 'disabled') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_custom_reports_category (category),
    INDEX idx_custom_reports_creator (created_by),
    INDEX idx_custom_reports_status (status),
    INDEX idx_custom_reports_schedule (schedule_enabled, next_scheduled_at),
    INDEX idx_custom_reports_access (access_level)
);

-- Report execution history
CREATE TABLE report_executions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    custom_report_id BIGINT UNSIGNED NOT NULL,
    executed_by BIGINT UNSIGNED NULL, -- NULL for scheduled executions
    execution_type ENUM('manual', 'scheduled', 'api') NOT NULL DEFAULT 'manual',
    -- Execution details
    execution_status ENUM('pending', 'running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    execution_duration_seconds INT NULL,
    -- Data and results
    filter_parameters JSON, -- Applied filters for this execution
    row_count INT DEFAULT 0,
    file_size_bytes BIGINT DEFAULT 0,
    -- Output files
    pdf_file_path VARCHAR(500) NULL,
    excel_file_path VARCHAR(500) NULL,
    csv_file_path VARCHAR(500) NULL,
    -- Error handling
    error_message TEXT NULL,
    error_details JSON NULL,
    -- Delivery
    delivery_method ENUM('download', 'email', 'webhook') NULL,
    delivery_recipients JSON, -- Email addresses or webhook URLs
    delivery_status ENUM('pending', 'sent', 'failed') NULL,
    delivery_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (custom_report_id) REFERENCES custom_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (executed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_report_executions_report (custom_report_id),
    INDEX idx_report_executions_user (executed_by),
    INDEX idx_report_executions_status (execution_status),
    INDEX idx_report_executions_date (created_at),
    INDEX idx_report_executions_type (execution_type)
);

-- Saved report filters and presets
CREATE TABLE report_filter_presets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_source VARCHAR(100) NOT NULL, -- 'financial', 'accommodation', etc.
    filter_config JSON NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    is_shared BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_filter_presets_source (data_source),
    INDEX idx_filter_presets_creator (created_by),
    INDEX idx_filter_presets_shared (is_shared)
);

-- Report sharing and collaboration
CREATE TABLE report_shares (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    custom_report_id BIGINT UNSIGNED NOT NULL,
    shared_by BIGINT UNSIGNED NOT NULL,
    shared_with_user BIGINT UNSIGNED NULL,
    shared_with_department VARCHAR(50) NULL,
    shared_with_role VARCHAR(50) NULL,
    permission_level ENUM('view', 'edit', 'full') NOT NULL DEFAULT 'view',
    expiry_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (custom_report_id) REFERENCES custom_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_user) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_report_shares_report (custom_report_id),
    INDEX idx_report_shares_user (shared_with_user),
    INDEX idx_report_shares_department (shared_with_department),
    INDEX idx_report_shares_role (shared_with_role)
);

-- Data source definitions
CREATE TABLE report_data_sources (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    source_type ENUM('table', 'view', 'query', 'api') NOT NULL DEFAULT 'table',
    source_config JSON NOT NULL, -- Table name, query, API endpoint, etc.
    -- Available fields
    available_fields JSON NOT NULL, -- Field definitions with types and labels
    default_filters JSON, -- Default filter options
    required_permissions JSON, -- Required roles/permissions
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_data_sources_category (category),
    INDEX idx_data_sources_active (is_active)
);
```

### 2. Backend Implementation

#### 2.1 Custom Report Builder Service
```php
// app/Services/Reporting/CustomReportBuilderService.php
<?php

namespace App\Services\Reporting;

use App\Models\CustomReport;
use App\Models\ReportExecution;
use App\Models\ReportDataSource;
use App\Services\Reporting\BaseReportService;
use App\Services\Reporting\DataQueryBuilder;
use App\Services\Export\ReportExportService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CustomReportBuilderService extends BaseReportService
{
    private DataQueryBuilder $queryBuilder;
    private ReportExportService $exportService;

    public function __construct(
        DataQueryBuilder $queryBuilder,
        ReportExportService $exportService
    ) {
        $this->queryBuilder = $queryBuilder;
        $this->exportService = $exportService;
    }

    public function getDataSources(): array
    {
        $dataSources = ReportDataSource::where('is_active', true)
            ->orderBy('category')
            ->orderBy('display_name')
            ->get();

        return $dataSources->groupBy('category')->map(function ($sources, $category) {
            return [
                'category' => $category,
                'sources' => $sources->map(function ($source) {
                    return [
                        'id' => $source->name,
                        'name' => $source->display_name,
                        'description' => $source->description,
                        'fields' => $source->available_fields,
                        'default_filters' => $source->default_filters,
                        'required_permissions' => $source->required_permissions
                    ];
                })
            ];
        })->values()->toArray();
    }

    public function validateReportConfig(array $config): array
    {
        $errors = [];

        // Validate data sources
        if (empty($config['data_sources'])) {
            $errors[] = 'At least one data source must be selected';
        } else {
            foreach ($config['data_sources'] as $dataSource) {
                if (!ReportDataSource::where('name', $dataSource['source_id'])->exists()) {
                    $errors[] = "Invalid data source: {$dataSource['source_id']}";
                }
            }
        }

        // Validate columns
        if (empty($config['columns_config']['selected_columns'])) {
            $errors[] = 'At least one column must be selected';
        }

        // Validate filters
        if (!empty($config['filters'])) {
            $errors = array_merge($errors, $this->validateFilters($config['filters']));
        }

        // Validate visualization config
        if (!empty($config['visualization_config'])) {
            $errors = array_merge($errors, $this->validateVisualization($config['visualization_config']));
        }

        return $errors;
    }

    public function createCustomReport(array $data): CustomReport
    {
        $validation = $this->validateReportConfig($data);
        if (!empty($validation)) {
            throw new \InvalidArgumentException('Invalid report configuration: ' . implode(', ', $validation));
        }

        $report = new CustomReport();
        $report->fill($data);
        $report->created_by = Auth::id();
        $report->status = 'draft';

        // Process scheduling
        if ($data['schedule_enabled'] ?? false) {
            $report->next_scheduled_at = $this->calculateNextScheduleTime($data);
        }

        $report->save();

        return $report;
    }

    public function updateCustomReport(int $reportId, array $data): CustomReport
    {
        $report = CustomReport::findOrFail($reportId);
        
        // Check permissions
        if (!$this->canEditReport($report)) {
            throw new \UnauthorizedException('Insufficient permissions to edit this report');
        }

        $validation = $this->validateReportConfig($data);
        if (!empty($validation)) {
            throw new \InvalidArgumentException('Invalid report configuration: ' . implode(', ', $validation));
        }

        $report->fill($data);

        // Update scheduling
        if ($data['schedule_enabled'] ?? false) {
            $report->next_scheduled_at = $this->calculateNextScheduleTime($data);
        } else {
            $report->next_scheduled_at = null;
        }

        $report->save();

        return $report;
    }

    public function executeCustomReport(int $reportId, array $parameters = []): ReportExecution
    {
        $report = CustomReport::findOrFail($reportId);
        
        // Check permissions
        if (!$this->canExecuteReport($report)) {
            throw new \UnauthorizedException('Insufficient permissions to execute this report');
        }

        // Create execution record
        $execution = new ReportExecution();
        $execution->custom_report_id = $reportId;
        $execution->executed_by = Auth::id();
        $execution->execution_type = 'manual';
        $execution->execution_status = 'pending';
        $execution->filter_parameters = $parameters;
        $execution->save();

        try {
            // Start execution
            $execution->update([
                'execution_status' => 'running',
                'start_time' => now()
            ]);

            // Build and execute query
            $query = $this->queryBuilder->buildQuery($report, $parameters);
            $data = $query->get();

            // Process data
            $processedData = $this->processReportData($data, $report);

            // Generate exports if requested
            $exportPaths = [];
            if ($parameters['export_pdf'] ?? false) {
                $exportPaths['pdf'] = $this->exportService->generatePDF($processedData, $report);
            }
            if ($parameters['export_excel'] ?? false) {
                $exportPaths['excel'] = $this->exportService->generateExcel($processedData, $report);
            }
            if ($parameters['export_csv'] ?? false) {
                $exportPaths['csv'] = $this->exportService->generateCSV($processedData, $report);
            }

            // Complete execution
            $execution->update([
                'execution_status' => 'completed',
                'end_time' => now(),
                'execution_duration_seconds' => now()->diffInSeconds($execution->start_time),
                'row_count' => $data->count(),
                'pdf_file_path' => $exportPaths['pdf'] ?? null,
                'excel_file_path' => $exportPaths['excel'] ?? null,
                'csv_file_path' => $exportPaths['csv'] ?? null
            ]);

            // Handle delivery
            if ($parameters['delivery_method'] ?? null) {
                $this->handleReportDelivery($execution, $parameters);
            }

            return $execution->fresh();

        } catch (\Exception $e) {
            $execution->update([
                'execution_status' => 'failed',
                'end_time' => now(),
                'error_message' => $e->getMessage(),
                'error_details' => [
                    'exception' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]
            ]);

            throw $e;
        }
    }

    public function getReportData(int $reportId, array $parameters = []): array
    {
        $report = CustomReport::findOrFail($reportId);
        
        if (!$this->canExecuteReport($report)) {
            throw new \UnauthorizedException('Insufficient permissions to view this report');
        }

        // Build and execute query
        $query = $this->queryBuilder->buildQuery($report, $parameters);
        $data = $query->get();

        // Process data for display
        $processedData = $this->processReportData($data, $report);

        return [
            'data' => $processedData,
            'metadata' => [
                'total_rows' => $data->count(),
                'columns' => $this->getColumnMetadata($report),
                'filters_applied' => $parameters,
                'generated_at' => now()->toISOString()
            ]
        ];
    }

    public function cloneReport(int $reportId, string $newName): CustomReport
    {
        $originalReport = CustomReport::findOrFail($reportId);
        
        if (!$this->canViewReport($originalReport)) {
            throw new \UnauthorizedException('Insufficient permissions to clone this report');
        }

        $newReport = $originalReport->replicate();
        $newReport->name = $newName;
        $newReport->created_by = Auth::id();
        $newReport->status = 'draft';
        $newReport->is_public = false;
        $newReport->schedule_enabled = false;
        $newReport->next_scheduled_at = null;
        $newReport->last_generated_at = null;
        $newReport->save();

        return $newReport;
    }

    public function shareReport(int $reportId, array $shareConfig): void
    {
        $report = CustomReport::findOrFail($reportId);
        
        if (!$this->canShareReport($report)) {
            throw new \UnauthorizedException('Insufficient permissions to share this report');
        }

        // Process sharing configuration
        foreach ($shareConfig['recipients'] as $recipient) {
            DB::table('report_shares')->insert([
                'custom_report_id' => $reportId,
                'shared_by' => Auth::id(),
                'shared_with_user' => $recipient['user_id'] ?? null,
                'shared_with_department' => $recipient['department'] ?? null,
                'shared_with_role' => $recipient['role'] ?? null,
                'permission_level' => $recipient['permission_level'] ?? 'view',
                'expiry_date' => $recipient['expiry_date'] ?? null,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    public function getMyReports(): array
    {
        $userId = Auth::id();

        // Get owned reports
        $ownedReports = CustomReport::where('created_by', $userId)
            ->with(['creator:id,name'])
            ->orderBy('updated_at', 'desc')
            ->get();

        // Get shared reports
        $sharedReports = CustomReport::whereHas('shares', function ($query) use ($userId) {
            $query->where('shared_with_user', $userId)
                  ->where('is_active', true)
                  ->where(function ($q) {
                      $q->whereNull('expiry_date')
                        ->orWhere('expiry_date', '>', now());
                  });
        })
        ->with(['creator:id,name'])
        ->orderBy('updated_at', 'desc')
        ->get();

        // Get public/template reports
        $publicReports = CustomReport::where(function ($query) {
            $query->where('is_public', true)
                  ->orWhere('is_template', true);
        })
        ->where('status', 'active')
        ->with(['creator:id,name'])
        ->orderBy('name')
        ->get();

        return [
            'owned' => $ownedReports,
            'shared' => $sharedReports,
            'public' => $publicReports
        ];
    }

    private function calculateNextScheduleTime(array $scheduleConfig): ?Carbon
    {
        if (!($scheduleConfig['schedule_enabled'] ?? false)) {
            return null;
        }

        $frequency = $scheduleConfig['schedule_frequency'];
        $time = $scheduleConfig['schedule_time'] ?? '09:00:00';
        $timezone = $scheduleConfig['schedule_timezone'] ?? 'UTC';

        $next = Carbon::now($timezone);

        switch ($frequency) {
            case 'daily':
                $next = $next->addDay()->setTimeFromTimeString($time);
                break;
            case 'weekly':
                $dayOfWeek = $scheduleConfig['schedule_day_of_week'] ?? 1; // Monday
                $next = $next->next($dayOfWeek)->setTimeFromTimeString($time);
                break;
            case 'monthly':
                $dayOfMonth = $scheduleConfig['schedule_day_of_month'] ?? 1;
                $next = $next->addMonth()->day($dayOfMonth)->setTimeFromTimeString($time);
                break;
            case 'quarterly':
                $next = $next->addMonths(3)->day(1)->setTimeFromTimeString($time);
                break;
            case 'yearly':
                $next = $next->addYear()->month(1)->day(1)->setTimeFromTimeString($time);
                break;
        }

        return $next->utc();
    }

    private function processReportData($data, CustomReport $report): array
    {
        $columnsConfig = $report->columns_config;
        $visualizationConfig = $report->visualization_config;

        // Apply column formatting
        $processedData = $data->map(function ($row) use ($columnsConfig) {
            $processedRow = [];
            
            foreach ($columnsConfig['selected_columns'] as $column) {
                $value = data_get($row, $column['field']);
                
                // Apply formatting based on column type
                switch ($column['type'] ?? 'text') {
                    case 'currency':
                        $processedRow[$column['field']] = number_format($value, 2);
                        break;
                    case 'percentage':
                        $processedRow[$column['field']] = number_format($value, 2) . '%';
                        break;
                    case 'date':
                        $processedRow[$column['field']] = Carbon::parse($value)->format($column['format'] ?? 'Y-m-d');
                        break;
                    default:
                        $processedRow[$column['field']] = $value;
                }
            }
            
            return $processedRow;
        })->toArray();

        return $processedData;
    }

    private function canViewReport(CustomReport $report): bool
    {
        $user = Auth::user();
        
        // Owner can always view
        if ($report->created_by === $user->id) {
            return true;
        }

        // Check public access
        if ($report->is_public && $report->status === 'active') {
            return true;
        }

        // Check shared access
        return DB::table('report_shares')
            ->where('custom_report_id', $report->id)
            ->where('is_active', true)
            ->where(function ($query) use ($user) {
                $query->where('shared_with_user', $user->id)
                      ->orWhere('shared_with_department', $user->department)
                      ->orWhere('shared_with_role', $user->role);
            })
            ->where(function ($query) {
                $query->whereNull('expiry_date')
                      ->orWhere('expiry_date', '>', now());
            })
            ->exists();
    }

    private function canEditReport(CustomReport $report): bool
    {
        $user = Auth::user();
        
        // Owner can always edit
        if ($report->created_by === $user->id) {
            return true;
        }

        // Check edit permissions from shares
        return DB::table('report_shares')
            ->where('custom_report_id', $report->id)
            ->where('is_active', true)
            ->whereIn('permission_level', ['edit', 'full'])
            ->where(function ($query) use ($user) {
                $query->where('shared_with_user', $user->id)
                      ->orWhere('shared_with_department', $user->department)
                      ->orWhere('shared_with_role', $user->role);
            })
            ->where(function ($query) {
                $query->whereNull('expiry_date')
                      ->orWhere('expiry_date', '>', now());
            })
            ->exists();
    }

    private function canExecuteReport(CustomReport $report): bool
    {
        return $this->canViewReport($report);
    }

    private function canShareReport(CustomReport $report): bool
    {
        $user = Auth::user();
        
        // Owner can always share
        if ($report->created_by === $user->id) {
            return true;
        }

        // Check full permissions from shares
        return DB::table('report_shares')
            ->where('custom_report_id', $report->id)
            ->where('is_active', true)
            ->where('permission_level', 'full')
            ->where(function ($query) use ($user) {
                $query->where('shared_with_user', $user->id)
                      ->orWhere('shared_with_department', $user->department)
                      ->orWhere('shared_with_role', $user->role);
            })
            ->where(function ($query) {
                $query->whereNull('expiry_date')
                      ->orWhere('expiry_date', '>', now());
            })
            ->exists();
    }
}
```

#### 2.2 Data Query Builder Service
```php
// app/Services/Reporting/DataQueryBuilder.php
<?php

namespace App\Services\Reporting;

use App\Models\CustomReport;
use App\Models\ReportDataSource;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class DataQueryBuilder
{
    public function buildQuery(CustomReport $report, array $parameters = []): Builder
    {
        $dataSources = $report->data_sources;
        $filters = array_merge($report->filters ?? [], $parameters['filters'] ?? []);
        $grouping = $report->grouping;
        $sorting = $report->sorting;

        // Start with primary data source
        $primarySource = $dataSources[0];
        $sourceConfig = ReportDataSource::where('name', $primarySource['source_id'])->firstOrFail();
        
        $query = $this->buildBaseQuery($sourceConfig);

        // Apply joins for additional data sources
        for ($i = 1; $i < count($dataSources); $i++) {
            $this->applyJoin($query, $dataSources[$i], $sourceConfig);
        }

        // Apply filters
        $this->applyFilters($query, $filters);

        // Apply grouping
        if (!empty($grouping)) {
            $this->applyGrouping($query, $grouping);
        }

        // Apply sorting
        if (!empty($sorting)) {
            $this->applySorting($query, $sorting);
        }

        // Apply column selection
        $this->applyColumnSelection($query, $report->columns_config);

        return $query;
    }

    private function buildBaseQuery(ReportDataSource $dataSource): Builder
    {
        $sourceConfig = $dataSource->source_config;

        switch ($dataSource->source_type) {
            case 'table':
                return DB::table($sourceConfig['table_name']);
            
            case 'view':
                return DB::table($sourceConfig['view_name']);
            
            case 'query':
                return DB::table(DB::raw("({$sourceConfig['query']}) as subquery"));
            
            default:
                throw new \InvalidArgumentException("Unsupported source type: {$dataSource->source_type}");
        }
    }

    private function applyJoin(Builder $query, array $joinConfig, ReportDataSource $primarySource): void
    {
        $joinSource = ReportDataSource::where('name', $joinConfig['source_id'])->firstOrFail();
        $joinType = $joinConfig['join_type'] ?? 'inner';
        $joinConditions = $joinConfig['join_conditions'];

        $joinTable = $joinSource->source_config['table_name'] ?? $joinSource->source_config['view_name'];

        $joinMethod = $joinType . 'Join';
        
        $query->$joinMethod($joinTable, function ($join) use ($joinConditions) {
            foreach ($joinConditions as $condition) {
                $join->on($condition['left_field'], $condition['operator'], $condition['right_field']);
            }
        });
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        foreach ($filters as $filter) {
            $field = $filter['field'];
            $operator = $filter['operator'];
            $value = $filter['value'];

            switch ($operator) {
                case 'equals':
                    $query->where($field, '=', $value);
                    break;
                case 'not_equals':
                    $query->where($field, '!=', $value);
                    break;
                case 'greater_than':
                    $query->where($field, '>', $value);
                    break;
                case 'less_than':
                    $query->where($field, '<', $value);
                    break;
                case 'greater_equal':
                    $query->where($field, '>=', $value);
                    break;
                case 'less_equal':
                    $query->where($field, '<=', $value);
                    break;
                case 'contains':
                    $query->where($field, 'LIKE', "%{$value}%");
                    break;
                case 'starts_with':
                    $query->where($field, 'LIKE', "{$value}%");
                    break;
                case 'ends_with':
                    $query->where($field, 'LIKE', "%{$value}");
                    break;
                case 'in':
                    $query->whereIn($field, $value);
                    break;
                case 'not_in':
                    $query->whereNotIn($field, $value);
                    break;
                case 'between':
                    $query->whereBetween($field, [$value['min'], $value['max']]);
                    break;
                case 'date_range':
                    $query->whereBetween($field, [$value['start'], $value['end']]);
                    break;
                case 'is_null':
                    $query->whereNull($field);
                    break;
                case 'is_not_null':
                    $query->whereNotNull($field);
                    break;
            }
        }
    }

    private function applyGrouping(Builder $query, array $grouping): void
    {
        // Apply GROUP BY
        if (!empty($grouping['group_by'])) {
            foreach ($grouping['group_by'] as $field) {
                $query->groupBy($field);
            }
        }

        // Apply HAVING conditions
        if (!empty($grouping['having'])) {
            foreach ($grouping['having'] as $condition) {
                $query->having($condition['field'], $condition['operator'], $condition['value']);
            }
        }
    }

    private function applySorting(Builder $query, array $sorting): void
    {
        foreach ($sorting as $sort) {
            $query->orderBy($sort['field'], $sort['direction'] ?? 'asc');
        }
    }

    private function applyColumnSelection(Builder $query, array $columnsConfig): void
    {
        if (empty($columnsConfig['selected_columns'])) {
            return; // Select all columns
        }

        $selectFields = [];
        
        foreach ($columnsConfig['selected_columns'] as $column) {
            $field = $column['field'];
            $alias = $column['alias'] ?? null;
            $aggregation = $column['aggregation'] ?? null;

            if ($aggregation) {
                $selectField = "{$aggregation}({$field})";
                if ($alias) {
                    $selectField .= " as {$alias}";
                }
            } else {
                $selectField = $alias ? "{$field} as {$alias}" : $field;
            }

            $selectFields[] = DB::raw($selectField);
        }

        $query->select($selectFields);
    }
}
```

#### 2.3 Custom Report Controller
```php
// app/Http/Controllers/Api/Reports/CustomReportController.php
<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use App\Services\Reporting\CustomReportBuilderService;
use App\Http\Requests\CustomReportRequest;
use App\Http\Requests\ReportExecutionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomReportController extends Controller
{
    private CustomReportBuilderService $reportService;

    public function __construct(CustomReportBuilderService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function index(): JsonResponse
    {
        $reports = $this->reportService->getMyReports();
        
        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    public function store(CustomReportRequest $request): JsonResponse
    {
        $report = $this->reportService->createCustomReport($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'message' => 'Custom report created successfully'
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $report = CustomReport::with(['creator', 'executions' => function ($query) {
            $query->latest()->limit(10);
        }])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    public function update(int $id, CustomReportRequest $request): JsonResponse
    {
        $report = $this->reportService->updateCustomReport($id, $request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $report,
            'message' => 'Custom report updated successfully'
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $report = CustomReport::findOrFail($id);
        
        // Check permissions
        if ($report->created_by !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this report'
            ], 403);
        }
        
        $report->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Custom report deleted successfully'
        ]);
    }

    public function execute(int $id, ReportExecutionRequest $request): JsonResponse
    {
        $execution = $this->reportService->executeCustomReport($id, $request->validated());
        
        return response()->json([
            'success' => true,
            'data' => $execution,
            'message' => 'Report executed successfully'
        ]);
    }

    public function preview(int $id, Request $request): JsonResponse
    {
        $parameters = $request->validate([
            'filters' => 'array',
            'limit' => 'integer|min:1|max:1000'
        ]);
        
        $parameters['limit'] = $parameters['limit'] ?? 100; // Preview limit
        
        $data = $this->reportService->getReportData($id, $parameters);
        
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function clone(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);
        
        $newReport = $this->reportService->cloneReport($id, $validated['name']);
        
        return response()->json([
            'success' => true,
            'data' => $newReport,
            'message' => 'Report cloned successfully'
        ]);
    }

    public function share(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recipients' => 'required|array',
            'recipients.*.user_id' => 'nullable|exists:users,id',
            'recipients.*.department' => 'nullable|string',
            'recipients.*.role' => 'nullable|string',
            'recipients.*.permission_level' => 'required|in:view,edit,full',
            'recipients.*.expiry_date' => 'nullable|date|after:today'
        ]);
        
        $this->reportService->shareReport($id, $validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Report shared successfully'
        ]);
    }

    public function getDataSources(): JsonResponse
    {
        $dataSources = $this->reportService->getDataSources();
        
        return response()->json([
            'success' => true,
            'data' => $dataSources
        ]);
    }
}
```

### 3. Frontend Implementation

#### 3.1 Report Builder Interface
```typescript
// src/components/reports/builder/ReportBuilder.tsx
import React, { useState, useEffect } from 'react';
import { Steps, Card, Button, message } from 'antd';
import { customReportsAPI } from '../../../services/api/reports';
import { DataSourceSelection } from './steps/DataSourceSelection';
import { ColumnSelection } from './steps/ColumnSelection';
import { FilterConfiguration } from './steps/FilterConfiguration';
import { VisualizationSetup } from './steps/VisualizationSetup';
import { ReportPreview } from './steps/ReportPreview';
import { ReportSettings } from './steps/ReportSettings';

const { Step } = Steps;

interface ReportConfig {
  name: string;
  description: string;
  category: string;
  data_sources: any[];
  columns_config: any;
  filters: any[];
  grouping: any;
  sorting: any[];
  visualization_config: any;
  schedule_enabled: boolean;
  schedule_config: any;
  access_level: string;
}

export const ReportBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: '',
    description: '',
    category: 'custom',
    data_sources: [],
    columns_config: { selected_columns: [] },
    filters: [],
    grouping: {},
    sorting: [],
    visualization_config: {},
    schedule_enabled: false,
    schedule_config: {},
    access_level: 'private'
  });
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      const response = await customReportsAPI.getDataSources();
      setDataSources(response.data);
    } catch (error) {
      message.error('Failed to load data sources');
    }
  };

  const updateReportConfig = (updates: Partial<ReportConfig>) => {
    setReportConfig(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generatePreview = async () => {
    setLoading(true);
    try {
      // Create temporary report for preview
      const tempReport = await customReportsAPI.create({
        ...reportConfig,
        status: 'draft'
      });

      const preview = await customReportsAPI.preview(tempReport.data.id, {
        filters: reportConfig.filters,
        limit: 100
      });

      setPreviewData(preview.data);
    } catch (error) {
      message.error('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    setLoading(true);
    try {
      await customReportsAPI.create({
        ...reportConfig,
        status: 'active'
      });
      
      message.success('Report created successfully');
      // Navigate to reports list or continue editing
    } catch (error) {
      message.error('Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Data Sources',
      content: (
        <DataSourceSelection
          dataSources={dataSources}
          selectedSources={reportConfig.data_sources}
          onSelectionChange={(sources) => updateReportConfig({ data_sources: sources })}
        />
      )
    },
    {
      title: 'Columns',
      content: (
        <ColumnSelection
          dataSources={reportConfig.data_sources}
          columnsConfig={reportConfig.columns_config}
          onConfigChange={(config) => updateReportConfig({ columns_config: config })}
        />
      )
    },
    {
      title: 'Filters',
      content: (
        <FilterConfiguration
          dataSources={reportConfig.data_sources}
          filters={reportConfig.filters}
          onFiltersChange={(filters) => updateReportConfig({ filters })}
        />
      )
    },
    {
      title: 'Visualization',
      content: (
        <VisualizationSetup
          columnsConfig={reportConfig.columns_config}
          visualizationConfig={reportConfig.visualization_config}
          onConfigChange={(config) => updateReportConfig({ visualization_config: config })}
        />
      )
    },
    {
      title: 'Preview',
      content: (
        <ReportPreview
          reportConfig={reportConfig}
          previewData={previewData}
          onGeneratePreview={generatePreview}
          loading={loading}
        />
      )
    },
    {
      title: 'Settings',
      content: (
        <ReportSettings
          reportConfig={reportConfig}
          onConfigChange={updateReportConfig}
        />
      )
    }
  ];

  return (
    <div className="report-builder">
      <Card>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <div className="steps-content">
          {steps[currentStep].content}
        </div>

        <div className="steps-action">
          {currentStep > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={prevStep}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={nextStep}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={saveReport} loading={loading}>
              Save Report
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
```

### 4. API Routes

```php
// routes/api.php (Custom Reports section)
Route::prefix('reports/custom')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/', [CustomReportController::class, 'index']);
    Route::post('/', [CustomReportController::class, 'store']);
    Route::get('/data-sources', [CustomReportController::class, 'getDataSources']);
    Route::get('/{id}', [CustomReportController::class, 'show']);
    Route::put('/{id}', [CustomReportController::class, 'update']);
    Route::delete('/{id}', [CustomReportController::class, 'destroy']);
    Route::post('/{id}/execute', [CustomReportController::class, 'execute']);
    Route::post('/{id}/preview', [CustomReportController::class, 'preview']);
    Route::post('/{id}/clone', [CustomReportController::class, 'clone']);
    Route::post('/{id}/share', [CustomReportController::class, 'share']);
});
```

### 5. Testing Requirements

#### 5.1 Unit Tests
- Report configuration validation
- Query building logic
- Data processing functions
- Permission checking

#### 5.2 Integration Tests
- Full report creation workflow
- Report execution and export
- Sharing and collaboration features

#### 5.3 Performance Tests
- Complex query performance
- Large dataset handling
- Concurrent report executions

### 6. Documentation

#### 6.1 User Guide
- Report builder interface tutorial
- Best practices for report design
- Performance optimization tips

#### 6.2 Developer Documentation
- Data source configuration
- Custom visualization development
- API integration examples

## Acceptance Criteria

- [ ] Intuitive drag-and-drop report builder interface
- [ ] Support for multiple data sources and joins
- [ ] Comprehensive filtering and grouping options
- [ ] Multiple visualization types (charts, tables, gauges)
- [ ] Real-time preview functionality
- [ ] Report scheduling and automation
- [ ] Export to PDF, Excel, CSV formats
- [ ] Report sharing and collaboration features
- [ ] Template library for common reports
- [ ] Mobile-responsive design
- [ ] Role-based access control
- [ ] Performance optimized for complex queries
- [ ] Comprehensive test coverage (>85%)

## Dependencies

- Issues #01-#07: All module-specific reporting systems
- Advanced query builder capabilities
- Export service infrastructure
- Email notification system

## Notes

- Implement query caching for frequently used reports
- Consider SQL injection prevention in dynamic queries
- Plan for report versioning and change tracking
- Ensure scalable architecture for growing data volumes
