// Local Photo Storage Manager for Custom Uploaded Photos

export interface CustomPhotos {
  nawazPortrait?: string;
  nawazSunglasses?: string;
  executiveTeam?: string;
  storefrontYard?: string;
  showroomInterior?: string;
}

const STORAGE_KEY = 'km_car_deals_custom_photos';

export const getCustomPhotos = (): CustomPhotos => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load custom photos from localStorage', e);
  }
  return {};
};

export const saveCustomPhoto = (key: keyof CustomPhotos, dataUrl: string): CustomPhotos => {
  try {
    const current = getCustomPhotos();
    const updated = { ...current, [key]: dataUrl };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Trigger custom window event so all components update in real-time
    window.dispatchEvent(new Event('km_photos_updated'));
    return updated;
  } catch (e) {
    console.error('Failed to save photo to localStorage', e);
    return getCustomPhotos();
  }
};

export const resetCustomPhotos = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('km_photos_updated'));
  } catch (e) {
    console.error('Failed to reset photos', e);
  }
};
