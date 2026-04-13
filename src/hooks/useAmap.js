import { useEffect, useRef, useCallback } from 'react'

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY
const AMAP_SECURITY_KEY = import.meta.env.VITE_AMAP_SECURITY_KEY

/**
 * 加载高德地图 JS API（AMap Loader）
 */
export function useAmap({ containerId, onMapReady }) {
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const polylinesRef = useRef([])

  useEffect(() => {
    if (window.AMap) {
      initMap()
      return
    }
    // 安全密钥必须在脚本加载前注入
    window._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY_KEY }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&callback=onAmapLoaded`
    script.async = true
    window.onAmapLoaded = () => {
      delete window.onAmapLoaded
      initMap()
    }
    document.head.appendChild(script)
    return () => {
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
  }, [])

  function initMap() {
    if (mapRef.current) return
    mapRef.current = new window.AMap.Map(containerId, {
      zoom: 7,
      center: [86.0, 45.0], // 北疆中心
      mapStyle: 'amap://styles/dark',
      features: ['bg', 'road', 'building', 'point'],
    })
    onMapReady?.(mapRef.current)
  }

  // 绘制日路线 polyline
  const drawRoute = useCallback((routeCoords, color) => {
    clearPolylines()
    if (!mapRef.current || routeCoords.length < 2) return
    const polyline = new window.AMap.Polyline({
      path: routeCoords.map(c => new window.AMap.LngLat(c[0], c[1])),
      strokeColor: color,
      strokeWeight: 4,
      strokeOpacity: 0.9,
      lineJoin: 'round',
    })
    polyline.setMap(mapRef.current)
    polylinesRef.current.push(polyline)
  }, [])

  // 清除所有 polylines
  const clearPolylines = useCallback(() => {
    polylinesRef.current.forEach(p => p.setMap(null))
    polylinesRef.current = []
  }, [])

  // 绘制 POI markers
  const drawMarkers = useCallback((pois, onMarkerClick) => {
    clearMarkers()
    if (!mapRef.current) return
    pois.forEach(poi => {
      const iconMap = { scenic: '🏔️', hotel: '🏨', gas: '⛽', food: '🍜', custom: '📍' }
      const icon = iconMap[poi.type] || '📍'

      const marker = new window.AMap.Marker({
        position: new window.AMap.LngLat(poi.coords[0], poi.coords[1]),
        content: `<div style="
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 13px;
          color: #e2e8f0;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          gap: 4px;
        ">${icon} ${poi.name}</div>`,
        offset: new window.AMap.Pixel(-40, -16),
      })

      marker.on('click', () => onMarkerClick?.(poi))
      marker.setMap(mapRef.current)
      markersRef.current.push(marker)
    })
  }, [])

  // 清除所有 markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
  }, [])

  // 地图自适应 POI 范围
  const fitBounds = useCallback((coords) => {
    if (!mapRef.current || coords.length === 0) return
    mapRef.current.setFitView(
      markersRef.current.length > 0 ? markersRef.current : null
    )
  }, [])

  return { mapRef, drawRoute, drawMarkers, fitBounds, clearMarkers, clearPolylines }
}
