import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner.jsx';

const Salary = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);

    if (user.role === 'admin') {
      fetchEmployees();
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/employees');
      setEmployees(response.data);
    } catch (error) {
      setError('Failed to fetch employees');
    }
  };

  const calculateSalary = async (e) => {
    e.preventDefault();
    setError('');
    setSalaryData(null);
    setLoading(true);

    try {
      let response;
      
      if (userRole === 'admin') {
        if (!selectedEmployee) {
          setError('Please select an employee');
          setLoading(false);
          return;
        }
        
        response = await api.post('/admin/salary/calculate', {
          employeeId: selectedEmployee,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
      } else {
        // For employees, calculate their own salary
        response = await api.get('/employee/salary', {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        });
      }
      
      setSalaryData(response.data);
    } catch (error) {
      setError('Failed to calculate salary');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Salary Calculator</h2>
      
      {/* Salary Calculation Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Calculate Salary</h3>
        <form onSubmit={calculateSalary} className="space-y-4">
          {userRole === 'admin' && (
            <div>
              <label htmlFor="employee" className="block text-sm font-medium text-gray-700">
                Select Employee
              </label>
              <select
                id="employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose an employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} - {emp.department?.name || 'No Department'}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
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
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating...' : 'Calculate Salary'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Salary Results */}
      {salaryData && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Salary Calculation Results</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-gray-900">{salaryData.totalDays}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Present Days</p>
                <p className="text-2xl font-bold text-green-600">{salaryData.presentDays}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Absent Days</p>
                <p className="text-2xl font-bold text-red-600">{salaryData.absentDays}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Daily Rate</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(salaryData.salaryPerDay)}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Salary</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(salaryData.totalSalary)}
                </p>
              </div>
            </div>
            
            <div className="mt-6 text-sm text-gray-600">
              <p><strong>Calculation:</strong> {salaryData.presentDays} present days × {formatCurrency(salaryData.salaryPerDay)} daily rate = {formatCurrency(salaryData.totalSalary)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salary;
