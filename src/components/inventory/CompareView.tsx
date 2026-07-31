import React from 'react';
import { Car } from '../../types';
import { ArrowLeft, MessageCircle, Phone } from 'lucide-react';
import { createWhatsAppLink } from '../../lib/api';
import { DEALERSHIP_INFO } from '../../data/mockData';

interface CompareViewProps {
  cars: Car[];
  onBack: () => void;
  onSelectCar: (car: Car) => void;
  onRemove: (carId: string) => void;
}

const Row: React.FC<{ label: string; values: (string | number | undefined | null)[] }> = ({ label, values }) => (
  <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
    <td className="py-3 px-4 text-[11px] font-black text-slate-500 uppercase tracking-wider w-32 shrink-0 bg-slate-50 border-r border-slate-200">
      {label}
    </td>
    {values.map((val, i) => (
      <td key={i} className="py-3 px-4 text-xs font-bold text-slate-900 text-center">
        {val ?? '—'}
      </td>
    ))}
    {Array.from({ length: 3 - values.length }).map((_, i) => (
      <td key={`empty-${i}`} className="py-3 px-4 text-center text-slate-500 text-xs">—</td>
    ))}
  </tr>
);

export const CompareView: React.FC<CompareViewProps> = ({ cars, onBack, onSelectCar }) => {
  return (
    <div className="py-28 px-4 lg:px-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600" />
            Back to Inventory
          </button>
          <h1 className="text-xl font-black text-slate-900">Car Comparison</h1>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${cars.length}, 1fr)` }}>
          <div />
          {cars.map(car => {
            const waMsg = `Hi KM Car Deals, I'm interested in the ${car.year} ${car.title}.`;
            const waUrl = createWhatsAppLink(DEALERSHIP_INFO.whatsappNumber, waMsg);
            return (
              <div key={car.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm text-center">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                  <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 line-clamp-2">{car.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectCar(car)}
                    className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[10px] rounded-lg"
                  >
                    View Details
                  </button>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-lg flex items-center justify-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3 fill-white" />
                    Inquire
                  </a>
                </div>
              </div>
            );
          })}
          {Array.from({ length: 3 - cars.length }).map((_, i) => (
            <div key={i} className="bg-slate-100 border border-dashed border-slate-300 rounded-2xl p-4 flex items-center justify-center">
              <p className="text-xs text-slate-400 font-medium text-center">Add a car to compare</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full text-xs">
            <tbody>
              <tr className="bg-amber-50 border-b border-amber-200">
                <td colSpan={4} className="px-4 py-2 text-[10px] font-black text-amber-800 uppercase tracking-widest">Vehicle Details</td>
              </tr>
              <Row label="Brand" values={cars.map(c => c.brand)} />
              <Row label="Model" values={cars.map(c => c.model)} />
              <Row label="Year" values={cars.map(c => c.year)} />
              <Row label="Body Type" values={cars.map(c => c.bodyType)} />
              <Row label="Fuel Type" values={cars.map(c => c.fuelType)} />
              <Row label="Transmission" values={cars.map(c => c.transmission)} />
              <Row label="RTO" values={cars.map(c => c.specs.rto || '—')} />
              <Row label="Status" values={cars.map(c => c.status)} />
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-4">
          {cars.map(car => (
            <a
              key={car.id}
              href={`tel:+918123991847`}
              className="flex-1 min-w-[200px] py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Inquire: {car.title.split(' ').slice(0, 2).join(' ')}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
