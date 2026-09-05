<?php

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EnquiryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Auth model: Sanctum bearer tokens. Authorisation model: `role` middleware
| (alias for App\Http\Middleware\RoleMiddleware) gates every privileged group.
| Public endpoints are explicitly listed; everything else requires a token.
*/

// ---------------------------------------------------------------------------
// Public — auth & password (rate limited to blunt brute force / enumeration)
// ---------------------------------------------------------------------------
Route::middleware('throttle:auth')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});
Route::middleware('throttle:otp')->group(function () {
    Route::post('/password/forgot', [PasswordResetController::class, 'forgotPassword']);
    Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);
});

// ---------------------------------------------------------------------------
// Public — read-only catalogue
// ---------------------------------------------------------------------------
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/featured', [PropertyController::class, 'featured']);
Route::get('/properties/{property}', [PropertyController::class, 'show'])->whereNumber('property');

Route::get('/agents', [AgentController::class, 'index']);
Route::get('/agents/top-performers', [AgentController::class, 'topPerformers']);
Route::get('/agents/{id}', [AgentController::class, 'show'])->whereNumber('id');

// Public — contact & sell-your-property forms (rate limited against spam)
Route::post('/contact', [EnquiryController::class, 'store'])->middleware('throttle:otp');

// ---------------------------------------------------------------------------
// Authenticated (any role)
// ---------------------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/auth/user', fn (Request $request) => new UserResource($request->user()->load('role')));

    // Own profile
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/avatar', [UserController::class, 'uploadAvatar']);

    // Staff profile (admin/manager/agent dashboard) — any authenticated role
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // Notifications (scoped to the caller inside the controller)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->whereNumber('id');
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

    // -----------------------------------------------------------------------
    // Role: user (client)
    // -----------------------------------------------------------------------
    Route::middleware('role:user')->prefix('user')->group(function () {
        Route::get('/saved-properties', [PropertyController::class, 'savedProperties']);
        Route::post('/saved-properties/{property}', [PropertyController::class, 'toggleSaved'])->whereNumber('property');

        Route::get('/bookings', [BookingController::class, 'userBookings']);
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings/{id}', [BookingController::class, 'show'])->whereNumber('id');
        Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel'])->whereNumber('id');
    });

    // -----------------------------------------------------------------------
    // Role: agent
    // -----------------------------------------------------------------------
    Route::middleware('role:agent')->prefix('agent')->group(function () {
        Route::get('/dashboard', [AgentController::class, 'dashboard']);
        Route::get('/dashboard/stats', [DashboardController::class, 'index']);
        Route::get('/statistics', [AgentController::class, 'statistics']);
        Route::get('/properties', [PropertyController::class, 'agentProperties']);

        Route::put('/profile', [ProfileController::class, 'update']);
        Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

        Route::get('/bookings', [BookingController::class, 'agentBookings']);
        Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus'])->whereNumber('id');

        Route::get('/transactions', [TransactionController::class, 'agentTransactions']);
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::get('/earnings', [TransactionController::class, 'report']);
    });

    // -----------------------------------------------------------------------
    // Role: manager or admin — property management
    // -----------------------------------------------------------------------
    Route::middleware('role:manager,admin')->prefix('manager')->group(function () {
        Route::get('/properties', [PropertyController::class, 'manage']);
        Route::post('/properties', [PropertyController::class, 'store']);
        Route::put('/properties/{property}', [PropertyController::class, 'update'])->whereNumber('property');
        Route::delete('/properties/{property}', [PropertyController::class, 'destroy'])->whereNumber('property');
        Route::post('/properties/{id}/restore', [PropertyController::class, 'restore'])->whereNumber('id');
        Route::delete('/properties/{id}/force', [PropertyController::class, 'forceDelete'])->whereNumber('id');
        Route::post('/properties/bulk-delete', [PropertyController::class, 'bulkDelete']);
        Route::post('/properties/bulk-restore', [PropertyController::class, 'bulkRestore']);
    });

    // -----------------------------------------------------------------------
    // Role: manager or admin — everything under /admin
    // -----------------------------------------------------------------------
    Route::middleware('role:manager,admin')->prefix('admin')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'index']);

        // Users
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::post('/users/bulk-delete', [UserController::class, 'bulkDelete']);
        Route::post('/users/bulk-restore', [UserController::class, 'bulkRestore']);
        Route::get('/users/{id}', [UserController::class, 'show'])->whereNumber('id');
        Route::put('/users/{id}', [UserController::class, 'update'])->whereNumber('id');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->whereNumber('id');
        Route::post('/users/{id}/restore', [UserController::class, 'restore'])->whereNumber('id');
        Route::delete('/users/{id}/force', [UserController::class, 'forceDelete'])->whereNumber('id');
        Route::post('/users/{id}/assign-role', [UserController::class, 'assignRole'])->whereNumber('id');

        // Agents
        Route::post('/agents', [AgentController::class, 'store']);
        Route::put('/agents/{id}', [AgentController::class, 'update'])->whereNumber('id');
        Route::delete('/agents/{id}', [AgentController::class, 'destroy'])->whereNumber('id');
        Route::post('/agents/{id}/restore', [AgentController::class, 'restore'])->whereNumber('id');
        Route::delete('/agents/{id}/force', [AgentController::class, 'forceDelete'])->whereNumber('id');

        // Bookings
        Route::get('/bookings', [BookingController::class, 'index']);
        Route::get('/bookings/{id}', [BookingController::class, 'show'])->whereNumber('id');
        Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus'])->whereNumber('id');
        Route::delete('/bookings/{id}', [BookingController::class, 'destroy'])->whereNumber('id');

        // Transactions
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::get('/transactions/report', [TransactionController::class, 'report']);
        Route::get('/transactions/{id}', [TransactionController::class, 'show'])->whereNumber('id');
        Route::get('/transactions/{id}/invoice', [TransactionController::class, 'invoice'])->whereNumber('id');
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::put('/transactions/{id}', [TransactionController::class, 'update'])->whereNumber('id');
        Route::delete('/transactions/{id}', [TransactionController::class, 'destroy'])->whereNumber('id');

        // Enquiries (Contact / Sell inbox)
        Route::get('/enquiries', [EnquiryController::class, 'index']);
        Route::get('/enquiries/{id}', [EnquiryController::class, 'show'])->whereNumber('id');
        Route::put('/enquiries/{id}', [EnquiryController::class, 'update'])->whereNumber('id');
        Route::delete('/enquiries/{id}', [EnquiryController::class, 'destroy'])->whereNumber('id');

        // Reports / exports
        Route::get('/reports/properties', [ReportController::class, 'exportProperties']);
        Route::get('/reports/bookings', [ReportController::class, 'exportBookings']);
        Route::get('/reports/transactions', [ReportController::class, 'exportTransactions']);
    });
});
