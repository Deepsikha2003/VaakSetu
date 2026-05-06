import { useEffect, useRef, useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'

// Sample call locations for heatmap (Bengaluru area)
const HEATMAP_POINTS = [
  { lat: 12.9716, lng: 77.5946, severity: 0.3, area: 'Majestic' },
  { lat: 12.9352, lng: 77.6245, severity: 0.9, area: 'Koramangala' },
  { lat: 12.9906, lng: 77.5527, severity: 0.4, area: 'Rajajinagar' },
  { lat: 12.9250, lng: 77.5938, severity: 0.8, area: 'Jayanagar' },
  { lat: 13.0358, lng: 77.5970, severity: 0.5, area: 'Yeshwanthpur' },
  { lat: 12.9698, lng: 77.7500, severity: 0.7, area: 'Whitefield' },
  { lat: 12.9141, lng: 77.6411, severity: 0.6, area: 'BTM Layout' },
  { lat: 13.0067, lng: 77.5654, severity: 0.3, area: 'Malleswaram' },
  { lat: 12.9783, lng: 77.6408, severity: 0.85, area: 'Indiranagar' },
  { lat: 12.8438, lng: 77.6713, severity: 0.2, area: 'Electronic City' },
  { lat: 13.0699, lng: 77.5553, severity: 0.4, area: 'Hebbal' },
  { lat: 12.9063, lng: 77.5857, severity: 0.55, area: 'Basavanagudi' },
]

export default function MapPage({ calls }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const heatLayerRef = useRef(null)
  const [showHeat, setShowHeat] = useState(true)
  const [showMarkers, setShowMarkers] = useState(true)

  // Merge call locations with sample data
  const allPoints = useMemo(() => {
    const callPts = calls
      .filter(c => c.nlp?.entities?.lat)
      .map(c => ({
        lat: c.nlp.entities.lat,
        lng: c.nlp.entities.lng,
        severity: Math.min(1, (c.utcs?.score || 0) / 800),
        area: c.nlp.entities.location || 'Unknown',
        call_id: c.call_id,
        utcs: c.utcs,
      }))
    return [...HEATMAP_POINTS, ...callPts]
  }, [calls])

  useEffect(() => {
    import('leaflet').then(L => {
      if (!mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([12.9716, 77.5946], 12)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'topright' }).addTo(map)
      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Draw heat map using circle overlays
  useEffect(() => {
    import('leaflet').then(L => {
      const map = mapInstanceRef.current
      if (!map) return

      // Clear old
      if (heatLayerRef.current) {
        heatLayerRef.current.forEach(c => map.removeLayer(c))
      }
      markersRef.current.forEach(m => map.removeLayer(m))
      markersRef.current = []

      if (showHeat) {
        // Create heat circles
        const circles = allPoints.map(p => {
          const color = p.severity > 0.7 ? '#ff1744' : p.severity > 0.4 ? '#ff6d00' : '#00e676'
          return L.circle([p.lat, p.lng], {
            radius: 400 + p.severity * 600,
            color: 'transparent',
            fillColor: color,
            fillOpacity: 0.15 + p.severity * 0.2,
          }).addTo(map)
        })
        heatLayerRef.current = circles
      }

      if (showMarkers) {
        allPoints.forEach(p => {
          const color = p.severity > 0.7 ? '#ff1744' : p.severity > 0.4 ? '#ff6d00' : '#00e676'
          const icon = L.divIcon({
            className: '',
            html: `<div style="position:relative;width:20px;height:20px">
              <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.3;animation:mapPulse 2s infinite"></div>
              <div style="position:absolute;top:4px;left:4px;width:12px;height:12px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.6);box-shadow:0 0 8px ${color}"></div>
            </div>
            <style>@keyframes mapPulse{0%,100%{transform:scale(1);opacity:.3}50%{transform:scale(2.5);opacity:0}}</style>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })

          const marker = L.marker([p.lat, p.lng], { icon })
            .addTo(map)
            .bindPopup(`<div style="font-family:'IBM Plex Sans',sans-serif;font-size:12px;padding:4px;min-width:160px">
              <strong>${p.area}</strong><br/>
              <span style="color:${color};font-weight:700">${p.call_id ? `UTCS: ${p.utcs?.score || 0}` : `Severity: ${Math.round(p.severity * 100)}%`}</span><br/>
              <span style="color:#888;font-size:10px">${p.lat.toFixed(4)}°N, ${p.lng.toFixed(4)}°E</span>
              ${p.call_id ? `<br/><span style="font-size:10px;color:#40c4ff">${p.call_id}</span>` : ''}
            </div>`)
          markersRef.current.push(marker)
        })
      }
    })
  }, [allPoints, showHeat, showMarkers])

  const critCount = allPoints.filter(p => p.severity > 0.7).length
  const warnCount = allPoints.filter(p => p.severity > 0.4 && p.severity <= 0.7).length
  const safeCount = allPoints.filter(p => p.severity <= 0.4).length

  return (
    <div className="map-page">
      <div className="map-controls">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '2px' }}>MAP VIEW — BENGALURU</span>
        <button className={`nav-btn ${showHeat ? 'active' : ''}`} onClick={() => setShowHeat(!showHeat)} style={{ fontSize: '9px', padding: '4px 10px' }}>
          🔥 HEAT MAP
        </button>
        <button className={`nav-btn ${showMarkers ? 'active' : ''}`} onClick={() => setShowMarkers(!showMarkers)} style={{ fontSize: '9px', padding: '4px 10px' }}>
          📍 MARKERS
        </button>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>
          {allPoints.length} incidents tracked
        </span>
      </div>
      <div className="map-wrapper">
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        <div className="map-legend">
          <div style={{ marginBottom: '6px', color: 'var(--text)', fontWeight: 600 }}>Call Density</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff1744' }}></div>
            <span>Critical ({critCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff6d00' }}></div>
            <span>Elevated ({warnCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e676' }}></div>
            <span>Normal ({safeCount})</span>
          </div>
        </div>
        <div className="map-stats">
          <div style={{ color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>Live Stats</div>
          <div><span style={{ color: 'var(--red)' }}>{critCount}</span> critical zones</div>
          <div><span style={{ color: 'var(--orange)' }}>{warnCount}</span> elevated areas</div>
          <div><span style={{ color: 'var(--green)' }}>{safeCount}</span> normal areas</div>
          <div style={{ marginTop: '4px', color: 'var(--accent)' }}>{allPoints.length} total incidents</div>
        </div>
      </div>
    </div>
  )
}
