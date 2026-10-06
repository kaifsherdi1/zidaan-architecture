<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * A request that is well-formed but breaks a business rule (slot taken,
 * listing already sold, can't delete the last admin…). Rendered as a 422
 * with a message that is safe to show the user.
 */
class BusinessRuleException extends RuntimeException
{
    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 422);
    }
}
