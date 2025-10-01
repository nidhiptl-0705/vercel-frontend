import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setIsAuthenticated, setUser }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [theme, setTheme] = useState('very-dark'); // light, medium, dark, very-dark, midnight
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Theme configurations
  const themes = {
    
    medium: { name: 'Medium', class: 'gradient-bg-medium', icon: '🌅' },
    dark: { name: 'Dark', class: 'gradient-bg-dark', icon: '🌙' },
    'very-dark': { name: 'Very Dark', class: 'gradient-bg-very-dark', icon: '🌚' },
    midnight: { name: 'Midnight', class: 'gradient-bg-midnight', icon: '🌌' }
  };    

  // Generate random floating shapes
  const generateFloatingShapes = () => {
    const shapes = [];
    for (let i = 0; i < 8; i++) {
      shapes.push({
        id: i,
        size: Math.random() * 100 + 50,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 6,
        animationDuration: Math.random() * 4 + 4,
      });
    }
    return shapes;
  };

  const [floatingShapes] = useState(generateFloatingShapes());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setIsAnimating(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        // Check if the selected role matches the user's actual role
        if (isAdmin && result.user.role !== 'admin') {
          setError('Access denied. You selected Admin login but your account is not an admin account.');
          setIsAnimating(false);
          return;
        }
        
        if (!isAdmin && result.user.role !== 'employee') {
          setError('Access denied. You selected Employee login but your account is an admin account.');
          setIsAnimating(false);
          return;
        }
        
        setUser(result.user);
        setIsAuthenticated(true);
        // Navigate immediately to the correct dashboard
        if (result.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError(result.message);
        setIsAnimating(false);
      }
    } catch (error) {
      setError('An error occurred during login.');
      setIsAnimating(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (admin) => {
    setIsAdmin(admin);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${themes[theme].class} flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8`}>
      {/* Floating Background Shapes */}
      {floatingShapes.map((shape) => (
        <div
          key={shape.id}
          className={`floating-shape absolute ${
           
            theme === 'medium' ? 'opacity-25' :
            theme === 'dark' ? 'opacity-20' :
            theme === 'very-dark' ? 'opacity-15' :
            'opacity-10'
          }`}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            animationDelay: `${shape.animationDelay}s`,
            animationDuration: `${shape.animationDuration}s`,
          }}
        />
      ))}

      {/* Main Login Container */}
      <div className="relative z-10 max-w-md w-full mx-auto">
        {/* Glass Effect Container */}
        <div className={`${
          theme === 'midnight' || theme === 'very-dark' ? 'glass-effect-dark' :
          'glass-effect'
        } rounded-2xl p-6 shadow-2xl animate-scale-in relative`}>

          {/* Header Section */}
          <div className="text-center mb-8 animate-slide-down pt-4">
            {/* Animated Lock Icon */}
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full animate-bounce-slow hover:animate-pulse-slow transition-all duration-300 hover:scale-110 hover:bg-white/30 lock-icon-glow">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in leading-tight text-center">
              ATS Portal
            </h1>
            <p className="text-white/80 text-sm animate-fade-in mb-2">
              Attendance Tracking System
            </p>
            <div className="text-xs text-white/60 animate-pulse-slow">
              {themes[theme].icon} {themes[theme].name} Theme
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-8 animate-slide-up">
            <div className="flex justify-center space-x-2 bg-white/10 rounded-xl p-1">
              <button
                type="button"
                onClick={() => handleRoleChange(false)}
                className={`role-button px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  !isAdmin
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Employee</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange(true)}
                className={`role-button px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isAdmin
                    ? 'bg-red-500 text-white shadow-lg transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Admin</span>
                </span>
              </button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-white/60 text-xs animate-pulse-slow">
                {isAdmin ? '🔐 Administrative Access' : '👤 Employee Access'}
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-6 animate-slide-up" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                    name="username"
                  type="username"
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                  className="form-field block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="form-field block w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg className="h-5 w-5 text-white/50 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`bg-red-500/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-xl text-sm text-center error-shake animate-slide-down`}>
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`button-hover-effect w-full py-3 px-4 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
                isAdmin 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500'
              } ${loading ? 'animate-pulse' : ''}`}
            >
              <div className="flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign in as {isAdmin ? 'Admin' : 'Employee'}</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center animate-fade-in">
            {/* Theme Selector */}
            <div className="mb-4">
              <p className="text-white/50 text-xs mb-3">
                Choose Theme
              </p>
              <div className="flex justify-center space-x-2 bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                {Object.entries(themes).map(([key, themeConfig]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={`px-3 py-2 rounded-md text-sm transition-all duration-300 ${
                      theme === key
                        ? 'bg-white/20 text-white shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    title={`Switch to ${themeConfig.name} theme`}
                  >
                    <span className="flex items-center space-x-1">
                      <span>{themeConfig.icon}</span>
                      <span className="text-xs">{themeConfig.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <p className="text-white/50 text-xs">
              Secure access to your dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
