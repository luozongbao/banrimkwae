<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\DashboardController;
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
    Route::get('roles/permissions', [RoleController::class, 'permissions'])->name('roles.permissions')->middleware('permission:roles.view');
    Route::middleware('permission:roles.view')->group(function () {
        Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
        Route::get('roles/{role}', [RoleController::class, 'show'])->name('roles.show');
    });
    Route::middleware('permission:roles.create')->group(function () {
        Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
        Route::post('roles/{role}/clone', [RoleController::class, 'clone'])->name('roles.clone');
    });
    Route::middleware('permission:roles.edit')->group(function () {
        Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::patch('roles/{role}', [RoleController::class, 'update'])->name('roles.update.patch');
        Route::post('roles/{role}/assign-users', [RoleController::class, 'assignUsers'])->name('roles.assign-users');
        Route::post('roles/{role}/remove-users', [RoleController::class, 'removeUsers'])->name('roles.remove-users');
    });
    Route::middleware('permission:roles.delete')->group(function () {
        Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    });

    // Settings Management
    Route::apiResource('settings', SettingController::class)->except(['store', 'destroy']);
    Route::patch('settings/batch', [SettingController::class, 'updateBatch'])->name('settings.batch-update');

    // Dashboard Management
    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        Route::get('/summary', [DashboardController::class, 'getSummary'])->name('summary');
        Route::get('/kpi/{kpiType}', [DashboardController::class, 'getKPIData'])->name('kpi');
        Route::get('/charts/{chartType}', [DashboardController::class, 'getChartData'])->name('charts');
        Route::post('/alerts/{alertId}/dismiss', [DashboardController::class, 'dismissAlert'])->name('alerts.dismiss');
        Route::get('/realtime', [DashboardController::class, 'getRealtimeUpdates'])->name('realtime');
    });
});
