<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

/** Admin-only audit trail of staff actions. */
class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = ActivityLog::query()
            ->with('user:id,name,email')
            ->when($request->filled('action'), fn ($q) => $q->where('action', 'like', $request->get('action') . '%'))
            ->when($request->filled('user_id'), fn ($q) => $q->where('user_id', $request->get('user_id')))
            ->when($request->filled('search'), fn ($q) => $q->where('description', 'like', '%' . $request->get('search') . '%'))
            ->latest('id')
            ->paginate($this->perPage($request, 25));

        return response()->json($logs);
    }
}
