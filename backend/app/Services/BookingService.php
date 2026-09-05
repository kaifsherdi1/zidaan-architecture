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
    if (!$this->bookingRepository->checkAvailability($data['property_id'], $data['visit_date'], $data['visit_time'])) {
      throw new \Exception('Time slot not available');
    }

    // Create booking
    $booking = $this->bookingRepository->create($data);

    if ($property->agent) {
      $this->notify(
        $property->agent->id,
        'booking.created',
        'New viewing request',
        "A viewing was requested for \"{$property->title}\".",
        ['booking_id' => $booking->id, 'property_id' => $property->id]
      );
    }

    return $this->bookingRepository->getById($booking->id);
  }

  /** Write an in-app notification row (the DB notification table is a custom schema). */
  private function notify(int $userId, string $type, string $title, string $message, array $data = []): void
  {
    try {
      \App\Models\Notification::create([
        'user_id' => $userId,
        'type' => $type,
        'title' => $title,
        'message' => $message,
        'data' => $data,
        'is_read' => false,
      ]);
    } catch (\Throwable $e) {
      \Illuminate\Support\Facades\Log::warning('notify failed: ' . $e->getMessage());
    }
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
    if ((isset($data['visit_date']) && $data['visit_date'] != $booking->visit_date) ||
    (isset($data['visit_time']) && $data['visit_time'] != $booking->visit_time)) {

      $date = $data['visit_date'] ?? $booking->visit_date;
      $time = $data['visit_time'] ?? $booking->visit_time;

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
      $data[$status === 'rejected' ? 'rejection_reason' : 'agent_notes'] = $note;
    }
    if ($status === 'approved') {
      $data['approved_at'] = now();
    }

    $this->bookingRepository->update($id, $data);

    $booking = $this->bookingRepository->getById($id);
    if ($booking && $booking->user) {
      $this->notify(
        $booking->user->id,
        'booking.' . $status,
        'Viewing ' . $status,
        "Your viewing request for \"" . optional($booking->property)->title . "\" was {$status}.",
        ['booking_id' => $booking->id]
      );
    }

    return $booking;
  }

  /**
   * Cancel booking (User action)
   */
  public function cancelBooking(int $id, ?string $reason = null)
  {
    $booking = $this->bookingRepository->getById($id);

    $this->bookingRepository->update($id, [
      'status' => 'cancelled',
      'cancelled_at' => now(),
      'agent_notes' => $reason ? "Cancelled by client: {$reason}" : 'Cancelled by client',
    ]);

    if ($booking && $booking->agent_id) {
      $this->notify(
        $booking->agent_id,
        'booking.cancelled',
        'Viewing cancelled',
        'A client cancelled their viewing request for "' . optional($booking->property)->title . '".',
        ['booking_id' => $id]
      );
    }

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
