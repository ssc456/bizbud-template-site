import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function CompanyInfoForm({ onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    registrationNumber: '',
    taxId: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    bankName: '',
    accountNumber: '',
    sortCode: '',
    iban: '',
  });

  useEffect(() => {
    async function fetchCompanyInfo() {
      try {
        const siteId = window.location.hostname.split('.')[0];
        const response = await fetch(`/api/invoicing?action=getCompanyInfo&siteId=${siteId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.companyInfo) {
            setCompanyInfo(data.companyInfo);
          }
        }
      } catch (error) {
        console.error('Error fetching company info:', error);
        toast.error('Failed to load company information');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCompanyInfo();
  }, []);

  const handleSave = async () => {
    // Validate required fields
    if (!companyInfo.name || !companyInfo.address) {
      toast.error('Company name and address are required');
      return;
    }
    
    setSaving(true);
    try {
      const siteId = window.location.hostname.split('.')[0];
      const response = await fetch('/api/invoicing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveCompanyInfo',
          siteId,
          companyInfo
        })
      });
      
      if (response.ok) {
        toast.success('Company information saved');
        onSaved();
      } else {
        toast.error('Failed to save company information');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save company information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Company Information</h2>
        <p className="text-gray-600 mb-6">This information will appear on your invoices.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Details */}
          <div className="space-y-6">
            <h3 className="font-medium text-gray-900">Business Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name*</label>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
              <input
                type="text"
                value={companyInfo.registrationNumber || ''}
                onChange={(e) => setCompanyInfo({...companyInfo, registrationNumber: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VAT/Tax ID</label>
              <input
                type="text"
                value={companyInfo.taxId || ''}
                onChange={(e) => setCompanyInfo({...companyInfo, taxId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="font-medium text-gray-900">Contact Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={companyInfo.city || ''}
                  onChange={(e) => setCompanyInfo({...companyInfo, city: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={companyInfo.postalCode || ''}
                  onChange={(e) => setCompanyInfo({...companyInfo, postalCode: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={companyInfo.country || ''}
                onChange={(e) => setCompanyInfo({...companyInfo, country: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={companyInfo.phone || ''}
                  onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={companyInfo.email || ''}
                  onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Details */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Payment Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={companyInfo.bankName || ''}
                onChange={(e) => setCompanyInfo({...companyInfo, bankName: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                value={companyInfo.accountNumber || ''}
                onChange={(e) => setCompanyInfo({...companyInfo, accountNumber: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Code</label>
              <input
                type="text"
                value={companyInfo.sortCode || ''}
                onChange={(e) => setCompanyInfo({...companyInfo, sortCode: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
              <input
                type="text"
                value={companyInfo.iban || ''}
                onChange={(e) => setCompanyInfo({...companyInfo, iban: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end rounded-b-lg">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}