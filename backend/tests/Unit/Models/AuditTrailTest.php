<?php

use App\Models\User;
use App\Models\Setting;

it('has audit trail functionality for User model', function () {
    $user = User::factory()->create([
        'first_name' => 'John',
        'last_name' => 'Doe',
    ]);

    // Update the user to generate activity log
    $user->update(['first_name' => 'Jane']);

    $auditLog = $user->getAuditLog();
    expect($auditLog)->toHaveCount(2); // creation + update
    expect($auditLog->first()['description'])->toBe('created');
    expect($auditLog->last()['description'])->toBe('updated');

    $recentActivity = $user->getRecentActivity(5);
    expect($recentActivity)->toHaveCount(2);
});

it('has audit trail functionality for Setting model', function () {
    $setting = Setting::create([
        'key' => 'test.setting',
        'value' => 'initial value',
        'type' => 'string',
    ]);

    // Update the setting to generate activity log
    $setting->update(['value' => 'updated value']);

    $auditLog = $setting->getAuditLog();
    expect($auditLog)->toHaveCount(2); // creation + update
    expect($auditLog->first()['description'])->toBe('created');
    expect($auditLog->last()['description'])->toBe('updated');

    $recentActivity = $setting->getRecentActivity(3);
    expect($recentActivity)->toHaveCount(2);
});
