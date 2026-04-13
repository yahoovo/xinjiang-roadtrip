// 生成高德地图导航 URI
// 文档：https://lbs.amap.com/api/uri-api/guide/travel/drive
// 途经点：每个独立 &via= 参数（多个 | 拼接在 App 端不稳定）

function enc(str) {
  return encodeURIComponent(str)
}

function buildUrl(from, to, via) {
  let url =
    `https://uri.amap.com/navigation` +
    `?from=${from.coords[0]},${from.coords[1]},${enc(from.name)}` +
    `&to=${to.coords[0]},${to.coords[1]},${enc(to.name)}`

  // 每个途经点用独立的 &via= 参数，高德 App / 网页均兼容
  via.forEach(p => {
    url += `&via=${p.coords[0]},${p.coords[1]},${enc(p.name)}`
  })

  url += `&mode=car&policy=0&coordinate=gaode&callnative=1`
  return url
}

// 单日导航：当天所有 POI 作为途经点
export function buildDayNavUrl(day) {
  const pois = day.pois
  if (!pois || pois.length < 1) return null

  const from = pois[0]
  const to   = pois[pois.length - 1]
  const via  = pois.length > 2 ? pois.slice(1, -1).slice(0, 12) : []

  return buildUrl(from, to, via)
}

// 全程导航：每天取景点（优先）或第一个 POI，最多 14 个途经点
export function buildFullTripNavUrl(days) {
  // 每天选一个代表点
  const stops = days
    .map(day => day.pois.find(p => p.type === 'scenic') || day.pois[0])
    .filter(Boolean)

  if (stops.length < 2) return null

  const from = stops[0]
  const to   = stops[stops.length - 1]
  // AMap 官方最多支持 16 个点（含起终点），via 最多 14 个
  const via  = stops.slice(1, -1).slice(0, 14)

  return buildUrl(from, to, via)
}
