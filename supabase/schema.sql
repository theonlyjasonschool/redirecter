create table if not exists public.site_state (
  id boolean primary key default true check (id = true),
  maintenance_enabled boolean not null default false,
  countdown_name text,
  countdown_ends_at timestamptz,
  announcement text,
  updated_at timestamptz not null default now()
);

insert into public.site_state (id)
values (true)
on conflict (id) do nothing;

alter table public.site_state enable row level security;

drop policy if exists "Anyone can read site state" on public.site_state;
create policy "Anyone can read site state"
  on public.site_state for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on public.site_state from anon, authenticated;

do $$
begin
  alter publication supabase_realtime add table public.site_state;
exception
  when duplicate_object then null;
end $$;
