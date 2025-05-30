<?php

namespace App\Traits;

use Spatie\Activitylog\Models\Activity;

trait HasAuditTrail
{
    public function getAuditLog()
    {
        return Activity::forSubject($this)
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
                        'name' => $activity->causer->full_name ?? $activity->causer->name ?? 'Unknown',
                        'email' => $activity->causer->email ?? null,
                    ] : null,
                ];
            });
    }

    public function getRecentActivity($limit = 10)
    {
        return $this->getAuditLog()->take($limit);
    }
}
