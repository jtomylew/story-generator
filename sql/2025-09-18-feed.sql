-- Feed Infrastructure Database Setup
-- Chunk 1: Database Setup from ADR-028 Feature Roadmap
-- Creates articles and feed_cache tables with proper indexes, RLS, and seed data

-- 1) Extensions (use pgcrypto for gen_random_uuid + digest)
create extension if not exists pgcrypto;

-- 2) Categories enum (lowercase + 'positive')
do $$ begin
  if not exists (select 1 from pg_type where typname = 'categories') then
    create type categories as enum ('science','nature','sports','arts','education','technology','animals','positive');
  end if;
end $$;

-- 3) Articles table (normalized URL + hash)
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  -- strip query/fragment, trim, lowercase → sha256
  url_hash text generated always as (
    encode(
      digest(
        trim(lower(regexp_replace(url, '(\?|#).*$', ''))),
        'sha256'
      ), 'hex'
    )
  ) stored,
  title text not null,
  content text not null,
  source text not null,                 -- canonical domain (e.g., sciencedaily.com)
  category categories not null,
  published_at timestamptz,             -- nullable if feed lacks it
  extracted_at timestamptz not null default now(),
  meta jsonb default '{}'::jsonb
);

create unique index if not exists ux_articles_url_hash on public.articles (url_hash);
create index if not exists ix_articles_category on public.articles (category);
create index if not exists ix_articles_published_at on public.articles (published_at);
create index if not exists ix_articles_source on public.articles (source);

-- 4) Feed cache table (cached, curated payloads; optional per-device view)
create table if not exists public.feed_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null,              -- e.g., 'home:all' or 'home:science'
  payload jsonb not null,               -- array of article IDs or summarized objects
  refreshed_at timestamptz not null default now(),
  expires_at timestamptz not null,      -- set to now() + interval '24 hours' OR '48 hours' (see below)
  device_id text,
  constraint ux_feed_cache unique (cache_key, coalesce(device_id, ''))
);

create index if not exists ix_feed_cache_expires_at on public.feed_cache (expires_at);
create index if not exists ix_feed_cache_device on public.feed_cache (device_id);

-- 5) RLS posture (enable now; service role bypasses; permissive policies)
alter table public.articles enable row level security;
alter table public.feed_cache enable row level security;

create policy svc_all_articles on public.articles for all using (true) with check (true);
create policy svc_all_feed_cache on public.feed_cache for all using (true) with check (true);

-- 6) Seed sanity rows (deduped by url_hash)
insert into public.articles (url, title, content, source, category, published_at)
values
  ('https://www.sciencedaily.com/example-1',
   'penguins parade brings smiles',
   'scientists observed a surprising penguin parade that delighted kids at the research station…',
   'sciencedaily.com','science', now() - interval '2 hours')
on conflict (url_hash) do nothing;

insert into public.articles (url, title, content, source, category, published_at)
values
  ('https://www.goodnewsnetwork.org/example-2?utm_source=demo',
   'local school plants butterfly garden',
   'students and teachers planted native flowers to help butterflies thrive near their playground…',
   'goodnewsnetwork.org','positive', now() - interval '6 hours')
on conflict (url_hash) do nothing;
