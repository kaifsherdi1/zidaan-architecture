import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import Button from './ui/Button';
import { useStateContext } from '../contexts/ContextProvider';
import api from '../services/api';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, token, setUser, setToken } = useStateContext();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onLogout = (e) => {
    e.preventDefault();
    api.logout().then(() => {
      setUser(null);
      setToken(null);
    });
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Selected Works', path: '/properties' },
    { name: 'Agents', path: '/agents' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  const isDarkHeroPage = location.pathname === '/' || location.pathname.startsWith('/properties/');

  return (
    <nav className={`fixed w-full z-50 transition-all duration-700 ${scrolled ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'}`}>
      <div className="section-container flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className={`text-xl md:text-2xl font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${scrolled ? 'text-black' : (isDarkHeroPage ? 'text-white' : 'text-black')}`}>
            Zidaan<span className={`font-light ml-2 transition-colors duration-500 ${scrolled ? 'text-secondary' : (isDarkHeroPage ? 'text-white/60' : 'text-secondary')}`}>Architectures</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const darkText = scrolled || !isDarkHeroPage;

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:text-accent ${isActive
                    ? (darkText ? 'text-black border-b border-black pb-1' : 'text-white border-b border-white pb-1')
                    : (darkText ? 'text-secondary' : 'text-white/70')
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-6">
          {token ? (
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className={`flex items-center gap-2 text-xs uppercase tracking-widest font-bold transition-colors ${scrolled || !isDarkHeroPage ? 'text-black hover:text-accent' : 'text-white hover:text-accent'}`}>
                <User size={16} />
                <span>{user?.name || 'Dashboard'}</span>
              </Link>
              <button onClick={onLogout} className={`transition-colors ${scrolled || !isDarkHeroPage ? 'text-secondary hover:text-black' : 'text-white/70 hover:text-white'}`}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors ${scrolled || !isDarkHeroPage ? 'text-secondary hover:text-black' : 'text-white/70 hover:text-white'}`}>
                Log in
              </Link>
              <Link to="/register">
                <Button variant={scrolled || !isDarkHeroPage ? "minimal" : "minimal-light"} className="!px-6 !py-2 !text-[10px]">Join</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`focus:outline-none p-2 md:hidden transition-colors ${scrolled || !isDarkHeroPage ? 'text-black' : 'text-white'}`}
          onClick={toggleMenu}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-[60] transform transition-all duration-700 cubic-bezier md:hidden flex flex-col items-center justify-center space-y-8 ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <button
          onClick={toggleMenu}
          className="absolute top-8 right-8 text-black"
        >
          <X size={32} />
        </button>

        {navLinks.map((link, index) => (
          <Link
            key={link.name}
            to={link.path}
            onClick={() => setIsOpen(false)}
            className="text-3xl font-bold uppercase tracking-tighter text-black hover:text-accent transition-all duration-300 transform"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            {link.name}
          </Link>
        ))}

        <div className="pt-10 flex flex-col items-center gap-6">
          {token ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-xl font-bold text-black uppercase tracking-widest">
                Dashboard
              </Link>
              <button onClick={(e) => { onLogout(e); setIsOpen(false); }} className="text-secondary uppercase tracking-widest">Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <span className="text-xl font-bold uppercase tracking-widest text-black">Log in</span>
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)}>
                <Button variant="minimal">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
