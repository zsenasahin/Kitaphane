import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  X,
  BookOpen,
  Calendar,
  Layers,
  Star,
  Check,
  BookmarkCheck,
  Trash2,
  Quote,
  PenTool,
  Bookmark,
  Share2,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Book, UserBook, UserBookStatus, USER_BOOK_STATUS_LABELS } from '../../lib/types';
import { BookCover } from '../../components/BookCover';
import { libraryService } from '../../services/libraryService';
import { booksService, isUuid } from '../../services/booksService';
import { fetchOpenLibraryDescription } from '../../services/googleBooks';
import { useAuth } from '../../context/AuthContext';

interface BookDetailModalProps {
  visible: boolean;
  book: Book | null;
  onClose: () => void;
  onBookUpdated?: () => void;
  onShareQuote?: (book: Book) => void;
  onShareReview?: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  visible,
  book: initialBook,
  onClose,
  onBookUpdated,
  onShareQuote,
  onShareReview,
}) => {
  const { user } = useAuth();
  const [activeBook, setActiveBook] = useState<Book | null>(initialBook);
  const [userBook, setUserBook] = useState<UserBook | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    setActiveBook(initialBook);
    setDescriptionExpanded(false);
    setShowStatusPicker(false);

    if (visible && initialBook) {
      if (user?.id) {
        loadUserBookStatus(initialBook);
      }
      // Open Library eserinin detaylı özetini arka planda çek
      if (initialBook.google_book_id?.startsWith('ol_')) {
        fetchOpenLibraryDescription(initialBook.google_book_id).then((desc) => {
          if (desc && desc.trim()) {
            setActiveBook((prev) => (prev ? { ...prev, description: desc } : prev));
          }
        });
      }
    } else {
      setUserBook(null);
    }
  }, [visible, initialBook, user?.id]);

  const loadUserBookStatus = async (currentBook: Book) => {
    if (!user?.id) return;
    setLoading(true);

    try {
      let realBook = currentBook;
      if (!isUuid(currentBook.id)) {
        const { book: existing } = await booksService.findOrCreateBook(currentBook);
        if (existing) {
          realBook = existing;
          setActiveBook(existing);
        }
      }

      if (isUuid(realBook.id)) {
        const { userBook: ub } = await libraryService.getUserBookByBookId(user.id, realBook.id);
        setUserBook(ub);
      }
    } catch (e) {
      console.warn('Error loading user book status:', e);
    } finally {
      setLoading(false);
    }
  };

  const ensureBookPersisted = async (): Promise<Book | null> => {
    if (!activeBook) return null;
    if (isUuid(activeBook.id)) return activeBook;

    // Supabase DB'ye kaydet
    const { book: saved, error } = await booksService.findOrCreateBook(activeBook);
    if (error || !saved) {
      Alert.alert('Hata', 'Kitap kaydedilirken bir sorun oluştu: ' + (error || 'Bilinmeyen hata'));
      return null;
    }
    setActiveBook(saved);
    return saved;
  };

  const handleSetStatus = async (status: UserBookStatus) => {
    if (!user?.id || !activeBook) {
      Alert.alert('Bilgi', 'Kitaplığı kullanmak için giriş yapmalısınız.');
      return;
    }

    setActionLoading(true);
    try {
      const persistedBook = await ensureBookPersisted();
      if (!persistedBook) return;

      const { userBook: updated, error } = await libraryService.addOrUpdateUserBook(
        user.id,
        persistedBook.id,
        status
      );

      if (error) {
        Alert.alert('Hata', error);
      } else {
        setUserBook(updated);
        setShowStatusPicker(false);
        onBookUpdated?.();
      }
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'İşlem gerçekleştirilemedi.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!userBook) return;

    Alert.alert(
      'Kitaplıktan Kaldır',
      `"${activeBook?.title}" kitabını kitaplığınızdan kaldırmak istediğinize emin misiniz? Paylaştığınız alıntılar veya incelemeler etkilenmez.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const { success, error } = await libraryService.removeUserBook(userBook.id);
              if (error) {
                Alert.alert('Hata', error);
              } else {
                setUserBook(null);
                setShowStatusPicker(false);
                onBookUpdated?.();
              }
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!activeBook) return null;

  const authorsText = activeBook.authors?.length
    ? activeBook.authors.join(', ')
    : 'Bilinmeyen Yazar';

  const cleanDescription = activeBook.description
    ? activeBook.description.replace(/<[^>]*>?/gm, '').trim()
    : 'Bu kitap için henüz bir açıklama veya tanıtım yazısı eklenmemiş.';

  const isLongDescription = cleanDescription.length > 260;
  const displayDescription =
    descriptionExpanded || !isLongDescription
      ? cleanDescription
      : cleanDescription.slice(0, 260) + '...';

  const isInLibrary = !!userBook;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Üst Başlık Çubuğu */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Kitap Detayı
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Kitap Görseli ve Temel Başlık */}
          <View style={styles.heroSection}>
            <View style={styles.coverWrapper}>
              <BookCover
                url={activeBook.thumbnail_url}
                title={activeBook.title}
                author={authorsText}
                width={140}
                height={210}
                standingShadow
              />
            </View>

            <Text style={styles.title}>{activeBook.title}</Text>
            {activeBook.subtitle ? (
              <Text style={styles.subtitle}>{activeBook.subtitle}</Text>
            ) : null}
            <Text style={styles.author}>{authorsText}</Text>

            {/* Hızlı Bilgi Rozetleri */}
            <View style={styles.badgesRow}>
              {activeBook.published_date ? (
                <View style={styles.badge}>
                  <Calendar size={13} color={colors.primary} />
                  <Text style={styles.badgeText}>
                    {activeBook.published_date.slice(0, 4)}
                  </Text>
                </View>
              ) : null}

              {activeBook.page_count ? (
                <View style={styles.badge}>
                  <Layers size={13} color={colors.primary} />
                  <Text style={styles.badgeText}>{activeBook.page_count} sayfa</Text>
                </View>
              ) : null}

              {activeBook.categories?.length ? (
                <View style={styles.badge}>
                  <BookOpen size={13} color={colors.primary} />
                  <Text style={styles.badgeText} numberOfLines={1}>
                    {activeBook.categories[0]}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Ana Eylem: Kitaplığa Ekleme & Durum Yönetimi */}
          <View style={styles.actionSection}>
            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
            ) : isInLibrary ? (
              <View style={styles.libraryStatusBox}>
                <View style={styles.statusInfoRow}>
                  <View style={styles.statusIconWrap}>
                    <BookmarkCheck size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.statusLabel}>Kitaplığındaki Durum</Text>
                    <Text style={styles.statusValue}>
                      {USER_BOOK_STATUS_LABELS[userBook.status]}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.changeStatusBtn}
                    onPress={() => setShowStatusPicker(!showStatusPicker)}
                  >
                    <Text style={styles.changeStatusBtnText}>Değiştir</Text>
                  </TouchableOpacity>
                </View>

                {/* Durum Değiştirme Seçenekleri Paneli */}
                {showStatusPicker && (
                  <View style={styles.statusPickerPanel}>
                    {(['want_to_read', 'reading', 'completed', 'dropped'] as UserBookStatus[]).map(
                      (st) => {
                        const isSelected = userBook.status === st;
                        return (
                          <TouchableOpacity
                            key={st}
                            style={[
                              styles.pickerOption,
                              isSelected && styles.pickerOptionSelected,
                            ]}
                            onPress={() => handleSetStatus(st)}
                            disabled={actionLoading}
                          >
                            <Text
                              style={[
                                styles.pickerOptionText,
                                isSelected && styles.pickerOptionTextSelected,
                              ]}
                            >
                              {USER_BOOK_STATUS_LABELS[st]}
                            </Text>
                            {isSelected && <Check size={16} color={colors.primary} />}
                          </TouchableOpacity>
                        );
                      }
                    )}

                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={handleRemoveFromLibrary}
                      disabled={actionLoading}
                    >
                      <Trash2 size={15} color={colors.error} />
                      <Text style={styles.removeBtnText}>Kitaplığımdan Kaldır</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.addToLibraryBtn}
                  onPress={() => handleSetStatus('want_to_read')}
                  disabled={actionLoading}
                  activeOpacity={0.85}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <>
                      <Bookmark size={18} color={colors.textInverse} />
                      <Text style={styles.addToLibraryBtnText}>Kitaplığıma Ekle</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.customStatusToggle}
                  onPress={() => setShowStatusPicker(!showStatusPicker)}
                >
                  <Text style={styles.customStatusToggleText}>
                    Farklı bir durumla ekle (Okuyorum, Okudum vb.)
                  </Text>
                </TouchableOpacity>

                {showStatusPicker && (
                  <View style={styles.statusPickerPanel}>
                    {(['want_to_read', 'reading', 'completed', 'dropped'] as UserBookStatus[]).map(
                      (st) => (
                        <TouchableOpacity
                          key={st}
                          style={styles.pickerOption}
                          onPress={() => handleSetStatus(st)}
                          disabled={actionLoading}
                        >
                          <Text style={styles.pickerOptionText}>
                            {USER_BOOK_STATUS_LABELS[st]}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Hızlı Paylaşım Butonları */}
            <View style={styles.shareRow}>
              <TouchableOpacity
                style={styles.quickShareBtn}
                onPress={async () => {
                  const b = await ensureBookPersisted();
                  if (b) {
                    onClose();
                    onShareQuote?.(b);
                  }
                }}
              >
                <Quote size={16} color={colors.primary} />
                <Text style={styles.quickShareText}>Alıntı Paylaş</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickShareBtn}
                onPress={async () => {
                  const b = await ensureBookPersisted();
                  if (b) {
                    onClose();
                    onShareReview?.(b);
                  }
                }}
              >
                <PenTool size={16} color={colors.primary} />
                <Text style={styles.quickShareText}>İnceleme Yaz</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Açıklama ve Tanıtım */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Kitap Hakkında</Text>
            <Text style={styles.descriptionText}>{displayDescription}</Text>
            {isLongDescription && (
              <TouchableOpacity
                style={styles.readMoreBtn}
                onPress={() => setDescriptionExpanded(!descriptionExpanded)}
              >
                <Text style={styles.readMoreText}>
                  {descriptionExpanded ? 'Daha Az Göster' : 'Devamını Oku'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bibliyografik Bilgiler Tablosu */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Bibliyografik Detaylar</Text>

            {activeBook.publisher ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Yayınevi</Text>
                <Text style={styles.metaValue}>{activeBook.publisher}</Text>
              </View>
            ) : null}

            {activeBook.isbn ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>ISBN</Text>
                <Text style={styles.metaValue}>{activeBook.isbn}</Text>
              </View>
            ) : null}

            {activeBook.page_count ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Sayfa Sayısı</Text>
                <Text style={styles.metaValue}>{activeBook.page_count}</Text>
              </View>
            ) : null}

            {activeBook.published_date ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Yayın Tarihi</Text>
                <Text style={styles.metaValue}>{activeBook.published_date}</Text>
              </View>
            ) : null}

            {activeBook.categories?.length ? (
              <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.metaLabel}>Kategoriler</Text>
                <Text style={styles.metaValue}>{activeBook.categories.join(', ')}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 14 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceWarm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: colors.surfaceWarm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  coverWrapper: {
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    fontFamily: 'serif',
    lineHeight: 26,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  author: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  addToLibraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  addToLibraryBtnText: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
  customStatusToggle: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 4,
  },
  customStatusToggleText: {
    fontSize: 13,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  libraryStatusBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    shadowColor: colors.borderDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  statusValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  changeStatusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  changeStatusBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  statusPickerPanel: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 6,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceWarm,
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(92, 52, 26, 0.08)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 6,
  },
  removeBtnText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  shareRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  quickShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 8,
  },
  quickShareText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  readMoreBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  metaLabel: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    maxWidth: '65%',
    textAlign: 'right',
  },
});
