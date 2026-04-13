import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 未配置 Supabase 时导出 null，useItinerary 会降级为本地模式
export const supabase =
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('你的')
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
