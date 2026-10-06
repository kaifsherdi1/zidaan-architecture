<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use App\Repositories\BookingRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class BookingService
{
  /**
   * Allowed status transitions for a viewing request. Anything not listed is
   * refused — e.g. a cancelled or rejected request can't be re-approved.
   */
  public const TRANSITIONS = [
    'pending' => ['approved', 'rejected', 'cancelled'],
    'approved' => ['completed', 'cancelled'],
    'rescheduled' => ['approved', 'rejected', 'cancelled'],
    'rejected' => [],
    'completed' => [],
    'cancelled' => [],
  ];

  public function __construct(
    protected BookingRepository $bookingRepository,
    protected Notifier $notifier,
  ) {
  }

  public function getAllBookings(array $filters = [], int $perPage = 15): LengthAwarePaginator
  {
    return $this->bookingRepository->getAll($filters, $perPage);
  }

  public function getBookingById(int $id)
  {
    return $this->bookingRepository->getById($id);
  }

  /**
   * A client requests a viewing. The agent is always taken from the listing,
   * never from the request.
   */
  public function createBooking(array $data): Booking
  {
    // Store times as HH:MM:SS so slot comparisons match on every DB driver.
    $data['visit_time'] = \Illuminate\Support\Carbon::createFromFormat('H:i', $data['visit_time'])->format('H:i:s');

    $booking = DB::transaction(function () use ($data) {
      $property = Property::with('agent')->lockForUpdate()->find($data['property_id']);

      if (! $property || ! $property->agent) {
        throw new BusinessRuleException('This listing is no longer available for viewings.');
      }
      if (! in_array($property->status, ['available', 'pending'], true)) {
        throw new BusinessRuleException('This property has already been ' . $property->status . ', so viewings are closed.');
      }

      // One open request per client per listing — also absorbs double-clicks.
      $hasOpenRequest = Booking::where('user_id', $data['user_id'])
        ->where('property_id', $property->id)
        ->whereIn('status', ['pending', 'approved', 'rescheduled'])
        ->exists();
      if ($hasOpenRequest) {
        throw new BusinessRuleException('You already have an open viewing request for this property. You can manage it from My Bookings.');
      }

      if (! $this->bookingRepository->checkAvailability($property->id, $data['visit_date'], $data['visit_time'])) {
        throw new BusinessRuleException('That time slot is already booked. Please choose another time.');
      }

      $data['agent_id'] = $property->agent_id;
      $data['status'] = 'pending';

      return $this->bookingRepository->create($data);
    });

    $booking = $this->bookingRepository->getById($booking->id);

    $this->notifier->send(
      $booking->agent_id,
      'booking.created',
      'New viewing request',
      "{$booking->user->name} asked to view \"{$booking->property->title}\" on {$booking->visit_date->format('D, d M Y')} at " . $booking->visit_time->format('H:i') . '.',
      ['booking_id' => $booking->id, 'property_id' => $booking->property_id],
      actionUrl: Notifier::dashboardUrl('bookings'),
    );

    return $booking;
  }

  public function deleteBooking(int $id): bool
  {
    $booking = $this->bookingRepository->getById($id);
    if (! $booking) {
      return false;
    }
    $booking->delete();
    ActivityLog::record('booking.deleted', $booking, "Deleted viewing request #{$id} for \"" . optional($booking->property)->title . '"');

    return true;
  }

  public function getUserBookings(int $userId, int $perPage = 15)
  {
    return $this->bookingRepository->getByUser($userId, $perPage);
  }

  /** @param int $agentUserId the agent's users.id (bookings.agent_id references users) */
  public function getAgentBookings(int $agentUserId, array $filters = [], int $perPage = 15)
  {
    return $this->bookingRepository->getByAgent($agentUserId, $filters, $perPage);
  }

  /**
   * Staff decision on a viewing (approve / reject / complete / cancel).
   */
  public function updateStatus(Booking $booking, string $status, ?string $note, User $actor): Booking
  {
    $allowed = self::TRANSITIONS[$booking->status] ?? [];
    if (! in_array($status, $allowed, true)) {
      throw new BusinessRuleException("A {$booking->status} viewing cannot be marked {$status}.");
    }

    DB::transaction(function () use ($booking, $status, $note, $actor) {
      $locked = Booking::lockForUpdate()->findOrFail($booking->id);

      if ($status === 'approved') {
        $clash = Booking::where('property_id', $locked->property_id)
          ->where('id', '!=', $locked->id)
          ->where('status', 'approved')
          ->whereDate('visit_date', $locked->visit_date)
          ->whereTime('visit_time', $locked->visit_time->format('H:i:s'))
          ->exists();
        if ($clash) {
          throw new BusinessRuleException('Another viewing is already approved for this property at that time.');
        }
      }

      $data = ['status' => $status];
      if ($note) {
        $data[$status === 'rejected' ? 'rejection_reason' : 'agent_notes'] = $note;
      }
      match ($status) {
        'approved' => $data += ['approved_at' => now(), 'approved_by' => $actor->id],
        'completed' => $data += ['completed_at' => now()],
        'cancelled' => $data += ['cancelled_at' => now()],
        default => null,
      };

      $locked->forceFill($data)->save();
    });

    $booking = $this->bookingRepository->getById($booking->id);
    ActivityLog::record("booking.{$status}", $booking, "Marked viewing #{$booking->id} for \"" . optional($booking->property)->title . "\" as {$status}");

    $when = $booking->visit_date->format('D, d M Y') . ' at ' . $booking->visit_time->format('H:i');
    $messages = [
      'approved' => "Your viewing of \"{$booking->property->title}\" is confirmed for {$when}.",
      'rejected' => "Your viewing request for \"{$booking->property->title}\" could not be accommodated." . ($note ? " Note from the agent: {$note}" : ''),
      'completed' => "Thanks for visiting \"{$booking->property->title}\". Your agent will follow up with next steps.",
      'cancelled' => "Your viewing of \"{$booking->property->title}\" on {$when} has been cancelled." . ($note ? " Note: {$note}" : ''),
    ];

    $this->notifier->send(
      $booking->user_id,
      'booking.' . $status,
      'Viewing ' . $status,
      $messages[$status],
      ['booking_id' => $booking->id],
      actionUrl: Notifier::siteUrl('my-bookings'),
    );

    return $booking;
  }

  /** The client withdraws their own request. */
  public function cancelBooking(Booking $booking, ?string $reason = null): Booking
  {
    if (! in_array('cancelled', self::TRANSITIONS[$booking->status] ?? [], true)) {
      throw new BusinessRuleException('This viewing can no longer be cancelled.');
    }

    $booking->forceFill([
      'status' => 'cancelled',
      'cancelled_at' => now(),
      'agent_notes' => $reason ? "Cancelled by client: {$reason}" : 'Cancelled by client',
    ])->save();

    $this->notifier->send(
      $booking->agent_id,
      'booking.cancelled',
      'Viewing cancelled',
      "{$booking->user->name} cancelled their viewing of \"" . optional($booking->property)->title . '".',
      ['booking_id' => $booking->id],
      actionUrl: Notifier::dashboardUrl('bookings'),
    );

    return $this->bookingRepository->getById($booking->id);
  }
}
