import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  useEffect(() => {
    fetchSubscription();
  }, []);
  
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const siteId = window.location.hostname.split('.')[0];
      const response = await fetch(`/api/subscription?siteId=${siteId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? Your site will revert to the free tier.')) {
      return;
    }
    
    try {
      setCancelLoading(true);
      const siteId = window.location.hostname.split('.')[0];
      const response = await fetch('/api/subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siteId }),
      });
      
      if (response.ok) {
        toast.success('Subscription successfully canceled');
        fetchSubscription(); // Refresh data
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : !subscription ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>You don't have an active subscription.</p>
          <a href="/upgrade" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Upgrade Now
          </a>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {subscription.status}
            </span>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Plan</h3>
              <p className="text-lg">{subscription.plan}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Current Period</h3>
              <p className="text-lg">
                {new Date(subscription.currentPeriodStart).toLocaleDateString()} to {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
            
            {subscription.cancelAtPeriodEnd ? (
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-yellow-800">
                  Your subscription will be canceled at the end of the current billing period.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  You'll lose access to premium features on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                </p>
              </div>
            ) : (
              <div className="pt-4">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  Your subscription will continue until the end of the current billing period.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}