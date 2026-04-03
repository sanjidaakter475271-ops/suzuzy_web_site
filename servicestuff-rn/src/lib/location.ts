import * as Location from 'expo-location';

export interface LocationData {
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

    async getCurrentLocation(): Promise<LocationData> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                console.warn('[LOCATION] Permission denied');
                return { lat: 0, lng: 0 };
            }

            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
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
