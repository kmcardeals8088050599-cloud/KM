import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Phone, ShieldCheck, Menu, X, ArrowRight, RefreshCw, Star, Sparkles, Sun } from 'lucide-react';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { KmLogo } from '../common/KmLogo';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, isBlackGold } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/exchange', label: 'Exchange Car' },
    { path: '/buy-sell', label: 'Buy & Sell' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact & Map' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-200 font-extrabold uppercase tracking-wider text-[10px] bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> 100% Non-Accidental Guarantee
            </span>
            <span className="hidden md:inline text-slate-400 text-[11px] font-medium">
              Opposite Hyundai Showroom, Humnabad Road, Kapnoor, Kalaburagi - 585104
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-slate-300 font-extrabold">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{DEALERSHIP_INFO.googleRating}.0 Google Rated</span>
            </div>
            <a
              href="tel:+918088050599"
              className="flex items-center gap-1.5 text-slate-100 hover:text-amber-400 transition-colors font-extrabold bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full border border-slate-700"
            >
              <Phone className="w-3.5 h-3.5 fill-slate-100 text-slate-100" />
              <span>+91 80880 50599</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Glass Navigation Bar */}
      <nav
        className={`transition-all duration-300 px-4 lg:px-8 py-3.5 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm'
            : 'bg-white/85 backdrop-blur-md border-b border-slate-200/80'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group focus:outline-none"
          >
            <KmLogo variant="amber" size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/90 shadow-xs">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-xs font-bold rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-slate-900 shadow-sm'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isBlackGold ? 'Clean Light' : 'Black & Gold'} Theme`}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-xl border transition-all shadow-xs cursor-pointer ${
                isBlackGold
                  ? 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800 hover:border-amber-500/50'
                  : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isBlackGold ? 'bg-amber-400 animate-pulse' : 'bg-sky-500'}`} />
              {isBlackGold ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wide">Black &amp; Gold</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wide">Clean Light</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                navigate('/exchange');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-black rounded-xl text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-300 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-700" />
              <span>Exchange Vehicle</span>
            </button>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                isBlackGold ? 'bg-slate-900 text-amber-400 border-slate-800' : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}
              title="Toggle Theme"
            >
              {isBlackGold ? <Sparkles className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 text-white border border-slate-800 focus:outline-none shadow-md"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[108px] bg-white border-b border-slate-200 p-6 shadow-xl z-50">
          <div className="flex flex-col gap-2">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`
                }
              >
                <span>{item.label}</span>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </NavLink>
            ))}

            <div className="pt-4 mt-2 border-t border-slate-200 flex flex-col gap-3">
              {/* Mobile Theme Switcher */}
              <button
                onClick={toggleTheme}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs border ${
                  isBlackGold
                    ? 'bg-slate-900 text-amber-400 border-slate-800'
                    : 'bg-sky-50 text-sky-800 border-sky-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isBlackGold ? <Sparkles className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-sky-600" />}
                  <span>Active Theme: {isBlackGold ? 'Black & Gold' : 'Clean Light'}</span>
                </div>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white/20">Switch</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/exchange');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-sm rounded-xl border border-slate-300"
              >
                <RefreshCw className="w-4 h-4 text-slate-800" />
                <span>Exchange Your Vehicle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

