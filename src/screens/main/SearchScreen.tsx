import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Search as SearchIcon,
  X,
  BookOpen,
  Sparkles,
  Database,
  Globe,
  AlertCircle,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Book } from '../../lib/types';
import { booksService } from '../../services/booksService';
import { BookCover } from '../../components/BookCover';
import { BookDetailModal } from './BookDetailModal';

const CATEGORIES = [
  'Dünya Klasikleri',
  'Türk Edebiyatı',
  'Felsefe',
  'Psikoloji',
  'Roman',
  'Tarih',
  'Şiir',
  'Bilim Kurgu',
];

interface SearchScreenProps {
  onShareQuoteRequest?: (book: Book) => void;
  onShareReviewRequest?: (book: Book) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onShareQuoteRequest,
  onShareReviewRequest,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [fromApiCount, setFromApiCount] = useState(0);

  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { books: results, fromApiCount: apiCount, error } =
        await booksService.searchBooks(searchTerm, 25);

      if (error) {
        setErrorMessage(error);
      } else {
        setBooks(results);
        setFromApiCount(apiCount);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Arama sırasında bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  // İlk açılışta popüler/kayıtlı kitapları getir
  useEffect(() => {
    performSearch('');
  }, [performSearch]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (selectedCategory) setSelectedCategory(null);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      performSearch(text);
    }, 400);
  };

  const handleCategorySelect = (category: string) => {
    const nextCat = selectedCategory === category ? null : category;
    setSelectedCategory(nextCat);
    setQuery(nextCat || '');
    performSearch(nextCat || '');
  };

  const handleClear = () => {
    setQuery('');
    setSelectedCategory(null);
    performSearch('');
  };

  const renderBookItem = ({ item }: { item: Book }) => {
    const authors = item.authors?.join(', ') || 'Bilinmeyen Yazar';
    const isFromApi = item.id.startsWith('temp_');

    return (
      <TouchableOpacity
        style={styles.bookCard}
        activeOpacity={0.7}
        onPress={() => setSelectedBook(item)}
      >
        <BookCover
          url={item.thumbnail_url}
          title={item.title}
          author={authors}
          width={65}
          height={95}
        />

        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {item.subtitle ? (
            <Text style={styles.bookSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          ) : null}

          <Text style={styles.bookAuthor} numberOfLines={1}>
            {authors}
          </Text>

          <View style={styles.metaRow}>
            {item.page_count ? (
              <Text style={styles.metaText}>{item.page_count} sayfa</Text>
            ) : null}

            {item.published_date ? (
              <Text style={styles.metaText}>
                {item.published_date.slice(0, 4)}
              </Text>
            ) : null}

            <View style={styles.sourceBadge}>
              {isFromApi ? (
                <>
                  <Globe size={11} color={colors.accentDark} />
                  <Text style={styles.sourceTextApi}>Google Books</Text>
                </>
              ) : (
                <>
                  <Database size={11} color={colors.primary} />
                  <Text style={styles.sourceTextDb}>Kitaphane</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Popüler Kategoriler */}
      <Text style={styles.sectionTitle}>Edebî Türler</Text>
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const isSelected = selectedCategory === item;
          return (
            <TouchableOpacity
              onPress={() => handleCategorySelect(item)}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Sonuç Başlığı */}
      <View style={styles.resultsHeaderRow}>
        <Text style={styles.sectionTitle}>
          {query.trim() ? `"${query.trim()}" Sonuçları` : 'Öne Çıkan Eserler'}
        </Text>
        {books.length > 0 && (
          <Text style={styles.resultCountText}>{books.length} eser</Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Katalog taranıyor...</Text>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={styles.stateContainer}>
          <AlertCircle size={40} color={colors.error} />
          <Text style={styles.errorTitle}>Arama Yapılamadı</Text>
          <Text style={styles.errorSubtitle}>{errorMessage}</Text>
        </View>
      );
    }

    return (
      <View style={styles.stateContainer}>
        <View style={styles.iconCircle}>
          <BookOpen size={36} color={colors.goldDark} />
        </View>
        <Text style={styles.emptyTitle}>Eser Bulunamadı</Text>
        <Text style={styles.emptySubtitle}>
          Farklı bir yazar veya kitap başlığıyla aramayı deneyebilir ya da türleri inceleyebilirsiniz.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Üst Arama Başlığı */}
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Kitap Kataloğu</Text>
        <Text style={styles.pageSubtitle}>
          Milyonlarca kitap, yazar ve edebî eser arasında arayın
        </Text>

        <View style={styles.searchBar}>
          <SearchIcon size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Kitap başlığı, yazar veya ISBN..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={handleQueryChange}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Arama Sonuçları Listesi */}
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Kitap Detay Modalı */}
      <BookDetailModal
        visible={!!selectedBook}
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onBookUpdated={() => {
          if (query.trim()) performSearch(query);
        }}
        onShareQuote={(b) => onShareQuoteRequest?.(b)}
        onShareReview={(b) => onShareReviewRequest?.(b)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: colors.leatherDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    marginLeft: 10,
    paddingVertical: 0,
  },
  listContent: {
    paddingBottom: 30,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    marginBottom: 10,
  },
  categoryList: {
    gap: 8,
    paddingBottom: 16,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  resultCountText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.borderDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 14,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    lineHeight: 20,
    marginBottom: 2,
  },
  bookSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sourceTextApi: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.accentDark,
  },
  sourceTextDb: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'serif',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
    marginTop: 12,
    marginBottom: 4,
  },
  errorSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
