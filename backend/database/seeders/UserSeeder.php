<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'email' => 'admin@banrimkwae.com',
            'username' => 'admin',
            'password' => Hash::make('password'),
            'department' => 'Administration',
            'position' => 'System Administrator',
            'status' => 'active',
            'start_date' => now(),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        // Create manager user
        $manager = User::create([
            'first_name' => 'Resort',
            'last_name' => 'Manager',
            'email' => 'manager@banrimkwae.com',
            'username' => 'manager',
            'password' => Hash::make('password'),
            'department' => 'Management',
            'position' => 'Resort Manager',
            'status' => 'active',
            'start_date' => now(),
            'email_verified_at' => now(),
        ]);
        $manager->assignRole('manager');
    }
}
