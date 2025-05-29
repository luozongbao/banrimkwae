# Issue #10: Report Automation and Mobile Access

## Overview
Implement comprehensive report automation, scheduling, and mobile access capabilities to ensure stakeholders receive timely reports and can access critical information on-the-go.

## Priority: High
## Estimated Time: 8-10 days
## Dependencies: Issues #01, #02, #03, #04, #05, #06, #07, #08, #09

## Detailed Requirements

### 1. Report Automation System

#### 1.1 Automated Report Scheduling
```php
// app/Services/ReportAutomationService.php
class ReportAutomationService
{
    public function scheduleReport(array $schedule): ReportSchedule
    {
        // Create automated report schedule
        // Set up recurring execution
        // Configure recipient lists
        // Set delivery preferences
    }

    public function executeScheduledReport(ReportSchedule $schedule): void
    {
        // Generate report based on schedule
        // Apply filters and parameters
        // Format output according to preferences
        // Deliver via configured channels
    }

    public function processRecurringReports(): void
    {
        // Check for due reports
        // Execute pending schedules
        // Handle failures and retries
        // Update execution logs
    }
}
```

#### 1.2 Delivery Mechanisms
```php
// app/Services/ReportDeliveryService.php
class ReportDeliveryService
{
    public function deliverReport(Report $report, array $recipients, string $method): bool
    {
        switch ($method) {
            case 'email':
                return $this->deliverViaEmail($report, $recipients);
            case 'sms':
                return $this->deliverViaSMS($report, $recipients);
            case 'push':
                return $this->deliverViaPush($report, $recipients);
            case 'dashboard':
                return $this->saveToInbox($report, $recipients);
            case 'api':
                return $this->deliverViaAPI($report, $recipients);
        }
    }

    private function deliverViaEmail(Report $report, array $recipients): bool
    {
        // Generate email with report attachment
        // Include summary in email body
        // Handle multiple formats (PDF, Excel, etc.)
        // Track delivery status
    }

    private function deliverViaSMS(Report $report, array $recipients): bool
    {
        // Send summary via SMS
        // Include link to full report
        // Handle character limits
        // Track delivery status
    }
}
```

#### 1.3 Alert and Notification System
```php
// app/Services/ReportAlertService.php
class ReportAlertService
{
    public function checkThresholds(Report $report): array
    {
        $alerts = [];
        
        // Check KPI thresholds
        // Identify anomalies
        // Compare against targets
        // Generate alert messages
        
        return $alerts;
    }

    public function sendAlerts(array $alerts): void
    {
        foreach ($alerts as $alert) {
            // Determine urgency level
            // Select appropriate delivery method
            // Send to relevant stakeholders
            // Log alert history
        }
    }

    public function configureAlertRules(array $rules): void
    {
        // Set up threshold-based alerts
        // Configure anomaly detection
        // Define escalation procedures
        // Set up alert suppression rules
    }
}
```

### 2. Mobile Reporting Application

#### 2.1 Mobile-First Report Interface
```typescript
// src/mobile/components/MobileReportDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

interface MobileReportDashboardProps {
  user: User;
  deviceType: 'phone' | 'tablet';
}

const MobileReportDashboard: React.FC<MobileReportDashboardProps> = ({ 
  user, 
  deviceType 
}) => {
  const [currentView, setCurrentView] = useState('overview');
  const [reports, setReports] = useState<Report[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateToNext(),
    onSwipedRight: () => navigateToPrevious(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div className="mobile-dashboard" {...swipeHandlers}>
      {/* Mobile navigation */}
      <MobileNavigation 
        currentView={currentView}
        onNavigate={setCurrentView}
        isOffline={isOffline}
      />

      {/* Quick KPI cards */}
      <div className="kpi-carousel">
        <KPICarousel metrics={reports?.overview?.kpis} />
      </div>

      {/* Interactive charts optimized for touch */}
      <div className="mobile-charts">
        <TouchOptimizedChart 
          data={reports?.chartData}
          type={currentView}
          gestures={true}
        />
      </div>

      {/* Quick actions */}
      <MobileQuickActions 
        actions={getQuickActions(user.role)}
        onAction={handleQuickAction}
      />

      {/* Offline indicator */}
      {isOffline && <OfflineBanner />}
    </div>
  );
};
```

#### 2.2 Progressive Web App (PWA) Implementation
```typescript
// src/mobile/pwa/serviceWorker.ts
class ReportingServiceWorker {
  private cacheName = 'banrimkwae-reports-v1';
  private staticAssets = [
    '/mobile/dashboard',
    '/mobile/reports',
    '/css/mobile.css',
    '/js/mobile-charts.js'
  ];

  async install(): Promise<void> {
    // Cache essential assets
    // Set up offline fallbacks
    // Initialize background sync
  }

  async fetch(request: Request): Promise<Response> {
    // Implement cache-first strategy for static assets
    // Network-first for dynamic data
    // Offline fallbacks for critical reports
  }

  async backgroundSync(): Promise<void> {
    // Sync pending report requests
    // Update cached reports
    // Process offline interactions
  }
}
```

#### 2.3 Offline Capabilities
```typescript
// src/mobile/offline/OfflineReportManager.ts
class OfflineReportManager {
  private indexedDB: IDBDatabase;
  private syncQueue: SyncItem[] = [];

  async cacheReport(report: Report): Promise<void> {
    // Store report data locally
    // Cache associated charts and data
    // Set expiration timestamps
  }

  async getCachedReports(): Promise<Report[]> {
    // Retrieve offline reports
    // Check freshness
    // Return available data
  }

  async queueAction(action: ReportAction): Promise<void> {
    // Queue actions for later sync
    // Store user interactions
    // Maintain offline state
  }

  async syncWhenOnline(): Promise<void> {
    // Process queued actions
    // Update cached data
    // Resolve conflicts
  }
}
```

### 3. Database Schema for Automation

#### 3.1 Report Scheduling Tables
```sql
-- Report schedules
CREATE TABLE report_schedules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    report_config JSON NOT NULL,
    schedule_pattern VARCHAR(100) NOT NULL, -- cron pattern
    timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT UNSIGNED NOT NULL,
    last_executed_at TIMESTAMP NULL,
    next_execution_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_next_execution (next_execution_at),
    INDEX idx_type (report_type),
    INDEX idx_active (is_active)
);

-- Schedule recipients
CREATE TABLE report_schedule_recipients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    schedule_id BIGINT UNSIGNED NOT NULL,
    recipient_type ENUM('user', 'role', 'email', 'phone') NOT NULL,
    recipient_value VARCHAR(255) NOT NULL,
    delivery_method ENUM('email', 'sms', 'push', 'dashboard', 'api') NOT NULL,
    delivery_format ENUM('pdf', 'excel', 'csv', 'json') DEFAULT 'pdf',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES report_schedules(id) ON DELETE CASCADE,
    INDEX idx_schedule (schedule_id),
    INDEX idx_recipient (recipient_type, recipient_value)
);

-- Execution history
CREATE TABLE report_executions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    schedule_id BIGINT UNSIGNED,
    report_id BIGINT UNSIGNED,
    execution_type ENUM('scheduled', 'manual', 'triggered') NOT NULL,
    status ENUM('pending', 'running', 'completed', 'failed', 'cancelled') NOT NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    execution_time DECIMAL(8,3),
    file_path VARCHAR(500),
    file_size BIGINT,
    error_message TEXT,
    delivered_count INT DEFAULT 0,
    failed_deliveries INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES report_schedules(id),
    FOREIGN KEY (report_id) REFERENCES reports(id),
    INDEX idx_schedule (schedule_id),
    INDEX idx_status (status),
    INDEX idx_execution_date (started_at)
);
```

#### 3.2 Alert Configuration Tables
```sql
-- Alert rules
CREATE TABLE report_alert_rules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    metric_path VARCHAR(255) NOT NULL, -- JSON path to metric
    condition_type ENUM('threshold', 'change', 'anomaly', 'missing') NOT NULL,
    condition_config JSON NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_report_type (report_type),
    INDEX idx_active (is_active)
);

-- Alert history
CREATE TABLE report_alerts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rule_id BIGINT UNSIGNED NOT NULL,
    report_execution_id BIGINT UNSIGNED,
    alert_level ENUM('info', 'warning', 'error', 'critical') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metric_value DECIMAL(15,4),
    threshold_value DECIMAL(15,4),
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by BIGINT UNSIGNED NULL,
    acknowledged_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rule_id) REFERENCES report_alert_rules(id),
    FOREIGN KEY (report_execution_id) REFERENCES report_executions(id),
    FOREIGN KEY (acknowledged_by) REFERENCES users(id),
    INDEX idx_rule (rule_id),
    INDEX idx_level (alert_level),
    INDEX idx_acknowledged (is_acknowledged)
);
```

#### 3.3 Mobile Session Management
```sql
-- Mobile sessions
CREATE TABLE mobile_report_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    device_type ENUM('phone', 'tablet') NOT NULL,
    app_version VARCHAR(50),
    last_sync_at TIMESTAMP NULL,
    cached_reports JSON,
    offline_actions JSON,
    push_token VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_device (user_id, device_id),
    INDEX idx_device_type (device_type),
    INDEX idx_last_sync (last_sync_at)
);
```

### 4. Backend Implementation

#### 4.1 Report Automation Controller
```php
// app/Http/Controllers/ReportAutomationController.php
<?php

namespace App\Http\Controllers;

use App\Services\ReportAutomationService;
use App\Services\ReportDeliveryService;
use App\Services\ReportAlertService;

class ReportAutomationController extends Controller
{
    public function createSchedule(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'report_type' => 'required|string',
            'report_config' => 'required|array',
            'schedule_pattern' => 'required|string',
            'recipients' => 'required|array',
            'delivery_preferences' => 'required|array'
        ]);

        $schedule = $this->automationService->createSchedule($validated);

        return response()->json([
            'success' => true,
            'schedule' => $schedule,
            'next_execution' => $schedule->next_execution_at
        ]);
    }

    public function executeReport(Request $request, $scheduleId)
    {
        $schedule = ReportSchedule::findOrFail($scheduleId);
        
        $execution = $this->automationService->executeReport($schedule);
        
        return response()->json([
            'success' => true,
            'execution_id' => $execution->id,
            'status' => $execution->status
        ]);
    }

    public function getExecutionHistory(Request $request)
    {
        $history = ReportExecution::with(['schedule', 'report'])
            ->when($request->schedule_id, function ($query, $scheduleId) {
                return $query->where('schedule_id', $scheduleId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($history);
    }
}
```

#### 4.2 Mobile API Controller
```php
// app/Http/Controllers/MobileReportController.php
<?php

namespace App\Http\Controllers;

use App\Services\MobileReportService;

class MobileReportController extends Controller
{
    public function getDashboard(Request $request)
    {
        $user = $request->user();
        $deviceType = $request->header('X-Device-Type', 'phone');
        
        $dashboard = $this->mobileService->getDashboardForDevice($user, $deviceType);
        
        return response()->json([
            'dashboard' => $dashboard,
            'last_updated' => now()->toISOString(),
            'cache_expires' => now()->addMinutes(5)->toISOString()
        ]);
    }

    public function syncOfflineData(Request $request)
    {
        $user = $request->user();
        $deviceId = $request->header('X-Device-ID');
        
        $syncResult = $this->mobileService->syncOfflineData(
            $user,
            $deviceId,
            $request->input('offline_actions', []),
            $request->input('cached_reports', [])
        );
        
        return response()->json($syncResult);
    }

    public function getOfflineReports(Request $request)
    {
        $user = $request->user();
        $reports = $this->mobileService->getOfflineCapableReports($user);
        
        return response()->json([
            'reports' => $reports,
            'expires_at' => now()->addHours(24)->toISOString()
        ]);
    }
}
```

### 5. Queue Jobs for Automation

#### 5.1 Report Generation Jobs
```php
// app/Jobs/ExecuteScheduledReportJob.php
<?php

namespace App\Jobs;

use App\Models\ReportSchedule;
use App\Services\ReportGenerationService;
use App\Services\ReportDeliveryService;

class ExecuteScheduledReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private ReportSchedule $schedule
    ) {}

    public function handle(
        ReportGenerationService $generator,
        ReportDeliveryService $delivery
    ): void {
        try {
            // Generate the report
            $report = $generator->generateReport(
                $this->schedule->report_type,
                $this->schedule->report_config
            );

            // Deliver to all recipients
            $delivery->deliverToScheduleRecipients($report, $this->schedule);

            // Update schedule execution time
            $this->schedule->update([
                'last_executed_at' => now(),
                'next_execution_at' => $this->calculateNextExecution()
            ]);

        } catch (\Exception $e) {
            // Log error and notify administrators
            \Log::error('Scheduled report execution failed', [
                'schedule_id' => $this->schedule->id,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }
}
```

#### 5.2 Mobile Sync Jobs
```php
// app/Jobs/SyncMobileReportDataJob.php
class SyncMobileReportDataJob implements ShouldQueue
{
    public function handle(): void
    {
        // Sync reports for all mobile sessions
        // Update cached data
        // Process offline actions
        // Send push notifications for updates
    }
}
```

### 6. Frontend Mobile Components

#### 6.1 Mobile Report Viewer
```typescript
// src/mobile/components/MobileReportViewer.tsx
import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Gesture } from '@ionic/react';

interface MobileReportViewerProps {
  report: Report;
  onShare: (report: Report) => void;
  onExport: (report: Report, format: string) => void;
}

const MobileReportViewer: React.FC<MobileReportViewerProps> = ({
  report,
  onShare,
  onExport
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [pinchScale, setPinchScale] = useState(1);
  const elementRef = useRef<HTMLDivElement>(null);

  const pinchGesture = Gesture.createGesture({
    el: elementRef.current!,
    gestureName: 'pinch',
    threshold: 0,
    onMove: (detail) => setPinchScale(detail.currentRatio),
    onEnd: () => setPinchScale(1)
  });

  return (
    <div ref={elementRef} className="mobile-report-viewer">
      {/* Report header */}
      <div className="report-header">
        <h2>{report.title}</h2>
        <div className="report-actions">
          <button onClick={() => onShare(report)}>
            <ShareIcon />
          </button>
          <button onClick={() => onExport(report, 'pdf')}>
            <DownloadIcon />
          </button>
        </div>
      </div>

      {/* Swipeable report sections */}
      <Swiper
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
        spaceBetween={20}
        style={{ transform: `scale(${pinchScale})` }}
      >
        {report.sections.map((section, index) => (
          <SwiperSlide key={index}>
            <MobileReportSection 
              section={section}
              isActive={currentSlide === index}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Page indicator */}
      <div className="slide-indicator">
        {currentSlide + 1} / {report.sections.length}
      </div>
    </div>
  );
};
```

#### 6.2 Touch-Optimized Charts
```typescript
// src/mobile/components/TouchOptimizedChart.tsx
import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Hammer } from 'hammerjs';

Chart.register(...registerables);

interface TouchOptimizedChartProps {
  data: ChartData;
  type: string;
  gestures?: boolean;
}

const TouchOptimizedChart: React.FC<TouchOptimizedChartProps> = ({
  data,
  type,
  gestures = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d')!;
    
    chartRef.current = new Chart(ctx, {
      type: type as any,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          x: {
            grid: {
              display: false // Cleaner mobile view
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            cornerRadius: 8,
            displayColors: false
          }
        }
      }
    });

    // Add touch gestures if enabled
    if (gestures && canvasRef.current) {
      const hammer = new Hammer(canvasRef.current);
      
      hammer.get('pinch').set({ enable: true });
      hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

      hammer.on('pinchstart pinchend', (e) => {
        // Handle zoom gestures
      });

      hammer.on('panstart panend', (e) => {
        // Handle pan gestures for scrolling through data
      });
    }

    return () => {
      chartRef.current?.destroy();
    };
  }, [data, type, gestures]);

  return (
    <div className="touch-optimized-chart">
      <canvas 
        ref={canvasRef}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
```

### 7. Push Notification System

#### 7.1 Push Notification Service
```php
// app/Services/PushNotificationService.php
class PushNotificationService
{
    public function sendReportNotification(array $tokens, Report $report): void
    {
        $message = [
            'title' => 'New Report Available',
            'body' => "{$report->title} is ready for review",
            'data' => [
                'report_id' => $report->id,
                'type' => 'report_ready',
                'url' => "/mobile/reports/{$report->id}"
            ]
        ];

        $this->sendToTokens($tokens, $message);
    }

    public function sendAlertNotification(array $tokens, Alert $alert): void
    {
        $message = [
            'title' => 'Alert: ' . $alert->title,
            'body' => $alert->message,
            'data' => [
                'alert_id' => $alert->id,
                'type' => 'alert',
                'severity' => $alert->severity,
                'url' => "/mobile/alerts/{$alert->id}"
            ]
        ];

        $this->sendToTokens($tokens, $message);
    }
}
```

### 8. API Routes for Mobile and Automation

#### 8.1 Mobile API Routes
```php
// routes/api.php - Mobile routes
Route::prefix('mobile')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', [MobileReportController::class, 'getDashboard']);
    Route::get('/reports', [MobileReportController::class, 'getReports']);
    Route::get('/reports/{id}', [MobileReportController::class, 'getReport']);
    Route::post('/sync', [MobileReportController::class, 'syncOfflineData']);
    Route::get('/offline-reports', [MobileReportController::class, 'getOfflineReports']);
    Route::post('/register-device', [MobileReportController::class, 'registerDevice']);
    Route::delete('/unregister-device', [MobileReportController::class, 'unregisterDevice']);
});

// Automation routes
Route::prefix('automation')->middleware(['auth:sanctum', 'role:admin,manager'])->group(function () {
    Route::get('/schedules', [ReportAutomationController::class, 'getSchedules']);
    Route::post('/schedules', [ReportAutomationController::class, 'createSchedule']);
    Route::put('/schedules/{id}', [ReportAutomationController::class, 'updateSchedule']);
    Route::delete('/schedules/{id}', [ReportAutomationController::class, 'deleteSchedule']);
    Route::post('/schedules/{id}/execute', [ReportAutomationController::class, 'executeReport']);
    Route::get('/executions', [ReportAutomationController::class, 'getExecutionHistory']);
    Route::get('/alerts', [ReportAutomationController::class, 'getAlerts']);
    Route::post('/alerts/{id}/acknowledge', [ReportAutomationController::class, 'acknowledgeAlert']);
});
```

### 9. Progressive Web App Configuration

#### 9.1 PWA Manifest
```json
// public/mobile/manifest.json
{
  "name": "Banrimkwae Resort Reports",
  "short_name": "Resort Reports",
  "description": "Mobile reporting for Banrimkwae Resort",
  "start_url": "/mobile/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196f3",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/images/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 10. Testing Requirements

#### 10.1 Automation Testing
```php
// tests/Feature/ReportAutomationTest.php
class ReportAutomationTest extends TestCase
{
    public function test_can_create_report_schedule()
    {
        // Test schedule creation
        // Verify cron pattern validation
        // Check recipient configuration
    }

    public function test_scheduled_report_execution()
    {
        // Test automatic execution
        // Verify report generation
        // Check delivery to recipients
    }

    public function test_alert_threshold_triggering()
    {
        // Test alert rule evaluation
        // Verify notification delivery
        // Check escalation procedures
    }
}
```

#### 10.2 Mobile Testing
```typescript
// tests/mobile/MobileReportTest.spec.ts
describe('Mobile Report Interface', () => {
  test('should load dashboard on mobile devices', async () => {
    // Test mobile dashboard loading
    // Verify responsive layout
    // Check touch interactions
  });

  test('should work offline', async () => {
    // Test offline functionality
    // Verify cached data access
    // Check sync when online
  });

  test('should handle push notifications', async () => {
    // Test notification reception
    // Verify action handling
    // Check notification preferences
  });
});
```

## Acceptance Criteria

### Automation Features
- [ ] Report scheduling with cron patterns works correctly
- [ ] Multiple delivery methods (email, SMS, push, dashboard) function
- [ ] Alert system detects threshold breaches and anomalies
- [ ] Automatic retries handle temporary failures
- [ ] Execution history provides detailed logs
- [ ] Recipients can manage their subscription preferences

### Mobile Features
- [ ] PWA installs and works offline
- [ ] Touch-optimized interface responds properly
- [ ] Swipe gestures navigate between report sections
- [ ] Pinch-to-zoom works on charts and data
- [ ] Offline data syncs when connection restored
- [ ] Push notifications delivered reliably

### Performance Requirements
- [ ] Mobile app loads within 3 seconds
- [ ] Offline reports accessible instantly
- [ ] Background sync completes within 30 seconds
- [ ] Push notifications delivered within 10 seconds
- [ ] Scheduled reports execute on time (±2 minutes)

### Security Requirements
- [ ] Mobile sessions properly authenticated
- [ ] Offline data encrypted locally
- [ ] Push tokens securely managed
- [ ] Report delivery audit trail maintained

## Technical Notes

### Cron Job Configuration
```bash
# Add to server crontab for report automation
* * * * * cd /path/to/laravel && php artisan schedule:run >> /dev/null 2>&1
```

### Mobile Optimization
- Service worker caching strategy
- IndexedDB for offline storage
- Touch-friendly UI components
- Responsive design breakpoints
- Performance monitoring

### Monitoring and Maintenance
- Queue job monitoring
- Mobile session analytics
- Push notification delivery rates
- Report generation performance
- Offline sync success rates

This implementation provides comprehensive automation and mobile access capabilities, ensuring stakeholders receive timely reports and can access critical information anywhere, anytime.
