import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Phone, ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { KmLogo } from '../common/KmLogo';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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
      <div className="bg-slate-950 text-slate-400 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-300 font-extrabold uppercase tracking-wider text-[10px] bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> 100% Non-Accidental Guarantee
            </span>
            <span className="hidden md:inline text-slate-500 text-[11px] font-medium">Opposite Hyundai Showroom, Humnabad Road, Kapnoor, Kalaburagi - 585104</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-slate-400 font-extrabold">
              <span className="text-amber-500">★</span>
              <span>{DEALERSHIP_INFO.googleRating}.0 Google Rated</span>
            </div>
            <a href="tel:+918123991847" className="flex items-center gap-1.5 text-slate-200 hover:text-amber-400 transition-colors font-extrabold bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full border border-slate-700">
              <Phone className="w-3.5 h-3.5 fill-slate-200 text-slate-200" />
              <span>+91 81239 91847</span>
            </a>
            <a href="tel:+918088050599" className="hidden sm:flex items-center gap-1.5 text-slate-500 hover:text-amber-400 transition-colors font-bold px-2 py-1">
              <Phone className="w-3 h-3 text-slate-500" />
              <span>+91 80880 50599</span>
            </a>
          </div>
        </div>
      </div>

      <nav className={`transition-all duration-300 px-4 lg:px-8 py-3.5 ${isScrolled ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 shadow-lg' : 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group focus:outline-none">
            <KmLogo variant="amber" size="md" />
          </Link>

          <div className="hidden lg:flex items-center gap-1 bg-slate-800/60 p-1.5 rounded-full border border-slate-700/50">
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={({ isActive }) => `relative px-4 py-2 text-xs font-bold rounded-full transition-all duration-200 ${isActive ? 'text-white bg-amber-600 shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <button onClick={() => { navigate('/exchange'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2 px-3.5 py-2 text-xs font-black rounded-xl text-white bg-amber-600 hover:bg-amber-500 transition-all border border-amber-500/30 shadow-md cursor-pointer">
              <span>Exchange Vehicle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none shadow-md" aria-label="Toggle Navigation">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 bg-slate-950 border-b border-slate-800 p-6 shadow-xl z-50" style={{ top: '108px' }}>
          <div className="flex flex-col gap-2">
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path} onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <span>{item.label}</span>
                <ArrowRight className="w-4 h-4 opacity-70" />
              </NavLink>
            ))}
            <div className="pt-4 mt-2 border-t border-slate-800 flex flex-col gap-3">
              <button onClick={() => { setMobileMenuOpen(false); navigate('/exchange'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm rounded-xl border border-amber-500/30">
                <span>Exchange Your Vehicle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
