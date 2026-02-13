import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { Heading, Text } from '../components/ui/Typography';
import { MapPin, ArrowRight, ChevronLeft, ChevronRight, X, Calendar, User, Phone } from 'lucide-react';
import api from '../services/api';

export default function PropertyDetails() {
  const { id } = useParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await api.getProperty(id);
        setProperty(data.data);
      } catch (error) {
        console.error("Failed to fetch property details", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-px bg-black/10 animate-pulse"></div>
          <span className="text-[10px] uppercase tracking-[0.5em] text-secondary animate-pulse">Building Context...</span>
        </div>
      </Layout>
    )
  }

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center flex-col gap-10">
          <Heading level={2}>Project Not Found</Heading>
          <Link to="/properties"><Button variant="minimal">Return to Gallery</Button></Link>
        </div>
      </Layout>
    )
  }

  const images = property.images && property.images.length > 0
    ? property.images.map(img => img.url)
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'];

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <img
          src={images[activeImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Navigation Overlays */}
        <div className="absolute bottom-10 left-10 md:left-20 z-10">
          <Link to="/properties" className="flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-white hover:text-accent transition-all mb-10 group">
            <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Back to Gallery
          </Link>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/60">{property.category || 'Architecture'}</span>
            <Heading level={1} className="text-white !text-4xl md:!text-6xl lg:!text-8xl">{property.title}</Heading>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 md:right-20 flex gap-4 z-10">
          <button onClick={prevImage} className="w-12 h-12 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextImage} className="w-12 h-12 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Project Narrative */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-8">
              <span className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-10 block">Executive Summary</span>
              <Text className="text-2xl md:text-3xl font-light italic text-black mb-12 leading-relaxed">
                "{property.description.split('.')[0]}."
              </Text>
              <div className="columns-1 md:columns-2 gap-12 space-y-8 text-secondary font-light">
                <p>{property.description}</p>
              </div>
            </div>

            <div className="lg:col-span-4 mt-20 lg:mt-0">
              <div className="sticky top-40 bg-background-off p-10 border border-black/5">
                <Heading level={4} className="mb-10 !text-xs !tracking-[0.3em]">Technical Specifications</Heading>
                <div className="space-y-6">
                  {[
                    { label: "Location", value: `${property.location?.city}, ${property.location?.state}` },
                    { label: "Area", value: `${property.area} Sq Ft` },
                    { label: "Beds", value: property.bedrooms },
                    { label: "Baths", value: property.bathrooms },
                    { label: "Price", value: `$${Number(property.price).toLocaleString()}` },
                    { label: "Est. Completion", value: "2024" }
                  ].map((spec, i) => (
                    <div key={i} className="flex justify-between items-baseline border-b border-black/5 pb-4">
                      <span className="text-[10px] uppercase tracking-widest text-black/60">{spec.label}</span>
                      <span className="text-sm font-bold uppercase tracking-widest text-black">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Spotlight Grid */}
      <section className="pb-32 bg-white">
        <div className="section-container grid grid-cols-1 md:grid-cols-2 gap-8">
          {images.slice(1).map((img, i) => (
            <div key={i} className={`image-zoom-container ${i % 3 === 0 ? 'md:col-span-2 aspect-video' : 'aspect-square'}`}>
              <img src={img} alt={`Detail ${i}`} className="w-full h-full object-cover image-zoom" />
            </div>
          ))}
        </div>
      </section>

      {/* Booking / Inquiry Section */}
      <section className="section-padding bg-background-off border-t border-black/5">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <Heading level={2} className="mb-6 capitalize">Project <span className="font-serif-italic normal-case text-accent">Inquiry</span></Heading>
            <Text className="text-secondary font-light">Interested in this property or a similar architectural solution? Contact our dedicated studio team.</Text>
          </div>

          <div className="max-w-2xl mx-auto">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-12 shadow-sm border border-black/5">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-widest text-black/40 block">Preferred Date</span>
                <input type="date" className="w-full border-b border-black/10 py-3 text-xs uppercase tracking-widest outline-none focus:border-black bg-transparent" />
              </div>
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-widest text-black/40 block">Full Name</span>
                <input type="text" placeholder="John Doe" className="w-full border-b border-black/10 py-3 text-xs uppercase tracking-widest outline-none focus:border-black bg-transparent" />
              </div>
              <div className="space-y-4 md:col-span-2">
                <span className="text-[10px] uppercase tracking-widest text-black/40 block">Message</span>
                <textarea placeholder="Tell us about your requirements" rows="3" className="w-full border-b border-black/10 py-3 text-xs uppercase tracking-widest outline-none focus:border-black bg-transparent resize-none"></textarea>
              </div>
              <Button className="md:col-span-2 !py-4 mt-4">Schedule Private Viewing</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Lightbox Trigger (Hidden element to match logic if needed) */}
      {showLightbox && (
        <div className="fixed inset-0 z-[100] bg-black p-10 flex items-center justify-center">
          <button onClick={() => setShowLightbox(false)} className="absolute top-10 right-10 text-white"><X size={32} /></button>
          <img src={images[activeImageIndex]} className="max-h-full max-w-full object-contain" alt="Lightbox" />
        </div>
      )}
    </Layout>
  );
}
