import { Book } from '../lib/types';

const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
const USER_AGENT_HEADER = {
  'User-Agent': 'Kitaphane/1.0 (kitaphane.app; contact@kitaphane.app)',
};

export interface OpenLibrarySearchOptions {
  query?: string;
  title?: string;
  author?: string;
  subject?: string;
  page?: number;
  limit?: number;
  sort?: 'readinglog' | 'new' | 'old' | 'editions';
}

/**
 * Open Library dokümanını uygulama standart Book formatına normalize eder.
 */
export function normalizeOpenLibraryDoc(doc: any): Omit<Book, 'id'> {
  let thumb: string | null = null;
  if (doc.cover_i) {
    thumb = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
  } else if (Array.isArray(doc.isbn) && doc.isbn.length > 0) {
    thumb = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
  } else if (doc.cover_edition_key) {
    thumb = `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-L.jpg`;
  }

  // En uygun ISBN (tercihen 13 haneli)
  let isbn: string | null = null;
  if (Array.isArray(doc.isbn) && doc.isbn.length > 0) {
    const isbn13 = doc.isbn.find((i: string) => i && i.length === 13);
    isbn = isbn13 || doc.isbn[0];
  }

  const rawKey = doc.key || (doc.edition_key ? doc.edition_key[0] : null);
  const workKey = rawKey ? rawKey.replace('/works/', '').replace('/books/', '') : Math.random().toString(36).substring(2, 9);

  // Kategori temizliği ve Türkçeleştirme
  let categories: string[] = ['Edebiyat', 'Roman'];
  if (Array.isArray(doc.subject) && doc.subject.length > 0) {
    categories = doc.subject.slice(0, 3).map((s: string) => {
      const lower = s.toLowerCase();
      if (lower.includes('fiction')) return 'Kurgu / Roman';
      if (lower.includes('classic')) return 'Dünya Klasikleri';
      if (lower.includes('philosophy')) return 'Felsefe';
      if (lower.includes('history')) return 'Tarih';
      if (lower.includes('poetry')) return 'Şiir';
      if (lower.includes('psychology')) return 'Psikoloji';
      if (lower.includes('turkish')) return 'Türk Edebiyatı';
      return s;
    });
  }

  return {
    google_book_id: `ol_${workKey}`,
    title: doc.title || 'Başlıksız Eser',
    subtitle: doc.subtitle || null,
    authors:
      Array.isArray(doc.author_name) && doc.author_name.length > 0
        ? doc.author_name.slice(0, 3)
        : ['Bilinmeyen Yazar'],
    publisher:
      Array.isArray(doc.publisher) && doc.publisher.length > 0
        ? doc.publisher[0]
        : 'Genel Edebiyat Yayınları',
    published_date: doc.first_publish_year ? String(doc.first_publish_year) : null,
    description: null,
    page_count: doc.number_of_pages_median || doc.number_of_pages || 240,
    categories,
    thumbnail_url: thumb,
    isbn,
    language: Array.isArray(doc.language) && doc.language.length > 0 ? doc.language[0] : 'tr',
    average_rating: null,
    ratings_count: null,
  };
}

export const openLibraryService = {
  /**
   * Open Library Search API:
   * https://openlibrary.org/search.json?q=... veya ?title=... veya ?author=...
   */
  async searchBooks(
    options: OpenLibrarySearchOptions | string
  ): Promise<{ books: Array<Omit<Book, 'id'>>; totalItems: number; error: string | null }> {
    try {
      const opts: OpenLibrarySearchOptions =
        typeof options === 'string' ? { query: options } : options;

      const params = new URLSearchParams();

      if (opts.query && opts.query.trim()) {
        params.append('q', opts.query.trim());
      }
      if (opts.title && opts.title.trim()) {
        params.append('title', opts.title.trim());
      }
      if (opts.author && opts.author.trim()) {
        params.append('author', opts.author.trim());
      }
      if (opts.subject && opts.subject.trim()) {
        params.append('subject', opts.subject.trim());
      }

      const limit = opts.limit || 25;
      const page = opts.page || 1;
      params.append('limit', String(limit));
      params.append('page', String(page));
      params.append(
        'fields',
        'key,title,subtitle,author_name,first_publish_year,cover_i,cover_edition_key,isbn,publisher,number_of_pages_median,number_of_pages,subject,language'
      );
      if (opts.sort) {
        params.append('sort', opts.sort);
      }

      const url = `${OPEN_LIBRARY_BASE}/search.json?${params.toString()}`;
      const response = await fetch(url, { headers: USER_AGENT_HEADER });

      if (!response.ok) {
        return {
          books: [],
          totalItems: 0,
          error: `Open Library sunucusu yanıt vermedi (${response.status})`,
        };
      }

      const data = await response.json();
      const docs = Array.isArray(data.docs) ? data.docs : [];
      const books = docs.map(normalizeOpenLibraryDoc);

      return {
        books,
        totalItems: data.numFound || books.length,
        error: null,
      };
    } catch (err: any) {
      return {
        books: [],
        totalItems: 0,
        error: err.message || 'Open Library servisine ulaşılamadı.',
      };
    }
  },

  /**
   * Open Library Books API (jscmd=data formatında ISBN ile tam detay getirir):
   * https://openlibrary.org/api/books?bibkeys=ISBN:...&jscmd=data&format=json
   */
  async getBookByIsbn(isbn: string): Promise<{ book: Omit<Book, 'id'> | null; error: string | null }> {
    try {
      const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
      const url = `${OPEN_LIBRARY_BASE}/api/books?bibkeys=ISBN:${cleanIsbn}&jscmd=data&format=json`;
      const response = await fetch(url, { headers: USER_AGENT_HEADER });

      if (!response.ok) {
        return { book: null, error: `Kitap bulunamadı (${response.status})` };
      }

      const data = await response.json();
      const raw = data[`ISBN:${cleanIsbn}`];
      if (!raw) {
        return { book: null, error: 'Belirtilen ISBN numarasına ait kitap bulunamadı.' };
      }

      let thumb = raw.cover?.large || raw.cover?.medium || raw.cover?.small || null;
      if (thumb && thumb.startsWith('http://')) {
        thumb = thumb.replace(/^http:\/\//, 'https://');
      }

      const book: Omit<Book, 'id'> = {
        google_book_id: raw.key ? `ol_${raw.key.replace('/books/', '').replace('/works/', '')}` : `ol_${cleanIsbn}`,
        title: raw.title || 'Başlıksız Eser',
        subtitle: raw.subtitle || null,
        authors: Array.isArray(raw.authors) && raw.authors.length > 0 ? raw.authors.map((a: any) => a.name) : ['Bilinmeyen Yazar'],
        publisher: Array.isArray(raw.publishers) && raw.publishers.length > 0 ? raw.publishers[0].name : 'Edebiyat Yayınları',
        published_date: raw.publish_date || null,
        description: typeof raw.notes === 'string' ? raw.notes : (typeof raw.description === 'string' ? raw.description : null),
        page_count: raw.number_of_pages || 240,
        categories: Array.isArray(raw.subjects) ? raw.subjects.slice(0, 3).map((s: any) => s.name) : ['Dünya Klasikleri'],
        thumbnail_url: thumb,
        isbn: cleanIsbn,
        language: 'tr',
        average_rating: null,
        ratings_count: null,
      };

      return { book, error: null };
    } catch (err: any) {
      return { book: null, error: err.message || 'ISBN sorgulama hatası.' };
    }
  },

  /**
   * Open Library Works API ile eserin derin özet/açıklamasını çeker:
   * https://openlibrary.org/works/{work_id}.json
   */
  async getWorkDescription(workKey: string): Promise<string | null> {
    try {
      const cleanKey = workKey.replace(/^ol_/, '').replace('/works/', '').replace('/books/', '');
      const url = `${OPEN_LIBRARY_BASE}/works/${cleanKey}.json`;
      const response = await fetch(url, { headers: USER_AGENT_HEADER });

      if (!response.ok) return null;
      const data = await response.json();

      if (typeof data.description === 'string') return data.description;
      if (data.description && typeof data.description.value === 'string') return data.description.value;
      if (typeof data.notes === 'string') return data.notes;
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Open Library Subjects API ile belirli bir türe göre kitap listesi çeker:
   * https://openlibrary.org/subjects/{subject}.json?limit=...
   */
  async getBooksBySubject(
    subject: string,
    limit = 25
  ): Promise<{ books: Array<Omit<Book, 'id'>>; error: string | null }> {
    try {
      const formattedSubject = subject.toLowerCase().replace(/\s+/g, '_');
      const url = `${OPEN_LIBRARY_BASE}/subjects/${encodeURIComponent(formattedSubject)}.json?limit=${limit}`;
      const response = await fetch(url, { headers: USER_AGENT_HEADER });

      if (!response.ok) {
        return { books: [], error: `Tür sorgulanamadı (${response.status})` };
      }

      const data = await response.json();
      const works = Array.isArray(data.works) ? data.works : [];

      const books = works.map((w: any) => {
        let thumb: string | null = null;
        if (w.cover_id) {
          thumb = `https://covers.openlibrary.org/b/id/${w.cover_id}-L.jpg`;
        } else if (w.cover_edition_key) {
          thumb = `https://covers.openlibrary.org/b/olid/${w.cover_edition_key}-L.jpg`;
        }

        const workKey = w.key ? w.key.replace('/works/', '') : Math.random().toString(36).substring(2, 9);

        return {
          google_book_id: `ol_${workKey}`,
          title: w.title || 'Başlıksız Eser',
          subtitle: null,
          authors: Array.isArray(w.authors) && w.authors.length > 0 ? w.authors.map((a: any) => a.name) : ['Bilinmeyen Yazar'],
          publisher: 'Dünya Klasikleri',
          published_date: w.first_publish_year ? String(w.first_publish_year) : null,
          description: null,
          page_count: 260,
          categories: Array.isArray(w.subject) ? w.subject.slice(0, 3) : [subject],
          thumbnail_url: thumb,
          isbn: null,
          language: 'tr',
          average_rating: null,
          ratings_count: null,
        };
      });

      return { books, error: null };
    } catch (err: any) {
      return { books: [], error: err.message || 'Tür kitapları alınamadı.' };
    }
  },

  /**
   * Open Library Yazar Arama API:
   * https://openlibrary.org/search/authors.json?q=...
   */
  async searchAuthors(authorQuery: string): Promise<Array<{ key: string; name: string; topWork?: string }>> {
    try {
      const url = `${OPEN_LIBRARY_BASE}/search/authors.json?q=${encodeURIComponent(authorQuery.trim())}`;
      const response = await fetch(url, { headers: USER_AGENT_HEADER });
      if (!response.ok) return [];

      const data = await response.json();
      const docs = Array.isArray(data.docs) ? data.docs : [];
      return docs.map((d: any) => ({
        key: d.key,
        name: d.name,
        topWork: d.top_work,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Bir yazarın tüm eserlerini Open Library'den çeker:
   * https://openlibrary.org/authors/{author_id}/works.json?limit=...
   */
  async getAuthorWorks(authorKey: string, limit = 25): Promise<Array<Omit<Book, 'id'>>> {
    try {
      const cleanKey = authorKey.replace('/authors/', '');
      const url = `${OPEN_LIBRARY_BASE}/authors/${cleanKey}/works.json?limit=${limit}`;
      const response = await fetch(url, { headers: USER_AGENT_HEADER });
      if (!response.ok) return [];

      const data = await response.json();
      const entries = Array.isArray(data.entries) ? data.entries : [];

      return entries.map((e: any) => {
        let thumb: string | null = null;
        if (Array.isArray(e.covers) && e.covers.length > 0 && e.covers[0] > 0) {
          thumb = `https://covers.openlibrary.org/b/id/${e.covers[0]}-L.jpg`;
        }

        const workKey = e.key ? e.key.replace('/works/', '') : Math.random().toString(36).substring(2, 9);
        const desc = typeof e.description === 'string' ? e.description : (e.description?.value || null);

        return {
          google_book_id: `ol_${workKey}`,
          title: e.title || 'Başlıksız Eser',
          subtitle: null,
          authors: ['Edebî Yazar'],
          publisher: 'Klasik Yayınlar',
          published_date: null,
          description: desc,
          page_count: 240,
          categories: Array.isArray(e.subjects) ? e.subjects.slice(0, 3) : ['Edebiyat'],
          thumbnail_url: thumb,
          isbn: null,
          language: 'tr',
          average_rating: null,
          ratings_count: null,
        };
      });
    } catch {
      return [];
    }
  },
};
