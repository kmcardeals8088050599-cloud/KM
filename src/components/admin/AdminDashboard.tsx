import React, { useState, useEffect } from 'react';
import { KmLogo } from '../common/KmLogo';
import { ImageUploader } from '../common/ImageUploader';
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
  Send
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
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'leads' | 'exchanges'>('overview');
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
          status, images, specs
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
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 px-4 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3 max-w-md">
          <p className="text-sm font-bold text-red-600">{error}</p>
          <button
            onClick={() => { clearAuthToken(); onLogout(); }}
            className="px-5 py-2.5 bg-red-600 text-white font-bold text-xs rounded-xl"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 px-4 lg:px-8 bg-slate-50 min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center gap-4">
            <KmLogo variant="dark" size="lg" />
            <div className="border-l border-slate-200 pl-4">
              <span className="text-xs font-black bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md uppercase">ADMIN PORTAL</span>
              <p className="text-xs text-slate-500 font-medium mt-1">Manage vehicle inventory, customer leads, and exchange requests</p>
            </div>
          </div>

          <button
            onClick={() => { clearAuthToken(); onLogout(); }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-2 transition-colors w-fit shadow-xs"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'overview' ? 'bg-red-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview &amp; Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('cars')}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'cars' ? 'bg-red-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CarIcon className="w-4 h-4" />
            <span>Cars Inventory ({cars.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'leads' ? 'bg-red-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Leads ({leads.length})</span>
            {newLeadsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-white font-black rounded-full">
                {newLeadsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('exchanges')}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'exchanges' ? 'bg-red-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Exchange Requests ({exchangeRequests.length})</span>
            {newExchangesCount > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-white font-black rounded-full">
                {newExchangesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab2('alerts')}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab2 === 'alerts' && activeTab !== 'overview' && activeTab !== 'cars' && activeTab !== 'leads' && activeTab !== 'exchanges'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts &amp; Reports</span>
          </button>
        </div>

        {/* Tab Content: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
                <span className="text-xs text-slate-500 font-bold uppercase">Total Inventory</span>
                <div className="text-3xl font-black text-slate-900 mt-2">{cars.length} Cars</div>
                <div className="text-[11px] text-emerald-700 mt-2 font-bold">{availableCarsCount} Available in Showroom</div>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
                <span className="text-xs text-slate-500 font-bold uppercase">Sold Cars</span>
                <div className="text-3xl font-black text-amber-700 mt-2">{soldCarsCount} Cars</div>
                <div className="text-[11px] text-slate-500 mt-2 font-semibold">Delivered to Kalaburagi Buyers</div>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
                <span className="text-xs text-slate-500 font-bold uppercase">Inquiries &amp; Leads</span>
                <div className="text-3xl font-black text-slate-900 mt-2">{leads.length} Leads</div>
                <div className="text-[11px] text-amber-700 mt-2 font-bold">{newLeadsCount} Pending Review</div>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
                <span className="text-xs text-slate-500 font-bold uppercase">Exchange Trade-Ins</span>
                <div className="text-3xl font-black text-emerald-700 mt-2">{exchangeRequests.length} Submitted</div>
                <div className="text-[11px] text-emerald-800 mt-2 font-bold">{newExchangesCount} New Trade-In Requests</div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Quick Management Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handleOpenCarModal()}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Car Listing</span>
                </button>

                <button
                  onClick={() => setActiveTab('leads')}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>View Customer Leads ({newLeadsCount} New)</span>
                </button>

                <button
                  onClick={() => setActiveTab('exchanges')}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-700" />
                  <span>View Vehicle Exchanges ({newExchangesCount} New)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: CARS MANAGEMENT */}
        {activeTab === 'cars' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-black text-slate-900">Car Inventory Catalog</h2>
              <button
                onClick={() => handleOpenCarModal()}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Vehicle</span>
              </button>
            </div>

            {/* Admin Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-3 text-xs shadow-xs">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Filter by RTO</label>
                <input
                  type="text"
                  placeholder="Search RTO code..."
                  value={adminRtoFilter}
                  onChange={e => setAdminRtoFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-bold focus:outline-none focus:border-red-500 min-w-[200px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Filter by Status</label>
                <select
                  value={adminStatusFilter}
                  onChange={e => setAdminStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-bold focus:outline-none focus:border-red-500"
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
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 text-xs"
                >
                  Reset
                </button>
              </div>
              <div className="flex items-end ml-auto">
                <span className="text-[11px] text-slate-500 font-bold">
                  Showing <strong className="text-slate-900">{filteredAdminCars.length}</strong> of {cars.length} cars
                </span>
              </div>
            </div>

            {/* Cars Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Car Details</th>
                    <th className="p-4">Year</th>
                    <th className="p-4">RTO</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAdminCars.map(car => (
                    <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={car.images[0]} alt="" className="w-14 h-10 object-cover rounded-lg shrink-0 border border-slate-200" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-extrabold text-slate-900 line-clamp-1">{car.title}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{car.brand} • {car.year} • {car.fuelType} • {car.transmission}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-slate-900">{car.year}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 text-[11px]">{car.specs?.rto || '—'}</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={car.status}
                          onChange={e => handleToggleCarStatus(car.id, e.target.value as CarStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border focus:outline-none ${
                            car.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : car.status === 'Reserved'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-red-50 text-red-800 border-red-300'
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
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300"
                          title="Edit Car"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCar(car.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white rounded-lg border border-red-200"
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
          </div>
        )}

        {/* Tab Content: LEADS */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900">Customer Inquiries &amp; Test Drive Leads</h2>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Car Requested</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leads.map(lead => {
                    const waUrl = createWhatsAppLink(lead.phone, `Hi ${lead.name}, this is KM Car Deals regarding your inquiry for ${lead.carTitle || 'pre-owned vehicles'}.`);
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-extrabold text-slate-900">{lead.name}</td>
                        <td className="p-4 font-bold text-slate-700">{lead.phone}</td>
                        <td className="p-4 text-slate-800 font-semibold">{lead.carTitle || 'General Showroom Inquiry'}</td>
                        <td className="p-4 text-slate-500 max-w-xs truncate">{lead.message}</td>
                        <td className="p-4">
                          <select
                            value={lead.status}
                            onChange={e => handleUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                            className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-slate-900 font-extrabold focus:outline-none focus:border-red-600"
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
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg inline-flex items-center"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          </a>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 inline-flex items-center"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5 text-red-600" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: EXCHANGE REQUESTS */}
        {activeTab === 'exchanges' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900">Vehicle Exchange Submissions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exchangeRequests.map(ex => {
                const waText = `Hi ${ex.customerName}, this is KM Car Deals regarding your vehicle exchange request for your ${ex.currentBrand} ${ex.currentModel} (${ex.currentYear}). We have reviewed your request.`;
                const waUrl = createWhatsAppLink(ex.phone, waText);

                return (
                  <div key={ex.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">{ex.customerName}</h3>
                        <p className="text-xs text-slate-500 font-semibold">{ex.phone}</p>
                      </div>

                      <select
                        value={ex.status}
                        onChange={e => handleUpdateExchangeStatus(ex.id, e.target.value as ExchangeStatus)}
                        className="bg-slate-50 border border-slate-300 text-amber-900 font-extrabold rounded-lg p-1.5 text-xs focus:outline-none"
                      >
                        <option value="New">New</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Trade-In Vehicle:</span>
                        <span className="font-extrabold text-slate-900">{ex.currentBrand} {ex.currentModel} ({ex.currentYear})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Kilometers &amp; Fuel:</span>
                        <span className="font-bold text-slate-700">{ex.currentKilometers.toLocaleString('en-IN')} km • {ex.fuelType} {ex.transmission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Customer Expected Price:</span>
                        <span className="font-extrabold text-amber-800">₹ {ex.expectedPrice} Lakhs</span>
                      </div>
                      {ex.targetCarTitle && (
                        <div className="flex justify-between pt-1 border-t border-slate-200 text-emerald-800">
                          <span className="font-medium">Target Upgrade Vehicle:</span>
                          <span className="font-extrabold">{ex.targetCarTitle}</span>
                        </div>
                      )}
                    </div>

                    {ex.images && ex.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {ex.images.map((img, idx) => (
                          <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                            <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>Chat Valuation on WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${ex.phone}`}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-300"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4 text-red-600" />
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
        <div className="space-y-6">
          <h2 className="text-lg font-black text-slate-900">Alerts &amp; Automated Reports</h2>

          {/* Daily Report */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <Send className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-black text-slate-900">Daily Summary Report</h3>
                <p className="text-[11px] text-slate-500 font-medium">Sends today's inventory, leads, and exchange stats to admin WhatsApp</p>
              </div>
            </div>
            <button
              onClick={handleDailyReport}
              disabled={reportLoading}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {reportLoading ? 'Generating...' : 'Send Daily Report Now'}
            </button>
            {reportResult && (
              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <pre className="text-[10px] text-slate-700 font-medium whitespace-pre-wrap">{reportResult}</pre>
              </div>
            )}
          </div>


        </div>
      )}

      {/* Add / Edit Car Modal */}
      {carModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCarModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-extrabold text-slate-900">
              {editingCarId ? 'Edit Vehicle Listing' : 'Add New Vehicle Listing'}
            </h2>

            <form onSubmit={handleSaveCar} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Car Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyundai Creta 1.5 SX (O) Diesel Automatic"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Brand *</label>
                  <select
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:bg-white"
                  >
                    {Object.keys(INDIAN_CAR_BRANDS).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Creta / Thar"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={e => setYear(parseInt(e.target.value) || 2022)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as FuelType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:bg-white"
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
                  <label className="block text-slate-700 font-bold mb-1">Transmission</label>
                  <select
                    value={transmission}
                    onChange={e => setTransmission(e.target.value as Transmission)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:bg-white"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Body Type</label>
                  <input
                    type="text"
                    placeholder="e.g. SUV, Sedan, Hatchback, Luxury"
                    value={bodyType}
                    onChange={e => setBodyType(e.target.value as BodyType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Availability</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as CarStatus)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:bg-white"
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
                  <label className="block text-slate-700 font-bold mb-1">RTO</label>
                  <input
                    type="text"
                    placeholder="e.g. KA-32 (Kalaburagi)"
                    value={rtoStr}
                    onChange={e => setRtoStr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
                {saveError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-start gap-2">
                    <span className="shrink-0">⚠</span>
                    <span>{saveError}</span>
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCarModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-xs"
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
