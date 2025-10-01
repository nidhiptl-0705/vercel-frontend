import { useState } from 'react';
import logger from '../utils/logger.js';
import GPSTest from './GPSTest.jsx';

const TestPage = () => {
  const [testResults, setTestResults] = useState([]);

  const runTests = () => {
    const results = [];
    
    // Test 1: Check if React is working
    try {
      results.push({ test: 'React Rendering', status: '✅ PASS', message: 'React is working correctly' });
    } catch (error) {
      results.push({ test: 'React Rendering', status: '❌ FAIL', message: error.message });
    }

    // Test 2: Check localStorage
    try {
      localStorage.setItem('test', 'value');
      const testValue = localStorage.getItem('test');
      localStorage.removeItem('test');
      
      if (testValue === 'value') {
        results.push({ test: 'LocalStorage', status: '✅ PASS', message: 'LocalStorage is working' });
      } else {
        results.push({ test: 'LocalStorage', status: '❌ FAIL', message: 'LocalStorage not working properly' });
      }
    } catch (error) {
      results.push({ test: 'LocalStorage', status: '❌ FAIL', message: error.message });
    }

    // Test 3: Check console logging
    try {
      logger.log('Test log message');
      logger.info('Test info message');
      logger.warn('Test warning message');
      logger.error('Test error message');
      results.push({ test: 'Console Logging', status: '✅ PASS', message: 'Logger utility is working' });
    } catch (error) {
      results.push({ test: 'Console Logging', status: '❌ FAIL', message: error.message });
    }

    // Test 4: Check Tailwind CSS
    try {
      const testElement = document.createElement('div');
      testElement.className = 'bg-blue-500 text-white p-4 rounded';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const hasTailwind = computedStyle.backgroundColor !== '' && computedStyle.color !== '';
      
      document.body.removeChild(testElement);
      
      if (hasTailwind) {
        results.push({ test: 'Tailwind CSS', status: '✅ PASS', message: 'Tailwind CSS is working' });
      } else {
        results.push({ test: 'Tailwind CSS', status: '❌ FAIL', message: 'Tailwind CSS not working properly' });
      }
    } catch (error) {
      results.push({ test: 'Tailwind CSS', status: '❌ FAIL', message: error.message });
    }

    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Frontend Test Page</h1>
          
          <div className="mb-6">
            <button
              onClick={runTests}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Run Tests
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <span className="text-lg">{result.status}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{result.test}</h3>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Run Tests" to verify frontend functionality</li>
              <li>• Check browser console for detailed logs</li>
              <li>• All tests should pass for a working frontend</li>
              <li>• If tests fail, check the error messages for guidance</li>
            </ul>
          </div>

          <div className="mt-8">
            <GPSTest />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
