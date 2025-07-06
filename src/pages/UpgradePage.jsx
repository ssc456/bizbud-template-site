import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Layout from '../components/Layout';

// Clean and simple Stripe initialization
const stripePromise = loadStripe('pk_live_51RheRSBHbEWeyFXQSFpPLcvq0nELwXcFmo7nMjBIM7jZBVvRGre1rRJ67qF8Z4LcUO1HCCAD4XrFkADEXvHBZT8v00ypntn2GV');

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [siteInfo, setSiteInfo] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const siteId = window.location.hostname.split('.')[0];
        const response = await fetch(`/api/client-data?siteId=${siteId}`);
        if (response.ok) {
          const data = await response.json();
          setSiteInfo({
            siteId,
            businessName: data.siteTitle || siteId,
          });
        }
      } catch (error) {
        console.error('Error fetching site info:', error);
        setError('Failed to load site information');
      }
    };
    
    fetchSiteInfo();
  }, []);

  const handlePayment = async (paymentType) => {
    setLoading(true);
    try {
      if (!stripePromise) {
        throw new Error("Stripe has not been properly initialized");
      }
      
      const siteId = window.location.hostname.split('.')[0];
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId,
          paymentType, // 'one_time' or 'subscription'
        }),
      });
      
      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({
        sessionId,
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout paddingTop>
      <div className="py-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800">Upgrade to Premium</h1>
            <p className="mt-2 text-gray-600">
              Remove the banner and unlock all premium features for your website.
            </p>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500">
              {error}
            </div>
          )}
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800">Monthly Plan</h2>
              <div className="my-4">
                <span className="text-4xl font-bold">£25</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  No banner or overlays
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Access to all premium features
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Cancel anytime
                </li>
              </ul>
              <button
                onClick={() => handlePayment('subscription')}
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Pay Monthly'}
              </button>
            </div>
            
            <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800">Annual Plan</h2>
              <div className="my-4">
                <span className="text-4xl font-bold">£250</span>
                <span className="text-gray-600">/year</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  No banner or overlays
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Access to all premium features
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <strong>Save £50 </strong> compared to monthly
                </li>
              </ul>
              <button
                onClick={() => handlePayment('one_time')}
                disabled={loading}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Pay Annually'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}