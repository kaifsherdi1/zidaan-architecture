<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    private function scope(Request $request)
    {
        return Notification::query()->where('user_id', $request->user()->id);
    }

    public function index(Request $request)
    {
        return response()->json([
            'data' => $this->scope($request)->latest()->limit(30)->get(),
        ]);
    }

    public function unreadCount(Request $request)
    {
        return response()->json([
            'count' => $this->scope($request)->where('is_read', false)->count(),
        ]);
    }

    public function markAsRead(Request $request, int $id)
    {
        $updated = $this->scope($request)->whereKey($id)->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        abort_if($updated === 0, 404);

        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        $this->scope($request)->where('is_read', false)->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
