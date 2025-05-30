<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SettingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public routes
Route::prefix('auth')->name('api.auth.')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('reset-password');
});

// Public settings route
Route::get('settings/public', [SettingController::class, 'public'])->name('api.settings.public');

// Protected routes
Route::middleware(['auth:sanctum'])->prefix('auth')->name('api.auth.')->group(function () {
    Route::get('/me', [AuthController::class, 'me'])->name('me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/logout-all', [AuthController::class, 'logoutAll'])->name('logout-all');
    Route::post('/change-password', [AuthController::class, 'changePassword'])->name('change-password');
    Route::post('/refresh-token', [AuthController::class, 'refreshToken'])->name('refresh-token');
});

// Protected routes with forced password change check
Route::middleware(['auth:sanctum', 'force.password.change'])->group(function () {
    
    // User Management
    Route::apiResource('users', UserController::class);
    Route::patch('users/{user}/activate', [UserController::class, 'activate'])->name('users.activate');
    Route::patch('users/{user}/deactivate', [UserController::class, 'deactivate'])->name('users.deactivate');
    Route::post('users/{user}/avatar', [UserController::class, 'uploadAvatar'])->name('users.upload-avatar');
    Route::delete('users/{user}/avatar', [UserController::class, 'removeAvatar'])->name('users.remove-avatar');

    // Role Management
    Route::apiResource('roles', RoleController::class);

    // Settings Management
    Route::apiResource('settings', SettingController::class)->except(['store', 'destroy']);
    Route::patch('settings/batch', [SettingController::class, 'updateBatch'])->name('settings.batch-update');
});
