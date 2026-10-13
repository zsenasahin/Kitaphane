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

/**
 * Google Books API üzerinde kitap arar.
 */
export async function searchGoogleBooks(
  query: string,
  maxResults = 20,
  startIndex = 0
): Promise<{ books: Array<Omit<Book, 'id'>>; totalItems: number; error: string | null }> {
  try {
    const trimmed = query.trim();
    if (!trimmed) {
      return { books: [], totalItems: 0, error: null };
    }

    const encoded = encodeURIComponent(trimmed);
    let url = `${GOOGLE_BOOKS_API}?q=${encoded}&maxResults=${maxResults}&startIndex=${startIndex}&printType=books`;
    if (API_KEY) {
      url += `&key=${API_KEY}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) {
        return {
          books: [],
          totalItems: 0,
          error: 'Google Books API istek sınırı aşıldı (429). Yerel katalog kullanılıyor.',
        };
      }
      return {
        books: [],
        totalItems: 0,
        error: `Google Books API yanıt vermedi (${response.status})`,
      };
    }

    const data = await response.json();
    const items: GoogleBookItem[] = data.items || [];
    const books = items.map(normalizeGoogleBook);

    return {
      books,
      totalItems: data.totalItems || books.length,
      error: null,
    };
  } catch (err: any) {
    return {
      books: [],
      totalItems: 0,
      error: err.message || 'Google Books servisine ulaşılamadı.',
    };
  }
}

/**
 * Belirli bir Google Books Volume ID'sine ait ayrıntıları getirir.
 */
export async function getGoogleBookById(
  volumeId: string
): Promise<{ book: Omit<Book, 'id'> | null; error: string | null }> {
  try {
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
