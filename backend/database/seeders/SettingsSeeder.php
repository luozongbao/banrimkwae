<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General Settings
            [
                'key' => 'app.name',
                'value' => 'Banrimkwae Resort Management',
                'type' => 'string',
                'category' => 'general',
                'description' => 'Application name',
                'is_public' => true,
            ],
            [
                'key' => 'app.logo',
                'value' => null,
                'type' => 'file',
                'category' => 'general',
                'description' => 'Application logo',
                'is_public' => true,
            ],
            [
                'key' => 'resort.name',
                'value' => 'Banrimkwae Resort',
                'type' => 'string',
                'category' => 'resort',
                'description' => 'Resort name',
                'is_public' => true,
            ],
            [
                'key' => 'resort.address',
                'value' => 'Kanchanaburi, Thailand',
                'type' => 'text',
                'category' => 'resort',
                'description' => 'Resort address',
                'is_public' => true,
            ],
            [
                'key' => 'resort.phone',
                'value' => null,
                'type' => 'string',
                'category' => 'resort',
                'description' => 'Resort phone number',
                'is_public' => true,
            ],
            [
                'key' => 'resort.email',
                'value' => null,
                'type' => 'email',
                'category' => 'resort',
                'description' => 'Resort email address',
                'is_public' => true,
            ],
            
            // Security Settings
            [
                'key' => 'security.password_min_length',
                'value' => '8',
                'type' => 'integer',
                'category' => 'security',
                'description' => 'Minimum password length',
                'is_public' => false,
            ],
            [
                'key' => 'security.require_uppercase',
                'value' => 'true',
                'type' => 'boolean',
                'category' => 'security',
                'description' => 'Require uppercase letters in password',
                'is_public' => false,
            ],
            [
                'key' => 'security.require_numbers',
                'value' => 'true',
                'type' => 'boolean',
                'category' => 'security',
                'description' => 'Require numbers in password',
                'is_public' => false,
            ],
            [
                'key' => 'security.require_special_chars',
                'value' => 'true',
                'type' => 'boolean',
                'category' => 'security',
                'description' => 'Require special characters in password',
                'is_public' => false,
            ],
            [
                'key' => 'security.session_timeout',
                'value' => '30',
                'type' => 'integer',
                'category' => 'security',
                'description' => 'Session timeout in minutes',
                'is_public' => false,
            ],
            [
                'key' => 'security.max_login_attempts',
                'value' => '5',
                'type' => 'integer',
                'category' => 'security',
                'description' => 'Maximum login attempts before lockout',
                'is_public' => false,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
