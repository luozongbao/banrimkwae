# Issue #04: Activity and Experience Reports

## Overview
Develop comprehensive activity reporting system focusing on activity performance analytics, participation tracking, resource utilization, guest satisfaction analysis, and revenue optimization for all resort activities including free activities, paid activities, and package deals.

## Priority
**High** - Essential for activity management and guest experience optimization

## Estimated Timeline
**4 days (Week 2-3)**

## Requirements

### 1. Activity Performance Dashboard
- **Participation Metrics**: Activity booking rates and capacity utilization
- **Revenue Analytics**: Revenue per activity and profitability analysis
- **Popularity Rankings**: Most and least popular activities
- **Seasonal Trends**: Activity demand patterns by season
- **Package Performance**: Package deal uptake and success rates

### 2. Staff and Resource Utilization
- **Guide Performance**: Activity guide efficiency and guest ratings
- **Equipment Utilization**: Equipment usage and maintenance tracking
- **Scheduling Optimization**: Staff allocation and resource planning
- **Safety Metrics**: Incident tracking and safety compliance
- **Training Analytics**: Staff skill development and training needs

### 3. Guest Satisfaction and Feedback
- **Activity Ratings**: Individual activity satisfaction scores
- **Feedback Analysis**: Guest comment analysis and trending
- **Repeat Participation**: Return activity engagement
- **Cross-Activity Analysis**: Activity combination preferences
- **Improvement Recommendations**: Data-driven enhancement suggestions

### 4. Booking and Revenue Optimization
- **Booking Patterns**: Advanced vs walk-in bookings
- **Pricing Analytics**: Price sensitivity and optimization opportunities
- **Group vs Individual**: Booking type analysis and revenue impact
- **Cancellation Analysis**: Cancellation patterns and revenue impact
- **Capacity Optimization**: Optimal group sizes and scheduling

## Technical Specifications

### Backend Implementation

#### Activity Report Services
```php
// Activity Reporting Services
app/Services/Reporting/Activity/
├── ActivityPerformanceService.php     // Activity metrics and KPIs
├── ParticipationAnalyticsService.php  // Participation tracking
├── ResourceUtilizationService.php     // Staff and equipment analytics
├── GuestSatisfactionService.php       // Satisfaction and feedback
├── RevenueOptimizationService.php     // Revenue and pricing analytics
└── SafetyReportingService.php         // Safety and compliance tracking

// Controllers
app/Http/Controllers/Reporting/Activity/
├── ActivityPerformanceController.php  // Performance endpoints
├── ParticipationController.php        // Participation analytics
├── ResourceController.php             // Resource utilization
└── SatisfactionController.php         // Guest satisfaction
```

#### Activity Performance Service
```php
<?php

namespace App\Services\Reporting\Activity;

use App\Models\Activity;
use App\Models\ActivityBooking;
use App\Models\ActivityGuide;
use App\Models\Equipment;
use App\Services\Reporting\BaseReportService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ActivityPerformanceService extends BaseReportService
{
    public function getActivityPerformance(string $period, array $filters = []): array
    {
        $dateRange = $this->getDateRange($period, $filters);
        
        return [
            'performance_overview' => $this->getPerformanceOverview($dateRange, $filters),
            'activity_rankings' => $this->getActivityRankings($dateRange, $filters),
            'participation_trends' => $this->getParticipationTrends($dateRange, $filters),
            'revenue_analysis' => $this->getRevenueAnalysis($dateRange, $filters),
            'capacity_utilization' => $this->getCapacityUtilization($dateRange, $filters),
        ];
    }

    public function getPerformanceOverview(array $dateRange, array $filters = []): array
    {
        $cacheKey = "activity_performance:" . md5(serialize([$dateRange, $filters]));
        
        return cache()->remember($cacheKey, 900, function () use ($dateRange, $filters) {
            $totalBookings = $this->getTotalBookings($dateRange, $filters);
            $totalRevenue = $this->getTotalRevenue($dateRange, $filters);
            $uniqueParticipants = $this->getUniqueParticipants($dateRange, $filters);
            $averageGroupSize = $this->getAverageGroupSize($dateRange, $filters);
            
            return [
                'total_bookings' => $totalBookings,
                'total_revenue' => $totalRevenue,
                'unique_participants' => $uniqueParticipants,
                'average_group_size' => $averageGroupSize,
                'revenue_per_participant' => $uniqueParticipants > 0 ? 
                    round($totalRevenue / $uniqueParticipants, 2) : 0,
                'booking_growth_rate' => $this->calculateBookingGrowthRate($dateRange, $filters),
                'capacity_utilization_rate' => $this->calculateCapacityUtilization($dateRange, $filters),
            ];
        });
    }

    public function getActivityRankings(array $dateRange, array $filters = []): array
    {
        $rankings = Activity::select([
                'activities.id',
                'activities.name',
                'activities.type',
                'activities.price',
                'activities.max_participants',
                DB::raw('COUNT(activity_bookings.id) as total_bookings'),
                DB::raw('SUM(activity_bookings.participants) as total_participants'),
                DB::raw('SUM(activity_bookings.total_amount) as total_revenue'),
                DB::raw('AVG(activity_reviews.rating) as average_rating'),
                DB::raw('COUNT(activity_reviews.id) as review_count'),
            ])
            ->leftJoin('activity_bookings', 'activities.id', '=', 'activity_bookings.activity_id')
            ->leftJoin('activity_reviews', 'activity_bookings.id', '=', 'activity_reviews.booking_id')
            ->whereBetween('activity_bookings.booking_date', [$dateRange['start'], $dateRange['end']])
            ->where('activity_bookings.status', 'confirmed')
            ->groupBy('activities.id', 'activities.name', 'activities.type', 'activities.price', 'activities.max_participants')
            ->get()
            ->map(function ($activity) use ($dateRange) {
                $capacityUtilization = $this->calculateActivityCapacityUtilization(
                    $activity->id, 
                    $dateRange
                );
                
                return [
                    'activity_id' => $activity->id,
                    'name' => $activity->name,
                    'type' => $activity->type,
                    'price' => $activity->price,
                    'total_bookings' => $activity->total_bookings,
                    'total_participants' => $activity->total_participants,
                    'total_revenue' => $activity->total_revenue,
                    'average_rating' => round($activity->average_rating, 1),
                    'review_count' => $activity->review_count,
                    'capacity_utilization' => $capacityUtilization,
                    'revenue_per_booking' => $activity->total_bookings > 0 ? 
                        round($activity->total_revenue / $activity->total_bookings, 2) : 0,
                    'participants_per_booking' => $activity->total_bookings > 0 ? 
                        round($activity->total_participants / $activity->total_bookings, 1) : 0,
                ];
            })
            ->sortByDesc('total_revenue');

        return [
            'by_revenue' => $rankings->take(10)->values(),
            'by_bookings' => $rankings->sortByDesc('total_bookings')->take(10)->values(),
            'by_rating' => $rankings->sortByDesc('average_rating')->take(10)->values(),
            'by_capacity_utilization' => $rankings->sortByDesc('capacity_utilization')->take(10)->values(),
        ];
    }

    public function getParticipationTrends(array $dateRange, array $filters = []): array
    {
        $trends = [];
        $currentDate = Carbon::parse($dateRange['start']);
        $endDate = Carbon::parse($dateRange['end']);

        while ($currentDate <= $endDate) {
            $dailyData = $this->getDailyParticipation($currentDate, $filters);
            
            $trends[] = [
                'date' => $currentDate->format('Y-m-d'),
                'total_bookings' => $dailyData['bookings'],
                'total_participants' => $dailyData['participants'],
                'revenue' => $dailyData['revenue'],
                'unique_activities' => $dailyData['unique_activities'],
                'average_group_size' => $dailyData['average_group_size'],
            ];
            
            $currentDate->addDay();
        }

        return $trends;
    }

    public function getRevenueAnalysis(array $dateRange, array $filters = []): array
    {
        return [
            'revenue_by_type' => $this->getRevenueByActivityType($dateRange, $filters),
            'revenue_trends' => $this->getActivityRevenueTrends($dateRange, $filters),
            'package_performance' => $this->getPackagePerformance($dateRange, $filters),
            'pricing_analysis' => $this->getPricingAnalysis($dateRange, $filters),
            'profitability_metrics' => $this->getProfitabilityMetrics($dateRange, $filters),
        ];
    }

    private function getDailyParticipation(Carbon $date, array $filters): array
    {
        $bookings = ActivityBooking::whereDate('booking_date', $date)
            ->where('status', 'confirmed')
            ->when(isset($filters['activity_type']), function ($query) use ($filters) {
                return $query->whereHas('activity', function ($q) use ($filters) {
                    $q->where('type', $filters['activity_type']);
                });
            })
            ->get();

        return [
            'bookings' => $bookings->count(),
            'participants' => $bookings->sum('participants'),
            'revenue' => $bookings->sum('total_amount'),
            'unique_activities' => $bookings->pluck('activity_id')->unique()->count(),
            'average_group_size' => $bookings->count() > 0 ? 
                round($bookings->sum('participants') / $bookings->count(), 1) : 0,
        ];
    }

    private function calculateActivityCapacityUtilization(int $activityId, array $dateRange): float
    {
        $activity = Activity::find($activityId);
        if (!$activity) return 0;

        $totalSessions = $this->getActivitySessions($activityId, $dateRange);
        $bookedParticipants = ActivityBooking::where('activity_id', $activityId)
            ->whereBetween('booking_date', [$dateRange['start'], $dateRange['end']])
            ->where('status', 'confirmed')
            ->sum('participants');

        $totalCapacity = $totalSessions * $activity->max_participants;
        
        return $totalCapacity > 0 ? round(($bookedParticipants / $totalCapacity) * 100, 2) : 0;
    }
}
```

#### Resource Utilization Service
```php
<?php

namespace App\Services\Reporting\Activity;

use App\Models\ActivityGuide;
use App\Models\Equipment;
use App\Models\ActivityBooking;
use App\Models\SafetyIncident;
use App\Services\Reporting\BaseReportService;
use Illuminate\Support\Facades\DB;

class ResourceUtilizationService extends BaseReportService
{
    public function getResourceUtilization(string $period, array $filters = []): array
    {
        $dateRange = $this->getDateRange($period, $filters);
        
        return [
            'guide_performance' => $this->getGuidePerformance($dateRange, $filters),
            'equipment_utilization' => $this->getEquipmentUtilization($dateRange, $filters),
            'scheduling_efficiency' => $this->getSchedulingEfficiency($dateRange, $filters),
            'safety_metrics' => $this->getSafetyMetrics($dateRange, $filters),
            'training_analytics' => $this->getTrainingAnalytics($dateRange, $filters),
        ];
    }

    public function getGuidePerformance(array $dateRange, array $filters = []): array
    {
        return ActivityGuide::select([
                'activity_guides.id',
                'activity_guides.name',
                'activity_guides.specialization',
                'activity_guides.experience_level',
                DB::raw('COUNT(activity_bookings.id) as total_sessions'),
                DB::raw('SUM(activity_bookings.participants) as total_participants'),
                DB::raw('AVG(guide_reviews.rating) as average_rating'),
                DB::raw('COUNT(guide_reviews.id) as review_count'),
                DB::raw('AVG(activity_bookings.duration) as average_session_duration'),
            ])
            ->leftJoin('activity_sessions', 'activity_guides.id', '=', 'activity_sessions.guide_id')
            ->leftJoin('activity_bookings', 'activity_sessions.id', '=', 'activity_bookings.session_id')
            ->leftJoin('guide_reviews', 'activity_sessions.id', '=', 'guide_reviews.session_id')
            ->whereBetween('activity_bookings.booking_date', [$dateRange['start'], $dateRange['end']])
            ->where('activity_bookings.status', 'confirmed')
            ->groupBy('activity_guides.id', 'activity_guides.name', 'activity_guides.specialization', 'activity_guides.experience_level')
            ->get()
            ->map(function ($guide) use ($dateRange) {
                $efficiency = $this->calculateGuideEfficiency($guide->id, $dateRange);
                $utilization = $this->calculateGuideUtilization($guide->id, $dateRange);
                
                return [
                    'guide_id' => $guide->id,
                    'name' => $guide->name,
                    'specialization' => $guide->specialization,
                    'experience_level' => $guide->experience_level,
                    'total_sessions' => $guide->total_sessions,
                    'total_participants' => $guide->total_participants,
                    'average_rating' => round($guide->average_rating, 1),
                    'review_count' => $guide->review_count,
                    'efficiency_score' => $efficiency,
                    'utilization_rate' => $utilization,
                    'participants_per_session' => $guide->total_sessions > 0 ? 
                        round($guide->total_participants / $guide->total_sessions, 1) : 0,
                ];
            });
    }

    public function getEquipmentUtilization(array $dateRange, array $filters = []): array
    {
        return Equipment::select([
                'equipment.id',
                'equipment.name',
                'equipment.type',
                'equipment.quantity',
                'equipment.status',
                DB::raw('COUNT(equipment_bookings.id) as usage_count'),
                DB::raw('SUM(equipment_bookings.duration) as total_usage_hours'),
                DB::raw('COUNT(maintenance_logs.id) as maintenance_count'),
            ])
            ->leftJoin('equipment_bookings', 'equipment.id', '=', 'equipment_bookings.equipment_id')
            ->leftJoin('maintenance_logs', 'equipment.id', '=', 'maintenance_logs.equipment_id')
            ->whereBetween('equipment_bookings.booking_date', [$dateRange['start'], $dateRange['end']])
            ->groupBy('equipment.id', 'equipment.name', 'equipment.type', 'equipment.quantity', 'equipment.status')
            ->get()
            ->map(function ($equipment) use ($dateRange) {
                $utilization = $this->calculateEquipmentUtilization($equipment->id, $dateRange);
                $availability = $this->calculateEquipmentAvailability($equipment->id, $dateRange);
                
                return [
                    'equipment_id' => $equipment->id,
                    'name' => $equipment->name,
                    'type' => $equipment->type,
                    'quantity' => $equipment->quantity,
                    'status' => $equipment->status,
                    'usage_count' => $equipment->usage_count,
                    'total_usage_hours' => $equipment->total_usage_hours,
                    'maintenance_count' => $equipment->maintenance_count,
                    'utilization_rate' => $utilization,
                    'availability_rate' => $availability,
                    'average_usage_per_booking' => $equipment->usage_count > 0 ? 
                        round($equipment->total_usage_hours / $equipment->usage_count, 1) : 0,
                ];
            });
    }

    public function getSafetyMetrics(array $dateRange, array $filters = []): array
    {
        $incidents = SafetyIncident::whereBetween('incident_date', [$dateRange['start'], $dateRange['end']])
            ->get();

        $totalSessions = ActivityBooking::whereBetween('booking_date', [$dateRange['start'], $dateRange['end']])
            ->where('status', 'confirmed')
            ->count();

        return [
            'total_incidents' => $incidents->count(),
            'incident_rate' => $totalSessions > 0 ? round(($incidents->count() / $totalSessions) * 100, 4) : 0,
            'incidents_by_severity' => $incidents->groupBy('severity')->map->count(),
            'incidents_by_activity' => $incidents->groupBy('activity_id')->map->count(),
            'safety_score' => $this->calculateSafetyScore($incidents, $totalSessions),
            'incident_trends' => $this->getIncidentTrends($dateRange),
        ];
    }

    private function calculateGuideEfficiency(int $guideId, array $dateRange): float
    {
        // Calculate based on session completion rate, participant satisfaction, and time management
        $sessions = ActivityBooking::whereHas('session', function ($query) use ($guideId) {
            $query->where('guide_id', $guideId);
        })
        ->whereBetween('booking_date', [$dateRange['start'], $dateRange['end']])
        ->where('status', 'confirmed')
        ->get();

        if ($sessions->isEmpty()) return 0;

        $completionRate = $sessions->where('completion_status', 'completed')->count() / $sessions->count();
        $avgRating = $sessions->avg('guide_rating') / 5; // Normalize to 0-1
        $onTimeRate = $sessions->where('on_time', true)->count() / $sessions->count();

        return round(($completionRate + $avgRating + $onTimeRate) / 3 * 100, 2);
    }
}
```

### API Endpoints

#### Activity Reporting APIs
```php
// routes/api.php - Activity Reporting Routes
Route::prefix('reporting/activities')->middleware(['auth:sanctum'])->group(function () {
    // Activity Performance
    Route::get('/performance/overview', [ActivityPerformanceController::class, 'getOverview']);
    Route::get('/performance/rankings', [ActivityPerformanceController::class, 'getRankings']);
    Route::get('/performance/trends', [ActivityPerformanceController::class, 'getTrends']);
    Route::get('/performance/revenue', [ActivityPerformanceController::class, 'getRevenue']);
    Route::get('/performance/capacity', [ActivityPerformanceController::class, 'getCapacity']);
    
    // Participation Analytics
    Route::get('/participation/summary', [ParticipationController::class, 'getSummary']);
    Route::get('/participation/trends', [ParticipationController::class, 'getTrends']);
    Route::get('/participation/demographics', [ParticipationController::class, 'getDemographics']);
    Route::get('/participation/patterns', [ParticipationController::class, 'getPatterns']);
    
    // Resource Utilization
    Route::get('/resources/guides', [ResourceController::class, 'getGuides']);
    Route::get('/resources/equipment', [ResourceController::class, 'getEquipment']);
    Route::get('/resources/scheduling', [ResourceController::class, 'getScheduling']);
    Route::get('/resources/safety', [ResourceController::class, 'getSafety']);
    
    // Guest Satisfaction
    Route::get('/satisfaction/overview', [SatisfactionController::class, 'getOverview']);
    Route::get('/satisfaction/trends', [SatisfactionController::class, 'getTrends']);
    Route::get('/satisfaction/feedback', [SatisfactionController::class, 'getFeedback']);
    Route::get('/satisfaction/recommendations', [SatisfactionController::class, 'getRecommendations']);
});
```

### Frontend Implementation

#### Activity Dashboard Component
```typescript
// src/components/Reporting/Activity/ActivityDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Select, Tabs, Table, Spin } from 'antd';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import { useActivityReports } from '../../../hooks/useActivityReports';
import ActivityPerformanceOverview from './ActivityPerformanceOverview';
import ActivityRankings from './ActivityRankings';
import ResourceUtilization from './ResourceUtilization';
import SafetyMetrics from './SafetyMetrics';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

interface ActivityDashboardProps {
  userRole: string;
}

const ActivityDashboard: React.FC<ActivityDashboardProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('performance');
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [filters, setFilters] = useState({
    activity_type: 'all',
    guide_id: 'all',
  });

  const {
    performanceData,
    resourceData,
    satisfactionData,
    safetyData,
    loading,
    error,
    refreshData,
  } = useActivityReports(dateRange, filters);

  return (
    <div className="activity-dashboard">
      <div className="dashboard-header">
        <Row justify="space-between" align="middle">
          <Col>
            <h2>Activity & Experience Reports</h2>
          </Col>
          <Col>
            <div className="dashboard-filters">
              <RangePicker
                onChange={(dates, dateStrings) => setDateRange(dateStrings as [string, string])}
                style={{ marginRight: 16 }}
              />
              <Select
                value={filters.activity_type}
                onChange={(value) => setFilters({ ...filters, activity_type: value })}
                style={{ width: 150 }}
              >
                <Option value="all">All Activities</Option>
                <Option value="water">Water Activities</Option>
                <Option value="land">Land Activities</Option>
                <Option value="cultural">Cultural Activities</Option>
                <Option value="adventure">Adventure Activities</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </div>

      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Performance Analytics" key="performance">
            <ActivityPerformanceOverview data={performanceData} />
            
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              <Col span={16}>
                <Card title="Participation Trends">
                  <Line
                    data={{
                      labels: performanceData?.participation_trends?.map(t => t.date) || [],
                      datasets: [
                        {
                          label: 'Total Bookings',
                          data: performanceData?.participation_trends?.map(t => t.total_bookings) || [],
                          borderColor: '#2563EB',
                          backgroundColor: 'rgba(37, 99, 235, 0.1)',
                          yAxisID: 'y',
                        },
                        {
                          label: 'Total Participants',
                          data: performanceData?.participation_trends?.map(t => t.total_participants) || [],
                          borderColor: '#059669',
                          backgroundColor: 'rgba(5, 150, 105, 0.1)',
                          yAxisID: 'y',
                        },
                        {
                          label: 'Revenue (THB)',
                          data: performanceData?.participation_trends?.map(t => t.revenue) || [],
                          borderColor: '#D97706',
                          backgroundColor: 'rgba(217, 119, 6, 0.1)',
                          yAxisID: 'y1',
                        },
                      ],
                    }}
                    options={{
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
                        },
                      },
                    }}
                  />
                </Card>
              </Col>

              <Col span={8}>
                <Card title="Revenue by Activity Type">
                  <Pie
                    data={{
                      labels: Object.keys(performanceData?.revenue_analysis?.revenue_by_type || {}),
                      datasets: [{
                        data: Object.values(performanceData?.revenue_analysis?.revenue_by_type || {}),
                        backgroundColor: [
                          '#2563EB',
                          '#059669',
                          '#D97706',
                          '#DC2626',
                          '#7C3AED',
                        ],
                      }],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              <Col span={24}>
                <Card title="Activity Rankings">
                  <ActivityRankings data={performanceData?.activity_rankings} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Resource Utilization" key="resources">
            <ResourceUtilization data={resourceData} />
          </TabPane>

          <TabPane tab="Guest Satisfaction" key="satisfaction">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Satisfaction Overview">
                  <div className="satisfaction-metrics">
                    <div className="metric-item">
                      <span className="metric-label">Overall Rating:</span>
                      <span className="metric-value large">
                        {(satisfactionData?.overall_rating || 0).toFixed(1)}/5.0
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Total Reviews:</span>
                      <span className="metric-value">
                        {satisfactionData?.total_reviews || 0}
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Response Rate:</span>
                      <span className="metric-value">
                        {(satisfactionData?.response_rate || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Satisfaction by Activity">
                  <Bar
                    data={{
                      labels: satisfactionData?.by_activity?.map(a => a.name) || [],
                      datasets: [{
                        label: 'Average Rating',
                        data: satisfactionData?.by_activity?.map(a => a.rating) || [],
                        backgroundColor: '#2563EB',
                      }],
                    }}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          min: 0,
                          max: 5,
                        },
                      },
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Safety Metrics" key="safety">
            <SafetyMetrics data={safetyData} />
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default ActivityDashboard;
```

## Implementation Phases

### Phase 1: Activity Performance Analytics (1.5 days)
1. **Performance Service Development**
   - Implement ActivityPerformanceService
   - Create participation tracking methods
   - Build revenue analysis functionality

2. **Performance API Endpoints**
   - Develop ActivityPerformanceController
   - Create performance overview endpoints
   - Implement ranking and trend APIs

3. **Performance Frontend Components**
   - Build ActivityPerformanceOverview component
   - Create participation trend charts
   - Implement activity ranking displays

### Phase 2: Resource Utilization (1.5 days)
1. **Resource Service Development**
   - Implement ResourceUtilizationService
   - Create guide performance tracking
   - Build equipment utilization analytics

2. **Resource API Endpoints**
   - Develop ResourceController
   - Create guide performance endpoints
   - Implement equipment utilization APIs

3. **Resource Frontend Components**
   - Build ResourceUtilization component
   - Create guide performance displays
   - Implement equipment tracking visualizations

### Phase 3: Guest Satisfaction and Safety (1 day)
1. **Satisfaction and Safety Services**
   - Implement guest satisfaction tracking
   - Create safety metrics service
   - Build feedback analysis functionality

2. **Satisfaction and Safety APIs**
   - Develop SatisfactionController
   - Create safety metrics endpoints
   - Implement feedback analysis APIs

3. **Satisfaction and Safety Frontend**
   - Build satisfaction overview displays
   - Create safety metrics visualizations
   - Implement feedback analysis components

## Quality Assurance

### Testing Requirements
1. **Unit Tests**
   - Service method testing
   - Calculation validation
   - Safety metrics accuracy

2. **Integration Tests**
   - Cross-module data integration
   - Guide performance tracking
   - Equipment utilization validation

3. **Performance Tests**
   - Large dataset handling
   - Complex analytics processing
   - Real-time safety monitoring

## Success Metrics

### Performance Metrics
- **Report Generation**: < 12 seconds for activity reports
- **Data Accuracy**: 100% accuracy in participation calculations
- **User Engagement**: Daily use by activity managers
- **Safety Compliance**: 100% incident tracking accuracy

### Business Metrics
- **Activity Optimization**: Improved capacity utilization
- **Guest Satisfaction**: Enhanced satisfaction tracking
- **Safety Performance**: Reduced incident rates
- **Revenue Growth**: Better activity revenue performance

## Dependencies

### Internal Dependencies
- **Issue #01**: Core reporting architecture
- **Phase 2**: Activity booking data
- **Guide Management**: Guide profile and performance data
- **Equipment System**: Equipment tracking data

### External Dependencies
- **Chart.js**: For activity visualizations
- **Ant Design**: For UI components
- **React Table**: For performance tables

## Deliverables

### Backend Deliverables
- [ ] Activity performance service
- [ ] Resource utilization service
- [ ] Guest satisfaction service
- [ ] Safety reporting service
- [ ] Activity API controllers

### Frontend Deliverables
- [ ] Activity dashboard component
- [ ] Performance overview displays
- [ ] Resource utilization charts
- [ ] Satisfaction analytics
- [ ] Safety metrics displays

### Testing Deliverables
- [ ] Unit test suite
- [ ] Integration tests
- [ ] Safety compliance tests
- [ ] Performance validation tests

---

**Estimated Completion**: End of Week 3
**Next Phase**: Restaurant Operations Reports (Issue #05)
