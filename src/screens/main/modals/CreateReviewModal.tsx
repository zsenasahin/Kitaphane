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
import { X, Star, BookOpen, PenTool } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { Book } from '../../../lib/types';
import { BookCover } from '../../../components/BookCover';
import { BookPickerModal } from '../../../components/BookPickerModal';
import { postsService } from '../../../services/postsService';
import { useAuth } from '../../../context/AuthContext';

interface CreateReviewModalProps {
  visible: boolean;
  initialBook?: Book | null;
  onClose: () => void;
  onPostCreated?: () => void;
}

export const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  visible,
  initialBook = null,
  onClose,
  onPostCreated,
}) => {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState<Book | null>(initialBook);
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (visible) {
      if (initialBook) setSelectedBook(initialBook);
      setReviewContent('');
      setRating(5);
    }
  }, [visible, initialBook]);

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Hata', 'İnceleme paylaşmak için giriş yapmalısınız.');
      return;
    }

    if (!selectedBook) {
      Alert.alert('Kitap Seçimi Zorunlu', 'Lütfen incelediğiniz kitabı seçin.');
      return;
    }

    const trimmed = reviewContent.trim();
    if (!trimmed) {
      Alert.alert('İnceleme Metni Eksik', 'Lütfen kitap hakkındaki değerlendirmenizi yazın.');
      return;
    }

    setSubmitting(true);
    try {
      const { post, error } = await postsService.createPost({
        userId: user.id,
        postType: 'review',
        content: trimmed,
        bookId: selectedBook.id,
        reviewRating: rating,
      });

      if (error) {
        Alert.alert('Hata', error);
      } else {
        onPostCreated?.();
        onClose();
      }
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'İnceleme paylaşılamadı.');
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>İnceleme Yaz</Text>
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
            {/* Kitap Seçim Alanı */}
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
                <Text style={styles.selectBookTitle}>İncelenecek Kitabı Seçin</Text>
                <Text style={styles.selectBookDesc}>
                  Değerlendirmek istediğiniz eseri katalogdan arayın *
                </Text>
              </TouchableOpacity>
            )}

            {/* Puanlama Seçici (1-5 Yıldız) */}
            <View style={styles.ratingCard}>
              <Text style={styles.ratingLabel}>Puanınız</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starTouch}
                    activeOpacity={0.7}
                  >
                    <Star
                      size={28}
                      color={star <= rating ? colors.gold : colors.borderDark}
                      fill={star <= rating ? colors.gold : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingFeedback}>
                {rating === 5
                  ? 'Şaheser (5 / 5)'
                  : rating === 4
                  ? 'Çok İyi (4 / 5)'
                  : rating === 3
                  ? 'Ortalama (3 / 5)'
                  : rating === 2
                  ? 'Zayıf (2 / 5)'
                  : 'Beğenmedim (1 / 5)'}
              </Text>
            </View>

            {/* İnceleme Metni */}
            <View style={styles.inputCard}>
              <View style={styles.cardHeaderRow}>
                <PenTool size={18} color={colors.primary} />
                <Text style={styles.inputCardLabel}>İnceleme ve Düşünceleriniz</Text>
              </View>
              <TextInput
                placeholder="Kitabın kurgusu, karakterleri, dili ve sizde bıraktığı etki hakkında ne düşünüyorsunuz? Detaylıca anlatın..."
                placeholderTextColor={colors.textTertiary}
                value={reviewContent}
                onChangeText={setReviewContent}
                multiline
                style={styles.reviewTextInput}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <BookPickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectBook={(book) => setSelectedBook(book)}
        title="İncelenecek Kitabı Seçin"
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
    marginBottom: 16,
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
    marginBottom: 16,
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
  ratingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  starTouch: {
    padding: 4,
  },
  ratingFeedback: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
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
  inputCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
  },
  reviewTextInput: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    minHeight: 140,
  },
});
