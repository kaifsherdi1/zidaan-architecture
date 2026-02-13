<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Property;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
  public function index(Request $request)
  {
    $user = $request->user();

    // Base queries
    $propertiesQuery = Property::query();
    $bookingsQuery = Booking::query();
    $transactionsQuery = Transaction::query();

    // Filter for Agents
    if ($user->role === 'agent' && $user->agent) {
      $agentId = $user->agent->id;
      $propertiesQuery->where('agent_id', $agentId);

      // Bookings for agent's properties
      $bookingsQuery->whereHas('property', function ($q) use ($agentId) {
        $q->where('agent_id', $agentId);
      });

      // Transactions for agent's properties
      $transactionsQuery->whereHas('property', function ($q) use ($agentId) {
        $q->where('agent_id', $agentId);
      });
    }

    // 1. KPI Cards
    $totalProperties = $propertiesQuery->count();
    $pendingBookings = $bookingsQuery->where('status', 'pending')->count();

    // Calculate Revenue (Paid transactions)
    $totalRevenue = $transactionsQuery->where('status', 'paid')->sum('amount');

    // Total Users (Admin only)
    $totalUsers = $user->role === 'admin' ?User::count() : 0;

    // 2. Revenue Trend (Last 6 months)
    $revenueTrend = $transactionsQuery->clone()
      ->where('status', 'paid')
      ->where('created_at', '>=', now()->subMonths(6))
      ->select(
      DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
      DB::raw('SUM(amount) as total')
    )
      ->groupBy('month')
      ->orderBy('month')
      ->get();

    // 3. Property Distribution (Sale vs Rent)
    $propertyDistribution = $propertiesQuery->clone()
      ->select('type', DB::raw('count(*) as count'))
      ->groupBy('type')
      ->get();

    // 4. Recent Activity (Latest 5 Bookings)
    $recentBookings = $bookingsQuery->clone()
      ->with(['user:id,name', 'property:id,title'])
      ->latest()
      ->limit(5)
      ->get()
      ->map(function ($booking) {
      return [
      'id' => $booking->id,
      'user' => $booking->user->name,
      'property' => $booking->property->title,
      'status' => $booking->status,
      'date' => $booking->created_at->diffForHumans(),
      'type' => 'booking'
      ];
    });

    return response()->json([
      'kpi' => [
        'total_properties' => $totalProperties,
        'total_users' => $totalUsers,
        'total_revenue' => $totalRevenue,
        'pending_bookings' => $pendingBookings,
      ],
      'charts' => [
        'revenue_trend' => $revenueTrend,
        'property_distribution' => $propertyDistribution,
      ],
      'recent_activity' => $recentBookings
    ]);
  }
}
