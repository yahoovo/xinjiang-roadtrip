import { useState, useEffect } from 'react'
import DayList from './components/DayList'
import MapView from './components/MapView'
import DayPanel from './components/DayPanel'
import NoteModal from './components/NoteModal'
import ExportPDF from './components/ExportPDF'
import { useItinerary } from './hooks/useItinerary'
import { Map, List, CalendarDays, FileDown } from 'lucide-react'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return isMobile
}

export default function App() {
  const { days, checklist, onlineUsers, addNote, deleteNote, addExpense, deleteExpense, toggleChecklist } = useItinerary()
  const [selectedDay, setSelectedDay] = useState(days[0])
  const [activePoi, setActivePoi] = useState(null)
  const [showExport, setShowExport] = useState(false)
  const [mobileTab, setMobileTab] = useState('map')
  const isMobile = useIsMobile()

  const currentDay = days.find(d => d.id === selectedDay?.id) || days[0]

  function handleSelectDay(day) {
    setSelectedDay(day)
    if (isMobile) setMobileTab('map')
  }

  // ── Desktop layout ─────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#000' }}>
        <DayList days={days} selectedDay={currentDay} onSelectDay={handleSelectDay} onlineUsers={onlineUsers} onExport={() => setShowExport(true)} />
        <MapView selectedDay={currentDay} days={days} onPoiClick={setActivePoi} />
        <DayPanel day={currentDay} checklist={checklist} onAddExpense={addExpense} onDeleteExpense={deleteExpense} onToggleChecklist={toggleChecklist} />
        {activePoi && (
          <NoteModal poi={currentDay.pois.find(p => p.id === activePoi.id) || activePoi} onClose={() => setActivePoi(null)} onAddNote={addNote} onDeleteNote={deleteNote} />
        )}
        {showExport && <ExportPDF days={days} checklist={checklist} onClose={() => setShowExport(false)} />}
      </div>
    )
  }

  // ── Mobile layout ──────────────────────────────────────────────
  const TAB_H = 56 // px, plus safe-area-inset-bottom handled via CSS

  const tabs = [
    { id: 'map',      icon: Map,          label: '路线' },
    { id: 'schedule', icon: List,         label: '行程' },
    { id: 'today',    icon: CalendarDays, label: `Day ${currentDay.id}` },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', /* fallback below */ background: '#000', overflow: 'hidden',
    }}>
      {/* ── Main content area ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* Map — always mounted so AMap doesn't reinitialise */}
        <div style={{ position: 'absolute', inset: 0, display: mobileTab === 'map' ? 'flex' : 'none', flexDirection: 'column' }}>
          <MapView
            selectedDay={currentDay}
            days={days}
            onPoiClick={(poi) => { setActivePoi(poi); }}
            isMobile
            bottomOffset={TAB_H}
          />
        </div>

        {/* Schedule */}
        {mobileTab === 'schedule' && (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
            <DayList
              days={days}
              selectedDay={currentDay}
              onSelectDay={handleSelectDay}
              onlineUsers={onlineUsers}
              onExport={() => setShowExport(true)}
              isMobile
            />
          </div>
        )}

        {/* Today */}
        {mobileTab === 'today' && (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff' }}>
            <DayPanel
              day={currentDay}
              checklist={checklist}
              onAddExpense={addExpense}
              onDeleteExpense={deleteExpense}
              onToggleChecklist={toggleChecklist}
              isMobile
            />
          </div>
        )}
      </div>

      {/* ── Bottom tab bar ── */}
      <div style={{
        flexShrink: 0,
        height: TAB_H,
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: '#000000',
        borderTop: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'stretch',
      }}>
        {tabs.map(({ id, icon: Icon, label }) => {
          const active = mobileTab === id
          return (
            <button
              key={id}
              onClick={() => setMobileTab(id)}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                background: 'none', border: 'none', cursor: 'pointer',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon size={20} color={active ? '#DA291C' : '#555'} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{
                fontFamily: 'var(--body-font)',
                fontSize: 10, letterSpacing: '0.8px', textTransform: 'uppercase',
                color: active ? '#DA291C' : '#555',
                fontWeight: active ? 600 : 400,
              }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Overlays */}
      {activePoi && (
        <NoteModal
          poi={currentDay.pois.find(p => p.id === activePoi.id) || activePoi}
          onClose={() => setActivePoi(null)}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
        />
      )}
      {showExport && <ExportPDF days={days} checklist={checklist} onClose={() => setShowExport(false)} />}
    </div>
  )
}
