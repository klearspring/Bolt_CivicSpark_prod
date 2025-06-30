import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { LocationPermissionStatus, GeolocationOptions, LocationData, LocationError } from '@/types/auth';

export class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;
  private watchId: Location.LocationSubscription | null = null;

  // Singleton pattern to ensure one instance
  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Check current location permission status
   */
  async checkPermissions(): Promise<LocationPermissionStatus> {
    try {
      if (Platform.OS === 'web') {
        // Web geolocation permission check
        if (!navigator.geolocation) {
          return {
            granted: false,
            canAskAgain: false,
            status: 'denied'
          };
        }

        // Check if permission was previously granted
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return {
          granted: permission.state === 'granted',
          canAskAgain: permission.state !== 'denied',
          status: permission.state === 'granted' ? 'granted' : 
                  permission.state === 'denied' ? 'denied' : 'undetermined'
        };
      } else {
        // Mobile permission check using expo-location
        const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
        return {
          granted: status === Location.PermissionStatus.GRANTED,
          canAskAgain,
          status: status === Location.PermissionStatus.GRANTED ? 'granted' :
                  status === Location.PermissionStatus.DENIED ? 'denied' : 'undetermined'
        };
      }
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'undetermined'
      };
    }
  }

  /**
   * Request location permissions from user
   */
  async requestPermissions(): Promise<LocationPermissionStatus> {
    try {
      if (Platform.OS === 'web') {
        // Web doesn't have explicit permission request - it happens on first use
        return this.checkPermissions();
      } else {
        // Mobile permission request using expo-location
        const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
        return {
          granted: status === Location.PermissionStatus.GRANTED,
          canAskAgain,
          status: status === Location.PermissionStatus.GRANTED ? 'granted' :
                  status === Location.PermissionStatus.DENIED ? 'denied' : 'undetermined'
        };
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'undetermined'
      };
    }
  }

  /**
   * Get current location with options
   */
  async getCurrentLocation(options: GeolocationOptions = {}): Promise<LocationData> {
    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000, // 5 minutes
      ...options
    };

    try {
      if (Platform.OS === 'web') {
        return this.getCurrentLocationWeb(defaultOptions);
      } else {
        return this.getCurrentLocationMobile(defaultOptions);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      throw this.formatLocationError(error);
    }
  }

  /**
   * Web-specific location fetching
   */
  private getCurrentLocationWeb(options: GeolocationOptions): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp,
          };
          this.currentLocation = locationData;
          resolve(locationData);
        },
        (error) => {
          reject(this.formatLocationError(error));
        },
        {
          enableHighAccuracy: options.enableHighAccuracy,
          timeout: options.timeout,
          maximumAge: options.maximumAge,
        }
      );
    });
  }

  /**
   * Mobile-specific location fetching
   */
  private async getCurrentLocationMobile(options: GeolocationOptions): Promise<LocationData> {
    const location = await Location.getCurrentPositionAsync({
      accuracy: options.enableHighAccuracy ? 
        Location.Accuracy.BestForNavigation : 
        Location.Accuracy.Balanced,
      timeInterval: options.maximumAge,
    });

    const locationData: LocationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
      altitude: location.coords.altitude || undefined,
      altitudeAccuracy: location.coords.altitudeAccuracy || undefined,
      heading: location.coords.heading || undefined,
      speed: location.coords.speed || undefined,
      timestamp: location.timestamp,
    };

    this.currentLocation = locationData;
    return locationData;
  }

  /**
   * Start watching location changes
   */
  async startWatchingLocation(
    callback: (location: LocationData) => void,
    options: GeolocationOptions = {}
  ): Promise<void> {
    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: false, // Less battery intensive for watching
      timeout: 10000,
      maximumAge: 60000, // 1 minute for watching
      ...options
    };

    try {
      if (Platform.OS === 'web') {
        this.startWatchingLocationWeb(callback, defaultOptions);
      } else {
        await this.startWatchingLocationMobile(callback, defaultOptions);
      }
    } catch (error) {
      console.error('Error starting location watch:', error);
      throw this.formatLocationError(error);
    }
  }

  /**
   * Web-specific location watching
   */
  private startWatchingLocationWeb(
    callback: (location: LocationData) => void,
    options: GeolocationOptions
  ): void {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp,
        };
        this.currentLocation = locationData;
        callback(locationData);
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.timeout,
        maximumAge: options.maximumAge,
      }
    );

    // Store watch ID for cleanup (convert to expo-location format for consistency)
    this.watchId = { remove: () => navigator.geolocation.clearWatch(watchId) } as Location.LocationSubscription;
  }

  /**
   * Mobile-specific location watching
   */
  private async startWatchingLocationMobile(
    callback: (location: LocationData) => void,
    options: GeolocationOptions
  ): Promise<void> {
    this.watchId = await Location.watchPositionAsync(
      {
        accuracy: options.enableHighAccuracy ? 
          Location.Accuracy.BestForNavigation : 
          Location.Accuracy.Balanced,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      (location) => {
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || undefined,
          altitude: location.coords.altitude || undefined,
          altitudeAccuracy: location.coords.altitudeAccuracy || undefined,
          heading: location.coords.heading || undefined,
          speed: location.coords.speed || undefined,
          timestamp: location.timestamp,
        };
        this.currentLocation = locationData;
        callback(locationData);
      }
    );
  }

  /**
   * Stop watching location changes
   */
  stopWatchingLocation(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  /**
   * Get cached location (if available)
   */
  getCachedLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Clear cached location
   */
  clearCachedLocation(): void {
    this.currentLocation = null;
  }

  /**
   * Convert coordinates to approximate address (reverse geocoding)
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<{
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }> {
    try {
      if (Platform.OS === 'web') {
        // For web, we'd typically use a geocoding service API
        // For now, return empty object - can be enhanced with Google Maps API, etc.
        console.log('Reverse geocoding not implemented for web platform');
        return {};
      } else {
        // Use expo-location's reverse geocoding
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addresses.length > 0) {
          const address = addresses[0];
          return {
            address: `${address.streetNumber || ''} ${address.street || ''}`.trim(),
            city: address.city || undefined,
            state: address.region || undefined,
            zipCode: address.postalCode || undefined,
            country: address.country || undefined,
          };
        }
      }
      return {};
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return {};
    }
  }

  /**
   * Calculate distance between two points (in kilometers)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if user is within a certain radius of a location
   */
  isWithinRadius(
    userLat: number,
    userLon: number,
    targetLat: number,
    targetLon: number,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(userLat, userLon, targetLat, targetLon);
    return distance <= radiusKm;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format location errors consistently
   */
  private formatLocationError(error: any): LocationError {
    if (Platform.OS === 'web' && error instanceof GeolocationPositionError) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          return {
            code: 1,
            message: 'Location access denied by user'
          };
        case error.POSITION_UNAVAILABLE:
          return {
            code: 2,
            message: 'Location information unavailable'
          };
        case error.TIMEOUT:
          return {
            code: 3,
            message: 'Location request timed out'
          };
        default:
          return {
            code: 0,
            message: error.message || 'Unknown location error'
          };
      }
    }

    return {
      code: 0,
      message: error?.message || 'Unknown location error'
    };
  }

  /**
   * Get user-friendly permission status message
   */
  getPermissionStatusMessage(status: LocationPermissionStatus): string {
    if (status.granted) {
      return 'Location access granted';
    }

    if (!status.canAskAgain) {
      return 'Location access permanently denied. Please enable in device settings.';
    }

    switch (status.status) {
      case 'denied':
        return 'Location access denied. You can enable it in settings.';
      case 'undetermined':
        return 'Location permission not yet requested.';
      default:
        return 'Location access required for neighborhood features.';
    }
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();