import { useEffect, useRef } from 'react'

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY
const AMAP_SECURITY_KEY = import.meta.env.VITE_AMAP_SECURITY_KEY

// Ferrari map: dark cinematic center section, white pill overlays with near-zero radius
export default function MapView({ selectedDay, onPoiClick }) {
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const polylinesRef = useRef([])
  const readyRef = useRef(false)

  useEffect(() => {
    if (readyRef.current) return
    function initMap() {
      if (readyRef.current) return
      readyRef.current = true
      mapRef.current = new window.AMap.Map('amap-container', {
        zoom: 6, center: [86.0, 45.5],
        mapStyle: 'amap://styles/dark',
      })
    }
    if (window.AMap) { initMap(); return }
    window._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY_KEY }
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&callback=__onAmapReady`
    script.async = true
    window.__onAmapReady = () => { delete window.__onAmapReady; initMap() }
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!selectedDay) return
    const timer = setInterval(() => {
      if (!mapRef.current) return
      clearInterval(timer)
      renderDay(selectedDay)
    }, 100)
    return () => clearInterval(timer)
  }, [selectedDay])

  function renderDay(day) {
    polylinesRef.current.forEach(p => p.setMap(null)); polylinesRef.current = []
    markersRef.current.forEach(m => m.setMap(null)); markersRef.current = []

    if (day.route?.length >= 2) {
      const polyline = new window.AMap.Polyline({
        path: day.route.map(c => new window.AMap.LngLat(c[0], c[1])),
        strokeColor: '#DA291C',
        strokeWeight: 3,
        strokeOpacity: 0.9,
        lineJoin: 'round',
      })
      polyline.setMap(mapRef.current)
      polylinesRef.current.push(polyline)
    }

    const iconMap = { scenic: '🏔️', hotel: '🏨', gas: '⛽', food: '🍜', custom: '📍' }
    day.pois.forEach(poi => {
      const icon = iconMap[poi.type] || '📍'
      // Ferrari: white sharp-cornered marker (2px radius)
      const marker = new window.AMap.Marker({
        position: new window.AMap.LngLat(poi.coords[0], poi.coords[1]),
        content: `<div style="
          background: #FFFFFF;
          border-radius: 2px;
          padding: 4px 10px;
          font-size: 11px;
          font-family: 'Barlow Condensed', Arial, sans-serif;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: #181818;
          white-space: nowrap;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: rgb(0,0,0) 0px 0px 0px 1px;
        ">${icon} ${poi.name}</div>`,
        offset: new window.AMap.Pixel(-40, -16),
      })
      marker.on('click', () => onPoiClick?.(poi))
      marker.setMap(mapRef.current)
      markersRef.current.push(marker)
    })

    if (markersRef.current.length > 0) {
      mapRef.current.setFitView(markersRef.current, false, [60, 60, 60, 60])
    }
  }

  return (
    <div style={{ flex: 1, position: 'relative', background: '#000000' }}>
      <div id="amap-container" style={{ position: 'absolute', inset: 0 }} />

      {/* Ferrari: top center day indicator — white bar */}
      {selectedDay && (
        <div style={{
          position: 'absolute', top: 16, left: '50%',
          transform: 'translateX(-50%)', zIndex: 10,
          background: '#FFFFFF',
          borderRadius: 2,
          padding: '8px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: 'var(--ferrari-sans)',
          boxShadow: 'rgb(0,0,0) 0px 0px 0px 1px',
          pointerEvents: 'none',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: selectedDay.color, display: 'inline-block', flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#181818', letterSpacing: '0.13px' }}>
            {selectedDay.title}
          </span>
          {selectedDay.distance > 0 && (
            <>
              <span style={{ width: 1, height: 14, background: '#D2D2D2', display: 'inline-block' }} />
              <span style={{
                fontFamily: 'var(--body-font)',
                fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
                color: '#8F8F8F',
              }}>
                {selectedDay.distance} KM
              </span>
            </>
          )}
        </div>
      )}

      {/* Legend — bottom left, white editorial card style */}
      <div style={{
        position: 'absolute', bottom: 20, left: 16, zIndex: 10,
        background: '#FFFFFF',
        borderRadius: 2,
        padding: '12px 16px',
        boxShadow: 'rgb(0,0,0) 0px 0px 0px 1px',
        fontFamily: 'var(--ferrari-sans)',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: 'var(--body-font)',
          fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
          color: '#8F8F8F', marginBottom: 8,
        }}>
          Legend
        </div>
        {[['🏔️','景点'],['🏨','住宿'],['⛽','加油站'],['🍜','餐厅']].map(([ic, lb]) => (
          <div key={lb} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 11, color: '#181818', marginBottom: 4, fontWeight: 500,
          }}>
            <span>{ic}</span><span>{lb}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
