import { useState, useEffect } from 'react'
import DayList   from './components/DayList'
import MapView   from './components/MapView'
import DayPanel  from './components/DayPanel'
import NoteModal from './components/NoteModal'
import ExportPDF from './components/ExportPDF'
import OutfitView    from './views/OutfitView'
import EquipmentView from './views/EquipmentView'
import PhotoView     from './views/PhotoView'
import DiaryView     from './views/DiaryView'
import { useItinerary } from './hooks/useItinerary'
import { Map, List, Shirt, Camera, Image, BookOpen, CalendarDays } from 'lucide-react'

function useIsMobile() {
  const [v, setV] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return v
}

// ── Nav items ─────────────────────────────────────────────────────
const NAV = [
  { id: 'trip',      icon: Map,         label: '路书',   mobileLabel: '路线' },
  { id: 'schedule',  icon: List,        label: '行程',   mobileLabel: '行程' },
  { id: 'outfit',    icon: Shirt,       label: '穿搭',   mobileLabel: '穿搭' },
  { id: 'equipment', icon: Camera,      label: '设备',   mobileLabel: '设备' },
  { id: 'photos',    icon: Image,       label: '照片',   mobileLabel: '照片' },
  { id: 'diary',     icon: BookOpen,    label: '日记',   mobileLabel: '日记' },
]

// Mobile shows 5 tabs; desktop activity bar shows all 6
const MOBILE_TABS = ['trip', 'outfit', 'equipment', 'photos', 'diary']

export default function App() {
  const { days, checklist, onlineUsers, addNote, deleteNote, addExpense, deleteExpense, toggleChecklist } = useItinerary()
  const [selectedDay, setSelectedDay] = useState(days[0])
  const [activePoi,   setActivePoi]   = useState(null)
  const [showExport,  setShowExport]  = useState(false)
  const [section, setSection]         = useState('trip')   // active section
  const [mobileSubTab, setMobileSubTab] = useState('map')  // for trip section on mobile: map | schedule | today
  const isMobile = useIsMobile()

  const currentDay = days.find(d => d.id === selectedDay?.id) || days[0]

  function handleSelectDay(day) {
    setSelectedDay(day)
    if (isMobile) { setSection('trip'); setMobileSubTab('map') }
  }

  // ════════════════════════════════════════════════════════════════
  // DESKTOP
  // ════════════════════════════════════════════════════════════════
  if (!isMobile) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#000' }}>

        {/* Activity bar */}
        <nav style={{
          width: 56, flexShrink: 0, background: '#0A0A0A',
          borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column',
          alignItems: 'center', paddingTop: 12, gap: 2,
        }}>
          <div style={{ fontSize: 8, fontFamily: 'var(--body-font)', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#DA291C', marginBottom: 10, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>XJ</div>
          {NAV.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setSection(id)} title={label} style={{
              width: 44, height: 44, borderRadius: 2, border: 'none', cursor: 'pointer',
              background: section === id ? '#1a1a1a' : 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              borderLeft: section === id ? '2px solid #DA291C' : '2px solid transparent',
              transition: 'all 0.1s',
            }}
            onMouseEnter={e => { if (section !== id) e.currentTarget.style.background = '#111' }}
            onMouseLeave={e => { if (section !== id) e.currentTarget.style.background = 'transparent' }}>
              <Icon size={18} color={section === id ? '#FFFFFF' : '#555'} strokeWidth={section === id ? 2 : 1.5} />
              <span style={{ fontSize: 8, fontFamily: 'var(--body-font)', letterSpacing: '0.5px', textTransform: 'uppercase', color: section === id ? '#FFFFFF' : '#555' }}>{label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {section === 'trip' && (
            <>
              <DayList days={days} selectedDay={currentDay} onSelectDay={handleSelectDay} onlineUsers={onlineUsers} onExport={() => setShowExport(true)} />
              <MapView selectedDay={currentDay} days={days} onPoiClick={setActivePoi} />
              <DayPanel day={currentDay} checklist={checklist} onAddExpense={addExpense} onDeleteExpense={deleteExpense} onToggleChecklist={toggleChecklist} />
            </>
          )}
          {section === 'schedule' && (
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <DayList days={days} selectedDay={currentDay} onSelectDay={handleSelectDay} onlineUsers={onlineUsers} onExport={() => setShowExport(true)} />
              <div style={{ flex: 1, background: '#FFFFFF', overflow: 'hidden' }}>
                <DayPanel day={currentDay} checklist={checklist} onAddExpense={addExpense} onDeleteExpense={deleteExpense} onToggleChecklist={toggleChecklist} isMobile />
              </div>
            </div>
          )}
          {section === 'outfit'    && <OutfitView />}
          {section === 'equipment' && <EquipmentView />}
          {section === 'photos'    && <PhotoView />}
          {section === 'diary'     && <DiaryView />}
        </div>

        {/* Overlays */}
        {activePoi && (
          <NoteModal poi={currentDay.pois.find(p => p.id === activePoi.id) || activePoi} onClose={() => setActivePoi(null)} onAddNote={addNote} onDeleteNote={deleteNote} />
        )}
        {showExport && <ExportPDF days={days} checklist={checklist} onClose={() => setShowExport(false)} />}
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // MOBILE
  // ════════════════════════════════════════════════════════════════
  const mobileTabs = NAV.filter(n => MOBILE_TABS.includes(n.id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#000', overflow: 'hidden' }}>

      {/* Main area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* TRIP: 地图 + 行程 + 今日 (3 sub-tabs at top) */}
        <div style={{ position: 'absolute', inset: 0, display: section === 'trip' ? 'flex' : 'none', flexDirection: 'column' }}>
          {/* Sub-tab bar */}
          <div style={{
            display: 'flex', background: '#000', borderBottom: '1px solid #1a1a1a', flexShrink: 0,
            paddingTop: 'env(safe-area-inset-top)',
          }}>
            {[['map','地图'],['schedule','行程'],['today',`Day ${currentDay.id}`]].map(([id, label]) => (
              <button key={id} onClick={() => setMobileSubTab(id)} style={{
                flex: 1, padding: '10px 4px', border: 'none', background: 'none', cursor: 'pointer',
                fontFamily: 'var(--body-font)', fontSize: 11, letterSpacing: '0.8px', textTransform: 'uppercase',
                color: mobileSubTab === id ? '#FFFFFF' : '#555',
                fontWeight: mobileSubTab === id ? 600 : 400,
                borderBottom: mobileSubTab === id ? '2px solid #DA291C' : '2px solid transparent',
                touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
              }}>{label}</button>
            ))}
          </div>
          {/* Map (always mounted) */}
          <div style={{ flex: 1, display: mobileSubTab === 'map' ? 'flex' : 'none', flexDirection: 'column' }}>
            <MapView selectedDay={currentDay} days={days} onPoiClick={setActivePoi} isMobile bottomOffset={56} />
          </div>
          {/* Schedule */}
          {mobileSubTab === 'schedule' && (
            <div style={{ flex: 1, overflowY: 'auto', background: '#000' }}>
              <DayList days={days} selectedDay={currentDay} onSelectDay={handleSelectDay} onlineUsers={onlineUsers} onExport={() => setShowExport(true)} isMobile />
            </div>
          )}
          {/* Today detail */}
          {mobileSubTab === 'today' && (
            <div style={{ flex: 1, overflowY: 'auto', background: '#FFF' }}>
              <DayPanel day={currentDay} checklist={checklist} onAddExpense={addExpense} onDeleteExpense={deleteExpense} onToggleChecklist={toggleChecklist} isMobile />
            </div>
          )}
        </div>

        {/* Other sections */}
        {section === 'outfit'    && <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}><OutfitView /></div>}
        {section === 'equipment' && <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}><EquipmentView /></div>}
        {section === 'photos'    && <div style={{ position: 'absolute', inset: 0 }}><PhotoView /></div>}
        {section === 'diary'     && <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}><DiaryView /></div>}
      </div>

      {/* Bottom tab bar */}
      <div style={{
        flexShrink: 0, height: 56, paddingBottom: 'env(safe-area-inset-bottom)',
        background: '#000000', borderTop: '1px solid #1a1a1a', display: 'flex', alignItems: 'stretch',
      }}>
        {mobileTabs.map(({ id, icon: Icon, mobileLabel }) => {
          const active = section === id
          return (
            <button key={id} onClick={() => setSection(id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer',
              touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
            }}>
              <Icon size={20} color={active ? '#DA291C' : '#555'} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{
                fontFamily: 'var(--body-font)', fontSize: 9, letterSpacing: '0.8px', textTransform: 'uppercase',
                color: active ? '#DA291C' : '#555', fontWeight: active ? 600 : 400,
              }}>{mobileLabel}</span>
            </button>
          )
        })}
      </div>

      {/* Overlays */}
      {activePoi && (
        <NoteModal poi={currentDay.pois.find(p => p.id === activePoi.id) || activePoi} onClose={() => setActivePoi(null)} onAddNote={addNote} onDeleteNote={deleteNote} />
      )}
      {showExport && <ExportPDF days={days} checklist={checklist} onClose={() => setShowExport(false)} />}
    </div>
  )
}
