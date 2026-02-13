<?php

namespace App\Repositories;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class BookingRepository
{
  /**
   * Get all bookings with filters, sorting, and pagination
   */
  public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
  {
    $query = Booking::with(['user', 'property', 'agent']);

    // Apply filters
    if (!empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (!empty($filters['date_from'])) {
      $query->whereDate('booking_date', '>=', $filters['date_from']);
    }

    if (!empty($filters['date_to'])) {
      $query->whereDate('booking_date', '<=', $filters['date_to']);
    }

    if (!empty($filters['property_id'])) {
      $query->where('property_id', $filters['property_id']);
    }

    if (!empty($filters['agent_id'])) {
      $query->where('agent_id', $filters['agent_id']);
    }

    if (!empty($filters['user_id'])) {
      $query->where('user_id', $filters['user_id']);
    }

    // Apply sorting
    $sortBy = $filters['sort_by'] ?? 'booking_date';
    $sortOrder = $filters['sort_order'] ?? 'desc';
    $query->orderBy($sortBy, $sortOrder);

    return $query->paginate($perPage);
  }

  /**
   * Get booking by ID with relationships
   */
  public function getById(int $id): ?Booking
  {
    return Booking::with(['user', 'property', 'agent'])->find($id);
  }

  /**
   * Create new booking
   */
  public function create(array $data): Booking
  {
    return Booking::create($data);
  }

  /**
   * Update booking
   */
  public function update(int $id, array $data): bool
  {
    $booking = Booking::find($id);
    if (!$booking) {
      return false;
    }
    return $booking->update($data);
  }

  /**
   * Delete booking
   */
  public function delete(int $id): bool
  {
    $booking = Booking::find($id);
    if (!$booking) {
      return false;
    }
    return $booking->delete();
  }

  /**
   * Get bookings by user
   */
  public function getByUser(int $userId, int $perPage = 15): LengthAwarePaginator
  {
    return Booking::with(['property', 'agent'])
      ->where('user_id', $userId)
      ->orderBy('booking_date', 'desc')
      ->paginate($perPage);
  }

  /**
   * Get bookings by agent
   */
  public function getByAgent(int $agentId, array $filters = [], int $perPage = 15): LengthAwarePaginator
  {
    $query = Booking::with(['user', 'property'])
      ->where('agent_id', $agentId);

    if (!empty($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (!empty($filters['date'])) {
      $query->whereDate('booking_date', $filters['date']);
    }

    return $query->orderBy('booking_date', 'desc')->paginate($perPage);
  }

  /**
   * Check availability (prevent double booking)
   */
  public function checkAvailability(int $propertyId, string $date, string $time): bool
  {
    // Check if there's already a confirmed booking for this property at this time
    // We assume a viewing takes 1 hour by default

    $requestedTime = Carbon::parse("$date $time");

    return !Booking::where('property_id', $propertyId)
      ->whereIn('status', ['confirmed', 'completed']) // Only confirmed bookings block capability
      ->whereDate('booking_date', $date)
      ->whereTime('booking_time', $time)
      ->exists();
  }

  /**
   * Get upcoming bookings for agent
   */
  public function getUpcomingBookings(int $agentId, int $limit = 5): Collection
  {
    return Booking::with(['user', 'property'])
      ->where('agent_id', $agentId)
      ->whereIn('status', ['pending', 'confirmed'])
      ->where('booking_date', '>=', now()->toDateString())
      ->orderBy('booking_date', 'asc')
      ->orderBy('booking_time', 'asc')
      ->limit($limit)
      ->get();
  }
}
