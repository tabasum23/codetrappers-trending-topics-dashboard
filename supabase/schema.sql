create extension if not exists pgcrypto;
create table if not exists public.trending_topics(
 id uuid primary key default gen_random_uuid(),
 title text not null,
 category text not null check(category in ('AI','Web Development','App Development')),
 summary text, source_name text, source_url text not null,
 published_at timestamptz, discovered_at timestamptz not null default now(),
 relevance_score int default 50 check(relevance_score between 0 and 100),
 status text not null default 'new' check(status in ('new','shortlisted','rejected','finalized')),
 external_id text unique, created_at timestamptz not null default now()
);
create index if not exists topics_category_idx on public.trending_topics(category);
create index if not exists topics_status_idx on public.trending_topics(status);
alter table public.trending_topics enable row level security;
create policy "Team can read topics" on public.trending_topics for select to authenticated using(true);
create policy "Team can update topics" on public.trending_topics for update to authenticated using(true) with check(true);
-- Edge Function inserts with service-role credentials. Never expose service role in browser.
