import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import LiveLocationTracker from './LiveLocationTracker';
import LoadingSpinner from './LoadingSpinner';
import { GPSTracker, GEO_FENCE_CONFIG } from '../utils/gps';

const GPSAttendanceDashboard = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStats, setLocationStats] = useState({
    totalEmployees: 0,
    checkedIn: 0,
    checkedOut: 0,
    withinOffice: 0,
    outsideOffice: 0
  });

  const tracker = new GPSTracker();

  const positionWithinOffice = () => {
    if (!currentLocation) return false;
    return tracker.isWithinGeofence(
      currentLocation,
      GEO_FENCE_CONFIG.OFFICE_LAT,
      GEO_FENCE_CONFIG.OFFICE_LON,
      GEO_FENCE_CONFIG.RADIUS_METERS
    );
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAttendance({ date: selectedDate });
      setAttendanceData(response.data.employees || []);
      
      // Calculate stats
      const stats = calculateLocationStats(response.data.employees || []);
      setLocationStats(stats);
    } catch (error) {
      setError('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const calculateLocationStats = (employees) => {
    const stats = {
      totalEmployees: employees.length,
      checkedIn: 0,
      checkedOut: 0,
      withinOffice: 0,
      outsideOffice: 0
    };

    employees.forEach(emp => {
      if (emp.checkIn) stats.checkedIn++;
      if (emp.checkOut) stats.checkedOut++;
      if (emp.checkInLocation) stats.withinOffice++;
      if (emp.checkIn && !emp.checkInLocation) stats.outsideOffice++;
    });

    return stats;
  };

  const handleLocationUpdate = (position, isWithinOffice) => {
    setCurrentLocation(position);
  };

  const getLocationStatus = (employee) => {
    if (employee.checkInLocation) {
      return {
        status: 'within-office',
        text: 'Within Office',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    } else if (employee.checkIn && !employee.checkInLocation) {
      return {
        status: 'outside-office',
        text: 'Outside Office',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    } else {
      return {
        status: 'no-gps',
        text: 'No GPS Data',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      };
    }
  };

  const getAttendanceStatus = (employee) => {
    if (employee.status === 'present') return { text: 'Present', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (employee.status === 'absent') return { text: 'Absent', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (employee.status === 'late') return { text: 'Late', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (employee.status === 'half-day') return { text: 'Half Day', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { text: 'Not Marked', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading GPS attendance data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900">GPS Attendance Dashboard</h2>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <button
            onClick={() => {
              // Block start if outside office radius
              if (!isTracking) {
                if (!positionWithinOffice()) {
                  setError('Live tracking can start only within 100 meters of office.');
                  return;
                }
              }
              setError('');
              setIsTracking(!isTracking);
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              isTracking 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isTracking ? 'Stop Tracking' : 'Start Live Tracking'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{locationStats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Checked In</p>
              <p className="text-2xl font-bold text-gray-900">{locationStats.checkedIn}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">🚪</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Checked Out</p>
              <p className="text-2xl font-bold text-gray-900">{locationStats.checkedOut}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📍</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Within Office</p>
              <p className="text-2xl font-bold text-gray-900">{locationStats.withinOffice}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Outside Office</p>
              <p className="text-2xl font-bold text-gray-900">{locationStats.outsideOffice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Location Tracker */}
      {isTracking && (
        <LiveLocationTracker 
          onLocationUpdate={handleLocationUpdate}
          isTracking={isTracking}
        />
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Employee GPS Attendance - {selectedDate}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GPS Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map((employee) => {
                const locationStatus = getLocationStatus(employee);
                const attendanceStatus = getAttendanceStatus(employee);
                
                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department?.name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${attendanceStatus.bgColor} ${attendanceStatus.color}`}>
                        {attendanceStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.checkIn || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.checkOut || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.checkInLocation ? (
                        <div>
                          <div className="font-mono text-xs">
                            {employee.checkInLocation.latitude?.toFixed(4)}, {employee.checkInLocation.longitude?.toFixed(4)}
                          </div>
                          {employee.checkInLocation.label && (
                            <div className="text-xs text-gray-500 truncate max-w-32">
                              {employee.checkInLocation.label}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No GPS data</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${locationStatus.bgColor} ${locationStatus.color}`}>
                        {locationStatus.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default GPSAttendanceDashboard;
