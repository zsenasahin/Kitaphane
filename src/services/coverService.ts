import { safeStorage, supabase } from '../lib/supabase';

/**
 * Kapağı olmayan kitapların gerçek kapağını dış katalogdan bulur.
 * Sonuçlar cihazda saklanır ve katalogdaki kayda da işlenir; böylece her kitap yalnızca bir kez aranır.
 */

const STORAGE_KEY = 'kitaphane.covers.v1';
const MAX_CONCURRENT = 3;

type Entry = string | null; // null: aranıp bulunamadı
const cache = new Map<string, Entry>();
const pending = new Map<string, Promise<Entry>>();
const queue: Array<() => void> = [];
let running = 0;
let loaded: Promise<void> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

const keyOf = (title: string, author?: string | null) =>
  `${title.trim().toLocaleLowerCase('tr')}|${(author || '').trim().toLocaleLowerCase('tr')}`;

const load = () =>
  (loaded ??= safeStorage.getItem(STORAGE_KEY).then((raw) => {
    try {
      Object.entries(JSON.parse(raw || '{}') as Record<string, Entry>).forEach(([k, v]) => cache.set(k, v));
    } catch {
      // bozuk önbellek yok sayılır
    }
  }));

const persist = () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const entries = Array.from(cache.entries()).slice(-800);
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  }, 800);
};

const schedule = <T,>(task: () => Promise<T>): Promise<T> =>
  new Promise((resolve) => {
    const run = () => {
      running++;
      task()
        .then(resolve, () => resolve(null as T))
        .finally(() => {
          running--;
          queue.shift()?.();
        });
    };
    if (running < MAX_CONCURRENT) run();
    else queue.push(run);
  });

async function lookup(title: string, author?: string | null, isbn?: string | null): Promise<Entry> {
  if (isbn) {
    const res = await fetch(`https://openlibrary.org/search.json?isbn=${encodeURIComponent(isbn)}&limit=1&fields=cover_i`);
    if (res.ok) {
      const cover = (await res.json()).docs?.[0]?.cover_i;
      if (cover) return `https://covers.openlibrary.org/b/id/${cover}-L.jpg`;
    }
  }
  const params = new URLSearchParams({ title, limit: '8', fields: 'cover_i', lang: 'tr' });
  if (author) params.set('author', author);
  const res = await fetch(`https://openlibrary.org/search.json?${params}`);
  if (!res.ok) throw new Error(String(res.status)); // ağ hatasında "bulunamadı" diye işaretleme
  const doc = (await res.json()).docs?.find((d: any) => d.cover_i);
  return doc ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null;
}

export const coverService = {
  /** Önbellekte varsa senkron döndürür (undefined: henüz aranmadı). */
  peek(title: string, author?: string | null): Entry | undefined {
    return cache.get(keyOf(title, author));
  },

  async resolve(title: string, author?: string | null, isbn?: string | null): Promise<Entry> {
    if (!title) return null;
    await load();
    const key = keyOf(title, author);
    if (cache.has(key)) return cache.get(key)!;
    if (pending.has(key)) return pending.get(key)!;

    const p = schedule(async () => {
      try {
        const url = await lookup(title, author, isbn);
        cache.set(key, url);
        persist();
        if (url) {
          // Katalogdaki kapaksız kayda işle (izin yoksa sessizce atlanır)
          supabase.from('books').update({ thumbnail_url: url }).eq('title', title).is('thumbnail_url', null).then(() => undefined);
        }
        return url;
      } catch {
        return null; // geçici hata: önbelleğe yazmadan bir sonraki açılışta tekrar denenir
      } finally {
        pending.delete(key);
      }
    });
    pending.set(key, p);
    return p;
  },
};
