<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Property\StorePropertyRequest;
use App\Http\Requests\Property\UpdatePropertyRequest;
use App\Http\Resources\PropertyResource;
use App\Models\ActivityLog;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Services\PropertyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class PropertyController extends Controller
{
    /** Query parameters the public catalogue understands (everything else is ignored, incl. for caching). */
    private const PUBLIC_FILTERS = [
        'type', 'category', 'status', 'featured', 'min_price', 'max_price', 'garages',
        'bedrooms', 'bathrooms', 'city', 'sort_by', 'sort_dir', 'per_page', 'page',
    ];

    public function __construct(protected PropertyService $propertyService)
    {
    }

    /**
     * @OA\Get(
     *      path="/properties",
     *      operationId="getPropertiesList",
     *      tags={"Properties"},
     *      summary="Public property catalogue",
     *      @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function index(Request $request)
    {
        $filters = $request->only(self::PUBLIC_FILTERS);
        ksort($filters);

        // Cached per filter set; the version bumps whenever any listing changes.
        $cacheKey = 'properties:v' . Property::catalogueCacheVersion() . ':' . md5(json_encode($filters));

        $properties = Cache::remember($cacheKey, now()->addMinutes(10), fn () => $this->propertyService->getAllProperties($filters));

        return PropertyResource::collection($properties);
    }

    /** Public — featured, available listings for the marketing site. */
    public function featured(Request $request)
    {
        $limit = min(max((int) $request->get('limit', 6), 1), 24);

        $properties = Property::query()
            ->with(['agent', 'images', 'mainImage'])
            ->where('is_featured', true)
            ->where('status', 'available')
            ->latest()
            ->take($limit)
            ->get();

        return PropertyResource::collection($properties);
    }

    /** Client — saved listings. */
    public function savedProperties(Request $request)
    {
        return PropertyResource::collection(
            $request->user()->savedProperties()->with(['agent', 'images', 'mainImage'])->get()
        );
    }

    /** Client — toggle a listing in the saved list. */
    public function toggleSaved(Request $request, Property $property)
    {
        $result = $request->user()->savedProperties()->toggle($property->id);

        return response()->json(['saved' => ! empty($result['attached'])]);
    }

    public function show(Property $property)
    {
        // Query-level increment: no model events, so a page view doesn't flush the catalogue cache.
        Property::whereKey($property->id)->increment('views_count');

        return new PropertyResource($property->load(['agent', 'images', 'mainImage']));
    }

    public function store(StorePropertyRequest $request)
    {
        $property = $this->propertyService->createProperty($request->validated(), $request->file('images', []));
        ActivityLog::record('property.created', $property, "Created listing \"{$property->title}\"");

        return (new PropertyResource($property->load(['agent', 'images', 'mainImage'])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdatePropertyRequest $request, Property $property)
    {
        $property = $this->propertyService->updateProperty($property, $request->validated(), $request->file('images', []));

        $changed = array_values(array_diff(array_keys($property->getChanges()), ['updated_at']));
        ActivityLog::record('property.updated', $property, "Updated listing \"{$property->title}\"", ['fields' => $changed]);

        return new PropertyResource($property->load(['agent', 'images', 'mainImage']));
    }

    public function destroy(Property $property)
    {
        $this->propertyService->deleteProperty($property);
        ActivityLog::record('property.deleted', $property, "Moved listing \"{$property->title}\" to trash");

        return response()->noContent();
    }

    /** Manager/Admin — remove one photo from a listing. */
    public function destroyImage(Property $property, int $image)
    {
        $img = PropertyImage::where('property_id', $property->id)->findOrFail($image);
        $this->propertyService->deleteImage($img);

        return new PropertyResource($property->fresh(['agent', 'images', 'mainImage']));
    }

    /** Manager/Admin — the full catalogue, including soft-deleted (trashed=1). */
    public function manage(Request $request)
    {
        $query = Property::query()->with(['agent', 'images', 'mainImage']);

        if ($request->boolean('trashed')) {
            $query->onlyTrashed();
        }
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }
        if ($request->filled('category')) {
            $query->where('category', $request->get('category'));
        }
        if ($request->filled('agent_id')) {
            $query->where('agent_id', $request->get('agent_id'));
        }
        if ($request->filled('search')) {
            $s = $request->get('search');
            $query->where(fn ($q) => $q->where('title', 'like', "%{$s}%")->orWhere('city', 'like', "%{$s}%"));
        }

        return PropertyResource::collection($query->latest()->paginate($this->perPage($request, 15, 60)));
    }

    /** Agent — their own listings. */
    public function agentProperties(Request $request)
    {
        $properties = Property::query()
            ->with(['agent', 'images', 'mainImage'])
            ->where('agent_id', $request->user()->id)
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->get('status')))
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', '%' . $request->get('search') . '%'))
            ->latest()
            ->paginate($this->perPage($request, 15, 60));

        return PropertyResource::collection($properties);
    }

    public function restore(int $id)
    {
        $property = Property::onlyTrashed()->findOrFail($id);
        $property->restore();
        ActivityLog::record('property.restored', $property, "Restored listing \"{$property->title}\"");

        return response()->json(['message' => 'Property restored', 'data' => new PropertyResource($property->fresh(['agent', 'images', 'mainImage']))]);
    }

    public function forceDelete(int $id)
    {
        $property = Property::withTrashed()->findOrFail($id);

        // transactions.property_id cascades — a hard delete would erase sales history.
        if ($property->transactions()->exists()) {
            throw new \App\Exceptions\BusinessRuleException('This listing has recorded transactions, so it cannot be permanently deleted. Keep it in trash instead.');
        }

        $paths = $property->images()->pluck('image_path')->all();
        $property->forceDelete();
        Storage::disk('public')->delete($paths);
        ActivityLog::record('property.force_deleted', null, "Permanently deleted listing \"{$property->title}\" (#{$property->id})");

        return response()->json(['message' => 'Property permanently deleted']);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate(['ids' => ['required', 'array', 'max:100'], 'ids.*' => ['integer', 'exists:properties,id']]);
        $count = Property::whereIn('id', $request->ids)->delete();
        Property::flushCatalogueCache();
        ActivityLog::record('property.bulk_deleted', null, "Moved {$count} listings to trash", ['ids' => $request->ids]);

        return response()->json(['message' => "{$count} properties deleted"]);
    }

    public function bulkRestore(Request $request)
    {
        $request->validate(['ids' => ['required', 'array', 'max:100'], 'ids.*' => ['integer']]);
        $count = Property::onlyTrashed()->whereIn('id', $request->ids)->restore();
        Property::flushCatalogueCache();
        ActivityLog::record('property.bulk_restored', null, "Restored {$count} listings", ['ids' => $request->ids]);

        return response()->json(['message' => "{$count} properties restored"]);
    }
}
