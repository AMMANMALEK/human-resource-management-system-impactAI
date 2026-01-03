import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function DebugOverlay() {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isOpen, setIsOpen] = React.useState(true);

  if (!import.meta.env.DEV) {
    return null;
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-full text-xs opacity-50 hover:opacity-100"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg shadow-lg text-xs font-mono max-w-sm pointer-events-auto">
      <div className="flex justify-between items-center mb-2">
        <strong className="text-green-400">Debug Info</strong>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white ml-4">✕</button>
      </div>
      <div className="space-y-1">
        <div><span className="text-gray-400">Path:</span> {location.pathname}</div>
        <div><span className="text-gray-400">Auth:</span> {isAuthenticated ? 'Yes' : 'No'}</div>
        <div><span className="text-gray-400">Loading:</span> {isLoading ? 'Yes' : 'No'}</div>
        <div><span className="text-gray-400">User:</span> {user ? `${user.name} (${user.role})` : 'None'}</div>
        <div><span className="text-gray-400">Viewport:</span> {window.innerWidth}x{window.innerHeight}</div>
      </div>
    </div>
  );
}
