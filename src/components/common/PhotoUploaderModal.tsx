import React, { useState } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle2, X, Image as ImageIcon } from 'lucide-react';
import { saveCustomPhoto, resetCustomPhotos, getCustomPhotos, CustomPhotos } from '../../utils/photoStorage';

interface PhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetKey?: keyof CustomPhotos;
  targetTitle?: string;
}

export const PhotoUploaderModal: React.FC<PhotoUploaderModalProps> = ({
  isOpen,
  onClose,
  targetKey,
  targetTitle
}) => {
  const [selectedKey, setSelectedKey] = useState<keyof CustomPhotos>(targetKey || 'nawazPortrait');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [currentPhotos, setCurrentPhotos] = useState<CustomPhotos>(getCustomPhotos());

  if (!isOpen) return null;

  const photoOptions: { key: keyof CustomPhotos; label: string; description: string }[] = [
    {
      key: 'nawazPortrait',
      label: 'Md Nawaz Khan - Formal Portrait',
      description: 'Official executive portrait'
    },
    {
      key: 'nawazSunglasses',
      label: 'Md Nawaz Khan - Sunglasses Edition',
      description: 'Executive portrait with sunglasses'
    },
    {
      key: 'executiveTeam',
      label: 'KM Car Deals 5-Member Executive Team',
      description: 'Official 5-member team photograph'
    },
    {
      key: 'storefrontYard',
      label: 'Storefront Yard & Main Banner',
      description: 'Showroom exterior & outdoor display yard'
    },
    {
      key: 'showroomInterior',
      label: 'Showroom Interior & Luxury Car Lounge',
      description: 'Indoor display featuring luxury models'
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, keyToSave: keyof CustomPhotos) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        saveCustomPhoto(keyToSave, dataUrl);
        setCurrentPhotos(getCustomPhotos());
        setStatusMsg(`Successfully updated photo for ${keyToSave}!`);
        setTimeout(() => setStatusMsg(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAll = () => {
    resetCustomPhotos();
    setCurrentPhotos({});
    setStatusMsg('Reset all photos to defaults.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-sm">
      {/* Mobile: bottom-sheet. Desktop: centered modal */}
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-2xl relative p-6 sm:p-8 space-y-6 bottom-sheet sm:static sm:max-h-none animate-sheet-up sm:animate-none">
        <div className="bottom-sheet-handle sm:hidden" />
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3.5">
            <Camera className="w-6 h-6 text-amber-600 shrink-0" strokeWidth={1.5} />
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upload Official Photos</h3>
              <p className="text-sm text-slate-500">Upload exact high-res photographs for Md Nawaz Khan &amp; Team</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors duration-300 shrink-0 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
          >
            <X className="w-4.5 h-4.5" strokeWidth={1.75} />
          </button>
        </div>

        {statusMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Photo Options List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {photoOptions.map((opt) => {
            const hasCustom = !!currentPhotos[opt.key];
            return (
              <div
                key={opt.key}
                className={`p-4 rounded-2xl border transition-colors duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  selectedKey === opt.key
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                    {hasCustom ? (
                      <img
                        src={currentPhotos[opt.key]}
                        alt={opt.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <ImageIcon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                    )}
                    {hasCustom && (
                      <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-white" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <span>{opt.label}</span>
                      {hasCustom && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                          Custom Uploaded
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <label className="cursor-pointer px-4 py-2.5 min-h-[36px] bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-full transition-colors duration-300 flex items-center justify-center gap-2 focus-within:ring-2 focus-within:ring-slate-900/20">
                    <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>{hasCustom ? 'Replace Photo' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, opt.key)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="pt-5 border-t border-slate-200 flex items-center justify-between text-sm">
          <button
            onClick={handleResetAll}
            className="text-slate-400 hover:text-slate-700 font-medium flex items-center gap-1.5 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none rounded-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Reset all to defaults</span>
          </button>

          <button
            onClick={onClose}
            className="btn-secondary-apple focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
