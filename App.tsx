import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BookOpen } from 'lucide-react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { OnboardingContainer } from './src/screens/onboarding/OnboardingContainer';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';
import { MainContainer } from './src/screens/main/MainContainer';
import { colors } from './src/theme/colors';

type AuthScreenType = 'onboarding' | 'forgot_password';

function RootNavigator() {
  const { session, user, isLoading } = useAuth();
  const [currentAuthScreen, setCurrentAuthScreen] =
    useState<AuthScreenType>('onboarding');

  // Başlangıç oturum yüklenme durumu
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingLogoBadge}>
          <BookOpen size={40} color={colors.primary} />
        </View>
        <Text style={styles.loadingTitle}>Kitaphane</Text>
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  // Kullanıcı giriş yaptıysa Ana Ekrana (Bottom Navigation App Bar) yönlendir
  if (session && user) {
    return <MainContainer />;
  }

  // Kullanıcı giriş yapmadıysa:
  // Şifremi Unuttum ekranı veya 3D Kitap Onboarding Deneyimi
  if (currentAuthScreen === 'forgot_password') {
    return (
      <ForgotPasswordScreen
        onBackToLogin={() => setCurrentAuthScreen('onboarding')}
      />
    );
  }

  return (
    <OnboardingContainer
      onNavigateToForgotPassword={() => setCurrentAuthScreen('forgot_password')}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <View style={styles.container}>
          <RootNavigator />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3EB',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F6F3EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#FAF7F0',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#3D271D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  loadingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E1712',
    letterSpacing: 2,
    fontFamily: 'serif',
  },
});
