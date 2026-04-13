import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { CATEGORIES, SCENE_TAGS, WEATHER_TAGS, DEFAULT_CLOTHES, DEFAULT_SETS } from '../data/outfits.js'
import { Plus, X, Star, Trash2 } from 'lucide-react'
import { TRIP_DAYS } from '../data/itinerary.js'

const PRESET_COLORS = [
  '#FFFFFF','#F5F5F0','#FFF8F0','#FFF3DC','#FFEEEE',
  '#F0F5FF','#EFF8FF','#F0FFF4','#1A1A1A','#181818',
  '#4A90D9','#3A5F8A','#8B6914','#A0845C','#C8B89A',
  '#DA291C','#6B4F3A','#4A6080','#D4B896','#8B8B8B',
]

export default function OutfitView() {
  const [clothes, setClothes]   = useLocalStorage('ada-clothes', DEFAULT_CLOTHES)
  const [sets, setSets]         = useLocalStorage('ada-sets', DEFAULT_SETS)
  const [activeTab, setActiveTab] = useState('clothes') // clothes | sets | rec
  const [catFilter, setCatFilter] = useState('all')
  const [sceneFilter, setSceneFilter] = useState(null)
  const [showAddCloth, setShowAddCloth] = useState(false)
  const [showAddSet, setShowAddSet] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [recScene, setRecScene] = useState('拍照')
  const [recWeather, setRecWeather] = useState('高温')
  const [newCloth, setNewCloth] = useState({ name: '', category: 'top', color: '#FFFFFF', scenes: [], weather: [], notes: '' })
  const [newSet, setNewSet] = useState({ name: '', items: [], scenes: [], weather: [], notes: '', color: '#FFFFFF' })
  const [favoriteIds, setFavoriteIds] = useLocalStorage('ada-fav-clothes', [])

  // Filtered clothes list
  const filteredClothes = clothes.filter(c => {
    if (catFilter !== 'all' && c.category !== catFilter) return false
    if (sceneFilter && !c.scenes.includes(sceneFilter)) return false
    return true
  })

  // Recommendation logic
  const recClothes = clothes.filter(c => c.scenes.includes(recScene) && c.weather.includes(recWeather))
  const recSets = sets.filter(s => s.scenes.includes(recScene) && s.weather.includes(recWeather))

  function addCloth() {
    if (!newCloth.name.trim()) return
    const item = { ...newCloth, id: `c${Date.now()}` }
    setClothes(prev => [item, ...prev])
    setNewCloth({ name: '', category: 'top', color: '#FFFFFF', scenes: [], weather: [], notes: '' })
    setShowAddCloth(false)
  }

  function deleteCloth(id) {
    setClothes(prev => prev.filter(c => c.id !== id))
    setSets(prev => prev.map(s => ({ ...s, items: s.items.filter(i => i !== id) })))
  }

  function toggleFav(id) {
    setFavoriteIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [id, ...prev])
  }

  function toggleNewClothTag(arr, setter, key, val) {
    setter(prev => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter(v => v !== val) : [...prev[key], val]
    }))
  }

  function addSet() {
    if (!newSet.name.trim() || newSet.items.length < 2) return
    const item = { ...newSet, id: `s${Date.now()}`, items: [...selectedItems] }
    setSets(prev => [item, ...prev])
    setNewSet({ name: '', items: [], scenes: [], weather: [], notes: '', color: '#FFFFFF' })
    setSelectedItems([])
    setShowAddSet(false)
  }

  function getClothById(id) { return clothes.find(c => c.id === id) }

  const Tab = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
      fontFamily: 'var(--body-font)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
      color: activeTab === id ? '#181818' : '#8F8F8F',
      fontWeight: activeTab === id ? 600 : 400,
      borderBottom: activeTab === id ? '2px solid #DA291C' : '2px solid transparent',
      marginBottom: -1, touchAction: 'manipulation',
    }}>{label}</button>
  )

  const TagPill = ({ label, active, onClick, red }) => (
    <button onClick={onClick} style={{
      padding: '5px 12px', border: `1px solid ${active ? (red ? '#DA291C' : '#181818') : '#E8E8E8'}`,
      borderRadius: 100, background: active ? (red ? '#DA291C' : '#181818') : 'transparent',
      color: active ? '#FFF' : '#666', fontSize: 11, cursor: 'pointer',
      fontFamily: 'var(--body-font)', touchAction: 'manipulation',
    }}>{label}</button>
  )

  const ColorSwatch = ({ color, selected, onClick }) => (
    <button onClick={onClick} style={{
      width: 24, height: 24, borderRadius: '50%', background: color, border: 'none',
      cursor: 'pointer', outline: selected ? '2px solid #DA291C' : '1px solid #E0E0E0',
      outlineOffset: 2, flexShrink: 0, touchAction: 'manipulation',
    }} />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FFFFFF', fontFamily: 'var(--ferrari-sans)', position: 'relative' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #E8E8E8', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '2px', textTransform: 'uppercase', color: '#DA291C', marginBottom: 6 }}>Ada · Wardrobe</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#181818', marginBottom: 16 }}>穿搭管理</div>
        <div style={{ display: 'flex' }}>
          <Tab id="clothes" label="单品" />
          <Tab id="sets" label="套装" />
          <Tab id="rec" label="今日推荐" />
        </div>
      </div>

      {/* ── 单品 ── */}
      {activeTab === 'clothes' && (
        <>
          {/* Filters */}
          <div style={{ padding: '14px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
            <TagPill label="全部" active={catFilter === 'all'} onClick={() => setCatFilter('all')} />
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <TagPill key={k} label={v.label} active={catFilter === k} onClick={() => setCatFilter(k)} />
            ))}
            <div style={{ width: 1, background: '#E8E8E8', margin: '0 4px' }} />
            {SCENE_TAGS.map(s => (
              <TagPill key={s} label={s} active={sceneFilter === s} onClick={() => setSceneFilter(sceneFilter === s ? null : s)} red />
            ))}
          </div>

          {/* Grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {filteredClothes.map(item => (
                <div key={item.id} style={{ border: '1px solid #F0F0F0', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                  {/* Color block */}
                  <div style={{ height: 80, background: item.color, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 28 }}>{CATEGORIES[item.category]?.icon || '👕'}</span>
                    <button onClick={() => toggleFav(item.id)} style={{
                      position: 'absolute', top: 6, right: 6, background: 'rgba(255,255,255,0.85)',
                      border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation',
                    }}>
                      <Star size={12} fill={favoriteIds.includes(item.id) ? '#DA291C' : 'none'} color={favoriteIds.includes(item.id) ? '#DA291C' : '#999'} />
                    </button>
                  </div>
                  {/* Info */}
                  <div style={{ padding: '10px 10px 8px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#181818', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6 }}>
                      {item.scenes.map(s => (
                        <span key={s} style={{ fontSize: 9, background: '#FFF0F0', color: '#DA291C', padding: '2px 5px', borderRadius: 1 }}>{s}</span>
                      ))}
                      {item.weather.map(w => (
                        <span key={w} style={{ fontSize: 9, background: '#F0F5FF', color: '#3A5F8A', padding: '2px 5px', borderRadius: 1 }}>{w}</span>
                      ))}
                    </div>
                    <button onClick={() => deleteCloth(item.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: '#CCCCCC', padding: 0, touchAction: 'manipulation',
                    }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAB */}
          <button onClick={() => setShowAddCloth(true)} style={{
            position: 'absolute', bottom: 24, right: 24, width: 48, height: 48, borderRadius: '50%',
            background: '#DA291C', color: '#FFF', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(218,41,28,0.35)', touchAction: 'manipulation',
          }}>
            <Plus size={20} />
          </button>
        </>
      )}

      {/* ── 套装 ── */}
      {activeTab === 'sets' && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sets.map(set => (
              <div key={set.id} style={{ border: '1px solid #F0F0F0', borderRadius: 2, borderLeft: `3px solid ${set.color}`, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#181818' }}>{set.name}</div>
                    <button onClick={() => setSets(prev => prev.filter(s => s.id !== set.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CCCCCC', touchAction: 'manipulation' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {/* Item chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {set.items.map(id => {
                      const c = getClothById(id)
                      return c ? (
                        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F5F5F5', padding: '4px 10px', borderRadius: 100 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, border: '1px solid #E0E0E0' }} />
                          <span style={{ fontSize: 11, color: '#444' }}>{c.name}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {set.scenes.map(s => <span key={s} style={{ fontSize: 9, background: '#FFF0F0', color: '#DA291C', padding: '2px 6px', borderRadius: 1 }}>{s}</span>)}
                    {set.weather.map(w => <span key={w} style={{ fontSize: 9, background: '#F0F5FF', color: '#3A5F8A', padding: '2px 6px', borderRadius: 1 }}>{w}</span>)}
                  </div>
                  {set.notes && <p style={{ fontSize: 11, color: '#8F8F8F', fontFamily: 'var(--body-font)', marginTop: 8, lineHeight: 1.5 }}>{set.notes}</p>}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowAddSet(true)} style={{
            position: 'absolute', bottom: 24, right: 24, width: 48, height: 48, borderRadius: '50%',
            background: '#DA291C', color: '#FFF', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(218,41,28,0.35)', touchAction: 'manipulation',
          }}>
            <Plus size={20} />
          </button>
        </>
      )}

      {/* ── 今日推荐 ── */}
      {activeTab === 'rec' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 10 }}>选择场景</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {SCENE_TAGS.map(s => <TagPill key={s} label={s} active={recScene === s} onClick={() => setRecScene(s)} />)}
            </div>
            <div style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 10 }}>当日天气</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {WEATHER_TAGS.map(w => <TagPill key={w} label={w} active={recWeather === w} onClick={() => setRecWeather(w)} />)}
            </div>
          </div>

          {recSets.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#DA291C', marginBottom: 12 }}>推荐套装</div>
              {recSets.map(set => (
                <div key={set.id} style={{ padding: '14px 16px', border: '1px solid #E8E8E8', borderRadius: 2, borderLeft: `3px solid ${set.color}`, marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#181818', marginBottom: 8 }}>{set.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {set.items.map(id => {
                      const c = getClothById(id)
                      return c ? (
                        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F5F5F5', padding: '4px 10px', borderRadius: 100 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, border: '1px solid #E0E0E0' }} />
                          <span style={{ fontSize: 11, color: '#444' }}>{c.name}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                  {set.notes && <p style={{ fontSize: 11, color: '#8F8F8F', fontFamily: 'var(--body-font)', marginTop: 8, lineHeight: 1.5 }}>{set.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {recClothes.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 12 }}>适合单品</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {recClothes.map(item => (
                  <div key={item.id} style={{ border: '1px solid #F0F0F0', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: 60, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 24 }}>{CATEGORIES[item.category]?.icon}</span>
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#181818', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recSets.length === 0 && recClothes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#CCCCCC', fontFamily: 'var(--body-font)', fontSize: 13 }}>
              暂无匹配搭配<br />
              <span style={{ fontSize: 11 }}>尝试添加带有对应场景和天气标签的单品</span>
            </div>
          )}
        </div>
      )}

      {/* ── Add Cloth Modal ── */}
      {showAddCloth && (
        <Modal title="添加单品" onClose={() => setShowAddCloth(false)} onConfirm={addCloth} confirmLabel="添加">
          <FormRow label="名称">
            <input value={newCloth.name} onChange={e => setNewCloth(p => ({ ...p, name: e.target.value }))} placeholder="例：白色上衣" style={inputSt} />
          </FormRow>
          <FormRow label="品类">
            <select value={newCloth.category} onChange={e => setNewCloth(p => ({ ...p, category: e.target.value }))} style={inputSt}>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </FormRow>
          <FormRow label="颜色">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRESET_COLORS.map(c => <ColorSwatch key={c} color={c} selected={newCloth.color === c} onClick={() => setNewCloth(p => ({ ...p, color: c }))} />)}
            </div>
          </FormRow>
          <FormRow label="场景标签">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SCENE_TAGS.map(s => <TagPill key={s} label={s} active={newCloth.scenes.includes(s)} onClick={() => toggleNewClothTag(newCloth.scenes, setNewCloth, 'scenes', s)} red />)}
            </div>
          </FormRow>
          <FormRow label="天气标签">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {WEATHER_TAGS.map(w => <TagPill key={w} label={w} active={newCloth.weather.includes(w)} onClick={() => toggleNewClothTag(newCloth.weather, setNewCloth, 'weather', w)} />)}
            </div>
          </FormRow>
          <FormRow label="备注">
            <textarea value={newCloth.notes} onChange={e => setNewCloth(p => ({ ...p, notes: e.target.value }))} placeholder="可选" style={{ ...inputSt, height: 60, resize: 'vertical' }} />
          </FormRow>
        </Modal>
      )}

      {/* ── Add Set Modal ── */}
      {showAddSet && (
        <Modal title="创建套装" onClose={() => { setShowAddSet(false); setSelectedItems([]) }} onConfirm={addSet} confirmLabel="创建">
          <FormRow label="套装名称">
            <input value={newSet.name} onChange={e => setNewSet(p => ({ ...p, name: e.target.value }))} placeholder="例：草原白日梦" style={inputSt} />
          </FormRow>
          <FormRow label="选择单品（至少2件）">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {clothes.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0' }}>
                  <input type="checkbox" checked={selectedItems.includes(c.id)}
                    onChange={() => setSelectedItems(prev => prev.includes(c.id) ? prev.filter(i => i !== c.id) : [...prev, c.id])}
                    style={{ accentColor: '#DA291C', width: 14, height: 14 }} />
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: c.color, border: '1px solid #E0E0E0', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#333' }}>{c.name}</span>
                  <span style={{ fontSize: 10, color: '#AAAAAA', fontFamily: 'var(--body-font)' }}>{CATEGORIES[c.category]?.label}</span>
                </label>
              ))}
            </div>
          </FormRow>
          <FormRow label="场景">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SCENE_TAGS.map(s => <TagPill key={s} label={s} active={newSet.scenes.includes(s)} onClick={() => setNewSet(p => ({ ...p, scenes: p.scenes.includes(s) ? p.scenes.filter(v => v !== s) : [...p.scenes, s] }))} red />)}
            </div>
          </FormRow>
          <FormRow label="天气">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {WEATHER_TAGS.map(w => <TagPill key={w} label={w} active={newSet.weather.includes(w)} onClick={() => setNewSet(p => ({ ...p, weather: p.weather.includes(w) ? p.weather.filter(v => v !== w) : [...p.weather, w] }))} />)}
            </div>
          </FormRow>
          <FormRow label="备注">
            <textarea value={newSet.notes} onChange={e => setNewSet(p => ({ ...p, notes: e.target.value }))} placeholder="可选" style={{ ...inputSt, height: 60, resize: 'vertical' }} />
          </FormRow>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, onConfirm, confirmLabel, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: '100%', background: '#FFFFFF', borderRadius: '8px 8px 0 0', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#181818' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', touchAction: 'manipulation' }}><X size={18} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F0F0F0', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#F5F5F5', border: 'none', borderRadius: 2, fontSize: 13, cursor: 'pointer', touchAction: 'manipulation' }}>取消</button>
          <button onClick={onConfirm} style={{ flex: 2, padding: '12px', background: '#DA291C', color: '#FFF', border: 'none', borderRadius: 2, fontSize: 13, fontWeight: 500, cursor: 'pointer', touchAction: 'manipulation' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

function FormRow({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  )
}

const inputSt = {
  width: '100%', fontSize: 13, color: '#181818', padding: '9px 12px',
  borderRadius: 2, border: '1px solid #E0E0E0', outline: 'none',
  fontFamily: 'var(--ferrari-sans)', background: '#FFFFFF', boxSizing: 'border-box',
}
