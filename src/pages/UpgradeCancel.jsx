import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function UpgradeCancel() {
  return (
    <Layout paddingTop>
      <div className="py-16 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
              <svg className="h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
            <p className="text-gray-600 mb-6">
              Your payment was cancelled. No charges were made to your account.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Return to home
              </Link>
              <Link to="/upgrade" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Try again
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}