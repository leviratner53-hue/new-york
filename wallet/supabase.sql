-- Хранилище для синхронизации Кошелька. Выполнить один раз: Supabase → SQL Editor → Run.
-- В таблице лежат только зашифрованные данные; прямого доступа к ней нет,
-- приложение читает и пишет через две функции по секретному id.

create table if not exists public.wallet_sync (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.wallet_sync enable row level security;
revoke all on table public.wallet_sync from anon, authenticated;

create or replace function public.wallet_get(p_id text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select data from public.wallet_sync where id = p_id;
$$;

create or replace function public.wallet_put(p_id text, p_data jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if length(p_id) < 20 or length(p_id) > 64 then
    raise exception 'bad id';
  end if;
  if pg_column_size(p_data) > 5000000 then
    raise exception 'too large';
  end if;
  insert into public.wallet_sync (id, data, updated_at)
  values (p_id, p_data, now())
  on conflict (id) do update set data = excluded.data, updated_at = now();
end;
$$;

revoke all on function public.wallet_get(text) from public;
revoke all on function public.wallet_put(text, jsonb) from public;
grant execute on function public.wallet_get(text) to anon;
grant execute on function public.wallet_put(text, jsonb) to anon;
