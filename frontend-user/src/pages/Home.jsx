import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { Heading, Text } from '../components/ui/Typography';
import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Image assets from the local src/assets/images folder
import heroImg from '../assets/images/Realx-30x40-img1.png';
import aboutImg from '../assets/images/Realx-30x40-image2.png';
import fullWidthImg from '../assets/images/Realx-30x40-image5.png';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProperties()
      .then(({ data }) => {
        setProperties(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Zidaan Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="section-container relative z-10 pt-20">
          <div className="max-w-4xl">
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/80 mb-6 block animate-fade-in">
              Studio of Architecture & Design
            </span>
            <Heading level={1} className="text-white mb-10 animate-slide-up">
              Zidaan<br />Architectures
            </Heading>
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center animate-fade-in delay-300">
              <Link to="/properties">
                <Button variant="minimal-light">View Selected Works</Button>
              </Link>
              <Text className="text-white/60 !text-sm max-w-xs uppercase tracking-widest leading-loose">
                Redefining spaces with minimalist poetry and architectural precision.
              </Text>
            </div>
          </div>
        </div>

        {/* Vertical Side Text */}
        <div className="absolute right-10 bottom-20 hidden lg:block">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/40 rotate-90 origin-right whitespace-nowrap">
            Est. 2024 — Global Studio
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section-padding bg-white -mt-10">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-1 hidden lg:block">
              <span className="text-[10px] uppercase tracking-[0.5em] text-secondary/40 rotate-90 origin-left whitespace-nowrap">
                Philosophy
              </span>
            </div>

            <div className="lg:col-span-5">
              <Heading level={2} className="mb-12">
                The essence<br />
                <span className="font-serif-italic normal-case text-accent">of space</span>
              </Heading>
              <Text className="text-secondary italic mb-10 text-xl font-light">
                "Architecture is not just building boxes; it's about choreographing the interaction between light, material, and human emotion."
              </Text>
              <Text className="text-black/70 mb-12">
                Zidaan Architectures is a boutique studio dedicated to creating high-end environments that transcend functional requirements. Our approach is rooted in the belief that luxury lies in simplicity.
              </Text>
              <Link to="/about">
                <Button variant="link">Read our story</Button>
              </Link>
            </div>

            <div className="lg:col-span-6">
              <div className="image-zoom-container aspect-[4/5]">
                <img src={aboutImg} alt="Architecture Studio" className="w-full h-full object-cover image-zoom" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Works Section */}
      <section className="section-padding bg-background-off -mt-28">
        <div className="section-container -mt-28">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-2 gap-6">
            <Heading level={2}>
              Selected<br />Works
            </Heading>
            <Link to="/properties" className="group flex items-center gap-4 text-xs uppercase tracking-[0.3em] font-bold">
              View All Projects <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {loading ? (
              <div className="col-span-full h-64 flex items-center justify-center">
                <span className="text-xs uppercase tracking-widest text-secondary animate-pulse">Fetching Projects...</span>
              </div>
            ) : properties.slice(0, 6).map((property, index) => (
              <Link to={`/properties/${property.id}`} key={property.id} className="group block">
                <div className="image-zoom-container aspect-[3/4] mb-8">
                  <img
                    src={property.images && property.images.length > 0
                      ? property.images[0].url
                      : heroImg}
                    alt={property.title}
                    className="w-full h-full object-cover image-zoom"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-black mb-2 group-hover:text-accent transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-xs uppercase tracking-widest text-black font-bold">
                      <MapPin size={12} className="mr-2 text-black" />
                      {property.location?.city}, {property.location?.state}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-black">
                      ${Number(property.price).toLocaleString()}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-black/30">
                      2024
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Full Width Visual */}
      <section className="h-[70vh] w-full overflow-hidden">
        <img src={fullWidthImg} alt="Architectural Detail" className="w-full h-full object-cover" />
      </section>

      {/* Services Section */}
      <section className="section-padding bg-white -mt-10">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-4">
              <Heading level={2} className="mb-6">Expertise</Heading>
              <Text className="text-secondary font-light">We provide comprehensive architectural services from concept to completion.</Text>
            </div>
            <div className="lg:col-span-8">
              <div className="divide-y divide-black/5">
                {[
                  { title: "Residential Architecture", desc: "Crafting bespoke private residences with a focus on light and materiality." },
                  { title: "Commercial Spaces", desc: "Innovative workspaces and retail environments that define brand identity." },
                  { title: "Interior Design", desc: "Curation of furniture, light, and art to complete the architectural vision." },
                  { title: "Urban Planning", desc: "Large scale masterplanning with a focus on sustainable public spaces." }
                ].map((service, i) => (
                  <div key={i} className="py-12 flex flex-col md:flex-row justify-between gap-8 group cursor-default">
                    <h4 className="text-2xl font-bold uppercase tracking-tight group-hover:text-accent transition-colors">
                      {service.title}
                    </h4>
                    <p className="max-w-sm text-secondary font-light text-sm leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-background-off -mt-24">
        <div className="section-container -mt-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <Heading level={2} className="mb-8">
                  Ready to evolve<br />your vision?
                </Heading>
                <Text className="text-secondary mb-12">
                  We are always looking for visionary clients to collaborate with on exceptional projects.
                </Text>
                <div className="space-y-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-black/40 mb-1">Direct Line</span>
                    <a href="tel:+1234567890" className="text-lg font-bold hover:text-accent transition-colors">+1 (234) 567 890</a>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-black/40 mb-1">Email</span>
                    <a href="mailto:hello@zidaan.com" className="text-lg font-bold hover:text-accent transition-colors">hello@zidaan.com</a>
                  </div>
                </div>
              </div>

              <div className="bg-white p-12 shadow-sm border border-black/5">
                <form className="space-y-8">
                  <div className="border-b border-black/10 py-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full bg-transparent outline-none text-sm uppercase tracking-widest placeholder:text-black/20"
                    />
                  </div>
                  <div className="border-b border-black/10 py-4">
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full bg-transparent outline-none text-sm uppercase tracking-widest placeholder:text-black/20"
                    />
                  </div>
                  <div className="border-b border-black/10 py-4">
                    <textarea
                      placeholder="About your project"
                      rows="4"
                      className="w-full bg-transparent outline-none text-sm uppercase tracking-widest placeholder:text-black/20 resize-none"
                    ></textarea>
                  </div>
                  <Button variant="minimal" className="w-full mt-4">Send Inquiry</Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
