import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner.jsx';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    username: '',
    password: '',
    department: '',
    role: 'employee'
  });
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    password: '',
    department: '',
    role: 'employee',
    
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const currentUserId = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw)?._id : undefined;
    } catch {
      return undefined;
    }
  })();

  useEffect(() => {
    fetchData();
  }, []);

  // Ensure a default department is selected when departments load
  useEffect(() => {
    if (departments.length > 0) {
      setNewEmployee((prev) => ({
        ...prev,
        department: prev.department || (departments[0]?._id || ''),
      }));
      setEditForm((prev) => ({
        ...prev,
        department: prev.department || (departments[0]?._id || ''),
      }));
    }
  }, [departments]);

  const fetchData = async () => {
    try {
      const [usersResponse, departmentsResponse] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getDepartments()
      ]);
      
      setEmployees(usersResponse.data);
      setDepartments(departmentsResponse.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: newEmployee.name,
        username: newEmployee.username,
        password: newEmployee.password,
        role: newEmployee.role,
        department: newEmployee.department,
      };

      const response = await adminAPI.createUser(payload);
      setEmployees([...employees, response.data]);
      setNewEmployee({
        name: '',
        username: '',
        password: '',
        department: '',
        role: 'employee'
      });
      setShowAddForm(false);
      setSuccess(`${response.data.role === 'admin' ? 'Admin' : 'Employee'} added successfully`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add user');
    }
  };

  const startEditUser = (user) => {
    setEditingUserId(user._id);
    setEditForm({
      name: user.name || '',
      username: user.username || '',
      password: '',
      role: user.role || 'employee',
      department: user.department?._id || user.department || '',
      salaryPerDay: user.salaryPerDay ?? '',
    });
    setShowEditForm(true);
    setShowAddForm(false);
    setError('');
    setSuccess('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUserId) return;

    setError('');
    setSuccess('');

    try {
      const payload = {
        name: editForm.name,
        username: editForm.username,
        role: editForm.role,
        password: editForm.password ? editForm.password : undefined,
        department: editForm.department,
      };

      const response = await adminAPI.updateUser(editingUserId, payload);

      setEmployees(employees.map(u => u._id === editingUserId ? response.data : u));
      setShowEditForm(false);
      setEditingUserId(null);
      setEditForm({ name: '', username: '', password: '', department: '', role: 'employee' });
      setSuccess('User updated successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteEmployee = async (id) => {
    const user = employees.find(emp => emp._id === id);
    const userType = user?.role === 'admin' ? 'admin' : 'employee';

    if (id === currentUserId) {
      setError('You cannot delete your own account.');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete this ${userType}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      await adminAPI.deleteUser(id);
      setEmployees(employees.filter(emp => emp._id !== id));
      setSuccess(`${userType.charAt(0).toUpperCase() + userType.slice(1)} deleted successfully`);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete user');
      setSuccess('');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (filterRole !== 'all' && emp.role !== filterRole) return false;
    if (filterDepartment !== 'all') {
      const empDeptId = emp.department?._id || emp.department || '';
      if (empDeptId !== filterDepartment) return false;
    }
    return true;
  });

  const adminCount = employees.filter(emp => emp.role === 'admin').length;
  const employeeCount = employees.filter(emp => emp.role === 'employee').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage employees and admin users
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {!showAddForm && !showEditForm && (
            <>
              <button
                onClick={() => { setNewEmployee({ ...newEmployee, role: 'admin', department: newEmployee.department || (departments[0]?._id || '') }); setShowAddForm(true); }}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium"
              >
                + Add Admin
              </button>
              <button
                onClick={() => { setNewEmployee({ ...newEmployee, role: 'employee', department: newEmployee.department || (departments[0]?._id || '') }); setShowAddForm(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                + Add Employee
              </button>
            </>
          )}
          {(showAddForm || showEditForm) && (
            <button
              onClick={() => { setShowAddForm(false); setShowEditForm(false); setEditingUserId(null); }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">👑</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admin Users</p>
              <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">👷</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employeeCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New {newEmployee.role === 'admin' ? 'Admin' : 'Employee'}</h3>
          {departments.length === 0 && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
              No departments found. Please create a department first in Departments section.
            </div>
          )}
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={newEmployee.username}
                  onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  User Role *
                </label>
                <select
                  id="role"
                  value={newEmployee.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    const ensuredDept = newEmployee.department || (departments[0]?._id || '');
                    setNewEmployee({ ...newEmployee, role, department: ensuredDept });
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="employee">👷 Employee</option>
                  <option value="admin">👑 Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {newEmployee.role === 'admin' ? 
                    'Admin users have full system access and can manage all users.' : 
                    'Employees have limited access to their own data and attendance.'
                  }
                </p>
              </div>
              {/* Department shown for both roles; required for both */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  id="department"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                  disabled={departments.length === 0}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
             
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={
                  !newEmployee.name ||
                  !newEmployee.username ||
                  !newEmployee.password ||
                  !newEmployee.role ||
                  !newEmployee.department ||
                  departments.length === 0
                }
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  newEmployee.role === 'admin' 
                    ? 'text-white ' + ((!
                      newEmployee.name || !newEmployee.username || !newEmployee.password || !newEmployee.role || !newEmployee.department || departments.length === 0
                    ) ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700')
                    : 'text-white ' + ((!
                      newEmployee.name || !newEmployee.username || !newEmployee.password || !newEmployee.role || !newEmployee.department || departments.length === 0
                    ) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700')
                }`}
              >
                Add {newEmployee.role === 'admin' ? 'Admin' : 'Employee'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Form */}
      {showEditForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            
              <div>
                <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700">
                  Password (leave blank to keep unchanged)
                </label>
                <input
                  type="password"
                  id="edit-password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">
                  User Role *
                </label>
                <select
                  id="edit-role"
                  value={editForm.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    const ensuredDept = editForm.department || (departments[0]?._id || '');
                    setEditForm({ ...editForm, role, department: ensuredDept });
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="employee">👷 Employee</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>
              
              {/* Department shown for both roles on edit; required for both */}
              <div>
                <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  id="edit-department"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-6 py-2 rounded-md font-medium transition-colors bg-yellow-600 text-white hover:bg-yellow-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => { setShowEditForm(false); setEditingUserId(null); }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <label htmlFor="filter-role" className="text-sm font-medium text-gray-700">Filter by Role:</label>
            <select
              id="filter-role"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Users ({employees.length})</option>
              <option value="admin">Admins ({adminCount})</option>
              <option value="employee">Employees ({employeeCount})</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="filter-department" className="text-sm font-medium text-gray-700">Filter by Department:</label>
            <select
              id="filter-department"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filterRole === 'all' ? 'All Users' : 
             filterRole === 'admin' ? 'Admin Users' : 'Employee Users'}
          </h3>
        </div>
        <div className="p-6">
          {filteredEmployees.length > 0 ? (
            <div className="space-y-4">
              {filteredEmployees.map((emp) => (
                <div key={emp._id} className={`flex items-center justify-between p-4 rounded-lg border ${
                  emp.role === 'admin' ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">
                        {emp.role === 'admin' ? '👑' : '👷'}
                      </span>
                      <h4 className="font-medium text-gray-900">{emp.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        emp.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {emp.role === 'admin' 
                          ? `👑 Admin${emp.department?.name ? ` (${emp.department.name})` : ''}` 
                          : '👷 Employee'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{emp.username}</p>
                   
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditUser(emp)}
                      className="px-4 py-2 rounded-md font-medium transition-colors bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300"
                    >
                      Edit
                    </button>
                    {emp.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteEmployee(emp._id)}
                        disabled={deletingId === emp._id || emp._id === currentUserId}
                        title={emp._id === currentUserId ? 'You cannot delete your own account' : ''}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                          deletingId === emp._id || emp._id === currentUserId
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {deletingId === emp._id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No {filterRole === 'all' ? 'users' : filterRole === 'admin' ? 'admin users' : 'employees'} found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
