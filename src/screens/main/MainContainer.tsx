import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Home,
  Search,
  BookMarked,
  User,
  Plus,
  Quote,
  Star,
  BookOpen,
  Feather,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Book } from '../../lib/types';
import { HomeScreen } from './HomeScreen';
import { SearchScreen } from './SearchScreen';
import { LibraryScreen } from './LibraryScreen';
import { ProfileScreen } from './ProfileScreen';

// Paylaşım Modalları
import { CreateQuoteModal } from './modals/CreateQuoteModal';
import { CreateReviewModal } from './modals/CreateReviewModal';
import { CreateReadingUpdateModal } from './modals/CreateReadingUpdateModal';
import { CreateThoughtModal } from './modals/CreateThoughtModal';

type Tab = 'home' | 'search' | 'library' | 'profile';

export const MainContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Paylaşım Modalları Görünürlük Durumları
  const [quoteModalVisible, setQuoteModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [readingUpdateModalVisible, setReadingUpdateModalVisible] = useState(false);
  const [thoughtModalVisible, setThoughtModalVisible] = useState(false);
  const [preSelectedBook, setPreSelectedBook] = useState<Book | null>(null);

  // Animasyon Değerleri
  const plusRotation = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  const openMenu = () => {
    setIsMenuOpen(true);

    // 1. Artı butonu dönüş animasyonu (+ -> ×)
    Animated.spring(plusRotation, {
      toValue: 1,
      tension: 60,
      friction: 6,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // 2. Karartma arka planı
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // 3. 4 Kart için sırayla yumuşak yaylanma animasyonu (Staggered spring)
    const staggerAnimations = cardAnims.map((anim) =>
      Animated.spring(anim, {
        toValue: 1,
        tension: 55,
        friction: 7,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    Animated.stagger(50, staggerAnimations).start();
  };

  const closeMenu = (callback?: () => void) => {
    // 1. Artı butonu geri dönüşü (× -> +)
    Animated.timing(plusRotation, {
      toValue: 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // 2. Kartların aşağı kayması ve kaybolması
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    const reverseAnimations = cardAnims.map((anim) =>
      Animated.timing(anim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: Platform.OS !== 'web',
      })
    );

    Animated.parallel(reverseAnimations).start(() => {
      setIsMenuOpen(false);
      callback?.();
    });
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  // Kart tıklandığında menüyü kapatıp ilgili modalı aç
  const handleSelectOption = (
    action: 'quote' | 'review' | 'reading_update' | 'thought'
  ) => {
    closeMenu(() => {
      setPreSelectedBook(null);
      if (action === 'quote') setQuoteModalVisible(true);
      if (action === 'review') setReviewModalVisible(true);
      if (action === 'reading_update') setReadingUpdateModalVisible(true);
      if (action === 'thought') setThoughtModalVisible(true);
    });
  };

  const spinInterpolation = plusRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);

  const refreshAll = () => {
    setFeedRefreshKey((prev) => prev + 1);
    setLibraryRefreshKey((prev) => prev + 1);
  };

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            key={`home_${feedRefreshKey}`}
            onNavigateToSearch={() => setActiveTab('search')}
            onOpenCreateMenu={openMenu}
          />
        );
      case 'search':
        return (
          <SearchScreen
            onShareQuoteRequest={(b) => {
              setPreSelectedBook(b);
              setQuoteModalVisible(true);
            }}
            onShareReviewRequest={(b) => {
              setPreSelectedBook(b);
              setReviewModalVisible(true);
            }}
          />
        );
      case 'library':
        return (
          <LibraryScreen
            key={`lib_${libraryRefreshKey}`}
            onNavigateToSearch={() => setActiveTab('search')}
            onShareQuoteRequest={(b) => {
              setPreSelectedBook(b);
              setQuoteModalVisible(true);
            }}
            onShareReviewRequest={(b) => {
              setPreSelectedBook(b);
              setReviewModalVisible(true);
            }}
          />
        );
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const menuOptions = [
    {
      id: 'quote',
      title: 'Alıntı Paylaş',
      desc: 'Kitabından altını çizdiğin bir cümleyi ölümsüzleştir',
      icon: <Quote size={20} color={colors.goldDark} />,
      iconBg: colors.goldLight,
      action: () => handleSelectOption('quote'),
    },
    {
      id: 'review',
      title: 'İnceleme Paylaş',
      desc: 'Okuduğun kitabı puanla ve edebî eleştirini yaz',
      icon: <Star size={20} color={colors.primary} fill={colors.gold} />,
      iconBg: 'rgba(197, 160, 89, 0.2)',
      action: () => handleSelectOption('review'),
    },
    {
      id: 'reading_update',
      title: 'Kitap Kaydı Paylaş',
      desc: 'Okumaya başladığın veya bitirdiğin kitabı akışta duyur',
      icon: <BookOpen size={20} color={colors.primary} />,
      iconBg: colors.surfaceVariant,
      action: () => handleSelectOption('reading_update'),
    },
    {
      id: 'thought',
      title: 'Serbest İleti Paylaş',
      desc: 'Edebiyat ve kitaplar üzerine özgürce düşüncelerini aktar',
      icon: <Feather size={20} color={colors.textSecondary} />,
      iconBg: colors.surfaceHighlight,
      action: () => handleSelectOption('thought'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.body}>{renderCurrentScreen()}</View>

      {/* Karartma Arka Planı & 4 Kartlı Paylaşım Menüsü */}
      {isMenuOpen && (
        <View style={styles.menuOverlayContainer}>
          <TouchableWithoutFeedback onPress={() => closeMenu()}>
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: overlayOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.65],
                  }),
                },
              ]}
            />
          </TouchableWithoutFeedback>

          {/* 4 Kart Listesi */}
          <View style={styles.cardsContainer} pointerEvents="box-none">
            {menuOptions.map((opt, idx) => {
              const anim = cardAnims[idx];
              const translateY = anim.interpolate({
                inputRange: [0, 1],
                outputRange: [60 + idx * 25, 0],
              });
              const scale = anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.85, 1],
              });
              const opacity = anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              });

              return (
                <Animated.View
                  key={opt.id}
                  style={[
                    styles.cardWrapper,
                    {
                      opacity,
                      transform: [{ translateY }, { scale }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.menuCard}
                    activeOpacity={0.8}
                    onPress={opt.action}
                  >
                    <View
                      style={[styles.menuIconCircle, { backgroundColor: opt.iconBg }]}
                    >
                      {opt.icon}
                    </View>
                    <View style={styles.menuCardTextContainer}>
                      <Text style={styles.menuCardTitle}>{opt.title}</Text>
                      <Text style={styles.menuCardDesc} numberOfLines={1}>
                        {opt.desc}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>
      )}

      {/* Alt App Bar (Bottom Navigation) */}
      <View style={styles.bottomBar}>
        {/* Anasayfa */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('home')}
          style={styles.tabButton}
        >
          <View
            style={[
              styles.iconWrapper,
              activeTab === 'home' && styles.iconWrapperActive,
            ]}
          >
            <Home
              size={22}
              color={activeTab === 'home' ? colors.primary : colors.textTertiary}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'home' && styles.tabLabelActive,
            ]}
          >
            Anasayfa
          </Text>
        </TouchableOpacity>

        {/* Arama */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('search')}
          style={styles.tabButton}
        >
          <View
            style={[
              styles.iconWrapper,
              activeTab === 'search' && styles.iconWrapperActive,
            ]}
          >
            <Search
              size={22}
              color={activeTab === 'search' ? colors.primary : colors.textTertiary}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'search' && styles.tabLabelActive,
            ]}
          >
            Arama
          </Text>
        </TouchableOpacity>

        {/* Ortadaki Öne Çıkan + Butonu */}
        <View style={styles.centerButtonContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleMenu}
            style={[styles.floatingPlusBtn, isMenuOpen && styles.floatingPlusBtnActive]}
          >
            <Animated.View
              style={{
                transform: [{ rotate: spinInterpolation }],
              }}
            >
              <Plus size={26} color={colors.textInverse} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Kitaplık */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('library')}
          style={styles.tabButton}
        >
          <View
            style={[
              styles.iconWrapper,
              activeTab === 'library' && styles.iconWrapperActive,
            ]}
          >
            <BookMarked
              size={22}
              color={activeTab === 'library' ? colors.primary : colors.textTertiary}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'library' && styles.tabLabelActive,
            ]}
          >
            Kitaplık
          </Text>
        </TouchableOpacity>

        {/* Profil */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('profile')}
          style={styles.tabButton}
        >
          <View
            style={[
              styles.iconWrapper,
              activeTab === 'profile' && styles.iconWrapperActive,
            ]}
          >
            <User
              size={22}
              color={activeTab === 'profile' ? colors.primary : colors.textTertiary}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'profile' && styles.tabLabelActive,
            ]}
          >
            Profil
          </Text>
        </TouchableOpacity>
      </View>

      {/* Paylaşım Modalları */}
      <CreateQuoteModal
        visible={quoteModalVisible}
        initialBook={preSelectedBook}
        onClose={() => setQuoteModalVisible(false)}
        onPostCreated={() => {
          refreshAll();
          setActiveTab('home');
        }}
      />

      <CreateReviewModal
        visible={reviewModalVisible}
        initialBook={preSelectedBook}
        onClose={() => setReviewModalVisible(false)}
        onPostCreated={() => {
          refreshAll();
          setActiveTab('home');
        }}
      />

      <CreateReadingUpdateModal
        visible={readingUpdateModalVisible}
        initialBook={preSelectedBook}
        onClose={() => setReadingUpdateModalVisible(false)}
        onPostCreated={() => {
          refreshAll();
          setActiveTab('home');
        }}
      />

      <CreateThoughtModal
        visible={thoughtModalVisible}
        onClose={() => setThoughtModalVisible(false)}
        onPostCreated={() => {
          refreshAll();
          setActiveTab('home');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceWarm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 14,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: colors.leatherDark,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 38,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(92, 52, 26, 0.08)',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -22,
  },
  floatingPlusBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.surfaceWarm,
  },
  floatingPlusBtnActive: {
    backgroundColor: colors.leatherDark,
  },
  menuOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E120A',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 84 : 76,
    gap: 12,
  },
  cardWrapper: {
    width: '100%',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.leatherDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuCardTextContainer: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'serif',
    marginBottom: 3,
  },
  menuCardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
