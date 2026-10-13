import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, BookOpen } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Toast, ToastMessage } from '../../components/Toast';
import { GoogleIcon } from '../../components/GoogleIcon';
import { VerifyEmailModal } from './VerifyEmailModal';
import { useAuth } from '../../context/AuthContext';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onNavigateToForgotPassword,
}) => {
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Email verification modal state if user is unconfirmed
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      setToast({ type: 'error', message: 'Lütfen e-posta adresinizi girin.' });
      return;
    }
    if (!password) {
      setToast({ type: 'error', message: 'Lütfen şifrenizi girin.' });
      return;
    }

    setLoading(true);
    setToast(null);

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      if (error.includes('doğrulanmamış') || error.includes('Email not confirmed')) {
        setToast({
          type: 'warning',
          message:
            'E-posta adresiniz henüz doğrulanmamış. Kodunuzu girerek hemen doğrulayabilirsiniz.',
        });
        setShowVerifyModal(true);
      } else {
        setToast({ type: 'error', message: error });
      }
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setToast(null);

    const { error } = await signInWithGoogle();
    setGoogleLoading(false);

    if (error) {
      setToast({ type: 'error', message: error });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo ve Başlık */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <BookOpen size={36} color={colors.primary} />
            </View>
            <Text style={styles.appName}>Kitaphane</Text>
            <Text style={styles.appTagline}>
              Okuma yolculuğunuz burada başlıyor
            </Text>
          </View>

          {/* Form Kartı */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Giriş Yap</Text>
            <Text style={styles.cardSubtitle}>
              Kütüphanenize ve okuma listenize erişin
            </Text>

            <Toast toast={toast} onDismiss={() => setToast(null)} />

            {/* Google ile Giriş */}
            <Button
              title="Google ile Devam Et"
              variant="google"
              leftIcon={<GoogleIcon size={20} />}
              onPress={handleGoogleLogin}
              loading={googleLoading}
              style={styles.googleBtn}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya e-posta ile</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Giriş Alanları */}
            <Input
              label="E-posta"
              placeholder="ornek@mail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Mail size={18} color={colors.textSecondary} />}
            />

            <Input
              label="Şifre"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
            />

            <TouchableOpacity
              onPress={onNavigateToForgotPassword}
              style={styles.forgotBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.forgotText}>Şifremi Unuttum?</Text>
            </TouchableOpacity>

            <Button
              title="Giriş Yap"
              variant="primary"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />

            {/* Kayıt Ol Yönlendirmesi */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Hesabınız yok mu?</Text>
              <TouchableOpacity onPress={onNavigateToRegister}>
                <Text style={styles.footerLink}>Kayıt Olun</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* E-posta Doğrulama Modalı */}
      <VerifyEmailModal
        visible={showVerifyModal}
        email={email}
        onClose={() => setShowVerifyModal(false)}
        onSuccess={() => setShowVerifyModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  googleBtn: {
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -6,
  },
  forgotText: {
    color: colors.accentLight,
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtn: {
    marginBottom: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 6,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
