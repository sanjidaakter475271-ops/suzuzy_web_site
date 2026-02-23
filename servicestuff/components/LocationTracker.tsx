import React, { useEffect } from 'react';
import { LocationService } from '../services/location';
import { SocketService } from '../services/socket';
import { TechnicianAPI } from '../services/api';

export const LocationTracker: React.FC = () => {
    useEffect(() => {
        const updateLocation = async () => {
            try {
                const location = await LocationService.getInstance().getCurrentLocation();
                if (location.lat !== 0 && location.lng !== 0) {
                    console.log('[HEARTBEAT] Sending location:', location);

                    // 1. Send via REST API (for permanent storage)
                    try {
                        await TechnicianAPI.updateLocation(location.lat, location.lng);
                    } catch (apiErr) {
                        console.error('[LOCATION_TRACKER] API Error:', apiErr);
                    }

                    // 2. Emit via Socket (for real-time dashboard updates)
                    SocketService.getInstance().emit('technician:location', {
                        latitude: location.lat,
                        longitude: location.lng,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('[LOCATION_TRACKER] Error:', error);
            }
        };

        // Initial update
        updateLocation();

        // Periodic update every 5 minutes
        const interval = setInterval(updateLocation, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return null; // This component doesn't render anything
};
