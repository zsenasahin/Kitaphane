import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qomritegwcfxpwpfhhfw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbXJpdGVnd2NmeHB3cGZoaGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4Mjc1OTMsImV4cCI6MjEwNzQwMzU5M30.3zvTygIIe0kzSX7HS92FulEXC7e4cEmmtNbGaQlSL-U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BOOKS_TO_SEED = [
  {
    title: 'İçimizdeki Şeytan',
    authors: ['Sabahattin Ali'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1940',
    description: 'Ömer ve Macide\'nin aşkı üzerinden aydın kesimin zaaflarını, iradesizliğini ve dönemin toplumsal ikiyüzlülüğünü eleştiren psikolojik roman.',
    page_count: 268,
    categories: ['Türk Edebiyatı', 'Roman', 'Psikoloji'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    isbn: '9789750843471'
  },
  {
    title: 'Kuyucaklı Yusuf',
    authors: ['Sabahattin Ali'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1937',
    description: 'Anadolu kasabasındaki adaletsizlik, bürokrasi ve sömürü düzenine karşı Yusuf\'un başkaldırısını ve trajik aşkını anlatan unutulmaz bir klasik.',
    page_count: 220,
    categories: ['Türk Edebiyatı', 'Roman', 'Klasik'],
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    isbn: '9789750800016'
  },
  {
    title: 'Huzur',
    authors: ['Ahmet Hamdi Tanpınar'],
    publisher: 'Dergâh Yayınları',
    published_date: '1949',
    description: 'Mümtaz ve Nuran\'ın aşkı etrafında Doğu-Batı çatışması, geleneksel Türk musikisi ve İstanbul\'un melankolik ruhunu derinlemesine işleyen bir başyapıt.',
    page_count: 420,
    categories: ['Türk Edebiyatı', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    isbn: '9789759955731'
  },
  {
    title: 'Tehlikeli Oyunlar',
    authors: ['Oğuz Atay'],
    publisher: 'İletişim Yayınları',
    published_date: '1973',
    description: 'Hikmet Benol\'un gecekondu mahallesinde kendi zihninde kurduğu dünyada gerçeklik ile düş arasında gidip gelen varoluşsal arayışı.',
    page_count: 480,
    categories: ['Türk Edebiyatı', 'Roman', 'Postmodern'],
    thumbnail_url: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80',
    isbn: '9789754700121'
  },
  {
    title: 'Bir Bilim Adamının Romanı',
    authors: ['Oğuz Atay'],
    publisher: 'İletişim Yayınları',
    published_date: '1975',
    description: 'Prof. Dr. Mustafa İnan\'ın yoksul bir halk çocuğundan saygın bir bilim insanına dönüşme serüvenini anlatan biyografik roman.',
    page_count: 272,
    categories: ['Türk Edebiyatı', 'Biyografi', 'Roman'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    isbn: '9789754700091'
  },
  {
    title: 'Korkuyu Beklerken',
    authors: ['Oğuz Atay'],
    publisher: 'İletişim Yayınları',
    published_date: '1975',
    description: 'Modern bireyin korkuları, yalnızlığı ve toplum karşısındaki yabancılaşmasını ironik bir dille anlatan sekiz çarpıcı hikâye.',
    page_count: 196,
    categories: ['Türk Edebiyatı', 'Öykü', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&q=80',
    isbn: '9789754700107'
  },
  {
    title: 'Benim Adım Kırmızı',
    authors: ['Orhan Pamuk'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1998',
    description: 'Osmanlı nakkaşları arasında geçen bir cinayet soruşturması üzerinden Doğu ve Batı sanat anlayışlarını sorgulayan tarihî polisiye roman.',
    page_count: 536,
    categories: ['Türk Edebiyatı', 'Tarih', 'Roman', 'Polisiye'],
    thumbnail_url: 'https://covers.openlibrary.org/b/id/1054459-L.jpg',
    isbn: '9789750825910'
  },
  {
    title: 'Kara Kitap',
    authors: ['Orhan Pamuk'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1990',
    description: 'Avukat Galip\'in kaybolan karısı Rüya ve köşe yazarı Celâl Salik\'i ararken İstanbul sokaklarında yaşadığı gizemli ve felsefi yolculuk.',
    page_count: 503,
    categories: ['Türk Edebiyatı', 'Roman', 'Postmodern'],
    thumbnail_url: 'https://covers.openlibrary.org/b/id/6878773-L.jpg',
    isbn: '9789750826139'
  },
  {
    title: 'Masumiyet Müzesi',
    authors: ['Orhan Pamuk'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '2008',
    description: 'Kemal\'in Füsun\'a duyduğu saplantılı aşkın ve hatıralara adanmış bir müzenin eşsiz duygusal anlatısı.',
    page_count: 592,
    categories: ['Türk Edebiyatı', 'Roman', 'Aşk'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    isbn: '9789750826146'
  },
  {
    title: 'Kar',
    authors: ['Orhan Pamuk'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '2002',
    description: 'Şair Ka\'nın Kars\'ta geçen intihar olaylarını araştırırken Türkiye\'nin siyasi ve toplumsal fay hatlarıyla yüzleştiği roman.',
    page_count: 496,
    categories: ['Türk Edebiyatı', 'Roman', 'Politik'],
    thumbnail_url: 'https://covers.openlibrary.org/b/id/6881426-L.jpg',
    isbn: '9789750825910'
  },
  {
    title: 'İnce Memed',
    authors: ['Yaşar Kemal'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1955',
    description: 'Toros Dağları\'nda zalim Abdi Ağa\'ya başkaldırıp dağa çıkan ve ezilen köylülerin simgesi hâline gelen efsanevi halk kahramanı Memed\'in destanı.',
    page_count: 436,
    categories: ['Türk Edebiyatı', 'Roman', 'Destan'],
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    isbn: '9789750807145'
  },
  {
    title: 'Yılanı Öldürseler',
    authors: ['Yaşar Kemal'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1976',
    description: 'Anavarza kayalıklarında töre, kan davası ve anne sevgisi arasında sıkışan küçük Hasan\'ın acı dolu dramı.',
    page_count: 112,
    categories: ['Türk Edebiyatı', 'Roman', 'Dram'],
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    isbn: '9789750807213'
  },
  {
    title: 'Semaver',
    authors: ['Sait Faik Abasıyanık'],
    publisher: 'İş Bankası Kültür Yayınları',
    published_date: '1936',
    description: 'İstanbul\'un emekçilerini, balıkçılarını ve adaların sıradan insanlarını samimi ve şiirsel bir duyarlıkla anlatan ilk hikâye kitabı.',
    page_count: 144,
    categories: ['Türk Edebiyatı', 'Öykü', 'Klasik'],
    thumbnail_url: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80',
    isbn: '9789754589252'
  },
  {
    title: 'Aylak Adam',
    authors: ['Yusuf Atılgan'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1959',
    description: 'Şehir hayatının tekdüzeliğinde gerçek bir ruh ikizi arayan C.\'nin varoluşsal bunalımını ve aylaklığını anlatan modern klasik.',
    page_count: 156,
    categories: ['Türk Edebiyatı', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    isbn: '9789750813351'
  },
  {
    title: 'Anayurt Oteli',
    authors: ['Yusuf Atılgan'],
    publisher: 'Yapı Kredi Yayınları',
    published_date: '1973',
    description: 'Taşra otelinde katip olan Zebercet\'in yalnızlığı, yabancılaşması ve geciken Ankara treniyle gelen gizemli kadına duyduğu tutkunun yıkıcı sonuçları.',
    page_count: 128,
    categories: ['Türk Edebiyatı', 'Roman', 'Psikoloji'],
    thumbnail_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&q=80',
    isbn: '9789750813368'
  },
  {
    title: 'Dokuzuncu Hariciye Koğuşu',
    authors: ['Peyami Safa'],
    publisher: 'Ötüken Neşriyat',
    published_date: '1930',
    description: 'Kemik veremi hastası genç bir çocuğun hastane koridorlarında çektiği fiziksel ve ruhsal acıları anlatan otobiyografik başyapıt.',
    page_count: 112,
    categories: ['Türk Edebiyatı', 'Roman', 'Psikoloji'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    isbn: '9789754370485'
  },
  {
    title: 'Yalnızız',
    authors: ['Peyami Safa'],
    publisher: 'Ötüken Neşriyat',
    published_date: '1951',
    description: 'Samerim Ütopyası etrafında madde ile mana, Doğu ile Batı çatışmasını ve insan ruhunun bölünmüşlüğünü tartışan felsefi roman.',
    page_count: 360,
    categories: ['Türk Edebiyatı', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    isbn: '9789754370508'
  },
  {
    title: 'Çalıkuşu',
    authors: ['Reşat Nuri Güntekin'],
    publisher: 'İnkılâp Kitabevi',
    published_date: '1922',
    description: 'İstanbul\'da büyüyen neşeli ve gururlu Feride\'nin aşk kırıklığı sonrası Anadolu\'nun köylerinde öğretmenlik yaparken yaşadığı fedakârlıklar.',
    page_count: 544,
    categories: ['Türk Edebiyatı', 'Roman', 'Dram'],
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    isbn: '9789751000675'
  },
  {
    title: 'Yaprak Dökümü',
    authors: ['Reşat Nuri Güntekin'],
    publisher: 'İnkılâp Kitabevi',
    published_date: '1930',
    description: 'Ali Rıza Bey ve ailesinin Batılılaşma hevesi, maddi zorluklar ve ahlaki değerler karşısında dağılışını anlatan sarsıcı roman.',
    page_count: 160,
    categories: ['Türk Edebiyatı', 'Roman', 'Aile'],
    thumbnail_url: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80',
    isbn: '9789751000729'
  },
  {
    title: 'Karamazov Kardeşler',
    authors: ['Fyodor Dostoyevski'],
    publisher: 'İş Bankası Kültür Yayınları',
    published_date: '1880',
    description: 'Bir baba cinayeti üzerinden inanç, ahlak, vicdan, özgür irade ve Tanrı\'nın varlığı gibi insanlığın en büyük felsefi sorularını irdeleyen başyapıt.',
    page_count: 1024,
    categories: ['Dünya Klasikleri', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    isbn: '9789754588521'
  },
  {
    title: 'Beyaz Geceler',
    authors: ['Fyodor Dostoyevski'],
    publisher: 'Can Yayınları',
    published_date: '1848',
    description: 'Petersburg\'un aydınlık gecelerinde yalnız bir hayalperest ile beklediği aşığı arayan Nastenka arasında filizlenen hüzünlü ve masalsı dostluk.',
    page_count: 96,
    categories: ['Dünya Klasikleri', 'Roman', 'Aşk'],
    thumbnail_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&q=80',
    isbn: '9789750738616'
  },
  {
    title: 'Yeraltından Notlar',
    authors: ['Fyodor Dostoyevski'],
    publisher: 'Can Yayınları',
    published_date: '1864',
    description: 'Toplumdan soyutlanmış, öfkeli ve çelişkili Yeraltı Adamı\'nın modern akılcılığa ve insan doğasına dair sert ve devrimci monoloğu.',
    page_count: 160,
    categories: ['Dünya Klasikleri', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    isbn: '9789750738623'
  },
  {
    title: 'Budala',
    authors: ['Fyodor Dostoyevski'],
    publisher: 'İş Bankası Kültür Yayınları',
    published_date: '1869',
    description: 'Tümüyle iyi, saf ve erdemli Prens Mışkin\'in yozlaşmış Rus sosyetesinde yaşadığı acı trajediyi konu alan psikolojik roman.',
    page_count: 752,
    categories: ['Dünya Klasikleri', 'Roman', 'Psikoloji'],
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    isbn: '9789754589207'
  },
  {
    title: 'Savaş ve Barış',
    authors: ['Lev Tolstoy'],
    publisher: 'İletişim Yayınları',
    published_date: '1869',
    description: 'Napolyon\'un Rusya seferi döneminde beş aristokrat ailenin hayatları, aşkları, kayıpları ve insanlık tarihinin büyük akışını anlatan anıtsal eser.',
    page_count: 1224,
    categories: ['Dünya Klasikleri', 'Roman', 'Tarih'],
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    isbn: '9789750517525'
  },
  {
    title: 'Anna Karenina',
    authors: ['Lev Tolstoy'],
    publisher: 'Can Yayınları',
    published_date: '1878',
    description: 'Aşk, sadakat, aile, vicdan ve toplumsal riyakarlık temalarını Anna Karenina ve Vronski\'nin trajik ilişkisi üzerinden işleyen edebiyat zirvesi.',
    page_count: 864,
    categories: ['Dünya Klasikleri', 'Roman', 'Dram'],
    thumbnail_url: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80',
    isbn: '9789750738647'
  },
  {
    title: 'İnsan Ne İle Yaşar?',
    authors: ['Lev Tolstoy'],
    publisher: 'İş Bankası Kültür Yayınları',
    published_date: '1885',
    description: 'Sevgi, merhamet, paylaşma ve insanın dünyadaki varoluş amacını sade ama derin hikâyelerle aydınlatan bilgelik dolu bir yapıt.',
    page_count: 96,
    categories: ['Dünya Klasikleri', 'Öykü', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    isbn: '9789754586985'
  },
  {
    title: 'Dava',
    authors: ['Franz Kafka'],
    publisher: 'Can Yayınları',
    published_date: '1925',
    description: 'Josef K.\'nın nedenini asla öğrenemediği bir suçlamayla tutuklanıp bürokrasinin akıl almaz labirentlerinde kayboluşunu anlatan karanlık başyapıt.',
    page_count: 224,
    categories: ['Dünya Klasikleri', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&q=80',
    isbn: '9789750719363'
  },
  {
    title: 'Şato',
    authors: ['Franz Kafka'],
    publisher: 'İş Bankası Kültür Yayınları',
    published_date: '1926',
    description: 'Kadastrocu K.\'nın gizemli bir köye gelip ulaşılamaz otoriteyi temsil eden Şato\'ya kabul edilmek için verdiği çaresiz mücadele.',
    page_count: 400,
    categories: ['Dünya Klasikleri', 'Roman', 'Distopya'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    isbn: '9789754589993'
  },
  {
    title: '1984',
    authors: ['George Orwell'],
    publisher: 'Can Yayınları',
    published_date: '1949',
    description: 'Büyük Birader\'in her şeyi izlediği, düşünce suçunun ölümle cezalandırıldığı totaliter bir distopyada Winston Smith\'in özgürlük direnişi.',
    page_count: 352,
    categories: ['Dünya Klasikleri', 'Roman', 'Distopya'],
    thumbnail_url: 'https://covers.openlibrary.org/b/id/9267242-L.jpg',
    isbn: '9789750718533'
  },
  {
    title: 'Hayvan Çiftliği',
    authors: ['George Orwell'],
    publisher: 'Can Yayınları',
    published_date: '1945',
    description: 'İnsanların zulmüne karşı başkaldıran çiftlik hayvanlarının zamanla kendi içlerindeki diktatörlüğe yenik düşüşünü anlatan unutulmaz siyasi hiciv.',
    page_count: 152,
    categories: ['Dünya Klasikleri', 'Roman', 'Politik'],
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    isbn: '9789750719387'
  },
  {
    title: 'Yabancı',
    authors: ['Albert Camus'],
    publisher: 'Can Yayınları',
    published_date: '1942',
    description: 'Meursault\'nun annesinin ölümünden sonra Cezayir sahilinde bir cinayete karışması ve toplumun ahlak kalıplarına boyun eğmeyişini anlatan absürt felsefe klasiği.',
    page_count: 112,
    categories: ['Dünya Klasikleri', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    isbn: '9789750738661'
  },
  {
    title: 'Veba',
    authors: ['Albert Camus'],
    publisher: 'Can Yayınları',
    published_date: '1947',
    description: 'Oran kentini saran amansız veba salgını karşısında Dr. Rieux ve arkadaşlarının gösterdiği insani dayanışma, direnç ve ahlak mücadelesi.',
    page_count: 304,
    categories: ['Dünya Klasikleri', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80',
    isbn: '9789750738678'
  },
  {
    title: 'Satranç',
    authors: ['Stefan Zweig'],
    publisher: 'İş Bankası Kültür Yayınları',
    published_date: '1942',
    description: 'Gestapo tecridinde zihninde oynadığı yüzlerce satranç oyunuyla hayatta kalan Dr. B.\'nin dünya satranç şampiyonuna karşı verdiği zihinsel düello.',
    page_count: 88,
    categories: ['Dünya Klasikleri', 'Roman', 'Psikoloji'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    isbn: '9789754589245'
  },
  {
    title: 'Bilinmeyen Bir Kadının Mektubu',
    authors: ['Stefan Zweig'],
    publisher: 'İş Bankası Kültür Yayınları',
    published_date: '1922',
    description: 'Ölmek üzere olan bir kadının, hayatı boyunca karşılıksız ve derin bir tutkuyla sevdiği ünlü yazara yazdığı sarsıcı itiraf mektubu.',
    page_count: 64,
    categories: ['Dünya Klasikleri', 'Roman', 'Aşk'],
    thumbnail_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&q=80',
    isbn: '9789754589306'
  },
  {
    title: 'Küçük Prens',
    authors: ['Antoine de Saint-Exupéry'],
    publisher: 'Can Yayınları',
    published_date: '1943',
    description: 'Sahra Çölü\'ne düşen bir pilot ile B-612 asteroidinden gelen altın saçlı Küçük Prens\'in dostluğu; sevgi, sorumluluk ve görmeyi bilmek üzerine evrensel masal.',
    page_count: 112,
    categories: ['Dünya Klasikleri', 'Masal', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    isbn: '9789750725555'
  },
  {
    title: 'Yüzyıllık Yalnızlık',
    authors: ['Gabriel García Márquez'],
    publisher: 'Can Yayınları',
    published_date: '1967',
    description: 'Büyülü gerçekçiliğin zirvesi sayılan Macondo kasabasında Buendía ailesinin yedi nesil süren görkemli, trajik ve gizemli tarihi.',
    page_count: 464,
    categories: ['Dünya Klasikleri', 'Roman', 'Büyülü Gerçekçilik'],
    thumbnail_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    isbn: '9789750738685'
  },
  {
    title: 'Kırmızı Pazartesi',
    authors: ['Gabriel García Márquez'],
    publisher: 'Can Yayınları',
    published_date: '1981',
    description: 'İşleneceği herkes tarafından bilinen ama kimsenin engellemediği bir namus cinayetinin toplumsal anatomisini çıkaran büyüleyici anlatı.',
    page_count: 112,
    categories: ['Dünya Klasikleri', 'Roman', 'Polisiye'],
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    isbn: '9789750738692'
  },
  {
    title: 'Sefiller',
    authors: ['Victor Hugo'],
    publisher: 'İş Bankası Kültür Yayınları',
    published_date: '1862',
    description: 'Bir somun ekmek çaldığı için kürek mahkumu olan Jean Valjean\'ın merhamet, adalet ve vicdan arayışını anlatan dünya edebiyatının dev anıtı.',
    page_count: 1724,
    categories: ['Dünya Klasikleri', 'Roman', 'Tarih'],
    thumbnail_url: 'https://covers.openlibrary.org/b/id/12112352-L.jpg',
    isbn: '9789754589269'
  },
  {
    title: 'Siddhartha',
    authors: ['Hermann Hesse'],
    publisher: 'Can Yayınları',
    published_date: '1922',
    description: 'Brahman oğlu Siddhartha\'nın iç huzuru, hakikati ve aydınlanmayı aramak üzere dünyevi hayatın her aşamasından geçtiği felsefi arınma yolculuğu.',
    page_count: 152,
    categories: ['Dünya Klasikleri', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&q=80',
    isbn: '9789750738708'
  },
  {
    title: 'Varolmanın Dayanılmaz Hafifliği',
    authors: ['Milan Kundera'],
    publisher: 'Can Yayınları',
    published_date: '1984',
    description: '1968 Prag Baharı ortamında Tomas, Tereza, Sabina ve Franz\'ın ilişkileri üzerinden hafiflik ile ağırlık, sadakat ile özgürlük ikilemini sorgulayan felsefi roman.',
    page_count: 336,
    categories: ['Dünya Klasikleri', 'Roman', 'Felsefe'],
    thumbnail_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
    isbn: '9789750738715'
  }
];

async function seed() {
  console.log('Authenticating demo account...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'zsenasahin.demo@kitaphane.app',
    password: 'KitaphaneDemo2026!'
  });

  if (authError) {
    console.error('Auth error:', authError);
    process.exit(1);
  }

  console.log('Authenticated as:', authData.user.id);

  // Mevcut kitapları al
  const { data: existingBooks } = await supabase.from('books').select('title');
  const existingTitles = new Set((existingBooks || []).map(b => b.title.trim().toLowerCase()));

  console.log(`Currently ${existingTitles.size} books in DB.`);

  let insertedCount = 0;
  for (const book of BOOKS_TO_SEED) {
    const norm = book.title.trim().toLowerCase();
    if (existingTitles.has(norm)) {
      console.log(`Skipping existing: ${book.title}`);
      continue;
    }

    const { data, error } = await supabase.from('books').insert(book).select();
    if (error) {
      console.error(`Error inserting ${book.title}:`, error.message);
    } else {
      console.log(`✓ Inserted: ${book.title} (ID: ${data[0]?.id})`);
      insertedCount++;
    }
  }

  console.log(`\nDone! Successfully seeded ${insertedCount} new masterpiece books.`);
}

seed();
