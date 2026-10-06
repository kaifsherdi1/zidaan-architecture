<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\StoreTransactionRequest;
use App\Http\Requests\Transaction\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Services\TransactionService;
use App\Support\Sql;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function __construct(protected TransactionService $transactionService)
    {
    }

    /** Admin/Manager — the full ledger. */
    public function index(Request $request)
    {
        $filters = $request->only(['status', 'agent_id', 'date_from', 'date_to', 'search']);

        return TransactionResource::collection(
            $this->transactionService->getAllTransactions($filters, $this->perPage($request))
        );
    }

    /** Agent — their own deals. */
    public function agentTransactions(Request $request)
    {
        return TransactionResource::collection(
            $this->transactionService->getAgentTransactions($request->user()->id, $this->perPage($request))
        );
    }

    /** Admin/Manager record a deal; agents propose one (always pending, own listings only). */
    public function store(StoreTransactionRequest $request)
    {
        $transaction = $this->transactionService->createTransaction($request->validated(), $request->user());

        return (new TransactionResource($transaction))->response()->setStatusCode(201);
    }

    public function show(int $id)
    {
        return new TransactionResource($this->transactionService->getById($id));
    }

    /** Invoice / deal memo PDF. */
    public function invoice(int $id)
    {
        $transaction = $this->transactionService->getById($id);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', ['transaction' => $transaction]);

        return $pdf->download("invoice-{$transaction->id}.pdf");
    }

    public function update(UpdateTransactionRequest $request, int $id)
    {
        return new TransactionResource($this->transactionService->updateTransaction($id, $request->validated()));
    }

    public function destroy(int $id)
    {
        $this->transactionService->deleteTransaction($id);

        return response()->noContent();
    }

    /** Earnings / revenue summary — scoped to the caller's own deals for agents. */
    public function report(Request $request)
    {
        $query = Transaction::query();
        if ($request->user()->hasRole('agent')) {
            $query->where('agent_id', $request->user()->id);
        }

        $completed = (clone $query)->where('status', 'completed');
        $month = Sql::month('transaction_date');

        return response()->json([
            'total_completed' => $completed->count(),
            'total_revenue' => (float) (clone $completed)->sum('amount'),
            'total_pending' => (clone $query)->where('status', 'pending')->count(),
            'pending_value' => (float) (clone $query)->where('status', 'pending')->sum('amount'),
            'by_month' => (clone $completed)
                ->selectRaw("{$month} as month, SUM(amount) as total")
                ->where('transaction_date', '>=', now()->subMonths(11)->startOfMonth())
                ->groupByRaw($month)->orderBy('month')->get(),
        ]);
    }
}
