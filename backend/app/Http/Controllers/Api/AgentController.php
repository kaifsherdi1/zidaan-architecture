<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BusinessRuleException;
use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\Property;
use App\Models\Role;
use App\Models\User;
use App\Support\Sql;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AgentController extends Controller
{
    private function agentQuery()
    {
        return User::query()->with('role')
            ->whereHas('role', fn ($q) => $q->where('slug', 'agent'));
    }

    /** These routes are public; resolve a bearer token if one was sent. */
    private function viewerIsStaff(Request $request): bool
    {
        return (bool) $request->user('sanctum')?->hasRole('admin', 'manager');
    }

    // ---- Public ----------------------------------------------------------

    public function index(Request $request)
    {
        $query = $this->agentQuery()->withCount(['properties']);

        // Visitors only see active agents; signed-in staff see the whole team.
        if (! $this->viewerIsStaff($request)) {
            $query->where('is_active', true);
        }

        if ($request->filled('search')) {
            $s = $request->get('search');
            $query->where(fn ($q) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"));
        }

        return UserResource::collection($query->orderBy('name')->paginate($this->perPage($request, 12, 100)));
    }

    public function show(Request $request, $id)
    {
        $agent = $this->agentQuery()
            ->when(! $this->viewerIsStaff($request), fn ($q) => $q->where('is_active', true))
            ->with(['properties' => fn ($q) => $q->with(['images', 'mainImage'])->latest()])
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
            ->where('is_active', true)
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
            'password' => ['required', 'string', \Illuminate\Validation\Rules\Password::min(8)->mixedCase()->numbers()->symbols()],
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

        ActivityLog::record('agent.created', $agent, "Created agent {$agent->email}");

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
        if (array_key_exists('is_active', $data) && ! $data['is_active']) {
            $agent->tokens()->delete();
        }
        ActivityLog::record('agent.updated', $agent, "Updated agent {$agent->email}", ['fields' => array_keys($data)]);

        return response()->json(['message' => 'Agent updated', 'data' => new UserResource($agent->fresh('role'))]);
    }

    /**
     * Remove an agent. Every listing must have an agent, so if this one still
     * has any, `reassign_to` (another active agent) is required — their
     * listings and open viewing requests move to that agent.
     */
    public function destroy(Request $request, $id)
    {
        $agent = $this->agentQuery()->findOrFail($id);
        $listingCount = Property::withTrashed()->where('agent_id', $agent->id)->count();

        $data = $request->validate([
            'reassign_to' => [
                $listingCount > 0 ? 'required' : 'nullable', 'integer', Rule::notIn([$agent->id]),
                Rule::exists('users', 'id')->where(fn ($q) => $q
                    ->where('role_id', Role::where('slug', 'agent')->value('id'))
                    ->where('is_active', true)
                    ->whereNull('deleted_at')),
            ],
        ], [
            'reassign_to.required' => "This agent has {$listingCount} listing(s). Choose another agent to take them over.",
            'reassign_to.exists' => 'Choose an active agent to take over the listings.',
        ]);

        DB::transaction(function () use ($agent, $data) {
            if (! empty($data['reassign_to'])) {
                Property::withTrashed()->where('agent_id', $agent->id)->update(['agent_id' => $data['reassign_to']]);
                Booking::where('agent_id', $agent->id)->whereIn('status', ['pending', 'approved', 'rescheduled'])
                    ->update(['agent_id' => $data['reassign_to']]);
            }
            $agent->tokens()->delete();
            $agent->delete();
        });
        Property::flushCatalogueCache();

        ActivityLog::record('agent.deleted', $agent, "Removed agent {$agent->email}" . (! empty($data['reassign_to']) ? " (listings reassigned to user #{$data['reassign_to']})" : ''));

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
        $agent = $this->agentQuery()->withTrashed()->findOrFail($id);

        // properties.agent_id cascades — never let a hard delete wipe listings or the ledger.
        if (Property::withTrashed()->where('agent_id', $agent->id)->exists()) {
            throw new BusinessRuleException('This agent still has listings. Reassign them before deleting permanently.');
        }
        if (\App\Models\Transaction::where('agent_id', $agent->id)->exists()) {
            throw new BusinessRuleException('This agent has recorded transactions, so the account cannot be permanently deleted.');
        }

        $agent->forceDelete();
        ActivityLog::record('agent.force_deleted', null, "Permanently deleted agent {$agent->email} (#{$agent->id})");

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
                ->selectRaw(Sql::month('visit_date') . ' as month, count(*) as n')
                ->groupByRaw(Sql::month('visit_date'))->orderBy('month')->pluck('n', 'month'),
        ]);
    }
}
