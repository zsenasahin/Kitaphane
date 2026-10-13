import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Plus,
  BookMarked,
  BookOpen,
  Sparkles,
  Library as LibraryIcon,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { UserBook, UserBookStatus, USER_BOOK_STATUS_LABELS, Book } from '../../lib/types';
import { libraryService } from '../../services/libraryService';
import { useAuth } from '../../context/AuthContext';
import { BookCover } from '../../components/BookCover';
import { BookDetailModal } from './BookDetailModal';

type FilterTab = 'all' | UserBookStatus;

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'reading', label: 'Okuyorum' },
  { id: 'want_to_read', label: 'Kitaplıkta' },
  { id: 'completed', label: 'Okudum' },
  { id: 'dropped', label: 'Yarım' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOOKS_PER_SHELF = 3;
const SHELF_WIDTH = SCREEN_WIDTH - 32;
const BOOK_WIDTH = Math.floor((SHELF_WIDTH - 48) / BOOKS_PER_SHELF);
const BOOK_HEIGHT = Math.floor(BOOK_WIDTH * 1.48);

interface LibraryScreenProps {
  onNavigateToSearch?: () => void;
  onShareQuoteRequest?: (book: Book) => void;
  onShareReviewRequest?: (book: Book) => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  onNavigateToSearch,
  onShareQuoteRequest,
  onShareReviewRequest,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const fetchLibrary = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { userBooks: data, error } = await libraryService.getUserBooks(user.id);
      if (!error) {
        setUserBooks(data);
      }
    } catch (e) {
      console.warn('Kitaplık yüklenirken hata:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLibrary();
  };

  // Filtreleme
  const filteredBooks = userBooks.filter((ub) => {
    if (activeTab === 'all') return true;
    return ub.status === activeTab;
  });

  // Raflara bölme (Her rafta 3 kitap)
  const shelves: UserBook[][] = [];
  for (let i = 0; i < filteredBooks.length; i += BOOKS_PER_SHELF) {
    shelves.push(filteredBooks.slice(i, i + BOOKS_PER_SHELF));
  }

  // Sekmelerdeki sayıları hesapla
  const countByStatus: Record<string, number> = {
    all: userBooks.length,
    reading: userBooks.filter((b) => b.status === 'reading').length,
    want_to_read: userBooks.filter((b) => b.status === 'want_to_read').length,
    completed: userBooks.filter((b) => b.status === 'completed').length,
    dropped: userBooks.filter((b) => b.status === 'dropped').length,
  };

  return (
    <View style={styles.container}>
      {/* Başlık Çubuğu */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Kişisel Kitaplığım</Text>
          <Text style={styles.subtitle}>
            {userBooks.length} eser raflarınızda dizili
          </Text>
        </View>

        {onNavigateToSearch && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onNavigateToSearch}
            activeOpacity={0.8}
          >
            <Plus size={20} color={colors.textInverse} />
          </TouchableOpacity>
        )}
      </View>

      {/* Raf Filtre Butonları */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            const count = countByStatus[tab.id] || 0;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.tabText, isSelected && styles.tabTextActive]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.tabCountBadge,
                    isSelected && styles.tabCountBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabCountText,
                      isSelected && styles.tabCountTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Kitaplık Rafları Alanı */}
      <ScrollView
        contentContainerStyle={styles.shelvesContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Kitaplığınız hazırlanıyor...</Text>
          </View>
        ) : filteredBooks.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <LibraryIcon size={34} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'all'
                ? 'Kitaplığınız Henüz Boş'
                : `"${TABS.find((t) => t.id === activeTab)?.label}" Rafında Kitap Yok`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all'
                ? 'Okuduğunuz veya okumak istediğiniz kitapları ekleyerek ahşap raflarınızı doldurmaya başlayın.'
                : 'Bu kategoride kayıtlı bir kitabınız bulunmuyor. Yeni bir eser keşfedip ekleyebilirsiniz.'}
            </Text>

            {onNavigateToSearch && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={onNavigateToSearch}
                activeOpacity={0.85}
              >
                <Plus size={16} color={colors.textInverse} style={{ marginRight: 6 }} />
                <Text style={styles.actionBtnText}>Kitap Keşfet & Ekle</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.bookcaseContainer}>
            {/* Ahşap Kitaplık Ünitesi */}
            {shelves.map((shelf, shelfIndex) => (
              <View key={`shelf_${shelfIndex}`} style={styles.shelfRow}>
                {/* Rafta Dik Duran Kitaplar */}
                <View style={styles.booksOnShelf}>
                  {shelf.map((userBookItem) => {
                    const book = userBookItem.book;
                    if (!book) return null;

                    return (
                      <TouchableOpacity
                        key={userBookItem.id}
                        style={styles.bookSlot}
                        activeOpacity={0.8}
                        onPress={() => setSelectedBook(book)}
                      >
                        {/* Dik Duran Ciltli Kitap */}
                        <View style={styles.standingBookWrapper}>
                          <BookCover
                            url={book.thumbnail_url}
                            title={book.title}
                            author={book.authors?.[0] || ''}
                            width={BOOK_WIDTH}
                            height={BOOK_HEIGHT}
                            standingShadow
                          />
                        </View>

                        {/* Kitap İsim Yazısı */}
                        <Text style={styles.bookSpineTitle} numberOfLines={2}>
                          {book.title}
                        </Text>
                        <Text style={styles.bookSpineAuthor} numberOfLines={1}>
                          {book.authors?.[0] || ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Eğer rafta 3'ten az kitap varsa boş alanı doldur */}
                  {Array.from({ length: BOOKS_PER_SHELF - shelf.length }).map(
                    (_, emptyIdx) => (
                      <View
                        key={`empty_${emptyIdx}`}
                        style={[styles.bookSlot, { opacity: 0.15 }]}
                      >
                        <View
                          style={{
                            width: BOOK_WIDTH,
                            height: BOOK_HEIGHT,
                            borderWidth: 1.5,
                            borderStyle: 'dashed',
                            borderColor: colors.borderDark,
                            borderRadius: 4,
                          }}
                        />
                      </View>
                    )
                  )}
                </View>

                {/* Gerçekçi Ahşap Raf Kirişi (Shelf Beam) */}
                <View style={styles.woodenBeam}>
                  {/* Üst Vurgu / Pah Çizgisi */}
                  <View style={styles.beamTopHighlight} />
                  {/* Ahşap Gövdesi */}
                  <View style={styles.beamBody}>
                    <View style={styles.woodGrainLine} />
                  </View>
                  {/* Alt Gölgelendirme */}
                  <View style={styles.beamBottomShadow} />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Kitap Detayı Modalı */}
      <BookDetailModal
        visible={!!selectedBook}
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onBookUpdated={() => {
          fetchLibrary();
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: colors.surfaceWarm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContainer: {
    backgroundColor: colors.surfaceWarm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  tabCountBadge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabCountTextActive: {
    color: colors.textInverse,
  },
  shelvesContent: {
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'serif',
  },
  bookcaseContainer: {
    gap: 20,
  },
  shelfRow: {
    marginBottom: 8,
  },
  booksOnShelf: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 0,
    zIndex: 2,
  },
  bookSlot: {
    alignItems: 'center',
    width: BOOK_WIDTH + 10,
  },
  standingBookWrapper: {
    marginBottom: 0,
  },
  bookSpineTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
  bookSpineAuthor: {
    fontSize: 10,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 2,
  },
  woodenBeam: {
    width: '100%',
    marginTop: 4,
    zIndex: 1,
  },
  beamTopHighlight: {
    height: 3,
    backgroundColor: '#734A2F',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  beamBody: {
    height: 14,
    backgroundColor: '#3E2415',
    justifyContent: 'center',
  },
  woodGrainLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  beamBottomShadow: {
    height: 6,
    backgroundColor: 'rgba(24, 13, 7, 0.45)',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 24,
    shadowColor: colors.borderDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
});
