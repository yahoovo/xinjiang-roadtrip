import { FileDown, Users } from 'lucide-react'

// Ferrari: left sidebar = Absolute Black (#000000), like the Ferrari nav/hero dark zone
export default function DayList({ days, selectedDay, onSelectDay, onlineUsers, onExport, isMobile = false }) {
  const totalDistance = days.reduce((sum, d) => sum + d.distance, 0)

  return (
    <aside style={{
      width: isMobile ? '100%' : 232,
      flexShrink: 0,
      background: '#000000',
      borderRight: isMobile ? 'none' : '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      fontFamily: "var(--ferrari-sans)",
    }}>
      {/* Header — Ferrari nav block style */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid #1a1a1a',
      }}>
        {/* Prancing Horse stand-in: brand mark */}
        <div style={{
          fontSize: 9,
          fontFamily: 'var(--body-font)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#DA291C',
          marginBottom: 8,
        }}>
          Xinjiang · Road Trip
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#FFFFFF',
          lineHeight: 1.2,
          marginBottom: 4,
        }}>
          北疆自驾路书
        </div>
        <div style={{
          fontFamily: 'var(--body-font)',
          fontSize: 11,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#8F8F8F',
        }}>
          14 DAYS · {totalDistance.toLocaleString()} KM
        </div>

        {/* Online users */}
        {onlineUsers.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={10} color="#8F8F8F" />
            <div style={{ display: 'flex', gap: 4 }}>
              {onlineUsers.slice(0, 3).map(u => (
                <span key={u} style={{
                  fontFamily: 'var(--body-font)',
                  fontSize: 10,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  color: '#DA291C',
                }}>
                  {u}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Day list */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {days.map(day => {
          const isActive = selectedDay?.id === day.id
          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: isActive ? '#1a1a1a' : 'transparent',
                border: 'none',
                borderLeft: isActive ? `2px solid ${day.color}` : '2px solid transparent',
                padding: isMobile ? '13px 20px' : '9px 16px',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#111' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#FFFFFF' : '#969696',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: 2,
                letterSpacing: '0.13px',
              }}>
                {day.title}
              </div>
              <div style={{
                fontFamily: 'var(--body-font)',
                fontSize: 10,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: isActive ? '#666666' : '#333333',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {day.subtitle}
              </div>
            </button>
          )
        })}
      </nav>

      {/* Footer — Ferrari Red primary CTA */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1a1a1a' }}>
        <button
          onClick={onExport}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#DA291C',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 2,
            padding: '12px 10px',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '1.28px',
            cursor: 'pointer',
            fontFamily: 'var(--ferrari-sans)',
            textTransform: 'uppercase',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#B01E0A'}
          onMouseLeave={e => e.currentTarget.style.background = '#DA291C'}
        >
          <FileDown size={13} />
          导出路书
        </button>
      </div>
    </aside>
  )
}
