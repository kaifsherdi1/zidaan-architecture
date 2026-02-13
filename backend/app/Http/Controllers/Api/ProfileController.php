<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
  public function update(Request $request)
  {
    $user = $request->user();

    $validated = $request->validate([
      'name' => ['required', 'string', 'max:255'],
      'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
    ]);

    $user->update($validated);

    return response()->json([
      'message' => 'Profile updated successfully',
      'user' => $user
    ]);
  }

  public function updatePassword(Request $request)
  {
    $validated = $request->validate([
      'current_password' => ['required', 'current_password'],
      'password' => ['required', 'confirmed', Password::defaults()],
    ]);

    $request->user()->update([
      'password' => Hash::make($validated['password']),
    ]);

    return response()->json([
      'message' => 'Password updated successfully'
    ]);
  }
}
