<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request)
    {
        // Get the default 'user' role
        $userRole = Role::where('slug', 'user')->first();

        if (!$userRole) {
            return response()->json([
                'message' => 'Default user role not found. Please run seeders.'
            ], 500);
        }

        // Create the user (registered with an email, a phone number, or both)
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email ?: null,
            'phone' => $request->phone ?: null,
            'password' => Hash::make($request->password),
            'role_id' => $userRole->id,
            'is_active' => true,
        ]);

        // Create Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Login user
     */
    /**
     * @OA\Post(
     *      path="/login",
     *      operationId="login",
     *      tags={"Auth"},
     *      summary="Login user",
     *      description="Login user and return token",
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"email","password"},
     *              @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *              @OA\Property(property="password", type="string", format="password", example="password")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      )
     * )
     */
    public function login(LoginRequest $request)
    {
        // The identifier may be an email address or a phone number.
        $login = $request->input('login');

        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', $login)->first();
        } else {
            // Match on the trailing digits so "+91 98765 43210" and "9876543210" resolve alike.
            $digits = preg_replace('/\D/', '', (string) $login);
            $tail = substr($digits, -10);
            $user = strlen($tail) >= 6
                ? User::whereRaw("REPLACE(REPLACE(REPLACE(phone,' ',''),'-',''),'+','') LIKE ?", ['%' . $tail])->first()
                : null;
        }

        // Check if user exists
        if (!$user) {
            throw ValidationException::withMessages([
                'login' => ['We could not find an account for those details. Please register first.'],
            ]);
        }

        // Check password
        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Incorrect password, try again'],
            ]);
        }

        // Check if user is active
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact support.'
            ], 403);
        }

        // Revoke all existing tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get authenticated user profile
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => new UserResource($request->user())
        ]);
    }

    /**
     * Refresh token (revoke old and create new)
     */
    public function refresh(Request $request)
    {
        $user = $request->user();

        // Revoke all existing tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Token refreshed successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }
}
