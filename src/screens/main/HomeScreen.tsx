import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import {
  Heart,
  Quote,
  Star,
  BookOpen,
  Feather,
  Sparkles,
  Trash2,
  BookmarkCheck,
  MessageSquare,
  Share2,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Post, PostType, POST_TYPE_LABELS, Book } from '../../lib/types';
import { postsService } from '../../services/postsService';
import { useAuth } from '../../context/AuthContext';
import { BookCover } from '../../components/BookCover';
import { BookDetailModal } from './BookDetailModal';

type FeedFilter = 'all' | PostType;

const FILTER_CHIPS: { id: FeedFilter; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'quote', label: 'Alıntılar' },
  { id: 'review', label: 'İncelemeler' },
  { id: 'reading_update', label: 'Okuma Kayıtları' },
  { id: 'thought', label: 'Düşünceler' },
];

interface HomeScreenProps {
  onNavigateToSearch?: () => void;
  onOpenCreateMenu?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToSearch,
  onOpenCreateMenu,
}) => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FeedFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      const { posts: feedPosts, error } = await postsService.getFeed(user?.id, 30, 0);
      if (!error) {
        setPosts(feedPosts);
      }
    } catch (e) {
      console.warn('Akış yüklenirken hata:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const handleToggleLike = async (post: Post) => {
    if (!user?.id) {
      Alert.alert('Giriş Yapın', 'Beğenmek için giriş yapmış olmalısınız.');
      return;
    }

    const wasLiked = !!post.is_liked_by_me;
    const currentCount = post.likes_count || 0;

    // Optimistik güncelleme
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              is_liked_by_me: !wasLiked,
              likes_count: wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
            }
          : p
      )
    );

    const { error } = await postsService.toggleLike(user.id, post.id);
    if (error) {
      // Hata olursa geri al
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                is_liked_by_me: wasLiked,
                likes_count: currentCount,
              }
            : p
        )
      );
    }
  };

  const handleDeletePost = (post: Post) => {
    if (!user?.id || post.user_id !== user.id) return;

    Alert.alert('Paylaşımı Sil', 'Bu paylaşımı silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const { success, error } = await postsService.deletePost(user.id, post.id);
          if (success) {
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
          } else {
            Alert.alert('Hata', error || 'Silinemedi.');
          }
        },
      },
    ]);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return 'Az önce';
      if (diffMinutes < 60) return `${diffMinutes} dk önce`;
      if (diffHours < 24) return `${diffHours} sa önce`;
      if (diffDays === 1) return 'Dün';
      if (diffDays < 7) return `${diffDays} gün önce`;

      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedFilter === 'all') return true;
    return p.post_type === selectedFilter;
  });

  const renderPostItem = ({ item }: { item: Post }) => {
    const isOwner = user?.id === item.user_id;
    const authorName =
      item.user?.full_name ||
      item.user?.username ||
      'Kitaphane Okuru';
    const authorInitial = authorName.charAt(0).toUpperCase();

    return (
      <View style={styles.postCard}>
        {/* Yazar Bilgisi ve Post Tipi Başlığı */}
        <View style={styles.postAuthorRow}>
          <View style={styles.authorAvatar}>
            <Text style={styles.avatarInitial}>{authorInitial}</Text>
          </View>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName} numberOfLines={1}>
                {authorName}
              </Text>
              <Text style={styles.postDate}>{formatDate(item.created_at)}</Text>
            </View>

            {/* Post Türü Rozeti */}
            <View style={styles.postTypeTag}>
              {item.post_type === 'quote' && (
                <>
                  <Quote size={11} color={colors.goldDark} />
                  <Text style={styles.postTypeTagText}>Alıntı</Text>
                </>
              )}
              {item.post_type === 'review' && (
                <>
                  <Star size={11} color={colors.gold} />
                  <Text style={styles.postTypeTagText}>İnceleme</Text>
                </>
              )}
              {item.post_type === 'reading_update' && (
                <>
                  <BookOpen size={11} color={colors.primary} />
                  <Text style={styles.postTypeTagText}>Okuma Kaydı</Text>
                </>
              )}
              {item.post_type === 'thought' && (
                <>
                  <Feather size={11} color={colors.textSecondary} />
                  <Text style={styles.postTypeTagText}>Serbest İleti</Text>
                </>
              )}
            </View>
          </View>

          {isOwner && (
            <TouchableOpacity
              onPress={() => handleDeletePost(item)}
              style={styles.deletePostBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={15} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Gönderi Türüne Göre İçerik */}
        {item.post_type === 'quote' && (
          <View style={styles.quoteBodyBox}>
            <Text style={styles.quoteText}>“{item.content}”</Text>
            {item.quote_page ? (
              <Text style={styles.pageIndicator}>Sayfa {item.quote_page}</Text>
            ) : null}
          </View>
        )}

        {item.post_type === 'review' && (
          <View style={styles.reviewBodyBox}>
            {item.review_rating ? (
              <View style={styles.reviewRatingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    color={star <= item.review_rating! ? colors.gold : colors.border}
                    fill={star <= item.review_rating! ? colors.gold : 'transparent'}
                  />
                ))}
                <Text style={styles.reviewRatingNumber}>
                  {item.review_rating}.0 / 5
                </Text>
              </View>
            ) : null}
            <Text style={styles.reviewText}>{item.content}</Text>
          </View>
        )}

        {item.post_type === 'reading_update' && (
          <View style={styles.readingUpdateBox}>
            <Text style={styles.readingUpdateText}>{item.content}</Text>
          </View>
        )}

        {item.post_type === 'thought' && (
          <View style={styles.thoughtBox}>
            <Text style={styles.thoughtText}>{item.content}</Text>
          </View>
        )}

        {/* Varsa İlişkili Kitap Kartı */}
        {item.book && (
          <TouchableOpacity
            style={styles.attachedBookCard}
            onPress={() => setSelectedBook(item.book!)}
            activeOpacity={0.75}
          >
            <BookCover
              url={item.book.thumbnail_url}
              title={item.book.title}
              author={item.book.authors?.[0] || ''}
              width={46}
              height={70}
            />
            <View style={styles.attachedBookDetails}>
              <Text style={styles.attachedBookTitle} numberOfLines={2}>
                {item.book.title}
              </Text>
              <Text style={styles.attachedBookAuthor} numberOfLines={1}>
                {item.book.authors?.join(', ') || 'Bilinmeyen Yazar'}
              </Text>
              <Text style={styles.tapToDetailText}>Kitabı İncele →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Kart Altı: Beğeni ve Etkileşim */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => handleToggleLike(item)}
            activeOpacity={0.7}
          >
            <Heart
              size={18}
              color={item.is_liked_by_me ? colors.error : colors.textSecondary}
              fill={item.is_liked_by_me ? colors.error : 'transparent'}
            />
            <Text
              style={[
                styles.likeCountText,
                item.is_liked_by_me && { color: colors.error, fontWeight: '700' },
              ]}
            >
              {item.likes_count || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.feedHeader}>
      {/* Marka ve Karşılama Başlığı */}
      <View style={styles.brandRow}>
        <View>
          <Text style={styles.appName}>Kitaphane</Text>
          <Text style={styles.appTagline}>Edebiyat ve Kitap Tutkunları Topluluğu</Text>
        </View>
        <View style={styles.goldLeafIcon}>
          <Sparkles size={20} color={colors.gold} />
        </View>
      </View>

      {/* Akış Filtre Sekmeleri */}
      <FlatList
        horizontal
        data={FILTER_CHIPS}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        renderItem={({ item }) => {
          const isSelected = selectedFilter === item.id;
          return (
            <TouchableOpacity
              onPress={() => setSelectedFilter(item.id)}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderEmptyFeed = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Edebî akış yükleniyor...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyFeedCard}>
        <View style={styles.emptyIconCircle}>
          <Feather size={32} color={colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Henüz Paylaşım Yok</Text>
        <Text style={styles.emptySubtitle}>
          Kitaphanede ilk alıntıyı, incelemeyi veya düşünceyi paylaşarak sohbeti başlatın.
        </Text>
        {onOpenCreateMenu && (
          <TouchableOpacity
            style={styles.firstPostBtn}
            onPress={onOpenCreateMenu}
            activeOpacity={0.85}
          >
            <Text style={styles.firstPostBtnText}>İlk Paylaşımı Yap</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyFeed}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />

      {/* Kitap Detayı Modalı */}
      <BookDetailModal
        visible={!!selectedBook}
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onBookUpdated={fetchFeed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 40,
  },
  feedHeader: {
    backgroundColor: colors.surfaceWarm,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  goldLeafIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  postCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    shadowColor: colors.borderDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'serif',
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  postDate: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  postTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  postTypeTagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  deletePostBtn: {
    padding: 6,
  },
  quoteBodyBox: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: 10,
    borderLeftWidth: 3.5,
    borderLeftColor: colors.gold,
    padding: 14,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.text,
    fontFamily: 'serif',
    lineHeight: 24,
  },
  pageIndicator: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  reviewBodyBox: {
    marginBottom: 12,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  reviewRatingNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
  reviewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  readingUpdateBox: {
    backgroundColor: 'rgba(92, 52, 26, 0.06)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  readingUpdateText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'serif',
  },
  thoughtBox: {
    marginBottom: 12,
  },
  thoughtText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  attachedBookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  attachedBookDetails: {
    flex: 1,
    marginLeft: 12,
  },
  attachedBookTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
  },
  attachedBookAuthor: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  tapToDetailText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accentDark,
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  likeCountText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  centerContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'serif',
  },
  emptyFeedCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 18,
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
    marginBottom: 20,
    paddingHorizontal: 14,
  },
  firstPostBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  firstPostBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
});
