// GPS Location utilities for attendance tracking
export class GPSTracker {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
    this.isTracking = false;
    this.accuracyThreshold = 100; // meters
    this.maxAge = 60000; // 60 seconds (allow a slightly older cached fix to reduce timeouts)
    this.timeout = 20000; // 20 seconds (give more time for a GPS fix)
    this.retryCount = 0;
    this.maxRetries = 2; // adaptive fallback retries
  }

  // Request current location with high accuracy
  async getCurrentLocation() {
    const tryGetPosition = (options) => new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }
      

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed
          };
          resolve(this.currentPosition);
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });

    // First attempt: high accuracy
    try {
      return await tryGetPosition({
        enableHighAccuracy: true,
        maximumAge: this.maxAge,
        timeout: this.timeout
      });
    } catch (err) {
      // Fallback on timeout/availability with relaxed options
      if (/(timed out|unavailable)/i.test(err.message)) {
        // Try relaxed single read
        try {
          return await tryGetPosition({
            enableHighAccuracy: false,
            maximumAge: Math.max(this.maxAge, 120000), // up to 2 minutes cache
            timeout: Math.max(this.timeout, 30000) // up to 30s timeout
          });
        } catch (err2) {
          // Last resort: start a temporary watch and resolve on first fix
          try {
            const result = await new Promise((resolve, reject) => {
              if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
              }
              const opts = {
                enableHighAccuracy: false,
                maximumAge: Math.max(this.maxAge, 180000),
                timeout: Math.max(this.timeout, 30000)
              };
              let tempWatchId = null;
              const timeoutId = setTimeout(() => {
                if (tempWatchId !== null) {
                  navigator.geolocation.clearWatch(tempWatchId);
                }
                reject(new Error('Location request timed out'));
              }, opts.timeout);
              tempWatchId = navigator.geolocation.watchPosition(
                (position) => {
                  clearTimeout(timeoutId);
                  if (tempWatchId !== null) {
                    navigator.geolocation.clearWatch(tempWatchId);
                  }
                  this.currentPosition = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString(),
                    altitude: position.coords.altitude,
                    heading: position.coords.heading,
                    speed: position.coords.speed
                  };
                  resolve(this.currentPosition);
                },
                (e) => {
                  clearTimeout(timeoutId);
                  if (tempWatchId !== null) {
                    navigator.geolocation.clearWatch(tempWatchId);
                  }
                  reject(new Error(e?.message || 'Unable to retrieve your location'));
                },
                opts
              );
            });
            return result;
          } catch (err3) {
            throw err3;
          }
        }
      }
      throw err;
    }
  }

  // Start continuous location tracking
  startTracking(callback) {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    if (this.isTracking) {
      return;
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: this.maxAge,
      timeout: this.timeout
    };

    const startWatch = (opts) => {
      this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed
        };
        
        if (callback) {
          callback(this.currentPosition);
        }
        // reset retries on success
        this.retryCount = 0;
      },
      (error) => {
        console.error('GPS tracking error:', error);
        if (callback) {
          callback(null, error);
        }
        // Adaptive fallback on timeout or unavailable
        if ((error && (error.code === error.TIMEOUT || error.code === 3 || error.code === error.POSITION_UNAVAILABLE)) && this.retryCount < this.maxRetries) {
          this.retryCount += 1;
          // restart with relaxed options
          this.stopTracking();
          startWatch({
            enableHighAccuracy: false,
            maximumAge: Math.max(this.maxAge, 120000),
            timeout: Math.max(this.timeout, 30000)
          });
        }
      },
      opts
    );
    };

    startWatch(options);

    this.isTracking = true;
  }

  // Stop location tracking
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
    }
  }

  // Check if location is accurate enough
  isLocationAccurate(position) {
    return position && position.accuracy <= this.accuracyThreshold;
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Check if location is within geofence (accounts for accuracy buffer)
  isWithinGeofence(position, centerLat, centerLon, radiusMeters) {
    if (!position) return false;

    const distance = this.calculateDistance(
      position.latitude,
      position.longitude,
      centerLat,
      centerLon
    );

    // Add a dynamic buffer equal to reported accuracy (capped) to reduce false negatives
    const accuracyBuffer = Math.max(50, Math.min(position.accuracy || 0, 500));
    const effectiveRadius = radiusMeters + accuracyBuffer;

    return distance <= effectiveRadius;
  }

  // Get address from coordinates (reverse geocoding)
  async getAddressFromCoords(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.locality) {
        return `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`;
      }
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  }

  // Format location for display
  formatLocation(position) {
    if (!position) return 'Location not available';
    
    return {
      coords: `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`,
      accuracy: `${Math.round(position.accuracy)}m`,
      timestamp: new Date(position.timestamp).toLocaleString(),
      address: position.address || 'Getting address...'
    };
  }
}

// Geofencing configuration
export const GEO_FENCE_CONFIG = {
  // Office location and allowed radius
  OFFICE_LAT: 22.318820,
  OFFICE_LON: 73.187437,
  RADIUS_METERS: 250, // 250 meters radius
  AUTO_LOGOUT_TIMER: 300000, // 5 minutes in milliseconds (300000ms = 5 minutes)
  ALLOWED_LOCATIONS: [
    {
      name: 'Main Office',
      latitude: 22.318820,
      longitude: 73.187437,
      radius: 250
    }
    // Add more office locations if needed
  ]
};

// Smart timing validation
export class SmartTimingValidator {
  constructor() {
    this.workStartTime = '11:00';
    this.workEndTime = '18:30';
    this.lateThreshold = 15; // minutes
    this.earlyLeaveThreshold = 30; // minutes
  }

  // Validate check-in time
  validateCheckIn(checkInTime) {
    const currentTime = new Date();
    const checkIn = new Date(`${currentTime.toDateString()} ${checkInTime}`);
    const workStart = new Date(`${currentTime.toDateString()} ${this.workStartTime}`);
    
    const diffMinutes = (checkIn - workStart) / (1000 * 60);
    
    if (diffMinutes > this.lateThreshold) {
      return {
        isValid: true,
        status: 'late',
        message: `You are ${Math.round(diffMinutes)} minutes late`
      };
    }
    
    return {
      isValid: true,
      status: 'present',
      message: 'On time'
    };
  }

  // Validate check-out time
  validateCheckOut(checkOutTime, checkInTime) {
    const currentTime = new Date();
    const checkOut = new Date(`${currentTime.toDateString()} ${checkOutTime}`);
    const checkIn = new Date(`${currentTime.toDateString()} ${checkInTime}`);
    const workEnd = new Date(`${currentTime.toDateString()} ${this.workEndTime}`);
    
    const workHours = (checkOut - checkIn) / (1000 * 60 * 60);
    const earlyLeave = (workEnd - checkOut) / (1000 * 60);
    
    if (workHours < 4) {
      return {
        isValid: true,
        status: 'half-day',
        message: 'Less than 4 hours worked'
      };
    }
    
    if (earlyLeave > this.earlyLeaveThreshold) {
      return {
        isValid: true,
        status: 'early-leave',
        message: `Left ${Math.round(earlyLeave)} minutes early`
      };
    }
    
    return {
      isValid: true,
      status: 'present',
      message: 'Full day completed'
    };
  }

  // Calculate work duration
  calculateWorkDuration(checkIn, checkOut) {
    if (!checkIn || !checkOut) return null;
    
    const checkInTime = new Date(`2000-01-01 ${checkIn}`);
    const checkOutTime = new Date(`2000-01-01 ${checkOut}`);
    
    const diffMs = checkOutTime - checkInTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }
}

export default GPSTracker;
