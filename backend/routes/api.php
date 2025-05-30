<?php

use App\Http\Controllers\Api\AuthController;
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
    // Other protected routes will go here
});
