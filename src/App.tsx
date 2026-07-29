import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Lead, ExchangeRequest, FilterState } from './types';
import { INITIAL_CARS, INITIAL_LEADS, INITIAL_EXCHANGES } from './data/mockData';
import { fetchCars, filterCarsLocal, clearAuthToken } from './lib/api';

// Layout & Common Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CarCard } from './components/common/CarCard';
import { QuickViewModal } from './components/common/QuickViewModal';
import { WhatsAppButton } from './components/common/WhatsAppButton';

// Homepage Components
import { HeroSection } from './components/home/HeroSection';
import { BrandCarousel } from './components/home/BrandCarousel';
import { FeaturedCars } from './components/home/FeaturedCars';
import { ServicesSection } from './components/home/ServicesSection';
import { WhyChooseUs } from './components/home/WhyChooseUs';
import { HowItWorks } from './components/home/HowItWorks';
import { ShowroomGallery } from './components/home/ShowroomGallery';
import { Testimonials } from './components/home/Testimonials';
import { LocationSection } from './components/home/LocationSection';

// Page Views
import { InventoryFilter } from './components/inventory/InventoryFilter';
import { CarDetailsView } from './components/inventory/CarDetailsView';
import { CompareView } from './components/inventory/CompareView';
import { ExchangeForm } from './components/exchange/ExchangeForm';
import { AboutView } from './components/about/AboutView';
import { ContactView } from './components/contact/ContactView';
import { BuySellView } from './components/buysell/BuySellView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { CompareBar } from './components/common/CompareBar';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Single Car Detail Route Wrapper
function CarDetailsRoute({
  cars,
  onSelectCar,
  onOpenExchangeModal
}: {
  cars: Car[];
  onSelectCar: (car: Car) => void;
  onOpenExchangeModal: (car?: Car) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const car = cars.find(c => c.id === id);

  if (!car) {
    return (
      <div className="py-32 px-4 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-2xl font-black text-slate-900">Vehicle Not Found</h2>
        <p className="text-xs text-slate-500 font-medium">The pre-owned car you are looking for may have been sold or removed from inventory.</p>
        <button
          onClick={() => navigate('/inventory')}
          className="px-5 py-2.5 bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-xs"
        >
          Browse Active Inventory
        </button>
      </div>
    );
  }

  return (
    <CarDetailsView
      car={car}
      onBack={() => navigate('/inventory')}
      onSelectCar={onSelectCar}
      onOpenExchangeModal={onOpenExchangeModal}
      relatedCars={cars.filter(c => c.id !== car.id && c.brand === car.brand)}
    />
  );
}

function MainAppContent() {
  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [exchangeRequests, setExchangeRequests] = useState<ExchangeRequest[]>(INITIAL_EXCHANGES);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickViewCar, setQuickViewCar] = useState<Car | null>(null);
  const [exchangeTargetCar, setExchangeTargetCar] = useState<Car | null>(null);
  const [compareCars, setCompareCars] = useState<Car[]>([]);

  const handleAddToCompare = (car: Car) => {
    setCompareCars(prev => {
      if (prev.find(c => c.id === car.id)) return prev.filter(c => c.id !== car.id);
      if (prev.length >= 3) return prev;
      return [...prev, car];
    });
  };

  // Admin Auth State - check for existing valid token
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return !!localStorage.getItem('km_admin_token');
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Inventory Filter State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    brand: 'All',
    model: 'All',
    rto: 'All',
    ownerCount: 'All',
    bodyType: 'All',
    fuelType: 'All',
    transmission: 'All',
    minPrice: 0,
    maxPrice: 50,
    minYear: 2010,
    maxYear: 2026,
    status: 'All',
    sort: 'newest'
  });

  // Fetch initial cars from server API
  useEffect(() => {
    async function loadData() {
      const data = await fetchCars();
      setCars(data);
    }
    loadData();
  }, []);

  // Filtered Inventory List
  const filteredCars = filterCarsLocal(cars, filters);

  // Navigation Handlers
  const handleSelectCar = (car: Car) => {
    navigate(`/inventory/${car.id}`);
  };

  const handleBrandClickFromCarousel = (brand: string) => {
    setFilters(prev => ({ ...prev, brand }));
    navigate('/inventory');
  };

  const handleHeroSearch = (query: string, brand: string, bodyType: string) => {
    setFilters(prev => ({
      ...prev,
      search: query,
      brand,
      bodyType
    }));
    navigate('/inventory');
  };

  const handleOpenExchangeForCar = (car?: Car) => {
    if (car) {
      setExchangeTargetCar(car);
    } else {
      setExchangeTargetCar(null);
    }
    navigate('/exchange');
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white relative overflow-hidden">
      {/* Background 4D Ambient Light Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-600/20 blur-[120px] animate-orb-1 pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[150px] animate-orb-2 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-amber-600/15 blur-[130px] animate-orb-3 pointer-events-none" />
      </div>

      <ScrollToTop />
      {/* Navigation Header - hidden on admin pages */}
      {!location.pathname.startsWith('/admin') && (
        <Navbar onOpenExchangeModal={() => handleOpenExchangeForCar()} />
      )}

      {/* Main Content Area with Routes */}
      <main className={`${location.pathname.startsWith('/admin') ? '' : 'pt-28'} flex-1 relative z-10`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes location={location}>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <div className="space-y-0">
                <HeroSection
                  onSearch={handleHeroSearch}
                  setActiveTab={tab => navigate(`/${tab === 'home' ? '' : tab}`)}
                />

                <BrandCarousel onBrandClick={handleBrandClickFromCarousel} />

                <FeaturedCars
                  cars={cars}
                  onSelectCar={handleSelectCar}
                  onQuickView={car => setQuickViewCar(car)}
                  onViewAll={() => navigate('/inventory')}
                  onExchangeSelect={car => handleOpenExchangeForCar(car)}
                />

                <ServicesSection
                  setActiveTab={tab => navigate(`/${tab === 'home' ? '' : tab}`)}
                />

                <WhyChooseUs />

                <HowItWorks />

                <ShowroomGallery />

                <Testimonials />

                <LocationSection />
              </div>
            }
          />

          {/* Inventory Route */}
          <Route
            path="/inventory"
            element={
              <div className="py-12 px-4 lg:px-8 max-w-7xl mx-auto space-y-8 min-h-screen">
                <div className="space-y-2 text-center max-w-2xl mx-auto">
                  <span className="text-[11px] font-black text-red-400 uppercase tracking-widest bg-red-950/60 px-4 py-1.5 rounded-full border border-red-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.25)]">
                    Multi-Brand Pre-Owned Showroom
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight text-glow-red mt-2">
                    EXPLORE ALL PRE-OWNED CARS
                  </h1>
                  <p className="text-xs text-slate-300 font-medium">
                    Search &amp; filter among 150-point inspected multi-brand cars available for immediate delivery in Kalaburagi
                  </p>
                </div>

                {/* Filter Bar */}
                <InventoryFilter
                  filters={filters}
                  setFilters={setFilters}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  totalResults={filteredCars.length}
                />

                {/* Cars Results Grid / List */}
                {filteredCars.length === 0 ? (
                  <div className="text-center py-16 glass-panel rounded-3xl space-y-3">
                    <p className="text-base font-extrabold text-white">No vehicles match your search filters.</p>
                    <p className="text-xs text-slate-400">Try adjusting your brand, budget, or body type criteria.</p>
                    <button
                      onClick={() =>
                        setFilters({
                          search: '',
                          brand: 'All',
                          model: 'All',
                          rto: 'All',
                          ownerCount: 'All',
                          bodyType: 'All',
                          fuelType: 'All',
                          transmission: 'All',
                          minPrice: 0,
                          maxPrice: 50,
                          minYear: 2010,
                          maxYear: 2026,
                          status: 'All',
                          sort: 'newest'
                        })
                      }
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-400/30 transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCars.map(car => (
                      <CarCard
                        key={car.id}
                        car={car}
                        onSelectCar={handleSelectCar}
                        onQuickView={c => setQuickViewCar(c)}
                        onExchangeSelect={c => handleOpenExchangeForCar(c)}
                        onAddToCompare={handleAddToCompare}
                        isInCompare={compareCars.some(c => c.id === car.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCars.map(car => (
                      <div
                        key={car.id}
                        onClick={() => handleSelectCar(car)}
                        className="glass-card rounded-2xl p-4 cursor-pointer transition-all flex flex-col md:flex-row gap-6 items-center"
                      >
                        <img
                          src={car.images[0]}
                          alt={car.title}
                          referrerPolicy="no-referrer"
                          className="w-full md:w-56 h-36 object-cover rounded-xl shrink-0 border border-white/10"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                            <span className="text-red-400 uppercase tracking-wide">{car.brand}</span>
                            <span>•</span>
                            <span>{car.year}</span>
                            <span>•</span>
                            <span>{car.ownerCount}</span>
                          </div>
                          <h3 className="text-lg font-black text-white">{car.title}</h3>
                          <p className="text-xs text-slate-300 font-medium line-clamp-2">{car.description}</p>
                          <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-bold text-slate-200">
                            <span className="glass-pill px-2.5 py-1 rounded-lg">{car.kilometers.toLocaleString('en-IN')} km</span>
                            <span className="glass-pill px-2.5 py-1 rounded-lg">{car.fuelType}</span>
                            <span className="glass-pill px-2.5 py-1 rounded-lg">{car.transmission}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-400 block font-semibold">Offered Price</span>
                          <span className="text-2xl font-black text-amber-400 text-glow-amber">₹ {car.price.toFixed(2)} Lakh</span>
                          <button className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl block w-full text-center shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-red-400/30">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            }
          />

          {/* Single Car Details Route */}
          <Route
            path="/inventory/:id"
            element={
              <CarDetailsRoute
                cars={cars}
                onSelectCar={handleSelectCar}
                onOpenExchangeModal={handleOpenExchangeForCar}
              />
            }
          />

          {/* Exchange Route */}
          <Route
            path="/exchange"
            element={
              <ExchangeForm
                targetCar={exchangeTargetCar}
                onSuccess={() => setExchangeTargetCar(null)}
              />
            }
          />

          {/* Buy & Sell Route */}
          <Route
            path="/buy-sell"
            element={
              <BuySellView
                setActiveTab={tab => navigate(`/${tab === 'home' ? '' : tab}`)}
                onOpenExchangeModal={() => handleOpenExchangeForCar()}
              />
            }
          />

          {/* About Route */}
          <Route path="/about" element={<AboutView />} />

          {/* Contact Route */}
          <Route path="/contact" element={<ContactView />} />

          {/* Compare Route */}
          <Route
            path="/compare"
            element={
              <CompareView
                cars={compareCars}
                onBack={() => navigate('/inventory')}
                onSelectCar={handleSelectCar}
                onRemove={id => setCompareCars(prev => prev.filter(c => c.id !== id))}
              />
            }
          />

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              isAdminLoggedIn ? (
                <AdminDashboard
                  cars={cars}
                  setCars={setCars}
                  leads={leads}
                  setLeads={setLeads}
                  exchangeRequests={exchangeRequests}
                  setExchangeRequests={setExchangeRequests}
                  onLogout={() => { clearAuthToken(); setIsAdminLoggedIn(false); }}
                />
              ) : (
                <AdminLoginModal
                  onLoginSuccess={() => setIsAdminLoggedIn(true)}
                  onCancel={() => navigate('/')}
                />
              )
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  </main>

      {/* Quick View Modal */}
      <QuickViewModal
        car={quickViewCar}
        onClose={() => setQuickViewCar(null)}
        onFullDetails={car => handleSelectCar(car)}
        onExchangeSelect={car => handleOpenExchangeForCar(car)}
      />

      {/* Floating WhatsApp Action Button - hidden on admin */}
      {!location.pathname.startsWith('/admin') && <WhatsAppButton />}

      {/* Compare Bar - shown when cars are selected for comparison */}
      {!location.pathname.startsWith('/admin') && (
        <CompareBar
          compareCars={compareCars}
          onRemove={id => setCompareCars(prev => prev.filter(c => c.id !== id))}
          onCompare={() => navigate('/compare')}
          onClear={() => setCompareCars([])}
        />
      )}

      {/* Footer - hidden on admin */}
      {!location.pathname.startsWith('/admin') && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainAppContent />
    </BrowserRouter>
  );
}
