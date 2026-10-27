import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Bookmark, BookOpen, CheckCircle2, Minus, PauseCircle, Plus, Trash2 } from 'lucide-react-native';
import { useTheme, useStyles } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Book, USER_BOOK_STATUS_LABELS, USER_BOOK_STATUS_ORDER, UserBook, UserBookStatus } from '../lib/types';
import { booksService, isUuid } from '../services/booksService';
import { libraryService } from '../services/libraryService';
import { postsService } from '../services/postsService';
import { supabase } from '../lib/supabase';
import { fonts, radius, Theme } from '../theme/themes';
import { BookCover } from './BookCover';
import { BottomSheet, PressableScale, ProgressBar, Stars } from './ui';

export const STATUS_ICONS: Record<UserBookStatus, React.FC<{ size?: number; color?: string }>> = {
  want_to_read: Bookmark,
  reading: BookOpen,
  read: CheckCircle2,
  dropped: PauseCircle,
};

export const statusColor = (t: Theme, s: UserBookStatus) =>
  s === 'reading' ? t.primary : s === 'read' ? t.success : s === 'dropped' ? t.danger : t.accent;

interface Props {
  book: Book | null;
  onClose: () => void;
  onChanged: () => void;
}

export const StatusSheet: React.FC<Props> = ({ book, onClose, onChanged }) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const { user } = useAuth();
  const { showToast } = useToast();

  const [resolved, setResolved] = useState<Book | null>(null);
  const [userBook, setUserBook] = useState<UserBook | null>(null);
  const [status, setStatus] = useState<UserBookStatus>('want_to_read');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState('');
  const [rating, setRating] = useState(0);
  const [share, setShare] = useState(true);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!book || !user) return;
    let alive = true;
    setLoading(true);
    setNote('');
    (async () => {
      const real = isUuid(book.id) ? book : (await booksService.findOrCreateBook(book)).book;
      if (!alive) return;
      if (!real) {
        showToast('Kitap kataloğa eklenemedi, tekrar dene.', 'error');
        onClose();
        return;
      }
      const { userBook: ub } = await libraryService.getUserBookByBookId(user.id, real.id);
      if (!alive) return;
      setResolved(real);
      setUserBook(ub);
      setStatus(ub?.status || 'reading');
      setPage(ub?.current_page || 0);
      setTotal(real.page_count ? String(real.page_count) : '');
      setRating(ub?.rating || 0);
      setShare(!ub);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [book?.id, user?.id]);

  const totalPages = parseInt(total, 10) || 0;
  const clampPage = (p: number) => Math.max(0, totalPages ? Math.min(totalPages, p) : p);

  const save = async () => {
    if (!user || !resolved) return;
    setSaving(true);
    if (totalPages && totalPages !== resolved.page_count) {
      await supabase.from('books').update({ page_count: totalPages }).eq('id', resolved.id);
    }
    const currentPage = status === 'read' && totalPages ? totalPages : page;
    const { error } = await libraryService.addOrUpdateUserBook(user.id, resolved.id, status, {
      currentPage,
      rating: rating || null,
    });
    if (error) {
      setSaving(false);
      showToast(error, 'error');
      return;
    }

    const statusChanged = userBook?.status !== status;
    const progressChanged = status === 'reading' && userBook?.current_page !== page;
    if (share && (statusChanged || progressChanged || note.trim())) {
      const auto =
        status === 'read'
          ? 'Bu kitabı bitirdim.'
          : status === 'reading'
          ? statusChanged
            ? 'Okumaya başladım.'
            : `${page}. sayfaya geldim.`
          : status === 'dropped'
          ? 'Bu kitaba şimdilik ara verdim.'
          : 'Okuma listeme ekledim.';
      await postsService.createPost({
        userId: user.id,
        postType: 'reading_update',
        bookId: resolved.id,
        content: note.trim() || auto,
        quotePage: status === 'reading' ? page : null,
        reviewRating: status === 'read' && rating ? rating : null,
      });
    }

    setSaving(false);
    showToast(
      status === 'read' ? 'Tebrikler, bir kitap daha bitti! 🎉' : 'Okuma durumun güncellendi',
      'success'
    );
    onChanged();
    onClose();
  };

  const remove = async () => {
    if (!userBook) return;
    setSaving(true);
    const { error } = await libraryService.removeUserBook(userBook.id);
    setSaving(false);
    if (error) return showToast(error, 'error');
    showToast('Kitap kitaplığından çıkarıldı', 'info');
    onChanged();
    onClose();
  };

  const display = resolved || book;

  return (
    <BottomSheet visible={!!book} onClose={onClose}>
      {display && (
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <BookCover url={display.thumbnail_url} title={display.title} author={display.authors?.[0]} width={58} />
            <View style={{ flex: 1 }}>
              <Text style={s.title} numberOfLines={2}>
                {display.title}
              </Text>
              <Text style={s.author} numberOfLines={1}>
                {display.authors?.join(', ')}
              </Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginVertical: 40 }} />
          ) : (
            <>
              <Text style={s.label}>Okuma durumu</Text>
              <View style={s.grid}>
                {USER_BOOK_STATUS_ORDER.map((st) => {
                  const Icon = STATUS_ICONS[st];
                  const active = st === status;
                  const c = statusColor(theme, st);
                  return (
                    <PressableScale
                      key={st}
                      onPress={() => setStatus(st)}
                      style={[s.statusCard, active && { backgroundColor: c + '22', borderColor: c }]}
                    >
                      <Icon size={20} color={active ? c : theme.textMuted} />
                      <Text style={[s.statusText, active && { color: theme.text }]}>{USER_BOOK_STATUS_LABELS[st]}</Text>
                    </PressableScale>
                  );
                })}
              </View>

              {status === 'reading' && (
                <View style={s.block}>
                  <View style={s.rowBetween}>
                    <Text style={s.label}>Kaçıncı sayfadasın?</Text>
                    {totalPages > 0 && (
                      <Text style={s.percent}>%{Math.round((page / totalPages) * 100)}</Text>
                    )}
                  </View>
                  <View style={s.stepper}>
                    {[-10, -1].map((d) => (
                      <PressableScale key={d} onPress={() => setPage(clampPage(page + d))} style={s.stepBtn}>
                        {d === -1 ? <Minus size={16} color={theme.text} /> : <Text style={s.stepText}>-10</Text>}
                      </PressableScale>
                    ))}
                    <View style={s.pageBox}>
                      <TextInput
                        value={String(page)}
                        onChangeText={(v) => setPage(clampPage(parseInt(v.replace(/\D/g, ''), 10) || 0))}
                        keyboardType="number-pad"
                        style={s.pageInput}
                      />
                      <Text style={s.pageOf}>/</Text>
                      <TextInput
                        value={total}
                        onChangeText={(v) => setTotal(v.replace(/\D/g, ''))}
                        placeholder="?"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="number-pad"
                        style={[s.pageInput, { color: theme.textSoft }]}
                      />
                    </View>
                    {[1, 10].map((d) => (
                      <PressableScale key={d} onPress={() => setPage(clampPage(page + d))} style={s.stepBtn}>
                        {d === 1 ? <Plus size={16} color={theme.text} /> : <Text style={s.stepText}>+10</Text>}
                      </PressableScale>
                    ))}
                  </View>
                  {totalPages > 0 && <ProgressBar value={page / totalPages} height={8} />}
                </View>
              )}

              {(status === 'read' || status === 'dropped') && (
                <View style={s.block}>
                  <Text style={s.label}>Puanın</Text>
                  <Stars value={rating} onChange={setRating} size={30} gap={8} />
                </View>
              )}

              <View style={[s.block, s.shareRow]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.shareTitle}>Akışta paylaş</Text>
                  <Text style={s.shareHint}>Takipçilerin okuma yolculuğunu görsün</Text>
                </View>
                <Switch
                  value={share}
                  onValueChange={setShare}
                  trackColor={{ true: theme.primary, false: theme.border }}
                  thumbColor="#fff"
                />
              </View>
              {share && (
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Bir not eklemek ister misin? (isteğe bağlı)"
                  placeholderTextColor={theme.textMuted}
                  multiline
                  style={s.note}
                />
              )}

              <PressableScale onPress={save} disabled={saving} style={s.saveBtn}>
                {saving ? (
                  <ActivityIndicator color={theme.onPrimary} />
                ) : (
                  <Text style={s.saveText}>{userBook ? 'Güncelle' : 'Kitaplığıma Ekle'}</Text>
                )}
              </PressableScale>

              {userBook && (
                <Pressable onPress={remove} style={s.removeBtn} hitSlop={8}>
                  <Trash2 size={15} color={theme.danger} />
                  <Text style={[s.removeText, { color: theme.danger }]}>Kitaplığımdan çıkar</Text>
                </Pressable>
              )}
            </>
          )}
        </ScrollView>
      )}
    </BottomSheet>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
    header: { flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 20 },
    title: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', color: t.text },
    author: { fontSize: 14, color: t.textSoft, marginTop: 4 },
    label: { fontSize: 13, fontWeight: '700', color: t.textSoft, marginBottom: 10, letterSpacing: 0.3 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statusCard: {
      width: '48%',
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: radius.md,
      backgroundColor: t.card,
      borderWidth: 1.5,
      borderColor: t.border,
    },
    statusText: { fontSize: 14, fontWeight: '600', color: t.textSoft },
    block: { marginTop: 22 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    percent: { fontSize: 15, fontWeight: '800', color: t.primary },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    stepBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepText: { fontSize: 12, fontWeight: '700', color: t.text },
    pageBox: {
      flex: 1,
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: t.border,
    },
    pageInput: {
      fontFamily: fonts.serif,
      fontSize: 22,
      fontWeight: '700',
      color: t.text,
      minWidth: 44,
      textAlign: 'center',
      padding: 0,
    },
    pageOf: { fontSize: 20, color: t.textMuted, marginHorizontal: 2 },
    shareRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    shareTitle: { fontSize: 15, fontWeight: '700', color: t.text },
    shareHint: { fontSize: 12, color: t.textMuted, marginTop: 2 },
    note: {
      marginTop: 12,
      minHeight: 70,
      borderRadius: radius.md,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      padding: 14,
      fontSize: 15,
      color: t.text,
      textAlignVertical: 'top',
    },
    saveBtn: {
      marginTop: 22,
      height: 54,
      borderRadius: radius.pill,
      backgroundColor: t.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveText: { color: t.onPrimary, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
    removeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
    removeText: { fontSize: 14, fontWeight: '600' },
  });
