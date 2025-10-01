import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner.jsx';

const AdminEodReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ 
    startDate: '', 
    endDate: '', 
    employeeId: '',
    date: ''
  });
  const [employees, setEmployees] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Apply filters
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      } else if (filters.date) {
        params.date = filters.date;
      }
      
      if (filters.employeeId) {
        params.employeeId = filters.employeeId;
      }
      
      const res = await adminAPI.getEods(params);
      setItems(res.data || []);
    } catch (e) {
      setError('Failed to load EODs');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await adminAPI.getUsers();
      const employeeList = res.data.filter(user => user.role === 'employee');
      setEmployees(employeeList);
    } catch (e) {
      console.error('Failed to load employees');
    }
  };

  useEffect(() => {
    load();
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({ 
      startDate: '', 
      endDate: '', 
      employeeId: '',
      date: ''
    });
    load();
  };

  const getFilterSummary = () => {
    const activeFilters = [];
    if (filters.startDate && filters.endDate) {
      activeFilters.push(`${filters.startDate} to ${filters.endDate}`);
    } else if (filters.date) {
      activeFilters.push(filters.date);
    }
    if (filters.employeeId) {
      const employee = employees.find(emp => emp._id === filters.employeeId);
      if (employee) {
        activeFilters.push(employee.name);
      }
    }
    return activeFilters.length > 0 ? `(${activeFilters.join(', ')})` : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading EOD reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">
          EOD Reports {getFilterSummary()}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={load}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter EOD Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Single Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                placeholder="Select date"
              />
            </div>

            {/* Date Range Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                placeholder="Start date"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                placeholder="End date"
              />
            </div>

            {/* Employee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.employeeId}
                onChange={(e) => handleFilterChange('employeeId', e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={load}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              EOD Submissions ({items.length})
            </h3>
            {items.length > 0 && (
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg mb-2">No EOD reports found</p>
              <p className="text-gray-400 text-sm">
                {Object.values(filters).some(f => f) 
                  ? 'Try adjusting your filters or clear them to see all reports'
                  : 'No EOD reports have been submitted yet'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((eod) => (
                <div key={eod._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {eod.employee?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{eod.employee?.name}</div>
                        <div className="text-sm text-gray-500">{eod.employee?.username}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                      {new Date(eod.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed bg-white p-3 rounded border">
                    {eod.content}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Submitted: {new Date(eod.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEodReports;


