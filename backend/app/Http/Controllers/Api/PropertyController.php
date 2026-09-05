<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Property\StorePropertyRequest;
use App\Http\Requests\Property\UpdatePropertyRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Services\PropertyService;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    protected $propertyService;

    public function __construct(PropertyService $propertyService)
    {
        $this->propertyService = $propertyService;
    }

    public function store(StorePropertyRequest $request)
    {
        $data = $request->validated();
        $images = $request->file('images', []);

        $property = $this->propertyService->createProperty($data, $images);

        return (new PropertyResource($property))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * @OA\Get(
     *      path="/properties",
     *      operationId="getPropertiesList",
     *      tags={"Properties"},
     *      summary="Get list of properties",
     *      description="Returns list of properties",
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      )
     *     )
     */
    public function index(Request $request)
    {
        $filters = $request->all();
        // Generate a cache key based on filters and page
        $page = $request->get('page', 1);
        $cacheKey = 'properties_' . md5(json_encode($filters)) . '_page_' . $page;

        $properties = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60 * 5, function () use ($filters) {
            return $this->propertyService->getAllProperties($filters);
        });

        return PropertyResource::collection($properties);
    }

    /** Public — featured, available listings for the marketing site. */
    public function featured(Request $request)
    {
        $limit = min((int) $request->get('limit', 6), 24);

        $properties = Property::query()
            ->with(['agent', 'images'])
            ->where('is_featured', true)
            ->where('status', 'available')
            ->latest()
            ->take($limit)
            ->get();

        return PropertyResource::collection($properties);
    }

    /** Authenticated client — list saved properties. */
    public function savedProperties(Request $request)
    {
        return PropertyResource::collection(
            $request->user()->savedProperties()->with(['agent', 'images'])->get()
        );
    }

    /** Authenticated client — toggle a property in the saved list. */
    public function toggleSaved(Request $request, Property $property)
    {
        $result = $request->user()->savedProperties()->toggle($property->id);

        return response()->json([
            'saved' => ! empty($result['attached']),
        ]);
    }

    public function show(Property $property)
    {
        $cacheKey = 'property_' . $property->id;

        $property = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60 * 60, function () use ($property) {
            $property->load(['agent', 'images']);
            return $property;
        });

        // Increment views (outside cache)
        $property->increment('views_count');

        return new PropertyResource($property);
    }

    public function update(UpdatePropertyRequest $request, Property $property)
    {
        // Add policy check later: $this->authorize('update', $property);

        $data = $request->validated();
        $images = $request->file('images', []);

        $property = $this->propertyService->updateProperty($property, $data, $images);

        // Clear cache
        \Illuminate\Support\Facades\Cache::forget('property_' . $property->id);

        return new PropertyResource($property);
    }

    public function destroy(Property $property)
    {
        // Add policy check later: $this->authorize('delete', $property);
        $this->propertyService->deleteProperty($property);

        // Clear cache
        \Illuminate\Support\Facades\Cache::forget('property_' . $property->id);

        return response()->noContent();
    }

    /** Manager/Admin — the full catalogue, including soft-deleted (trashed=1). */
    public function manage(Request $request)
    {
        $query = Property::query()->with(['agent', 'images']);

        if ($request->boolean('trashed')) {
            $query->onlyTrashed();
        }
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }
        if ($request->filled('category')) {
            $query->where('category', $request->get('category'));
        }
        if ($request->filled('search')) {
            $s = $request->get('search');
            $query->where(fn ($q) => $q->where('title', 'like', "%{$s}%")->orWhere('city', 'like', "%{$s}%"));
        }

        return PropertyResource::collection($query->latest()->paginate(min((int) $request->get('per_page', 15), 60)));
    }

    /** Agent — their own listings. */
    public function agentProperties(Request $request)
    {
        $properties = Property::query()
            ->with(['agent', 'images'])
            ->where('agent_id', $request->user()->id)
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->get('status')))
            ->latest()
            ->paginate($request->get('per_page', 15));

        return PropertyResource::collection($properties);
    }

    public function restore(int $id)
    {
        $property = Property::withTrashed()->findOrFail($id);
        $property->restore();

        return response()->json(['message' => 'Property restored', 'data' => new PropertyResource($property->fresh(['agent', 'images']))]);
    }

    public function forceDelete(int $id)
    {
        $property = Property::withTrashed()->findOrFail($id);
        foreach ($property->images as $image) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($image->image_path);
        }
        $property->forceDelete();

        return response()->json(['message' => 'Property permanently deleted']);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer', 'exists:properties,id']]);
        $count = Property::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => "{$count} properties deleted"]);
    }

    public function bulkRestore(Request $request)
    {
        $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']]);
        $count = Property::withTrashed()->whereIn('id', $request->ids)->restore();

        return response()->json(['message' => "{$count} properties restored"]);
    }
}
