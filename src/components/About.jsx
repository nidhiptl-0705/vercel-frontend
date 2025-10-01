import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 sm:p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                <span className="text-4xl">🏢</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">About ATS</h1>
              <p className="text-xl sm:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
                Attendance Tracking System - A comprehensive employee management solution with GPS technology
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8 lg:p-12">

            {/* Introduction */}
            <section className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 sm:p-8 mb-8 border-l-4 border-yellow-400">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👋</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-yellow-900 mb-4">Introduction</h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="text-base sm:text-lg leading-relaxed">
                      Welcome to the Attendance Tracking System (ATS). This platform helps organizations
                      simplify day-to-day workforce operations by centralizing attendance, leave, GPS,
                      and department management in one place.
                    </p>
                    <p className="text-base sm:text-lg leading-relaxed">
                      Whether you are an administrator monitoring organization-wide metrics or an employee
                      managing your schedule, ATS provides a clean, secure, and intuitive experience.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-8">
              {/* Website Overview */}
              <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 border-l-4 border-blue-400">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏢</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4">About This Website</h2>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-base sm:text-lg leading-relaxed">
                        The Attendance Tracking System (ATS) is a modern, full-stack web application designed to streamline 
                        employee management and attendance tracking for organizations of all sizes. This system provides 
                        comprehensive tools for both administrators and employees to manage attendance, leave requests, 
                        GPS information, and departmental organization.
                      </p>
                      <p className="text-base sm:text-lg leading-relaxed">
                        Built with modern web technologies, ATS offers a responsive, user-friendly interface that works 
                        seamlessly across desktop and mobile devices. The system ensures data security and provides 
                        real-time updates for all attendance-related activities.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Key Features */}
              <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 sm:p-8 border-l-4 border-green-400">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✨</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-green-900">Key Features</h2>
                  </div>
                </div>
            
                {/* GPS & Location Features */}
                <div className="mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
                    <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600">📍</span>
                      </span>
                      GPS & Location Tracking
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">🗺️</span>
                          <span className="text-gray-700 font-medium">Real-time GPS location tracking</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">🏢</span>
                          <span className="text-gray-700 font-medium">Geofence-based automatic check-in/out</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">📍</span>
                          <span className="text-gray-700 font-medium">Multiple office location support</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">📊</span>
                          <span className="text-gray-700 font-medium">Live location dashboard for admins</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">⚡</span>
                          <span className="text-gray-700 font-medium">Automatic attendance on entry/exit</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">🔍</span>
                          <span className="text-gray-700 font-medium">Location accuracy validation</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">🌐</span>
                          <span className="text-gray-700 font-medium">Reverse geocoding for addresses</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">📱</span>
                          <span className="text-gray-700 font-medium">Background tracking support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core System Features */}
                <div className="mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
                    <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600">🏢</span>
                      </span>
                      Core System Features
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">📊</span>
                          <span className="text-gray-700 font-medium">Real-time attendance tracking</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">📅</span>
                          <span className="text-gray-700 font-medium">Leave request management</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">💰</span>
                            <span className="text-gray-700 font-medium">GPS calculation and management</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">👥</span>
                          <span className="text-gray-700 font-medium">Employee and department management</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">🔐</span>
                          <span className="text-gray-700 font-medium">Secure authentication system</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">📱</span>
                          <span className="text-gray-700 font-medium">Responsive design for all devices</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">📈</span>
                          <span className="text-gray-700 font-medium">Analytics and reporting dashboard</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">⚙️</span>
                          <span className="text-gray-700 font-medium">Customizable settings and preferences</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Features */}
                <div>
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
                    <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600">🚀</span>
                      </span>
                      Advanced Features
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">📝</span>
                          <span className="text-gray-700 font-medium">End-of-Day (EOD) reports</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">⏰</span>
                          <span className="text-gray-700 font-medium">Smart timing validation</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">📊</span>
                          <span className="text-gray-700 font-medium">Attendance analytics and insights</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">🔄</span>
                          <span className="text-gray-700 font-medium">Persistent tracking across navigation</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">👑</span>
                          <span className="text-gray-700 font-medium">Role-based access control</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">🌍</span>
                          <span className="text-gray-700 font-medium">Multi-location geofence support</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">📱</span>
                          <span className="text-gray-700 font-medium">Mobile-optimized interface</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <span className="text-2xl">🔔</span>
                          <span className="text-gray-700 font-medium">Real-time notifications</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* GPS Tracking System */}
              <section className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 sm:p-8 border-l-4 border-blue-400">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📍</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4">GPS Tracking System</h2>
                    <div className="space-y-6 text-gray-700">
                      <p className="text-base sm:text-lg leading-relaxed">
                        The ATS includes a sophisticated GPS-based attendance tracking system that provides accurate, 
                        location-aware attendance management. The system uses modern web APIs and geofencing technology 
                        to automatically track employee locations and manage attendance.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                          <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-blue-600 text-sm">⚡</span>
                            </span>
                            Core GPS Features
                          </h4>
                          <ul className="space-y-3">
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Real-time location tracking using HTML5 Geolocation API</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Geofence-based automatic check-in/check-out</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Multiple office location support with configurable radius</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Location accuracy validation and error handling</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Background tracking that persists across page navigation</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Reverse geocoding for human-readable addresses</span>
                            </li>
                          </ul>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                          <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-blue-600 text-sm">🔧</span>
                            </span>
                            Technical Implementation
                          </h4>
                          <ul className="space-y-3">
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Context-based state management for persistent tracking</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Adaptive fallback strategies for location accuracy</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Haversine formula for precise distance calculations</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Event-driven architecture for geofence transitions</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Mobile-optimized with wake lock support</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>Cross-browser compatibility and error handling</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Technology Stack */}
              <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 sm:p-8 border-l-4 border-purple-400">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💻</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-6">Technology Stack</h2>
            
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                      {/* Frontend Technologies */}
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                          <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-purple-600 text-sm">⚛️</span>
                          </span>
                          Frontend
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">⚛️</span>
                              <span className="font-medium">React</span>
                            </div>
                            <span className="text-sm text-gray-500">v18.2.0</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">⚡</span>
                              <span className="font-medium">Vite</span>
                            </div>
                            <span className="text-sm text-gray-500">v4.1.0</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🎨</span>
                              <span className="font-medium">Tailwind CSS</span>
                            </div>
                            <span className="text-sm text-gray-500">v3.2.7</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">📊</span>
                              <span className="font-medium">Chart.js</span>
                            </div>
                            <span className="text-sm text-gray-500">v4.5.0</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🌐</span>
                              <span className="font-medium">Axios</span>
                            </div>
                            <span className="text-sm text-gray-500">v1.3.4</span>
                          </div>
                        </div>
                      </div>

                      {/* Backend Technologies */}
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                          <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-purple-600 text-sm">🚀</span>
                          </span>
                          Backend
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🚀</span>
                              <span className="font-medium">Node.js</span>
                            </div>
                            <span className="text-sm text-gray-500">Runtime</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🌐</span>
                              <span className="font-medium">Express.js</span>
                            </div>
                            <span className="text-sm text-gray-500">v4.21.2</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🍃</span>
                              <span className="font-medium">MongoDB</span>
                            </div>
                            <span className="text-sm text-gray-500">Database</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🔗</span>
                              <span className="font-medium">Mongoose</span>
                            </div>
                            <span className="text-sm text-gray-500">v8.17.2</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🔐</span>
                              <span className="font-medium">JWT</span>
                            </div>
                            <span className="text-sm text-gray-500">Authentication</span>
                          </div>
                        </div>
                      </div>

                      {/* GPS & Location Technologies */}
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                          <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-purple-600 text-sm">📍</span>
                          </span>
                          GPS & Location
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">📍</span>
                              <span className="font-medium">Geolocation API</span>
                            </div>
                            <span className="text-sm text-gray-500">HTML5</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🗺️</span>
                              <span className="font-medium">BigDataCloud API</span>
                            </div>
                            <span className="text-sm text-gray-500">Reverse Geocoding</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🌍</span>
                              <span className="font-medium">Haversine Formula</span>
                            </div>
                            <span className="text-sm text-gray-500">Distance Calculation</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🔒</span>
                              <span className="font-medium">Wake Lock API</span>
                            </div>
                            <span className="text-sm text-gray-500">Background Tracking</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">⚡</span>
                              <span className="font-medium">Context API</span>
                            </div>
                            <span className="text-sm text-gray-500">  State Management</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Development Tools */}
              <section className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 sm:p-8 border-l-4 border-orange-400">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🛠️</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-orange-900 mb-6">Development Tools & Libraries</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h4 className="text-lg font-bold text-orange-800 mb-4">Frontend Tools</h4>
                        <ul className="space-y-3">
                          <li className="flex items-center space-x-2">
                            <span className="text-orange-500">•</span>
                            <span>ESLint (Code linting)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-orange-500">•</span>
                            <span>PostCSS (CSS processing)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-orange-500">•</span>
                            <span>Autoprefixer (CSS compatibility)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-orange-500">•</span>
                            <span>React Router DOM (Routing)</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h4 className="text-lg font-bold text-orange-800 mb-4">Backend Tools</h4>
                        <ul className="space-y-3">
                          <li className="flex items-center space-x-2">
                            <span className="text-orange-500">•</span>
                            <span>Nodemon (Development server)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-orange-500">•</span>
                            <span>Morgan (HTTP logging)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-orange-500">•</span>
                            <span>CORS (Cross-origin requests)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-orange-500">•</span>
                            <span>bcryptjs (Password hashing)</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h4 className="text-lg font-bold text-orange-800 mb-4">Utilities</h4>
                        <ul className="space-y-3">
                          <li className="flex items-center space-x-2">
                            <span className="text-orange-500">•</span>
                            <span>Zod (Schema validation)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-orange-500">•</span>
                            <span>Cookie Parser (Cookie handling)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-orange-500">•</span>
                            <span>dotenv (Environment variables)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-orange-500">•</span>
                            <span>path-to-regexp (URL matching)</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* User Roles & Capabilities */}
              <section className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 sm:p-8 border-l-4 border-indigo-400">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-6">User Roles & Capabilities</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
                          <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-indigo-600">👑</span>
                          </span>
                          Admin Capabilities
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>Manage employees and departments</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>View comprehensive attendance reports</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>Configure GPS locations and geofences</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>Monitor live location tracking dashboard</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>Manage leave requests and approvals</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>Access EOD reports and analytics</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>Configure system settings and preferences</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>Export attendance data and reports</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
                          <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-indigo-600">👤</span>
                          </span>
                          Employee Capabilities
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>GPS-based automatic check-in/check-out</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>Manual attendance tracking with location</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>Submit and track leave requests</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>View personal attendance history</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>Submit End-of-Day (EOD) reports</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>Real-time location tracking</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>View work duration and status</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span>Access personal dashboard and analytics</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Architecture */}
              <section className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 sm:p-8 border-l-4 border-gray-400">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏗️</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">System Architecture</h2>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-base sm:text-lg leading-relaxed">
                        The ATS follows a modern full-stack architecture with clear separation of concerns:
                      </p>
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <ul className="space-y-3">
                          <li className="flex items-start space-x-3">
                            <span className="text-gray-500 mt-1">•</span>
                            <span><strong>Frontend:</strong> React-based single-page application with component-based architecture</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-gray-500 mt-1">•</span>
                            <span><strong>Backend:</strong> RESTful API built with Express.js and Node.js</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-gray-500 mt-1">•</span>
                            <span><strong>Database:</strong> MongoDB for flexible document-based data storage</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-gray-500 mt-1">•</span>
                            <span><strong>Authentication:</strong> JWT-based stateless authentication system</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-gray-500 mt-1">•</span>
                            <span><strong>State Management:</strong> React Context API for global state management</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-gray-500 mt-1">•</span>
                            <span><strong>GPS Tracking:</strong> Context-based persistent location tracking system</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-gray-500 mt-1">•</span>
                            <span><strong>Styling:</strong> Tailwind CSS for utility-first responsive design</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="text-gray-500 mt-1">•</span>
                            <span><strong>Real-time Updates:</strong> Event-driven geofence detection and automatic attendance</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact/Support */}
              <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 sm:p-12 text-center text-white">
                <div className="max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-6">
                    <span className="text-3xl">📞</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">Support & Contact</h2>
                  <p className="text-lg sm:text-xl text-indigo-100 mb-6 leading-relaxed">
                    For technical support, feature requests, or general inquiries about the ATS system, 
                    please contact your system administrator or IT department.
                  </p>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 inline-block">
                    <p className="text-sm text-indigo-100">
                      Version: 1.0.0 | Last Updated: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
