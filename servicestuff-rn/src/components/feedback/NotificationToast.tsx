import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { Bell, ChevronRight, X, Info, CheckCircle, AlertCircle, Package } from '@/components/icons';
import { MotiView, MotiText } from 'moti';

const { width } = Dimensions.get('window');

export interface ToastData {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'job' | 'parts';
  onPress?: () => void;
  onClose?: () => void;
}

interface NotificationToastProps {
  toast: ToastData | null;
  onClear: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toast, onClear }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: Platform.OS === 'ios' ? 50 : 20,
          useNativeDriver: true,
          tension: 80,
          friction: 8
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();

      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        hideToast();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => onClear());
  };

  if (!toast) return null;

  const getIcon = () => {
    const size = 22;
    switch (toast.type) {
      case 'success': return <CheckCircle color={COLORS.success} size={size} />;
      case 'error': return <AlertCircle color={COLORS.danger} size={size} />;
      case 'parts': return <Package color={COLORS.accent} size={size} />;
      case 'job': return <Bell color={COLORS.primaryLight} size={size} />;
      default: return <Info color={COLORS.info} size={size} />;
    }
  };

  const getAccentColor = () => {
    switch (toast.type) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.danger;
      case 'parts': return COLORS.accent;
      case 'job': return COLORS.primaryLight;
      default: return COLORS.info;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (toast.onPress) toast.onPress();
          hideToast();
        }}
        style={styles.toast}
      >
        <View style={[styles.accentLine, { backgroundColor: getAccentColor() }]} />

        <View style={styles.iconContainer}>
          {getIcon()}
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{toast.title}</Text>
          <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
        </View>

        <TouchableOpacity
          onPress={hideToast}
          style={styles.closeButton}
        >
          <X size={16} color={COLORS.slate500} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  toast: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: TYPOGRAPHY.families.bold,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.white,
    marginBottom: 2,
  },
  message: {
    fontFamily: TYPOGRAPHY.families.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  closeButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  }
});
