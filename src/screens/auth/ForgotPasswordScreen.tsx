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
import {
  ArrowLeft,
  KeyRound,
  Mail,
  Lock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Toast, ToastMessage } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBackToLogin,
}) => {
  const { resetPasswordForEmail, verifyOtp, updateUserPassword } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // 1. Adım: Sıfırlama Kodu İste
  const handleRequestCode = async () => {
    if (!email.trim() || !email.includes('@')) {
      setToast({
        type: 'error',
        message: 'Lütfen geçerli bir e-posta adresi girin.',
      });
      return;
    }

    setLoading(true);
    setToast(null);

    const { error } = await resetPasswordForEmail(email.trim());
    setLoading(false);

    if (error) {
      setToast({ type: 'error', message: error });
    } else {
      setToast({
        type: 'success',
        message:
          'Şifre sıfırlama kodu e-posta adresinize gönderildi. Lütfen kodu girin.',
      });
      setStep(2);
    }
  };

  // 2. Adım: Kodu Doğrula ve Yeni Şifreyi Kaydet
  const handleResetPassword = async () => {
    if (!code.trim() || code.trim().length < 6) {
      setToast({
        type: 'error',
        message: 'Lütfen e-postanıza gönderilen 6 haneli doğrulama kodunu girin.',
      });
      return;
    }

    if (newPassword.length < 6) {
      setToast({
        type: 'error',
        message: 'Yeni şifreniz en az 6 karakter olmalıdır.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({
        type: 'error',
        message: 'Şifreler birbiriyle eşleşmiyor.',
      });
      return;
    }

    setLoading(true);
    setToast(null);

    // Önce recovery OTP'yi doğrula
    const { error: otpError } = await verifyOtp(email, code.trim(), 'recovery');

    if (otpError) {
      setLoading(false);
      setToast({ type: 'error', message: otpError });
      return;
    }

    // Doğrulama başarılıysa yeni şifreyi kaydet
    const { error: passError } = await updateUserPassword(newPassword);
    setLoading(false);

    if (passError) {
      setToast({ type: 'error', message: passError });
    } else {
      setToast({
        type: 'success',
        message: 'Şifreniz başarıyla yenilendi! Giriş yapabilirsiniz.',
      });
      setTimeout(() => {
        onBackToLogin();
      }, 1500);
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
          {/* Üst Geri Butonu */}
          <TouchableOpacity
            onPress={onBackToLogin}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color={colors.text} />
            <Text style={styles.backText}>Girişe Dön</Text>
          </TouchableOpacity>

          {/* Başlık ve İkon */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              {step === 1 ? (
                <KeyRound size={32} color={colors.primary} />
              ) : (
                <ShieldCheck size={32} color={colors.primary} />
              )}
            </View>
            <Text style={styles.title}>
              {step === 1 ? 'Şifremi Unuttum' : 'Yeni Şifre Belirle'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Hesabınıza kayıtlı e-posta adresinizi girin. Size 6 haneli bir doğrulama kodu göndereceğiz.'
                : `${email} adresine gelen kodu ve yeni şifrenizi girin.`}
            </Text>
          </View>

          <Toast toast={toast} onDismiss={() => setToast(null)} />

          {step === 1 ? (
            <View style={styles.formCard}>
              <Input
                label="E-posta Adresi"
                placeholder="ornek@mail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={colors.textSecondary} />}
              />

              <Button
                title="Sıfırlama Kodu Gönder"
                variant="primary"
                onPress={handleRequestCode}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>
          ) : (
            <View style={styles.formCard}>
              <Input
                label="6 Haneli Doğrulama Kodu"
                placeholder="Örn: 123456"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={8}
                style={styles.codeInput}
              />

              <Input
                label="Yeni Şifre"
                placeholder="En az 6 karakter"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword
                leftIcon={<Lock size={18} color={colors.textSecondary} />}
              />

              <Input
                label="Yeni Şifre Tekrar"
                placeholder="Şifrenizi tekrar girin"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                leftIcon={<Lock size={18} color={colors.textSecondary} />}
              />

              <Button
                title="Şifreyi Güncelle ve Giriş Yap"
                variant="primary"
                onPress={handleResetPassword}
                loading={loading}
                style={styles.submitBtn}
              />

              <TouchableOpacity
                onPress={() => setStep(1)}
                style={styles.retryEmailBtn}
              >
                <Text style={styles.retryEmailText}>
                  Farklı bir e-posta adresi dene
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 16,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 6,
    fontSize: 18,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 10,
  },
  retryEmailBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  retryEmailText: {
    color: colors.accentLight,
    fontSize: 13,
    fontWeight: '600',
  },
});
