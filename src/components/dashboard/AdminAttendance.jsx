import { useEffect, useState } from 'react';
import api, { adminAPI } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner.jsx';
import TestGPSData from '../TestGPSData.jsx';

const AdminAttendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const load = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await adminAPI.getAttendance({ date, departmentId: departmentId || undefined });
      setRows(res.data.employees || []);
    } catch (e) {
      setError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load departments once
    const fetchDeps = async () => {
      try {
        const depRes = await adminAPI.getDepartments();
        setDepartments(depRes.data || []);
      } catch (_) {
        // ignore
      }
    };
    fetchDeps();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, departmentId]);

  const update = async (employeeId, present) => {
    setError('');
    setSuccess('');
    try {
      const res = await adminAPI.updateAttendance(employeeId, { date, present });
      setRows(rows.map(r => r.id === employeeId ? { ...r, present: res.data.present, status: res.data.status, checkIn: res.data.checkIn, checkOut: res.data.checkOut, checkInLocation: res.data.checkInLocation, checkOutLocation: res.data.checkOutLocation } : r));
      setSuccess('Attendance updated');
    } catch (e) {
      setError('Failed to update attendance');
    }
  };

  const setRowField = (employeeId, field, value) => {
    setRows(prev => prev.map(r => r.id === employeeId ? { ...r, [field]: value } : r));
  };

  const saveRow = async (r) => {
    setError('');
    setSuccess('');
    try {
      // Derive present from status if present not explicitly edited
      const derivedPresent = r.status ? (r.status === 'absent' ? false : true) : r.present;
      const payload = { date, present: derivedPresent, status: r.status, checkIn: r.checkIn, checkOut: r.checkOut, checkInLocation: r.checkInLocation, checkOutLocation: r.checkOutLocation };
      const res = await adminAPI.updateAttendance(r.id, payload);
      setRows(rows.map(x => x.id === r.id ? { ...x, present: res.data.present, status: res.data.status, checkIn: res.data.checkIn, checkOut: res.data.checkOut, checkInLocation: res.data.checkInLocation, checkOutLocation: res.data.checkOutLocation } : x));
      setSuccess('Saved attendance');
    } catch (e) {
      setError('Failed to save attendance');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Daily Attendance</h2>
        <div className="flex items-center space-x-3">
          <select
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <button onClick={load} className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md">Reload</button>
          <button 
            onClick={() => setShowDebugInfo(!showDebugInfo)} 
            className="bg-blue-200 text-blue-800 px-3 py-2 rounded-md"
          >
            {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded">{success}</div>}

      {/* Debug Information */}
      {showDebugInfo && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-3">Debug Information</h3>
            <div className="text-sm text-yellow-700">
              <p><strong>Total Employees:</strong> {rows.length}</p>
              <p><strong>Employees with GPS Check-in:</strong> {rows.filter(r => r.checkInLocation).length}</p>
              <p><strong>Employees with GPS Check-out:</strong> {rows.filter(r => r.checkOutLocation).length}</p>
              <p><strong>Sample Data:</strong></p>
              <pre className="bg-yellow-100 p-2 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(rows.slice(0, 2), null, 2)}
              </pre>
            </div>
          </div>
          
          <TestGPSData onDataAdded={load} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading attendance..." />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
            <p className="text-sm text-blue-700">
              <span className="font-medium">📍 GPS Locations:</span> Shows check-in and check-out GPS coordinates with accuracy and address information
            </p>
          </div>
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Check Out</th>
                <th className="px-4 py-3">📍 GPS Locations</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.username}</td>
                  <td className="px-4 py-3">{r.department?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      value={r.status ?? (r.present === null ? '' : (r.present ? 'present' : 'absent'))}
                      onChange={e => setRowField(r.id, 'status', e.target.value || null)}
                    >
                      <option value="">Not marked</option>
                      <option value="present">Present</option>
                      <option value="half-day">Half-day</option>
                      <option value="absent">Absent</option>
                      <option value="leave">Leave</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {r.checkIn || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {r.checkOut || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <div className="space-y-2">
                      {/* Check In Location */}
                      {r.checkIn && (
                        <div className="flex items-start space-x-2">
                          <span className="text-green-600 text-sm">📍</span>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-700 mb-1">Check In Location:</div>
                            {r.checkInLocation ? (
                              <div>
                                <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                  {r.checkInLocation.latitude?.toFixed(6)}, {r.checkInLocation.longitude?.toFixed(6)}
                                </div>
                                {r.checkInLocation.label && (
                                  <div className="text-xs text-gray-500 mt-1 truncate max-w-40">
                                    {r.checkInLocation.label}
                                  </div>
                                )}
                                {r.checkInLocation.accuracy && (
                                  <div className="text-xs text-gray-400">
                                    Accuracy: {Math.round(r.checkInLocation.accuracy)}m
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                                No GPS data
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Check Out Location */}
                      {r.checkOut && (
                        <div className="flex items-start space-x-2">
                          <span className="text-red-600 text-sm">📍</span>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-700 mb-1">Check Out Location:</div>
                            {r.checkOutLocation ? (
                              <div>
                                <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                  {r.checkOutLocation.latitude?.toFixed(6)}, {r.checkOutLocation.longitude?.toFixed(6)}
                                </div>
                                {r.checkOutLocation.label && (
                                  <div className="text-xs text-gray-500 mt-1 truncate max-w-40">
                                    {r.checkOutLocation.label}
                                  </div>
                                )}
                                {r.checkOutLocation.accuracy && (
                                  <div className="text-xs text-gray-400">
                                    Accuracy: {Math.round(r.checkOutLocation.accuracy)}m
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                                No GPS data
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* No attendance data */}
                      {!r.checkIn && !r.checkOut && (
                        <div className="text-xs text-gray-400 italic">
                          No attendance recorded
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => update(r.id, true)} className="bg-green-600 text-white px-3 py-1 rounded">Mark Present</button>
                      <button onClick={() => update(r.id, false)} className="bg-red-600 text-white px-3 py-1 rounded">Mark Absent</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* GPS Statistics Summary */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">📍</span>
                  <span>GPS Check-ins: {rows.filter(r => r.checkInLocation).length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600">📍</span>
                  <span>GPS Check-outs: {rows.filter(r => r.checkOutLocation).length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">⚠️</span>
                  <span>No GPS Data: {rows.filter(r => r.checkIn && !r.checkInLocation).length}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Total: {rows.length} employees
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
