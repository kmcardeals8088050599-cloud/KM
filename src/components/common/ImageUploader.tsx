import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { uploadImages } from '../../lib/upload';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  kind: 'car' | 'exchange';
  maxImages?: number;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  kind,
  maxImages = 15,
  label = 'Photos'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    e.target.value = '';

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setErrors([`You can only add up to ${maxImages} photos`]);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    setUploading(true);
    setErrors([]);

    const outcomes = await uploadImages(filesToUpload, kind);
    const successUrls = outcomes.filter(o => o.url).map(o => o.url as string);
    const failMessages = outcomes.filter(o => o.error).map(o => `${o.file.name}: ${o.error}`);

    if (successUrls.length > 0) {
      onChange([...images, ...successUrls]);
    }
    setErrors(failMessages);
    setUploading(false);
  };

  const handleRemove = (url: string) => {
    onChange(images.filter(img => img !== url));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-slate-700 font-semibold">{label}</label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {images.map((url, idx) => (
            <div key={url} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
              <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-slate-900 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <label className="flex items-center justify-center gap-2 p-5 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors duration-300 text-slate-500 text-sm font-medium focus-within:ring-2 focus-within:ring-slate-900/20">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.75} />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" strokeWidth={1.75} />
              <span>Add photos ({images.length}/{maxImages})</span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={handleFilesSelected}
            className="hidden"
          />
        </label>
      )}

      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
