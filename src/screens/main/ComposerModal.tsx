import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BookOpen, ChevronRight, Feather, Quote, Search, Star, X } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useStyles, useTheme } from '../../context/ThemeContext';
import { Book, PostType, UserBookStatus } from '../../lib/types';
import { booksService, enrichBook, isUuid } from '../../services/booksService';
import { libraryService } from '../../services/libraryService';
import { postsService } from '../../services/postsService';
import { BookCover } from '../../components/BookCover';
import { BottomSheet, PressableScale, Stars } from '../../components/ui';
import { fonts, radius, Theme } from '../../theme/themes';

export const COMPOSE_TYPES: { id: PostType; label: string; icon: React.FC<{ size?: number; color?: string }> }[] = [
  { id: 'quote', label: 'Alıntı', icon: Quote },
  { id: 'review', label: 'İnceleme', icon: Star },
  { id: 'reading_update', label: 'Kitap kaydı', icon: BookOpen },
  { id: 'thought', label: 'İleti', icon: Feather },
];

const UPDATE_STATUSES: { id: UserBookStatus; label: string }[] = [
  { id: 'reading', label: 'Okuyorum' },
  { id: 'read', label: 'Bitirdim' },
  { id: 'want_to_read', label: 'Okuyacağım' },
  { id: 'dropped', label: 'Yarım bıraktım' },
];

interface Props {
  visible: boolean;
  initialType: PostType;
  initialBook: Book | null;
  onClose: () => void;
  onPosted: () => void;
}

export const ComposerModal: React.FC<Props> = ({ visible, initialType, initialBook, onClose, onPosted }) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const { user } = useAuth();
  const { showToast } = useToast();

  const [type, setType] = useState<PostType>(initialType);
  const [book, setBook] = useState<Book | null>(initialBook);
  const [text, setText] = useState('');
  const [page, setPage] = useState('');
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<UserBookStatus>('reading');
  const [picking, setPicking] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (visible) {
      setType(initialType);
      setBook(initialBook);
      setText('');
      setPage('');
      setRating(0);
      setStatus('reading');
      setPicking(false);
    }
  }, [visible]);

  const needsBook = type !== 'thought';
  const valid =
    (!needsBook || !!book) &&
    (type === 'reading_update' || text.trim().length > 0) &&
    (type !== 'review' || rating > 0);

  const submit = async () => {
    if (!user || !valid) return;
    setPosting(true);
    let real: Book | null = book;
    if (book && !isUuid(book.id)) real = (await booksService.findOrCreateBook(book)).book;
    if (needsBook && !real) {
      setPosting(false);
      return showToast('Kitap kaydedilemedi, tekrar dene.', 'error');
    }

    const pageNum = parseInt(page, 10) || null;
    let content = text.trim();
    if (type === 'reading_update') {
      if (real) {
        await libraryService.addOrUpdateUserBook(user.id, real.id, status, {
          currentPage: status === 'read' && real.page_count ? real.page_count : pageNum ?? undefined,
          rating: status === 'read' && rating ? rating : undefined,
        });
      }
      if (!content) {
        content =
          status === 'read'
            ? 'Bu kitabı bitirdim.'
            : status === 'reading'
            ? pageNum
              ? `${pageNum}. sayfaya geldim.`
              : 'Okumaya başladım.'
            : status === 'dropped'
            ? 'Bu kitaba şimdilik ara verdim.'
            : 'Okuma listeme ekledim.';
      }
    }
    // İncelemesi yazılan kitap kitaplığa "okudum" olarak işlenir
    if (type === 'review' && real) {
      const { userBook } = await libraryService.getUserBookByBookId(user.id, real.id);
      if (!userBook) await libraryService.addOrUpdateUserBook(user.id, real.id, 'read', { rating });
    }

    const { error } = await postsService.createPost({
      userId: user.id,
      postType: type,
      content,
      bookId: real?.id || null,
      quotePage: type === 'quote' || (type === 'reading_update' && status === 'reading') ? pageNum : null,
      reviewRating: type === 'review' || (type === 'reading_update' && status === 'read') ? rating || null : null,
    });
    setPosting(false);
    if (error) return showToast(error, 'error');
    showToast('Paylaşımın yayında ✨');
    onPosted();
    onClose();
  };

  const placeholder =
    type === 'quote'
      ? 'Altını çizdiğin cümleyi buraya yaz…'
      : type === 'review'
      ? 'Bu kitap sende ne bıraktı?'
      : type === 'reading_update'
      ? 'Bir not eklemek ister misin? (isteğe bağlı)'
      : 'Aklından ne geçiyor?';

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="94%" fullHeight>
      <View style={{ flex: 1 }}>
        <View style={s.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color={theme.textSoft} />
          </Pressable>
          <Text style={s.headerTitle}>Yeni paylaşım</Text>
          <PressableScale onPress={submit} disabled={!valid || posting} style={s.postBtn}>
            {posting ? <ActivityIndicator size="small" color={theme.onPrimary} /> : <Text style={s.postText}>Paylaş</Text>}
          </PressableScale>
        </View>

        {picking ? (
          <BookPicker
            onPick={(b) => {
              setBook(b);
              setPicking(false);
            }}
            onCancel={() => setPicking(false)}
          />
        ) : (
          <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <View style={s.types}>
              {COMPOSE_TYPES.map((ct) => {
                const active = ct.id === type;
                return (
                  <PressableScale key={ct.id} onPress={() => setType(ct.id)} style={[s.typeBtn, active && s.typeBtnActive]}>
                    <ct.icon size={15} color={active ? theme.onPrimary : theme.textSoft} />
                    <Text style={[s.typeText, active && { color: theme.onPrimary }]}>{ct.label}</Text>
                  </PressableScale>
                );
              })}
            </View>

            {/* Kitap */}
            <PressableScale onPress={() => setPicking(true)} scaleTo={0.98} style={s.bookSelect}>
              {book ? (
                <>
                  <BookCover url={book.thumbnail_url} title={book.title} author={book.authors?.[0]} width={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.bookTitle} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={s.bookAuthor} numberOfLines={1}>
                      {book.authors?.join(', ')}
                    </Text>
                  </View>
                  <Text style={s.change}>Değiştir</Text>
                </>
              ) : (
                <>
                  <View style={s.bookPlaceholder}>
                    <BookOpen size={20} color={theme.primary} />
                  </View>
                  <Text style={[s.bookTitle, { flex: 1, color: theme.textSoft }]}>
                    {needsBook ? 'Bir kitap seç' : 'Kitap etiketle (isteğe bağlı)'}
                  </Text>
                  <ChevronRight size={18} color={theme.textMuted} />
                </>
              )}
            </PressableScale>

            {type === 'review' && (
              <View style={s.ratingRow}>
                <Text style={s.fieldLabel}>Puanın</Text>
                <Stars value={rating} onChange={setRating} size={30} gap={8} />
              </View>
            )}

            {type === 'reading_update' && (
              <View style={{ marginTop: 18 }}>
                <Text style={s.fieldLabel}>Durum</Text>
                <View style={s.statusRow}>
                  {UPDATE_STATUSES.map((st) => (
                    <PressableScale
                      key={st.id}
                      onPress={() => setStatus(st.id)}
                      style={[s.statusChip, status === st.id && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    >
                      <Text style={[s.statusText, status === st.id && { color: theme.onPrimary }]}>{st.label}</Text>
                    </PressableScale>
                  ))}
                </View>
                {status === 'read' && (
                  <View style={[s.ratingRow, { marginTop: 14 }]}>
                    <Text style={s.fieldLabel}>Puanın</Text>
                    <Stars value={rating} onChange={setRating} size={26} gap={8} />
                  </View>
                )}
              </View>
            )}

            <View style={[s.editor, type === 'quote' && { backgroundColor: theme.quoteBg, borderColor: 'transparent' }]}>
              {type === 'quote' && <Text style={s.quoteMark}>“</Text>}
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={placeholder}
                placeholderTextColor={theme.textMuted}
                multiline
                maxLength={2000}
                style={[s.textInput, type === 'quote' && s.quoteInput]}
              />
            </View>
            <View style={s.editorFooter}>
              {(type === 'quote' || (type === 'reading_update' && status === 'reading')) && (
                <View style={s.pageField}>
                  <Text style={s.pageLabel}>Sayfa</Text>
                  <TextInput
                    value={page}
                    onChangeText={(v) => setPage(v.replace(/\D/g, ''))}
                    keyboardType="number-pad"
                    placeholder="—"
                    placeholderTextColor={theme.textMuted}
                    style={s.pageInput}
                    maxLength={5}
                  />
                </View>
              )}
              <View style={{ flex: 1 }} />
              <Text style={s.count}>{text.length}/2000</Text>
            </View>
          </ScrollView>
        )}
      </View>
    </BottomSheet>
  );
};

/* ------------------------------------------------------------------ */
/* Kitap seçici: önce kitaplık, aramayla tüm katalog                   */
/* ------------------------------------------------------------------ */
const BookPicker: React.FC<{ onPick: (b: Book) => void; onCancel: () => void }> = ({ onPick, onCancel }) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [mine, setMine] = useState<Book[]>([]);
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const req = useRef(0);

  useEffect(() => {
    if (!user) return;
    libraryService.getUserBooks(user.id).then(({ userBooks }) =>
      setMine(userBooks.filter((u) => u.book).map((u) => enrichBook(u.book!)))
    );
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = ++req.current;
    const timer = setTimeout(async () => {
      const { books } = await booksService.searchBooks(q, 25);
      if (id === req.current) {
        setResults(books);
        setLoading(false);
      }
    }, 380);
    return () => clearTimeout(timer);
  }, [query]);

  const list = query.trim().length >= 2 ? results : mine;

  return (
    <View style={{ flex: 1, paddingHorizontal: 18 }}>
      <View style={s.pickerBar}>
        <Search size={18} color={theme.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Kitap ya da yazar ara"
          placeholderTextColor={theme.textMuted}
          style={s.pickerInput}
          autoFocus
        />
        <Pressable onPress={onCancel} hitSlop={8}>
          <Text style={s.change}>Vazgeç</Text>
        </Pressable>
      </View>
      {query.trim().length < 2 && mine.length > 0 && <Text style={s.fieldLabel}>Kitaplığından</Text>}
      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(b, i) => b.id || String(i)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={s.pickerEmpty}>
              {query.trim().length >= 2 ? 'Sonuç bulunamadı.' : 'Paylaşım yapmak istediğin kitabı ara.'}
            </Text>
          }
          renderItem={({ item }) => (
            <PressableScale onPress={() => onPick(item)} scaleTo={0.98} style={s.pickRow}>
              <BookCover url={item.thumbnail_url} title={item.title} author={item.authors?.[0]} width={40} />
              <View style={{ flex: 1 }}>
                <Text style={s.bookTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={s.bookAuthor} numberOfLines={1}>
                  {item.authors?.join(', ')}
                </Text>
              </View>
            </PressableScale>
          )}
        />
      )}
    </View>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 8,
    },
    headerTitle: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '700', color: t.text },
    postBtn: { backgroundColor: t.primary, paddingHorizontal: 20, height: 38, minWidth: 84, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
    postText: { color: t.onPrimary, fontWeight: '800', fontSize: 14.5 },
    types: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    typeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: radius.pill,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    typeBtnActive: { backgroundColor: t.primary, borderColor: t.primary },
    typeText: { fontSize: 13.5, fontWeight: '700', color: t.textSoft },
    bookSelect: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 18,
      padding: 12,
      borderRadius: radius.lg,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    bookPlaceholder: { width: 44, height: 44, borderRadius: 12, backgroundColor: t.primarySoft, alignItems: 'center', justifyContent: 'center' },
    bookTitle: { fontFamily: fonts.serif, fontSize: 15.5, fontWeight: '700', color: t.text },
    bookAuthor: { fontSize: 12.5, color: t.textSoft, marginTop: 2 },
    change: { fontSize: 13.5, fontWeight: '700', color: t.primary },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: t.textSoft, marginBottom: 10 },
    ratingRow: { marginTop: 18, alignItems: 'flex-start' },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statusChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: t.border, backgroundColor: t.card },
    statusText: { fontSize: 13.5, fontWeight: '700', color: t.textSoft },
    editor: { marginTop: 18, borderRadius: radius.lg, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, padding: 16, minHeight: 180 },
    quoteMark: { fontFamily: fonts.serif, fontSize: 60, lineHeight: 60, color: t.primary, opacity: 0.45, marginBottom: -24 },
    textInput: { fontSize: 16, lineHeight: 24, color: t.text, minHeight: 140, textAlignVertical: 'top', outlineStyle: 'none' } as any,
    quoteInput: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 28, fontStyle: 'italic' },
    editorFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    pageField: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.card, borderRadius: radius.pill, paddingLeft: 14, paddingRight: 6, borderWidth: 1, borderColor: t.border },
    pageLabel: { fontSize: 13, fontWeight: '700', color: t.textSoft },
    pageInput: { width: 64, height: 38, fontSize: 15, fontWeight: '700', color: t.text, textAlign: 'center' },
    count: { fontSize: 12, color: t.textMuted },
    pickerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      height: 50,
      paddingHorizontal: 14,
      borderRadius: radius.pill,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      marginBottom: 14,
      marginTop: 4,
    },
    pickerInput: { flex: 1, fontSize: 15.5, color: t.text, height: '100%', outlineStyle: 'none' } as any,
    pickRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
    pickerEmpty: { textAlign: 'center', color: t.textMuted, marginTop: 30 },
  });
