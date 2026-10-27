import { supabase } from '../lib/supabase';
import { AuthorResult, Book } from '../lib/types';
import { searchGoogleBooks } from './googleBooks';
import { openLibraryService } from './openLibraryService';

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


const OL = 'https://openlibrary.org';

/** Stok fotoğraflar gerçek kapak değildir; bunlar için tasarlanmış kapak çizilir. */
export const hasRealCover = (url?: string | null): boolean =>
  !!url && /^https?:\/\//.test(url) && !url.includes('unsplash.com');

const norm = (s?: string | null) =>
  (s || '')
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Aynı eser farklı kaynaklarda "Dostoyevski" / "Fyodor Dostoyevski" gibi yazılabilir; soyadı yeterli
const authorSurname = (a?: string | null) => norm(a).split(' ').pop() || '';
const bookKey = (b: Pick<Book, 'title' | 'authors'>) => `${norm(b.title)}|${authorSurname(b.authors?.[0])}`;

/** Katalog Türkçe ve İngilizce eserlere odaklanır; Latin dışı alfabeli kayıtlar elenir. */
const NON_LATIN = /[\u0370-\u03FF\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0E00-\u0E7F\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/;
const isLatinScript = (b: Pick<Book, 'title' | 'authors'>) =>
  !NON_LATIN.test(b.title) && !NON_LATIN.test(b.authors?.[0] || '');

/** Yavaş dış servisler aramayı kilitlemesin diye süre sınırı. */
const withTimeout = <T,>(p: Promise<T>, ms: number, fallback: T): Promise<T> =>
  Promise.race([p, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);

/** PostgREST `or()` filtresini bozacak karakterleri temizler. */
const sanitize = (q: string) => q.replace(/[,()%*\\:"']/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Kitap nesnesini normalize eder. Eksik alanları uydurmaz; yalnızca
 * master klasik listesinden gerçek bilgiyi tamamlar.
 */
export function enrichBook(book: Book | (Omit<Book, 'id'> & { id?: string })): Book {
  const title = (book.title || 'Başlıksız Eser').trim();
  const id =
    book.id && book.id.trim() !== ''
      ? book.id
      : `temp_${book.google_book_id || Math.random().toString(36).substring(2, 9)}`;

  const master = MASTER_CLASSICS.find((s) => s.id === id || norm(s.title) === norm(title));
  const authors =
    book.authors && book.authors.length > 0 && book.authors[0]
      ? book.authors.filter((a) => a && a !== 'Bilinmeyen Yazar')
      : master?.authors || [];

  return {
    ...book,
    id,
    title,
    authors,
    thumbnail_url: hasRealCover(book.thumbnail_url) ? book.thumbnail_url : null,
    description: book.description?.trim() || master?.description || null,
    publisher:
      book.publisher && !/Genel Edebiyat|Kitaphane Edebiyat|Edebiyat Yayınları/.test(book.publisher)
        ? book.publisher
        : master?.publisher || null,
    page_count: book.page_count || master?.page_count || null,
    categories: book.categories && book.categories.length > 0 ? book.categories : master?.categories || null,
  } as Book;
}

const toDbPayload = (b: Book) => ({
  google_book_id: b.google_book_id || null,
  title: b.title.trim(),
  authors: b.authors && b.authors.length ? b.authors : null,
  publisher: b.publisher || null,
  published_date: b.published_date || null,
  description: b.description || null,
  page_count: b.page_count || null,
  categories: b.categories || null,
  thumbnail_url: b.thumbnail_url || null,
  isbn: b.isbn || null,
});

/** Aynı eserin farklı kaynaklardaki kopyalarını tekilleştirir; kapaklı olanı tercih eder. */
const dedupe = (books: Book[]): Book[] => {
  const map = new Map<string, Book>();
  for (const b of books) {
    const k = bookKey(b);
    const existing = map.get(k);
    if (!existing) {
      map.set(k, b);
    } else if (!existing.thumbnail_url && b.thumbnail_url && !isUuid(existing.id)) {
      map.set(k, b);
    } else if (isUuid(b.id) && !isUuid(existing.id)) {
      map.set(k, { ...b, thumbnail_url: b.thumbnail_url || existing.thumbnail_url });
    }
  }
  return Array.from(map.values());
};

export const booksService = {
  /**
   * Kitap arama: önce Kitaphane kataloğu, ardından dış kataloglar.
   * Dış sonuçlar arka planda kataloğa kaydedilir; böylece katalog her aramayla büyür.
   */
  async searchBooks(
    query: string,
    limit = 30,
    /** Yerel sonuçlar hazır olunca (dış kaynaklar beklenmeden) çağrılır. */
    onPartial?: (books: Book[]) => void
  ): Promise<{ books: Book[]; error: string | null }> {
    const q = sanitize(query);
    if (!q) return { books: [], error: null };

    const nq = norm(q);
    const rank = (list: Book[]) =>
      dedupe(list).sort((a, b) => {
        const score = (x: Book) =>
          (norm(x.title) === nq ? 6 : norm(x.title).startsWith(nq) ? 4 : norm(x.title).includes(nq) ? 2 : 0) +
          ((x.authors || []).some((au) => norm(au).includes(nq)) ? 2 : 0) +
          (x.thumbnail_url ? 1 : 0) +
          (isUuid(x.id) ? 1 : 0);
        return score(b) - score(a);
      });

    try {
      const localPromise = this.searchCatalog(q, limit).catch(() => [] as Book[]);
      const remotePromise = this.searchRemote(q, limit).catch(() => [] as Book[]);

      const local = await localPromise;
      if (onPartial && local.length) onPartial(rank(local).slice(0, limit));

      const remote = await remotePromise;
      this.cacheBooks(remote);
      return { books: rank([...local, ...remote]).slice(0, limit), error: null };
    } catch (err: any) {
      return { books: [], error: err.message || 'Arama sırasında bir sorun oluştu.' };
    }
  },

  /** Kitaphane veritabanında arama (search_books RPC varsa onu kullanır). */
  async searchCatalog(q: string, limit = 30): Promise<Book[]> {
    const rpc = await supabase.rpc('search_books', { q, max_results: limit });
    if (!rpc.error && Array.isArray(rpc.data)) {
      return (rpc.data as Book[]).map(enrichBook);
    }

    // RPC yoksa: başlıkta ilike + yazar dizisinde istemci tarafı eşleşme
    const nq = norm(q);
    const [byTitle, authorRows] = await Promise.all([
      supabase.from('books').select('*').ilike('title', `%${q}%`).limit(limit),
      supabase.from('books').select('id, authors').order('created_at', { ascending: false }).limit(2000),
    ]);
    const authorIds = (authorRows.data || [])
      .filter((r: any) => (r.authors || []).some((a: string) => norm(a).includes(nq)))
      .map((r: any) => r.id)
      .slice(0, limit);
    const byAuthor = authorIds.length
      ? await supabase.from('books').select('*').in('id', authorIds)
      : { data: [] as any[] };
    return [...(byTitle.data || []), ...(byAuthor.data || [])].map(enrichBook);
  },

  /** Dış kataloglar (Türkçe ve İngilizce eserler). */
  async searchRemote(q: string, limit = 30): Promise<Book[]> {
    const results: Array<Omit<Book, 'id'>> = [];

    const isIsbn = /^[0-9Xx]{10,13}$/.test(q.replace(/[\s-]/g, ''));
    if (isIsbn) {
      const { book } = await openLibraryService.getBookByIsbn(q);
      if (book) results.push(book);
    }

    const empty = { books: [] as Array<Omit<Book, 'id'>> };
    const [ol, gb] = await Promise.all([
      withTimeout(openLibraryService.searchBooks({ query: q, limit }), 9000, empty),
      withTimeout(searchGoogleBooks(q, 20), 7000, empty).catch(() => empty),
    ]);
    results.push(...ol.books, ...(gb.books || []));

    return results
      .map((b) => enrichBook(b))
      .filter((b) => b.title && b.title !== 'Başlıksız Eser' && isLatinScript(b));
  },

  /** Dış kaynaklardan gelen kitapları kataloğa toplu kaydeder (sessizce). */
  async cacheBooks(books: Book[]): Promise<void> {
    try {
      const candidates = books.filter((b) => b.google_book_id && !isUuid(b.id) && b.authors?.length);
      if (candidates.length === 0) return;
      const ids = candidates.map((b) => b.google_book_id as string);
      const { data: existing } = await supabase
        .from('books')
        .select('google_book_id')
        .in('google_book_id', ids);
      const have = new Set((existing || []).map((r: any) => r.google_book_id));
      const fresh = candidates.filter((b) => !have.has(b.google_book_id));
      if (fresh.length === 0) return;
      const rows = fresh.slice(0, 40).map(toDbPayload);
      // Migration uygulanmışsa eşzamanlı eklemeler çakışmaz; değilse düz ekleme
      const { error } = await supabase
        .from('books')
        .upsert(rows, { onConflict: 'google_book_id', ignoreDuplicates: true });
      if (error) await supabase.from('books').insert(rows);
    } catch {
      // Önbellekleme başarısız olsa da arama sonuçları gösterilmeye devam eder
    }
  },

  /** Okurların en çok kitaplığa eklediği kitaplar. */
  async getPopularBooks(limit = 12): Promise<Book[]> {
    const { data: rows } = await supabase
      .from('user_books')
      .select('book_id')
      .order('created_at', { ascending: false })
      .limit(500);

    const counts: Record<string, number> = {};
    (rows || []).forEach((r: any) => (counts[r.book_id] = (counts[r.book_id] || 0) + 1));
    const topIds = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    let books: Book[] = [];
    if (topIds.length) {
      const { data } = await supabase.from('books').select('*').in('id', topIds);
      books = (data || [])
        .map(enrichBook)
        .sort((a: Book, b: Book) => (counts[b.id] || 0) - (counts[a.id] || 0));
    }
    if (books.length < limit) {
      const { data } = await supabase
        .from('books')
        .select('*')
        .not('thumbnail_url', 'is', null)
        .not('thumbnail_url', 'ilike', '%unsplash%')
        .order('created_at', { ascending: false })
        .limit(limit * 2);
      books = dedupe([...books, ...(data || []).map(enrichBook)]);
    }
    return books.slice(0, limit);
  },

  /** Yazar arama: önce katalogdaki yazarlar (onPartial), ardından dış katalog. */
  async searchAuthors(
    query: string,
    limit = 15,
    onPartial?: (authors: AuthorResult[]) => void
  ): Promise<AuthorResult[]> {
    const q = sanitize(query);
    if (!q) return [];
    const nq = norm(q);

    const remotePromise = withTimeout(
      fetch(`${OL}/search/authors.json?q=${encodeURIComponent(q)}&limit=${limit}`)
        .then((res) => (res.ok ? res.json() : { docs: [] }))
        .catch(() => ({ docs: [] })),
      9000,
      { docs: [] }
    );

    const local: AuthorResult[] = [];
    for (const b of await this.searchCatalog(q, 40).catch(() => [] as Book[])) {
      for (const a of b.authors || []) {
        if (norm(a).includes(nq) && !local.some((x) => norm(x.name) === norm(a))) {
          local.push({ name: a, key: null, topWork: b.title, workCount: null, photoUrl: null });
        }
      }
    }
    if (onPartial && local.length) onPartial(local.slice(0, limit));

    const remote: AuthorResult[] = [];
    for (const d of (await remotePromise).docs || []) {
      if (!d.name || NON_LATIN.test(d.name)) continue;
      const key = d.key ? String(d.key).replace('/authors/', '') : null;
      remote.push({
        name: d.name,
        key,
        topWork: d.top_work || null,
        workCount: d.work_count ?? null,
        photoUrl: key ? `https://covers.openlibrary.org/a/olid/${key}-M.jpg?default=false` : null,
      });
    }

    // Aynı isim: katalogdaki kaydı dış kaynağın fotoğraf/eser sayısıyla birleştir
    const merged = new Map<string, AuthorResult>();
    for (const a of [...local, ...remote]) {
      const k = norm(a.name);
      const prev = merged.get(k);
      merged.set(
        k,
        prev
          ? {
              ...prev,
              key: prev.key || a.key,
              photoUrl: prev.photoUrl || a.photoUrl,
              workCount: Math.max(prev.workCount || 0, a.workCount || 0) || null,
            }
          : a
      );
    }
    return Array.from(merged.values()).slice(0, limit);
  },

  /** Yazar sayfası: biyografi ve eserler. */
  async getAuthor(
    name: string,
    key?: string | null
  ): Promise<{ bio: string | null; birth: string | null; death: string | null; photoUrl: string | null; books: Book[] }> {
    let bio: string | null = null;
    let birth: string | null = null;
    let death: string | null = null;
    let authorKey = key || null;

    try {
      if (!authorKey) {
        const res = await fetch(`${OL}/search/authors.json?q=${encodeURIComponent(name)}&limit=1`);
        if (res.ok) {
          const d = await res.json();
          const first = d.docs?.[0];
          if (first && norm(first.name) === norm(name)) authorKey = String(first.key).replace('/authors/', '');
        }
      }
      if (authorKey) {
        const res = await fetch(`${OL}/authors/${authorKey}.json`);
        if (res.ok) {
          const d = await res.json();
          bio = typeof d.bio === 'string' ? d.bio : d.bio?.value || null;
          birth = d.birth_date || null;
          death = d.death_date || null;
        }
      }
    } catch {
      // biyografi opsiyonel
    }

    const [local, remote] = await Promise.all([
      this.searchCatalog(name, 60).then((list) => ({
        data: list.filter((b) => (b.authors || []).some((a) => norm(a) === norm(name))),
      })),
      openLibraryService.searchBooks({ author: name, limit: 40 }),
    ]);
    const remoteBooks = remote.books.map((b) => enrichBook(b)).filter(isLatinScript);
    this.cacheBooks(remoteBooks);
    const books = dedupe([...local.data, ...remoteBooks]).sort(
      (a, b) => Number(!!b.thumbnail_url) - Number(!!a.thumbnail_url)
    );

    return {
      bio: bio ? bio.replace(/\(\[Source.*$/s, '').trim() : null,
      birth,
      death,
      photoUrl: authorKey ? `https://covers.openlibrary.org/a/olid/${authorKey}-L.jpg?default=false` : null,
      books,
    };
  },

  /** Eksik açıklamayı dış katalogdan tamamlar. */
  async loadDescription(book: Book): Promise<string | null> {
    if (book.description) return book.description;
    if (book.google_book_id?.startsWith('ol_')) {
      const desc = await openLibraryService.getWorkDescription(book.google_book_id);
      if (desc) {
        if (isUuid(book.id)) {
          supabase.from('books').update({ description: desc }).eq('id', book.id).then(() => undefined);
        }
        return desc.replace(/\(\[Source.*$/s, '').replace(/-{5,}[\s\S]*$/, '').trim();
      }
    }
    return null;
  },

  /** Bir kitabın topluluk istatistikleri. */
  async getBookStats(bookId: string): Promise<{ readers: number; avgRating: number | null; ratingCount: number }> {
    if (!isUuid(bookId)) return { readers: 0, avgRating: null, ratingCount: 0 };
    const [readers, ratings] = await Promise.all([
      supabase.from('user_books').select('id', { count: 'exact', head: true }).eq('book_id', bookId),
      supabase.from('posts').select('review_rating').eq('book_id', bookId).not('review_rating', 'is', null),
    ]);
    const vals = (ratings.data || []).map((r: any) => Number(r.review_rating)).filter(Boolean);
    return {
      readers: readers.count || 0,
      avgRating: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
      ratingCount: vals.length,
    };
  },

  /**
   * Bir kitabı katalogda bulur, yoksa kaydeder ve gerçek UUID'li kaydı döndürür.
   */
  async findOrCreateBook(bookData: Book | Omit<Book, 'id'>): Promise<{ book: Book | null; error: string | null }> {
    try {
      const enriched = enrichBook(bookData as Book);

      if (isUuid(enriched.id)) {
        const { data } = await supabase.from('books').select('*').eq('id', enriched.id).maybeSingle();
        if (data) return { book: enrichBook(data), error: null };
      }

      if (enriched.google_book_id) {
        const { data } = await supabase
          .from('books')
          .select('*')
          .eq('google_book_id', enriched.google_book_id)
          .limit(1)
          .maybeSingle();
        if (data) return { book: enrichBook(data), error: null };
      }

      if (enriched.isbn) {
        const { data } = await supabase.from('books').select('*').eq('isbn', enriched.isbn).limit(1).maybeSingle();
        if (data && norm(data.title) === norm(enriched.title)) return { book: enrichBook(data), error: null };
      }

      const { data: byTitle } = await supabase
        .from('books')
        .select('*')
        .ilike('title', enriched.title.trim())
        .limit(5);
      const sameWork = (byTitle || []).find(
        (b: any) => norm(b.authors?.[0]) === norm(enriched.authors?.[0])
      );
      if (sameWork) return { book: enrichBook(sameWork), error: null };

      const { data: inserted, error } = await supabase
        .from('books')
        .insert(toDbPayload(enriched))
        .select()
        .single();
      if (error) return { book: null, error: error.message };
      return { book: enrichBook(inserted), error: null };
    } catch (err: any) {
      return { book: null, error: err.message };
    }
  },

  async getBookById(bookId: string): Promise<{ book: Book | null; error: string | null }> {
    const { data, error } = await supabase.from('books').select('*').eq('id', bookId).maybeSingle();
    if (data) return { book: enrichBook(data), error: null };
    return { book: null, error: error?.message || 'Kitap bulunamadı.' };
  },
};
