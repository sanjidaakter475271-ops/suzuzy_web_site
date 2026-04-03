import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import { ShoppingCart, Trash2, Plus, Minus, Send, ArrowLeft } from '@/components/icons';
import { MotiView, AnimatePresence } from 'moti';
import { ProductDetail } from '@/types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

interface CartItem {
    product: ProductDetail;
    quantity: number;
    notes?: string;
}

interface RequisitionCartProps {
    items: CartItem[];
    onUpdateQuantity: (productId: string, delta: number) => void;
    onRemove: (productId: string) => void;
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

export const RequisitionCart: React.FC<RequisitionCartProps> = ({
    items,
    onUpdateQuantity,
    onRemove,
    onSubmit,
    onBack,
    isSubmitting
}) => {
    const total = items.reduce((sum, item) => sum + (item.product.sale_price || item.product.base_price) * item.quantity, 0);

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.pageBg }}>
            {/* Header */}
            <View style={{ padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.cardBg, ...SHADOWS.sm }}>
                <TouchableOpacity onPress={onBack} style={{ padding: 8, marginLeft: -8 }}>
                    <ArrowLeft size={24} color={COLORS.textTertiary} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ShoppingCart color={COLORS.primary} size={20} />
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary }}>Review Request</Text>
                </View>
                <View style={{ width: 32 }} />
            </View>

            {/* Cart Items */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                <AnimatePresence>
                    {items.map((item) => (
                        <MotiView
                            key={item.product.id}
                            from={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 24, padding: 16, marginBottom: 16, overflow: 'hidden', ...SHADOWS.sm }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ flexDirection: 'row', gap: 16, flex: 1 }}>
                                    <View style={{ width: 64, height: 64, backgroundColor: COLORS.cardBgAlt, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {item.product.image_url ? (
                                            <Image source={{ uri: item.product.image_url }} style={{ width: '100%', height: '100%' }} />
                                        ) : (
                                            <ShoppingCart color={COLORS.textTertiary} size={24} />
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 14 }} numberOfLines={1}>{item.product.name}</Text>
                                        <Text style={{ fontSize: 10, color: COLORS.textTertiary, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{item.product.brand}</Text>
                                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 }}>
                                            ৳{(item.product.sale_price || item.product.base_price).toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => onRemove(item.product.id)}
                                    style={{ padding: 8 }}
                                >
                                    <Trash2 size={18} color={COLORS.textTertiary} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginLeft: 80 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBgAlt, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 4 }}>
                                    <TouchableOpacity
                                        onPress={() => onUpdateQuantity(item.product.id, -1)}
                                        disabled={item.quantity <= 1}
                                        style={{ width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center', opacity: item.quantity <= 1 ? 0.3 : 1 }}
                                    >
                                        <Minus size={16} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary, width: 24, textAlign: 'center' }}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        onPress={() => onUpdateQuantity(item.product.id, 1)}
                                        style={{ width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Plus size={16} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 10, color: COLORS.textTertiary, textTransform: 'uppercase', fontWeight: '900' }}>Subtotal</Text>
                                    <Text style={{ fontSize: 14, fontWeight: '900', color: COLORS.textPrimary }}>
                                        ৳{((item.product.sale_price || item.product.base_price) * item.quantity).toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </MotiView>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
                        <ShoppingCart color={COLORS.borderStrong} size={48} />
                        <Text style={{ color: COLORS.textSecondary, fontWeight: 'bold', fontSize: 16, marginTop: 16 }}>Your cart is empty</Text>
                        <Text style={{ color: COLORS.textTertiary, fontSize: 14, marginTop: 4 }}>Go back and select some parts</Text>
                    </View>
                )}
            </ScrollView>

            {/* Footer Summary */}
            <View style={{ padding: 24, backgroundColor: COLORS.cardBg, borderTopWidth: 1, borderTopColor: COLORS.border, borderTopLeftRadius: 40, borderTopRightRadius: 40, ...SHADOWS.lg }}>
                <View style={{ gap: 12, marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>Items Selected</Text>
                        <Text style={{ fontWeight: 'bold', color: COLORS.textPrimary, fontSize: 14 }}>{items.length}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.divider }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary }}>Estimated Total</Text>
                        <Text style={{ fontSize: 24, fontWeight: '900', color: COLORS.primary }}>৳{total.toLocaleString()}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={onSubmit}
                    disabled={items.length === 0 || isSubmitting}
                    style={{ backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: (items.length === 0 || isSubmitting) ? 0.5 : 1, ...SHADOWS.md }}
                    activeOpacity={0.8}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Send size={18} color="white" />
                            <Text style={{ color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, fontSize: 14 }}>Send Requisition</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
