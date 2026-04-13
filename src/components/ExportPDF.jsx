import { useState, useRef } from 'react'
import { X, FileDown, Loader2, CheckCircle } from 'lucide-react'
import { POI_TYPES } from '../data/itinerary'

/**
 * 导出 PDF 路书
 * 方案：html2canvas 截图 → jsPDF 拼接
 * 中文完全正常渲染，无乱码
 */
export default function ExportPDF({ days, checklist, onClose }) {
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [selectedDays, setSelectedDays] = useState(new Set(days.map(d => d.id)))
  const previewRef = useRef(null)

  function toggleDay(id) {
    setSelectedDays(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function generate() {
    setStatus('generating')
    setProgress(0)

    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    const exportDays = days.filter(d => selectedDays.has(d.id))
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const A4_W = 210
    const A4_H = 297

    // 渲染隐藏容器里的每个页面
    const container = previewRef.current
    const pages = container.querySelectorAll('.pdf-page')
    const total = pages.length

    for (let i = 0; i < total; i++) {
      const page = pages[i]
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      if (i > 0) doc.addPage()
      doc.addImage(imgData, 'JPEG', 0, 0, A4_W, A4_H)
      setProgress(Math.round(((i + 1) / total) * 100))
    }

    doc.save(`北疆自驾路书_${new Date().toISOString().slice(0, 10)}.pdf`)
    setStatus('done')
  }

  const exportDays = days.filter(d => selectedDays.has(d.id))
  const totalKm = exportDays.reduce((s, d) => s + d.distance, 0)
  const checklistGroups = checklist.reduce((acc, item) => {
    ;(acc[item.category] = acc[item.category] || []).push(item)
    return acc
  }, {})

  return (
    <div
      onClick={e => e.target === e.currentTarget && status !== 'generating' && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'hsla(0,0%,7%,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, padding: 16,
        fontFamily: 'var(--ferrari-sans)',
      }}
    >
      <div style={{
        background: '#FFFFFF',
        borderRadius: 2,
        width: '100%', maxWidth: 480,
        boxShadow: 'rgb(153,153,153) 1px 1px 1px 0px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 16px', borderBottom: '1px solid #D2D2D2',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--body-font)', fontSize: 10,
              letterSpacing: '1px', textTransform: 'uppercase',
              color: '#8F8F8F', marginBottom: 4,
            }}>
              Export
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: '#181818', lineHeight: 1.2 }}>导出 PDF 路书</h2>
          </div>
          <button
            onClick={onClose}
            disabled={status === 'generating'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#8F8F8F', padding: 4,
              opacity: status === 'generating' ? 0.3 : 1,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#181818'}
            onMouseLeave={e => e.currentTarget.style.color = '#8F8F8F'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Day selector */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #D2D2D2' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{
              fontFamily: 'var(--body-font)', fontSize: 10,
              letterSpacing: '1px', textTransform: 'uppercase', color: '#8F8F8F',
            }}>选择天数</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <button onClick={() => setSelectedDays(new Set(days.map(d => d.id)))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#181818', fontFamily: 'var(--ferrari-sans)', fontWeight: 500 }}>
                全选
              </button>
              <button onClick={() => setSelectedDays(new Set())}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#8F8F8F', fontFamily: 'var(--ferrari-sans)' }}>
                清空
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {days.map(day => (
              <button
                key={day.id}
                onClick={() => toggleDay(day.id)}
                style={{
                  borderRadius: 2, padding: '6px 0',
                  fontSize: 11, fontWeight: 600,
                  border: selectedDays.has(day.id) ? 'none' : '1px solid #D2D2D2',
                  cursor: 'pointer',
                  fontFamily: 'var(--ferrari-sans)',
                  letterSpacing: '0.5px',
                  background: selectedDays.has(day.id) ? '#DA291C' : '#FFFFFF',
                  color: selectedDays.has(day.id) ? '#FFFFFF' : '#8F8F8F',
                  transition: 'all 0.1s',
                }}
              >
                D{day.id}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {status === 'generating' && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #D2D2D2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{
                fontFamily: 'var(--body-font)', fontSize: 10,
                letterSpacing: '1px', textTransform: 'uppercase', color: '#8F8F8F',
              }}>正在生成</span>
              <span style={{ fontFamily: 'var(--body-font)', fontSize: 10, color: '#8F8F8F' }}>{progress}%</span>
            </div>
            <div style={{ height: 2, background: '#D2D2D2', overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: '#DA291C',
                width: `${progress}%`, transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: 'var(--body-font)', fontSize: 10,
            letterSpacing: '1px', textTransform: 'uppercase', color: '#8F8F8F',
          }}>
            {selectedDays.size} 天 · {totalKm.toLocaleString()} KM
          </span>
          <button
            onClick={generate}
            disabled={status === 'generating' || selectedDays.size === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: status === 'done' ? '#181818' : '#DA291C',
              color: '#FFFFFF', border: 'none', borderRadius: 2,
              padding: '12px 20px',
              fontSize: 13, fontWeight: 500, letterSpacing: '1.28px',
              textTransform: 'uppercase',
              cursor: (status === 'generating' || selectedDays.size === 0) ? 'not-allowed' : 'pointer',
              opacity: (status === 'generating' || selectedDays.size === 0) ? 0.5 : 1,
              fontFamily: 'var(--ferrari-sans)',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = status === 'done' ? '#181818' : '#B01E0A' }}
            onMouseLeave={e => { e.currentTarget.style.background = status === 'done' ? '#181818' : '#DA291C' }}
          >
            {status === 'generating' && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            {status === 'done' && <CheckCircle size={14} />}
            {status === 'idle' && <FileDown size={14} />}
            {status === 'generating' ? '生成中' : status === 'done' ? '下载完成' : '生成 PDF'}
          </button>
        </div>
      </div>

      {/* ── 隐藏的 PDF 渲染区域（屏幕外）── */}
      <div
        ref={previewRef}
        style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}
      >
        {/* 封面 */}
        <PdfCover days={exportDays} totalKm={totalKm} />

        {/* 每日行程页 */}
        {exportDays.map(day => (
          <PdfDayPage key={day.id} day={day} />
        ))}

        {/* 行前清单页 */}
        <PdfChecklist checklist={checklist} groups={checklistGroups} />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// PDF 页面组件（宽794px = A4@96dpi）
// ──────────────────────────────────────────────

const PAGE = { width: 794, height: 1123, padding: 56 }

function PdfPage({ children, style }) {
  return (
    <div className="pdf-page" style={{
      width: PAGE.width,
      height: PAGE.height,
      background: '#0f172a',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
      ...style,
    }}>
      {children}
    </div>
  )
}

function PdfCover({ days, totalKm }) {
  const totalPoi = days.reduce((s, d) => s + d.pois.length, 0)
  return (
    <PdfPage>
      {/* 渐变装饰 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 6,
        background: 'linear-gradient(90deg, #f59e0b, #06b6d4, #8b5cf6, #10b981)',
      }} />

      {/* 色块背景 */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 360, height: 360,
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
      }} />

      <div style={{ padding: '120px 80px' }}>
        <div style={{ fontSize: 13, color: '#6366f1', letterSpacing: 4, marginBottom: 24, textTransform: 'uppercase' }}>
          Road Trip Itinerary
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: '#f8fafc', lineHeight: 1.15, marginBottom: 16 }}>
          北疆自驾<br />路书
        </div>
        <div style={{ fontSize: 20, color: '#94a3b8', marginBottom: 60 }}>
          Northern Xinjiang · Self-Driving
        </div>

        <div style={{ display: 'flex', gap: 48, marginBottom: 80 }}>
          {[
            ['天', days.length, '行程天数'],
            ['km', totalKm.toLocaleString(), '总里程'],
            ['处', totalPoi, '打卡地点'],
          ].map(([unit, val, label]) => (
            <div key={label}>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#fff' }}>
                {val}<span style={{ fontSize: 16, marginLeft: 4, color: '#64748b' }}>{unit}</span>
              </div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* 路线色条 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {days.map(day => (
            <div key={day.id} style={{
              background: day.color + '22',
              border: `1px solid ${day.color}66`,
              borderRadius: 20,
              padding: '4px 14px',
              fontSize: 12,
              color: day.color,
            }}>
              {day.title.split('·')[0].trim()}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 48, left: 80,
        fontSize: 12, color: '#334155',
      }}>
        生成日期：{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </PdfPage>
  )
}

function PdfDayPage({ day }) {
  const typeIcon = { scenic: '🏔️', hotel: '🏨', gas: '⛽', food: '🍜', custom: '📍' }
  const typeLabel = { scenic: '景点', hotel: '住宿', gas: '加油', food: '餐厅', custom: '其他' }
  const totalExp = (day.expenses || []).reduce((s, e) => s + Number(e.amount), 0)

  // 解析顶部颜色为 rgb
  const hex = day.color
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)

  return (
    <PdfPage>
      {/* 顶部彩色条 */}
      <div style={{ height: 6, background: day.color }} />

      <div style={{ padding: '40px 56px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 13, color: day.color, marginBottom: 8, letterSpacing: 2 }}>
              DAY {String(day.id).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>
              {day.title.replace(/Day \d+ · /, '')}
            </div>
            <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 6 }}>{day.subtitle}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#f8fafc' }}>{day.distance} km</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{day.startCity} → {day.endCity}</div>
          </div>
        </div>

        {/* 分割线 */}
        <div style={{ height: 1, background: '#1e293b', marginBottom: 28 }} />

        {/* 景点列表 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: '#475569', letterSpacing: 3, marginBottom: 14, textTransform: 'uppercase' }}>
            路线景点
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {day.pois.map((poi, idx) => (
              <div key={poi.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#1e293b', borderRadius: 10, padding: '10px 16px',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: `rgba(${r},${g},${b},0.2)`,
                  border: `1px solid rgba(${r},${g},${b},0.5)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: day.color, flexShrink: 0,
                }}>
                  {idx + 1}
                </div>
                <div style={{ fontSize: 14, marginRight: 4 }}>{typeIcon[poi.type] || '📍'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 500 }}>{poi.name}</div>
                  {poi.notes?.length > 0 && (
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {poi.notes.map(n => n.content).join(' · ')}
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: 11, color: '#475569',
                  background: '#0f172a', borderRadius: 6, padding: '2px 8px',
                }}>
                  {typeLabel[poi.type] || '其他'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 费用 */}
        {day.expenses?.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: '#475569', letterSpacing: 3, marginBottom: 14, textTransform: 'uppercase' }}>
              当日费用
            </div>
            <div style={{ background: '#1e293b', borderRadius: 10, overflow: 'hidden' }}>
              {day.expenses.map((exp, idx) => (
                <div key={exp.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 16px',
                  borderBottom: idx < day.expenses.length - 1 ? '1px solid #0f172a' : 'none',
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#64748b', width: 40 }}>{exp.category}</span>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>{exp.note || ''}</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#fbbf24' }}>
                    ¥{Number(exp.amount).toLocaleString()}
                  </span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '12px 16px',
                borderTop: '1px solid #0f172a',
                background: '#162032',
              }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>当日合计</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>
                  ¥{totalExp.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 页码 */}
      <div style={{
        position: 'absolute', bottom: 28, right: 56,
        fontSize: 11, color: '#334155',
      }}>
        Day {day.id} / 14
      </div>
    </PdfPage>
  )
}

function PdfChecklist({ checklist, groups }) {
  const done = checklist.filter(c => c.done).length
  return (
    <PdfPage>
      <div style={{ height: 6, background: '#10b981' }} />
      <div style={{ padding: '40px 56px' }}>
        <div style={{ fontSize: 13, color: '#10b981', letterSpacing: 2, marginBottom: 8 }}>PRE-TRIP</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>行前清单</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 32 }}>
          已完成 {done} / {checklist.length} 项
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {Object.entries(groups).map(([cat, items]) => (
            <div key={cat}>
              <div style={{ fontSize: 11, color: '#475569', letterSpacing: 3, marginBottom: 12, textTransform: 'uppercase' }}>
                {cat}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      background: item.done ? '#10b981' : 'transparent',
                      border: item.done ? '2px solid #10b981' : '2px solid #334155',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.done && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{
                      fontSize: 13,
                      color: item.done ? '#475569' : '#cbd5e1',
                      textDecoration: item.done ? 'line-through' : 'none',
                    }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PdfPage>
  )
}
