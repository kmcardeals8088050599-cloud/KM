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
      <label className="block text-slate-700 font-bold">{label}</label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, idx) => (
            <div key={url} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-red-500 hover:bg-red-50/50 transition-colors text-slate-600 font-bold">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Add Photos ({images.length}/{maxImages})</span>
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
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[11px] font-semibold space-y-0.5">
          {errors.map((err, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
