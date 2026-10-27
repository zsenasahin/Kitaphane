import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BookOpenText, Plus, Quote, Search, X } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useStyles, useTheme } from '../../context/ThemeContext';
import { USER_BOOK_STATUS_LABELS, USER_BOOK_STATUS_ORDER, UserBook, UserBookStatus } from '../../lib/types';
import { libraryService } from '../../services/libraryService';
import { enrichBook } from '../../services/booksService';
import { Bookshelf } from '../../components/Bookshelf';
import { BookCover } from '../../components/BookCover';
import { STATUS_ICONS, statusColor } from '../../components/StatusSheet';
import { Chip, IconButton, PressableScale, ProgressBar, useNativeDriver } from '../../components/ui';
import { fonts, radius, Theme } from '../../theme/themes';

type Filter = 'all' | UserBookStatus;

export const LibraryScreen: React.FC = () => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const { user } = useAuth();
  const { versions, goTab, openStatusSheet, push, openComposer } = useApp();

  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [pulled, setPulled] = useState<UserBook | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { userBooks } = await libraryService.getUserBooks(user.id);
    setBooks(userBooks.filter((ub) => ub.book).map((ub) => ({ ...ub, book: enrichBook(ub.book!) })));
    setLoading(false);
    setRefreshing(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load, versions.library]);

  const counts = USER_BOOK_STATUS_ORDER.reduce(
    (acc, st) => ({ ...acc, [st]: books.filter((b) => b.status === st).length }),
    {} as Record<UserBookStatus, number>
  );
  const visible = filter === 'all' ? books : books.filter((b) => b.status === filter);
  const yearDone = books.filter(
    (b) => b.status === 'read' && b.finished_at && new Date(b.finished_at).getFullYear() === new Date().getFullYear()
  ).length;

  const emptySlot = (
    <PressableScale onPress={() => goTab('search')} style={s.addSlot}>
      <Plus size={18} color={theme.onPrimary} />
      <Text style={s.addSlotText}>Kitap ekle</Text>
    </PressableScale>
  );

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.primary} />
        }
      >
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Kitaplığım</Text>
            <Text style={s.subtitle}>
              {books.length} kitap · bu yıl {yearDone} kitap bitirdin
            </Text>
          </View>
          <IconButton onPress={() => goTab('search')} accessibilityLabel="Kitap ara">
            <Search size={20} color={theme.text} />
          </IconButton>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          <Chip label={`Tümü · ${books.length}`} active={filter === 'all'} onPress={() => setFilter('all')} />
          {USER_BOOK_STATUS_ORDER.map((st) => (
            <Chip
              key={st}
              label={`${USER_BOOK_STATUS_LABELS[st]} · ${counts[st] || 0}`}
              active={filter === st}
              color={statusColor(theme, st)}
              onPress={() => setFilter(st)}
            />
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
            <Bookshelf books={visible} onBookPress={setPulled} emptySlot={filter === 'all' ? emptySlot : undefined} />
            {books.length === 0 && (
              <Text style={s.hint}>
                Rafların boş görünüyor. Arama sekmesinden kitap bulup “Kitaplığıma Ekle” dediğinde burada yerini alacak.
              </Text>
            )}
            {books.length > 0 && visible.length === 0 && (
              <Text style={s.hint}>Bu rafta henüz kitap yok.</Text>
            )}
          </>
        )}
      </ScrollView>

      <PulledBook
        userBook={pulled}
        onClose={() => setPulled(null)}
        onUpdate={(ub) => openStatusSheet(ub.book!)}
        onDetails={(ub) => push({ name: 'book', book: ub.book! })}
        onQuote={(ub) => openComposer('quote', ub.book!)}
      />
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Raftan çekilen kitap: kapak dönerek öne gelir                       */
/* ------------------------------------------------------------------ */
const PulledBook: React.FC<{
  userBook: UserBook | null;
  onClose: () => void;
  onUpdate: (ub: UserBook) => void;
  onDetails: (ub: UserBook) => void;
  onQuote: (ub: UserBook) => void;
}> = ({ userBook, onClose, onUpdate, onDetails, onQuote }) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const anim = useRef(new Animated.Value(0)).current;
  const [current, setCurrent] = useState<UserBook | null>(null);

  useEffect(() => {
    if (userBook) {
      setCurrent(userBook);
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, friction: 8, tension: 45, useNativeDriver }).start();
    }
  }, [userBook]);

  const close = (after?: () => void) => {
    Animated.timing(anim, { toValue: 0, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver }).start(() => {
      setCurrent(null);
      onClose();
      after?.();
    });
  };

  if (!current?.book) return null;
  const b = current.book;
  const c = statusColor(theme, current.status);
  const Icon = STATUS_ICONS[current.status];
  const progress = b.page_count ? (current.current_page || 0) / b.page_count : 0;

  return (
    <Modal visible transparent animationType="none" onRequestClose={() => close()} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={() => close()}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlay, opacity: anim }]} />
      </TouchableWithoutFeedback>
      <View style={s.pullWrap} pointerEvents="box-none">
        <Animated.View
          style={{
            zIndex: 2,
            position: 'relative',
            transform: [
              { perspective: 900 },
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [160, 0] }) },
              { rotateY: anim.interpolate({ inputRange: [0, 1], outputRange: ['88deg', '0deg'] }) },
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
            ],
          }}
        >
          <BookCover url={b.thumbnail_url} title={b.title} author={b.authors?.[0]} width={170} standingShadow />
        </Animated.View>

        <Animated.View
          style={[
            s.pullCard,
            {
              opacity: anim,
              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
            },
          ]}
        >
          <Pressable style={s.pullClose} onPress={() => close()} hitSlop={10}>
            <X size={18} color={theme.textMuted} />
          </Pressable>
          <Text style={s.pullTitle} numberOfLines={2}>
            {b.title}
          </Text>
          <Text style={s.pullAuthor} numberOfLines={1}>
            {b.authors?.join(', ')}
          </Text>
          <View style={[s.statusPill, { backgroundColor: c + '22' }]}>
            <Icon size={14} color={c} />
            <Text style={[s.statusPillText, { color: c }]}>{USER_BOOK_STATUS_LABELS[current.status]}</Text>
          </View>
          {current.status === 'reading' && b.page_count ? (
            <View style={{ width: '100%', marginTop: 14 }}>
              <View style={s.progressRow}>
                <Text style={s.progressText}>
                  {current.current_page || 0} / {b.page_count} sayfa
                </Text>
                <Text style={[s.progressText, { color: theme.primary, fontWeight: '800' }]}>
                  %{Math.round(progress * 100)}
                </Text>
              </View>
              <ProgressBar value={progress} height={7} />
            </View>
          ) : null}

          <View style={s.pullActions}>
            <PressableScale style={[s.pullBtn, s.pullBtnPrimary]} onPress={() => close(() => onUpdate(current))}>
              <BookOpenText size={17} color={theme.onPrimary} />
              <Text style={[s.pullBtnText, { color: theme.onPrimary }]}>Durumu güncelle</Text>
            </PressableScale>
            <PressableScale style={s.pullBtnIcon} onPress={() => close(() => onQuote(current))} accessibilityLabel="Alıntı paylaş">
              <Quote size={18} color={theme.text} />
            </PressableScale>
          </View>
          <Pressable onPress={() => close(() => onDetails(current))} hitSlop={8}>
            <Text style={s.detailsLink}>Kitap sayfasına git</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    scroll: { paddingBottom: 120 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 },
    title: { fontFamily: fonts.serif, fontSize: 30, fontWeight: '700', color: t.text },
    subtitle: { fontSize: 13, color: t.textSoft, marginTop: 4 },
    chips: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
    hint: { textAlign: 'center', color: t.textSoft, fontSize: 14, lineHeight: 20, paddingHorizontal: 36, marginTop: 18 },
    addSlot: {
      width: 64,
      height: 118,
      borderRadius: 6,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: 'rgba(255,255,255,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    addSlotText: { color: t.onPrimary, fontSize: 11, fontWeight: '700', textAlign: 'center' },
    pullWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    pullCard: {
      marginTop: -30,
      paddingTop: 44,
      width: '100%',
      maxWidth: 380,
      backgroundColor: t.card,
      borderRadius: radius.xl,
      padding: 22,
      alignItems: 'center',
      position: 'relative',
      zIndex: 1,
    },
    pullClose: { position: 'absolute', top: 14, right: 14 },
    pullTitle: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '700', color: t.text, textAlign: 'center' },
    pullAuthor: { fontSize: 14, color: t.textSoft, marginTop: 4 },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.pill,
    },
    statusPillText: { fontSize: 13, fontWeight: '700' },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressText: { fontSize: 12, color: t.textSoft },
    pullActions: { flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' },
    pullBtn: {
      flex: 1,
      height: 50,
      borderRadius: radius.pill,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    pullBtnPrimary: { backgroundColor: t.primary },
    pullBtnText: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
    pullBtnIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: t.cardAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    detailsLink: { marginTop: 14, color: t.primary, fontWeight: '700', fontSize: 14 },
  });
