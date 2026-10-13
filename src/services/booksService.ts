import { supabase } from '../lib/supabase';
import { Book } from '../lib/types';
import { searchGoogleBooks } from './googleBooks';

export const isUuid = (id?: string | null): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

export const MASTER_CLASSICS: Book[] = [
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
  {
    id: '7ef5a157-839f-4445-9362-6b46130ab1ba',
    google_book_id: 'vol_sabahattin_icimizdeki_seytan',
    title: 'İçimizdeki Şeytan',
    subtitle: 'İradenin ve Sevginin Sınavı',
    authors: ['Sabahattin Ali'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1940',
    description:
      'Ömer ve Macide\'nin aşkı üzerinden aydın kesimin zaaflarını, iradesizliğini ve dönemin toplumsal ikiyüzlülüğünü eleştiren psikolojik roman.',
    page_count: 268,
    categories: ['Türk Edebiyatı', 'Roman', 'Psikoloji'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    isbn: '9789750843471',
    language: 'tr',
  },
  {
    id: '05f9cf87-2e30-4fa8-8c0c-52c2067c0e47',
    google_book_id: 'vol_sabahattin_kuyucakli_yusuf',
    title: 'Kuyucaklı Yusuf',
    subtitle: 'Anadolu Trajedisi',
    authors: ['Sabahattin Ali'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1937',
    description:
      'Anadolu kasabasındaki adaletsizlik, bürokrasi ve sömürü düzenine karşı Yusuf\'un başkaldırısını ve trajik aşkını anlatan unutulmaz bir klasik.',
    page_count: 220,
    categories: ['Türk Edebiyatı', 'Roman', 'Klasik'],
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    isbn: '9789750800016',
    language: 'tr',
  },
  {
    id: '1b43870b-47ae-4c6f-b2fd-e759544f2758',
    google_book_id: 'vol_tanpinar_huzur',
    title: 'Huzur',
    subtitle: 'İstanbul Melankolisi',
    authors: ['Ahmet Hamdi Tanpınar'],
    publisher: 'Dergâh Yayınları',
    published_date: '1949',
    description:
      'Mümtaz ve Nuran\'ın aşkı etrafında Doğu-Batı çatışması, geleneksel Türk musikisi ve İstanbul\'un melankolik ruhunu derinlemesine işleyen bir başyapıt.',
    page_count: 420,
    categories: ['Türk Edebiyatı', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    isbn: '9789759955731',
    language: 'tr',
  },
  {
    id: '6a26e39e-c514-46d4-9c8f-8ee262d34fc2',
    google_book_id: 'vol_atay_tehlikeli_oyunlar',
    title: 'Tehlikeli Oyunlar',
    subtitle: 'Hikmet Benol\'un İç Dünyası',
    authors: ['Oğuz Atay'],
    publisher: 'İletişim Yayınları',
    published_date: '1973',
    description:
      'Hikmet Benol\'un gecekondu mahallesinde kendi zihninde kurduğu dünyada gerçeklik ile düş arasında gidip gelen varoluşsal arayışı.',
    page_count: 480,
    categories: ['Türk Edebiyatı', 'Roman', 'Postmodern'],
    thumbnail_url: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80',
    isbn: '9789754700121',
    language: 'tr',
  },
  {
    id: '6fae6066-f674-4707-8312-32062d28f9de',
    google_book_id: 'ol_OL1019598W',
    title: 'Benim Adım Kırmızı',
    subtitle: 'Nakkaşlar Cinayeti',
    authors: ['Orhan Pamuk'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1998',
    description:
      'Osmanlı nakkaşları arasında geçen bir cinayet soruşturması üzerinden Doğu ve Batı sanat anlayışlarını sorgulayan tarihî polisiye roman.',
    page_count: 536,
    categories: ['Türk Edebiyatı', 'Tarih', 'Roman', 'Polisiye'],
    thumbnail_url: 'https://covers.openlibrary.org/b/id/1054459-L.jpg',
    isbn: '9789750825910',
    language: 'tr',
  },
  {
    id: '4a0d0aee-7cb9-468b-8ff6-7f5e3df24fd3',
    google_book_id: 'ol_OL1019601W',
    title: 'Kara Kitap',
    subtitle: 'İstanbul\'un Gizemleri',
    authors: ['Orhan Pamuk'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1990',
    description:
      'Avukat Galip\'in kaybolan karısı Rüya ve köşe yazarı Celâl Salik\'i ararken İstanbul sokaklarında yaşadığı gizemli ve felsefi yolculuk.',
    page_count: 503,
    categories: ['Türk Edebiyatı', 'Roman', 'Postmodern'],
    thumbnail_url: 'https://covers.openlibrary.org/b/id/6878773-L.jpg',
    isbn: '9789750826139',
    language: 'tr',
  },
  {
    id: '38f2252f-e83c-4788-af9a-089bc190c21d',
    google_book_id: 'vol_pamuk_masumiyet',
    title: 'Masumiyet Müzesi',
    subtitle: 'Eşyaların Hafızası',
    authors: ['Orhan Pamuk'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '2008',
    description:
      'Kemal\'in Füsun\'a duyduğu saplantılı aşkın ve hatıralara adanmış bir müzenin eşsiz duygusal anlatısı.',
    page_count: 592,
    categories: ['Türk Edebiyatı', 'Roman', 'Aşk'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    isbn: '9789750826146',
    language: 'tr',
  },
  {
    id: 'ba5130a7-dcf5-4ec8-a9b6-3a95e28d61e7',
    google_book_id: 'ol_OL16064734W',
    title: 'Kar',
    subtitle: 'Kars\'ta Sürgün Şair',
    authors: ['Orhan Pamuk'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '2002',
    description:
      'Şair Ka\'nın Kars\'ta geçen intihar olaylarını araştırırken Türkiye\'nin siyasi ve toplumsal fay hatlarıyla yüzleştiği roman.',
    page_count: 496,
    categories: ['Türk Edebiyatı', 'Roman', 'Politik'],
    thumbnail_url: 'https://covers.openlibrary.org/b/id/6881426-L.jpg',
    isbn: '9789750825910',
    language: 'tr',
  },
  {
    id: 'd31dc8f2-cbaa-4366-93e7-d8f9f4a14dd4',
    google_book_id: 'vol_kemal_incememed',
    title: 'İnce Memed',
    subtitle: 'Torosların Efsanesi',
    authors: ['Yaşar Kemal'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1955',
    description:
      'Toros Dağları\'nda zalim Abdi Ağa\'ya başkaldırıp dağa çıkan ve ezilen köylülerin simgesi hâline gelen efsanevi halk kahramanı Memed\'in destanı.',
    page_count: 436,
    categories: ['Türk Edebiyatı', 'Roman', 'Destan'],
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    isbn: '9789750807145',
    language: 'tr',
  },
  {
    id: '3670785f-fa02-488b-bce4-a1a9bbd848e1',
    google_book_id: 'ol_OL1168083W',
    title: '1984',
    subtitle: 'Büyük Birader Seni İzliyor',
    authors: ['George Orwell'],
    publisher: 'Can Yayınları',
    published_date: '1949',
    description:
      'Büyük Birader\'in her şeyi izlediği, düşünce suçunun ölümle cezalandırıldığı totaliter bir distopyada Winston Smith\'in özgürlük direnişi.',
    page_count: 352,
    categories: ['Dünya Klasikleri', 'Roman', 'Distopya'],
    thumbnail_url: 'https://covers.openlibrary.org/b/id/9267242-L.jpg',
    isbn: '9789750718533',
    language: 'tr',
  },
  {
    id: '3e95cb11-d8d8-4b74-8237-c85ca82a77d0',
    google_book_id: 'vol_orwell_animal_farm',
    title: 'Hayvan Çiftliği',
    subtitle: 'Bir Peri Masalı',
    authors: ['George Orwell'],
    publisher: 'Can Yayınları',
    published_date: '1945',
    description:
      'İnsanların zulmüne karşı başkaldıran çiftlik hayvanlarının zamanla kendi içlerindeki diktatörlüğe yenik düşüşünü anlatan unutulmaz siyasi hiciv.',
    page_count: 152,
    categories: ['Dünya Klasikleri', 'Roman', 'Politik'],
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    isbn: '9789750719387',
    language: 'tr',
  },
  {
    id: '35d51985-2174-4930-aedc-8533ac1d4376',
    google_book_id: 'vol_camus_yabanci',
    title: 'Yabancı',
    subtitle: 'Absürt Bir Yaşam',
    authors: ['Albert Camus'],
    publisher: 'Can Yayınları',
    published_date: '1942',
    description:
      'Meursault\'nun annesinin ölümünden sonra Cezayir sahilinde bir cinayete karışması ve toplumun ahlak kalıplarına boyun eğmeyişini anlatan absürt felsefe klasiği.',
    page_count: 112,
    categories: ['Dünya Klasikleri', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    isbn: '9789750738661',
    language: 'tr',
  },
  {
    id: 'ef29f79e-7ee6-43a0-93a3-8fb8ec5bfe4e',
    google_book_id: 'vol_zweig_satranc',
    title: 'Satranç',
    subtitle: 'Ruhsal Direnişin Hamleleri',
    authors: ['Stefan Zweig'],
    publisher: 'İş Bankası Kültür Yayınları',
    published_date: '1942',
    description:
      'Gestapo tecridinde zihninde oynadığı yüzlerce satranç oyunuyla hayatta kalan Dr. B.\'nin dünya satranç şampiyonuna karşı verdiği zihinsel düello.',
    page_count: 88,
    categories: ['Dünya Klasikleri', 'Roman', 'Psikoloji'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    isbn: '9789754589245',
    language: 'tr',
  },
  {
    id: 'cdf169e8-ba08-4d0a-9ab5-892e708a455d',
    google_book_id: 'vol_exupery_kucuk_prens',
    title: 'Küçük Prens',
    subtitle: 'Gönül Gözüyle Görmek',
    authors: ['Antoine de Saint-Exupéry'],
    publisher: 'Can Yayınları',
    published_date: '1943',
    description:
      'Sahra Çölü\'ne düşen bir pilot ile B-612 asteroidinden gelen altın saçlı Küçük Prens\'in dostluğu; sevgi, sorumluluk ve görmeyi bilmek üzerine evrensel masal.',
    page_count: 112,
    categories: ['Dünya Klasikleri', 'Masal', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    isbn: '9789750725555',
    language: 'tr',
  },
  {
    id: '22e28ba1-ad21-432a-a82a-fba37b31649c',
    google_book_id: 'ol_OL1054320W',
    title: 'Sefiller',
    subtitle: 'Jean Valjean\'ın Kefareti',
    authors: ['Victor Hugo'],
    publisher: 'İş Bankası Kültür Yayınları',
    published_date: '1862',
    description:
      'Bir somun ekmek çaldığı için kürek mahkumu olan Jean Valjean\'ın merhamet, adalet ve vicdan arayışını anlatan dünya edebiyatının dev anıtı.',
    page_count: 1724,
    categories: ['Dünya Klasikleri', 'Roman', 'Tarih'],
    thumbnail_url: 'https://covers.openlibrary.org/b/id/12112352-L.jpg',
    isbn: '9789754589269',
    language: 'tr',
  },
  {
    id: '84f9ef77-b93f-421a-88d3-17a09772b512',
    google_book_id: 'vol_kafka_dava',
    title: 'Dava',
    subtitle: 'Bürokrasinin Labirentleri',
    authors: ['Franz Kafka'],
    publisher: 'Can Yayınları',
    published_date: '1925',
    description:
      'Josef K.\'nın nedenini asla öğrenemediği bir suçlamayla tutuklanıp bürokrasinin akıl almaz labirentlerinde kayboluşunu anlatan karanlık başyapıt.',
    page_count: 224,
    categories: ['Dünya Klasikleri', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&q=80',
    isbn: '9789750719363',
    language: 'tr',
  },
  {
    id: 'bc69563f-169d-4bb9-ba88-f81cc1d6f468',
    google_book_id: 'vol_marquez_yuzyillik',
    title: 'Yüzyıllık Yalnızlık',
    subtitle: 'Macondo\'nun Yükselişi ve Düşüşü',
    authors: ['Gabriel García Márquez'],
    publisher: 'Can Yayınları',
    published_date: '1967',
    description:
      'Büyülü gerçekçiliğin zirvesi sayılan Macondo kasabasında Buendía ailesinin yedi nesil süren görkemli, trajik ve gizemli tarihi.',
    page_count: 464,
    categories: ['Dünya Klasikleri', 'Roman', 'Büyülü Gerçekçilik'],
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    isbn: '9789750738685',
    language: 'tr',
  },
];

export const STARTER_BOOKS = MASTER_CLASSICS;

/**
 * Kitap nesnesini eksik kapak, açıklama ve biçimlendirme hatalarına karşı zenginleştirir.
 */
export function enrichBook(book: Book): Book {
  const cleanTitle = (book.title || 'Başlıksız Eser').trim();
  let cleanThumb = book.thumbnail_url;
  let cleanDesc = book.description;

  // Master klasikler listesinde karşılığı var mı kontrol et
  const master = MASTER_CLASSICS.find(
    (s) =>
      s.id === book.id ||
      s.title.toLowerCase().trim() === cleanTitle.toLowerCase() ||
      (s.isbn && book.isbn && s.isbn === book.isbn)
  );

  if (master) {
    if (!cleanThumb || cleanThumb.trim() === '') cleanThumb = master.thumbnail_url;
    if (!cleanDesc || cleanDesc.trim() === '') cleanDesc = master.description;
  }

  // Eğer hala kapak yoksa edebî kaliteli bir görsel sağla
  if (!cleanThumb || cleanThumb.trim() === '') {
    cleanThumb = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80';
  }

  return {
    ...book,
    title: cleanTitle,
    thumbnail_url: cleanThumb,
    description:
      cleanDesc && cleanDesc.trim() !== ''
        ? cleanDesc.trim()
        : 'Bu edebî eser Kitaphane evrensel kataloğunda yer almaktadır. Eser hakkında alıntı yapabilir, inceleme yazabilir veya kişisel kitaplığınıza ekleyebilirsiniz.',
    authors:
      book.authors && book.authors.length > 0 && book.authors[0] !== ''
        ? book.authors
        : master?.authors || ['Bilinmeyen Yazar'],
    publisher: book.publisher || master?.publisher || 'Kitaphane Edebiyat Yayınları',
    page_count: book.page_count || master?.page_count || 220,
    categories:
      book.categories && book.categories.length > 0
        ? book.categories
        : master?.categories || ['Edebiyat', 'Roman'],
    language: book.language || 'tr',
  };
}

import { openLibraryService } from './openLibraryService';

export type BookSearchSource = 'all' | 'openlibrary' | 'kitaphane';

export interface SearchBooksParams {
  query: string;
  source?: BookSearchSource;
  limit?: number;
  category?: string | null;
}

export const booksService = {
  /**
   * Kitap Arama: Supabase yerel veritabanı ve Open Library API'sini birleştirir veya seçili kaynağa göre arar.
   */
  async searchBooks(
    queryOrParams: string | SearchBooksParams,
    limitParam = 25
  ): Promise<{ books: Book[]; fromApiCount: number; error: string | null }> {
    const params: SearchBooksParams =
      typeof queryOrParams === 'string'
        ? { query: queryOrParams, limit: limitParam, source: 'all' }
        : { source: 'all', limit: limitParam, ...queryOrParams };

    const trimmed = (params.query || '').trim().toLowerCase();
    const source = params.source || 'all';
    const limit = params.limit || limitParam;
    const category = params.category || null;

    // 1. Durum: Boş arama sorgusu
    if (!trimmed && !category) {
      if (source === 'openlibrary') {
        const { books: olBooks } = await openLibraryService.searchBooks({
          query: 'classics',
          limit,
        });
        return { books: olBooks.map(enrichBook as any), fromApiCount: olBooks.length, error: null };
      }

      // Veritabanındaki kitapları getir
      const { data: popular } = await supabase
        .from('books')
        .select('*')
        .limit(limit)
        .order('created_at', { ascending: false });

      if (popular && popular.length > 0) {
        return { books: popular.map(enrichBook), fromApiCount: 0, error: null };
      }

      return { books: MASTER_CLASSICS.map(enrichBook), fromApiCount: 0, error: null };
    }

    try {
      let localMatches: Book[] = [];
      let apiBooks: Array<Omit<Book, 'id'>> = [];

      // 2. Adım: Yerel Veritabanı Araması (Eğer 'openlibrary' seçili değilse)
      if (source !== 'openlibrary') {
        const { data: dbBooks } = await supabase
          .from('books')
          .select('*')
          .limit(150);

        localMatches = (dbBooks || []).filter((b: any) => {
          const titleMatch = trimmed ? b.title?.toLowerCase().includes(trimmed) : true;
          const authorMatch = trimmed && Array.isArray(b.authors)
            ? b.authors.some((a: string) => a.toLowerCase().includes(trimmed))
            : false;
          const catMatch = Array.isArray(b.categories)
            ? b.categories.some((c: string) =>
                category
                  ? c.toLowerCase().includes(category.toLowerCase())
                  : trimmed
                  ? c.toLowerCase().includes(trimmed)
                  : false
              )
            : false;
          const isbnMatch = trimmed && b.isbn?.toLowerCase().includes(trimmed);

          if (category && trimmed) {
            return catMatch && (titleMatch || authorMatch || isbnMatch);
          }
          if (category) {
            return catMatch;
          }
          return titleMatch || authorMatch || catMatch || isbnMatch;
        });
      }

      // 3. Adım: Canlı Open Library Araması (Eğer 'kitaphane' seçili değilse)
      if (source !== 'kitaphane') {
        // ISBN araması kontrolü
        const isIsbnSearch = /^[0-9X-]{10,17}$/i.test(trimmed.replace(/[\s-]/g, ''));
        if (isIsbnSearch) {
          const { book: isbnBook } = await openLibraryService.getBookByIsbn(trimmed);
          if (isbnBook) {
            apiBooks.push(isbnBook);
          }
        }

        // Genel veya Kategoriye göre Open Library araması
        const searchQuery = trimmed || (category ? `${category} literature` : 'classic literature');
        const { books: olResults } = await openLibraryService.searchBooks({
          query: searchQuery,
          limit,
        });

        apiBooks.push(...olResults);

        // İkincil olarak Google Books'u da kontrol et
        if (apiBooks.length < 5 && trimmed) {
          const { books: gbResults } = await searchGoogleBooks(trimmed, 10);
          apiBooks.push(...gbResults);
        }
      }

      // 4. Adım: Sonuçları birleştir ve tekilleştir
      const mergedList: Book[] = localMatches.map(enrichBook);
      const existingTitles = new Set(mergedList.map((b) => b.title.toLowerCase().trim()));
      const existingGoogleIds = new Set(
        mergedList.filter((b) => b.google_book_id).map((b) => b.google_book_id)
      );

      let fromApiCount = 0;
      for (const apiBook of apiBooks) {
        const normTitle = apiBook.title.toLowerCase().trim();
        if (
          !existingTitles.has(normTitle) &&
          (!apiBook.google_book_id || !existingGoogleIds.has(apiBook.google_book_id))
        ) {
          mergedList.push(
            enrichBook({
              id: `temp_${apiBook.google_book_id || Math.random().toString(36).substring(2, 9)}`,
              ...apiBook,
            })
          );
          fromApiCount++;
          existingTitles.add(normTitle);
        }
      }

      // 5. Adım: Eğer hiçbir sonuç bulunamadıysa master klasikler arasında filtrele
      if (mergedList.length === 0 && source !== 'openlibrary') {
        const fallbackMatches = MASTER_CLASSICS.filter((b) => {
          const matchTitle = trimmed ? b.title.toLowerCase().includes(trimmed) : true;
          const matchAuthor = trimmed
            ? b.authors?.some((a) => a.toLowerCase().includes(trimmed))
            : false;
          const matchCat = category
            ? b.categories?.some((c) => c.toLowerCase().includes(category.toLowerCase()))
            : trimmed
            ? b.categories?.some((c) => c.toLowerCase().includes(trimmed))
            : false;
          const matchIsbn = trimmed ? b.isbn?.toLowerCase().includes(trimmed) : false;

          if (category && trimmed) return matchCat && (matchTitle || matchAuthor || matchIsbn);
          if (category) return matchCat;
          return matchTitle || matchAuthor || matchCat || matchIsbn;
        }).map(enrichBook);

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
      const enriched = enrichBook(
        'id' in bookData ? (bookData as Book) : ({ ...bookData, id: '' } as Book)
      );

      // Zaten gerçek bir Supabase UUID ise doğrudan kontrol et
      if ('id' in bookData && bookData.id && isUuid(bookData.id)) {
        const { data: existing } = await supabase
          .from('books')
          .select('*')
          .eq('id', bookData.id)
          .maybeSingle();
        if (existing) return { book: enrichBook(existing), error: null };
      }

      // 1. Google / Open Library Book ID ile kontrol et
      if (enriched.google_book_id) {
        const { data: byGoogleId } = await supabase
          .from('books')
          .select('*')
          .eq('google_book_id', enriched.google_book_id)
          .maybeSingle();

        if (byGoogleId) {
          return { book: enrichBook(byGoogleId), error: null };
        }
      }

      // 2. ISBN ile kontrol et
      if (enriched.isbn) {
        const { data: byIsbn } = await supabase
          .from('books')
          .select('*')
          .eq('isbn', enriched.isbn)
          .maybeSingle();

        if (byIsbn) {
          return { book: enrichBook(byIsbn), error: null };
        }
      }

      // 3. Başlık ile kontrol et
      if (enriched.title) {
        const { data: byTitle } = await supabase
          .from('books')
          .select('*')
          .ilike('title', enriched.title.trim())
          .maybeSingle();

        if (byTitle) {
          return { book: enrichBook(byTitle), error: null };
        }
      }

      // 4. Veritabanına yeni kitap olarak kaydet
      const insertPayload = {
        google_book_id: enriched.google_book_id || null,
        title: enriched.title.trim(),
        authors: enriched.authors,
        publisher: enriched.publisher,
        published_date: enriched.published_date || null,
        description: enriched.description,
        page_count: enriched.page_count,
        categories: enriched.categories,
        thumbnail_url: enriched.thumbnail_url,
        isbn: enriched.isbn,
      };

      const { data: inserted, error: insertError } = await supabase
        .from('books')
        .insert(insertPayload)
        .select()
        .single();

      if (insertError) {
        // Eşzamanlı kayıt durumunda tekrar kontrol et
        if (enriched.title) {
          const { data: retry } = await supabase
            .from('books')
            .select('*')
            .ilike('title', enriched.title.trim())
            .maybeSingle();
          if (retry) return { book: enrichBook(retry), error: null };
        }
        return { book: null, error: insertError.message };
      }

      return { book: enrichBook(inserted), error: null };
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

      if (data) return { book: enrichBook(data), error: null };

      // Starter listesinde var mı?
      const starter = MASTER_CLASSICS.find((b) => b.id === bookId);
      if (starter) return { book: enrichBook(starter), error: null };

      return { book: null, error: error?.message || 'Kitap bulunamadı.' };
    } catch (err: any) {
      return { book: null, error: err.message };
    }
  },
};
