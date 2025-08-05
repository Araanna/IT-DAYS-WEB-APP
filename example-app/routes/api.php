<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Models\YearLevel;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Public resources
Route::get('/year-levels', function () {
    return response()->json([
        'data' => YearLevel::all(),
        'message' => 'Year levels retrieved successfully'
    ]);
});

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // User profile routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/me/qr', [AuthController::class, 'showMyQr']);

    // Attendance routes (for all authenticated users)
    // Add this explicit route FIRST
    Route::get('/attendance', [AttendanceController::class, 'index']);

    // Then keep your existing group
    Route::prefix('attendance')->group(function () {
        Route::post('/log', [AttendanceController::class, 'logTime']);
        Route::get('/today', [AttendanceController::class, 'todayStatus']);
        Route::get('/history', [AttendanceController::class, 'userHistory']);
        // Keep this for backward compatibility
        Route::get('/', [AttendanceController::class, 'index']);
    });

    // SBO-only routes (role checking happens in controllers)
    Route::prefix('sbo')->group(function () {
        Route::get('/attendees', [AuthController::class, 'attendeesList']);
        Route::get('/attendees/{id}/qr', [AuthController::class, 'showQr']);
        Route::post('/scan/{id}', [AuthController::class, 'scan']);
        Route::get('/reports', [AttendanceController::class, 'index']);
    });
});
