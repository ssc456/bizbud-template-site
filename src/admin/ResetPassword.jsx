import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const token = searchParams.get('token');
  const siteId = searchParams.get('siteId');
  
  useEffect(() => {
    if (!token || !siteId) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token, siteId]);
  
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      setError('Password is required');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!token || !siteId) {
      setError('Invalid reset link');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth?action=verify-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siteId,
          token,
          newPassword
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed');
      }
      
      setSuccess('Password updated successfully! You can now log in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
      
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  }
  
  if (!token || !siteId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-red-600">Invalid Reset Link</h1>
          <p className="text-gray-600 text-center mb-6">
            This password reset link is invalid or has expired. Please request a new password reset.
          </p>
          <div className="text-center">
            <button
              onClick={() => navigate('/admin/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        <p className="text-gray-600 text-sm text-center mb-6">
          Enter your new password for <strong>{siteId}</strong>
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        
        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter new password"
                minLength="6"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Confirm new password"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 mb-4"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="text-gray-600 text-sm hover:underline"
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
