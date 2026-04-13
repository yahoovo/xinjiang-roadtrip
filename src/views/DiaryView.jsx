import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { TRIP_DAYS } from '../data/itinerary.js'
import { Plus, Send, Trash2 } from 'lucide-react'

const MOODS = ['😊', '😍', '🤩', '😌', '😮', '😤', '😴', '🥶', '🥵', '😎']
const NOTE_TYPES = [
  { id: 'wish',   icon: '🌟', label: '新愿望' },
  { id: 'place',  icon: '📍', label: '推荐地点' },
  { id: 'shop',   icon: '🛍️', label: '推荐店铺' },
  { id: 'msg',    icon: '💬', label: '留言' },
  { id: 'warn',   icon: '⚠️', label: '注意事项' },
]
const MEMBERS = ['Ada', '全团', '个人']
const REACTIONS = ['❤️', '👍', '😂', '😮', '🔥']

export default function DiaryView() {
  const [activeTab, setActiveTab] = useState('diary')   // diary | team
  const [selectedDayId, setSelectedDayId] = useState(1)
  const [diaries, setDiaries] = useLocalStorage('xj-diaries', {})
  const [notes, setNotes]   = useLocalStorage('xj-team-notes', [])
  const [editingDiary, setEditingDiary] = useState(null)
  const [newNote, setNewNote] = useState({ type: 'msg', content: '', author: 'Ada' })
  const [showNoteForm, setShowNoteForm] = useState(false)

  const currentDay = TRIP_DAYS.find(d => d.id === selectedDayId)
  const diary = diaries[selectedDayId] || { text: '', mood: null, privacy: 'team' }

  function saveDiary(patch) {
    setDiaries(prev => ({ ...prev, [selectedDayId]: { ...diary, ...patch } }))
  }

  function addNote() {
    if (!newNote.content.trim()) return
    const note = {
      id: `n${Date.now()}`,
      ...newNote,
      reactions: {},
      createdAt: new Date().toISOString(),
    }
    setNotes(prev => [note, ...prev])
    setNewNote({ type: 'msg', content: '', author: 'Ada' })
    setShowNoteForm(false)
  }

  function react(noteId, emoji) {
    setNotes(prev => prev.map(n => {
      if (n.id !== noteId) return n
      const cur = n.reactions[emoji] || 0
      return { ...n, reactions: { ...n.reactions, [emoji]: cur + 1 } }
    }))
  }

  function deleteNote(id) { setNotes(prev => prev.filter(n => n.id !== id)) }

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FFFFFF', fontFamily: 'var(--ferrari-sans)' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #E8E8E8', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--body-font)', letterSpacing: '2px', textTransform: 'uppercase', color: '#DA291C', marginBottom: 6 }}>Team · Memory</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#181818', marginBottom: 16 }}>日记 & 互动</div>
        <div style={{ display: 'flex' }}>
          <Tab id="diary" label="旅行日记" />
          <Tab id="team"  label="团队互动" />
        </div>
      </div>

      {/* ── 旅行日记 ── */}
      {activeTab === 'diary' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Day selector */}
          <div style={{ overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid #F0F0F0' }}>
            <div style={{ display: 'flex', padding: '0 24px', minWidth: 'max-content' }}>
              {TRIP_DAYS.map(d => {
                const hasDiary = diaries[d.id]?.text
                return (
                  <button key={d.id} onClick={() => setSelectedDayId(d.id)} style={{
                    padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer',
                    fontFamily: 'var(--body-font)', fontSize: 11, letterSpacing: '0.5px',
                    color: selectedDayId === d.id ? '#181818' : '#AAAAAA',
                    fontWeight: selectedDayId === d.id ? 600 : 400,
                    borderBottom: selectedDayId === d.id ? '2px solid #DA291C' : '2px solid transparent',
                    marginBottom: -1, position: 'relative', whiteSpace: 'nowrap', touchAction: 'manipulation',
                  }}>
                    Day {d.id}
                    {hasDiary && <span style={{ position: 'absolute', top: 6, right: 6, width: 4, height: 4, borderRadius: '50%', background: '#DA291C' }} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Diary content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {/* Day info (auto-filled) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '12px 16px', background: '#F8F8F8', borderRadius: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: currentDay?.color || '#8F8F8F', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#181818' }}>{currentDay?.title}</div>
                <div style={{ fontSize: 11, color: '#8F8F8F', fontFamily: 'var(--body-font)', marginTop: 2 }}>{currentDay?.subtitle}</div>
              </div>
              {currentDay?.distance > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--body-font)', letterSpacing: '1px', color: '#AAAAAA' }}>
                  {currentDay.distance} KM
                </span>
              )}
            </div>

            {/* Mood */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 8 }}>今日心情</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {MOODS.map(m => (
                  <button key={m} onClick={() => saveDiary({ mood: diary.mood === m ? null : m })} style={{
                    fontSize: 22, background: diary.mood === m ? '#FFF0F0' : 'transparent',
                    border: diary.mood === m ? '2px solid #DA291C' : '2px solid transparent',
                    borderRadius: 8, padding: '4px 8px', cursor: 'pointer', touchAction: 'manipulation',
                  }}>{m}</button>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 6 }}>
              {[['private','仅自己'],['team','团队可见'],['public','公开']].map(([v, l]) => (
                <button key={v} onClick={() => saveDiary({ privacy: v })} style={{
                  padding: '5px 12px', fontSize: 11, border: `1px solid ${diary.privacy === v ? '#181818' : '#E8E8E8'}`,
                  borderRadius: 100, background: diary.privacy === v ? '#181818' : 'transparent',
                  color: diary.privacy === v ? '#FFF' : '#666', cursor: 'pointer',
                  fontFamily: 'var(--body-font)', touchAction: 'manipulation',
                }}>{l}</button>
              ))}
            </div>

            {/* Text editor */}
            <div style={{ fontSize: 10, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA', marginBottom: 8 }}>日记正文</div>
            <textarea
              value={diary.text}
              onChange={e => saveDiary({ text: e.target.value })}
              placeholder={`记录 ${currentDay?.title} 的精彩瞬间…\n\n今天去了哪里？看到了什么？有什么感受？`}
              style={{
                width: '100%', minHeight: 200, fontSize: 14, lineHeight: 1.8,
                color: '#333', border: '1px solid #E8E8E8', borderRadius: 2,
                padding: '14px 16px', fontFamily: 'var(--body-font)', resize: 'vertical',
                background: '#FAFAFA', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ textAlign: 'right', fontSize: 10, fontFamily: 'var(--body-font)', color: '#CCCCCC', marginTop: 6 }}>
              已自动保存 · {diary.text?.length || 0} 字
            </div>
          </div>
        </div>
      )}

      {/* ── 团队互动 ── */}
      {activeTab === 'team' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Note list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#CCCCCC', fontFamily: 'var(--body-font)', fontSize: 13 }}>
                还没有团队备注<br />
                <span style={{ fontSize: 11 }}>点击下方按钮添加第一条记录</span>
              </div>
            )}
            {notes.map(note => {
              const t = NOTE_TYPES.find(n => n.id === note.type) || NOTE_TYPES[3]
              return (
                <div key={note.id} style={{ border: '1px solid #F0F0F0', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 16 }}>{t.icon}</span>
                      <span style={{ fontSize: 10, fontFamily: 'var(--body-font)', letterSpacing: '1px', textTransform: 'uppercase', color: '#AAAAAA' }}>{t.label}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: '#DA291C', fontWeight: 500 }}>{note.author}</span>
                      <button onClick={() => deleteNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DDDDDD', touchAction: 'manipulation' }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, fontFamily: 'var(--body-font)', margin: 0 }}>{note.content}</p>
                    {/* Reactions */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                      {REACTIONS.map(e => {
                        const cnt = note.reactions?.[e] || 0
                        return (
                          <button key={e} onClick={() => react(note.id, e)} style={{
                            padding: '3px 8px', border: '1px solid #F0F0F0', borderRadius: 100,
                            background: cnt > 0 ? '#FFF0F0' : 'transparent', cursor: 'pointer',
                            fontSize: 12, display: 'flex', alignItems: 'center', gap: 3, touchAction: 'manipulation',
                          }}>
                            {e}{cnt > 0 && <span style={{ fontSize: 10, color: '#DA291C', fontFamily: 'var(--body-font)' }}>{cnt}</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ padding: '6px 14px', background: '#FAFAFA', borderTop: '1px solid #F8F8F8' }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--body-font)', color: '#CCCCCC' }}>
                      {new Date(note.createdAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add note form */}
          {showNoteForm ? (
            <div style={{ borderTop: '1px solid #E8E8E8', padding: '14px 20px', flexShrink: 0, background: '#FAFAFA' }}>
              {/* Note type */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                {NOTE_TYPES.map(t => (
                  <button key={t.id} onClick={() => setNewNote(p => ({ ...p, type: t.id }))} style={{
                    padding: '5px 10px', border: `1px solid ${newNote.type === t.id ? '#181818' : '#E8E8E8'}`,
                    borderRadius: 100, background: newNote.type === t.id ? '#181818' : 'transparent',
                    color: newNote.type === t.id ? '#FFF' : '#666', fontSize: 11, cursor: 'pointer',
                    fontFamily: 'var(--body-font)', display: 'flex', alignItems: 'center', gap: 4, touchAction: 'manipulation',
                  }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              {/* Author */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {MEMBERS.map(m => (
                  <button key={m} onClick={() => setNewNote(p => ({ ...p, author: m }))} style={{
                    padding: '4px 10px', border: `1px solid ${newNote.author === m ? '#DA291C' : '#E8E8E8'}`,
                    borderRadius: 100, background: newNote.author === m ? '#DA291C' : 'transparent',
                    color: newNote.author === m ? '#FFF' : '#666', fontSize: 11, cursor: 'pointer',
                    fontFamily: 'var(--body-font)', touchAction: 'manipulation',
                  }}>{m}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea
                  value={newNote.content}
                  onChange={e => setNewNote(p => ({ ...p, content: e.target.value }))}
                  placeholder="写下你的想法…"
                  autoFocus
                  style={{
                    flex: 1, fontSize: 13, border: '1px solid #E0E0E0', borderRadius: 2,
                    padding: '10px 12px', fontFamily: 'var(--body-font)', resize: 'none', height: 80,
                    background: '#FFF', outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={addNote} style={{
                    width: 40, height: 40, borderRadius: 2, background: '#DA291C', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation',
                  }}>
                    <Send size={16} color="#FFF" />
                  </button>
                  <button onClick={() => setShowNoteForm(false)} style={{
                    width: 40, height: 40, borderRadius: 2, background: '#F0F0F0', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, touchAction: 'manipulation',
                  }}>✕</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #E8E8E8', flexShrink: 0 }}>
              <button onClick={() => setShowNoteForm(true)} style={{
                width: '100%', padding: '12px', background: '#181818', color: '#FFF',
                border: 'none', borderRadius: 2, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, touchAction: 'manipulation',
              }}>
                <Plus size={15} /> 添加团队备注
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
