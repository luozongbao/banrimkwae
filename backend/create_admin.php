<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

use App\Models\User;

$admin = User::firstOrCreate([
    'email' => 'admin@banrimkwae.com'
], [
    'first_name' => 'System',
    'last_name' => 'Administrator',
    'username' => 'admin',
    'password' => bcrypt('admin123'),
    'status' => 'active',
    'email_verified_at' => now(),
    'force_password_change' => false
]);

$admin->assignRole('admin');

echo "Admin user created successfully!\n";
echo "Email: " . $admin->email . "\n";
echo "Password: admin123\n";
echo "Please change the password after first login.\n";
