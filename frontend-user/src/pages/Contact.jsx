import React from 'react';
import Layout from '../components/Layout';
import { Heading, Text } from '../components/ui/Typography';
import Button from '../components/ui/Button';
import { Instagram, Linkedin, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <Layout>
      <section className="pt-40 pb-20 bg-white">
        <div className="section-container">
          <div className="max-w-4xl">
            <span className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-6 block">
              Inquiries
            </span>
            <Heading level={1} className="mb-12">
              Let's build<br />something <span className="font-serif-italic normal-case text-accent">extraordinary</span>
            </Heading>
            <Text className="text-lg text-secondary font-light max-w-xl">
              We are always open to new collaborations and visionary projects. Reach out to discuss how we can bring your architectural aspirations to life.
            </Text>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          {/* Info Cards - Elite World Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
              {
                title: "Our Location",
                lines: ["ROYS EMPIRE PRIVATE LIMITED", "# 46, 3rd Floor, Galaxy Mall, J C Nagar, Hubali - 580020"],
                icon: <MapPin className="text-blue-500" size={32} />,
                color: "bg-blue-50"
              },
              {
                title: "Email Address",
                lines: ["info@zidaan.com", "support@zidaan.com"],
                icon: <Mail className="text-orange-500" size={32} />,
                color: "bg-orange-50"
              },
              {
                title: "Phone Number",
                lines: ["+91 99866 99336", "+91 99868 99339"],
                icon: <Phone className="text-green-500" size={32} />,
                color: "bg-green-50"
              }
            ].map((card, i) => (
              <div key={i} className="bg-white p-12 py-16 border border-black/5 flex flex-col items-center text-center group hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 rounded-lg">
                <div className={`w-32 h-32 mb-10 flex items-center justify-center rounded-full ${card.color} group-hover:scale-110 transition-transform duration-500 border-4 border-white shadow-inner`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-6 tracking-widest">{card.title}</h3>
                {card.lines.map((line, j) => (
                  <p key={j} className="text-secondary font-light text-[11px] uppercase tracking-widest leading-relaxed max-w-[200px]">{line}</p>
                ))}
              </div>
            ))}
          </div>

          {/* Contact Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center border-t border-black/5 pt-32">
            {/* Illustration side */}
            <div className="hidden lg:block">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-accent/5 rounded-full scale-110 blur-3xl animate-pulse"></div>
                {/* Using a high-quality placeholder that matches the architectural/business vibe */}
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Architecture Consultation"
                  className="w-full h-full object-contain relative z-10 rounded-2xl"
                />
              </div>
            </div>

            {/* Form side */}
            <div className="bg-white p-12 md:p-20 border border-black/5 rounded-lg shadow-sm">
              <Heading level={3} className="mb-12 !text-2xl font-normal lowercase tracking-tight">Get in touch</Heading>
              <form className="space-y-12">
                <div className="space-y-4">
                  <span className="text-[11px] uppercase tracking-widest text-black/40 block font-bold">Full Name*</span>
                  <input type="text" placeholder="Your Name" className="w-full bg-transparent border-b border-black/20 py-4 text-xs uppercase tracking-widest outline-none focus:border-accent transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <span className="text-[11px] uppercase tracking-widest text-black/40 block font-bold">Email Here*</span>
                    <input type="email" placeholder="email@address.com" className="w-full bg-transparent border-b border-black/20 py-4 text-xs uppercase tracking-widest outline-none focus:border-accent transition-colors" />
                  </div>
                  <div className="space-y-4">
                    <span className="text-[11px] uppercase tracking-widest text-black/40 block font-bold">Subject *</span>
                    <input type="text" placeholder="Project Inquiry" className="w-full bg-transparent border-b border-black/20 py-4 text-xs uppercase tracking-widest outline-none focus:border-accent transition-colors" />
                  </div>
                </div>
                <div className="space-y-4">
                  <span className="text-[11px] uppercase tracking-widest text-black/40 block font-bold">Write Your Message*</span>
                  <textarea placeholder="Tell us about your project vision" rows="4" className="w-full bg-transparent border-b border-black/20 py-4 text-xs uppercase tracking-widest outline-none focus:border-accent transition-colors resize-none"></textarea>
                </div>
                <Button className="w-full !py-6 bg-[#38bdf8] text-white border-none hover:bg-black transition-all duration-300 font-bold tracking-[0.2em] rounded-full shadow-lg shadow-blue-500/20">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
