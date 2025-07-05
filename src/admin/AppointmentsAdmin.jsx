import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import AppointmentsManager from './editors/AppointmentsManager';
import 'react-toastify/dist/ReactToastify.css';

export default function AppointmentsAdmin() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        });
        
        if (response.ok) {
          setAuthorized(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/admin';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Loading appointment admin...</p>
        </div>
      </div>
    );
  }
  
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">Please log in to access the appointments dashboard.</p>
          <Link
            to="/admin"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <ToastContainer position="top-right" />
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Appointments Admin</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="space-y-1 px-2">
            <Link
              to="/admin/dashboard"
              className="flex items-center px-4 py-2 text-sm rounded-md text-gray-300 hover:bg-gray-700"
            >
              Back to Site Admin
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700"
          >
            View Site
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700 mt-2"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Appointments Manager</h2>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AppointmentsManager />
        </div>
      </div>
    </div>
  );
}