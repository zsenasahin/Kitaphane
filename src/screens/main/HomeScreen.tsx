import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Feather } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useStyles, useTheme } from '../../context/ThemeContext';
import { Post } from '../../lib/types';
import { postsService } from '../../services/postsService';
import { socialService } from '../../services/socialService';
import { PostCard } from '../../components/PostCard';
import { EmptyState } from '../../components/ui';
import { fonts, Theme } from '../../theme/themes';

type FeedTab = 'following' | 'discover';
const PAGE = 15;

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const { user } = useAuth();
  const { versions, openComposer } = useApp();

  const [tab, setTab] = useState<FeedTab>('following');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const followingIds = useRef<string[]>([]);
  const seenIds = useRef<Set<string>>(new Set());

  const loadFeed = useCallback(
    async (which: FeedTab, offset = 0) => {
      if (!user) return;
      if (offset === 0) followingIds.current = await socialService.getFollowingIds(user.id);
      const authorIds = which === 'following' ? [user.id, ...followingIds.current] : undefined;
      const { posts: page } = await postsService.getPosts({ currentUserId: user.id, authorIds, limit: PAGE, offset });
      setHasMore(page.length === PAGE);

      // Az önce yapılan kendi paylaşımlarını hafifçe vurgula
      const fresh = page.filter(
        (p) =>
          seenIds.current.size > 0 &&
          p.user_id === user.id &&
          !seenIds.current.has(p.id) &&
          Date.now() - new Date(p.created_at).getTime() < 30000
      );
      page.forEach((p) => seenIds.current.add(p.id));
      if (fresh.length) setFreshIds(new Set(fresh.map((p) => p.id)));

      setPosts((prev) => (offset === 0 ? page : [...prev, ...page.filter((p) => !prev.some((q) => q.id === p.id))]));
    },
    [user?.id]
  );

  useEffect(() => {
    loadFeed(tab).then(() => setLoading(false));
  }, [versions.posts]);

  const switchTab = async (t: FeedTab) => {
    if (t === tab) return;
    setTab(t);
    setLoading(true);
    setPosts([]);
    await loadFeed(t);
    setLoading(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadFeed(tab);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    await loadFeed(tab, posts.length);
    setLoadingMore(false);
  };

  const header = (
    <View style={s.header}>
      <Text style={s.logo}>Kitaphane</Text>
      <View style={s.tabs}>
        {(['following', 'discover'] as FeedTab[]).map((t) => {
          const active = tab === t;
          return (
            <Pressable key={t} onPress={() => switchTab(t)} style={s.tab} accessibilityRole="tab" accessibilityState={{ selected: active }}>
              <Text style={[s.tabText, active && s.tabTextActive]}>{t === 'following' ? 'Takip' : 'Keşfet'}</Text>
              <View style={[s.tabLine, active && { backgroundColor: theme.text }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {header}
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            highlight={freshIds.has(item.id)}
            onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginTop: 48 }} />
          ) : tab === 'following' ? (
            <EmptyState
              icon={<Feather size={28} color={theme.primary} />}
              title="Akışın henüz sessiz"
              text="Takip ettiğin okurların paylaşımları burada görünür. Keşfet'te yeni okurlar bulabilirsin."
              action={{ label: "Keşfet'e göz at", onPress: () => switchTab('discover') }}
            />
          ) : (
            <EmptyState
              icon={<Feather size={28} color={theme.primary} />}
              title="Henüz paylaşım yok"
              text="İlk paylaşımı yapan sen ol!"
              action={{ label: 'Paylaşım yap', onPress: () => openComposer() }}
            />
          )
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator color={theme.primary} style={{ margin: 20 }} /> : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.primary} />}
      />
    </View>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    header: {
      paddingTop: 10,
      backgroundColor: t.bg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border,
    },
    logo: { fontFamily: fonts.serif, fontSize: 26, fontWeight: '700', color: t.text, textAlign: 'center', letterSpacing: 0.3 },
    tabs: { flexDirection: 'row', marginTop: 8 },
    tab: { flex: 1, alignItems: 'center', paddingTop: 10 },
    tabText: { fontSize: 15, fontWeight: '600', color: t.textMuted, paddingBottom: 10 },
    tabTextActive: { color: t.text, fontWeight: '800' },
    tabLine: { height: 3, width: 44, borderRadius: 2, backgroundColor: 'transparent' },
  });
