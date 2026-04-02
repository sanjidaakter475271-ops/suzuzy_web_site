import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { COLORS } from '../../constants/theme';

interface LoadingProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Material Design 3 style Circular Progress Indicator
 */
export const MaterialCircularProgress: React.FC<LoadingProps> = ({
  size = 40,
  color = COLORS.primary,
  strokeWidth = 4
}) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <MotiView
        from={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        transition={{
          type: 'timing',
          duration: 1400,
          loop: true,
          easing: Easing.linear,
        }}
        style={styles.spinnerContainer}
      >
        <MotiView
          from={{ opacity: 0.3, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'timing',
            duration: 700,
            loop: true,
          }}
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: 'transparent',
              borderLeftColor: 'transparent',
            }
          ]}
        />
      </MotiView>
    </View>
  );
};

/**
 * Material Design 3 style Linear Progress Indicator (Indeterminate)
 */
export const MaterialLinearProgress: React.FC<{ color?: string, height?: number }> = ({
  color = COLORS.primary,
  height = 4
}) => {
  return (
    <View style={[styles.linearContainer, { height, backgroundColor: color + '20' }]}>
      <MotiView
        from={{ translateX: -100 }}
        animate={{ translateX: 400 }}
        transition={{
          type: 'timing',
          duration: 1500,
          loop: true,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }}
        style={[styles.linearFill, { backgroundColor: color }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderStyle: 'solid',
  },
  linearContainer: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  linearFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '30%',
    borderRadius: 2,
  }
});
