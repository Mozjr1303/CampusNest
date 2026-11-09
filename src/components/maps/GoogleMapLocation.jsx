// src/components/maps/GoogleMapLocation.jsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default marker icon in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Malawi university campus coordinates reference
export const MALAWI_UNIVERSITY_COORDINATES = {
  unima: { name: 'UNIMA (Zomba)', lat: -15.3875, lng: 35.3340, zoom: 15 },
  must: { name: 'MUST (Thyolo)', lat: -15.9320, lng: 35.1850, zoom: 15 },
  kuhes: { name: 'KUHeS (Blantyre)', lat: -15.7990, lng: 35.0330, zoom: 15 },
  mubas: { name: 'MUBAS (Blantyre)', lat: -15.8120, lng: 35.0450, zoom: 15 },
  luanar: { name: 'LUANAR (Lilongwe)', lat: -14.1795, lng: 33.7720, zoom: 15 },
  mzuni: { name: 'MZUNI (Mzuzu)', lat: -11.4340, lng: 34.0060, zoom: 15 },
  dmi: { name: 'DMI (Mangochi)', lat: -14.4780, lng: 35.2640, zoom: 15 },
};

const DEFAULT_CENTER = { lat: -15.3875, lng: 35.3340 }; // UNIMA Zomba default

// Custom styled pin marker for CampusNest
const createPinIcon = (isDraggable = false) => {
  return L.divIcon({
    className: 'campusnest-map-marker',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;cursor:${isDraggable ? 'grab' : 'pointer'};">
        <span class="material-symbols-outlined" style="font-size:36px;color:#dc2626;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));line-height:1;">
          location_on
        </span>
        <div style="width:8px;height:4px;background:rgba(0,0,0,0.3);border-radius:50%;margin-top:-4px;"></div>
      </div>
    `,
    iconSize: [36, 40],
    iconAnchor: [18, 38],
    popupAnchor: [0, -38],
  });
};

export default function GoogleMapLocation({
  mode = 'view', // 'view' for student accommodation page, 'picker' for landlord form
  latitude,
  longitude,
  title = 'Student Accommodation',
  area = '',
  onChangeLocation, // (lat, lng) => void for picker mode
  height = '360px',
  universityId,
}) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState(() => {
    const lat = latitude != null && !isNaN(Number(latitude)) ? Number(latitude) : null;
    const lng = longitude != null && !isNaN(Number(longitude)) ? Number(longitude) : null;
    return { lat, lng };
  });

  // Keep local coords in sync when props change
  useEffect(() => {
    if (latitude != null && longitude != null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
      setCoords({ lat: Number(latitude), lng: Number(longitude) });
    }
  }, [latitude, longitude]);

  const hasCoords = coords.lat != null && coords.lng != null;

  // Initialize Leaflet OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid double initialization
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const initialLat = coords.lat ?? (universityId && MALAWI_UNIVERSITY_COORDINATES[universityId]?.lat) ?? DEFAULT_CENTER.lat;
    const initialLng = coords.lng ?? (universityId && MALAWI_UNIVERSITY_COORDINATES[universityId]?.lng) ?? DEFAULT_CENTER.lng;
    const initialZoom = hasCoords ? 15 : 13;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: mode === 'picker',
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    leafletMapRef.current = map;

    // Add marker if coordinates exist
    if (hasCoords) {
      const marker = L.marker([coords.lat, coords.lng], {
        icon: createPinIcon(mode === 'picker'),
        draggable: mode === 'picker',
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px;">
          <strong style="font-size: 13px; color: #111;">${title}</strong><br/>
          <span style="color: #4b5563;">${area || 'University Area'}</span>
        </div>
      `);

      if (mode === 'picker') {
        marker.on('dragend', (e) => {
          const latLng = e.target.getLatLng();
          const newLat = Number(latLng.lat.toFixed(6));
          const newLng = Number(latLng.lng.toFixed(6));
          setCoords({ lat: newLat, lng: newLng });
          onChangeLocation?.(newLat, newLng);
        });
      }

      markerRef.current = marker;
    }

    // In picker mode, clicking anywhere on the map places/moves the pin
    if (mode === 'picker') {
      map.on('click', (e) => {
        const newLat = Number(e.latlng.lat.toFixed(6));
        const newLng = Number(e.latlng.lng.toFixed(6));
        setCoords({ lat: newLat, lng: newLng });
        onChangeLocation?.(newLat, newLng);

        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          const newMarker = L.marker(e.latlng, {
            icon: createPinIcon(true),
            draggable: true,
          }).addTo(map);

          newMarker.on('dragend', (ev) => {
            const dragLatLng = ev.target.getLatLng();
            const dragLat = Number(dragLatLng.lat.toFixed(6));
            const dragLng = Number(dragLatLng.lng.toFixed(6));
            setCoords({ lat: dragLat, lng: dragLng });
            onChangeLocation?.(dragLat, dragLng);
          });

          markerRef.current = newMarker;
        }
      });
    }

    // Leaflet needs invalidateSize after render to size properly
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []); // Run on mount

  // Update marker position dynamically if coordinates change
  useEffect(() => {
    if (!leafletMapRef.current) return;

    if (coords.lat != null && coords.lng != null) {
      const latLng = [coords.lat, coords.lng];
      if (markerRef.current) {
        markerRef.current.setLatLng(latLng);
      } else {
        const marker = L.marker(latLng, {
          icon: createPinIcon(mode === 'picker'),
          draggable: mode === 'picker',
        }).addTo(leafletMapRef.current);

        if (mode === 'picker') {
          marker.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            const newLat = Number(pos.lat.toFixed(6));
            const newLng = Number(pos.lng.toFixed(6));
            setCoords({ lat: newLat, lng: newLng });
            onChangeLocation?.(newLat, newLng);
          });
        }
        markerRef.current = marker;
      }
      leafletMapRef.current.panTo(latLng);
    }
  }, [coords.lat, coords.lng, mode, onChangeLocation]);

  // Jump to campus preset for landlords
  const handleSelectPreset = (key) => {
    const preset = MALAWI_UNIVERSITY_COORDINATES[key];
    if (!preset) return;
    setCoords({ lat: preset.lat, lng: preset.lng });
    onChangeLocation?.(preset.lat, preset.lng);

    if (leafletMapRef.current) {
      leafletMapRef.current.setView([preset.lat, preset.lng], preset.zoom || 15);
    }
  };

  // Manual coordinate input adjustment
  const handleManualCoordChange = (type, val) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const updated = { ...coords, [type]: num };
      setCoords(updated);
      if (updated.lat != null && updated.lng != null) {
        onChangeLocation?.(updated.lat, updated.lng);
        if (leafletMapRef.current) {
          leafletMapRef.current.panTo([updated.lat, updated.lng]);
        }
      }
    } else if (val === '') {
      const updated = { ...coords, [type]: null };
      setCoords(updated);
    }
  };

  // External directions URL: opens turn-by-turn navigation in Google Maps
  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title} ${area} Malawi`)}`;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Search & Preset Bar for Landlords */}
      {mode === 'picker' && (
        <div className="flex flex-col gap-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <span className="font-heading font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">add_location_alt</span>
              <span>Pin Hostel Location (OpenStreetMap)</span>
            </span>
            <span className="text-on-surface-variant text-[11px]">
              Click or tap anywhere on the map to place or drag the pin to your hostel gate.
            </span>
          </div>

          {/* Quick campus presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-on-surface-variant font-medium text-[11px] shrink-0">Jump to Campus:</span>
            {Object.entries(MALAWI_UNIVERSITY_COORDINATES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPreset(key)}
                className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface hover:bg-primary/10 hover:text-primary transition-colors text-[11px] font-medium"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map Viewport Container */}
      <div 
        className="relative w-full rounded-2xl overflow-hidden border border-outline-variant/40 bg-surface-container shadow-xs z-0"
        style={{ height }}
      >
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Floating Badge */}
        <div className="absolute top-2.5 right-2.5 z-[400] flex items-center gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-surface/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-outline-variant/30 shadow-xs text-xs font-heading font-semibold text-primary hover:bg-surface flex items-center gap-1 active:scale-95 transition-transform"
            title="Open in Google Maps"
          >
            <span>Open in Google Maps</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>

        {/* Graceful empty state overlay if coordinates not set in view mode */}
        {mode === 'view' && !hasCoords && (
          <div className="absolute inset-0 z-[400] bg-surface/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-2 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">wrong_location</span>
            </div>
            <p className="text-xs sm:text-sm font-heading font-bold text-on-surface">
              Location coordinates not set for this hostel
            </p>
            <p className="text-[11px] text-on-surface-variant mt-0.5 max-w-xs">
              General area: {area || 'University corridor'}. Exact gate disclosed upon confirmed viewing.
            </p>
          </div>
        )}
      </div>

      {/* Coordinate Readouts / Inputs in Picker Mode */}
      {mode === 'picker' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
          <div>
            <label className="block text-[11px] font-heading font-bold text-on-surface mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. -15.378900"
              value={coords.lat ?? ''}
              onChange={(e) => handleManualCoordChange('lat', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/60 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-[11px] font-heading font-bold text-on-surface mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 35.328900"
              value={coords.lng ?? ''}
              onChange={(e) => handleManualCoordChange('lng', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/60 text-xs font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      )}

      {/* Student View Controls & "Get Directions" Button */}
      {mode === 'view' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
          <div className="flex items-center gap-2 text-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
            <div>
              <span className="font-heading font-bold text-on-surface">
                {hasCoords ? 'Exact Coordinates:' : 'Approximate Area:'}
              </span>{' '}
              <span className="text-on-surface-variant font-mono">
                {hasCoords ? `${coords.lat}, ${coords.lng}` : (area || 'Malawi University Campus')}
              </span>
            </div>
          </div>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-heading font-bold hover:bg-primary-container active:scale-98 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">directions</span>
            <span>Get Directions in Google Maps</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
      )}
    </div>
  );
}
