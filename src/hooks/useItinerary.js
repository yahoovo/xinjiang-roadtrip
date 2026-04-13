import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { TRIP_DAYS, DEFAULT_CHECKLIST } from '../data/itinerary'

/**
 * 管理行程数据 + Supabase 实时同步（无 Supabase 时降级为纯本地模式）
 */
export function useItinerary() {
  const [days, setDays] = useState(TRIP_DAYS)
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST)
  const [onlineUsers, setOnlineUsers] = useState([])

  const hasSupabase = !!supabase

  useEffect(() => {
    if (!hasSupabase) return
    loadNotes()
    loadExpenses()
    loadChecklist()
    const unsub = subscribeToChanges()
    trackPresence()
    return unsub
  }, [])

  async function loadNotes() {
    if (!supabase) return
    const { data } = await supabase.from('poi_notes').select('*')
    if (!data) return
    setDays(prev =>
      prev.map(day => ({
        ...day,
        pois: day.pois.map(poi => ({
          ...poi,
          notes: data.filter(n => n.poi_id === poi.id),
        })),
      }))
    )
  }

  async function loadExpenses() {
    if (!supabase) return
    const { data } = await supabase.from('expenses').select('*')
    if (!data) return
    setDays(prev =>
      prev.map(day => ({
        ...day,
        expenses: data.filter(e => e.day_id === day.id),
      }))
    )
  }

  async function loadChecklist() {
    if (!supabase) return
    const { data } = await supabase.from('checklist').select('*')
    if (data && data.length > 0) setChecklist(data)
  }

  function subscribeToChanges() {
    if (!supabase) return () => {}
    const channel = supabase
      .channel('realtime-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poi_notes' }, loadNotes)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, loadExpenses)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist' }, loadChecklist)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }

  function trackPresence() {
    if (!supabase) return
    const userName = localStorage.getItem('userName') || `旅伴${Math.floor(Math.random() * 100)}`
    localStorage.setItem('userName', userName)
    const channel = supabase.channel('online-users', {
      config: { presence: { key: userName } },
    })
    channel
      .on('presence', { event: 'sync' }, () => {
        setOnlineUsers(Object.keys(channel.presenceState()))
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name: userName, online_at: new Date().toISOString() })
        }
      })
  }

  const addNote = useCallback(async (poiId, content) => {
    if (!supabase) return
    const userName = localStorage.getItem('userName') || '匿名'
    await supabase.from('poi_notes').insert({
      poi_id: poiId,
      content,
      author: userName,
      created_at: new Date().toISOString(),
    })
    await loadNotes()
  }, [])

  const deleteNote = useCallback(async (noteId) => {
    if (!supabase) return
    await supabase.from('poi_notes').delete().eq('id', noteId)
  }, [])

  const addExpense = useCallback(async (dayId, item) => {
    if (supabase) {
      await supabase.from('expenses').insert({ ...item, day_id: dayId })
      await loadExpenses()
    } else {
      // 本地模式
      setDays(prev => prev.map(d =>
        d.id === dayId
          ? { ...d, expenses: [...(d.expenses || []), { ...item, id: Date.now().toString() }] }
          : d
      ))
    }
  }, [])

  const deleteExpense = useCallback(async (expenseId) => {
    if (supabase) {
      await supabase.from('expenses').delete().eq('id', expenseId)
      await loadExpenses()
    } else {
      setDays(prev => prev.map(d => ({
        ...d,
        expenses: (d.expenses || []).filter(e => e.id !== expenseId),
      })))
    }
  }, [])

  const toggleChecklist = useCallback(async (itemId) => {
    const item = checklist.find(c => c.id === itemId)
    if (!item) return
    const newDone = !item.done
    setChecklist(prev => prev.map(c => c.id === itemId ? { ...c, done: newDone } : c))
    if (supabase) {
      await supabase.from('checklist').upsert({ ...item, done: newDone }, { onConflict: 'id' })
    }
  }, [checklist])

  return {
    days,
    checklist,
    onlineUsers,
    hasSupabase,
    addNote,
    deleteNote,
    addExpense,
    deleteExpense,
    toggleChecklist,
  }
}
