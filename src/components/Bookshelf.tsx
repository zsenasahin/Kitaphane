import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { UserBook } from '../lib/types';
import { fonts, hashString, shade, Theme } from '../theme/themes';
import { useNativeDriver } from './ui';

const SHELF_INNER = 152; // bir rafın iç yüksekliği
const BOARD = 14; // raf tahtası kalınlığı
const FRAME = 12; // dolap yan kasası
const GAP = 2; // kitaplar arası boşluk
const MIN_SHELVES = 4;
const CASE_MARGIN = 12;

interface SpineInfo {
  ub: UserBook;
  width: number;
  height: number;
  color: string;
  pattern: number;
}

const spineFor = (ub: UserBook, t: Theme): SpineInfo => {
  const seed = hashString((ub.book?.title || '') + ub.book_id);
  const pages = ub.book?.page_count || 0;
  const width = pages ? Math.max(20, Math.min(42, 14 + pages / 18)) : 22 + (seed % 12);
  const height = 106 + ((seed >> 3) % 6) * 7;
  return { ub, width: Math.round(width), height, color: t.spines[seed % t.spines.length], pattern: (seed >> 5) % 4 };
};

/* ------------------------------------------------------------------ */
/* Kitap sırtı                                                         */
/* ------------------------------------------------------------------ */
const BookSpine: React.FC<{ info: SpineInfo; onPress: () => void; index: number }> = ({ info, onPress, index }) => {
  const { width: w, height: h, color, pattern, ub } = info;
  const ink = shade(color, -0.6);
  const lift = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      delay: Math.min(index, 20) * 35,
      easing: Easing.out(Easing.back(1.6)),
      useNativeDriver,
    }).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(lift, { toValue: 1, duration: 170, easing: Easing.out(Easing.quad), useNativeDriver }),
      Animated.timing(lift, { toValue: 0, duration: 260, delay: 220, useNativeDriver }),
    ]).start();
    setTimeout(onPress, 150);
  };

  const band = (top: number, hgt: number, c = ink, o = 0.28) => (
    <View style={{ position: 'absolute', left: 0, right: 0, top, height: hgt, backgroundColor: c, opacity: o }} />
  );

  return (
    <Pressable onPress={handlePress} accessibilityRole="button" accessibilityLabel={ub.book?.title}>
      <Animated.View
        style={{
          width: w,
          height: h,
          marginRight: GAP,
          opacity: enter,
          transform: [
            { translateY: Animated.add(lift.interpolate({ inputRange: [0, 1], outputRange: [0, -22] }), enter.interpolate({ inputRange: [0, 1], outputRange: [30, 0] })) },
            { rotate: lift.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-4deg'] }) },
          ],
        }}
      >
        <View style={[styles.spine, { backgroundColor: color, borderColor: shade(color, -0.12) }]}>
          {/* hacim: sol ışık, sağ gölge */}
          <View style={[styles.spineLight, { backgroundColor: shade(color, 0.35) }]} />
          <View style={[styles.spineShade, { backgroundColor: shade(color, -0.2) }]} />

          {pattern === 0 && (
            <>
              {band(10, 2)}
              {band(15, 1)}
              {band(h - 17, 1)}
              {band(h - 12, 2)}
            </>
          )}
          {pattern === 1 && (
            <>
              {band(0, 20, shade(color, -0.22), 0.6)}
              {band(22, 2, ink, 0.25)}
            </>
          )}
          {pattern === 2 && (
            <>
              {band(8, 3, '#FFF5DD', 0.7)}
              {band(h - 11, 3, '#FFF5DD', 0.7)}
            </>
          )}
          {pattern === 3 && (
            <View style={[styles.emblem, { bottom: 10, left: w / 2 - 4, backgroundColor: ink, opacity: 0.3 }]} />
          )}

          {/* yana yazılmış başlık */}
          <View
            style={{
              position: 'absolute',
              width: h - 36,
              height: w,
              left: (w - (h - 36)) / 2,
              top: (h - w) / 2,
              transform: [{ rotate: '-90deg' }],
              justifyContent: 'center',
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.serif,
                fontSize: Math.max(8, Math.min(11.5, w * 0.42, (h - 36) / ((ub.book?.title.length || 10) * 0.56))),
                fontWeight: '700',
                color: ink,
                textAlign: 'center',
              }}
            >
              {ub.book?.title}
            </Text>
          </View>
        </View>

        {/* okunmakta olan kitapta ayraç */}
        {ub.status === 'reading' && (
          <Svg width={8} height={22} style={{ position: 'absolute', top: -8, right: 4 }}>
            <Path d="M0 0 H8 V22 L4 18 L0 22 Z" fill="#E88A7A" />
          </Svg>
        )}
      </Animated.View>
    </Pressable>
  );
};

/* ------------------------------------------------------------------ */
/* Raf süsleri                                                         */
/* ------------------------------------------------------------------ */
const Decor: React.FC<{ kind: number }> = ({ kind }) => {
  switch (kind % 5) {
    case 0: // saksıda bitki
      return (
        <Svg width={46} height={74} viewBox="0 0 46 74">
          <Path d="M23 40 C 10 30, 6 14, 12 6 C 18 16, 22 26, 23 40 Z" fill="#9CC5A1" />
          <Path d="M23 40 C 34 28, 40 16, 36 4 C 28 14, 24 26, 23 40 Z" fill="#7FB08A" />
          <Path d="M23 42 C 16 34, 4 34, 2 26 C 12 26, 20 32, 23 42 Z" fill="#B4D6B0" />
          <Path d="M23 42 C 30 34, 42 34, 44 28 C 34 26, 26 32, 23 42 Z" fill="#A8CFA6" />
          <Path d="M9 44 H37 L33 74 H13 Z" fill="#E9A88F" />
          <Rect x={7} y={42} width={32} height={7} rx={2} fill="#F2BDA6" />
        </Svg>
      );
    case 1: // elma
      return (
        <Svg width={40} height={44} viewBox="0 0 40 44">
          <Path d="M20 12 C 20 6, 22 3, 25 1" stroke="#7A5236" strokeWidth={2} fill="none" />
          <Path d="M22 7 C 26 2, 32 3, 33 6 C 29 9, 25 9, 22 7 Z" fill="#9CC5A1" />
          <Path d="M20 13 C 10 6, 1 12, 2 24 C 3 36, 12 44, 20 41 C 28 44, 37 36, 38 24 C 39 12, 30 6, 20 13 Z" fill="#EE9A91" />
          <Ellipse cx={12} cy={20} rx={3} ry={5} fill="#FFFFFF" opacity={0.35} />
        </Svg>
      );
    case 2: // mum
      return (
        <Svg width={30} height={70} viewBox="0 0 30 70">
          <Path d="M15 4 C 19 10, 19 16, 15 18 C 11 16, 11 10, 15 4 Z" fill="#F7C873" />
          <Path d="M15 9 C 17 12, 17 15, 15 16 C 13 15, 13 12, 15 9 Z" fill="#FFF1C9" />
          <Rect x={14} y={17} width={2} height={5} fill="#5A4030" />
          <Rect x={7} y={22} width={16} height={42} rx={3} fill="#FBF3E4" />
          <Rect x={3} y={62} width={24} height={8} rx={3} fill="#D9B48C" />
        </Svg>
      );
    case 3: // kitap desteği + küçük yatık kitaplar
      return (
        <Svg width={58} height={46} viewBox="0 0 58 46">
          <Rect x={2} y={34} width={54} height={12} rx={2} fill="#C7CEEA" />
          <Rect x={6} y={24} width={46} height={10} rx={2} fill="#F7DDB5" />
          <Rect x={4} y={14} width={50} height={10} rx={2} fill="#F2B8C6" />
          <Rect x={10} y={17} width={20} height={2} fill="#FFFFFF" opacity={0.6} />
        </Svg>
      );
    default: // kum saati / küre
      return (
        <Svg width={40} height={60} viewBox="0 0 40 60">
          <Circle cx={20} cy={22} r={18} fill="#B9D3E3" />
          <Path d="M8 14 C 14 18, 18 12, 24 16 C 28 20, 32 16, 36 20" stroke="#9CC5A1" strokeWidth={5} fill="none" strokeLinecap="round" />
          <Path d="M6 28 C 12 26, 16 32, 22 30" stroke="#9CC5A1" strokeWidth={4} fill="none" strokeLinecap="round" />
          <Rect x={18} y={40} width={4} height={10} fill="#A7845F" />
          <Rect x={8} y={50} width={24} height={8} rx={3} fill="#C79E74" />
        </Svg>
      );
  }
};

const DECOR_WIDTH = [46, 40, 30, 58, 40];

/* ------------------------------------------------------------------ */
/* Raf (arka panel + tahta)                                            */
/* ------------------------------------------------------------------ */
const ShelfBack: React.FC<{ width: number; t: Theme; seed: number }> = ({ width, t, seed }) => (
  <Svg width={width} height={SHELF_INNER} style={StyleSheet.absoluteFill}>
    <Defs>
      <LinearGradient id={`h${seed}`} x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor={t.woodBackDeep} />
        <Stop offset="0.18" stopColor={t.woodBack} />
        <Stop offset="0.82" stopColor={t.woodBack} />
        <Stop offset="1" stopColor={t.woodBackDeep} />
      </LinearGradient>
      <LinearGradient id={`v${seed}`} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#000" stopOpacity={t.dark ? 0.55 : 0.35} />
        <Stop offset="0.3" stopColor="#000" stopOpacity={0} />
      </LinearGradient>
    </Defs>
    <Rect x={0} y={0} width={width} height={SHELF_INNER} fill={`url(#h${seed})`} />
    {/* ahşap damarları */}
    {Array.from({ length: 9 }).map((_, i) => {
      const y = 12 + i * 16 + ((seed * (i + 3)) % 7);
      const x = (seed * (i + 1) * 13) % Math.max(1, width * 0.4);
      return (
        <Path
          key={i}
          d={`M${x} ${y} C ${x + width * 0.2} ${y - 3}, ${x + width * 0.35} ${y + 3}, ${x + width * 0.6} ${y}`}
          stroke={shade(t.woodBack, -0.25)}
          strokeWidth={1}
          opacity={0.45}
          fill="none"
        />
      );
    })}
    <Rect x={0} y={0} width={width} height={SHELF_INNER} fill={`url(#v${seed})`} />
  </Svg>
);

const ShelfBoard: React.FC<{ t: Theme }> = ({ t }) => (
  <View style={{ height: BOARD, backgroundColor: t.woodShelf }}>
    <View style={{ height: 3, backgroundColor: shade(t.woodShelf, 0.18) }} />
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: shade(t.woodShelf, -0.18) }} />
  </View>
);

/* ------------------------------------------------------------------ */
/* Kitaplık                                                            */
/* ------------------------------------------------------------------ */
interface BookshelfProps {
  books: UserBook[];
  onBookPress: (ub: UserBook) => void;
  emptySlot?: React.ReactNode;
}

export const Bookshelf: React.FC<BookshelfProps> = ({ books, onBookPress, emptySlot }) => {
  const { theme: t } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth, 720) - CASE_MARGIN * 2;
  const inner = Math.max(0, width - FRAME * 2 - 16);

  const shelves = useMemo(() => {
    if (!inner) return [] as SpineInfo[][];
    const rows: SpineInfo[][] = [[]];
    let used = 0;
    for (const ub of books) {
      const info = spineFor(ub, t);
      if (used + info.width + GAP > inner && rows[rows.length - 1].length) {
        rows.push([]);
        used = 0;
      }
      rows[rows.length - 1].push(info);
      used += info.width + GAP;
    }
    while (rows.length < MIN_SHELVES) rows.push([]);
    return rows;
  }, [books, inner, t]);

  let index = 0;
  return (
    <View style={[styles.case, { width, backgroundColor: t.woodFrame }]}>
      {/* üst kornişi */}
      <View style={[styles.crown, { backgroundColor: t.woodFrameLight }]} />
      {width > 0 &&
        shelves.map((row, r) => {
          const used = row.reduce((a, b) => a + b.width + GAP, 0);
          const free = inner - used;
          const decorKind = (r * 3 + books.length) % 5;
          const showDecor = free > DECOR_WIDTH[decorKind] + 12 && (row.length > 0 ? r % 2 === 0 : true);
          const decorLeft = row.length === 0 && r % 2 === 1;
          return (
            <View key={r}>
              <View style={[styles.compartment, { marginHorizontal: FRAME }]}>
                <ShelfBack width={width - FRAME * 2} t={t} seed={r + 1} />
                <View style={styles.row}>
                  {decorLeft && showDecor && <Decor kind={decorKind} />}
                  {row.map((info) => (
                    <BookSpine key={info.ub.id} info={info} index={index++} onPress={() => onBookPress(info.ub)} />
                  ))}
                  {r === 0 && books.length === 0 && emptySlot}
                  <View style={{ flex: 1 }} />
                  {!decorLeft && showDecor && !(r === 0 && books.length === 0) && <Decor kind={decorKind} />}
                </View>
              </View>
              <View style={{ marginHorizontal: FRAME / 2 }}>
                <ShelfBoard t={t} />
              </View>
            </View>
          );
        })}
      <View style={[styles.base, { backgroundColor: t.woodFrameLight }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  case: {
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#2A1A10',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  crown: { height: 14 },
  compartment: { height: SHELF_INNER, overflow: 'visible' },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  base: { height: 18 },
  spine: {
    flex: 1,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  spineLight: { position: 'absolute', left: 1, top: 0, bottom: 0, width: 2, opacity: 0.7 },
  spineShade: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, opacity: 0.6 },
  emblem: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
});
