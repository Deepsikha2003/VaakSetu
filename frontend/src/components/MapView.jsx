import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

export default function MapView({ data }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const lat = data?.nlp?.entities?.lat || 12.9716
  const lng = data?.nlp?.entities?.lng || 77.5946
  const location = data?.nlp?.entities?.location || 'Bengaluru'
  const utcsLevel = data?.utcs?.level || 'MINIMAL'

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then(L => {
      if (!mapRef.current) return

      // Create map if not exists
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([lat, lng], 14)

        // Dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(mapInstanceRef.current)

        L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current)
      }

      // Update view
      mapInstanceRef.current.setView([lat, lng], 14, { animate: true })

      // Remove old marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current)
      }

      // Color based on UTCS
      const colors = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e', MINIMAL: '#3b82f6' }
      const color = colors[utcsLevel] || '#3b82f6'

      // Custom pulsing marker
      const pulseIcon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:40px;height:40px">
          <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.15;animation:mapPulse 2s infinite"></div>
          <div style="position:absolute;top:8px;left:8px;width:24px;height:24px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 0 12px ${color}"></div>
        </div>
        <style>@keyframes mapPulse{0%,100%{transform:scale(1);opacity:.15}50%{transform:scale(2);opacity:0}}</style>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })

      markerRef.current = L.marker([lat, lng], { icon: pulseIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<div style="font-family:Inter,sans-serif;font-size:13px;padding:4px">
          <strong>${location}</strong><br/>
          <span style="color:${color};font-weight:700">${utcsLevel}</span> — UTCS: ${data?.utcs?.score || 0}<br/>
          <span style="color:#888;font-size:11px">${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</span>
        </div>`)
        .openPopup()
    })

    return () => {
      // Cleanup on unmount
    }
  }, [lat, lng, utcsLevel, location])

  // Cleanup map on full unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="map-container">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      <div className="map-overlay">
        📍 <strong>{location}</strong> — {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
      </div>
    </div>
  )
}
