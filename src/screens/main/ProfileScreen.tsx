import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import {
  BookOpen,
  CalendarDays,
  Camera,
  ChevronLeft,
  Feather,
  LayoutList,
  Library,
  Quote,
  Settings,
  Star,
  Target,
  UserCheck,
  UserPlus,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useStyles, useTheme } from '../../context/ThemeContext';
import { Post, PostType, Profile, ProfileStats, UserBook } from '../../lib/types';
import { socialService } from '../../services/socialService';
import { postsService } from '../../services/postsService';
import { libraryService } from '../../services/libraryService';
import { enrichBook } from '../../services/booksService';
import { PostCard } from '../../components/PostCard';
import { BookCover } from '../../components/BookCover';
import { Avatar, EmptyState, IconButton, PressableScale, ProgressBar, ProgressRing } from '../../components/ui';
import { fonts, hashString, radius, shade, Theme } from '../../theme/themes';

type Tab = 'wall' | 'quote' | 'review' | 'books';
const TABS: { id: Tab; label: string; icon: React.FC<{ size?: number; color?: string }> }[] = [
  { id: 'wall', label: 'Duvar', icon: LayoutList },
  { id: 'quote', label: 'Alıntılar', icon: Quote },
  { id: 'review', label: 'İncelemeler', icon: Star },
  { id: 'books', label: 'Kitaplar', icon: Library },
];

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

/** Profil kapağı: pastel kitap sırtlarından oluşan raf illüstrasyonu. */
const CoverArt: React.FC<{ width: number; height: number; seed: string; t: Theme }> = ({ width, height, seed, t }) => {
  const spines: React.ReactNode[] = [];
  const shelfY = [height * 0.48, height - 6];
  let k = hashString(seed);
  shelfY.forEach((y, row) => {
    let x = row === 0 ? 10 : -6;
    while (x < width) {
      k = (k * 1103515245 + 12345) & 0x7fffffff;
      const w = 12 + (k % 16);
      const h = height * 0.3 + (k % 22);
      const c = t.spines[k % t.spines.length];
      spines.push(<Rect key={`${row}-${x}`} x={x} y={y - h} width={w} height={h} rx={2} fill={c} opacity={0.95} />);
      spines.push(<Rect key={`${row}-${x}-b`} x={x} y={y - h + 6} width={w} height={2} fill={shade(c, -0.3)} opacity={0.4} />);
      x += w + 2 + (k % 9 === 0 ? 24 : 0);
    }
    spines.push(<Rect key={`shelf-${row}`} x={0} y={y} width={width} height={6} fill={t.woodShelf} />);
  });
  return (
    <Svg width={width} height={height}>
      <Rect x={0} y={0} width={width} height={height} fill={t.woodBack} />
      <Rect x={0} y={0} width={width} height={height} fill="#000" opacity={0.12} />
      {spines}
    </Svg>
  );
};

export const ProfileScreen: React.FC<{ userId?: string; onBack?: () => void }> = ({ userId, onBack }) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, profile: myProfile, refreshProfile } = useAuth();
  const { push, goTab, versions, bump } = useApp();
  const { showToast } = useToast();

  const targetId = userId || user?.id || '';
  const isMe = targetId === user?.id;

  const [profile, setProfile] = useState<Profile | null>(isMe ? myProfile : null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [reading, setReading] = useState<UserBook[]>([]);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('wall');
  const [posts, setPosts] = useState<Post[]>([]);
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loadingTab, setLoadingTab] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadHeader = useCallback(async () => {
    if (!targetId) return;
    const [p, st, r, f] = await Promise.all([
      socialService.getProfile(targetId),
      socialService.getStats(targetId),
      socialService.getCurrentlyReading(targetId),
      !isMe && user ? socialService.isFollowing(user.id, targetId) : Promise.resolve(false),
    ]);
    if (p) setProfile(p);
    setStats(st);
    setReading(r.filter((x) => x.book).map((x) => ({ ...x, book: enrichBook(x.book!) })));
    setFollowing(f);
  }, [targetId]);

  const loadTab = useCallback(async () => {
    if (!targetId) return;
    setLoadingTab(true);
    if (tab === 'books') {
      const { userBooks } = await libraryService.getUserBooks(targetId);
      setBooks(userBooks.filter((x) => x.book).map((x) => ({ ...x, book: enrichBook(x.book!) })));
    } else {
      const { posts: p } = await postsService.getPosts({
        currentUserId: user?.id,
        authorIds: [targetId],
        postType: tab === 'wall' ? undefined : (tab as PostType),
        limit: 40,
      });
      setPosts(p);
    }
    setLoadingTab(false);
  }, [targetId, tab]);

  useEffect(() => {
    loadHeader();
  }, [loadHeader, versions.profile, versions.library, versions.posts]);

  useEffect(() => {
    loadTab();
  }, [loadTab, versions.posts, versions.library]);

  useEffect(() => {
    if (isMe && myProfile) setProfile(myProfile);
  }, [myProfile]);

  const toggleFollow = async () => {
    if (!user) return;
    setFollowBusy(true);
    const next = !following;
    setFollowing(next);
    setStats((st) => (st ? { ...st, followers: st.followers + (next ? 1 : -1) } : st));
    const { error } = next ? await socialService.follow(user.id, targetId) : await socialService.unfollow(user.id, targetId);
    setFollowBusy(false);
    if (error) {
      setFollowing(!next);
      setStats((st) => (st ? { ...st, followers: st.followers + (next ? -1 : 1) } : st));
      return showToast(error, 'error');
    }
    if (next) showToast(`@${profile?.username} takip ediliyor`, 'success');
    bump('posts');
  };

  const changePhoto = async () => {
    if (!user) return;
    setUploading(true);
    const { url, error } = await socialService.pickAndUploadAvatar(user.id);
    setUploading(false);
    if (error) return showToast(error, 'error');
    if (!url) return;
    await refreshProfile();
    bump('profile', 'posts');
    showToast('Profil fotoğrafın güncellendi');
  };

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadHeader(), loadTab()]);
    setRefreshing(false);
  };

  if (!profile) {
    return (
      <View style={[s.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  const goal = profile.reading_goal_yearly || 0;
  const done = stats?.completedThisYear || 0;
  const year = new Date().getFullYear();
  const joined = profile.created_at ? new Date(profile.created_at) : null;
  const coverH = 150 + insets.top;

  const counters: { label: string; value: number | undefined; onPress?: () => void }[] = [
    { label: 'Kitap', value: stats?.books, onPress: () => (isMe ? goTab('library') : setTab('books')) },
    { label: 'Takip edilen', value: stats?.following, onPress: () => push({ name: 'follows', userId: targetId, mode: 'following' }) },
    { label: 'Takipçi', value: stats?.followers, onPress: () => push({ name: 'follows', userId: targetId, mode: 'followers' }) },
    { label: 'İnceleme', value: stats?.reviews, onPress: () => setTab('review') },
    { label: 'Alıntı', value: stats?.quotes, onPress: () => setTab('quote') },
    { label: 'İleti', value: stats ? stats.thoughts + stats.readingUpdates : undefined, onPress: () => setTab('wall') },
  ];

  return (
    <View style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.primary} />}
      >
        {/* Kapak */}
        <View style={{ height: coverH, overflow: 'hidden' }}>
          <CoverArt width={width} height={coverH} seed={profile.id} t={theme} />
        </View>

        {/* Avatar + aksiyonlar */}
        <View style={s.identityRow}>
          <Pressable
            style={s.avatarWrap}
            disabled={!isMe || uploading}
            onPress={changePhoto}
            accessibilityLabel={isMe ? 'Profil fotoğrafını değiştir' : undefined}
          >
            <Avatar name={profile.full_name || profile.username} url={profile.avatar_url} size={96} ring />
            {isMe && (
              <View style={s.cameraBadge}>
                {uploading ? <ActivityIndicator size="small" color={theme.onPrimary} /> : <Camera size={14} color={theme.onPrimary} />}
              </View>
            )}
          </Pressable>
          <View style={s.actionsRow}>
            {isMe ? (
              <PressableScale style={s.outlineBtn} onPress={() => push({ name: 'editProfile' })}>
                <Text style={s.outlineBtnText}>Profili düzenle</Text>
              </PressableScale>
            ) : (
              <PressableScale
                style={[s.followBtn, following && s.followingBtn]}
                onPress={toggleFollow}
                disabled={followBusy}
              >
                {following ? <UserCheck size={17} color={theme.text} /> : <UserPlus size={17} color={theme.onPrimary} />}
                <Text style={[s.followText, following && { color: theme.text }]}>{following ? 'Takip ediliyor' : 'Takip et'}</Text>
              </PressableScale>
            )}
          </View>
        </View>

        <View style={s.info}>
          <Text style={s.name}>{profile.full_name || profile.username}</Text>
          <Text style={s.username}>@{profile.username}</Text>
          {profile.bio ? <Text style={s.bio}>{profile.bio}</Text> : isMe ? (
            <Pressable onPress={() => push({ name: 'editProfile' })}>
              <Text style={[s.bio, { color: theme.textMuted, fontStyle: 'italic' }]}>Kendinden biraz bahset…</Text>
            </Pressable>
          ) : null}
          {joined && (
            <View style={s.metaRow}>
              <CalendarDays size={14} color={theme.textMuted} />
              <Text style={s.metaText}>
                {MONTHS[joined.getMonth()]} {joined.getFullYear()} tarihinde katıldı
              </Text>
            </View>
          )}
        </View>

        {/* Sayaçlar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.counters}>
          {counters.map((c) => (
            <Pressable key={c.label} onPress={c.onPress} style={s.counter} hitSlop={4}>
              <Text style={s.counterValue}>{c.value ?? '–'}</Text>
              <Text style={s.counterLabel}>{c.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Yıllık okuma hedefi */}
        <PressableScale
          scaleTo={0.98}
          onPress={isMe ? () => push({ name: 'editProfile' }) : undefined}
          style={s.goalCard}
        >
          <ProgressRing value={goal ? done / goal : 0} size={76} stroke={8}>
            <Text style={s.goalPct}>{goal ? `%${Math.min(100, Math.round((done / goal) * 100))}` : '—'}</Text>
          </ProgressRing>
          <View style={{ flex: 1 }}>
            <View style={s.goalTitleRow}>
              <Target size={14} color={theme.primary} />
              <Text style={s.goalTitle}>{year} Okuma Hedefi</Text>
            </View>
            {goal ? (
              <>
                <Text style={s.goalCount}>
                  {done}
                  <Text style={s.goalOf}> / {goal} kitap</Text>
                </Text>
                <Text style={s.goalHint}>
                  {done >= goal ? 'Hedef tamamlandı! 🎉' : `Hedefe ${goal - done} kitap kaldı`}
                </Text>
              </>
            ) : (
              <Text style={s.goalHint}>{isMe ? 'Bu yıl kaç kitap okumak istersin? Dokun ve hedef belirle.' : 'Henüz hedef belirlenmemiş.'}</Text>
            )}
          </View>
        </PressableScale>

        {/* Şu an okuduğu */}
        {reading.length > 0 && (
          <View style={s.readingBlock}>
            <Text style={s.blockTitle}>Şu anda okuduğu</Text>
            {reading.slice(0, 2).map((ub) => {
              const b = ub.book!;
              const p = b.page_count ? (ub.current_page || 0) / b.page_count : 0;
              return (
                <PressableScale key={ub.id} scaleTo={0.98} onPress={() => push({ name: 'book', book: b })} style={s.readingRow}>
                  <BookCover url={b.thumbnail_url} title={b.title} author={b.authors?.[0]} width={46} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={s.readingTitle} numberOfLines={1}>
                      {b.title}
                    </Text>
                    <Text style={s.readingSub} numberOfLines={1}>
                      {b.page_count ? `${ub.current_page || 0}/${b.page_count}. sayfa` : `${ub.current_page || 0}. sayfa`} · {b.authors?.[0]}
                    </Text>
                    {b.page_count ? <ProgressBar value={p} height={4} /> : null}
                  </View>
                </PressableScale>
              );
            })}
          </View>
        )}

        {/* Sekmeler */}
        <View style={s.tabs}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <Pressable key={t.id} onPress={() => setTab(t.id)} style={[s.tab, active && s.tabActive]}>
                <t.icon size={18} color={active ? theme.text : theme.textMuted} />
                {active && <Text style={s.tabLabel}>{t.label}</Text>}
              </Pressable>
            );
          })}
        </View>

        {loadingTab ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 30 }} />
        ) : tab === 'books' ? (
          books.length === 0 ? (
            <EmptyState icon={<BookOpen size={28} color={theme.primary} />} title="Raflar boş" text="Henüz kitaplığa kitap eklenmemiş." />
          ) : (
            <View style={s.grid}>
              {books.map((ub) => (
                <PressableScale key={ub.id} onPress={() => push({ name: 'book', book: ub.book! })} style={s.gridItem}>
                  <BookCover url={ub.book!.thumbnail_url} title={ub.book!.title} author={ub.book!.authors?.[0]} width={(width - 32 - 24) / 3} />
                </PressableScale>
              ))}
            </View>
          )
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Feather size={28} color={theme.primary} />}
            title="Burada henüz bir şey yok"
            text={isMe ? 'İlk alıntını ya da incelemeni paylaş, duvarın şekillensin.' : 'Bu okur henüz paylaşım yapmamış.'}
          />
        ) : (
          <View style={{ marginTop: 4 }}>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} onDeleted={(id) => setPosts((prev) => prev.filter((x) => x.id !== id))} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Üst butonlar */}
      <View style={[s.topButtons, { top: insets.top + 8 }]} pointerEvents="box-none">
        {onBack ? (
          <IconButton onPress={onBack} bg={theme.card + 'EE'} accessibilityLabel="Geri">
            <ChevronLeft size={22} color={theme.text} />
          </IconButton>
        ) : (
          <View />
        )}
        {isMe && (
          <IconButton onPress={() => push({ name: 'settings' })} bg={theme.card + 'EE'} accessibilityLabel="Ayarlar">
            <Settings size={20} color={theme.text} />
          </IconButton>
        )}
      </View>
    </View>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    topButtons: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
    identityRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, marginTop: -48 },
    avatarWrap: { borderRadius: 52, backgroundColor: t.bg, padding: 4 },
    cameraBadge: {
      position: 'absolute',
      right: 4,
      bottom: 4,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: t.primary,
      borderWidth: 3,
      borderColor: t.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionsRow: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 6, gap: 8 },
    outlineBtn: {
      paddingHorizontal: 18,
      height: 40,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: t.border,
      backgroundColor: t.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outlineBtnText: { fontSize: 14, fontWeight: '700', color: t.text },
    followBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      height: 42,
      borderRadius: radius.pill,
      backgroundColor: t.primary,
    },
    followingBtn: { backgroundColor: t.card, borderWidth: 1.5, borderColor: t.border },
    followText: { fontSize: 14.5, fontWeight: '800', color: t.onPrimary },
    info: { paddingHorizontal: 22, marginTop: 10 },
    name: { fontFamily: fonts.serif, fontSize: 26, fontWeight: '700', color: t.text },
    username: { fontSize: 15, color: t.textMuted, marginTop: 2 },
    bio: { fontSize: 15, color: t.text, lineHeight: 21, marginTop: 10 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    metaText: { fontSize: 13, color: t.textMuted },
    counters: { paddingHorizontal: 22, gap: 22, paddingVertical: 16 },
    counter: { alignItems: 'flex-start' },
    counterValue: { fontSize: 18, fontWeight: '800', color: t.text },
    counterLabel: { fontSize: 12.5, color: t.textMuted, marginTop: 1 },
    goalCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginHorizontal: 16,
      padding: 16,
      borderRadius: radius.lg,
      backgroundColor: t.primarySoft,
    },
    goalPct: { fontSize: 15, fontWeight: '800', color: t.text },
    goalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    goalTitle: { fontSize: 12.5, fontWeight: '800', color: t.primary, letterSpacing: 0.4, textTransform: 'uppercase' },
    goalCount: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '700', color: t.text, marginTop: 2 },
    goalOf: { fontSize: 15, fontWeight: '600', color: t.textSoft, fontFamily: fonts.sans },
    goalHint: { fontSize: 13, color: t.textSoft, marginTop: 2, lineHeight: 18 },
    readingBlock: { marginHorizontal: 16, marginTop: 14, padding: 14, borderRadius: radius.lg, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, gap: 12 },
    blockTitle: { fontSize: 13, fontWeight: '700', color: t.textSoft },
    readingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    readingTitle: { fontFamily: fonts.serif, fontSize: 15.5, fontWeight: '700', color: t.text },
    readingSub: { fontSize: 12.5, color: t.textMuted },
    tabs: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginTop: 22,
      marginBottom: 14,
      padding: 5,
      borderRadius: radius.pill,
      backgroundColor: t.bgSoft,
    },
    tab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.pill },
    tabActive: { backgroundColor: t.card, flexGrow: 1 },
    tabLabel: { fontSize: 13.5, fontWeight: '800', color: t.text },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
    gridItem: {},
  });
