import { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
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
  const [locationError, setLocationError] = useState<string | null>(null);
  const [confirmSelectionOpen, setConfirmSelectionOpen] = useState(false);

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

  const focusOnPosition = useCallback((lat: number, lng: number, zoom = 17, duration = 1.2) => {
    if (!leafletMapRef.current) return;
    leafletMapRef.current.flyTo([lat, lng], zoom, { duration });
  }, []);

  const applyPosition = useCallback((lat: number, lng: number, zoom = 17, duration = 1.2) => {
    const L = (window as any).L;
    setPosition({ lat, lng });
    setLocationError(null);
    setConfirmSelectionOpen(false);
    if (leafletMapRef.current && L) {
      focusOnPosition(lat, lng, zoom, duration);
      placeMarker(L, leafletMapRef.current, lat, lng);
    }
  }, [focusOnPosition, placeMarker]);

  const resolveLocationError = useCallback((error: unknown) => {
    const message = String(
      (error as { message?: string; code?: string | number })?.message
      ?? (error as { code?: string | number })?.code
      ?? error
      ?? ''
    ).toLowerCase();

    if (message.includes('permission') || message.includes('denied') || message.includes('not authorized')) {
      return t('mapPicker.locationPermissionDenied');
    }
    if (
      message.includes('disabled')
      || message.includes('unavailable')
      || message.includes('location services')
      || message.includes('position unavailable')
      || message.includes('service')
    ) {
      return t('mapPicker.locationDisabled');
    }
    if (message.includes('timeout')) {
      return t('mapPicker.locationTimeout');
    }
    return t('mapPicker.locationFetchFailed');
  }, [t]);

  const getBrowserPosition = useCallback(() => new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('LOCATION_UNAVAILABLE'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({ lat: coords.latitude, lng: coords.longitude });
      },
      reject,
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    );
  }), []);

  const getNativePosition = useCallback(async () => {
    const permissions = await Geolocation.checkPermissions();
    const hasPermission = permissions.location === 'granted' || permissions.coarseLocation === 'granted';

    if (!hasPermission) {
      const requested = await Geolocation.requestPermissions();
      const granted = requested.location === 'granted' || requested.coarseLocation === 'granted';
      if (!granted) {
        throw new Error('LOCATION_PERMISSION_DENIED');
      }
    }

    const result = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });

    return {
      lat: result.coords.latitude,
      lng: result.coords.longitude,
    };
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
      applyPosition(lat, lng, 17, 0.6);
    });
    leafletMapRef.current = map;
    setTimeout(() => { map.invalidateSize(true); setMapReady(true); }, 200);
  }, [applyPosition, initialLat, initialLng, placeMarker]);

  useEffect(() => {
    const isLeafletReady = (L: any) => {
      // Leaflet async yuklanayotganda `window.L` mavjud bo‘lib, ichki constructorlar hali tayyor bo‘lmasligi mumkin.
      // Shuning uchun `map`/`tileLayer`/`marker` borligini tekshiramiz.
      return (
        !!L &&
        typeof L.map === 'function' &&
        typeof L.tileLayer === 'function' &&
        typeof L.marker === 'function'
      );
    };

    const loadLeaflet = () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      const win = window as any;
      if (isLeafletReady(win.L)) { initMap(); return; }
      if (document.getElementById('leaflet-js')) {
        const timer = setInterval(() => {
          const L = (window as any).L;
          if (isLeafletReady(L)) { clearInterval(timer); initMap(); }
        }, 80);
        return;
      }
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        const L = (window as any).L;
        if (isLeafletReady(L)) initMap();
      };
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
        applyPosition(lat, lng, 17, 1);
      }
    } catch { /* ignore */ }
    finally { setSearching(false); }
  };

  const handleMyLocation = useCallback(async () => {
    setLocating(true);
    setLocationError(null);
    try {
      const nextPosition = Capacitor.isNativePlatform()
        ? await getNativePosition()
        : await getBrowserPosition();
      applyPosition(nextPosition.lat, nextPosition.lng);
    } catch (error) {
      setLocationError(resolveLocationError(error));
      setConfirmSelectionOpen(false);
      focusOnPosition(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, 14, 1);
    } finally {
      setLocating(false);
    }
  }, [applyPosition, focusOnPosition, getBrowserPosition, getNativePosition, resolveLocationError]);

  const handleOpenConfirm = () => {
    if (!position) return;
    setConfirmSelectionOpen(true);
  };

  // Picker ochilganda (initial coords bo'lmasa) avtomatik GPS olish.
  useEffect(() => {
    if (!mapReady) return;
    if (autoLocateAttemptedRef.current) return;
    if (initialLat != null && initialLng != null) return;
    if (position) return;
    autoLocateAttemptedRef.current = true;
    void handleMyLocation();
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
        {locationError && (
          <div className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 shrink-0">
            <p className="text-xs text-red-600 dark:text-red-300 text-center">{locationError}</p>
          </div>
        )}
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
          <button onClick={handleOpenConfirm} disabled={!position} className="w-full py-3.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-blue-200 mb-2">
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
        {confirmSelectionOpen && position && (
          <div className="absolute inset-0 z-[10001] bg-black/45 flex items-end justify-center p-3" onClick={() => setConfirmSelectionOpen(false)}>
            <div className="w-full rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl p-4" onClick={e => e.stopPropagation()}>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('mapPicker.recheckTitle')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('mapPicker.recheckDescription')}</p>
              <div className="mt-3 rounded-xl border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-2">
                <p className="text-xs font-mono text-blue-700 dark:text-blue-300">
                  {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setConfirmSelectionOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium text-sm"
                >
                  {t('mapPicker.recheckCancel')}
                </button>
                <button
                  onClick={() => onConfirm(position.lat, position.lng)}
                  className="flex-1 py-3 rounded-xl bg-[#2563EB] text-white font-semibold text-sm"
                >
                  {t('mapPicker.recheckConfirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
