import React from 'react';
import { Car } from '../../types';
import { X, BarChart2 } from 'lucide-react';

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
    <div className="fixed bottom-0 left-0 right-0 z-40 mobile-sticky-cta px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="max-w-7xl mx-auto flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <BarChart2 className="w-4 h-4 text-amber-600" strokeWidth={1.75} />
          <span className="text-xs font-medium text-slate-900">
            <span className="hidden sm:inline">Compare </span>{compareCars.length}/3
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-1 overflow-x-auto">
          {compareCars.map(car => (
            <div key={car.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 shrink-0">
              <img src={car.images[0]} alt="" className="w-8 h-6 object-cover rounded-md" referrerPolicy="no-referrer" />
              <span className="text-[11px] font-medium text-slate-900 truncate max-w-[110px] md:max-w-[160px]">{car.title}</span>
              <button
                onClick={() => onRemove(car.id)}
                className="text-slate-400 hover:text-slate-900 ml-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          ))}

        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="hidden sm:inline text-xs text-slate-500 hover:text-slate-900 px-3 py-1.5"
          >
            Clear
          </button>
          <button
            onClick={onCompare}
            disabled={compareCars.length < 2}
            className="btn-accent-apple !px-4 !py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Compare {compareCars.length >= 2 ? `(${compareCars.length})` : '(min 2)'}
          </button>
        </div>
      </div>
    </div>
  );
};
