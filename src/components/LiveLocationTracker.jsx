import { useState, useEffect, useRef } from 'react';
import { GEO_FENCE_CONFIG, GPSTracker } from '../utils/gps';
import { useTracking } from '../contexts/TrackingContext';

const LiveLocationTracker = ({ onLocationUpdate, isTracking = false }) => {
  const [localCurrentLocation, setLocalCurrentLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [localIsWithinOffice, setLocalIsWithinOffice] = useState(false);
  const [error, setError] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [heading, setHeading] = useState(null);

  const { currentLocation: ctxLocation, isWithinOffice: ctxWithinOffice, startTracking: startGlobalTracking, stopTracking: stopGlobalTracking } = useTracking();
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (isTracking) {
      startGlobalTracking();
    } else {
      stopGlobalTracking();
    }

    return () => {
      stopGlobalTracking();
    };
  }, [isTracking]);

  useEffect(() => {
    if (!ctxLocation) return;
    setLocalCurrentLocation(ctxLocation);
    setAccuracy(ctxLocation.accuracy);
    setSpeed(ctxLocation.speed);
    setHeading(ctxLocation.heading);
    setLocalIsWithinOffice(ctxWithinOffice);
    setLocationHistory(prev => [...prev, ctxLocation].slice(-50));
    if (onLocationUpdate) {
      onLocationUpdate(ctxLocation, ctxWithinOffice);
    }
    updateMap(ctxLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxLocation, ctxWithinOffice]);

  const updateMap = (position) => {
    if (!mapRef.current) return;

    // Simple map update (you can integrate with Google Maps, Leaflet, etc.)
    const mapElement = mapRef.current;
    if (mapElement) {
      // This is a placeholder for map integration
      // You would typically use Google Maps API or Leaflet here
      mapElement.innerHTML = `
        <div class="map-placeholder">
          <div class="location-info">
            <h3>Current Location</h3>
            <p>Lat: ${position.latitude.toFixed(6)}</p>
            <p>Lng: ${position.longitude.toFixed(6)}</p>
            <p>Accuracy: ${Math.round(position.accuracy)}m</p>
            <p>Status: ${localIsWithinOffice ? 'Within Office' : 'Outside Office'}</p>
          </div>
        </div>
      `;
    }
  };

  const getLocationStatus = () => {
    if (!localCurrentLocation) return 'Unknown';
    if (localIsWithinOffice) return 'Within Office';
    return 'Outside Office';
  };

  const getStatusColor = () => {
    if (!localCurrentLocation) return 'text-gray-500';
    if (localIsWithinOffice) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Location Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Live Location Tracking</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {localCurrentLocation ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Coordinates</label>
              <p className="text-sm text-gray-600 font-mono">
                {localCurrentLocation.latitude.toFixed(6)}, {localCurrentLocation.longitude.toFixed(6)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Accuracy</label>
              <p className="text-sm text-gray-600">{Math.round(accuracy || 0)}m</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Speed</label>
              <p className="text-sm text-gray-600">
                {speed ? `${Math.round(speed * 3.6)} km/h` : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className={`text-sm font-medium ${getStatusColor()}`}>
                {getLocationStatus()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {isTracking ? 'Getting location...' : 'Location tracking not started'}
          </div>
        )}

        {/* Location History */}
        {locationHistory.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Recent Locations</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {locationHistory.slice(-10).reverse().map((location, index) => (
                <div key={index} className="text-xs text-gray-600 flex justify-between">
                  <span className="font-mono">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </span>
                  <span className="text-gray-400">
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location Map</h3>
        <div 
          ref={mapRef}
          className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center"
        >
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🗺️</div>
            <p>Map integration placeholder</p>
            <p className="text-sm">Integrate with Google Maps or Leaflet for full functionality</p>
          </div>
        </div>
      </div>

      {/* Geofence Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Geofence Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Office Center</label>
            <p className="text-sm text-gray-600 font-mono">
              {GEO_FENCE_CONFIG.OFFICE_LAT.toFixed(6)}, {GEO_FENCE_CONFIG.OFFICE_LON.toFixed(6)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Allowed Radius</label>
            <p className="text-sm text-gray-600">{GEO_FENCE_CONFIG.RADIUS_METERS}m</p>
          </div>
        </div>
        
        {localCurrentLocation && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Distance from Office</label>
            <p className="text-sm text-gray-600">
              {Math.round(new GPSTracker().calculateDistance(
                localCurrentLocation.latitude,
                localCurrentLocation.longitude,
                GEO_FENCE_CONFIG.OFFICE_LAT,
                GEO_FENCE_CONFIG.OFFICE_LON
              ))}m
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveLocationTracker;
