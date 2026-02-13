<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Exports\PropertiesExport;
use App\Exports\BookingsExport;
use App\Exports\TransactionsExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function exportProperties(Request $request)
    {
        return Excel::download(new PropertiesExport($request->all()), 'properties.xlsx');
    }

    public function exportBookings(Request $request)
    {
        return Excel::download(new BookingsExport($request->all()), 'bookings.xlsx');
    }

    public function exportTransactions(Request $request)
    {
        return Excel::download(new TransactionsExport($request->all()), 'transactions.xlsx');
    }
}
