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
import { X, Quote, BookOpen, Hash, Edit3 } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { Book } from '../../../lib/types';
import { BookCover } from '../../../components/BookCover';
import { BookPickerModal } from '../../../components/BookPickerModal';
import { postsService } from '../../../services/postsService';
import { useAuth } from '../../../context/AuthContext';

interface CreateQuoteModalProps {
  visible: boolean;
  initialBook?: Book | null;
  onClose: () => void;
  onPostCreated?: () => void;
}

export const CreateQuoteModal: React.FC<CreateQuoteModalProps> = ({
  visible,
  initialBook = null,
  onClose,
  onPostCreated,
}) => {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState<Book | null>(initialBook);
  const [quoteContent, setQuoteContent] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (visible) {
      if (initialBook) setSelectedBook(initialBook);
      setQuoteContent('');
      setPageNumber('');
      setPersonalNote('');
    }
  }, [visible, initialBook]);

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Hata', 'Paylaşım yapmak için giriş yapmalısınız.');
      return;
    }

    if (!selectedBook) {
      Alert.alert('Kitap Seçimi Zorunlu', 'Lütfen alıntının ait olduğu kitabı seçin.');
      return;
    }

    const trimmed = quoteContent.trim();
    if (!trimmed) {
      Alert.alert('Alıntı Metni Eksik', 'Lütfen paylaşmak istediğiniz alıntı cümlesini girin.');
      return;
    }

    setSubmitting(true);
    try {
      const page = pageNumber.trim() ? parseInt(pageNumber.trim(), 10) : null;
      // Kişisel not varsa içeriğe edebî bir dipnot gibi ekleyebilir veya alıntının parçası yapabiliriz
      let finalContent = trimmed;
      if (personalNote.trim()) {
        finalContent += `\n\n[Not: ${personalNote.trim()}]`;
      }

      const { post, error } = await postsService.createPost({
        userId: user.id,
        postType: 'quote',
        content: finalContent,
        bookId: selectedBook.id,
        quotePage: isNaN(Number(page)) ? null : page,
      });

      if (error) {
        Alert.alert('Hata', error);
      } else {
        onPostCreated?.();
        onClose();
      }
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Alıntı paylaşılamadı.');
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
            <Text style={styles.headerTitle}>Alıntı Paylaş</Text>
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
                <Text style={styles.selectBookTitle}>Kitap Seçin</Text>
                <Text style={styles.selectBookDesc}>
                  Alıntının ait olduğu eseri arayıp belirleyin *
                </Text>
              </TouchableOpacity>
            )}

            {/* Alıntı Metni Girişi */}
            <View style={styles.inputCard}>
              <View style={styles.quoteHeaderRow}>
                <Quote size={20} color={colors.goldDark} />
                <Text style={styles.inputCardLabel}>Alıntı Cümlesi</Text>
              </View>
              <TextInput
                placeholder="“Kitaptan altını çizdiğiniz unutulmaz satırları buraya yazın...”"
                placeholderTextColor={colors.textTertiary}
                value={quoteContent}
                onChangeText={setQuoteContent}
                multiline
                style={styles.quoteTextInput}
                textAlignVertical="top"
              />
            </View>

            {/* İsteğe Bağlı Sayfa Numarası */}
            <View style={styles.rowField}>
              <View style={styles.rowFieldIcon}>
                <Hash size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Sayfa Numarası (İsteğe Bağlı)</Text>
                <TextInput
                  placeholder="Örn: 42"
                  placeholderTextColor={colors.textTertiary}
                  value={pageNumber}
                  onChangeText={setPageNumber}
                  keyboardType="numeric"
                  style={styles.singleLineInput}
                />
              </View>
            </View>

            {/* İsteğe Bağlı Kişisel Not */}
            <View style={[styles.inputCard, { marginTop: 14 }]}>
              <View style={styles.quoteHeaderRow}>
                <Edit3 size={18} color={colors.primary} />
                <Text style={styles.inputCardLabel}>Kişisel Notunuz (İsteğe Bağlı)</Text>
              </View>
              <TextInput
                placeholder="Bu alıntı size ne hissettirdi? Kısa bir düşünce ekleyin..."
                placeholderTextColor={colors.textTertiary}
                value={personalNote}
                onChangeText={setPersonalNote}
                multiline
                style={styles.noteTextInput}
                textAlignVertical="top"
              />
            </View>

            {/* Canlı Edebî Önizleme */}
            {quoteContent.trim().length > 0 && (
              <View style={styles.previewBox}>
                <Text style={styles.previewHeading}>Önizleme</Text>
                <Text style={styles.previewText}>“{quoteContent.trim()}”</Text>
                {pageNumber.trim() ? (
                  <Text style={styles.previewPage}>s. {pageNumber.trim()}</Text>
                ) : null}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <BookPickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectBook={(book) => setSelectedBook(book)}
        title="Alıntı Yapılacak Kitabı Seçin"
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
  inputCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  quoteHeaderRow: {
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
  quoteTextInput: {
    fontSize: 15,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 24,
    minHeight: 110,
    fontFamily: 'serif',
  },
  rowField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginTop: 14,
  },
  rowFieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  singleLineInput: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    padding: 0,
  },
  noteTextInput: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    minHeight: 60,
  },
  previewBox: {
    marginTop: 18,
    backgroundColor: colors.surfaceWarm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 16,
  },
  previewHeading: {
    fontSize: 11,
    color: colors.goldDark,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  previewText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.text,
    fontFamily: 'serif',
    lineHeight: 22,
  },
  previewPage: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 6,
    fontWeight: '600',
  },
});
