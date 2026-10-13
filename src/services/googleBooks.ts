import { Book, GoogleBookItem } from '../lib/types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

// Güvenli ortam değişkeni: İstemciye zorunlu kılınmaz; varsa kota limitlerini genişletir
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY || '';

/**
 * Google Books API Volume nesnesini veritabanı Book formatına dönüştürür.
 */
export function normalizeGoogleBook(item: GoogleBookItem): Omit<Book, 'id'> {
  const info = item.volumeInfo || {};

  // Kapak URL'ini HTTPS'e çevir
  let thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
  if (thumb) {
    thumb = thumb.replace(/^http:\/\//i, 'https://');
  }

  // ISBN-13 veya ISBN-10 çıkarımı
  let isbn: string | null = null;
  if (info.industryIdentifiers && info.industryIdentifiers.length > 0) {
    const isbn13 = info.industryIdentifiers.find((i) => i.type === 'ISBN_13');
    const isbn10 = info.industryIdentifiers.find((i) => i.type === 'ISBN_10');
    isbn = (isbn13 || isbn10 || info.industryIdentifiers[0]).identifier;
  }

  return {
    google_book_id: item.id,
    title: info.title || 'Başlıksız Eser',
    subtitle: info.subtitle || null,
    authors: info.authors && info.authors.length > 0 ? info.authors : ['Bilinmeyen Yazar'],
    publisher: info.publisher || null,
    published_date: info.publishedDate || null,
    description: info.description || null,
    page_count: info.pageCount || null,
    categories: info.categories && info.categories.length > 0 ? info.categories : null,
    thumbnail_url: thumb,
    isbn,
    language: info.language || 'tr',
    average_rating: info.averageRating || null,
    ratings_count: info.ratingsCount || null,
  };
}

export function normalizeOpenLibraryBook(doc: any): Omit<Book, 'id'> {
  let thumb: string | null = null;
  if (doc.cover_i) {
    thumb = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
  } else if (doc.isbn && doc.isbn.length > 0) {
    thumb = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
  }

  let isbn: string | null = null;
  if (Array.isArray(doc.isbn) && doc.isbn.length > 0) {
    const isbn13 = doc.isbn.find((i: string) => i && i.length === 13);
    isbn = isbn13 || doc.isbn[0];
  }

  const workKey = doc.key ? doc.key.replace('/works/', '') : Math.random().toString(36).substring(2, 9);

  return {
    google_book_id: `ol_${workKey}`,
    title: doc.title || 'Başlıksız Eser',
    subtitle: null,
    authors:
      Array.isArray(doc.author_name) && doc.author_name.length > 0
        ? doc.author_name.slice(0, 3)
        : ['Bilinmeyen Yazar'],
    publisher:
      Array.isArray(doc.publisher) && doc.publisher.length > 0
        ? doc.publisher[0]
        : 'Edebiyat Yayınları',
    published_date: doc.first_publish_year ? String(doc.first_publish_year) : null,
    description: null,
    page_count: doc.number_of_pages_median || (doc.number_of_pages ? doc.number_of_pages : null),
    categories:
      Array.isArray(doc.subject) && doc.subject.length > 0
        ? doc.subject.slice(0, 3)
        : ['Dünya Edebiyatı', 'Roman'],
    thumbnail_url: thumb,
    isbn,
    language: Array.isArray(doc.language) && doc.language.length > 0 ? doc.language[0] : 'tr',
    average_rating: null,
    ratings_count: null,
  };
}

/**
 * Open Library API üzerinde kitap arar (Ücretsiz, limitsiz ve anahtar gerektirmez).
 */
export async function searchOpenLibraryBooks(
  query: string,
  limit = 20
): Promise<{ books: Array<Omit<Book, 'id'>>; totalItems: number; error: string | null }> {
  try {
    const trimmed = query.trim();
    if (!trimmed) {
      return { books: [], totalItems: 0, error: null };
    }

    const encoded = encodeURIComponent(trimmed);
    const url = `https://openlibrary.org/search.json?q=${encoded}&limit=${limit}&fields=key,title,author_name,first_publish_year,cover_i,isbn,publisher,number_of_pages_median,subject`;

    const response = await fetch(url);
    if (!response.ok) {
      return {
        books: [],
        totalItems: 0,
        error: `Open Library API yanıt vermedi (${response.status})`,
      };
    }

    const data = await response.json();
    const docs = Array.isArray(data.docs) ? data.docs : [];
    const books = docs.map(normalizeOpenLibraryBook);

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
}

/**
 * Open Library eserine ait detaylı açıklamayı çeker.
 */
export async function fetchOpenLibraryDescription(workKey: string): Promise<string | null> {
  try {
    const cleanKey = workKey.replace(/^ol_/, '').replace('/works/', '');
    const url = `https://openlibrary.org/works/${cleanKey}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data.description === 'string') return data.description;
    if (data.description && typeof data.description.value === 'string') return data.description.value;
    return null;
  } catch {
    return null;
  }
}

/**
 * Google Books API üzerinde kitap arar; kota veya hata durumunda Open Library'ye otomatik geçer.
 */
export async function searchGoogleBooks(
  query: string,
  maxResults = 20,
  startIndex = 0
): Promise<{ books: Array<Omit<Book, 'id'>>; totalItems: number; error: string | null }> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { books: [], totalItems: 0, error: null };
  }

  try {
    const encoded = encodeURIComponent(trimmed);
    let url = `${GOOGLE_BOOKS_API}?q=${encoded}&maxResults=${maxResults}&startIndex=${startIndex}&printType=books`;
    if (API_KEY) {
      url += `&key=${API_KEY}`;
    }

    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const items: GoogleBookItem[] = data.items || [];
      if (items.length > 0) {
        const books = items.map(normalizeGoogleBook);
        return {
          books,
          totalItems: data.totalItems || books.length,
          error: null,
        };
      }
    }
  } catch (err) {
    // Ağ veya kota hatası durumunda sessizce Open Library fallback'ine geç
  }

  // Google Books 429 döndürdüyse veya boş sonuç verdiyse Open Library'den ara
  return searchOpenLibraryBooks(trimmed, maxResults);
}

/**
 * Belirli bir Google Books Volume ID'sine veya Open Library key'ine ait ayrıntıları getirir.
 */
export async function getGoogleBookById(
  volumeId: string
): Promise<{ book: Omit<Book, 'id'> | null; error: string | null }> {
  try {
    if (volumeId.startsWith('ol_')) {
      const cleanKey = volumeId.replace('ol_', '');
      const url = `https://openlibrary.org/works/${cleanKey}.json`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const desc =
          typeof data.description === 'string'
            ? data.description
            : data.description?.value || null;
        return {
          book: {
            google_book_id: volumeId,
            title: data.title || 'Eser',
            subtitle: null,
            authors: ['Edebî Yazar'],
            publisher: null,
            published_date: null,
            description: desc,
            page_count: null,
            categories: ['Edebiyat'],
            thumbnail_url: null,
            isbn: null,
            language: 'tr',
            average_rating: null,
            ratings_count: null,
          },
          error: null,
        };
      }
    }

    let url = `${GOOGLE_BOOKS_API}/${volumeId}`;
    if (API_KEY) {
      url += `?key=${API_KEY}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      return { book: null, error: 'Kitap bulunamadı.' };
    }
    const data: GoogleBookItem = await response.json();
    return { book: normalizeGoogleBook(data), error: null };
  } catch (err: any) {
    return { book: null, error: err.message || 'Kitap verisi alınamadı.' };
  }
}
