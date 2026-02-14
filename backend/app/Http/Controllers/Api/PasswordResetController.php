<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    /**
     * Send OTP to user's email
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        // Generate 6-digit OTP
        $otp = rand(100000, 999999);

        // Store OTP in password_reset_tokens table
        // We delete any existing token for this email first
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => $otp, // Storing OTP directly in token column
            'created_at' => now(),
        ]);

        // Send OTP via email
        try {
            \Illuminate\Support\Facades\Mail::to($request->email)->send(new \App\Mail\ResetPasswordOtpNew($otp));
        }
        catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e);
            return response()->json([
                'message' => 'Failed to send OTP. Please try again later.'
            ], 500);
        }

        return response()->json([
            'message' => 'OTP sent to your email'
        ]);
    }

    /**
     * Reset password using OTP
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'otp' => ['required', 'numeric', 'digits:6'],
            'password' => ['required', 'min:8', 'confirmed'],
        ]);

        // Check availability and validity of OTP
        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->otp)
            ->first();

        if (!$record) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid OTP'],
            ]);
        }

        // Check if OTP is expired (e.g., 60 minutes)
        if (\Carbon\Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            throw ValidationException::withMessages([
                'otp' => ['OTP has expired'],
            ]);
        }

        // Update password
        $user = User::where('email', $request->email)->first();
        $user->forceFill([
            'password' => Hash::make($request->password)
        ])->setRememberToken(Str::random(60));
        $user->save();

        // Delete OTP
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Revoke all tokens
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password reset successfully'
        ]);
    }
}
