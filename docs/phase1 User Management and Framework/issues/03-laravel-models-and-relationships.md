# Issue #03: Laravel Models and Relationships

## Title
Create Eloquent Models with Proper Relationships and Business Logic

## Priority
**High** - Core models required for authentication and user management

## Estimated Time
2-3 hours

## Description
Implement Eloquent models for User, Setting, and related functionality with proper relationships, accessors, mutators, and business logic methods.

## Acceptance Criteria
- [ ] User model with complete functionality implemented
- [ ] Setting model with helper methods implemented
- [ ] Proper model relationships established
- [ ] Model traits and interfaces implemented
- [ ] Model tests created

## Implementation Details

### 1. User Model
```php
<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, LogsActivity;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'username',
        'phone',
        'department',
        'position',
        'password',
        'avatar',
        'status',
        'start_date',
        'end_date',
        'force_password_change',
        'preferences',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'start_date' => 'date',
        'end_date' => 'date',
        'last_login_at' => 'datetime',
        'force_password_change' => 'boolean',
        'preferences' => 'array',
    ];

    protected $appends = [
        'full_name',
        'initials',
        'avatar_url',
        'is_active',
    ];

    // Activity Log Configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'first_name', 'last_name', 'email', 'username', 
                'phone', 'department', 'position', 'status',
                'start_date', 'end_date'
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Accessors
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => "{$this->first_name} {$this->last_name}",
        );
    }

    protected function initials(): Attribute
    {
        return Attribute::make(
            get: fn () => substr($this->first_name, 0, 1) . substr($this->last_name, 0, 1),
        );
    }

    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->avatar 
                ? asset('storage/' . $this->avatar)
                : "https://ui-avatars.com/api/?name=" . urlencode($this->full_name) . "&color=2E86AB&background=F7FAFC",
        );
    }

    protected function isActive(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->status === 'active',
        );
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    public function scopeByRole($query, $role)
    {
        return $query->role($role);
    }

    // Helper Methods
    public function updateLastLogin($ip = null)
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip ?? request()->ip(),
        ]);
    }

    public function deactivate()
    {
        $this->update(['status' => 'inactive']);
        activity()
            ->performedOn($this)
            ->withProperties(['status' => 'inactive'])
            ->log('User deactivated');
    }

    public function activate()
    {
        $this->update(['status' => 'active']);
        activity()
            ->performedOn($this)
            ->withProperties(['status' => 'active'])
            ->log('User activated');
    }

    public function suspend()
    {
        $this->update(['status' => 'suspended']);
        activity()
            ->performedOn($this)
            ->withProperties(['status' => 'suspended'])
            ->log('User suspended');
    }

    public function hasActiveSession()
    {
        return $this->last_login_at && 
               $this->last_login_at->diffInMinutes(now()) < config('session.lifetime');
    }

    public function getPreference($key, $default = null)
    {
        return data_get($this->preferences, $key, $default);
    }

    public function setPreference($key, $value)
    {
        $preferences = $this->preferences ?? [];
        data_set($preferences, $key, $value);
        $this->update(['preferences' => $preferences]);
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    public function isManager()
    {
        return $this->hasRole(['admin', 'manager']);
    }

    public function canManageUsers()
    {
        return $this->hasPermissionTo('users.manage') || $this->isAdmin();
    }

    public function canAccessSystem()
    {
        return $this->is_active && $this->email_verified_at;
    }
}
```

### 2. Setting Model (Enhanced)
```php
<?php
// app/Models/Setting.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'key',
        'value',
        'type',
        'category',
        'group',
        'description',
        'is_public',
        'is_editable',
        'validation_rules',
        'sort_order',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_editable' => 'boolean',
        'validation_rules' => 'array',
        'sort_order' => 'integer',
    ];

    // Activity Log Configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['key', 'value', 'type', 'category'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // Cache settings for performance
    protected static function booted()
    {
        static::saved(function ($setting) {
            Cache::forget('settings');
            Cache::forget("setting.{$setting->key}");
            Cache::forget("settings.category.{$setting->category}");
        });

        static::deleted(function ($setting) {
            Cache::forget('settings');
            Cache::forget("setting.{$setting->key}");
            Cache::forget("settings.category.{$setting->category}");
        });
    }

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeEditable($query)
    {
        return $query->where('is_editable', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('key');
    }

    // Static Helper Methods
    public static function get($key, $default = null)
    {
        return Cache::remember("setting.{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->getCastedValue() : $default;
        });
    }

    public static function set($key, $value, $type = null)
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => static::prepareValue($value, $type),
                'type' => $type ?? static::inferType($value),
            ]
        );

        activity()
            ->performedOn($setting)
            ->withProperties([
                'key' => $key,
                'old_value' => $setting->getOriginal('value'),
                'new_value' => $value,
            ])
            ->log('Setting updated');

        return $setting;
    }

    public static function getByCategory($category, $publicOnly = false)
    {
        $cacheKey = $publicOnly ? "settings.category.{$category}.public" : "settings.category.{$category}";
        
        return Cache::remember($cacheKey, 3600, function () use ($category, $publicOnly) {
            $query = static::byCategory($category)->ordered();
            
            if ($publicOnly) {
                $query->public();
            }
            
            return $query->get()->mapWithKeys(function ($setting) {
                return [$setting->key => $setting->getCastedValue()];
            });
        });
    }

    public static function getPublic()
    {
        return Cache::remember('settings.public', 3600, function () {
            return static::public()
                ->ordered()
                ->get()
                ->mapWithKeys(function ($setting) {
                    return [$setting->key => $setting->getCastedValue()];
                });
        });
    }

    public static function getAllGrouped()
    {
        return Cache::remember('settings.grouped', 3600, function () {
            return static::ordered()
                ->get()
                ->groupBy('category')
                ->map(function ($settings) {
                    return $settings->mapWithKeys(function ($setting) {
                        return [$setting->key => [
                            'value' => $setting->getCastedValue(),
                            'type' => $setting->type,
                            'description' => $setting->description,
                            'is_editable' => $setting->is_editable,
                            'validation_rules' => $setting->validation_rules,
                        ]];
                    });
                });
        });
    }

    // Instance Methods
    public function getCastedValue()
    {
        return static::castValue($this->value, $this->type);
    }

    public function setValue($value)
    {
        $this->value = static::prepareValue($value, $this->type);
        return $this;
    }

    // Type Handling
    protected static function castValue($value, $type)
    {
        if (is_null($value)) {
            return null;
        }

        return match($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'array', 'json' => is_string($value) ? json_decode($value, true) : $value,
            'date' => \Carbon\Carbon::parse($value),
            'datetime' => \Carbon\Carbon::parse($value),
            default => $value,
        };
    }

    protected static function prepareValue($value, $type)
    {
        if (is_null($value)) {
            return null;
        }

        return match($type) {
            'boolean' => $value ? 'true' : 'false',
            'array', 'json' => is_array($value) ? json_encode($value) : $value,
            'date', 'datetime' => $value instanceof \Carbon\Carbon ? $value->toDateTimeString() : $value,
            default => (string) $value,
        };
    }

    protected static function inferType($value)
    {
        if (is_bool($value)) return 'boolean';
        if (is_int($value)) return 'integer';
        if (is_float($value)) return 'float';
        if (is_array($value)) return 'array';
        return 'string';
    }

    // Validation
    public function validateValue($value)
    {
        if (!$this->validation_rules) {
            return true;
        }

        $validator = \Validator::make(
            ['value' => $value],
            ['value' => $this->validation_rules]
        );

        return $validator->passes();
    }
}
```

### 3. Model Traits

#### Audit Trail Trait
```php
<?php
// app/Traits/HasAuditTrail.php

namespace App\Traits;

trait HasAuditTrail
{
    public function getAuditLog()
    {
        return activity()
            ->forSubject($this)
            ->with('causer')
            ->latest()
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'properties' => $activity->properties,
                    'created_at' => $activity->created_at,
                    'causer' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->full_name,
                        'email' => $activity->causer->email,
                    ] : null,
                ];
            });
    }

    public function getRecentActivity($limit = 10)
    {
        return $this->getAuditLog()->take($limit);
    }
}
```

### 4. Model Tests

#### User Model Test
```php
<?php
// tests/Unit/Models/UserTest.php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

class UserTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    public function test_user_can_be_created()
    {
        $user = User::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
        ]);
    }

    public function test_full_name_accessor()
    {
        $user = User::factory()->make([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $this->assertEquals('John Doe', $user->full_name);
    }

    public function test_initials_accessor()
    {
        $user = User::factory()->make([
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $this->assertEquals('JD', $user->initials);
    }

    public function test_user_can_be_activated_and_deactivated()
    {
        $user = User::factory()->create(['status' => 'inactive']);

        $user->activate();
        $this->assertEquals('active', $user->fresh()->status);

        $user->deactivate();
        $this->assertEquals('inactive', $user->fresh()->status);
    }

    public function test_user_preferences()
    {
        $user = User::factory()->create();

        $user->setPreference('theme', 'dark');
        $this->assertEquals('dark', $user->getPreference('theme'));

        $user->setPreference('notifications.email', true);
        $this->assertTrue($user->getPreference('notifications.email'));
    }

    public function test_user_role_methods()
    {
        $user = User::factory()->create();
        $adminRole = Role::findByName('admin');
        $user->assignRole($adminRole);

        $this->assertTrue($user->isAdmin());
        $this->assertTrue($user->isManager());
        $this->assertTrue($user->canManageUsers());
    }
}
```

#### Setting Model Test
```php
<?php
// tests/Unit/Models/SettingTest.php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

class SettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_setting_can_be_created()
    {
        $setting = Setting::create([
            'key' => 'test.setting',
            'value' => 'test value',
            'type' => 'string',
            'category' => 'test',
        ]);

        $this->assertDatabaseHas('settings', [
            'key' => 'test.setting',
            'value' => 'test value',
        ]);
    }

    public function test_setting_get_method()
    {
        Setting::create([
            'key' => 'app.name',
            'value' => 'Test App',
            'type' => 'string',
        ]);

        $this->assertEquals('Test App', Setting::get('app.name'));
        $this->assertEquals('Default', Setting::get('nonexistent.key', 'Default'));
    }

    public function test_setting_set_method()
    {
        Setting::set('test.boolean', true);
        
        $this->assertDatabaseHas('settings', [
            'key' => 'test.boolean',
            'value' => 'true',
            'type' => 'boolean',
        ]);

        $this->assertTrue(Setting::get('test.boolean'));
    }

    public function test_setting_type_casting()
    {
        Setting::set('test.integer', 42);
        Setting::set('test.boolean', true);
        Setting::set('test.array', ['one', 'two', 'three']);

        $this->assertEquals(42, Setting::get('test.integer'));
        $this->assertTrue(Setting::get('test.boolean'));
        $this->assertEquals(['one', 'two', 'three'], Setting::get('test.array'));
    }

    public function test_settings_by_category()
    {
        Setting::create(['key' => 'cat1.setting1', 'value' => 'value1', 'category' => 'cat1']);
        Setting::create(['key' => 'cat1.setting2', 'value' => 'value2', 'category' => 'cat1']);
        Setting::create(['key' => 'cat2.setting1', 'value' => 'value3', 'category' => 'cat2']);

        $cat1Settings = Setting::getByCategory('cat1');
        
        $this->assertCount(2, $cat1Settings);
        $this->assertEquals('value1', $cat1Settings['cat1.setting1']);
        $this->assertEquals('value2', $cat1Settings['cat1.setting2']);
    }

    public function test_settings_cache_invalidation()
    {
        Cache::shouldReceive('forget')->with('settings');
        Cache::shouldReceive('forget')->with('setting.test.key');
        Cache::shouldReceive('forget')->with('settings.category.test');

        Setting::create([
            'key' => 'test.key',
            'value' => 'test value',
            'category' => 'test',
        ]);
    }
}
```

## Commands to Run
```bash
# Generate models if not created
php artisan make:model Setting --factory

# Generate traits
mkdir -p app/Traits

# Run tests
php artisan test --filter UserTest
php artisan test --filter SettingTest
```

## Testing Criteria
- [ ] All model methods work correctly
- [ ] Relationships are properly established
- [ ] Accessors and mutators function as expected
- [ ] Activity logging works properly
- [ ] Cache invalidation works correctly
- [ ] All tests pass

## Dependencies
- Issue #02: Database Schema Design

## Related Issues
- #04: Authentication System
- #05: API Controllers and Routes

## Files to Create/Modify
- `app/Models/User.php` - Enhanced User model
- `app/Models/Setting.php` - Complete Setting model
- `app/Traits/HasAuditTrail.php` - Audit trail functionality
- `tests/Unit/Models/` - Model tests
- `database/factories/` - Model factories
