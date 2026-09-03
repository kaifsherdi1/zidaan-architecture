<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $price = (float) $this->price;
        $isRent = $this->type === 'rent';

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'currency' => 'INR',
            // "₹4,50,00,000" — full amount, Indian digit grouping
            'formatted_price' => '₹' . $this->indianGroup($price),
            // "₹4.5 Cr" / "₹3.25 L" — compact, card-friendly
            'price_compact' => $this->indianCompact($price),
            // "₹3,25,000 / month" for rentals, else same as compact
            'price_label' => $isRent
                ? '₹' . $this->indianGroup($price) . ' / month'
                : $this->indianCompact($price),
            'price_period' => $isRent ? 'month' : null,
            'type' => $this->type,
            'category' => $this->category,
            'category_label' => $this->categoryLabel($this->category),
            'status' => $this->status,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'garages' => $this->garages,
            'area' => $this->area,
            'location' => [
                'address' => $this->address,
                'city' => $this->city,
                'state' => $this->state,
                'country' => $this->country,
                'zip_code' => $this->zip_code,
                'lat' => $this->latitude,
                'lng' => $this->longitude,
            ],
            'features' => $this->features,
            'is_featured' => $this->is_featured,
            'agent' => new UserResource($this->whenLoaded('agent')),
            'main_image' => $this->mainImage ? Storage::url($this->mainImage->image_path) : null,
            'images' => $this->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => Storage::url($image->image_path),
                    'is_main' => $image->is_main,
                ];
            }),
            'created_at' => $this->created_at?->diffForHumans(),
        ];
    }

    private function categoryLabel(?string $category): ?string
    {
        return [
            'apartment'    => 'Apartment',
            'shop'         => 'Shop',
            'single_floor' => 'Single Floor',
            'duplex'       => 'Duplex',
            'double_floor' => 'Double Floor',
            'third_floor'  => 'Third Floor',
        ][$category] ?? ($category ? ucfirst(str_replace('_', ' ', $category)) : null);
    }

    /** Group digits the Indian way: 1,23,45,678 */
    private function indianGroup(float $value): string
    {
        $n = (string) (int) round($value);
        if (strlen($n) <= 3) {
            return $n;
        }
        $last3 = substr($n, -3);
        $rest = substr($n, 0, -3);
        $rest = preg_replace('/\B(?=(\d{2})+(?!\d))/', ',', $rest);

        return $rest . ',' . $last3;
    }

    /** Compact rupee label: ₹4.5 Cr, ₹3.25 L, ₹85,000 */
    private function indianCompact(float $value): string
    {
        if ($value >= 10000000) {
            return '₹' . $this->trimZeros($value / 10000000) . ' Cr';
        }
        if ($value >= 100000) {
            return '₹' . $this->trimZeros($value / 100000) . ' L';
        }

        return '₹' . $this->indianGroup($value);
    }

    private function trimZeros(float $n): string
    {
        return rtrim(rtrim(number_format($n, 2, '.', ''), '0'), '.');
    }
}
