import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Search as SearchIcon, X, BookOpen } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { Book } from '../lib/types';
import { booksService, isUuid } from '../services/booksService';
import { BookCover } from './BookCover';

interface BookPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBook: (book: Book) => void;
  title?: string;
}

export const BookPickerModal: React.FC<BookPickerModalProps> = ({
  visible,
  onClose,
  onSelectBook,
  title = 'Kitap Seçin',
}) => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setQuery('');
      loadBooks('');
    }
  }, [visible]);

  const loadBooks = async (searchTerm: string) => {
    setLoading(true);
    try {
      const { books: results } = await booksService.searchBooks(searchTerm, 20);
      setBooks(results);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadBooks(text);
    }, 350);
  };

  const handleSelect = async (book: Book) => {
    // Seçilen kitabın geçerli bir Supabase UUID'ye sahip olduğundan emin ol
    if (!isUuid(book.id)) {
      const { book: persisted } = await booksService.findOrCreateBook(book);
      if (persisted) {
        onSelectBook(persisted);
        onClose();
        return;
      }
    }
    onSelectBook(book);
    onClose();
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
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <SearchIcon size={18} color={colors.textSecondary} />
            <TextInput
              placeholder="Kitap veya yazar adı yazın..."
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={handleQueryChange}
              style={styles.searchInput}
              autoCorrect={false}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => handleQueryChange('')}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Kitaplar aranıyor...</Text>
          </View>
        ) : (
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const authors = item.authors?.join(', ') || 'Bilinmeyen Yazar';
              return (
                <TouchableOpacity
                  style={styles.bookItem}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <BookCover
                    url={item.thumbnail_url}
                    title={item.title}
                    author={authors}
                    width={48}
                    height={72}
                  />
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.bookAuthor} numberOfLines={1}>
                      {authors}
                    </Text>
                    {item.page_count ? (
                      <Text style={styles.bookPages}>{item.page_count} sayfa</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <BookOpen size={32} color={colors.goldDark} />
                <Text style={styles.emptyText}>Kitap bulunamadı.</Text>
              </View>
            }
          />
        )}
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
  searchSection: {
    padding: 16,
    backgroundColor: colors.surfaceWarm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    marginLeft: 8,
    paddingVertical: 0,
  },
  listContent: {
    padding: 16,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    marginBottom: 3,
  },
  bookAuthor: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 2,
  },
  bookPages: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'serif',
  },
});
