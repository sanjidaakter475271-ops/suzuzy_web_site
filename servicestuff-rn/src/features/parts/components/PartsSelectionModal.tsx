import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    Modal,
    Platform,
    StyleSheet
} from 'react-native';
import {
    X,
    ChevronRight,
    ArrowLeft,
    Search,
    ShoppingCart,
    Package,
    Layers
} from '@/components/icons';
import { MotiView, AnimatePresence } from 'moti';
import { FlashList } from '@shopify/flash-list';
import { TechnicianAPI } from '@/lib/api';
import { Category, ProductDetail, ProductVariant } from '@/types';
import { RequisitionCart } from './RequisitionCart';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import { useJobStore } from '@/stores/jobStore';

interface PartsSelectionModalProps {
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'category' | 'products' | 'variants' | 'cart';

export const PartsSelectionModal: React.FC<PartsSelectionModalProps> = ({ jobId, onClose, onSuccess }) => {
    const [step, setStep] = useState<Step>('category');
    const { requestParts } = useJobStore();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
    const [products, setProducts] = useState<ProductDetail[]>([]);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<{ product: ProductDetail; variant?: ProductVariant; quantity: number }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await TechnicianAPI.getCategories();
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async (catId: string) => {
        setLoading(true);
        try {
            const res = await TechnicianAPI.getProductsByCategory(catId);
            if (res.data.success) {
                setProducts(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVariants = async (productId: string) => {
        setLoading(true);
        try {
            const res = await TechnicianAPI.getProductVariants(productId);
            if (res.data.success) {
                const fetchedVariants = res.data.data;
                setVariants(fetchedVariants);
                return fetchedVariants;
            }
        } catch (err) {
            console.error("Failed to fetch variants:", err);
        } finally {
            setLoading(false);
        }
        return [];
    };

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        fetchProducts(category.id);
        setStep('products');
    };

    const handleProductSelect = async (product: ProductDetail) => {
        setSelectedProduct(product);
        const fetchedVariants = await fetchVariants(product.id);

        if (fetchedVariants.length > 1) {
            setStep('variants');
        } else if (fetchedVariants.length === 1) {
            handleAddToCart(product, fetchedVariants[0]);
        } else {
            handleAddToCart(product);
        }
    };

    const handleAddToCart = (product: ProductDetail, variant?: ProductVariant) => {
        setCart(prev => {
            const matchId = variant ? variant.id : product.id;
            const existing = prev.find(item => (item.variant?.id || item.product.id) === matchId);

            if (existing) {
                return prev.map(item =>
                    (item.variant?.id || item.product.id) === matchId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, variant, quantity: 1 }];
        });
        if (step !== 'cart') setStep('products');
    };

    const updateCartQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item =>
            (item.variant?.id || item.product.id) === id
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        ));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => (item.variant?.id || item.product.id) !== id));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const items = cart.map(item => ({
                productId: item.product.id,
                variantId: item.variant?.id,
                quantity: item.quantity,
                notes: ""
            }));
            await requestParts(jobId, items);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Submission failed:", err);
            alert("Failed to submit requisition. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {step !== 'category' ? (
                    <TouchableOpacity onPress={() => setStep(step === 'variants' ? 'products' : 'category')} style={{ padding: 8, marginLeft: -8 }}>
                        <ArrowLeft size={24} color={COLORS.textTertiary} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 32 }} />
                )}
                <View>
                    <Text style={styles.headerTitle}>
                        {step === 'category' ? 'Select category' : step === 'variants' ? 'Select Variant' : selectedCategory?.name}
                    </Text>
                    <Text style={styles.headerStep}>
                        Step {step === 'category' ? '1' : step === 'products' ? '2' : '3'} of 3
                    </Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {cart.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setStep('cart')}
                        style={styles.cartButton}
                    >
                        <ShoppingCart size={20} color={COLORS.accent} />
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cart.length}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <X size={20} color={COLORS.textTertiary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={true}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {step !== 'cart' && (
                    <View style={{ flex: 1 }}>
                        {renderHeader()}

                        {step === 'products' && (
                            <View style={styles.searchBarContainer}>
                                <View style={styles.searchBar}>
                                    <Search size={18} color={COLORS.textTertiary} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search by part name or SKU..."
                                        placeholderTextColor={COLORS.textTertiary}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>
                            </View>
                        )}

                        <View style={{ flex: 1 }}>
                            {loading && (products.length === 0 && categories.length === 0) ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={COLORS.accent} />
                                    <Text style={styles.loadingText}>Synchronizing Catalog...</Text>
                                </View>
                            ) : step === 'category' ? (
                                <FlashList
                                    data={categories}
                                    numColumns={2}
                                    contentContainerStyle={{ padding: 16 }}
                                    estimatedItemSize={150}
                                    renderItem={({ item, index }) => (
                                        <MotiView
                                            from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                                            animate={{ opacity: 1, scale: 1, translateY: 0 }}
                                            transition={{ type: 'timing', duration: 300, delay: index * 50 }}
                                            style={{ flex: 1, padding: 8 }}
                                        >
                                            <TouchableOpacity
                                                onPress={() => handleCategorySelect(item)}
                                                style={styles.categoryCard}
                                                activeOpacity={0.8}
                                            >
                                                <View style={styles.categoryIconContainer}>
                                                    <Layers color={COLORS.textSecondary} size={32} />
                                                </div>
                                                <Text style={styles.categoryName}>{item.name}</Text>
                                            </TouchableOpacity>
                                        </MotiView>
                                    )}
                                />
                            ) : step === 'products' ? (
                                <FlashList
                                    data={filteredProducts}
                                    contentContainerStyle={{ padding: 16 }}
                                    estimatedItemSize={120}
                                    renderItem={({ item, index }) => {
                                        const inCart = cart.some(c => c.product.id === item.id);
                                        return (
                                            <MotiView
                                                from={{ opacity: 0, translateX: -20 }}
                                                animate={{ opacity: 1, translateX: 0 }}
                                                transition={{ type: 'timing', duration: 300, delay: index * 30 }}
                                                style={styles.productCard}
                                            >
                                                <View style={styles.productImageContainer}>
                                                    {item.image_url ? (
                                                        <Image source={{ uri: item.image_url }} style={styles.productImage} />
                                                    ) : (
                                                        <Package color={COLORS.borderStrong} size={32} />
                                                    )}
                                                </View>
                                                <View style={{ flex: 1, marginLeft: 16 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.productName}>{item.name}</Text>
                                                            <Text style={styles.productBrand}>{item.brand || 'No Brand'}</Text>
                                                        </View>
                                                        <View style={{ alignItems: 'flex-end' }}>
                                                            <Text style={styles.productPrice}>৳{item.base_price.toLocaleString()}</Text>
                                                            <Text style={[styles.stockText, { color: item.stock_quantity > 0 ? COLORS.success : COLORS.danger }]}>
                                                                {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of stock'}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                                                        <TouchableOpacity
                                                            onPress={() => handleProductSelect(item)}
                                                            disabled={item.stock_quantity <= 0}
                                                            style={[styles.addBtn, item.stock_quantity <= 0 && { opacity: 0.3 }]}
                                                        >
                                                            <Text style={styles.addBtnText}>
                                                                {item.has_variants ? 'View Variants' : inCart ? 'Add More' : 'Add to request'}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </MotiView>
                                        );
                                    }}
                                />
                            ) : (
                                <View style={{ flex: 1, padding: 16 }}>
                                    <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>{selectedProduct?.name}</Text>
                                    <FlashList
                                        data={variants}
                                        estimatedItemSize={80}
                                        renderItem={({ item }) => {
                                            const inCart = cart.find(c => c.variant?.id === item.id);
                                            const attrString = Object.entries(item.attributes || {})
                                                .map(([k, v]) => `${k}: ${v}`).join(', ');

                                            return (
                                                <TouchableOpacity
                                                    onPress={() => handleAddToCart(selectedProduct!, item)}
                                                    style={styles.variantCard}
                                                >
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.variantName}>{attrString || item.sku}</Text>
                                                        <Text style={styles.variantSku}>{item.sku}</Text>
                                                    </View>
                                                    <View style={{ alignItems: 'flex-end' }}>
                                                        <Text style={styles.productPrice}>৳{item.price.toLocaleString()}</Text>
                                                        <Text style={[styles.stockText, { color: item.stock_quantity > 0 ? COLORS.success : COLORS.danger }]}>
                                                            {item.stock_quantity} in stock
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        }}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {step === 'cart' && (
                    <RequisitionCart
                        items={cart}
                        onUpdateQuantity={updateCartQuantity}
                        onRemove={removeFromCart}
                        onSubmit={handleSubmit}
                        onBack={() => setStep('products')}
                        isSubmitting={isSubmitting}
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.pageBg,
    },
    header: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.cardBg,
        ...SHADOWS.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerStep: {
        fontSize: 10,
        color: COLORS.accent,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 2,
    },
    cartButton: {
        padding: 10,
        backgroundColor: COLORS.accentSurface,
        borderWidth: 1,
        borderColor: COLORS.accent + '20',
        borderRadius: 16,
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.danger,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.cardBg,
    },
    cartBadgeText: {
        color: 'white',
        fontSize: 8,
        fontWeight: '900',
    },
    closeButton: {
        padding: 10,
        backgroundColor: COLORS.pageBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchBarContainer: {
        padding: 16,
        backgroundColor: COLORS.pageBg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        ...SHADOWS.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: COLORS.textTertiary,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    categoryCard: {
        aspectRatio: 1,
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        ...SHADOWS.sm,
    },
    categoryIconContainer: {
        width: 64,
        height: 64,
        backgroundColor: COLORS.cardBgAlt,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    categoryName: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 13,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 24,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.sm,
    },
    productImageContainer: {
        width: 80,
        height: 80,
        backgroundColor: COLORS.cardBgAlt,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    productName: {
        color: COLORS.textPrimary,
        fontWeight: '900',
        textTransform: 'uppercase',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    productBrand: {
        fontSize: 10,
        color: COLORS.textTertiary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '900',
        color: COLORS.accent,
    },
    stockText: {
        fontSize: 9,
        fontWeight: 'bold',
        marginTop: 4,
    },
    addBtn: {
        backgroundColor: COLORS.cardBgAlt,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    addBtnText: {
        color: COLORS.accent,
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    variantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        ...SHADOWS.sm,
    },
    variantName: {
        color: COLORS.textPrimary,
        fontSize: 13,
        fontWeight: 'bold',
    },
    variantSku: {
        color: COLORS.textTertiary,
        fontSize: 10,
        marginTop: 2,
    }
});
