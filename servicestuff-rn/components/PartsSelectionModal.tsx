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
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { FlashList } from '@shopify/flash-list';
import { TechnicianAPI } from '../services/api';
import { Category, ProductDetail } from '../types';
import { RequisitionCart } from './RequisitionCart';

interface PartsSelectionModalProps {
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'category' | 'products' | 'cart';

export const PartsSelectionModal: React.FC<PartsSelectionModalProps> = ({ jobId, onClose, onSuccess }) => {
    const [step, setStep] = useState<Step>('category');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<ProductDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<{ product: ProductDetail; quantity: number }[]>([]);
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

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        fetchProducts(category.id);
        setStep('products');
    };

    const handleAddToCart = (product: ProductDetail) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateCartQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item =>
            item.product.id === productId
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        ));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const items = cart.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                notes: ""
            }));
            const res = await TechnicianAPI.requestParts(jobId, items);
            if (res.data.success) {
                onSuccess();
                onClose();
            }
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
                {step === 'products' ? (
                    <TouchableOpacity onPress={() => setStep('category')} style={{ padding: 8, marginLeft: -8 }}>
                        <ArrowLeft size={24} color="#94a3b8" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 32 }} />
                )}
                <View>
                    <Text style={styles.headerTitle}>
                        {step === 'category' ? 'Select category' : selectedCategory?.name}
                    </Text>
                    <Text style={styles.headerStep}>
                        Step {step === 'category' ? '1' : '2'} of 3
                    </Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {cart.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setStep('cart')}
                        style={styles.cartButton}
                    >
                        <ShoppingCart size={20} color="#3b82f6" />
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cart.length}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <X size={20} color="#94a3b8" />
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
                                    <Search size={18} color="#64748b" />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search by part name or SKU..."
                                        placeholderTextColor="#475569"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>
                            </View>
                        )}

                        <View style={{ flex: 1 }}>
                            {loading && products.length === 0 ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#3b82f6" />
                                    <Text style={styles.loadingText}>Loading Catalog...</Text>
                                </View>
                            ) : step === 'category' ? (
                                <FlashList
                                    data={categories}
                                    numColumns={2}
                                    contentContainerStyle={{ padding: 16 }}
                                    // @ts-ignore
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
                                                    <Layers color="#475569" size={32} />
                                                </View>
                                                <Text style={styles.categoryName}>{item.name}</Text>
                                            </TouchableOpacity>
                                        </MotiView>
                                    )}
                                />
                            ) : (
                                <FlashList
                                    data={filteredProducts}
                                    contentContainerStyle={{ padding: 16 }}
                                    // @ts-ignore
                                    estimatedItemSize={120}
                                    renderItem={({ item, index }) => {
                                        const inCart = cart.find(c => c.product.id === item.id);
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
                                                        <Package color="#1e293b" size={32} />
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
                                                            <Text style={[styles.stockText, { color: item.stock_quantity > 0 ? '#10b981' : '#f43f5e' }]}>
                                                                {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of stock'}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                                                        {inCart ? (
                                                            <View style={styles.cartControls}>
                                                                <TouchableOpacity
                                                                    onPress={() => updateCartQuantity(item.id, -1)}
                                                                    style={styles.cartControlBtn}
                                                                >
                                                                    <Text style={styles.cartControlText}>-</Text>
                                                                </TouchableOpacity>
                                                                <Text style={styles.cartQuantityText}>{inCart.quantity}</Text>
                                                                <TouchableOpacity
                                                                    onPress={() => updateCartQuantity(item.id, 1)}
                                                                    style={styles.cartControlBtn}
                                                                >
                                                                    <Text style={styles.cartControlText}>+</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        ) : (
                                                            <TouchableOpacity
                                                                onPress={() => handleAddToCart(item)}
                                                                disabled={item.stock_quantity <= 0}
                                                                style={[styles.addBtn, item.stock_quantity <= 0 && { opacity: 0.3 }]}
                                                            >
                                                                <Text style={styles.addBtnText}>Add to request</Text>
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </View>
                                            </MotiView>
                                        );
                                    }}
                                />
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
        backgroundColor: '#020617',
    },
    header: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(30, 41, 59, 0.5)',
        backgroundColor: '#0f172a',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: 'white',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerStep: {
        fontSize: 10,
        color: '#3b82f6',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 2,
    },
    cartButton: {
        padding: 10,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderRadius: 16,
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#f43f5e',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#0f172a',
    },
    cartBadgeText: {
        color: 'white',
        fontSize: 8,
        fontWeight: '900',
    },
    closeButton: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
    },
    searchBarContainer: {
        padding: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.3)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#020617',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        color: 'white',
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
        color: '#64748b',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    categoryCard: {
        aspectRatio: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    categoryIconContainer: {
        width: 64,
        height: 64,
        backgroundColor: '#020617',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    categoryName: {
        color: '#cbd5e1',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 13,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        padding: 16,
        marginBottom: 12,
    },
    productImageContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#020617',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
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
        color: '#f1f5f9',
        fontWeight: '900',
        textTransform: 'uppercase',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    productBrand: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '900',
        color: '#3b82f6',
    },
    stockText: {
        fontSize: 9,
        fontWeight: 'bold',
        marginTop: 4,
    },
    cartControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563eb',
        borderRadius: 12,
        padding: 4,
        elevation: 8,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    cartControlBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    cartControlText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartQuantityText: {
        paddingHorizontal: 12,
        color: 'white',
        fontWeight: '900',
        fontSize: 13,
    },
    addBtn: {
        backgroundColor: '#020617',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    addBtnText: {
        color: '#94a3b8',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
