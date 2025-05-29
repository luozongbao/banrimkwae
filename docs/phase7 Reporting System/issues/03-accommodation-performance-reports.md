# Issue #03: Accommodation Performance Reports

## Overview
Develop comprehensive accommodation reporting system focusing on occupancy analytics, guest behavior analysis, booking performance metrics, and accommodation-specific revenue tracking. This module provides insights into accommodation utilization, guest satisfaction, and operational efficiency.

## Priority
**High** - Critical for accommodation management and revenue optimization

## Estimated Timeline
**4 days (Week 2)**

## Requirements

### 1. Occupancy Reports
- **Occupancy Overview**: Current occupancy rates and trends
- **Occupancy by Type**: Raft vs house utilization comparison
- **Room-Level Analytics**: Individual room performance tracking
- **Seasonal Analysis**: Occupancy patterns by season and period
- **Booking Lead Time**: Advanced booking vs last-minute patterns

### 2. Guest Analytics
- **Guest Demographics**: Origin analysis, age groups, guest types
- **Stay Patterns**: Length of stay, repeat guests, group sizes
- **Service Utilization**: Cross-selling success rates
- **Guest Satisfaction**: Feedback analysis and satisfaction metrics
- **Spending Patterns**: Per-guest revenue analysis

### 3. Booking Performance
- **Conversion Rates**: Booking funnel analysis
- **Cancellation Analysis**: Cancellation rates and patterns
- **Source Analytics**: Booking channel performance
- **Pricing Analytics**: Rate optimization and competitive analysis
- **Revenue Optimization**: ADR and RevPAR tracking

### 4. Maintenance and Operations
- **Housekeeping Performance**: Cleaning times and quality scores
- **Maintenance Tracking**: Maintenance requests and response times
- **Room Status Analytics**: Room availability and status tracking
- **Operational Efficiency**: Staff allocation and productivity

## Technical Specifications

### Backend Implementation

#### Accommodation Report Services
```php
// Accommodation Reporting Services
app/Services/Reporting/Accommodation/
├── OccupancyAnalyticsService.php     // Occupancy calculations
├── GuestAnalyticsService.php        // Guest behavior analysis
├── BookingPerformanceService.php    // Booking metrics
├── RevenueOptimizationService.php   // Revenue analytics
├── MaintenanceReportService.php     // Maintenance tracking
└── OperationalMetricsService.php    // Operational efficiency

// Controllers
app/Http/Controllers/Reporting/Accommodation/
├── OccupancyController.php          // Occupancy endpoints
├── GuestAnalyticsController.php     // Guest data endpoints
├── BookingController.php            // Booking performance
└── OperationsController.php         // Maintenance & operations
```

#### Occupancy Analytics Service
```php
<?php

namespace App\Services\Reporting\Accommodation;

use App\Models\Accommodation;
use App\Models\Room;
use App\Models\Booking;
use App\Services\Reporting\BaseReportService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OccupancyAnalyticsService extends BaseReportService
{
    public function getOccupancyReport(string $period, array $filters = []): array
    {
        $dateRange = $this->getDateRange($period, $filters);
        
        return [
            'occupancy_overview' => $this->getOccupancyOverview($dateRange, $filters),
            'occupancy_trends' => $this->getOccupancyTrends($dateRange, $filters),
            'occupancy_by_type' => $this->getOccupancyByType($dateRange, $filters),
            'room_performance' => $this->getRoomPerformance($dateRange, $filters),
            'seasonal_analysis' => $this->getSeasonalAnalysis($dateRange, $filters),
        ];
    }

    public function getOccupancyOverview(array $dateRange, array $filters = []): array
    {
        $cacheKey = "occupancy_overview:" . md5(serialize([$dateRange, $filters]));
        
        return cache()->remember($cacheKey, 900, function () use ($dateRange, $filters) {
            $totalRooms = $this->getTotalAvailableRooms($filters);
            $occupiedRoomNights = $this->getOccupiedRoomNights($dateRange, $filters);
            $availableRoomNights = $this->getAvailableRoomNights($dateRange, $filters);
            
            $occupancyRate = $availableRoomNights > 0 ? 
                round(($occupiedRoomNights / $availableRoomNights) * 100, 2) : 0;
            
            return [
                'current_occupancy_rate' => $occupancyRate,
                'occupied_rooms' => $occupiedRoomNights,
                'available_rooms' => $availableRoomNights,
                'total_rooms' => $totalRooms,
                'previous_period_comparison' => $this->getPreviousPeriodComparison($dateRange, $filters),
                'target_occupancy' => $this->getTargetOccupancy($dateRange),
                'variance_from_target' => $this->getVarianceFromTarget($occupancyRate, $dateRange),
            ];
        });
    }

    public function getOccupancyTrends(array $dateRange, array $filters = []): array
    {
        $trends = [];
        $currentDate = Carbon::parse($dateRange['start']);
        $endDate = Carbon::parse($dateRange['end']);

        while ($currentDate <= $endDate) {
            $dailyOccupancy = $this->getDailyOccupancy($currentDate, $filters);
            
            $trends[] = [
                'date' => $currentDate->format('Y-m-d'),
                'occupancy_rate' => $dailyOccupancy['rate'],
                'occupied_rooms' => $dailyOccupancy['occupied'],
                'available_rooms' => $dailyOccupancy['available'],
                'revenue' => $dailyOccupancy['revenue'],
            ];
            
            $currentDate->addDay();
        }

        return $trends;
    }

    public function getOccupancyByType(array $dateRange, array $filters = []): array
    {
        return [
            'raft_occupancy' => $this->getTypeOccupancy('raft', $dateRange, $filters),
            'house_occupancy' => $this->getTypeOccupancy('house', $dateRange, $filters),
            'comparison_metrics' => $this->getTypeComparison($dateRange, $filters),
        ];
    }

    public function getRoomPerformance(array $dateRange, array $filters = []): array
    {
        return Room::with(['accommodation'])
            ->select([
                'rooms.id',
                'rooms.room_number',
                'accommodations.name as accommodation_name',
                'accommodations.type as accommodation_type',
                DB::raw('COUNT(bookings.id) as total_bookings'),
                DB::raw('AVG(bookings.total_amount) as average_rate'),
                DB::raw('SUM(DATEDIFF(bookings.check_out_date, bookings.check_in_date)) as total_nights'),
                DB::raw('AVG(guest_satisfactions.rating) as average_rating'),
            ])
            ->leftJoin('accommodations', 'rooms.accommodation_id', '=', 'accommodations.id')
            ->leftJoin('bookings', 'rooms.id', '=', 'bookings.room_id')
            ->leftJoin('guest_satisfactions', 'bookings.id', '=', 'guest_satisfactions.booking_id')
            ->whereBetween('bookings.check_in_date', [$dateRange['start'], $dateRange['end']])
            ->where('bookings.status', 'confirmed')
            ->groupBy('rooms.id', 'rooms.room_number', 'accommodations.name', 'accommodations.type')
            ->orderBy('total_nights', 'desc')
            ->get()
            ->map(function ($room) use ($dateRange) {
                $availableNights = $this->getRoomAvailableNights($room->id, $dateRange);
                $occupancyRate = $availableNights > 0 ? 
                    round(($room->total_nights / $availableNights) * 100, 2) : 0;
                
                return [
                    'room_id' => $room->id,
                    'room_number' => $room->room_number,
                    'accommodation_name' => $room->accommodation_name,
                    'accommodation_type' => $room->accommodation_type,
                    'occupancy_rate' => $occupancyRate,
                    'total_bookings' => $room->total_bookings,
                    'average_rate' => round($room->average_rate, 2),
                    'total_nights' => $room->total_nights,
                    'average_rating' => round($room->average_rating, 1),
                    'revenue_per_available_night' => $availableNights > 0 ? 
                        round(($room->total_bookings * $room->average_rate) / $availableNights, 2) : 0,
                ];
            });
    }

    private function getDailyOccupancy(Carbon $date, array $filters): array
    {
        $totalRooms = $this->getTotalAvailableRooms($filters);
        $occupiedRooms = Booking::whereDate('check_in_date', '<=', $date)
            ->whereDate('check_out_date', '>', $date)
            ->where('status', 'confirmed')
            ->when(isset($filters['accommodation_type']), function ($query) use ($filters) {
                return $query->whereHas('room.accommodation', function ($q) use ($filters) {
                    $q->where('type', $filters['accommodation_type']);
                });
            })
            ->count();

        $revenue = Booking::whereDate('check_in_date', $date)
            ->where('status', 'confirmed')
            ->sum('total_amount');

        return [
            'rate' => $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 2) : 0,
            'occupied' => $occupiedRooms,
            'available' => $totalRooms,
            'revenue' => $revenue,
        ];
    }
}
```

#### Guest Analytics Service
```php
<?php

namespace App\Services\Reporting\Accommodation;

use App\Models\Guest;
use App\Models\Booking;
use App\Models\GuestSatisfaction;
use App\Services\Reporting\BaseReportService;
use Illuminate\Support\Facades\DB;

class GuestAnalyticsService extends BaseReportService
{
    public function getGuestAnalytics(string $period, array $filters = []): array
    {
        $dateRange = $this->getDateRange($period, $filters);
        
        return [
            'guest_demographics' => $this->getGuestDemographics($dateRange, $filters),
            'stay_patterns' => $this->getStayPatterns($dateRange, $filters),
            'service_utilization' => $this->getServiceUtilization($dateRange, $filters),
            'satisfaction_metrics' => $this->getSatisfactionMetrics($dateRange, $filters),
            'spending_patterns' => $this->getSpendingPatterns($dateRange, $filters),
        ];
    }

    public function getGuestDemographics(array $dateRange, array $filters = []): array
    {
        $bookings = Booking::with(['guest'])
            ->whereBetween('check_in_date', [$dateRange['start'], $dateRange['end']])
            ->where('status', 'confirmed')
            ->get();

        return [
            'origin_analysis' => $this->analyzeGuestOrigin($bookings),
            'age_distribution' => $this->analyzeAgeDistribution($bookings),
            'group_size_analysis' => $this->analyzeGroupSizes($bookings),
            'guest_type_breakdown' => $this->analyzeGuestTypes($bookings),
            'repeat_guest_rate' => $this->calculateRepeatGuestRate($bookings),
        ];
    }

    public function getStayPatterns(array $dateRange, array $filters = []): array
    {
        return [
            'average_length_of_stay' => $this->calculateAverageStayLength($dateRange, $filters),
            'stay_length_distribution' => $this->getStayLengthDistribution($dateRange, $filters),
            'peak_booking_periods' => $this->identifyPeakPeriods($dateRange, $filters),
            'booking_lead_time' => $this->analyzeBookingLeadTime($dateRange, $filters),
            'seasonal_patterns' => $this->analyzeSeasonalPatterns($dateRange, $filters),
        ];
    }

    public function getServiceUtilization(array $dateRange, array $filters = []): array
    {
        return [
            'activity_participation' => $this->getActivityParticipation($dateRange, $filters),
            'restaurant_usage' => $this->getRestaurantUsage($dateRange, $filters),
            'cross_selling_success' => $this->calculateCrossSelling($dateRange, $filters),
            'service_combination_analysis' => $this->analyzeServiceCombinations($dateRange, $filters),
        ];
    }

    public function getSatisfactionMetrics(array $dateRange, array $filters = []): array
    {
        $satisfactionData = GuestSatisfaction::whereHas('booking', function ($query) use ($dateRange) {
            $query->whereBetween('check_in_date', [$dateRange['start'], $dateRange['end']]);
        })->get();

        return [
            'overall_satisfaction' => $satisfactionData->avg('overall_rating'),
            'satisfaction_trends' => $this->getSatisfactionTrends($dateRange, $filters),
            'satisfaction_by_room_type' => $this->getSatisfactionByRoomType($dateRange, $filters),
            'improvement_areas' => $this->identifyImprovementAreas($satisfactionData),
            'nps_score' => $this->calculateNetPromoterScore($satisfactionData),
        ];
    }

    private function analyzeGuestOrigin(Collection $bookings): array
    {
        $origins = $bookings->groupBy('guest.nationality')->map->count();
        $total = $bookings->count();

        return [
            'domestic_vs_international' => [
                'domestic' => $origins->get('TH', 0),
                'international' => $total - $origins->get('TH', 0),
                'domestic_percentage' => $total > 0 ? round(($origins->get('TH', 0) / $total) * 100, 1) : 0,
            ],
            'top_countries' => $origins->sortDesc()->take(10)->toArray(),
            'country_diversity_index' => $this->calculateDiversityIndex($origins),
        ];
    }

    private function calculateAverageStayLength(array $dateRange, array $filters): float
    {
        return Booking::whereBetween('check_in_date', [$dateRange['start'], $dateRange['end']])
            ->where('status', 'confirmed')
            ->selectRaw('AVG(DATEDIFF(check_out_date, check_in_date)) as avg_stay')
            ->value('avg_stay') ?? 0;
    }
}
```

### API Endpoints

#### Accommodation Reporting APIs
```php
// routes/api.php - Accommodation Reporting Routes
Route::prefix('reporting/accommodation')->middleware(['auth:sanctum'])->group(function () {
    // Occupancy Analytics
    Route::get('/occupancy/overview', [OccupancyController::class, 'getOverview']);
    Route::get('/occupancy/trends', [OccupancyController::class, 'getTrends']);
    Route::get('/occupancy/by-type', [OccupancyController::class, 'getByType']);
    Route::get('/occupancy/room-performance', [OccupancyController::class, 'getRoomPerformance']);
    Route::get('/occupancy/seasonal', [OccupancyController::class, 'getSeasonalAnalysis']);
    
    // Guest Analytics
    Route::get('/guests/demographics', [GuestAnalyticsController::class, 'getDemographics']);
    Route::get('/guests/stay-patterns', [GuestAnalyticsController::class, 'getStayPatterns']);
    Route::get('/guests/service-utilization', [GuestAnalyticsController::class, 'getServiceUtilization']);
    Route::get('/guests/satisfaction', [GuestAnalyticsController::class, 'getSatisfaction']);
    Route::get('/guests/spending', [GuestAnalyticsController::class, 'getSpending']);
    
    // Booking Performance
    Route::get('/bookings/performance', [BookingController::class, 'getPerformance']);
    Route::get('/bookings/conversion', [BookingController::class, 'getConversion']);
    Route::get('/bookings/sources', [BookingController::class, 'getSources']);
    Route::get('/bookings/cancellations', [BookingController::class, 'getCancellations']);
    
    // Operations
    Route::get('/operations/housekeeping', [OperationsController::class, 'getHousekeeping']);
    Route::get('/operations/maintenance', [OperationsController::class, 'getMaintenance']);
    Route::get('/operations/efficiency', [OperationsController::class, 'getEfficiency']);
});
```

### Frontend Implementation

#### Accommodation Dashboard Component
```typescript
// src/components/Reporting/Accommodation/AccommodationDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Select, Tabs, Spin } from 'antd';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { useAccommodationReports } from '../../../hooks/useAccommodationReports';
import OccupancyOverview from './OccupancyOverview';
import GuestAnalytics from './GuestAnalytics';
import BookingPerformance from './BookingPerformance';
import RoomPerformanceTable from './RoomPerformanceTable';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

interface AccommodationDashboardProps {
  userRole: string;
}

const AccommodationDashboard: React.FC<AccommodationDashboardProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('occupancy');
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [filters, setFilters] = useState({
    accommodation_type: 'all',
    room_category: 'all',
  });

  const {
    occupancyData,
    guestAnalytics,
    bookingPerformance,
    roomPerformance,
    loading,
    error,
    refreshData,
  } = useAccommodationReports(dateRange, filters);

  return (
    <div className="accommodation-dashboard">
      <div className="dashboard-header">
        <Row justify="space-between" align="middle">
          <Col>
            <h2>Accommodation Reports & Analytics</h2>
          </Col>
          <Col>
            <div className="dashboard-filters">
              <RangePicker
                onChange={(dates, dateStrings) => setDateRange(dateStrings as [string, string])}
                style={{ marginRight: 16 }}
              />
              <Select
                value={filters.accommodation_type}
                onChange={(value) => setFilters({ ...filters, accommodation_type: value })}
                style={{ width: 150 }}
              >
                <Option value="all">All Types</Option>
                <Option value="raft">Rafts</Option>
                <Option value="house">Houses</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </div>

      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Occupancy Analytics" key="occupancy">
            <OccupancyOverview data={occupancyData} />
            
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              <Col span={16}>
                <Card title="Occupancy Trends">
                  <Line
                    data={{
                      labels: occupancyData?.trends?.map(t => t.date) || [],
                      datasets: [
                        {
                          label: 'Occupancy Rate (%)',
                          data: occupancyData?.trends?.map(t => t.occupancy_rate) || [],
                          borderColor: '#2563EB',
                          backgroundColor: 'rgba(37, 99, 235, 0.1)',
                          tension: 0.1,
                        },
                        {
                          label: 'Revenue (THB)',
                          data: occupancyData?.trends?.map(t => t.revenue) || [],
                          borderColor: '#059669',
                          backgroundColor: 'rgba(5, 150, 105, 0.1)',
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
                          max: 100,
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
                <Card title="Occupancy by Type">
                  <Doughnut
                    data={{
                      labels: ['Rafts', 'Houses'],
                      datasets: [{
                        data: [
                          occupancyData?.by_type?.raft_occupancy?.occupancy_rate || 0,
                          occupancyData?.by_type?.house_occupancy?.occupancy_rate || 0,
                        ],
                        backgroundColor: ['#2563EB', '#D97706'],
                        borderWidth: 2,
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
                <Card title="Room Performance">
                  <RoomPerformanceTable data={roomPerformance} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Guest Analytics" key="guests">
            <GuestAnalytics data={guestAnalytics} />
          </TabPane>

          <TabPane tab="Booking Performance" key="bookings">
            <BookingPerformance data={bookingPerformance} />
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default AccommodationDashboard;
```

#### Occupancy Overview Component
```typescript
// src/components/Reporting/Accommodation/OccupancyOverview.tsx
import React from 'react';
import { Card, Row, Col, Statistic, Progress, Badge } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, HomeOutlined } from '@ant-design/icons';

interface OccupancyOverviewProps {
  data: {
    current_occupancy_rate: number;
    occupied_rooms: number;
    available_rooms: number;
    total_rooms: number;
    previous_period_comparison: number;
    target_occupancy: number;
    variance_from_target: number;
  };
}

const OccupancyOverview: React.FC<OccupancyOverviewProps> = ({ data }) => {
  const getStatusColor = (rate: number, target: number) => {
    if (rate >= target) return 'success';
    if (rate >= target * 0.8) return 'warning';
    return 'error';
  };

  const getComparisonIcon = (comparison: number) => {
    return comparison >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  const getComparisonColor = (comparison: number) => {
    return comparison >= 0 ? '#3f8600' : '#cf1322';
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Current Occupancy Rate"
            value={data?.current_occupancy_rate || 0}
            suffix="%"
            prefix={<HomeOutlined />}
            valueStyle={{ 
              color: data?.current_occupancy_rate >= (data?.target_occupancy || 80) ? '#3f8600' : '#cf1322' 
            }}
          />
          <Progress
            percent={data?.current_occupancy_rate || 0}
            status={getStatusColor(data?.current_occupancy_rate || 0, data?.target_occupancy || 80)}
            size="small"
            style={{ marginTop: 8 }}
          />
          <div style={{ marginTop: 8 }}>
            <Badge 
              color={data?.previous_period_comparison >= 0 ? 'green' : 'red'}
              text={`${Math.abs(data?.previous_period_comparison || 0).toFixed(1)}% vs previous period`}
            />
          </div>
        </Card>
      </Col>

      <Col span={6}>
        <Card>
          <Statistic
            title="Occupied Rooms"
            value={data?.occupied_rooms || 0}
            suffix={`/ ${data?.available_rooms || 0}`}
            valueStyle={{ color: '#2563EB' }}
          />
          <div style={{ marginTop: 16 }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              Total Rooms: {data?.total_rooms || 0}
            </span>
          </div>
        </Card>
      </Col>

      <Col span={6}>
        <Card>
          <Statistic
            title="Target Achievement"
            value={((data?.current_occupancy_rate || 0) / (data?.target_occupancy || 80)) * 100}
            suffix="%"
            precision={1}
            valueStyle={{ 
              color: (data?.current_occupancy_rate || 0) >= (data?.target_occupancy || 80) ? '#3f8600' : '#cf1322' 
            }}
          />
          <div style={{ marginTop: 8 }}>
            <Badge 
              color={(data?.variance_from_target || 0) >= 0 ? 'green' : 'red'}
              text={`${(data?.variance_from_target || 0) >= 0 ? '+' : ''}${(data?.variance_from_target || 0).toFixed(1)}% from target`}
            />
          </div>
        </Card>
      </Col>

      <Col span={6}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563EB' }}>
              {data?.current_occupancy_rate >= 90 ? 'Excellent' :
               data?.current_occupancy_rate >= 80 ? 'Good' :
               data?.current_occupancy_rate >= 60 ? 'Fair' : 'Needs Improvement'}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: 8 }}>
              Occupancy Status
            </div>
            <div style={{ marginTop: 8 }}>
              <Badge 
                status={data?.current_occupancy_rate >= 80 ? 'success' : 'warning'}
                text={`${data?.current_occupancy_rate || 0}% occupancy`}
              />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default OccupancyOverview;
```

## Implementation Phases

### Phase 1: Occupancy Analytics (1.5 days)
1. **Occupancy Service Development**
   - Implement OccupancyAnalyticsService
   - Create occupancy calculation methods
   - Build trend analysis functionality

2. **Occupancy API Endpoints**
   - Develop OccupancyController
   - Create occupancy overview endpoints
   - Implement trend and comparison APIs

3. **Occupancy Frontend Components**
   - Build OccupancyOverview component
   - Create occupancy trend charts
   - Implement room performance displays

### Phase 2: Guest Analytics (1.5 days)
1. **Guest Analytics Service**
   - Implement GuestAnalyticsService
   - Create demographic analysis methods
   - Build satisfaction tracking

2. **Guest Analytics APIs**
   - Develop GuestAnalyticsController
   - Create demographic endpoints
   - Implement satisfaction APIs

3. **Guest Analytics Frontend**
   - Build guest demographic displays
   - Create satisfaction visualizations
   - Implement spending pattern charts

### Phase 3: Booking Performance (1 day)
1. **Booking Performance Service**
   - Implement BookingPerformanceService
   - Create conversion analysis methods
   - Build source tracking functionality

2. **Booking Performance APIs**
   - Develop BookingController
   - Create performance endpoints
   - Implement conversion tracking APIs

3. **Booking Performance Frontend**
   - Build booking performance displays
   - Create conversion funnel charts
   - Implement source analysis visualization

## Quality Assurance

### Testing Requirements
1. **Unit Tests**
   - Service method testing
   - Calculation validation
   - Data accuracy testing

2. **Integration Tests**
   - Cross-module data integration
   - API endpoint testing
   - Cache functionality validation

3. **Performance Tests**
   - Large dataset handling
   - Complex query optimization
   - Real-time data processing

## Success Metrics

### Performance Metrics
- **Report Generation**: < 10 seconds for accommodation reports
- **Data Accuracy**: 100% accuracy in occupancy calculations
- **User Engagement**: Daily use by accommodation managers
- **Cache Efficiency**: > 85% cache hit rate

### Business Metrics
- **Occupancy Optimization**: Improved occupancy rates
- **Guest Satisfaction**: Enhanced satisfaction tracking
- **Revenue Optimization**: Better ADR and RevPAR performance
- **Operational Efficiency**: Improved resource allocation

## Dependencies

### Internal Dependencies
- **Issue #01**: Core reporting architecture
- **Phase 2**: Accommodation booking data
- **Guest Management**: Guest profile data
- **Satisfaction System**: Guest feedback data

### External Dependencies
- **Chart.js**: For occupancy visualizations
- **Ant Design**: For UI components
- **React Table**: For performance tables

## Deliverables

### Backend Deliverables
- [ ] Occupancy analytics service
- [ ] Guest analytics service
- [ ] Booking performance service
- [ ] Accommodation API controllers
- [ ] Database optimizations

### Frontend Deliverables
- [ ] Accommodation dashboard component
- [ ] Occupancy overview displays
- [ ] Guest analytics visualizations
- [ ] Room performance tables
- [ ] Booking performance charts

### Testing Deliverables
- [ ] Unit test suite
- [ ] Integration tests
- [ ] Performance validation tests
- [ ] Data accuracy tests

---

**Estimated Completion**: End of Week 2
**Next Phase**: Activity and Experience Reports (Issue #04)
