import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, Library, Plus, Search, UserRound } from 'lucide-react-native';
import { AppContext, AppContextType, DataVersions, Route, TabName } from '../../context/AppContext';
import { useStyles, useTheme } from '../../context/ThemeContext';
import { Book, PostType } from '../../lib/types';
import { fonts, radius, shadow, Theme } from '../../theme/themes';
import { useNativeDriver } from '../../components/ui';
import { StatusSheet } from '../../components/StatusSheet';
import { HomeScreen } from './HomeScreen';
import { SearchScreen } from './SearchScreen';
import { LibraryScreen } from './LibraryScreen';
import { ProfileScreen } from './ProfileScreen';
import { BookDetailScreen } from './BookDetailScreen';
import { AuthorScreen } from './AuthorScreen';
import { FollowsScreen } from './FollowsScreen';
import { SettingsScreen } from './SettingsScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { COMPOSE_TYPES, ComposerModal } from './ComposerModal';

const BAR_HEIGHT = 66;
const FAB = 58;
// Menü öğesinin alt kenarından daire merkezine uzaklık (daire 64 + etiket)
const ITEM_CIRCLE_OFFSET = 55;

const TABS: { id: TabName; label: string; icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }> }[] = [
  { id: 'home', label: 'Anasayfa', icon: House },
  { id: 'search', label: 'Arama', icon: Search },
  { id: 'library', label: 'Kitaplık', icon: Library },
  { id: 'profile', label: 'Profil', icon: UserRound },
];

interface StackEntry {
  key: number;
  route: Route;
}

export const MainContainer: React.FC = () => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [tab, setTab] = useState<TabName>('home');
  const [visited, setVisited] = useState<Set<TabName>>(new Set(['home']));
  const [stack, setStack] = useState<StackEntry[]>([]);
  const [versions, setVersions] = useState<DataVersions>({ library: 0, posts: 0, profile: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [composer, setComposer] = useState<{ visible: boolean; type: PostType; book: Book | null }>({
    visible: false,
    type: 'quote',
    book: null,
  });
  const [statusBook, setStatusBook] = useState<Book | null>(null);
  const keyRef = useRef(0);
  const popRef = useRef<Map<number, () => void>>(new Map());

  const goTab = useCallback((t: TabName) => {
    setStack([]);
    setTab(t);
    setVisited((v) => (v.has(t) ? v : new Set(v).add(t)));
  }, []);

  const push = useCallback((route: Route) => {
    setStack((st) => [...st, { key: ++keyRef.current, route }]);
  }, []);

  // Üstteki sayfa kayarak kapanır, ardından yığından çıkarılır
  const pop = useCallback(() => {
    setStack((st) => {
      const top = st[st.length - 1];
      if (top) popRef.current.get(top.key)?.();
      return st;
    });
  }, []);

  const removeEntry = useCallback((key: number) => {
    popRef.current.delete(key);
    setStack((st) => st.filter((e) => e.key !== key));
  }, []);

  const bump = useCallback((...kinds: Array<keyof DataVersions>) => {
    setVersions((v) => {
      const next = { ...v };
      kinds.forEach((k) => (next[k] += 1));
      return next;
    });
  }, []);

  const openComposer = useCallback((type: PostType = 'quote', book: Book | null = null) => {
    setMenuOpen(false);
    setComposer({ visible: true, type, book });
  }, []);

  const openStatusSheet = useCallback((book: Book) => setStatusBook(book), []);

  const ctx: AppContextType = useMemo(
    () => ({ push, pop, goTab, openComposer, openStatusSheet, versions, bump }),
    [push, pop, goTab, openComposer, openStatusSheet, versions, bump]
  );

  // Android geri tuşu
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuOpen) {
        setMenuOpen(false);
        return true;
      }
      if (stack.length > 0) {
        pop();
        return true;
      }
      if (tab !== 'home') {
        goTab('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [menuOpen, stack.length, tab]);

  const renderRoute = (route: Route, onBack: () => void) => {
    switch (route.name) {
      case 'book':
        return <BookDetailScreen book={route.book} onBack={onBack} />;
      case 'profile':
        return <ProfileScreen userId={route.userId} onBack={onBack} />;
      case 'author':
        return <AuthorScreen author={route.author} authorKey={route.authorKey} onBack={onBack} />;
      case 'follows':
        return <FollowsScreen userId={route.userId} mode={route.mode} onBack={onBack} />;
      case 'settings':
        return <SettingsScreen onBack={onBack} />;
      case 'editProfile':
        return <EditProfileScreen onBack={onBack} />;
    }
  };

  const barBottom = Math.max(insets.bottom, 12);

  return (
    <AppContext.Provider value={ctx}>
      <View style={s.root}>
        {/* Sekmeler (ziyaret edilenler canlı tutulur) */}
        <View style={s.screens}>
          {(['home', 'search', 'library', 'profile'] as TabName[]).map((t) =>
            visited.has(t) ? (
              <View
                key={t}
                style={[StyleSheet.absoluteFill, { top: t === 'profile' ? 0 : insets.top }, t !== tab && s.hidden]}
              >
                {t === 'home' && <HomeScreen />}
                {t === 'search' && <SearchScreen />}
                {t === 'library' && <LibraryScreen />}
                {t === 'profile' && <ProfileScreen />}
              </View>
            ) : null
          )}
        </View>

        {/* Alt bar */}
        <View style={[s.bar, { bottom: barBottom }]}>
          {TABS.slice(0, 2).map((t) => (
            <TabButton key={t.id} item={t} active={tab === t.id && stack.length === 0} onPress={() => goTab(t.id)} />
          ))}
          <View style={{ width: FAB + 16 }} />
          {TABS.slice(2).map((t) => (
            <TabButton key={t.id} item={t} active={tab === t.id && stack.length === 0} onPress={() => goTab(t.id)} />
          ))}
        </View>

        {/* Paylaşım menüsü */}
        <ComposeMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onSelect={(type) => openComposer(type)}
          fabBottom={barBottom + BAR_HEIGHT / 2 - FAB / 2 + 14}
          width={width}
        />
        <Fab open={menuOpen} onPress={() => setMenuOpen((o) => !o)} bottom={barBottom + BAR_HEIGHT / 2 - FAB / 2 + 14} />

        {/* Sayfa yığını */}
        {stack.map((entry) => (
          <StackPage
            key={entry.key}
            width={width}
            register={(fn) => popRef.current.set(entry.key, fn)}
            onClosed={() => removeEntry(entry.key)}
          >
            {(close) => renderRoute(entry.route, close)}
          </StackPage>
        ))}

        <ComposerModal
          visible={composer.visible}
          initialType={composer.type}
          initialBook={composer.book}
          onClose={() => setComposer((c) => ({ ...c, visible: false }))}
          onPosted={() => {
            bump('posts', 'profile', 'library');
            if (stack.length === 0) goTab('home');
          }}
        />
        <StatusSheet
          book={statusBook}
          onClose={() => setStatusBook(null)}
          onChanged={() => bump('library', 'profile', 'posts')}
        />
      </View>
    </AppContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
const TabButton: React.FC<{
  item: (typeof TABS)[number];
  active: boolean;
  onPress: () => void;
}> = ({ item, active, onPress }) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: active ? 1 : 0, friction: 7, tension: 120, useNativeDriver }).start();
  }, [active]);
  const Icon = item.icon;
  return (
    <Pressable onPress={onPress} style={s.tab} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{ selected: active }}>
      <Animated.View
        style={[
          s.tabPill,
          {
            opacity: anim,
            transform: [{ scaleX: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
          },
        ]}
      />
      <Animated.View style={{ transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }}>
        <Icon size={22} color={active ? theme.primary : theme.textMuted} strokeWidth={active ? 2.4 : 2} />
      </Animated.View>
      <Animated.Text
        style={[
          s.tabLabel,
          {
            opacity: anim,
            transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          },
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Animated.Text>
    </Pressable>
  );
};

/* ------------------------------------------------------------------ */
/* Ortadaki + butonu                                                   */
/* ------------------------------------------------------------------ */
const Fab: React.FC<{ open: boolean; onPress: () => void; bottom: number }> = ({ open, onPress, bottom }) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const rot = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(rot, { toValue: open ? 1 : 0, friction: 6, tension: 90, useNativeDriver }).start();
  }, [open]);
  return (
    <View style={[s.fabWrap, { bottom }]} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(press, { toValue: 0.9, useNativeDriver, friction: 6, tension: 200 }).start()}
        onPressOut={() => Animated.spring(press, { toValue: 1, useNativeDriver, friction: 4, tension: 160 }).start()}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Menüyü kapat' : 'Yeni paylaşım'}
      >
        <Animated.View
          style={[
            s.fab,
            {
              backgroundColor: theme.primary,
              transform: [
                { scale: press },
                { rotate: rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '135deg'] }) },
              ],
            },
          ]}
        >
          <Plus size={28} color={theme.onPrimary} strokeWidth={2.6} />
        </Animated.View>
      </Pressable>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* + butonundan yay şeklinde açılan paylaşım seçenekleri               */
/* ------------------------------------------------------------------ */
const ComposeMenu: React.FC<{
  open: boolean;
  onClose: () => void;
  onSelect: (t: PostType) => void;
  fabBottom: number;
  width: number;
}> = ({ open, onClose, onSelect, fabBottom, width }) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const backdrop = useRef(new Animated.Value(0)).current;
  const items = useRef(COMPOSE_TYPES.map(() => new Animated.Value(0))).current;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver }),
        Animated.stagger(
          55,
          items.map((v) => Animated.spring(v, { toValue: 1, friction: 6, tension: 70, useNativeDriver }))
        ),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver }),
        ...items.map((v) => Animated.timing(v, { toValue: 0, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver })),
      ]).start(() => setMounted(false));
    }
  }, [open]);

  if (!mounted) return null;

  // Yay üzerindeki konumlar (+ butonunun merkezine göre)
  const R = Math.min(140, width * 0.34);
  const LIFT = 64; // yayın merkezini + butonunun biraz üstüne taşır
  const angles = [162, 120, 60, 18];
  const tints: Record<PostType, string> = {
    quote: theme.quoteBg,
    review: theme.reviewBg,
    reading_update: theme.updateBg,
    thought: theme.accentSoft,
  };
  const centerY = fabBottom + FAB / 2;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlay, opacity: backdrop }]} />
      </TouchableWithoutFeedback>

      <Animated.Text
        style={[
          s.menuTitle,
          {
            bottom: centerY + LIFT + R + 50,
            opacity: backdrop,
            transform: [{ translateY: backdrop.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          },
        ]}
      >
        Ne paylaşmak istersin?
      </Animated.Text>

      {COMPOSE_TYPES.map((ct, i) => {
        const a = (angles[i] * Math.PI) / 180;
        const dx = Math.cos(a) * R;
        const dy = Math.sin(a) * R + LIFT;
        const v = items[i];
        return (
          <Animated.View
            key={ct.id}
            style={[
              s.menuItem,
              {
                left: width / 2 - 48,
                bottom: centerY - ITEM_CIRCLE_OFFSET,
                opacity: v,
                transform: [
                  { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
                  { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -dy] }) },
                  { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
                ],
              },
            ]}
          >
            <Pressable onPress={() => onSelect(ct.id)} style={{ alignItems: 'center' }} accessibilityRole="button" accessibilityLabel={ct.label}>
              <View style={[s.menuCircle, { backgroundColor: tints[ct.id] }]}>
                <ct.icon size={26} color={theme.text} />
              </View>
              <Text style={s.menuLabel}>{ct.label}</Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Sağdan kayarak açılan sayfa                                         */
/* ------------------------------------------------------------------ */
const StackPage: React.FC<{
  width: number;
  register: (close: () => void) => void;
  onClosed: () => void;
  children: (close: () => void) => React.ReactNode;
}> = ({ width, register, onClosed, children }) => {
  const { theme } = useTheme();
  const x = useRef(new Animated.Value(width)).current;

  const close = useCallback(() => {
    Animated.timing(x, { toValue: width, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver }).start(onClosed);
  }, [width]);

  useEffect(() => {
    register(close);
    Animated.timing(x, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver }).start();
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: theme.bg,
          transform: [{ translateX: x }],
          shadowColor: '#000',
          shadowOffset: { width: -6, height: 0 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 12,
        },
      ]}
    >
      {children(close)}
    </Animated.View>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.bg },
    screens: { flex: 1 },
    hidden: { display: 'none' },
    bar: {
      position: 'absolute',
      left: 14,
      right: 14,
      height: BAR_HEIGHT,
      borderRadius: radius.xl,
      backgroundColor: t.card,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      borderWidth: 1,
      borderColor: t.border,
      ...shadow(t, 3),
    },
    tab: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
    tabPill: {
      position: 'absolute',
      top: 8,
      bottom: 8,
      left: 4,
      right: 4,
      borderRadius: radius.lg,
      backgroundColor: t.primarySoft,
    },
    tabLabel: { fontSize: 10.5, fontWeight: '800', color: t.primary, marginTop: 2 },
    fabWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
    fab: {
      width: FAB,
      height: FAB,
      borderRadius: FAB / 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: t.bg,
      ...shadow(t, 3),
    },
    menuTitle: {
      position: 'absolute',
      left: 0,
      right: 0,
      textAlign: 'center',
      fontFamily: fonts.serif,
      fontSize: 22,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    menuItem: { position: 'absolute', width: 96, alignItems: 'center' },
    menuCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.85)',
      ...shadow(t, 2),
    },
    menuLabel: { marginTop: 6, fontSize: 13.5, fontWeight: '800', color: '#FFFFFF' },
  });
