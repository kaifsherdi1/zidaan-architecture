<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->with('role')
            ->whereHas('role', fn ($q) => $q->where('slug', 'agent'));

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $agents = $query->orderBy('name')->paginate(12);

        return UserResource::collection($agents);
    }

    public function show($id)
    {
        $agent = User::query()
            ->with(['role', 'properties.images', 'properties.location'])
            ->whereHas('role', fn ($q) => $q->where('slug', 'agent'))
            ->findOrFail($id);

        return new UserResource($agent);
    }
}
