import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function UpgradeSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  
  useEffect(() => {
    // You could verify the payment status here if needed
    // For now, we'll just rely on the presence of the session_id
    if (searchParams.get('session_id')) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [searchParams]);
  
  return (
    <Layout>
      <div className="py-16 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {status === 'checking' && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p>Verifying payment...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for upgrading to Premium! Your website has been upgraded and the banner will be removed.
              </p>
              <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Return to your website
              </Link>
            </div>
          )}
          
          {status === 'error' && (
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                We couldn't verify your payment. Please contact support if you believe this is an error.
              </p>
              <Link to="/upgrade" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Try again
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Also create a similar UpgradeCancel.jsx page for the cancel URL