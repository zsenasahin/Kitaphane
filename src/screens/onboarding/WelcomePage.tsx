import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, BookOpen, Quote, Compass } from 'lucide-react-native';
import { onboardingColors } from './onboardingTheme';

interface WelcomePageProps {
  onTriggerPageTurn?: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onTriggerPageTurn,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.pageContainer}>
        {/* Sol Cilt Dikiş / Gutter Gölgesi */}
        <View style={styles.gutterSpineShadow} />

        {/* Zarif İnce İç Kitap Çerçevesi */}
        <View style={styles.innerFrameBorder}>
          {/* 1. ÜST BAŞLIK */}
          <View style={styles.pageHeader}>
            <Text style={styles.chapterTag}>— BÖLÜM I —</Text>
            <Text style={styles.headerMotto}>GİRİŞ</Text>
            <View style={styles.vintageDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.fleuronIcon}>❦</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>

          {/* 2. ANA BAŞLIK & MİNİMAL GİRİŞ */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Kitaphane'ye</Text>
            <Text style={styles.mainTitleAccent}>hoş geldin!</Text>
            <Text style={styles.introParagraph}>
              "Okuma yolculuğunu derinleştirmek ve kendi kütüphaneni inşa etmek için ilk adım."
            </Text>
          </View>

          {/* 3. MİNİMAL VE ZARİF 3 ÖZELLİK (Kağıt Üstü Satırlar) */}
          <View style={styles.featuresSection}>
            <View style={styles.featureRow}>
              <View style={styles.bulletDot}>
                <BookOpen size={15} color={onboardingColors.inkAccent} />
              </View>
              <Text style={styles.featureText}>
                Kitaplarını kaydet ve okuma yolculuğunu takip et.
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.bulletDot}>
                <Quote size={15} color={onboardingColors.inkAccent} />
              </View>
              <Text style={styles.featureText}>
                Sevdiğin alıntıları ve altını çizdiğin satırları biriktir.
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.bulletDot}>
                <Compass size={15} color={onboardingColors.inkAccent} />
              </View>
              <Text style={styles.featureText}>
                Diğer okurlarla buluş ve yeni kitaplar keşfet.
              </Text>
            </View>
          </View>

          {/* 4. SAYFA ALTI ÇAĞRI BUTONU & SAYFA NUMARASI */}
          <View style={styles.pageFooter}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onTriggerPageTurn}
              style={styles.turnPageButton}
            >
              <Text style={styles.turnPageText}>
                Sayfayı çevir ve sende aramıza katıl
              </Text>
              <ArrowRight size={16} color={onboardingColors.inkPrimary} />
            </TouchableOpacity>

            <Text style={styles.pageNumber}>— Sayfa 1 —</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: onboardingColors.pagePaper,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: onboardingColors.pagePaper,
    position: 'relative',
  },
  gutterSpineShadow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 18,
    backgroundColor: 'rgba(50, 30, 15, 0.08)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(50, 30, 15, 0.05)',
    zIndex: 5,
  },
  innerFrameBorder: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: onboardingColors.pageBorder,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  pageHeader: {
    alignItems: 'center',
    marginTop: 4,
  },
  chapterTag: {
    fontSize: 11,
    fontWeight: '700',
    color: onboardingColors.inkGold,
    letterSpacing: 3,
    marginBottom: 2,
  },
  headerMotto: {
    fontSize: 10,
    color: onboardingColors.inkSecondary,
    letterSpacing: 2,
    fontWeight: '600',
  },
  vintageDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    width: '45%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: onboardingColors.pageBorder,
  },
  fleuronIcon: {
    fontSize: 13,
    color: onboardingColors.inkGold,
    paddingHorizontal: 6,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  mainTitle: {
    fontSize: 26,
    fontFamily: 'serif',
    fontWeight: '600',
    color: onboardingColors.inkPrimary,
    letterSpacing: -0.5,
  },
  mainTitleAccent: {
    fontSize: 30,
    fontFamily: 'serif',
    fontWeight: '800',
    color: onboardingColors.inkAccent,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  introParagraph: {
    fontSize: 13,
    fontFamily: 'serif',
    lineHeight: 20,
    color: onboardingColors.inkSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
  featuresSection: {
    paddingHorizontal: 4,
    gap: 14,
    marginVertical: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: onboardingColors.pagePaperWarm,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(210, 196, 167, 0.4)',
  },
  bulletDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(122, 71, 38, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: 'serif',
    color: onboardingColors.inkPrimary,
    lineHeight: 18,
    fontWeight: '600',
  },
  pageFooter: {
    alignItems: 'center',
    marginBottom: 4,
  },
  turnPageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: onboardingColors.pagePaperWarm,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: onboardingColors.inkGold,
    shadowColor: onboardingColors.inkPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
    maxWidth: '100%',
  },
  turnPageText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: onboardingColors.inkPrimary,
    marginRight: 8,
    letterSpacing: 0.1,
  },
  pageNumber: {
    fontSize: 11,
    color: onboardingColors.inkMuted,
    letterSpacing: 1.5,
    fontFamily: 'serif',
  },
});
