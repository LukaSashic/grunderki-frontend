// src/App.tsx
// Main application component

import React from 'react';
import AssessmentFlow from './components/AssessmentFlow';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Gründer<span className="text-blue-600">AI</span>
              </h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                Beta
              </span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900">Über uns</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Kontakt</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-10">
        <AssessmentFlow />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2025 GründerAI by PrincipAI. Wissenschaftlich fundierte Gründungszuschuss-Optimierung.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">Datenschutz</a>
            <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">Impressum</a>
            <a href="#" className="text-gray-400 hover:text-gray-500 text-sm">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
