// 生成高德地图导航 URI
// 格式：https://uri.amap.com/navigation?from=lng,lat,name&to=lng,lat,name&via=...&mode=car

function enc(str) {
  return encodeURIComponent(str)
}

// 单日导航链接：以当天所有 POI 作为途经点
export function buildDayNavUrl(day) {
  const pois = day.pois
  if (!pois || pois.length === 0) return null

  const from = pois[0]
  const to = pois[pois.length - 1]
  const via = pois.slice(1, -1).slice(0, 12) // AMap 最多支持 ~16 个点

  let url =
    `https://uri.amap.com/navigation` +
    `?from=${from.coords[0]},${from.coords[1]},${enc(from.name)}` +
    `&to=${to.coords[0]},${to.coords[1]},${enc(to.name)}`

  if (via.length > 0) {
    url += `&via=${via.map(p => `${p.coords[0]},${p.coords[1]},${enc(p.name)}`).join('|')}`
  }

  url += `&mode=car&policy=0&coordinate=gaode&callnative=1`
  return url
}

// 全程导航链接：每天取一个代表景点作为途经点（最多 14 个）
export function buildFullTripNavUrl(days) {
  // 每天优先取景点，否则取第一个 POI
  const stops = days
    .map(day => day.pois.find(p => p.type === 'scenic') || day.pois[0])
    .filter(Boolean)

  if (stops.length < 2) return null

  const from = stops[0]
  const to = stops[stops.length - 1]
  const via = stops.slice(1, -1).slice(0, 12)

  let url =
    `https://uri.amap.com/navigation` +
    `?from=${from.coords[0]},${from.coords[1]},${enc(from.name)}` +
    `&to=${to.coords[0]},${to.coords[1]},${enc(to.name)}`

  if (via.length > 0) {
    url += `&via=${via.map(p => `${p.coords[0]},${p.coords[1]},${enc(p.name)}`).join('|')}`
  }

  url += `&mode=car&policy=0&coordinate=gaode&callnative=1`
  return url
}
