import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { onboardingColors } from './onboardingTheme';
import { Book3D } from './Book3D';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BookOpenTransitionProps {
  onAnimationComplete: () => void;
}

export const BookOpenTransition: React.FC<BookOpenTransitionProps> = ({
  onAnimationComplete,
}) => {
  // Animasyon Değerleri
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pageFlutter1 = useRef(new Animated.Value(0)).current;
  const pageFlutter2 = useRef(new Animated.Value(0)).current;
  const pageFlutter3 = useRef(new Animated.Value(0)).current;
  const pageFlutter4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Çok aşamalı orkestrasyon:
    // 1. Kapak aralanır, sayfalar hızlıca hışırdar ve çevrilir
    // 2. Kitap devasa bir kamera yaklaşımıyla ölçeklenir ve ekranı kaplar
    Animated.sequence([
      Animated.parallel([
        // Ana Yaklaşma & Düzleşme Animasyonu (1.4 saniye)
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        // Sayfa Hışırtısı 1
        Animated.timing(pageFlutter1, {
          toValue: 1,
          duration: 500,
          delay: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Sayfa Hışırtısı 2
        Animated.timing(pageFlutter2, {
          toValue: 1,
          duration: 550,
          delay: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Sayfa Hışırtısı 3
        Animated.timing(pageFlutter3, {
          toValue: 1,
          duration: 600,
          delay: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Sayfa Hışırtısı 4
        Animated.timing(pageFlutter4, {
          toValue: 1,
          duration: 650,
          delay: 650,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onAnimationComplete();
    });
  }, [onAnimationComplete]);

  // Kamera Yaklaşması (Scale: 1 -> 4.5)
  const scale = progressAnim.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: [1, 1.6, 3.2, 4.6],
  });

  // Perspektifin düzleşmesi (-22deg -> 0deg)
  const rotateY = progressAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: ['-22deg', '-8deg', '0deg'],
  });

  // Ön kapağın açılması (0 -> -110deg)
  const coverOpen = progressAnim.interpolate({
    inputRange: [0, 0.3, 0.8, 1],
    outputRange: [0, -45, -95, -120],
  });

  // Opaklık geçişi (Tam ekran beyaz/krem sayfaya pürüzsüz geçiş için)
  const pageRevealOpacity = progressAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0.6, 1],
  });

  // Çevrilen sayfaların açıları
  const rotatePage1 = pageFlutter1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-140deg'],
  });
  const rotatePage2 = pageFlutter2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-130deg'],
  });
  const rotatePage3 = pageFlutter3.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-115deg'],
  });
  const rotatePage4 = pageFlutter4.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-90deg'],
  });

  return (
    <View style={styles.container}>
      {/* 3D Yaklaşan Kitap */}
      <Animated.View
        style={[
          styles.zoomWrapper,
          {
            transform: [
              { perspective: 1200 },
              { scale },
              { rotateY },
            ],
          },
        ]}
      >
        <Book3D scale={1} rotateYDeg={0} coverOpenAngle={0} />

        {/* Hızla Çevrilen Uçuşan Sayfalar (Fluttering Pages) */}
        <Animated.View
          style={[
            styles.flutterPage,
            {
              transform: [
                { perspective: 800 },
                { rotateY: rotatePage1 },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flutterPage,
            {
              transform: [
                { perspective: 800 },
                { rotateY: rotatePage2 },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flutterPage,
            {
              transform: [
                { perspective: 800 },
                { rotateY: rotatePage3 },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.flutterPage,
            {
              transform: [
                { perspective: 800 },
                { rotateY: rotatePage4 },
              ],
            },
          ]}
        />
      </Animated.View>

      {/* Kamerayı kaplayan tam sayfa geçiş katmanı */}
      <Animated.View
        style={[
          styles.fullScreenPageOverlay,
          { opacity: pageRevealOpacity },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: onboardingColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  zoomWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flutterPage: {
    position: 'absolute',
    left: '50%',
    top: -150,
    width: 240,
    height: 330,
    backgroundColor: onboardingColors.pagePaperWarm,
    borderWidth: 0.5,
    borderColor: onboardingColors.pageBorder,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    transformOrigin: 'left center',
  },
  fullScreenPageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: onboardingColors.pagePaper,
  },
});
