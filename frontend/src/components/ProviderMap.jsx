import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const createCustomMarker = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker-wrapper',
    html: `
      <div style="
        background: linear-gradient(135deg, #8b5cf6, #14b8a6);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        cursor: pointer;
      ">
        <span style="color: white; font-size: 14px; line-height: 1;">🛠️</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function ProviderMap({ providers = [], center = [13.0827, 80.2707], zoom = 11, height = "350px" }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 text-xs" style={{ height }}>
        Loading OpenStreetMap...
      </div>
    );
  }

  const mapCenter = providers.length > 0 && providers[0].lat && providers[0].lng
    ? [providers[0].lat, providers[0].lng]
    : center;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {providers.map((p) => {
          if (!p.lat || !p.lng) return null;
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={createCustomMarker()}
            >
              <Popup>
                <div className="p-1 space-y-1 text-slate-900 font-sans">
                  <div className="font-bold text-xs">{p.provider_name}</div>
                  <div className="text-[11px] text-purple-700 font-semibold">{p.category_name}</div>
                  <div className="text-[11px] font-mono text-slate-700">₹{p.hourly_rate}/hr • {p.location}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
