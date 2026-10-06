<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BusinessRuleException;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\Property;
use App\Models\Role;
use App\Models\Transaction;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;

/**
 * Staff user management. Hierarchy:
 *   - admin   may manage every account and assign any role;
 *   - manager may manage only agent and client accounts, and assign only those roles;
 *   - nobody may delete, deactivate or change the role of their own account;
 *   - the last active admin can never be removed, deactivated or demoted.
 */
class UserController extends Controller
{
    /** Roles a manager is allowed to create / edit / assign. */
    private const MANAGER_ASSIGNABLE = ['agent', 'user'];

    public function __construct(protected UserService $userService)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->only(['role', 'is_active', 'email_verified', 'search', 'sort_by', 'sort_order', 'trashed']);

        return new UserCollection($this->userService->getAllUsers($filters, $this->perPage($request)));
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $this->assertCanAssign($request->user(), $this->roleSlugFrom($data));

        $user = $this->userService->createUser($data);
        ActivityLog::record('user.created', $user, "Created {$user->roleSlug()} account {$user->email}");

        return response()->json([
            'message' => 'User created successfully',
            'data' => new UserResource($user),
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $user = $this->userService->getUserById($id);
        abort_if(! $user, 404, 'User not found');

        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, int $id)
    {
        $actor = $request->user();
        $target = $this->findOrFail($id);
        $this->assertCanManage($actor, $target);

        $data = $request->validated();
        $newRole = $data['role'] ?? null;
        $roleChanging = $newRole !== null && $newRole !== $target->roleSlug();
        $deactivating = array_key_exists('is_active', $data) && ! $data['is_active'] && $target->is_active;

        if ($actor->id === $target->id && ($roleChanging || $deactivating)) {
            throw new BusinessRuleException('You cannot change the role or status of your own account.');
        }
        if ($roleChanging) {
            $this->assertCanAssign($actor, $newRole);
        }
        if ($target->isAdmin() && ($roleChanging || $deactivating)) {
            $this->assertNotLastAdmin($target);
        }

        $user = $this->userService->updateUser($id, $data);

        if ($roleChanging || $deactivating || ! empty($data['password'])) {
            $target->tokens()->delete(); // force re-login with the new permissions
        }
        if ($roleChanging) {
            ActivityLog::record('user.role_changed', $user, "Changed role of {$user->email} from {$target->roleSlug()} to {$newRole}");
        }
        if ($deactivating) {
            ActivityLog::record('user.deactivated', $user, "Deactivated {$user->email}");
        }
        if (! $roleChanging && ! $deactivating) {
            ActivityLog::record('user.updated', $user, "Updated account {$user->email}", ['fields' => array_keys(array_diff_key($data, ['password' => 1, 'password_confirmation' => 1]))]);
        }

        return response()->json([
            'message' => 'User updated successfully',
            'data' => new UserResource($user),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $target = $this->findOrFail($id);
        $this->assertCanRemove($request->user(), $target);

        $target->tokens()->delete();
        $this->userService->deleteUser($id);
        ActivityLog::record('user.deleted', $target, "Moved {$target->email} to trash");

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function restore(Request $request, int $id)
    {
        $target = User::onlyTrashed()->with('role')->find($id);
        abort_if(! $target, 404, 'User not found');
        $this->assertCanManage($request->user(), $target);

        $this->userService->restoreUser($id);
        ActivityLog::record('user.restored', $target, "Restored {$target->email}");

        return response()->json(['message' => 'User restored successfully']);
    }

    public function forceDelete(Request $request, int $id)
    {
        $target = User::withTrashed()->with('role')->find($id);
        abort_if(! $target, 404, 'User not found');
        $this->assertCanRemove($request->user(), $target);

        // Listings and financial records must outlive the person who created them.
        if (Property::withTrashed()->where('agent_id', $target->id)->exists()) {
            throw new BusinessRuleException('This agent still has listings. Reassign them to another agent first.');
        }
        if (Transaction::where('agent_id', $target->id)->exists()) {
            throw new BusinessRuleException('This agent has recorded transactions, so the account cannot be permanently deleted. Deactivate it instead.');
        }

        $this->userService->forceDeleteUser($id);
        ActivityLog::record('user.force_deleted', null, "Permanently deleted {$target->email} (#{$target->id})");

        return response()->json(['message' => 'User permanently deleted']);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => ['required', 'array', 'max:100'],
            'ids.*' => ['integer', 'exists:users,id'],
        ]);

        $targets = User::with('role')->whereIn('id', $request->ids)->get();
        foreach ($targets as $target) {
            $this->assertCanRemove($request->user(), $target);
        }

        foreach ($targets as $target) {
            $target->tokens()->delete();
        }
        $count = $this->userService->bulkDeleteUsers($targets->pluck('id')->all());
        ActivityLog::record('user.bulk_deleted', null, "Moved {$count} users to trash", ['ids' => $targets->pluck('id')->all()]);

        return response()->json(['message' => "{$count} users deleted successfully"]);
    }

    public function bulkRestore(Request $request)
    {
        $request->validate([
            'ids' => ['required', 'array', 'max:100'],
            'ids.*' => ['integer'],
        ]);

        $targets = User::onlyTrashed()->with('role')->whereIn('id', $request->ids)->get();
        foreach ($targets as $target) {
            $this->assertCanManage($request->user(), $target);
        }

        $count = $this->userService->bulkRestoreUsers($targets->pluck('id')->all());
        ActivityLog::record('user.bulk_restored', null, "Restored {$count} users", ['ids' => $targets->pluck('id')->all()]);

        return response()->json(['message' => "{$count} users restored successfully"]);
    }

    public function assignRole(Request $request, int $id)
    {
        $request->validate(['role_id' => ['required', 'exists:roles,id']]);

        $actor = $request->user();
        $target = $this->findOrFail($id);
        $newRole = Role::find($request->role_id)->slug;

        $this->assertCanManage($actor, $target);
        if ($actor->id === $target->id) {
            throw new BusinessRuleException('You cannot change the role of your own account.');
        }
        $this->assertCanAssign($actor, $newRole);
        if ($target->isAdmin() && $newRole !== 'admin') {
            $this->assertNotLastAdmin($target);
        }

        $old = $target->roleSlug();
        $this->userService->assignRole($id, $request->role_id);
        $target->tokens()->delete();
        ActivityLog::record('user.role_changed', $target, "Changed role of {$target->email} from {$old} to {$newRole}");

        return response()->json(['message' => 'Role assigned successfully']);
    }

    // ---- The caller's own account --------------------------------------

    public function profile(Request $request)
    {
        return new UserResource($this->userService->getUserById($request->user()->id));
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $data = $request->validated();
        unset($data['current_password']);

        $user = $this->userService->updateProfile($request->user()->id, $data);

        if (! empty($data['password'])) {
            // Keep this session, sign out every other device.
            $current = $request->user()->currentAccessToken();
            $request->user()->tokens()->where('id', '!=', $current?->id)->delete();
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => new UserResource($user),
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $path = $this->userService->uploadAvatar($request->user()->id, $request->file('avatar'));
        abort_if(! $path, 500, 'Failed to upload avatar');

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar_url' => asset('storage/' . $path),
        ]);
    }

    // ---- Authorisation rules -------------------------------------------

    private function findOrFail(int $id): User
    {
        $user = User::with('role')->find($id);
        abort_if(! $user, 404, 'User not found');

        return $user;
    }

    private function roleSlugFrom(array $data): ?string
    {
        return $data['role'] ?? (isset($data['role_id']) ? Role::whereKey($data['role_id'])->value('slug') : null);
    }

    private function assertCanManage(User $actor, User $target): void
    {
        if ($actor->isAdmin()) {
            return;
        }
        if (! in_array($target->roleSlug(), self::MANAGER_ASSIGNABLE, true)) {
            abort(403, 'Only an administrator can manage admin and manager accounts.');
        }
    }

    private function assertCanAssign(User $actor, ?string $roleSlug): void
    {
        if ($actor->isAdmin()) {
            return;
        }
        if (! in_array($roleSlug, self::MANAGER_ASSIGNABLE, true)) {
            abort(403, 'Only an administrator can grant the admin or manager role.');
        }
    }

    private function assertCanRemove(User $actor, User $target): void
    {
        if ($actor->id === $target->id) {
            throw new BusinessRuleException('You cannot delete your own account.');
        }
        $this->assertCanManage($actor, $target);
        if ($target->hasRole('agent') && ! $target->trashed() && Property::where('agent_id', $target->id)->exists()) {
            throw new BusinessRuleException("{$target->name} still has listings. Remove them from the Agents page, which lets you reassign their listings and open viewings.");
        }
        if ($target->isAdmin()) {
            $this->assertNotLastAdmin($target);
        }
    }

    private function assertNotLastAdmin(User $target): void
    {
        $otherActiveAdmins = User::query()
            ->where('id', '!=', $target->id)
            ->where('is_active', true)
            ->whereHas('role', fn ($q) => $q->where('slug', 'admin'))
            ->count();

        if ($otherActiveAdmins === 0) {
            throw new BusinessRuleException('This is the last active administrator account. Create or activate another admin first.');
        }
    }
}
