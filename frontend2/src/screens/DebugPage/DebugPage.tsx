import React, { useState } from 'react';

export default function DebugButtons() {
  const [dataSource, setDataSource] = useState('twitter');

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Button Debug Test</h1>
      
      {/* Test 1: Simple buttons with basic styling */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Test 1: Basic Buttons</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Twitter API
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded">
            Database
          </button>
        </div>
      </div>

      {/* Test 2: Toggle buttons with state */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Test 2: Toggle Buttons with State</h2>
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setDataSource('twitter')}
            className={`px-6 py-3 rounded-md text-sm font-bold transition-colors ${
              dataSource === 'twitter'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            🐦 Twitter API
          </button>
          <button
            onClick={() => setDataSource('database')}
            className={`px-6 py-3 rounded-md text-sm font-bold transition-colors ${
              dataSource === 'database'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'
            }`}
          >
            💾 Database
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Current selection: <strong>{dataSource}</strong>
        </p>
      </div>

      {/* Test 3: Your original structure */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Test 3: Original Structure</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Data Source Toggle */}
          <div className="flex bg-gray-200 rounded-lg p-1 border-2 border-gray-300">
            <button
              onClick={() => setDataSource('twitter')}
              className={`px-6 py-3 rounded-md text-sm font-bold transition-colors ${
                dataSource === 'twitter'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              🐦 Twitter API
            </button>
            <button
              onClick={() => setDataSource('database')}
              className={`px-6 py-3 rounded-md text-sm font-bold transition-colors ${
                dataSource === 'database'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'
              }`}
            >
              💾 Database
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter query"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm min-w-64"
          />
          
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Fetch Data
          </button>
        </div>
      </div>

      {/* Test 4: Debugging info */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Test 4: Debug Info</h2>
        <div className="bg-white p-4 rounded-lg border">
          <pre className="text-sm">
{`Current state: ${dataSource}
Button classes for Twitter: ${
  dataSource === 'twitter'
    ? 'bg-blue-500 text-white shadow-lg'
    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
}
Button classes for Database: ${
  dataSource === 'database'
    ? 'bg-green-500 text-white shadow-lg'
    : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'
}`}
          </pre>
        </div>
      </div>

      {/* Test 5: Inline styles as fallback */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Test 5: Inline Styles (Fallback)</h2>
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#e5e7eb', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => setDataSource('twitter')}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              backgroundColor: dataSource === 'twitter' ? '#3b82f6' : '#f3f4f6',
              color: dataSource === 'twitter' ? 'white' : '#374151',
              cursor: 'pointer'
            }}
          >
            🐦 Twitter API
          </button>
          <button
            onClick={() => setDataSource('database')}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              backgroundColor: dataSource === 'database' ? '#10b981' : '#f3f4f6',
              color: dataSource === 'database' ? 'white' : '#374151',
              cursor: 'pointer'
            }}
          >
            💾 Database
          </button>
        </div>
      </div>
    </div>
  );
}