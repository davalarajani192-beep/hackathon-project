import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapView({
  center = [17.4300, 78.4500],
  zoom = 12,
  listings = [],
  activeCircle = null, // { lat, lng, radiusKm, label }
  userLocation = null, // { lat, lng, label, role }
  onListingSelect = null,
  selectedListingId = null,
  className = "h-[450px]"
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      });

      // Free OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Draw Active Radius Geofence Circle (e.g. for Donor listing or selected item)
    if (activeCircle && activeCircle.lat && activeCircle.lng) {
      const radiusMeters = (activeCircle.radiusKm || 10) * 1000;
      
      const circle = L.circle([activeCircle.lat, activeCircle.lng], {
        color: '#3E8E6A',
        fillColor: '#3E8E6A',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 6'
      }).addTo(layers);

      circle.bindTooltip(`Geofence Radius: ${activeCircle.radiusKm} km`, {
        permanent: false,
        direction: 'top'
      });
    }

    // 2. Draw User Location Marker (if provided)
    if (userLocation && userLocation.lat && userLocation.lng) {
      const isReceiver = userLocation.role === 'receiver';
      const userIconHtml = `
        <div style="background-color: ${isReceiver ? '#2E86AB' : '#14402F'}; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 3px solid white; font-size: 16px;">
          ${isReceiver ? '📍' : '🏢'}
        </div>
      `;
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: userIconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(layers);
      userMarker.bindPopup(`
        <div style="font-family: Inter, sans-serif; padding: 4px;">
          <strong style="color: ${isReceiver ? '#2E86AB' : '#14402F'}; font-size: 13px;">${userLocation.label || 'Your Location'}</strong>
          <p style="font-size: 11px; margin: 2px 0 0; color: #555;">Role: ${userLocation.role || 'User'}</p>
        </div>
      `);
    }

    // 3. Draw Listings and their Donor Radius
    listings.forEach(item => {
      if (!item.latitude || !item.longitude) return;

      const isSelected = selectedListingId === item.id;
      const isClaimed = item.status === 'Accepted' || item.status === 'Collected' || item.status === 'Verified';
      
      const pinColor = isSelected ? '#F0922B' : isClaimed ? '#2E86AB' : '#3E8E6A';
      
      const markerHtml = `
        <div style="background-color: ${pinColor}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.25); border: 2.5px solid white; font-weight: bold; font-size: 14px; cursor: pointer; transition: transform 0.2s;">
          🍱
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-food-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([item.latitude, item.longitude], { icon }).addTo(layers);

      // Popup details
      const popupContent = `
        <div style="font-family: Inter, sans-serif; min-width: 180px; padding: 4px;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #3E8E6A; background: #EDF3EF; padding: 2px 6px; border-radius: 4px;">
            ${item.category || 'Surplus'}
          </span>
          <h4 style="font-size: 13px; font-weight: 700; color: #14402F; margin: 6px 0 2px;">${item.title}</h4>
          <p style="font-size: 11px; color: #555; margin: 0 0 4px;">${item.quantity} ${item.unit} • Storage: ${item.storage_type}</p>
          <div style="font-size: 10px; color: #666; border-top: 1px solid #eee; padding-top: 4px;">
            Donor: <strong>${item.donor_name || 'Commercial Donor'}</strong>
            <br/>Pickup Radius: <strong>${item.pickup_radius_km || 10} km</strong>
            <br/>Status: <strong style="color: ${pinColor}">${item.status}</strong>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);

      if (onListingSelect) {
        marker.on('click', () => onListingSelect(item));
      }

      // If selected or hovered, show the donor's radius circle
      if (isSelected && item.pickup_radius_km) {
        L.circle([item.latitude, item.longitude], {
          color: '#F0922B',
          fillColor: '#F0922B',
          fillOpacity: 0.12,
          weight: 2,
        }).addTo(layers);
      }
    });

  }, [listings, activeCircle, userLocation, selectedListingId]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-[#3E8E6A]/20 shadow-soft bg-white ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" />
      
      {/* Legend Badge */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-gray-100 text-[11px] space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#3E8E6A]" />
          <span className="text-gray-700 font-medium">Available Surplus</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#2E86AB]" />
          <span className="text-gray-700 font-medium">Claimed / Receiver</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F0922B]" />
          <span className="text-gray-700 font-medium">Selected / Urgency</span>
        </div>
      </div>
    </div>
  );
}
