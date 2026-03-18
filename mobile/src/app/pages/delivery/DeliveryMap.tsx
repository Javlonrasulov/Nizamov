import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { MapPin, Navigation, Phone, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';

export const DeliveryMap = () => {
  const { id } = useParams<{ id: string }>();
  const { t, orders, clients } = useApp();
  const navigate = useNavigate();

  const order = orders.find(o => o.id === id);
  const client = clients.find(c => c.id === order?.clientId);

  // Koordinatalar: klient GPS > Toshkent markazi fallback
  const lat = client?.lat ?? order?.clientLat ?? 41.2995;
  const lng = client?.lng ?? order?.clientLng ?? 69.2401;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const initCalledRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  const buildIcon = (L: any) =>
    L.divIcon({
      className: '',
      html: `<div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          width:48px;height:48px;border-radius:50%;
          background:#2563EB;border:4px solid white;
          box-shadow:0 4px 16px rgba(37,99,235,0.45);
          display:flex;align-items:center;justify-content:center;
        ">
          <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='white'>
            <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/>
          </svg>
        </div>
        <div style="width:2px;height:8px;background:#2563EB;margin-top:-2px;"></div>
      </div>`,
      iconSize: [48, 60],
      iconAnchor: [24, 60],
      popupAnchor: [0, -64],
    });

  useEffect(() => {
    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current || initCalledRef.current) return;
      initCalledRef.current = true;

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      // Zoom control bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);

      // Attribution — top right, minimal
      L.control.attribution({ position: 'topright', prefix: false }).addTo(map);

      // Marker with popup
      const icon = buildIcon(L);
      const marker = L.marker([lat, lng], { icon }).addTo(map);

      const popupContent = `
        <div style="min-width:160px;padding:4px 2px;">
          <div style="font-weight:700;font-size:13px;color:#111827;margin-bottom:2px;">${order?.clientName || t('orders.client')}</div>
          <div style="font-size:11px;color:#6b7280;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${order?.clientAddress || ''}</div>
        </div>
      `;
      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'delivery-map-popup',
        offset: [0, -8],
      }).openPopup();

      markerRef.current = marker;
      leafletMapRef.current = map;

      setTimeout(() => {
        map.invalidateSize(true);
        setMapReady(true);
      }, 200);
    };

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Add popup style
    if (!document.getElementById('delivery-map-popup-style')) {
      const style = document.createElement('style');
      style.id = 'delivery-map-popup-style';
      style.textContent = `
        .delivery-map-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.13);
          border: none;
          padding: 0;
        }
        .delivery-map-popup .leaflet-popup-content {
          margin: 10px 14px;
        }
        .delivery-map-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `;
      document.head.appendChild(style);
    }

    const win = window as any;
    if (win.L) {
      initMap();
    } else if (document.getElementById('leaflet-js')) {
      const timer = setInterval(() => {
        if ((window as any).L) { clearInterval(timer); initMap(); }
      }, 80);
    } else {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
        initCalledRef.current = false;
        setMapReady(false);
      }
    };
  }, [lat, lng]);

  const openInMaps = () => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  if (!order) {
    return (
      <MobileShell>
        <MobileHeader title={t('delivery.mapView')} showBack showLang />
        <MobileContent className="flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-gray-700 dark:text-gray-200 font-semibold">{t('orders.notFoundTitle')}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('orders.notFoundText')}</p>
          </div>
        </MobileContent>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <MobileHeader title={t('delivery.mapView')} showBack showLang />
      <MobileContent className="pb-20">
        {/* ── Leaflet Map ── */}
        <div className="relative" style={{ height: 340 }}>
          <div ref={mapContainerRef} className="absolute inset-0 z-0" />

          {/* Loading overlay */}
          {!mapReady && (
            <div className="absolute inset-0 bg-blue-50 dark:bg-gray-800 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
              </div>
            </div>
          )}

          {/* Coordinates badge */}
          {mapReady && (
            <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-gray-800/95 rounded-xl px-3 py-1.5 text-xs font-mono text-gray-600 dark:text-gray-300 shadow border border-gray-200 dark:border-gray-600 pointer-events-none">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </div>
          )}
        </div>

        {/* ── Info & Actions ── */}
        <div className="p-4 space-y-3">
          {/* Client info card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              {t('delivery.clientLocation')}
            </p>
            <p className="font-bold text-gray-900 dark:text-white text-base mb-2">{order.clientName}</p>
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
              <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <span>{order.clientAddress}</span>
            </div>
            <a
              href={`tel:${order.clientPhone}`}
              className="flex items-center gap-2 text-sm text-[#2563EB] dark:text-blue-400 hover:underline"
            >
              <Phone size={14} />
              {order.clientPhone}
            </a>
          </div>

          {/* Start Route button */}
          <button
            onClick={openInMaps}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
          >
            <Navigation size={18} />
            {t('delivery.startRoute')}
            <ExternalLink size={14} />
          </button>

          {/* Back button */}
          <button
            onClick={() => navigate(`/delivery/${id}`)}
            className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('common.back')}
          </button>
        </div>
      </MobileContent>
      <MobileNav role="delivery" />
    </MobileShell>
  );
};
