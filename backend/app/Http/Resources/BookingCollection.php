<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

/**
 * Laravel adds the standard pagination `meta` (current_page, last_page,
 * per_page, total, …) and `links` automatically for paginated collections.
 */
class BookingCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return ['data' => $this->collection];
    }
}
