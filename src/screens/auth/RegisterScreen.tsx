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
import { Mail, Lock, User, AtSign, BookOpen } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Toast, ToastMessage } from '../../components/Toast';
import { GoogleIcon } from '../../components/GoogleIcon';
import { VerifyEmailModal } from './VerifyEmailModal';
import { useAuth } from '../../context/AuthContext';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
}) => {
  const { signUp, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Email verification modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleRegister = async () => {
    // Validasyonlar
    if (!fullName.trim()) {
      setToast({ type: 'error', message: 'Lütfen adınızı ve soyadınızı girin.' });
      return;
    }
    if (!username.trim()) {
      setToast({ type: 'error', message: 'Lütfen bir kullanıcı adı belirleyin.' });
      return;
    }
    if (username.trim().length < 3) {
      setToast({
        type: 'error',
        message: 'Kullanıcı adı en az 3 karakter olmalıdır.',
      });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setToast({
        type: 'error',
        message: 'Lütfen geçerli bir e-posta adresi girin.',
      });
      return;
    }
    if (password.length < 6) {
      setToast({
        type: 'error',
        message: 'Şifreniz en az 6 karakter uzunluğunda olmalıdır.',
      });
      return;
    }
    if (password !== confirmPassword) {
      setToast({
        type: 'error',
        message: 'Girdiğiniz şifreler birbiriyle eşleşmiyor.',
      });
      return;
    }

    setLoading(true);
    setToast(null);

    const { result, error } = await signUp(
      email,
      password,
      fullName,
      username
    );
    setLoading(false);

    if (error) {
      setToast({ type: 'error', message: error });
      return;
    }

    if (result?.needsEmailVerification) {
      setToast({
        type: 'info',
        message:
          'Kayıt başarılı! E-posta adresinize gelen 6 haneli onay kodunu girin.',
      });
      setShowVerifyModal(true);
    } else {
      setToast({
        type: 'success',
        message: 'Hesabınız başarıyla oluşturuldu! Hoş geldiniz.',
      });
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
              Okuma topluluğumuza katılın
            </Text>
          </View>

          {/* Form Kartı */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hesap Oluştur</Text>
            <Text style={styles.cardSubtitle}>
              Kişisel kütüphanenizi hemen oluşturun
            </Text>

            <Toast toast={toast} onDismiss={() => setToast(null)} />

            {/* Google ile Giriş */}
            <Button
              title="Google ile Kayıt Ol"
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

            {/* Form Alanları */}
            <Input
              label="Ad Soyad"
              placeholder="Örn: Zeynep Sena"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              leftIcon={<User size={18} color={colors.textSecondary} />}
            />

            <Input
              label="Kullanıcı Adı"
              placeholder="zeynep"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<AtSign size={18} color={colors.textSecondary} />}
            />

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
              placeholder="En az 6 karakter"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
            />

            <Input
              label="Şifre Tekrar"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
            />

            <Button
              title="Kayıt Ol"
              variant="primary"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerBtn}
            />

            {/* Giriş Yap Yönlendirmesi */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Zaten bir hesabınız var mı?</Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text style={styles.footerLink}>Giriş Yapın</Text>
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
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 13,
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
  registerBtn: {
    marginTop: 6,
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
