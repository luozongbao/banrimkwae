<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\UpdateSettingRequest;
use App\Http\Requests\Setting\UpdateSettingsRequest;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    // Middleware is now handled in routes or via attributes

    public function index(Request $request): JsonResponse
    {
        $category = $request->get('category');
        $group = $request->get('group');

        $query = Setting::query();

        if ($category) {
            $query->byCategory($category);
        }

        if ($group) {
            $query->byGroup($group);
        }

        $settings = $query->ordered()->get();

        $grouped = $settings->groupBy('category');

        return response()->json([
            'data' => $grouped->map(function ($categorySettings) {
                return SettingResource::collection($categorySettings);
            }),
            'categories' => Setting::distinct()->pluck('category')->sort()->values(),
            'groups' => Setting::distinct()->whereNotNull('group')->pluck('group')->sort()->values(),
        ]);
    }

    public function show(Setting $setting): JsonResponse
    {
        return response()->json([
            'data' => new SettingResource($setting),
        ]);
    }

    public function public(): JsonResponse
    {
        $settings = Setting::getPublic();

        return response()->json([
            'data' => $settings,
        ]);
    }

    public function update(UpdateSettingRequest $request, Setting $setting): JsonResponse
    {
        if (!$setting->is_editable) {
            return response()->json([
                'message' => 'This setting is not editable',
            ], 403);
        }

        $value = $request->value;

        // Validate value against rules if specified
        if ($setting->validation_rules && !$setting->validateValue($value)) {
            return response()->json([
                'message' => 'Invalid value for this setting',
                'errors' => ['value' => ['The value does not meet the validation requirements']],
            ], 422);
        }

        $oldValue = $setting->getCastedValue();
        $setting->setValue($value)->save();

        activity()
            ->performedOn($setting)
            ->withProperties([
                'key' => $setting->key,
                'old_value' => $oldValue,
                'new_value' => $setting->getCastedValue(),
            ])
            ->log('Setting updated');

        return response()->json([
            'message' => 'Setting updated successfully',
            'data' => new SettingResource($setting),
        ]);
    }

    public function updateBatch(UpdateSettingsRequest $request): JsonResponse
    {
        $updated = [];
        $errors = [];

        foreach ($request->settings as $settingData) {
            $setting = Setting::where('key', $settingData['key'])->first();

            if (!$setting->is_editable) {
                $errors[] = "Setting '{$setting->key}' is not editable";
                continue;
            }

            if ($setting->validation_rules && !$setting->validateValue($settingData['value'])) {
                $errors[] = "Invalid value for setting '{$setting->key}'";
                continue;
            }

            $oldValue = $setting->getCastedValue();
            $setting->setValue($settingData['value'])->save();

            $updated[] = [
                'key' => $setting->key,
                'old_value' => $oldValue,
                'new_value' => $setting->getCastedValue(),
            ];
        }

        if (!empty($updated)) {
            activity()
                ->withProperties(['updated_settings' => $updated])
                ->log('Settings batch updated');
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'updated' => count($updated),
            'errors' => $errors,
        ]);
    }
}
