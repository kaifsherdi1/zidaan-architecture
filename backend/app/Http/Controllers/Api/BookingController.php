<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Requests\Booking\UpdateBookingStatusRequest;
use App\Http\Resources\BookingCollection;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    protected BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Display a listing of bookings (Admin/Manager)
     */
    public function index(Request $request)
    {
        $filters = $request->only(['status', 'date_from', 'date_to', 'property_id', 'agent_id']);
        $perPage = $request->get('per_page', 15);

        $bookings = $this->bookingService->getAllBookings($filters, $perPage);
        return new BookingCollection($bookings);
    }

    /**
     * Store a newly created booking (User)
     */
    public function store(StoreBookingRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['visit_date'] = $data['booking_date'];
        $data['visit_time'] = $data['booking_time'];

        try {
            $booking = $this->bookingService->createBooking($data);
            return response()->json([
                'message' => 'Viewing request submitted successfully',
                'data' => new BookingResource($booking)
            ], 201);
        }
        catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Display the specified booking
     */
    public function show($id)
    {
        $booking = $this->bookingService->getBookingById($id);
        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }
        return new BookingResource($booking);
    }

    /**
     * Display user's bookings
     */
    public function userBookings(Request $request)
    {
        $bookings = $this->bookingService->getUserBookings($request->user()->id);
        return new BookingCollection($bookings);
    }

    /**
     * Display agent's bookings
     */
    public function agentBookings(Request $request)
    {
        $user = $request->user();
        if (!$user->agent) {
            return response()->json(['message' => 'Agent profile not found'], 404);
        }

        $filters = $request->only(['status', 'date']);
        $bookings = $this->bookingService->getAgentBookings($user->agent->id, $filters);
        return new BookingCollection($bookings);
    }

    /**
     * Update booking status (Agent)
     */
    public function updateStatus(UpdateBookingStatusRequest $request, $id)
    {
        $data = $request->validated();

        try {
            $booking = $this->bookingService->updateStatus($id, $data['status'], $data['notes'] ?? null);
            return response()->json([
                'message' => 'Booking status updated successfully',
                'data' => new BookingResource($booking)
            ]);
        }
        catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Cancel booking (User)
     */
    public function cancel(Request $request, $id)
    {
        $booking = $this->bookingService->getBookingById($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status === 'cancelled' || $booking->status === 'completed') {
            return response()->json(['message' => 'Cannot cancel this booking'], 422);
        }

        $reason = $request->input('reason');
        $this->bookingService->cancelBooking($id, $reason);

        return response()->json([
            'message' => 'Booking cancelled successfully'
        ]);
    }

    /**
     * Delete booking (Admin)
     */
    public function destroy($id)
    {
        if ($this->bookingService->deleteBooking($id)) {
            return response()->json(['message' => 'Booking deleted successfully']);
        }
        return response()->json(['message' => 'Booking not found'], 404);
    }
}
