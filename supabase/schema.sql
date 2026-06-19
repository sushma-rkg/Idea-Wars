-- IdeaWars Supabase schema
-- Run this in your Supabase SQL Editor

create table public.threads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  timer_minutes integer not null default 0 check (timer_minutes in (0, 5, 10)),
  created_at timestamptz not null default now(),
  ends_at timestamptz
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.threads(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create table public.upvotes (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (idea_id, user_id)
);

create index ideas_thread_id_idx on public.ideas(thread_id);
create index upvotes_idea_id_idx on public.upvotes(idea_id);

alter table public.threads enable row level security;
alter table public.ideas enable row level security;
alter table public.upvotes enable row level security;

create policy "Threads are viewable by everyone"
  on public.threads for select using (true);

create policy "Authenticated users can create threads"
  on public.threads for insert
  with check (auth.uid() = created_by);

create policy "Ideas are viewable by everyone"
  on public.ideas for select using (true);

create policy "Authenticated users can post ideas"
  on public.ideas for insert
  with check (auth.uid() = user_id);

create policy "Upvotes are viewable by everyone"
  on public.upvotes for select using (true);

create policy "Authenticated users can upvote"
  on public.upvotes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their upvotes"
  on public.upvotes for delete
  using (auth.uid() = user_id);

-- Optional: view for leaderboard with vote counts
create or replace view public.idea_leaderboard as
select
  i.id,
  i.thread_id,
  i.user_id,
  i.content,
  i.created_at,
  count(u.id)::int as upvote_count
from public.ideas i
left join public.upvotes u on u.idea_id = i.id
group by i.id;

grant select on public.idea_leaderboard to anon, authenticated;

-- Enable realtime for live updates
alter publication supabase_realtime add table public.ideas;
alter publication supabase_realtime add table public.upvotes;
