import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { MailCheck, X, RefreshCw } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Toast, ToastMessage } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';

interface VerifyEmailModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({
  visible,
  email,
  onClose,
  onSuccess,
}) => {
  const { verifyOtp, resendVerificationEmail } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (visible && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [visible, countdown]);

  const handleVerify = async () => {
    if (!code.trim() || code.trim().length < 6) {
      setToast({
        type: 'error',
        message: 'Lütfen e-postanıza gönderilen 6 haneli doğrulama kodunu girin.',
      });
      return;
    }

    setLoading(true);
    setToast(null);

    const { error } = await verifyOtp(email, code.trim(), 'signup');
    setLoading(false);

    if (error) {
      setToast({ type: 'error', message: error });
    } else {
      setToast({
        type: 'success',
        message: 'E-postanız başarıyla doğrulandı! Giriş yapılıyor...',
      });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setToast(null);

    const { error } = await resendVerificationEmail(email);
    setResending(false);

    if (error) {
      setToast({ type: 'error', message: error });
    } else {
      setCountdown(60);
      setToast({
        type: 'success',
        message: 'Yeni doğrulama kodu e-posta adresinize gönderildi.',
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
          >
            <View style={styles.card}>
              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <MailCheck size={28} color={colors.primary} />
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.title}>E-posta Doğrulama</Text>
              <Text style={styles.subtitle}>
                <Text style={styles.emailHighlight}>{email}</Text> adresine bir onay
                kodu gönderdik. Lütfen gelen kutunuzu (ve gereksiz/spam klasörünü) kontrol
                edip 6 haneli kodu girin.
              </Text>

              <Toast toast={toast} onDismiss={() => setToast(null)} />

              <Input
                label="6 Haneli Doğrulama Kodu"
                placeholder="Örn: 123456"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={8}
                style={styles.codeInput}
              />

              <Button
                title="Doğrula ve Giriş Yap"
                variant="primary"
                onPress={handleVerify}
                loading={loading}
                style={styles.verifyBtn}
              />

              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  💡 E-posta birkaç dakika gecikebilir veya <Text style={{ fontWeight: '700', color: colors.primary }}>Spam / Gereksiz</Text> klasörüne düşmüş olabilir. Gelen kutunuzda kod yerine onay bağlantısı varsa doğrudan bağlantıya tıklayabilirsiniz.
                </Text>
              </View>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Kod ulaşmadı mı?</Text>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={countdown > 0 || resending}
                  style={styles.resendBtn}
                >
                  <RefreshCw
                    size={14}
                    color={countdown > 0 ? colors.textTertiary : colors.accentLight}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.resendBtnText,
                      countdown > 0 && styles.resendDisabledText,
                    ]}
                  >
                    {countdown > 0
                      ? `Tekrar Gönder (${countdown}s)`
                      : 'Kodu Tekrar Gönder'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  emailHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 20,
    fontWeight: '700',
  },
  verifyBtn: {
    marginTop: 8,
    marginBottom: 12,
  },
  tipBox: {
    backgroundColor: colors.surfaceVariant,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  tipText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  resendText: {
    color: colors.textTertiary,
    fontSize: 13,
    marginRight: 6,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendBtnText: {
    color: colors.accentLight,
    fontSize: 13,
    fontWeight: '600',
  },
  resendDisabledText: {
    color: colors.textTertiary,
  },
});
