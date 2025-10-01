import { useState, useEffect } from 'react';
import { useTracking } from '../contexts/TrackingContext';

const GPSTest = () => {
  const [testResults, setTestResults] = useState([]);
  const { 
    currentLocation, 
    locationError, 
    isTracking, 
    isWithinOffice, 
    isOutsideOffice, 
    startTracking, 
    stopTracking, 
    refreshLocation 
  } = useTracking();

  const addTestResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
  };

  const testGPSPermission = async () => {
    addTestResult('Testing GPS permission...', 'info');
    
    if (!navigator.geolocation) {
      addTestResult('Geolocation is not supported by this browser', 'error');
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      addTestResult(`GPS Permission: ${permission.state}`, permission.state === 'granted' ? 'success' : 'warning');
    } catch (error) {
      addTestResult(`Permission check failed: ${error.message}`, 'warning');
    }
  };

  const testLocationAccess = async () => {
    addTestResult('Testing location access...', 'info');
    
    try {
      await refreshLocation();
      if (currentLocation) {
        addTestResult(`Location obtained: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`, 'success');
        addTestResult(`Accuracy: ${Math.round(currentLocation.accuracy)}m`, 'info');
        addTestResult(`Within Office: ${isWithinOffice ? 'Yes' : 'No'}`, isWithinOffice ? 'success' : 'warning');
      } else {
        addTestResult('No location data available', 'error');
      }
    } catch (error) {
      addTestResult(`Location access failed: ${error.message}`, 'error');
    }
  };

  const testTracking = () => {
    addTestResult('Testing GPS tracking...', 'info');
    
    if (isTracking) {
      stopTracking();
      addTestResult('Stopped GPS tracking', 'info');
    } else {
      try {
        startTracking();
        addTestResult('Started GPS tracking', 'success');
      } catch (error) {
        addTestResult(`Failed to start tracking: ${error.message}`, 'error');
      }
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  useEffect(() => {
    if (currentLocation) {
      addTestResult(`Location updated: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`, 'info');
    }
  }, [currentLocation]);

  useEffect(() => {
    if (locationError) {
      addTestResult(`Location error: ${locationError}`, 'error');
    }
  }, [locationError]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">GPS Tracking Test</h3>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testGPSPermission}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Test GPS Permission
          </button>
          <button
            onClick={testLocationAccess}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Test Location Access
          </button>
          <button
            onClick={testTracking}
            className={`px-4 py-2 rounded-md transition-colors ${
              isTracking 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Clear Results
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Tracking:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                isTracking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isTracking ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="font-medium">Location:</span> 
              <span className="ml-2 text-gray-600">
                {currentLocation 
                  ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
                  : 'Not available'
                }
              </span>
            </div>
            <div>
              <span className="font-medium">Office Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                isWithinOffice ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isWithinOffice ? 'Within Office' : 'Outside Office'}
              </span>
            </div>
            {locationError && (
              <div>
                <span className="font-medium text-red-600">Error:</span> 
                <span className="ml-2 text-red-600">{locationError}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Test Results</h4>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-sm">No test results yet. Click a test button above.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className={`text-sm p-2 rounded ${
                  result.type === 'success' ? 'bg-green-100 text-green-800' :
                  result.type === 'error' ? 'bg-red-100 text-red-800' :
                  result.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <span className="text-xs text-gray-500">[{result.timestamp}]</span> {result.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPSTest;
