import React, { useState } from 'react';
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
import { X, BookOpen, Check, BookmarkCheck } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { Book, UserBookStatus } from '../../../lib/types';
import { BookCover } from '../../../components/BookCover';
import { BookPickerModal } from '../../../components/BookPickerModal';
import { postsService } from '../../../services/postsService';
import { libraryService } from '../../../services/libraryService';
import { booksService, isUuid } from '../../../services/booksService';
import { useAuth } from '../../../context/AuthContext';

interface CreateReadingUpdateModalProps {
  visible: boolean;
  initialBook?: Book | null;
  onClose: () => void;
  onPostCreated?: () => void;
}

const STATUS_OPTIONS: { id: UserBookStatus; label: string; textTemplate: string }[] = [
  {
    id: 'reading',
    label: 'Okumaya Başladım / Okuyorum',
    textTemplate: 'kitabını okumaya başladı.',
  },
  {
    id: 'completed',
    label: 'Bitirdim / Okudum',
    textTemplate: 'kitabını okumayı tamamladı.',
  },
  {
    id: 'dropped',
    label: 'Yarım Bıraktım',
    textTemplate: 'kitabını yarım bıraktı.',
  },
];

export const CreateReadingUpdateModal: React.FC<CreateReadingUpdateModalProps> = ({
  visible,
  initialBook = null,
  onClose,
  onPostCreated,
}) => {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState<Book | null>(initialBook);
  const [selectedStatus, setSelectedStatus] = useState<UserBookStatus>('reading');
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (visible) {
      if (initialBook) setSelectedBook(initialBook);
      setSelectedStatus('reading');
    }
  }, [visible, initialBook]);

  const activeOption = STATUS_OPTIONS.find((s) => s.id === selectedStatus)!;

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Hata', 'Paylaşım yapmak için giriş yapmalısınız.');
      return;
    }

    if (!selectedBook) {
      Alert.alert('Kitap Seçimi Zorunlu', 'Lütfen durumunu paylaşmak istediğiniz kitabı seçin.');
      return;
    }

    setSubmitting(true);
    try {
      let realBook = selectedBook;
      if (!isUuid(selectedBook.id)) {
        const { book: persisted } = await booksService.findOrCreateBook(selectedBook);
        if (persisted) realBook = persisted;
      }

      // 1. Kitaplığı güncelle (Senkronizasyon: kitaplık kaydıyla tutarlı çalışır)
      await libraryService.addOrUpdateUserBook(user.id, realBook.id, selectedStatus);

      // 2. Sosyal akış için post oluştur
      const message = `"${realBook.title}" ${activeOption.textTemplate}`;

      const { post, error } = await postsService.createPost({
        userId: user.id,
        postType: 'reading_update',
        content: message,
        bookId: realBook.id,
      });

      if (error) {
        Alert.alert('Hata', error);
      } else {
        onPostCreated?.();
        onClose();
      }
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Okuma kaydı paylaşılamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kitap Kaydı Paylaş</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.publishBtn, submitting && { opacity: 0.6 }]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Text style={styles.publishBtnText}>Paylaş</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {/* Kitap Seçimi */}
          {selectedBook ? (
            <View style={styles.selectedBookCard}>
              <BookCover
                url={selectedBook.thumbnail_url}
                title={selectedBook.title}
                author={selectedBook.authors?.[0] || ''}
                width={60}
                height={90}
              />
              <View style={styles.selectedBookInfo}>
                <Text style={styles.selectedBookTitle} numberOfLines={2}>
                  {selectedBook.title}
                </Text>
                <Text style={styles.selectedBookAuthor} numberOfLines={1}>
                  {selectedBook.authors?.join(', ') || 'Bilinmeyen Yazar'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPicker(true)}
                  style={styles.changeBookBtn}
                >
                  <Text style={styles.changeBookText}>Farklı Kitap Seç</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectBookPlaceholder}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.8}
            >
              <BookOpen size={24} color={colors.primary} />
              <Text style={styles.selectBookTitle}>Kitap Seçin</Text>
              <Text style={styles.selectBookDesc}>
                Okuma durumunuzu paylaşacağınız kitabı belirleyin *
              </Text>
            </TouchableOpacity>
          )}

          {/* Durum Seçenekleri */}
          <Text style={styles.sectionLabel}>Okuma Durumunu Seçin</Text>
          <View style={styles.optionsList}>
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = selectedStatus === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                  onPress={() => setSelectedStatus(opt.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  {isSelected && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Paylaşım Önizlemesi */}
          {selectedBook && (
            <View style={styles.previewBox}>
              <Text style={styles.previewHeading}>Akışta Görünecek Şekliyle Önizleme</Text>
              <View style={styles.previewCard}>
                <BookCover
                  url={selectedBook.thumbnail_url}
                  title={selectedBook.title}
                  author={selectedBook.authors?.[0] || ''}
                  width={48}
                  height={72}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.previewText}>
                    “{selectedBook.title}” {activeOption.textTemplate}
                  </Text>
                  <Text style={styles.previewAuthor}>
                    {selectedBook.authors?.join(', ') || 'Bilinmeyen Yazar'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <BookPickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectBook={(book) => setSelectedBook(book)}
        title="Okuma Durumu İçin Kitap Seçin"
      />
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
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  publishBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  publishBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 13,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  selectedBookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  selectedBookInfo: {
    flex: 1,
    marginLeft: 14,
  },
  selectedBookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    marginBottom: 2,
  },
  selectedBookAuthor: {
    fontSize: 13,
    color: colors.primary,
    marginBottom: 8,
  },
  changeBookBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.surfaceVariant,
  },
  changeBookText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  selectBookPlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  selectBookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    marginTop: 8,
    marginBottom: 4,
  },
  selectBookDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    marginBottom: 10,
  },
  optionsList: {
    gap: 8,
    marginBottom: 22,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionItemSelected: {
    backgroundColor: 'rgba(92, 52, 26, 0.08)',
    borderColor: colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  previewBox: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  previewHeading: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'serif',
    lineHeight: 20,
  },
  previewAuthor: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
