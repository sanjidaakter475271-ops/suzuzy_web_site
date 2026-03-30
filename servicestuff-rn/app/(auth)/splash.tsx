import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Splash() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/welcome');
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const letters = ['S', 'E', 'R', 'V', 'I', 'C', 'E', 'M', 'A', 'T', 'E'];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1e3a8a', '#1e40af', '#312e81']}
                style={StyleSheet.absoluteFill}
            />

            {/* Background Decorative elements can be added here */}
            <View style={styles.decorativeBg}>
                <MotiView
                    from={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0.2 }}
                    transition={{
                        type: 'timing',
                        duration: 3000,
                        loop: true,
                        repeatReverse: true
                    }}
                    style={styles.glow}
                />
            </View>

            <View style={styles.content}>
                <MotiView
                    from={{ scale: 0.5, opacity: 0, translateY: 20 }}
                    animate={{ scale: 1, opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 1000 }}
                    style={styles.logoContainer}
                >
                    {/* Note: Placeholder for actual logo. Use local asset in real app */}
                    <View style={styles.logoPlaceholder}>
                        <Zap size={48} color="white" fill="white" />
                    </View>
                </MotiView>

                <View style={styles.letterContainer}>
                    {letters.map((letter, index) => (
                        <MotiText
                            key={index}
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 400, delay: 500 + (index * 80) }}
                            style={styles.letter}
                        >
                            {letter}
                        </MotiText>
                    ))}
                </View>

                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 800, delay: 1500 }}
                >
                    <Text style={styles.subtitle}>Smart Mechanic Workshop</Text>
                </MotiView>
            </View>
        </View>
    );
}

// Internal Zap icon since lucide-react-native is available
import { Zap } from 'lucide-react-native';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    decorativeBg: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', opacity: 0.4 },
    glow: { width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(59, 130, 246, 0.3)' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    logoContainer: {
        backgroundColor: '#0f172a',
        padding: 32,
        borderRadius: 40,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    logoPlaceholder: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
    letterContainer: { flexDirection: 'row', gap: 4 },
    letter: { fontSize: 32, fontWeight: '900', color: 'white', letterSpacing: 4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
    subtitle: { fontSize: 12, fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 3, marginTop: 16 }
});
