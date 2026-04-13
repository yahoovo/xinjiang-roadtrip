import { useState } from 'react'
import { X, Send, Trash2 } from 'lucide-react'
import { POI_TYPES } from '../data/itinerary'

// Ferrari modal: white editorial card, Ferrari Red CTA, 2px radius
export default function NoteModal({ poi, onClose, onAddNote, onDeleteNote }) {
  const [draft, setDraft] = useState('')
  const typeInfo = POI_TYPES[poi.type] || POI_TYPES.custom

  async function handleSubmit(e) {
    e.preventDefault()
    if (!draft.trim()) return
    await onAddNote(poi.id, draft.trim())
    setDraft('')
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
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
        width: '100%', maxWidth: 440,
        boxShadow: 'rgb(153,153,153) 1px 1px 1px 0px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '20px 20px 16px',
          borderBottom: '1px solid #D2D2D2',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--body-font)',
              fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
              color: '#8F8F8F', marginBottom: 6,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{typeInfo.icon}</span>
              <span>{typeInfo.label}</span>
            </div>
            <h2 style={{
              fontSize: 20, fontWeight: 500, color: '#181818', lineHeight: 1.2, marginBottom: 4,
            }}>
              {poi.name}
            </h2>
            <p style={{
              fontFamily: 'var(--body-font)',
              fontSize: 10, letterSpacing: '1px',
              color: '#8F8F8F',
            }}>
              {poi.coords[1].toFixed(4)}°N · {poi.coords[0].toFixed(4)}°E
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#8F8F8F', padding: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#181818'}
            onMouseLeave={e => e.currentTarget.style.color = '#8F8F8F'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Notes */}
        <div style={{ padding: '12px 20px', maxHeight: 240, overflowY: 'auto' }}>
          {(!poi.notes || poi.notes.length === 0) ? (
            <p style={{
              fontFamily: 'var(--body-font)',
              fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
              color: '#D2D2D2', textAlign: 'center', padding: '24px 0',
            }}>
              暂无团队备注
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {poi.notes.map((note, idx) => (
                <div key={note.id} style={{
                  padding: '10px 0',
                  borderBottom: idx < poi.notes.length - 1 ? '1px solid #f5f5f5' : 'none',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: '#181818', lineHeight: 1.5, marginBottom: 4 }}>
                      {note.content}
                    </p>
                    <div style={{
                      fontFamily: 'var(--body-font)',
                      fontSize: 10, letterSpacing: '0.5px',
                      color: '#8F8F8F',
                    }}>
                      <span style={{ fontWeight: 600 }}>{note.author}</span>
                      {note.created_at && (
                        <span> · {new Date(note.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D2D2D2', padding: 2, flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#DA291C'}
                    onMouseLeave={e => e.currentTarget.style.color = '#D2D2D2'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input — Ferrari Red submit */}
        <form onSubmit={handleSubmit} style={{
          padding: '12px 20px 20px',
          borderTop: '1px solid #D2D2D2',
          display: 'flex', gap: 8,
        }}>
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="添加团队备注..."
            autoFocus
            style={{
              flex: 1, fontSize: 13, color: '#181818',
              padding: '10px 12px', borderRadius: 2,
              border: '1px solid #CCCCCC', outline: 'none',
              fontFamily: 'var(--ferrari-sans)', background: '#FFFFFF',
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            style={{
              background: draft.trim() ? '#DA291C' : '#D2D2D2',
              color: '#FFFFFF', border: 'none', borderRadius: 2,
              padding: '10px 14px', cursor: draft.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { if (draft.trim()) e.currentTarget.style.background = '#B01E0A' }}
            onMouseLeave={e => { if (draft.trim()) e.currentTarget.style.background = '#DA291C' }}
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}
