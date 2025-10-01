import { useState } from 'react';
import api from '../services/api';

const TestGPSData = ({ onDataAdded }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const addSampleGPSData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Sample GPS data for testing
      const sampleCheckInLocation = {
        latitude: 28.6139 + (Math.random() - 0.5) * 0.001, // Add some variation
        longitude: 77.2090 + (Math.random() - 0.5) * 0.001,
        accuracy: Math.random() * 50 + 10, // 10-60 meters accuracy
        label: 'Office Building - Main Entrance',
        timestamp: new Date().toISOString()
      };

      const sampleCheckOutLocation = {
        latitude: 28.6139 + (Math.random() - 0.5) * 0.001,
        longitude: 77.2090 + (Math.random() - 0.5) * 0.001,
        accuracy: Math.random() * 50 + 10,
        label: 'Office Building - Main Entrance',
        timestamp: new Date().toISOString()
      };

      // Add sample attendance with GPS data
      const response = await api.post('/employee/attendance', {
        date: today,
        present: true,
        status: 'present',
        checkIn: '09:15',
        checkOut: '18:30',
        checkInLocation: sampleCheckInLocation,
        checkOutLocation: sampleCheckOutLocation
      });

      setSuccess('Sample GPS data added successfully!');
      if (onDataAdded) {
        onDataAdded();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add sample GPS data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-lg font-medium text-blue-800 mb-3">Test GPS Data</h3>
      <p className="text-sm text-blue-700 mb-4">
        Add sample GPS attendance data for testing the display functionality.
      </p>
      
      <button
        onClick={addSampleGPSData}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
      >
        {loading ? 'Adding...' : 'Add Sample GPS Data'}
      </button>

      {success && (
        <div className="mt-3 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded">
          {success}
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default TestGPSData;
