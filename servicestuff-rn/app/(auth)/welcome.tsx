import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { storage } from '@/lib/storage';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
    const router = useRouter();

    const handleGetStarted = async () => {
        storage.set('servicemate_onboarded', true);
        router.replace('/login');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1e3a8a', '#1e40af', '#020617']}
                style={StyleSheet.absoluteFill}
            />

            {/* Top Hero Section */}
            <View style={styles.heroSection}>
                {/* Decorative dots */}
                <MotiView
                    animate={{ translateY: [0, -20, 0] }}
                    transition={{ loop: true, duration: 4000, type: 'timing' }}
                    style={[styles.decoDot, { top: '20%', left: '20%', backgroundColor: '#facc15' }]}
                />
                <MotiView
                    animate={{ translateY: [0, 20, 0] }}
                    transition={{ loop: true, duration: 5000, type: 'timing' }}
                    style={[styles.decoDot, { top: '30%', right: '25%', backgroundColor: 'white', opacity: 0.5 }]}
                />

                <MotiView
                    from={{ opacity: 0, scale: 0.9, translateY: 30 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 800 }}
                    style={styles.heroContainer}
                >
                    <View style={styles.heroBackglow} />
                    {/* Placeholder for hero image */}
                    <View style={styles.heroPlaceholder}>
                        <Wrench size={100} color="rgba(255,255,255,0.2)" />
                    </View>
                </MotiView>
            </View>

            {/* Bottom Content Card */}
            <MotiView
                from={{ translateY: 100, opacity: 0 }}
                animate={{ translateY: 0, opacity: 1 }}
                transition={{ type: 'spring', delay: 200, damping: 25 }}
                style={styles.bottomCard}
            >
                <View style={styles.cardHeaderLine} />

                {/* Indicators */}
                <View style={styles.indicatorContainer}>
                    <View style={[styles.indicator, styles.indicatorActive]} />
                    <View style={styles.indicator} />
                    <View style={styles.indicator} />
                </View>

                <Text style={styles.title}>ServiceMate App</Text>
                <Text style={styles.description}>
                    You are a few clicks away to enter the world of smart service management.
                </Text>

                <TouchableOpacity
                    onPress={handleGetStarted}
                    style={styles.button}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                    <MotiView
                        from={{ translateX: -100 }}
                        animate={{ translateX: 400 }}
                        transition={{ loop: true, duration: 2000, type: 'timing' }}
                        style={styles.buttonGlow}
                    />
                </TouchableOpacity>
            </MotiView>
        </View>
    );
}

import { Wrench } from '@/components/icons';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    heroSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    decoDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
    heroContainer: { width: '80%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
    heroBackglow: { position: 'absolute', width: '90%', height: '90%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999 },
    heroPlaceholder: { position: 'relative', zIndex: 10, alignItems: 'center', justifyContent: 'center' },
    bottomCard: {
        backgroundColor: '#0f172a',
        borderTopLeftRadius: 48,
        borderTopRightRadius: 48,
        paddingTop: 40,
        paddingBottom: 60,
        paddingHorizontal: 32,
        alignItems: 'center',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.3,
        shadowRadius: 20
    },
    cardHeaderLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 6, backgroundColor: '#2563eb', borderTopLeftRadius: 48, borderTopRightRadius: 48, opacity: 0.8 },
    indicatorContainer: { flexDirection: 'row', gap: 8, marginBottom: 32 },
    indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1e293b' },
    indicatorActive: { backgroundColor: '#3b82f6', width: 24 },
    title: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 16 },
    description: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24, marginBottom: 40, paddingHorizontal: 20 },
    button: { width: '100%', backgroundColor: '#2563eb', borderRadius: 28, paddingVertical: 20, alignItems: 'center', overflow: 'hidden' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    buttonGlow: { position: 'absolute', top: 0, bottom: 0, width: 50, backgroundColor: 'rgba(255,255,255,0.2)', transform: [{ skewX: '-20deg' }] }
});
