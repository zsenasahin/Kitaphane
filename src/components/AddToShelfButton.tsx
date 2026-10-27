import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Check, ChevronDown, LibraryBig } from 'lucide-react-native';
import { useTheme, useStyles } from '../context/ThemeContext';
import { USER_BOOK_STATUS_LABELS, UserBook } from '../lib/types';
import { fonts, radius, shade, Theme } from '../theme/themes';
import { STATUS_ICONS, statusColor } from './StatusSheet';
import { useNativeDriver } from './ui';

interface Props {
  userBook: UserBook | null;
  pageCount?: number | null;
  busy?: boolean;
  /** Kitaplıkta değilken basılınca çağrılır (ekleme işlemi). */
  onAdd: () => void;
  /** Kitaplıktayken basılınca çağrılır (durum sayfası). */
  onOpenStatus: () => void;
}

/**
 * Kitap sırtı biçiminde buton: altın yaldız bantları, sarkan ayraç kurdelesi.
 * Eklenince kitap minik rafa kayar ve buton okuma durumuna dönüşür.
 */
export const AddToShelfButton: React.FC<Props> = ({ userBook, pageCount, busy, onAdd, onOpenStatus }) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const inShelf = !!userBook;

  const press = useRef(new Animated.Value(0)).current;
  const ribbon = useRef(new Animated.Value(inShelf ? 1 : 0)).current;
  const slide = useRef(new Animated.Value(inShelf ? 1 : 0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const [justAdded, setJustAdded] = useState(false);
  const wasInShelf = useRef(inShelf);

  // Kitaplıkta değilken yaldız üzerinde hafif bir ışıltı dolaşır
  useEffect(() => {
    if (inShelf) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver }),
        Animated.delay(1400),
        Animated.timing(shimmer, { toValue: 0, duration: 0, useNativeDriver }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [inShelf]);

  // Kitaplığa eklendiği an: kurdele düşer, kitap rafa kayar
  useEffect(() => {
    if (inShelf && !wasInShelf.current) {
      setJustAdded(true);
      Animated.sequence([
        Animated.spring(ribbon, { toValue: 1, friction: 4, tension: 90, useNativeDriver }),
        Animated.timing(slide, { toValue: 1, duration: 420, easing: Easing.out(Easing.back(1.4)), useNativeDriver }),
      ]).start(() => setTimeout(() => setJustAdded(false), 900));
    } else if (!inShelf) {
      ribbon.setValue(0);
      slide.setValue(0);
    }
    wasInShelf.current = inShelf;
  }, [inShelf]);

  const pressTo = (v: number) =>
    Animated.spring(press, { toValue: v, friction: 6, tension: 200, useNativeDriver }).start();

  const status = userBook?.status;
  const c = status ? statusColor(theme, status) : theme.primary;
  const base = inShelf ? c : theme.primary;
  const StatusIcon = status ? STATUS_ICONS[status] : LibraryBig;
  const progress =
    status === 'reading' && pageCount ? Math.round(((userBook?.current_page || 0) / pageCount) * 100) : null;

  return (
    <Pressable
      onPressIn={() => pressTo(1)}
      onPressOut={() => pressTo(0)}
      onPress={inShelf ? onOpenStatus : onAdd}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={inShelf ? 'Okuma durumunu değiştir' : 'Kitaplığıma ekle'}
    >
      <Animated.View
        style={{
          transform: [
            { scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] }) },
            { translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, 2] }) },
          ],
        }}
      >
        {/* Ayraç kurdelesi (sırtın arkasından sarkar) */}
        <Animated.View
          style={[
            s.ribbon,
            { transform: [{ translateY: ribbon.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }] },
          ]}
        >
          <Svg width={16} height={30} viewBox="0 0 16 30">
            <Path d="M0 0 H16 V30 L8 23 L0 30 Z" fill={theme.accent} />
          </Svg>
        </Animated.View>
        <View style={[s.spine, { backgroundColor: base }]}>
          {/* Sırt dokusu: üst ışık, alt gölge */}
          <View style={[s.topLight, { backgroundColor: shade(base, 0.25) }]} />
          <View style={[s.bottomShade, { backgroundColor: shade(base, -0.18) }]} />

          {/* Yaldız bantları */}
          <View style={[s.band, { left: 14 }]} />
          <View style={[s.band, { left: 20, width: 1.5 }]} />
          <View style={[s.band, { right: 44 }]} />
          <View style={[s.band, { right: 50, width: 1.5 }]} />

          {/* Işıltı */}
          {!inShelf && (
            <View pointerEvents="none" style={s.shimmerClip}>
              <Animated.View
                style={[
                  s.shimmer,
                  {
                    transform: [
                      { translateX: shimmer.interpolate({ inputRange: [0, 1], outputRange: [-80, 420] }) },
                      { rotate: '20deg' },
                    ],
                  },
                ]}
              />
            </View>
          )}

          <View style={s.content}>
            {busy ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <>
                {/* Minik raf + kayan kitap */}
                <View style={s.miniShelf}>
                  {inShelf ? (
                    <Animated.View
                      style={{
                        transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }],
                        opacity: slide,
                      }}
                    >
                      {justAdded ? <Check size={18} color={theme.onPrimary} /> : <StatusIcon size={18} color={theme.onPrimary} />}
                    </Animated.View>
                  ) : (
                    <LibraryBig size={18} color={theme.onPrimary} />
                  )}
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Text style={s.label} numberOfLines={1}>
                    {justAdded ? 'Rafa yerleşti!' : inShelf ? USER_BOOK_STATUS_LABELS[status!] : 'Kitaplığıma Ekle'}
                  </Text>
                  {inShelf && !justAdded && (
                    <Text style={s.sub} numberOfLines={1}>
                      {progress !== null ? `%${progress} tamamlandı · ` : ''}değiştir
                    </Text>
                  )}
                </View>
                {inShelf && !justAdded && <ChevronDown size={16} color={theme.onPrimary} style={{ opacity: 0.8 }} />}
              </>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    spine: {
      height: 60,
      borderRadius: radius.sm,
      overflow: 'visible',
      justifyContent: 'center',
      shadowColor: t.dark ? '#000' : t.text,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: t.dark ? 0.5 : 0.18,
      shadowRadius: 12,
      elevation: 6,
    },
    topLight: { position: 'absolute', top: 0, left: 0, right: 0, height: 10, borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm, opacity: 0.5 },
    bottomShade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, borderBottomLeftRadius: radius.sm, borderBottomRightRadius: radius.sm, opacity: 0.6 },
    band: { position: 'absolute', top: 0, bottom: 0, width: 3, backgroundColor: 'rgba(255, 236, 190, 0.55)' },
    shimmerClip: { ...StyleSheet.absoluteFill, borderRadius: radius.sm, overflow: 'hidden' },
    shimmer: { position: 'absolute', top: -20, bottom: -20, width: 36, backgroundColor: 'rgba(255,255,255,0.22)' },
    content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 60 },
    miniShelf: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    label: { fontFamily: fonts.serif, fontSize: 17, fontWeight: '700', color: t.onPrimary, letterSpacing: 0.3 },
    sub: { fontSize: 11, color: t.onPrimary, opacity: 0.85, marginTop: 1 },
    ribbon: { position: 'absolute', right: 18, top: 52 },
  });
