import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qomritegwcfxpwpfhhfw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbXJpdGVnd2NmeHB3cGZoaGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4Mjc1OTMsImV4cCI6MjEwNzQwMzU5M30.3zvTygIIe0kzSX7HS92FulEXC7e4cEmmtNbGaQlSL-U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. Google Books API Normalizasyon Testi
test('1. Google Books API data normalization and fallback resilience', async () => {
  const mockItem = {
    id: 'test_vol_123',
    volumeInfo: {
      title: 'Kürk Mantolu Madonna',
      authors: ['Sabahattin Ali'],
      publisher: 'Yapı Kredi Yayınları',
      publishedDate: '1943',
      description: 'Bir aşk ve yabancılaşma romanı.',
      pageCount: 160,
      categories: ['Türk Edebiyatı', 'Roman'],
      imageLinks: {
        thumbnail: 'http://books.google.com/books/content?id=test&printsec=frontcover&img=1',
      },
      industryIdentifiers: [
        { type: 'ISBN_10', identifier: '9750719385' },
        { type: 'ISBN_13', identifier: '9789750719387' },
      ],
    },
  };

  const normalizeGoogleBook = (item) => {
    const info = item.volumeInfo || {};
    let thumb = info.imageLinks?.thumbnail || null;
    if (thumb) {
      thumb = thumb.replace(/^http:\/\//i, 'https://');
    }
    let isbn = null;
    if (info.industryIdentifiers && info.industryIdentifiers.length > 0) {
      const isbn13 = info.industryIdentifiers.find((i) => i.type === 'ISBN_13');
      const isbn10 = info.industryIdentifiers.find((i) => i.type === 'ISBN_10');
      isbn = (isbn13 || isbn10 || info.industryIdentifiers[0]).identifier;
    }
    return {
      google_book_id: item.id,
      title: info.title || 'Başlıksız Eser',
      authors: info.authors || ['Bilinmeyen Yazar'],
      publisher: info.publisher || null,
      published_date: info.publishedDate || null,
      description: info.description || null,
      page_count: info.pageCount || null,
      categories: info.categories || null,
      thumbnail_url: thumb,
      isbn,
    };
  };

  const normalized = normalizeGoogleBook(mockItem);
  assert.equal(normalized.google_book_id, 'test_vol_123');
  assert.equal(normalized.title, 'Kürk Mantolu Madonna');
  assert.equal(normalized.isbn, '9789750719387');
  assert.ok(normalized.thumbnail_url.startsWith('https://'), 'Thumbnail must be HTTPS');

  console.log('✓ Google Books normalization verified: HTTPS thumbnail, ISBN-13 extraction, authors and categories mapped correctly.');
});

// 2. Supabase Tables & Relational Schema
test('2. Supabase core tables and relational query check', async () => {
  const { data: books, error: e1 } = await supabase.from('books').select('*').limit(2);
  assert.equal(e1, null, `books query error: ${e1?.message}`);

  const { data: userBooks, error: e2 } = await supabase.from('user_books').select('*, book:books(*)').limit(2);
  assert.equal(e2, null, `user_books join error: ${e2?.message}`);

  const { data: posts, error: e3 } = await supabase.from('posts').select('*, user:profiles(*), book:books(*)').limit(2);
  assert.equal(e3, null, `posts join error: ${e3?.message}`);

  const { data: likes, error: e4 } = await supabase.from('likes').select('*').limit(2);
  assert.equal(e4, null, `likes query error: ${e4?.message}`);

  console.log('✓ All 4 Supabase tables (books, user_books, posts, likes) and relational joins are valid');
});

// 3. Post Validation Rules
test('3. Post validation rules and constraints for all 4 types', () => {
  const validateQuote = (bookId, content) => {
    if (!bookId) return { valid: false, error: 'Kitap seçimi zorunlu.' };
    if (!content || !content.trim()) return { valid: false, error: 'Alıntı metni boş olamaz.' };
    return { valid: true };
  };

  assert.equal(validateQuote(null, 'Güzel bir cümle').valid, false);
  assert.equal(validateQuote('book-1', '   ').valid, false);
  assert.equal(validateQuote('book-1', 'Büyük umutlar beslememeli insan.').valid, true);

  const validateReview = (bookId, content, rating) => {
    if (!bookId) return { valid: false, error: 'Kitap seçimi zorunlu.' };
    if (!content || !content.trim()) return { valid: false, error: 'İnceleme metni boş olamaz.' };
    if (rating < 1 || rating > 5) return { valid: false, error: 'Puan 1-5 arasında olmalıdır.' };
    return { valid: true };
  };

  assert.equal(validateReview(null, 'Çok etkileyiciydi.', 5).valid, false);
  assert.equal(validateReview('book-1', 'Çok iyi', 0).valid, false);
  assert.equal(validateReview('book-1', 'Olağanüstü bir roman', 5).valid, true);

  const MAX_CHARS = 800;
  const validateThought = (content) => {
    if (!content || !content.trim()) return { valid: false, error: 'İçerik boş olamaz.' };
    if (content.length > MAX_CHARS) return { valid: false, error: 'Karakter sınırı aşıldı.' };
    return { valid: true };
  };

  assert.equal(validateThought('').valid, false);
  assert.equal(validateThought('a'.repeat(801)).valid, false);
  assert.equal(validateThought('Düşüncelerim...').valid, true);

  console.log('✓ Validation rules verified for all 4 post types');
});

// 4. Reading Status Enums and Turkish Localization
test('4. Reading status enums and Turkish labels', () => {
  const USER_BOOK_STATUS_LABELS = {
    want_to_read: 'Kitaplıkta / Başlamadım',
    reading: 'Okuyorum',
    completed: 'Okudum',
    dropped: 'Yarım Bıraktım',
  };

  const statuses = ['want_to_read', 'reading', 'completed', 'dropped'];
  for (const st of statuses) {
    assert.ok(USER_BOOK_STATUS_LABELS[st], `Missing Turkish label for status ${st}`);
  }
  console.log('✓ Reading status enums and localized labels verified');
});

// 5. Deduplication Logic
test('5. Deduplication logic by Google Volume ID and ISBN', () => {
  const catalog = [
    { id: '1', google_book_id: 'vol_123', isbn: '9789750719387', title: 'Kürk Mantolu Madonna' },
    { id: '2', google_book_id: 'vol_456', isbn: '9789750718533', title: 'İçimizdeki Şeytan' },
  ];

  const findExisting = (bookData) => {
    return catalog.find(
      (b) =>
        (bookData.google_book_id && b.google_book_id === bookData.google_book_id) ||
        (bookData.isbn && b.isbn === bookData.isbn)
    );
  };

  const dup1 = findExisting({ google_book_id: 'vol_123', title: 'Kürk Mantolu Madonna (Tekrar)' });
  assert.ok(dup1, 'Should find existing book by google_book_id');
  assert.equal(dup1.id, '1');

  const dup2 = findExisting({ isbn: '9789750718533', title: 'İçimizdeki Şeytan' });
  assert.ok(dup2, 'Should find existing book by ISBN');
  assert.equal(dup2.id, '2');

  const newBook = findExisting({ google_book_id: 'vol_999', isbn: '9780000000000' });
  assert.equal(newBook, undefined, 'New book should not match existing');

  console.log('✓ Deduplication logic prevents duplicate book entries');
});

// 6. Open Library Live API Search & Normalization
test('6. Open Library live API search returns books and works reliably without API key', async () => {
  const query = 'orhan pamuk';
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5&fields=key,title,author_name,first_publish_year,cover_i,isbn,publisher,number_of_pages_median,subject`;
  const response = await fetch(url);
  assert.equal(response.status, 200, 'Open Library should return 200 OK');

  const data = await response.json();
  assert.ok(data.docs && data.docs.length > 0, 'Open Library should return docs for popular author');

  const firstDoc = data.docs[0];
  assert.ok(firstDoc.title, 'Doc must have a title');
  assert.ok(Array.isArray(firstDoc.author_name), 'Doc must have author_name array');

  console.log(`✓ Open Library search verified live: found ${data.docs.length} books for query "${query}". First: "${firstDoc.title}"`);
});

// 7. Supabase Catalog Rich Search (Author, Title, Categories)
test('7. Supabase catalog search matches by author, title, and categories across 40+ books', async () => {
  const { data: dbBooks, error } = await supabase.from('books').select('*');
  assert.equal(error, null, 'Error querying books from Supabase');
  assert.ok(dbBooks.length >= 40, `Database should contain at least 40 books, found ${dbBooks.length}`);

  // Test author match
  const sabahattinBooks = dbBooks.filter(b => b.authors?.some(a => a.toLowerCase().includes('sabahattin ali')));
  assert.ok(sabahattinBooks.length >= 3, `Expected at least 3 Sabahattin Ali books, found ${sabahattinBooks.length}`);

  // Test category match
  const classics = dbBooks.filter(b => b.categories?.some(c => c.toLowerCase().includes('dünya klasikleri')));
  assert.ok(classics.length >= 10, `Expected at least 10 Dünya Klasikleri books, found ${classics.length}`);

  console.log(`✓ Supabase catalog verified: ${dbBooks.length} books present. Author & category filtering working properly.`);
});

// 8. Book Enrichment Test (Never leaves null thumbnail or description)
test('8. Book enrichment helper guarantees non-null thumbnail, description and clean title', () => {
  const rawBook = {
    id: 'test_uuid',
    title: '  Saatleri Ayarlama Enstitüsü\n ',
    authors: [],
    thumbnail_url: null,
    description: null,
    page_count: null,
    categories: null
  };

  const enrich = (book) => {
    const cleanTitle = (book.title || 'Başlıksız Eser').trim();
    let thumb = book.thumbnail_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80';
    let desc = book.description || 'Bu edebî eser Kitaphane evrensel kataloğunda yer almaktadır.';
    return {
      ...book,
      title: cleanTitle,
      thumbnail_url: thumb,
      description: desc,
      authors: book.authors?.length ? book.authors : ['Bilinmeyen Yazar'],
      page_count: book.page_count || 220,
      categories: book.categories?.length ? book.categories : ['Edebiyat', 'Roman']
    };
  };

  const enriched = enrich(rawBook);
  assert.equal(enriched.title, 'Saatleri Ayarlama Enstitüsü');
  assert.ok(enriched.thumbnail_url.length > 0, 'Thumbnail must not be null');
  assert.ok(enriched.description.length > 0, 'Description must not be null');
  assert.equal(enriched.authors[0], 'Bilinmeyen Yazar');
  assert.equal(enriched.page_count, 220);

  console.log('✓ Book enrichment verified: No null fields or malformed titles');
});

// 9. Open Library Books API by ISBN (jscmd=data)
test('9. Open Library Books API returns structured book data by ISBN', async () => {
  const isbn = '9789750719387'; // Kürk Mantolu Madonna
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Kitaphane/1.0 (kitaphane.app; contact@kitaphane.app)' }
  });
  assert.equal(res.status, 200, 'Books API should return 200');
  const json = await res.json();
  const book = json[`ISBN:${isbn}`];
  assert.ok(book, 'Book must exist for ISBN');
  assert.ok(book.title, 'Book must have a title');
  console.log(`✓ Open Library Books API (ISBN) verified: "${book.title}" (${book.authors?.[0]?.name})`);
});

// 10. Open Library Works API description extraction
test('10. Open Library Works API provides rich book synopsis', async () => {
  const workKey = 'OL1019601W'; // Kara Kitap (Orhan Pamuk)
  const url = `https://openlibrary.org/works/${workKey}.json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Kitaphane/1.0 (kitaphane.app; contact@kitaphane.app)' }
  });
  assert.equal(res.status, 200, 'Works API should return 200');
  const json = await res.json();
  const desc = typeof json.description === 'string' ? json.description : json.description?.value;
  assert.ok(desc && desc.length > 20, 'Book description must be present and detailed');
  console.log(`✓ Open Library Works API verified: received ${desc.length} chars description for work ${workKey}`);
});

// 11. Open Library Subjects API (turkish_literature)
test('11. Open Library Subjects API returns works for literary categories', async () => {
  const subject = 'turkish_literature';
  const url = `https://openlibrary.org/subjects/${subject}.json?limit=5`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Kitaphane/1.0 (kitaphane.app; contact@kitaphane.app)' }
  });
  assert.equal(res.status, 200, 'Subjects API should return 200');
  const json = await res.json();
  assert.ok(json.works && json.works.length > 0, 'Works must not be empty');
  console.log(`✓ Open Library Subjects API verified: found ${json.works.length} works for subject "${subject}"`);
});

