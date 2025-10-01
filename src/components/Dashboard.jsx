import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Overview from './dashboard/Overview';
import LeaveRequest from './dashboard/LeaveRequest';
import Attendance from './dashboard/Attendance';
import Settings from './dashboard/Settings';


const Dashboard = ({ user, setIsAuthenticated }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();

  // Ensure only employee users can access this dashboard
  useEffect(() => {
    if (user && user.role !== 'employee') {
      logout();
      setIsAuthenticated(false);
    }
  }, [user, logout, setIsAuthenticated]);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
  };

  // Employee-only tabs
  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'attendance', name: 'My Attendance', icon: '⏰' },
    { id: 'leave', name: 'Leave Requests', icon: '📅' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview user={user} />;
      case 'attendance':
        return <Attendance />;
      case 'leave':
        return <LeaveRequest />;
      case 'settings':
        return <Settings onLogout={handleLogout} />;
      default:
        return <Overview user={user} />;
    }
  };

  // If user is not employee, show access denied
  if (!user || user.role !== 'employee') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the employee dashboard.</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                aria-label="Toggle menu"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5h14a1 1 0 100-2H3a1 1 0 100 2zm14 4H3a1 1 0 000 2h14a1 1 0 100-2zm0 6H3a1 1 0 000 2h14a1 1 0 100-2z" clipRule="evenodd" />
                </svg>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                Employee Dashboard - Attendance Tracking System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/about"
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                title="Learn about this website and the tech stack"
              >
                ℹ️ About
              </Link>
              <span className="text-xs sm:text-sm text-gray-700">
                Welcome, {user?.name}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Employee
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <div className="w-64 bg-white shadow-sm min-h-screen hidden md:block">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
              <Link
                to="/about"
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                title="About this website"
              >
                <span className="mr-3 text-lg">ℹ️</span>
                About
              </Link>
            </div>
          </nav>
        </div>

        {/* Sidebar - Mobile Drawer */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="relative z-50 w-64 bg-white min-h-full shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="font-semibold text-gray-800">Menu</span>
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-50"
                  aria-label="Close menu"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <nav className="mt-4">
                <div className="px-4 space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3 text-lg">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                  <Link
                    to="/about"
                    onClick={() => setIsSidebarOpen(false)}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    title="About this website"
                  >
                    <span className="mr-3 text-lg">ℹ️</span>
                    About
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
