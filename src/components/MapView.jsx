import { useEffect, useRef, useState } from 'react'
import { buildDayNavUrl, buildFullTripNavUrl } from '../lib/amapNav'

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY
const AMAP_SECURITY_KEY = import.meta.env.VITE_AMAP_SECURITY_KEY

export default function MapView({ selectedDay, days, onPoiClick }) {
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const polylinesRef = useRef([])
  const readyRef = useRef(false)
  const [overviewMode, setOverviewMode] = useState(true)
  const [copied, setCopied] = useState(false)

  // 初始化地图
  useEffect(() => {
    if (readyRef.current) return
    function initMap() {
      if (readyRef.current) return
      readyRef.current = true
      mapRef.current = new window.AMap.Map('amap-container', {
        zoom: 6,
        center: [86.0, 45.5],
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

  // 切换模式或选中日期时重新渲染
  useEffect(() => {
    const timer = setInterval(() => {
      if (!mapRef.current) return
      clearInterval(timer)
      if (overviewMode) {
        renderOverview()
      } else {
        if (selectedDay) renderDay(selectedDay)
      }
    }, 100)
    return () => clearInterval(timer)
  }, [overviewMode, selectedDay, days])

  function clearMap() {
    polylinesRef.current.forEach(p => p.setMap(null))
    polylinesRef.current = []
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
  }

  // 全程概览：所有天的路线（各天颜色）+ 景点标记
  function renderOverview() {
    clearMap()
    const allObjects = []

    days.forEach(day => {
      if (day.route?.length >= 2) {
        const polyline = new window.AMap.Polyline({
          path: day.route.map(c => new window.AMap.LngLat(c[0], c[1])),
          strokeColor: day.color,
          strokeWeight: 2.5,
          strokeOpacity: 0.85,
          lineJoin: 'round',
        })
        polyline.setMap(mapRef.current)
        polylinesRef.current.push(polyline)
        allObjects.push(polyline)
      }

      // 只显示景点（避免标记太密）
      day.pois.filter(p => p.type === 'scenic').forEach(poi => {
        const marker = new window.AMap.Marker({
          position: new window.AMap.LngLat(poi.coords[0], poi.coords[1]),
          content: `<div style="
            background: ${day.color};
            border-radius: 50%;
            width: 8px; height: 8px;
            box-shadow: 0 0 0 2px rgba(255,255,255,0.25);
          "></div>`,
          offset: new window.AMap.Pixel(-4, -4),
        })
        marker.on('click', () => onPoiClick?.(poi))
        marker.setMap(mapRef.current)
        markersRef.current.push(marker)
        allObjects.push(marker)
      })
    })

    if (allObjects.length > 0) {
      mapRef.current.setFitView(allObjects, false, [60, 60, 60, 60])
    }
  }

  // 单日视图：当天路线 + 所有 POI
  function renderDay(day) {
    clearMap()

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
      const marker = new window.AMap.Marker({
        position: new window.AMap.LngLat(poi.coords[0], poi.coords[1]),
        content: `<div style="
          background: #FFFFFF; border-radius: 2px;
          padding: 4px 10px; font-size: 11px;
          font-family: 'Barlow Condensed', Arial, sans-serif;
          font-weight: 500; letter-spacing: 0.5px;
          color: #181818; white-space: nowrap; cursor: pointer;
          display: flex; align-items: center; gap: 5px;
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

  // 复制/打开高德导航链接
  function handleNavClick() {
    const url = overviewMode
      ? buildFullTripNavUrl(days)
      : buildDayNavUrl(selectedDay)
    if (!url) return

    // 移动端尝试唤起 app；桌面端复制到剪贴板
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      window.open(url, '_blank')
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const navLabel = overviewMode ? '全程导航链接' : `${selectedDay?.title?.split(' · ')[0] || 'Day'} 导航链接`

  return (
    <div style={{ flex: 1, position: 'relative', background: '#000000' }}>
      <div id="amap-container" style={{ position: 'absolute', inset: 0 }} />

      {/* 顶部中央：模式切换 + 日期标题 */}
      <div style={{
        position: 'absolute', top: 16, left: '50%',
        transform: 'translateX(-50%)', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {/* 模式切换 */}
        <div style={{
          background: '#FFFFFF', borderRadius: 2,
          display: 'flex', overflow: 'hidden',
          boxShadow: 'rgb(0,0,0) 0px 0px 0px 1px',
        }}>
          <button
            onClick={() => setOverviewMode(true)}
            style={{
              padding: '7px 14px', border: 'none', cursor: 'pointer',
              background: overviewMode ? '#181818' : '#FFFFFF',
              color: overviewMode ? '#FFFFFF' : '#8F8F8F',
              fontSize: 11, fontFamily: 'var(--body-font)',
              letterSpacing: '0.8px', textTransform: 'uppercase',
              fontWeight: overviewMode ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            全程
          </button>
          <button
            onClick={() => setOverviewMode(false)}
            style={{
              padding: '7px 14px', border: 'none', cursor: 'pointer',
              background: !overviewMode ? '#181818' : '#FFFFFF',
              color: !overviewMode ? '#FFFFFF' : '#8F8F8F',
              fontSize: 11, fontFamily: 'var(--body-font)',
              letterSpacing: '0.8px', textTransform: 'uppercase',
              fontWeight: !overviewMode ? 600 : 400,
              transition: 'all 0.15s',
              borderLeft: '1px solid #D2D2D2',
            }}
          >
            今日
          </button>
        </div>

        {/* 当日标题（今日模式时显示） */}
        {!overviewMode && selectedDay && (
          <div style={{
            background: '#FFFFFF', borderRadius: 2,
            padding: '7px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
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

        {/* 全程标题 */}
        {overviewMode && (
          <div style={{
            background: '#FFFFFF', borderRadius: 2,
            padding: '7px 16px',
            fontFamily: 'var(--ferrari-sans)',
            boxShadow: 'rgb(0,0,0) 0px 0px 0px 1px',
            pointerEvents: 'none',
            fontSize: 13, fontWeight: 600, color: '#181818',
          }}>
            北疆 14 天完整路线
          </div>
        )}
      </div>

      {/* 右下：高德导航按钮 */}
      <div style={{ position: 'absolute', bottom: 20, right: 16, zIndex: 10 }}>
        <button
          onClick={handleNavClick}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: copied ? '#10b981' : '#DA291C',
            color: '#FFFFFF', border: 'none', borderRadius: 2,
            padding: '10px 18px', cursor: 'pointer',
            fontFamily: 'var(--ferrari-sans)',
            fontSize: 12, fontWeight: 500, letterSpacing: '0.5px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (!copied) e.currentTarget.style.background = '#B01E0A' }}
          onMouseLeave={e => { if (!copied) e.currentTarget.style.background = '#DA291C' }}
        >
          {copied ? (
            <>✓ 链接已复制</>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              {navLabel}
            </>
          )}
        </button>
        <div style={{
          fontFamily: 'var(--body-font)',
          fontSize: 9, letterSpacing: '0.5px',
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center', marginTop: 5,
          textTransform: 'uppercase',
        }}>
          {/Mobi|Android|iPhone/i.test(navigator.userAgent) ? '点击打开高德' : '点击复制 · 粘贴至高德'}
        </div>
      </div>

      {/* 左下：图例 */}
      <div style={{
        position: 'absolute', bottom: 20, left: 16, zIndex: 10,
        background: '#FFFFFF', borderRadius: 2,
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
        {overviewMode
          ? days.filter((_, i) => i % 2 === 0).slice(0, 7).map(day => (
            <div key={day.id} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 10, color: '#181818', marginBottom: 3, fontWeight: 500,
            }}>
              <span style={{
                width: 20, height: 2.5, background: day.color,
                display: 'inline-block', borderRadius: 1, flexShrink: 0,
              }} />
              <span style={{ color: '#666' }}>{day.title.split(' · ')[0]}</span>
              <span style={{ color: '#181818' }}>{day.title.split(' · ')[1] || ''}</span>
            </div>
          ))
          : [['🏔️', '景点'], ['🏨', '住宿'], ['⛽', '加油站'], ['🍜', '餐厅']].map(([ic, lb]) => (
            <div key={lb} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: '#181818', marginBottom: 4, fontWeight: 500,
            }}>
              <span>{ic}</span><span>{lb}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}
