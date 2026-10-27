-- Kitaphane: beğeniler, profil fotoğrafları ve kapak güncellemeleri için izinler
-- Supabase Dashboard > SQL Editor'de bir kez çalıştırın (tekrar çalıştırmak güvenlidir).

-- 1) Beğeniler: herkes okuyabilir, okur yalnızca kendi adına beğenip kaldırabilir
alter table public.likes enable row level security;

drop policy if exists "kitaphane_likes_select" on public.likes;
create policy "kitaphane_likes_select" on public.likes
  for select using (true);

drop policy if exists "kitaphane_likes_insert" on public.likes;
create policy "kitaphane_likes_insert" on public.likes
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "kitaphane_likes_delete" on public.likes;
create policy "kitaphane_likes_delete" on public.likes
  for delete to authenticated using (auth.uid() = user_id);

create unique index if not exists likes_pair_key on public.likes (user_id, post_id);

-- 2) Kitap kataloğu: giriş yapmış okurlar eksik kapak/açıklama/sayfa bilgisini tamamlayabilir
drop policy if exists "kitaphane_books_update" on public.books;
create policy "kitaphane_books_update" on public.books
  for update to authenticated using (true) with check (true);

-- 3) Profil fotoğrafları: herkese açık "avatars" deposu; okur yalnızca kendi klasörüne yazar
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "kitaphane_avatars_read" on storage.objects;
create policy "kitaphane_avatars_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "kitaphane_avatars_insert" on storage.objects;
create policy "kitaphane_avatars_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "kitaphane_avatars_update" on storage.objects;
create policy "kitaphane_avatars_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "kitaphane_avatars_delete" on storage.objects;
create policy "kitaphane_avatars_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
