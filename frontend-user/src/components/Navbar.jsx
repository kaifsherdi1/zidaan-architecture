import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown, ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import { useStateContext } from '../contexts/ContextProvider';
import { NAV_LINKS, COMPANY, LOGO } from '../data/site';
import api from '../services/api';
import NotificationDropdown from './NotificationDropdown';

// Pages that render a full-bleed dark image hero behind the fixed navbar.
const DARK_HERO_EXACT = new Set([
  '/', '/about', '/team', '/services', '/journal', '/careers', '/contact', '/sell',
]);
function hasDarkHero(pathname) {
  if (DARK_HERO_EXACT.has(pathname)) return true;
  // Property detail pages have a dark image hero; team/journal detail pages do not.
  if (/^\/properties\/[^/]+$/.test(pathname)) return true;
  if (/^\/(buy|rent)$/.test(pathname)) return true;
  return false;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const location = useLocation();
  const { user, token, setUser, setToken } = useStateContext();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile menu on route change and lock body scroll while open.
  useEffect(() => {
    setIsOpen(false);
    setOpenGroup(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const onLogout = (e) => {
    e.preventDefault();
    api.logout().finally(() => {
      setUser(null);
      setToken(null);
    });
  };

  const darkHero = hasDarkHero(location.pathname);
  const onLight = scrolled || !darkHero;
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md py-3.5 shadow-[0_1px_0_rgba(0,0,0,0.06)]'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="section-container flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center" aria-label={COMPANY.name}>
            <img
              src={LOGO.horizontal}
              alt={COMPANY.name}
              className={`w-auto transition-all duration-300 ${
                scrolled ? 'h-9 sm:h-10' : 'h-10 sm:h-12'
              } ${onLight ? '' : 'brightness-0 invert'}`}
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <div key={link.name} className="relative group">
                <Link
                  to={link.path}
                  className={`flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] font-bold transition-colors duration-300 hover:opacity-60 ${
                    isActive(link.path)
                      ? onLight
                        ? 'text-black'
                        : 'text-white'
                      : onLight
                      ? 'text-black/55'
                      : 'text-white/70'
                  }`}
                >
                  {link.name}
                  {link.children && <ChevronDown size={12} className="mt-0.5" />}
                </Link>

                {link.children && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300">
                    <div className="min-w-[220px] bg-white shadow-xl border border-black/5 py-3">
                      {link.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className="block px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-black/60 hover:text-black hover:bg-background-off transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auth (desktop) */}
          <div className="hidden lg:flex items-center gap-5 shrink-0">
            {token ? (
              <>
                <NotificationDropdown onLight={onLight} />
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold transition-colors hover:opacity-60 ${
                    onLight ? 'text-black' : 'text-white'
                  }`}
                >
                  <User size={15} />
                  <span className="max-w-[120px] truncate">{user?.name || 'Account'}</span>
                </Link>
                <button
                  onClick={onLogout}
                  aria-label="Log out"
                  className={`transition-colors ${
                    onLight ? 'text-black/50 hover:text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-colors hover:opacity-60 ${
                    onLight ? 'text-black/55' : 'text-white/70'
                  }`}
                >
                  Log in
                </Link>
                <Link to="/register">
                  <Button
                    variant={onLight ? 'minimal' : 'minimal-light'}
                    className="!px-5 !py-2 !text-[10px]"
                  >
                    Join
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className={`lg:hidden p-2 -mr-2 transition-colors ${
              onLight ? 'text-black' : 'text-white'
            }`}
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-white lg:hidden flex flex-col transition-transform duration-500 cubic-bezier ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="section-container flex items-center justify-between py-6 border-b border-black/5">
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center" aria-label={COMPANY.name}>
            <img src={LOGO.horizontal} alt={COMPANY.name} className="h-9 w-auto" />
          </Link>
          <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-black" aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="section-container py-8 flex flex-col">
            {NAV_LINKS.map((link) => (
              <div key={link.name} className="border-b border-black/5">
                {link.children ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenGroup(openGroup === link.name ? null : link.name)
                      }
                      className="w-full flex items-center justify-between py-5 text-2xl font-bold uppercase tracking-tight text-black"
                    >
                      {link.name}
                      <ChevronDown
                        size={20}
                        className={`transition-transform duration-300 ${
                          openGroup === link.name ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openGroup === link.name ? 'max-h-72 pb-4' : 'max-h-0'
                      }`}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className="block py-3 pl-1 text-sm uppercase tracking-[0.18em] text-black/55"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    to={link.path}
                    className="block py-5 text-2xl font-bold uppercase tracking-tight text-black"
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}

            <div className="pt-10 flex flex-col gap-4">
              {token ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-black"
                  >
                    <User size={16} /> {user?.name || 'Dashboard'}
                  </Link>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-secondary"
                  >
                    <LogOut size={16} /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="minimal" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="minimal" className="w-full !bg-black !text-white">
                      Create account <ArrowRight size={14} />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
