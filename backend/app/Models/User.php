<?php

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
use App\Traits\HasAuditTrail;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles, LogsActivity, HasAuditTrail;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
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
        'last_login_at',
        'last_login_ip',
        'preferences',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
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

    /**
     * Get the activity log options
     */
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

    /**
     * Get the user's full name (Legacy accessor for backward compatibility)
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
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
