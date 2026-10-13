import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Sparkles, ChevronRight } from 'lucide-react-native';
import { onboardingColors } from './onboardingTheme';
import { Book3D } from './Book3D';
import { BookOpenTransition } from './BookOpenTransition';
import { PageCurl } from './PageCurl';
import { WelcomePage } from './WelcomePage';
import { AuthBookPage } from './AuthBookPage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingStage = 'cover' | 'opening' | 'curling';

interface OnboardingContainerProps {
  onNavigateToForgotPassword: () => void;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  onNavigateToForgotPassword,
}) => {
  const [stage, setStage] = useState<OnboardingStage>('cover');

  // "Başla" tıklandığında kamera yaklaşması ve sayfa açılması animasyonuna geçiş
  const handleStart = () => {
    setStage('opening');
  };

  // Kitap açılma animasyonu tamamlandığında Hoş Geldin sayfasına geçiş
  const handleOpeningComplete = () => {
    setStage('curling');
  };

  return (
    <View style={styles.container}>
      {/* EKRAN 1: DİK DURAN 3D KİTAP KAPAĞI */}
      {stage === 'cover' && (
        <SafeAreaView style={styles.coverScreen}>
          {/* Üst Zarif Antika Filigran / Başlık */}
          <View style={styles.topHeader}>
            <Text style={styles.appHeaderTitle}>K İ T A P H A N E</Text>
            <Text style={styles.appHeaderSub}>Kişisel Edebi Sığınağınız</Text>
          </View>

          {/* Merkezde Tek Başına Dik Duran 3D Ciltli Kitap */}
          <View style={styles.bookWrapper}>
            <Book3D scale={1} rotateYDeg={-22} coverOpenAngle={0} />
          </View>

          {/* Alt Çağrı Alanı / "Başla" Butonu */}
          <View style={styles.bottomCtaSection}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={handleStart}
              style={styles.startButton}
            >
              <View style={styles.startBtnContent}>
                <BookOpen
                  size={18}
                  color={onboardingColors.goldFoilLight}
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.startButtonText}>Sayfaları Arala</Text>
                <ChevronRight
                  size={18}
                  color={onboardingColors.goldFoilLight}
                  style={{ marginLeft: 6 }}
                />
              </View>
            </TouchableOpacity>

            <Text style={styles.hintText}>
              Okuma serüveninizi başlatmak için dokunun
            </Text>
          </View>
        </SafeAreaView>
      )}

      {/* EKRAN 2: KİTABIN BÜYÜYEREK AÇILMASI & SAYFALARIN ÇEVRİLMESİ */}
      {stage === 'opening' && (
        <BookOpenTransition onAnimationComplete={handleOpeningComplete} />
      )}

      {/* EKRAN 3 & 4: HOŞ GELDİN SAYFASI VE SAYFA KIVRILMA İLE GİRİŞ/KAYIT */}
      {stage === 'curling' && (
        <PageCurl
          frontPage={<WelcomePage />}
          backPage={
            <AuthBookPage
              onNavigateToForgotPassword={onNavigateToForgotPassword}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: onboardingColors.background,
  },
  coverScreen: {
    flex: 1,
    backgroundColor: onboardingColors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  topHeader: {
    alignItems: 'center',
    marginTop: 12,
  },
  appHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 6,
    color: onboardingColors.inkPrimary,
    fontFamily: 'serif',
  },
  appHeaderSub: {
    fontSize: 12,
    color: onboardingColors.inkSecondary,
    letterSpacing: 2,
    marginTop: 4,
    fontStyle: 'italic',
  },
  bookWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCtaSection: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  startButton: {
    backgroundColor: onboardingColors.coverLeather,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: onboardingColors.goldFoil,
    shadowColor: onboardingColors.coverLeatherDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 12,
  },
  startBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
    fontFamily: 'serif',
  },
  hintText: {
    fontSize: 12,
    color: onboardingColors.inkSecondary,
    fontStyle: 'italic',
  },
});
