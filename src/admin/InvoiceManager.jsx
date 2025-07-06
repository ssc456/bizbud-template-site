import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InvoiceNavigation from './components/invoice/InvoiceNavigation';
import CompanyInfoForm from './components/invoice/CompanyInfoForm';
import InvoiceCreator from './components/invoice/InvoiceCreator';
import InvoiceList from './components/invoice/InvoiceList';
import InvoicePreview from './components/invoice/InvoicePreview';

export default function InvoiceManager() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('invoices'); // Changed from 'company-info'
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Return to the main dashboard
  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <button 
                onClick={handleBackToDashboard}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Invoice Management</h1>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!previewMode ? (
            <>
              <InvoiceNavigation 
                activeSection={activeSection} 
                setActiveSection={setActiveSection} 
              />
              
              <div className="mt-6">
                {activeSection === 'company-info' && (
                  <CompanyInfoForm 
                    onSaved={() => setActiveSection('create-invoice')}
                  />
                )}
                
                {activeSection === 'create-invoice' && (
                  <InvoiceCreator 
                    setCurrentInvoice={setCurrentInvoice}
                    onPreview={() => setPreviewMode(true)}
                  />
                )}
                
                {activeSection === 'invoices' && (
                  <InvoiceList 
                    onSelectInvoice={(invoice) => {
                      setCurrentInvoice(invoice);
                      setPreviewMode(true);
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <InvoicePreview 
              invoice={currentInvoice}
              onBack={() => setPreviewMode(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}