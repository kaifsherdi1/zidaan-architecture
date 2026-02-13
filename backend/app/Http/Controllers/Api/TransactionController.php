<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\StoreTransactionRequest;
use App\Http\Requests\Transaction\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
        $user = Auth::user();
        if (!$user->hasRole('agent')) { // Double check using role method if available or middleware
        // Middleware handles it mostly
        }

        $transactions = $this->transactionService->getAgentTransactions($user->id);
        return TransactionResource::collection($transactions);
    }

    public function store(StoreTransactionRequest $request)
    {
        // If agent, force agent_id to self
        $data = $request->validated();
        if (Auth::user()->role === 'agent') {
            $data['agent_id'] = Auth::id();
            $data['status'] = 'pending'; // Agents can only request pending transactions
        }

        $transaction = $this->transactionService->createTransaction($data);
        return new TransactionResource($transaction);
    }

    public function show($id)
    {
        $transaction = $this->transactionService->transactionRepository->getById($id); // Creating a getById wrapper in service is better practice but this works for simple cases
        return new TransactionResource($transaction);
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
}
