<?php

namespace App\Exports;

use App\Models\Property;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class PropertiesExport implements FromCollection, WithHeadings, WithMapping
{
    protected $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = Property::with('agent');

        if (isAuthenticatedAgent()) {
            $query->where('agent_id', auth()->id());
        }

        if (isset($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (isset($this->filters['type'])) {
            $query->where('type', $this->filters['type']);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Title',
            'Type',
            'Status',
            'Price',
            'Bedrooms',
            'Bathrooms',
            'Area (sqft)',
            'Location',
            'Agent',
            'Created At',
        ];
    }

    public function map($property): array
    {
        return [
            $property->id,
            $property->title,
            ucfirst($property->type),
            ucfirst($property->status),
            number_format($property->price, 2),
            $property->bedrooms,
            $property->bathrooms,
            $property->area,
            $property->location,
            $property->agent ? $property->agent->name : 'N/A',
            $property->created_at->format('Y-m-d'),
        ];
    }
}
function isAuthenticatedAgent()
{
    return auth()->user() && auth()->user()->role === 'agent';
}
