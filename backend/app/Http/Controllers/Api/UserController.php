<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a listing of users (Admin/Manager)
     */
    public function index(Request $request)
    {
        $filters = $request->only([
            'role', 'is_active', 'email_verified', 'search', 'sort_by', 'sort_order'
        ]);

        $perPage = $request->get('per_page', 15);
        $users = $this->userService->getAllUsers($filters, $perPage);

        return new UserCollection($users);
    }

    /**
     * Store a newly created user (Admin/Manager)
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $user = $this->userService->createUser($data);

        return response()->json([
            'message' => 'User created successfully',
            'data' => new UserResource($user)
        ], 201);
    }

    /**
     * Display the specified user (Admin/Manager)
     */
    public function show(int $id)
    {
        $user = $this->userService->getUserById($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return new UserResource($user);
    }

    /**
     * Update the specified user (Admin/Manager)
     */
    public function update(UpdateUserRequest $request, int $id)
    {
        $data = $request->validated();
        $user = $this->userService->updateUser($id, $data);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'message' => 'User updated successfully',
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Soft delete the specified user (Admin/Manager)
     */
    public function destroy(int $id)
    {
        $result = $this->userService->deleteUser($id);

        if (!$result) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Restore soft-deleted user (Admin/Manager)
     */
    public function restore(int $id)
    {
        $result = $this->userService->restoreUser($id);

        if (!$result) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'message' => 'User restored successfully'
        ]);
    }

    /**
     * Permanently delete user (Admin/Manager)
     */
    public function forceDelete(int $id)
    {
        $result = $this->userService->forceDeleteUser($id);

        if (!$result) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'message' => 'User permanently deleted'
        ]);
    }

    /**
     * Bulk soft delete users (Admin/Manager)
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:users,id']
        ]);

        $count = $this->userService->bulkDeleteUsers($request->ids);

        return response()->json([
            'message' => "{$count} users deleted successfully"
        ]);
    }

    /**
     * Bulk restore users (Admin/Manager)
     */
    public function bulkRestore(Request $request)
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer']
        ]);

        $count = $this->userService->bulkRestoreUsers($request->ids);

        return response()->json([
            'message' => "{$count} users restored successfully"
        ]);
    }

    /**
     * Assign role to user (Admin/Manager)
     */
    public function assignRole(Request $request, int $id)
    {
        $request->validate([
            'role_id' => ['required', 'exists:roles,id']
        ]);

        $result = $this->userService->assignRole($id, $request->role_id);

        if (!$result) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'message' => 'Role assigned successfully'
        ]);
    }

    /**
     * Get authenticated user's profile
     */
    public function profile(Request $request)
    {
        $user = $this->userService->getUserById($request->user()->id);
        return new UserResource($user);
    }

    /**
     * Update authenticated user's profile
     */
    public function updateProfile(UpdateProfileRequest $request)
    {
        $data = $request->validated();
        $user = $this->userService->updateProfile($request->user()->id, $data);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => new UserResource($user)
        ]);
    }

    /**
     * Upload avatar for authenticated user
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:2048']
        ]);

        $path = $this->userService->uploadAvatar(
            $request->user()->id,
            $request->file('avatar')
        );

        if (!$path) {
            return response()->json([
                'message' => 'Failed to upload avatar'
            ], 500);
        }

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar_url' => asset('storage/' . $path)
        ]);
    }
}
