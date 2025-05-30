<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'Database\Seeders\RolesAndPermissionsSeeder']);
});

it('can create a user', function () {
    $user = User::factory()->create([
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
    ]);

    expect($user)->toBeInstanceOf(User::class);
    $this->assertDatabaseHas('users', [
        'email' => 'john@example.com',
    ]);
});

it('has full name accessor', function () {
    $user = User::factory()->make([
        'first_name' => 'John',
        'last_name' => 'Doe',
    ]);

    expect($user->full_name)->toBe('John Doe');
});

it('has initials accessor', function () {
    $user = User::factory()->make([
        'first_name' => 'John',
        'last_name' => 'Doe',
    ]);

    expect($user->initials)->toBe('JD');
});

it('has is_active accessor', function () {
    $activeUser = User::factory()->make(['status' => 'active']);
    $inactiveUser = User::factory()->make(['status' => 'inactive']);

    expect($activeUser->is_active)->toBeTrue();
    expect($inactiveUser->is_active)->toBeFalse();
});

it('has avatar url accessor', function () {
    $userWithAvatar = User::factory()->make([
        'first_name' => 'John',
        'last_name' => 'Doe',
        'avatar' => 'avatars/john.jpg'
    ]);

    $userWithoutAvatar = User::factory()->make([
        'first_name' => 'Jane',
        'last_name' => 'Smith',
        'avatar' => null
    ]);

    expect($userWithAvatar->avatar_url)->toContain('storage/avatars/john.jpg');
    expect($userWithoutAvatar->avatar_url)->toContain('ui-avatars.com');
    expect($userWithoutAvatar->avatar_url)->toContain('Jane+Smith');
});

it('can be activated and deactivated', function () {
    $user = User::factory()->create(['status' => 'inactive']);

    $user->activate();
    expect($user->fresh()->status)->toBe('active');

    $user->deactivate();
    expect($user->fresh()->status)->toBe('inactive');
});

it('can be suspended', function () {
    $user = User::factory()->create(['status' => 'active']);

    $user->suspend();
    expect($user->fresh()->status)->toBe('suspended');
});

it('can manage preferences', function () {
    $user = User::factory()->create();

    $user->setPreference('theme', 'dark');
    expect($user->getPreference('theme'))->toBe('dark');

    $user->setPreference('notifications.email', true);
    expect($user->getPreference('notifications.email'))->toBeTrue();

    expect($user->getPreference('nonexistent.key'))->toBeNull();
    expect($user->getPreference('nonexistent.key', 'default'))->toBe('default');
});

it('has role methods', function () {
    $user = User::factory()->create();
    $adminRole = Role::findByName('admin');
    $managerRole = Role::findByName('manager');
    
    $user->assignRole($adminRole);

    expect($user->isAdmin())->toBeTrue();
    expect($user->isManager())->toBeTrue();
    expect($user->canManageUsers())->toBeTrue();

    $user->removeRole($adminRole);
    $user->assignRole($managerRole);

    expect($user->isAdmin())->toBeFalse();
    expect($user->isManager())->toBeTrue();
});

it('can update last login', function () {
    $user = User::factory()->create();
    
    expect($user->last_login_at)->toBeNull();
    
    $user->updateLastLogin('192.168.1.1');
    
    expect($user->fresh()->last_login_at)->not->toBeNull();
    expect($user->fresh()->last_login_ip)->toBe('192.168.1.1');
});

it('can check system access', function () {
    $activeVerifiedUser = User::factory()->create([
        'status' => 'active',
        'email_verified_at' => now()
    ]);

    $inactiveUser = User::factory()->create([
        'status' => 'inactive',
        'email_verified_at' => now()
    ]);

    $unverifiedUser = User::factory()->create([
        'status' => 'active',
        'email_verified_at' => null
    ]);

    expect($activeVerifiedUser->canAccessSystem())->toBeTrue();
    expect($inactiveUser->canAccessSystem())->toBeFalse();
    expect($unverifiedUser->canAccessSystem())->toBeFalse();
});

it('has working scopes', function () {
    User::factory()->create(['status' => 'active', 'department' => 'IT']);
    User::factory()->create(['status' => 'inactive', 'department' => 'HR']);
    User::factory()->create(['status' => 'active', 'department' => 'IT']);

    expect(User::active()->count())->toBe(2);
    expect(User::inactive()->count())->toBe(1);
    expect(User::byDepartment('IT')->count())->toBe(2);
    expect(User::byDepartment('HR')->count())->toBe(1);
});
