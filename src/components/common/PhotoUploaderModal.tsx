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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel max-w-2xl w-full rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
              <Camera className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Upload Official Photos</h3>
              <p className="text-xs text-slate-300">Upload exact high-res photographs for Md Nawaz Khan &amp; Team</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-red-600 flex items-center justify-center transition-all border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-extrabold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Photo Options List */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {photoOptions.map((opt) => {
            const hasCustom = !!currentPhotos[opt.key];
            return (
              <div
                key={opt.key}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  selectedKey === opt.key
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-lg'
                    : 'glass-card border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-white/20 shrink-0 relative">
                    {hasCustom ? (
                      <img
                        src={currentPhotos[opt.key]}
                        alt={opt.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    {hasCustom && (
                      <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-slate-950" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{opt.label}</span>
                      {hasCustom && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                          Custom Uploaded
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">{opt.description}</p>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <label className="cursor-pointer px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:scale-105">
                    <Upload className="w-4 h-4" />
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
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          <button
            onClick={handleResetAll}
            className="text-slate-400 hover:text-red-400 font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All to Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl border border-white/20 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
