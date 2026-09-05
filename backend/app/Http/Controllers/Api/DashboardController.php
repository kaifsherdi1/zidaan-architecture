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
    $roleSlug = $user->role?->slug;

    // Base queries
    $propertiesQuery = Property::query();
    $bookingsQuery = Booking::query();
    $transactionsQuery = Transaction::query();

    // Filter for Agents — agent_id points straight at users.id in this schema.
    if ($roleSlug === 'agent') {
      $agentId = $user->id;
      $propertiesQuery->where('agent_id', $agentId);
      $bookingsQuery->where('agent_id', $agentId);
      $transactionsQuery->where('agent_id', $agentId);
    }

    // 1. KPI Cards
    $totalProperties = $propertiesQuery->count();
    $pendingBookings = $bookingsQuery->clone()->where('status', 'pending')->count();
    $totalBookings = $bookingsQuery->count();

    // Calculate Revenue (completed transactions — see Transaction::status enum)
    $totalRevenue = $transactionsQuery->clone()->where('status', 'completed')->sum('amount');

    // Total Users / Agents (Admin & Manager only)
    $totalUsers = in_array($roleSlug, ['admin', 'manager'], true) ? User::count() : 0;
    $totalAgents = in_array($roleSlug, ['admin', 'manager'], true)
      ? User::whereHas('role', fn ($q) => $q->where('slug', 'agent'))->count()
      : 0;

    // 2. Revenue Trend (Last 6 months)
    $revenueTrend = $transactionsQuery->clone()
      ->where('status', 'completed')
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
      'user' => optional($booking->user)->name ?? 'Deleted user',
      'property' => optional($booking->property)->title ?? 'Deleted property',
      'status' => $booking->status,
      'date' => $booking->created_at->diffForHumans(),
      'type' => 'booking'
      ];
    });

    return response()->json([
      'kpi' => [
        'total_properties' => $totalProperties,
        'total_users' => $totalUsers,
        'total_agents' => $totalAgents,
        'total_bookings' => $totalBookings,
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
