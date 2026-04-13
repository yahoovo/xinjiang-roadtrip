import { useState } from 'react'
import { EQUIPMENT, SCENE_EQUIPMENT_MAP, FILM_GUIDE } from '../data/equipment.js'

const SCENES = Object.keys(SCENE_EQUIPMENT_MAP)
const TYPE_LABELS = {
  film: '胶片相机', mirrorless: '微单', dslr: '单反',
  'medium-format': '中画幅', drone: '无人机', pocket: '口袋云台',
}

export default function EquipmentView() {
  const [activeTab, setActiveTab] = useState('devices') // devices | scene | film
  const [selectedScene, setSelectedScene] = useState('草原')
  const [expandedId, setExpandedId] = useState(null)

  const sceneEq = (SCENE_EQUIPMENT_MAP[selectedScene] || [])
    .map(id => EQUIPMENT.find(e => e.id === id)).filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FFFFFF', fontFamily: 'var(--ferrari-sans)' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #E8E8E8' }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '2px', textTransform: 'uppercase', color: '#DA291C', marginBottom: 6 }}>
          Ada · Photography
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#181818', marginBottom: 16 }}>摄影设备</div>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E8E8E8' }}>
          {[['devices','设备清单'],['scene','场景推荐'],['film','胶卷指南']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'var(--body-font)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
              color: activeTab === id ? '#181818' : '#8F8F8F',
              fontWeight: activeTab === id ? 600 : 400,
              borderBottom: activeTab === id ? '2px solid #DA291C' : '2px solid transparent',
              marginBottom: -1, touchAction: 'manipulation',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

        {/* 设备清单 */}
        {activeTab === 'devices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {EQUIPMENT.map(eq => (
              <div key={eq.id} onClick={() => setExpandedId(expandedId === eq.id ? null : eq.id)}
                style={{
                  border: '1px solid #E8E8E8', borderRadius: 2, overflow: 'hidden', cursor: 'pointer',
                  borderLeft: `3px solid ${eq.color}`,
                }}>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{eq.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#181818' }}>{eq.name}</span>
                      <span style={{
                        fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase',
                        background: eq.status === 'new' ? '#DA291C' : '#F0F0F0',
                        color: eq.status === 'new' ? '#FFFFFF' : '#8F8F8F',
                        padding: '2px 7px', borderRadius: 1,
                      }}>
                        {eq.status === 'new' ? '新购' : '已有'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#8F8F8F', fontFamily: 'var(--body-font)', marginTop: 2 }}>
                      {TYPE_LABELS[eq.type]} · {eq.brand}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#CCCCCC' }}>{expandedId === eq.id ? '▲' : '▼'}</div>
                </div>

                {expandedId === eq.id && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F0F0F0' }}>
                    <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6, margin: '12px 0 10px' }}>{eq.description}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {eq.scenes.map(s => (
                        <span key={s} style={{ fontSize: 10, fontFamily: 'var(--body-font)', letterSpacing: '0.5px', background: '#F5F5F5', color: '#555', padding: '3px 8px', borderRadius: 1 }}>{s}</span>
                      ))}
                    </div>

                    {eq.films.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 6 }}>推荐胶卷</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {eq.films.map(f => (
                            <span key={f} style={{ fontSize: 11, background: '#FFF8F0', color: '#8B6914', padding: '3px 10px', borderRadius: 1, border: '1px solid #E8D5A0' }}>{f}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 8 }}>拍摄建议</div>
                    {eq.tips.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                        <span style={{ color: '#DA291C', fontSize: 12, flexShrink: 0, marginTop: 1 }}>·</span>
                        <span style={{ fontSize: 12, color: '#555', fontFamily: 'var(--body-font)', lineHeight: 1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 场景推荐 */}
        {activeTab === 'scene' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {SCENES.map(s => (
                <button key={s} onClick={() => setSelectedScene(s)} style={{
                  padding: '8px 16px', border: 'none', borderRadius: 2, cursor: 'pointer',
                  background: selectedScene === s ? '#181818' : '#F5F5F5',
                  color: selectedScene === s ? '#FFFFFF' : '#555',
                  fontSize: 13, fontFamily: 'var(--ferrari-sans)', fontWeight: 500,
                  touchAction: 'manipulation',
                }}>
                  {s}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 16 }}>
              {selectedScene} 推荐设备（优先级排序）
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sceneEq.map((eq, i) => (
                <div key={eq.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', border: '1px solid #E8E8E8', borderRadius: 2,
                  borderLeft: `3px solid ${i === 0 ? '#DA291C' : i === 1 ? '#8B6914' : '#CCCCCC'}`,
                }}>
                  <span style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '1px', color: '#CCCCCC', flexShrink: 0, width: 16 }}>
                    {['01', '02', '03'][i]}
                  </span>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{eq.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#181818' }}>{eq.name}</div>
                    <div style={{ fontSize: 11, color: '#8F8F8F', fontFamily: 'var(--body-font)', marginTop: 2 }}>{eq.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 胶卷指南 */}
        {activeTab === 'film' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 1fr 1.2fr 1.4fr', gap: 0, marginBottom: 8 }}>
              {['胶卷', 'ISO', '类型', '风格', '适用场景'].map(h => (
                <span key={h} style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', padding: '0 0 8px' }}>{h}</span>
              ))}
            </div>
            {FILM_GUIDE.map((f, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2fr 0.6fr 1fr 1.2fr 1.4fr',
                padding: '12px 0', borderTop: '1px solid #F0F0F0',
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#181818' }}>{f.film}</span>
                <span style={{ fontSize: 12, color: '#555', fontFamily: 'var(--body-font)' }}>{f.iso}</span>
                <span style={{ fontSize: 11, color: '#8F8F8F', fontFamily: 'var(--body-font)' }}>{f.type}</span>
                <span style={{ fontSize: 11, color: '#8B6914', fontFamily: 'var(--body-font)' }}>{f.mood}</span>
                <span style={{ fontSize: 11, color: '#555', fontFamily: 'var(--body-font)' }}>{f.best}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
