#!/usr/bin/env node
/**
 * Kitaphane katalog içe aktarıcı
 *
 * Open Library'den Türkçe ve İngilizce eserleri konu başlıklarına göre sayfa sayfa çeker
 * ve `books` tablosuna ekler (zaten var olanları atlar).
 *
 * Kullanım:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/import_catalog.mjs [--lang tur,eng] [--pages 5] [--subjects roman,poetry]
 *
 * Service role anahtarı Supabase Dashboard > Project Settings > API altındadır.
 * Bu anahtarı asla uygulama koduna koymayın; yalnızca bu betiği çalıştırırken ortam değişkeni olarak verin.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qomritegwcfxpwpfhhfw.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY ortam değişkeni gerekli.');
  process.exit(1);
}

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), [])
);
const LANGS = (args.lang || 'tur,eng').split(',');
const PAGES = parseInt(args.pages || '5', 10);
const PAGE_SIZE = 100;
const SUBJECTS = (
  args.subjects ||
  'fiction,classics,turkish literature,poetry,philosophy,history,psychology,science fiction,fantasy,mystery,romance,biography,short stories,essays,children,young adult,science,politics,religion,art'
).split(',');

const NON_LATIN = /[Ͱ-ϿЀ-ӿ֐-׿؀-ۿ぀-ヿ㐀-鿿가-힯]/;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const normalize = (doc) => {
  const key = String(doc.key || '').replace('/works/', '');
  const isbn = Array.isArray(doc.isbn) ? doc.isbn.find((i) => i.length === 13) || doc.isbn[0] : null;
  return {
    google_book_id: `ol_${key}`,
    title: doc.title,
    authors: Array.isArray(doc.author_name) ? doc.author_name.slice(0, 3) : null,
    publisher: Array.isArray(doc.publisher) ? doc.publisher[0] : null,
    published_date: doc.first_publish_year ? String(doc.first_publish_year) : null,
    description: null,
    page_count: doc.number_of_pages_median || null,
    categories: Array.isArray(doc.subject) ? doc.subject.slice(0, 3) : null,
    thumbnail_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null,
    isbn: isbn || null,
  };
};

async function fetchPage(lang, subject, page) {
  const params = new URLSearchParams({
    q: `language:${lang} subject:"${subject}"`,
    fields: 'key,title,author_name,first_publish_year,cover_i,isbn,publisher,number_of_pages_median,subject',
    limit: String(PAGE_SIZE),
    page: String(page),
    sort: 'readinglog',
  });
  const res = await fetch(`https://openlibrary.org/search.json?${params}`, {
    headers: { 'User-Agent': 'Kitaphane catalog importer (kitaphane.app)' },
  });
  if (!res.ok) throw new Error(`Open Library ${res.status}`);
  const data = await res.json();
  return data.docs || [];
}

let added = 0;
for (const lang of LANGS) {
  for (const subject of SUBJECTS) {
    for (let page = 1; page <= PAGES; page++) {
      let docs;
      try {
        docs = await fetchPage(lang, subject, page);
      } catch (e) {
        console.warn(`! ${lang}/${subject} s.${page}: ${e.message}`);
        await sleep(5000);
        continue;
      }
      if (docs.length === 0) break;

      const rows = docs
        .filter((d) => d.key && d.title && d.author_name?.length && !NON_LATIN.test(d.title))
        .map(normalize);
      const { data: existing } = await supabase
        .from('books')
        .select('google_book_id')
        .in('google_book_id', rows.map((r) => r.google_book_id));
      const have = new Set((existing || []).map((r) => r.google_book_id));
      const fresh = rows.filter((r) => !have.has(r.google_book_id));

      if (fresh.length) {
        const { error } = await supabase.from('books').insert(fresh);
        if (error) console.warn(`! insert: ${error.message}`);
        else added += fresh.length;
      }
      console.log(`${lang} · ${subject} · sayfa ${page}: ${fresh.length} yeni (toplam ${added})`);
      await sleep(1100); // Open Library'ye nazik ol
    }
  }
}
console.log(`Bitti. ${added} kitap eklendi.`);
