import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { Heading, Text } from '../components/ui/Typography';
import { Search, MapPin, Filter as FilterIcon, X } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    type: 'Any',
    category: 'All Types',
    minPrice: '',
    maxPrice: ''
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const query = {};
      if (filters.location) query.location = filters.location;
      if (filters.type !== 'Any') query.type = filters.type;
      if (filters.category !== 'All Types') query.category = filters.category;
      if (filters.minPrice) query.min_price = filters.minPrice;
      if (filters.maxPrice) query.max_price = filters.maxPrice;

      const { data } = await api.getProperties(query);
      setProperties(data.data || []);
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchProperties();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      type: 'Any',
      category: 'All Types',
      minPrice: '',
      maxPrice: ''
    });
    fetchProperties();
  };

  return (
    <Layout>
      {/* Page Header */}
      <section className="pt-40 pb-20 bg-white">
        <div className="section-container">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="max-w-2xl">
              <span className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-6 block">
                Portfolio
              </span>
              <Heading level={1} className="mb-8">
                Selected<br />Works
              </Heading>
              <Text className="text-secondary font-light max-w-lg">
                Our portfolio represents a collection of architectural responses to unique sites and diverse programs. Each project is an exploration of form and light.
              </Text>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold hover:text-accent transition-colors"
              >
                {showFilters ? <X size={16} /> : <FilterIcon size={16} />}
                {showFilters ? 'Close Filters' : 'Filter Projects'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Filter Overlay/Drawer */}
      <div className={`transition-all duration-700 cubic-bezier overflow-hidden ${showFilters ? 'max-h-[500px] border-b border-black/5' : 'max-h-0'}`}>
        <div className="section-container pb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 bg-background-off p-10">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-black/40 mb-4 block">Location</span>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="City/Region"
                className="w-full bg-transparent border-b border-black/10 py-2 text-sm uppercase tracking-widest outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-black/40 mb-4 block">Typology</span>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full bg-transparent border-b border-black/10 py-2 text-sm uppercase tracking-widest outline-none focus:border-black transition-colors"
              >
                <option>All Types</option>
                <option value="House">Residential</option>
                <option value="Apartment">Apartments</option>
                <option value="Villa">Villas</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-black/40 mb-4 block">Budget</span>
              <div className="flex gap-4">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-full bg-transparent border-b border-black/10 py-2 text-sm uppercase tracking-widest outline-none focus:border-black transition-colors"
                />
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-full bg-transparent border-b border-black/10 py-2 text-sm uppercase tracking-widest outline-none focus:border-black transition-colors"
                />
              </div>
            </div>
            <div className="flex items-end gap-4">
              <Button onClick={applyFilters} className="flex-1 !py-3 !text-[10px]">Apply</Button>
              <button
                onClick={resetFilters}
                className="text-[10px] uppercase tracking-widest p-3 hover:text-red-500 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <section className="section-padding pt-0">
        <div className="section-container">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6">
              <div className="w-12 h-px bg-black/10 animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-[0.5em] text-secondary animate-pulse">Loading Properties...</span>
            </div>
          ) : properties.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center">
              <Heading level={3} className="text-secondary/20 mb-6">No matching projects</Heading>
              <button onClick={resetFilters} className="text-xs uppercase tracking-widest underline underline-offset-8">Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
              {properties.map((property, index) => (
                <Link
                  to={`/properties/${property.id}`}
                  key={property.id}
                  className="group block"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="image-zoom-container aspect-[4/5] mb-10 overflow-hidden">
                    <img
                      src={property.images && property.images.length > 0
                        ? property.images[0].url
                        : `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80`}
                      alt={property.title}
                      className="w-full h-full object-cover image-zoom"
                    />
                  </div>

                  <div className="flex justify-between items-start border-b border-black/5 pb-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-black mb-3 group-hover:text-accent transition-colors">
                        {property.title}
                      </h3>
                      <div className="flex items-center text-xs uppercase tracking-[0.2em] text-black font-bold">
                        <MapPin size={14} className="mr-2 text-black" />
                        {property.location?.city}, {property.location?.state}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 text-right">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-black border border-black px-3 py-1">
                        {property.category || 'Architecture'}
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-black">
                          ${Number(property.price).toLocaleString()}
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-black/40 font-medium">
                          {property.area} Sqft
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Portfolio CTA */}
      <section className="py-16 bg-background-off -mt-20">
        <div className="section-container text-center -mt-12">
          <Heading level={2} className="mb-10 capitalize">Interested in <span className="font-serif-italic normal-case text-accent">collaborating?</span></Heading>
          <Text className="text-secondary max-w-xl mx-auto mb-12">
            We are currently accepting inquiries for late 2024 and early 2025 residential and commercial projects.
          </Text>
          <Link to="/contact">
            <Button variant="minimal">Begin a project</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
