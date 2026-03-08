import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const PushNotificationManager: React.FC = () => {
    useEffect(() => {
        const initializePush = async () => {
            try {
                // Skip entirely on web
                if (!Capacitor.isNativePlatform()) {
                    console.log('[PUSH] Push notifications are not supported on web. Skipping initialization.');
                    return;
                }

                // Dynamically import to prevent crashes if native module is unavailable
                let PushNotifications: any;
                let Device: any;
                try {
                    const pushModule = await import('@capacitor/push-notifications');
                    PushNotifications = pushModule.PushNotifications;
                    const deviceModule = await import('@capacitor/device');
                    Device = deviceModule.Device;
                } catch (importErr) {
                    console.warn('[PUSH] Failed to import push notification modules:', importErr);
                    return;
                }

                // 1. Check/Request Permissions (wrapped in its own try-catch)
                let permStatus;
                try {
                    permStatus = await PushNotifications.checkPermissions();
                } catch (permErr) {
                    console.warn('[PUSH] Failed to check permissions (FCM may not be configured):', permErr);
                    return;
                }

                if (permStatus.receive !== 'granted') {
                    try {
                        permStatus = await PushNotifications.requestPermissions();
                    } catch (reqErr) {
                        console.warn('[PUSH] Failed to request permissions:', reqErr);
                        return;
                    }
                }

                if (permStatus.receive !== 'granted') {
                    console.warn('[PUSH] Permissions not granted');
                    return;
                }

                // 2. Register for notifications (this is where FCM crash happens if not configured)
                try {
                    await PushNotifications.register();
                } catch (registerErr) {
                    console.warn('[PUSH] Failed to register for push notifications (google-services.json may be missing):', registerErr);
                    return; // Gracefully exit instead of crashing
                }

                // 3. Handle Token Registration
                PushNotifications.addListener('registration', async (token: any) => {
                    console.log('[PUSH] Registration token:', token.value);
                    try {
                        const info = await Device.getInfo();
                        const { TechnicianAPI } = await import('../services/api');
                        await TechnicianAPI.registerPushToken(
                            token.value,
                            info.platform || 'web',
                            info.model || 'Unknown Device'
                        );
                    } catch (err) {
                        console.error('[PUSH] Failed to register token with backend:', err);
                    }
                });

                PushNotifications.addListener('registrationError', (err: any) => {
                    console.error('[PUSH] Registration error:', err.error);
                });

                // 4. Handle Notification Events
                PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
                    console.log('[PUSH] Received:', notification);
                });

                PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
                    console.log('[PUSH] Action performed:', notification);
                });

            } catch (error) {
                // CRITICAL: Catch-all to prevent ANY crash from push notification setup
                console.error('[PUSH] Initialization error (non-fatal):', error);
            }
        };

        initializePush();

        // Cleanup on unmount
        return () => {
            if (Capacitor.isNativePlatform()) {
                import('@capacitor/push-notifications').then(({ PushNotifications }) => {
                    PushNotifications.removeAllListeners();
                }).catch(() => {
                    // Silently fail if module is unavailable
                });
            }
        };
    }, []);

    return null; // Side-effect only component
};
