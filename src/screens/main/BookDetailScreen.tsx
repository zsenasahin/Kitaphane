import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ChevronLeft, PenLine, Quote, Star, Users } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useStyles, useTheme } from '../../context/ThemeContext';
import { Book, Post, UserBook } from '../../lib/types';
import { booksService, hasRealCover, isUuid } from '../../services/booksService';
import { libraryService } from '../../services/libraryService';
import { postsService } from '../../services/postsService';
import { coverService } from '../../services/coverService';
import { BookCover } from '../../components/BookCover';
import { AddToShelfButton } from '../../components/AddToShelfButton';
import { PostCard } from '../../components/PostCard';
import { IconButton, PressableScale, Stars } from '../../components/ui';
import { fonts, hashString, radius, Theme } from '../../theme/themes';

type Tab = 'quote' | 'review';

export const BookDetailScreen: React.FC<{ book: Book; onBack: () => void }> = ({ book: initial, onBack }) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { push, openComposer, openStatusSheet, versions, bump } = useApp();
  const { showToast } = useToast();

  const [book, setBook] = useState<Book>(initial);
  const [userBook, setUserBook] = useState<UserBook | null>(null);
  const [description, setDescription] = useState<string | null>(initial.description);
  const [descOpen, setDescOpen] = useState(false);
  const [stats, setStats] = useState<{ readers: number; avgRating: number | null; ratingCount: number } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<Tab>('quote');
  const [adding, setAdding] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [foundCover, setFoundCover] = useState<string | null>(null);

  useEffect(() => {
    if (hasRealCover(book.thumbnail_url)) return;
    coverService.resolve(book.title, book.authors?.[0], book.isbn).then(setFoundCover);
  }, [book.id]);
  const heroUrl = hasRealCover(book.thumbnail_url) ? book.thumbnail_url : foundCover;

  // Kitabı katalogdaki gerçek kaydına bağla
  useEffect(() => {
    let alive = true;
    (async () => {
      let real = initial;
      if (!isUuid(initial.id)) {
        const res = await booksService.findOrCreateBook(initial);
        if (res.book) real = { ...res.book, thumbnail_url: res.book.thumbnail_url || initial.thumbnail_url };
      }
      if (!alive) return;
      setBook(real);
      booksService.loadDescription(real).then((d) => alive && d && setDescription(d));
    })();
    return () => {
      alive = false;
    };
  }, [initial.id]);

  useEffect(() => {
    if (isUuid(book.id)) booksService.getBookStats(book.id).then(setStats);
  }, [book.id, versions.library, versions.posts]);

  useEffect(() => {
    if (!user || !isUuid(book.id)) return;
    libraryService.getUserBookByBookId(user.id, book.id).then(({ userBook: ub }) => setUserBook(ub));
  }, [book.id, versions.library]);

  useEffect(() => {
    if (!isUuid(book.id)) return;
    setLoadingPosts(true);
    postsService
      .getPosts({ currentUserId: user?.id, bookId: book.id, postType: tab, limit: 30 })
      .then(({ posts: p }) => {
        setPosts(p);
        setLoadingPosts(false);
      });
  }, [book.id, tab, versions.posts]);

  const add = async () => {
    if (!user) return;
    setAdding(true);
    const real = isUuid(book.id) ? book : (await booksService.findOrCreateBook(book)).book;
    if (!real) {
      setAdding(false);
      return showToast('Kitap eklenemedi, tekrar dene.', 'error');
    }
    const { userBook: ub, error } = await libraryService.addOrUpdateUserBook(user.id, real.id, 'want_to_read');
    setAdding(false);
    if (error) return showToast(error, 'error');
    setBook(real);
    setUserBook(ub);
    bump('library', 'profile');
  };

  const heroColor = theme.spines[hashString(book.title + (book.authors?.[0] || '')) % theme.spines.length];
  const year = book.published_date?.match(/\d{4}/)?.[0];
  const meta = [year, book.page_count ? `${book.page_count} sayfa` : null, book.publisher].filter(Boolean);
  const cleanCategories = (book.categories || []).filter((c) => c.length < 28).slice(0, 4);

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Kahraman alanı */}
        <View style={[s.hero, { paddingTop: insets.top + 56, backgroundColor: heroColor }]}>
          {heroUrl && (
            <Image
              source={{ uri: heroUrl }}
              blurRadius={28}
              style={[StyleSheet.absoluteFill, { opacity: 0.55 }]}
              resizeMode="cover"
            />
          )}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bg, opacity: theme.dark ? 0.55 : 0.35 }]} />
          <Svg style={s.heroFade} width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="heroFade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.bg} stopOpacity={0} />
                <Stop offset="1" stopColor={theme.bg} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroFade)" />
          </Svg>
          <BookCover url={book.thumbnail_url} title={book.title} author={book.authors?.[0]} isbn={book.isbn} width={150} standingShadow />
        </View>

        <View style={s.body}>
          <Text style={s.title}>{book.title}</Text>
          {book.subtitle ? <Text style={s.subtitle}>{book.subtitle}</Text> : null}
          {book.authors && book.authors.length > 0 && (
            <View style={s.authors}>
              {book.authors.map((a, i) => (
                <Pressable key={a} onPress={() => push({ name: 'author', author: a })} hitSlop={6}>
                  <Text style={s.author}>
                    {a}
                    {i < book.authors!.length - 1 ? ', ' : ''}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          {meta.length > 0 && <Text style={s.meta}>{meta.join('  ·  ')}</Text>}

          {/* Topluluk istatistikleri */}
          <View style={s.statsRow}>
            <View style={s.stat}>
              <View style={s.statTop}>
                <Star size={16} color="#E8B04B" fill="#E8B04B" />
                <Text style={s.statValue}>{stats?.avgRating ? stats.avgRating.toFixed(1) : '—'}</Text>
              </View>
              <Text style={s.statLabel}>{stats?.ratingCount ? `${stats.ratingCount} puan` : 'henüz puan yok'}</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <View style={s.statTop}>
                <Users size={16} color={theme.primary} />
                <Text style={s.statValue}>{stats?.readers ?? '—'}</Text>
              </View>
              <Text style={s.statLabel}>okurun rafında</Text>
            </View>
            {userBook?.rating ? (
              <>
                <View style={s.statDivider} />
                <View style={s.stat}>
                  <Stars value={userBook.rating} size={13} />
                  <Text style={[s.statLabel, { marginTop: 6 }]}>senin puanın</Text>
                </View>
              </>
            ) : null}
          </View>

          {/* Kitaplığa ekle */}
          <View style={{ marginTop: 22 }}>
            <AddToShelfButton
              userBook={userBook}
              pageCount={book.page_count}
              busy={adding}
              onAdd={add}
              onOpenStatus={() => openStatusSheet(book)}
            />
          </View>

          <View style={s.actions}>
            <PressableScale style={[s.action, { backgroundColor: theme.quoteBg }]} onPress={() => openComposer('quote', book)}>
              <Quote size={17} color={theme.text} />
              <Text style={s.actionText}>Alıntı ekle</Text>
            </PressableScale>
            <PressableScale style={[s.action, { backgroundColor: theme.reviewBg }]} onPress={() => openComposer('review', book)}>
              <PenLine size={17} color={theme.text} />
              <Text style={s.actionText}>İnceleme yaz</Text>
            </PressableScale>
          </View>

          {/* Açıklama */}
          {description ? (
            <View style={{ marginTop: 26 }}>
              <Text style={s.h2}>Kitap hakkında</Text>
              <Text style={s.desc} numberOfLines={descOpen ? undefined : 6}>
                {description}
              </Text>
              {description.length > 300 && (
                <Pressable onPress={() => setDescOpen(!descOpen)} hitSlop={6}>
                  <Text style={s.more}>{descOpen ? 'daha az göster' : 'devamını oku'}</Text>
                </Pressable>
              )}
            </View>
          ) : null}

          {cleanCategories.length > 0 && (
            <View style={s.cats}>
              {cleanCategories.map((c) => (
                <View key={c} style={s.cat}>
                  <Text style={s.catText}>{c}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Topluluk */}
          <View style={s.tabs}>
            {(['quote', 'review'] as Tab[]).map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={[s.tab, tab === t && s.tabActive]}>
                <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t === 'quote' ? 'Alıntılar' : 'İncelemeler'}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {loadingPosts ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />
        ) : posts.length === 0 ? (
          <Text style={s.noPosts}>
            {tab === 'quote'
              ? 'Bu kitaptan henüz alıntı yok. İlk altını çizen sen ol!'
              : 'Henüz inceleme yazılmamış. Düşüncelerini paylaş!'}
          </Text>
        ) : (
          posts.map((p) => (
            <PostCard key={p.id} post={p} onDeleted={(id) => setPosts((prev) => prev.filter((x) => x.id !== id))} />
          ))
        )}
      </ScrollView>

      <View style={[s.topBar, { top: insets.top + 8 }]}>
        <IconButton onPress={onBack} accessibilityLabel="Geri">
          <ChevronLeft size={22} color={theme.text} />
        </IconButton>
      </View>
    </View>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    hero: { alignItems: 'center', paddingBottom: 28, overflow: 'hidden' },
    heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 },
    topBar: { position: 'absolute', left: 16 },
    body: { paddingHorizontal: 22, paddingTop: 18 },
    title: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '700', color: t.text, textAlign: 'center', lineHeight: 34 },
    subtitle: { fontSize: 15, color: t.textSoft, textAlign: 'center', marginTop: 4, fontStyle: 'italic' },
    authors: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 },
    author: { fontSize: 16, color: t.primary, fontWeight: '700' },
    meta: { fontSize: 13, color: t.textMuted, textAlign: 'center', marginTop: 8 },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      paddingVertical: 14,
      borderRadius: radius.lg,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    stat: { flex: 1, alignItems: 'center' },
    statTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statValue: { fontSize: 18, fontWeight: '800', color: t.text },
    statLabel: { fontSize: 11.5, color: t.textMuted, marginTop: 2 },
    statDivider: { width: 1, height: 30, backgroundColor: t.border },
    actions: { flexDirection: 'row', gap: 10, marginTop: 30 },
    action: {
      flex: 1,
      height: 48,
      borderRadius: radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    actionText: { fontSize: 14, fontWeight: '700', color: t.text },
    h2: { fontFamily: fonts.serif, fontSize: 19, fontWeight: '700', color: t.text, marginBottom: 10 },
    desc: { fontSize: 15, lineHeight: 23, color: t.textSoft },
    more: { color: t.primary, fontWeight: '700', marginTop: 6 },
    cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
    cat: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: t.bgSoft },
    catText: { fontSize: 12, fontWeight: '600', color: t.textSoft },
    tabs: { flexDirection: 'row', gap: 22, marginTop: 30, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: t.border },
    tab: { paddingBottom: 10, borderBottomWidth: 2.5, borderBottomColor: 'transparent', marginBottom: -1 },
    tabActive: { borderBottomColor: t.primary },
    tabText: { fontFamily: fonts.serif, fontSize: 17, fontWeight: '600', color: t.textMuted },
    tabTextActive: { color: t.text, fontWeight: '700' },
    noPosts: { textAlign: 'center', color: t.textSoft, paddingHorizontal: 40, marginTop: 10, lineHeight: 20 },
  });
