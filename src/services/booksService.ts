import { supabase } from '../lib/supabase';
import { Book } from '../lib/types';
import { searchGoogleBooks } from './googleBooks';

export const isUuid = (id?: string | null): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

const STARTER_BOOKS: Book[] = [
  {
    id: '39132147-1797-481a-aa2c-4f9b91dca0e8',
    google_book_id: 'vol_sabahattin_ali_kmm',
    title: 'Kürk Mantolu Madonna',
    subtitle: 'Bir Aşk ve Yabancılaşma Hikayesi',
    authors: ['Sabahattin Ali'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1943',
    description:
      'Sabahattin Ali\'nin 1943 yılında yayımlanan bu ölümsüz romanı, Raif Efendi\'nin gençlik yıllarında Berlin\'de tanıştığı Maria Puder ile yaşadığı hüzünlü ve derin aşkı konu alır. İnsan ruhunun en gizli kıvrımlarını ustalıkla yansıtan başyapıt.',
    page_count: 160,
    categories: ['Türk Edebiyatı', 'Roman', 'Dünya Klasikleri'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    isbn: '9789750719387',
    language: 'tr',
  },
  {
    id: '8f7ebd14-0c61-4f75-be84-441db77e3d82',
    google_book_id: 'vol_tanpinar_sae',
    title: 'Saatleri Ayarlama Enstitüsü',
    subtitle: 'Doğu ile Batı Arasında',
    authors: ['Ahmet Hamdi Tanpınar'],
    publisher: 'Dergâh Yayınları',
    published_date: '1961',
    description:
      'Modern Türk edebiyatının başyapıtlarından biri olan eser, Doğu ile Batı uygarlıkları arasında bocalayan Türk toplumunun ironik, felsefi ve derinlikli bir panoramasını çizer.',
    page_count: 382,
    categories: ['Türk Edebiyatı', 'Felsefe', 'Roman'],
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    isbn: '9789759955748',
    language: 'tr',
  },
  {
    id: 'fe797697-afe2-4596-a532-2eebc4058530',
    google_book_id: 'vol_oguz_atay_tutunamayanlar',
    title: 'Tutunamayanlar',
    subtitle: 'Selim Işık\'ın İzinde',
    authors: ['Oğuz Atay'],
    publisher: 'İletişim Yayınları',
    published_date: '1972',
    description:
      'Türk edebiyatında postmodernizmin öncüsü sayılan Tutunamayanlar, intihar eden arkadaşı Selim Işık\'ın geçmişini araştıran Turgut Özben\'in varoluşsal serüvenini anlatır.',
    page_count: 724,
    categories: ['Roman', 'Felsefe', 'Türk Edebiyatı'],
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    isbn: '9789754700114',
    language: 'tr',
  },
  {
    id: '08ff7956-b2f3-45e0-98bb-853fb4b6b109',
    google_book_id: 'vol_dostoyevski_sucveceza',
    title: 'Suç ve Ceza',
    subtitle: 'Raskolnikov\'un Vicdan Muhasebesi',
    authors: ['Fyodor Dostoyevski'],
    publisher: 'Can Yayınları',
    published_date: '1866',
    description:
      'Yoksul bir öğrenci olan Raskolnikov\'un işlediği cinayet ve sonrasında yaşadığı büyük vicdani ve ahlaki buhranı anlatan dünya klasiği.',
    page_count: 688,
    categories: ['Dünya Klasikleri', 'Psikoloji', 'Roman'],
    thumbnail_url: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80',
    isbn: '9789750738609',
    language: 'tr',
  },
  {
    id: '6115ed69-3aa6-4d8e-8f9d-1ed4b0682361',
    google_book_id: 'vol_paulo_coelho_simyaci',
    title: 'Simyacı',
    subtitle: 'Kişisel Menkıbenin Peşinde',
    authors: ['Paulo Coelho'],
    publisher: 'Can Yayınları',
    published_date: '1988',
    description:
      'Endülüslü çoban Santiago\'nun Mısır piramitlerinin eteklerinde hazinesini aramak üzere çıktığı efsanevi ve felsefi yolculuk.',
    page_count: 184,
    categories: ['Felsefe', 'Roman', 'Dünya Klasikleri'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    isbn: '9789750726439',
    language: 'tr',
  },
];

export const booksService = {
  /**
   * Kitap Arama: Önce Supabase yerel veritabanında arar, ardından Google Books sonuçlarıyla zenginleştirir.
   */
  async searchBooks(
    query: string,
    limit = 20
  ): Promise<{ books: Book[]; fromApiCount: number; error: string | null }> {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      // Boş sorguda veritabanındaki kitapları getir
      const { data: popular } = await supabase
        .from('books')
        .select('*')
        .limit(limit)
        .order('created_at', { ascending: false });

      if (popular && popular.length > 0) {
        return { books: popular, fromApiCount: 0, error: null };
      }

      // Veritabanı henüz boşsa başlangıç kataloğunu sun
      return { books: STARTER_BOOKS, fromApiCount: 0, error: null };
    }

    try {
      // 1. Adım: Yerel veritabanında arama yap (Title veya ISBN)
      const { data: localBooks } = await supabase
        .from('books')
        .select('*')
        .or(`title.ilike.%${trimmed}%,isbn.ilike.%${trimmed}%`)
        .limit(limit);

      const localList: Book[] = localBooks || [];

      // 2. Adım: Google Books API sonuçlarıyla zenginleştir
      const existingGoogleIds = new Set(
        localList.filter((b) => b.google_book_id).map((b) => b.google_book_id)
      );

      const { books: apiBooks } = await searchGoogleBooks(trimmed, limit);

      const mergedList: Book[] = [...localList];
      let fromApiCount = 0;

      for (const apiBook of apiBooks) {
        if (apiBook.google_book_id && !existingGoogleIds.has(apiBook.google_book_id)) {
          mergedList.push({
            id: `temp_${apiBook.google_book_id}`,
            ...apiBook,
          });
          fromApiCount++;
        }
      }

      // Eğer hem DB hem de dış API sonuç vermediyse başlangıç eserleri arasında filtrele
      if (mergedList.length === 0) {
        const fallbackMatches = STARTER_BOOKS.filter((b) => {
          const matchTitle = b.title.toLowerCase().includes(trimmed);
          const matchAuthor = b.authors?.some((a) => a.toLowerCase().includes(trimmed));
          const matchCat = b.categories?.some((c) => c.toLowerCase().includes(trimmed));
          const matchIsbn = b.isbn?.toLowerCase().includes(trimmed);
          return matchTitle || matchAuthor || matchCat || matchIsbn;
        });

        if (fallbackMatches.length > 0) {
          return { books: fallbackMatches, fromApiCount: 0, error: null };
        }
      }

      return { books: mergedList, fromApiCount, error: null };
    } catch (err: any) {
      return { books: [], fromApiCount: 0, error: err.message || 'Kitap arama hatası.' };
    }
  },

  /**
   * Bir kitabı yerel veritabanında bulur veya yoksa kaydeder (UUID döndürür).
   */
  async findOrCreateBook(
    bookData: Omit<Book, 'id'> | Book
  ): Promise<{ book: Book | null; error: string | null }> {
    try {
      // Zaten gerçek bir Supabase UUID ise doğrudan kontrol et
      if ('id' in bookData && bookData.id && isUuid(bookData.id)) {
        const { data: existing } = await supabase
          .from('books')
          .select('*')
          .eq('id', bookData.id)
          .maybeSingle();
        if (existing) return { book: existing, error: null };
      }

      // 1. Google Book ID ile kontrol et
      if (bookData.google_book_id) {
        const { data: byGoogleId } = await supabase
          .from('books')
          .select('*')
          .eq('google_book_id', bookData.google_book_id)
          .maybeSingle();

        if (byGoogleId) {
          return { book: byGoogleId, error: null };
        }
      }

      // 2. ISBN ile kontrol et
      if (bookData.isbn) {
        const { data: byIsbn } = await supabase
          .from('books')
          .select('*')
          .eq('isbn', bookData.isbn)
          .maybeSingle();

        if (byIsbn) {
          return { book: byIsbn, error: null };
        }
      }

      // 3. Başlık ile kontrol et
      if (bookData.title) {
        const { data: byTitle } = await supabase
          .from('books')
          .select('*')
          .ilike('title', bookData.title.trim())
          .maybeSingle();

        if (byTitle) {
          return { book: byTitle, error: null };
        }
      }

      // 4. Veritabanına yeni kitap olarak kaydet
      const insertPayload = {
        google_book_id: bookData.google_book_id || null,
        title: bookData.title,
        authors: bookData.authors || ['Bilinmeyen Yazar'],
        publisher: bookData.publisher || null,
        published_date: bookData.published_date || null,
        description: bookData.description || null,
        page_count: bookData.page_count || null,
        categories: bookData.categories || null,
        thumbnail_url: bookData.thumbnail_url || null,
        isbn: bookData.isbn || null,
      };

      const { data: inserted, error: insertError } = await supabase
        .from('books')
        .insert(insertPayload)
        .select()
        .single();

      if (insertError) {
        // Eşzamanlı kayıt durumunda tekrar kontrol et
        if (bookData.title) {
          const { data: retry } = await supabase
            .from('books')
            .select('*')
            .ilike('title', bookData.title.trim())
            .maybeSingle();
          if (retry) return { book: retry, error: null };
        }
        return { book: null, error: insertError.message };
      }

      return { book: inserted, error: null };
    } catch (err: any) {
      return { book: null, error: err.message };
    }
  },

  /**
   * Kitap ID'si ile kitap detayını getirir.
   */
  async getBookById(bookId: string): Promise<{ book: Book | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .maybeSingle();

      if (data) return { book: data, error: null };

      // Starter listesinde var mı?
      const starter = STARTER_BOOKS.find((b) => b.id === bookId);
      if (starter) return { book: starter, error: null };

      return { book: null, error: error?.message || 'Kitap bulunamadı.' };
    } catch (err: any) {
      return { book: null, error: err.message };
    }
  },
};
