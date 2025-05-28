# PHASE 7 WIREFRAME - REPORTING SYSTEM
## Banrimkwae Resort Management System

### Document Information
- **Project**: Banrimkwae Resort Management System
- **Phase**: 7 - Reporting System
- **Duration**: 4-6 weeks
- **Document Version**: 1.0
- **Last Updated**: May 28, 2025
- **Document Type**: Wireframe Specifications

---

## TABLE OF CONTENTS
1. [Phase Overview](#1-phase-overview)
2. [Design System Reference](#2-design-system-reference)
3. [Main Dashboard](#3-main-dashboard)
4. [Financial Reports](#4-financial-reports)
5. [Accommodation Reports](#5-accommodation-reports)
6. [Activity Reports](#6-activity-reports)
7. [Restaurant Reports](#7-restaurant-reports)
8. [Inventory Reports](#8-inventory-reports)
9. [Staff Performance Reports](#9-staff-performance-reports)
10. [Custom Report Builder](#10-custom-report-builder)
11. [Analytics Dashboard](#11-analytics-dashboard)
12. [Export and Scheduling](#12-export-and-scheduling)
13. [Mobile Reports](#13-mobile-reports)
14. [Technical Specifications](#14-technical-specifications)
15. [API Endpoints](#15-api-endpoints)

---

## 1. PHASE OVERVIEW

### 1.1 Phase Objectives
- Develop comprehensive reporting system for all management modules
- Create real-time analytics and business intelligence dashboards
- Implement custom report generation capabilities
- Provide data visualization and performance monitoring
- Enable automated report scheduling and distribution
- Support decision-making with actionable insights

### 1.2 Key Features
- **Multi-Module Reporting**: Reports for accommodation, activity, restaurant, and inventory management
- **Financial Analytics**: Revenue tracking, cost analysis, and profitability reports
- **Operational Metrics**: Performance indicators across all resort operations
- **Custom Reports**: User-defined report generation with filters and parameters
- **Real-time Dashboards**: Live data visualization and monitoring
- **Export Capabilities**: Multiple export formats (PDF, Excel, CSV)
- **Scheduled Reports**: Automated report generation and distribution
- **Mobile Access**: Responsive reports accessible on mobile devices

### 1.3 User Roles and Access Levels
- **Admin**: Full access to all reports and analytics
- **Manager**: Access to management reports and departmental analytics
- **Officer**: Department-specific reports and operational metrics
- **Staff**: Basic reports related to their work areas
- **Guest**: Limited access to personal booking and billing reports

---

## 2. DESIGN SYSTEM REFERENCE

### 2.1 Color Palette (Inherited from Phase 1)
```
Primary Colors:
- Primary Blue: #2563EB
- Primary Light: #3B82F6
- Primary Dark: #1D4ED8

Secondary Colors:
- Green Success: #059669
- Yellow Warning: #D97706
- Red Error: #DC2626
- Orange Info: #EA580C

Neutral Colors:
- Dark: #1F2937
- Medium: #6B7280
- Light: #F3F4F6
- White: #FFFFFF

Thai Cultural Accent:
- Gold: #F59E0B
- Deep Green: #065F46
```

### 2.2 Typography
```
Font Family: 'Inter', 'Sarabun' (for Thai), sans-serif

Headers:
- H1: 32px, font-weight: 700
- H2: 24px, font-weight: 600
- H3: 20px, font-weight: 600
- H4: 18px, font-weight: 600

Body Text:
- Large: 16px, font-weight: 400
- Normal: 14px, font-weight: 400
- Small: 12px, font-weight: 400

Interface:
- Button: 14px, font-weight: 500
- Label: 12px, font-weight: 500, uppercase
```

### 2.3 Component Standards
- **Cards**: White background, rounded corners (8px), subtle shadow
- **Buttons**: Consistent with design system from previous phases
- **Forms**: Standard form styling with validation states
- **Tables**: Responsive data tables with sorting and filtering
- **Charts**: Consistent color scheme and styling
- **Modals**: Centered overlays with backdrop blur

---

## 3. MAIN DASHBOARD

### 3.1 Reports Dashboard Overview
**Purpose**: Central hub for accessing all reporting modules and key metrics

**Layout Description**:
- **Header**: Navigation breadcrumb, user profile, notifications
- **Quick Stats Bar**: High-level KPIs across all modules (revenue, occupancy, orders, inventory alerts)
- **Module Navigation**: Grid of reporting modules with icons and descriptions
- **Recent Reports**: List of recently generated reports with quick access
- **Scheduled Reports**: Upcoming scheduled reports and delivery status
- **Alerts Section**: System alerts for reporting issues or important metrics

**Key Components**:
1. **KPI Summary Cards**
   - Today's revenue across all modules
   - Current occupancy rate
   - Active orders and reservations
   - Critical inventory alerts
   - Staff performance summary

2. **Module Access Grid**
   - Financial Reports (revenue, costs, profitability)
   - Accommodation Reports (occupancy, bookings, revenue)
   - Activity Reports (participation, revenue, popularity)
   - Restaurant Reports (orders, revenue, inventory)
   - Inventory Reports (stock levels, costs, movements)
   - Staff Performance (productivity, tasks, efficiency)

3. **Quick Actions Panel**
   - Generate custom report
   - Schedule new report
   - Export data
   - View analytics dashboard

### 3.2 Navigation and Filters
- **Date Range Picker**: Global date filtering for all reports
- **Department Filter**: Filter reports by specific departments
- **User Role Context**: Show relevant reports based on user permissions
- **Search Functionality**: Search through available reports and data

---

## 4. FINANCIAL REPORTS

### 4.1 Revenue Dashboard
**Purpose**: Comprehensive overview of all revenue streams

**Page Components**:
1. **Revenue Summary Cards**
   - Total revenue (daily, weekly, monthly, yearly)
   - Revenue by module (accommodation, activities, restaurant)
   - Year-over-year comparison
   - Revenue targets vs actual

2. **Revenue Trends Chart**
   - Line chart showing revenue trends over time
   - Multiple series for different revenue streams
   - Ability to toggle data series on/off
   - Zoom and pan functionality

3. **Revenue Breakdown**
   - Pie chart showing revenue distribution by module
   - Table with detailed breakdown by service type
   - Percentage contribution analysis

4. **Financial Performance Metrics**
   - Average daily rate (ADR)
   - Revenue per available room (RevPAR)
   - Average spend per guest
   - Conversion rates by booking channel

### 4.2 Cost Analysis Reports
**Purpose**: Track and analyze all operational costs

**Page Components**:
1. **Cost Overview**
   - Total costs by category (staff, inventory, utilities, maintenance)
   - Cost trends over time
   - Budget vs actual spending
   - Cost per guest metrics

2. **Department Cost Breakdown**
   - Detailed costs by department
   - Cost center performance
   - Variable vs fixed costs
   - Cost allocation analysis

3. **Profitability Analysis**
   - Gross profit margins by service
   - Net profit calculations
   - ROI on activities and services
   - Break-even analysis

### 4.3 Billing and Payment Reports
**Purpose**: Track guest billing and payment processing

**Page Components**:
1. **Payment Summary**
   - Daily payment collection
   - Payment method breakdown
   - Outstanding balances
   - Refund and adjustment tracking

2. **Billing Analytics**
   - Average bill amount by guest type
   - Billing accuracy metrics
   - Time-to-payment analysis
   - Guest payment preferences

---

## 5. ACCOMMODATION REPORTS

### 5.1 Occupancy Reports
**Purpose**: Track accommodation utilization and performance

**Page Components**:
1. **Occupancy Overview**
   - Current occupancy rate
   - Occupancy trends (daily, weekly, monthly)
   - Occupancy by accommodation type (rafts vs houses)
   - Room-level occupancy details

2. **Booking Performance**
   - Booking conversion rates
   - Lead time analysis
   - Cancellation and no-show rates
   - Source of bookings analysis

3. **Revenue per Room**
   - ADR (Average Daily Rate) by room type
   - RevPAR (Revenue per Available Room)
   - Revenue trends by accommodation type
   - Seasonal performance analysis

### 5.2 Guest Analytics
**Purpose**: Analyze guest behavior and preferences

**Page Components**:
1. **Guest Demographics**
   - Guest origin analysis (domestic vs international)
   - Age group distribution
   - Group size analysis
   - Repeat guest tracking

2. **Stay Patterns**
   - Average length of stay
   - Peak booking periods
   - Popular room configurations
   - Guest satisfaction metrics

3. **Service Utilization**
   - Cross-selling success (activities, restaurant)
   - Guest spending patterns
   - Service request frequency
   - Guest feedback analysis

### 5.3 Maintenance and Housekeeping Reports
**Purpose**: Track accommodation maintenance and cleanliness

**Page Components**:
1. **Maintenance Tracking**
   - Maintenance requests by room
   - Response time metrics
   - Maintenance costs by accommodation
   - Preventive maintenance scheduling

2. **Housekeeping Performance**
   - Room cleaning times
   - Quality scores by housekeeper
   - Supply usage tracking
   - Guest satisfaction with cleanliness

---

## 6. ACTIVITY REPORTS

### 6.1 Activity Performance Dashboard
**Purpose**: Analyze activity popularity and revenue

**Page Components**:
1. **Activity Metrics**
   - Participation rates by activity
   - Revenue generated per activity
   - Capacity utilization rates
   - Popular activity combinations

2. **Booking Trends**
   - Activity booking patterns
   - Seasonal demand variations
   - Advanced booking vs walk-in
   - Group vs individual bookings

3. **Package Performance**
   - Package deal uptake rates
   - Package revenue contribution
   - Most popular package combinations
   - Package profitability analysis

### 6.2 Staff and Resource Utilization
**Purpose**: Track activity staff and equipment efficiency

**Page Components**:
1. **Staff Performance**
   - Activity guide efficiency
   - Guest satisfaction by guide
   - Staff scheduling optimization
   - Training needs analysis

2. **Equipment and Resources**
   - Equipment utilization rates
   - Maintenance and replacement schedules
   - Safety incident tracking
   - Resource cost analysis

### 6.3 Guest Satisfaction and Feedback
**Purpose**: Monitor activity quality and guest experience

**Page Components**:
1. **Satisfaction Metrics**
   - Activity rating averages
   - Guest feedback trends
   - Complaint and compliment tracking
   - Improvement recommendation analysis

2. **Return Participation**
   - Repeat activity participation
   - Guest loyalty in activities
   - Cross-activity participation
   - Activity recommendation success

---

## 7. RESTAURANT REPORTS

### 7.1 Restaurant Performance Dashboard
**Purpose**: Track restaurant operations and profitability

**Page Components**:
1. **Sales Overview**
   - Daily/weekly/monthly sales
   - Sales by service type (dine-in, room service, takeaway)
   - Average order value
   - Sales per seat hour

2. **Menu Performance**
   - Best-selling items
   - Item profitability analysis
   - Menu category performance
   - Seasonal menu trends

3. **Service Metrics**
   - Order fulfillment times
   - Kitchen efficiency metrics
   - Customer wait times
   - Service quality ratings

### 7.2 Kitchen Operations Reports
**Purpose**: Monitor kitchen efficiency and food preparation

**Page Components**:
1. **Kitchen Performance**
   - Order processing times by meal type
   - Kitchen staff productivity
   - Peak hour analysis
   - Equipment utilization

2. **Food Quality and Safety**
   - Temperature monitoring logs
   - Food safety compliance
   - Waste tracking and reduction
   - Inventory turnover rates

### 7.3 Customer Analytics
**Purpose**: Analyze dining patterns and customer preferences

**Page Components**:
1. **Dining Patterns**
   - Peak dining hours analysis
   - Table turnover rates
   - Guest dining frequency
   - Reservation vs walk-in ratios

2. **Preference Analysis**
   - Popular cuisine types
   - Dietary preference tracking
   - Guest spending patterns
   - Meal timing preferences

---

## 8. INVENTORY REPORTS

### 8.1 Stock Level Dashboard
**Purpose**: Monitor current inventory levels and alerts

**Page Components**:
1. **Current Stock Overview**
   - Stock levels by category
   - Low stock alerts
   - Overstock situations
   - Stock value summary

2. **Stock Movement Analysis**
   - Daily/weekly stock consumption
   - Fast-moving vs slow-moving items
   - Stock turnover rates
   - Seasonal usage patterns

3. **Reorder Management**
   - Items requiring reorder
   - Automatic reorder triggers
   - Supplier lead times
   - Reorder quantity optimization

### 8.2 Purchase Order Reports
**Purpose**: Track purchasing activities and supplier performance

**Page Components**:
1. **Purchase Analysis**
   - Purchase order history
   - Supplier performance metrics
   - Cost trends by supplier
   - Purchase order accuracy

2. **Supplier Management**
   - Supplier reliability scores
   - Delivery performance
   - Quality ratings
   - Cost comparison analysis

### 8.3 Cost and Valuation Reports
**Purpose**: Monitor inventory costs and financial impact

**Page Components**:
1. **Cost Analysis**
   - Inventory valuation
   - Cost of goods sold (COGS)
   - Inventory carrying costs
   - Shrinkage and loss tracking

2. **Financial Impact**
   - Inventory investment ROI
   - Cost savings opportunities
   - Budget vs actual spending
   - Price variance analysis

---

## 9. STAFF PERFORMANCE REPORTS

### 9.1 Individual Performance Dashboard
**Purpose**: Track individual staff member performance

**Page Components**:
1. **Performance Metrics**
   - Task completion rates
   - Quality scores
   - Guest satisfaction ratings
   - Productivity measurements

2. **Attendance and Scheduling**
   - Attendance tracking
   - Overtime analysis
   - Schedule adherence
   - Leave utilization

3. **Development and Training**
   - Training completion status
   - Skill development progress
   - Performance improvement plans
   - Career advancement tracking

### 9.2 Department Performance
**Purpose**: Analyze performance by department and team

**Page Components**:
1. **Department Metrics**
   - Department productivity
   - Team collaboration scores
   - Customer service ratings
   - Efficiency comparisons

2. **Resource Utilization**
   - Staff allocation efficiency
   - Workload distribution
   - Peak hour coverage
   - Cross-training effectiveness

### 9.3 HR Analytics
**Purpose**: Strategic HR insights and workforce planning

**Page Components**:
1. **Workforce Analytics**
   - Employee retention rates
   - Recruitment effectiveness
   - Performance distribution
   - Compensation analysis

2. **Strategic Planning**
   - Skill gap analysis
   - Succession planning
   - Training needs assessment
   - Workforce forecasting

---

## 10. CUSTOM REPORT BUILDER

### 10.1 Report Builder Interface
**Purpose**: Allow users to create custom reports with specific parameters

**Page Components**:
1. **Data Source Selection**
   - Available data modules
   - Table and field selection
   - Data relationship mapping
   - Real-time data preview

2. **Filter Configuration**
   - Date range selectors
   - Category filters
   - Custom conditions
   - Parameter inputs

3. **Report Layout Design**
   - Chart type selection
   - Table configuration
   - Layout templates
   - Custom formatting options

### 10.2 Advanced Analytics Tools
**Purpose**: Provide sophisticated analysis capabilities

**Page Components**:
1. **Statistical Analysis**
   - Trend analysis tools
   - Correlation analysis
   - Regression models
   - Forecasting capabilities

2. **Visualization Options**
   - Multiple chart types
   - Interactive visualizations
   - Drill-down capabilities
   - Comparative analysis

### 10.3 Report Management
**Purpose**: Manage created reports and templates

**Page Components**:
1. **Report Library**
   - Saved report templates
   - Report sharing options
   - Version control
   - Access permissions

2. **Automation Setup**
   - Scheduled generation
   - Distribution lists
   - Alert configurations
   - Performance monitoring

---

## 11. ANALYTICS DASHBOARD

### 11.1 Executive Dashboard
**Purpose**: High-level analytics for management decision-making

**Page Components**:
1. **Key Performance Indicators**
   - Resort-wide KPIs
   - Performance vs targets
   - Trend indicators
   - Alert notifications

2. **Business Intelligence**
   - Predictive analytics
   - Market trends
   - Competitive analysis
   - Growth opportunities

3. **Financial Summary**
   - Revenue performance
   - Cost optimization
   - Profitability trends
   - Investment ROI

### 11.2 Operational Analytics
**Purpose**: Detailed operational insights for department managers

**Page Components**:
1. **Efficiency Metrics**
   - Process efficiency
   - Resource utilization
   - Bottleneck identification
   - Improvement opportunities

2. **Quality Metrics**
   - Service quality scores
   - Guest satisfaction
   - Error rates
   - Compliance levels

### 11.3 Predictive Analytics
**Purpose**: Forecasting and trend prediction

**Page Components**:
1. **Demand Forecasting**
   - Booking predictions
   - Seasonal trends
   - Event impact analysis
   - Capacity planning

2. **Revenue Optimization**
   - Dynamic pricing insights
   - Revenue forecasting
   - Market opportunity analysis
   - Competitive positioning

---

## 12. EXPORT AND SCHEDULING

### 12.1 Export Options
**Purpose**: Provide flexible data export capabilities

**Features**:
1. **Export Formats**
   - PDF reports with formatting
   - Excel spreadsheets with data
   - CSV files for data analysis
   - JSON for API integration

2. **Export Configuration**
   - Custom formatting options
   - Data filtering before export
   - Batch export capabilities
   - Large dataset handling

### 12.2 Scheduled Reports
**Purpose**: Automate regular report generation and distribution

**Features**:
1. **Scheduling Options**
   - Daily, weekly, monthly schedules
   - Custom scheduling patterns
   - Holiday and exception handling
   - Time zone considerations

2. **Distribution Management**
   - Email distribution lists
   - Automatic delivery
   - Delivery confirmation
   - Failed delivery handling

### 12.3 Report Subscriptions
**Purpose**: Allow users to subscribe to relevant reports

**Features**:
1. **Subscription Management**
   - User subscription preferences
   - Report category subscriptions
   - Frequency preferences
   - Notification settings

2. **Personalization**
   - Customized report content
   - Role-based report access
   - Personal dashboards
   - Favorite reports

---

## 13. MOBILE REPORTS

### 13.1 Mobile Dashboard
**Purpose**: Provide key reports and metrics on mobile devices

**Design Considerations**:
- **Responsive Layout**: Optimized for mobile screens
- **Touch-Friendly**: Large touch targets and swipe gestures
- **Simplified Navigation**: Easy-to-use mobile navigation
- **Offline Capability**: Cache key reports for offline viewing

**Key Features**:
1. **Mobile KPI Cards**
   - Swipeable metric cards
   - Quick status indicators
   - Tap for detailed views
   - Real-time updates

2. **Mobile Charts**
   - Touch-responsive charts
   - Pinch-to-zoom functionality
   - Simplified chart types
   - Portrait/landscape optimization

### 13.2 Mobile Report Access
**Purpose**: Allow access to reports while on-the-go

**Features**:
1. **Quick Reports**
   - Pre-configured mobile reports
   - Fast loading times
   - Essential information focus
   - Share via mobile apps

2. **Mobile Filters**
   - Simplified filter interface
   - Date picker optimization
   - Quick filter presets
   - Voice input capability

### 13.3 Mobile Notifications
**Purpose**: Alert users to important metrics and report availability

**Features**:
1. **Push Notifications**
   - Alert threshold breaches
   - Report completion notifications
   - Critical metric updates
   - Scheduled report delivery

2. **In-App Notifications**
   - Visual notification indicators
   - Notification history
   - Action items from reports
   - Follow-up reminders

---

## 14. TECHNICAL SPECIFICATIONS

### 14.1 Frontend Technologies
```
Framework: React.js with TypeScript
State Management: Redux Toolkit
Routing: React Router DOM
UI Components: Material-UI or Ant Design
Charts: Chart.js or D3.js with React wrappers
Data Tables: React Table with sorting/filtering
Forms: React Hook Form with validation
Testing: Jest + React Testing Library

Thai Language Support:
- React-i18next for internationalization
- Thai font integration
- RTL layout support where needed
- Date/time localization
```

### 14.2 Backend Technologies
```
Framework: Laravel 10+ (PHP 8.1+)
Database: MySQL 8.0+ with InnoDB engine
Caching: Redis for session and cache management
Queue System: Laravel Queue with Redis
File Storage: Laravel Storage with S3 compatibility
API: RESTful APIs with Laravel Sanctum
Real-time: Laravel WebSockets or Pusher
Reporting Engine: Laravel Excel for exports

Performance Optimization:
- Database query optimization
- Eloquent relationship optimization
- Caching strategies for reports
- Background job processing
```

### 14.3 Database Schema Additions
```sql
-- Reports Management
CREATE TABLE reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('financial', 'accommodation', 'activity', 'restaurant', 'inventory', 'staff', 'custom'),
    module VARCHAR(100) NOT NULL,
    parameters JSON,
    created_by BIGINT UNSIGNED,
    is_template BOOLEAN DEFAULT FALSE,
    is_scheduled BOOLEAN DEFAULT FALSE,
    schedule_config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Report Executions
CREATE TABLE report_executions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT UNSIGNED,
    executed_by BIGINT UNSIGNED,
    parameters JSON,
    status ENUM('pending', 'running', 'completed', 'failed'),
    result_file VARCHAR(255),
    execution_time INT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (report_id) REFERENCES reports(id),
    FOREIGN KEY (executed_by) REFERENCES users(id),
    INDEX idx_report_status (report_id, status)
);

-- Report Subscriptions
CREATE TABLE report_subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    report_id BIGINT UNSIGNED,
    frequency ENUM('daily', 'weekly', 'monthly', 'custom'),
    schedule_config JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (report_id) REFERENCES reports(id),
    UNIQUE KEY unique_user_report (user_id, report_id)
);

-- Analytics Data Cache
CREATE TABLE analytics_cache (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE,
    module VARCHAR(100),
    data JSON,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_module_key (module, cache_key),
    INDEX idx_expires (expires_at)
);

-- Performance Metrics
CREATE TABLE performance_metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    metric_type VARCHAR(100),
    metric_name VARCHAR(255),
    value DECIMAL(15,4),
    date DATE,
    hour TINYINT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type_date (metric_type, date),
    INDEX idx_name_date (metric_name, date)
);
```

### 14.4 Performance Optimization
```
Caching Strategy:
- Redis cache for frequently accessed data
- Database query result caching
- Report result caching with TTL
- Browser caching for static assets

Database Optimization:
- Optimized indexes for reporting queries
- Database views for complex calculations
- Partitioning for large historical data
- Query optimization and monitoring

Frontend Optimization:
- Code splitting for report modules
- Lazy loading of chart components
- Virtualization for large data tables
- Progressive Web App features
```

### 14.5 Security Measures
```
Data Protection:
- Role-based access to reports
- Data anonymization options
- Audit trails for report access
- Secure report file storage

API Security:
- Authentication required for all endpoints
- Rate limiting on report generation
- Input validation and sanitization
- SQL injection prevention

Export Security:
- Watermarked PDF exports
- Access logging for exports
- Temporary file cleanup
- Secure file transmission
```

---

## 15. API ENDPOINTS

### 15.1 Report Management APIs
```
GET /api/reports
- List available reports with pagination
- Filters: type, module, created_by
- Returns: report list with metadata

POST /api/reports
- Create new report template
- Body: name, description, type, parameters
- Returns: created report object

GET /api/reports/{id}
- Get specific report details
- Returns: report configuration and metadata

PUT /api/reports/{id}
- Update existing report
- Body: updated report configuration
- Returns: updated report object

DELETE /api/reports/{id}
- Delete report template
- Returns: success confirmation

POST /api/reports/{id}/execute
- Execute report with parameters
- Body: execution parameters, export format
- Returns: execution ID and status

GET /api/reports/executions/{id}
- Check execution status
- Returns: execution status and result file URL

GET /api/reports/executions/{id}/download
- Download report result file
- Returns: file download stream
```

### 15.2 Analytics APIs
```
GET /api/analytics/kpis
- Get key performance indicators
- Query params: date_range, modules
- Returns: KPI values and trends

GET /api/analytics/revenue
- Get revenue analytics
- Query params: date_range, breakdown_by
- Returns: revenue data and charts

GET /api/analytics/occupancy
- Get occupancy analytics
- Query params: date_range, accommodation_type
- Returns: occupancy rates and trends

GET /api/analytics/activity-performance
- Get activity performance metrics
- Query params: date_range, activity_ids
- Returns: activity analytics data

GET /api/analytics/restaurant-performance
- Get restaurant performance metrics
- Query params: date_range, service_type
- Returns: restaurant analytics data

GET /api/analytics/inventory-status
- Get inventory status and alerts
- Query params: location, category
- Returns: stock levels and movements

GET /api/analytics/staff-performance
- Get staff performance metrics
- Query params: date_range, department
- Returns: staff performance data
```

### 15.3 Dashboard APIs
```
GET /api/dashboard/summary
- Get dashboard summary data
- Returns: high-level metrics and alerts

GET /api/dashboard/charts/{type}
- Get specific chart data
- Path params: chart type (revenue, occupancy, etc.)
- Query params: date_range, filters
- Returns: chart data and configuration

POST /api/dashboard/custom
- Create custom dashboard widget
- Body: widget configuration
- Returns: widget ID and data

GET /api/dashboard/alerts
- Get current system alerts
- Returns: active alerts and notifications

POST /api/dashboard/alerts/acknowledge
- Acknowledge dashboard alerts
- Body: alert IDs
- Returns: acknowledgment confirmation
```

### 15.4 Export and Scheduling APIs
```
POST /api/reports/export
- Export report data
- Body: report_id, format, parameters
- Returns: export job ID

GET /api/reports/export/{job_id}
- Check export job status
- Returns: job status and download URL

POST /api/reports/schedule
- Schedule report generation
- Body: report_id, schedule_config, recipients
- Returns: schedule ID

GET /api/reports/schedules
- List scheduled reports
- Returns: schedule list with next run times

PUT /api/reports/schedules/{id}
- Update scheduled report
- Body: updated schedule configuration
- Returns: updated schedule object

DELETE /api/reports/schedules/{id}
- Delete scheduled report
- Returns: deletion confirmation

POST /api/reports/subscribe
- Subscribe to report
- Body: report_id, frequency, preferences
- Returns: subscription ID

GET /api/reports/subscriptions
- List user report subscriptions
- Returns: subscription list with status
```

### 15.5 Mobile-Specific APIs
```
GET /api/mobile/dashboard
- Get mobile-optimized dashboard
- Returns: condensed metrics for mobile

GET /api/mobile/reports/quick
- Get quick mobile reports
- Query params: type, date_range
- Returns: mobile-formatted report data

POST /api/mobile/notifications/register
- Register device for push notifications
- Body: device_token, user_id, preferences
- Returns: registration confirmation

GET /api/mobile/offline-data
- Get data for offline access
- Returns: essential data for offline viewing

POST /api/mobile/sync
- Sync mobile data changes
- Body: local changes and timestamps
- Returns: sync status and conflicts
```

---

## IMPLEMENTATION NOTES

### Development Priority
1. **Week 1-2**: Core reporting infrastructure and basic financial reports
2. **Week 3-4**: Module-specific reports (accommodation, activity, restaurant, inventory)
3. **Week 5**: Analytics dashboard and custom report builder
4. **Week 6**: Mobile optimization, export features, and testing

### Integration Points
- **Phase 1**: User authentication and role-based access
- **Phase 2**: Accommodation and activity data sources
- **Phase 3**: Restaurant and billing integration
- **Phase 4**: Inventory data and cost calculations
- **Phase 5**: API endpoints and external data access
- **Phase 6**: Mobile app integration and offline capabilities

### Testing Strategy
- **Unit Testing**: Individual report components and calculations
- **Integration Testing**: Cross-module data accuracy
- **Performance Testing**: Large dataset handling and report generation times
- **User Acceptance Testing**: Report accuracy and usability validation
- **Mobile Testing**: Responsive design and mobile-specific features

### Deployment Considerations
- **Data Migration**: Historical data import for trending analysis
- **Performance Monitoring**: Report generation time tracking
- **Backup Strategy**: Report templates and execution history
- **User Training**: Report access and custom report creation
- **Documentation**: User guides and technical documentation

---

**END OF PHASE 7 WIREFRAME DOCUMENT**
