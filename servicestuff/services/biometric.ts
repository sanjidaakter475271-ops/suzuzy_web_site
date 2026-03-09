import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

const BIO_ENABLED_KEY = 'service_biometrics_enabled';
const BIO_CREDS_KEY = 'service_bioman_creds';
const BIO_FAIL_COUNT = 'service_bio_fails';

export class BiometricService {
    static async isNative(): Promise<boolean> {
        return Capacitor.isNativePlatform();
    }

    static async isAvailable(): Promise<boolean> {
        if (!Capacitor.isNativePlatform()) return false;
        try {
            const info = await BiometricAuth.checkBiometry();
            return info.isAvailable;
        } catch {
            return false;
        }
    }

    static async isEnabled(): Promise<boolean> {
        const { value } = await Preferences.get({ key: BIO_ENABLED_KEY });
        return value === 'true';
    }

    static async setEnabled(enabled: boolean, credentials?: { email: string; pass: string }): Promise<void> {
        if (enabled) {
            await Preferences.set({ key: BIO_ENABLED_KEY, value: 'true' });
            if (credentials) {
                // Base64 encoding for simple obfuscation (In production use SecureStorage)
                const encoded = btoa(JSON.stringify(credentials));
                await Preferences.set({ key: BIO_CREDS_KEY, value: encoded });
            }
        } else {
            await Preferences.remove({ key: BIO_ENABLED_KEY });
            await Preferences.remove({ key: BIO_CREDS_KEY });
            await Preferences.remove({ key: BIO_FAIL_COUNT });
        }
    }

    static async getStoredCredentials(): Promise<{ email: string; pass: string } | null> {
        const { value } = await Preferences.get({ key: BIO_CREDS_KEY });
        if (!value) return null;
        try {
            return JSON.parse(atob(value));
        } catch {
            return null;
        }
    }

    static async authenticate(allowDeviceCredential = true): Promise<boolean> {
        try {
            await BiometricAuth.authenticate({
                reason: "Authenticate to login",
                cancelTitle: "Cancel",
                allowDeviceCredential,
            });
            // Reset fail count on success
            await Preferences.remove({ key: BIO_FAIL_COUNT });
            return true;
        } catch (error: any) {
            console.error("Biometric authentication failed", error);
            // Ignore manual cancellations
            if (error?.code !== 'userCancel' && !error?.message?.toLowerCase().includes('cancel')) {
                await this.incrementFailCount();
            }
            return false;
        }
    }

    static async incrementFailCount(): Promise<number> {
        const { value } = await Preferences.get({ key: BIO_FAIL_COUNT });
        const count = value ? parseInt(value, 10) + 1 : 1;
        await Preferences.set({ key: BIO_FAIL_COUNT, value: count.toString() });
        return count;
    }

    static async getFailCount(): Promise<number> {
        const { value } = await Preferences.get({ key: BIO_FAIL_COUNT });
        return value ? parseInt(value, 10) : 0;
    }

    static async resetFailCount(): Promise<void> {
        await Preferences.remove({ key: BIO_FAIL_COUNT });
    }
}
