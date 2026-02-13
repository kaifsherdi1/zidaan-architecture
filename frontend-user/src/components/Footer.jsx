import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-black/5 pt-32 pb-16">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-10">
              <span className="text-2xl font-bold uppercase tracking-[0.3em] text-black">
                Zidaan<br />Architectures
              </span>
            </Link>
            <p className="max-w-md text-secondary leading-relaxed font-light mb-10">
              A global architecture and design studio focusing on high-end residential and commercial projects. We believe in the poetry of space and the power of minimal design.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-black hover:text-accent transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-black hover:text-accent transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-black hover:text-accent transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-black hover:text-accent transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-black mb-10">Studio</h3>
            <ul className="space-y-4">
              <li><Link to="/properties" className="text-sm uppercase tracking-widest text-secondary hover:text-black transition-colors">Portfolio</Link></li>
              <li><Link to="/about" className="text-sm uppercase tracking-widest text-secondary hover:text-black transition-colors">Philosophy</Link></li>
              <li><Link to="/agents" className="text-sm uppercase tracking-widest text-secondary hover:text-black transition-colors">Team</Link></li>
              <li><Link to="/contact" className="text-sm uppercase tracking-widest text-secondary hover:text-black transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-black mb-10">Contact</h3>
            <ul className="space-y-6">
              <li className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-black/40">Office</span>
                <span className="text-sm text-secondary font-light">123 Architectural Way, Suite 100<br />Design District, CA</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-black/40">Email</span>
                <span className="text-sm text-secondary font-light hover:text-black cursor-pointer transition-colors">hello@zidaan.com</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-black/40">Inquiries</span>
                <span className="text-sm text-secondary font-light">+1 (234) 567 890</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-black/5 text-[10px] uppercase tracking-[0.2em] text-secondary">
          <p>&copy; {new Date().getFullYear()} Zidaan Architectures. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-black transition-colors">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
