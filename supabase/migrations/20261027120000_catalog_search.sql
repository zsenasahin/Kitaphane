-- Kitaphane: katalog araması, tekilleştirme ve takip bütünlüğü
-- Supabase Dashboard > SQL Editor'de bir kez çalıştırın (tekrar çalıştırmak güvenlidir).

create extension if not exists pg_trgm;

-- 1) Kitaplar: eksik kolonlar
alter table public.books add column if not exists subtitle text;
alter table public.books add column if not exists language text;

-- Stok fotoğraflar gerçek kapak değil; uygulama bunların yerine tasarım kapak çizer
update public.books set thumbnail_url = null where thumbnail_url ilike '%unsplash.com%';

-- 2) Aynı dış kaynak kaydının iki kez eklenmesini engelle (NULL değerler serbest)
create unique index if not exists books_google_book_id_key on public.books (google_book_id);

-- 3) Arama metni: başlık + yazarlar + ISBN (küçük harf, trigram indeksli)
create or replace function public.books_search_text(title text, authors text[], isbn text)
returns text
language sql
immutable
as $$
  select lower(coalesce(title, '') || ' ' || coalesce(array_to_string(authors, ' '), '') || ' ' || coalesce(isbn, ''))
$$;

alter table public.books
  add column if not exists search_text text
  generated always as (public.books_search_text(title, authors, isbn)) stored;

create index if not exists books_search_text_trgm on public.books using gin (search_text gin_trgm_ops);

-- 4) Uygulamanın kullandığı arama fonksiyonu: booksService.searchCatalog → rpc('search_books')
create or replace function public.search_books(q text, max_results int default 30)
returns setof public.books
language sql
stable
security invoker
as $$
  select b.*
  from public.books b
  where b.search_text ilike '%' || lower(trim(q)) || '%'
     or similarity(b.search_text, lower(trim(q))) > 0.25
  order by
    (lower(b.title) = lower(trim(q))) desc,
    (lower(b.title) like lower(trim(q)) || '%') desc,
    similarity(b.search_text, lower(trim(q))) desc,
    (b.thumbnail_url is not null) desc
  limit greatest(1, least(max_results, 100));
$$;

grant execute on function public.search_books(text, int) to anon, authenticated;

-- 5) Takip: aynı kişiyi iki kez takip etmeyi ve kendini takip etmeyi engelle
create unique index if not exists follows_pair_key on public.follows (follower_id, following_id);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'follows_not_self') then
    alter table public.follows add constraint follows_not_self check (follower_id <> following_id);
  end if;
end $$;

-- 6) Beğeni: aynı paylaşımı iki kez beğenmeyi engelle
create unique index if not exists likes_pair_key on public.likes (user_id, post_id);

-- 7) Sık kullanılan sorgular için indeksler
create index if not exists posts_user_created_idx on public.posts (user_id, created_at desc);
create index if not exists posts_book_type_idx on public.posts (book_id, post_type);
create index if not exists user_books_user_status_idx on public.user_books (user_id, status);
