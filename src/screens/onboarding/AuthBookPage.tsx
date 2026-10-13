import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mail,
  Lock,
  User,
  AtSign,
  ArrowLeft,
  BookOpen,
} from 'lucide-react-native';
import { onboardingColors } from './onboardingTheme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Toast, ToastMessage } from '../../components/Toast';
import { GoogleIcon } from '../../components/GoogleIcon';
import { VerifyEmailModal } from '../auth/VerifyEmailModal';
import { useAuth } from '../../context/AuthContext';

interface AuthBookPageProps {
  onTurnBackToWelcome?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export const AuthBookPage: React.FC<AuthBookPageProps> = ({
  onTurnBackToWelcome,
  onNavigateToForgotPassword,
}) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const scrollViewRef = useRef<ScrollView>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const [mode, setMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToInput = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  // Form Değerleri
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Giriş Yap İşlemi
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
            'E-posta adresiniz henüz onaylanmamış. Gelen kodunuzu girerek doğrulayabilirsiniz.',
        });
        setShowVerifyModal(true);
      } else {
        setToast({ type: 'error', message: error });
      }
    }
  };

  // Kayıt Ol İşlemi
  const handleRegister = async () => {
    if (!fullName.trim()) {
      setToast({ type: 'error', message: 'Lütfen adınızı ve soyadınızı girin.' });
      return;
    }
    if (!username.trim() || username.trim().length < 3) {
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
        message: 'Şifreniz en az 6 karakter olmalıdır.',
      });
      return;
    }
    if (password !== confirmPassword) {
      setToast({
        type: 'error',
        message: 'Şifreler birbiriyle eşleşmiyor.',
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
          'Kayıt oluşturuldu! E-postanıza gelen kodu girerek hesabınızı etkinleştirin.',
      });
      setShowVerifyModal(true);
    } else {
      setToast({
        type: 'success',
        message: 'Kayıt başarılı! Kütüphanenize giriş yapılıyor...',
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
      <View style={styles.pageContainer}>
        {/* Sol Cilt Dikiş / Gutter Gölgesi */}
        <View style={styles.gutterSpineShadow} />

        {/* Zarif İnce İç Kitap Çerçevesi */}
        <View style={styles.innerFrameBorder}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={[
                styles.scrollContent,
                isKeyboardVisible && { paddingBottom: 240 },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Üst Geri Butonu & Sayfa Başlığı */}
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={onTurnBackToWelcome}
                  style={styles.turnBackBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ArrowLeft size={16} color={onboardingColors.inkSecondary} />
                  <Text style={styles.turnBackText}>Önceki Sayfa</Text>
                </TouchableOpacity>

                <Text style={styles.pageNumberTop}>— Sayfa 2 —</Text>
              </View>

              {!isKeyboardVisible ? (
                <View style={styles.chapterHeader}>
                  <Text style={styles.chapterTag}>— BÖLÜM II —</Text>
                  <Text style={styles.chapterTitle}>KÜTÜPHANE KAPILARI</Text>
                  <View style={styles.vintageDivider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.fleuronIcon}>❦</Text>
                    <View style={styles.dividerLine} />
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginBottom: 10 }}>
                  <Text style={[styles.chapterTag, { marginBottom: 4 }]}>
                    — BÖLÜM II: KÜTÜPHANE KAPILARI —
                  </Text>
                </View>
              )}

              {/* Sayfa İçi Mod Seçici (Giriş Yap / Kayıt Ol Sekmeleri) */}
              <View style={styles.tabSelector}>
                <TouchableOpacity
                  onPress={() => setMode('login')}
                  style={[
                    styles.tabButton,
                    mode === 'login' && styles.tabButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      mode === 'login' && styles.tabButtonTextActive,
                    ]}
                  >
                    Giriş Yap
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setMode('register')}
                  style={[
                    styles.tabButton,
                    mode === 'register' && styles.tabButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      mode === 'register' && styles.tabButtonTextActive,
                    ]}
                  >
                    Kayıt Ol
                  </Text>
                </TouchableOpacity>
              </View>

              <Toast toast={toast} onDismiss={() => setToast(null)} />

              {/* Google ile Giriş / Kayıt */}
              <Button
                title={
                  mode === 'login'
                    ? 'Google ile Devam Et'
                    : 'Google ile Kayıt Ol'
                }
                variant="google"
                leftIcon={<GoogleIcon size={18} />}
                onPress={handleGoogleLogin}
                loading={googleLoading}
                style={styles.googleBtn}
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLineLight} />
                <Text style={styles.dividerLabel}>veya e-posta ile</Text>
                <View style={styles.dividerLineLight} />
              </View>

              {/* Kayıt Modu Ekstra Alanları */}
              {mode === 'register' && (
                <>
                  <Input
                    label="Ad Soyad"
                    placeholder="Örn: Zeynep Sena"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    onFocus={scrollToInput}
                    inputContainerStyle={styles.bookInputContainer}
                    style={styles.bookInputText}
                    labelStyle={styles.bookInputLabel}
                    leftIcon={
                      <User size={16} color={onboardingColors.inkSecondary} />
                    }
                  />

                  <Input
                    label="Kullanıcı Adı"
                    placeholder="zeynep"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    onFocus={scrollToInput}
                    inputContainerStyle={styles.bookInputContainer}
                    style={styles.bookInputText}
                    labelStyle={styles.bookInputLabel}
                    leftIcon={
                      <AtSign size={16} color={onboardingColors.inkSecondary} />
                    }
                  />
                </>
              )}

              {/* Ortak Alanlar */}
              <Input
                label="E-posta Adresi"
                placeholder="ornek@mail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={scrollToInput}
                inputContainerStyle={styles.bookInputContainer}
                style={styles.bookInputText}
                labelStyle={styles.bookInputLabel}
                leftIcon={
                  <Mail size={16} color={onboardingColors.inkSecondary} />
                }
              />

              <Input
                label="Şifre"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                isPassword
                onFocus={scrollToInput}
                inputContainerStyle={styles.bookInputContainer}
                style={styles.bookInputText}
                labelStyle={styles.bookInputLabel}
                leftIcon={
                  <Lock size={16} color={onboardingColors.inkSecondary} />
                }
              />

              {mode === 'register' && (
                <Input
                  label="Şifre Tekrar"
                  placeholder="Şifrenizi tekrar girin"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  isPassword
                  onFocus={scrollToInput}
                  inputContainerStyle={styles.bookInputContainer}
                  style={styles.bookInputText}
                  labelStyle={styles.bookInputLabel}
                  leftIcon={
                    <Lock size={16} color={onboardingColors.inkSecondary} />
                  }
                />
              )}

              {mode === 'login' && (
                <TouchableOpacity
                  onPress={onNavigateToForgotPassword}
                  style={styles.forgotBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.forgotText}>Şifremi Unuttum?</Text>
                </TouchableOpacity>
              )}

              {/* Ana İşlem Butonu */}
              <Button
                title={mode === 'login' ? 'Kütüphaneye Gir' : 'Hesabımı Oluştur'}
                variant="accent"
                onPress={mode === 'login' ? handleLogin : handleRegister}
                loading={loading}
                style={styles.submitBtn}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

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
    width: 20,
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
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  turnBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  turnBackText: {
    fontSize: 12,
    color: onboardingColors.inkSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  pageNumberTop: {
    fontSize: 11,
    color: onboardingColors.inkMuted,
    letterSpacing: 1.5,
    fontFamily: 'serif',
  },
  chapterHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chapterTag: {
    fontSize: 11,
    fontWeight: '700',
    color: onboardingColors.inkGold,
    letterSpacing: 3,
    marginBottom: 2,
  },
  chapterTitle: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '700',
    color: onboardingColors.inkPrimary,
    letterSpacing: 1,
  },
  vintageDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    width: '50%',
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
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: onboardingColors.pagePaperWarm,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: onboardingColors.pageBorder,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: onboardingColors.pagePaper,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: onboardingColors.inkMuted,
  },
  tabButtonTextActive: {
    color: onboardingColors.inkPrimary,
    fontWeight: '700',
  },
  googleBtn: {
    marginBottom: 14,
    height: 48,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dividerLineLight: {
    flex: 1,
    height: 1,
    backgroundColor: onboardingColors.pageBorder,
  },
  dividerLabel: {
    paddingHorizontal: 10,
    fontSize: 11,
    color: onboardingColors.inkMuted,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotText: {
    color: onboardingColors.inkAccent,
    fontSize: 12.5,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: onboardingColors.coverLeather,
    borderWidth: 1.5,
    borderColor: onboardingColors.goldFoil,
    shadowColor: onboardingColors.coverLeatherDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 6,
  },
  bookInputContainer: {
    backgroundColor: onboardingColors.pagePaperWarm,
    borderColor: onboardingColors.pageBorder,
  },
  bookInputText: {
    color: onboardingColors.inkPrimary,
  },
  bookInputLabel: {
    color: onboardingColors.inkSecondary,
    fontSize: 12,
  },
});
