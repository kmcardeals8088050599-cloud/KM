import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Phone, Menu, X, ShieldCheck, Star, ArrowUpRight } from 'lucide-react';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { KmLogo } from '../common/KmLogo';

interface NavbarProps {
  onOpenExchangeModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenExchangeModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const goToExchange = () => {
    if (onOpenExchangeModal) {
      onOpenExchangeModal();
    } else {
      navigate('/exchange');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/exchange', label: 'Exchange' },
    { path: '/buy-sell', label: 'Buy & Sell' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Obsidian announcement bar — desktop only */}
      <div className="hidden lg:block bg-slate-950 text-slate-300 text-xs">
        <div className="max-w-[1400px] mx-auto px-6 xl:px-10 h-9 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              100% Non-Accidental Guarantee
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {DEALERSHIP_INFO.googleRating}.0 Rated Showroom · Kalaburagi
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href="tel:+918123991847" className="hover:text-amber-300 transition-colors font-medium">
              +91 81239 91847
            </a>
            <a href="tel:+918088050599" className="hover:text-amber-300 transition-colors font-medium">
              +91 80880 50599
            </a>
          </div>
        </div>
      </div>

      <nav
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-[0_1px_0_rgba(0,0,0,0.05)]'
            : 'bg-white/85 backdrop-blur-xl border-b border-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 h-16 flex items-center justify-between">
          <Link
            to="/"
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="focus:outline-none shrink-0"
          >
            <KmLogo variant="amber" size="sm" />
          </Link>

          <div className="hidden lg:flex items-center gap-9">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={({ isActive }) =>
                  `relative text-[13.5px] font-semibold tracking-tight transition-colors py-1 ${
                    isActive ? 'text-slate-950' : 'text-slate-500 hover:text-slate-950'
                  } after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-gradient-gold after:transition-all after:duration-300 ${
                    isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={goToExchange} className="btn-accent-apple !px-5 !py-2.5 !text-[13px]">
              Exchange car
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -mr-2 text-slate-950"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-slate-950 overflow-y-auto animate-fade-in-up">
          <div className="flex flex-col px-6 py-6">
            {navItems.map((item, idx) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between py-5 border-b border-white/10 text-2xl font-bold tracking-tight ${
                    isActive ? 'text-amber-400' : 'text-white'
                  }`
                }
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {item.label}
                <ArrowUpRight className="w-5 h-5 opacity-50" />
              </NavLink>
            ))}

            <div className="pt-8 flex flex-col gap-3">
              <a
                href="tel:+918123991847"
                className="flex items-center justify-center gap-2 py-3.5 text-white font-semibold text-sm border border-white/25 rounded-full"
              >
                <Phone className="w-4 h-4" />
                <span>+91 81239 91847</span>
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  goToExchange();
                }}
                className="btn-accent-apple w-full"
              >
                Exchange your vehicle
              </button>
            </div>

            <p className="pt-8 text-center text-[11px] text-white/40 font-medium">
              Opposite Hyundai Showroom, Humnabad Road, Kapnoor, Kalaburagi
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
