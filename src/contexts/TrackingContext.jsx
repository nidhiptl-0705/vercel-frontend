import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GPSTracker, GEO_FENCE_CONFIG } from '../utils/gps';
import { useAuth } from './AuthContext';

const TrackingContext = createContext(null);

export const TrackingProvider = ({ children }) => {
  const trackerRef = useRef(new GPSTracker());
  const { logout } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isWithinOffice, setIsWithinOffice] = useState(false);
  const [previousWithinOffice, setPreviousWithinOffice] = useState(null);
  const [geofenceCallbacks, setGeofenceCallbacks] = useState([]);
  const [logoutTimer, setLogoutTimer] = useState(null);
  const [isOutsideOffice, setIsOutsideOffice] = useState(false);

  const startTracking = () => {
    try {
      trackerRef.current.startTracking(async (position, error) => {
        if (error) {
          setLocationError(error.message);
          return;
        }
        setLocationError('');
        // Enrich with address once per update (non-blocking)
        let enrichedPosition = position;
        try {
          const address = await trackerRef.current.getAddressFromCoords(
            position.latitude,
            position.longitude
          );
          enrichedPosition = { ...position, address };
        } catch (_) {
          // Ignore reverse geocode errors
        }
        setCurrentLocation(enrichedPosition);
        const within = trackerRef.current.isWithinGeofence(
          enrichedPosition,
          GEO_FENCE_CONFIG.OFFICE_LAT,
          GEO_FENCE_CONFIG.OFFICE_LON,
          GEO_FENCE_CONFIG.RADIUS_METERS
        );
        
        // Check for geofence entry/exit events
        if (previousWithinOffice !== null && previousWithinOffice !== within) {
          if (within) {
            // Entered office - trigger entry callbacks and clear logout timer
            setIsOutsideOffice(false);
            if (logoutTimer) {
              clearTimeout(logoutTimer);
              setLogoutTimer(null);
            }
            geofenceCallbacks.forEach(callback => {
              if (callback.onEnter) callback.onEnter(enrichedPosition);
            });
          } else {
            // Exited office - trigger exit callbacks and start logout timer
            setIsOutsideOffice(true);
            geofenceCallbacks.forEach(callback => {
              if (callback.onExit) callback.onExit(enrichedPosition);
            });
            
            // Start automatic logout timer (configurable from GEO_FENCE_CONFIG)
            const timer = setTimeout(() => {
              console.log('Auto-logout triggered: Employee outside office radius for configured time');
              logout();
            }, GEO_FENCE_CONFIG.AUTO_LOGOUT_TIMER);
            setLogoutTimer(timer);
          }
        }
        
        setPreviousWithinOffice(within);
        setIsWithinOffice(within);
      });
      setIsTracking(true);
    } catch (e) {
      setLocationError(e.message);
    }
  };

  const stopTracking = () => {
    trackerRef.current.stopTracking();
    setIsTracking(false);
    // Clear logout timer when stopping tracking
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
  };

  const refreshLocation = async () => {
    try {
      setLocationError('');
      const pos = await trackerRef.current.getCurrentLocation();
      let enrichedPosition = pos;
      try {
        const address = await trackerRef.current.getAddressFromCoords(
          pos.latitude,
          pos.longitude
        );
        enrichedPosition = { ...pos, address };
      } catch (_) {}
      setCurrentLocation(enrichedPosition);
      const within = trackerRef.current.isWithinGeofence(
        enrichedPosition,
        GEO_FENCE_CONFIG.OFFICE_LAT,
        GEO_FENCE_CONFIG.OFFICE_LON,
        GEO_FENCE_CONFIG.RADIUS_METERS
      );
      
      // Check for geofence entry/exit events on refresh
      if (previousWithinOffice !== null && previousWithinOffice !== within) {
        if (within) {
          // Entered office - trigger entry callbacks and clear logout timer
          setIsOutsideOffice(false);
          if (logoutTimer) {
            clearTimeout(logoutTimer);
            setLogoutTimer(null);
          }
          geofenceCallbacks.forEach(callback => {
            if (callback.onEnter) callback.onEnter(enrichedPosition);
          });
        } else {
          // Exited office - trigger exit callbacks and start logout timer
          setIsOutsideOffice(true);
          geofenceCallbacks.forEach(callback => {
            if (callback.onExit) callback.onExit(enrichedPosition);
          });
          
          // Start automatic logout timer (configurable from GEO_FENCE_CONFIG)
          const timer = setTimeout(() => {
            console.log('Auto-logout triggered: Employee outside office radius for configured time');
            logout();
          }, GEO_FENCE_CONFIG.AUTO_LOGOUT_TIMER);
          setLogoutTimer(timer);
        }
      }
      
      setPreviousWithinOffice(within);
      setIsWithinOffice(within);
    } catch (e) {
      setLocationError(e.message);
    }
  };

  // Keep some periodic refresh even if the consumer component is unmounted
  useEffect(() => {
    if (!isTracking) return;
    const id = setInterval(() => {
      refreshLocation();
    }, 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTracking]);

  // Register geofence callbacks
  const registerGeofenceCallback = useCallback((callback) => {
    setGeofenceCallbacks(prev => [...prev, callback]);
    return () => {
      setGeofenceCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  }, []);

  // Cleanup logout timer on unmount
  useEffect(() => {
    return () => {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
    };
  }, [logoutTimer]);

  // Ensure state survives route changes; provider stays mounted at app level
  const value = useMemo(() => ({
    isTracking,
    currentLocation,
    isWithinOffice,
    isOutsideOffice,
    locationError,
    startTracking,
    stopTracking,
    refreshLocation,
    registerGeofenceCallback,
  }), [
    isTracking,
    currentLocation,
    isWithinOffice,
    isOutsideOffice,
    locationError,
    startTracking,
    stopTracking,
    refreshLocation,
    registerGeofenceCallback,
  ]);

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => useContext(TrackingContext);



