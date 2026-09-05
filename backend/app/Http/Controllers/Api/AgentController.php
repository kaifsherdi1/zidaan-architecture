<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\UserResource;
use App\Models\Booking;
use App\Models\Property;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AgentController extends Controller
{
    private function agentQuery()
    {
        return User::query()->with('role')
            ->whereHas('role', fn ($q) => $q->where('slug', 'agent'));
    }

    // ---- Public ----------------------------------------------------------

    public function index(Request $request)
    {
        $query = $this->agentQuery()->withCount(['properties']);

        if ($request->filled('search')) {
            $s = $request->get('search');
            $query->where(fn ($q) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"));
        }

        return UserResource::collection($query->orderBy('name')->paginate(12));
    }

    public function show($id)
    {
        $agent = $this->agentQuery()
            ->with(['properties' => fn ($q) => $q->with('images')->latest()])
            ->withCount('properties')
            ->findOrFail($id);

        return new UserResource($agent);
    }

    public function topPerformers()
    {
        $agents = $this->agentQuery()
            ->withCount([
                'properties',
                'properties as sold_count' => fn ($q) => $q->whereIn('status', ['sold', 'rented']),
            ])
            ->orderByDesc('sold_count')
            ->orderByDesc('properties_count')
            ->limit(6)
            ->get();

        return UserResource::collection($agents);
    }

    // ---- Admin / Manager -----------------------------------------------

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $agent = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'role_id' => Role::where('slug', 'agent')->value('id'),
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        return response()->json(['message' => 'Agent created', 'data' => new UserResource($agent->load('role'))], 201);
    }

    public function update(Request $request, $id)
    {
        $agent = $this->agentQuery()->findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($agent->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $agent->update($data);

        return response()->json(['message' => 'Agent updated', 'data' => new UserResource($agent->fresh('role'))]);
    }

    public function destroy($id)
    {
        $agent = $this->agentQuery()->findOrFail($id);
        Property::where('agent_id', $agent->id)->update(['agent_id' => null]);
        $agent->delete();

        return response()->json(['message' => 'Agent removed']);
    }

    public function restore($id)
    {
        $agent = $this->agentQuery()->withTrashed()->findOrFail($id);
        $agent->restore();

        return response()->json(['message' => 'Agent restored', 'data' => new UserResource($agent->fresh('role'))]);
    }

    public function forceDelete($id)
    {
        $this->agentQuery()->withTrashed()->findOrFail($id)->forceDelete();

        return response()->json(['message' => 'Agent permanently deleted']);
    }

    // ---- Agent's own dashboard ----------------------------------------

    public function dashboard(Request $request)
    {
        $id = $request->user()->id;

        return response()->json([
            'listings' => Property::where('agent_id', $id)->count(),
            'available' => Property::where('agent_id', $id)->where('status', 'available')->count(),
            'closed' => Property::where('agent_id', $id)->whereIn('status', ['sold', 'rented'])->count(),
            'pending_viewings' => Booking::where('agent_id', $id)->where('status', 'pending')->count(),
            'upcoming' => Booking::with(['property', 'user'])
                ->where('agent_id', $id)
                ->whereIn('status', ['pending', 'approved'])
                ->where('visit_date', '>=', now()->toDateString())
                ->orderBy('visit_date')
                ->limit(5)
                ->get(),
        ]);
    }

    public function statistics(Request $request)
    {
        $id = $request->user()->id;

        return response()->json([
            'by_status' => Property::where('agent_id', $id)
                ->selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status'),
            'by_month' => Booking::where('agent_id', $id)
                ->selectRaw("DATE_FORMAT(visit_date, '%Y-%m') as month, count(*) as n")
                ->groupBy('month')->orderBy('month')->pluck('n', 'month'),
        ]);
    }
}
