import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BIO_ENABLED_KEY = 'service_biometrics_enabled';
const BIO_CREDS_KEY = 'service_bioman_creds';
const BIO_FAIL_COUNT = 'service_bio_fails';

export class BiometricService {
    static async isNative(): Promise<boolean> {
        return Platform.OS !== 'web';
    }

    static async isAvailable(): Promise<boolean> {
        if (Platform.OS === 'web') return false;
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            return hasHardware && isEnrolled;
        } catch {
            return false;
        }
    }

    static async isEnabled(): Promise<boolean> {
        const value = await AsyncStorage.getItem(BIO_ENABLED_KEY);
        return value === 'true';
    }

    static async setEnabled(enabled: boolean, credentials?: { email: string; pass: string }): Promise<void> {
        if (enabled) {
            await AsyncStorage.setItem(BIO_ENABLED_KEY, 'true');
            if (credentials) {
                // Using SecureStore for real security in React Native
                await SecureStore.setItemAsync(BIO_CREDS_KEY, JSON.stringify(credentials));
            }
        } else {
            await AsyncStorage.removeItem(BIO_ENABLED_KEY);
            await SecureStore.deleteItemAsync(BIO_CREDS_KEY);
            await AsyncStorage.removeItem(BIO_FAIL_COUNT);
        }
    }

    static async getStoredCredentials(): Promise<{ email: string; pass: string } | null> {
        const value = await SecureStore.getItemAsync(BIO_CREDS_KEY);
        if (!value) return null;
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }

    static async authenticate(): Promise<boolean> {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Authenticate to login",
                fallbackLabel: "Use Passcode",
                disableDeviceFallback: false,
            });

            if (result.success) {
                // Reset fail count on success
                await AsyncStorage.removeItem(BIO_FAIL_COUNT);
                return true;
            } else {
                if (result.error !== 'user_cancel' && result.error !== 'app_cancel') {
                    await this.incrementFailCount();
                }
                return false;
            }
        } catch (error) {
            console.error("Biometric authentication failed", error);
            return false;
        }
    }

    static async incrementFailCount(): Promise<number> {
        const value = await AsyncStorage.getItem(BIO_FAIL_COUNT);
        const count = value ? parseInt(value, 10) + 1 : 1;
        await AsyncStorage.setItem(BIO_FAIL_COUNT, count.toString());
        return count;
    }

    static async getFailCount(): Promise<number> {
        const value = await AsyncStorage.getItem(BIO_FAIL_COUNT);
        return value ? parseInt(value, 10) : 0;
    }

    static async resetFailCount(): Promise<void> {
        await AsyncStorage.removeItem(BIO_FAIL_COUNT);
    }
}
