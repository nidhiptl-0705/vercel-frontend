import { useState, useEffect, useRef } from 'react';
import { GEO_FENCE_CONFIG, SmartTimingValidator } from '../utils/gps';
import { useTracking } from '../contexts/TrackingContext';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const GPSAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentLocation, locationError, isTracking, isWithinOffice, isOutsideOffice, startTracking, stopTracking, refreshLocation, registerGeofenceCallback } = useTracking();
  const [localError, setLocalError] = useState('');
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [canCheckOut, setCanCheckOut] = useState(false);
  const [workDuration, setWorkDuration] = useState('');

  const timingValidator = useRef(new SmartTimingValidator());

  useEffect(() => {
    fetchAttendance();
    refreshLocation();
    checkTodayAttendance();
    
    // Debug: Log initial state
    console.log('GPSAttendance: Initial state', {
      currentLocation,
      locationError,
      isTracking,
      isWithinOffice,
      isOutsideOffice
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Register geofence callbacks for automatic check-in/out
  useEffect(() => {
    const unregister = registerGeofenceCallback({
      onEnter: async (position) => {
        // Auto check-in when entering office
        if (canCheckIn && !todayAttendance?.checkIn) {
          console.log('Auto check-in triggered: Entered office area');
          await handleCheckIn();
        }
      },
      onExit: async (position) => {
        // Auto check-out when leaving office
        if (canCheckOut && todayAttendance?.checkIn && !todayAttendance?.checkOut) {
          console.log('Auto check-out triggered: Left office area');
          await handleCheckOut();
        }
      }
    });

    return unregister;
  }, [canCheckIn, canCheckOut, todayAttendance, registerGeofenceCallback]);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/employee/attendance');
      setAttendanceRecords(response.data);
    } catch (error) {
      setError('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      await refreshLocation();
    } catch (error) {
      setLocalError(error.message);
    }
  };

  const startLocationTracking = () => {
    try {
      startTracking();
    } catch (error) {
      setLocalError(error.message);
    }
  };

  const stopLocationTracking = () => {
    stopTracking();
  };

  const checkTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = attendanceRecords.find(record => record.date === today);
    
    if (todayRecord) {
      setTodayAttendance(todayRecord);
      setCanCheckIn(!todayRecord.checkIn);
      setCanCheckOut(!!todayRecord.checkIn && !todayRecord.checkOut);
      
      if (todayRecord.checkIn && todayRecord.checkOut) {
        const duration = timingValidator.current.calculateWorkDuration(
          todayRecord.checkIn,
          todayRecord.checkOut
        );
        setWorkDuration(duration);
      }
    }
  };

  const handleCheckIn = async () => {
    if (!currentLocation) {
      setError('Please enable location access to check in');
      return;
    }

    if (!isWithinOffice) {
      setError('You must be within the office premises to check in');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5);
      const dateStr = now.toISOString().split('T')[0];
      
      const locationData = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        label: currentLocation.address || 'Office Location',
        timestamp: currentLocation.timestamp
      };

      const response = await api.post('/employee/attendance/check-in', {
        date: dateStr,
        time: timeStr,
        location: locationData
      });

      setTodayAttendance(response.data);
      setCanCheckIn(false);
      setCanCheckOut(true);
      setSuccess('Checked in successfully!');
      
      // Validate timing
      const validation = timingValidator.current.validateCheckIn(timeStr);
      if (validation.status === 'late') {
        setError(validation.message);
      }
      
      fetchAttendance();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    if (!currentLocation) {
      setError('Please enable location access to check out');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5);
      const dateStr = now.toISOString().split('T')[0];
      
      const locationData = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        label: currentLocation.address || 'Office Location',
        timestamp: currentLocation.timestamp
      };

      const response = await api.post('/employee/attendance/check-out', {
        date: dateStr,
        time: timeStr,
        location: locationData
      });

      setTodayAttendance(response.data);
      setCanCheckOut(false);
      setSuccess('Checked out successfully!');
      
      // Calculate work duration
      const duration = timingValidator.current.calculateWorkDuration(
        todayAttendance.checkIn,
        timeStr
      );
      setWorkDuration(duration);
      
      // Validate timing
      const validation = timingValidator.current.validateCheckOut(timeStr, todayAttendance.checkIn);
      if (validation.status !== 'present') {
        setError(validation.message);
      }
      
      fetchAttendance();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to check out');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'half-day':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading attendance..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900">GPS Attendance Tracking</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={getCurrentLocation}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Location
          </button>
          <button
            onClick={isTracking ? stopLocationTracking : startLocationTracking}
            className={`px-4 py-2 rounded-md transition-colors ${
              isTracking 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </button>
          <button
            onClick={() => {
              console.log('Manual location refresh triggered');
              getCurrentLocation();
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Force Refresh
          </button>
        </div>
      </div>

      {/* Location Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Location Status</h3>
        {locationError || localError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Location Error:</strong> {locationError || localError}
          </div>
        ) : currentLocation ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Coordinates</label>
                <p className="text-sm text-gray-600">
                  {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Accuracy</label>
                <p className="text-sm text-gray-600">{Math.round(currentLocation.accuracy)}m</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="text-sm text-gray-600">{currentLocation.address || 'Getting address...'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Office Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isWithinOffice ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isWithinOffice ? 'Within Office' : 'Outside Office'}
                </span>
              </div>
            </div>
            
            {/* Auto-logout warning */}
            {isOutsideOffice && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <div className="flex items-center">
                  <span className="text-xl mr-2">⚠️</span>
                  <div>
                    <strong>Auto-Logout Warning:</strong> You are outside the office radius. 
                    You will be automatically logged out in {Math.round(GEO_FENCE_CONFIG.AUTO_LOGOUT_TIMER / 60000)} minutes if you don't return to the office area.
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500">Getting location...</div>
        )}
      </div>

      {/* Today's Attendance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Attendance</h3>
        {todayAttendance ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(todayAttendance.status)}`}>
                  {todayAttendance.status || 'Present'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Check In</label>
                <p className="text-sm text-gray-600">
                  {todayAttendance.checkIn || 'Not checked in'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Check Out</label>
                <p className="text-sm text-gray-600">
                  {todayAttendance.checkOut || 'Not checked out'}
                </p>
              </div>
            </div>
            
            {workDuration && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Work Duration</label>
                <p className="text-sm text-gray-600">{workDuration}</p>
              </div>
            )}

            <div className="flex space-x-3">
              {canCheckIn && (
                <button
                  onClick={handleCheckIn}
                  disabled={!isWithinOffice || !currentLocation}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  title={`Check In - Within Office: ${isWithinOffice}, Location: ${!!currentLocation}`}
                >
                  Check In
                </button>
              )}
              {canCheckOut && (
                <button
                  onClick={handleCheckOut}
                  disabled={!currentLocation}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  title={`Check Out - Location: ${!!currentLocation}`}
                >
                  Check Out
                </button>
              )}
            </div>
            
            {/* Debug information */}
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <div><strong>Debug Info:</strong></div>
              <div>Can Check In: {canCheckIn ? 'Yes' : 'No'}</div>
              <div>Can Check Out: {canCheckOut ? 'Yes' : 'No'}</div>
              <div>Within Office: {isWithinOffice ? 'Yes' : 'No'}</div>
              <div>Current Location: {currentLocation ? 'Available' : 'Not Available'}</div>
              <div>Tracking: {isTracking ? 'Active' : 'Inactive'}</div>
              {currentLocation && (
                <div>Location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No attendance record for today</div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Attendance Records</h3>
        </div>
        <div className="p-6">
          {attendanceRecords.length > 0 ? (
            <div className="space-y-4">
              {attendanceRecords.slice(0, 10).map((record, index) => (
                <div key={record._id || `${record.date}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status || 'Present'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      {record.checkIn && (
                        <div>
                          <span className="font-medium">Check In:</span> {record.checkIn}
                          {record.checkInLocation && (
                            <div className="text-xs text-gray-500">
                              📍 {record.checkInLocation.latitude?.toFixed(4)}, {record.checkInLocation.longitude?.toFixed(4)}
                            </div>
                          )}
                        </div>
                      )}
                      {record.checkOut && (
                        <div>
                          <span className="font-medium">Check Out:</span> {record.checkOut}
                          {record.checkOutLocation && (
                            <div className="text-xs text-gray-500">
                              📍 {record.checkOutLocation.latitude?.toFixed(4)}, {record.checkOutLocation.longitude?.toFixed(4)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No attendance records found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GPSAttendance;
