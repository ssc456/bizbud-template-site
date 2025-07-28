import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractSiteId } from '../utils/siteId';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [siteId, setSiteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [emailStep, setEmailStep] = useState(1); // 1: get site info, 2: confirm email
  const [maskedEmail, setMaskedEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    setSiteId(extractSiteId());
  }, []);
  
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteId,
          password
        }),
        credentials: 'include' // Important for cookies
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store CSRF token in sessionStorage (cleared when browser is closed)
      if (data.csrfToken) {
        sessionStorage.setItem('csrfToken', data.csrfToken);
      }
      
      // Redirect to dashboard
      navigate('/admin/dashboard');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleGetSiteInfo(e) {
    e.preventDefault();
    
    if (!siteId.trim()) {
      setError('Site ID is required');
      return;
    }
    
    setResetLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/auth?action=get-admin-email&siteId=${encodeURIComponent(siteId)}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get site information');
      }
      
      setMaskedEmail(data.maskedEmail);
      setEmailStep(2);
      
    } catch (err) {
      console.error('Get site info error:', err);
      setError(err.message || 'Failed to get site information');
    } finally {
      setResetLoading(false);
    }
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    
    if (!confirmEmail.trim()) {
      setError('Email address is required');
      return;
    }
    
    setResetLoading(true);
    setError('');
    setResetMessage('');
    
    try {
      const response = await fetch('/api/auth?action=reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          siteId,
          email: confirmEmail 
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed');
      }
      
      setResetMessage('Password reset link sent to your email address. Please check your inbox.');
      setShowResetForm(false);
      setEmailStep(1);
      setMaskedEmail('');
      setConfirmEmail('');
      
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Password reset failed');
    } finally {
      setResetLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {resetMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {resetMessage}
          </div>
        )}
        
        {!showResetForm ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Site ID</label>
              <input
                type="text"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                disabled={!!siteId}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-4"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowResetForm(true)}
                className="text-blue-600 text-sm hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
            
            {emailStep === 1 ? (
              <div>
                <p className="text-gray-600 text-sm mb-4">
                  Enter your Site ID to begin the password reset process.
                </p>
                
                <form onSubmit={handleGetSiteInfo}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Site ID</label>
                    <input
                      type="text"
                      value={siteId}
                      onChange={(e) => setSiteId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                      placeholder="Enter your site ID"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-4"
                  >
                    {resetLoading ? 'Checking...' : 'Continue'}
                  </button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetForm(false);
                        setError('');
                        setResetMessage('');
                        setEmailStep(1);
                      }}
                      className="text-gray-600 text-sm hover:underline"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 text-sm mb-2">
                  Site ID: <strong>{siteId}</strong>
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  We found the admin email: <strong>{maskedEmail}</strong>
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Please enter the full email address to confirm and receive your password reset link.
                </p>
                
                <form onSubmit={handlePasswordReset}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                      placeholder="Enter your full email address"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 mb-4"
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailStep(1);
                        setMaskedEmail('');
                        setConfirmEmail('');
                        setError('');
                      }}
                      className="text-gray-600 text-sm hover:underline mr-4"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetForm(false);
                        setError('');
                        setResetMessage('');
                        setEmailStep(1);
                        setMaskedEmail('');
                        setConfirmEmail('');
                      }}
                      className="text-gray-600 text-sm hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}