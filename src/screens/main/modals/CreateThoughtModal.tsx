import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Feather, BookOpen, Trash2 } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { Book } from '../../../lib/types';
import { BookCover } from '../../../components/BookCover';
import { BookPickerModal } from '../../../components/BookPickerModal';
import { postsService } from '../../../services/postsService';
import { booksService, isUuid } from '../../../services/booksService';
import { useAuth } from '../../../context/AuthContext';

interface CreateThoughtModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const MAX_CHAR_COUNT = 800;

export const CreateThoughtModal: React.FC<CreateThoughtModalProps> = ({
  visible,
  onClose,
  onPostCreated,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [attachedBook, setAttachedBook] = useState<Book | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setContent('');
      setAttachedBook(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Hata', 'Paylaşım yapmak için giriş yapmalısınız.');
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      Alert.alert('İçerik Boş', 'Lütfen paylaşmak istediğiniz düşüncelerinizi yazın.');
      return;
    }

    if (trimmed.length > MAX_CHAR_COUNT) {
      Alert.alert('Çok Uzun', `İletiniz en fazla ${MAX_CHAR_COUNT} karakter olabilir.`);
      return;
    }

    setSubmitting(true);
    try {
      let bookId: string | null = null;
      if (attachedBook) {
        if (!isUuid(attachedBook.id)) {
          const { book: persisted } = await booksService.findOrCreateBook(attachedBook);
          bookId = persisted?.id || null;
        } else {
          bookId = attachedBook.id;
        }
      }

      const { post, error } = await postsService.createPost({
        userId: user.id,
        postType: 'thought',
        content: trimmed,
        bookId,
      });

      if (error) {
        Alert.alert('Hata', error);
      } else {
        onPostCreated?.();
        onClose();
      }
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'İleti paylaşılamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  const charsRemaining = MAX_CHAR_COUNT - content.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Serbest İleti</Text>
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

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* Metin Giriş Alanı */}
            <View style={styles.inputCard}>
              <View style={styles.cardHeaderRow}>
                <Feather size={18} color={colors.primary} />
                <Text style={styles.cardLabel}>Düşünceleriniz</Text>
              </View>
              <TextInput
                placeholder="Edebiyat, kitaplar, yazarlar veya aklınızdan geçen serbest fikirleri paylaşın..."
                placeholderTextColor={colors.textTertiary}
                value={content}
                onChangeText={setContent}
                multiline
                maxLength={MAX_CHAR_COUNT}
                style={styles.textInput}
                textAlignVertical="top"
                autoFocus
              />
              <View style={styles.charCounterRow}>
                <Text
                  style={[
                    styles.charCounter,
                    charsRemaining < 50 && { color: colors.warning },
                    charsRemaining < 0 && { color: colors.error },
                  ]}
                >
                  {content.length} / {MAX_CHAR_COUNT}
                </Text>
              </View>
            </View>

            {/* İsteğe Bağlı Kitap Ekleme */}
            <View style={{ marginTop: 16 }}>
              {attachedBook ? (
                <View style={styles.attachedBookCard}>
                  <BookCover
                    url={attachedBook.thumbnail_url}
                    title={attachedBook.title}
                    author={attachedBook.authors?.[0] || ''}
                    width={48}
                    height={72}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.attachedBookTitle} numberOfLines={1}>
                      {attachedBook.title}
                    </Text>
                    <Text style={styles.attachedBookAuthor} numberOfLines={1}>
                      {attachedBook.authors?.join(', ') || 'Bilinmeyen Yazar'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setAttachedBook(null)}
                    style={styles.removeBookBtn}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.attachBookBtn}
                  onPress={() => setShowPicker(true)}
                  activeOpacity={0.7}
                >
                  <BookOpen size={16} color={colors.primary} />
                  <Text style={styles.attachBookText}>
                    İlgili bir kitap bağla (İsteğe bağlı)
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Canlı Önizleme */}
            {content.trim().length > 0 && (
              <View style={styles.previewBox}>
                <Text style={styles.previewHeading}>Önizleme</Text>
                <Text style={styles.previewText}>{content.trim()}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <BookPickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectBook={(book) => setAttachedBook(book)}
        title="İletiyle İlişkilendirilecek Kitap (İsteğe Bağlı)"
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
  inputCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
  },
  textInput: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 23,
    minHeight: 140,
  },
  charCounterRow: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  charCounter: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  attachBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachBookText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  attachedBookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachedBookTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
  },
  attachedBookAuthor: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
  },
  removeBookBtn: {
    padding: 8,
  },
  previewBox: {
    marginTop: 18,
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
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
});
