import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { onboardingColors } from './onboardingTheme';
import { BotanicalCoverSvg } from './BotanicalCoverSvg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOOK_WIDTH = Math.min(SCREEN_WIDTH * 0.64, 250);
const BOOK_HEIGHT = BOOK_WIDTH * 1.38;
const BOOK_THICKNESS = BOOK_WIDTH * 0.16; // Kitap sayfa bloğu kalınlığı

interface Book3DProps {
  scale?: number;
  rotateYDeg?: number;
  coverOpenAngle?: number; // 0 kapalı, -120 tamamen açık
}

export const Book3D: React.FC<Book3DProps> = ({
  scale = 1,
  rotateYDeg = -22,
  coverOpenAngle = 0,
}) => {
  return (
    <View style={[styles.rootContainer, { transform: [{ scale }] }]}>
      {/* Zemin / Masa Temas ve Difüz Gölgeleri */}
      <View style={styles.shadowContainer}>
        {/* Geniş yumuşak difüz gölge */}
        <View style={styles.ambientShadow} />
        {/* Kitabın tam taban temas gölgesi */}
        <View style={styles.contactShadow} />
      </View>

      {/* 3D Kitap Yapısı (Perspektif Sahnesi) */}
      <View style={styles.scene3D}>
        {/* Kitap Bütünsel 3D Grubu (Perspektif ve Kamera Açısı) */}
        <View
          style={[
            styles.bookAnchor,
            {
              transform: [
                { perspective: 1200 },
                { rotateY: `${rotateYDeg}deg` },
                { rotateX: '5deg' },
              ],
            },
          ]}
        >
          {/* 1. ARKA CİLT KAPAĞI (Back Cover) - Sayfalardan 3px daha geniş */}
          <View style={styles.backCover} />

          {/* 2. KALIN SAYFA BLOĞU (Page Block Thickness - Sağ ve Alt Kenarlar) */}
          <View style={styles.pageBlockWrapper}>
            {/* Sayfa Katmanları / Kağıt Çizgileri */}
            <View style={styles.pageBlockSurface}>
              {Array.from({ length: 18 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pageLayerLine,
                    {
                      backgroundColor:
                        i % 2 === 0
                          ? onboardingColors.pageBlockBase
                          : onboardingColors.pageBlockLine,
                      height: BOOK_HEIGHT / 22,
                    },
                  ]}
                />
              ))}
              {/* Sayfa bloğu ışık parıltısı ve derinlik gölgesi */}
              <View style={styles.pageBlockHighlightOverlay} />
              <View style={styles.pageBlockInnerShadow} />
            </View>

            {/* Alt Sayfa Bloğu Kenarı (Görünür alt derinlik) */}
            <View style={styles.pageBlockBottomSurface} />
          </View>

          {/* 3. KİTABIN SIRTI (Book Spine - Sol Kenar) */}
          <View style={styles.spine}>
            {/* Sırt Dikiş Kabartma Şeritleri (Spine Ribs) */}
            <View style={styles.spineRibTop} />
            <View style={styles.spineRibUpper} />
            <View style={styles.spineRibLower} />
            <View style={styles.spineRibBottom} />

            {/* Sırt Altın Yaldız Çizgileri */}
            <View style={styles.spineGoldLine1} />
            <View style={styles.spineGoldLine2} />
            <View style={styles.spineGoldLine3} />

            {/* Sırt Silindirik Yuvarlaklık Işığı */}
            <View style={styles.spineLightHighlight} />
            <View style={styles.spineShadowEdge} />
          </View>

          {/* 4. ÖN KAPAK (Front Cover) - Açılabilen Kapak Katmanı */}
          <View
            style={[
              styles.frontCoverWrapper,
              {
                transform: [
                  { rotateY: `${coverOpenAngle}deg` },
                ],
              },
            ]}
          >
            {/* Kapak Cilt Tabanı */}
            <View style={styles.frontCoverBase}>
              {/* Vektörel Botanik İllüstrasyon ve Yaldızlar */}
              <BotanicalCoverSvg width={BOOK_WIDTH} height={BOOK_HEIGHT} />

              {/* Gerçekçi Kapak Cilt Dikiş Oluk Gölgeleri */}
              <View style={styles.hingeCrease} />
              <View style={styles.hingeHighlight} />

              {/* Kapak Dış Kenar Vurgusu (Hardcover Trim Edge) */}
              <View style={styles.hardcoverEdgeTrim} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: BOOK_WIDTH + 100,
    height: BOOK_HEIGHT + 120,
  },
  shadowContainer: {
    position: 'absolute',
    bottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientShadow: {
    width: BOOK_WIDTH * 1.5,
    height: 38,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 18, 10, 0.18)',
    transform: [{ scaleX: 1.2 }],
  },
  contactShadow: {
    position: 'absolute',
    bottom: 4,
    left: 20,
    width: BOOK_WIDTH * 1.1,
    height: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 8, 4, 0.45)',
    transform: [{ rotate: '-4deg' }],
  },
  scene3D: {
    width: BOOK_WIDTH + 60,
    height: BOOK_HEIGHT + 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookAnchor: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    position: 'relative',
  },

  // 1. Arka Kapak
  backCover: {
    position: 'absolute',
    left: -4,
    top: -2,
    width: BOOK_WIDTH + 6,
    height: BOOK_HEIGHT + 5,
    borderRadius: 7,
    backgroundColor: onboardingColors.coverLeatherDark,
    borderWidth: 1,
    borderColor: '#1A0E08',
    shadowColor: '#000',
    shadowOffset: { width: -6, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },

  // 2. Kalın Sayfa Bloğu (Page Block)
  pageBlockWrapper: {
    position: 'absolute',
    right: -BOOK_THICKNESS + 6,
    top: 4,
    width: BOOK_THICKNESS,
    height: BOOK_HEIGHT - 6,
    zIndex: 2,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
    backgroundColor: onboardingColors.pageBlockBase,
    borderWidth: 0.5,
    borderColor: onboardingColors.pageBlockShadow,
  },
  pageBlockSurface: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  pageLayerLine: {
    width: '100%',
    opacity: 0.85,
  },
  pageBlockHighlightOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pageBlockInnerShadow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(50, 30, 15, 0.28)',
  },
  pageBlockBottomSurface: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: onboardingColors.pageBlockShadow,
  },

  // 3. Kitap Sırtı (Spine)
  spine: {
    position: 'absolute',
    left: -22,
    top: -2,
    width: 25,
    height: BOOK_HEIGHT + 5,
    backgroundColor: onboardingColors.coverSpine,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.4)',
    overflow: 'hidden',
    zIndex: 5,
  },
  spineRibTop: {
    position: 'absolute',
    top: 36,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: onboardingColors.coverLeatherDark,
    borderTopWidth: 1,
    borderTopColor: onboardingColors.coverSpineHighlight,
    borderBottomWidth: 1,
    borderBottomColor: '#120904',
  },
  spineRibUpper: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: onboardingColors.coverLeatherDark,
    borderTopWidth: 1,
    borderTopColor: onboardingColors.coverSpineHighlight,
    borderBottomWidth: 1,
    borderBottomColor: '#120904',
  },
  spineRibLower: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: onboardingColors.coverLeatherDark,
    borderTopWidth: 1,
    borderTopColor: onboardingColors.coverSpineHighlight,
    borderBottomWidth: 1,
    borderBottomColor: '#120904',
  },
  spineRibBottom: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: onboardingColors.coverLeatherDark,
    borderTopWidth: 1,
    borderTopColor: onboardingColors.coverSpineHighlight,
    borderBottomWidth: 1,
    borderBottomColor: '#120904',
  },
  spineGoldLine1: {
    position: 'absolute',
    top: 45,
    left: 4,
    right: 4,
    height: 1,
    backgroundColor: onboardingColors.goldFoil,
    opacity: 0.8,
  },
  spineGoldLine2: {
    position: 'absolute',
    top: BOOK_HEIGHT / 2 - 1,
    left: 4,
    right: 4,
    height: 1.5,
    backgroundColor: onboardingColors.goldFoil,
    opacity: 0.8,
  },
  spineGoldLine3: {
    position: 'absolute',
    bottom: 45,
    left: 4,
    right: 4,
    height: 1,
    backgroundColor: onboardingColors.goldFoil,
    opacity: 0.8,
  },
  spineLightHighlight: {
    position: 'absolute',
    left: 7,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  spineShadowEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },

  // 4. Ön Kapak (Front Cover)
  frontCoverWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    zIndex: 10,
    transformOrigin: 'left center',
  },
  frontCoverBase: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    borderRadius: 7,
    backgroundColor: onboardingColors.coverLeather,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 12 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 8,
  },
  hingeCrease: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    width: 3.5,
    backgroundColor: 'rgba(15, 8, 4, 0.5)',
  },
  hingeHighlight: {
    position: 'absolute',
    left: 23.5,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  hardcoverEdgeTrim: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
