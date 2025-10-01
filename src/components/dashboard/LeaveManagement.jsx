import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner.jsx';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAutoFill, setShowAutoFill] = useState(false);
  const [autoFillDates, setAutoFillDates] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/admin/leaves');
      setLeaves(response.data);
    } catch (error) {
      setError('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      const response = await api.patch(`/admin/leaves/${leaveId}`, { status });
      
      setLeaves(leaves.map(leave => 
        leave._id === leaveId ? response.data : leave
      ));
      
      setSuccess(`Leave ${status} successfully`);
    } catch (error) {
      setError('Failed to update leave status');
    }
  };

  const handleAutoFill = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/admin/leaves/autofill', autoFillDates);
      setSuccess(response.data.message);
      setShowAutoFill(false);
      setAutoFillDates({ startDate: '', endDate: '' });
    } catch (error) {
      setError('Failed to apply leave updates');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading leave requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
        <button
          onClick={() => setShowAutoFill(!showAutoFill)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          {showAutoFill ? 'Cancel' : 'Auto-fill Leave Updates'}
        </button>
      </div>

      {/* Auto-fill Form */}
      {showAutoFill && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Auto-fill Leave Updates</h3>
          <p className="text-sm text-gray-600 mb-4">
            This will automatically update attendance records for approved leaves in the specified date range.
          </p>
          <form onSubmit={handleAutoFill} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={autoFillDates.startDate}
                  onChange={(e) => setAutoFillDates({ ...autoFillDates, startDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={autoFillDates.endDate}
                  onChange={(e) => setAutoFillDates({ ...autoFillDates, endDate: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Apply Updates
              </button>
              <button
                type="button"
                onClick={() => setShowAutoFill(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
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

      {/* Leave Requests List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Leave Requests</h3>
        </div>
        <div className="p-6">
          {leaves.length > 0 ? (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {leave.employee?.name || 'Employee'}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                          leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Type:</span> {leave.leaveType}
                        </div>
                        <div>
                          <span className="font-medium">Dates:</span> {leave.startDate} to {leave.endDate}
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium">Reason:</span> {leave.reason}
                        </div>
                      </div>
                      
                      {leave.approvedBy && (
                        <div className="mt-2 text-sm text-gray-500">
                          {leave.status === 'approved' ? 'Approved' : 'Rejected'} by {leave.approvedBy.name}
                        </div>
                      )}
                    </div>
                    
                    {leave.status === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleStatusUpdate(leave._id, 'approved')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(leave._id, 'rejected')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No leave requests found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
