import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Platform,
} from 'react-native';
import { onboardingColors } from './onboardingTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PageCurlProps {
  frontPage: React.ReactNode;
  backPage: React.ReactNode;
  onPageTurned?: () => void;
  onTurnBack?: () => void;
}

export const PageCurl: React.FC<PageCurlProps> = ({
  frontPage,
  backPage,
  onPageTurned,
  onTurnBack,
}) => {
  const [currentPage, setCurrentPage] = useState<'front' | 'back'>('front');
  const [isAnimating, setIsAnimating] = useState(false);

  // 0: Ön Sayfa (Sayfa 1), 1: Arka Sayfa (Sayfa 2)
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Sayfayı İleri Çevir (Sayfa 1 -> Sayfa 2)
  const turnForward = () => {
    setIsAnimating(true);

    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 1400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setCurrentPage('back');
      setIsAnimating(false);
      onPageTurned?.();
    });
  };

  // Sayfayı Geri Çevir (Sayfa 2 -> Sayfa 1)
  const turnBackward = () => {
    setIsAnimating(true);

    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 1300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setCurrentPage('front');
      setIsAnimating(false);
      onTurnBack?.();
    });
  };

  // 1. Dönme Açısı (0deg -> -180deg)
  const rotateY = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '-90deg', '-180deg'],
  });

  // 2. Kıvrılma ve Bükülme (Diagonal Curl & Skew)
  const curlSkew = flipAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '-8deg', '-14deg', '-6deg', '0deg'],
  });

  const curlTranslateX = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -SCREEN_WIDTH * 0.12, 0],
  });

  // 3. Dinamik Kağıt Kıvrım Gölgesi
  const shadowOpacity = flipAnim.interpolate({
    inputRange: [0, 0.35, 0.7, 1],
    outputRange: [0, 0.55, 0.3, 0],
  });

  // 4. Alt sayfaya düşen hareketli gölge
  const underPageShadowOpacity = flipAnim.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: [0.45, 0.25, 0.05, 0],
  });

  // 5. Ön ve Arka Yüzün Görünürlük Eşiği
  const frontFaceOpacity = flipAnim.interpolate({
    inputRange: [0, 0.499, 0.5],
    outputRange: [1, 1, 0],
  });

  const backFaceOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <View style={styles.container}>
      {/* ALT KATMAN: Yeni Açılan Sayfa (Sayfa 2 - Giriş & Kayıt) */}
      <View
        style={[
          styles.underlyingPage,
          { zIndex: currentPage === 'back' && !isAnimating ? 5 : 1 },
        ]}
        pointerEvents={currentPage === 'back' ? 'auto' : 'none'}
      >
        {React.isValidElement(backPage)
          ? React.cloneElement(backPage as React.ReactElement<any>, {
              onTurnBackToWelcome: turnBackward,
            })
          : backPage}
        {/* Hareketli Gutter Gölgesi */}
        <Animated.View
          style={[
            styles.gutterShadowOverlay,
            { opacity: underPageShadowOpacity },
          ]}
          pointerEvents="none"
        />
      </View>

      {/* DÖNEN VE KIVRILAN SAYFA KATMANI */}
      <Animated.View
        style={[
          styles.curlingPageWrapper,
          {
            zIndex: currentPage === 'front' || isAnimating ? 6 : 0,
            transform: [
              { perspective: 1400 },
              { translateX: curlTranslateX },
              { rotateY: rotateY },
              { skewY: curlSkew },
            ],
          },
        ]}
        pointerEvents={currentPage === 'front' && !isAnimating ? 'auto' : 'none'}
      >
        {/* ÖN YÜZ (Sayfa 1 - Hoş Geldin Sayfası) */}
        <Animated.View
          style={[styles.pageFace, { opacity: frontFaceOpacity }]}
          pointerEvents={currentPage === 'front' && !isAnimating ? 'auto' : 'none'}
        >
          {React.isValidElement(frontPage)
            ? React.cloneElement(frontPage as React.ReactElement<any>, {
                onTriggerPageTurn: turnForward,
              })
            : frontPage}

          {/* Sayfa Üzeri Dinamik Işık / Kıvrım Gölgesi */}
          <Animated.View
            style={[styles.curlShadow, { opacity: shadowOpacity }]}
            pointerEvents="none"
          />
        </Animated.View>

        {/* ARKA YÜZ (Sayfa Çevrildiğinde Görünen Kağıt Dokulu Arka Yüz) */}
        <Animated.View
          style={[
            styles.pageFace,
            styles.versoBackFace,
            { opacity: backFaceOpacity, transform: [{ scaleX: -1 }] },
          ]}
          pointerEvents="none"
        >
          {/* Kağıt arkası hafif filigran / ters sayfa gölgesi */}
          <View style={styles.versoTexture} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: onboardingColors.background,
    overflow: 'hidden',
  },
  underlyingPage: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  curlingPageWrapper: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
    transformOrigin: 'left center',
  },
  pageFace: {
    ...StyleSheet.absoluteFill,
    backgroundColor: onboardingColors.pagePaper,
  },
  versoBackFace: {
    backgroundColor: onboardingColors.pagePaperWarm,
    borderLeftWidth: 1.5,
    borderLeftColor: onboardingColors.pagePaperGutter,
  },
  versoTexture: {
    flex: 1,
    backgroundColor: 'rgba(74, 46, 27, 0.03)',
  },
  curlShadow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(30, 18, 10, 0.45)',
  },
  gutterShadowOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: 'rgba(40, 20, 10, 0.28)',
  },
});
