import { useState } from 'react'
import DayList from './components/DayList'
import MapView from './components/MapView'
import DayPanel from './components/DayPanel'
import NoteModal from './components/NoteModal'
import ExportPDF from './components/ExportPDF'
import { useItinerary } from './hooks/useItinerary'
import { FileDown } from 'lucide-react'

export default function App() {
  const {
    days,
    checklist,
    onlineUsers,
    addNote,
    deleteNote,
    addExpense,
    deleteExpense,
    toggleChecklist,
  } = useItinerary()

  const [selectedDay, setSelectedDay] = useState(days[0])
  const [activePoi, setActivePoi] = useState(null)
  const [showExport, setShowExport] = useState(false)

  const currentDay = days.find(d => d.id === selectedDay?.id) || days[0]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      {/* 左侧：14天行程列表 */}
      <DayList
        days={days}
        selectedDay={currentDay}
        onSelectDay={setSelectedDay}
        onlineUsers={onlineUsers}
        onExport={() => setShowExport(true)}
      />

      {/* 中间：高德地图 */}
      <MapView
        selectedDay={currentDay}
        onPoiClick={setActivePoi}
      />

      {/* 右侧：费用 + 清单 */}
      <DayPanel
        day={currentDay}
        checklist={checklist}
        onAddExpense={addExpense}
        onDeleteExpense={deleteExpense}
        onToggleChecklist={toggleChecklist}
      />

      {/* POI 备注弹窗 */}
      {activePoi && (
        <NoteModal
          poi={currentDay.pois.find(p => p.id === activePoi.id) || activePoi}
          onClose={() => setActivePoi(null)}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
        />
      )}

      {/* PDF 导出弹窗 */}
      {showExport && (
        <ExportPDF
          days={days}
          checklist={checklist}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
