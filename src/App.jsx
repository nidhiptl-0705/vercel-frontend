import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import TestPage from './components/TestPage';
import About from './components/About';
import { AuthProvider } from './contexts/AuthContext';
import { TrackingProvider } from './contexts/TrackingContext.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  // Role-based route protection
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (!user || !allowedRoles.includes(user.role)) {
      // Redirect based on user role
      if (user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (user?.role === 'employee') {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  return (
    <AuthProvider>
      <TrackingProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-gray-500">
            <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                (user?.role === 'admin' ? 
                  <Navigate to="/admin" replace /> : 
                  <Navigate to="/dashboard" replace />
                ) : 
                <LoginPage setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <Dashboard user={user} setIsAuthenticated={setIsAuthenticated} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard user={user} setIsAuthenticated={setIsAuthenticated} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test" 
              element={<TestPage />} 
            />
            <Route 
              path="/about" 
              element={<About />} 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                (user?.role === 'admin' ? 
                  <Navigate to="/admin" replace /> : 
                  <Navigate to="/dashboard" replace />
                ) : 
                <Navigate to="/login" replace />
              } 
            />
            </Routes>
          </div>
        </Router>
      </TrackingProvider>
    </AuthProvider>
  );
}

export default App;
