# Issue #01: Reporting System Core Architecture

## Overview
Establish the foundational architecture for the comprehensive reporting system, including the core infrastructure, database schema extensions, caching strategies, and base reporting framework that will support all reporting modules across the resort management system.

## Priority
**Critical** - This is the foundation for all other reporting functionality

## Estimated Timeline
**6 days (Week 1)**

## Requirements

### 1. Core Reporting Infrastructure
- **Report Management System**: Template storage, execution tracking, and result management
- **Data Access Layer**: Unified data access patterns across all modules
- **Caching Strategy**: Redis-based caching for report data and query results
- **Background Processing**: Laravel Queue system for report generation
- **File Storage**: Secure storage for generated reports and exports

### 2. Database Schema Extensions
- **Reports Table**: Store report templates and configurations
- **Report Executions**: Track report generation history and status
- **Report Subscriptions**: Manage automated report delivery
- **Analytics Cache**: Performance-optimized data caching
- **Performance Metrics**: Store calculated metrics for quick access

### 3. API Foundation
- **Report Management APIs**: CRUD operations for report templates
- **Execution APIs**: Report generation and status tracking
- **Data Source APIs**: Unified access to module data
- **Analytics APIs**: Pre-calculated metrics and KPIs
- **Export APIs**: File generation and download management

## Technical Specifications

### Backend Architecture
```php
// Core Report Engine
app/Services/Reporting/
├── ReportEngine.php              // Main report generation engine
├── DataSourceManager.php         // Manage data sources
├── ReportBuilder.php            // Build report structures
├── CacheManager.php             // Handle report caching
├── ExportManager.php            // Manage export functionality
└── ScheduleManager.php          // Handle scheduled reports

// Report Models
app/Models/Reporting/
├── Report.php                   // Report template model
├── ReportExecution.php          // Execution tracking
├── ReportSubscription.php       // User subscriptions
├── AnalyticsCache.php          // Cached analytics data
└── PerformanceMetric.php       // Performance metrics

// Controllers
app/Http/Controllers/Reporting/
├── ReportController.php         // Main report management
├── ExecutionController.php      // Report execution
├── AnalyticsController.php      // Analytics endpoints
└── ExportController.php        // Export functionality
```

### Database Migrations
```sql
-- Reports Management
CREATE TABLE reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('financial', 'accommodation', 'activity', 'restaurant', 'inventory', 'staff', 'custom'),
    module VARCHAR(100) NOT NULL,
    parameters JSON,
    query_config JSON,
    chart_config JSON,
    created_by BIGINT UNSIGNED,
    is_template BOOLEAN DEFAULT FALSE,
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_config JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_type_module (type, module),
    INDEX idx_created_by (created_by)
);

-- Report Executions
CREATE TABLE report_executions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT UNSIGNED,
    executed_by BIGINT UNSIGNED,
    parameters JSON,
    status ENUM('pending', 'running', 'completed', 'failed'),
    result_data JSON,
    result_file VARCHAR(255),
    execution_time INT,
    memory_usage INT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id),
    FOREIGN KEY (executed_by) REFERENCES users(id),
    INDEX idx_report_status (report_id, status),
    INDEX idx_executed_by (executed_by)
);

-- Report Subscriptions
CREATE TABLE report_subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    report_id BIGINT UNSIGNED,
    frequency ENUM('daily', 'weekly', 'monthly', 'custom'),
    schedule_config JSON,
    delivery_method ENUM('email', 'download', 'both'),
    format ENUM('pdf', 'excel', 'csv'),
    is_active BOOLEAN DEFAULT TRUE,
    last_sent_at TIMESTAMP NULL,
    next_run_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (report_id) REFERENCES reports(id),
    UNIQUE KEY unique_user_report (user_id, report_id),
    INDEX idx_next_run (next_run_at)
);

-- Analytics Data Cache
CREATE TABLE analytics_cache (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE,
    module VARCHAR(100),
    metric_type VARCHAR(100),
    data JSON,
    parameters JSON,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_module_metric (module, metric_type),
    INDEX idx_expires (expires_at),
    INDEX idx_cache_key (cache_key)
);

-- Performance Metrics
CREATE TABLE performance_metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    metric_type VARCHAR(100),
    metric_name VARCHAR(255),
    metric_category VARCHAR(100),
    value DECIMAL(15,4),
    date DATE,
    hour TINYINT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type_date (metric_type, date),
    INDEX idx_name_date (metric_name, date),
    INDEX idx_category_date (metric_category, date)
);
```

### Frontend Foundation
```typescript
// Core Reporting Components
src/components/Reporting/
├── ReportDashboard.tsx          // Main reporting dashboard
├── ReportBuilder.tsx            // Report creation interface
├── ReportViewer.tsx             // Report display component
├── ChartRenderer.tsx            // Chart visualization
├── DataTable.tsx                // Data table component
├── FilterPanel.tsx              // Report filtering
├── ExportPanel.tsx              // Export options
└── SchedulePanel.tsx            // Schedule management

// Types and Interfaces
src/types/reporting.ts           // TypeScript definitions
src/services/reporting.ts        // API service layer
src/hooks/useReporting.ts        // React hooks for reporting
src/utils/reportUtils.ts         // Utility functions
```

### Caching Strategy
```php
// Cache Configuration
'reporting' => [
    'cache_ttl' => [
        'dashboard_metrics' => 300,      // 5 minutes
        'report_data' => 900,            // 15 minutes
        'analytics_data' => 1800,        // 30 minutes
        'financial_reports' => 3600,     // 1 hour
    ],
    'cache_keys' => [
        'dashboard' => 'reporting:dashboard:{user_id}:{date}',
        'report' => 'reporting:report:{id}:{params_hash}',
        'analytics' => 'reporting:analytics:{module}:{metric}:{date}',
    ]
],
```

## Implementation Phases

### Phase 1: Database Schema and Models (2 days)
1. **Database Migration Creation**
   - Create migration files for all reporting tables
   - Define indexes for optimal query performance
   - Set up foreign key constraints

2. **Eloquent Models Development**
   - Create Report model with relationships
   - Implement ReportExecution model
   - Build ReportSubscription model
   - Create AnalyticsCache and PerformanceMetric models

3. **Model Relationships**
   - Define relationships between models
   - Implement query scopes for common operations
   - Add model factories for testing

### Phase 2: Core Services and Infrastructure (2 days)
1. **Report Engine Service**
   - Build core report generation engine
   - Implement data source management
   - Create report builder functionality

2. **Cache Management Service**
   - Implement Redis caching strategy
   - Create cache invalidation logic
   - Build cache warming functionality

3. **Background Job System**
   - Create report generation jobs
   - Implement job queues for performance
   - Add job failure handling

### Phase 3: API Controllers and Routes (1 day)
1. **Report Management APIs**
   - CRUD operations for reports
   - Report template management
   - Report execution endpoints

2. **Analytics APIs**
   - Dashboard metrics endpoints
   - Performance data APIs
   - Real-time analytics endpoints

3. **Export and Schedule APIs**
   - Export functionality
   - Schedule management
   - Subscription handling

### Phase 4: Frontend Foundation (1 day)
1. **React Components**
   - Base reporting components
   - Chart rendering components
   - Data table components

2. **State Management**
   - Redux store for reporting data
   - Actions and reducers
   - API integration hooks

3. **Routing and Navigation**
   - Reporting module routes
   - Navigation components
   - Permission-based routing

## Quality Assurance

### Testing Requirements
1. **Unit Tests**
   - Service class testing
   - Model relationship testing
   - Utility function testing

2. **Integration Tests**
   - API endpoint testing
   - Database operation testing
   - Cache functionality testing

3. **Performance Tests**
   - Report generation performance
   - Cache efficiency testing
   - Database query optimization

### Code Quality
- **PHP Standards**: PSR-12 compliance
- **TypeScript Standards**: Strict type checking
- **Documentation**: Comprehensive inline documentation
- **Error Handling**: Robust error handling and logging

## Success Metrics

### Performance Metrics
- **Report Generation Time**: < 30 seconds for standard reports
- **Cache Hit Rate**: > 80% for frequently accessed data
- **API Response Time**: < 2 seconds for dashboard metrics
- **Database Query Performance**: < 500ms for complex queries

### Functional Metrics
- **Report Template Creation**: Users can create custom reports
- **Background Processing**: Reports generate without blocking UI
- **Cache Efficiency**: Frequently accessed data loads quickly
- **Error Recovery**: System handles failures gracefully

## Risk Mitigation

### Technical Risks
- **Performance Issues**: Implement comprehensive caching and optimization
- **Memory Usage**: Use chunked processing for large datasets
- **Data Consistency**: Implement transaction management
- **Cache Invalidation**: Clear strategy for cache updates

### Integration Risks
- **Module Dependencies**: Careful dependency management
- **Data Synchronization**: Ensure data consistency across modules
- **Version Compatibility**: Maintain backward compatibility

## Dependencies

### Internal Dependencies
- **Phase 1**: User authentication and role management
- **Phase 2**: Accommodation and activity data structures
- **Phase 3**: Restaurant and billing data
- **Phase 4**: Inventory management data
- **Phase 5**: API infrastructure

### External Dependencies
- **Laravel Framework**: 10.x for backend
- **React**: 18.x for frontend
- **Redis**: For caching
- **MySQL**: 8.0+ for database
- **Chart.js**: For data visualization

## Deliverables

### Backend Deliverables
- [ ] Database migrations for reporting tables
- [ ] Eloquent models with relationships
- [ ] Core reporting services
- [ ] API controllers and routes
- [ ] Background job classes
- [ ] Cache management system

### Frontend Deliverables
- [ ] React components for reporting
- [ ] TypeScript interfaces and types
- [ ] State management setup
- [ ] API service integration
- [ ] Base routing configuration

### Documentation Deliverables
- [ ] API documentation
- [ ] Database schema documentation
- [ ] Service class documentation
- [ ] Component usage guide
- [ ] Installation and setup guide

### Testing Deliverables
- [ ] Unit test suite
- [ ] Integration test suite
- [ ] Performance test setup
- [ ] Testing documentation

---

**Estimated Completion**: End of Week 1
**Next Phase**: Financial Reports and Analytics (Issue #02)
