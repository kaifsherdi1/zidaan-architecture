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
}
