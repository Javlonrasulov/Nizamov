import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Check, X, Search, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

const DEFAULT_CENTER = { lat: 40.0840, lng: 65.3792 };

export const MapPicker = ({ initialLat, initialLng, onConfirm, onClose }: MapPickerProps) => {
  const { t } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const initCalledRef = useRef(false);
  const autoLocateAttemptedRef = useRef(false);

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const getIcon = (L: any) =>
    L.divIcon({
      className: '',
      html: `<div style="width:28px;height:40px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#2563EB"/>
          <circle cx="14" cy="14" r="6" fill="white"/>
        </svg>
      </div>`,
      iconSize: [28, 40],
      iconAnchor: [14, 40],
    });

  const placeMarker = useCallback((L: any, map: any, lat: number, lng: number) => {
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    else markerRef.current = L.marker([lat, lng], { icon: getIcon(L) }).addTo(map);
  }, []);

  const initMap = useCallback(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current || initCalledRef.current) return;
    initCalledRef.current = true;
    const center = (initialLat != null && initialLng != null)
      ? [initialLat, initialLng]
      : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];
    const map = L.map(mapContainerRef.current, { center, zoom: 14, zoomControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    if (initialLat != null && initialLng != null) placeMarker(L, map, initialLat, initialLng);
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      placeMarker(L, map, lat, lng);
    });
    leafletMapRef.current = map;
    setTimeout(() => { map.invalidateSize(true); setMapReady(true); }, 200);
  }, [initialLat, initialLng, placeMarker]);

  useEffect(() => {
    const loadLeaflet = () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      const win = window as any;
      if (win.L) { initMap(); return; }
      if (document.getElementById('leaflet-js')) {
        const timer = setInterval(() => { if ((window as any).L) { clearInterval(timer); initMap(); } }, 80);
        return;
      }
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    };
    const t = setTimeout(loadLeaflet, 80);
    return () => {
      clearTimeout(t);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
        initCalledRef.current = false;
      }
    };
  }, [initMap]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ' Uzbekistan')}&format=json&limit=1&countrycodes=uz`);
      const data = await res.json();
      if (data?.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const L = (window as any).L;
        setPosition({ lat, lng });
        if (leafletMapRef.current && L) { leafletMapRef.current.flyTo([lat, lng], 17, { duration: 1 }); placeMarker(L, leafletMapRef.current, lat, lng); }
      }
    } catch { /* ignore */ }
    finally { setSearching(false); }
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        setPosition({ lat, lng });
        setLocating(false);
        const L = (window as any).L;
        if (leafletMapRef.current && L) { leafletMapRef.current.flyTo([lat, lng], 17, { duration: 1.2 }); placeMarker(L, leafletMapRef.current, lat, lng); }
      },
      () => {
        setLocating(false);
        // GPS muvaffaqiyatsiz bo'lsa ham marker ko'rinib tursin
        const lat = DEFAULT_CENTER.lat;
        const lng = DEFAULT_CENTER.lng;
        setPosition({ lat, lng });
        const L = (window as any).L;
        if (leafletMapRef.current && L) {
          leafletMapRef.current.flyTo([lat, lng], 14, { duration: 1 });
          placeMarker(L, leafletMapRef.current, lat, lng);
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Picker ochilganda (initial coords bo'lmasa) avtomatik GPS olish.
  useEffect(() => {
    if (!mapReady) return;
    if (autoLocateAttemptedRef.current) return;
    if (initialLat != null && initialLng != null) return;
    if (position) return;
    autoLocateAttemptedRef.current = true;
    handleMyLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-[430px] bg-white dark:bg-gray-800 rounded-t-3xl flex flex-col" style={{ height: '88vh', maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-[#2563EB]" />
            <span className="font-semibold text-gray-900 dark:text-white">{t('mapPicker.title')}</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={t('mapPicker.searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB] placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="h-10 w-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
            >
              {searching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={15} />}
            </button>
            <button
              onClick={handleMyLocation}
              disabled={locating}
              title={t('mapPicker.myLocation')}
              className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors shrink-0"
            >
              {locating ? <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" /> : <Navigation size={15} className="text-[#2563EB]" />}
            </button>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 shrink-0">
          <p className="text-xs text-blue-600 dark:text-blue-400 text-center">{t('mapPicker.hintPickOnMap')}</p>
        </div>
        <div className="relative flex-1 min-h-0">
          <div ref={mapContainerRef} className="absolute inset-0" />
          {!mapReady && (
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center z-[1000]">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('mapPicker.mapLoading')}</p>
              </div>
            </div>
          )}
          {position && (
            <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-gray-800/95 rounded-xl px-3 py-1.5 text-xs font-mono text-gray-700 dark:text-gray-300 shadow border border-gray-200 dark:border-gray-600 pointer-events-none">
              📍 {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            </div>
          )}
        </div>
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <button onClick={() => position && onConfirm(position.lat, position.lng)} disabled={!position} className="w-full py-3.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-blue-200 mb-2">
            <Check size={16} />
            {position ? t('mapPicker.confirmLocation') : t('mapPicker.selectLocation')}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
