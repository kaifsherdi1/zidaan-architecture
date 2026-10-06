<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class Sql
{
    /** "YYYY-MM" for a date column, on whichever driver is in use. */
    public static function month(string $column): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', {$column})"
            : "DATE_FORMAT({$column}, '%Y-%m')";
    }
}
