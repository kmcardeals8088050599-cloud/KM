import React from 'react';
import { Car } from '../../types';
import { X, BarChart2, Plus } from 'lucide-react';

interface CompareBarProps {
  compareCars: Car[];
  onRemove: (carId: string) => void;
  onCompare: () => void;
  onClear: () => void;
}

export const CompareBar: React.FC<CompareBarProps> = ({
  compareCars,
  onRemove,
  onCompare,
  onClear
}) => {
  if (compareCars.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <BarChart2 className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Compare</span>
          <span className="text-[10px] bg-amber-600 text-white font-black px-1.5 py-0.5 rounded-full">{compareCars.length}/3</span>
        </div>

        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {compareCars.map(car => (
            <div key={car.id} className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 shrink-0">
              <img src={car.images[0]} alt="" className="w-8 h-6 object-cover rounded-lg" referrerPolicy="no-referrer" />
              <span className="text-[11px] font-bold text-slate-800 truncate max-w-[160px]">{car.title}</span>
              <button
                onClick={() => onRemove(car.id)}
                className="text-slate-400 hover:text-slate-700 ml-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {compareCars.length < 3 && (
            <div className="flex items-center gap-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl px-3 py-1.5 shrink-0">
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400 font-medium">Add car</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5"
          >
            Clear
          </button>
          <button
            onClick={onCompare}
            disabled={compareCars.length < 2}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Compare {compareCars.length >= 2 ? `(${compareCars.length})` : '(min 2)'}
          </button>
        </div>
      </div>
    </div>
  );
};
