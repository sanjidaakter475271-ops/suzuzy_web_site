import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    style,
    textStyle,
    icon
}) => {
    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const isDanger = variant === 'danger';
    const isSuccess = variant === 'success';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
            style={[
                styles.base,
                styles[variant],
                styles[size],
                disabled && styles.disabled,
                style
            ]}
        >
            {isLoading ? (
                <ActivityIndicator color={isOutline ? COLORS.primary : COLORS.white} size="small" />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text
                        style={[
                            styles.textBase,
                            styles[`${size}Text` as keyof typeof styles],
                            isOutline ? styles.outlineText : styles.filledText,
                            isDanger && styles.whiteText,
                            isSuccess && styles.whiteText,
                            textStyle
                        ]}
                    >
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: BORDER_RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: SPACING.sm,
    },
    // Variants
    primary: {
        backgroundColor: COLORS.primary,
    },
    secondary: {
        backgroundColor: COLORS.primarySurface,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        shadowOpacity: 0,
        elevation: 0,
    },
    danger: {
        backgroundColor: COLORS.danger,
    },
    success: {
        backgroundColor: COLORS.success,
    },
    disabled: {
        opacity: 0.5,
    },
    // Sizes
    sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    md: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    lg: {
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    // Text Styles
    textBase: {
        fontFamily: TYPOGRAPHY.families.bold,
        textAlign: 'center',
    },
    smText: {
        fontSize: TYPOGRAPHY.sizes.xs,
    },
    mdText: {
        fontSize: TYPOGRAPHY.sizes.md,
    },
    lgText: {
        fontSize: TYPOGRAPHY.sizes.lg,
    },
    filledText: {
        color: COLORS.white,
    },
    outlineText: {
        color: COLORS.primary,
    },
    whiteText: {
        color: COLORS.white,
    }
});
