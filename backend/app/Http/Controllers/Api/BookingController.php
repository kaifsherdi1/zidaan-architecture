<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Requests\Booking\UpdateBookingStatusRequest;
use App\Http\Resources\BookingCollection;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(protected BookingService $bookingService)
    {
    }

    /** Admin/Manager — every viewing request. */
    public function index(Request $request)
    {
        $filters = $request->only(['status', 'date_from', 'date_to', 'property_id', 'agent_id', 'sort_by', 'sort_order']);

        return new BookingCollection($this->bookingService->getAllBookings($filters, $this->perPage($request)));
    }

    /** Client — request a viewing. */
    public function store(StoreBookingRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['user_message'] = $data['message'] ?? null;
        unset($data['message']);

        $booking = $this->bookingService->createBooking($data);

        return response()->json([
            'message' => 'Viewing request submitted. The agent will confirm a time with you.',
            'data' => new BookingResource($booking),
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $booking = $this->findVisibleTo($request, $id);

        return new BookingResource($booking);
    }

    /** Client — their own requests. */
    public function userBookings(Request $request)
    {
        return new BookingCollection(
            $this->bookingService->getUserBookings($request->user()->id, $this->perPage($request, 15, 50))
        );
    }

    /** Agent — requests for their own listings. */
    public function agentBookings(Request $request)
    {
        $filters = $request->only(['status', 'date']);

        return new BookingCollection(
            $this->bookingService->getAgentBookings($request->user()->id, $filters, $this->perPage($request))
        );
    }

    /** Agent (own listings only) or Admin/Manager — approve / reject / complete / cancel. */
    public function updateStatus(UpdateBookingStatusRequest $request, int $id)
    {
        $booking = $this->findVisibleTo($request, $id);
        $data = $request->validated();

        $booking = $this->bookingService->updateStatus($booking, $data['status'], $data['notes'] ?? null, $request->user());

        return response()->json([
            'message' => 'Booking status updated successfully',
            'data' => new BookingResource($booking),
        ]);
    }

    /** Client — withdraw their own request. */
    public function cancel(Request $request, int $id)
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:500']]);

        $booking = Booking::with(['user', 'property'])->find($id);
        abort_if(! $booking || $booking->user_id !== $request->user()->id, 404, 'Booking not found');

        $this->bookingService->cancelBooking($booking, $request->input('reason'));

        return response()->json(['message' => 'Booking cancelled successfully']);
    }

    /** Admin/Manager. */
    public function destroy(int $id)
    {
        abort_if(! $this->bookingService->deleteBooking($id), 404, 'Booking not found');

        return response()->json(['message' => 'Booking deleted successfully']);
    }

    /**
     * Load a booking the caller is allowed to see: admins/managers see all,
     * agents only bookings on their own listings, clients only their own.
     * Anything else is a 404 so IDs can't be probed.
     */
    private function findVisibleTo(Request $request, int $id): Booking
    {
        $booking = $this->bookingService->getBookingById($id);
        $user = $request->user();

        $visible = $booking && (
            $user->hasRole('admin', 'manager')
            || ($user->hasRole('agent') && $booking->agent_id === $user->id)
            || $booking->user_id === $user->id
        );
        abort_if(! $visible, 404, 'Booking not found');

        return $booking;
    }
}
