import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { ChevronLeft, Star } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { fonts, hashString, radius } from '../theme/themes';

export const useNativeDriver = Platform.OS !== 'web';

/* ------------------------------------------------------------------ */
/* Basınca hafifçe küçülen dokunma alanı                               */
/* ------------------------------------------------------------------ */
interface PressableScaleProps {
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  scaleTo?: number;
  disabled?: boolean;
  hitSlop?: number;
  accessibilityLabel?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PressableScale: React.FC<PressableScaleProps> = ({
  onPress,
  onLongPress,
  style,
  children,
  scaleTo = 0.96,
  disabled,
  hitSlop,
  accessibilityLabel,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, friction: 6, tension: 220, useNativeDriver }).start();
  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => to(scaleTo)}
      onPressOut={() => to(1)}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.5 }]}
    >
      {children}
    </AnimatedPressable>
  );
};

/* ------------------------------------------------------------------ */
/* Avatar: fotoğraf yoksa baş harfli pastel daire                      */
/* ------------------------------------------------------------------ */
export const Avatar: React.FC<{
  name?: string | null;
  url?: string | null;
  size?: number;
  ring?: boolean;
}> = ({ name, url, size = 40, ring }) => {
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);
  const label = (name || '?').trim();
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toLocaleUpperCase('tr'))
    .join('');
  const bg = theme.spines[hashString(label) % theme.spines.length];

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        ring && { borderWidth: Math.max(2, size * 0.05), borderColor: theme.card },
      ]}
    >
      {url && !failed ? (
        <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} onError={() => setFailed(true)} />
      ) : (
        <Text style={{ fontFamily: fonts.serif, fontWeight: '700', fontSize: size * 0.38, color: '#3B2E2A' }}>
          {initials || '?'}
        </Text>
      )}
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* İlerleme çubuğu ve halkası                                          */
/* ------------------------------------------------------------------ */
export const ProgressBar: React.FC<{ value: number; color?: string; track?: string; height?: number }> = ({
  value,
  color,
  track,
  height = 6,
}) => {
  const { theme } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const v = Math.max(0, Math.min(1, value || 0));
  useEffect(() => {
    Animated.timing(anim, { toValue: v, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [v]);
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track || theme.bgSoft, overflow: 'hidden' }}>
      <Animated.View
        style={{
          height,
          borderRadius: height,
          backgroundColor: color || theme.primary,
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressRing: React.FC<{
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}> = ({ value, size = 84, stroke = 8, color, track, children }) => {
  const { theme } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const anim = useRef(new Animated.Value(0)).current;
  const v = Math.max(0, Math.min(1, value || 0));
  useEffect(() => {
    Animated.timing(anim, { toValue: v, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [v]);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track || theme.bgSoft} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color || theme.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={anim.interpolate({ inputRange: [0, 1], outputRange: [c, 0] }) as any}
        />
      </Svg>
      {children}
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Yıldız puanı                                                        */
/* ------------------------------------------------------------------ */
export const Stars: React.FC<{ value: number; size?: number; onChange?: (v: number) => void; gap?: number }> = ({
  value,
  size = 14,
  onChange,
  gap = 2,
}) => {
  const { theme } = useTheme();
  const gold = theme.dark ? '#F2D48F' : '#E8B04B';
  return (
    <View style={{ flexDirection: 'row', gap }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value);
        const star = <Star size={size} color={filled ? gold : theme.textMuted} fill={filled ? gold : 'transparent'} />;
        return onChange ? (
          <PressableScale key={i} onPress={() => onChange(i)} scaleTo={0.8} hitSlop={6}>
            {star}
          </PressableScale>
        ) : (
          <View key={i}>{star}</View>
        );
      })}
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Çip / etiket                                                        */
/* ------------------------------------------------------------------ */
export const Chip: React.FC<{
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  color?: string;
}> = ({ label, active, onPress, icon, color }) => {
  const { theme } = useTheme();
  const c = color || theme.primary;
  return (
    <PressableScale
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: radius.pill,
        backgroundColor: active ? c : theme.card,
        borderWidth: 1,
        borderColor: active ? c : theme.border,
      }}
    >
      {icon}
      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? theme.onPrimary : theme.textSoft }}>{label}</Text>
    </PressableScale>
  );
};

/* ------------------------------------------------------------------ */
/* Boş durum                                                           */
/* ------------------------------------------------------------------ */
export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  text?: string;
  action?: { label: string; onPress: () => void };
}> = ({ icon, title, text, action }) => {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 }}>
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: theme.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        {icon}
      </View>
      <Text style={{ fontFamily: fonts.serif, fontSize: 19, fontWeight: '700', color: theme.text, textAlign: 'center' }}>
        {title}
      </Text>
      {text ? (
        <Text style={{ fontSize: 14, color: theme.textSoft, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>{text}</Text>
      ) : null}
      {action ? (
        <PressableScale
          onPress={action.onPress}
          style={{
            marginTop: 20,
            backgroundColor: theme.primary,
            paddingHorizontal: 22,
            paddingVertical: 12,
            borderRadius: radius.pill,
          }}
        >
          <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>{action.label}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Yuvarlak ikon butonu                                                */
/* ------------------------------------------------------------------ */
export const IconButton: React.FC<{
  onPress?: () => void;
  children: React.ReactNode;
  size?: number;
  bg?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}> = ({ onPress, children, size = 40, bg, style, accessibilityLabel }) => {
  const { theme } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.88}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg || theme.card,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {children}
    </PressableScale>
  );
};

/* ------------------------------------------------------------------ */
/* Üst başlık (geri butonlu sayfalar için)                             */
/* ------------------------------------------------------------------ */
export const ScreenHeader: React.FC<{ title?: string; onBack?: () => void; right?: React.ReactNode }> = ({
  title,
  onBack,
  right,
}) => {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 }}>
      {onBack ? (
        <IconButton onPress={onBack} bg={theme.card} accessibilityLabel="Geri">
          <ChevronLeft size={22} color={theme.text} />
        </IconButton>
      ) : null}
      <Text
        numberOfLines={1}
        style={{ flex: 1, fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', color: theme.text }}
      >
        {title}
      </Text>
      {right}
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Alt sayfa (bottom sheet)                                            */
/* ------------------------------------------------------------------ */
export const BottomSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: number | `${number}%`;
  fullHeight?: boolean;
}> = ({ visible, onClose, children, maxHeight = '88%', fullHeight }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.spring(anim, { toValue: 1, friction: 9, tension: 65, useNativeDriver }).start();
    } else if (mounted) {
      Animated.timing(anim, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver }).start(() =>
        setMounted(false)
      );
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlay, opacity: anim }]} />
        </TouchableWithoutFeedback>
        <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
          <Animated.View
            style={{
              backgroundColor: theme.bg,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              maxHeight,
              height: fullHeight ? maxHeight : undefined,
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }],
            }}
          >
            <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
              <View style={{ width: 42, height: 5, borderRadius: 3, backgroundColor: theme.border }} />
            </View>
            {children}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Bölüm başlığı                                                       */
/* ------------------------------------------------------------------ */
export const SectionTitle: React.FC<{ title: string; action?: { label: string; onPress: () => void } }> = ({
  title,
  action,
}) => {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
      <Text style={{ fontFamily: fonts.serif, fontSize: 19, fontWeight: '700', color: theme.text }}>{title}</Text>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.primary }}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Göreli zaman                                                        */
/* ------------------------------------------------------------------ */
export const timeAgo = (iso: string): string => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'şimdi';
  if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}sa`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}g`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};
