<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard summary data
     */
    public function getSummary(Request $request): JsonResponse
    {
        try {
            $dateRange = $request->query('date_range', 'today');
            $user = $request->user();
            
            // Get date range based on parameter
            $dates = $this->getDateRange($dateRange);
            
            // Get KPI data based on user permissions
            $data = [
                'todayRevenue' => $this->getTodayRevenue($user),
                'occupancyRate' => $this->getOccupancyRate($dates),
                'todayBookings' => $this->getTodayBookings(),
                'currentGuests' => $this->getCurrentGuests(),
                'revenueTrend' => $this->getRevenueTrend($dates),
                'occupancyTrend' => $this->getOccupancyTrend($dates),
                'revenueChart' => $this->getRevenueChartData($dates),
                'occupancyChart' => $this->getOccupancyChartData($dates),
                'alerts' => $this->getAlerts($user),
                'recentActivities' => $this->getRecentActivities($user),
                'lastUpdated' => now()->toISOString(),
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);

        }
    }

    /**
     * Get KPI data for specific type
     */
    public function getKPIData(Request $request, string $kpiType): JsonResponse
    {
        try {
            $dateRange = $request->query('date_range', 'today');
            $dates = $this->getDateRange($dateRange);
            $user = $request->user();

            $data = match($kpiType) {
                'revenue' => $this->getRevenueKPI($dates, $user),
                'occupancy' => $this->getOccupancyKPI($dates, $user),
                'bookings' => $this->getBookingsKPI($dates, $user),
                'guests' => $this->getGuestsKPI($dates, $user),
                'restaurant' => $this->getRestaurantKPI($dates, $user),
                'activities' => $this->getActivitiesKPI($dates, $user),
                'inventory' => $this->getInventoryKPI($dates, $user),
                default => throw new \InvalidArgumentException('Invalid KPI type')
            };

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch KPI data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get chart data for specific type
     */
    public function getChartData(Request $request, string $chartType): JsonResponse
    {
        try {
            $filters = $request->all();
            $user = $request->user();

            $data = match($chartType) {
                'revenue-trend' => $this->getRevenueChartData($this->getDateRange($filters['date_range'] ?? 'today')),
                'occupancy-trend' => $this->getOccupancyChartData($this->getDateRange($filters['date_range'] ?? 'today')),
                'booking-pattern' => $this->getBookingPatternData($filters),
                'performance-comparison' => $this->getPerformanceComparisonData($filters),
                default => throw new \InvalidArgumentException('Invalid chart type')
            };

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch chart data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Dismiss an alert
     */
    public function dismissAlert(Request $request, string $alertId): JsonResponse
    {
        try {
            // For demo purposes, we'll just return success
            // In a real implementation, you would update the database
            return response()->json([
                'success' => true,
                'message' => 'Alert dismissed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to dismiss alert',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get real-time updates
     */
    public function getRealtimeUpdates(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Mock real-time data - in production this would come from actual data sources
            $data = [
                'todayRevenue' => rand(50000, 150000),
                'occupancyRate' => rand(60, 95),
                'todayBookings' => rand(5, 25),
                'currentGuests' => rand(20, 80),
                'lastUpdated' => now()->toISOString(),
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch real-time updates',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Private helper methods
     */
    private function getDateRange(string $range): array
    {
        return match($range) {
            'today' => [
                'start' => Carbon::today(),
                'end' => Carbon::today()->endOfDay()
            ],
            'yesterday' => [
                'start' => Carbon::yesterday(),
                'end' => Carbon::yesterday()->endOfDay()
            ],
            'week' => [
                'start' => Carbon::now()->startOfWeek(),
                'end' => Carbon::now()->endOfWeek()
            ],
            'month' => [
                'start' => Carbon::now()->startOfMonth(),
                'end' => Carbon::now()->endOfMonth()
            ],
            'year' => [
                'start' => Carbon::now()->startOfYear(),
                'end' => Carbon::now()->endOfYear()
            ],
            default => [
                'start' => Carbon::today(),
                'end' => Carbon::today()->endOfDay()
            ]
        };
    }

    private function getTodayRevenue($user): float
    {
        // Mock data - replace with actual revenue calculation
        return rand(25000, 75000);
    }

    private function getOccupancyRate(array $dates): int
    {
        // Mock data - replace with actual occupancy calculation
        return rand(65, 95);
    }

    private function getTodayBookings(): int
    {
        // Mock data - replace with actual booking count
        return rand(8, 20);
    }

    private function getCurrentGuests(): int
    {
        // Mock data - replace with actual guest count
        return rand(30, 70);
    }

    private function getRevenueTrend(array $dates): array
    {
        return [
            'direction' => rand(0, 1) ? 'up' : 'down',
            'percentage' => rand(5, 25),
            'period' => 'last week'
        ];
    }

    private function getOccupancyTrend(array $dates): array
    {
        return [
            'direction' => rand(0, 1) ? 'up' : 'down', 
            'percentage' => rand(3, 15),
            'period' => 'last week'
        ];
    }

    private function getRevenueChartData(array $dates): array
    {
        $data = [];
        for ($i = 7; $i >= 0; $i--) {
            $data[] = [
                'date' => Carbon::now()->subDays($i)->format('M d'),
                'value' => rand(15000, 45000)
            ];
        }
        return $data;
    }

    private function getOccupancyChartData(array $dates): array
    {
        $data = [];
        for ($i = 7; $i >= 0; $i--) {
            $data[] = [
                'date' => Carbon::now()->subDays($i)->format('M d'),
                'value' => rand(60, 95)
            ];
        }
        return $data;
    }

    private function getAlerts($user): array
    {
        // Mock alerts data
        return [
            [
                'id' => 'alert-1',
                'type' => 'warning',
                'title' => 'Low Inventory Alert',
                'message' => 'Restaurant supplies are running low',
                'timestamp' => Carbon::now()->subHours(2)->toISOString(),
                'actionUrl' => '/inventory',
                'dismissible' => true
            ],
            [
                'id' => 'alert-2',
                'type' => 'info',
                'title' => 'Upcoming Check-ins',
                'message' => '5 guests checking in today',
                'timestamp' => Carbon::now()->subHours(1)->toISOString(),
                'actionUrl' => '/bookings',
                'dismissible' => true
            ]
        ];
    }

    private function getRecentActivities($user): array
    {
        // Mock recent activities
        return [
            [
                'id' => 'activity-1',
                'type' => 'booking',
                'title' => 'New booking created',
                'description' => 'Room 101 booked for 3 nights',
                'timestamp' => Carbon::now()->subMinutes(30)->toISOString(),
                'user' => 'John Doe'
            ],
            [
                'id' => 'activity-2',
                'type' => 'check-in',
                'title' => 'Guest checked in',
                'description' => 'Sarah Johnson checked into Room 205',
                'timestamp' => Carbon::now()->subHour()->toISOString(),
                'user' => 'Reception Staff'
            ]
        ];
    }

    private function getRevenueKPI(array $dates, $user): array
    {
        return [
            'current' => rand(25000, 75000),
            'previous' => rand(20000, 70000),
            'trend' => $this->getRevenueTrend($dates),
            'target' => 80000,
            'achievement' => rand(70, 120)
        ];
    }

    private function getOccupancyKPI(array $dates, $user): array
    {
        return [
            'current' => rand(65, 95),
            'previous' => rand(60, 90),
            'trend' => $this->getOccupancyTrend($dates),
            'target' => 85,
            'achievement' => rand(80, 110)
        ];
    }

    private function getBookingsKPI(array $dates, $user): array
    {
        return [
            'current' => rand(8, 20),
            'previous' => rand(5, 18),
            'trend' => [
                'direction' => 'up',
                'percentage' => rand(10, 30),
                'period' => 'last week'
            ]
        ];
    }

    private function getGuestsKPI(array $dates, $user): array
    {
        return [
            'current' => rand(30, 70),
            'previous' => rand(25, 65),
            'trend' => [
                'direction' => 'up',
                'percentage' => rand(5, 20),
                'period' => 'last week'
            ]
        ];
    }

    private function getRestaurantKPI(array $dates, $user): array
    {
        return [
            'revenue' => rand(15000, 35000),
            'orders' => rand(50, 120),
            'avgOrderValue' => rand(250, 450),
            'trend' => [
                'direction' => rand(0, 1) ? 'up' : 'down',
                'percentage' => rand(5, 15),
                'period' => 'last week'
            ]
        ];
    }

    private function getActivitiesKPI(array $dates, $user): array
    {
        return [
            'bookings' => rand(15, 40),
            'revenue' => rand(8000, 20000),
            'participants' => rand(25, 80),
            'trend' => [
                'direction' => 'up',
                'percentage' => rand(8, 25),
                'period' => 'last week'
            ]
        ];
    }

    private function getInventoryKPI(array $dates, $user): array
    {
        return [
            'lowStockItems' => rand(3, 12),
            'totalValue' => rand(150000, 300000),
            'alerts' => rand(2, 8),
            'trend' => [
                'direction' => 'neutral',
                'percentage' => 0,
                'period' => 'last week'
            ]
        ];
    }

    private function getBookingPatternData(array $filters): array
    {
        $data = [];
        $categories = ['Morning', 'Afternoon', 'Evening', 'Night'];
        
        foreach ($categories as $category) {
            $data[] = [
                'category' => $category,
                'value' => rand(5, 25)
            ];
        }
        
        return $data;
    }

    private function getPerformanceComparisonData(array $filters): array
    {
        return [
            ['name' => 'This Month', 'revenue' => rand(80000, 120000), 'occupancy' => rand(75, 95)],
            ['name' => 'Last Month', 'revenue' => rand(70000, 110000), 'occupancy' => rand(70, 90)],
            ['name' => 'Same Month Last Year', 'revenue' => rand(60000, 100000), 'occupancy' => rand(65, 85)]
        ];
    }
}
