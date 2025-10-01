import { useState, useEffect, useRef } from 'react';
import api, { employeeAPI } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner.jsx';
import { SmartTimingValidator, GEO_FENCE_CONFIG } from '../../utils/gps';
import { useTracking } from '../../contexts/TrackingContext.jsx';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Removed manual mark form in favor of live tracking auto-mark
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [showEodForm, setShowEodForm] = useState(false);
  // deprecated: manual attendance data (kept for compatibility but unused)
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present'
  });
  const [eodData, setEodData] = useState({
    date: new Date().toISOString().split('T')[0],
    content: ''
  });
  const [eodRecords, setEodRecords] = useState([]);
  const [showEodList, setShowEodList] = useState(false);
  const [editingEod, setEditingEod] = useState(null);
  
  // GPS-related state - now using TrackingContext
  const [showGPSForm, setShowGPSForm] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [canCheckOut, setCanCheckOut] = useState(false);
  const [workDuration, setWorkDuration] = useState('');
  const [useWakeLock, setUseWakeLock] = useState(true);
  const wakeLockRef = useRef(null);

  const timingValidator = useRef(new SmartTimingValidator());
  const { 
    currentLocation, 
    locationError, 
    isTracking, 
    isWithinOffice, 
    isOutsideOffice, 
    startTracking, 
    stopTracking, 
    refreshLocation, 
    registerGeofenceCallback 
  } = useTracking();

  useEffect(() => {
    fetchAttendance();
    fetchEODs();
    refreshLocation();
    checkTodayAttendance();
  }, []);

  useEffect(() => {
    checkTodayAttendance();
  }, [attendanceRecords]);

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

  const startLocationTracking = () => {
    try {
      startTracking();
      // Try to acquire wake lock to keep tracking active
      if (useWakeLock && 'wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then((sentinel) => {
          wakeLockRef.current = sentinel;
          sentinel.addEventListener('release', () => {
            // Attempt re-acquire if still tracking
            if (isTracking && useWakeLock && 'wakeLock' in navigator) {
              navigator.wakeLock.request('screen').then((s) => (wakeLockRef.current = s)).catch(() => {});
            }
          });
        }).catch(() => {});
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const stopLocationTracking = () => {
    stopTracking();
    // Release wake lock if held
    if (wakeLockRef.current) {
      try { wakeLockRef.current.release(); } catch (_) {}
      wakeLockRef.current = null;
    }
  };

  // Register geofence callbacks for automatic check-in/out
  useEffect(() => {
    const unregister = registerGeofenceCallback({
      onEnter: async (position) => {
        // Auto check-in when entering office
        if (canCheckIn && !todayAttendance?.checkIn) {
          console.log('Auto check-in triggered: Entered office area');
          await handleGPSCheckIn();
        }
      },
      onExit: async (position) => {
        // Auto check-out when leaving office
        if (canCheckOut && todayAttendance?.checkIn && !todayAttendance?.checkOut) {
          console.log('Auto check-out triggered: Left office area');
          await handleGPSCheckOut();
        }
      }
    });

    return unregister;
  }, [canCheckIn, canCheckOut, todayAttendance, registerGeofenceCallback]);

  // Background-friendly periodic refresh while tracking
  useEffect(() => {
    if (!isTracking) return;
    const intervalId = setInterval(() => {
      refreshLocation();
    }, 60000); // refresh every 60s
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTracking]);

  // Re-acquire wake lock and ensure tracking after visibility changes
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (isTracking) {
          // Restart watch to mitigate browser throttling
          stopTracking();
          startLocationTracking();
        }
        if (useWakeLock && 'wakeLock' in navigator && !wakeLockRef.current) {
          navigator.wakeLock.request('screen').then((s) => (wakeLockRef.current = s)).catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTracking, useWakeLock]);

  const fetchEODs = async () => {
    try {
      const response = await employeeAPI.getEods();
      setEodRecords(response.data);
    } catch (error) {
      setError('Failed to fetch EOD records');
    }
  };

  const getCurrentLocation = async () => {
    try {
      await refreshLocation();
    } catch (error) {
      setError(error.message);
    }
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

  const handleGPSCheckIn = async () => {
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

  const handleGPSCheckOut = async () => {
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

  const handleSubmitEod = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingEod) {
        // Update existing EOD
        await employeeAPI.updateEod(editingEod._id, eodData);
        setSuccess('EOD updated successfully');
        setEditingEod(null);
      } else {
        // Create new EOD
        await employeeAPI.submitEod(eodData);
        setSuccess('EOD submitted successfully');
      }
      setShowEodForm(false);
      setEodData({ date: new Date().toISOString().split('T')[0], content: '' });
      fetchEODs(); // Refresh EOD list
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit EOD');
    }
  };

  const handleEditEod = (eod) => {
    setEditingEod(eod);
    setEodData({
      date: eod.date,
      content: eod.content
    });
    setShowEodForm(true);
    setShowEodList(false);
  };

  const handleViewEod = (eod) => {
    setEditingEod(eod);
    setEodData({
      date: eod.date,
      content: eod.content
    });
    setShowEodForm(true);
    setShowEodList(false);
  };

  const handleCancelEdit = () => {
    setEditingEod(null);
    setEodData({ date: new Date().toISOString().split('T')[0], content: '' });
    setShowEodForm(false);
  };

  // manual mark removed; tracking controls handle attendance


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
        <LoadingSpinner size="lg" text="Loading attendance records..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Attendance</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setShowMarkForm(false); setShowEodForm(!showEodForm); setShowGPSForm(false); }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            title="Submit your End-of-Day work summary"
          >
            {showEodForm ? 'Cancel' : 'Submit EOD'}
          </button>
          <button
            onClick={() => { setShowGPSForm(!showGPSForm); setShowMarkForm(false); setShowEodForm(false); }}
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
            title="GPS-based attendance with live location"
          >
            {showGPSForm ? 'Hide GPS' : 'GPS Attendance'}
          </button>
          <button
            onClick={isTracking ? stopLocationTracking : () => { startLocationTracking(); setShowGPSForm(true); }}
            className={`px-4 py-2 rounded-md transition-colors ${
              isTracking ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            title="Start/Stop live location tracking"
          >
            {isTracking ? 'Stop Tracking' : 'Start Live Tracking'}
          </button>
          <button
            onClick={() => { setShowEodList(!showEodList); setShowMarkForm(false); setShowEodForm(false); setShowGPSForm(false); }}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            title="View your EOD reports"
          >
            {showEodList ? 'Hide EODs' : 'View EODs'}
          </button>
        </div>
      </div>

      {/* Mark Attendance Form */}
      {/* Manual Mark Attendance removed */}

      {/* Submit EOD Form */}
      {showEodForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingEod ? 'Edit End of Day (EOD)' : 'Submit End of Day (EOD)'}
          </h3>
          <form onSubmit={handleSubmitEod} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="eodDate" className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  id="eodDate"
                  value={eodData.date}
                  onChange={(e) => setEodData({ ...eodData, date: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="eodContent" className="block text-sm font-medium text-gray-700">What did you work on today?</label>
                <textarea
                  id="eodContent"
                  rows="4"
                  value={eodData.content}
                  onChange={(e) => setEodData({ ...eodData, content: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Summarize tasks completed, blockers, and plans for tomorrow..."
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                {editingEod ? 'Update EOD' : 'Submit EOD'}
              </button>
              <button type="button" onClick={handleCancelEdit} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* EOD List */}
      {showEodList && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">My EOD Reports</h3>
          </div>
          <div className="p-6">
            {eodRecords.length > 0 ? (
              <div className="space-y-4">
                {eodRecords.map((eod) => (
                  <div key={eod._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {new Date(eod.date).toLocaleDateString()}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {new Date(eod.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {eod.content}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleViewEod(eod)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        title="View EOD details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditEod(eod)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                        title="Edit EOD"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No EOD reports found</p>
            )}
          </div>
        </div>
      )}

      {/* GPS Attendance Form */}
      {showGPSForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">GPS-Based Attendance Tracking</h3>
          
          {/* Location Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-3">Current Location Status</h4>
            {locationError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>Location Error:</strong> {locationError}
                <button 
                  onClick={getCurrentLocation}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Try Again
                </button>
              </div>
            ) : currentLocation ? (
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
            ) : (
              <div className="text-gray-500">Getting location...</div>
            )}
          </div>

          {/* Today's Attendance Status */}
          {todayAttendance && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-3">Today's Attendance</h4>
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
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700">Work Duration</label>
                  <p className="text-sm text-gray-600">{workDuration}</p>
                </div>
              )}
            </div>
          )}

          {/* GPS Check In/Out Buttons */}
          <div className="flex space-x-3">
            {canCheckIn && (
              <button
                onClick={handleGPSCheckIn}
                disabled={!isWithinOffice || !currentLocation}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                📍 Check In with GPS
              </button>
            )}
            {canCheckOut && (
              <button
                onClick={handleGPSCheckOut}
                disabled={!currentLocation}
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                📍 Check Out with GPS
              </button>
            )}
            <button
              onClick={getCurrentLocation}
              className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              🔄 Refresh Location
            </button>
          </div>

          {!isWithinOffice && currentLocation && (
            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              <strong>Warning:</strong> You are outside the office premises. GPS check-in/out may not be allowed.
            </div>
          )}
          
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
      )}

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

      {/* Attendance Records */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
        </div>
        <div className="p-6">
          {attendanceRecords.length > 0 ? (
            <div className="space-y-4">
              {attendanceRecords.map((record, index) => (
                <div key={record._id || `${record.date}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      {record.checkIn && (
                        <div>
                          <span className="font-medium">Check In:</span> {record.checkIn}
                          {record.checkInLocation && (
                            <div className="text-xs text-gray-500 mt-1">
                              📍 {record.checkInLocation.latitude?.toFixed(4)}, {record.checkInLocation.longitude?.toFixed(4)}
                              {record.checkInLocation.label && (
                                <div className="text-xs text-gray-400">{record.checkInLocation.label}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {record.checkOut && (
                        <div>
                          <span className="font-medium">Check Out:</span> {record.checkOut}
                          {record.checkOutLocation && (
                            <div className="text-xs text-gray-500 mt-1">
                              📍 {record.checkOutLocation.latitude?.toFixed(4)}, {record.checkOutLocation.longitude?.toFixed(4)}
                              {record.checkOutLocation.label && (
                                <div className="text-xs text-gray-400">{record.checkOutLocation.label}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ): (
            <p className="text-gray-500 text-center py-8">No attendance records found</p>
          )} 
        </div>
      </div>

    </div>
  );
};

export default Attendance;
