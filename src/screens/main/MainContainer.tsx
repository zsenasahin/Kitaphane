import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Home,
  Search,
  BookMarked,
  User,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { HomeScreen } from './HomeScreen';
import { SearchScreen } from './SearchScreen';
import { LibraryScreen } from './LibraryScreen';
import { ProfileScreen } from './ProfileScreen';

type Tab = 'home' | 'search' | 'library' | 'profile';

export const MainContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'library':
        return <LibraryScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.body}>{renderCurrentScreen()}</View>

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
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 14,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
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
});
