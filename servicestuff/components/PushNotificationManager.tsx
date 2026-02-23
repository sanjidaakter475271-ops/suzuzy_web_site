import React, { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { TechnicianAPI } from '../services/api';

export const PushNotificationManager: React.FC = () => {
    useEffect(() => {
        const initializePush = async () => {
            try {
                // 1. Check/Request Permissions
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive !== 'granted') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== 'granted') {
                    console.warn('[PUSH] Permissions not granted');
                    return;
                }

                // 2. Register for notifications
                await PushNotifications.register();

                // 3. Handle Token Registration
                PushNotifications.addListener('registration', async (token) => {
                    console.log('[PUSH] Registration token:', token.value);
                    const info = await Device.getInfo();
                    try {
                        await TechnicianAPI.registerPushToken(
                            token.value,
                            info.platform || 'web',
                            info.model || 'Unknown Device'
                        );
                    } catch (err) {
                        console.error('[PUSH] Failed to register token with backend:', err);
                    }
                });

                PushNotifications.addListener('registrationError', (err) => {
                    console.error('[PUSH] Registration error:', err.error);
                });

                // 4. Handle Notification Events
                PushNotifications.addListener('pushNotificationReceived', (notification) => {
                    console.log('[PUSH] Received:', notification);
                    // You could trigger a local alert or update global state/notifications page
                });

                PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                    console.log('[PUSH] Action performed:', notification);
                    // You could navigate to a specific page based on notification data
                });

            } catch (error) {
                console.error('[PUSH] Initialization error:', error);
            }
        };

        initializePush();

        // Cleanup on unmount (optional, but keep listeners active while app is open)
        return () => {
            PushNotifications.removeAllListeners();
        };
    }, []);

    return null; // Side-effect only component
};
