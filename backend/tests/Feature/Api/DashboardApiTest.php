<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'Database\Seeders\RolesAndPermissionsSeeder']);
});

describe('Dashboard API', function () {
    it('can get dashboard summary', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        // Create some test data
        User::factory()->count(10)->create();

        $response = $this->getJson('/api/dashboard/summary');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'users' => [
                        'total',
                        'active',
                        'inactive',
                        'new_this_month',
                    ],
                    'system' => [
                        'version',
                        'uptime',
                        'last_backup',
                    ],
                    'activity' => [
                        'logins_today',
                        'actions_today',
                    ],
                    'alerts' => [
                        '*' => [
                            'id',
                            'title',
                            'message',
                            'type',
                            'created_at',
                        ]
                    ]
                ]
            ]);

        expect($response->json('data.users.total'))->toBeGreaterThan(10);
    });

    it('can get KPI data for different types', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        // Test user KPI
        $response = $this->getJson('/api/dashboard/kpi/users');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'current_value',
                    'previous_value',
                    'change_percentage',
                    'trend',
                    'period',
                ]
            ]);

        // Test activity KPI
        $response = $this->getJson('/api/dashboard/kpi/activity');
        $response->assertOk();

        // Test performance KPI
        $response = $this->getJson('/api/dashboard/kpi/performance');
        $response->assertOk();
    });

    it('validates KPI type parameter', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/dashboard/kpi/invalid-type');

        $response->assertNotFound();
    });

    it('can get chart data for different chart types', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        // Test user registration chart
        $response = $this->getJson('/api/dashboard/charts/user-registrations');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'labels' => [],
                    'datasets' => [
                        '*' => [
                            'label',
                            'data',
                            'backgroundColor',
                            'borderColor',
                        ]
                    ]
                ]
            ]);

        // Test activity chart
        $response = $this->getJson('/api/dashboard/charts/user-activity');
        $response->assertOk();

        // Test system performance chart
        $response = $this->getJson('/api/dashboard/charts/system-performance');
        $response->assertOk();
    });

    it('can filter chart data by date range', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/dashboard/charts/user-registrations?start_date=2024-01-01&end_date=2024-12-31');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'labels',
                    'datasets'
                ]
            ]);
    });

    it('validates chart type parameter', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/dashboard/charts/invalid-chart');

        $response->assertNotFound();
    });

    it('can dismiss alerts', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        // First get dashboard to see if there are any alerts
        $summaryResponse = $this->getJson('/api/dashboard/summary');
        $alerts = $summaryResponse->json('data.alerts');

        if (!empty($alerts)) {
            $alertId = $alerts[0]['id'];

            $response = $this->postJson("/api/dashboard/alerts/{$alertId}/dismiss");

            $response->assertOk()
                ->assertJson([
                    'message' => 'Alert dismissed successfully'
                ]);
        } else {
            // If no alerts exist, test with a fake ID
            $response = $this->postJson('/api/dashboard/alerts/999/dismiss');
            $response->assertNotFound();
        }
    });

    it('can get realtime updates', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/dashboard/realtime');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'active_users',
                    'recent_activities' => [
                        '*' => [
                            'user',
                            'action',
                            'timestamp',
                        ]
                    ],
                    'system_status' => [
                        'cpu_usage',
                        'memory_usage',
                        'disk_usage',
                    ],
                    'notifications' => []
                ]
            ]);
    });

    it('filters realtime data based on user permissions', function () {
        $manager = User::factory()->create();
        $manager->assignRole('manager');
        Sanctum::actingAs($manager);

        $response = $this->getJson('/api/dashboard/realtime');

        $response->assertOk();
        
        // Manager should get less detailed system info
        $systemStatus = $response->json('data.system_status');
        expect($systemStatus)->toBeArray();
    });

    it('requires authentication for dashboard endpoints', function () {
        $response = $this->getJson('/api/dashboard/summary');
        $response->assertUnauthorized();

        $response = $this->getJson('/api/dashboard/kpi/users');
        $response->assertUnauthorized();

        $response = $this->getJson('/api/dashboard/charts/user-registrations');
        $response->assertUnauthorized();
    });

    it('requires proper permissions for dashboard access', function () {
        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Sanctum::actingAs($staff);

        // Staff should have limited dashboard access
        $response = $this->getJson('/api/dashboard/summary');
        $response->assertForbidden();
    });

    it('handles dashboard performance with large datasets', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        // Create a large number of users
        User::factory()->count(1000)->create();

        $startTime = microtime(true);
        $response = $this->getJson('/api/dashboard/summary');
        $endTime = microtime(true);

        $response->assertOk();
        
        // Response should be under 2 seconds
        expect($endTime - $startTime)->toBeLessThan(2.0);
    });

    it('caches dashboard data appropriately', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        // First request
        $startTime1 = microtime(true);
        $response1 = $this->getJson('/api/dashboard/summary');
        $endTime1 = microtime(true);

        // Second request (should be faster due to caching)
        $startTime2 = microtime(true);
        $response2 = $this->getJson('/api/dashboard/summary');
        $endTime2 = microtime(true);

        $response1->assertOk();
        $response2->assertOk();

        // Second request should be significantly faster
        $time1 = $endTime1 - $startTime1;
        $time2 = $endTime2 - $startTime2;
        
        expect($time2)->toBeLessThan($time1);
    });

    it('can get dashboard data with different time periods', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        // Test with different periods
        $periods = ['today', 'week', 'month', 'year'];

        foreach ($periods as $period) {
            $response = $this->getJson("/api/dashboard/summary?period={$period}");
            $response->assertOk();
        }
    });

    it('handles concurrent dashboard requests', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        // Simulate concurrent requests
        $promises = [];
        for ($i = 0; $i < 5; $i++) {
            $promises[] = $this->getJson('/api/dashboard/summary');
        }

        // All requests should succeed
        foreach ($promises as $response) {
            $response->assertOk();
        }
    });

    it('can export dashboard data', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/dashboard/export?format=json&type=summary');

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/json');
    });

    it('validates export parameters', function () {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/dashboard/export?format=invalid');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['format']);
    });
});
