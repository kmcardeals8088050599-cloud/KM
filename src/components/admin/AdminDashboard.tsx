import React, { useState, useEffect } from 'react';
import { KmLogo } from '../common/KmLogo';
import { ImageUploader } from '../common/ImageUploader';
import { AIOpsPanel } from './AIOpsPanel';
import { Car, Lead, ExchangeRequest, CarStatus, LeadStatus, ExchangeStatus, FuelType, Transmission, BodyType } from '../../types';
import { INDIAN_CAR_BRANDS } from '../inventory/InventoryFilter';
import {
  LogOut,
  Car as CarIcon,
  Users,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  MessageCircle,
  Phone,
  X,
  TrendingUp,
  Bell,
  Send,
  Bot
} from 'lucide-react';
import {
  createCarApi,
  updateCarApi,
  deleteCarApi,
  updateLeadStatusApi,
  updateExchangeStatusApi,
  createWhatsAppLink,
  fetchAdminCars,
  fetchAdminLeads,
  fetchAdminExchanges,
  clearAuthToken,
  getAuthToken
} from '../../lib/api';

interface AdminDashboardProps {
  cars: Car[];
  setCars: React.Dispatch<React.SetStateAction<Car[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  exchangeRequests: ExchangeRequest[];
  setExchangeRequests: React.Dispatch<React.SetStateAction<ExchangeRequest[]>>;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  cars,
  setCars,
  leads,
  setLeads,
  exchangeRequests,
  setExchangeRequests,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'leads' | 'exchanges' | 'aiops'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data on mount with auth
  useEffect(() => {
    async function loadData() {
      try {
        const [carsData, leadsData, exchangesData] = await Promise.all([
          fetchAdminCars(),
          fetchAdminLeads(),
          fetchAdminExchanges()
        ]);
        setCars(carsData);
        setLeads(leadsData);
        setExchangeRequests(exchangesData);
      } catch (err: any) {
        if (err.message?.includes('401') || err.message?.includes('Unauthorized') || err.message?.includes('Invalid or expired token')) {
          clearAuthToken();
          onLogout();
          return;
        }
        setError('Failed to load admin data: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Add/Edit Car Modal State
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Hyundai');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2022);
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [transmission, setTransmission] = useState<Transmission>('Manual');
  const [bodyType, setBodyType] = useState<BodyType>('SUV');
  const [status, setStatus] = useState<CarStatus>('Available');
  const [images, setImages] = useState<string[]>(['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200']);
  const [rtoStr, setRtoStr] = useState('KA-32 (Kalaburagi)');
  const [saveError, setSaveError] = useState('');

  // Open Modal for Create or Edit
  const handleOpenCarModal = (car?: Car) => {
    setSaveError('');
    if (car) {
      setEditingCarId(car.id);
      setTitle(car.title);
      setBrand(car.brand);
      setModel(car.model);
      setYear(car.year);
      setFuelType(car.fuelType);
      setTransmission(car.transmission);
      setBodyType(car.bodyType);
      setStatus(car.status);
      setImages(car.images.length > 0 ? car.images : []);
      setRtoStr(car.specs?.rto || 'KA-32 (Kalaburagi)');
    } else {
      setEditingCarId(null);
      setTitle('');
      setBrand('Hyundai');
      setModel('');
      setYear(2022);
      setFuelType('Petrol');
      setTransmission('Manual');
      setBodyType('SUV');
      setStatus('Available');
      setImages(['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200']);
      setRtoStr('KA-32 (Kalaburagi)');
    }
    setCarModalOpen(true);
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !brand || !model) return;
    setSaveError('');

    const specs = { rto: rtoStr };

    try {
      if (editingCarId) {
        const updatedData = {
          title, brand, model,
          year, fuelType, transmission, bodyType,
          status, images, specs
        };
        const updatedCar = await updateCarApi(editingCarId, updatedData);
        setCars(prev => prev.map(c => (c.id === editingCarId ? updatedCar : c)));
      } else {
        const newCarData = {
          title, brand, model,
          year, fuelType, transmission, bodyType,
          status, images, specs,
          ownerCount: '1st Owner'
        };
        const created = await createCarApi(newCarData);
        setCars(prev => [created, ...prev]);
      }
      setCarModalOpen(false);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save car. Please try again.');
    }
  };

  // Toggle Car Status
  const handleToggleCarStatus = async (carId: string, newStatus: CarStatus) => {
    setCars(prev => prev.map(c => (c.id === carId ? { ...c, status: newStatus } : c)));
    await updateCarApi(carId, { status: newStatus });
  };

  // Delete Car
  const handleDeleteCar = async (carId: string) => {
    if (confirm('Are you sure you want to delete this car listing?')) {
      setCars(prev => prev.filter(c => c.id !== carId));
      await deleteCarApi(carId);
    }
  };

  // Update Lead Status
  const handleUpdateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status: newStatus } : l)));
    await updateLeadStatusApi(leadId, newStatus);
  };

  // Update Exchange Status
  const handleUpdateExchangeStatus = async (exId: string, newStatus: ExchangeStatus) => {
    setExchangeRequests(prev => prev.map(ex => (ex.id === exId ? { ...ex, status: newStatus } : ex)));
    await updateExchangeStatusApi(exId, newStatus);
  };

  // AI Description Generator
  const handleGenerateDescription = async () => {
    if (!brand || !model) return;
    setAiGenerating(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ brand, model, year, fuelType, transmission, bodyType })
      });
      const data = await res.json();
    } catch { /* silent */ } finally {
      setAiGenerating(false);
    }
  };

  // Stats Counters
  const availableCarsCount = cars.filter(c => c.status === 'Available').length;
  const soldCarsCount = cars.filter(c => c.status === 'Sold').length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;
  const newExchangesCount = exchangeRequests.filter(ex => ex.status === 'New').length;

  // Admin car list filters
  const [adminRtoFilter, setAdminRtoFilter] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('All');

  const filteredAdminCars = cars.filter(car => {
    const rtoMatch = adminRtoFilter === '' || car.specs?.rto?.toLowerCase().includes(adminRtoFilter.toLowerCase());
    const statusMatch = adminStatusFilter === 'All' || car.status === adminStatusFilter;
    return rtoMatch && statusMatch;
  });

  const [activeTab2, setActiveTab2] = useState<'overview' | 'cars' | 'leads' | 'exchanges' | 'alerts'>('overview');

  // Daily report
  const [reportLoading, setReportLoading] = useState(false);
  const [reportResult, setReportResult] = useState<string | null>(null);

  const handleDailyReport = async () => {
    setReportLoading(true);
    setReportResult(null);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/daily-report', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setReportResult(data.message || 'Report sent!');
    } catch { setReportResult('Failed to generate report.'); }
    finally { setReportLoading(false); }
  };

  // AI description generator state
  const [aiGenerating, setAiGenerating] = useState(false);

  if (loading) {
    return (
      <div className="py-24 px-4 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 px-4 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button
            onClick={() => { clearAuthToken(); onLogout(); }}
            className="btn-primary-apple focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  const navItems: { key: typeof activeTab; label: string; shortLabel: string; icon: React.ReactNode; count?: number; badge?: number }[] = [
    { key: 'overview', label: 'Overview & Stats', shortLabel: 'Overview', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: 'cars', label: `Cars Inventory (${cars.length})`, shortLabel: `Cars (${cars.length})`, icon: <CarIcon className="w-3.5 h-3.5" /> },
    { key: 'leads', label: `Customer Leads (${leads.length})`, shortLabel: `Leads (${leads.length})`, icon: <Users className="w-3.5 h-3.5" />, badge: newLeadsCount },
    { key: 'exchanges', label: `Exchange Requests (${exchangeRequests.length})`, shortLabel: `Exchanges (${exchangeRequests.length})`, icon: <RefreshCw className="w-3.5 h-3.5" />, badge: newExchangesCount },
    { key: 'aiops', label: 'AI Operations', shortLabel: 'AI Ops', icon: <Bot className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="py-20 sm:py-24 bg-slate-50 min-h-screen text-slate-800">
      <div className="apple-container space-y-6 sm:space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-2xl executive-card">
          <div className="flex items-center gap-4">
            <KmLogo variant="dark" size="lg" />
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Admin Portal</span>
              <p className="text-xs text-slate-500 mt-1 hidden sm:block">Manage vehicle inventory, customer leads, and exchange requests</p>
            </div>
          </div>

          <button
            onClick={() => { clearAuthToken(); onLogout(); }}
            className="btn-secondary-apple text-xs flex items-center gap-2 w-fit min-h-[44px] self-end sm:self-auto focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold swipe-row">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`swipe-item px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none ${
                activeTab === item.key ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
              {!!item.badge && item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-white font-bold rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={() => setActiveTab2('alerts')}
            className={`swipe-item px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none ${
              activeTab2 === 'alerts' && activeTab !== 'overview' && activeTab !== 'cars' && activeTab !== 'leads' && activeTab !== 'exchanges'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts &amp; Reports</span>
          </button>
        </div>

        {/* Tab Content: AI OPERATIONS */}
        {activeTab === 'aiops' && <AIOpsPanel />}

        {/* Tab Content: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl executive-card flex flex-col justify-between">
                <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">Total Inventory</span>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">{cars.length} <span className="text-base font-semibold text-slate-400">Cars</span></div>
                <div className="text-[11px] text-emerald-700 mt-2 font-semibold">{availableCarsCount} Available in Showroom</div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl executive-card flex flex-col justify-between">
                <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">Sold Cars</span>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">{soldCarsCount} <span className="text-base font-semibold text-slate-400">Cars</span></div>
                <div className="text-[11px] text-slate-500 mt-2 font-medium">Delivered to Kalaburagi Buyers</div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl executive-card flex flex-col justify-between">
                <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">Inquiries &amp; Leads</span>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">{leads.length} <span className="text-base font-semibold text-slate-400">Leads</span></div>
                <div className="text-[11px] text-amber-700 mt-2 font-semibold">{newLeadsCount} Pending Review</div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl executive-card flex flex-col justify-between">
                <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">Exchange Trade-Ins</span>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700 mt-2">{exchangeRequests.length} <span className="text-base font-semibold text-slate-400">Submitted</span></div>
                <div className="text-[11px] text-emerald-700 mt-2 font-semibold">{newExchangesCount} New Trade-In Requests</div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white rounded-2xl executive-card p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Quick Management Actions</h3>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <button
                  onClick={() => handleOpenCarModal()}
                  className="btn-accent-apple text-xs flex items-center justify-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Car Listing</span>
                </button>

                <button
                  onClick={() => setActiveTab('leads')}
                  className="btn-secondary-apple text-xs flex items-center justify-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                >
                  <Users className="w-3.5 h-3.5 text-amber-700" />
                  <span>View Customer Leads ({newLeadsCount} New)</span>
                </button>

                <button
                  onClick={() => setActiveTab('exchanges')}
                  className="btn-secondary-apple text-xs flex items-center justify-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                  <span>View Vehicle Exchanges ({newExchangesCount} New)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: CARS MANAGEMENT */}
        {activeTab === 'cars' && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Car Inventory Catalog</h2>
              <button
                onClick={() => handleOpenCarModal()}
                className="btn-accent-apple text-xs flex items-center justify-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Vehicle</span>
              </button>
            </div>

            {/* Admin Filter Bar */}
            <div className="bg-white executive-card rounded-2xl p-4 flex flex-wrap gap-3 text-xs">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Filter by RTO</label>
                <input
                  type="text"
                  placeholder="Search RTO code..."
                  value={adminRtoFilter}
                  onChange={e => setAdminRtoFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 min-h-[44px] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 transition-colors duration-300"
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Filter by Status</label>
                <select
                  value={adminStatusFilter}
                  onChange={e => setAdminStatusFilter(e.target.value)}
                  className="select-plain w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 min-h-[44px] text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 transition-colors duration-300"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => { setAdminRtoFilter('All'); setAdminStatusFilter('All'); }}
                  className="btn-secondary-apple btn-sm text-xs focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                >
                  Reset
                </button>
              </div>
              <div className="flex items-end ml-auto">
                <span className="text-[11px] text-slate-500 font-semibold">
                  Showing <strong className="text-slate-900 font-bold">{filteredAdminCars.length}</strong> of {cars.length} cars
                </span>
              </div>
            </div>

            {/* Cars Table — desktop */}
            <div className="hidden md:block bg-white executive-card rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wide border-b border-slate-100">
                  <tr>
                    <th className="p-4">Car Details</th>
                    <th className="p-4">Year</th>
                    <th className="p-4">RTO</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdminCars.map(car => (
                    <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={car.images[0]} alt="" className="w-14 h-10 object-cover rounded-lg shrink-0 border border-slate-100" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{car.title}</p>
                          <p className="text-[10px] text-slate-500">{car.brand} • {car.year} • {car.fuelType} • {car.transmission}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800">{car.year}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-600 text-[11px]">{car.specs?.rto || '—'}</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={car.status}
                          onChange={e => handleToggleCarStatus(car.id, e.target.value as CarStatus)}
                          className={`select-plain px-2.5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 transition-colors duration-300 ${
                            car.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-700'
                              : car.status === 'Reserved'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <option value="Available">Available</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold">Sold</option>
                        </select>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenCarModal(car)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                          title="Edit Car"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCar(car.id)}
                          className="p-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                          title="Delete Car"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cars list — mobile stacked cards */}
            <div className="md:hidden space-y-3">
              {filteredAdminCars.map(car => (
                <div key={car.id} className="bg-white executive-card rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={car.images[0]} alt="" className="w-20 h-14 object-cover rounded-lg shrink-0 border border-slate-100" referrerPolicy="no-referrer" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 line-clamp-1 text-sm">{car.title}</p>
                      <p className="text-[11px] text-slate-500">{car.brand} • {car.year} • {car.fuelType} • {car.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-600">RTO: {car.specs?.rto || '—'}</span>
                    <select
                      value={car.status}
                      onChange={e => handleToggleCarStatus(car.id, e.target.value as CarStatus)}
                      className={`select-plain px-2.5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 transition-colors duration-300 ${
                        car.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-700'
                          : car.status === 'Reserved'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenCarModal(car)}
                      className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCar(car.id)}
                      className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold rounded-xl transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: LEADS */}
        {activeTab === 'leads' && (
          <div className="space-y-5 sm:space-y-6">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Customer Inquiries &amp; Test Drive Leads</h2>

            {/* Desktop table */}
            <div className="hidden md:block bg-white executive-card rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wide border-b border-slate-100">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Car Requested</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map(lead => {
                    const waUrl = createWhatsAppLink(lead.phone, `Hi ${lead.name}, this is KM Car Deals regarding your inquiry for ${lead.carTitle || 'pre-owned vehicles'}.`);
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{lead.name}</td>
                        <td className="p-4 font-semibold text-slate-600">{lead.phone}</td>
                        <td className="p-4 text-slate-700">{lead.carTitle || 'General Showroom Inquiry'}</td>
                        <td className="p-4 text-slate-500 max-w-xs truncate">{lead.message}</td>
                        <td className="p-4">
                          <select
                            value={lead.status}
                            onChange={e => handleUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                            className="select-plain bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 transition-colors duration-300"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Test Drive Scheduled">Test Drive Scheduled</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg inline-flex items-center transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg inline-flex items-center transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked cards */}
            <div className="md:hidden space-y-3">
              {leads.map(lead => {
                const waUrl = createWhatsAppLink(lead.phone, `Hi ${lead.name}, this is KM Car Deals regarding your inquiry for ${lead.carTitle || 'pre-owned vehicles'}.`);
                return (
                  <div key={lead.id} className="bg-white executive-card rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{lead.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{lead.phone}</p>
                      </div>
                      <select
                        value={lead.status}
                        onChange={e => handleUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                        className="select-plain bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 transition-colors duration-300"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Test Drive Scheduled">Test Drive Scheduled</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1 bg-slate-50 rounded-xl p-3">
                      <p><span className="text-slate-400 font-semibold">Car: </span>{lead.carTitle || 'General Showroom Inquiry'}</p>
                      {lead.message && <p className="text-slate-500">{lead.message}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content: EXCHANGE REQUESTS */}
        {activeTab === 'exchanges' && (
          <div className="space-y-5 sm:space-y-6">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Vehicle Exchange Submissions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {exchangeRequests.map(ex => {
                const waText = `Hi ${ex.customerName}, this is KM Car Deals regarding your vehicle exchange request for your ${ex.currentBrand} ${ex.currentModel} (${ex.currentYear}). We have reviewed your request.`;
                const waUrl = createWhatsAppLink(ex.phone, waText);

                return (
                  <div key={ex.id} className="bg-white executive-card rounded-2xl p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{ex.customerName}</h3>
                        <p className="text-xs text-slate-500">{ex.phone}</p>
                      </div>

                      <select
                        value={ex.status}
                        onChange={e => handleUpdateExchangeStatus(ex.id, e.target.value as ExchangeStatus)}
                        className="select-plain bg-slate-50 border border-slate-200 text-amber-800 font-semibold rounded-lg px-2 py-1.5 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 transition-colors duration-300"
                      >
                        <option value="New">New</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Trade-In Vehicle:</span>
                        <span className="font-bold text-slate-900 text-right">{ex.currentBrand} {ex.currentModel} ({ex.currentYear})</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Kilometers &amp; Fuel:</span>
                        <span className="font-semibold text-slate-700 text-right">{ex.currentKilometers.toLocaleString('en-IN')} km • {ex.fuelType} {ex.transmission}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Customer Expected Price:</span>
                        <span className="font-bold text-amber-700 text-right">₹ {ex.expectedPrice} Lakhs</span>
                      </div>
                      {ex.targetCarTitle && (
                        <div className="flex justify-between gap-3 pt-1 border-t border-slate-200 text-emerald-700">
                          <span>Target Upgrade Vehicle:</span>
                          <span className="font-bold text-right">{ex.targetCarTitle}</span>
                        </div>
                      )}
                    </div>

                    {ex.images && ex.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {ex.images.map((img, idx) => (
                          <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block aspect-video rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                            <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between gap-3">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary-apple text-xs flex-1 flex items-center justify-center gap-1.5 min-h-[44px]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat Valuation on WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${ex.phone}`}
                        className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tab Content: ALERTS & REPORTS */}
      {activeTab2 === 'alerts' && activeTab !== 'overview' && activeTab !== 'cars' && activeTab !== 'leads' && activeTab !== 'exchanges' && (
        <div className="apple-container space-y-5 sm:space-y-6 mt-6 sm:mt-8">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Alerts &amp; Automated Reports</h2>

          {/* Daily Report */}
          <div className="bg-white executive-card rounded-2xl p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Summary Report</h3>
              <p className="text-[11px] text-slate-500">Sends today's inventory, leads, and exchange stats to admin WhatsApp</p>
            </div>
            <button
              onClick={handleDailyReport}
              disabled={reportLoading}
              className="btn-accent-apple text-xs flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
            >
              <Send className="w-3.5 h-3.5" />
              {reportLoading ? 'Generating...' : 'Send Daily Report Now'}
            </button>
            {reportResult && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl">
                <pre className="text-[10px] text-slate-600 whitespace-pre-wrap">{reportResult}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Car Modal */}
      {carModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 space-y-6 executive-card max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setCarModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {editingCarId ? 'Edit Vehicle Listing' : 'Add New Vehicle Listing'}
            </h2>

            <form onSubmit={handleSaveCar} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1.5">Car Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyundai Creta 1.5 SX (O) Diesel Automatic"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 focus:bg-white transition-colors duration-300"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1.5">Brand *</label>
                  <select
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="select-plain w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 focus:bg-white transition-colors duration-300"
                  >
                    {Object.keys(INDIAN_CAR_BRANDS).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1.5">Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Creta / Thar"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 focus:bg-white transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1.5">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={e => setYear(parseInt(e.target.value) || 2022)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 focus:bg-white transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1.5">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as FuelType)}
                    className="select-plain w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 focus:bg-white transition-colors duration-300"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1.5">Transmission</label>
                  <select
                    value={transmission}
                    onChange={e => setTransmission(e.target.value as Transmission)}
                    className="select-plain w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 focus:bg-white transition-colors duration-300"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1.5">Body Type</label>
                  <input
                    type="text"
                    placeholder="e.g. SUV, Sedan, Hatchback, Luxury"
                    value={bodyType}
                    onChange={e => setBodyType(e.target.value as BodyType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 focus:bg-white transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1.5">Availability</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as CarStatus)}
                    className="select-plain w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 focus:bg-white transition-colors duration-300"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>

              <ImageUploader images={images} onChange={setImages} kind="car" maxImages={15} label="Vehicle Photos (first photo is the cover image)" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1.5">RTO</label>
                  <input
                    type="text"
                    placeholder="e.g. KA-32 (Kalaburagi)"
                    value={rtoStr}
                    onChange={e => setRtoStr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 focus:bg-white transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                {saveError && (
                  <div className="p-3 bg-red-50 rounded-xl text-red-700 text-xs flex items-start gap-2">
                    <span className="shrink-0">⚠</span>
                    <span>{saveError}</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCarModalOpen(false)}
                    className="btn-secondary-apple text-sm min-h-[44px] order-2 sm:order-1 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-accent-apple text-sm min-h-[44px] order-1 sm:order-2 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                  >
                    Save Car Listing
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
