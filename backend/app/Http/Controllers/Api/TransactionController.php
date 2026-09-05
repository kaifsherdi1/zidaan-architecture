<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\StoreTransactionRequest;
use App\Http\Requests\Transaction\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Services\TransactionService;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index(Request $request)
    {
        // Admin only or Manager
        $filters = $request->only(['status', 'agent_id', 'date_from', 'date_to']);
        $transactions = $this->transactionService->getAllTransactions($filters, 15);
        return TransactionResource::collection($transactions);
    }

    public function agentTransactions(Request $request)
    {
        $transactions = $this->transactionService->getAgentTransactions($request->user()->id);
        return TransactionResource::collection($transactions);
    }

    public function store(StoreTransactionRequest $request)
    {
        // If agent, force agent_id to self and cap the status they may set.
        $data = $request->validated();
        if ($request->user()->role?->slug === 'agent') {
            $data['agent_id'] = $request->user()->id;
            $data['status'] = 'pending';
        }

        $transaction = $this->transactionService->createTransaction($data);
        return new TransactionResource($transaction);
    }

    public function show($id)
    {
        $transaction = $this->transactionService->getById($id);
        abort_if(! $transaction, 404);

        return new TransactionResource($transaction);
    }

    /** Simple invoice PDF for a completed transaction. */
    public function invoice($id)
    {
        $transaction = $this->transactionService->getById($id);
        abort_if(! $transaction, 404);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', ['transaction' => $transaction]);

        return $pdf->download("invoice-{$transaction->id}.pdf");
    }

    public function update(UpdateTransactionRequest $request, $id)
    {
        $data = $request->validated();
        $transaction = $this->transactionService->updateTransaction($id, $data);
        return new TransactionResource($transaction);
    }

    public function destroy($id)
    {
        $this->transactionService->deleteTransaction($id);
        return response()->noContent();
    }

    /** Earnings / revenue report — scoped to the caller's own transactions for agents. */
    public function report(Request $request)
    {
        $query = \App\Models\Transaction::query();
        if ($request->user()->role?->slug === 'agent') {
            $query->where('agent_id', $request->user()->id);
        }

        $completed = (clone $query)->where('status', 'completed');

        return response()->json([
            'total_completed' => $completed->count(),
            'total_revenue' => (clone $completed)->sum('amount'),
            'total_pending' => (clone $query)->where('status', 'pending')->count(),
            'by_month' => (clone $completed)
                ->selectRaw("DATE_FORMAT(transaction_date, '%Y-%m') as month, SUM(amount) as total")
                ->where('transaction_date', '>=', now()->subMonths(11)->startOfMonth())
                ->groupBy('month')->orderBy('month')->get(),
        ]);
    }
}
