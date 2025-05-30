<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Facades\Cache;
use App\Traits\HasAuditTrail;

class Setting extends Model
{
    use HasFactory, LogsActivity, HasAuditTrail;

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
        $inferredType = $type ?? static::inferType($value);
        
        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => static::prepareValue($value, $inferredType),
                'type' => $inferredType,
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

    /**
     * Legacy method for backward compatibility
     */
    public function getCastValueAttribute()
    {
        return $this->getCastedValue();
    }

    /**
     * Legacy method for backward compatibility
     */
    public function setCastValue($value)
    {
        return $this->setValue($value);
    }
}
