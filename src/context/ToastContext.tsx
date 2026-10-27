import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import { radius, shadow } from '../theme/themes';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/** Veritabanı/ağ hatalarını kullanıcının anlayacağı Türkçe mesajlara çevirir. */
export const friendlyError = (msg: string): string => {
  const m = msg.toLowerCase();
  if (m.includes('row-level security')) return 'Bu işlem için veritabanı izni eksik. Lütfen daha sonra tekrar dene.';
  if (m.includes('bucket not found')) return 'Fotoğraf deposu henüz kurulmamış.';
  if (m.includes('check constraint')) return 'Girilen değer kabul edilmedi. Lütfen bilgileri kontrol et.';
  if (m.includes('duplicate key')) return 'Bu kayıt zaten mevcut.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'İnternet bağlantısı kurulamadı.';
  return msg;
};
const useNative = Platform.OS !== 'web';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message: type === 'error' ? friendlyError(message) : message, type });
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, friction: 7, tension: 70, useNativeDriver: useNative }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: useNative }).start(() =>
          setToast(null)
        );
      }, type === 'error' ? 5000 : 2600);
    },
    [anim]
  );

  const color =
    toast?.type === 'error' ? theme.danger : toast?.type === 'info' ? theme.primary : theme.success;
  const Icon = toast?.type === 'error' ? AlertCircle : toast?.type === 'info' ? Info : CheckCircle2;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            { top: insets.top + 10 },
            {
              opacity: anim,
              transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) },
                { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.toast,
              { backgroundColor: theme.card, borderColor: theme.border },
              shadow(theme, 3),
            ]}
          >
            <View style={[styles.dot, { backgroundColor: color + '22' }]}>
              <Icon size={16} color={color} />
            </View>
            <Text style={[styles.text, { color: theme.text }]} numberOfLines={4}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 999 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 16,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 420,
  },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  text: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
});
