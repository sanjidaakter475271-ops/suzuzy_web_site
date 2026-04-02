import React, { useEffect, useRef } from 'react';
import { LocationService } from '../services/location';
import { SocketService } from '../services/socket';
import { TechnicianAPI } from '../services/api';
import { useAuth } from '../lib/auth';

export const LocationTracker: React.FC = () => {
    const { isAuthReady, user } = useAuth();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Only start tracking if auth is fully ready and user is logged in
        if (!isAuthReady || !user) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        const updateLocation = async () => {
            try {
                const location = await LocationService.getInstance().getCurrentLocation();
                if (location.lat !== 0 && location.lng !== 0) {
                    console.log('[HEARTBEAT] Sending location:', location);

                    // 1. Send via REST API
                    try {
                        await TechnicianAPI.updateLocation(location.lat, location.lng);
                    } catch (apiErr: any) {
                        console.error('[LOCATION_TRACKER] API Error:', apiErr);
                        // If 401, the API interceptor will handle redirect, we just stop tracking
                        if (apiErr.response?.status === 401) {
                            if (intervalRef.current) {
                                clearInterval(intervalRef.current);
                                intervalRef.current = null;
                            }
                        }
                    }

                    // 2. Emit via Socket
                    if (SocketService.getInstance().isConnected()) {
                        SocketService.getInstance().emit('technician:location', {
                            latitude: location.lat,
                            longitude: location.lng,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
            } catch (error) {
                console.error('[LOCATION_TRACKER] Error:', error);
            }
        };

        // Initial update with a 3-second delay to let socket/auth settle
        const initialDelay = setTimeout(() => {
            updateLocation();
            // Periodic update every 5 minutes
            intervalRef.current = setInterval(updateLocation, 5 * 60 * 1000);
        }, 3000);

        return () => {
            clearTimeout(initialDelay);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isAuthReady, user]);

    return null;
};
