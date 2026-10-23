import React from 'react';
import { Car } from '../../types';
import { ArrowLeft, MessageCircle } from 'lucide-react';
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
    <td className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wide w-32 shrink-0 bg-slate-50">
      {label}
    </td>
    {values.map((val, i) => (
      <td key={i} className="py-3.5 px-4 text-sm font-semibold text-slate-900 text-center">
        {val ?? '—'}
      </td>
    ))}
    {Array.from({ length: 3 - values.length }).map((_, i) => (
      <td key={`empty-${i}`} className="py-3.5 px-4 text-center text-slate-400 text-sm">—</td>
    ))}
  </tr>
);

export const CompareView: React.FC<CompareViewProps> = ({ cars, onBack, onSelectCar }) => {
  const specRows: { label: string; values: (string | number | undefined | null)[] }[] = [
    { label: 'Brand', values: cars.map(c => c.brand) },
    { label: 'Model', values: cars.map(c => c.model) },
    { label: 'Year', values: cars.map(c => c.year) },
    { label: 'Body Type', values: cars.map(c => c.bodyType) },
    { label: 'Fuel Type', values: cars.map(c => c.fuelType) },
    { label: 'Transmission', values: cars.map(c => c.transmission) },
    { label: 'RTO', values: cars.map(c => c.specs?.rto || '—') },
    { label: 'Status', values: cars.map(c => c.status) },
  ];

  return (
    <div className="pt-8 md:pt-28 pb-16 px-4 lg:px-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Back to Inventory
          </button>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">Car Comparison</h1>
        </div>

        {/* ===== Desktop: side-by-side cards + full spec table ===== */}
        <div className="hidden md:block space-y-8">
          <div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${cars.length}, 1fr)` }}>
            <div />
            {cars.map(car => {
              const waMsg = `Hi KM Car Deals, I'm interested in the ${car.year} ${car.title}.`;
              const waUrl = createWhatsAppLink(DEALERSHIP_INFO.whatsappNumber, waMsg);
              return (
                <div key={car.id} className="executive-card rounded-2xl p-4 space-y-3 text-center">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
                    <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{car.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectCar(car)}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-black text-white font-semibold text-[11px] rounded-full"
                    >
                      View Details
                    </button>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-full flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" strokeWidth={1.75} />
                      Inquire
                    </a>
                  </div>
                </div>
              );
            })}
            {Array.from({ length: 3 - cars.length }).map((_, i) => (
              <div key={i} className="bg-slate-100/60 border border-dashed border-slate-300 rounded-2xl p-4 flex items-center justify-center">
                <p className="text-xs text-slate-400 text-center">Add a car to compare</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-x-auto shadow-premium">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td colSpan={4} className="px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Vehicle Details</td>
                </tr>
                {specRows.map(row => (
                  <Row key={row.label} label={row.label} values={row.values} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== Mobile: swipeable comparison columns, one card per car ===== */}
        <div className="md:hidden swipe-row -mx-4 px-4 gap-4">
          {cars.map(car => {
            const waMsg = `Hi KM Car Deals, I'm interested in the ${car.year} ${car.title}.`;
            const waUrl = createWhatsAppLink(DEALERSHIP_INFO.whatsappNumber, waMsg);
            return (
              <div key={car.id} className="swipe-item w-[86%] mr-4 bg-white border border-slate-200/80 rounded-3xl shadow-premium overflow-hidden">
                <div className="aspect-[4/3] bg-slate-100">
                  <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{car.title}</h3>

                  <div className="divide-y divide-slate-100 border-y border-slate-100">
                    {specRows.map((row, i) => (
                      <div key={row.label} className="flex items-center justify-between py-2 text-xs">
                        <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">{row.label}</span>
                        <span className="font-semibold text-slate-900">{row.values[cars.indexOf(car)] ?? '—'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onSelectCar(car)}
                      className="flex-1 py-2 bg-slate-900 text-white font-semibold text-xs rounded-full"
                    >
                      View Details
                    </button>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-full flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Inquire
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
          {Array.from({ length: 3 - cars.length }).map((_, i) => (
            <div key={i} className="swipe-item w-[86%] mr-4 bg-slate-100/60 border border-dashed border-slate-300 rounded-3xl flex items-center justify-center min-h-[200px]">
              <p className="text-xs text-slate-400 text-center">Add a car to compare</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
