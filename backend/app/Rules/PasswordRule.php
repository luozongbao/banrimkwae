<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use App\Models\Setting;

class PasswordRule implements Rule
{
    public function passes($attribute, $value)
    {
        $minLength = Setting::get('security.password_min_length', 8);
        $requireUppercase = Setting::get('security.require_uppercase', true);
        $requireNumbers = Setting::get('security.require_numbers', true);
        $requireSpecialChars = Setting::get('security.require_special_chars', true);

        if (strlen($value) < $minLength) {
            return false;
        }

        if ($requireUppercase && !preg_match('/[A-Z]/', $value)) {
            return false;
        }

        if ($requireNumbers && !preg_match('/[0-9]/', $value)) {
            return false;
        }

        if ($requireSpecialChars && !preg_match('/[^A-Za-z0-9]/', $value)) {
            return false;
        }

        return true;
    }

    public function message()
    {
        $minLength = Setting::get('security.password_min_length', 8);
        $requirements = ["at least {$minLength} characters"];

        if (Setting::get('security.require_uppercase', true)) {
            $requirements[] = 'uppercase letter';
        }

        if (Setting::get('security.require_numbers', true)) {
            $requirements[] = 'number';
        }

        if (Setting::get('security.require_special_chars', true)) {
            $requirements[] = 'special character';
        }

        return 'Password must contain ' . implode(', ', $requirements) . '.';
    }
}
