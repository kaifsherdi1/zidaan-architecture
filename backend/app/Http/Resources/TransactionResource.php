<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_name' => $this->client_name,
            'amount' => $this->amount,
            'status' => $this->status,
            'transaction_date' => $this->transaction_date?->format('Y-m-d'),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'property' => $this->property ? [
                'id' => $this->property->id,
                'title' => $this->property->title,
                'address' => $this->property->address,
                'city' => $this->property->city,
                'type' => $this->property->type,
                'price' => $this->property->price,
                'is_deleted' => $this->property->trashed(),
            ] : null,
            'agent' => $this->agent ? [
                'id' => $this->agent->id,
                'name' => $this->agent->name,
                'email' => $this->agent->email,
            ] : null,
            'client' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null,
        ];
    }
}
