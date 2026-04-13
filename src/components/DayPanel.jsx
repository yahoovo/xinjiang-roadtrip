import { useState } from 'react'
import { Plus, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { POI_TYPES } from '../data/itinerary'
import { buildDayNavUrl } from '../lib/amapNav'

// Ferrari: right panel = Pure White (#FFFFFF) editorial panel
const CATEGORIES = ['餐饮', '住宿', '门票', '加油', '高速', '购物', '其他']

export default function DayPanel({ day, checklist, onAddExpense, onDeleteExpense, onToggleChecklist }) {
  const [expenseForm, setExpenseForm] = useState({ category: '餐饮', amount: '', note: '' })
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [checklistOpen, setChecklistOpen] = useState(true)
  const [navCopied, setNavCopied] = useState(false)

  function handleNavClick() {
    const url = buildDayNavUrl(day)
    if (!url) return
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      window.open(url, '_blank')
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setNavCopied(true)
        setTimeout(() => setNavCopied(false), 2000)
      })
    }
  }

  const totalExpense = (day.expenses || []).reduce((sum, e) => sum + Number(e.amount), 0)
  const checklistGroups = checklist.reduce((acc, item) => {
    ;(acc[item.category] = acc[item.category] || []).push(item)
    return acc
  }, {})
  const doneCount = checklist.filter(c => c.done).length

  async function handleAddExpense(e) {
    e.preventDefault()
    if (!expenseForm.amount) return
    await onAddExpense(day.id, { ...expenseForm, amount: Number(expenseForm.amount) })
    setExpenseForm({ category: '餐饮', amount: '', note: '' })
    setShowExpenseForm(false)
  }

  const SectionLabel = ({ children, action }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 12,
    }}>
      <span style={{
        fontFamily: 'var(--body-font)',
        fontSize: 10,
        fontWeight: 400,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: '#8F8F8F',
      }}>
        {children}
      </span>
      {action}
    </div>
  )

  return (
    <aside style={{
      width: 272,
      flexShrink: 0,
      background: '#FFFFFF',
      borderLeft: '1px solid #D2D2D2',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto',
      fontFamily: 'var(--ferrari-sans)',
    }}>
      {/* Day header — editorial section title */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid #D2D2D2',
        position: 'sticky', top: 0,
        background: '#FFFFFF', zIndex: 10,
      }}>
        <div style={{
          fontFamily: 'var(--body-font)',
          fontSize: 10, letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#8F8F8F', marginBottom: 6,
        }}>
          Day {day.id} of 14
        </div>
        <div style={{
          fontSize: 18, fontWeight: 500,
          color: '#181818', lineHeight: 1.2,
          marginBottom: 3,
        }}>
          {day.title.replace(/Day \d+ · /, '')}
        </div>
        <div style={{
          fontFamily: 'var(--body-font)',
          fontSize: 12, color: '#8F8F8F',
        }}>
          {day.subtitle}
        </div>
      </div>

      {/* POI list */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #D2D2D2' }}>
        <SectionLabel>今日景点</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {day.pois.map((poi, idx) => {
            const t = POI_TYPES[poi.type] || POI_TYPES.custom
            return (
              <div key={poi.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0',
                borderBottom: idx < day.pois.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{t.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: '#181818',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {poi.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--body-font)',
                    fontSize: 10, letterSpacing: '1px',
                    textTransform: 'uppercase', color: '#8F8F8F',
                  }}>
                    {t.label}
                  </div>
                </div>
                {poi.notes?.length > 0 && (
                  <span style={{
                    fontFamily: 'var(--body-font)',
                    fontSize: 10, letterSpacing: '0.5px',
                    color: '#DA291C', fontWeight: 600,
                  }}>
                    {poi.notes.length}条备注
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 高德导航按钮 */}
      <div style={{ padding: '0 20px 16px', borderBottom: '1px solid #D2D2D2' }}>
        <button
          onClick={handleNavClick}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            background: navCopied ? '#10b981' : '#000000',
            color: '#FFFFFF', border: 'none', borderRadius: 2,
            padding: '10px', cursor: 'pointer',
            fontFamily: 'var(--ferrari-sans)',
            fontSize: 12, fontWeight: 500, letterSpacing: '0.8px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (!navCopied) e.currentTarget.style.background = '#1a1a1a' }}
          onMouseLeave={e => { if (!navCopied) e.currentTarget.style.background = '#000000' }}
        >
          {navCopied ? (
            '✓ 链接已复制'
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              今日高德导航
            </>
          )}
        </button>
        <div style={{
          fontFamily: 'var(--body-font)',
          fontSize: 9, letterSpacing: '0.5px', color: '#CCCCCC',
          textAlign: 'center', marginTop: 5, textTransform: 'uppercase',
        }}>
          {/Mobi|Android|iPhone/i.test(navigator.userAgent) ? '打开高德地图' : '复制链接 · 粘贴至高德'}
        </div>
      </div>

      {/* Expenses */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #D2D2D2' }}>
        <SectionLabel
          action={
            <button
              onClick={() => setShowExpenseForm(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8F8F8F', display: 'flex' }}
              onMouseEnter={e => e.currentTarget.style.color = '#181818'}
              onMouseLeave={e => e.currentTarget.style.color = '#8F8F8F'}
            >
              <Plus size={14} />
            </button>
          }
        >
          当日费用
        </SectionLabel>

        {showExpenseForm && (
          <form onSubmit={handleAddExpense} style={{
            border: '1px solid #CCCCCC', borderRadius: 2,
            padding: 12, marginBottom: 12,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <select value={expenseForm.category}
              onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}
              style={inputSt}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 6 }}>
              <input type="number" placeholder="金额（元）"
                value={expenseForm.amount}
                onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                style={{ ...inputSt, flex: 1 }} min="0" />
              <button type="submit" style={redBtnSt}>添加</button>
            </div>
            <input type="text" placeholder="备注（可选）"
              value={expenseForm.note}
              onChange={e => setExpenseForm(f => ({ ...f, note: e.target.value }))}
              style={inputSt} />
          </form>
        )}

        <div>
          {(!day.expenses || day.expenses.length === 0) ? (
            <p style={{
              fontFamily: 'var(--body-font)', fontSize: 11,
              letterSpacing: '1px', textTransform: 'uppercase',
              color: '#D2D2D2', textAlign: 'center', padding: '12px 0',
            }}>
              暂无记录
            </p>
          ) : day.expenses.map((exp, idx) => (
            <div key={exp.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 0',
              borderBottom: idx < day.expenses.length - 1 ? '1px solid #f5f5f5' : 'none',
            }}>
              <span style={{
                fontFamily: 'var(--body-font)', fontSize: 10,
                letterSpacing: '1px', textTransform: 'uppercase',
                color: '#8F8F8F', width: 36, flexShrink: 0,
              }}>{exp.category}</span>
              <span style={{ fontSize: 12, color: '#666666', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {exp.note || ''}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#181818' }}>
                ¥{Number(exp.amount).toLocaleString()}
              </span>
              <button onClick={() => onDeleteExpense(exp.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D2D2D2', padding: 2 }}
                onMouseEnter={e => e.currentTarget.style.color = '#DA291C'}
                onMouseLeave={e => e.currentTarget.style.color = '#D2D2D2'}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {totalExpense > 0 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginTop: 12, paddingTop: 12, borderTop: '1px solid #D2D2D2',
          }}>
            <span style={{
              fontFamily: 'var(--body-font)', fontSize: 10,
              letterSpacing: '1px', textTransform: 'uppercase', color: '#8F8F8F',
            }}>
              今日合计
            </span>
            <span style={{ fontSize: 20, fontWeight: 600, color: '#181818' }}>
              ¥{totalExpense.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div style={{ padding: '16px 20px' }}>
        <button onClick={() => setChecklistOpen(v => !v)} style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: checklistOpen ? 12 : 0,
        }}>
          <span style={{
            fontFamily: 'var(--body-font)', fontSize: 10,
            letterSpacing: '1px', textTransform: 'uppercase', color: '#8F8F8F',
          }}>
            行前清单 {doneCount}/{checklist.length}
          </span>
          {checklistOpen
            ? <ChevronUp size={12} color="#8F8F8F" />
            : <ChevronDown size={12} color="#8F8F8F" />}
        </button>

        {checklistOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(checklistGroups).map(([cat, items]) => (
              <div key={cat}>
                <p style={{
                  fontFamily: 'var(--body-font)', fontSize: 10,
                  letterSpacing: '1px', textTransform: 'uppercase',
                  color: '#CCCCCC', marginBottom: 8,
                }}>
                  {cat}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => onToggleChecklist(item.id)} style={{
                        width: 15, height: 15, borderRadius: 2,
                        border: item.done ? 'none' : '1px solid #CCCCCC',
                        background: item.done ? '#181818' : 'transparent',
                        cursor: 'pointer', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.1s',
                      }}>
                        {item.done && <Check size={9} color="#FFFFFF" strokeWidth={3} />}
                      </button>
                      <span style={{
                        fontSize: 12, fontWeight: item.done ? 400 : 500,
                        color: item.done ? '#D2D2D2' : '#181818',
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
        )}
      </div>
    </aside>
  )
}

const inputSt = {
  width: '100%', fontSize: 12, color: '#181818',
  padding: '8px 10px', borderRadius: 2,
  border: '1px solid #CCCCCC', outline: 'none',
  fontFamily: 'var(--ferrari-sans)', background: '#FFFFFF',
}

const redBtnSt = {
  background: '#DA291C', color: '#FFFFFF',
  border: 'none', borderRadius: 2,
  padding: '8px 14px', fontSize: 12,
  fontWeight: 500, cursor: 'pointer',
  fontFamily: 'var(--ferrari-sans)',
  letterSpacing: '0.5px', whiteSpace: 'nowrap',
}
