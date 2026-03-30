import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Camera, RefreshCw } from 'lucide-react-native';
import { MotiView } from 'moti';

interface ScannerProps {
    onScan: (result: string) => void;
    onClose: () => void;
    message?: string;
}

export const BarcodeScannerComponent: React.FC<ScannerProps> = ({ onScan, onClose, message }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (!permission || !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) {
        // Camera permissions are still loading
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white' }}>Requesting camera permission...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={styles.container}>
                <Text style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>
                    We need your permission to show the camera
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    style={{ backgroundColor: '#2563eb', padding: 16, borderRadius: 12 }}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#64748b' }}>Cancel</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (!scanned) {
            setScanned(true);
            onScan(data);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "code128", "ean13", "ean8"],
                }}
            >
                <View style={styles.overlay}>
                    {/* Dark edges with center cutout */}
                    <View style={styles.unfocusedContainer}></View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.unfocusedContainer}></View>
                        <View style={styles.focusedContainer}>
                            {/* Corner markers */}
                            <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 }]} />
                            <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 }]} />
                            <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 }]} />
                            <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 }]} />

                            {/* Animated scanning line */}
                            <MotiView
                                from={{ translateY: 20, opacity: 0 }}
                                animate={{ translateY: 230, opacity: 1 }}
                                transition={{
                                    type: 'timing',
                                    duration: 2000,
                                    loop: true,
                                }}
                                style={styles.scanLine}
                            />
                        </View>
                        <View style={styles.unfocusedContainer}></View>
                    </View>
                    <View style={styles.unfocusedContainer}></View>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLabel}>
                            <Text style={styles.headerText}>Scan</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.statusPanel}>
                            <View style={styles.cameraIconBg}>
                                <Camera size={20} color="#60a5fa" />
                            </View>
                            <Text style={styles.footerMessage}>{message || "Align within the frame"}</Text>
                            <Text style={styles.footerSubtext}>Scanning for Data</Text>
                        </View>
                    </View>
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center'
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center'
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(2, 6, 23, 0.7)'
    },
    focusedContainer: {
        width: 250,
        height: 250,
        position: 'relative'
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#60a5fa',
        borderRadius: 4
    },
    scanLine: {
        position: 'absolute',
        left: 20,
        right: 20,
        height: 2,
        backgroundColor: '#ef4444',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10
    },
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerLabel: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    headerText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    closeBtn: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
        alignItems: 'center'
    },
    statusPanel: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 24,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        width: '100%',
        alignItems: 'center'
    },
    cameraIconBg: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8
    },
    footerMessage: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14
    },
    footerSubtext: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 4
    }
});
