import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner.jsx';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });
  const [editDepartment, setEditDepartment] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [departmentEmployees, setDepartmentEmployees] = useState({});

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const [departmentsResponse, employeesResponse] = await Promise.all([
        api.get('/admin/departments'),
        api.get('/admin/employees')
      ]);
      
      setDepartments(departmentsResponse.data);
      
      // Group employees by department
      const employeesByDept = {};
      employeesResponse.data.forEach(emp => {
        if (emp.department) {
          const deptId = emp.department._id || emp.department;
          if (!employeesByDept[deptId]) {
            employeesByDept[deptId] = [];
          }
          employeesByDept[deptId].push(emp);
        }
      });
      setDepartmentEmployees(employeesByDept);
    } catch (error) {
      setError('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/admin/departments', newDepartment);
      setDepartments([...departments, response.data]);
      setNewDepartment({ name: '', description: '' });
      setShowAddForm(false);
      setSuccess('Department added successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add department');
    }
  };

  const handleEditDepartment = (dept) => {
    setEditingId(dept._id);
    setEditDepartment({ name: dept.name, description: dept.description || '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDepartment({ name: '', description: '' });
  };

  const handleUpdateDepartment = async (id) => {
    if (!editDepartment.name.trim()) {
      setError('Department name is required');
      return;
    }

    try {
      setError('');
      const response = await api.put(`/admin/departments/${id}`, editDepartment);
      
      setDepartments(departments.map(dept => 
        dept._id === id ? response.data : dept
      ));
      
      setEditingId(null);
      setEditDepartment({ name: '', description: '' });
      setSuccess('Department updated successfully');
    } catch (error) {
      console.error('Update department error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update department';
      setError(errorMessage);
    }
  };

  const handleDeleteDepartment = async (id) => {
    const department = departments.find(dept => dept._id === id);
    const employeeCount = departmentEmployees[id]?.length || 0;
    
    if (employeeCount > 0) {
      const confirmMessage = `Cannot delete "${department.name}" because it has ${employeeCount} employee(s). Please reassign or delete these employees first.`;
      alert(confirmMessage);
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete "${department.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      setError('');
      setSuccess('');
      
      const response = await api.delete(`/admin/departments/${id}`);
      setDepartments(departments.filter(dept => dept._id !== id));
      setSuccess('Department deleted successfully');
    } catch (error) {
      console.error('Delete department error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Cannot delete department';
        setError(errorMessage);
        
        // Refresh employee data in case of stale state
        try {
          const employeesResponse = await api.get('/admin/employees');
          const employeesByDept = {};
          employeesResponse.data.forEach(emp => {
            if (emp.department) {
              const deptId = emp.department._id || emp.department;
              if (!employeesByDept[deptId]) {
                employeesByDept[deptId] = [];
              }
              employeesByDept[deptId].push(emp);
            }
          });
          setDepartmentEmployees(employeesByDept);
        } catch (refreshError) {
          console.error('Failed to refresh employee data:', refreshError);
        }
      } else if (error.response?.status === 404) {
        setError('Department not found');
      } else {
        setError('Failed to delete department. Please try again.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading departments..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
        <div className="flex space-x-2">
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add Department'}
          </button>
        </div>
      </div>

      {/* Add Department Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Department</h3>
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Department Name
              </label>
              <input
                type="text"
                id="name"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={newDepartment.description}
                onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Department
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
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

      {/* Departments List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Departments</h3>
        </div>
        <div className="p-6">
          {departments.length > 0 ? (
            <div className="space-y-4">
              {departments.map((dept) => (
                <div key={dept._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    {editingId === dept._id ? (
                      <div className="space-y-3">
                        <div>
                          <label htmlFor={`edit-name-${dept._id}`} className="block text-sm font-medium text-gray-700">
                            Department Name
                          </label>
                          <input
                            type="text"
                            id={`edit-name-${dept._id}`}
                            value={editDepartment.name}
                            onChange={(e) => setEditDepartment({ ...editDepartment, name: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor={`edit-description-${dept._id}`} className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            id={`edit-description-${dept._id}`}
                            value={editDepartment.description}
                            onChange={(e) => setEditDepartment({ ...editDepartment, description: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            rows="2"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateDepartment(dept._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{dept.name}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {departmentEmployees[dept._id]?.length || 0} employee(s)
                          </span>
                        </div>
                        {dept.description && (
                          <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
                        )}
                      </>
                    )}
                  </div>
                  {editingId !== dept._id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditDepartment(dept)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                        title="Edit department"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept._id)}
                        disabled={deletingId === dept._id || (departmentEmployees[dept._id]?.length > 0)}
                        className={`px-3 py-1 rounded-md font-medium transition-colors text-sm ${
                          deletingId === dept._id
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : (departmentEmployees[dept._id]?.length > 0)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                        title={departmentEmployees[dept._id]?.length > 0 ? 'Cannot delete department with employees' : 'Delete department'}
                      >
                        {deletingId === dept._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No departments found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Departments;
