<?php

namespace App\Services;

use App\Repositories\BookingRepository;
use App\Models\Property;
use Illuminate\Pagination\LengthAwarePaginator;

class BookingService
{
  protected BookingRepository $bookingRepository;

  public function __construct(BookingRepository $bookingRepository)
  {
    $this->bookingRepository = $bookingRepository;
  }

  /**
   * Get all bookings with filters
   */
  public function getAllBookings(array $filters = [], int $perPage = 15): LengthAwarePaginator
  {
    return $this->bookingRepository->getAll($filters, $perPage);
  }

  /**
   * Get booking by ID
   */
  public function getBookingById(int $id)
  {
    return $this->bookingRepository->getById($id);
  }

  /**
   * Create new booking request
   */
  public function createBooking(array $data)
  {
    // Get property agent
    $property = Property::with('agent')->find($data['property_id']);
    if (!$property || !$property->agent) {
      throw new \Exception('Property or agent not found');
    }

    // Set agent ID from property
    $data['agent_id'] = $property->agent->id;
    $data['status'] = 'pending';

    // Check availability
    if (!$this->bookingRepository->checkAvailability($data['property_id'], $data['booking_date'], $data['booking_time'])) {
      throw new \Exception('Time slot not available');
    }

    // Create booking
    $booking = $this->bookingRepository->create($data);

    // Send notification to agent
    if ($property->agent) {
      $property->agent->notify(new \App\Notifications\BookingNotification($booking, 'created'));
      // Dispatch Job for email
      \App\Jobs\ProcessBookingEmail::dispatch($booking, 'new_request');
    }

    return $this->bookingRepository->getById($booking->id);
  }

  /**
   * Update booking
   */
  public function updateBooking(int $id, array $data)
  {
    $booking = $this->bookingRepository->getById($id);
    if (!$booking) {
      return null;
    }

    // Check availability if date/time changed
    if ((isset($data['booking_date']) && $data['booking_date'] != $booking->booking_date) ||
    (isset($data['booking_time']) && $data['booking_time'] != $booking->booking_time)) {

      $date = $data['booking_date'] ?? $booking->booking_date;
      $time = $data['booking_time'] ?? $booking->booking_time;

      if (!$this->bookingRepository->checkAvailability($booking->property_id, $date, $time)) {
        throw new \Exception('Time slot not available');
      }
    }

    $this->bookingRepository->update($id, $data);

    return $this->bookingRepository->getById($id);
  }

  /**
   * Delete booking
   */
  public function deleteBooking(int $id): bool
  {
    return $this->bookingRepository->delete($id);
  }

  /**
   * Get user bookings
   */
  public function getUserBookings(int $userId, int $perPage = 15)
  {
    return $this->bookingRepository->getByUser($userId, $perPage);
  }

  /**
   * Get agent bookings
   */
  public function getAgentBookings(int $agentId, array $filters = [], int $perPage = 15)
  {
    return $this->bookingRepository->getByAgent($agentId, $filters, $perPage);
  }

  /**
   * Update booking status (Agent action)
   */
  public function updateStatus(int $id, string $status, ?string $note = null)
  {
    $data = ['status' => $status];
    if ($note) {
      $data['notes'] = $note;
    }

    // If status is confirmed, double check availability again
    if ($status === 'confirmed') {
      $booking = $this->bookingRepository->getById($id);
      if (!$this->bookingRepository->checkAvailability($booking->property_id, $booking->booking_date, $booking->booking_time)) {
        throw new \Exception('Time slot is no longer available');
      }
    }

    $this->bookingRepository->update($id, $data);

    // Send notification to user
    $booking = $this->bookingRepository->getById($id);
    if ($booking->user) {
      $booking->user->notify(new \App\Notifications\BookingNotification($booking, $status)); // status: approved/rejected

      if ($status === 'confirmed') {
        // Dispatch Job for email
        \App\Jobs\ProcessBookingEmail::dispatch($booking, 'confirmation');
      }
    }

    return $booking;
  }

  /**
   * Cancel booking (User action)
   */
  public function cancelBooking(int $id, ?string $reason = null)
  {
    $data = [
      'status' => 'cancelled',
      'notes' => $reason ? "Cancelled by user: $reason" : "Cancelled by user"
    ];

    $this->bookingRepository->update($id, $data);

    // TODO: Send notification to agent

    return $this->bookingRepository->getById($id);
  }

  /**
   * Get upcoming bookings for agent
   */
  public function getUpcomingBookings(int $agentId)
  {
    return $this->bookingRepository->getUpcomingBookings($agentId);
  }
}
