<?php

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/* |-------------------------------------------------------------------------- | API Routes |-------------------------------------------------------------------------- */

// Public routes - No authentication required
Route::prefix('auth')->group(function () {
  Route::post('/register', [AuthController::class , 'register']);
  Route::post('/login', [AuthController::class , 'login']);
});

Route::prefix('password')->group(function () {
  Route::post('/forgot', [PasswordResetController::class , 'forgotPassword']);
  Route::post('/reset', [PasswordResetController::class , 'resetPassword']);
});

// Public Property routes
Route::prefix('properties')->group(function () {
  Route::get('/', [PropertyController::class , 'index']);
  Route::get('/featured', [PropertyController::class , 'featured']);
  Route::get('/{id}', [PropertyController::class , 'show']);
});

// Protected routes - Require authentication
Route::middleware('auth:sanctum')->group(function () {

  // Auth routes
  Route::post('/logout', [AuthController::class , 'logout']);
  Route::get('/me', [AuthController::class , 'me']);
  Route::post('/refresh', [AuthController::class , 'refresh']);
  Route::get('/user', function (Request $request) {
      return $request->user();
    }
    );


    // Notifications
    Route::get('/notifications', [NotificationController::class , 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class , 'unreadCount']);
    Route::put('/notifications/{id}/read', [NotificationController::class , 'markAsRead']);

    // Reports
    Route::get('/reports/properties', [\App\Http\Controllers\Api\ReportController::class , 'exportProperties']);
    Route::get('/reports/bookings', [\App\Http\Controllers\Api\ReportController::class , 'exportBookings']);
    Route::get('/reports/transactions', [\App\Http\Controllers\Api\ReportController::class , 'exportTransactions']);

    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);

    // User role routes - Client features
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class . ':user')->prefix('user')->group(function () {
      // Saved properties
      Route::get('/saved-properties', function () {
          return response()->json(['message' => 'User saved properties endpoint']);
        }
        );
      }
      );

      // Agent role routes
      Route::middleware(\App\Http\Middleware\RoleMiddleware::class . ':agent')->prefix('agent')->group(function () {
      Route::get('/properties', [PropertyController::class , 'agentProperties']);
    }
    );

    // Manager role routes
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class . ':manager,admin')->prefix('manager')->group(function () {
      // Property management
      Route::post('/properties', [PropertyController::class , 'store']);
      Route::put('/properties/{id}', [PropertyController::class , 'update']);
      Route::delete('/properties/{id}', [PropertyController::class , 'destroy']);
      Route::post('/properties/{id}/restore', [PropertyController::class , 'restore']);
      Route::delete('/properties/{id}/force', [PropertyController::class , 'forceDelete']);
      Route::post('/properties/bulk-delete', [PropertyController::class , 'bulkDelete']);
      Route::post('/properties/bulk-restore', [PropertyController::class , 'bulkRestore']);
    }
    );

    // Admin role routes - User Management
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class . ':admin,manager')->prefix('admin')->group(function () {
      // User management
      Route::get('/users', [UserController::class , 'index']);
      Route::get('/users/{id}', [UserController::class , 'show']);
      Route::post('/users', [UserController::class , 'store']);
      Route::put('/users/{id}', [UserController::class , 'update']);
      Route::delete('/users/{id}', [UserController::class , 'destroy']);
      Route::post('/users/{id}/restore', [UserController::class , 'restore']);
      Route::delete('/users/{id}/force', [UserController::class , 'forceDelete']);
      Route::post('/users/bulk-delete', [UserController::class , 'bulkDelete']);
      Route::post('/users/bulk-restore', [UserController::class , 'bulkRestore']);
      Route::post('/users/{id}/assign-role', [UserController::class , 'assignRole']);

      Route::get('/dashboard', function () {
          return response()->json(['message' => 'Admin dashboard endpoint']);
        }
        );
      }
      );

      // Authenticated user profile routes
      Route::prefix('user')->group(function () {
      Route::get('/profile', [UserController::class , 'profile']);
      Route::put('/profile', [UserController::class , 'updateProfile']);
      Route::post('/avatar', [UserController::class , 'uploadAvatar']);
    }
    );

    // Agent Management Routes (Admin/Manager)
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class . ':admin,manager')->prefix('admin')->group(function () {
      Route::post('/agents', [AgentController::class , 'store']);
      Route::put('/agents/{id}', [AgentController::class , 'update']);
      Route::delete('/agents/{id}', [AgentController::class , 'destroy']);
      Route::post('/agents/{id}/restore', [AgentController::class , 'restore']);
      Route::delete('/agents/{id}/force', [AgentController::class , 'forceDelete']);
    }
    );

    // Agent Dashboard Routes
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class . ':agent')->prefix('agent')->group(function () {
      Route::get('/dashboard', [AgentController::class , 'dashboard']);
      Route::get('/statistics', [AgentController::class , 'statistics']);
      Route::put('/profile', [AgentController::class , 'updateProfile']);

      // Agent Booking Routes
      Route::get('/bookings', [BookingController::class , 'agentBookings']);
      Route::get('/agent/bookings', [BookingController::class , 'agentBookings']);
      Route::put('/bookings/{id}/status', [BookingController::class , 'updateStatus']);

      // Dashboard
      Route::get('/dashboard/stats', [DashboardController::class , 'index']);

      // Profile
      Route::put('/profile', [ProfileController::class , 'update']);
      Route::put('/profile/password', [ProfileController::class , 'updatePassword']);

      // Agent Transaction Routes
      Route::get('/transactions', [TransactionController::class , 'agentTransactions']);
      Route::post('/transactions', [TransactionController::class , 'store']);
      Route::get('/earnings', [TransactionController::class , 'report']);
    }
    );

    // User Booking Routes
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class . ':user')->prefix('user')->group(function () {
      Route::get('/bookings', [BookingController::class , 'userBookings']);
      Route::post('/bookings', [BookingController::class , 'store']);
      Route::get('/bookings/{id}', [BookingController::class , 'show']);
      Route::post('/bookings/{id}/cancel', [BookingController::class , 'cancel']);
    }
    );

    // Admin/Manager Booking Routes
    Route::middleware(\App\Http\Middleware\RoleMiddleware::class . ':admin,manager')->prefix('admin')->group(function () {
      Route::get('/bookings', [BookingController::class , 'index']);
      Route::get('/bookings/{id}', [BookingController::class , 'show']);
      Route::delete('/bookings/{id}', [BookingController::class , 'destroy']);

      // Transactions
      Route::get('/transactions', [TransactionController::class , 'index']);
      Route::get('/transactions/report', [TransactionController::class , 'report']);
      Route::get('/transactions/{id}', [TransactionController::class , 'show']);
      Route::post('/transactions', [TransactionController::class , 'store']);
      Route::put('/transactions/{id}', [TransactionController::class , 'update']);
      Route::delete('/transactions/{id}', [TransactionController::class , 'destroy']);
    }
    );
  });

// Public Agent Routes
Route::prefix('agents')->group(function () {
  Route::get('/', [AgentController::class , 'index']);
  Route::get('/top-performers', [AgentController::class , 'topPerformers']);
  Route::get('/{id}', [AgentController::class , 'show']);
});
