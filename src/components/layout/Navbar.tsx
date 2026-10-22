import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Phone, Menu, X } from 'lucide-react';
import { KmLogo } from '../common/KmLogo';

interface NavbarProps {
  onOpenExchangeModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenExchangeModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const goToExchange = () => {
    if (onOpenExchangeModal) {
      onOpenExchangeModal();
    } else {
      navigate('/exchange');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
      <nav className="backdrop-blur-xl bg-white/80 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
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

          <div className="hidden lg:flex items-center gap-8">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={({ isActive }) =>
                  `text-[13px] font-medium tracking-tight transition-colors ${
                    isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <a
              href="tel:+918123991847"
              className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+91 81239 91847</span>
            </a>
            <button
              onClick={goToExchange}
              className="text-[13px] font-medium text-slate-900 border border-slate-300 rounded-full px-4 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Exchange car
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -mr-2 text-slate-900"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 bottom-0 bg-white/95 backdrop-blur-xl overflow-y-auto">
          <div className="flex flex-col px-6 py-4">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={({ isActive }) =>
                  `py-4 border-b border-slate-100 text-lg font-medium ${
                    isActive ? 'text-slate-900' : 'text-slate-600'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="pt-6 flex flex-col gap-3">
              <a
                href="tel:+918123991847"
                className="flex items-center justify-center gap-2 py-3 text-slate-900 font-medium text-sm border border-slate-300 rounded-full"
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
          </div>
        </div>
      )}
    </header>
  );
};
