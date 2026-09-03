import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { propertyImage, priceLabel, propertyLocation } from '../utils/property';

/**
 * Editorial property card used on Home, Properties and related pages.
 * `ratio` controls the image aspect (tailwind aspect-* fragment).
 */
export default function PropertyTile({ property, ratio = 'aspect-[4/5]', year = '2024' }) {
  return (
    <Link to={`/properties/${property.id}`} className="group block">
      <div className={`image-zoom-container ${ratio} mb-6 bg-background-off relative`}>
        <img
          src={propertyImage(property)}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover image-zoom"
        />
        {(property.status === 'sold' || property.status === 'rented') && (
          <span className="absolute top-4 left-4 bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5">
            {property.status === 'sold' ? 'Sold' : 'Let'}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5">
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-black mb-2 truncate group-hover:text-secondary transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-[11px] uppercase tracking-[0.16em] text-black/50 font-medium">
            <MapPin size={12} className="mr-1.5 shrink-0" />
            <span className="truncate">{propertyLocation(property)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 text-right shrink-0">
          {property.category_label && (
            <span className="text-[9px] uppercase tracking-[0.16em] font-bold text-black border border-black/80 px-2 py-0.5">
              {property.category_label}
            </span>
          )}
          <span className="text-xs font-bold text-black">{priceLabel(property)}</span>
          <span className="text-[9px] uppercase tracking-[0.16em] text-black/35">
            {property.area ? `${Number(property.area).toLocaleString('en-IN')} sqft` : year}
          </span>
        </div>
      </div>
    </Link>
  );
}
