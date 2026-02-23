import { Geolocation } from '@capacitor/geolocation';

export interface Location {
    lat: number;
    lng: number;
}

export class LocationService {
    private static instance: LocationService;

    private constructor() { }

    static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    async getCurrentLocation(): Promise<Location> {
        try {
            const permissions = await Geolocation.checkPermissions();

            if (permissions.location === 'denied') {
                const request = await Geolocation.requestPermissions();
                if (request.location === 'denied') {
                    console.warn('[LOCATION] Permission denied');
                    return { lat: 0, lng: 0 };
                }
            }

            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000
            });

            return {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
        } catch (error) {
            console.error('[LOCATION] Error getting location:', error);
            return { lat: 0, lng: 0 };
        }
    }
}
