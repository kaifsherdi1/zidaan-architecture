<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    private const OTP_TTL_MINUTES = 10;
    private const MAX_VERIFY_ATTEMPTS = 5;

    /**
     * Issue a one-time code. Always responds the same way so an attacker
     * cannot use this endpoint to enumerate registered emails.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $generic = response()->json([
            'message' => 'If an account exists for that email, a reset code has been sent.',
        ]);

        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return $generic;
        }

        $otp = (string) random_int(100000, 999999);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($otp), 'created_at' => now()],
        );
        RateLimiter::clear('pw-otp:' . $user->email);

        try {
            Mail::to($user->email)->send(new \App\Mail\ResetPasswordOtpNew($otp));
        } catch (\Throwable $e) {
            Log::error('OTP mail failed', ['e' => $e->getMessage()]);
        }

        return $generic;
    }

    /**
     * Verify the code and set a new password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'digits:6'],
            'password' => [
                'required', 'string', 'min:8', 'max:15', 'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/',
            ],
        ], [
            'password.regex' => 'Use one uppercase letter, one number and one special character.',
            'password.max' => 'Password must be no more than 15 characters.',
        ]);

        $key = 'pw-otp:' . $request->email;
        if (RateLimiter::tooManyAttempts($key, self::MAX_VERIFY_ATTEMPTS)) {
            throw ValidationException::withMessages([
                'otp' => ['Too many attempts. Request a new code.'],
            ]);
        }

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();
        $valid = $record
            && ! Carbon::parse($record->created_at)->addMinutes(self::OTP_TTL_MINUTES)->isPast()
            && Hash::check($request->otp, $record->token);

        if (! $valid) {
            RateLimiter::hit($key, self::OTP_TTL_MINUTES * 60);
            throw ValidationException::withMessages([
                'otp' => ['That code is invalid or has expired.'],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->forceFill(['password' => Hash::make($request->password)])
            ->setRememberToken(Str::random(60));
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        RateLimiter::clear($key);
        $user->tokens()->delete(); // log out every existing session

        return response()->json(['message' => 'Password reset successfully. Please sign in.']);
    }
}
