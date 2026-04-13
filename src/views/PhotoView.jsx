import { useState, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { Upload, Star, X, Trash2, ImagePlus } from 'lucide-react'
import { TRIP_DAYS } from '../data/itinerary.js'

const DEVICES = ['全部', '哈苏', 'Canon 5D', 'Sony ZV-E1', 'Lomo 胶片', 'DJI 航拍', '手机']
const MOODS = ['🌄', '🌿', '🏔️', '💧', '🌅', '🌃', '👗', '🎞️']

export default function PhotoView() {
  const [photos, setPhotos] = useLocalStorage('ada-photos', [])
  const [dayFilter, setDayFilter] = useState('all')   // 'all' | 'fav' | dayId
  const [deviceFilter, setDeviceFilter] = useState('全部')
  const [selected, setSelected] = useState(null)      // selected photo for detail
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  // Filtered view
  const filtered = photos.filter(p => {
    if (dayFilter === 'fav' && !p.starred) return false
    if (dayFilter !== 'all' && dayFilter !== 'fav' && p.dayId !== dayFilter) return false
    if (deviceFilter !== '全部' && p.device !== deviceFilter) return false
    return true
  })

  async function handleFiles(files) {
    setUploading(true)
    const results = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      const base64 = await readAsDataURL(file)
      results.push({
        id: `ph${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: file.name,
        src: base64,
        dayId: dayFilter !== 'all' && dayFilter !== 'fav' ? dayFilter : null,
        device: '手机',
        mood: null,
        notes: '',
        starred: false,
        uploadedAt: new Date().toISOString(),
      })
    }
    setPhotos(prev => [...results, ...prev])
    setUploading(false)
  }

  function readAsDataURL(file) {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.readAsDataURL(file)
    })
  }

  function toggleStar(id) {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, starred: !p.starred } : p))
    if (selected?.id === id) setSelected(prev => ({ ...prev, starred: !prev.starred }))
  }

  function deletePhoto(id) {
    setPhotos(prev => prev.filter(p => p.id !== id))
    setSelected(null)
  }

  function updatePhoto(id, patch) {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
    setSelected(prev => prev?.id === id ? { ...prev, ...patch } : prev)
  }

  const dayLabel = id => {
    if (id === 'all') return '全部'
    if (id === 'fav') return '⭐ 精选集'
    const d = TRIP_DAYS.find(d => String(d.id) === String(id))
    return d ? `Day ${d.id}` : id
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FFFFFF', fontFamily: 'var(--ferrari-sans)', position: 'relative' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #E8E8E8', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '2px', textTransform: 'uppercase', color: '#DA291C', marginBottom: 6 }}>Ada · Album</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#181818' }}>旅行照片</div>
          <div style={{ fontSize: 11, fontFamily: 'var(--body-font)', color: '#AAAAAA' }}>
            {photos.length} 张 · {photos.filter(p => p.starred).length} 精选
          </div>
        </div>
      </div>

      {/* Day tabs */}
      <div style={{ overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', padding: '0 24px', gap: 0, minWidth: 'max-content' }}>
          {['all', 'fav', ...TRIP_DAYS.map(d => String(d.id))].map(id => (
            <button key={id} onClick={() => setDayFilter(id)} style={{
              padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'var(--body-font)', fontSize: 11, letterSpacing: '0.8px', textTransform: 'uppercase',
              color: dayFilter === id ? '#181818' : '#AAAAAA',
              fontWeight: dayFilter === id ? 600 : 400,
              borderBottom: dayFilter === id ? '2px solid #DA291C' : '2px solid transparent',
              marginBottom: -1, whiteSpace: 'nowrap', touchAction: 'manipulation',
            }}>
              {dayLabel(id)}
            </button>
          ))}
        </div>
      </div>

      {/* Device filter */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 24px', overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid #F0F0F0' }}>
        {DEVICES.map(d => (
          <button key={d} onClick={() => setDeviceFilter(d)} style={{
            padding: '5px 12px', border: `1px solid ${deviceFilter === d ? '#181818' : '#E8E8E8'}`,
            borderRadius: 100, background: deviceFilter === d ? '#181818' : 'transparent',
            color: deviceFilter === d ? '#FFF' : '#666',
            fontSize: 11, cursor: 'pointer', fontFamily: 'var(--body-font)',
            whiteSpace: 'nowrap', touchAction: 'manipulation',
          }}>{d}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {filtered.length === 0 ? (
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(Array.from(e.dataTransfer.files)) }}
            style={{
              border: '2px dashed #E8E8E8', borderRadius: 4,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: '60px 20px', cursor: 'pointer',
            }}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus size={36} color="#CCCCCC" />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>点击或拖拽上传照片</div>
              <div style={{ fontSize: 11, color: '#AAAAAA', fontFamily: 'var(--body-font)' }}>支持 JPG · PNG · HEIC</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
            {filtered.map(photo => (
              <div key={photo.id} onClick={() => setSelected(photo)}
                style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: 2, cursor: 'pointer', background: '#F5F5F5' }}>
                <img src={photo.src} alt={photo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {photo.starred && (
                  <div style={{ position: 'absolute', top: 5, right: 5 }}>
                    <Star size={14} fill="#DA291C" color="#DA291C" />
                  </div>
                )}
                {photo.dayId && (
                  <div style={{
                    position: 'absolute', bottom: 5, left: 5,
                    background: 'rgba(0,0,0,0.55)', color: '#fff',
                    fontSize: 9, padding: '2px 6px', borderRadius: 1,
                    fontFamily: 'var(--body-font)', letterSpacing: '0.5px',
                  }}>
                    Day {photo.dayId}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload FAB */}
      <button
        onClick={() => fileRef.current?.click()}
        style={{
          position: 'absolute', bottom: 24, right: 24, width: 48, height: 48, borderRadius: '50%',
          background: uploading ? '#8F8F8F' : '#DA291C', color: '#FFF', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(218,41,28,0.35)', touchAction: 'manipulation',
        }}>
        <Upload size={18} />
      </button>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => handleFiles(Array.from(e.target.files))} />

      {/* Photo detail overlay */}
      {selected && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50, display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', flexShrink: 0 }}>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', touchAction: 'manipulation' }}><X size={20} /></button>
            <div style={{ display: 'flex', gap: 16 }}>
              <button onClick={() => toggleStar(selected.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}>
                <Star size={20} fill={selected.starred ? '#DA291C' : 'none'} color={selected.starred ? '#DA291C' : '#FFF'} />
              </button>
              <button onClick={() => deletePhoto(selected.id)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', touchAction: 'manipulation' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          {/* Image */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src={selected.src} alt={selected.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
          {/* Meta */}
          <div style={{ background: '#FFFFFF', padding: '16px 20px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Day assignment */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', width: 40, flexShrink: 0 }}>行程</span>
              <select value={selected.dayId || ''} onChange={e => updatePhoto(selected.id, { dayId: e.target.value || null })} style={{ fontSize: 12, border: '1px solid #E0E0E0', borderRadius: 2, padding: '4px 8px', fontFamily: 'var(--ferrari-sans)', background: '#FFF' }}>
                <option value="">未分类</option>
                {TRIP_DAYS.map(d => <option key={d.id} value={String(d.id)}>Day {d.id} · {d.startCity}</option>)}
              </select>
            </div>
            {/* Device */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', width: 40, flexShrink: 0 }}>设备</span>
              <select value={selected.device || ''} onChange={e => updatePhoto(selected.id, { device: e.target.value })} style={{ fontSize: 12, border: '1px solid #E0E0E0', borderRadius: 2, padding: '4px 8px', fontFamily: 'var(--ferrari-sans)', background: '#FFF' }}>
                {DEVICES.filter(d => d !== '全部').map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {/* Notes */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', width: 40, flexShrink: 0, paddingTop: 6 }}>备注</span>
              <textarea value={selected.notes} onChange={e => updatePhoto(selected.id, { notes: e.target.value })}
                placeholder="添加地点、胶卷或拍摄记录…"
                style={{ flex: 1, fontSize: 12, border: '1px solid #E0E0E0', borderRadius: 2, padding: '6px 10px', fontFamily: 'var(--ferrari-sans)', resize: 'none', height: 52, background: '#FFF' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
