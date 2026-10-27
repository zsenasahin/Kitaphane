import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart, MoreHorizontal, Trash2 } from 'lucide-react-native';
import { useTheme, useStyles } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Post, PostType } from '../lib/types';
import { postsService } from '../services/postsService';
import { enrichBook } from '../services/booksService';
import { fonts, radius, Theme } from '../theme/themes';
import { BookCover } from './BookCover';
import { Avatar, BottomSheet, PressableScale, ProgressBar, Stars, timeAgo, useNativeDriver } from './ui';

const ACTION: Record<PostType, string> = {
  quote: 'alıntı paylaştı',
  review: 'inceleme yazdı',
  reading_update: 'kitap kaydı ekledi',
  thought: '',
};

interface Props {
  post: Post;
  onDeleted?: (id: string) => void;
  /** Yeni oluşturulan paylaşım için giriş animasyonu. */
  highlight?: boolean;
}

export const PostCard: React.FC<Props> = ({ post, onDeleted, highlight }) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const { user } = useAuth();
  const { push, bump } = useApp();
  const { showToast } = useToast();

  const [liked, setLiked] = useState(!!post.is_liked_by_me);
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState(false);
  const heart = useRef(new Animated.Value(1)).current;
  const enter = useRef(new Animated.Value(highlight ? 0 : 1)).current;

  useEffect(() => {
    if (highlight) Animated.spring(enter, { toValue: 1, friction: 8, tension: 60, useNativeDriver }).start();
  }, []);

  const book = post.book ? enrichBook(post.book) : null;
  const author = post.user;
  const isMine = user?.id === post.user_id;
  const openProfile = () => push({ name: 'profile', userId: post.user_id });
  const openBook = () => book && push({ name: 'book', book });

  const like = async () => {
    if (!user) return;
    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    heart.setValue(next ? 0.5 : 0.85);
    Animated.spring(heart, { toValue: 1, friction: 3, tension: 180, useNativeDriver }).start();

    const { isLiked, error } = await postsService.toggleLike(user.id, post.id);
    if (error || isLiked !== next) {
      setLiked(isLiked);
      setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
      if (error) showToast(error, 'error');
    }
  };

  const remove = async () => {
    if (!user) return;
    setMenu(false);
    const { error } = await postsService.deletePost(user.id, post.id);
    if (error) return showToast(error, 'error');
    showToast('Paylaşım silindi', 'info');
    onDeleted?.(post.id);
    bump('profile');
  };

  const isQuote = post.post_type === 'quote';
  const long = post.content.length > (isQuote ? 320 : 260);
  const progress =
    post.post_type === 'reading_update' && post.quote_page && book?.page_count
      ? post.quote_page / book.page_count
      : null;

  return (
    <Animated.View
      style={[
        s.row,
        highlight && { backgroundColor: theme.primarySoft + '55' },
        {
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
        },
      ]}
    >
      <Pressable onPress={openProfile} hitSlop={4}>
        <Avatar name={author?.full_name || author?.username} url={author?.avatar_url} size={40} />
      </Pressable>

      <View style={s.main}>
        {/* Başlık satırı */}
        <View style={s.header}>
          <Text style={s.headerText} numberOfLines={1} onPress={openProfile}>
            <Text style={s.name}>{author?.full_name || author?.username || 'Okur'}</Text>
            {ACTION[post.post_type] ? <Text style={s.action}> {ACTION[post.post_type]}</Text> : null}
          </Text>
          <Text style={s.time}>{timeAgo(post.created_at)}</Text>
          {isMine && (
            <Pressable onPress={() => setMenu(true)} hitSlop={10} accessibilityLabel="Paylaşım seçenekleri">
              <MoreHorizontal size={18} color={theme.textMuted} />
            </Pressable>
          )}
        </View>

        {post.post_type === 'review' && post.review_rating ? (
          <View style={{ marginTop: 4 }}>
            <Stars value={post.review_rating} size={13} />
          </View>
        ) : null}

        {/* İçerik */}
        {isQuote ? (
          <View style={s.quote}>
            <Text style={s.quoteText} numberOfLines={expanded || !long ? undefined : 7}>
              {post.content}
            </Text>
          </View>
        ) : (
          <Text style={s.body} numberOfLines={expanded || !long ? undefined : 6}>
            {post.content}
          </Text>
        )}
        {long && !expanded && (
          <Pressable onPress={() => setExpanded(true)} hitSlop={6}>
            <Text style={s.more}>devamını oku</Text>
          </Pressable>
        )}

        {/* Kitap eki */}
        {book && (
          <PressableScale onPress={openBook} scaleTo={0.98} style={s.book}>
            <BookCover url={book.thumbnail_url} title={book.title} author={book.authors?.[0]} isbn={book.isbn} width={34} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.bookTitle} numberOfLines={1}>
                {book.title}
              </Text>
              <Text style={s.bookAuthor} numberOfLines={1}>
                {[book.authors?.[0], isQuote && post.quote_page ? `s. ${post.quote_page}` : null].filter(Boolean).join(' · ')}
              </Text>
              {progress !== null && (
                <View style={s.progressRow}>
                  <View style={{ flex: 1 }}>
                    <ProgressBar value={progress} height={3} />
                  </View>
                  <Text style={s.progressText}>%{Math.round(progress * 100)}</Text>
                </View>
              )}
            </View>
          </PressableScale>
        )}

        {/* Eylemler */}
        <View style={s.footer}>
          <Pressable
            onPress={like}
            style={[s.likeBtn, liked && { backgroundColor: theme.danger + '18' }]}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={liked ? 'Beğeniyi kaldır' : 'Beğen'}
            accessibilityState={{ selected: liked }}
          >
            <Animated.View style={{ transform: [{ scale: heart }] }}>
              <Heart size={17} color={liked ? theme.danger : theme.textMuted} fill={liked ? theme.danger : 'transparent'} />
            </Animated.View>
            <Text style={[s.likeText, liked && { color: theme.danger }]}>{likes > 0 ? likes : 'Beğen'}</Text>
          </Pressable>
        </View>
      </View>

      <BottomSheet visible={menu} onClose={() => setMenu(false)}>
        <View style={{ padding: 20, gap: 12 }}>
          <Text style={s.menuTitle}>Bu paylaşımı silmek istiyor musun?</Text>
          <PressableScale onPress={remove} style={[s.menuBtn, { backgroundColor: theme.danger }]}>
            <Trash2 size={17} color="#fff" />
            <Text style={[s.menuBtnText, { color: '#fff' }]}>Sil</Text>
          </PressableScale>
          <PressableScale onPress={() => setMenu(false)} style={[s.menuBtn, { backgroundColor: theme.cardAlt }]}>
            <Text style={[s.menuBtnText, { color: theme.text }]}>Vazgeç</Text>
          </PressableScale>
        </View>
      </BottomSheet>
    </Animated.View>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border,
    },
    main: { flex: 1, minWidth: 0 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerText: { flex: 1, fontSize: 14.5 },
    name: { fontWeight: '700', color: t.text },
    action: { color: t.textMuted },
    time: { fontSize: 13, color: t.textMuted },
    body: { fontSize: 15, lineHeight: 22, color: t.text, marginTop: 6 },
    quote: { marginTop: 8, paddingLeft: 12, borderLeftWidth: 2.5, borderLeftColor: t.primary + '88' },
    quoteText: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 16, lineHeight: 25, color: t.text },
    more: { color: t.primary, fontWeight: '600', fontSize: 13.5, marginTop: 4 },
    book: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 12,
      padding: 8,
      paddingRight: 12,
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      backgroundColor: t.card,
    },
    bookTitle: { fontSize: 14, fontWeight: '700', color: t.text },
    bookAuthor: { fontSize: 12.5, color: t.textMuted },
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    progressText: { fontSize: 11.5, fontWeight: '700', color: t.textSoft },
    footer: { flexDirection: 'row', marginTop: 8, marginLeft: -8 },
    likeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.pill,
    },
    likeText: { fontSize: 13, fontWeight: '600', color: t.textMuted },
    menuTitle: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '700', color: t.text, textAlign: 'center', marginBottom: 6 },
    menuBtn: { height: 50, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    menuBtnText: { fontSize: 15, fontWeight: '700' },
  });
