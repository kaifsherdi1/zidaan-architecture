<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EnquiryController extends Controller
{
    /**
     * Public — the site's Contact and Sell-your-property forms both post here.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:2000'],
            'property_id' => ['nullable', 'integer', 'exists:properties,id'],
            // Sell-your-property extras
            'address' => ['nullable', 'string', 'max:500'],
            'type' => ['nullable', 'string', 'max:100'],
            'bedrooms' => ['nullable', 'numeric'],
            'price' => ['nullable', 'numeric'],
        ]);

        $sellFields = array_filter($request->only(['address', 'type', 'bedrooms', 'price']), fn ($v) => $v !== null && $v !== '');
        $isSell = str_contains(mb_strtolower($data['subject'] ?? ''), 'sell') || ! empty($sellFields);

        $enquiry = Enquiry::create([
            'type' => $isSell ? 'sell' : 'contact',
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'subject' => $data['subject'] ?? null,
            'message' => $data['message'] ?? null,
            'property_id' => $data['property_id'] ?? null,
            'details' => $sellFields ?: null,
            'source' => $request->header('Referer'),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => "Thanks {$data['name']} — the studio will be in touch shortly.",
            'data' => ['id' => $enquiry->id],
        ], 201);
    }

    /** Admin / manager — inbox. */
    public function index(Request $request)
    {
        $query = Enquiry::query()->with(['assignee:id,name', 'property:id,title,slug']);

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }
        if ($request->filled('type')) {
            $query->where('type', $request->get('type'));
        }
        if ($request->filled('search')) {
            $s = $request->get('search');
            $query->where(fn ($q) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"));
        }

        return response()->json($query->latest()->paginate($request->get('per_page', 20)));
    }

    public function show(int $id)
    {
        return Enquiry::with(['assignee:id,name', 'property:id,title,slug'])->findOrFail($id);
    }

    public function update(Request $request, int $id)
    {
        $enquiry = Enquiry::findOrFail($id);

        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['new', 'in_progress', 'closed'])],
            'assigned_to' => ['sometimes', 'nullable', 'exists:users,id'],
            'internal_notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $enquiry->update($data);

        return response()->json(['message' => 'Enquiry updated', 'data' => $enquiry->fresh(['assignee', 'property'])]);
    }

    public function destroy(int $id)
    {
        Enquiry::findOrFail($id)->delete();

        return response()->json(['message' => 'Enquiry deleted']);
    }
}
