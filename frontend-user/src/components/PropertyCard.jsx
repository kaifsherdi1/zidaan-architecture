import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square, Heart } from "lucide-react";
import { CardContainer, CardBody, CardItem } from "./ui/3d-card";

export default function PropertyCard({ property }) {
  return (
    <CardContainer className="w-full">
      <CardBody className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden group w-full h-auto relative">
        <CardItem translateZ="50" className="relative h-64 overflow-hidden w-full">
          <img
            src={property.main_image
              ? (property.main_image.startsWith('http') ? property.main_image : `http://127.0.0.1:8000${property.main_image}`)
              : "https://images.unsplash.com/photo-1600596542815-e32cb0654128?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <CardItem translateZ="80" className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${property.type === 'sale' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
              }`}>
              For {property.type}
            </span>
          </CardItem>
          <CardItem translateZ="80" className="absolute top-4 right-4">
            <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white text-rose-500 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </CardItem>
          <CardItem translateZ="60" className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white font-bold text-xl">{property.price_label || property.formatted_price}</p>
          </CardItem>
        </CardItem>

        <div className="p-5">
          <CardItem translateZ="40" className="flex items-start justify-between mb-2">
            <div>
              <Link to={`/properties/${property.id}`} className="block text-lg font-bold text-slate-900 mb-1 hover:text-primary transition-colors line-clamp-1">
                {property.title}
              </Link>
              <div className="flex items-center text-slate-500 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="line-clamp-1">
                  {property.location?.address || property.address}, {property.location?.city || property.city}
                </span>
              </div>
            </div>
          </CardItem>

          <CardItem translateZ="30" className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.bedrooms}</span>
              <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.bathrooms}</span>
              <span className="flex items-center gap-1"><Square className="w-4 h-4" /> {property.area} sqft</span>
            </div>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
