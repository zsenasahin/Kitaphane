import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react-native';
import { colors } from '../theme/colors';

export interface ToastMessage {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle size={20} color={colors.error} />;
      case 'success':
        return <CheckCircle2 size={20} color={colors.success} />;
      case 'info':
      case 'warning':
        return <Info size={20} color={colors.warning} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'info':
        return colors.info;
      case 'warning':
        return colors.warning;
    }
  };

  return (
    <View style={[styles.container, { borderColor: getBorderColor() }]}>
      <View style={styles.icon}>{getIcon()}</View>
      <Text style={styles.message} numberOfLines={3}>
        {toast.message}
      </Text>
      <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
        <X size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderLeftWidth: 4,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  message: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
