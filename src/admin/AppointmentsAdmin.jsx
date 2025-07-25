import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import AppointmentsManager from './editors/appointments/AppointmentsManager';
import 'react-toastify/dist/ReactToastify.css';

export default function AppointmentsAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [pendingCount, setPendingCount] = useState(0);
  
  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    
    checkAuth();
  }, []);
  
  // Fetch pending count
  useEffect(() => {
    if (isAuthenticated) {
      const fetchPendingCount = async () => {
        try {
          const csrfToken = sessionStorage.getItem('csrfToken');
          const siteId = window.location.hostname.split('.')[0];
          
          const response = await fetch(
            `/api/appointments?action=pendingCount&siteId=${siteId}`, 
            {
              credentials: 'include',
              headers: { 'X-CSRF-Token': csrfToken || '' }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            setPendingCount(data.count || 0);
          }
        } catch (error) {
          console.error('Error fetching pending count:', error);
        }
      };
      
      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);
  
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
  
  // Return responsive layout
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <ToastContainer position="top-right" />
      
      {/* Mobile Header with menu toggle */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-medium">Appointments</h1>
        <div>{/* Notification button */}</div>
      </div>
      
      {/* Main content area - THIS IS THE KEY PART TO FIX */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - fixed structure with proper height */}
        <div 
          className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-30 transform transition-transform lg:transform-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800">Appointments</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your calendar</p>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-2 px-3">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md ${
                  activeSection === 'dashboard' 
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </div>
              </button>
              
              <button
                onClick={() => setActiveSection('pending')}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md ${
                  activeSection === 'pending' 
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pending Requests
                </div>
                {pendingCount > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveSection('calendar')}
                className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
                  activeSection === 'calendar' 
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </button>
              
              <button
                onClick={() => setActiveSection('settings')}
                className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
                  activeSection === 'settings' 
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.href = '/admin/dashboard'}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Admin Home
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                View Site
              </button>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full mt-3 px-3 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Adjust main content area with proper padding */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AppointmentsManager 
            initialView={
              activeSection === 'dashboard' ? 'dashboard' : 
              activeSection === 'pending' ? 'pending' : 
              activeSection === 'calendar' ? 'calendar' : 
              activeSection === 'settings' ? 'settings' : 'list'
            }
          />
        </div>
      </div>
    </div>
  );
}