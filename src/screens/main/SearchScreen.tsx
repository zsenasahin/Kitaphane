import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BookPlus, Clock, PenLine, Search as SearchIcon, UserRound, X } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useStyles, useTheme } from '../../context/ThemeContext';
import { AuthorResult, Book, Profile } from '../../lib/types';
import { safeStorage } from '../../lib/supabase';
import { booksService } from '../../services/booksService';
import { socialService } from '../../services/socialService';
import { BookCover } from '../../components/BookCover';
import { Avatar, EmptyState, PressableScale, SectionTitle, useNativeDriver } from '../../components/ui';
import { fonts, radius, shadow, Theme } from '../../theme/themes';

type Mode = 'books' | 'authors' | 'readers';
const MODES: { id: Mode; label: string }[] = [
  { id: 'books', label: 'Kitaplar' },
  { id: 'authors', label: 'Yazarlar' },
  { id: 'readers', label: 'Okurlar' },
];
const RECENT_KEY = 'kitaphane.recentSearches';

export const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const { user } = useAuth();
  const { push, openStatusSheet } = useApp();

  const [mode, setMode] = useState<Mode>('books');
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<AuthorResult[]>([]);
  const [readers, setReaders] = useState<Profile[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [popular, setPopular] = useState<Book[]>([]);
  const [newReaders, setNewReaders] = useState<Profile[]>([]);
  const requestId = useRef(0);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    safeStorage.getItem(RECENT_KEY).then((v) => {
      try {
        if (v) setRecent(JSON.parse(v));
      } catch {
        // bozuk kayıt yok sayılır
      }
    });
    booksService.getPopularBooks(12).then(setPopular);
    if (user) socialService.getSuggestedReaders(user.id, 6).then(setNewReaders);
  }, []);

  useEffect(() => {
    Animated.timing(focusAnim, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [focused]);

  // Yazarken arama (debounce)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setBooks([]);
      setAuthors([]);
      setReaders([]);
      setLoading(false);
      setLoadingMore(false);
      return;
    }
    setLoading(true);
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      if (mode === 'books') {
        const { books: res } = await booksService.searchBooks(q, 30, (partial) => {
          if (id === requestId.current) {
            setBooks(partial);
            setLoading(false);
            setLoadingMore(true);
          }
        });
        if (id === requestId.current) {
          setBooks(res);
          setLoadingMore(false);
        }
      } else if (mode === 'authors') {
        const res = await booksService.searchAuthors(q, 15, (partial) => {
          if (id === requestId.current) {
            setAuthors(partial);
            setLoading(false);
            setLoadingMore(true);
          }
        });
        if (id === requestId.current) {
          setAuthors(res);
          setLoadingMore(false);
        }
      } else {
        const res = await socialService.searchUsers(q);
        if (id === requestId.current) setReaders(res);
      }
      if (id === requestId.current) setLoading(false);
    }, 380);
    return () => clearTimeout(timer);
  }, [query, mode]);

  const remember = (q: string) => {
    const term = q.trim();
    if (term.length < 2) return;
    const next = [term, ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 8);
    setRecent(next);
    safeStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const clearRecent = () => {
    setRecent([]);
    safeStorage.removeItem(RECENT_KEY);
  };

  const openBook = (b: Book) => {
    remember(query);
    push({ name: 'book', book: b });
  };

  const hasQuery = query.trim().length >= 2;
  const results: any[] = mode === 'books' ? books : mode === 'authors' ? authors : readers;

  const renderBook = ({ item }: { item: Book }) => (
    <PressableScale onPress={() => openBook(item)} scaleTo={0.98} style={s.bookRow}>
      <BookCover url={item.thumbnail_url} title={item.title} author={item.authors?.[0]} isbn={item.isbn} width={54} />
      <View style={{ flex: 1 }}>
        <Text style={s.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={s.bookAuthor} numberOfLines={1}>
          {item.authors?.join(', ') || 'Yazar bilinmiyor'}
        </Text>
        <Text style={s.bookMeta} numberOfLines={1}>
          {[item.published_date?.slice(0, 4), item.page_count ? `${item.page_count} sayfa` : null]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      <Pressable
        onPress={() => {
          remember(query);
          openStatusSheet(item);
        }}
        hitSlop={8}
        style={s.quickAdd}
        accessibilityLabel="Kitaplığa ekle"
      >
        <BookPlus size={19} color={theme.primary} />
      </Pressable>
    </PressableScale>
  );

  const renderAuthor = ({ item }: { item: AuthorResult }) => (
    <PressableScale
      onPress={() => {
        remember(query);
        push({ name: 'author', author: item.name, authorKey: item.key });
      }}
      scaleTo={0.98}
      style={s.personRow}
    >
      <Avatar name={item.name} url={item.photoUrl} size={52} />
      <View style={{ flex: 1 }}>
        <Text style={s.personName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={s.personSub} numberOfLines={1}>
          {[item.topWork, item.workCount ? `${item.workCount} eser` : null].filter(Boolean).join(' · ') || 'Yazar'}
        </Text>
      </View>
      <PenLine size={18} color={theme.textMuted} />
    </PressableScale>
  );

  const renderReader = ({ item }: { item: Profile }) => (
    <PressableScale
      onPress={() => {
        remember(query);
        push({ name: 'profile', userId: item.id });
      }}
      scaleTo={0.98}
      style={s.personRow}
    >
      <Avatar name={item.full_name || item.username} url={item.avatar_url} size={52} />
      <View style={{ flex: 1 }}>
        <Text style={s.personName} numberOfLines={1}>
          {item.full_name || item.username}
        </Text>
        <Text style={s.personSub} numberOfLines={1}>
          @{item.username}
          {item.bio ? ` · ${item.bio}` : ''}
        </Text>
      </View>
      <UserRound size={18} color={theme.textMuted} />
    </PressableScale>
  );

  const discover = (
    <View style={{ paddingTop: 8 }}>
      {recent.length > 0 && (
        <View style={s.block}>
          <SectionTitle title="Son aramalar" action={{ label: 'Temizle', onPress: clearRecent }} />
          <View style={s.recentWrap}>
            {recent.map((r) => (
              <PressableScale key={r} onPress={() => setQuery(r)} style={s.recentChip}>
                <Clock size={13} color={theme.textMuted} />
                <Text style={s.recentText}>{r}</Text>
              </PressableScale>
            ))}
          </View>
        </View>
      )}

      {popular.length > 0 && (
        <View style={s.block}>
          <SectionTitle title="Okurların rafından" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingRight: 20 }}>
            {popular.map((b) => (
              <PressableScale key={b.id} onPress={() => openBook(b)} style={{ width: 104 }}>
                <BookCover url={b.thumbnail_url} title={b.title} author={b.authors?.[0]} width={104} />
                <Text style={s.popTitle} numberOfLines={2}>
                  {b.title}
                </Text>
                <Text style={s.popAuthor} numberOfLines={1}>
                  {b.authors?.[0]}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>
        </View>
      )}

      {newReaders.length > 0 && (
        <View style={s.block}>
          <SectionTitle title="Yeni okurlar" />
          {newReaders.map((p) => (
            <View key={p.id}>{renderReader({ item: p })}</View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={s.container}>
      <Text style={s.title}>Keşfet</Text>

      <Animated.View
        style={[
          s.searchBar,
          {
            borderColor: focusAnim.interpolate({ inputRange: [0, 1], outputRange: [theme.border, theme.primary] }),
          },
        ]}
      >
        <SearchIcon size={20} color={focused ? theme.primary : theme.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={() => remember(query)}
          placeholder={
            mode === 'books' ? 'Kitap adı, yazar ya da ISBN' : mode === 'authors' ? 'Yazar adı' : 'Okur adı ya da kullanıcı adı'
          }
          placeholderTextColor={theme.textMuted}
          style={s.input}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={10} style={s.clear}>
            <X size={14} color={theme.card} />
          </Pressable>
        )}
      </Animated.View>

      <ModeTabs mode={mode} onChange={setMode} />

      {!hasQuery ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {discover}
        </ScrollView>
      ) : (
        <FlatList
          data={loading ? [] : results}
          keyExtractor={(item: any, i) => item.id || item.key || `${item.name}_${i}`}
          renderItem={mode === 'books' ? (renderBook as any) : mode === 'authors' ? (renderAuthor as any) : (renderReader as any)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loadingMore && mode !== 'readers' ? (
              <View style={s.moreRow}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={s.moreText}>{mode === 'books' ? 'Daha fazla kitap aranıyor…' : 'Daha fazla yazar aranıyor…'}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
            ) : (
              <EmptyState
                icon={<SearchIcon size={28} color={theme.primary} />}
                title="Sonuç bulunamadı"
                text={`“${query.trim()}” için ${MODES.find((m) => m.id === mode)!.label.toLowerCase()} arasında bir şey bulamadık. Farklı bir yazım dene.`}
              />
            )
          }
        />
      )}
    </View>
  );
};

const ModeTabs: React.FC<{ mode: Mode; onChange: (m: Mode) => void }> = ({ mode, onChange }) => {
  const s = useStyles(makeStyles);
  const [w, setW] = useState(0);
  const idx = MODES.findIndex((m) => m.id === mode);
  const x = useRef(new Animated.Value(idx)).current;
  useEffect(() => {
    Animated.spring(x, { toValue: idx, friction: 8, tension: 90, useNativeDriver }).start();
  }, [idx]);
  const seg = w / MODES.length;
  return (
    <View style={s.modes} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width - 8)}>
      {w > 0 && (
        <Animated.View
          style={[s.modeIndicator, { width: seg, transform: [{ translateX: x.interpolate({ inputRange: [0, 1, 2], outputRange: [0, seg, seg * 2] }) }] }]}
        />
      )}
      {MODES.map((m) => (
        <Pressable key={m.id} onPress={() => onChange(m.id)} style={s.mode}>
          <Text style={[s.modeText, mode === m.id && s.modeTextActive]}>{m.label}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    title: { fontFamily: fonts.serif, fontSize: 30, fontWeight: '700', color: t.text, paddingHorizontal: 20, paddingTop: 14 },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginHorizontal: 16,
      marginTop: 14,
      paddingHorizontal: 16,
      height: 54,
      borderRadius: radius.pill,
      backgroundColor: t.card,
      borderWidth: 1.5,
      ...shadow(t, 1),
    },
    input: { flex: 1, fontSize: 16, color: t.text, height: '100%', outlineStyle: 'none' } as any,
    clear: { width: 22, height: 22, borderRadius: 11, backgroundColor: t.textMuted, alignItems: 'center', justifyContent: 'center' },
    modes: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, marginBottom: 10, padding: 4, borderRadius: radius.pill, backgroundColor: t.bgSoft },
    modeIndicator: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: radius.pill, backgroundColor: t.primary },
    mode: { flex: 1, alignItems: 'center', paddingVertical: 9 },
    modeText: { fontSize: 14, fontWeight: '600', color: t.textSoft },
    modeTextActive: { color: t.onPrimary, fontWeight: '800' },
    block: { paddingHorizontal: 20, marginTop: 18 },
    recentWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    recentChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    recentText: { fontSize: 13, color: t.textSoft, fontWeight: '600' },
    popTitle: { fontSize: 13, fontWeight: '700', color: t.text, marginTop: 8 },
    popAuthor: { fontSize: 11.5, color: t.textMuted, marginTop: 2 },
    bookRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 12,
      marginBottom: 10,
      borderRadius: radius.lg,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    bookTitle: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '700', color: t.text },
    bookAuthor: { fontSize: 13, color: t.textSoft, marginTop: 3 },
    bookMeta: { fontSize: 12, color: t.textMuted, marginTop: 4 },
    quickAdd: { width: 40, height: 40, borderRadius: 20, backgroundColor: t.primarySoft, alignItems: 'center', justifyContent: 'center' },
    personRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 12,
      marginBottom: 10,
      borderRadius: radius.lg,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    moreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
    moreText: { fontSize: 13, color: t.textMuted },
    personName: { fontSize: 15.5, fontWeight: '700', color: t.text },
    personSub: { fontSize: 13, color: t.textMuted, marginTop: 2 },
  });
