-- ═══════════════════════════════════════════════════════
--  北疆自驾路书 · Supabase 数据库建表脚本
--  在 Supabase Dashboard → SQL Editor 中执行此文件
-- ═══════════════════════════════════════════════════════

-- 1. POI 备注（团队共享）
create table if not exists poi_notes (
  id          uuid primary key default gen_random_uuid(),
  poi_id      text not null,           -- 对应 itinerary.js 中的 poi.id
  content     text not null,
  author      text not null default '匿名',
  created_at  timestamptz not null default now()
);

-- 开启实时同步
alter publication supabase_realtime add table poi_notes;

-- 2. 每日费用
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  day_id      integer not null,        -- 对应 day.id (1-14)
  category    text not null,
  amount      numeric(10,2) not null,
  note        text,
  created_at  timestamptz not null default now()
);

alter publication supabase_realtime add table expenses;

-- 3. 行前清单（同步所有成员勾选状态）
create table if not exists checklist (
  id          text primary key,        -- 对应 DEFAULT_CHECKLIST 中的 id
  category    text not null,
  text        text not null,
  done        boolean not null default false,
  updated_at  timestamptz not null default now()
);

alter publication supabase_realtime add table checklist;

-- ───────────────────────────────────────────────────────
-- RLS 策略（开发阶段允许所有操作，上线前按需收紧）
-- ───────────────────────────────────────────────────────
alter table poi_notes enable row level security;
alter table expenses   enable row level security;
alter table checklist  enable row level security;

create policy "allow_all_poi_notes" on poi_notes for all using (true) with check (true);
create policy "allow_all_expenses"  on expenses   for all using (true) with check (true);
create policy "allow_all_checklist" on checklist  for all using (true) with check (true);
